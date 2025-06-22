import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { transactions, categories } from "@/lib/db/schema"
import { eq, and, gte, lte, desc, sql } from "drizzle-orm"
import { format, subMonths, startOfMonth, endOfMonth } from "date-fns"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const months = parseInt(searchParams.get("months") || "12")
    const categoryId = searchParams.get("categoryId")

    const now = new Date()
    const startDate = subMonths(now, months - 1)
    const startDateStr = format(startDate, "yyyy-MM-dd")

    // Build query conditions
    const conditions = [
      gte(transactions.date, startDateStr),
      eq(transactions.type, "expense")
    ]

    // Add category filter if specified
    if (categoryId) {
      conditions.push(eq(transactions.categoryId, categoryId))
    }

    // Get all expense transactions for the period with category names
    const expenseTransactions = await db
      .select({
        id: transactions.id,
        type: transactions.type,
        amount: transactions.amount,
        description: transactions.description,
        categoryId: transactions.categoryId,
        categoryName: categories.name,
        categoryColor: categories.color,
        categoryIcon: categories.icon,
        date: transactions.date,
      })
      .from(transactions)
      .leftJoin(categories, eq(transactions.categoryId, categories.id))
      .where(and(...conditions))
      .orderBy(desc(transactions.date))

    // Calculate category totals
    const categoryTotals = new Map<string, {
      name: string
      color: string | null
      icon: string | null
      amount: number
      count: number
      averageAmount: number
      monthlyBreakdown: Map<string, number>
    }>()

    expenseTransactions.forEach(transaction => {
      const categoryName = transaction.categoryName || "Uncategorized"
      const amount = Number(transaction.amount)
      const monthKey = format(new Date(transaction.date), "yyyy-MM")

      const current = categoryTotals.get(categoryName) || {
        name: categoryName,
        color: transaction.categoryColor,
        icon: transaction.categoryIcon,
        amount: 0,
        count: 0,
        averageAmount: 0,
        monthlyBreakdown: new Map<string, number>(),
      }

      current.amount += amount
      current.count += 1
      
      // Add to monthly breakdown
      const monthlyAmount = current.monthlyBreakdown.get(monthKey) || 0
      current.monthlyBreakdown.set(monthKey, monthlyAmount + amount)
      
      categoryTotals.set(categoryName, current)
    })

    // Calculate averages and convert to array
    const categoryData = Array.from(categoryTotals.entries()).map(([name, data]) => ({
      name: data.name,
      color: data.color || "#6b7280",
      icon: data.icon,
      amount: data.amount,
      count: data.count,
      averageAmount: data.count > 0 ? data.amount / data.count : 0,
      monthlyBreakdown: Array.from(data.monthlyBreakdown.entries()).map(([month, amount]) => ({
        month,
        amount,
      })),
    }))

    // Sort by total amount
    categoryData.sort((a, b) => b.amount - a.amount)

    // Calculate overall totals
    const totalExpenses = categoryData.reduce((sum, cat) => sum + cat.amount, 0)
    const totalTransactions = categoryData.reduce((sum, cat) => sum + cat.count, 0)

    // Generate monthly breakdown for all categories
    const monthlyData = new Map<string, {
      total: number
      categories: Map<string, number>
    }>()

    // Initialize all months
    for (let i = months - 1; i >= 0; i--) {
      const date = subMonths(now, i)
      const monthKey = format(date, "yyyy-MM")
      monthlyData.set(monthKey, {
        total: 0,
        categories: new Map<string, number>(),
      })
    }

    // Populate monthly data
    categoryData.forEach(category => {
      category.monthlyBreakdown.forEach(monthData => {
        const monthEntry = monthlyData.get(monthData.month)
        if (monthEntry) {
          monthEntry.total += monthData.amount
          monthEntry.categories.set(category.name, monthData.amount)
        }
      })
    })

    const monthlyBreakdown = Array.from(monthlyData.entries()).map(([month, data]) => ({
      month,
      total: data.total,
      categories: Array.from(data.categories.entries()).map(([name, amount]) => ({
        name,
        amount,
      })),
    }))

    // Calculate trends
    const trends = categoryData.map(category => {
      const monthlyAmounts = category.monthlyBreakdown.map(m => m.amount)
      if (monthlyAmounts.length < 2) {
        return {
          name: category.name,
          trend: "stable",
          changePercent: 0,
        }
      }

      const firstHalf = monthlyAmounts.slice(0, Math.floor(monthlyAmounts.length / 2))
      const secondHalf = monthlyAmounts.slice(Math.floor(monthlyAmounts.length / 2))
      
      const firstHalfAvg = firstHalf.reduce((sum, val) => sum + val, 0) / firstHalf.length
      const secondHalfAvg = secondHalf.reduce((sum, val) => sum + val, 0) / secondHalf.length
      
      const changePercent = firstHalfAvg > 0 ? ((secondHalfAvg - firstHalfAvg) / firstHalfAvg) * 100 : 0
      
      return {
        name: category.name,
        trend: changePercent > 5 ? "increasing" : changePercent < -5 ? "decreasing" : "stable",
        changePercent,
      }
    })

    // Top spending days
    const dailySpending = new Map<string, number>()
    expenseTransactions.forEach(transaction => {
      const dayKey = transaction.date
      const current = dailySpending.get(dayKey) || 0
      dailySpending.set(dayKey, current + Number(transaction.amount))
    })

    const topSpendingDays = Array.from(dailySpending.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([date, amount]) => ({
        date,
        amount,
        dayName: format(new Date(date), "EEEE"),
      }))

    return NextResponse.json({
      success: true,
      data: {
        period: `${months} months`,
        categoryBreakdown: categoryData,
        monthlyBreakdown,
        trends,
        topSpendingDays,
        summary: {
          totalExpenses,
          totalTransactions,
          averageTransactionAmount: totalTransactions > 0 ? totalExpenses / totalTransactions : 0,
          categoryCount: categoryData.length,
          topCategory: categoryData[0]?.name || "None",
          topCategoryAmount: categoryData[0]?.amount || 0,
        },
      },
    })
  } catch (error) {
    console.error("Categories Report API Error:", error)
    return NextResponse.json(
      { success: false, error: "Failed to generate categories report" },
      { status: 500 }
    )
  }
} 
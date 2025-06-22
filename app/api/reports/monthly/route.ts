import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"
import { transactions, categories } from "@/lib/db/schema"
import { eq, and, gte, lte, desc, sql } from "drizzle-orm"
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  parseISO,
} from "date-fns"

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: "Authentication required" },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const year = searchParams.get("year") || new Date().getFullYear().toString()
    const month =
      searchParams.get("month") || (new Date().getMonth() + 1).toString()

    const startDate = startOfMonth(
      new Date(parseInt(year), parseInt(month) - 1, 1)
    )
    const endDate = endOfMonth(new Date(parseInt(year), parseInt(month) - 1, 1))

    // Get all transactions for the month with category names
    const monthTransactions = await db
      .select({
        id: transactions.id,
        type: transactions.type,
        amount: transactions.amount,
        description: transactions.description,
        categoryId: transactions.categoryId,
        categoryName: categories.name,
        date: transactions.date,
        createdAt: transactions.createdAt,
        updatedAt: transactions.updatedAt,
      })
      .from(transactions)
      .leftJoin(categories, eq(transactions.categoryId, categories.id))
      .where(
        and(
          eq(transactions.userId, session.user.id),
          gte(transactions.date, format(startDate, "yyyy-MM-dd")),
          lte(transactions.date, format(endDate, "yyyy-MM-dd"))
        )
      )
      .orderBy(desc(transactions.date))

    // Calculate totals by type
    const totals = {
      income: 0,
      expenses: 0,
      savings: 0,
      investments: 0,
    }

    monthTransactions.forEach(transaction => {
      const amount = Number(transaction.amount)
      switch (transaction.type) {
        case "income":
          totals.income += amount
          break
        case "expense":
          totals.expenses += amount
          break
        case "savings":
          totals.savings += amount
          break
        case "investment":
          totals.investments += amount
          break
      }
    })

    // Calculate net flow
    const netFlow =
      totals.income - totals.expenses + totals.savings + totals.investments

    // Get category breakdown for expenses
    const expenseTransactions = monthTransactions.filter(
      t => t.type === "expense"
    )
    const categoryBreakdown = new Map<
      string,
      { amount: number; count: number }
    >()

    expenseTransactions.forEach(transaction => {
      const category = transaction.categoryName || "Uncategorized"
      const amount = Number(transaction.amount)
      const current = categoryBreakdown.get(category) || { amount: 0, count: 0 }
      current.amount += amount
      current.count += 1
      categoryBreakdown.set(category, current)
    })

    // Convert to array and sort by amount
    const categoryData = Array.from(categoryBreakdown.entries())
      .map(([category, data]) => ({
        category,
        amount: data.amount,
        count: data.count,
        percentage:
          totals.expenses > 0 ? (data.amount / totals.expenses) * 100 : 0,
      }))
      .sort((a, b) => b.amount - a.amount)

    // Daily breakdown
    const dailyData = new Map<
      string,
      {
        income: number
        expenses: number
        savings: number
        investments: number
        netFlow: number
        transactionCount: number
      }
    >()

    // Initialize all days in the month
    const daysInMonth = eachDayOfInterval({ start: startDate, end: endDate })
    daysInMonth.forEach(day => {
      const dayKey = format(day, "yyyy-MM-dd")
      dailyData.set(dayKey, {
        income: 0,
        expenses: 0,
        savings: 0,
        investments: 0,
        netFlow: 0,
        transactionCount: 0,
      })
    })

    // Aggregate by day
    monthTransactions.forEach(transaction => {
      const dayKey = transaction.date
      const current = dailyData.get(dayKey)
      if (current) {
        const amount = Number(transaction.amount)
        switch (transaction.type) {
          case "income":
            current.income += amount
            break
          case "expense":
            current.expenses += amount
            break
          case "savings":
            current.savings += amount
            break
          case "investment":
            current.investments += amount
            break
        }
        current.netFlow =
          current.income -
          current.expenses +
          current.savings +
          current.investments
        current.transactionCount += 1
      }
    })

    const dailyBreakdown = Array.from(dailyData.entries()).map(
      ([day, data]) => ({
        day,
        ...data,
      })
    )

    // Weekly breakdown
    const weeklyData = new Map<
      string,
      {
        income: number
        expenses: number
        savings: number
        investments: number
        netFlow: number
        transactionCount: number
      }
    >()

    // Group by week
    monthTransactions.forEach(transaction => {
      const date = new Date(transaction.date)
      const weekStart = new Date(date)
      weekStart.setDate(date.getDate() - date.getDay()) // Start of week (Sunday)
      const weekKey = format(weekStart, "yyyy-MM-dd")

      const current = weeklyData.get(weekKey) || {
        income: 0,
        expenses: 0,
        savings: 0,
        investments: 0,
        netFlow: 0,
        transactionCount: 0,
      }

      const amount = Number(transaction.amount)
      switch (transaction.type) {
        case "income":
          current.income += amount
          break
        case "expense":
          current.expenses += amount
          break
        case "savings":
          current.savings += amount
          break
        case "investment":
          current.investments += amount
          break
      }
      current.netFlow =
        current.income -
        current.expenses +
        current.savings +
        current.investments
      current.transactionCount += 1
      weeklyData.set(weekKey, current)
    })

    const weeklyBreakdown = Array.from(weeklyData.entries()).map(
      ([week, data]) => ({
        week,
        ...data,
      })
    )

    // Calculate key metrics
    const daysInMonthCount = daysInMonth.length
    const averageDailyIncome = totals.income / daysInMonthCount
    const averageDailyExpenses = totals.expenses / daysInMonthCount
    const averageDailySavings = totals.savings / daysInMonthCount
    const savingsRate =
      totals.income > 0
        ? ((totals.savings + totals.investments) / totals.income) * 100
        : 0
    const expenseRatio =
      totals.income > 0 ? (totals.expenses / totals.income) * 100 : 0

    // Top transactions
    const topTransactions = monthTransactions
      .sort((a, b) => Number(b.amount) - Number(a.amount))
      .slice(0, 10)
      .map(transaction => ({
        id: transaction.id,
        amount: Number(transaction.amount),
        type: transaction.type,
        category: transaction.categoryName || "Uncategorized",
        description: transaction.description,
        date: transaction.date,
      }))

    return NextResponse.json({
      success: true,
      data: {
        year: parseInt(year),
        month: parseInt(month),
        monthName: format(startDate, "MMMM yyyy"),
        totals,
        netFlow,
        categoryBreakdown: categoryData,
        dailyBreakdown,
        weeklyBreakdown,
        topTransactions,
        metrics: {
          averageDailyIncome,
          averageDailyExpenses,
          averageDailySavings,
          savingsRate,
          expenseRatio,
          totalTransactions: monthTransactions.length,
          daysWithTransactions: monthTransactions.reduce((acc, t) => {
            if (!acc.includes(t.date)) acc.push(t.date)
            return acc
          }, [] as string[]).length,
        },
      },
    })
  } catch (error) {
    console.error("Monthly Report API Error:", error)
    return NextResponse.json(
      { success: false, error: "Failed to generate monthly report" },
      { status: 500 }
    )
  }
}

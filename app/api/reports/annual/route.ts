import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"
import { transactions, categories } from "@/lib/db/schema"
import { eq, and, gte, lte, desc, sql, sum } from "drizzle-orm"
import { format, startOfYear, endOfYear, parseISO } from "date-fns"

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

    const startDate = startOfYear(new Date(parseInt(year), 0, 1))
    const endDate = endOfYear(new Date(parseInt(year), 0, 1))

    // Get all transactions for the year with category names
    const yearTransactions = await db
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

    yearTransactions.forEach(transaction => {
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

    // Calculate net worth change
    const netWorthChange =
      totals.income - totals.expenses + totals.savings + totals.investments

    // Get category breakdown for expenses
    const expenseTransactions = yearTransactions.filter(
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
        percentage: (data.amount / totals.expenses) * 100,
      }))
      .sort((a, b) => b.amount - a.amount)

    // Monthly breakdown
    const monthlyData = new Map<
      string,
      {
        income: number
        expenses: number
        savings: number
        investments: number
        netFlow: number
      }
    >()

    // Initialize all months
    for (let month = 0; month < 12; month++) {
      const monthKey = format(new Date(parseInt(year), month, 1), "yyyy-MM")
      monthlyData.set(monthKey, {
        income: 0,
        expenses: 0,
        savings: 0,
        investments: 0,
        netFlow: 0,
      })
    }

    // Aggregate by month
    yearTransactions.forEach(transaction => {
      const monthKey = format(new Date(transaction.date), "yyyy-MM")
      const current = monthlyData.get(monthKey)
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
      }
    })

    const monthlyBreakdown = Array.from(monthlyData.entries()).map(
      ([month, data]) => ({
        month,
        ...data,
      })
    )

    // Calculate key metrics
    const averageMonthlyIncome = totals.income / 12
    const averageMonthlyExpenses = totals.expenses / 12
    const savingsRate =
      totals.income > 0
        ? ((totals.savings + totals.investments) / totals.income) * 100
        : 0
    const expenseRatio =
      totals.income > 0 ? (totals.expenses / totals.income) * 100 : 0

    return NextResponse.json({
      success: true,
      data: {
        year: parseInt(year),
        totals,
        netWorthChange,
        categoryBreakdown: categoryData,
        monthlyBreakdown,
        metrics: {
          averageMonthlyIncome,
          averageMonthlyExpenses,
          savingsRate,
          expenseRatio,
          totalTransactions: yearTransactions.length,
        },
      },
    })
  } catch (error) {
    console.error("Annual Report API Error:", error)
    return NextResponse.json(
      { success: false, error: "Failed to generate annual report" },
      { status: 500 }
    )
  }
}

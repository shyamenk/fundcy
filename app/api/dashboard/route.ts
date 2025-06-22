import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { transactions } from "@/lib/db/schema"
import { eq, and, gte, lte, desc } from "drizzle-orm"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const period = searchParams.get("period") || "month" // month, quarter, year, custom
    const customDate = searchParams.get("customDate") // YYYY-MM format

    // Calculate date range based on period
    const now = new Date()
    let startDate: Date
    let endDate: Date = now

    switch (period) {
      case "week":
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
        break
      case "quarter":
        startDate = new Date(
          now.getFullYear(),
          Math.floor(now.getMonth() / 3) * 3,
          1
        )
        break
      case "year":
        startDate = new Date(now.getFullYear(), 0, 1)
        break
      case "custom":
        if (customDate) {
          const [year, month] = customDate.split("-").map(Number)
          startDate = new Date(year, month - 1, 1) // Month is 0-indexed
          endDate = new Date(year, month, 0) // Last day of the month
        } else {
          startDate = new Date(now.getFullYear(), now.getMonth(), 1)
        }
        break
      default: // month
        startDate = new Date(now.getFullYear(), now.getMonth(), 1)
    }

    // Get transactions for the period
    const periodTransactions = await db
      .select()
      .from(transactions)
      .where(
        and(
          gte(transactions.date, startDate.toISOString().split("T")[0]),
          lte(transactions.date, endDate.toISOString().split("T")[0])
        )
      )
      .orderBy(desc(transactions.date))

    // Calculate totals
    const income = periodTransactions
      .filter(t => t.type === "income")
      .reduce((sum, t) => sum + Number(t.amount), 0)

    const expenses = periodTransactions
      .filter(t => t.type === "expense")
      .reduce((sum, t) => sum + Number(t.amount), 0)

    const savings = periodTransactions
      .filter(t => t.type === "savings")
      .reduce((sum, t) => sum + Number(t.amount), 0)

    const investments = periodTransactions
      .filter(t => t.type === "investment")
      .reduce((sum, t) => sum + Number(t.amount), 0)

    // Calculate net worth (all time)
    const allTransactions = await db
      .select()
      .from(transactions)
      .orderBy(desc(transactions.date))

    const totalIncome = allTransactions
      .filter(t => t.type === "income")
      .reduce((sum, t) => sum + Number(t.amount), 0)

    const totalExpenses = allTransactions
      .filter(t => t.type === "expense")
      .reduce((sum, t) => sum + Number(t.amount), 0)

    const totalSavings = allTransactions
      .filter(t => t.type === "savings")
      .reduce((sum, t) => sum + Number(t.amount), 0)

    const totalInvestments = allTransactions
      .filter(t => t.type === "investment")
      .reduce((sum, t) => sum + Number(t.amount), 0)

    const netWorth =
      totalIncome - totalExpenses + totalSavings + totalInvestments

    // Get recent transactions (last 5)
    const recentTransactions = await db
      .select()
      .from(transactions)
      .orderBy(desc(transactions.date))
      .limit(5)

    // Calculate remaining monthly budget (assuming monthly income - expenses)
    const monthlyIncome = periodTransactions
      .filter(t => t.type === "income")
      .reduce((sum, t) => sum + Number(t.amount), 0)

    const monthlyExpenses = periodTransactions
      .filter(t => t.type === "expense")
      .reduce((sum, t) => sum + Number(t.amount), 0)

    const remainingBudget = monthlyIncome - monthlyExpenses

    return NextResponse.json({
      success: true,
      data: {
        overview: {
          netWorth,
          periodIncome: income,
          periodExpenses: expenses,
          periodSavings: savings,
          periodInvestments: investments,
          remainingBudget,
          period,
          customDate,
        },
        recentTransactions,
        periodTransactions,
      },
    })
  } catch (error) {
    console.error("Dashboard API Error:", error)
    return NextResponse.json(
      { success: false, error: "Failed to fetch dashboard data" },
      { status: 500 }
    )
  }
}

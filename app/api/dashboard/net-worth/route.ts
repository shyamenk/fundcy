import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"
import { transactions } from "@/lib/db/schema"
import { eq, desc } from "drizzle-orm"

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
    const months = parseInt(searchParams.get("months") || "12") // Default to 12 months of history

    // Get all transactions for the user
    const allTransactions = await db
      .select()
      .from(transactions)
      .where(eq(transactions.userId, session.user.id))
      .orderBy(desc(transactions.date))

    // Calculate current net worth
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

    const currentNetWorth =
      totalIncome - totalExpenses + totalSavings + totalInvestments

    // Calculate historical net worth (monthly breakdown)
    const historicalData = []
    const now = new Date()

    for (let i = months - 1; i >= 0; i--) {
      const endDate = new Date(now.getFullYear(), now.getMonth() - i, 0) // End of month
      const startDate = new Date(now.getFullYear(), now.getMonth() - i - 1, 1) // Start of month

      const monthTransactions = allTransactions.filter(t => {
        const transactionDate = new Date(t.date)
        return transactionDate >= startDate && transactionDate <= endDate
      })

      const monthIncome = monthTransactions
        .filter(t => t.type === "income")
        .reduce((sum, t) => sum + Number(t.amount), 0)

      const monthExpenses = monthTransactions
        .filter(t => t.type === "expense")
        .reduce((sum, t) => sum + Number(t.amount), 0)

      const monthSavings = monthTransactions
        .filter(t => t.type === "savings")
        .reduce((sum, t) => sum + Number(t.amount), 0)

      const monthInvestments = monthTransactions
        .filter(t => t.type === "investment")
        .reduce((sum, t) => sum + Number(t.amount), 0)

      const monthNetWorth =
        monthIncome - monthExpenses + monthSavings + monthInvestments

      historicalData.push({
        month: endDate.toISOString().slice(0, 7), // YYYY-MM format
        netWorth: monthNetWorth,
        income: monthIncome,
        expenses: monthExpenses,
        savings: monthSavings,
        investments: monthInvestments,
      })
    }

    // Calculate net worth breakdown by type
    const breakdown = {
      income: totalIncome,
      expenses: totalExpenses,
      savings: totalSavings,
      investments: totalInvestments,
      netWorth: currentNetWorth,
    }

    // Calculate growth rate (comparing current month to previous month)
    const currentMonth = historicalData[historicalData.length - 1]
    const previousMonth = historicalData[historicalData.length - 2]

    let growthRate = 0
    if (previousMonth && previousMonth.netWorth !== 0) {
      growthRate =
        ((currentMonth.netWorth - previousMonth.netWorth) /
          Math.abs(previousMonth.netWorth)) *
        100
    }

    return NextResponse.json({
      success: true,
      data: {
        currentNetWorth,
        breakdown,
        historicalData,
        growthRate,
        monthsAnalyzed: months,
      },
    })
  } catch (error) {
    console.error("Net Worth API Error:", error)
    return NextResponse.json(
      { success: false, error: "Failed to fetch net worth data" },
      { status: 500 }
    )
  }
}

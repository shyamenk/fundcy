import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"
import { transactions } from "@/lib/db/schema"
import { eq, and, gte, desc } from "drizzle-orm"
import { format, subMonths } from "date-fns"

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
    const months = parseInt(searchParams.get("months") || "12")

    const now = new Date()
    const startDate = subMonths(now, months - 1)
    const startDateStr = startDate.toISOString().split("T")[0]

    // Get all transactions from the start date
    const allTransactions = await db
      .select()
      .from(transactions)
      .where(
        and(
          eq(transactions.userId, session.user.id),
          gte(transactions.date, startDateStr)
        )
      )
      .orderBy(desc(transactions.date))

    // Group transactions by month
    const monthlyData = new Map<
      string,
      {
        income: number
        expenses: number
        savings: number
        investments: number
      }
    >()

    // Initialize all months with zero values
    for (let i = months - 1; i >= 0; i--) {
      const date = subMonths(now, i)
      const monthKey = format(date, "yyyy-MM")
      monthlyData.set(monthKey, {
        income: 0,
        expenses: 0,
        savings: 0,
        investments: 0,
      })
    }

    // Aggregate transaction data by month
    allTransactions.forEach(transaction => {
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
      }
    })

    // Convert to array format expected by the chart
    const chartData = Array.from(monthlyData.entries()).map(
      ([month, data]) => ({
        month,
        income: data.income,
        expenses: data.expenses,
        savings: data.savings,
        investments: data.investments,
        netFlow: data.income - data.expenses + data.savings + data.investments,
      })
    )

    return NextResponse.json({
      success: true,
      data: chartData,
    })
  } catch (error) {
    console.error("Chart API Error:", error)
    return NextResponse.json(
      { success: false, error: "Failed to fetch chart data" },
      { status: 500 }
    )
  }
}

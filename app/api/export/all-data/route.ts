import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"
import {
  users,
  transactions,
  categories,
  goals,
  goalContributions,
  investmentHoldings,
  sipInvestments,
  debitCardExpenses,
} from "@/lib/db/schema"
import { eq } from "drizzle-orm"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Fetch all user data
    const [
      userProfile,
      userCategories,
      userTransactions,
      userGoals,
      userGoalContributions,
      userInvestmentHoldings,
      userSipInvestments,
      userDebitExpenses,
    ] = await Promise.all([
      db.select().from(users).where(eq(users.id, session.user.id)),
      db
        .select()
        .from(categories)
        .where(eq(categories.userId, session.user.id)),
      db
        .select()
        .from(transactions)
        .where(eq(transactions.userId, session.user.id)),
      db.select().from(goals).where(eq(goals.userId, session.user.id)),
      db
        .select()
        .from(goalContributions)
        .where(eq(goalContributions.userId, session.user.id)),
      db
        .select()
        .from(investmentHoldings)
        .where(eq(investmentHoldings.userId, session.user.id)),
      db
        .select()
        .from(sipInvestments)
        .where(eq(sipInvestments.userId, session.user.id)),
      db
        .select()
        .from(debitCardExpenses)
        .where(eq(debitCardExpenses.userId, session.user.id)),
    ])

    // Prepare export data
    const exportData = {
      exportDate: new Date().toISOString(),
      user: userProfile[0]
        ? {
            name: userProfile[0].name,
            email: userProfile[0].email,
            image: userProfile[0].image,
            createdAt: userProfile[0].createdAt,
          }
        : null,
      categories: userCategories,
      transactions: userTransactions,
      goals: userGoals,
      goalContributions: userGoalContributions,
      investmentHoldings: userInvestmentHoldings,
      sipInvestments: userSipInvestments,
      debitCardExpenses: userDebitExpenses,
      statistics: {
        totalTransactions: userTransactions.length,
        totalGoals: userGoals.length,
        totalInvestments: userInvestmentHoldings.length,
        totalSips: userSipInvestments.length,
        totalExpenses: userDebitExpenses.length,
      },
    }

    // Return as downloadable JSON
    return new Response(JSON.stringify(exportData, null, 2), {
      headers: {
        "Content-Type": "application/json",
        "Content-Disposition": `attachment; filename="fundcy-export-${new Date().toISOString().split("T")[0]}.json"`,
      },
    })
  } catch (error) {
    console.error("Export error:", error)
    return NextResponse.json(
      { error: "Failed to export data" },
      { status: 500 }
    )
  }
}

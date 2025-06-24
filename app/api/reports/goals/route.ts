import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"
import { goals, goalContributions, transactions } from "@/lib/db/schema"
import { eq, and, gte, lte, desc, sql } from "drizzle-orm"
import { format, subMonths, startOfYear, endOfYear } from "date-fns"

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
    const status = searchParams.get("status") // active, completed, paused

    const startDate = startOfYear(new Date(parseInt(year), 0, 1))
    const endDate = endOfYear(new Date(parseInt(year), 0, 1))

    // Build query conditions
    const conditions = [eq(goals.userId, session.user.id)]
    if (status) {
      conditions.push(eq(goals.status, status as any))
    }

    // Get all goals with optional status filter
    const allGoals = await db
      .select({
        id: goals.id,
        title: goals.title,
        description: goals.description,
        targetAmount: goals.targetAmount,
        currentAmount: goals.currentAmount,
        targetDate: goals.targetDate,
        category: goals.category,
        status: goals.status,
        createdAt: goals.createdAt,
        updatedAt: goals.updatedAt,
        completedAt: goals.completedAt,
      })
      .from(goals)
      .where(and(...conditions))
      .orderBy(desc(goals.createdAt))

    // Get goal contributions for the year
    const yearContributions = await db
      .select({
        id: goalContributions.id,
        goalId: goalContributions.goalId,
        amount: goalContributions.amount,
        createdAt: goalContributions.createdAt,
        transactionId: goalContributions.transactionId,
        transactionType: transactions.type,
        transactionDate: transactions.date,
      })
      .from(goalContributions)
      .leftJoin(
        transactions,
        eq(goalContributions.transactionId, transactions.id)
      )
      .where(
        and(
          eq(goalContributions.userId, session.user.id),
          gte(goalContributions.createdAt, startDate),
          lte(goalContributions.createdAt, endDate)
        )
      )
      .orderBy(desc(goalContributions.createdAt))

    // Calculate goal statistics
    const goalStats = {
      total: allGoals.length,
      active: allGoals.filter(g => g.status === "active").length,
      completed: allGoals.filter(g => g.status === "completed").length,
      paused: allGoals.filter(g => g.status === "paused").length,
      totalTargetAmount: 0,
      totalCurrentAmount: 0,
      totalContributions: 0,
    }

    allGoals.forEach(goal => {
      goalStats.totalTargetAmount += Number(goal.targetAmount)
      goalStats.totalCurrentAmount += Number(goal.currentAmount)
    })

    yearContributions.forEach(contribution => {
      goalStats.totalContributions += Number(contribution.amount)
    })

    // Calculate overall progress
    const overallProgress =
      goalStats.totalTargetAmount > 0
        ? (goalStats.totalCurrentAmount / goalStats.totalTargetAmount) * 100
        : 0

    // Goal progress breakdown
    const goalProgress = allGoals.map(goal => {
      const targetAmount = Number(goal.targetAmount)
      const currentAmount = Number(goal.currentAmount)
      const progress =
        targetAmount > 0 ? (currentAmount / targetAmount) * 100 : 0
      const remaining = targetAmount - currentAmount
      const isOverdue =
        goal.targetDate &&
        new Date(goal.targetDate) < new Date() &&
        goal.status === "active"

      return {
        id: goal.id,
        title: goal.title,
        category: goal.category,
        status: goal.status,
        targetAmount,
        currentAmount,
        progress,
        remaining,
        isOverdue,
        targetDate: goal.targetDate,
        createdAt: goal.createdAt,
        completedAt: goal.completedAt,
      }
    })

    // Monthly contribution breakdown
    const monthlyContributions = new Map<
      string,
      {
        total: number
        count: number
        goals: Map<string, number>
      }
    >()

    // Initialize all months
    for (let month = 0; month < 12; month++) {
      const monthKey = format(new Date(parseInt(year), month, 1), "yyyy-MM")
      monthlyContributions.set(monthKey, {
        total: 0,
        count: 0,
        goals: new Map<string, number>(),
      })
    }

    // Aggregate contributions by month
    yearContributions.forEach(contribution => {
      if (!contribution.createdAt) return // Skip if createdAt is null

      const monthKey = format(new Date(contribution.createdAt), "yyyy-MM")
      const current = monthlyContributions.get(monthKey)
      if (current) {
        const amount = Number(contribution.amount)
        current.total += amount
        current.count += 1

        // Add to goal breakdown
        const goalTitle =
          allGoals.find(g => g.id === contribution.goalId)?.title ||
          "Unknown Goal"
        const goalAmount = current.goals.get(goalTitle) || 0
        current.goals.set(goalTitle, goalAmount + amount)
      }
    })

    const monthlyBreakdown = Array.from(monthlyContributions.entries()).map(
      ([month, data]) => ({
        month,
        total: data.total,
        count: data.count,
        goals: Array.from(data.goals.entries()).map(([title, amount]) => ({
          title,
          amount,
        })),
      })
    )

    // Category breakdown
    const categoryBreakdown = new Map<
      string,
      {
        count: number
        totalTarget: number
        totalCurrent: number
        totalContributions: number
      }
    >()

    allGoals.forEach(goal => {
      const category = goal.category || "Uncategorized"
      const current = categoryBreakdown.get(category) || {
        count: 0,
        totalTarget: 0,
        totalCurrent: 0,
        totalContributions: 0,
      }

      current.count += 1
      current.totalTarget += Number(goal.targetAmount)
      current.totalCurrent += Number(goal.currentAmount)
      categoryBreakdown.set(category, current)
    })

    // Add contributions to categories
    yearContributions.forEach(contribution => {
      const goal = allGoals.find(g => g.id === contribution.goalId)
      if (goal) {
        const category = goal.category || "Uncategorized"
        const current = categoryBreakdown.get(category)
        if (current) {
          current.totalContributions += Number(contribution.amount)
        }
      }
    })

    const categoryData = Array.from(categoryBreakdown.entries()).map(
      ([category, data]) => ({
        category,
        count: data.count,
        totalTarget: data.totalTarget,
        totalCurrent: data.totalCurrent,
        totalContributions: data.totalContributions,
        progress:
          data.totalTarget > 0
            ? (data.totalCurrent / data.totalTarget) * 100
            : 0,
      })
    )

    // Top performing goals
    const topGoals = goalProgress
      .sort((a, b) => b.progress - a.progress)
      .slice(0, 5)

    // Recently completed goals
    const recentlyCompleted = allGoals
      .filter(g => g.status === "completed" && g.completedAt)
      .sort((a, b) => {
        const aDate = new Date(a.completedAt as Date).getTime()
        const bDate = new Date(b.completedAt as Date).getTime()
        return bDate - aDate
      })
      .slice(0, 5)
      .map(goal => ({
        id: goal.id,
        title: goal.title,
        category: goal.category,
        targetAmount: Number(goal.targetAmount),
        completedAt: goal.completedAt,
        daysToComplete:
          goal.createdAt && goal.completedAt
            ? Math.ceil(
                (new Date(goal.completedAt).getTime() -
                  new Date(goal.createdAt).getTime()) /
                  (1000 * 60 * 60 * 24)
              )
            : 0,
      }))

    // Overdue goals
    const overdueGoals = goalProgress
      .filter(g => g.isOverdue)
      .sort(
        (a, b) =>
          new Date(a.targetDate!).getTime() - new Date(b.targetDate!).getTime()
      )

    // Calculate insights
    const completionRate =
      goalStats.total > 0 ? (goalStats.completed / goalStats.total) * 100 : 0
    const averageGoalValue =
      goalStats.total > 0 ? goalStats.totalTargetAmount / goalStats.total : 0
    const averageMonthlyContribution =
      monthlyBreakdown.length > 0
        ? goalStats.totalContributions / monthlyBreakdown.length
        : 0
    // Find most active category
    const mostActiveCategory =
      categoryData.length > 0
        ? categoryData.reduce((a, b) => (a.count > b.count ? a : b)).category
        : "-"
    // Find fastest progressing goal
    const fastestProgressingGoal =
      goalProgress.length > 0
        ? goalProgress.reduce((a, b) => (a.progress > b.progress ? a : b)).title
        : "-"
    // Find most overdue goal
    const mostOverdueGoal =
      overdueGoals.length > 0 ? overdueGoals[0].title : "-"
    // Add averageProgress to each category
    const categoryBreakdownWithAvg = categoryData.map(cat => ({
      ...cat,
      averageProgress:
        cat.count > 0 ? (cat.totalCurrent / cat.totalTarget) * 100 : 0,
    }))

    return NextResponse.json({
      success: true,
      data: {
        goalStats,
        overallProgress,
        goalProgress,
        monthlyContributions: monthlyBreakdown,
        categoryBreakdown: categoryBreakdownWithAvg,
        insights: {
          mostActiveCategory,
          fastestProgressingGoal,
          mostOverdueGoal,
          averageGoalValue,
          completionRate,
          averageMonthlyContribution,
        },
      },
    })
  } catch (error) {
    console.error("Goals Report API Error:", error)
    return NextResponse.json(
      { success: false, error: "Failed to generate goals report" },
      { status: 500 }
    )
  }
}

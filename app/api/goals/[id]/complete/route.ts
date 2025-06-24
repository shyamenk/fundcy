import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { goals } from "@/lib/db/schema"
import { eq, and } from "drizzle-orm"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params

    // Mark the goal as completed
    const updatedGoal = await db
      .update(goals)
      .set({
        status: "completed",
        completedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(and(eq(goals.id, id), eq(goals.userId, session.user.id)))
      .returning()

    if (updatedGoal.length === 0) {
      return NextResponse.json({ error: "Goal not found" }, { status: 404 })
    }

    return NextResponse.json(updatedGoal[0])
  } catch (error) {
    console.error("Error completing goal:", error)
    return NextResponse.json(
      { error: "Failed to complete goal" },
      { status: 500 }
    )
  }
}

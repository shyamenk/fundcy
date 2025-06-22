import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { goals } from "@/lib/db/schema"
import { goalCompleteSchema } from "@/lib/validations/goal"
import { eq } from "drizzle-orm"

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const validatedData = goalCompleteSchema.parse({ ...body, id: params.id })

    const completedGoal = await db
      .update(goals)
      .set({
        status: "completed",
        completedAt: validatedData.completedAt
          ? new Date(validatedData.completedAt)
          : new Date(),
        updatedAt: new Date(),
      })
      .where(eq(goals.id, params.id))
      .returning()

    if (completedGoal.length === 0) {
      return NextResponse.json(
        { success: false, error: "Goal not found" },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: completedGoal[0],
    })
  } catch (error) {
    console.error("Complete Goal API Error:", error)
    if (error instanceof Error && error.name === "ZodError") {
      return NextResponse.json(
        { success: false, error: "Validation error", details: error.message },
        { status: 400 }
      )
    }
    return NextResponse.json(
      { success: false, error: "Failed to complete goal" },
      { status: 500 }
    )
  }
}

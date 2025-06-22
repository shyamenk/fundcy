import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { goals } from "@/lib/db/schema"
import { goalUpdateSchema, goalCompleteSchema } from "@/lib/validations/goal"
import { eq } from "drizzle-orm"

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const goal = await db
      .select()
      .from(goals)
      .where(eq(goals.id, params.id))
      .limit(1)

    if (goal.length === 0) {
      return NextResponse.json(
        { success: false, error: "Goal not found" },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: goal[0],
    })
  } catch (error) {
    console.error("Get Goal API Error:", error)
    return NextResponse.json(
      { success: false, error: "Failed to fetch goal" },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const validatedData = goalUpdateSchema.parse({ ...body, id: params.id })

    const updatedGoal = await db
      .update(goals)
      .set({
        title: validatedData.title,
        description: validatedData.description,
        targetAmount: validatedData.targetAmount,
        currentAmount: validatedData.currentAmount,
        targetDate: validatedData.targetDate,
        category: validatedData.category,
        status: validatedData.status,
        updatedAt: new Date(),
      })
      .where(eq(goals.id, params.id))
      .returning()

    if (updatedGoal.length === 0) {
      return NextResponse.json(
        { success: false, error: "Goal not found" },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: updatedGoal[0],
    })
  } catch (error) {
    console.error("Update Goal API Error:", error)
    if (error instanceof Error && error.name === "ZodError") {
      return NextResponse.json(
        { success: false, error: "Validation error", details: error.message },
        { status: 400 }
      )
    }
    return NextResponse.json(
      { success: false, error: "Failed to update goal" },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const deletedGoal = await db
      .delete(goals)
      .where(eq(goals.id, params.id))
      .returning()

    if (deletedGoal.length === 0) {
      return NextResponse.json(
        { success: false, error: "Goal not found" },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: deletedGoal[0],
    })
  } catch (error) {
    console.error("Delete Goal API Error:", error)
    return NextResponse.json(
      { success: false, error: "Failed to delete goal" },
      { status: 500 }
    )
  }
}

import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"
import { goals } from "@/lib/db/schema"
import { goalUpdateSchema } from "@/lib/validations/goal"
import { eq, and } from "drizzle-orm"

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: "Authentication required" },
        { status: 401 }
      )
    }

    const { id } = await params
    const goal = await db
      .select()
      .from(goals)
      .where(and(eq(goals.id, id), eq(goals.userId, session.user.id)))
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
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: "Authentication required" },
        { status: 401 }
      )
    }

    const { id } = await params
    const body = await request.json()
    const validatedData = goalUpdateSchema.parse({ ...body, id: id })

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
      .where(and(eq(goals.id, id), eq(goals.userId, session.user.id)))
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
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: "Authentication required" },
        { status: 401 }
      )
    }

    const { id } = await params
    const deletedGoal = await db
      .delete(goals)
      .where(and(eq(goals.id, id), eq(goals.userId, session.user.id)))
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

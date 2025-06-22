import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { goals } from "@/lib/db/schema"
import { goalSchema } from "@/lib/validations/goal"
import { desc, eq, and } from "drizzle-orm"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get("status")
    const category = searchParams.get("category")

    let whereConditions = []

    if (status) {
      whereConditions.push(eq(goals.status, status as any))
    }

    if (category) {
      whereConditions.push(eq(goals.category, category))
    }

    const allGoals = await db
      .select()
      .from(goals)
      .where(whereConditions.length > 0 ? and(...whereConditions) : undefined)
      .orderBy(desc(goals.createdAt))

    return NextResponse.json({
      success: true,
      data: allGoals,
    })
  } catch (error) {
    console.error("Goals API Error:", error)
    return NextResponse.json(
      { success: false, error: "Failed to fetch goals" },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validatedData = goalSchema.parse(body)

    const newGoal = await db
      .insert(goals)
      .values({
        title: validatedData.title,
        description: validatedData.description || "",
        targetAmount: validatedData.targetAmount,
        currentAmount: validatedData.currentAmount || "0",
        targetDate: validatedData.targetDate || null,
        category: validatedData.category || null,
        status: validatedData.status || "active",
      })
      .returning()

    return NextResponse.json(
      {
        success: true,
        data: newGoal[0],
      },
      { status: 201 }
    )
  } catch (error) {
    console.error("Create Goal API Error:", error)
    if (error instanceof Error && error.name === "ZodError") {
      return NextResponse.json(
        { success: false, error: "Validation error", details: error.message },
        { status: 400 }
      )
    }
    return NextResponse.json(
      { success: false, error: "Failed to create goal" },
      { status: 500 }
    )
  }
}

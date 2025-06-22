import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { debitCardExpenses } from "@/lib/db/schema"
import { eq, and } from "drizzle-orm"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const {
      amount,
      description,
      merchant,
      category,
      cardType,
      transactionDate,
    } = body

    const updatedExpense = await db
      .update(debitCardExpenses)
      .set({
        amount: amount.toString(),
        description,
        merchant,
        category,
        cardType,
        transactionDate,
        updatedAt: new Date(),
      })
      .where(
        and(
          eq(debitCardExpenses.id, params.id),
          eq(debitCardExpenses.userId, session.user.id)
        )
      )
      .returning()

    if (updatedExpense.length === 0) {
      return NextResponse.json({ error: "Expense not found" }, { status: 404 })
    }

    return NextResponse.json(updatedExpense[0])
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to update expense" },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const deletedExpense = await db
      .delete(debitCardExpenses)
      .where(
        and(
          eq(debitCardExpenses.id, params.id),
          eq(debitCardExpenses.userId, session.user.id)
        )
      )
      .returning()

    if (deletedExpense.length === 0) {
      return NextResponse.json({ error: "Expense not found" }, { status: 404 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to delete expense" },
      { status: 500 }
    )
  }
}

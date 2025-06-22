import { NextRequest, NextResponse } from "next/server"
import { eq } from "drizzle-orm"
import { db } from "@/lib/db"
import { transactions } from "@/lib/db/schema"
import { updateTransactionSchema } from "@/lib/validations/transaction"

// GET /api/transactions/[id] - Get a specific transaction
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const transaction = await db.query.transactions.findFirst({
      where: eq(transactions.id, id),
      with: {
        category: true,
      },
    })

    if (!transaction) {
      return NextResponse.json(
        { success: false, error: "Transaction not found" },
        { status: 404 }
      )
    }

    return NextResponse.json({ success: true, data: transaction })
  } catch (error) {
    console.error("Error fetching transaction:", error)
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    )
  }
}

// PUT /api/transactions/[id] - Update a specific transaction
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()

    const parsed = updateTransactionSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        {
          success: false,
          error: "Validation error",
          details: parsed.error.errors,
        },
        { status: 400 }
      )
    }

    const { type, amount, description, categoryId, date } = parsed.data

    const updateData = {
      ...(type && { type }),
      ...(amount !== undefined && { amount: amount.toString() }),
      ...(description && { description }),
      ...(categoryId && { categoryId }),
      ...(date && { date }),
      updatedAt: new Date(),
    }

    await db.update(transactions).set(updateData).where(eq(transactions.id, id))

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error updating transaction:", error)
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    )
  }
}

// DELETE /api/transactions/[id] - Delete a specific transaction
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const transaction = await db.query.transactions.findFirst({
      where: eq(transactions.id, id),
    })

    if (!transaction) {
      return NextResponse.json(
        { success: false, error: "Transaction not found" },
        { status: 404 }
      )
    }

    await db.delete(transactions).where(eq(transactions.id, id))

    return NextResponse.json({
      success: true,
      message: "Transaction deleted successfully",
    })
  } catch (error) {
    console.error("Error deleting transaction:", error)
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    )
  }
}

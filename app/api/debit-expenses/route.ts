import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { debitCardExpenses } from "@/lib/db/schema"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { eq } from "drizzle-orm"

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const expenses = await db
      .select()
      .from(debitCardExpenses)
      .where(eq(debitCardExpenses.userId, session.user.id))

    return NextResponse.json({ expenses })
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch debit card expenses" },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
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

    const newExpense = await db
      .insert(debitCardExpenses)
      .values({
        amount: amount.toString(),
        description,
        merchant,
        category,
        cardType,
        transactionDate,
        userId: session.user.id,
      })
      .returning()

    return NextResponse.json(newExpense[0])
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to create expense" },
      { status: 500 }
    )
  }
}

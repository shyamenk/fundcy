import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { getAllTransactions, createTransaction } from "@/lib/db/transactions"
import { transactionSchema } from "@/lib/validations/transaction"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "UNAUTHORIZED",
            message: "Authentication required",
          },
        },
        { status: 401 }
      )
    }

    const transactions = await getAllTransactions(session.user.id)
    return NextResponse.json({ success: true, data: transactions })
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "INTERNAL_ERROR",
          message: "Failed to fetch transactions",
          details: error,
        },
      },
      { status: 500 }
    )
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    console.log("[API] Session:", session)

    if (!session?.user?.id) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "UNAUTHORIZED",
            message: "Authentication required",
          },
        },
        { status: 401 }
      )
    }

    const body = await req.json()
    console.log("[API] Incoming body:", body)
    const parsed = transactionSchema.safeParse(body)
    if (!parsed.success) {
      console.log("[API] Validation error:", parsed.error.errors)
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: "Invalid transaction data",
            details: parsed.error.errors,
          },
        },
        { status: 400 }
      )
    }
    console.log("[API] Parsed data:", parsed.data)
    const [transaction] = await createTransaction(parsed.data, session.user.id)
    console.log("[API] Created transaction:", transaction)
    return NextResponse.json({ success: true, data: transaction })
  } catch (error) {
    console.error("[API] Internal error:", error)
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "INTERNAL_ERROR",
          message: "Failed to create transaction",
          details: error,
        },
      },
      { status: 500 }
    )
  }
}

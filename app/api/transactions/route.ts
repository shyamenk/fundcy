import { NextRequest, NextResponse } from "next/server"
import { getAllTransactions, createTransaction } from "@/lib/db/transactions"
import { transactionSchema } from "@/lib/validations/transaction"

export async function GET() {
  try {
    const transactions = await getAllTransactions()
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
    const body = await req.json()
    const parsed = transactionSchema.safeParse(body)
    if (!parsed.success) {
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
    const [transaction] = await createTransaction(parsed.data)
    return NextResponse.json({ success: true, data: transaction })
  } catch (error) {
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

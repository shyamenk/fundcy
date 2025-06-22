import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { investmentHoldings, sipInvestments } from "@/lib/db/schema"
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
    const { operationType, ...data } = body

    if (operationType === "holding") {
      const updatedHolding = await db
        .update(investmentHoldings)
        .set({
          ...data,
          updatedAt: new Date(),
        })
        .where(
          and(
            eq(investmentHoldings.id, params.id),
            eq(investmentHoldings.userId, session.user.id)
          )
        )
        .returning()

      if (updatedHolding.length === 0) {
        return NextResponse.json(
          { error: "Holding not found" },
          { status: 404 }
        )
      }

      return NextResponse.json(updatedHolding[0])
    } else if (operationType === "sip") {
      const updatedSip = await db
        .update(sipInvestments)
        .set({
          ...data,
          updatedAt: new Date(),
        })
        .where(
          and(
            eq(sipInvestments.id, params.id),
            eq(sipInvestments.userId, session.user.id)
          )
        )
        .returning()

      if (updatedSip.length === 0) {
        return NextResponse.json({ error: "SIP not found" }, { status: 404 })
      }

      return NextResponse.json(updatedSip[0])
    }

    return NextResponse.json({ error: "Invalid type" }, { status: 400 })
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to update investment" },
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

    const { searchParams } = new URL(request.url)
    const operationType = searchParams.get("operationType")

    if (operationType === "holding") {
      const deletedHolding = await db
        .delete(investmentHoldings)
        .where(
          and(
            eq(investmentHoldings.id, params.id),
            eq(investmentHoldings.userId, session.user.id)
          )
        )
        .returning()

      if (deletedHolding.length === 0) {
        return NextResponse.json(
          { error: "Holding not found" },
          { status: 404 }
        )
      }
    } else if (operationType === "sip") {
      const deletedSip = await db
        .delete(sipInvestments)
        .where(
          and(
            eq(sipInvestments.id, params.id),
            eq(sipInvestments.userId, session.user.id)
          )
        )
        .returning()

      if (deletedSip.length === 0) {
        return NextResponse.json({ error: "SIP not found" }, { status: 404 })
      }
    } else {
      return NextResponse.json({ error: "Invalid type" }, { status: 400 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to delete investment" },
      { status: 500 }
    )
  }
}

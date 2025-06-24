import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { investmentHoldings, sipInvestments } from "@/lib/db/schema"
import { eq, and } from "drizzle-orm"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params
    const body = await request.json()
    const { operationType, ...data } = body

    if (operationType === "holding") {
      // Validate required fields for holdings
      if (
        !data.name ||
        !data.units ||
        !data.currentPrice ||
        !data.avgPurchasePrice ||
        !data.totalInvested ||
        !data.firstPurchaseDate ||
        !data.lastPurchaseDate
      ) {
        return NextResponse.json(
          { error: "Missing required fields for holding" },
          { status: 400 }
        )
      }

      // Calculate values
      const units = parseFloat(data.units || "0")
      const currentPrice = parseFloat(data.currentPrice || "0")
      const avgPurchasePrice = parseFloat(data.avgPurchasePrice || "0")
      const totalInvested = parseFloat(data.totalInvested || "0")
      const currentValue = units * currentPrice
      const returns = currentValue - totalInvested
      const returnsPercentage =
        totalInvested > 0 ? (returns / totalInvested) * 100 : 0

      const updatedHolding = await db
        .update(investmentHoldings)
        .set({
          name: data.name,
          type: data.type || "other",
          units: units.toString(),
          currentPrice: currentPrice.toString(),
          avgPurchasePrice: avgPurchasePrice.toString(),
          currentValue: currentValue.toString(),
          totalInvested: totalInvested.toString(),
          firstPurchaseDate: data.firstPurchaseDate,
          lastPurchaseDate: data.lastPurchaseDate,
          holdingPeriod: data.holdingPeriod || null,
          returns: returns.toString(),
          returnsPercentage: returnsPercentage.toString(),
          fundHouse: data.fundHouse || null,
          category: data.category || null,
          riskLevel: data.riskLevel || null,
          updatedAt: new Date(),
        })
        .where(
          and(
            eq(investmentHoldings.id, id),
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
      // Validate required fields for SIPs
      if (
        !data.holdingId ||
        !data.amount ||
        !data.frequency ||
        !data.startDate
      ) {
        return NextResponse.json(
          { error: "Missing required fields for SIP" },
          { status: 400 }
        )
      }

      const updatedSip = await db
        .update(sipInvestments)
        .set({
          holdingId: data.holdingId,
          amount: parseFloat(data.amount || "0").toString(),
          frequency: data.frequency,
          startDate: data.startDate,
          nextSipDate: data.nextSipDate || null,
          isActive: data.isActive !== undefined ? data.isActive : true,
          fundName: data.fundName || null,
          updatedAt: new Date(),
        })
        .where(
          and(
            eq(sipInvestments.id, id),
            eq(sipInvestments.userId, session.user.id)
          )
        )
        .returning()

      if (updatedSip.length === 0) {
        return NextResponse.json({ error: "SIP not found" }, { status: 404 })
      }

      return NextResponse.json(updatedSip[0])
    }

    return NextResponse.json(
      { error: "Invalid operation type" },
      { status: 400 }
    )
  } catch (error) {
    console.error("Error updating investment:", error)
    return NextResponse.json(
      {
        error: "Failed to update investment",
        details: error instanceof Error ? error.message : "Unknown error",
      },
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
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params
    const { searchParams } = new URL(request.url)
    const operationType = searchParams.get("operationType")

    if (operationType === "holding") {
      const deletedHolding = await db
        .delete(investmentHoldings)
        .where(
          and(
            eq(investmentHoldings.id, id),
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

      return NextResponse.json({ message: "Holding deleted successfully" })
    } else if (operationType === "sip") {
      const deletedSip = await db
        .delete(sipInvestments)
        .where(
          and(
            eq(sipInvestments.id, id),
            eq(sipInvestments.userId, session.user.id)
          )
        )
        .returning()

      if (deletedSip.length === 0) {
        return NextResponse.json({ error: "SIP not found" }, { status: 404 })
      }

      return NextResponse.json({ message: "SIP deleted successfully" })
    }

    return NextResponse.json(
      { error: "Invalid operation type" },
      { status: 400 }
    )
  } catch (error) {
    console.error("Error deleting investment:", error)
    return NextResponse.json(
      {
        error: "Failed to delete investment",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    )
  }
}

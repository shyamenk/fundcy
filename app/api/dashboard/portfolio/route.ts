import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { investmentHoldings, sipInvestments } from "@/lib/db/schema"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { eq } from "drizzle-orm"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Fetch user's investment holdings
    const holdings = await db
      .select()
      .from(investmentHoldings)
      .where(eq(investmentHoldings.userId, session.user.id))

    // Fetch user's SIP investments
    const sips = await db
      .select()
      .from(sipInvestments)
      .where(eq(sipInvestments.userId, session.user.id))

    return NextResponse.json({ holdings, sips })
  } catch (error) {
    console.error("Portfolio fetch error:", error)
    return NextResponse.json(
      { error: "Failed to fetch portfolio data" },
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
      const returnsPercentage = totalInvested > 0 ? (returns / totalInvested) * 100 : 0

      // Validate reasonable values
      if (returnsPercentage > 10000) {
        return NextResponse.json(
          { 
            error: "Return percentage seems unusually high. Please verify your values.", 
            details: `Calculated return: ${returnsPercentage.toFixed(2)}%` 
          }, 
          { status: 400 }
        )
      }

      const newHolding = await db
        .insert(investmentHoldings)
        .values({
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
          userId: session.user.id,
        })
        .returning()

      return NextResponse.json(newHolding[0])
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

      // Validate that the holding exists
      const holding = await db
        .select()
        .from(investmentHoldings)
        .where(eq(investmentHoldings.id, data.holdingId))

      if (holding.length === 0) {
        return NextResponse.json(
          { error: "Selected holding not found" },
          { status: 400 }
        )
      }

      const newSip = await db
        .insert(sipInvestments)
        .values({
          holdingId: data.holdingId,
          amount: parseFloat(data.amount || "0").toString(),
          frequency: data.frequency,
          startDate: data.startDate,
          nextSipDate: data.nextSipDate || null,
          isActive: data.isActive !== undefined ? data.isActive : true,
          totalInvested: "0", // Will be calculated over time
          totalUnits: "0", // Will be calculated over time
          fundName: data.fundName || null,
          userId: session.user.id,
        })
        .returning()

      return NextResponse.json(newSip[0])
    }

    return NextResponse.json({ error: "Invalid type" }, { status: 400 })
  } catch (error) {
    console.error("Error creating investment:", error)
    return NextResponse.json(
      {
        error: "Failed to create investment",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    )
  }
}

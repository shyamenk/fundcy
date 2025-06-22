import "dotenv/config"
import { db } from "./index"
import { investmentHoldings, sipInvestments } from "./schema"
import { subMonths, format } from "date-fns"

const sampleHoldings = [
  {
    name: "HDFC Mid-Cap Opportunities Fund",
    symbol: "HDFCMIDCAP",
    type: "mutual_fund" as const,
    currentValue: "150000",
    totalInvested: "120000",
    units: "1000",
    avgPurchasePrice: "120",
    currentPrice: "150",
    returns: "30000",
    returnsPercentage: "25.00",
    fundHouse: "HDFC Mutual Fund",
    category: "Mid Cap",
    riskLevel: "Moderate",
  },
  {
    name: "Axis Small Cap Fund",
    symbol: "AXISSMLCAP",
    type: "small_cap" as const,
    currentValue: "80000",
    totalInvested: "60000",
    units: "800",
    avgPurchasePrice: "75",
    currentPrice: "100",
    returns: "20000",
    returnsPercentage: "33.33",
    fundHouse: "Axis Mutual Fund",
    category: "Small Cap",
    riskLevel: "High",
  },
  {
    name: "Nifty 50 Index Fund",
    symbol: "NIFTY50",
    type: "index_fund" as const,
    currentValue: "200000",
    totalInvested: "180000",
    units: "2000",
    avgPurchasePrice: "90",
    currentPrice: "100",
    returns: "20000",
    returnsPercentage: "11.11",
    fundHouse: "ICICI Prudential",
    category: "Large Cap",
    riskLevel: "Low",
  },
  {
    name: "Reliance Industries",
    symbol: "RELIANCE",
    type: "direct_stocks" as const,
    currentValue: "75000",
    totalInvested: "60000",
    units: "100",
    avgPurchasePrice: "600",
    currentPrice: "750",
    returns: "15000",
    returnsPercentage: "25.00",
    fundHouse: "Direct Stock",
    category: "Large Cap",
    riskLevel: "Moderate",
  },
  {
    name: "Tata Consultancy Services",
    symbol: "TCS",
    type: "direct_stocks" as const,
    currentValue: "120000",
    totalInvested: "100000",
    units: "200",
    avgPurchasePrice: "500",
    currentPrice: "600",
    returns: "20000",
    returnsPercentage: "20.00",
    fundHouse: "Direct Stock",
    category: "Large Cap",
    riskLevel: "Low",
  },
]

const sampleSIPs = [
  {
    amount: "5000",
    frequency: "monthly" as const,
    startDate: "2023-01-01",
    isActive: true,
    nextSipDate: "2024-01-01",
    totalInvested: "60000",
    totalUnits: "500",
  },
  {
    amount: "3000",
    frequency: "monthly" as const,
    startDate: "2023-03-01",
    isActive: true,
    nextSipDate: "2024-01-01",
    totalInvested: "30000",
    totalUnits: "400",
  },
  {
    amount: "10000",
    frequency: "monthly" as const,
    startDate: "2023-06-01",
    isActive: true,
    nextSipDate: "2024-01-01",
    totalInvested: "70000",
    totalUnits: "700",
  },
]

async function seedInvestments() {
  try {
    console.log("🌱 Seeding database with sample investments...")

    // Insert holdings
    const insertedHoldings = []
    for (const holding of sampleHoldings) {
      const [inserted] = await db
        .insert(investmentHoldings)
        .values(holding)
        .returning()
      insertedHoldings.push(inserted)
    }

    // Insert SIPs (linking to holdings)
    for (let i = 0; i < sampleSIPs.length; i++) {
      const sip = sampleSIPs[i]
      const holdingId = insertedHoldings[i]?.id

      if (holdingId) {
        await db
          .insert(sipInvestments)
          .values({
            ...sip,
            holdingId: holdingId,
          })
          .onConflictDoNothing()
      }
    }

    console.log("✅ Sample investments seeded successfully!")
  } catch (error) {
    console.error("❌ Error seeding investments:", error)
    process.exit(1)
  }
}

seedInvestments()

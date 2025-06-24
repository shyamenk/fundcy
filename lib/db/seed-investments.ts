import "dotenv/config"
import { db } from "./index"
import { investmentHoldings, sipInvestments, users } from "./schema"
import { eq } from "drizzle-orm"

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
    firstPurchaseDate: "2023-01-15",
    lastPurchaseDate: "2023-12-15",
    holdingPeriod: "11 months",
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
    firstPurchaseDate: "2023-02-01",
    lastPurchaseDate: "2023-11-01",
    holdingPeriod: "9 months",
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
    firstPurchaseDate: "2023-01-01",
    lastPurchaseDate: "2023-12-01",
    holdingPeriod: "11 months",
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
    firstPurchaseDate: "2023-03-15",
    lastPurchaseDate: "2023-10-15",
    holdingPeriod: "7 months",
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
    firstPurchaseDate: "2023-02-01",
    lastPurchaseDate: "2023-09-01",
    holdingPeriod: "7 months",
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

async function seedInvestments(userEmail?: string) {
  try {
    console.log("🌱 Seeding database with sample investments...")

    // Get user ID (either from parameter or first user in database)
    let userId: string
    if (userEmail) {
      const user = await db
        .select({ id: users.id })
        .from(users)
        .where(eq(users.email, userEmail))
        .then(res => res[0])
      
      if (!user) {
        console.error(`User with email ${userEmail} not found`)
        return
      }
      userId = user.id
    } else {
      // Get first user from database
      const firstUser = await db
        .select({ id: users.id })
        .from(users)
        .limit(1)
        .then(res => res[0])
      
      if (!firstUser) {
        console.error("No users found in database. Please create a user first.")
        return
      }
      userId = firstUser.id
    }

    // Insert holdings with userId
    const insertedHoldings = []
    for (const holding of sampleHoldings) {
      const [inserted] = await db
        .insert(investmentHoldings)
        .values({
          ...holding,
          userId,
        })
        .returning()
      insertedHoldings.push(inserted)
    }

    // Insert SIPs (linking to holdings)
    for (let i = 0; i < sampleSIPs.length && i < insertedHoldings.length; i++) {
      const sip = sampleSIPs[i]
      const holdingId = insertedHoldings[i]?.id

      if (holdingId) {
        await db
          .insert(sipInvestments)
          .values({
            ...sip,
            holdingId: holdingId,
            userId,
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

// Allow passing email as command line argument
const userEmail = process.argv[2]
seedInvestments(userEmail)

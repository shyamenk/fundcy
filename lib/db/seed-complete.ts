import "dotenv/config"
import { db } from "./index"
import { categories, users, transactions } from "./schema"
import { subMonths, format } from "date-fns"
import bcrypt from "bcryptjs"

type CategoryType = "income" | "expense" | "savings" | "investment"
type TransactionType = "income" | "expense" | "savings" | "investment"

const defaultCategories = [
  // Income Categories
  {
    name: "Salary/Wages",
    type: "income" as CategoryType,
    color: "#10b981",
    icon: "dollar-sign",
    isDefault: true,
  },
  {
    name: "Freelance",
    type: "income" as CategoryType,
    color: "#3b82f6",
    icon: "briefcase",
    isDefault: true,
  },
  {
    name: "Business Income",
    type: "income" as CategoryType,
    color: "#8b5cf6",
    icon: "building",
    isDefault: true,
  },
  {
    name: "Investment Returns",
    type: "income" as CategoryType,
    color: "#06b6d4",
    icon: "trending-up",
    isDefault: true,
  },
  {
    name: "Interest",
    type: "income" as CategoryType,
    color: "#84cc16",
    icon: "percent",
    isDefault: true,
  },
  {
    name: "Dividends",
    type: "income" as CategoryType,
    color: "#f59e0b",
    icon: "pie-chart",
    isDefault: true,
  },
  {
    name: "Gifts",
    type: "income" as CategoryType,
    color: "#ec4899",
    icon: "gift",
    isDefault: true,
  },
  {
    name: "Bonuses",
    type: "income" as CategoryType,
    color: "#ef4444",
    icon: "award",
    isDefault: true,
  },
  {
    name: "Other Income",
    type: "income" as CategoryType,
    color: "#6b7280",
    icon: "plus-circle",
    isDefault: true,
  },

  // Expense Categories
  {
    name: "Food & Dining",
    type: "expense" as CategoryType,
    color: "#ef4444",
    icon: "utensils",
    isDefault: true,
  },
  {
    name: "Transportation",
    type: "expense" as CategoryType,
    color: "#3b82f6",
    icon: "car",
    isDefault: true,
  },
  {
    name: "Housing",
    type: "expense" as CategoryType,
    color: "#8b5cf6",
    icon: "home",
    isDefault: true,
  },
  {
    name: "Utilities",
    type: "expense" as CategoryType,
    color: "#f59e0b",
    icon: "zap",
    isDefault: true,
  },
  {
    name: "Healthcare",
    type: "expense" as CategoryType,
    color: "#10b981",
    icon: "heart",
    isDefault: true,
  },
  {
    name: "Insurance",
    type: "expense" as CategoryType,
    color: "#06b6d4",
    icon: "shield",
    isDefault: true,
  },
  {
    name: "Entertainment",
    type: "expense" as CategoryType,
    color: "#ec4899",
    icon: "music",
    isDefault: true,
  },
  {
    name: "Shopping",
    type: "expense" as CategoryType,
    color: "#84cc16",
    icon: "shopping-bag",
    isDefault: true,
  },
  {
    name: "Education",
    type: "expense" as CategoryType,
    color: "#6366f1",
    icon: "book-open",
    isDefault: true,
  },
  {
    name: "Subscriptions",
    type: "expense" as CategoryType,
    color: "#f97316",
    icon: "repeat",
    isDefault: true,
  },
  {
    name: "Personal Care",
    type: "expense" as CategoryType,
    color: "#a855f7",
    icon: "scissors",
    isDefault: true,
  },
  {
    name: "Travel",
    type: "expense" as CategoryType,
    color: "#14b8a6",
    icon: "plane",
    isDefault: true,
  },
  {
    name: "Other Expenses",
    type: "expense" as CategoryType,
    color: "#6b7280",
    icon: "minus-circle",
    isDefault: true,
  },

  // Savings Categories
  {
    name: "Emergency Fund",
    type: "savings" as CategoryType,
    color: "#10b981",
    icon: "shield-check",
    isDefault: true,
  },
  {
    name: "Vacation Fund",
    type: "savings" as CategoryType,
    color: "#3b82f6",
    icon: "umbrella-beach",
    isDefault: true,
  },
  {
    name: "House Fund",
    type: "savings" as CategoryType,
    color: "#8b5cf6",
    icon: "home",
    isDefault: true,
  },
  {
    name: "Education Fund",
    type: "savings" as CategoryType,
    color: "#06b6d4",
    icon: "graduation-cap",
    isDefault: true,
  },
  {
    name: "General Savings",
    type: "savings" as CategoryType,
    color: "#84cc16",
    icon: "piggy-bank",
    isDefault: true,
  },

  // Investment Categories
  {
    name: "Stocks",
    type: "investment" as CategoryType,
    color: "#10b981",
    icon: "trending-up",
    isDefault: true,
  },
  {
    name: "Bonds",
    type: "investment" as CategoryType,
    color: "#3b82f6",
    icon: "chart-line",
    isDefault: true,
  },
  {
    name: "Mutual Funds",
    type: "investment" as CategoryType,
    color: "#8b5cf6",
    icon: "pie-chart",
    isDefault: true,
  },
  {
    name: "Cryptocurrency",
    type: "investment" as CategoryType,
    color: "#f59e0b",
    icon: "bitcoin",
    isDefault: true,
  },
  {
    name: "Real Estate",
    type: "investment" as CategoryType,
    color: "#06b6d4",
    icon: "building",
    isDefault: true,
  },
  {
    name: "Retirement",
    type: "investment" as CategoryType,
    color: "#84cc16",
    icon: "calendar",
    isDefault: true,
  },
]

const sampleTransactions = [
  // Income transactions (last 6 months)
  {
    title: "Monthly Salary",
    amount: "75000",
    type: "income" as TransactionType,
    category: "Salary/Wages",
    date: format(subMonths(new Date(), 5), "yyyy-MM-dd"),
    description: "Monthly salary payment",
  },
  {
    title: "Freelance Project",
    amount: "25000",
    type: "income" as TransactionType,
    category: "Freelance",
    date: format(subMonths(new Date(), 4), "yyyy-MM-dd"),
    description: "Web development project",
  },
  {
    title: "Monthly Salary",
    amount: "75000",
    type: "income" as TransactionType,
    category: "Salary/Wages",
    date: format(subMonths(new Date(), 4), "yyyy-MM-dd"),
    description: "Monthly salary payment",
  },
  {
    title: "Investment Returns",
    amount: "5000",
    type: "income" as TransactionType,
    category: "Investment Returns",
    date: format(subMonths(new Date(), 3), "yyyy-MM-dd"),
    description: "Quarterly dividend payment",
  },
  {
    title: "Monthly Salary",
    amount: "75000",
    type: "income" as TransactionType,
    category: "Salary/Wages",
    date: format(subMonths(new Date(), 3), "yyyy-MM-dd"),
    description: "Monthly salary payment",
  },
  {
    title: "Monthly Salary",
    amount: "75000",
    type: "income" as TransactionType,
    category: "Salary/Wages",
    date: format(subMonths(new Date(), 2), "yyyy-MM-dd"),
    description: "Monthly salary payment",
  },
  {
    title: "Monthly Salary",
    amount: "75000",
    type: "income" as TransactionType,
    category: "Salary/Wages",
    date: format(subMonths(new Date(), 1), "yyyy-MM-dd"),
    description: "Monthly salary payment",
  },
  {
    title: "Monthly Salary",
    amount: "75000",
    type: "income" as TransactionType,
    category: "Salary/Wages",
    date: format(new Date(), "yyyy-MM-dd"),
    description: "Monthly salary payment",
  },

  // Expense transactions
  {
    title: "Grocery Shopping",
    amount: "8000",
    type: "expense" as TransactionType,
    category: "Food & Dining",
    date: format(subMonths(new Date(), 5), "yyyy-MM-dd"),
    description: "Monthly groceries",
  },
  {
    title: "Rent Payment",
    amount: "25000",
    type: "expense" as TransactionType,
    category: "Housing",
    date: format(subMonths(new Date(), 5), "yyyy-MM-dd"),
    description: "Monthly rent",
  },
  {
    title: "Electricity Bill",
    amount: "3000",
    type: "expense" as TransactionType,
    category: "Utilities",
    date: format(subMonths(new Date(), 5), "yyyy-MM-dd"),
    description: "Monthly electricity bill",
  },
  {
    title: "Grocery Shopping",
    amount: "7500",
    type: "expense" as TransactionType,
    category: "Food & Dining",
    date: format(subMonths(new Date(), 4), "yyyy-MM-dd"),
    description: "Monthly groceries",
  },
  {
    title: "Rent Payment",
    amount: "25000",
    type: "expense" as TransactionType,
    category: "Housing",
    date: format(subMonths(new Date(), 4), "yyyy-MM-dd"),
    description: "Monthly rent",
  },
  {
    title: "Netflix Subscription",
    amount: "500",
    type: "expense" as TransactionType,
    category: "Subscriptions",
    date: format(subMonths(new Date(), 4), "yyyy-MM-dd"),
    description: "Monthly Netflix subscription",
  },
  {
    title: "Grocery Shopping",
    amount: "8200",
    type: "expense" as TransactionType,
    category: "Food & Dining",
    date: format(subMonths(new Date(), 3), "yyyy-MM-dd"),
    description: "Monthly groceries",
  },
  {
    title: "Rent Payment",
    amount: "25000",
    type: "expense" as TransactionType,
    category: "Housing",
    date: format(subMonths(new Date(), 3), "yyyy-MM-dd"),
    description: "Monthly rent",
  },
  {
    title: "Shopping",
    amount: "5000",
    type: "expense" as TransactionType,
    category: "Shopping",
    date: format(subMonths(new Date(), 3), "yyyy-MM-dd"),
    description: "Clothing and accessories",
  },
  {
    title: "Grocery Shopping",
    amount: "7800",
    type: "expense" as TransactionType,
    category: "Food & Dining",
    date: format(subMonths(new Date(), 2), "yyyy-MM-dd"),
    description: "Monthly groceries",
  },
  {
    title: "Rent Payment",
    amount: "25000",
    type: "expense" as TransactionType,
    category: "Housing",
    date: format(subMonths(new Date(), 2), "yyyy-MM-dd"),
    description: "Monthly rent",
  },
  {
    title: "Grocery Shopping",
    amount: "8100",
    type: "expense" as TransactionType,
    category: "Food & Dining",
    date: format(subMonths(new Date(), 1), "yyyy-MM-dd"),
    description: "Monthly groceries",
  },
  {
    title: "Rent Payment",
    amount: "25000",
    type: "expense" as TransactionType,
    category: "Housing",
    date: format(subMonths(new Date(), 1), "yyyy-MM-dd"),
    description: "Monthly rent",
  },
  {
    title: "Grocery Shopping",
    amount: "7900",
    type: "expense" as TransactionType,
    category: "Food & Dining",
    date: format(new Date(), "yyyy-MM-dd"),
    description: "Monthly groceries",
  },
  {
    title: "Rent Payment",
    amount: "25000",
    type: "expense" as TransactionType,
    category: "Housing",
    date: format(new Date(), "yyyy-MM-dd"),
    description: "Monthly rent",
  },

  // Savings transactions
  {
    title: "Emergency Fund",
    amount: "10000",
    type: "savings" as TransactionType,
    category: "Emergency Fund",
    date: format(subMonths(new Date(), 5), "yyyy-MM-dd"),
    description: "Monthly emergency fund contribution",
  },
  {
    title: "Vacation Fund",
    amount: "5000",
    type: "savings" as TransactionType,
    category: "Vacation Fund",
    date: format(subMonths(new Date(), 4), "yyyy-MM-dd"),
    description: "Monthly vacation fund contribution",
  },
  {
    title: "Emergency Fund",
    amount: "10000",
    type: "savings" as TransactionType,
    category: "Emergency Fund",
    date: format(subMonths(new Date(), 3), "yyyy-MM-dd"),
    description: "Monthly emergency fund contribution",
  },
  {
    title: "General Savings",
    amount: "8000",
    type: "savings" as TransactionType,
    category: "General Savings",
    date: format(subMonths(new Date(), 2), "yyyy-MM-dd"),
    description: "Monthly general savings",
  },
  {
    title: "Emergency Fund",
    amount: "10000",
    type: "savings" as TransactionType,
    category: "Emergency Fund",
    date: format(subMonths(new Date(), 1), "yyyy-MM-dd"),
    description: "Monthly emergency fund contribution",
  },
  {
    title: "General Savings",
    amount: "8000",
    type: "savings" as TransactionType,
    category: "General Savings",
    date: format(new Date(), "yyyy-MM-dd"),
    description: "Monthly general savings",
  },

  // Investment transactions
  {
    title: "Stock Investment",
    amount: "15000",
    type: "investment" as TransactionType,
    category: "Stocks",
    date: format(subMonths(new Date(), 5), "yyyy-MM-dd"),
    description: "Monthly stock investment",
  },
  {
    title: "Mutual Fund",
    amount: "12000",
    type: "investment" as TransactionType,
    category: "Mutual Funds",
    date: format(subMonths(new Date(), 4), "yyyy-MM-dd"),
    description: "Monthly mutual fund investment",
  },
  {
    title: "Stock Investment",
    amount: "15000",
    type: "investment" as TransactionType,
    category: "Stocks",
    date: format(subMonths(new Date(), 3), "yyyy-MM-dd"),
    description: "Monthly stock investment",
  },
  {
    title: "Cryptocurrency",
    amount: "8000",
    type: "investment" as TransactionType,
    category: "Cryptocurrency",
    date: format(subMonths(new Date(), 2), "yyyy-MM-dd"),
    description: "Monthly crypto investment",
  },
  {
    title: "Stock Investment",
    amount: "15000",
    type: "investment" as TransactionType,
    category: "Stocks",
    date: format(subMonths(new Date(), 1), "yyyy-MM-dd"),
    description: "Monthly stock investment",
  },
  {
    title: "Mutual Fund",
    amount: "12000",
    type: "investment" as TransactionType,
    category: "Mutual Funds",
    date: format(new Date(), "yyyy-MM-dd"),
    description: "Monthly mutual fund investment",
  },
]

async function seedComplete() {
  try {
    console.log("🌱 Starting complete database seeding...")

    // 1. Create test user
    console.log("📝 Creating test user...")
    const hashedPassword = await bcrypt.hash("password123", 12)

    const testUser = await db
      .insert(users)
      .values({
        name: "Test User",
        email: "test@example.com",
        password: hashedPassword,
      })
      .returning()
      .then(res => res[0])

    console.log(`✅ Test user created: ${testUser.email}`)

    // 2. Seed categories
    console.log("🏷️ Seeding categories...")
    for (const category of defaultCategories) {
      await db.insert(categories).values(category).onConflictDoNothing()
    }
    console.log("✅ Categories seeded successfully!")

    // 3. Get category IDs for mapping
    const categoryList = await db.select().from(categories)
    const categoryMap = new Map(categoryList.map(cat => [cat.name, cat.id]))

    // 4. Seed transactions for the test user
    console.log("💰 Seeding transactions...")
    for (const transaction of sampleTransactions) {
      const categoryId = categoryMap.get(transaction.category)
      if (!categoryId) {
        console.warn(`Category not found: ${transaction.category}`)
        continue
      }

      await db
        .insert(transactions)
        .values({
          description: transaction.title,
          amount: transaction.amount,
          type: transaction.type,
          categoryId: categoryId,
          userId: testUser.id,
          date: transaction.date,
        })
        .onConflictDoNothing()
    }

    console.log("✅ Complete database seeding finished!")
    console.log("\n📋 Test Account Details:")
    console.log("Email: test@example.com")
    console.log("Password: password123")
    console.log(
      "\n🔗 You can now sign in with these credentials to see the dashboard data!"
    )
  } catch (error) {
    console.error("❌ Error during seeding:", error)
    process.exit(1)
  }
}

seedComplete()

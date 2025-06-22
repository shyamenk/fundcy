import "dotenv/config"
import { db } from "./index"
import { categories } from "./schema"

type CategoryType = "income" | "expense" | "savings" | "investment"

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

async function seed() {
  try {
    console.log("🌱 Seeding database with default categories...")

    for (const category of defaultCategories) {
      await db.insert(categories).values(category).onConflictDoNothing()
    }

    console.log("✅ Database seeded successfully!")
  } catch (error) {
    console.error("❌ Error seeding database:", error)
    process.exit(1)
  }
}

seed()

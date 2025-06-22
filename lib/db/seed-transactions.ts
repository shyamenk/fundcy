import "dotenv/config"
import { db } from "./index"
import { transactions, categories } from "./schema"
import { subMonths, format } from "date-fns"

type TransactionType = "income" | "expense" | "savings" | "investment"

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

async function seedTransactions() {
  try {
    console.log("🌱 Seeding database with sample transactions...")

    // Get category IDs for mapping
    const categoryList = await db.select().from(categories)
    const categoryMap = new Map(categoryList.map(cat => [cat.name, cat.id]))

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
          date: transaction.date,
        })
        .onConflictDoNothing()
    }

    console.log("✅ Sample transactions seeded successfully!")
  } catch (error) {
    console.error("❌ Error seeding transactions:", error)
    process.exit(1)
  }
}

seedTransactions()

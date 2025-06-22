import { Transaction } from "@/types/transaction"

export interface FinancialSummary {
  netWorth: number
  totalIncome: number
  totalExpenses: number
  totalSavings: number
  totalInvestments: number
  remainingBudget: number
}

export interface CategorySummary {
  category: string
  total: number
  count: number
  percentage: number
}

export interface MonthlySummary {
  month: string // YYYY-MM format
  income: number
  expenses: number
  savings: number
  investments: number
  netWorth: number
}

export interface NetWorthBreakdown {
  assets: number
  liabilities: number
  netWorth: number
}

/**
 * Calculate net worth from transactions
 * Net Worth = Total Income - Total Expenses + Total Savings + Total Investments
 */
export function calculateNetWorth(transactions: Transaction[]): number {
  const income = transactions
    .filter(t => t.type === "income")
    .reduce((sum, t) => sum + Number(t.amount), 0)

  const expenses = transactions
    .filter(t => t.type === "expense")
    .reduce((sum, t) => sum + Number(t.amount), 0)

  const savings = transactions
    .filter(t => t.type === "savings")
    .reduce((sum, t) => sum + Number(t.amount), 0)

  const investments = transactions
    .filter(t => t.type === "investment")
    .reduce((sum, t) => sum + Number(t.amount), 0)

  return income - expenses + savings + investments
}

/**
 * Calculate comprehensive financial summary
 */
export function calculateFinancialSummary(
  transactions: Transaction[]
): FinancialSummary {
  const income = transactions
    .filter(t => t.type === "income")
    .reduce((sum, t) => sum + Number(t.amount), 0)

  const expenses = transactions
    .filter(t => t.type === "expense")
    .reduce((sum, t) => sum + Number(t.amount), 0)

  const savings = transactions
    .filter(t => t.type === "savings")
    .reduce((sum, t) => sum + Number(t.amount), 0)

  const investments = transactions
    .filter(t => t.type === "investment")
    .reduce((sum, t) => sum + Number(t.amount), 0)

  const netWorth = income - expenses + savings + investments
  const remainingBudget = income - expenses

  return {
    netWorth,
    totalIncome: income,
    totalExpenses: expenses,
    totalSavings: savings,
    totalInvestments: investments,
    remainingBudget,
  }
}

/**
 * Calculate category totals for a specific transaction type
 */
export function calculateCategoryTotals(
  transactions: Transaction[],
  type: "income" | "expense" | "savings" | "investment"
): CategorySummary[] {
  const filteredTransactions = transactions.filter(t => t.type === type)
  const totalAmount = filteredTransactions.reduce(
    (sum, t) => sum + Number(t.amount),
    0
  )

  const categoryMap = new Map<string, { total: number; count: number }>()

  filteredTransactions.forEach(transaction => {
    const categoryName = transaction.category?.name || "Uncategorized"
    const amount = Number(transaction.amount)

    if (categoryMap.has(categoryName)) {
      const existing = categoryMap.get(categoryName)!
      existing.total += amount
      existing.count += 1
    } else {
      categoryMap.set(categoryName, { total: amount, count: 1 })
    }
  })

  return Array.from(categoryMap.entries())
    .map(([category, { total, count }]) => ({
      category,
      total,
      count,
      percentage: totalAmount > 0 ? (total / totalAmount) * 100 : 0,
    }))
    .sort((a, b) => b.total - a.total)
}

/**
 * Calculate monthly summaries for a given number of months
 */
export function calculateMonthlySummaries(
  transactions: Transaction[],
  months: number = 12
): MonthlySummary[] {
  const summaries: MonthlySummary[] = []
  const now = new Date()

  for (let i = months - 1; i >= 0; i--) {
    const endDate = new Date(now.getFullYear(), now.getMonth() - i, 0) // End of month
    const startDate = new Date(now.getFullYear(), now.getMonth() - i - 1, 1) // Start of month

    const monthTransactions = transactions.filter(t => {
      const transactionDate = new Date(t.date)
      return transactionDate >= startDate && transactionDate <= endDate
    })

    const income = monthTransactions
      .filter(t => t.type === "income")
      .reduce((sum, t) => sum + Number(t.amount), 0)

    const expenses = monthTransactions
      .filter(t => t.type === "expense")
      .reduce((sum, t) => sum + Number(t.amount), 0)

    const savings = monthTransactions
      .filter(t => t.type === "savings")
      .reduce((sum, t) => sum + Number(t.amount), 0)

    const investments = monthTransactions
      .filter(t => t.type === "investment")
      .reduce((sum, t) => sum + Number(t.amount), 0)

    const netWorth = income - expenses + savings + investments

    summaries.push({
      month: endDate.toISOString().slice(0, 7), // YYYY-MM format
      income,
      expenses,
      savings,
      investments,
      netWorth,
    })
  }

  return summaries
}

/**
 * Calculate net worth breakdown (assets vs liabilities)
 */
export function calculateNetWorthBreakdown(
  transactions: Transaction[]
): NetWorthBreakdown {
  const assets = transactions
    .filter(
      t =>
        t.type === "income" || t.type === "savings" || t.type === "investment"
    )
    .reduce((sum, t) => sum + Number(t.amount), 0)

  const liabilities = transactions
    .filter(t => t.type === "expense")
    .reduce((sum, t) => sum + Number(t.amount), 0)

  const netWorth = assets - liabilities

  return {
    assets,
    liabilities,
    netWorth,
  }
}

/**
 * Calculate growth rate between two periods
 */
export function calculateGrowthRate(current: number, previous: number): number {
  if (previous === 0) return 0
  return ((current - previous) / Math.abs(previous)) * 100
}

/**
 * Calculate average monthly spending
 */
export function calculateAverageMonthlySpending(
  transactions: Transaction[],
  months: number = 12
): number {
  const now = new Date()
  const startDate = new Date(now.getFullYear(), now.getMonth() - months, 1)

  const periodTransactions = transactions.filter(t => {
    const transactionDate = new Date(t.date)
    return transactionDate >= startDate
  })

  const totalExpenses = periodTransactions
    .filter(t => t.type === "expense")
    .reduce((sum, t) => sum + Number(t.amount), 0)

  return totalExpenses / months
}

/**
 * Calculate spending trends (increasing, decreasing, stable)
 */
export function calculateSpendingTrend(monthlySummaries: MonthlySummary[]): {
  trend: "increasing" | "decreasing" | "stable"
  percentage: number
} {
  if (monthlySummaries.length < 2) {
    return { trend: "stable", percentage: 0 }
  }

  const recent = monthlySummaries.slice(-3) // Last 3 months
  const older = monthlySummaries.slice(-6, -3) // 3 months before that

  const recentAvg =
    recent.reduce((sum, m) => sum + m.expenses, 0) / recent.length
  const olderAvg = older.reduce((sum, m) => sum + m.expenses, 0) / older.length

  const percentage = calculateGrowthRate(recentAvg, olderAvg)

  if (percentage > 5) return { trend: "increasing", percentage }
  if (percentage < -5) return { trend: "decreasing", percentage }
  return { trend: "stable", percentage }
}

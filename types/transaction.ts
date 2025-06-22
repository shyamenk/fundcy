export type TransactionType = "income" | "expense" | "savings" | "investment"

export interface Category {
  id: string
  name: string
  type: TransactionType
  color?: string | null
  icon?: string | null
  isDefault?: boolean | null
  createdAt?: Date | null
}

export interface Transaction {
  id: string
  type: TransactionType
  amount: string
  description: string
  categoryId: string | null
  date: string
  createdAt: Date | null
  updatedAt: Date | null
  category: Category | null
}

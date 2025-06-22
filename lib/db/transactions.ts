import { db } from "./index"
import { transactions } from "./schema"
import { eq, desc } from "drizzle-orm"
import { TransactionInput } from "@/lib/validations/transaction"

export async function getAllTransactions() {
  return db.select().from(transactions).orderBy(desc(transactions.date))
}

export async function getTransactionById(id: string) {
  return db.query.transactions.findFirst({ where: eq(transactions.id, id) })
}

export async function createTransaction(data: TransactionInput) {
  return db
    .insert(transactions)
    .values({ ...data, amount: data.amount.toString() })
    .returning()
}

export async function updateTransaction(
  id: string,
  data: Partial<TransactionInput>
) {
  const { type, amount, description, categoryId, date } = data

  const updateData = {
    ...(type && { type }),
    ...(amount !== undefined && { amount: amount.toString() }),
    ...(description && { description }),
    ...(categoryId && { categoryId }),
    ...(date && { date }),
    updatedAt: new Date(),
  }

  return await db
    .update(transactions)
    .set(updateData)
    .where(eq(transactions.id, id))
}

export async function deleteTransaction(id: string) {
  return db.delete(transactions).where(eq(transactions.id, id)).returning()
}

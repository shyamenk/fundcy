import { db } from "./index"
import { transactions } from "./schema"
import { eq, desc, and } from "drizzle-orm"
import { TransactionInput } from "@/lib/validations/transaction"

export async function getAllTransactions(userId: string) {
  return db
    .select()
    .from(transactions)
    .where(eq(transactions.userId, userId))
    .orderBy(desc(transactions.date))
}

export async function getTransactionById(id: string, userId: string) {
  return db
    .select()
    .from(transactions)
    .where(and(eq(transactions.id, id), eq(transactions.userId, userId)))
    .then(res => res[0])
}

export async function createTransaction(
  data: TransactionInput,
  userId: string
) {
  return db
    .insert(transactions)
    .values({ ...data, amount: data.amount.toString(), userId })
    .returning()
}

export async function updateTransaction(
  id: string,
  data: Partial<TransactionInput>,
  userId: string
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
    .where(and(eq(transactions.id, id), eq(transactions.userId, userId)))
    .returning()
}

export async function deleteTransaction(id: string, userId: string) {
  return db
    .delete(transactions)
    .where(and(eq(transactions.id, id), eq(transactions.userId, userId)))
    .returning()
}

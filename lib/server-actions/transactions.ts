"use server"

import { revalidatePath } from "next/cache"
import { db } from "@/lib/db"
import { transactions } from "@/lib/db/schema"
import {
  transactionSchema,
  updateTransactionSchema,
} from "@/lib/validations/transaction"
import { eq, sql } from "drizzle-orm"

export async function createTransaction(formData: FormData) {
  const validatedFields = transactionSchema.safeParse({
    type: formData.get("type"),
    amount: formData.get("amount"),
    description: formData.get("description"),
    categoryId: formData.get("categoryId"),
    date: formData.get("date"),
  })

  if (!validatedFields.success) {
    return {
      error: "Invalid fields.",
      details: validatedFields.error.flatten().fieldErrors,
    }
  }

  const { type, amount, description, categoryId, date } = validatedFields.data

  try {
    await db.insert(transactions).values({
      type,
      amount: amount.toString(),
      description,
      categoryId,
      date,
    })

    revalidatePath("/transactions")
    return { success: true }
  } catch {
    return {
      error: "Database error: Failed to create transaction.",
    }
  }
}

export async function updateTransaction(id: string, formData: FormData) {
  const validatedFields = updateTransactionSchema.safeParse({
    type: formData.get("type"),
    amount: formData.get("amount"),
    description: formData.get("description"),
    categoryId: formData.get("categoryId"),
    date: formData.get("date"),
  })

  if (!validatedFields.success) {
    return {
      error: "Invalid fields.",
      details: validatedFields.error.flatten().fieldErrors,
    }
  }

  const { type, amount, description, categoryId, date } = validatedFields.data

  const updateData = {
    ...(type && { type }),
    ...(amount !== undefined && { amount: amount.toString() }),
    ...(description && { description }),
    ...(categoryId && { categoryId }),
    ...(date && { date }),
    updatedAt: new Date(),
  }

  try {
    await db.update(transactions).set(updateData).where(eq(transactions.id, id))

    revalidatePath("/transactions")
    revalidatePath(`/transactions/${id}`)
    return { success: true }
  } catch {
    return {
      error: "Database error: Failed to update transaction.",
    }
  }
}

export async function deleteTransaction(id: string) {
  try {
    await db.delete(transactions).where(eq(transactions.id, id))
    revalidatePath("/transactions")
    return { success: true }
  } catch {
    return {
      error: "Database error: Failed to delete transaction.",
    }
  }
}

export async function getTransaction(id: string) {
  try {
    const transaction = await db.query.transactions.findFirst({
      where: eq(transactions.id, id),
      with: {
        category: true,
      },
    })

    if (!transaction) {
      return { error: "Transaction not found" }
    }

    return { transaction }
  } catch {
    return {
      error: "Database error: Failed to fetch transaction.",
    }
  }
}

export async function getTransactions(page: number = 1, limit: number = 10) {
  try {
    const offset = (page - 1) * limit

    // Get total count for pagination
    const totalCount = await db
      .select({ count: sql`count(*)` })
      .from(transactions)
    const total = Number(totalCount[0]?.count || 0)

    // Get paginated transactions
    const allTransactions = await db.query.transactions.findMany({
      with: {
        category: true,
      },
      orderBy: (transactions, { desc }) => [desc(transactions.date)],
      limit,
      offset,
    })

    const totalPages = Math.ceil(total / limit)
    const hasNextPage = page < totalPages
    const hasPrevPage = page > 1

    return {
      transactions: allTransactions,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNextPage,
        hasPrevPage,
      },
    }
  } catch (error) {
    console.error("Error fetching transactions:", error)
    return {
      error: "Database error: Failed to fetch transactions.",
    }
  }
}

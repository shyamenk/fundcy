import { z } from "zod"

export const transactionSchema = z.object({
  type: z.enum(["income", "expense", "savings", "investment"]),
  amount: z.coerce.number().min(0.01, "Amount must be greater than 0"),
  description: z.string().min(1).max(255),
  categoryId: z.string().uuid(),
  date: z.string().date(),
})

export const updateTransactionSchema = transactionSchema.partial()

export type TransactionInput = z.infer<typeof transactionSchema>

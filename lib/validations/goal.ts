import { z } from "zod"

export const goalSchema = z.object({
  title: z
    .string()
    .min(1, "Title is required")
    .max(255, "Title must be less than 255 characters"),
  description: z.string().optional(),
  targetAmount: z.string().min(1, "Target amount is required"),
  currentAmount: z.string().optional().default("0"),
  targetDate: z.string().optional(),
  category: z.string().optional(),
  status: z
    .enum(["active", "completed", "paused"])
    .optional()
    .default("active"),
})

export const goalUpdateSchema = goalSchema.partial().extend({
  id: z.string().uuid("Invalid goal ID"),
})

export const goalContributionSchema = z.object({
  goalId: z.string().uuid("Invalid goal ID"),
  transactionId: z.string().uuid("Invalid transaction ID"),
  amount: z.string().min(1, "Amount is required"),
})

export const goalCompleteSchema = z.object({
  id: z.string().uuid("Invalid goal ID"),
  completedAt: z.string().optional(),
})

export type GoalFormData = z.infer<typeof goalSchema>
export type GoalUpdateData = z.infer<typeof goalUpdateSchema>
export type GoalContributionData = z.infer<typeof goalContributionSchema>
export type GoalCompleteData = z.infer<typeof goalCompleteSchema>

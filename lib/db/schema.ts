// Drizzle ORM schema for Personal Finance Tracker
import {
  pgTable,
  uuid,
  varchar,
  decimal,
  date,
  timestamp,
  boolean,
  pgEnum,
} from "drizzle-orm/pg-core"

export const transactionTypeEnum = pgEnum("transaction_type", [
  "income",
  "expense",
  "savings",
  "investment",
])
export const goalStatusEnum = pgEnum("goal_status", [
  "active",
  "completed",
  "paused",
])

export const categories = pgTable("categories", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: varchar("name", { length: 100 }).notNull(),
  type: transactionTypeEnum("type").notNull(),
  color: varchar("color", { length: 7 }),
  icon: varchar("icon", { length: 50 }),
  isDefault: boolean("is_default").default(false),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
})

export const transactions = pgTable("transactions", {
  id: uuid("id").primaryKey().defaultRandom(),
  type: transactionTypeEnum("type").notNull(),
  amount: decimal("amount", { precision: 12, scale: 2 }).notNull(),
  description: varchar("description", { length: 255 }).notNull(),
  categoryId: uuid("category_id").references(() => categories.id),
  date: date("date").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
})

export const goals = pgTable("goals", {
  id: uuid("id").primaryKey().defaultRandom(),
  title: varchar("title", { length: 255 }).notNull(),
  description: varchar("description", { length: 1000 }),
  targetAmount: decimal("target_amount", { precision: 12, scale: 2 }).notNull(),
  currentAmount: decimal("current_amount", { precision: 12, scale: 2 }).default(
    "0"
  ),
  targetDate: date("target_date"),
  category: varchar("category", { length: 100 }),
  status: goalStatusEnum("status").default("active"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
  completedAt: timestamp("completed_at", { withTimezone: true }),
})

export const goalContributions = pgTable("goal_contributions", {
  id: uuid("id").primaryKey().defaultRandom(),
  goalId: uuid("goal_id").references(() => goals.id, { onDelete: "cascade" }),
  transactionId: uuid("transaction_id").references(() => transactions.id, {
    onDelete: "cascade",
  }),
  amount: decimal("amount", { precision: 12, scale: 2 }).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
})

// Export all schema elements for Drizzle
export const schema = {
  categories,
  transactions,
  goals,
  goalContributions,
  transactionTypeEnum,
  goalStatusEnum,
}

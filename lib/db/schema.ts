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
  text,
  index,
} from "drizzle-orm/pg-core"
import { relations } from "drizzle-orm"

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
export const investmentTypeEnum = pgEnum("investment_type", [
  "mutual_fund",
  "direct_stocks",
  "index_fund",
  "small_cap",
  "mid_cap",
  "large_cap",
  "bonds",
  "etf",
  "cryptocurrency",
  "real_estate",
  "other",
])
export const sipFrequencyEnum = pgEnum("sip_frequency", [
  "daily",
  "weekly",
  "monthly",
  "quarterly",
  "yearly",
])

// User authentication tables
export const users = pgTable(
  "users",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    name: varchar("name", { length: 255 }),
    email: varchar("email", { length: 255 }).notNull().unique(),
    password: varchar("password", { length: 255 }),
    emailVerified: timestamp("email_verified", { withTimezone: true }),
    image: varchar("image", { length: 255 }),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
  },
  table => ({
    emailIdx: index("email_idx").on(table.email),
  })
)

export const accounts = pgTable(
  "accounts",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    type: varchar("type", { length: 255 }).notNull(),
    provider: varchar("provider", { length: 255 }).notNull(),
    providerAccountId: varchar("provider_account_id", {
      length: 255,
    }).notNull(),
    refresh_token: text("refresh_token"),
    access_token: text("access_token"),
    expires_at: timestamp("expires_at", { withTimezone: true }),
    token_type: varchar("token_type", { length: 255 }),
    scope: varchar("scope", { length: 255 }),
    id_token: text("id_token"),
    session_state: varchar("session_state", { length: 255 }),
  },
  table => ({
    userIdIdx: index("user_id_idx").on(table.userId),
    providerAccountIdIdx: index("provider_account_id_idx").on(
      table.providerAccountId
    ),
  })
)

export const sessions = pgTable(
  "sessions",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    sessionToken: varchar("session_token", { length: 255 }).notNull().unique(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    expires: timestamp("expires", { withTimezone: true }).notNull(),
  },
  table => ({
    sessionTokenIdx: index("session_token_idx").on(table.sessionToken),
    sessionsUserIdIdx: index("sessions_user_id_idx").on(table.userId),
  })
)

export const verificationTokens = pgTable(
  "verification_tokens",
  {
    identifier: varchar("identifier", { length: 255 }).notNull(),
    token: varchar("token", { length: 255 }).notNull().unique(),
    expires: timestamp("expires", { withTimezone: true }).notNull(),
  },
  table => ({
    tokenIdx: index("token_idx").on(table.token),
  })
)

export const categories = pgTable("categories", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: varchar("name", { length: 100 }).notNull(),
  type: transactionTypeEnum("type").notNull(),
  color: varchar("color", { length: 7 }),
  icon: varchar("icon", { length: 50 }),
  isDefault: boolean("is_default").default(false),
  userId: uuid("user_id").references(() => users.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
})

export const transactions = pgTable("transactions", {
  id: uuid("id").primaryKey().defaultRandom(),
  type: transactionTypeEnum("type").notNull(),
  amount: decimal("amount", { precision: 12, scale: 2 }).notNull(),
  description: varchar("description", { length: 255 }).notNull(),
  categoryId: uuid("category_id").references(() => categories.id),
  userId: uuid("user_id").references(() => users.id, { onDelete: "cascade" }),
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
  userId: uuid("user_id").references(() => users.id, { onDelete: "cascade" }),
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

export const investmentHoldings = pgTable("investment_holdings", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: varchar("name", { length: 255 }).notNull(),
  symbol: varchar("symbol", { length: 50 }),
  type: investmentTypeEnum("type").notNull(),
  currentValue: decimal("current_value", { precision: 12, scale: 2 }).notNull(),
  totalInvested: decimal("total_invested", {
    precision: 12,
    scale: 2,
  }).notNull(),
  units: decimal("units", { precision: 10, scale: 4 }),
  avgPurchasePrice: decimal("avg_purchase_price", { precision: 12, scale: 2 }),
  currentPrice: decimal("current_price", { precision: 12, scale: 2 }),
  returns: decimal("returns", { precision: 12, scale: 2 }).default("0"),
  returnsPercentage: decimal("returns_percentage", {
    precision: 5,
    scale: 2,
  }).default("0"),
  fundHouse: varchar("fund_house", { length: 255 }),
  category: varchar("category", { length: 100 }),
  riskLevel: varchar("risk_level", { length: 50 }),
  userId: uuid("user_id").references(() => users.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
})

export const sipInvestments = pgTable("sip_investments", {
  id: uuid("id").primaryKey().defaultRandom(),
  holdingId: uuid("holding_id").references(() => investmentHoldings.id, {
    onDelete: "cascade",
  }),
  amount: decimal("amount", { precision: 12, scale: 2 }).notNull(),
  frequency: sipFrequencyEnum("frequency").notNull(),
  startDate: date("start_date").notNull(),
  endDate: date("end_date"),
  isActive: boolean("is_active").default(true),
  nextSipDate: date("next_sip_date"),
  totalInvested: decimal("total_invested", { precision: 12, scale: 2 }).default(
    "0"
  ),
  totalUnits: decimal("total_units", { precision: 10, scale: 4 }).default("0"),
  fundName: varchar("fund_name", { length: 255 }),
  userId: uuid("user_id").references(() => users.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
})

export const debitCardExpenses = pgTable("debit_card_expenses", {
  id: uuid("id").primaryKey().defaultRandom(),
  amount: decimal("amount", { precision: 12, scale: 2 }).notNull(),
  description: varchar("description", { length: 255 }).notNull(),
  merchant: varchar("merchant", { length: 255 }),
  category: varchar("category", { length: 100 }),
  cardType: varchar("card_type", { length: 50 }),
  transactionDate: date("transaction_date").notNull(),
  userId: uuid("user_id").references(() => users.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
})

// Define relationships
export const usersRelations = relations(users, ({ many }) => ({
  accounts: many(accounts),
  sessions: many(sessions),
  categories: many(categories),
  transactions: many(transactions),
  goals: many(goals),
}))

export const accountsRelations = relations(accounts, ({ one }) => ({
  user: one(users, {
    fields: [accounts.userId],
    references: [users.id],
  }),
}))

export const sessionsRelations = relations(sessions, ({ one }) => ({
  user: one(users, {
    fields: [sessions.userId],
    references: [users.id],
  }),
}))

export const categoriesRelations = relations(categories, ({ one, many }) => ({
  user: one(users, {
    fields: [categories.userId],
    references: [users.id],
  }),
  transactions: many(transactions),
}))

export const transactionsRelations = relations(transactions, ({ one }) => ({
  user: one(users, {
    fields: [transactions.userId],
    references: [users.id],
  }),
  category: one(categories, {
    fields: [transactions.categoryId],
    references: [categories.id],
  }),
}))

export const goalsRelations = relations(goals, ({ one, many }) => ({
  user: one(users, {
    fields: [goals.userId],
    references: [users.id],
  }),
  contributions: many(goalContributions),
}))

export const goalContributionsRelations = relations(
  goalContributions,
  ({ one }) => ({
    goal: one(goals, {
      fields: [goalContributions.goalId],
      references: [goals.id],
    }),
    transaction: one(transactions, {
      fields: [goalContributions.transactionId],
      references: [transactions.id],
    }),
  })
)

export const investmentHoldingsRelations = relations(
  investmentHoldings,
  ({ one, many }) => ({
    user: one(users, {
      fields: [investmentHoldings.userId],
      references: [users.id],
    }),
    sips: many(sipInvestments),
  })
)

export const sipInvestmentsRelations = relations(sipInvestments, ({ one }) => ({
  user: one(users, {
    fields: [sipInvestments.userId],
    references: [users.id],
  }),
  holding: one(investmentHoldings, {
    fields: [sipInvestments.holdingId],
    references: [investmentHoldings.id],
  }),
}))

export const debitCardExpensesRelations = relations(
  debitCardExpenses,
  ({ one }) => ({
    user: one(users, {
      fields: [debitCardExpenses.userId],
      references: [users.id],
    }),
  })
)

// Export all schema elements for Drizzle
export const schema = {
  users,
  accounts,
  sessions,
  verificationTokens,
  categories,
  transactions,
  goals,
  goalContributions,
  investmentHoldings,
  sipInvestments,
  debitCardExpenses,
  transactionTypeEnum,
  goalStatusEnum,
  investmentTypeEnum,
  sipFrequencyEnum,
  usersRelations,
  accountsRelations,
  sessionsRelations,
  categoriesRelations,
  transactionsRelations,
  goalsRelations,
  goalContributionsRelations,
  investmentHoldingsRelations,
  sipInvestmentsRelations,
  debitCardExpensesRelations,
}

import { pgTable, foreignKey, uuid, numeric, timestamp, varchar, date, boolean, index, unique, text, pgEnum } from "drizzle-orm/pg-core"
import { sql } from "drizzle-orm"

export const goalStatus = pgEnum("goal_status", ['active', 'completed', 'paused'])
export const investmentType = pgEnum("investment_type", ['mutual_fund', 'direct_stocks', 'index_fund', 'small_cap', 'mid_cap', 'large_cap', 'bonds', 'etf', 'cryptocurrency', 'real_estate', 'other'])
export const sipFrequency = pgEnum("sip_frequency", ['daily', 'weekly', 'monthly', 'quarterly', 'yearly'])
export const transactionType = pgEnum("transaction_type", ['income', 'expense', 'savings', 'investment'])


export const goalContributions = pgTable("goal_contributions", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	goalId: uuid("goal_id"),
	transactionId: uuid("transaction_id"),
	amount: numeric({ precision: 12, scale:  2 }).notNull(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow(),
}, (table) => [
	foreignKey({
			columns: [table.goalId],
			foreignColumns: [goals.id],
			name: "goal_contributions_goal_id_goals_id_fk"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.transactionId],
			foreignColumns: [transactions.id],
			name: "goal_contributions_transaction_id_transactions_id_fk"
		}).onDelete("cascade"),
]);

export const goals = pgTable("goals", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	title: varchar({ length: 255 }).notNull(),
	description: varchar({ length: 1000 }),
	targetAmount: numeric("target_amount", { precision: 12, scale:  2 }).notNull(),
	currentAmount: numeric("current_amount", { precision: 12, scale:  2 }).default('0'),
	targetDate: date("target_date"),
	category: varchar({ length: 100 }),
	status: goalStatus().default('active'),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow(),
	completedAt: timestamp("completed_at", { withTimezone: true, mode: 'string' }),
	userId: uuid("user_id"),
}, (table) => [
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "goals_user_id_users_id_fk"
		}).onDelete("cascade"),
]);

export const transactions = pgTable("transactions", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	type: transactionType().notNull(),
	amount: numeric({ precision: 12, scale:  2 }).notNull(),
	description: varchar({ length: 255 }).notNull(),
	categoryId: uuid("category_id"),
	date: date().notNull(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow(),
	userId: uuid("user_id"),
}, (table) => [
	foreignKey({
			columns: [table.categoryId],
			foreignColumns: [categories.id],
			name: "transactions_category_id_categories_id_fk"
		}),
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "transactions_user_id_users_id_fk"
		}).onDelete("cascade"),
]);

export const categories = pgTable("categories", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	name: varchar({ length: 100 }).notNull(),
	type: transactionType().notNull(),
	color: varchar({ length: 7 }),
	icon: varchar({ length: 50 }),
	isDefault: boolean("is_default").default(false),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow(),
	userId: uuid("user_id"),
}, (table) => [
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "categories_user_id_users_id_fk"
		}).onDelete("cascade"),
]);

export const verificationTokens = pgTable("verification_tokens", {
	identifier: varchar({ length: 255 }).notNull(),
	token: varchar({ length: 255 }).notNull(),
	expires: timestamp({ withTimezone: true, mode: 'string' }).notNull(),
}, (table) => [
	index("token_idx").using("btree", table.token.asc().nullsLast().op("text_ops")),
	unique("verification_tokens_token_unique").on(table.token),
]);

export const accounts = pgTable("accounts", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	userId: uuid("user_id").notNull(),
	type: varchar({ length: 255 }).notNull(),
	provider: varchar({ length: 255 }).notNull(),
	providerAccountId: varchar("provider_account_id", { length: 255 }).notNull(),
	refreshToken: text("refresh_token"),
	accessToken: text("access_token"),
	expiresAt: timestamp("expires_at", { withTimezone: true, mode: 'string' }),
	tokenType: varchar("token_type", { length: 255 }),
	scope: varchar({ length: 255 }),
	idToken: text("id_token"),
	sessionState: varchar("session_state", { length: 255 }),
}, (table) => [
	index("provider_account_id_idx").using("btree", table.providerAccountId.asc().nullsLast().op("text_ops")),
	index("user_id_idx").using("btree", table.userId.asc().nullsLast().op("uuid_ops")),
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "accounts_user_id_users_id_fk"
		}).onDelete("cascade"),
]);

export const sessions = pgTable("sessions", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	sessionToken: varchar("session_token", { length: 255 }).notNull(),
	userId: uuid("user_id").notNull(),
	expires: timestamp({ withTimezone: true, mode: 'string' }).notNull(),
}, (table) => [
	index("session_token_idx").using("btree", table.sessionToken.asc().nullsLast().op("text_ops")),
	index("sessions_user_id_idx").using("btree", table.userId.asc().nullsLast().op("uuid_ops")),
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "sessions_user_id_users_id_fk"
		}).onDelete("cascade"),
	unique("sessions_session_token_unique").on(table.sessionToken),
]);

export const users = pgTable("users", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	name: varchar({ length: 255 }),
	email: varchar({ length: 255 }).notNull(),
	emailVerified: timestamp("email_verified", { withTimezone: true, mode: 'string' }),
	image: varchar({ length: 255 }),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow(),
	password: varchar({ length: 255 }),
}, (table) => [
	index("email_idx").using("btree", table.email.asc().nullsLast().op("text_ops")),
	unique("users_email_unique").on(table.email),
]);

export const debitCardExpenses = pgTable("debit_card_expenses", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	amount: numeric({ precision: 12, scale:  2 }).notNull(),
	description: varchar({ length: 255 }).notNull(),
	merchant: varchar({ length: 255 }),
	category: varchar({ length: 100 }),
	cardType: varchar("card_type", { length: 50 }),
	transactionDate: date("transaction_date").notNull(),
	userId: uuid("user_id"),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow(),
}, (table) => [
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "debit_card_expenses_user_id_users_id_fk"
		}).onDelete("cascade"),
]);

export const investmentHoldings = pgTable("investment_holdings", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	name: varchar({ length: 255 }).notNull(),
	symbol: varchar({ length: 50 }),
	type: investmentType().notNull(),
	currentValue: numeric("current_value", { precision: 12, scale:  2 }).notNull(),
	totalInvested: numeric("total_invested", { precision: 12, scale:  2 }).notNull(),
	units: numeric({ precision: 10, scale:  4 }),
	avgPurchasePrice: numeric("avg_purchase_price", { precision: 12, scale:  2 }),
	currentPrice: numeric("current_price", { precision: 12, scale:  2 }),
	returns: numeric({ precision: 12, scale:  2 }).default('0'),
	returnsPercentage: numeric("returns_percentage", { precision: 5, scale:  2 }).default('0'),
	fundHouse: varchar("fund_house", { length: 255 }),
	category: varchar({ length: 100 }),
	riskLevel: varchar("risk_level", { length: 50 }),
	userId: uuid("user_id"),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow(),
}, (table) => [
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "investment_holdings_user_id_users_id_fk"
		}).onDelete("cascade"),
]);

export const sipInvestments = pgTable("sip_investments", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	holdingId: uuid("holding_id"),
	amount: numeric({ precision: 12, scale:  2 }).notNull(),
	frequency: sipFrequency().notNull(),
	startDate: date("start_date").notNull(),
	endDate: date("end_date"),
	isActive: boolean("is_active").default(true),
	nextSipDate: date("next_sip_date"),
	totalInvested: numeric("total_invested", { precision: 12, scale:  2 }).default('0'),
	totalUnits: numeric("total_units", { precision: 10, scale:  4 }).default('0'),
	userId: uuid("user_id"),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow(),
	fundName: varchar("fund_name", { length: 255 }),
}, (table) => [
	foreignKey({
			columns: [table.holdingId],
			foreignColumns: [investmentHoldings.id],
			name: "sip_investments_holding_id_investment_holdings_id_fk"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "sip_investments_user_id_users_id_fk"
		}).onDelete("cascade"),
]);

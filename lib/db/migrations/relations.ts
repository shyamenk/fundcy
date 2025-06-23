import { relations } from "drizzle-orm/relations";
import { goals, goalContributions, transactions, users, categories, accounts, sessions, debitCardExpenses, investmentHoldings, sipInvestments } from "./schema";

export const goalContributionsRelations = relations(goalContributions, ({one}) => ({
	goal: one(goals, {
		fields: [goalContributions.goalId],
		references: [goals.id]
	}),
	transaction: one(transactions, {
		fields: [goalContributions.transactionId],
		references: [transactions.id]
	}),
}));

export const goalsRelations = relations(goals, ({one, many}) => ({
	goalContributions: many(goalContributions),
	user: one(users, {
		fields: [goals.userId],
		references: [users.id]
	}),
}));

export const transactionsRelations = relations(transactions, ({one, many}) => ({
	goalContributions: many(goalContributions),
	category: one(categories, {
		fields: [transactions.categoryId],
		references: [categories.id]
	}),
	user: one(users, {
		fields: [transactions.userId],
		references: [users.id]
	}),
}));

export const usersRelations = relations(users, ({many}) => ({
	goals: many(goals),
	transactions: many(transactions),
	categories: many(categories),
	accounts: many(accounts),
	sessions: many(sessions),
	debitCardExpenses: many(debitCardExpenses),
	investmentHoldings: many(investmentHoldings),
	sipInvestments: many(sipInvestments),
}));

export const categoriesRelations = relations(categories, ({one, many}) => ({
	transactions: many(transactions),
	user: one(users, {
		fields: [categories.userId],
		references: [users.id]
	}),
}));

export const accountsRelations = relations(accounts, ({one}) => ({
	user: one(users, {
		fields: [accounts.userId],
		references: [users.id]
	}),
}));

export const sessionsRelations = relations(sessions, ({one}) => ({
	user: one(users, {
		fields: [sessions.userId],
		references: [users.id]
	}),
}));

export const debitCardExpensesRelations = relations(debitCardExpenses, ({one}) => ({
	user: one(users, {
		fields: [debitCardExpenses.userId],
		references: [users.id]
	}),
}));

export const investmentHoldingsRelations = relations(investmentHoldings, ({one, many}) => ({
	user: one(users, {
		fields: [investmentHoldings.userId],
		references: [users.id]
	}),
	sipInvestments: many(sipInvestments),
}));

export const sipInvestmentsRelations = relations(sipInvestments, ({one}) => ({
	investmentHolding: one(investmentHoldings, {
		fields: [sipInvestments.holdingId],
		references: [investmentHoldings.id]
	}),
	user: one(users, {
		fields: [sipInvestments.userId],
		references: [users.id]
	}),
}));
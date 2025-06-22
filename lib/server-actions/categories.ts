"use server"

import { db } from "@/lib/db"

export async function getCategories() {
  try {
    const allCategories = await db.query.categories.findMany({
      orderBy: (categories, { asc }) => [asc(categories.name)],
    })

    return { categories: allCategories }
  } catch {
    return {
      error: "Database error: Failed to fetch categories.",
    }
  }
}

export async function getCategoriesByType(
  type: "income" | "expense" | "savings" | "investment"
) {
  try {
    const filteredCategories = await db.query.categories.findMany({
      where: (categories, { eq }) => eq(categories.type, type),
      orderBy: (categories, { asc }) => [asc(categories.name)],
    })

    return { categories: filteredCategories }
  } catch {
    return {
      error: "Database error: Failed to fetch categories.",
    }
  }
}

import { drizzle } from "drizzle-orm/neon-serverless"
import { Pool } from "@neondatabase/serverless"
import { schema } from "./schema"

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL environment variable is required")
}

const pool = new Pool({ connectionString: process.env.DATABASE_URL })

export const db = drizzle(pool, { schema })

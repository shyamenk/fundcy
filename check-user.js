import "dotenv/config"
import { db } from "./lib/db/index.js"
import { schema } from "./lib/db/schema.js"
import { eq } from "drizzle-orm"

const { users } = schema

async function checkUser() {
  try {
    console.log("🔍 Checking if user exists in database...")

    const userId = "33b1fe7f-b67d-4c89-8110-896ec1c65a13"

    const user = await db.select().from(users).where(eq(users.id, userId))

    console.log("📊 User found:", user.length > 0)
    if (user.length > 0) {
      console.log("User details:", user[0])
    } else {
      console.log("❌ User not found in database!")
      console.log("This user exists in the session but not in the database.")
    }

    // Check all users in the database
    const allUsers = await db.select().from(users)
    console.log("📋 All users in database:", allUsers.length)
    allUsers.forEach(u => console.log(`- ${u.name} (${u.email}) - ${u.id}`))
  } catch (error) {
    console.error("❌ Error checking user:", error)
  } finally {
    process.exit(0)
  }
}

checkUser()

import "dotenv/config"
import { db } from "./index"
import { debitCardExpenses } from "./schema"
import { subDays, format } from "date-fns"

const sampleExpenses = [
  // Recent expenses (current month)
  {
    amount: "1200",
    description: "Grocery Shopping",
    merchant: "Big Bazaar",
    category: "Groceries",
    cardType: "Visa",
    transactionDate: format(subDays(new Date(), 1), "yyyy-MM-dd"),
  },
  {
    amount: "3500",
    description: "Electronics Purchase",
    merchant: "Reliance Digital",
    category: "Electronics",
    cardType: "Mastercard",
    transactionDate: format(subDays(new Date(), 3), "yyyy-MM-dd"),
  },
  {
    amount: "800",
    description: "Coffee Shop",
    merchant: "Starbucks",
    category: "Food & Beverage",
    cardType: "Visa",
    transactionDate: format(subDays(new Date(), 5), "yyyy-MM-dd"),
  },
  {
    amount: "2500",
    description: "Restaurant Dinner",
    merchant: "Pizza Hut",
    category: "Food & Beverage",
    cardType: "Mastercard",
    transactionDate: format(subDays(new Date(), 7), "yyyy-MM-dd"),
  },
  {
    amount: "1800",
    description: "Fuel Station",
    merchant: "Indian Oil",
    category: "Transportation",
    cardType: "Visa",
    transactionDate: format(subDays(new Date(), 10), "yyyy-MM-dd"),
  },
  {
    amount: "4500",
    description: "Online Shopping",
    merchant: "Amazon",
    category: "Shopping",
    cardType: "Mastercard",
    transactionDate: format(subDays(new Date(), 12), "yyyy-MM-dd"),
  },
  {
    amount: "1200",
    description: "Movie Tickets",
    merchant: "PVR Cinemas",
    category: "Entertainment",
    cardType: "Visa",
    transactionDate: format(subDays(new Date(), 15), "yyyy-MM-dd"),
  },
  {
    amount: "3000",
    description: "Clothing Store",
    merchant: "Shoppers Stop",
    category: "Shopping",
    cardType: "Mastercard",
    transactionDate: format(subDays(new Date(), 18), "yyyy-MM-dd"),
  },
  {
    amount: "900",
    description: "Pharmacy",
    merchant: "Apollo Pharmacy",
    category: "Healthcare",
    cardType: "Visa",
    transactionDate: format(subDays(new Date(), 20), "yyyy-MM-dd"),
  },
  {
    amount: "1500",
    description: "Fast Food",
    merchant: "McDonald's",
    category: "Food & Beverage",
    cardType: "Mastercard",
    transactionDate: format(subDays(new Date(), 22), "yyyy-MM-dd"),
  },
  // Previous month expenses
  {
    amount: "2800",
    description: "Gym Membership",
    merchant: "Fitness First",
    category: "Health & Fitness",
    cardType: "Visa",
    transactionDate: "2024-05-15",
  },
  {
    amount: "4200",
    description: "Mobile Recharge",
    merchant: "Airtel",
    category: "Utilities",
    cardType: "Mastercard",
    transactionDate: "2024-05-10",
  },
  {
    amount: "1800",
    description: "Book Store",
    merchant: "Crossword",
    category: "Education",
    cardType: "Visa",
    transactionDate: "2024-05-08",
  },
  {
    amount: "3200",
    description: "Home Decor",
    merchant: "IKEA",
    category: "Home & Garden",
    cardType: "Mastercard",
    transactionDate: "2024-05-05",
  },
  {
    amount: "1100",
    description: "Pet Store",
    merchant: "PetSmart",
    category: "Pets",
    cardType: "Visa",
    transactionDate: "2024-05-03",
  },
  // Two months ago expenses
  {
    amount: "5500",
    description: "Travel Booking",
    merchant: "MakeMyTrip",
    category: "Travel",
    cardType: "Mastercard",
    transactionDate: "2024-04-20",
  },
  {
    amount: "2100",
    description: "Hardware Store",
    merchant: "Home Depot",
    category: "Home & Garden",
    cardType: "Visa",
    transactionDate: "2024-04-15",
  },
  {
    amount: "1400",
    description: "Bakery",
    merchant: "Theobroma",
    category: "Food & Beverage",
    cardType: "Mastercard",
    transactionDate: "2024-04-12",
  },
  {
    amount: "3800",
    description: "Insurance Premium",
    merchant: "LIC",
    category: "Insurance",
    cardType: "Visa",
    transactionDate: "2024-04-08",
  },
  {
    amount: "1600",
    description: "Salon",
    merchant: "Lakme Salon",
    category: "Personal Care",
    cardType: "Mastercard",
    transactionDate: "2024-04-05",
  },
]

async function seedDebitExpenses() {
  try {
    console.log("🌱 Seeding database with sample debit card expenses...")

    for (const expense of sampleExpenses) {
      await db.insert(debitCardExpenses).values(expense).onConflictDoNothing()
    }

    console.log("✅ Sample debit card expenses seeded successfully!")
  } catch (error) {
    console.error("❌ Error seeding debit card expenses:", error)
    process.exit(1)
  }
}

seedDebitExpenses()

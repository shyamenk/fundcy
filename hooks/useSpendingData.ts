"use client"

import { useState, useEffect } from "react"

export interface CategoryData {
  name: string
  amount: number
  percentage: number
  color: string
}

const SAMPLE_CATEGORIES = [
  { name: "Food & Dining", baseAmount: 8000, color: "#3b82f6" },
  { name: "Transportation", baseAmount: 5000, color: "#ef4444" },
  { name: "Shopping", baseAmount: 6000, color: "#10b981" },
  { name: "Entertainment", baseAmount: 3000, color: "#f59e0b" },
  { name: "Healthcare", baseAmount: 2000, color: "#8b5cf6" },
  { name: "Utilities", baseAmount: 4000, color: "#06b6d4" },
  { name: "Education", baseAmount: 3500, color: "#84cc16" },
  { name: "Travel", baseAmount: 2500, color: "#f97316" },
]

export function useSpendingData() {
  const [data, setData] = useState<CategoryData[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const generateSpendingData = () => {
      const spendingData: CategoryData[] = []
      let totalAmount = 0

      // Generate random amounts for each category
      SAMPLE_CATEGORIES.forEach(category => {
        const variation = 0.7 + Math.random() * 0.6 // ±30% variation
        const amount = Math.round(category.baseAmount * variation)
        totalAmount += amount

        spendingData.push({
          name: category.name,
          amount,
          percentage: 0, // Will be calculated after total
          color: category.color,
        })
      })

      // Calculate percentages
      spendingData.forEach(item => {
        item.percentage = (item.amount / totalAmount) * 100
      })

      // Sort by amount descending
      return spendingData.sort((a, b) => b.amount - a.amount)
    }

    setLoading(true)

    // Simulate API call delay
    setTimeout(() => {
      const sampleData = generateSpendingData()
      setData(sampleData)
      setLoading(false)
    }, 300)
  }, [])

  return { data, loading }
}

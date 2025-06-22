"use client"

import { useState, useEffect } from "react"
import { format, subMonths } from "date-fns"

export interface MoneyFlowData {
  month: string
  income: number
  expenses: number
  savings: number
  investments: number
  netFlow: number
}

export function useChartData(months: number = 12) {
  const [data, setData] = useState<MoneyFlowData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchChartData = async () => {
      try {
        setLoading(true)
        setError(null)

        const response = await fetch(`/api/dashboard/chart?months=${months}`)
        const result = await response.json()

        if (!result.success) {
          throw new Error(result.error || "Failed to fetch chart data")
        }

        setData(result.data)
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred")
        // Fallback to sample data if API fails
        const generateSampleData = () => {
          const chartData: MoneyFlowData[] = []
          const now = new Date()

          for (let i = months - 1; i >= 0; i--) {
            const date = subMonths(now, i)
            const monthKey = format(date, "yyyy-MM")

            // Generate realistic sample data with some variation
            const baseIncome = 50000 + Math.random() * 20000
            const baseExpenses = 35000 + Math.random() * 15000
            const baseSavings = 8000 + Math.random() * 5000
            const baseInvestments = 5000 + Math.random() * 3000

            // Add some seasonal variation
            const seasonalFactor = 1 + 0.2 * Math.sin((i / 12) * 2 * Math.PI)

            const income = Math.round(baseIncome * seasonalFactor)
            const expenses = Math.round(baseExpenses * seasonalFactor)
            const savings = Math.round(
              baseSavings * (0.8 + Math.random() * 0.4)
            )
            const investments = Math.round(
              baseInvestments * (0.7 + Math.random() * 0.6)
            )
            const netFlow = income - expenses + savings + investments

            chartData.push({
              month: monthKey,
              income,
              expenses,
              savings,
              investments,
              netFlow,
            })
          }

          return chartData
        }

        setData(generateSampleData())
      } finally {
        setLoading(false)
      }
    }

    fetchChartData()
  }, [months])

  return { data, loading, error }
}

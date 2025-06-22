"use client"

import { useState, useEffect } from "react"

export type PeriodType = "week" | "month" | "quarter" | "year" | "custom"

export interface DashboardData {
  overview: {
    netWorth: number
    periodIncome: number
    periodExpenses: number
    periodSavings: number
    periodInvestments: number
    remainingBudget: number
    period: string
    customDate?: string
  }
  recentTransactions: any[]
  periodTransactions: any[]
}

export interface NetWorthData {
  currentNetWorth: number
  breakdown: {
    income: number
    expenses: number
    savings: number
    investments: number
    netWorth: number
  }
  historicalData: Array<{
    month: string
    netWorth: number
    income: number
    expenses: number
    savings: number
    investments: number
  }>
  growthRate: number
  monthsAnalyzed: number
}

export function useDashboard(period: PeriodType = "month", customDate?: Date) {
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      setError(null)

      const params = new URLSearchParams({ period })
      if (period === "custom" && customDate) {
        const dateString = customDate.toISOString().slice(0, 7) // YYYY-MM format
        params.append("customDate", dateString)
      }

      const response = await fetch(`/api/dashboard?${params.toString()}`)
      const result = await response.json()

      if (!result.success) {
        throw new Error(result.error || "Failed to fetch dashboard data")
      }

      setData(result.data)
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchDashboardData()
  }, [period, customDate])

  const refresh = () => {
    fetchDashboardData()
  }

  return {
    data,
    loading,
    error,
    refresh,
  }
}

export function useNetWorth(months: number = 12) {
  const [data, setData] = useState<NetWorthData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchNetWorthData = async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch(`/api/dashboard/net-worth?months=${months}`)
      const result = await response.json()

      if (!result.success) {
        throw new Error(result.error || "Failed to fetch net worth data")
      }

      setData(result.data)
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchNetWorthData()
  }, [months])

  const refresh = () => {
    fetchNetWorthData()
  }

  return {
    data,
    loading,
    error,
    refresh,
  }
}

// Hook for real-time updates (polling every 30 seconds)
export function useRealtimeDashboard(period: PeriodType = 'month', customDate?: Date, interval: number = 30000) {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      const params = new URLSearchParams({ period });
      if (period === 'custom' && customDate) {
        const dateString = customDate.toISOString().slice(0, 7); // YYYY-MM format
        params.append('customDate', dateString);
      }
      
      const response = await fetch(`/api/dashboard?${params.toString()}`);
      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to fetch dashboard data');
      }
      
      setData(result.data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    
    const intervalId = setInterval(fetchData, interval);
    
    return () => clearInterval(intervalId);
  }, [period, customDate, interval]);

  return {
    data,
    loading,
    error
  };
}

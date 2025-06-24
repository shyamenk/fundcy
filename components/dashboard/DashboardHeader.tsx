"use client"

import { useState } from "react"
import { PeriodSelector, PeriodType } from "./PeriodSelector"
import { useDashboard } from "@/hooks/useDashboard"

interface DashboardHeaderProps {
  className?: string
}

export function DashboardHeader({ className }: DashboardHeaderProps) {
  const [period, setPeriod] = useState<PeriodType>("month")
  const [customDate, setCustomDate] = useState<Date>(new Date())

  const { loading, error } = useDashboard(
    period,
    period === "custom" ? customDate : undefined
  )

  const handlePeriodChange = (newPeriod: PeriodType) => {
    setPeriod(newPeriod)
  }

  const handleDateChange = (date: Date) => {
    setCustomDate(date)
  }

  return (
    <div className={`flex items-center justify-between ${className}`}>
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          {loading
            ? "Loading..."
            : error
              ? "Error loading data"
              : "Your financial overview"}
        </p>
      </div>

      <div className="flex items-center gap-4">
        <PeriodSelector
          period={period}
          selectedDate={customDate}
          onPeriodChange={handlePeriodChange}
          onDateChange={handleDateChange}
        />
      </div>
    </div>
  )
}

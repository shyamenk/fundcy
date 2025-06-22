"use client"

import { useState } from "react"
import {
  CalendarIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from "@radix-ui/react-icons"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { format } from "date-fns"

export type PeriodType = "week" | "month" | "quarter" | "year" | "custom"

interface PeriodSelectorProps {
  period: PeriodType
  selectedDate?: Date
  onPeriodChange: (period: PeriodType) => void
  onDateChange?: (date: Date) => void
  className?: string
}

const periodOptions = [
  { value: "week", label: "This Week" },
  { value: "month", label: "This Month" },
  { value: "quarter", label: "This Quarter" },
  { value: "year", label: "This Year" },
  { value: "custom", label: "Custom Month" },
]

export function PeriodSelector({
  period,
  selectedDate,
  onPeriodChange,
  onDateChange,
  className,
}: PeriodSelectorProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [customDate, setCustomDate] = useState(selectedDate || new Date())

  const handlePreviousMonth = () => {
    if (period === "custom" && onDateChange) {
      const newDate = new Date(customDate)
      newDate.setMonth(newDate.getMonth() - 1)
      setCustomDate(newDate)
      onDateChange(newDate)
    }
  }

  const handleNextMonth = () => {
    if (period === "custom" && onDateChange) {
      const newDate = new Date(customDate)
      newDate.setMonth(newDate.getMonth() + 1)
      setCustomDate(newDate)
      onDateChange(newDate)
    }
  }

  const handleDateSelect = (date: Date | undefined) => {
    if (date && onDateChange) {
      setCustomDate(date)
      onDateChange(date)
      setIsOpen(false)
    }
  }

  const handlePeriodChange = (newPeriod: string) => {
    const periodType = newPeriod as PeriodType
    onPeriodChange(periodType)

    // If switching to custom, set the current date
    if (periodType === "custom" && onDateChange) {
      onDateChange(customDate)
    }
  }

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <Select value={period} onValueChange={handlePeriodChange}>
        <SelectTrigger className="w-[140px]">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {periodOptions.map(option => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {period === "custom" && (
        <>
          <Button
            variant="outline"
            size="icon"
            onClick={handlePreviousMonth}
            className="h-8 w-8"
          >
            <ChevronLeftIcon className="h-4 w-4" />
          </Button>

          <Popover open={isOpen} onOpenChange={setIsOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-[160px] justify-start text-left font-normal",
                  !customDate && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {customDate ? format(customDate, "MMM yyyy") : "Select month"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={customDate}
                onSelect={handleDateSelect}
                initialFocus
                disabled={date => date > new Date()}
              />
            </PopoverContent>
          </Popover>

          <Button
            variant="outline"
            size="icon"
            onClick={handleNextMonth}
            className="h-8 w-8"
            disabled={customDate >= new Date()}
          >
            <ChevronRightIcon className="h-4 w-4" />
          </Button>
        </>
      )}
    </div>
  )
}

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
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { format } from "date-fns"

interface MonthSelectorProps {
  selectedDate: Date
  onDateChange: (date: Date) => void
  className?: string
}

export function MonthSelector({
  selectedDate,
  onDateChange,
  className,
}: MonthSelectorProps) {
  const [isOpen, setIsOpen] = useState(false)

  const handlePreviousMonth = () => {
    const newDate = new Date(selectedDate)
    newDate.setMonth(newDate.getMonth() - 1)
    onDateChange(newDate)
  }

  const handleNextMonth = () => {
    const newDate = new Date(selectedDate)
    newDate.setMonth(newDate.getMonth() + 1)
    onDateChange(newDate)
  }

  const handleDateSelect = (date: Date | undefined) => {
    if (date) {
      onDateChange(date)
      setIsOpen(false)
    }
  }

  return (
    <div className={cn("flex items-center gap-2", className)}>
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
              "w-[200px] justify-start text-left font-normal",
              !selectedDate && "text-muted-foreground"
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {selectedDate ? format(selectedDate, "MMMM yyyy") : "Select month"}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            selected={selectedDate}
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
        disabled={selectedDate >= new Date()}
      >
        <ChevronRightIcon className="h-4 w-4" />
      </Button>
    </div>
  )
}

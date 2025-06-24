"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import {
  CalendarIcon,
  DownloadIcon,
  FileTextIcon,
  TableIcon,
} from "@radix-ui/react-icons"
import { cn } from "@/lib/utils"
import { format } from "date-fns"
import {
  exportToCSV,
  exportToPDF,
  ExportOptions,
} from "@/lib/export/transactions"
import { Transaction } from "@/types/transaction"
import { toast } from "sonner"

interface ExportControlsProps {
  transactions: Transaction[]
  className?: string
}

export function ExportControls({
  transactions,
  className,
}: ExportControlsProps) {
  const [selectedMonth, setSelectedMonth] = useState<Date>(new Date())
  const [isOpen, setIsOpen] = useState(false)
  const [includeCategories, setIncludeCategories] = useState(true)
  const [includeDescriptions, setIncludeDescriptions] = useState(true)
  const [isExporting, setIsExporting] = useState(false)

  const handleExport = async (exportFormat: "pdf" | "csv") => {
    if (!transactions.length) {
      toast.error("No transactions to export")
      return
    }

    setIsExporting(true)

    try {
      const monthString = format(selectedMonth, "yyyy-MM")
      const options: ExportOptions = {
        month: monthString,
        includeCategories,
        includeDescriptions,
      }

      if (exportFormat === "pdf") {
        exportToPDF(transactions, options)
        toast.success("PDF exported successfully!")
      } else {
        exportToCSV(transactions, options)
        toast.success("CSV exported successfully!")
      }
    } catch (error) {
      console.error("Export error:", error)
      toast.error("Failed to export transactions")
    } finally {
      setIsExporting(false)
      setIsOpen(false)
    }
  }

  const monthName = format(selectedMonth, "MMMM yyyy")

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button variant="outline" className="gap-2">
            <DownloadIcon className="h-4 w-4" />
            Export
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-80" align="end">
          <div className="space-y-4">
            <div>
              <h4 className="font-medium mb-2">Export Transactions</h4>
              <p className="text-sm text-muted-foreground">
                Export your transactions for {monthName}
              </p>
            </div>

            {/* Month Selector */}
            <div className="space-y-2">
              <Label>Select Month</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !selectedMonth && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {selectedMonth
                      ? format(selectedMonth, "MMMM yyyy")
                      : "Select month"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={selectedMonth}
                    onSelect={date => date && setSelectedMonth(date)}
                    initialFocus
                    disabled={date => date > new Date()}
                  />
                </PopoverContent>
              </Popover>
            </div>

            {/* Export Options */}
            <div className="space-y-3">
              <Label>Export Options</Label>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="include-categories"
                  checked={includeCategories}
                  onCheckedChange={checked =>
                    setIncludeCategories(checked === true)
                  }
                />
                <Label htmlFor="include-categories" className="text-sm">
                  Include categories
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="include-descriptions"
                  checked={includeDescriptions}
                  onCheckedChange={checked =>
                    setIncludeDescriptions(checked === true)
                  }
                />
                <Label htmlFor="include-descriptions" className="text-sm">
                  Include descriptions
                </Label>
              </div>
            </div>

            {/* Export Buttons */}
            <div className="flex gap-2 pt-2">
              <Button
                onClick={() => handleExport("pdf")}
                disabled={isExporting}
                className="flex-1 gap-2"
                variant="outline"
              >
                <FileTextIcon className="h-4 w-4" />
                {isExporting ? "Exporting..." : "PDF"}
              </Button>
              <Button
                onClick={() => handleExport("csv")}
                disabled={isExporting}
                className="flex-1 gap-2"
                variant="outline"
              >
                <TableIcon className="h-4 w-4" />
                {isExporting ? "Exporting..." : "CSV"}
              </Button>
            </div>

            {/* Summary */}
            <div className="text-xs text-muted-foreground pt-2 border-t">
              <p>
                Transactions in {monthName}:{" "}
                {
                  transactions.filter(t => {
                    const transactionDate = new Date(t.date)
                    return (
                      transactionDate.getFullYear() ===
                        selectedMonth.getFullYear() &&
                      transactionDate.getMonth() === selectedMonth.getMonth()
                    )
                  }).length
                }
              </p>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  )
}

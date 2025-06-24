import jsPDF from "jspdf"
import autoTable from "jspdf-autotable"
import { formatINR } from "@/lib/utils"
import { Transaction } from "@/types/transaction"
import { format } from "date-fns"

export interface ExportOptions {
  month: string // YYYY-MM format
  includeCategories?: boolean
  includeDescriptions?: boolean
}

/**
 * Export transactions to CSV format
 */
export function exportToCSV(
  transactions: Transaction[],
  options: ExportOptions
): void {
  const { month, includeDescriptions = true } = options

  // Filter transactions for the specified month
  const monthTransactions = transactions.filter(t => {
    const transactionDate = new Date(t.date)
    const [year, monthNum] = month.split("-").map(Number)
    return (
      transactionDate.getFullYear() === year &&
      transactionDate.getMonth() === monthNum - 1
    )
  })

  // Prepare CSV headers
  const headers = ["Date", "Type", "Amount", "Category"]
  if (includeDescriptions) headers.push("Description")
  headers.push("Created At")

  // Prepare CSV data
  const csvData = monthTransactions.map(t => {
    const row = [
      format(new Date(t.date), "dd/MM/yyyy"),
      t.type.toUpperCase(),
      formatINR(Number(t.amount)),
      t.category?.name || "Uncategorized",
    ]

    if (includeDescriptions) {
      row.push(t.description)
    }

    row.push(format(new Date(t.createdAt || ""), "dd/MM/yyyy HH:mm"))

    return row
  })

  // Calculate totals
  const income = monthTransactions
    .filter(t => t.type === "income")
    .reduce((sum, t) => sum + Number(t.amount), 0)

  const expenses = monthTransactions
    .filter(t => t.type === "expense")
    .reduce((sum, t) => sum + Number(t.amount), 0)

  const savings = monthTransactions
    .filter(t => t.type === "savings")
    .reduce((sum, t) => sum + Number(t.amount), 0)

  const investments = monthTransactions
    .filter(t => t.type === "investment")
    .reduce((sum, t) => sum + Number(t.amount), 0)

  // Add summary rows
  csvData.push([]) // Empty row
  csvData.push(["SUMMARY", "", "", ""])
  csvData.push(["Total Income", "", formatINR(income), ""])
  csvData.push(["Total Expenses", "", formatINR(expenses), ""])
  csvData.push(["Total Savings", "", formatINR(savings), ""])
  csvData.push(["Total Investments", "", formatINR(investments), ""])
  csvData.push([
    "Net",
    "",
    formatINR(income - expenses + savings + investments),
    "",
  ])

  // Convert to CSV string
  const csvContent = [
    headers.join(","),
    ...csvData.map(row => row.map(cell => `"${cell}"`).join(",")),
  ].join("\n")

  // Create and download file
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
  const link = document.createElement("a")
  const url = URL.createObjectURL(blob)
  link.setAttribute("href", url)
  link.setAttribute("download", `transactions-${month}.csv`)
  link.style.visibility = "hidden"
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

/**
 * Export transactions to PDF format
 */
export function exportToPDF(
  transactions: Transaction[],
  options: ExportOptions
): void {
  const {
    month,
    includeCategories = true,
    includeDescriptions = true,
  } = options

  // Filter transactions for the specified month
  const monthTransactions = transactions.filter(t => {
    const transactionDate = new Date(t.date)
    const [year, monthNum] = month.split("-").map(Number)
    return (
      transactionDate.getFullYear() === year &&
      transactionDate.getMonth() === monthNum - 1
    )
  })

  // Create PDF document
  const doc = new jsPDF()
  const pageWidth = doc.internal.pageSize.getWidth()

  // Add title
  const monthName = format(new Date(month + "-01"), "MMMM yyyy")
  doc.setFontSize(20)
  doc.setFont("helvetica", "bold")
  doc.text("Transaction Report", pageWidth / 2, 20, { align: "center" })

  doc.setFontSize(14)
  doc.setFont("helvetica", "normal")
  doc.text(monthName, pageWidth / 2, 30, { align: "center" })

  // Add summary section
  const income = monthTransactions
    .filter(t => t.type === "income")
    .reduce((sum, t) => sum + Number(t.amount), 0)

  const expenses = monthTransactions
    .filter(t => t.type === "expense")
    .reduce((sum, t) => sum + Number(t.amount), 0)

  const savings = monthTransactions
    .filter(t => t.type === "savings")
    .reduce((sum, t) => sum + Number(t.amount), 0)

  const investments = monthTransactions
    .filter(t => t.type === "investment")
    .reduce((sum, t) => sum + Number(t.amount), 0)

  const netAmount = income - expenses + savings + investments

  // Summary table
  const summaryData = [
    ["Total Income", formatINR(income)],
    ["Total Expenses", formatINR(expenses)],
    ["Total Savings", formatINR(savings)],
    ["Total Investments", formatINR(investments)],
    ["Net Amount", formatINR(netAmount)],
  ]

  autoTable(doc, {
    head: [["Summary", "Amount"]],
    body: summaryData,
    startY: 45,
    theme: "grid",
    headStyles: { fillColor: [66, 139, 202] },
    styles: { fontSize: 10 },
  })

  // Prepare transaction data
  const tableHeaders = ["Date", "Type", "Amount", "Category"]
  if (includeDescriptions) tableHeaders.push("Description")

  const tableData = monthTransactions.map(t => {
    const row = [
      format(new Date(t.date), "dd/MM/yyyy"),
      t.type.toUpperCase(),
      formatINR(Number(t.amount)),
      t.category?.name || "Uncategorized",
    ]

    if (includeDescriptions) {
      row.push(
        t.description.length > 30
          ? t.description.substring(0, 30) + "..."
          : t.description
      )
    }

    return row
  })

  // Add transactions table
  autoTable(doc, {
    head: [tableHeaders],
    body: tableData,
    startY: 90,
    theme: "grid",
    headStyles: { fillColor: [66, 139, 202] },
    styles: { fontSize: 8 },
    columnStyles: {
      0: { cellWidth: 25 }, // Date
      1: { cellWidth: 20 }, // Type
      2: { cellWidth: 30 }, // Amount
      3: { cellWidth: 35 }, // Category
      4: { cellWidth: 60 }, // Description (if included)
    },
    didDrawPage: function (data) {
      // Add page number
      const pageCount = doc.getNumberOfPages()
      doc.setFontSize(8)
      doc.text(
        `Page ${data.pageNumber} of ${pageCount}`,
        pageWidth - 20,
        doc.internal.pageSize.getHeight() - 10
      )
    },
  })

  // Save PDF
  doc.save(`transactions-${month}.pdf`)
}

/**
 * Get monthly transaction summary for export
 */
export function getMonthlySummary(transactions: Transaction[], month: string) {
  const monthTransactions = transactions.filter(t => {
    const transactionDate = new Date(t.date)
    const [year, monthNum] = month.split("-").map(Number)
    return (
      transactionDate.getFullYear() === year &&
      transactionDate.getMonth() === monthNum - 1
    )
  })

  const income = monthTransactions
    .filter(t => t.type === "income")
    .reduce((sum, t) => sum + Number(t.amount), 0)

  const expenses = monthTransactions
    .filter(t => t.type === "expense")
    .reduce((sum, t) => sum + Number(t.amount), 0)

  const savings = monthTransactions
    .filter(t => t.type === "savings")
    .reduce((sum, t) => sum + Number(t.amount), 0)

  const investments = monthTransactions
    .filter(t => t.type === "investment")
    .reduce((sum, t) => sum + Number(t.amount), 0)

  return {
    totalTransactions: monthTransactions.length,
    income,
    expenses,
    savings,
    investments,
    netAmount: income - expenses + savings + investments,
    monthName: format(new Date(month + "-01"), "MMMM yyyy"),
  }
}

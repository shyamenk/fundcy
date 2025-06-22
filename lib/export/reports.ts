import jsPDF from "jspdf"
import autoTable from "jspdf-autotable"
import { formatINR } from "@/lib/utils"
import { format } from "date-fns"

export interface AnnualReportData {
  year: number
  totals: {
    income: number
    expenses: number
    savings: number
    investments: number
  }
  netWorthChange: number
  categoryBreakdown: Array<{
    category: string
    amount: number
    count: number
    percentage: number
  }>
  monthlyBreakdown: Array<{
    month: string
    income: number
    expenses: number
    savings: number
    investments: number
    netFlow: number
  }>
  metrics: {
    averageMonthlyIncome: number
    averageMonthlyExpenses: number
    savingsRate: number
    expenseRatio: number
    totalTransactions: number
  }
}

export interface MonthlyReportData {
  year: number
  month: number
  totals: {
    income: number
    expenses: number
    savings: number
    investments: number
  }
  netFlow: number
  categoryBreakdown: Array<{
    category: string
    amount: number
    count: number
    percentage: number
  }>
  weeklyBreakdown: Array<{
    week: string
    income: number
    expenses: number
    savings: number
    investments: number
  }>
  dailyTrends: Array<{
    date: string
    income: number
    expenses: number
    netFlow: number
  }>
  metrics: {
    averageDailyIncome: number
    averageDailyExpenses: number
    totalTransactions: number
    mostExpensiveDay: string
    mostExpensiveCategory: string
  }
}

export interface CategoriesReportData {
  period: string
  totalExpenses: number
  totalIncome: number
  categoryBreakdown: Array<{
    category: string
    amount: number
    count: number
    percentage: number
    monthlyTrend: Array<{
      month: string
      amount: number
    }>
  }>
  topCategories: Array<{
    category: string
    amount: number
    percentage: number
  }>
  insights: {
    highestSpendingMonth: string
    lowestSpendingMonth: string
    averageMonthlySpending: number
    spendingGrowth: number
  }
}

export interface GoalsReportData {
  period: string
  totalGoals: number
  completedGoals: number
  activeGoals: number
  totalTargetAmount: number
  totalCurrentAmount: number
  goals: Array<{
    id: string
    title: string
    targetAmount: number
    currentAmount: number
    progress: number
    status: string
    targetDate: string | null
    category: string | null
  }>
  categoryBreakdown: Array<{
    category: string
    count: number
    totalTarget: number
    totalCurrent: number
    averageProgress: number
  }>
  insights: {
    completionRate: number
    averageProgress: number
    totalContributed: number
    projectedCompletion: string
  }
}

/**
 * Export annual report to PDF
 */
export function exportAnnualReportToPDF(data: AnnualReportData): void {
  const doc = new jsPDF()
  const pageWidth = doc.internal.pageSize.getWidth()
  const pageHeight = doc.internal.pageSize.getHeight()

  // Title
  doc.setFontSize(24)
  doc.setFont("helvetica", "bold")
  doc.text("Annual Financial Report", pageWidth / 2, 20, { align: "center" })

  doc.setFontSize(16)
  doc.setFont("helvetica", "normal")
  doc.text(data.year.toString(), pageWidth / 2, 30, { align: "center" })

  // Summary section
  doc.setFontSize(14)
  doc.setFont("helvetica", "bold")
  doc.text("Financial Summary", 20, 50)

  const summaryData = [
    ["Total Income", formatINR(data.totals.income)],
    ["Total Expenses", formatINR(data.totals.expenses)],
    ["Total Savings", formatINR(data.totals.savings)],
    ["Total Investments", formatINR(data.totals.investments)],
    ["Net Worth Change", formatINR(data.netWorthChange)],
  ]

  autoTable(doc, {
    head: [["Category", "Amount"]],
    body: summaryData,
    startY: 60,
    theme: "grid",
    headStyles: { fillColor: [66, 139, 202] },
    styles: { fontSize: 10 },
  })

  // Metrics section
  doc.setFontSize(14)
  doc.setFont("helvetica", "bold")
  doc.text("Key Metrics", 20, 120)

  const metricsData = [
    ["Average Monthly Income", formatINR(data.metrics.averageMonthlyIncome)],
    [
      "Average Monthly Expenses",
      formatINR(data.metrics.averageMonthlyExpenses),
    ],
    ["Savings Rate", `${data.metrics.savingsRate.toFixed(1)}%`],
    ["Expense Ratio", `${data.metrics.expenseRatio.toFixed(1)}%`],
    ["Total Transactions", data.metrics.totalTransactions.toString()],
  ]

  autoTable(doc, {
    head: [["Metric", "Value"]],
    body: metricsData,
    startY: 130,
    theme: "grid",
    headStyles: { fillColor: [66, 139, 202] },
    styles: { fontSize: 10 },
  })

  // Monthly breakdown
  doc.setFontSize(14)
  doc.setFont("helvetica", "bold")
  doc.text("Monthly Breakdown", 20, 180)

  const monthlyData = data.monthlyBreakdown.map(item => [
    format(new Date(item.month + "-01"), "MMM"),
    formatINR(item.income),
    formatINR(item.expenses),
    formatINR(item.savings),
    formatINR(item.investments),
    formatINR(item.netFlow),
  ])

  autoTable(doc, {
    head: [
      ["Month", "Income", "Expenses", "Savings", "Investments", "Net Flow"],
    ],
    body: monthlyData,
    startY: 190,
    theme: "grid",
    headStyles: { fillColor: [66, 139, 202] },
    styles: { fontSize: 8 },
    columnStyles: {
      0: { cellWidth: 20 },
      1: { cellWidth: 25 },
      2: { cellWidth: 25 },
      3: { cellWidth: 25 },
      4: { cellWidth: 25 },
      5: { cellWidth: 25 },
    },
  })

  // Category breakdown
  if (data.categoryBreakdown.length > 0) {
    const categoryData = data.categoryBreakdown.map(item => [
      item.category,
      formatINR(item.amount),
      item.count.toString(),
      `${item.percentage.toFixed(1)}%`,
    ])

    autoTable(doc, {
      head: [["Category", "Amount", "Count", "Percentage"]],
      body: categoryData,
      startY: 280,
      theme: "grid",
      headStyles: { fillColor: [66, 139, 202] },
      styles: { fontSize: 8 },
    })
  }

  // Footer
  doc.setFontSize(8)
  doc.text(
    `Generated on ${format(new Date(), "dd/MM/yyyy HH:mm")}`,
    pageWidth - 20,
    pageHeight - 10,
    { align: "right" }
  )

  doc.save(`annual-report-${data.year}.pdf`)
}

/**
 * Export annual report to CSV
 */
export function exportAnnualReportToCSV(data: AnnualReportData): void {
  const csvContent = []

  // Header
  csvContent.push("Annual Financial Report")
  csvContent.push(`Year: ${data.year}`)
  csvContent.push("")

  // Summary
  csvContent.push("Financial Summary")
  csvContent.push("Category,Amount")
  csvContent.push(`Total Income,${formatINR(data.totals.income)}`)
  csvContent.push(`Total Expenses,${formatINR(data.totals.expenses)}`)
  csvContent.push(`Total Savings,${formatINR(data.totals.savings)}`)
  csvContent.push(`Total Investments,${formatINR(data.totals.investments)}`)
  csvContent.push(`Net Worth Change,${formatINR(data.netWorthChange)}`)
  csvContent.push("")

  // Metrics
  csvContent.push("Key Metrics")
  csvContent.push("Metric,Value")
  csvContent.push(
    `Average Monthly Income,${formatINR(data.metrics.averageMonthlyIncome)}`
  )
  csvContent.push(
    `Average Monthly Expenses,${formatINR(data.metrics.averageMonthlyExpenses)}`
  )
  csvContent.push(`Savings Rate,${data.metrics.savingsRate.toFixed(1)}%`)
  csvContent.push(`Expense Ratio,${data.metrics.expenseRatio.toFixed(1)}%`)
  csvContent.push(`Total Transactions,${data.metrics.totalTransactions}`)
  csvContent.push("")

  // Monthly breakdown
  csvContent.push("Monthly Breakdown")
  csvContent.push("Month,Income,Expenses,Savings,Investments,Net Flow")
  data.monthlyBreakdown.forEach(item => {
    csvContent.push(
      `${format(new Date(item.month + "-01"), "MMM")},${formatINR(item.income)},${formatINR(item.expenses)},${formatINR(item.savings)},${formatINR(item.investments)},${formatINR(item.netFlow)}`
    )
  })
  csvContent.push("")

  // Category breakdown
  if (data.categoryBreakdown.length > 0) {
    csvContent.push("Category Breakdown")
    csvContent.push("Category,Amount,Count,Percentage")
    data.categoryBreakdown.forEach(item => {
      csvContent.push(
        `${item.category},${formatINR(item.amount)},${item.count},${item.percentage.toFixed(1)}%`
      )
    })
  }

  // Create and download file
  const blob = new Blob([csvContent.join("\n")], {
    type: "text/csv;charset=utf-8;",
  })
  const link = document.createElement("a")
  const url = URL.createObjectURL(blob)
  link.setAttribute("href", url)
  link.setAttribute("download", `annual-report-${data.year}.csv`)
  link.style.visibility = "hidden"
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

/**
 * Export monthly report to PDF
 */
export function exportMonthlyReportToPDF(data: MonthlyReportData): void {
  const doc = new jsPDF()
  const pageWidth = doc.internal.pageSize.getWidth()
  const pageHeight = doc.internal.pageSize.getHeight()

  // Title
  doc.setFontSize(24)
  doc.setFont("helvetica", "bold")
  doc.text("Monthly Financial Report", pageWidth / 2, 20, { align: "center" })

  doc.setFontSize(16)
  doc.setFont("helvetica", "normal")
  const monthName = format(new Date(data.year, data.month - 1, 1), "MMMM yyyy")
  doc.text(monthName, pageWidth / 2, 30, { align: "center" })

  // Summary section
  doc.setFontSize(14)
  doc.setFont("helvetica", "bold")
  doc.text("Financial Summary", 20, 50)

  const summaryData = [
    ["Total Income", formatINR(data.totals.income)],
    ["Total Expenses", formatINR(data.totals.expenses)],
    ["Total Savings", formatINR(data.totals.savings)],
    ["Total Investments", formatINR(data.totals.investments)],
    ["Net Flow", formatINR(data.netFlow)],
  ]

  autoTable(doc, {
    head: [["Category", "Amount"]],
    body: summaryData,
    startY: 60,
    theme: "grid",
    headStyles: { fillColor: [66, 139, 202] },
    styles: { fontSize: 10 },
  })

  // Metrics section
  doc.setFontSize(14)
  doc.setFont("helvetica", "bold")
  doc.text("Key Metrics", 20, 120)

  const metricsData = [
    ["Average Daily Income", formatINR(data.metrics.averageDailyIncome)],
    ["Average Daily Expenses", formatINR(data.metrics.averageDailyExpenses)],
    ["Total Transactions", data.metrics.totalTransactions.toString()],
    ["Most Expensive Day", data.metrics.mostExpensiveDay],
    ["Most Expensive Category", data.metrics.mostExpensiveCategory],
  ]

  autoTable(doc, {
    head: [["Metric", "Value"]],
    body: metricsData,
    startY: 130,
    theme: "grid",
    headStyles: { fillColor: [66, 139, 202] },
    styles: { fontSize: 10 },
  })

  // Weekly breakdown
  doc.setFontSize(14)
  doc.setFont("helvetica", "bold")
  doc.text("Weekly Breakdown", 20, 180)

  const weeklyData = data.weeklyBreakdown.map(item => [
    format(new Date(item.week), "MMM dd"),
    formatINR(item.income),
    formatINR(item.expenses),
    formatINR(item.savings),
    formatINR(item.investments),
  ])

  autoTable(doc, {
    head: [["Week", "Income", "Expenses", "Savings", "Investments"]],
    body: weeklyData,
    startY: 190,
    theme: "grid",
    headStyles: { fillColor: [66, 139, 202] },
    styles: { fontSize: 8 },
  })

  // Category breakdown
  if (data.categoryBreakdown.length > 0) {
    const categoryData = data.categoryBreakdown.map(item => [
      item.category,
      formatINR(item.amount),
      item.count.toString(),
      `${item.percentage.toFixed(1)}%`,
    ])

    autoTable(doc, {
      head: [["Category", "Amount", "Count", "Percentage"]],
      body: categoryData,
      startY: 250,
      theme: "grid",
      headStyles: { fillColor: [66, 139, 202] },
      styles: { fontSize: 8 },
    })
  }

  // Footer
  doc.setFontSize(8)
  doc.text(
    `Generated on ${format(new Date(), "dd/MM/yyyy HH:mm")}`,
    pageWidth - 20,
    pageHeight - 10,
    { align: "right" }
  )

  doc.save(
    `monthly-report-${data.year}-${data.month.toString().padStart(2, "0")}.pdf`
  )
}

/**
 * Export monthly report to CSV
 */
export function exportMonthlyReportToCSV(data: MonthlyReportData): void {
  const csvContent = []

  // Header
  csvContent.push("Monthly Financial Report")
  const monthName = format(new Date(data.year, data.month - 1, 1), "MMMM yyyy")
  csvContent.push(`Period: ${monthName}`)
  csvContent.push("")

  // Summary
  csvContent.push("Financial Summary")
  csvContent.push("Category,Amount")
  csvContent.push(`Total Income,${formatINR(data.totals.income)}`)
  csvContent.push(`Total Expenses,${formatINR(data.totals.expenses)}`)
  csvContent.push(`Total Savings,${formatINR(data.totals.savings)}`)
  csvContent.push(`Total Investments,${formatINR(data.totals.investments)}`)
  csvContent.push(`Net Flow,${formatINR(data.netFlow)}`)
  csvContent.push("")

  // Metrics
  csvContent.push("Key Metrics")
  csvContent.push("Metric,Value")
  csvContent.push(
    `Average Daily Income,${formatINR(data.metrics.averageDailyIncome)}`
  )
  csvContent.push(
    `Average Daily Expenses,${formatINR(data.metrics.averageDailyExpenses)}`
  )
  csvContent.push(`Total Transactions,${data.metrics.totalTransactions}`)
  csvContent.push(`Most Expensive Day,${data.metrics.mostExpensiveDay}`)
  csvContent.push(
    `Most Expensive Category,${data.metrics.mostExpensiveCategory}`
  )
  csvContent.push("")

  // Weekly breakdown
  csvContent.push("Weekly Breakdown")
  csvContent.push("Week,Income,Expenses,Savings,Investments")
  data.weeklyBreakdown.forEach(item => {
    csvContent.push(
      `${format(new Date(item.week), "MMM dd")},${formatINR(item.income)},${formatINR(item.expenses)},${formatINR(item.savings)},${formatINR(item.investments)}`
    )
  })
  csvContent.push("")

  // Category breakdown
  if (data.categoryBreakdown.length > 0) {
    csvContent.push("Category Breakdown")
    csvContent.push("Category,Amount,Count,Percentage")
    data.categoryBreakdown.forEach(item => {
      csvContent.push(
        `${item.category},${formatINR(item.amount)},${item.count},${item.percentage.toFixed(1)}%`
      )
    })
  }

  // Create and download file
  const blob = new Blob([csvContent.join("\n")], {
    type: "text/csv;charset=utf-8;",
  })
  const link = document.createElement("a")
  const url = URL.createObjectURL(blob)
  link.setAttribute("href", url)
  link.setAttribute(
    "download",
    `monthly-report-${data.year}-${data.month.toString().padStart(2, "0")}.csv`
  )
  link.style.visibility = "hidden"
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

/**
 * Export categories report to PDF
 */
export function exportCategoriesReportToPDF(data: CategoriesReportData): void {
  const doc = new jsPDF()
  const pageWidth = doc.internal.pageSize.getWidth()
  const pageHeight = doc.internal.pageSize.getHeight()

  // Title
  doc.setFontSize(24)
  doc.setFont("helvetica", "bold")
  doc.text("Category Analysis Report", pageWidth / 2, 20, { align: "center" })

  doc.setFontSize(16)
  doc.setFont("helvetica", "normal")
  doc.text(data.period, pageWidth / 2, 30, { align: "center" })

  // Summary section
  doc.setFontSize(14)
  doc.setFont("helvetica", "bold")
  doc.text("Financial Summary", 20, 50)

  const summaryData = [
    ["Total Expenses", formatINR(data.totalExpenses)],
    ["Total Income", formatINR(data.totalIncome)],
    ["Net Spending", formatINR(data.totalExpenses - data.totalIncome)],
  ]

  autoTable(doc, {
    head: [["Category", "Amount"]],
    body: summaryData,
    startY: 60,
    theme: "grid",
    headStyles: { fillColor: [66, 139, 202] },
    styles: { fontSize: 10 },
  })

  // Top categories
  doc.setFontSize(14)
  doc.setFont("helvetica", "bold")
  doc.text("Top Spending Categories", 20, 100)

  const topCategoriesData = data.topCategories.map(item => [
    item.category,
    formatINR(item.amount),
    `${item.percentage.toFixed(1)}%`,
  ])

  autoTable(doc, {
    head: [["Category", "Amount", "Percentage"]],
    body: topCategoriesData,
    startY: 110,
    theme: "grid",
    headStyles: { fillColor: [66, 139, 202] },
    styles: { fontSize: 10 },
  })

  // Insights
  doc.setFontSize(14)
  doc.setFont("helvetica", "bold")
  doc.text("Key Insights", 20, 160)

  const insightsData = [
    ["Highest Spending Month", data.insights.highestSpendingMonth],
    ["Lowest Spending Month", data.insights.lowestSpendingMonth],
    [
      "Average Monthly Spending",
      formatINR(data.insights.averageMonthlySpending),
    ],
    ["Spending Growth", `${data.insights.spendingGrowth.toFixed(1)}%`],
  ]

  autoTable(doc, {
    head: [["Insight", "Value"]],
    body: insightsData,
    startY: 170,
    theme: "grid",
    headStyles: { fillColor: [66, 139, 202] },
    styles: { fontSize: 10 },
  })

  // Category breakdown
  if (data.categoryBreakdown.length > 0) {
    const categoryData = data.categoryBreakdown.map(item => [
      item.category,
      formatINR(item.amount),
      item.count.toString(),
      `${item.percentage.toFixed(1)}%`,
    ])

    autoTable(doc, {
      head: [["Category", "Amount", "Count", "Percentage"]],
      body: categoryData,
      startY: 230,
      theme: "grid",
      headStyles: { fillColor: [66, 139, 202] },
      styles: { fontSize: 8 },
    })
  }

  // Footer
  doc.setFontSize(8)
  doc.text(
    `Generated on ${format(new Date(), "dd/MM/yyyy HH:mm")}`,
    pageWidth - 20,
    pageHeight - 10,
    { align: "right" }
  )

  doc.save(
    `categories-report-${data.period.toLowerCase().replace(/\s+/g, "-")}.pdf`
  )
}

/**
 * Export categories report to CSV
 */
export function exportCategoriesReportToCSV(data: CategoriesReportData): void {
  const csvContent = []

  // Header
  csvContent.push("Category Analysis Report")
  csvContent.push(`Period: ${data.period}`)
  csvContent.push("")

  // Summary
  csvContent.push("Financial Summary")
  csvContent.push("Category,Amount")
  csvContent.push(`Total Expenses,${formatINR(data.totalExpenses)}`)
  csvContent.push(`Total Income,${formatINR(data.totalIncome)}`)
  csvContent.push(
    `Net Spending,${formatINR(data.totalExpenses - data.totalIncome)}`
  )
  csvContent.push("")

  // Top categories
  csvContent.push("Top Spending Categories")
  csvContent.push("Category,Amount,Percentage")
  data.topCategories.forEach(item => {
    csvContent.push(
      `${item.category},${formatINR(item.amount)},${item.percentage.toFixed(1)}%`
    )
  })
  csvContent.push("")

  // Insights
  csvContent.push("Key Insights")
  csvContent.push("Insight,Value")
  csvContent.push(
    `Highest Spending Month,${data.insights.highestSpendingMonth}`
  )
  csvContent.push(`Lowest Spending Month,${data.insights.lowestSpendingMonth}`)
  csvContent.push(
    `Average Monthly Spending,${formatINR(data.insights.averageMonthlySpending)}`
  )
  csvContent.push(`Spending Growth,${data.insights.spendingGrowth.toFixed(1)}%`)
  csvContent.push("")

  // Category breakdown
  if (data.categoryBreakdown.length > 0) {
    csvContent.push("Category Breakdown")
    csvContent.push("Category,Amount,Count,Percentage")
    data.categoryBreakdown.forEach(item => {
      csvContent.push(
        `${item.category},${formatINR(item.amount)},${item.count},${item.percentage.toFixed(1)}%`
      )
    })
  }

  // Create and download file
  const blob = new Blob([csvContent.join("\n")], {
    type: "text/csv;charset=utf-8;",
  })
  const link = document.createElement("a")
  const url = URL.createObjectURL(blob)
  link.setAttribute("href", url)
  link.setAttribute(
    "download",
    `categories-report-${data.period.toLowerCase().replace(/\s+/g, "-")}.csv`
  )
  link.style.visibility = "hidden"
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

/**
 * Export goals report to PDF
 */
export function exportGoalsReportToPDF(data: GoalsReportData): void {
  const doc = new jsPDF()
  const pageWidth = doc.internal.pageSize.getWidth()
  const pageHeight = doc.internal.pageSize.getHeight()

  // Title
  doc.setFontSize(24)
  doc.setFont("helvetica", "bold")
  doc.text("Goals Progress Report", pageWidth / 2, 20, { align: "center" })

  doc.setFontSize(16)
  doc.setFont("helvetica", "normal")
  doc.text(data.period, pageWidth / 2, 30, { align: "center" })

  // Summary section
  doc.setFontSize(14)
  doc.setFont("helvetica", "bold")
  doc.text("Goals Summary", 20, 50)

  const summaryData = [
    ["Total Goals", data.totalGoals.toString()],
    ["Completed Goals", data.completedGoals.toString()],
    ["Active Goals", data.activeGoals.toString()],
    ["Total Target Amount", formatINR(data.totalTargetAmount)],
    ["Total Current Amount", formatINR(data.totalCurrentAmount)],
  ]

  autoTable(doc, {
    head: [["Metric", "Value"]],
    body: summaryData,
    startY: 60,
    theme: "grid",
    headStyles: { fillColor: [66, 139, 202] },
    styles: { fontSize: 10 },
  })

  // Insights
  doc.setFontSize(14)
  doc.setFont("helvetica", "bold")
  doc.text("Key Insights", 20, 120)

  const insightsData = [
    ["Completion Rate", `${data.insights.completionRate.toFixed(1)}%`],
    ["Average Progress", `${data.insights.averageProgress.toFixed(1)}%`],
    ["Total Contributed", formatINR(data.insights.totalContributed)],
    ["Projected Completion", data.insights.projectedCompletion],
  ]

  autoTable(doc, {
    head: [["Insight", "Value"]],
    body: insightsData,
    startY: 130,
    theme: "grid",
    headStyles: { fillColor: [66, 139, 202] },
    styles: { fontSize: 10 },
  })

  // Goals list
  doc.setFontSize(14)
  doc.setFont("helvetica", "bold")
  doc.text("Goals Details", 20, 180)

  const goalsData = data.goals.map(item => [
    item.title,
    formatINR(item.targetAmount),
    formatINR(item.currentAmount),
    `${item.progress.toFixed(1)}%`,
    item.status,
    item.targetDate
      ? format(new Date(item.targetDate), "dd/MM/yyyy")
      : "No date",
  ])

  autoTable(doc, {
    head: [["Goal", "Target", "Current", "Progress", "Status", "Target Date"]],
    body: goalsData,
    startY: 190,
    theme: "grid",
    headStyles: { fillColor: [66, 139, 202] },
    styles: { fontSize: 8 },
    columnStyles: {
      0: { cellWidth: 40 },
      1: { cellWidth: 25 },
      2: { cellWidth: 25 },
      3: { cellWidth: 20 },
      4: { cellWidth: 20 },
      5: { cellWidth: 25 },
    },
  })

  // Category breakdown
  if (data.categoryBreakdown.length > 0) {
    const categoryData = data.categoryBreakdown.map(item => [
      item.category,
      item.count.toString(),
      formatINR(item.totalTarget),
      formatINR(item.totalCurrent),
      `${item.averageProgress.toFixed(1)}%`,
    ])

    autoTable(doc, {
      head: [
        ["Category", "Count", "Total Target", "Total Current", "Avg Progress"],
      ],
      body: categoryData,
      startY: 280,
      theme: "grid",
      headStyles: { fillColor: [66, 139, 202] },
      styles: { fontSize: 8 },
    })
  }

  // Footer
  doc.setFontSize(8)
  doc.text(
    `Generated on ${format(new Date(), "dd/MM/yyyy HH:mm")}`,
    pageWidth - 20,
    pageHeight - 10,
    { align: "right" }
  )

  doc.save(`goals-report-${data.period.toLowerCase().replace(/\s+/g, "-")}.pdf`)
}

/**
 * Export goals report to CSV
 */
export function exportGoalsReportToCSV(data: GoalsReportData): void {
  const csvContent = []

  // Header
  csvContent.push("Goals Progress Report")
  csvContent.push(`Period: ${data.period}`)
  csvContent.push("")

  // Summary
  csvContent.push("Goals Summary")
  csvContent.push("Metric,Value")
  csvContent.push(`Total Goals,${data.totalGoals}`)
  csvContent.push(`Completed Goals,${data.completedGoals}`)
  csvContent.push(`Active Goals,${data.activeGoals}`)
  csvContent.push(`Total Target Amount,${formatINR(data.totalTargetAmount)}`)
  csvContent.push(`Total Current Amount,${formatINR(data.totalCurrentAmount)}`)
  csvContent.push("")

  // Insights
  csvContent.push("Key Insights")
  csvContent.push("Insight,Value")
  csvContent.push(`Completion Rate,${data.insights.completionRate.toFixed(1)}%`)
  csvContent.push(
    `Average Progress,${data.insights.averageProgress.toFixed(1)}%`
  )
  csvContent.push(
    `Total Contributed,${formatINR(data.insights.totalContributed)}`
  )
  csvContent.push(`Projected Completion,${data.insights.projectedCompletion}`)
  csvContent.push("")

  // Goals list
  csvContent.push("Goals Details")
  csvContent.push("Goal,Target,Current,Progress,Status,Target Date")
  data.goals.forEach(item => {
    csvContent.push(
      `${item.title},${formatINR(item.targetAmount)},${formatINR(item.currentAmount)},${item.progress.toFixed(1)}%,${item.status},${item.targetDate ? format(new Date(item.targetDate), "dd/MM/yyyy") : "No date"}`
    )
  })
  csvContent.push("")

  // Category breakdown
  if (data.categoryBreakdown.length > 0) {
    csvContent.push("Category Breakdown")
    csvContent.push("Category,Count,Total Target,Total Current,Avg Progress")
    data.categoryBreakdown.forEach(item => {
      csvContent.push(
        `${item.category},${item.count},${formatINR(item.totalTarget)},${formatINR(item.totalCurrent)},${item.averageProgress.toFixed(1)}%`
      )
    })
  }

  // Create and download file
  const blob = new Blob([csvContent.join("\n")], {
    type: "text/csv;charset=utf-8;",
  })
  const link = document.createElement("a")
  const url = URL.createObjectURL(blob)
  link.setAttribute("href", url)
  link.setAttribute(
    "download",
    `goals-report-${data.period.toLowerCase().replace(/\s+/g, "-")}.csv`
  )
  link.style.visibility = "hidden"
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

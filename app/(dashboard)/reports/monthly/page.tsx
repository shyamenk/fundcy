"use client"

import React, { useState, useEffect } from "react"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  Download,
  DollarSign,
  ArrowLeft,
  Clock,
} from "lucide-react"
import Link from "next/link"
import { formatINR } from "@/lib/utils"
import { format } from "date-fns"
import {
  Line,
  BarChart,
  Bar,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  AreaChart,
  Area,
} from "recharts"
import {
  exportMonthlyReportToPDF,
  exportMonthlyReportToCSV,
} from "@/lib/export/reports"

interface MonthlyReportData {
  year: number
  month: number
  monthName: string
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
  dailyBreakdown: Array<{
    day: string
    income: number
    expenses: number
    savings: number
    investments: number
    netFlow: number
    transactionCount: number
  }>
  weeklyBreakdown: Array<{
    week: string
    income: number
    expenses: number
    savings: number
    investments: number
    netFlow: number
    transactionCount: number
  }>
  topTransactions: Array<{
    id: string
    amount: number
    type: string
    category: string
    description: string
    date: string
  }>
  metrics: {
    averageDailyIncome: number
    averageDailyExpenses: number
    averageDailySavings: number
    savingsRate: number
    expenseRatio: number
    totalTransactions: number
    daysWithTransactions: number
  }
}

const COLORS = [
  "#3b82f6",
  "#ef4444",
  "#10b981",
  "#f59e0b",
  "#8b5cf6",
  "#06b6d4",
  "#84cc16",
  "#f97316",
  "#ec4899",
  "#6366f1",
]

export default function MonthlyReportPage() {
  const [year, setYear] = useState(new Date().getFullYear())
  const [month, setMonth] = useState(new Date().getMonth() + 1)
  const [error, setError] = useState<string | null>(null)
  const [data, setData] = useState<MonthlyReportData | null>(null)
  const [loading, setLoading] = useState(true)
  const [exporting, setExporting] = useState<"pdf" | "csv" | null>(null)

  useEffect(() => {
    fetchMonthlyReport()
  }, [year, month])

  const fetchMonthlyReport = async () => {
    try {
      setLoading(true)
      const response = await fetch(
        `/api/reports/monthly?year=${year}&month=${month}`
      )
      const result = await response.json()

      if (result.success) {
        setData(result.data)
      } else {
        setError(result.error || "Failed to fetch monthly report")
      }
    } catch {
      setError("Failed to fetch monthly report")
    } finally {
      setLoading(false)
    }
  }

  const getGrowthColor = (value: number) => {
    return value >= 0 ? "text-green-600" : "text-red-600"
  }

  // Helper to adapt data for export
  function getExportData() {
    if (!data) throw new Error("No data to export")
    // Map dailyBreakdown to dailyTrends for export compatibility
    // Fill in missing metrics fields with defaults if needed
    return {
      ...data,
      dailyTrends: data.dailyBreakdown.map(day => ({
        date: day.day,
        income: day.income,
        expenses: day.expenses,
        netFlow: day.netFlow,
      })),
      metrics: {
        averageDailyIncome: data.metrics.averageDailyIncome,
        averageDailyExpenses: data.metrics.averageDailyExpenses,
        totalTransactions: data.metrics.totalTransactions,
        mostExpensiveDay: (data.metrics as any).mostExpensiveDay || "",
        mostExpensiveCategory:
          (data.metrics as any).mostExpensiveCategory || "",
      },
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center space-x-4">
          <Link href="/reports">
            <Button variant="outline" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Reports
            </Button>
          </Link>
        </div>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading monthly report...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="space-y-6">
        <div className="flex items-center space-x-4">
          <Link href="/reports">
            <Button variant="outline" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Reports
            </Button>
          </Link>
        </div>
        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <p className="text-muted-foreground mb-4">
                {error || "Failed to load monthly report"}
              </p>
              <Button onClick={fetchMonthlyReport}>Try Again</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="space-y-4">
          <Link href="/reports">
            <Button variant="outline" size="sm" className="mb-10">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Reports
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              {data.monthName} Report
            </h1>
            <p className="text-muted-foreground">
              Detailed monthly breakdown and analysis
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Select
            value={year.toString()}
            onValueChange={value => setYear(parseInt(value))}
          >
            <SelectTrigger className="w-[100px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Array.from(
                { length: 5 },
                (_, i) => new Date().getFullYear() - i
              ).map(y => (
                <SelectItem key={y} value={y.toString()}>
                  {y}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select
            value={month.toString()}
            onValueChange={value => setMonth(parseInt(value))}
          >
            <SelectTrigger className="w-[120px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Array.from({ length: 12 }, (_, i) => i + 1).map(m => (
                <SelectItem key={m} value={m.toString()}>
                  {format(new Date(2024, m - 1, 1), "MMM")}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            variant="outline"
            size="sm"
            disabled={exporting === "pdf" || !data}
            onClick={async () => {
              setExporting("pdf")
              try {
                if (data) exportMonthlyReportToPDF(getExportData())
              } finally {
                setExporting(null)
              }
            }}
          >
            <Download className="w-4 h-4 mr-2" />
            {exporting === "pdf" ? "Exporting..." : "PDF"}
          </Button>
          <Button
            variant="outline"
            size="sm"
            disabled={exporting === "csv" || !data}
            onClick={async () => {
              setExporting("csv")
              try {
                if (data) exportMonthlyReportToCSV(getExportData())
              } finally {
                setExporting(null)
              }
            }}
          >
            <Download className="w-4 h-4 mr-2" />
            {exporting === "csv" ? "Exporting..." : "CSV"}
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Income</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatINR(data.totals.income)}
            </div>
            <p className="text-xs text-muted-foreground">
              Avg: {formatINR(data.metrics.averageDailyIncome)}/day
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Expenses
            </CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatINR(data.totals.expenses)}
            </div>
            <p className="text-xs text-muted-foreground">
              Avg: {formatINR(data.metrics.averageDailyExpenses)}/day
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Net Flow</CardTitle>
            {data.netFlow >= 0 ? (
              <TrendingUp
                className={`h-4 w-4 ${getGrowthColor(data.netFlow)}`}
              />
            ) : (
              <TrendingDown
                className={`h-4 w-4 ${getGrowthColor(data.netFlow)}`}
              />
            )}
          </CardHeader>
          <CardContent>
            <div
              className={`text-2xl font-bold ${getGrowthColor(data.netFlow)}`}
            >
              {formatINR(data.netFlow)}
            </div>
            <p className="text-xs text-muted-foreground">
              Savings Rate: {data.metrics.savingsRate.toFixed(1)}%
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Days</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {data.metrics.daysWithTransactions}
            </div>
            <p className="text-xs text-muted-foreground">
              {data.metrics.totalTransactions} transactions
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <Tabs defaultValue="daily" className="space-y-4">
        <TabsList>
          <TabsTrigger value="daily">Daily Trends</TabsTrigger>
          <TabsTrigger value="weekly">Weekly Breakdown</TabsTrigger>
          <TabsTrigger value="categories">Category Analysis</TabsTrigger>
          <TabsTrigger value="transactions">Top Transactions</TabsTrigger>
        </TabsList>

        <TabsContent value="daily" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Daily Financial Flow</CardTitle>
              <CardDescription>
                Income, expenses, and net flow by day
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <AreaChart data={data.dailyBreakdown}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="day"
                    tickFormatter={value => format(new Date(value), "dd")}
                  />
                  <YAxis tickFormatter={value => formatINR(value)} />
                  <Tooltip
                    formatter={(value: number) => [formatINR(value), "Amount"]}
                    labelFormatter={label =>
                      format(new Date(label), "MMM dd, yyyy")
                    }
                  />
                  <Legend />
                  <Area
                    type="monotone"
                    dataKey="income"
                    stackId="1"
                    stroke="#10b981"
                    fill="#10b981"
                    fillOpacity={0.6}
                  />
                  <Area
                    type="monotone"
                    dataKey="expenses"
                    stackId="1"
                    stroke="#ef4444"
                    fill="#ef4444"
                    fillOpacity={0.6}
                  />
                  <Line
                    type="monotone"
                    dataKey="netFlow"
                    stroke="#f59e0b"
                    strokeWidth={3}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="weekly" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Weekly Breakdown</CardTitle>
              <CardDescription>Financial flow by week</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={data.weeklyBreakdown}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="week"
                    tickFormatter={value => format(new Date(value), "MMM dd")}
                  />
                  <YAxis tickFormatter={value => formatINR(value)} />
                  <Tooltip
                    formatter={(value: number) => [formatINR(value), "Amount"]}
                    labelFormatter={label =>
                      `Week of ${format(new Date(label), "MMM dd")}`
                    }
                  />
                  <Legend />
                  <Bar dataKey="income" fill="#10b981" radius={[4, 4, 0, 0]} />
                  <Bar
                    dataKey="expenses"
                    fill="#ef4444"
                    radius={[4, 4, 0, 0]}
                  />
                  <Bar dataKey="savings" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                  <Bar
                    dataKey="investments"
                    fill="#8b5cf6"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="categories" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Expense Categories</CardTitle>
              <CardDescription>
                Breakdown of expenses by category
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6 md:grid-cols-2">
                <ResponsiveContainer width="100%" height={300}>
                  <RechartsPieChart>
                    <Pie
                      data={data.categoryBreakdown}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ category, percentage }) =>
                        `${category} ${percentage.toFixed(1)}%`
                      }
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="amount"
                    >
                      {data.categoryBreakdown.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={COLORS[index % COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value: number) => [
                        formatINR(value),
                        "Amount",
                      ]}
                    />
                  </RechartsPieChart>
                </ResponsiveContainer>
                <div className="space-y-4">
                  <h4 className="font-medium">Category Details</h4>
                  <div className="space-y-2">
                    {data.categoryBreakdown.map((category, index) => (
                      <div
                        key={category.category}
                        className="flex items-center justify-between p-2 border rounded"
                      >
                        <div className="flex items-center space-x-2">
                          <div
                            className="w-3 h-3 rounded-full"
                            style={{
                              backgroundColor: COLORS[index % COLORS.length],
                            }}
                          />
                          <span className="font-medium">
                            {category.category}
                          </span>
                        </div>
                        <div className="text-right">
                          <div className="font-semibold">
                            {formatINR(category.amount)}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {category.percentage.toFixed(1)}% • {category.count}{" "}
                            transactions
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="transactions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Top Transactions</CardTitle>
              <CardDescription>
                Highest value transactions for the month
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {data.topTransactions.map((transaction, index) => (
                  <div
                    key={transaction.id}
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-muted">
                        <span className="text-sm font-medium">{index + 1}</span>
                      </div>
                      <div>
                        <p className="font-medium">{transaction.description}</p>
                        <p className="text-sm text-muted-foreground">
                          {transaction.category} •{" "}
                          {format(new Date(transaction.date), "MMM dd")}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div
                        className={`font-semibold ${
                          transaction.type === "income"
                            ? "text-green-600"
                            : "text-red-600"
                        }`}
                      >
                        {transaction.type === "income" ? "+" : "-"}
                        {formatINR(transaction.amount)}
                      </div>
                      <Badge variant="secondary" className="text-xs">
                        {transaction.type}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

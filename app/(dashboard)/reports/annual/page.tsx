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
  Calendar,
  DollarSign,
  Target,
  PieChart,
  LineChart,
  ArrowLeft,
} from "lucide-react"
import Link from "next/link"
import { formatINR } from "@/lib/utils"
import { format } from "date-fns"
import {
  LineChart as RechartsLineChart,
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
} from "recharts"
import {
  exportAnnualReportToPDF,
  exportAnnualReportToCSV,
} from "@/lib/export/reports"

interface AnnualReportData {
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

export default function AnnualReportPage() {
  const [year, setYear] = useState(new Date().getFullYear())
  const [data, setData] = useState<AnnualReportData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [exporting, setExporting] = useState<"pdf" | "csv" | null>(null)

  useEffect(() => {
    fetchAnnualReport()
  }, [year])

  const fetchAnnualReport = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/reports/annual?year=${year}`)
      const result = await response.json()

      if (result.success) {
        setData(result.data)
      } else {
        setError(result.error || "Failed to fetch annual report")
      }
    } catch (err) {
      setError("Failed to fetch annual report")
    } finally {
      setLoading(false)
    }
  }

  const getGrowthIcon = (value: number) => {
    return value >= 0 ? TrendingUp : TrendingDown
  }

  const getGrowthColor = (value: number) => {
    return value >= 0 ? "text-green-600" : "text-red-600"
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
            <p className="text-muted-foreground">Loading annual report...</p>
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
                {error || "Failed to load annual report"}
              </p>
              <Button onClick={fetchAnnualReport}>Try Again</Button>
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
              Annual Report {data.year}
            </h1>
            <p className="text-muted-foreground">
              Comprehensive financial analysis for {data.year}
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Select
            value={year.toString()}
            onValueChange={value => setYear(parseInt(value))}
          >
            <SelectTrigger className="w-[140px]">
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
          <Button
            variant="outline"
            size="sm"
            disabled={exporting === "pdf"}
            onClick={async () => {
              setExporting("pdf")
              try {
                exportAnnualReportToPDF(data)
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
            disabled={exporting === "csv"}
            onClick={async () => {
              setExporting("csv")
              try {
                exportAnnualReportToCSV(data)
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
              Avg: {formatINR(data.metrics.averageMonthlyIncome)}/month
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
              Avg: {formatINR(data.metrics.averageMonthlyExpenses)}/month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Net Worth Change
            </CardTitle>
            {data.netWorthChange >= 0 ? (
              <TrendingUp
                className={`h-4 w-4 ${getGrowthColor(data.netWorthChange)}`}
              />
            ) : (
              <TrendingDown
                className={`h-4 w-4 ${getGrowthColor(data.netWorthChange)}`}
              />
            )}
          </CardHeader>
          <CardContent>
            <div
              className={`text-2xl font-bold ${getGrowthColor(data.netWorthChange)}`}
            >
              {formatINR(data.netWorthChange)}
            </div>
            <p className="text-xs text-muted-foreground">
              Savings Rate: {data.metrics.savingsRate.toFixed(1)}%
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Transactions
            </CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {data.metrics.totalTransactions}
            </div>
            <p className="text-xs text-muted-foreground">
              Expense Ratio: {data.metrics.expenseRatio.toFixed(1)}%
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <Tabs defaultValue="monthly" className="space-y-4">
        <TabsList>
          <TabsTrigger value="monthly">Monthly Trends</TabsTrigger>
          <TabsTrigger value="categories">Category Breakdown</TabsTrigger>
          <TabsTrigger value="income-expense">Income vs Expenses</TabsTrigger>
        </TabsList>

        <TabsContent value="monthly" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Monthly Financial Flow</CardTitle>
              <CardDescription>
                Income, expenses, savings, and investments over the year
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <RechartsLineChart data={data.monthlyBreakdown}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="month"
                    tickFormatter={value =>
                      format(new Date(value + "-01"), "MMM")
                    }
                  />
                  <YAxis tickFormatter={value => formatINR(value)} />
                  <Tooltip
                    formatter={(value: number) => [formatINR(value), "Amount"]}
                    labelFormatter={label =>
                      format(new Date(label + "-01"), "MMMM yyyy")
                    }
                  />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="income"
                    stroke="#10b981"
                    strokeWidth={2}
                  />
                  <Line
                    type="monotone"
                    dataKey="expenses"
                    stroke="#ef4444"
                    strokeWidth={2}
                  />
                  <Line
                    type="monotone"
                    dataKey="savings"
                    stroke="#3b82f6"
                    strokeWidth={2}
                  />
                  <Line
                    type="monotone"
                    dataKey="investments"
                    stroke="#8b5cf6"
                    strokeWidth={2}
                  />
                </RechartsLineChart>
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
                            {category.percentage.toFixed(1)}%
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

        <TabsContent value="income-expense" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Income vs Expenses</CardTitle>
              <CardDescription>
                Monthly comparison of income and expenses
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={data.monthlyBreakdown}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="month"
                    tickFormatter={value =>
                      format(new Date(value + "-01"), "MMM")
                    }
                  />
                  <YAxis tickFormatter={value => formatINR(value)} />
                  <Tooltip
                    formatter={(value: number) => [formatINR(value), "Amount"]}
                    labelFormatter={label =>
                      format(new Date(label + "-01"), "MMMM yyyy")
                    }
                  />
                  <Legend />
                  <Bar dataKey="income" fill="#10b981" radius={[4, 4, 0, 0]} />
                  <Bar
                    dataKey="expenses"
                    fill="#ef4444"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

"use client"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts"
import { useState } from "react"
import { formatINR } from "@/lib/utils"
import { format } from "date-fns"
import { TrendingUp, TrendingDown, DollarSign, Calendar } from "lucide-react"

interface MoneyFlowData {
  month: string
  income: number
  expenses: number
  savings: number
  investments: number
  netFlow: number
}

interface MoneyFlowChartProps {
  data: MoneyFlowData[]
  className?: string
}

const chartTypes = [
  { value: "line", label: "Line Chart" },
  { value: "area", label: "Area Chart" },
  { value: "bar", label: "Bar Chart" },
  { value: "pie", label: "Pie Chart" },
]

const timeRanges = [
  { value: "6", label: "Last 6 Months" },
  { value: "12", label: "Last 12 Months" },
  { value: "24", label: "Last 24 Months" },
]

const COLORS = {
  income: "#10b981", // Green
  expenses: "#ef4444", // Red
  savings: "#3b82f6", // Blue
  investments: "#8b5cf6", // Purple
  netFlow: "#f59e0b", // Amber
}

export function MoneyFlowChart({ data, className }: MoneyFlowChartProps) {
  const [chartType, setChartType] = useState("line")
  const [timeRange, setTimeRange] = useState("12")

  // Filter data based on time range
  const filteredData = data.slice(-parseInt(timeRange))

  // Calculate summary statistics
  const totalIncome = filteredData.reduce((sum, item) => sum + item.income, 0)
  const totalExpenses = filteredData.reduce(
    (sum, item) => sum + item.expenses,
    0
  )
  const totalSavings = filteredData.reduce((sum, item) => sum + item.savings, 0)
  const totalInvestments = filteredData.reduce(
    (sum, item) => sum + item.investments,
    0
  )
  const totalNetFlow = filteredData.reduce((sum, item) => sum + item.netFlow, 0)

  // Calculate growth rate
  const firstMonth = filteredData[0]
  const lastMonth = filteredData[filteredData.length - 1]
  const growthRate =
    firstMonth && lastMonth
      ? ((lastMonth.netFlow - firstMonth.netFlow) /
          Math.abs(firstMonth.netFlow)) *
        100
      : 0

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white dark:bg-gray-800 p-3 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg">
          <p className="font-medium text-gray-900 dark:text-gray-100">
            {label}
          </p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {entry.name}: {formatINR(entry.value)}
            </p>
          ))}
        </div>
      )
    }
    return null
  }

  const renderChart = () => {
    switch (chartType) {
      case "line":
        return (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={filteredData}>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="#374151"
                opacity={0.1}
              />
              <XAxis
                dataKey="month"
                stroke="#6b7280"
                fontSize={12}
                tickFormatter={value => format(new Date(value + "-01"), "MMM")}
              />
              <YAxis
                stroke="#6b7280"
                fontSize={12}
                tickFormatter={value => formatINR(value)}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Line
                type="monotone"
                dataKey="income"
                stroke={COLORS.income}
                strokeWidth={2}
                dot={{ fill: COLORS.income, strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6 }}
              />
              <Line
                type="monotone"
                dataKey="expenses"
                stroke={COLORS.expenses}
                strokeWidth={2}
                dot={{ fill: COLORS.expenses, strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6 }}
              />
              <Line
                type="monotone"
                dataKey="netFlow"
                stroke={COLORS.netFlow}
                strokeWidth={3}
                dot={{ fill: COLORS.netFlow, strokeWidth: 2, r: 5 }}
                activeDot={{ r: 7 }}
              />
            </LineChart>
          </ResponsiveContainer>
        )

      case "area":
        return (
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={filteredData}>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="#374151"
                opacity={0.1}
              />
              <XAxis
                dataKey="month"
                stroke="#6b7280"
                fontSize={12}
                tickFormatter={value => format(new Date(value + "-01"), "MMM")}
              />
              <YAxis
                stroke="#6b7280"
                fontSize={12}
                tickFormatter={value => formatINR(value)}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Area
                type="monotone"
                dataKey="income"
                stackId="1"
                stroke={COLORS.income}
                fill={COLORS.income}
                fillOpacity={0.6}
              />
              <Area
                type="monotone"
                dataKey="expenses"
                stackId="1"
                stroke={COLORS.expenses}
                fill={COLORS.expenses}
                fillOpacity={0.6}
              />
            </AreaChart>
          </ResponsiveContainer>
        )

      case "bar":
        return (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={filteredData}>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="#374151"
                opacity={0.1}
              />
              <XAxis
                dataKey="month"
                stroke="#6b7280"
                fontSize={12}
                tickFormatter={value => format(new Date(value + "-01"), "MMM")}
              />
              <YAxis
                stroke="#6b7280"
                fontSize={12}
                tickFormatter={value => formatINR(value)}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Bar
                dataKey="income"
                fill={COLORS.income}
                radius={[4, 4, 0, 0]}
              />
              <Bar
                dataKey="expenses"
                fill={COLORS.expenses}
                radius={[4, 4, 0, 0]}
              />
              <Bar
                dataKey="savings"
                fill={COLORS.savings}
                radius={[4, 4, 0, 0]}
              />
              <Bar
                dataKey="investments"
                fill={COLORS.investments}
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        )

      case "pie":
        const pieData = [
          { name: "Income", value: totalIncome, color: COLORS.income },
          { name: "Expenses", value: totalExpenses, color: COLORS.expenses },
          { name: "Savings", value: totalSavings, color: COLORS.savings },
          {
            name: "Investments",
            value: totalInvestments,
            color: COLORS.investments,
          },
        ]

        return (
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) =>
                  `${name} ${(percent * 100).toFixed(0)}%`
                }
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                formatter={(value: number) => [formatINR(value), "Amount"]}
                contentStyle={{
                  backgroundColor: "white",
                  border: "1px solid #e5e7eb",
                  borderRadius: "8px",
                  padding: "12px",
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        )

      default:
        return null
    }
  }

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              Money Flow
            </CardTitle>
            <CardDescription>
              Track your financial flow over time
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Badge
              variant={growthRate >= 0 ? "default" : "destructive"}
              className="gap-1"
            >
              {growthRate >= 0 ? (
                <TrendingUp className="h-3 w-3" />
              ) : (
                <TrendingDown className="h-3 w-3" />
              )}
              {Math.abs(growthRate).toFixed(1)}%
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {/* Controls */}
        <div className="flex items-center gap-4 mb-6">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger className="w-[140px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {timeRanges.map(range => (
                  <SelectItem key={range.value} value={range.value}>
                    {range.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Select value={chartType} onValueChange={setChartType}>
            <SelectTrigger className="w-[120px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {chartTypes.map(type => (
                <SelectItem key={type.value} value={type.value}>
                  {type.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Chart */}
        <div className="w-full">{renderChart()}</div>

        {/* Summary Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-6 border-t">
          <div className="text-center">
            <p className="text-sm text-muted-foreground">Total Income</p>
            <p className="text-lg font-semibold text-green-600">
              {formatINR(totalIncome)}
            </p>
          </div>
          <div className="text-center">
            <p className="text-sm text-muted-foreground">Total Expenses</p>
            <p className="text-lg font-semibold text-red-600">
              {formatINR(totalExpenses)}
            </p>
          </div>
          <div className="text-center">
            <p className="text-sm text-muted-foreground">Total Savings</p>
            <p className="text-lg font-semibold text-blue-600">
              {formatINR(totalSavings)}
            </p>
          </div>
          <div className="text-center">
            <p className="text-sm text-muted-foreground">Net Flow</p>
            <p
              className={`text-lg font-semibold ${totalNetFlow >= 0 ? "text-green-600" : "text-red-600"}`}
            >
              {formatINR(totalNetFlow)}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

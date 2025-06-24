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
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts"
import { useState } from "react"
import { formatINR } from "@/lib/utils"
import { PieChart as PieChartIcon, BarChart3, Palette } from "lucide-react"

interface CategoryData {
  name: string
  amount: number
  percentage: number
  color: string
}

interface SpendingBreakdownChartProps {
  data: CategoryData[]
  className?: string
}

const chartTypes = [
  { value: "pie", label: "Pie Chart", icon: PieChartIcon },
  { value: "bar", label: "Bar Chart", icon: BarChart3 },
]

export function SpendingBreakdownChart({
  data,
  className,
}: SpendingBreakdownChartProps) {
  const [chartType, setChartType] = useState("pie")

  const totalSpending = data.reduce((sum, item) => sum + item.amount, 0)

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0]
      return (
        <div className="bg-white dark:bg-gray-800 p-3 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg">
          <p className="font-medium text-gray-900 dark:text-gray-100">
            {data.name}
          </p>
          <p className="text-sm" style={{ color: data.color }}>
            Amount: {formatINR(data.value)}
          </p>
          <p className="text-sm text-muted-foreground">
            Percentage: {((data.value / totalSpending) * 100).toFixed(1)}%
          </p>
        </div>
      )
    }
    return null
  }

  const renderChart = () => {
    switch (chartType) {
      case "pie":
        return (
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percentage }) =>
                  `${name} ${percentage.toFixed(1)}%`
                }
                outerRadius={100}
                fill="#8884d8"
                dataKey="amount"
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
        )

      case "bar":
        return (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data} layout="horizontal">
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="#374151"
                opacity={0.1}
              />
              <XAxis
                type="number"
                stroke="#6b7280"
                fontSize={12}
                tickFormatter={value => formatINR(value)}
              />
              <YAxis
                type="category"
                dataKey="name"
                stroke="#6b7280"
                fontSize={12}
                width={80}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="amount" radius={[0, 4, 4, 0]}>
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
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
              <Palette className="h-5 w-5" />
              Spending Breakdown
            </CardTitle>
            <CardDescription>Analyze your expenses by category</CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="secondary">Total: {formatINR(totalSpending)}</Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {/* Chart Type Selector */}
        <div className="flex items-center gap-4 mb-6">
          <Select value={chartType} onValueChange={setChartType}>
            <SelectTrigger className="w-[140px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {chartTypes.map(type => (
                <SelectItem key={type.value} value={type.value}>
                  <div className="flex items-center gap-2">
                    <type.icon className="h-4 w-4" />
                    {type.label}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Chart */}
        <div className="w-full">{renderChart()}</div>

        {/* Category List */}
        <div className="mt-6 space-y-3">
          <h4 className="font-medium text-sm text-muted-foreground">
            Category Details
          </h4>
          <div className="space-y-2">
            {data.map((category, index) => (
              <div
                key={category.name}
                className="flex items-center justify-between p-3 border rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: category.color }}
                  />
                  <div>
                    <p className="font-medium">{category.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {category.percentage.toFixed(1)}% of total spending
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold">{formatINR(category.amount)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

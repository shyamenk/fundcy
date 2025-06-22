"use client";

import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  Download,
  Calendar,
  DollarSign,
  ArrowLeft,
  PieChart,
  Target,
  Clock,
  Activity,
} from "lucide-react";
import Link from "next/link";
import { formatINR } from "@/lib/utils";
import { format } from "date-fns";
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
  AreaChart,
  Area,
  LineChart,
} from "recharts";

interface CategoryReportData {
  period: string;
  totalSpent: number;
  totalIncome: number;
  categoryBreakdown: Array<{
    category: string;
    totalAmount: number;
    transactionCount: number;
    averageAmount: number;
    percentage: number;
    monthlyTrend: Array<{
      month: string;
      amount: number;
      count: number;
    }>;
  }>;
  topCategories: Array<{
    category: string;
    amount: number;
    count: number;
    percentage: number;
  }>;
  monthlyTrends: Array<{
    month: string;
    totalSpent: number;
    totalIncome: number;
    netFlow: number;
    categoryBreakdown: Array<{
      category: string;
      amount: number;
    }>;
  }>;
  insights: {
    mostExpensiveCategory: string;
    mostFrequentCategory: string;
    fastestGrowingCategory: string;
    averageTransactionValue: number;
    totalTransactions: number;
    uniqueCategories: number;
  };
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
];

export default function CategoriesReportPage() {
  const [months, setMonths] = useState(12);
  const [data, setData] = useState<CategoryReportData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchCategoryReport();
  }, [months]);

  const fetchCategoryReport = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/reports/categories?months=${months}`);
      const result = await response.json();

      if (result.success) {
        setData(result.data);
      } else {
        setError(result.error || "Failed to fetch category report");
      }
    } catch (err) {
      setError("Failed to fetch category report");
    } finally {
      setLoading(false);
    }
  };

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
            <p className="text-muted-foreground">
              Loading category analysis...
            </p>
          </div>
        </div>
      </div>
    );
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
                {error || "Failed to load category analysis"}
              </p>
              <Button onClick={fetchCategoryReport}>Try Again</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
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
              Category Analysis
            </h1>
            <p className="text-muted-foreground">
              Deep dive into spending patterns by category
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Select
            value={months.toString()}
            onValueChange={value => setMonths(parseInt(value))}
          >
            <SelectTrigger className="w-[140px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="6">Last 6 Months</SelectItem>
              <SelectItem value="12">Last 12 Months</SelectItem>
              <SelectItem value="24">Last 24 Months</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Spent</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatINR(data.totalSpent)}
            </div>
            <p className="text-xs text-muted-foreground">
              {data.insights.totalTransactions} transactions
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Income</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatINR(data.totalIncome)}
            </div>
            <p className="text-xs text-muted-foreground">
              Net: {formatINR(data.totalIncome - data.totalSpent)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Categories</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {data.insights.uniqueCategories}
            </div>
            <p className="text-xs text-muted-foreground">
              Unique categories used
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Avg Transaction
            </CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatINR(data.insights.averageTransactionValue)}
            </div>
            <p className="text-xs text-muted-foreground">Per transaction</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="trends">Monthly Trends</TabsTrigger>
          <TabsTrigger value="breakdown">Category Breakdown</TabsTrigger>
          <TabsTrigger value="insights">Insights</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Spending by Category</CardTitle>
                <CardDescription>
                  Total amount spent in each category
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <RechartsPieChart>
                    <Pie
                      data={data.topCategories}
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
                      {data.topCategories.map((entry, index) => (
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
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Top Categories</CardTitle>
                <CardDescription>Highest spending categories</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {data.topCategories.slice(0, 8).map((category, index) => (
                    <div
                      key={category.category}
                      className="flex items-center justify-between"
                    >
                      <div className="flex items-center space-x-2">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{
                            backgroundColor: COLORS[index % COLORS.length],
                          }}
                        />
                        <span className="font-medium">{category.category}</span>
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
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="trends" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Monthly Spending Trends</CardTitle>
              <CardDescription>
                How spending has changed over time by category
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={data.monthlyTrends}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="month"
                    tickFormatter={value => format(new Date(value), "MMM yy")}
                  />
                  <YAxis tickFormatter={value => formatINR(value)} />
                  <Tooltip
                    formatter={(value: number) => [formatINR(value), "Amount"]}
                    labelFormatter={label =>
                      format(new Date(label), "MMMM yyyy")
                    }
                  />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="totalSpent"
                    stroke="#3b82f6"
                    strokeWidth={3}
                    dot={{ fill: "#3b82f6", strokeWidth: 2, r: 4 }}
                    name="Total Spent"
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="breakdown" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Detailed Category Breakdown</CardTitle>
              <CardDescription>
                Comprehensive analysis of each category
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {data.categoryBreakdown.map((category, index) => (
                  <div
                    key={category.category}
                    className="border rounded-lg p-4"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-2">
                        <div
                          className="w-4 h-4 rounded-full"
                          style={{
                            backgroundColor: COLORS[index % COLORS.length],
                          }}
                        />
                        <h3 className="text-lg font-semibold">
                          {category.category}
                        </h3>
                        <Badge variant="secondary">
                          {category.percentage.toFixed(1)}%
                        </Badge>
                      </div>
                      <div className="text-right">
                        <div className="text-xl font-bold">
                          {formatINR(category.totalAmount)}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {category.transactionCount} transactions
                        </div>
                      </div>
                    </div>

                    <div className="grid gap-4 md:grid-cols-3 mb-4">
                      <div>
                        <p className="text-sm text-muted-foreground">
                          Average Transaction
                        </p>
                        <p className="font-semibold">
                          {formatINR(category.averageAmount)}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">
                          Total Amount
                        </p>
                        <p className="font-semibold">
                          {formatINR(category.totalAmount)}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">
                          Transaction Count
                        </p>
                        <p className="font-semibold">
                          {category.transactionCount}
                        </p>
                      </div>
                    </div>

                    <ResponsiveContainer width="100%" height={200}>
                      <BarChart data={category.monthlyTrend}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis
                          dataKey="month"
                          tickFormatter={value =>
                            format(new Date(value), "MMM")
                          }
                        />
                        <YAxis tickFormatter={value => formatINR(value)} />
                        <Tooltip
                          formatter={(value: number) => [
                            formatINR(value),
                            "Amount",
                          ]}
                          labelFormatter={label =>
                            format(new Date(label), "MMMM yyyy")
                          }
                        />
                        <Bar
                          dataKey="amount"
                          fill={COLORS[index % COLORS.length]}
                          radius={[4, 4, 0, 0]}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="insights" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Key Insights</CardTitle>
                <CardDescription>Important patterns and trends</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 border rounded">
                    <div>
                      <p className="font-medium">Most Expensive Category</p>
                      <p className="text-sm text-muted-foreground">
                        Highest total spending
                      </p>
                    </div>
                    <Badge variant="outline">
                      {data.insights.mostExpensiveCategory}
                    </Badge>
                  </div>

                  <div className="flex items-center justify-between p-3 border rounded">
                    <div>
                      <p className="font-medium">Most Frequent Category</p>
                      <p className="text-sm text-muted-foreground">
                        Most transactions
                      </p>
                    </div>
                    <Badge variant="outline">
                      {data.insights.mostFrequentCategory}
                    </Badge>
                  </div>

                  <div className="flex items-center justify-between p-3 border rounded">
                    <div>
                      <p className="font-medium">Fastest Growing</p>
                      <p className="text-sm text-muted-foreground">
                        Increasing trend
                      </p>
                    </div>
                    <Badge variant="outline">
                      {data.insights.fastestGrowingCategory}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Summary Statistics</CardTitle>
                <CardDescription>Overall category performance</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span>Total Categories Used:</span>
                    <span className="font-semibold">
                      {data.insights.uniqueCategories}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Total Transactions:</span>
                    <span className="font-semibold">
                      {data.insights.totalTransactions}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Average Transaction Value:</span>
                    <span className="font-semibold">
                      {formatINR(data.insights.averageTransactionValue)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Total Period:</span>
                    <span className="font-semibold">{data.period}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

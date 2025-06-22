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
  CheckCircle,
  AlertCircle,
  Pause,
  Play,
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
} from "recharts";

interface GoalReportData {
  period: string;
  goalStats: {
    total: number;
    active: number;
    completed: number;
    paused: number;
    totalTargetAmount: number;
    totalCurrentAmount: number;
    totalContributions: number;
  };
  overallProgress: number;
  goalProgress: Array<{
    id: string;
    title: string;
    category: string;
    status: string;
    targetAmount: number;
    currentAmount: number;
    progress: number;
    remaining: number;
    isOverdue: boolean;
    targetDate: string | null;
    createdAt: string;
    completedAt: string | null;
  }>;
  monthlyContributions: Array<{
    month: string;
    total: number;
    count: number;
    goals: Array<{
      title: string;
      amount: number;
    }>;
  }>;
  categoryBreakdown: Array<{
    category: string;
    count: number;
    totalTarget: number;
    totalCurrent: number;
    totalContributions: number;
    averageProgress: number;
  }>;
  insights: {
    mostActiveCategory: string;
    fastestProgressingGoal: string;
    mostOverdueGoal: string;
    averageGoalValue: number;
    completionRate: number;
    averageMonthlyContribution: number;
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

const STATUS_COLORS = {
  active: "text-green-600",
  completed: "text-blue-600",
  paused: "text-yellow-600",
};

const STATUS_ICONS = {
  active: Play,
  completed: CheckCircle,
  paused: Pause,
};

export default function GoalsReportPage() {
  const [year, setYear] = useState(new Date().getFullYear());
  const [status, setStatus] = useState<string>("all");
  const [data, setData] = useState<GoalReportData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchGoalsReport();
  }, [year, status]);

  const fetchGoalsReport = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        year: year.toString(),
        ...(status !== "all" && { status }),
      });
      const response = await fetch(`/api/reports/goals?${params}`);
      const result = await response.json();

      if (result.success) {
        setData(result.data);
      } else {
        setError(result.error || "Failed to fetch goals report");
      }
    } catch (err) {
      setError("Failed to fetch goals report");
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    return (
      STATUS_COLORS[status as keyof typeof STATUS_COLORS] || "text-gray-600"
    );
  };

  const getStatusIcon = (status: string) => {
    const Icon =
      STATUS_ICONS[status as keyof typeof STATUS_ICONS] || AlertCircle;
    return <Icon className="w-4 h-4" />;
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
            <p className="text-muted-foreground">Loading goals analysis...</p>
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
                {error || "Failed to load goals analysis"}
              </p>
              <Button onClick={fetchGoalsReport}>Try Again</Button>
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
              Goals Report {year}
            </h1>
            <p className="text-muted-foreground">
              Track your financial goals and progress
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
          <Select value={status} onValueChange={value => setStatus(value)}>
            <SelectTrigger className="w-[120px]">
              <SelectValue placeholder="All Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="paused">Paused</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Goals</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {data.goalStats?.total ?? "-"}
            </div>
            <p className="text-xs text-muted-foreground">
              {data.goalStats?.active ?? 0} active,{" "}
              {data.goalStats?.completed ?? 0} completed
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Overall Progress
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {data.overallProgress !== undefined
                ? data.overallProgress.toFixed(1)
                : "-"}
              %
            </div>
            <p className="text-xs text-muted-foreground">
              {formatINR(data.goalStats?.totalCurrentAmount ?? 0)} /{" "}
              {formatINR(data.goalStats?.totalTargetAmount ?? 0)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Contributions
            </CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatINR(data.goalStats?.totalContributions ?? 0)}
            </div>
            <p className="text-xs text-muted-foreground">This year</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Completion Rate
            </CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {data.insights?.completionRate !== undefined
                ? data.insights.completionRate.toFixed(1)
                : "-"}
            </div>
            <p className="text-xs text-muted-foreground">Goals completed</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="progress">Goal Progress</TabsTrigger>
          <TabsTrigger value="contributions">Contributions</TabsTrigger>
          <TabsTrigger value="categories">Categories</TabsTrigger>
          <TabsTrigger value="insights">Insights</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {/* Monthly Contributions Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Monthly Contributions</CardTitle>
                <CardDescription>
                  Goal contributions throughout the year
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={data.monthlyContributions}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                      dataKey="month"
                      tickFormatter={value => format(new Date(value), "MMM")}
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
                    <Bar dataKey="total" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Goal Status Distribution */}
            <Card>
              <CardHeader>
                <CardTitle>Goal Status Distribution</CardTitle>
                <CardDescription>Breakdown by status</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <RechartsPieChart>
                    <Pie
                      data={[
                        {
                          name: "Active",
                          value: data.goalStats?.active ?? 0,
                          color: "#10b981",
                        },
                        {
                          name: "Completed",
                          value: data.goalStats?.completed ?? 0,
                          color: "#3b82f6",
                        },
                        {
                          name: "Paused",
                          value: data.goalStats?.paused ?? 0,
                          color: "#f59e0b",
                        },
                      ]}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, value }) => `${name}: ${value}`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {[
                        {
                          name: "Active",
                          value: data.goalStats?.active ?? 0,
                          color: "#10b981",
                        },
                        {
                          name: "Completed",
                          value: data.goalStats?.completed ?? 0,
                          color: "#3b82f6",
                        },
                        {
                          name: "Paused",
                          value: data.goalStats?.paused ?? 0,
                          color: "#f59e0b",
                        },
                      ].map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </RechartsPieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="progress" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Goal Progress Details</CardTitle>
              <CardDescription>
                Individual goal progress and status
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {data.goalProgress.map(goal => (
                  <div key={goal.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <div className={getStatusColor(goal.status)}>
                          {getStatusIcon(goal.status)}
                        </div>
                        <div>
                          <h3 className="font-semibold">{goal.title}</h3>
                          <p className="text-sm text-muted-foreground">
                            {goal.category}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold">
                          {formatINR(goal.currentAmount)} /{" "}
                          {formatINR(goal.targetAmount)}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {goal.progress.toFixed(1)}% complete
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Progress</span>
                        <span>{goal.progress.toFixed(1)}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full"
                          style={{ width: `${Math.min(goal.progress, 100)}%` }}
                        ></div>
                      </div>

                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-muted-foreground">
                            Remaining:
                          </span>
                          <div className="font-semibold">
                            {formatINR(goal.remaining)}
                          </div>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Status:</span>
                          <div className="font-semibold capitalize">
                            {goal.status}
                          </div>
                        </div>
                      </div>

                      {goal.targetDate && (
                        <div className="text-sm">
                          <span className="text-muted-foreground">
                            Target Date:
                          </span>
                          <div className="font-semibold">
                            {format(new Date(goal.targetDate), "MMM dd, yyyy")}
                            {goal.isOverdue && (
                              <Badge variant="destructive" className="ml-2">
                                Overdue
                              </Badge>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="contributions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Monthly Contribution Trends</CardTitle>
              <CardDescription>
                Detailed contribution analysis by month
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <AreaChart data={data.monthlyContributions}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="month"
                    tickFormatter={value => format(new Date(value), "MMM")}
                  />
                  <YAxis tickFormatter={value => formatINR(value)} />
                  <Tooltip
                    formatter={(value: number) => [formatINR(value), "Amount"]}
                    labelFormatter={label =>
                      format(new Date(label), "MMMM yyyy")
                    }
                  />
                  <Legend />
                  <Area
                    type="monotone"
                    dataKey="total"
                    stroke="#3b82f6"
                    fill="#3b82f6"
                    fillOpacity={0.6}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="categories" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {/* Category Breakdown Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Category Breakdown</CardTitle>
                <CardDescription>Goals by category</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <RechartsPieChart>
                    <Pie
                      data={data.categoryBreakdown}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ category, count }) => `${category}: ${count}`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="count"
                    >
                      {data.categoryBreakdown.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={COLORS[index % COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip />
                  </RechartsPieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Category Details */}
            <Card>
              <CardHeader>
                <CardTitle>Category Details</CardTitle>
                <CardDescription>Detailed category analysis</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {data.categoryBreakdown.map((category, index) => (
                    <div
                      key={category.category}
                      className="flex items-center justify-between p-3 border rounded"
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
                          {category.count} goals
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {(category.averageProgress ?? 0).toFixed(1)}% avg
                          progress
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="insights" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {/* Key Insights */}
            <Card>
              <CardHeader>
                <CardTitle>Key Insights</CardTitle>
                <CardDescription>Important patterns and trends</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 border rounded">
                    <div>
                      <p className="font-medium">Most Active Category</p>
                      <p className="text-sm text-muted-foreground">
                        Highest number of goals
                      </p>
                    </div>
                    <Badge variant="outline">
                      {data.insights?.mostActiveCategory ?? "-"}
                    </Badge>
                  </div>

                  <div className="flex items-center justify-between p-3 border rounded">
                    <div>
                      <p className="font-medium">Fastest Progressing Goal</p>
                      <p className="text-sm text-muted-foreground">
                        Highest completion rate
                      </p>
                    </div>
                    <Badge variant="outline">
                      {data.insights?.fastestProgressingGoal ?? "-"}
                    </Badge>
                  </div>

                  <div className="flex items-center justify-between p-3 border rounded">
                    <div>
                      <p className="font-medium">Most Overdue Goal</p>
                      <p className="text-sm text-muted-foreground">
                        Past target date
                      </p>
                    </div>
                    <Badge variant="outline">
                      {data.insights?.mostOverdueGoal ?? "-"}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Summary Statistics */}
            <Card>
              <CardHeader>
                <CardTitle>Summary Statistics</CardTitle>
                <CardDescription>Overall goal performance</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span>Total Goals:</span>
                    <span className="font-semibold">
                      {data.goalStats.total}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Active Goals:</span>
                    <span className="font-semibold">
                      {data.goalStats.active}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Completed Goals:</span>
                    <span className="font-semibold">
                      {data.goalStats.completed}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Average Goal Value:</span>
                    <span className="font-semibold">
                      {data.insights?.averageGoalValue !== undefined
                        ? formatINR(data.insights.averageGoalValue)
                        : "-"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Completion Rate:</span>
                    <span className="font-semibold">
                      {data.insights?.completionRate !== undefined
                        ? data.insights.completionRate.toFixed(1) + "%"
                        : "-"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Avg Monthly Contribution:</span>
                    <span className="font-semibold">
                      {data.insights?.averageMonthlyContribution !== undefined
                        ? formatINR(data.insights.averageMonthlyContribution)
                        : "-"}
                    </span>
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

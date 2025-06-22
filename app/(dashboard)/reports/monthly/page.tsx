"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  Clock
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

interface MonthlyReportData {
  year: number;
  month: number;
  monthName: string;
  totals: {
    income: number;
    expenses: number;
    savings: number;
    investments: number;
  };
  netFlow: number;
  categoryBreakdown: Array<{
    category: string;
    amount: number;
    count: number;
    percentage: number;
  }>;
  dailyBreakdown: Array<{
    day: string;
    income: number;
    expenses: number;
    savings: number;
    investments: number;
    netFlow: number;
    transactionCount: number;
  }>;
  weeklyBreakdown: Array<{
    week: string;
    income: number;
    expenses: number;
    savings: number;
    investments: number;
    netFlow: number;
    transactionCount: number;
  }>;
  topTransactions: Array<{
    id: string;
    amount: number;
    type: string;
    category: string;
    description: string;
    date: string;
  }>;
  metrics: {
    averageDailyIncome: number;
    averageDailyExpenses: number;
    averageDailySavings: number;
    savingsRate: number;
    expenseRatio: number;
    totalTransactions: number;
    daysWithTransactions: number;
  };
}

const COLORS = [
  "#3b82f6", "#ef4444", "#10b981", "#f59e0b", "#8b5cf6",
  "#06b6d4", "#84cc16", "#f97316", "#ec4899", "#6366f1"
];

export default function MonthlyReportPage() {
  const [year, setYear] = useState(new Date().getFullYear());
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [loading, setLoading] = useState(true);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link href="/reports">
            <Button variant="outline" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Reports
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Monthly Report</h1>
            <p className="text-muted-foreground">
              Detailed monthly breakdown and analysis
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Select value={year.toString()} onValueChange={(value) => setYear(parseInt(value))}>
            <SelectTrigger className="w-[100px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i).map((y) => (
                <SelectItem key={y} value={y.toString()}>
                  {y}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={month.toString()} onValueChange={(value) => setMonth(parseInt(value))}>
            <SelectTrigger className="w-[120px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                <SelectItem key={m} value={m.toString()}>
                  {format(new Date(2024, m - 1, 1), "MMM")}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Placeholder Content */}
      <Card>
        <CardHeader>
          <CardTitle>Monthly Report</CardTitle>
          <CardDescription>
            Detailed monthly breakdown and analysis for {format(new Date(year, month - 1, 1), "MMMM yyyy")}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <p className="text-muted-foreground">Monthly report implementation coming soon...</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 
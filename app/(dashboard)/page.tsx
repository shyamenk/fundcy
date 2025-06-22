'use client';

import { useState } from 'react';
import { StatCard } from "@/components/shared/StatCard";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { PeriodSelector, PeriodType } from "@/components/dashboard/PeriodSelector";
import { useDashboard } from "@/hooks/useDashboard";
import { DollarSign, CreditCard, Landmark, TrendingUp, TrendingDown } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { formatINR, formatCompactINR } from "@/lib/utils";

export default function DashboardPage() {
  const [period, setPeriod] = useState<PeriodType>('month');
  const [customDate, setCustomDate] = useState<Date>(new Date());

  const { data, loading, error } = useDashboard(period, period === 'custom' ? customDate : undefined);

  const handlePeriodChange = (newPeriod: PeriodType) => {
    setPeriod(newPeriod);
  };

  const handleDateChange = (date: Date) => {
    setCustomDate(date);
  };

  const getGrowthIcon = (value: number) => {
    return value >= 0 ? TrendingUp : TrendingDown;
  };

  const getGrowthColor = (value: number) => {
    return value >= 0 ? 'text-green-600' : 'text-red-600';
  };

  if (loading) {
    return (
      <div className="flex flex-1 flex-col gap-4">
        <DashboardHeader />
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  <div className="h-4 bg-gray-200 rounded w-24"></div>
                </CardTitle>
                <div className="h-4 w-4 bg-gray-200 rounded"></div>
              </CardHeader>
              <CardContent>
                <div className="h-8 bg-gray-200 rounded w-20 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-32"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-1 flex-col gap-4">
        <DashboardHeader />
        <Card className="border-red-200 bg-red-50 dark:bg-red-950/20">
          <CardContent className="pt-6">
            <p className="text-red-600 dark:text-red-400">Error: {error}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const overview = data?.overview;

  return (
    <div className="flex flex-1 flex-col gap-6">
      {/* Header with Period Selector */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            {period === 'custom'
              ? `Financial overview for ${format(customDate, 'MMMM yyyy')}`
              : `Financial overview for this ${period}`
            }
          </p>
        </div>

        <PeriodSelector
          period={period}
          selectedDate={customDate}
          onPeriodChange={handlePeriodChange}
          onDateChange={handleDateChange}
        />
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Net Worth"
          value={overview ? formatINR(overview.netWorth) : '₹0'}
          description="Total assets minus liabilities"
          icon={DollarSign}
          trend={overview?.netWorth ? (overview.netWorth >= 0 ? 'positive' : 'negative') : undefined}
        />
        <StatCard
          title="Period Income"
          value={overview ? formatINR(overview.periodIncome) : '₹0'}
          description={`Income for this ${period}`}
          icon={Landmark}
          trend="positive"
        />
        <StatCard
          title="Period Expenses"
          value={overview ? formatINR(overview.periodExpenses) : '₹0'}
          description={`Expenses for this ${period}`}
          icon={CreditCard}
          trend="negative"
        />
        <StatCard
          title="Remaining Budget"
          value={overview ? formatINR(overview.remainingBudget) : '₹0'}
          description={`Budget remaining for this ${period}`}
          icon={TrendingUp}
          trend={overview?.remainingBudget ? (overview.remainingBudget >= 0 ? 'positive' : 'negative') : undefined}
        />
      </div>

      {/* Additional Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Savings</CardTitle>
            <Badge variant="secondary">
              {period === 'custom' ? format(customDate, 'MMM yyyy') : period}
            </Badge>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {overview ? formatINR(overview.periodSavings) : '₹0'}
            </div>
            <p className="text-xs text-muted-foreground">
              Total savings for the selected period
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Investments</CardTitle>
            <Badge variant="secondary">
              {period === 'custom' ? format(customDate, 'MMM yyyy') : period}
            </Badge>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {overview ? formatINR(overview.periodInvestments) : '₹0'}
            </div>
            <p className="text-xs text-muted-foreground">
              Total investments for the selected period
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Period Summary</CardTitle>
            <Badge variant="outline">
              {period === 'custom' ? format(customDate, 'MMM yyyy') : period}
            </Badge>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Income:</span>
                <span className="text-green-600 font-medium">
                  {overview ? formatINR(overview.periodIncome) : '₹0'}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Expenses:</span>
                <span className="text-red-600 font-medium">
                  {overview ? formatINR(overview.periodExpenses) : '₹0'}
                </span>
              </div>
              <div className="flex justify-between text-sm font-medium border-t pt-1">
                <span>Net:</span>
                <span className={overview?.remainingBudget ? (overview.remainingBudget >= 0 ? 'text-green-600' : 'text-red-600') : 'text-muted-foreground'}>
                  {overview ? formatINR(overview.remainingBudget) : '₹0'}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Transactions */}
      {data?.recentTransactions && data.recentTransactions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Recent Transactions</CardTitle>
            <CardDescription>
              Latest transactions from your account
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {data.recentTransactions.slice(0, 5).map((transaction: any) => (
                <div key={transaction.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className={`w-2 h-2 rounded-full ${transaction.type === 'income' ? 'bg-green-500' :
                      transaction.type === 'expense' ? 'bg-red-500' :
                        transaction.type === 'savings' ? 'bg-blue-500' : 'bg-purple-500'
                      }`} />
                    <div>
                      <p className="font-medium">{transaction.description}</p>
                      <p className="text-sm text-muted-foreground">
                        {transaction.category?.name || 'Uncategorized'} • {format(new Date(transaction.date), 'MMM dd, yyyy')}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`font-medium ${transaction.type === 'income' ? 'text-green-600' :
                      transaction.type === 'expense' ? 'text-red-600' :
                        'text-blue-600'
                      }`}>
                      {transaction.type === 'expense' ? '-' : '+'}{formatINR(Number(transaction.amount))}
                    </p>
                    <Badge variant="outline" className="text-xs">
                      {transaction.type}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Placeholder for Charts */}
      <Card>
        <CardHeader>
          <CardTitle>Money Flow & Analytics</CardTitle>
          <CardDescription>
            Charts and detailed analytics will be implemented in the next phases
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-64 flex items-center justify-center border-2 border-dashed border-gray-300 rounded-lg">
            <p className="text-muted-foreground">Charts coming soon...</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

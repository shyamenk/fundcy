"use client"

import { useState } from "react"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  BarChart3,
  Calendar,
  Target,
  TrendingUp,
  FileText,
  Download,
  ArrowRight,
  PieChart,
  LineChart,
  Activity,
} from "lucide-react"
import Link from "next/link"

export default function ReportsPage() {
  const [activeTab, setActiveTab] = useState("overview")

  const reportTypes = [
    {
      id: "annual",
      title: "Annual Reports",
      description:
        "Comprehensive yearly financial analysis with trends and insights",
      icon: BarChart3,
      color: "text-blue-600",
      bgColor: "bg-blue-50 dark:bg-blue-950",
      features: [
        "Year-over-year comparison",
        "Category spending analysis",
        "Net worth progression",
        "Savings rate tracking",
      ],
      href: "/reports/annual",
    },
    {
      id: "monthly",
      title: "Monthly Reports",
      description: "Detailed monthly breakdowns with day-by-day analysis",
      icon: Calendar,
      color: "text-green-600",
      bgColor: "bg-green-50 dark:bg-green-950",
      features: [
        "Daily spending patterns",
        "Weekly breakdowns",
        "Top transactions",
        "Budget vs actual",
      ],
      href: "/reports/monthly",
    },
    {
      id: "categories",
      title: "Category Analysis",
      description: "Deep dive into spending patterns by category",
      icon: PieChart,
      color: "text-purple-600",
      bgColor: "bg-purple-50 dark:bg-purple-950",
      features: [
        "Category spending trends",
        "Top spending categories",
        "Monthly category breakdown",
        "Spending insights",
      ],
      href: "/reports/categories",
    },
    {
      id: "goals",
      title: "Goals Reports",
      description: "Track progress and performance of your financial goals",
      icon: Target,
      color: "text-orange-600",
      bgColor: "bg-orange-50 dark:bg-orange-950",
      features: [
        "Goal progress tracking",
        "Completion rates",
        "Contribution analysis",
        "Overdue goals alert",
      ],
      href: "/reports/goals",
    },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Reports & Analytics
          </h1>
          <p className="text-muted-foreground">
            Comprehensive financial insights and detailed analysis of your
            spending patterns
          </p>
        </div>
        <Badge variant="secondary" className="text-sm">
          <TrendingUp className="w-4 h-4 mr-2" />
          Real-time Data
        </Badge>
      </div>

      {/* Report Types */}
      <div className="grid gap-6 md:grid-cols-2">
        {reportTypes.map(report => (
          <Card key={report.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-center space-x-4">
                <div className={`p-3 rounded-lg ${report.bgColor}`}>
                  <report.icon className={`w-6 h-6 ${report.color}`} />
                </div>
                <div className="flex-1">
                  <CardTitle className="text-lg">{report.title}</CardTitle>
                  <CardDescription className="text-sm">
                    {report.description}
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                {report.features.map((feature, index) => (
                  <div
                    key={index}
                    className="flex items-center text-sm text-muted-foreground"
                  >
                    <div className="w-1.5 h-1.5 rounded-full bg-muted-foreground mr-2" />
                    {feature}
                  </div>
                ))}
              </div>
              <Link href={report.href}>
                <Button className="w-full" variant="outline">
                  View Report
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

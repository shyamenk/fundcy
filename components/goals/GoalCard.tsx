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
import { Progress } from "@/components/ui/progress"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { GoalForm } from "@/components/forms/GoalForm"
import { GoalFormData } from "@/lib/validations/goal"
import { formatINR } from "@/lib/utils"
import { format, isAfter, isBefore } from "date-fns"
import {
  Edit,
  Trash2,
  CheckCircle,
  Pause,
  Play,
  Target,
  Calendar,
} from "lucide-react"

interface Goal {
  id: string
  title: string
  description: string
  targetAmount: string
  currentAmount: string
  targetDate: string | null
  category: string | null
  status: "active" | "completed" | "paused"
  createdAt: string
  updatedAt: string
  completedAt: string | null
}

interface GoalCardProps {
  goal: Goal
  onUpdate: (id: string, data: GoalFormData) => Promise<void>
  onDelete: (id: string) => Promise<void>
  onComplete: (id: string) => Promise<void>
  onStatusChange: (id: string, status: "active" | "paused") => Promise<void>
}

export function GoalCard({
  goal,
  onUpdate,
  onDelete,
  onComplete,
  onStatusChange,
}: GoalCardProps) {
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const currentAmount = parseFloat(goal.currentAmount)
  const targetAmount = parseFloat(goal.targetAmount)
  const progress = targetAmount > 0 ? (currentAmount / targetAmount) * 100 : 0
  const remaining = targetAmount - currentAmount

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
      case "paused":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300"
      case "completed":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "active":
        return <Play className="h-4 w-4" />
      case "paused":
        return <Pause className="h-4 w-4" />
      case "completed":
        return <CheckCircle className="h-4 w-4" />
      default:
        return <Target className="h-4 w-4" />
    }
  }

  const isOverdue =
    goal.targetDate &&
    isBefore(new Date(goal.targetDate), new Date()) &&
    goal.status !== "completed"
  const isNearDeadline =
    goal.targetDate &&
    isAfter(new Date(), new Date(goal.targetDate)) &&
    isBefore(new Date(), new Date(Date.now() + 7 * 24 * 60 * 60 * 1000))

  const handleUpdate = async (data: GoalFormData) => {
    setIsLoading(true)
    try {
      await onUpdate(goal.id, data)
      setIsEditOpen(false)
    } catch (error) {
      console.error("Failed to update goal:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async () => {
    if (confirm("Are you sure you want to delete this goal?")) {
      setIsLoading(true)
      try {
        await onDelete(goal.id)
      } catch (error) {
        console.error("Failed to delete goal:", error)
      } finally {
        setIsLoading(false)
      }
    }
  }

  const handleComplete = async () => {
    setIsLoading(true)
    try {
      await onComplete(goal.id)
    } catch (error) {
      console.error("Failed to complete goal:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleStatusChange = async () => {
    const newStatus = goal.status === "active" ? "paused" : "active"
    setIsLoading(true)
    try {
      await onStatusChange(goal.id, newStatus)
    } catch (error) {
      console.error("Failed to change goal status:", error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card
      className={`relative ${isOverdue ? "border-red-200 bg-red-50 dark:bg-red-950/20" : ""}`}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg font-semibold">
              {goal.title}
            </CardTitle>
            <CardDescription className="mt-1">
              {goal.description || "No description provided"}
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Badge className={getStatusColor(goal.status)}>
              {getStatusIcon(goal.status)}
              <span className="ml-1 capitalize">{goal.status}</span>
            </Badge>
            {goal.category && <Badge variant="outline">{goal.category}</Badge>}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Progress Section */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Progress</span>
            <span className="font-medium">{progress.toFixed(1)}%</span>
          </div>
          <Progress value={progress} className="h-2" />
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">
              {formatINR(currentAmount)} of {formatINR(targetAmount)}
            </span>
            <span className="text-muted-foreground">
              {remaining > 0
                ? `${formatINR(remaining)} remaining`
                : "Goal reached!"}
            </span>
          </div>
        </div>

        {/* Target Date */}
        {goal.targetDate && (
          <div className="flex items-center gap-2 text-sm">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">Target:</span>
            <span
              className={`font-medium ${isOverdue ? "text-red-600 dark:text-red-400" : isNearDeadline ? "text-yellow-600 dark:text-yellow-400" : ""}`}
            >
              {format(new Date(goal.targetDate), "MMM dd, yyyy")}
            </span>
            {isOverdue && (
              <Badge variant="destructive" className="ml-auto">
                Overdue
              </Badge>
            )}
            {isNearDeadline && !isOverdue && (
              <Badge variant="secondary" className="ml-auto">
                Due Soon
              </Badge>
            )}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex items-center gap-2 pt-2">
          <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm" disabled={isLoading}>
                <Edit className="h-4 w-4 mr-1" />
                Edit
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Edit Goal</DialogTitle>
                <DialogDescription>
                  Update your goal details and progress.
                </DialogDescription>
              </DialogHeader>
              <GoalForm
                initialData={{
                  title: goal.title,
                  description: goal.description,
                  targetAmount: goal.targetAmount,
                  currentAmount: goal.currentAmount,
                  targetDate: goal.targetDate || "",
                  category: goal.category || "",
                  status: goal.status,
                }}
                onSubmit={handleUpdate}
                onCancel={() => setIsEditOpen(false)}
                isLoading={isLoading}
              />
            </DialogContent>
          </Dialog>

          {goal.status === "active" && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleStatusChange}
              disabled={isLoading}
            >
              <Pause className="h-4 w-4 mr-1" />
              Pause
            </Button>
          )}

          {goal.status === "paused" && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleStatusChange}
              disabled={isLoading}
            >
              <Play className="h-4 w-4 mr-1" />
              Resume
            </Button>
          )}

          {goal.status !== "completed" && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleComplete}
              disabled={isLoading}
            >
              <CheckCircle className="h-4 w-4 mr-1" />
              Complete
            </Button>
          )}

          <Button
            variant="outline"
            size="sm"
            onClick={handleDelete}
            disabled={isLoading}
            className="ml-auto text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

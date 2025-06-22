"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { GoalForm } from "@/components/forms/GoalForm"
import { GoalCard } from "@/components/goals/GoalCard"
import { GoalFormData } from "@/lib/validations/goal"
import { Plus, Search, Filter, Target } from "lucide-react"

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

export default function GoalsPage() {
  const [goals, setGoals] = useState<Goal[]>([])
  const [loading, setLoading] = useState(true)
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [categoryFilter, setCategoryFilter] = useState<string>("all")

  const fetchGoals = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      if (statusFilter !== "all") params.append("status", statusFilter)
      if (categoryFilter !== "all") params.append("category", categoryFilter)

      const response = await fetch(`/api/goals?${params.toString()}`)
      const result = await response.json()

      if (!result.success) {
        throw new Error(result.error || "Failed to fetch goals")
      }

      setGoals(result.data)
    } catch (error) {
      console.error("Failed to fetch goals:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchGoals()
  }, [statusFilter, categoryFilter])

  const handleCreateGoal = async (data: GoalFormData) => {
    try {
      const response = await fetch("/api/goals", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      })

      const result = await response.json()

      if (!result.success) {
        throw new Error(result.error || "Failed to create goal")
      }

      setIsCreateOpen(false)
      fetchGoals() // Refresh the list
    } catch (error) {
      console.error("Failed to create goal:", error)
    }
  }

  const handleUpdateGoal = async (id: string, data: GoalFormData) => {
    try {
      const response = await fetch(`/api/goals/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      })

      const result = await response.json()

      if (!result.success) {
        throw new Error(result.error || "Failed to update goal")
      }

      fetchGoals() // Refresh the list
    } catch (error) {
      console.error("Failed to update goal:", error)
    }
  }

  const handleDeleteGoal = async (id: string) => {
    try {
      const response = await fetch(`/api/goals/${id}`, {
        method: "DELETE",
      })

      const result = await response.json()

      if (!result.success) {
        throw new Error(result.error || "Failed to delete goal")
      }

      fetchGoals() // Refresh the list
    } catch (error) {
      console.error("Failed to delete goal:", error)
    }
  }

  const handleCompleteGoal = async (id: string) => {
    try {
      const response = await fetch(`/api/goals/${id}/complete`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({}),
      })

      const result = await response.json()

      if (!result.success) {
        throw new Error(result.error || "Failed to complete goal")
      }

      fetchGoals() // Refresh the list
    } catch (error) {
      console.error("Failed to complete goal:", error)
    }
  }

  const handleStatusChange = async (
    id: string,
    status: "active" | "paused"
  ) => {
    try {
      const response = await fetch(`/api/goals/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status }),
      })

      const result = await response.json()

      if (!result.success) {
        throw new Error(result.error || "Failed to update goal status")
      }

      fetchGoals() // Refresh the list
    } catch (error) {
      console.error("Failed to update goal status:", error)
    }
  }

  const filteredGoals = goals.filter(goal => {
    const matchesSearch =
      goal.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      goal.description.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesSearch
  })

  const activeGoals = filteredGoals.filter(goal => goal.status === "active")
  const completedGoals = filteredGoals.filter(
    goal => goal.status === "completed"
  )
  const pausedGoals = filteredGoals.filter(goal => goal.status === "paused")

  return (
    <div className="flex flex-1 flex-col gap-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Goals</h1>
          <p className="text-muted-foreground">
            Track your financial goals and progress
          </p>
        </div>

        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              New Goal
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create New Goal</DialogTitle>
              <DialogDescription>
                Set a new financial goal and start tracking your progress.
              </DialogDescription>
            </DialogHeader>
            <GoalForm
              onSubmit={handleCreateGoal}
              onCancel={() => setIsCreateOpen(false)}
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search goals..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex gap-2">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[140px]">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="paused">Paused</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
            </SelectContent>
          </Select>
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-[140px]">
              <Target className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              <SelectItem value="Emergency Fund">Emergency Fund</SelectItem>
              <SelectItem value="Vacation Fund">Vacation Fund</SelectItem>
              <SelectItem value="House Fund">House Fund</SelectItem>
              <SelectItem value="Education Fund">Education Fund</SelectItem>
              <SelectItem value="Retirement">Retirement</SelectItem>
              <SelectItem value="Investment">Investment</SelectItem>
              <SelectItem value="Business">Business</SelectItem>
              <SelectItem value="Other">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Goals Grid */}
      {loading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-64 bg-muted animate-pulse rounded-lg" />
          ))}
        </div>
      ) : (
        <div className="space-y-8">
          {/* Active Goals */}
          {activeGoals.length > 0 && (
            <div>
              <h2 className="text-xl font-semibold mb-4">Active Goals</h2>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {activeGoals.map(goal => (
                  <GoalCard
                    key={goal.id}
                    goal={goal}
                    onUpdate={handleUpdateGoal}
                    onDelete={handleDeleteGoal}
                    onComplete={handleCompleteGoal}
                    onStatusChange={handleStatusChange}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Paused Goals */}
          {pausedGoals.length > 0 && (
            <div>
              <h2 className="text-xl font-semibold mb-4">Paused Goals</h2>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {pausedGoals.map(goal => (
                  <GoalCard
                    key={goal.id}
                    goal={goal}
                    onUpdate={handleUpdateGoal}
                    onDelete={handleDeleteGoal}
                    onComplete={handleCompleteGoal}
                    onStatusChange={handleStatusChange}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Completed Goals */}
          {completedGoals.length > 0 && (
            <div>
              <h2 className="text-xl font-semibold mb-4">Completed Goals</h2>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {completedGoals.map(goal => (
                  <GoalCard
                    key={goal.id}
                    goal={goal}
                    onUpdate={handleUpdateGoal}
                    onDelete={handleDeleteGoal}
                    onComplete={handleCompleteGoal}
                    onStatusChange={handleStatusChange}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Empty State */}
          {filteredGoals.length === 0 && !loading && (
            <div className="text-center py-12">
              <Target className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No goals found</h3>
              <p className="text-muted-foreground mb-4">
                {searchTerm ||
                statusFilter !== "all" ||
                categoryFilter !== "all"
                  ? "Try adjusting your search or filters"
                  : "Create your first financial goal to get started"}
              </p>
              {!searchTerm &&
                statusFilter === "all" &&
                categoryFilter === "all" && (
                  <Button onClick={() => setIsCreateOpen(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Your First Goal
                  </Button>
                )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

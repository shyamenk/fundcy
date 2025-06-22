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
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
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
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Plus, Edit, Trash2, Filter, Search, Loader2 } from "lucide-react"
import { formatINR } from "@/lib/utils"
import { format } from "date-fns"

interface DebitCardExpense {
  id: string
  amount: number
  description: string
  merchant?: string
  category?: string
  cardType?: string
  transactionDate: string
}

const categories = [
  "Groceries",
  "Food & Beverage",
  "Electronics",
  "Shopping",
  "Transportation",
  "Entertainment",
  "Healthcare",
  "Utilities",
  "Education",
  "Travel",
  "Home & Garden",
  "Personal Care",
  "Health & Fitness",
  "Insurance",
  "Pets",
  "Other",
]

const cardTypes = [
  "Visa",
  "Mastercard",
  "RuPay",
  "American Express",
  "Credit Card",
]

const cardTypeColors = {
  Visa: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
  Mastercard:
    "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300",
  RuPay: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
  "American Express":
    "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300",
  "Credit Card": "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
}

export default function DebitExpensesPage() {
  const [expenses, setExpenses] = useState<DebitCardExpense[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedMonth, setSelectedMonth] = useState(
    new Date().toISOString().slice(0, 7)
  )
  const [selectedCategory, setSelectedCategory] = useState<string>("all")
  const [selectedCardType, setSelectedCardType] = useState<string>("all")
  const [searchTerm, setSearchTerm] = useState("")
  const [sortBy, setSortBy] = useState<"date" | "amount" | "description">(
    "date"
  )
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc")
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [editingExpense, setEditingExpense] = useState<DebitCardExpense | null>(
    null
  )
  const [isDeleting, setIsDeleting] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    amount: "",
    description: "",
    merchant: "",
    category: "",
    cardType: "",
    transactionDate: new Date().toISOString().slice(0, 10),
  })

  useEffect(() => {
    fetchExpenses()
  }, [])

  const fetchExpenses = async () => {
    try {
      const response = await fetch("/api/debit-expenses")
      const data = await response.json()
      setExpenses(data.expenses || [])
    } catch (error) {
      console.error("Error fetching expenses:", error)
    } finally {
      setLoading(false)
    }
  }

  const filteredExpenses = expenses.filter(expense => {
    const expenseMonth = expense.transactionDate.slice(0, 7)
    const monthMatch = expenseMonth === selectedMonth
    const categoryMatch =
      selectedCategory === "all" || expense.category === selectedCategory
    const cardTypeMatch =
      selectedCardType === "all" || expense.cardType === selectedCardType
    const searchMatch =
      expense.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      expense.merchant?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      expense.category?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      false
    return monthMatch && categoryMatch && cardTypeMatch && searchMatch
  })

  // Sort expenses
  const sortedExpenses = [...filteredExpenses].sort((a, b) => {
    let comparison = 0

    switch (sortBy) {
      case "date":
        comparison =
          new Date(a.transactionDate).getTime() -
          new Date(b.transactionDate).getTime()
        break
      case "amount":
        comparison = a.amount - b.amount
        break
      case "description":
        comparison = a.description.localeCompare(b.description)
        break
    }

    return sortOrder === "asc" ? comparison : -comparison
  })

  const totalAmount = filteredExpenses.reduce(
    (sum, expense) => sum + expense.amount,
    0
  )

  const handleSort = (field: "date" | "amount" | "description") => {
    if (sortBy === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc")
    } else {
      setSortBy(field)
      setSortOrder("desc")
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const expenseData = {
      ...formData,
      amount: parseFloat(formData.amount),
    }

    try {
      const url = editingExpense
        ? `/api/debit-expenses/${editingExpense.id}`
        : "/api/debit-expenses"
      const method = editingExpense ? "PUT" : "POST"

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(expenseData),
      })

      if (response.ok) {
        fetchExpenses()
        setIsAddDialogOpen(false)
        setEditingExpense(null)
        resetForm()
      }
    } catch (error) {
      console.error("Error saving expense:", error)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this expense?")) return

    setIsDeleting(id)
    try {
      const response = await fetch(`/api/debit-expenses/${id}`, {
        method: "DELETE",
      })

      if (response.ok) {
        fetchExpenses()
      }
    } catch (error) {
      console.error("Error deleting expense:", error)
    } finally {
      setIsDeleting(null)
    }
  }

  const handleEdit = (expense: DebitCardExpense) => {
    setEditingExpense(expense)
    setFormData({
      amount: expense.amount.toString(),
      description: expense.description,
      merchant: expense.merchant || "",
      category: expense.category || "",
      cardType: expense.cardType || "",
      transactionDate: expense.transactionDate,
    })
    setIsAddDialogOpen(true)
  }

  const resetForm = () => {
    setFormData({
      amount: "",
      description: "",
      merchant: "",
      category: "",
      cardType: "",
      transactionDate: new Date().toISOString().slice(0, 10),
    })
  }

  const getAvailableMonths = () => {
    const months = new Set(
      expenses.map(expense => expense.transactionDate.slice(0, 7))
    )
    return Array.from(months).sort().reverse()
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Loading debit card expenses...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Debit Card Expenses
          </h1>
          <p className="text-muted-foreground">
            Track and analyze your debit card spending
          </p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button
              onClick={() => {
                setEditingExpense(null)
                resetForm()
              }}
            >
              <Plus className="mr-2 h-4 w-4" />
              Add Expense
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>
                {editingExpense ? "Edit Expense" : "Add New Expense"}
              </DialogTitle>
              <DialogDescription>
                Enter the details of your debit card expense.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Amount and Date */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="amount">Amount</Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                      ₹
                    </span>
                    <Input
                      id="amount"
                      type="number"
                      step="0.01"
                      required
                      placeholder="0.00"
                      className="pl-8"
                      value={formData.amount}
                      onChange={e =>
                        setFormData({ ...formData, amount: e.target.value })
                      }
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="transactionDate">Date</Label>
                  <Input
                    id="transactionDate"
                    type="date"
                    required
                    value={formData.transactionDate}
                    onChange={e =>
                      setFormData({
                        ...formData,
                        transactionDate: e.target.value,
                      })
                    }
                  />
                </div>
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Input
                  id="description"
                  required
                  placeholder="Enter expense description"
                  value={formData.description}
                  onChange={e =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                />
              </div>

              {/* Merchant */}
              <div className="space-y-2">
                <Label htmlFor="merchant">Merchant</Label>
                <Input
                  id="merchant"
                  placeholder="Enter merchant name"
                  value={formData.merchant}
                  onChange={e =>
                    setFormData({ ...formData, merchant: e.target.value })
                  }
                />
              </div>

              {/* Category and Card Type */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <Select
                    value={formData.category}
                    onValueChange={value =>
                      setFormData({ ...formData, category: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map(category => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cardType">Card Type</Label>
                  <Select
                    value={formData.cardType}
                    onValueChange={value =>
                      setFormData({ ...formData, cardType: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select card type" />
                    </SelectTrigger>
                    <SelectContent>
                      {cardTypes.map(type => (
                        <SelectItem key={type} value={type}>
                          {type}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsAddDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit">
                  {editingExpense ? "Update" : "Add"} Expense
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <Label htmlFor="month" className="mb-2 p-1">
                Month
              </Label>
              <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {getAvailableMonths().map(month => (
                    <SelectItem key={month} value={month}>
                      {new Date(month + "-01").toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                      })}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="category" className="mb-2 p-1">
                Category
              </Label>
              <Select
                value={selectedCategory}
                onValueChange={setSelectedCategory}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All categories</SelectItem>
                  {categories.map(category => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="cardType" className="mb-2 p-1">
                Card Type
              </Label>
              <Select
                value={selectedCardType}
                onValueChange={setSelectedCardType}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All card types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All card types</SelectItem>
                  {cardTypes.map(type => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <div className="mb-2 p-1 text-sm font-medium">Search</div>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search expenses..."
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold">
                {filteredExpenses.length}
              </div>
              <div className="text-sm text-muted-foreground">
                Total Transactions
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">{formatINR(totalAmount)}</div>
              <div className="text-sm text-muted-foreground">Total Amount</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">
                {filteredExpenses.length > 0
                  ? formatINR(totalAmount / filteredExpenses.length)
                  : formatINR(0)}
              </div>
              <div className="text-sm text-muted-foreground">
                Average per Transaction
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Expenses Table */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Expenses</CardTitle>
          <CardDescription>
            Your debit card transactions for{" "}
            {new Date(selectedMonth + "-01").toLocaleDateString("en-US", {
              year: "numeric",
              month: "long",
            })}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead
                    className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800"
                    onClick={() => handleSort("date")}
                  >
                    Date
                    {sortBy === "date" && (
                      <span className="ml-1">
                        {sortOrder === "asc" ? "↑" : "↓"}
                      </span>
                    )}
                  </TableHead>
                  <TableHead
                    className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800"
                    onClick={() => handleSort("description")}
                  >
                    Description
                    {sortBy === "description" && (
                      <span className="ml-1">
                        {sortOrder === "asc" ? "↑" : "↓"}
                      </span>
                    )}
                  </TableHead>
                  <TableHead>Merchant</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Card Type</TableHead>
                  <TableHead
                    className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800"
                    onClick={() => handleSort("amount")}
                  >
                    Amount
                    {sortBy === "amount" && (
                      <span className="ml-1">
                        {sortOrder === "asc" ? "↑" : "↓"}
                      </span>
                    )}
                  </TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedExpenses.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={7}
                      className="text-center py-8 text-gray-500"
                    >
                      No expenses found
                    </TableCell>
                  </TableRow>
                ) : (
                  sortedExpenses.map(expense => (
                    <TableRow key={expense.id}>
                      <TableCell className="font-medium">
                        {format(
                          new Date(expense.transactionDate),
                          "MMM dd, yyyy"
                        )}
                      </TableCell>
                      <TableCell>{expense.description}</TableCell>
                      <TableCell>{expense.merchant || "-"}</TableCell>
                      <TableCell>{expense.category || "No Category"}</TableCell>
                      <TableCell>
                        {expense.cardType && (
                          <Badge
                            className={
                              cardTypeColors[
                                expense.cardType as keyof typeof cardTypeColors
                              ] || "bg-gray-100 text-gray-800"
                            }
                          >
                            {expense.cardType}
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="font-mono">
                        {formatINR(expense.amount)}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEdit(expense)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(expense.id)}
                            disabled={isDeleting === expense.id}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:text-red-300 dark:hover:bg-red-900/20"
                          >
                            {isDeleting === expense.id ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Trash2 className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* Summary */}
          {sortedExpenses.length > 0 && (
            <div className="text-sm text-gray-500 mt-4">
              Showing {sortedExpenses.length} of {expenses.length} expenses
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

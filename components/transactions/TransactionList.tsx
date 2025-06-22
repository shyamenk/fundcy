"use client"

import { useState } from "react"
import { format } from "date-fns"
import { Edit, Trash2, Search, Filter, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Transaction } from "@/types/transaction"

interface TransactionListProps {
  transactions: Transaction[]
  onEdit: (transaction: Transaction) => void
  onDelete: (id: string) => void
  isLoading?: boolean
  isDeleting?: string | null
}

const transactionTypeColors = {
  income: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
  expense: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
  savings: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
  investment:
    "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300",
}

export function TransactionList({
  transactions,
  onEdit,
  onDelete,
  isLoading,
  isDeleting,
}: TransactionListProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [typeFilter, setTypeFilter] = useState<string>("all")
  const [sortBy, setSortBy] = useState<"date" | "amount" | "description">(
    "date"
  )
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc")

  // Filter transactions
  const filteredTransactions = transactions.filter(transaction => {
    const matchesSearch =
      transaction.description
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      transaction.category?.name
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      false
    const matchesType = typeFilter === "all" || transaction.type === typeFilter
    return matchesSearch && matchesType
  })

  // Sort transactions
  const sortedTransactions = [...filteredTransactions].sort((a, b) => {
    let comparison = 0

    switch (sortBy) {
      case "date":
        comparison = new Date(a.date).getTime() - new Date(b.date).getTime()
        break
      case "amount":
        comparison = parseFloat(a.amount) - parseFloat(b.amount)
        break
      case "description":
        comparison = a.description.localeCompare(b.description)
        break
    }

    return sortOrder === "asc" ? comparison : -comparison
  })

  const formatAmount = (amount: string, type: string) => {
    const numAmount = parseFloat(amount)
    const formatted = new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(numAmount)

    return type === "expense" ? `-${formatted}` : formatted
  }

  const handleSort = (field: "date" | "amount" | "description") => {
    if (sortBy === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc")
    } else {
      setSortBy(field)
      setSortOrder("desc")
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 dark:border-white"></div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Filters and Search */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search transactions..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-full sm:w-48">
            <Filter className="mr-2 h-4 w-4" />
            <SelectValue placeholder="Filter by type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="income">Income</SelectItem>
            <SelectItem value="expense">Expense</SelectItem>
            <SelectItem value="savings">Savings</SelectItem>
            <SelectItem value="investment">Investment</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Transactions Table */}
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
              <TableHead>Category</TableHead>
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
              <TableHead>Type</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedTransactions.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={7}
                  className="text-center py-8 text-gray-500"
                >
                  No transactions found
                </TableCell>
              </TableRow>
            ) : (
              sortedTransactions.map(transaction => (
                <TableRow key={transaction.id}>
                  <TableCell className="font-medium">
                    {format(new Date(transaction.date), "MMM dd, yyyy")}
                  </TableCell>
                  <TableCell>{transaction.description}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {transaction.category?.color && (
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{
                            backgroundColor: transaction.category.color,
                          }}
                        />
                      )}
                      {transaction.category?.name || "No Category"}
                    </div>
                  </TableCell>
                  <TableCell className="font-mono">
                    {formatAmount(transaction.amount, transaction.type)}
                  </TableCell>
                  <TableCell>
                    <Badge className={transactionTypeColors[transaction.type]}>
                      {transaction.type.charAt(0).toUpperCase() +
                        transaction.type.slice(1)}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onEdit(transaction)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onDelete(transaction.id)}
                        disabled={isDeleting === transaction.id}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:text-red-300 dark:hover:bg-red-900/20"
                      >
                        {isDeleting === transaction.id ? (
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
      {sortedTransactions.length > 0 && (
        <div className="text-sm text-gray-500">
          Showing {sortedTransactions.length} of {transactions.length}{" "}
          transactions
        </div>
      )}
    </div>
  )
}

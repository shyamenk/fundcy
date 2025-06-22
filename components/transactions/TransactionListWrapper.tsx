"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { TransactionList } from "./TransactionList"
import { PaginationControls } from "./PaginationControls"
import { deleteTransaction } from "@/lib/server-actions/transactions"
import { Transaction } from "@/types/transaction"

interface PaginationInfo {
  page: number
  limit: number
  total: number
  totalPages: number
  hasNextPage: boolean
  hasPrevPage: boolean
}

interface TransactionListWrapperProps {
  transactions: Transaction[]
  pagination?: PaginationInfo
}

export function TransactionListWrapper({
  transactions,
  pagination,
}: TransactionListWrapperProps) {
  const router = useRouter()
  const [isDeleting, setIsDeleting] = useState<string | null>(null)

  const handleEdit = (transaction: Transaction) => {
    router.push(`/transactions/${transaction.id}/edit`)
  }

  const handleDelete = async (id: string) => {
    if (
      !confirm(
        "Are you sure you want to delete this transaction? This action cannot be undone."
      )
    ) {
      return
    }

    setIsDeleting(id)
    try {
      const result = await deleteTransaction(id)
      if (result.success) {
        toast.success("Transaction deleted successfully")
        // Refresh the page to show updated list
        router.refresh()
      } else {
        toast.error("Failed to delete transaction. Please try again.")
      }
    } catch (error) {
      console.error("Error deleting transaction:", error)
      toast.error("An error occurred while deleting the transaction.")
    } finally {
      setIsDeleting(null)
    }
  }

  return (
    <div className="space-y-4">
      <TransactionList
        transactions={transactions}
        onEdit={handleEdit}
        onDelete={handleDelete}
        isDeleting={isDeleting}
      />

      {pagination && <PaginationControls pagination={pagination} />}
    </div>
  )
}

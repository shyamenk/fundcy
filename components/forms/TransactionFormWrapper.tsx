"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { TransactionForm } from "./TransactionForm"
import {
  createTransaction,
  updateTransaction,
} from "@/lib/server-actions/transactions"
import { TransactionInput } from "@/lib/validations/transaction"
import { useParams } from "next/navigation"
import { Category } from "@/types/transaction"

interface TransactionFormWrapperProps {
  categories: Category[]
  initialData?: Partial<TransactionInput>
}

export function TransactionFormWrapper({
  categories,
  initialData,
}: TransactionFormWrapperProps) {
  const params = useParams()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const isEditing = !!initialData

  const handleSubmit = async (
    data: TransactionInput,
    resetForm: () => void
  ) => {
    setIsLoading(true)
    try {
      // Log the data being submitted
      console.log("Submitting transaction:", data)
      // Convert FormData to the expected format
      const formData = new FormData()
      formData.append("type", data.type)
      formData.append("amount", data.amount.toString())
      formData.append("description", data.description)
      formData.append("categoryId", data.categoryId)
      formData.append("date", data.date)

      if (isEditing && params.id) {
        const result = await updateTransaction(params.id as string, formData)
        if (result?.error) {
          toast.error("Failed to update transaction")
          return
        }
        toast.success("Transaction updated successfully")
      } else {
        const result = await createTransaction(formData)
        if (result?.error) {
          toast.error("Failed to create transaction")
          return
        }
        toast.success("Transaction added successfully")
        // Reset form after successful creation
        resetForm()
      }

      // Navigate back to transactions list
      router.push("/transactions")
    } catch (error) {
      console.error("Error saving transaction:", error)
      toast.error("An unexpected error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <TransactionForm
      categories={categories}
      onSubmit={handleSubmit}
      initialData={initialData}
      isLoading={isLoading}
    />
  )
}

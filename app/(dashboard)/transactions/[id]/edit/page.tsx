import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { TransactionFormWrapper } from "@/components/forms/TransactionFormWrapper"
import { getTransaction } from "@/lib/server-actions/transactions"
import { getCategories } from "@/lib/server-actions/categories"
import Link from "next/link"
import { notFound } from "next/navigation"

interface EditTransactionPageProps {
  params: Promise<{
    id: string
  }>
}

export default async function EditTransactionPage({
  params,
}: EditTransactionPageProps) {
  const { id } = await params

  const [transactionResult, categoriesResult] = await Promise.all([
    getTransaction(id),
    getCategories(),
  ])

  if (transactionResult.error || !transactionResult.transaction) {
    notFound()
  }

  const transaction = transactionResult.transaction
  const categories = categoriesResult.categories || []

  // Convert transaction data to form format
  const initialData = {
    type: transaction.type,
    amount: parseFloat(transaction.amount),
    description: transaction.description,
    categoryId: transaction.categoryId || "",
    date: transaction.date,
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/transactions">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Transactions
          </Button>
        </Link>
      </div>

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Edit Transaction
          </h1>
          <p className="text-muted-foreground">Update transaction details</p>
        </div>
      </div>

      {/* Transaction Form */}
      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle>Transaction Details</CardTitle>
          <CardDescription>
            Update the details below to modify this transaction
          </CardDescription>
        </CardHeader>
        <CardContent>
          <TransactionFormWrapper
            categories={categories}
            initialData={initialData}
          />
        </CardContent>
      </Card>
    </div>
  )
}

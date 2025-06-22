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
import { getCategories } from "@/lib/server-actions/categories"
import Link from "next/link"

export default async function AddTransactionPage() {
  const categoriesResult = await getCategories()
  const categories = categoriesResult.categories || []

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
          <h1 className="text-3xl font-bold tracking-tight">Add Transaction</h1>
          <p className="text-muted-foreground">
            Create a new transaction to track your finances
          </p>
        </div>
      </div>

      {/* Transaction Form */}
      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle>Transaction Details</CardTitle>
          <CardDescription>
            Fill in the details below to add a new transaction
          </CardDescription>
        </CardHeader>
        <CardContent>
          <TransactionFormWrapper categories={categories} />
        </CardContent>
      </Card>
    </div>
  )
}

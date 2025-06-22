import { Suspense } from "react"
import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { TransactionListWrapper } from "@/components/transactions/TransactionListWrapper"
import { getTransactions } from "@/lib/server-actions/transactions"
import Link from "next/link"

interface TransactionsPageProps {
  searchParams: Promise<{
    page?: string
    limit?: string
  }>
}

export default async function TransactionsPage({
  searchParams,
}: TransactionsPageProps) {
  const { page: pageParam, limit: limitParam } = await searchParams
  const page = parseInt(pageParam || "1")
  const limit = parseInt(limitParam || "10")

  const transactionsResult = await getTransactions(page, limit)
  const transactions = transactionsResult.transactions || []
  const pagination = transactionsResult.pagination

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Transactions</h1>
          <p className="text-muted-foreground">
            Manage your income, expenses, savings, and investments
          </p>
        </div>
        <Link href="/transactions/add">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Add Transaction
          </Button>
        </Link>
      </div>

      {/* Transaction List */}
      <Suspense fallback={<div>Loading transactions...</div>}>
        <TransactionListWrapper
          transactions={transactions}
          pagination={pagination}
        />
      </Suspense>
    </div>
  )
}

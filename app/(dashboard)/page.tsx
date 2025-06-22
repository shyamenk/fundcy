import { StatCard } from "@/components/shared/StatCard"
import { DollarSign, CreditCard, Landmark, Users } from "lucide-react"

export default function DashboardPage() {
  return (
    <div className="flex flex-1 flex-col gap-4">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Balance"
          value="$74,503.00"
          description="Total earned last time +$14,503.00"
          icon={DollarSign}
        />
        <StatCard
          title="Total Income"
          value="$101,333.00"
          description="+$458.00 this month"
          icon={Landmark}
        />
        <StatCard
          title="Total Expense"
          value="$26,830.00"
          description="7.4% APR"
          icon={CreditCard}
        />
        <StatCard
          title="Remaining Monthly"
          value="69%"
          description="Additional AVG 2.4%"
          icon={Users}
        />
      </div>
      <div>
        {/* Placeholder for the main charts and transaction history */}
        <h2 className="text-xl font-semibold">
          Money Flow & Transaction History
        </h2>
        <p className="text-muted-foreground">
          Charts and tables will be implemented in the next phases.
        </p>
      </div>
    </div>
  )
}

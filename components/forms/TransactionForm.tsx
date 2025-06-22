"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { CalendarIcon, Loader2 } from "lucide-react"
import { format } from "date-fns"
import { Calendar } from "@/components/ui/calendar"
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
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import {
  transactionSchema,
  TransactionInput,
} from "@/lib/validations/transaction"
import { Category } from "@/types/transaction"

interface TransactionFormProps {
  categories: Category[]
  onSubmit: (data: TransactionInput, resetForm: () => void) => Promise<void>
  initialData?: Partial<TransactionInput>
  isLoading?: boolean
}

const transactionTypes = [
  { value: "income", label: "Income" },
  { value: "expense", label: "Expense" },
  { value: "savings", label: "Savings" },
  { value: "investment", label: "Investment" },
]

export function TransactionForm({
  categories,
  onSubmit,
  initialData,
  isLoading,
}: TransactionFormProps) {
  const [date, setDate] = useState<Date | undefined>(
    initialData?.date ? new Date(initialData.date) : new Date()
  )

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset,
  } = useForm<TransactionInput>({
    resolver: zodResolver(transactionSchema),
    defaultValues: {
      type: initialData?.type || "expense",
      amount: initialData?.amount || 0,
      description: initialData?.description || "",
      categoryId: initialData?.categoryId || "",
      date: initialData?.date || format(new Date(), "yyyy-MM-dd"),
    },
  })

  const watchedType = watch("type")
  const filteredCategories = categories.filter(
    category => category.type === watchedType
  )

  const resetForm = () => {
    reset({
      type: "expense",
      amount: 0,
      description: "",
      categoryId: "",
      date: format(new Date(), "yyyy-MM-dd"),
    })
    setDate(new Date())
  }

  const handleFormSubmit = async (data: TransactionInput) => {
    if (date) {
      data.date = format(date, "yyyy-MM-dd")
    }
    await onSubmit(data, resetForm)
  }

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      {/* Transaction Type */}
      <div className="space-y-2">
        <Label htmlFor="type">Transaction Type</Label>
        <Select
          value={watchedType}
          onValueChange={value => {
            setValue(
              "type",
              value as "income" | "expense" | "savings" | "investment"
            )
            setValue("categoryId", "") // Reset category when type changes
          }}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select transaction type" />
          </SelectTrigger>
          <SelectContent>
            {transactionTypes.map(type => (
              <SelectItem key={type.value} value={type.value}>
                {type.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.type && (
          <p className="text-sm text-red-500">{errors.type.message}</p>
        )}
      </div>

      {/* Amount */}
      <div className="space-y-2">
        <Label htmlFor="amount">Amount</Label>
        <div className="relative">
          <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
            $
          </span>
          <Input
            {...register("amount", { valueAsNumber: true })}
            type="number"
            step="0.01"
            min="0.01"
            placeholder="0.00"
            className="pl-8"
          />
        </div>
        {errors.amount && (
          <p className="text-sm text-red-500">{errors.amount.message}</p>
        )}
      </div>

      {/* Description */}
      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Input
          {...register("description")}
          placeholder="Enter transaction description"
        />
        {errors.description && (
          <p className="text-sm text-red-500">{errors.description.message}</p>
        )}
      </div>

      {/* Category */}
      <div className="space-y-2">
        <Label htmlFor="categoryId">Category</Label>
        <Select
          value={watch("categoryId")}
          onValueChange={value => setValue("categoryId", value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select category" />
          </SelectTrigger>
          <SelectContent>
            {filteredCategories.map(category => (
              <SelectItem key={category.id} value={category.id}>
                <div className="flex items-center gap-2">
                  {category.color && (
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: category.color }}
                    />
                  )}
                  {category.name}
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.categoryId && (
          <p className="text-sm text-red-500">{errors.categoryId.message}</p>
        )}
      </div>

      {/* Date */}
      <div className="space-y-2">
        <Label htmlFor="date">Date</Label>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "w-full justify-start text-left font-normal",
                !date && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {date ? format(date, "PPP") : <span>Pick a date</span>}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0">
            <Calendar
              mode="single"
              selected={date}
              onSelect={setDate}
              initialFocus
            />
          </PopoverContent>
        </Popover>
        {errors.date && (
          <p className="text-sm text-red-500">{errors.date.message}</p>
        )}
      </div>

      {/* Submit Button */}
      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        {initialData ? "Update Transaction" : "Add Transaction"}
      </Button>
    </form>
  )
}

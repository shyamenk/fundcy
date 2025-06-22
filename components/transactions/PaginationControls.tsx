"use client"

import { useRouter, useSearchParams } from "next/navigation"

interface PaginationInfo {
  page: number
  limit: number
  total: number
  totalPages: number
  hasNextPage: boolean
  hasPrevPage: boolean
}

interface PaginationControlsProps {
  pagination: PaginationInfo
}

export function PaginationControls({ pagination }: PaginationControlsProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const handlePageChange = (page: number) => {
    const params = new URLSearchParams(searchParams)
    params.set("page", page.toString())
    router.push(`/transactions?${params.toString()}`)
  }

  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center space-x-2">
        <button
          onClick={() => handlePageChange(pagination.page - 1)}
          disabled={!pagination.hasPrevPage}
          className="px-3 py-1 text-sm border rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-800"
        >
          Previous
        </button>

        <span className="text-sm">
          Page {pagination.page} of {pagination.totalPages}
        </span>

        <button
          onClick={() => handlePageChange(pagination.page + 1)}
          disabled={!pagination.hasNextPage}
          className="px-3 py-1 text-sm border rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-800"
        >
          Next
        </button>
      </div>
    </div>
  )
}

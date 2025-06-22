import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Format number as Indian Rupees (INR)
 * @param amount - The amount to format
 * @param showDecimals - Whether to show decimal places (default: false)
 * @returns Formatted INR string with ₹ symbol
 */
export function formatINR(
  amount: number,
  showDecimals: boolean = false
): string {
  const formatter = new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: showDecimals ? 2 : 0,
    maximumFractionDigits: showDecimals ? 2 : 0,
  })

  // Extract the formatted number without the currency symbol
  const formattedNumber = formatter.format(amount).replace("₹", "").trim()

  // Return with custom ₹ symbol formatting
  return `₹${formattedNumber}`
}

/**
 * Format number as compact INR (e.g., ₹1.2L, ₹1.5Cr)
 * @param amount - The amount to format
 * @returns Compact INR string
 */
export function formatCompactINR(amount: number): string {
  if (amount >= 10000000) {
    return `₹${(amount / 10000000).toFixed(1)}Cr`
  } else if (amount >= 100000) {
    return `₹${(amount / 100000).toFixed(1)}L`
  } else if (amount >= 1000) {
    return `₹${(amount / 1000).toFixed(1)}K`
  } else {
    return formatINR(amount)
  }
}

import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number): string {
  let currency = "IDR";
  if (typeof window !== "undefined") {
    currency = window.localStorage.getItem("topup_currency") || "IDR";
  }

  if (currency === "USD") {
    // Convert IDR to USD with approximate rate (1 USD = 15,000 IDR)
    const usdAmount = amount / 15000;
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(usdAmount);
  }

  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatDate(date: string | Date): string {
  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(date));
}

export function generateInvoice(): string {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const random = Math.floor(Math.random() * 10000)
    .toString()
    .padStart(4, "0");
  return `INV-${year}${month}${day}-${random}`;
}

export function generateRefId(invoice: string): string {
  return `TX-${invoice}`;
}

export function calculateProfit(buyPrice: number, sellPrice: number): number {
  return sellPrice - buyPrice;
}

export function calculateAdminFee(amount: number, percentage: number = 0): number {
  return Math.round(amount * (percentage / 100));
}

export function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    pending: "text-yellow-500",
    processing: "text-blue-500",
    success: "text-green-500",
    failed: "text-red-500",
    paid: "text-green-500",
    expired: "text-gray-500",
  };
  return colors[status.toLowerCase()] || "text-gray-500";
}

export function getStatusBgColor(status: string): string {
  const colors: Record<string, string> = {
    pending: "bg-amber-50 text-amber-500",
    processing: "bg-blue-50 text-blue-500",
    success: "bg-emerald-50 text-emerald-500",
    failed: "bg-red-50 text-red-500",
    paid: "bg-emerald-50 text-emerald-500",
    expired: "bg-gray-100 text-gray-500",
  };
  return colors[status.toLowerCase()] || "bg-gray-100 text-gray-500";
}

export function truncateText(text: string, length: number): string {
  if (text.length <= length) return text;
  return text.slice(0, length) + "...";
}

export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}
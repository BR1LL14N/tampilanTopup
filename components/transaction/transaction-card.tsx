import { Transaction } from "@/types"
import { Card } from "@/components/ui/card"
import { formatCurrency, formatDate, getStatusBgColor } from "@/lib/utils"
import {
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  ArrowRight,
} from "lucide-react"
import Link from "next/link"
import { GameIcon } from "@/components/game/game-icon"

interface TransactionCardProps {
  transaction: Transaction
}

export function TransactionCard({ transaction }: TransactionCardProps) {
  const statusIcons = {
    pending: <Clock className="h-4 w-4" />,
    processing: <AlertCircle className="h-4 w-4" />,
    success: <CheckCircle className="h-4 w-4" />,
    failed: <XCircle className="h-4 w-4" />,
  }

  return (
    <Link href={`/history/${transaction.invoice}`}>
      <Card className="p-4 hover:border-primary/50 transition-all duration-300">
        <div className="flex items-center justify-between mb-3">
          <div>
            <p className="text-sm text-muted-foreground">
              {formatDate(transaction.created_at)}
            </p>
            <p className="font-semibold">{transaction.invoice}</p>
          </div>
          <span
            className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${getStatusBgColor(
              transaction.topup_status
            )}`}
          >
            {statusIcons[transaction.topup_status]}
            {transaction.topup_status}
          </span>
        </div>

        {transaction.product && (
          <div className="flex items-center gap-3 p-3 bg-white/5 rounded-lg mb-3">
            <GameIcon slug={transaction.product.game?.name.toLowerCase().replace(/ /g, "-") || "gamepad-2"} className="h-6 w-6 text-muted-foreground" />
            <div>
              <p className="font-medium">
                {transaction.product.name}
              </p>
              <p className="text-sm text-muted-foreground">
                ID: {transaction.target_id}
              </p>
            </div>
          </div>
        )}

        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-muted-foreground">Total</p>
            <p className="text-lg font-bold">
              {formatCurrency(transaction.amount)}
            </p>
          </div>
          <ArrowRight className="h-5 w-5 text-muted-foreground" />
        </div>
      </Card>
    </Link>
  )
}

interface TransactionTableProps {
  transactions: Transaction[]
}

export function TransactionTable({ transactions }: TransactionTableProps) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-white/10">
            <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">
              Invoice
            </th>
            <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">
              Produk
            </th>
            <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">
              Target
            </th>
            <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">
              Jumlah
            </th>
            <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">
              Status
            </th>
            <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">
              Tanggal
            </th>
          </tr>
        </thead>
        <tbody>
          {transactions.map((tx) => (
            <tr
              key={tx.id}
              className="border-b border-white/5 hover:bg-white/5 transition-colors"
            >
              <td className="py-3 px-4">
                <span className="font-mono text-sm">{tx.invoice}</span>
              </td>
              <td className="py-3 px-4">
                {tx.product?.name || "N/A"}
              </td>
              <td className="py-3 px-4">{tx.target_id}</td>
              <td className="py-3 px-4 font-semibold">
                {formatCurrency(tx.amount)}
              </td>
              <td className="py-3 px-4">
                <span
                  className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium ${getStatusBgColor(
                    tx.topup_status
                  )}`}
                >
                  {tx.topup_status}
                </span>
              </td>
              <td className="py-3 px-4 text-sm text-muted-foreground">
                {formatDate(tx.created_at)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
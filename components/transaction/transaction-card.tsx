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
import { getGameAssetByName, getItemAssetForProduct } from "@/lib/assets"

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
      <Card className="p-4 hover:border-sky/50 transition-all duration-300">
        <div className="flex items-center justify-between mb-3">
          <div>
            <p className="text-sm text-white/80">
              {formatDate(transaction.created_at)}
            </p>
            <p className="font-semibold text-white">{transaction.invoice}</p>
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
          <div className="flex items-center gap-3 p-3 bg-sky/20 rounded-lg mb-3">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-mist backdrop-blur-md border border-sky/30 p-1.5">
              <img
                src={getItemAssetForProduct(
                  transaction.product.name,
                  transaction.product.provider_sku,
                  transaction.product.game?.name
                )}
                alt=""
                className="max-h-full max-w-full object-contain"
              />
            </span>
            <div>
              {transaction.product.game && (
                <p className="flex items-center gap-1.5 text-[10px] font-black text-sky uppercase tracking-wider leading-none">
                  <img
                    src={getGameAssetByName(transaction.product.game.name)?.icon}
                    alt=""
                    className="h-3.5 w-3.5 rounded object-cover"
                  />
                  {transaction.product.game.name}
                </p>
              )}
              <p className="font-bold text-white text-sm mt-1">
                {transaction.product.name}
              </p>
              <p className="text-xs text-white/80 mt-0.5 font-medium">
                ID: {transaction.target_id}
              </p>
            </div>
          </div>
        )}

        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-white/80">Total</p>
            <p className="text-lg font-bold text-white">
              {formatCurrency(transaction.amount)}
            </p>
          </div>
          <ArrowRight className="h-5 w-5 text-white/80" />
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
          <tr className="border-b border-sky/30">
            <th className="text-left py-3 px-4 text-sm font-medium text-white/80">
              Invoice
            </th>
            <th className="text-left py-3 px-4 text-sm font-medium text-white/80">
              Produk
            </th>
            <th className="text-left py-3 px-4 text-sm font-medium text-white/80">
              Target
            </th>
            <th className="text-left py-3 px-4 text-sm font-medium text-white/80">
              Jumlah
            </th>
            <th className="text-left py-3 px-4 text-sm font-medium text-white/80">
              Status
            </th>
            <th className="text-left py-3 px-4 text-sm font-medium text-white/80">
              Tanggal
            </th>
          </tr>
        </thead>
        <tbody>
          {transactions.map((tx) => (
            <tr
              key={tx.id}
              className="border-b border-sky/30 hover:bg-sky/20 transition-colors"
            >
              <td className="py-3 px-4">
                <span className="font-mono text-sm text-white">{tx.invoice}</span>
              </td>
              <td className="py-3 px-4">
                <div className="flex items-center gap-2">
                  {tx.product && (
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded bg-mist backdrop-blur-md border border-sky/30 p-1">
                      <img
                        src={getItemAssetForProduct(tx.product.name, tx.product.provider_sku, tx.product.game?.name)}
                        alt=""
                        className="max-h-full max-w-full object-contain"
                      />
                    </span>
                  )}
                  <span className="text-white">{tx.product?.name || "N/A"}</span>
                </div>
              </td>
              <td className="py-3 px-4 text-white">{tx.target_id}</td>
              <td className="py-3 px-4 font-semibold text-white">
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
              <td className="py-3 px-4 text-sm text-white/80">
                {formatDate(tx.created_at)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

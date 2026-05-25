"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { TransactionCard } from "@/components/transaction/transaction-card"
import { Search, Filter, Loader2 } from "lucide-react"

// Mock transactions
const mockTransactions = [
  {
    id: "1",
    invoice: "INV-20260525-0001",
    target_id: "12345678",
    amount: 25000,
    payment_status: "paid",
    topup_status: "success",
    created_at: "2026-05-25T10:30:00Z",
    product: {
      name: "86 Diamonds",
      game: { icon: "🎮", name: "Mobile Legends" },
    },
  },
  {
    id: "2",
    invoice: "INV-20260524-0001",
    target_id: "98765432",
    amount: 18000,
    payment_status: "paid",
    topup_status: "success",
    created_at: "2026-05-24T15:45:00Z",
    product: {
      name: "70 Diamonds + 10 Bonus",
      game: { icon: "🔥", name: "Free Fire" },
    },
  },
  {
    id: "3",
    invoice: "INV-20260523-0001",
    target_id: "55556666",
    amount: 22000,
    payment_status: "paid",
    topup_status: "processing",
    created_at: "2026-05-23T08:20:00Z",
    product: {
      name: "60 UC",
      game: { icon: "🎯", name: "PUBG Mobile" },
    },
  },
]

export default function HistoryPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const filteredTransactions = mockTransactions.filter(
    (tx) =>
      tx.invoice.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tx.target_id.includes(searchQuery)
  )

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 py-8">
        <div className="container">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl md:text-4xl font-bold mb-2">
              Riwayat Transaksi
            </h1>
            <p className="text-muted-foreground">
              Lihat semua transaksi top up kamu
            </p>
          </div>

          {/* Search and Filter */}
          <div className="flex flex-col sm:flex-row gap-4 mb-8">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Cari invoice atau ID player..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button variant="outline" className="gap-2">
              <Filter className="h-4 w-4" />
              Filter
            </Button>
          </div>

          {/* Transactions */}
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : filteredTransactions.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredTransactions.map((tx) => (
                <TransactionCard
                  key={tx.id}
                  transaction={tx as any}
                />
              ))}
            </div>
          ) : (
            <Card className="p-12 text-center">
              <CardContent className="pt-6">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-white/5 flex items-center justify-center">
                  <Search className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="font-semibold mb-2">Tidak ada transaksi</h3>
                <p className="text-muted-foreground mb-6">
                  {searchQuery
                    ? "Transaksi tidak ditemukan"
                    : "Kamu belum memiliki transaksi"}
                </p>
                <Link href="/games">
                  <Button>Mulai Top Up</Button>
                </Link>
              </CardContent>
            </Card>
          )}
        </div>
      </main>

      <Footer />
    </div>
  )
}
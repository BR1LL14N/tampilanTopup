"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { SidebarContentWrapper } from "@/components/layout/sidebar-content-wrapper"
import { Skeleton } from "@/components/ui/skeleton"
import { TransactionCard } from "@/components/transaction/transaction-card"
import { Search, Filter, Loader2 } from "lucide-react"
import { getGameAssetByName } from "@/lib/assets"

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
      game: { icon: getGameAssetByName("Mobile Legends")?.icon, name: "Mobile Legends" },
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
      game: { icon: getGameAssetByName("Free Fire")?.icon, name: "Free Fire" },
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
      game: { icon: getGameAssetByName("PUBG Mobile")?.icon, name: "PUBG Mobile" },
    },
  },
]

export default function HistoryPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [gameFilter, setGameFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")
  const [transactions, setTransactions] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const res = await fetch("/api/user/dashboard")
        const dataJson = await res.json()

        if (dataJson.transactions && dataJson.transactions.length > 0) {
          const mapped = dataJson.transactions.map((tx: any) => ({
            id: tx.invoice,
            invoice: tx.invoice,
            target_id: tx.target_id,
            amount: Number(tx.amount),
            payment_status: tx.payment_status,
            topup_status: tx.topup_status,
            created_at: tx.created_at,
            product: {
              name: tx.product_name,
              game: {
                name: tx.game_name,
                icon: getGameAssetByName(tx.game_name)?.icon,
              }
            }
          }))
          setTransactions(mapped)
          return
        }

        // Fallback to mock data if not logged in or no transactions
        setTransactions(mockTransactions)
      } catch (err) {
        console.error("Failed to load transactions:", err)
        setTransactions(mockTransactions)
      } finally {
        setIsLoading(false)
      }
    }

    fetchTransactions()
  }, [])

  const availableGames = Array.from(new Set(transactions.map((t) => t.product?.game?.name).filter(Boolean)))

  const filteredTransactions = transactions.filter((tx) => {
    // Game filter
    if (gameFilter !== "all" && tx.product?.game?.name !== gameFilter) return false
    // Status filter
    if (statusFilter !== "all") {
      const currentStatus = tx.topup_status === "success" ? "success" : tx.topup_status === "failed" ? "failed" : "pending"
      if (currentStatus !== statusFilter) return false
    }
    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      const matchInvoice = tx.invoice.toLowerCase().includes(q)
      const matchTarget = tx.target_id.includes(q)
      const matchProduct = tx.product?.name && tx.product.name.toLowerCase().includes(q)
      const matchGame = tx.product?.game?.name && tx.product.game.name.toLowerCase().includes(q)
      if (!matchInvoice && !matchTarget && !matchProduct && !matchGame) return false
    }
    return true
  })

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <SidebarContentWrapper>
        <main className="flex-1 py-8">
        <div className="container">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl md:text-4xl font-bold mb-2 text-white">
              Riwayat Transaksi
            </h1>
            <p className="text-white/60">
              Lihat semua transaksi top up kamu
            </p>
          </div>

          {/* Search and Filter */}
          <div className="space-y-3 mb-8">
            <form onSubmit={(e) => {
              e.preventDefault();
              if (!searchQuery.trim()) return;
              const inv = searchQuery.trim().toUpperCase();
              if (inv.startsWith("INV") || inv.startsWith("ADM") || inv.length >= 8) {
                window.location.href = `/history/${encodeURIComponent(inv)}`;
              }
            }} className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/60" />
                <Input
                  placeholder="Masukkan Nomor Invoice (misal: INV-2026... atau ADM...) atau ID Player"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 uppercase tracking-wider font-mono text-sm bg-black/30 border-sky/20"
                />
              </div>
              <Button type="submit" className="bg-sky hover:bg-sky-600 text-white font-black uppercase tracking-wider px-6">
                Cek Struk Transaksi
              </Button>
            </form>

            {/* Quick Game & Status Filter Pills/Dropdowns */}
            <div className="flex items-center gap-2 flex-wrap">
              <div className="relative">
                <select
                  value={gameFilter}
                  onChange={(e) => setGameFilter(e.target.value)}
                  className="bg-[#142d3a] border border-sky/20 hover:border-sky/40 text-white text-xs font-bold rounded-xl px-3 py-1.5 focus:outline-none focus:border-sky cursor-pointer appearance-none pr-8 transition-colors"
                >
                  <option value="all" className="bg-[#0f1f28] text-white">🎮 Semua Game</option>
                  {availableGames.map((gameName) => (
                    <option key={gameName} value={gameName} className="bg-[#0f1f28] text-white">
                      {gameName}
                    </option>
                  ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-white/50 text-[9px]">
                  ▼
                </div>
              </div>

              <div className="relative">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="bg-[#142d3a] border border-sky/20 hover:border-sky/40 text-white text-xs font-bold rounded-xl px-3 py-1.5 focus:outline-none focus:border-sky cursor-pointer appearance-none pr-8 transition-colors"
                >
                  <option value="all" className="bg-[#0f1f28] text-white">🏷️ Semua Status</option>
                  <option value="success" className="bg-[#0f1f28] text-emerald-400">🟢 Berhasil</option>
                  <option value="pending" className="bg-[#0f1f28] text-amber-400">🟡 Diproses</option>
                  <option value="failed" className="bg-[#0f1f28] text-red-400">🔴 Gagal</option>
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-white/50 text-[9px]">
                  ▼
                </div>
              </div>

              {(gameFilter !== "all" || statusFilter !== "all" || searchQuery) && (
                <button
                  onClick={() => {
                    setGameFilter("all");
                    setStatusFilter("all");
                    setSearchQuery("");
                  }}
                  className="text-xs text-sky hover:text-white font-bold underline px-1 transition-colors"
                >
                  Reset Filter
                </button>
              )}
            </div>
          </div>

          {/* Transactions */}
          {isLoading ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="bg-mist backdrop-blur-md p-5 rounded-[20px] border border-sky/30 shadow-sky-soft space-y-4">
                  <div className="flex items-center gap-3">
                    <Skeleton className="h-10 w-10 rounded-lg bg-sky/10" />
                    <div className="space-y-2 flex-1">
                      <Skeleton className="h-4 w-24 rounded bg-sky/10" />
                      <Skeleton className="h-3.5 w-32 rounded bg-sky/10" />
                    </div>
                  </div>
                  <div className="space-y-2 pt-3 border-t border-sky/30">
                    <div className="flex justify-between">
                      <Skeleton className="h-3.5 w-16 rounded bg-sky/10" />
                      <Skeleton className="h-3.5 w-24 rounded bg-sky/10" />
                    </div>
                    <div className="flex justify-between">
                      <Skeleton className="h-4 w-20 rounded bg-sky/10" />
                      <Skeleton className="h-4 w-12 rounded bg-sky/10" />
                    </div>
                  </div>
                </div>
              ))}
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
            <Card className="p-12 text-center bg-mist backdrop-blur-md rounded-[20px] border border-sky/30 shadow-sky-soft">
              <CardContent className="pt-6">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-sky/20 flex items-center justify-center">
                  <Search className="h-8 w-8 text-white/60" />
                </div>
                <h3 className="font-semibold mb-2 text-white">Tidak ada transaksi</h3>
                <p className="text-white/60 mb-6">
                  {searchQuery
                    ? "Transaksi tidak ditemukan"
                    : "Kamu belum memiliki transaksi"}
                </p>
                <Link href="/games">
                  <Button className="bg-sky hover:bg-diamond text-white">Mulai Top Up</Button>
                </Link>
              </CardContent>
            </Card>
          )}
        </div>
        </main>

        <Footer />
      </SidebarContentWrapper>
    </div>
  )
}
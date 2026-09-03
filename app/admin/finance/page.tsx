"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Header } from "@/components/layout/header"
import { SidebarContentWrapper } from "@/components/layout/sidebar-content-wrapper"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Skeleton } from "@/components/ui/skeleton"
import { formatCurrency, formatDate } from "@/lib/utils"
import { getCachedUser, setCachedUser } from "@/lib/auth-cache"
import {
  Wallet,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Calendar,
  RefreshCw,
  Download,
  ShoppingBag,
  Percent,
  Gamepad2,
  CheckCircle2,
  Clock,
  XCircle,
  ArrowUpRight,
  ShieldCheck,
} from "lucide-react"

export default function AdminFinancePage() {
  const router = useRouter()
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  // Date filters
  const [activePreset, setActivePreset] = useState<string>("this_month")
  const [startDate, setStartDate] = useState<string>("")
  const [endDate, setEndDate] = useState<string>("")

  // Financial Data
  const [financeData, setFinanceData] = useState<any>({
    summary: {
      digiflazz_balance: 0,
      gross_revenue: 0,
      total_cogs: 0,
      net_profit: 0,
      profit_margin: 0,
      success_count: 0,
      pending_count: 0,
      failed_count: 0,
      total_count: 0,
    },
    game_breakdown: [],
    transactions: [],
  })

  // Helper to get formatted YYYY-MM-DD
  const toDateInputString = (date: Date) => {
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, "0")
    const day = String(date.getDate()).padStart(2, "0")
    return `${year}-${month}-${day}`
  }

  // Set preset dates
  const applyPreset = (preset: string) => {
    setActivePreset(preset)
    const now = new Date()
    let start = ""
    let end = toDateInputString(now)

    if (preset === "this_month") {
      const firstDay = new Date(now.getFullYear(), now.getMonth(), 1)
      const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0)
      start = toDateInputString(firstDay)
      end = toDateInputString(lastDay)
    } else if (preset === "last_month") {
      const firstDayLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)
      const lastDayLastMonth = new Date(now.getFullYear(), now.getMonth(), 0)
      start = toDateInputString(firstDayLastMonth)
      end = toDateInputString(lastDayLastMonth)
    } else if (preset === "today") {
      start = toDateInputString(now)
      end = toDateInputString(now)
    } else if (preset === "7_days") {
      const past7 = new Date()
      past7.setDate(past7.getDate() - 7)
      start = toDateInputString(past7)
      end = toDateInputString(now)
    } else if (preset === "30_days") {
      const past30 = new Date()
      past30.setDate(past30.getDate() - 30)
      start = toDateInputString(past30)
      end = toDateInputString(now)
    } else if (preset === "all") {
      start = "2024-01-01"
      end = toDateInputString(now)
    }

    setStartDate(start)
    setEndDate(end)
    fetchFinanceData(start, end)
  }

  const fetchFinanceData = async (start?: string, end?: string) => {
    setRefreshing(true)
    try {
      const s = start !== undefined ? start : startDate
      const e = end !== undefined ? end : endDate
      const url = `/api/admin/finance?start_date=${s}&end_date=${e}`

      const res = await fetch(url)
      const data = await res.json()
      if (data.error) throw new Error(data.error)

      setFinanceData(data)
    } catch (err: any) {
      console.error("Failed to load finance data:", err)
    } finally {
      setRefreshing(false)
      setLoading(false)
    }
  }

  useEffect(() => {
    // Read cache on mount
    const cached = getCachedUser()
    if (cached) {
      setCurrentUser(cached)
    }

    // Default: This Month
    const now = new Date()
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1)
    const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0)
    const initStart = toDateInputString(firstDay)
    const initEnd = toDateInputString(lastDay)

    setStartDate(initStart)
    setEndDate(initEnd)

    async function initAuthAndData() {
      try {
        const resUser = await fetch("/api/auth/me")
        const { user } = await resUser.json()

        if (!user || user.role !== "admin") {
          setCachedUser(null)
          router.push("/auth/login")
          return
        }

        setCurrentUser(user)
        setCachedUser(user)
        await fetchFinanceData(initStart, initEnd)
      } catch (err) {
        console.error("Auth check failed:", err)
      }
    }

    initAuthAndData()
  }, [router])

  // Export CSV function
  const handleExportCSV = () => {
    if (!financeData.transactions || financeData.transactions.length === 0) {
      alert("Tidak ada transaksi untuk diekspor pada rentang tanggal ini.")
      return
    }

    const headers = ["Invoice", "Tanggal", "Game", "Produk", "Harga Jual (Omset)", "Modal (Digiflazz)", "Keuntungan (Profit)", "Metode Bayar"]
    const rows = financeData.transactions.map((tx: any) => [
      `"${tx.invoice}"`,
      `"${formatDate(tx.created_at)}"`,
      `"${tx.game_name}"`,
      `"${tx.product_name}"`,
      tx.amount,
      tx.cogs,
      tx.profit,
      `"${tx.payment_method}"`,
    ])

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((e: any[]) => e.join(","))].join("\n")
    const encodedUri = encodeURI(csvContent)
    const link = document.createElement("a")
    link.setAttribute("href", encodedUri)
    link.setAttribute("download", `laporan_keuangan_${startDate}_sampai_${endDate}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const { summary, game_breakdown, transactions } = financeData

  return (
    <div className="min-h-screen flex flex-col">
      <Header user={currentUser} />

      <SidebarContentWrapper isAuthenticated={!!currentUser}>
        <main className="flex-1 py-8">
          <div className="container space-y-6">

            {/* Header & Title */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-3xl font-black text-white flex items-center gap-3">
                  <Wallet className="h-8 w-8 text-sky" />
                  Laporan Keuangan & Saldo
                </h1>
                <p className="text-xs sm:text-sm text-white/60 mt-1 font-medium">
                  Pantau omset penjualan, modal Digiflazz, laba bersih, dan deposit real-time toko Anda.
                </p>
              </div>

              <div className="flex items-center gap-2.5">
                <Button
                  onClick={() => fetchFinanceData()}
                  disabled={refreshing}
                  className="bg-[#183644] hover:bg-sky/20 border border-sky/30 text-white font-bold text-xs gap-2 shadow-sm"
                >
                  <RefreshCw className={`h-4 w-4 text-sky ${refreshing ? "animate-spin" : ""}`} />
                  Refresh
                </Button>
                <Button
                  onClick={handleExportCSV}
                  className="bg-sky hover:bg-sky-dark text-white font-bold text-xs gap-2 shadow-lg shadow-sky/20"
                >
                  <Download className="h-4 w-4" />
                  Ekspor CSV
                </Button>
              </div>
            </div>

            {/* Filter Periode & Tanggal */}
            <Card className="bg-[#142d3a] border border-sky/30 shadow-sky-soft rounded-2xl">
              <CardContent className="p-4 sm:p-5 space-y-4">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">

                  {/* Preset Pills */}
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-xs font-bold text-white uppercase tracking-wider mr-2 flex items-center gap-1.5">
                      <Calendar className="h-4 w-4 text-white" />
                      Periode:
                    </span>
                    {[
                      { id: "this_month", label: "Bulan Ini (Default)" },
                      { id: "last_month", label: "Bulan Lalu" },
                      { id: "today", label: "Hari Ini" },
                      { id: "7_days", label: "7 Hari Terakhir" },
                      { id: "30_days", label: "30 Hari Terakhir" },
                      { id: "all", label: "Semua Waktu" },
                    ].map((p) => (
                      <button
                        key={p.id}
                        onClick={() => applyPreset(p.id)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                          activePreset === p.id
                            ? "bg-sky text-white shadow-md shadow-sky/30"
                            : "bg-black/30 text-white/70 hover:text-white hover:bg-white/10 border border-sky/20"
                        }`}
                      >
                        {p.label}
                      </button>
                    ))}
                  </div>

                  {/* Custom Date Range Picker */}
                  <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
                    <div className="flex items-center gap-1.5 bg-black/30 border border-sky/20 px-2.5 py-1 rounded-xl">
                      <span className="text-[11px] font-semibold text-white/60">Dari:</span>
                      <input
                        type="date"
                        value={startDate}
                        onChange={(e) => {
                          setStartDate(e.target.value)
                          setActivePreset("custom")
                        }}
                        className="bg-transparent text-white text-xs font-mono font-bold focus:outline-none cursor-pointer [color-scheme:dark]"
                      />
                    </div>
                    <div className="flex items-center gap-1.5 bg-black/30 border border-sky/20 px-2.5 py-1 rounded-xl">
                      <span className="text-[11px] font-semibold text-white/60">Sampai:</span>
                      <input
                        type="date"
                        value={endDate}
                        onChange={(e) => {
                          setEndDate(e.target.value)
                          setActivePreset("custom")
                        }}
                        className="bg-transparent text-white text-xs font-mono font-bold focus:outline-none cursor-pointer [color-scheme:dark]"
                      />
                    </div>
                    <Button
                      onClick={() => fetchFinanceData()}
                      disabled={refreshing}
                      size="sm"
                      className="bg-sky hover:bg-sky-dark text-white font-black text-xs px-4"
                    >
                      Terapkan
                    </Button>
                  </div>

                </div>
              </CardContent>
            </Card>

            {/* Top Stat Cards (Omset, Modal, Laba Bersih, Saldo Digiflazz) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">

              {/* Saldo Digiflazz Live */}
              <Card className="bg-[#142d3a] border border-amber-400/30 rounded-2xl shadow-lg relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-24 h-24 bg-amber-400/10 rounded-full blur-2xl pointer-events-none" />
                <CardContent className="p-5">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-black uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                      <Wallet className="h-4 w-4" />
                      Saldo Digiflazz (H2H)
                    </span>
                    <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-amber-400/20 text-amber-300 border border-amber-400/30">
                      LIVE
                    </span>
                  </div>
                  <p className="text-2xl font-black text-white">
                    {formatCurrency(summary.digiflazz_balance)}
                  </p>
                  <p className="text-[11px] text-white/60 font-medium mt-1">
                    Sisa deposit aktif siap transaksi
                  </p>
                </CardContent>
              </Card>

              {/* Total Omset (Gross Revenue) */}
              <Card className="bg-[#142d3a] border border-sky/30 rounded-2xl shadow-lg relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-24 h-24 bg-sky/10 rounded-full blur-2xl pointer-events-none" />
                <CardContent className="p-5">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-black uppercase tracking-wider text-sky flex items-center gap-1.5">
                      <TrendingUp className="h-4 w-4" />
                      Total Omset (Penjualan)
                    </span>
                    <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-sky/20 text-sky border border-sky/30">
                      {summary.success_count} Sukses
                    </span>
                  </div>
                  <p className="text-2xl font-black text-white">
                    {formatCurrency(summary.gross_revenue)}
                  </p>
                  <p className="text-[11px] text-white/60 font-medium mt-1">
                    Uang masuk dari pesanan sukses
                  </p>
                </CardContent>
              </Card>

              {/* Total Modal (HPP Digiflazz) */}
              <Card className="bg-[#142d3a] border border-red-400/30 rounded-2xl shadow-lg relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-24 h-24 bg-red-400/10 rounded-full blur-2xl pointer-events-none" />
                <CardContent className="p-5">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-black uppercase tracking-wider text-red-400 flex items-center gap-1.5">
                      <DollarSign className="h-4 w-4" />
                      Modal Pokok (HPP)
                    </span>
                    <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-red-400/20 text-red-300 border border-red-400/30">
                      Cost
                    </span>
                  </div>
                  <p className="text-2xl font-black text-white">
                    {formatCurrency(summary.total_cogs)}
                  </p>
                  <p className="text-[11px] text-white/60 font-medium mt-1">
                    Modal beli produk dari supplier
                  </p>
                </CardContent>
              </Card>

              {/* Laba Bersih (Net Profit) */}
              <Card className="bg-[#142d3a] border border-emerald-400/40 rounded-2xl shadow-lg relative overflow-hidden group ring-1 ring-emerald-400/30">
                <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-400/15 rounded-full blur-2xl pointer-events-none" />
                <CardContent className="p-5">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-black uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                      <ArrowUpRight className="h-4 w-4" />
                      Laba Bersih (Profit)
                    </span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-400/20 text-emerald-400 border border-emerald-400/40">
                      +{summary.profit_margin}%
                    </span>
                  </div>
                  <p className="text-2xl font-black text-emerald-400">
                    {formatCurrency(summary.net_profit)}
                  </p>
                  <p className="text-[11px] text-emerald-400/80 font-medium mt-1">
                    Keuntungan bersih yang dikantongi
                  </p>
                </CardContent>
              </Card>

            </div>

            {/* Performance Breakdown per Game & Volume Order */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

              {/* Kontribusi Keuntungan per Game */}
              <Card className="lg:col-span-2 bg-[#142d3a] border border-sky/30 shadow-sky-soft rounded-2xl">
                <CardHeader className="pb-3 border-b border-sky/20">
                  <CardTitle className="text-base font-black uppercase tracking-wide text-white flex items-center gap-2">
                    <Gamepad2 className="h-5 w-5 text-sky" />
                    Performa Keuangan per Game
                  </CardTitle>
                  <CardDescription className="text-xs text-white/60 font-medium">
                    Game yang menyumbang omset dan keuntungan tertinggi di periode ini
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-4 sm:p-5">
                  {game_breakdown.length === 0 ? (
                    <div className="py-12 text-center text-white/40 text-xs font-medium">
                      Belum ada transaksi sukses pada periode tanggal yang dipilih.
                    </div>
                  ) : (
                    <div className="space-y-3.5">
                      {game_breakdown.map((item: any, idx: number) => {
                        const maxRev = Math.max(...game_breakdown.map((g: any) => g.revenue), 1)
                        const pct = Math.round((item.revenue / maxRev) * 100)
                        return (
                          <div key={idx} className="bg-black/20 p-3.5 rounded-xl border border-sky/20 space-y-2">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <span className="flex items-center justify-center w-5 h-5 rounded-full bg-sky/20 text-sky text-[11px] font-black">
                                  {idx + 1}
                                </span>
                                <span className="font-bold text-white text-xs sm:text-sm">{item.game_name}</span>
                                <span className="text-[10px] text-white/50 font-semibold">({item.tx_count} order)</span>
                              </div>
                              <div className="text-right">
                                <span className="text-xs sm:text-sm font-black text-white">{formatCurrency(item.revenue)}</span>
                                <span className="text-[10px] font-bold text-emerald-400 block">Laba: +{formatCurrency(item.profit)}</span>
                              </div>
                            </div>
                            <div className="w-full bg-white/5 rounded-full h-2 overflow-hidden">
                              <div
                                className="bg-gradient-to-r from-sky to-emerald-400 h-full rounded-full transition-all duration-500"
                                style={{ width: `${pct}%` }}
                              />
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Ringkasan Status Volume Order */}
              <Card className="bg-[#142d3a] border border-sky/30 shadow-sky-soft rounded-2xl flex flex-col">
                <CardHeader className="pb-3 border-b border-sky/20">
                  <CardTitle className="text-base font-black uppercase tracking-wide text-white flex items-center gap-2">
                    <ShoppingBag className="h-5 w-5 text-sky" />
                    Ringkasan Volume Order
                  </CardTitle>
                  <CardDescription className="text-xs text-white/60 font-medium">
                    Total {summary.total_count} transaksi pada periode ini
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-4 sm:p-5 flex-1 flex flex-col justify-around gap-3">
                  <div className="flex items-center justify-between p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30">
                    <div className="flex items-center gap-2.5">
                      <CheckCircle2 className="h-5 w-5 text-emerald-400" />
                      <div>
                        <span className="text-xs font-black uppercase tracking-wider text-emerald-400 block">Berhasil</span>
                        <span className="text-[10px] text-white/60">Top up terkirim</span>
                      </div>
                    </div>
                    <span className="text-xl font-black text-white">{summary.success_count}</span>
                  </div>

                  <div className="flex items-center justify-between p-3 rounded-xl bg-amber-500/10 border border-amber-500/30">
                    <div className="flex items-center gap-2.5">
                      <Clock className="h-5 w-5 text-amber-400" />
                      <div>
                        <span className="text-xs font-black uppercase tracking-wider text-amber-400 block">Pending / Proses</span>
                        <span className="text-[10px] text-white/60">Antre / bayar</span>
                      </div>
                    </div>
                    <span className="text-xl font-black text-white">{summary.pending_count}</span>
                  </div>

                  <div className="flex items-center justify-between p-3 rounded-xl bg-red-500/10 border border-red-500/30">
                    <div className="flex items-center gap-2.5">
                      <XCircle className="h-5 w-5 text-red-400" />
                      <div>
                        <span className="text-xs font-black uppercase tracking-wider text-red-400 block">Gagal / Dibatalkan</span>
                        <span className="text-[10px] text-white/60">Tidak sukses</span>
                      </div>
                    </div>
                    <span className="text-xl font-black text-white">{summary.failed_count}</span>
                  </div>
                </CardContent>
              </Card>

            </div>

            {/* Tabel Rincian Transaksi & Profit per Order */}
            <Card className="bg-[#142d3a] border border-sky/30 shadow-sky-soft rounded-2xl overflow-hidden">
              <CardHeader className="pb-3 border-b border-sky/20">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <CardTitle className="text-base font-black uppercase tracking-wide text-white">
                      Rincian Keuntungan per Transaksi
                    </CardTitle>
                    <CardDescription className="text-xs text-white/60 font-medium mt-0.5">
                      Menampilkan perolehan laba kotor vs laba bersih per pesanan yang berhasil
                    </CardDescription>
                  </div>
                  <span className="text-xs text-white/60 font-mono">
                    {transactions.length} transaksi ditampilkan
                  </span>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                {transactions.length === 0 ? (
                  <div className="py-12 text-center text-white/40 text-xs font-medium">
                    Tidak ada riwayat transaksi pada rentang tanggal ini.
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader className="bg-black/30">
                        <TableRow className="border-sky/20">
                          <TableHead className="text-white text-xs font-bold">Invoice</TableHead>
                          <TableHead className="text-white text-xs font-bold">Waktu</TableHead>
                          <TableHead className="text-white text-xs font-bold">Game &amp; Produk</TableHead>
                          <TableHead className="text-white text-xs font-bold">Metode</TableHead>
                          <TableHead className="text-white text-xs font-bold text-right">Harga Jual (Omset)</TableHead>
                          <TableHead className="text-white text-xs font-bold text-right">Modal Digiflazz</TableHead>
                          <TableHead className="text-white text-xs font-bold text-right">Profit Bersih</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {transactions.map((tx: any) => (
                          <TableRow key={tx.id} className="border-sky/20 hover:bg-white/5">
                            <TableCell className="font-mono text-xs text-sky font-bold">
                              {tx.invoice}
                            </TableCell>
                            <TableCell className="text-white/60 text-xs whitespace-nowrap">
                              {formatDate(tx.created_at)}
                            </TableCell>
                            <TableCell>
                              <div className="text-xs font-bold text-white">{tx.product_name}</div>
                              <div className="text-[10px] text-white/50">{tx.game_name}</div>
                            </TableCell>
                            <TableCell className="text-white/70 text-xs uppercase font-mono">
                              {tx.payment_method}
                            </TableCell>
                            <TableCell className="text-right font-bold text-white text-xs">
                              {formatCurrency(tx.amount)}
                            </TableCell>
                            <TableCell className="text-right text-red-300 font-mono text-xs">
                              {formatCurrency(tx.cogs)}
                            </TableCell>
                            <TableCell className="text-right font-black text-emerald-400 text-xs">
                              +{formatCurrency(tx.profit)}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>

          </div>
        </main>
      </SidebarContentWrapper>
    </div>
  )
}

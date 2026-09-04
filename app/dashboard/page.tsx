"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { SidebarContentWrapper } from "@/components/layout/sidebar-content-wrapper"
import { Skeleton } from "@/components/ui/skeleton"
import { getCachedUser } from "@/lib/auth-cache"
import { formatCurrency, formatDate } from "@/lib/utils"
import { getGameAssetByName, getItemAssetForProduct } from "@/lib/assets"
import {
  Wallet,
  Clock,
  CheckCircle2,
  XCircle,
  ArrowRight,
  TrendingUp,
  ShoppingBag,
  Loader2,
  Award,
  Zap,
  User,
  Shield,
  History,
  Bell,
  MessageSquare,
  Check,
  Search,
  RotateCcw,
  Filter,
} from "lucide-react"

export default function DashboardPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [recentTransactions, setRecentTransactions] = useState<any[]>([])
  const [gameFilter, setGameFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [stats, setStats] = useState([
    { label: "Total Transaksi", value: "0", icon: ShoppingBag, color: "text-sky", bg: "bg-sky/10 border-sky/30" },
    { label: "Berhasil", value: "0", icon: CheckCircle2, color: "text-emerald-400", bg: "bg-emerald-400/10 border-emerald-400/30" },
    { label: "Pending", value: "0", icon: Clock, color: "text-amber-400", bg: "bg-amber-400/10 border-amber-400/30" },
    { label: "Gagal", value: "0", icon: XCircle, color: "text-red-400", bg: "bg-red-400/10 border-red-400/30" },
  ])
  const [totalSpent, setTotalSpent] = useState(0)
  const [digiflazzBalance, setDigiflazzBalance] = useState<number | null>(null)
  const [activeTab, setActiveTab] = useState("transactions")
  const [notifications, setNotifications] = useState<any[]>([])
  const [notifLoading, setNotifLoading] = useState(false)

  const fetchNotifications = async () => {
    setNotifLoading(true)
    try {
      const res = await fetch("/api/notifications")
      const data = await res.json()
      if (data.notifications) {
        setNotifications(data.notifications)
      }
    } catch (err) {
      console.error("Failed to load notifications:", err)
    } finally {
      setNotifLoading(false)
    }
  }

  const handleMarkAsRead = async (notifId: string, link?: string) => {
    try {
      await fetch("/api/notifications", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: notifId }),
      })
      fetchNotifications()
      if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent("notification-updated"))
      }
      if (link) {
        router.push(link)
      }
    } catch (err) {
      console.error("Failed to mark notification read:", err)
    }
  }

  const handleMarkAllRead = async () => {
    try {
      await fetch("/api/notifications", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ all: true }),
      })
      fetchNotifications()
      if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent("notification-updated"))
      }
    } catch (err) {
      console.error("Failed to mark all read:", err)
    }
  }

  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search)
      const tab = params.get("tab")
      if (tab === "notifications") {
        setActiveTab("notifications")
        setTimeout(() => {
          const el = document.getElementById("dashboard-tabs-container")
          if (el) el.scrollIntoView({ behavior: "smooth", block: "start" })
        }, 100)
      }
    }
  }, [])

  useEffect(() => {
    const handleSwitchTab = (e: any) => {
      if (e.detail === "notifications" || e.detail === "transactions") {
        setActiveTab(e.detail)
        setTimeout(() => {
          const el = document.getElementById("dashboard-tabs-container")
          if (el) el.scrollIntoView({ behavior: "smooth", block: "start" })
        }, 50)
      }
    }
    window.addEventListener("switch-dashboard-tab", handleSwitchTab)
    return () => window.removeEventListener("switch-dashboard-tab", handleSwitchTab)
  }, [])

  useEffect(() => {
    async function fetchDashboardData() {
      const user = getCachedUser()
      if (!user) {
        router.push("/auth/login")
        return
      }
      setCurrentUser(user)

      try {
        const res = await fetch(`/api/user/dashboard`)
        const dataJson = await res.json()

        if (dataJson.transactions) {
          const txs = dataJson.transactions;
          const total = dataJson.stats?.total !== undefined ? dataJson.stats.total : txs.length;
          const success = dataJson.stats?.success !== undefined ? dataJson.stats.success : txs.filter((t: any) => t.topup_status === "success").length;
          const pending = dataJson.stats?.pending !== undefined ? dataJson.stats.pending : txs.filter((t: any) => t.topup_status === "pending" || t.topup_status === "processing").length;
          const failed = dataJson.stats?.failed !== undefined ? dataJson.stats.failed : txs.filter((t: any) => t.topup_status === "failed").length;

          setStats([
            { label: "Total Transaksi", value: String(total), icon: ShoppingBag, color: "text-sky", bg: "bg-sky/10 border-sky/30" },
            { label: "Berhasil", value: String(success), icon: CheckCircle2, color: "text-emerald-400", bg: "bg-emerald-400/10 border-emerald-400/30" },
            { label: "Pending", value: String(pending), icon: Clock, color: "text-amber-400", bg: "bg-amber-400/10 border-amber-400/30" },
            { label: "Gagal", value: String(failed), icon: XCircle, color: "text-red-400", bg: "bg-red-400/10 border-red-400/30" },
          ]);

          setRecentTransactions(
            txs.map((tx: any) => ({
              invoice: tx.invoice,
              product: tx.product_name,
              game: tx.game_name,
              game_slug: tx.game_slug || (tx.game_name ? tx.game_name.toLowerCase().replace(/[^a-z0-9]+/g, "-") : "mobile-legends"),
              target_id: tx.target_id,
              amount: Number(tx.amount),
              created_at: tx.created_at,
              status:
                tx.topup_status === "success"
                  ? "success"
                  : tx.topup_status === "failed"
                  ? "failed"
                  : "pending",
            }))
          );

          const spent = txs
            .filter((tx: any) => tx.payment_status === "paid" || tx.topup_status === "success")
            .reduce((sum: number, tx: any) => sum + Number(tx.amount), 0);
          setTotalSpent(spent);
        } else if (dataJson.stats) {
          setStats([
            { label: "Total Transaksi", value: String(dataJson.stats.total || 0), icon: ShoppingBag, color: "text-sky", bg: "bg-sky/10 border-sky/30" },
            { label: "Berhasil", value: String(dataJson.stats.success || 0), icon: CheckCircle2, color: "text-emerald-400", bg: "bg-emerald-400/10 border-emerald-400/30" },
            { label: "Pending", value: String(dataJson.stats.pending || 0), icon: Clock, color: "text-amber-400", bg: "bg-amber-400/10 border-amber-400/30" },
            { label: "Gagal", value: String(dataJson.stats.failed || 0), icon: XCircle, color: "text-red-400", bg: "bg-red-400/10 border-red-400/30" },
          ]);
        }

        if (dataJson.digiflazzBalance !== undefined) {
          setDigiflazzBalance(dataJson.digiflazzBalance)
        }
      } catch (err) {
        console.error("Failed to load dashboard data:", err)
      } finally {
        setLoading(false)
      }
    }

    fetchDashboardData()
    fetchNotifications()
  }, [router])

  // Get dynamic gamer rank based on total spending
  const getGamerRank = (spent: number) => {
    if (spent >= 5000000) return { title: "Mythic Legend", color: "text-purple-400 border-purple-400/40 bg-purple-400/10" }
    if (spent >= 1500000) return { title: "Diamond Veteran", color: "text-sky border-sky/40 bg-sky/10" }
    if (spent >= 500000)  return { title: "Gold Captain",    color: "text-amber-400 border-amber-400/40 bg-amber-400/10" }
    if (spent >= 100000)  return { title: "Silver Elite",    color: "text-white/70 border-white/20 bg-mist backdrop-blur-md" }
    return { title: "Bronze Recruit", color: "text-amber-500 border-amber-500/40 bg-amber-500/10" }
  }

  const gamerRank = getGamerRank(totalSpent)

  const tagBevelStyle = {
    clipPath: "polygon(4px 0%, calc(100% - 4px) 0%, 100% 4px, 100% calc(100% - 4px), calc(100% - 4px) 100%, 4px 100%, 0% calc(100% - 4px), 0% 4px)"
  }
  const inputBevelStyle = {
    clipPath: "polygon(8px 0%, calc(100% - 8px) 0%, 100% 8px, 100% calc(100% - 8px), calc(100% - 8px) 100%, 8px 100%, 0% calc(100% - 8px), 0% 8px)"
  }
  const bevelStyle = {
    clipPath: "polygon(10px 0%, calc(100% - 10px) 0%, 100% 10px, 100% calc(100% - 10px), calc(100% - 10px) 100%, 10px 100%, 0% calc(100% - 10px), 0% 10px)"
  }

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col relative ">
        <Header />
        <SidebarContentWrapper isAuthenticated={!!currentUser}>
          <main className="flex-1 relative z-10">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 space-y-10">
              <div className="h-44 w-full dark-stripes-teal p-6 md:p-8 rounded-2xl border border-sky/30 shadow-sky-soft flex flex-col justify-between">
                <div className="space-y-3">
                  <Skeleton className="h-8 w-1/3 rounded-xl bg-mist backdrop-blur-md" />
                  <Skeleton className="h-4 w-1/2 rounded-lg bg-mist backdrop-blur-md" />
                </div>
                <Skeleton className="h-10 w-44 rounded-xl bg-mist backdrop-blur-md" />
              </div>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="dark-stripes-teal p-6 rounded-2xl border border-sky/30 shadow-sky-soft space-y-3">
                    <div className="flex justify-between items-center">
                      <Skeleton className="h-4 w-20 rounded-md bg-mist backdrop-blur-md" />
                      <Skeleton className="h-8 w-8 rounded-xl bg-mist backdrop-blur-md" />
                    </div>
                    <Skeleton className="h-8 w-16 rounded-lg bg-mist backdrop-blur-md" />
                  </div>
                ))}
              </div>
              <div className="grid md:grid-cols-12 gap-8">
                <div className="md:col-span-4 space-y-8">
                  <div className="dark-stripes-teal p-6 rounded-2xl border border-sky/30 shadow-sky-soft space-y-6">
                    <div className="flex flex-col items-center text-center space-y-3">
                      <Skeleton className="h-20 w-20 rounded-full bg-mist backdrop-blur-md" />
                      <Skeleton className="h-5 w-32 rounded-lg bg-mist backdrop-blur-md" />
                      <Skeleton className="h-4 w-24 rounded-md bg-mist backdrop-blur-md" />
                    </div>
                    <div className="space-y-3 pt-4 border-t border-sky/20">
                      <Skeleton className="h-4 w-full rounded-md bg-mist backdrop-blur-md" />
                      <Skeleton className="h-4 w-3/4 rounded-md bg-mist backdrop-blur-md" />
                    </div>
                  </div>
                </div>
                <div className="md:col-span-8 dark-stripes-teal p-6 rounded-2xl border border-sky/30 shadow-sky-soft space-y-6">
                  <div className="flex justify-between items-center">
                    <Skeleton className="h-6 w-48 rounded-lg bg-mist backdrop-blur-md" />
                    <Skeleton className="h-4 w-20 rounded-md bg-mist backdrop-blur-md" />
                  </div>
                  <div className="space-y-4">
                    {[1, 2, 3, 4].map((i) => (
                      <div key={i} className="flex justify-between items-center p-4 border border-sky/20 rounded-xl">
                        <div className="space-y-2">
                          <Skeleton className="h-4 w-32 rounded-md bg-mist backdrop-blur-md" />
                          <Skeleton className="h-3 w-24 rounded-sm bg-mist backdrop-blur-md" />
                        </div>
                        <Skeleton className="h-6 w-20 rounded-lg bg-mist backdrop-blur-md" />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </main>
          <Footer />
        </SidebarContentWrapper>
      </div>
    )
  }

  const availableGames = Array.from(
    new Set(recentTransactions.map((t: any) => t.game).filter(Boolean))
  ) as string[];

  const filteredTransactions = recentTransactions.filter((tx: any) => {
    if (gameFilter !== "all" && tx.game !== gameFilter) return false;
    if (statusFilter !== "all" && tx.status !== statusFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchInvoice = tx.invoice?.toLowerCase().includes(q);
      const matchProduct = tx.product?.toLowerCase().includes(q);
      const matchGame = tx.game?.toLowerCase().includes(q);
      const matchTarget = tx.target_id?.toLowerCase().includes(q);
      if (!matchInvoice && !matchProduct && !matchGame && !matchTarget) return false;
    }
    return true;
  });

  return (
    <div className="min-h-screen flex flex-col relative ">
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-sky/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-diamond/5 rounded-full blur-3xl pointer-events-none" />

      <Header user={currentUser} />

      <SidebarContentWrapper isAuthenticated={!!currentUser}>
        <main className="flex-1 py-10 relative z-10">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">

            {/* Welcome HUD Header */}
            <div className="mb-10 flex flex-col md:flex-row md:items-center justify-between gap-6 dark-stripes-teal-pop p-6 md:p-8 rounded-2xl border border-sky/30 relative overflow-hidden shadow-sky-soft">
              <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-sky/30 to-transparent" />
              <div className="absolute top-0 right-0 w-40 h-40 bg-sky/10 rounded-full blur-2xl pointer-events-none" />

              <div className="flex items-center gap-5">
                <div className="relative p-[2px] bg-gradient-to-tr from-sky/60 to-diamond/60 rounded-full">
                  <span className="grid h-16 w-16 place-items-center bg-[#17262c] rounded-full text-sky">
                    <User className="h-8 w-8" />
                  </span>
                </div>
                <div>
                  <h1 className="text-2xl md:text-3xl font-black uppercase text-white tracking-tight">
                    {currentUser?.name || "Gamer"}
                  </h1>
                  <p className="text-xs font-bold text-white/50 uppercase tracking-widest mt-1">
                    Selamat datang kembali di Pusat Komando Topup Anda
                  </p>
                </div>
              </div>

              {/* Rank Badge */}
              <div className="flex items-center gap-3 self-start md:self-center">
                <span className="grid h-10 w-10 place-items-center bg-sky/10 text-sky rounded-lg border border-sky/30">
                  <Shield className="h-5 w-5" />
                </span>
                <div>
                  <span className="text-[9px] font-bold text-white/40 uppercase tracking-widest block">Rank Keanggotaan</span>
                  <span className={`px-3 py-1 text-[10px] font-black uppercase tracking-wider border rounded mt-1.5 inline-block ${gamerRank.color}`} style={tagBevelStyle}>
                    {gamerRank.title}
                  </span>
                </div>
              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
              {stats.map((stat, index) => (
                <div key={index} className="dark-stripes-teal border border-sky/30 rounded-2xl p-5 flex flex-col justify-between shadow-lg shadow-black/20 hover:border-sky/50 transition-all duration-300">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-[10px] font-black text-white/50 uppercase tracking-wider">{stat.label}</span>
                    <span className={`p-2 rounded-lg border ${stat.bg}`}>
                      <stat.icon className={`h-4 w-4 ${stat.color}`} />
                    </span>
                  </div>
                  <p className={`text-3xl font-black font-mono leading-none ${stat.color}`}>{stat.value}</p>
                </div>
              ))}
            </div>

            {/* Two Column Layout */}
            <div className="grid lg:grid-cols-12 gap-8">

              {/* Left Column: Tabs */}
              <div className="lg:col-span-8 space-y-6">
                <div id="dashboard-tabs-container" className="bg-[#183644]/90 backdrop-blur-md rounded-2xl border border-sky/30 shadow-sky-soft relative overflow-hidden">

                  {/* Tab Header (Diagonal Stripes on Header only) */}
                  <div className="border-b border-sky/20 flex items-center justify-between dark-stripes-teal">
                    <div className="flex">
                      <button
                        onClick={() => setActiveTab("transactions")}
                        className={`px-5 py-3.5 text-xs font-black uppercase tracking-wider border-r border-sky/20 transition-all flex items-center gap-2 ${
                          activeTab === "transactions"
                            ? "bg-sky text-white"
                            : "text-white/50 hover:text-white hover:bg-mist backdrop-blur-md"
                        }`}
                      >
                        <History className="h-4 w-4" />
                        Riwayat Transaksi
                      </button>
                      <button
                        onClick={() => setActiveTab("notifications")}
                        className={`px-5 py-3.5 text-xs font-black uppercase tracking-wider border-r border-sky/20 transition-all flex items-center gap-2 relative ${
                          activeTab === "notifications"
                            ? "bg-sky text-white"
                            : "text-white/50 hover:text-white hover:bg-mist backdrop-blur-md"
                        }`}
                      >
                        <Bell className="h-4 w-4" />
                        Notifikasi Anda
                        {notifications.filter(n => !n.is_read).length > 0 && (
                          <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-red-500 animate-pulse" />
                        )}
                      </button>
                    </div>

                    {activeTab === "transactions" ? (
                      <Link href="/history" className="mr-4">
                        <button className="bg-mist backdrop-blur-md hover:bg-mist backdrop-blur-md border border-white/10 px-4 py-1.5 text-[10px] font-black uppercase tracking-widest text-white/70 hover:text-white transition-colors flex items-center gap-1.5 rounded-lg">
                          Lihat Semua
                          <ArrowRight className="h-3 w-3 text-sky" />
                        </button>
                      </Link>
                    ) : (
                      notifications.filter(n => !n.is_read).length > 0 && (
                        <button
                          onClick={handleMarkAllRead}
                          className="mr-4 text-[9px] font-black uppercase text-sky hover:text-white tracking-widest border border-sky/30 bg-sky/10 hover:bg-sky/20 px-3 py-1 rounded-lg transition-all"
                        >
                          Tandai Semua Dibaca
                        </button>
                      )
                    )}
                  </div>

                  {/* Tab Content */}
                  <div className="p-6">
                    {activeTab === "transactions" ? (
                      recentTransactions.length > 0 ? (
                        <div className="space-y-4">
                          {/* Simple & Neat Filter Bar */}
                          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 pb-4 border-b border-sky/15">
                            <div className="flex items-center gap-2 flex-wrap">
                              {/* Filter Game */}
                              <div className="relative">
                                <select
                                  value={gameFilter}
                                  onChange={(e) => setGameFilter(e.target.value)}
                                  className="bg-black/40 border border-sky/20 hover:border-sky/40 text-white text-xs font-bold rounded-xl px-3 py-1.5 focus:outline-none focus:border-sky cursor-pointer appearance-none pr-8 transition-colors"
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

                              {/* Filter Status */}
                              <div className="relative">
                                <select
                                  value={statusFilter}
                                  onChange={(e) => setStatusFilter(e.target.value)}
                                  className="bg-black/40 border border-sky/20 hover:border-sky/40 text-white text-xs font-bold rounded-xl px-3 py-1.5 focus:outline-none focus:border-sky cursor-pointer appearance-none pr-8 transition-colors"
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
                                    setGameFilter("all")
                                    setStatusFilter("all")
                                    setSearchQuery("")
                                  }}
                                  className="text-[10px] text-sky hover:text-white font-bold underline px-1 transition-colors"
                                >
                                  Reset Filter
                                </button>
                              )}
                            </div>

                            {/* Search input */}
                            <div className="relative w-full sm:w-56">
                              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-white/40" />
                              <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Cari Invoice / game..."
                                className="w-full bg-black/40 border border-sky/20 hover:border-sky/40 text-white text-xs rounded-xl pl-9 pr-3 py-1.5 focus:outline-none focus:border-sky transition-colors placeholder:text-white/30"
                              />
                            </div>
                          </div>

                          {/* Filtered Transactions List */}
                          {filteredTransactions.length > 0 ? (
                            <div className="space-y-3">
                              {filteredTransactions.map((tx) => {
                                const gameAsset = getGameAssetByName(tx.game_name)
                                const itemAsset = getItemAssetForProduct(tx.game_name, tx.product_name)

                                return (
                                  <div
                                    key={tx.id}
                                    className="p-4 bg-black/20 hover:bg-black/30 border border-sky/15 hover:border-sky/40 rounded-xl flex items-center justify-between transition-all duration-300 group"
                                  >
                                    <div className="flex items-center gap-3 min-w-0">
                                      {/* Product / Game Thumbnail */}
                                      <div className="h-11 w-11 rounded-xl bg-black/40 border border-sky/20 overflow-hidden flex items-center justify-center p-1.5 shrink-0 group-hover:border-sky transition-colors">
                                        <img
                                          src={itemAsset || gameAsset?.icon || "/assets/games/mobile-legends/icon.png"}
                                          alt={tx.product_name}
                                          className="h-full w-full object-contain"
                                        />
                                      </div>

                                      <div className="min-w-0">
                                        <p className="text-xs font-black uppercase tracking-wide text-white group-hover:text-sky transition-colors truncate">
                                          {tx.product_name}
                                        </p>
                                        <div className="flex items-center gap-2 mt-1 flex-wrap">
                                          {gameAsset?.icon && (
                                            <img
                                              src={gameAsset.icon}
                                              alt={tx.game_name}
                                              className="h-3.5 w-3.5 rounded object-cover"
                                            />
                                          )}
                                          <span className="text-[10px] font-bold text-white/50 uppercase tracking-wider">
                                            {tx.game_name}
                                          </span>
                                          <span className="text-white/20">•</span>
                                          <span className="text-[10px] font-mono text-white/40">
                                            {tx.invoice_id}
                                          </span>
                                          <span className="text-white/20">•</span>
                                          <span className="text-[10px] text-white/40">
                                            {new Date(tx.created_at).toLocaleDateString("id-ID", {
                                              day: "numeric",
                                              month: "short"
                                            })}
                                          </span>
                                        </div>
                                      </div>
                                    </div>

                                    <div className="flex items-center gap-4 shrink-0">
                                      <div className="text-right">
                                        <p className="text-xs font-black text-white font-mono">
                                          Rp {Number(tx.amount || 0).toLocaleString("id-ID")}
                                        </p>
                                        <div className="mt-1">
                                          {tx.payment_status === "success" || tx.topup_status === "success" ? (
                                            <span className="inline-block px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-wider bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                                              Berhasil
                                            </span>
                                          ) : tx.payment_status === "pending" || tx.topup_status === "pending" ? (
                                            <span className="inline-block px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-wider bg-amber-500/20 text-amber-400 border border-amber-500/30">
                                              Diproses
                                            </span>
                                          ) : (
                                            <span className="inline-block px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-wider bg-red-500/20 text-red-400 border border-red-500/30">
                                              Gagal
                                            </span>
                                          )}
                                        </div>
                                      </div>

                                      {/* Quick Action: Pesan Lagi */}
                                      {gameAsset?.slug && (
                                        <Link href={`/games/${gameAsset.slug}`}>
                                          <button
                                            title="Pesan produk ini lagi"
                                            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider border border-sky/30 bg-sky/10 text-sky hover:bg-sky hover:text-white transition-all shadow-sm"
                                          >
                                            <RotateCcw className="h-3 w-3" />
                                            <span>Pesan Lagi</span>
                                          </button>
                                        </Link>
                                      )}
                                    </div>
                                  </div>
                                )
                              })}
                            </div>
                          ) : (
                            <div className="text-center py-10 flex flex-col items-center justify-center">
                              <Search className="h-8 w-8 text-white/20 mb-2" />
                              <p className="text-xs font-bold text-white/50 uppercase tracking-widest">Tidak ada transaksi yang cocok</p>
                              <p className="text-[10px] text-white/30 mt-1">Coba sesuaikan filter game atau kata kunci pencarian Anda.</p>
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="text-center py-10 flex flex-col items-center justify-center">
                          <ShoppingBag className="h-10 w-10 text-white/20 mb-3 animate-pulse" />
                          <p className="text-xs font-bold text-white/50 uppercase tracking-widest">Belum ada transaksi</p>
                          <p className="text-[10px] text-white/30 mt-1 max-w-xs">Gunakan Pusat Topup kami untuk mengisi diamond game Anda sekarang.</p>
                        </div>
                      )
                    ) : (
                      notifLoading ? (
                        <div className="text-center py-10 text-xs font-bold text-white/40 uppercase tracking-widest">
                          Memuat Notifikasi...
                        </div>
                      ) : notifications.length > 0 ? (
                        <div className="space-y-3">
                          {notifications.map((notif) => {
                            const isUnread = !notif.is_read
                            const isFeedback = notif.type === "feedback_reply" || notif.type === "new_feedback"
                            return (
                              <div
                                key={notif.id}
                                onClick={() => handleMarkAsRead(notif.id, notif.link)}
                                className={`p-4 sm:p-5 border-l-4 rounded-2xl flex items-start gap-4 transition-all duration-200 cursor-pointer relative overflow-hidden ${
                                  isUnread
                                    ? "bg-[#0d2a38] border-l-sky border-y border-r border-sky/40 hover:bg-[#113547] shadow-[0_4px_20px_rgba(56,189,248,0.12)]"
                                    : "bg-black/35 border-l-white/20 border-y border-r border-white/5 opacity-65 hover:opacity-95 hover:bg-black/50"
                                }`}
                              >
                                {isUnread && (
                                  <div className="absolute top-0 right-0 w-28 h-28 bg-sky/10 rounded-full blur-xl pointer-events-none" />
                                )}
                                <div className={`p-2.5 rounded-xl shrink-0 transition-transform ${
                                  isUnread
                                    ? "bg-sky/20 text-sky border border-sky/40 shadow-sm"
                                    : "bg-white/5 text-white/30 border border-white/5"
                                }`}>
                                  {isFeedback ? <MessageSquare className="h-5 w-5" /> : <Bell className="h-5 w-5" />}
                                </div>
                                <div className="flex-grow min-w-0">
                                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                                    <div className="flex items-center gap-2 min-w-0">
                                      <p className={`text-xs sm:text-sm uppercase tracking-wide leading-tight truncate ${
                                        isUnread ? "font-black text-white" : "font-bold text-white/60"
                                      }`}>
                                        {notif.title}
                                      </p>
                                      {isUnread ? (
                                        <span className="px-2 py-0.5 rounded-md text-[8px] sm:text-[9px] font-black uppercase bg-sky text-white tracking-wider shadow-sm shrink-0 animate-pulse">
                                          Baru
                                        </span>
                                      ) : (
                                        <span className="px-2 py-0.5 rounded-md text-[8px] sm:text-[9px] font-semibold uppercase bg-white/5 text-white/40 tracking-wider shrink-0">
                                          Dibaca
                                        </span>
                                      )}
                                    </div>
                                    <span className={`text-[9px] font-mono shrink-0 ${isUnread ? "text-sky font-bold" : "text-white/40"}`}>
                                      {new Date(notif.created_at).toLocaleDateString("id-ID", {
                                        day: "numeric",
                                        month: "short",
                                        year: "numeric",
                                        hour: "2-digit",
                                        minute: "2-digit"
                                      })}
                                    </span>
                                  </div>
                                  <p className={`text-xs mt-1.5 leading-relaxed ${isUnread ? "text-white/90 font-medium" : "text-white/45"}`}>
                                    {notif.message}
                                  </p>
                                  {isUnread && (
                                    <div className="mt-2.5 flex items-center gap-1.5">
                                      <span className="inline-flex items-center gap-1 text-[9px] font-black uppercase text-sky tracking-wider bg-sky/15 px-2.5 py-1 rounded-lg border border-sky/30">
                                        <Check className="h-3 w-3" /> Klik untuk lihat & tandai telah dibaca
                                      </span>
                                    </div>
                                  )}
                                </div>
                              </div>
                            )
                          })}
                        </div>
                      ) : (
                        <div className="text-center py-10 flex flex-col items-center justify-center">
                          <Bell className="h-10 w-10 text-white/20 mb-3 animate-pulse" />
                          <p className="text-xs font-bold text-white/50 uppercase tracking-widest">Tidak ada notifikasi</p>
                          <p className="text-[10px] text-white/30 mt-1 max-w-xs">Kotak masuk Anda bersih! Notifikasi pembelian atau chat ulasan Anda akan muncul di sini.</p>
                        </div>
                      )
                    )}
                  </div>
                </div>
              </div>

              {/* Right Column: Sidebar */}
              <div className="lg:col-span-4 space-y-5">

                {/* Admin: Digiflazz Balance */}
                {currentUser?.role === "admin" && (
                  <div className="dark-stripes-teal border border-amber-500/30 rounded-2xl p-5 shadow-lg shadow-black/20 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/10 rounded-full blur-xl pointer-events-none" />
                    <h3 className="text-xs font-bold uppercase tracking-wider text-amber-400 mb-4 flex items-center gap-2">
                      <Wallet className="h-4 w-4" />
                      Saldo Digiflazz (Admin)
                    </h3>
                    <p className="text-3xl font-black text-amber-400 font-mono leading-none mb-1">
                      Rp {digiflazzBalance !== null ? digiflazzBalance.toLocaleString("id-ID") : "..."}
                    </p>
                    <p className="text-[10px] font-bold text-white/40 uppercase tracking-wider">
                      Saldo deposit H2H aktif
                    </p>
                  </div>
                )}

                {/* Total Spending */}
                <div className="dark-stripes-teal border border-sky/30 rounded-2xl p-5 shadow-lg shadow-black/20 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-sky/10 rounded-full blur-xl pointer-events-none" />
                  <h3 className="text-xs font-bold uppercase tracking-wider text-white/50 mb-4 flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-sky" />
                    Total Pengeluaran
                  </h3>
                  <p className="text-3xl font-black text-sky font-mono leading-none mb-1">
                    Rp {totalSpent.toLocaleString("id-ID")}
                  </p>
                  <p className="text-[10px] font-bold text-white/40 uppercase tracking-wider">
                    Berdasarkan transaksi sukses
                  </p>
                </div>

                {/* Quick Actions */}
                <div className="dark-stripes-teal p-5 rounded-2xl border border-sky/30 shadow-lg shadow-black/20">
                  <h3 className="text-[10px] font-black uppercase tracking-widest text-white/60 mb-4 border-b border-sky/20 pb-2">
                    Aksi Cepat
                  </h3>
                  <div className="space-y-3">
                    <Link href="/" className="block">
                      <button className="w-full bg-sky hover:bg-diamond text-white py-3 text-xs font-black uppercase tracking-widest transition-colors flex items-center justify-center gap-2 shimmer-hover rounded-xl shadow-sky-soft">
                        <ShoppingBag className="h-4 w-4" />
                        Top Up Game Sekarang
                      </button>
                    </Link>
                    <Link href="/calculator" className="block">
                      <button className="w-full bg-mist backdrop-blur-md hover:bg-mist backdrop-blur-md border border-white/10 hover:border-sky/30 text-white/70 hover:text-white py-3 text-xs font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 shimmer-hover rounded-xl">
                        <Award className="h-4 w-4 text-sky" />
                        Buka Topup Optimizer
                      </button>
                    </Link>
                  </div>
                </div>

              </div>
            </div>
          </div>
        </main>

        <Footer />
      </SidebarContentWrapper>
    </div>
  )
}
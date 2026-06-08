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
} from "lucide-react"

export default function DashboardPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [recentTransactions, setRecentTransactions] = useState<any[]>([])
  const [stats, setStats] = useState([
    { label: "Total Transaksi", value: "0", icon: ShoppingBag, color: "text-sky bg-sky/10 border-sky/20" },
    { label: "Berhasil", value: "0", icon: CheckCircle2, color: "text-emerald-500 bg-emerald-50 border-emerald-500/20" },
    { label: "Pending", value: "0", icon: Clock, color: "text-amber-500 bg-amber-50 border-amber-500/20" },
    { label: "Gagal", value: "0", icon: XCircle, color: "text-red-500 bg-red-50 border-red-500/20" },
  ])
  const [totalSpent, setTotalSpent] = useState(0)

  useEffect(() => {
    // Read cache on mount
    const cached = getCachedUser()
    if (cached) {
      setCurrentUser(cached)
    }

    const fetchDashboardData = async () => {
      try {
        const res = await fetch("/api/user/dashboard")
        const dataJson = await res.json()

        if (dataJson.error) {
          router.push("/auth/login")
          return
        }

        const authUser = dataJson.user
        if (!authUser) {
          router.push("/auth/login")
          return
        }

        const userObj = {
          name: authUser.name || authUser.email || "Gamer",
          email: authUser.email || "",
          role: authUser.role || "user"
        }
        setCurrentUser(userObj)

        const txs = dataJson.transactions
        if (txs) {
          const mappedTxs = txs.map((tx: any) => ({
            invoice: tx.invoice,
            product: tx.product_name,
            game: tx.game_name,
            amount: Number(tx.amount),
            status: tx.topup_status,
            date: tx.created_at,
          }))
          setRecentTransactions(mappedTxs.slice(0, 5))

          // Calculate stats
          const totalCount = txs.length
          const successCount = txs.filter((tx: any) => tx.topup_status === "success").length
          const pendingCount = txs.filter((tx: any) => tx.topup_status === "pending" || tx.topup_status === "processing").length
          const failedCount = txs.filter((tx: any) => tx.topup_status === "failed").length

          setStats([
            { label: "Total Transaksi", value: String(totalCount), icon: ShoppingBag, color: "text-sky bg-sky/10 border-sky/20" },
            { label: "Berhasil", value: String(successCount), icon: CheckCircle2, color: "text-emerald-500 bg-emerald-50 border-emerald-500/20" },
            { label: "Pending", value: String(pendingCount), icon: Clock, color: "text-amber-500 bg-amber-50 border-amber-500/20" },
            { label: "Gagal", value: String(failedCount), icon: XCircle, color: "text-red-500 bg-red-50 border-red-500/20" },
          ])

          // Total spent (successful payments)
          const spent = txs
            .filter((tx: any) => tx.payment_status === "paid" || tx.topup_status === "success")
            .reduce((sum: number, tx: any) => sum + Number(tx.amount), 0)
          setTotalSpent(spent)
        }
      } catch (err) {
        console.error("Failed to load dashboard data:", err)
      } finally {
        setLoading(false)
      }
    }

    fetchDashboardData()
  }, [router])

  // Get dynamic gamer rank based on total spending
  const getGamerRank = (spent: number) => {
    if (spent >= 5000000) return { title: "Mythic Legend", color: "text-purple-500 bg-purple-50 border-purple-500/30" }
    if (spent >= 1500000) return { title: "Diamond Veteran", color: "text-sky bg-sky/10 border-sky/30" }
    if (spent >= 500000) return { title: "Gold Captain", color: "text-amber-500 bg-amber-50 border-amber-500/30" }
    if (spent >= 100000) return { title: "Silver Elite", color: "text-text-secondary bg-ice border-sky-border/30" }
    return { title: "Bronze Recruit", color: "text-amber-600 bg-amber-50 border-amber-600/30" }
  }

  const gamerRank = getGamerRank(totalSpent)

  // Hexagonal game cuts
  const bevelStyle = {
    clipPath: "polygon(10px 0%, calc(100% - 10px) 0%, 100% 10px, 100% calc(100% - 10px), calc(100% - 10px) 100%, 10px 100%, 0% calc(100% - 10px), 0% 10px)"
  }
  const inputBevelStyle = {
    clipPath: "polygon(8px 0%, calc(100% - 8px) 0%, 100% 8px, 100% calc(100% - 8px), calc(100% - 8px) 100%, 8px 100%, 0% calc(100% - 8px), 0% 8px)"
  }
  const tagBevelStyle = {
    clipPath: "polygon(4px 0%, calc(100% - 4px) 0%, 100% 4px, 100% calc(100% - 4px), calc(100% - 4px) 100%, 4px 100%, 0% calc(100% - 4px), 0% 4px)"
  }

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col relative overflow-x-clip">
        <Header />
        <SidebarContentWrapper isAuthenticated={!!currentUser}>
          <main className="flex-1 relative z-10">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 space-y-10">
              {/* Welcome HUD Header Skeleton */}
              <div className="h-44 w-full bg-white/60 p-6 md:p-8 rounded-2xl border border-sky-border shadow-sky-soft flex flex-col justify-between">
                <div className="space-y-3">
                  <Skeleton className="h-8 w-1/3 rounded-xl bg-sky/10" />
                  <Skeleton className="h-4 w-1/2 rounded-lg bg-sky/10" />
                </div>
                <Skeleton className="h-10 w-44 rounded-xl bg-sky/10" />
              </div>

              {/* Stats Cards Skeleton */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="bg-white p-6 rounded-2xl border border-sky-border shadow-sky-soft space-y-3">
                    <div className="flex justify-between items-center">
                      <Skeleton className="h-4 w-20 rounded-md bg-sky/10" />
                      <Skeleton className="h-8 w-8 rounded-xl bg-sky/10" />
                    </div>
                    <Skeleton className="h-8 w-16 rounded-lg bg-sky/10" />
                  </div>
                ))}
              </div>

              {/* Grid Columns Skeleton */}
              <div className="grid md:grid-cols-12 gap-8">
                {/* Left Column: Profil & Keamanan */}
                <div className="md:col-span-4 space-y-8">
                  {/* Profile Card */}
                  <div className="bg-white p-6 rounded-2xl border border-sky-border shadow-sky-soft space-y-6">
                    <div className="flex flex-col items-center text-center space-y-3">
                      <Skeleton className="h-20 w-20 rounded-full bg-sky/10" />
                      <Skeleton className="h-5 w-32 rounded-lg bg-sky/10" />
                      <Skeleton className="h-4 w-24 rounded-md bg-sky/10" />
                    </div>
                    <div className="space-y-3 pt-4 border-t border-sky-border">
                      <Skeleton className="h-4 w-full rounded-md bg-sky/10" />
                      <Skeleton className="h-4 w-3/4 rounded-md bg-sky/10" />
                    </div>
                  </div>
                </div>

                {/* Right Column: Transactions */}
                <div className="md:col-span-8 bg-white p-6 rounded-2xl border border-sky-border shadow-sky-soft space-y-6">
                  <div className="flex justify-between items-center">
                    <Skeleton className="h-6 w-48 rounded-lg bg-sky/10" />
                    <Skeleton className="h-4 w-20 rounded-md bg-sky/10" />
                  </div>
                  <div className="space-y-4">
                    {[1, 2, 3, 4].map((i) => (
                      <div key={i} className="flex justify-between items-center p-4 border border-sky-border/50 rounded-xl">
                        <div className="space-y-2">
                          <Skeleton className="h-4 w-32 rounded-md bg-sky/10" />
                          <Skeleton className="h-3 w-24 rounded-sm bg-sky/10" />
                        </div>
                        <Skeleton className="h-6 w-20 rounded-lg bg-sky/10" />
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

  return (
    <div className="min-h-screen flex flex-col relative overflow-x-clip text-text-primary">

      {/* Background elements */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-sky/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-diamond/5 rounded-full blur-3xl pointer-events-none" />

      <Header user={currentUser} />

      <SidebarContentWrapper isAuthenticated={!!currentUser}>
        <main className="flex-1 py-10 relative z-10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">

          {/* Welcome HUD Header */}
        <div className="mb-10 flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white/60 p-6 md:p-8 rounded-2xl border border-sky-border relative overflow-hidden shadow-sky-soft">
          {/* Subtle glow border at bottom */}
          <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-sky/20 to-transparent" />

          <div className="flex items-center gap-5">
            <div className="relative p-[1px] bg-gradient-to-tr from-sky/40 to-diamond/40 rounded-full">
              <span className="grid h-16 w-16 place-items-center bg-white rounded-full text-sky">
                <User className="h-8 w-8" />
              </span>
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-black uppercase text-text-primary tracking-tight flex items-center gap-3">
                {currentUser?.name || "Gamer"}
              </h1>
              <p className="text-xs font-bold text-text-secondary uppercase tracking-widest mt-1">
                Selamat datang kembali di Pusat Komando Topup Anda
              </p>
            </div>
          </div>

          {/* Gamer Rank Badge */}
          <div className="flex items-center gap-3 self-start md:self-center">
            <span className="grid h-10 w-10 place-items-center bg-sky/10 text-sky rounded-lg border border-sky/20">
              <Shield className="h-5 w-5" />
            </span>
            <div>
              <span className="text-[9px] font-bold text-text-muted uppercase tracking-widest block">Rank Keanggotaan</span>
              <span className={`px-3 py-1 text-[10px] font-black uppercase tracking-wider border rounded mt-1.5 inline-block ${gamerRank.color}`} style={tagBevelStyle}>
                {gamerRank.title}
              </span>
            </div>
          </div>
        </div>

        {/* Stats Grid with Beveled Outlines */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-10">
          {stats.map((stat, index) => (
            <div key={index} className="relative p-[1px] bg-gradient-to-r from-sky/20 to-sky/10 hover:from-sky/30 hover:to-sky/20 transition-all duration-300" style={bevelStyle}>
              <div className="bg-white p-6 flex flex-col justify-between" style={bevelStyle}>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs font-bold text-text-secondary uppercase tracking-wider">{stat.label}</span>
                  <span className={`p-2 rounded border ${stat.color.split(" ")[1]} ${stat.color.split(" ")[2]}`}>
                    <stat.icon className={`h-4.5 w-4.5 ${stat.color.split(" ")[0]}`} />
                  </span>
                </div>
                <p className="text-3xl font-black text-text-primary font-mono leading-none">{stat.value}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Two Column Layout */}
        <div className="grid lg:grid-cols-12 gap-8">

          {/* Left Column: Recent Transactions Table */}
          <div className="lg:col-span-8 space-y-6">
            <div className="glass-sky rounded-2xl border-sky-border shadow-sky-soft relative overflow-hidden">
              <div className="p-6 border-b border-sky-border flex items-center justify-between">
                <h3 className="text-base font-black uppercase tracking-wide text-text-primary flex items-center gap-2">
                  <History className="h-4 w-4 text-sky" />
                  Transaksi Terakhir
                </h3>
                <Link href="/history">
                  <div className="relative p-[1px] bg-sky-border/50 hover:bg-sky/20 transition-all duration-300" style={inputBevelStyle}>
                    <button
                      className="bg-white px-4 py-1.5 text-[10px] font-black uppercase tracking-widest text-text-secondary hover:text-sky transition-colors flex items-center gap-1.5"
                      style={inputBevelStyle}
                    >
                      Lihat Semua
                      <ArrowRight className="h-3 w-3 text-sky" />
                    </button>
                  </div>
                </Link>
              </div>

              <div className="p-6">
                {recentTransactions.length > 0 ? (
                  <div className="space-y-4">
                    {recentTransactions.map((tx, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-4 bg-ice border border-sky-border/50 hover:border-sky/20 rounded-xl transition-all duration-300 group"
                      >
                        <div className="flex items-center gap-4">
                          <span className="grid h-10 w-10 place-items-center bg-sky/10 text-sky border border-sky/10 rounded-lg group-hover:bg-sky/10 group-hover:border-sky/30 transition-colors">
                            <img src={getItemAssetForProduct(tx.product, undefined, tx.game)} alt="" className="max-h-7 max-w-7 object-contain" />
                          </span>
                          <div>
                            <p className="font-bold text-text-primary group-hover:text-sky transition-colors text-sm uppercase tracking-tight">{tx.product}</p>
                            <p className="mt-0.5 flex items-center gap-1.5 text-[10px] font-semibold text-text-muted uppercase tracking-wider">
                              <img src={getGameAssetByName(tx.game)?.icon} alt="" className="h-3.5 w-3.5 rounded object-cover" />
                              {tx.game} • <span className="font-mono">{tx.invoice}</span>
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-black text-text-primary font-mono text-sm">
                            Rp {tx.amount.toLocaleString("id-ID")}
                          </p>
                          <span className={`inline-block px-2 py-0.5 text-[8px] font-black uppercase tracking-wider rounded mt-1.5 ${
                            tx.status === "success"
                              ? "bg-emerald-50 text-emerald-500 border border-emerald-500/20"
                              : tx.status === "pending" || tx.status === "processing"
                              ? "bg-amber-50 text-amber-500 border border-amber-500/20"
                              : "bg-red-50 text-red-500 border border-red-500/20"
                          }`} style={tagBevelStyle}>
                            {tx.status === "success" ? "Berhasil" :
                             tx.status === "processing" || tx.status === "pending" ? "Diproses" : "Gagal"}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-10 flex flex-col items-center justify-center">
                    <ShoppingBag className="h-10 w-10 text-text-muted mb-3 animate-pulse" />
                    <p className="text-xs font-bold text-text-secondary uppercase tracking-widest">Belum ada transaksi</p>
                    <p className="text-[10px] text-text-muted mt-1 max-w-xs">Gunakan Pusat Topup kami untuk mengisi diamond game Anda sekarang.</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Column: Sidebar Actions */}
          <div className="lg:col-span-4 space-y-6">

            {/* Total Spending HUD */}
            <div className="relative p-[1px] bg-gradient-to-tr from-sky/30 to-diamond/30 rounded-2xl shadow-sky-soft">
              <div className="bg-white p-6 rounded-2xl relative overflow-hidden">
                {/* Visual HUD grid line inside */}
                <div className="absolute top-0 right-0 w-24 h-24 bg-sky/5 rounded-full blur-xl pointer-events-none" />

                <h3 className="text-xs font-bold uppercase tracking-wider text-text-secondary mb-4 flex items-center gap-2">
                  <TrendingUp className="h-4.5 w-4.5 text-sky" />
                  Total Pengeluaran
                </h3>
                <p className="text-3xl font-black text-sky font-mono leading-none mb-1">
                  Rp {totalSpent.toLocaleString("id-ID")}
                </p>
                <p className="text-[10px] font-bold text-text-muted uppercase tracking-wider">
                  Berdasarkan transaksi sukses
                </p>
              </div>
            </div>

            {/* Quick Actions HUD */}
            <div className="glass-sky p-6 rounded-2xl border-sky-border shadow-sky-soft">
              <h3 className="text-xs font-bold uppercase tracking-wider text-text-primary mb-6 border-b border-sky-border/50 pb-2">
                Aksi Cepat
              </h3>
              <div className="space-y-4">

                {/* Action 1 */}
                <Link href="/" className="block">
                  <div className="relative p-[1px] bg-gradient-to-r from-sky/40 to-diamond/40 hover:from-sky hover:to-diamond transition-all duration-300" style={inputBevelStyle}>
                    <button
                      className="w-full bg-white/90 py-3 text-xs font-black uppercase tracking-widest text-sky hover:text-white transition-colors flex items-center justify-center gap-2 shimmer-hover"
                      style={inputBevelStyle}
                    >
                      <ShoppingBag className="h-4.5 w-4.5" />
                      Top Up Game Sekarang
                    </button>
                  </div>
                </Link>

                {/* Action 2 */}
                <Link href="/calculator" className="block">
                  <div className="relative p-[1px] bg-sky-border/50 hover:bg-sky-border transition-all duration-300" style={inputBevelStyle}>
                    <button
                      className="w-full bg-white/80 py-3 text-xs font-bold uppercase tracking-widest text-text-secondary hover:text-text-primary transition-colors flex items-center justify-center gap-2 shimmer-hover"
                      style={inputBevelStyle}
                    >
                      <Award className="h-4.5 w-4.5 text-sky" />
                      Buka Topup Optimizer
                    </button>
                  </div>
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
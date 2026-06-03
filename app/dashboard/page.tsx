"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { SidebarContentWrapper } from "@/components/layout/sidebar-content-wrapper"
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
import { createClient } from "@/lib/supabase/client"

export default function DashboardPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [recentTransactions, setRecentTransactions] = useState<any[]>([])
  const [stats, setStats] = useState([
    { label: "Total Transaksi", value: "0", icon: ShoppingBag, color: "text-cyan-400 bg-cyan-300/10 border-cyan-300/20" },
    { label: "Berhasil", value: "0", icon: CheckCircle2, color: "text-green-400 bg-green-500/10 border-green-500/20" },
    { label: "Pending", value: "0", icon: Clock, color: "text-yellow-400 bg-yellow-500/10 border-yellow-500/20" },
    { label: "Gagal", value: "0", icon: XCircle, color: "text-red-400 bg-red-500/10 border-red-500/20" },
  ])
  const [totalSpent, setTotalSpent] = useState(0)

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const supabase = createClient()
        const { data: { user: authUser } } = await supabase.auth.getUser()
        
        if (!authUser) {
          router.push("/auth/login")
          return
        }

        // Fetch profile
        const { data: profile } = await supabase
          .from("user_profiles")
          .select("name, email, role")
          .eq("id", authUser.id)
          .single()

        const userObj = {
          name: profile?.name || authUser.user_metadata?.name || authUser.email || "Gamer",
          email: authUser.email || "",
          role: profile?.role || "user"
        }
        setCurrentUser(userObj)

        // Fetch transactions from public.transaction_details
        const { data: txs } = await supabase
          .from("transaction_details")
          .select("*")
          .eq("user_id", authUser.id)
          .order("created_at", { ascending: false })

        if (txs) {
          const mappedTxs = txs.map((tx: any) => ({
            invoice: tx.invoice,
            product: tx.product_name,
            game: tx.game_name,
            amount: tx.amount,
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
            { label: "Total Transaksi", value: String(totalCount), icon: ShoppingBag, color: "text-cyan-400 bg-cyan-300/10 border-cyan-300/20" },
            { label: "Berhasil", value: String(successCount), icon: CheckCircle2, color: "text-green-400 bg-green-500/10 border-green-500/20" },
            { label: "Pending", value: String(pendingCount), icon: Clock, color: "text-yellow-400 bg-yellow-500/10 border-yellow-500/20" },
            { label: "Gagal", value: String(failedCount), icon: XCircle, color: "text-red-400 bg-red-500/10 border-red-500/20" },
          ])

          // Total spent (successful payments)
          const spent = txs
            .filter((tx: any) => tx.payment_status === "paid" || tx.topup_status === "success")
            .reduce((sum: number, tx: any) => sum + tx.amount, 0)
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
    if (spent >= 5000000) return { title: "Mythic Legend", color: "text-purple-400 bg-purple-500/15 border-purple-500/30" }
    if (spent >= 1500000) return { title: "Diamond Veteran", color: "text-cyan-400 bg-cyan-500/15 border-cyan-500/30" }
    if (spent >= 500000) return { title: "Gold Captain", color: "text-yellow-400 bg-yellow-500/15 border-yellow-500/30" }
    if (spent >= 100000) return { title: "Silver Elite", color: "text-slate-300 bg-slate-500/15 border-slate-500/30" }
    return { title: "Bronze Recruit", color: "text-amber-600 bg-amber-700/15 border-amber-700/30" }
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
      <div className="min-h-screen flex flex-col bg-ink relative overflow-x-clip">
        <div className="pointer-events-none absolute inset-0 mesh opacity-25 z-0" />
        <Header />
        <SidebarContentWrapper isAuthenticated={!!currentUser}>
          <main className="flex-1 flex items-center justify-center relative z-10">
            <Loader2 className="h-8 w-8 animate-spin text-cyan-300" />
          </main>
          <Footer />
        </SidebarContentWrapper>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col bg-ink relative overflow-x-clip text-slate-100">
      
      {/* Background elements */}
      <div className="pointer-events-none fixed inset-0 mesh opacity-45 z-0" />
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-cyan-300/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-blue-500/5 rounded-full blur-3xl pointer-events-none" />

      <Header user={currentUser} />

      <SidebarContentWrapper isAuthenticated={!!currentUser}>
        <main className="flex-1 py-10 relative z-10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          
          {/* Welcome HUD Header */}
        <div className="mb-10 flex flex-col md:flex-row md:items-center justify-between gap-6 bg-slate-950/40 p-6 md:p-8 rounded-2xl border border-white/5 relative overflow-hidden">
          {/* Subtle glow border at bottom */}
          <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-cyan-300/20 to-transparent" />
          
          <div className="flex items-center gap-5">
            <div className="relative p-[1px] bg-gradient-to-tr from-cyan-300/40 to-blue-500/40 rounded-full">
              <span className="grid h-16 w-16 place-items-center bg-slate-950 rounded-full text-cyan-300">
                <User className="h-8 w-8" />
              </span>
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-black uppercase text-white tracking-tight flex items-center gap-3">
                {currentUser?.name || "Gamer"}
              </h1>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">
                Selamat datang kembali di Pusat Komando Topup Anda
              </p>
            </div>
          </div>

          {/* Gamer Rank Badge */}
          <div className="flex items-center gap-3 self-start md:self-center">
            <span className="grid h-10 w-10 place-items-center bg-cyan-300/10 text-cyan-300 rounded-lg border border-cyan-300/20">
              <Shield className="h-5 w-5" />
            </span>
            <div>
              <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest block">Rank Keanggotaan</span>
              <span className={`px-3 py-1 text-[10px] font-black uppercase tracking-wider border rounded mt-1.5 inline-block ${gamerRank.color}`} style={tagBevelStyle}>
                {gamerRank.title}
              </span>
            </div>
          </div>
        </div>

        {/* Stats Grid with Beveled Outlines */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-10">
          {stats.map((stat, index) => (
            <div key={index} className="relative p-[1px] bg-gradient-to-r from-white/10 to-white/5 hover:from-cyan-300/30 hover:to-cyan-300/10 transition-all duration-300" style={bevelStyle}>
              <div className="bg-slate-950 p-6 flex flex-col justify-between" style={bevelStyle}>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">{stat.label}</span>
                  <span className={`p-2 rounded border ${stat.color.split(" ")[1]} ${stat.color.split(" ")[2]}`}>
                    <stat.icon className={`h-4.5 w-4.5 ${stat.color.split(" ")[0]}`} />
                  </span>
                </div>
                <p className="text-3xl font-black text-white font-mono leading-none">{stat.value}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Two Column Layout */}
        <div className="grid lg:grid-cols-12 gap-8">
          
          {/* Left Column: Recent Transactions Table */}
          <div className="lg:col-span-8 space-y-6">
            <div className="glass rounded-2xl border-white/10 shadow-lg relative overflow-hidden">
              <div className="p-6 border-b border-white/10 flex items-center justify-between">
                <h3 className="text-base font-black uppercase tracking-wide text-white flex items-center gap-2">
                  <History className="h-4 w-4 text-cyan-300" />
                  Transaksi Terakhir
                </h3>
                <Link href="/history">
                  <div className="relative p-[1px] bg-white/10 hover:bg-cyan-300/30 transition-all duration-300" style={inputBevelStyle}>
                    <button
                      className="bg-slate-950 px-4 py-1.5 text-[10px] font-black uppercase tracking-widest text-slate-300 hover:text-white transition-colors flex items-center gap-1.5"
                      style={inputBevelStyle}
                    >
                      Lihat Semua
                      <ArrowRight className="h-3 w-3 text-cyan-300" />
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
                        className="flex items-center justify-between p-4 bg-slate-950/60 border border-white/5 hover:border-cyan-300/20 rounded-xl transition-all duration-300 group"
                      >
                        <div className="flex items-center gap-4">
                          <span className="grid h-10 w-10 place-items-center bg-cyan-300/5 text-cyan-300 border border-cyan-300/10 rounded-lg group-hover:bg-cyan-300/10 group-hover:border-cyan-300/30 transition-colors">
                            <img src={getItemAssetForProduct(tx.product, undefined, tx.game)} alt="" className="max-h-7 max-w-7 object-contain" />
                          </span>
                          <div>
                            <p className="font-bold text-white group-hover:text-cyan-300 transition-colors text-sm uppercase tracking-tight">{tx.product}</p>
                            <p className="mt-0.5 flex items-center gap-1.5 text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
                              <img src={getGameAssetByName(tx.game)?.icon} alt="" className="h-3.5 w-3.5 rounded object-cover" />
                              {tx.game} • <span className="font-mono">{tx.invoice}</span>
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-black text-white font-mono text-sm">
                            Rp {tx.amount.toLocaleString("id-ID")}
                          </p>
                          <span className={`inline-block px-2 py-0.5 text-[8px] font-black uppercase tracking-wider rounded mt-1.5 ${
                            tx.status === "success" 
                              ? "bg-green-500/15 text-green-400 border border-green-500/20" 
                              : tx.status === "pending" || tx.status === "processing"
                              ? "bg-yellow-500/15 text-yellow-400 border border-yellow-500/20"
                              : "bg-red-500/15 text-red-400 border border-red-500/20"
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
                    <ShoppingBag className="h-10 w-10 text-slate-600 mb-3 animate-pulse" />
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Belum ada transaksi</p>
                    <p className="text-[10px] text-slate-500 mt-1 max-w-xs">Gunakan Pusat Topup kami untuk mengisi diamond game Anda sekarang.</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Column: Sidebar Actions */}
          <div className="lg:col-span-4 space-y-6">
            
            {/* Total Spending HUD */}
            <div className="relative p-[1px] bg-gradient-to-tr from-cyan-300/30 to-blue-500/30 rounded-2xl shadow-lg">
              <div className="bg-slate-950 p-6 rounded-2xl relative overflow-hidden">
                {/* Visual HUD grid line inside */}
                <div className="absolute top-0 right-0 w-24 h-24 bg-cyan-300/5 rounded-full blur-xl pointer-events-none" />
                
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4 flex items-center gap-2">
                  <TrendingUp className="h-4.5 w-4.5 text-cyan-300" />
                  Total Pengeluaran
                </h3>
                <p className="text-3xl font-black text-cyan-300 font-mono leading-none mb-1">
                  Rp {totalSpent.toLocaleString("id-ID")}
                </p>
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                  Berdasarkan transaksi sukses
                </p>
              </div>
            </div>

            {/* Quick Actions HUD */}
            <div className="glass p-6 rounded-2xl border-white/10 shadow-lg">
              <h3 className="text-xs font-bold uppercase tracking-wider text-white mb-6 border-b border-white/5 pb-2">
                Aksi Cepat
              </h3>
              <div className="space-y-4">
                
                {/* Action 1 */}
                <Link href="/" className="block">
                  <div className="relative p-[1px] bg-gradient-to-r from-cyan-300/40 to-blue-500/40 hover:from-cyan-300 hover:to-blue-500 transition-all duration-300" style={inputBevelStyle}>
                    <button
                      className="w-full bg-slate-950/90 py-3 text-xs font-black uppercase tracking-widest text-cyan-300 hover:text-white transition-colors flex items-center justify-center gap-2 shimmer-hover"
                      style={inputBevelStyle}
                    >
                      <ShoppingBag className="h-4.5 w-4.5" />
                      Top Up Game Sekarang
                    </button>
                  </div>
                </Link>

                {/* Action 2 */}
                <Link href="/calculator" className="block">
                  <div className="relative p-[1px] bg-white/10 hover:bg-white/20 transition-all duration-300" style={inputBevelStyle}>
                    <button
                      className="w-full bg-slate-950/80 py-3 text-xs font-bold uppercase tracking-widest text-slate-300 hover:text-white transition-colors flex items-center justify-center gap-2 shimmer-hover"
                      style={inputBevelStyle}
                    >
                      <Award className="h-4.5 w-4.5 text-cyan-400" />
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

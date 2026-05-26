"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { formatCurrency } from "@/lib/utils"
import { getGameAssetByName, getItemAssetForProduct } from "@/lib/assets"
import {
  TrendingUp,
  ShoppingBag,
  Users,
  Gamepad2,
  ArrowUpRight,
  ArrowDownRight,
  ArrowRight,
  Shield,
  Loader2,
} from "lucide-react"
import { createClient } from "@/lib/supabase/client"

export default function AdminDashboardPage() {
  const router = useRouter()
  const supabase = createClient()
  const [loading, setLoading] = useState(true)
  const [isAdmin, setIsAdmin] = useState(false)
  const [stats, setStats] = useState<any[]>([])
  const [recentTransactions, setRecentTransactions] = useState<any[]>([])
  const [topProducts, setTopProducts] = useState<any[]>([])

  useEffect(() => {
    async function verifyAdminAndFetchData() {
      try {
        const { data: { user: authUser } } = await supabase.auth.getUser()
        if (!authUser) {
          router.push("/auth/login")
          return
        }

        // Fetch user profile to check role
        const { data: profile } = await supabase
          .from("user_profiles")
          .select("role")
          .eq("id", authUser.id)
          .single()

        if (!profile || profile.role !== "admin") {
          // Redirect non-admin to user dashboard
          router.push("/dashboard")
          return
        }

        setIsAdmin(true)

        // 1. Fetch dynamic stats
        const { count: userCount } = await supabase.from("user_profiles").select("*", { count: "exact", head: true })
        const { count: gameCount } = await supabase.from("games").select("*", { count: "exact", head: true })
        const { data: txs } = await supabase.from("transaction_details").select("*")
        
        let totalRevenue = 0
        let totalTxCount = 0
        if (txs) {
          totalTxCount = txs.length
          totalRevenue = txs
            .filter((tx: any) => tx.payment_status === "paid" || tx.topup_status === "success")
            .reduce((sum: number, tx: any) => sum + tx.amount, 0)
          
          // Set recent transactions
          const mappedTxs = txs.map((tx: any) => ({
            invoice: tx.invoice,
            product: tx.product_name,
            game: tx.game_name,
            amount: tx.amount,
            status: tx.topup_status,
            time: formatDateRelative(tx.created_at),
          }))
          setRecentTransactions(mappedTxs.slice(0, 5))
        }

        setStats([
          {
            title: "Total Revenue",
            value: formatCurrency(totalRevenue),
            change: "+12.5%",
            trend: "up",
            icon: TrendingUp,
            color: "text-green-400 bg-green-500/10 border-green-500/20",
          },
          {
            title: "Total Transaksi",
            value: String(totalTxCount),
            change: "+8.2%",
            trend: "up",
            icon: ShoppingBag,
            color: "text-cyan-400 bg-cyan-300/10 border-cyan-300/20",
          },
          {
            title: "Total User",
            value: String(userCount || 0),
            change: "+15.3%",
            trend: "up",
            icon: Users,
            color: "text-blue-400 bg-blue-500/10 border-blue-500/20",
          },
          {
            title: "Total Game",
            value: String(gameCount || 0),
            change: "0%",
            trend: "neutral",
            icon: Gamepad2,
            color: "text-purple-400 bg-purple-500/10 border-purple-500/20",
          },
        ])

        // 2. Fetch products for top seller mock/real calculation
        const { data: dbProducts } = await supabase.from("product_details").select("*")
        if (dbProducts) {
          const sorted = dbProducts
            .map((p: any) => ({
              name: p.name,
              game: p.game_name,
              sku: p.provider_sku,
              sold: Math.floor(Math.random() * 30) + 5, // Mocked sold count for dashboard display
              revenue: p.sell_price * (Math.floor(Math.random() * 10) + 1),
            }))
            .sort((a: any, b: any) => b.revenue - a.revenue)
          setTopProducts(sorted.slice(0, 4))
        }

      } catch (err) {
        console.error("Error loading admin data:", err)
      } finally {
        setLoading(false)
      }
    }
    verifyAdminAndFetchData()
  }, [router])

  // Simple human-readable date helper
  const formatDateRelative = (dateStr: string) => {
    if (!dateStr) return "-"
    const date = new Date(dateStr)
    const diffMs = new Date().getTime() - date.getTime()
    const diffMin = Math.floor(diffMs / 60000)
    if (diffMin < 60) return `${diffMin} menit lalu`
    const diffHours = Math.floor(diffMin / 60)
    if (diffHours < 24) return `${diffHours} jam lalu`
    return date.toLocaleDateString("id-ID")
  }

  // Clip paths for gaming UI bevels
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
      <div className="min-h-screen flex flex-col bg-ink relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0 mesh opacity-25 z-0" />
        <Header />
        <main className="flex-1 flex items-center justify-center relative z-10">
          <Loader2 className="h-8 w-8 animate-spin text-cyan-300" />
        </main>
        <Footer />
      </div>
    )
  }

  if (!isAdmin) return null

  return (
    <div className="min-h-screen flex flex-col bg-ink relative overflow-hidden text-slate-100">
      
      {/* Background components */}
      <div className="pointer-events-none fixed inset-0 mesh opacity-45 z-0" />
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-red-500/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-cyan-300/5 rounded-full blur-3xl pointer-events-none" />

      <Header user={{ name: "Admin", email: "admin@gametopup.com", role: "admin" }} />

      <main className="flex-1 py-10 px-4 sm:px-6 lg:px-8 relative z-10 max-w-7xl mx-auto w-full">
        
        {/* Admin HUD Header */}
        <div className="mb-10 flex flex-col md:flex-row md:items-center justify-between gap-6 bg-slate-950/40 p-6 md:p-8 rounded-2xl border border-white/5 relative overflow-hidden">
          <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-cyan-300/20 to-transparent" />
          
          <div className="flex items-center gap-5">
            <div className="relative p-[1px] bg-gradient-to-tr from-cyan-300/40 to-blue-500/40 rounded-full">
              <span className="grid h-16 w-16 place-items-center bg-slate-950 rounded-full text-cyan-300">
                <Shield className="h-8 w-8" />
              </span>
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-black uppercase text-white tracking-tight">
                Admin Control Room
              </h1>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">
                Overview &amp; Manajemen Data Penjualan Mitsuru
              </p>
            </div>
          </div>

          <div className="flex gap-3">
            <Link href="/admin/games">
              <div className="relative p-[1px] bg-white/10 hover:bg-cyan-300/30 transition-all duration-300" style={inputBevelStyle}>
                <button className="bg-slate-950 px-4 py-2 text-[10px] font-black uppercase tracking-widest text-slate-300 hover:text-white transition-colors" style={inputBevelStyle}>
                  Kelola Game
                </button>
              </div>
            </Link>
            <Link href="/admin/transactions">
              <div className="relative p-[1px] bg-cyan-300/40 hover:bg-cyan-300 transition-all duration-300" style={inputBevelStyle}>
                <button className="bg-slate-950/90 px-4 py-2 text-[10px] font-black uppercase tracking-widest text-cyan-300 hover:text-white transition-colors shimmer-hover" style={inputBevelStyle}>
                  Daftar Transaksi
                </button>
              </div>
            </Link>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-10">
          {stats.map((stat, index) => (
            <div key={index} className="relative p-[1px] bg-gradient-to-r from-white/10 to-white/5 hover:from-cyan-300/30 hover:to-cyan-300/10 transition-all duration-300" style={bevelStyle}>
              <div className="bg-slate-950 p-6 flex flex-col justify-between" style={bevelStyle}>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">{stat.title}</span>
                  <span className={`p-2 rounded border ${stat.color.split(" ")[1]} ${stat.color.split(" ")[2]}`}>
                    <stat.icon className={`h-4.5 w-4.5 ${stat.color.split(" ")[0]}`} />
                  </span>
                </div>
                <div className="flex items-baseline justify-between">
                  <p className="text-2xl font-black text-white font-mono leading-none">{stat.value}</p>
                  <span className={`text-[10px] font-bold flex items-center gap-0.5 ${
                    stat.trend === "up" ? "text-green-400" : "text-slate-500"
                  }`}>
                    {stat.trend === "up" && <ArrowUpRight className="h-3 w-3" />}
                    {stat.change}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Tables Split Layout */}
        <div className="grid lg:grid-cols-12 gap-8">
          
          {/* Recent Transactions Panel */}
          <div className="lg:col-span-8 space-y-6">
            <div className="glass rounded-2xl border-white/10 shadow-lg relative overflow-hidden">
              <div className="p-6 border-b border-white/10 flex items-center justify-between">
                <h3 className="text-base font-black uppercase tracking-wide text-white flex items-center gap-2">
                  <ShoppingBag className="h-4 w-4 text-cyan-300" />
                  Transaksi Terbaru
                </h3>
                <Link href="/admin/transactions">
                  <div className="relative p-[1px] bg-white/10 hover:bg-cyan-300/30 transition-all duration-300" style={inputBevelStyle}>
                    <button
                      className="bg-slate-950 px-4 py-1.5 text-[10px] font-black uppercase tracking-widest text-slate-300 hover:text-white transition-colors flex items-center gap-1.5 animate-pulse"
                      style={inputBevelStyle}
                    >
                      Semua Transaksi
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
                        <div>
                          <p className="flex items-center gap-2 font-bold text-white group-hover:text-cyan-300 transition-colors text-sm uppercase tracking-tight">
                            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded bg-white p-1">
                              <img src={getItemAssetForProduct(tx.product, undefined, tx.game)} alt="" className="max-h-full max-w-full object-contain" />
                            </span>
                            {tx.product}
                          </p>
                          <p className="mt-1 flex items-center gap-1.5 text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
                            <img src={getGameAssetByName(tx.game)?.icon} alt="" className="h-3.5 w-3.5 rounded object-cover" />
                            {tx.game} • <span className="font-mono">{tx.invoice}</span>
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-black text-white font-mono text-sm">
                            Rp {tx.amount.toLocaleString("id-ID")}
                          </p>
                          <div className="flex items-center gap-2 justify-end mt-1">
                            <span className="text-[9px] text-slate-500 font-medium">{tx.time}</span>
                            <span className={`inline-block px-2 py-0.5 text-[8px] font-black uppercase tracking-wider rounded ${
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
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-10">
                    <p className="text-xs text-slate-500 uppercase tracking-widest font-bold">Tidak ada transaksi ditemukan</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Top Products Panel */}
          <div className="lg:col-span-4">
            <div className="glass rounded-2xl border-white/10 shadow-lg relative overflow-hidden">
              <div className="p-6 border-b border-white/10">
                <h3 className="text-base font-black uppercase tracking-wide text-white">
                  Produk Terlaris
                </h3>
              </div>
              <div className="p-6 space-y-4">
                {topProducts.map((p, idx) => (
                  <div key={idx} className="flex justify-between items-center bg-slate-950/60 p-4 rounded-xl border border-white/5 hover:border-cyan-300/10 transition-all duration-300">
                    <div className="flex items-center gap-3">
                      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white p-1.5">
                        <img src={getItemAssetForProduct(p.name, p.sku, p.game)} alt="" className="max-h-full max-w-full object-contain" />
                      </span>
                      <div>
                      <p className="font-extrabold text-white text-xs uppercase tracking-tight">{p.name}</p>
                      <p className="mt-0.5 flex items-center gap-1.5 text-[9px] font-bold text-slate-500 uppercase tracking-wider">
                        <img src={getGameAssetByName(p.game)?.icon} alt="" className="h-3 w-3 rounded object-cover" />
                        {p.game} • {p.sold} terjual
                      </p>
                      </div>
                    </div>
                    <span className="text-xs font-black text-green-400 font-mono">
                      Rp {p.revenue.toLocaleString("id-ID")}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

        </div>

      </main>

      <Footer />
    </div>
  )
}

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
} from "lucide-react"

export default function DashboardPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [recentTransactions, setRecentTransactions] = useState<any[]>([])
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
      if (link) {
        router.push(link)
      }
    } catch (err) {
      console.error("Failed to mark notification read:", err)
    }
  }

  const handleMarkAllRead = async () => {
    try {
      await fetch("/api/notifications", { method: "DELETE" })
      fetchNotifications()
    } catch (err) {
      console.error("Failed to mark all read:", err)
    }
  }

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
              amount: Number(tx.amount),
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
                <div className="bg-[#183644]/90 backdrop-blur-md rounded-2xl border border-sky/30 shadow-sky-soft relative overflow-hidden">

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
                          className="mr-4 text-[9px] font-black uppercase text-sky hover:text-white tracking-widest border border-sky/30 bg-sky/10 px-3 py-1 rounded-lg transition-all"
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
                        <div className="space-y-3">
                          {recentTransactions.map((tx, index) => (
                            <div
                              key={index}
                              className="flex items-center justify-between p-4 bg-black/20 border border-sky/20 hover:border-sky/40 rounded-xl transition-all duration-300 group"
                            >
                              <div className="flex items-center gap-4">
                                <span className="grid h-10 w-10 place-items-center bg-sky/10 text-sky border border-sky/20 rounded-lg group-hover:border-sky/40 transition-colors">
                                  <img src={getItemAssetForProduct(tx.product, undefined, tx.game)} alt="" className="max-h-7 max-w-7 object-contain" />
                                </span>
                                <div>
                                  <p className="font-bold text-white group-hover:text-sky transition-colors text-sm uppercase tracking-tight">{tx.product}</p>
                                  <p className="mt-0.5 flex items-center gap-1.5 text-[10px] font-semibold text-white/40 uppercase tracking-wider">
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
                                    ? "bg-emerald-400/10 text-emerald-400 border border-emerald-400/30"
                                    : tx.status === "pending" || tx.status === "processing"
                                    ? "bg-amber-400/10 text-amber-400 border border-amber-400/30"
                                    : "bg-red-400/10 text-red-400 border border-red-400/30"
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
                                className={`p-4 border rounded-xl flex items-start gap-4 transition-all duration-300 cursor-pointer ${
                                  isUnread
                                    ? "bg-sky/10 border-sky/30 hover:bg-sky/15"
                                    : "bg-black/20 border-sky/10 hover:border-sky/20"
                                }`}
                              >
                                <div className={`p-2 rounded-lg ${isUnread ? "bg-sky/20 text-sky animate-pulse" : "bg-mist backdrop-blur-md text-white/30"}`}>
                                  {isFeedback ? <MessageSquare className="h-4 w-4" /> : <Bell className="h-4 w-4" />}
                                </div>
                                <div className="flex-grow">
                                  <div className="flex justify-between items-start">
                                    <p className={`text-xs uppercase tracking-wide leading-tight ${isUnread ? "font-black text-white" : "font-bold text-white/50"}`}>
                                      {notif.title}
                                    </p>
                                    <span className="text-[8px] font-bold text-white/30 uppercase">
                                      {new Date(notif.created_at).toLocaleDateString("id-ID", {
                                        day: "numeric",
                                        month: "short",
                                        hour: "2-digit",
                                        minute: "2-digit"
                                      })}
                                    </span>
                                  </div>
                                  <p className="text-[11px] text-white/50 mt-1 leading-relaxed">{notif.message}</p>
                                  {isUnread && (
                                    <span className="inline-flex items-center gap-0.5 text-[8px] font-black uppercase text-sky tracking-wider mt-1.5">
                                      <Check className="h-3 w-3" /> Baru / Klik untuk buka & tandai dibaca
                                    </span>
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
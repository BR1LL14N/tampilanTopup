"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { SidebarContentWrapper } from "@/components/layout/sidebar-content-wrapper"
import { Skeleton } from "@/components/ui/skeleton"
import { getCachedUser, setCachedUser } from "@/lib/auth-cache"
import { formatCurrency } from "@/lib/utils"
import { getGameAssetByName, getItemAssetForProduct } from "@/lib/assets"
import {
  TrendingUp,
  ShoppingBag,
  Users,
  Gamepad2,
  ArrowUpRight,
  ArrowRight,
  Shield,
  RefreshCw,
  Clock,
  Power,
  Settings,
  AlertCircle,
  CheckCircle2,
  Code,
  Wallet
} from "lucide-react"

export default function AdminDashboardPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [isAdmin, setIsAdmin] = useState(false)
  const [stats, setStats] = useState<any[]>([])
  const [recentTransactions, setRecentTransactions] = useState<any[]>([])
  const [topProducts, setTopProducts] = useState<any[]>([])
  const [currentUser, setCurrentUser] = useState<any>(null)

  // Sync Settings States
  const [isSyncActive, setIsSyncActive] = useState(true)
  const [syncInterval, setSyncInterval] = useState(24)
  const [lastSyncTime, setLastSyncTime] = useState("")
  const [lastSyncStatus, setLastSyncStatus] = useState("idle")
  const [isSyncing, setIsSyncing] = useState(false)
  const [saveLoading, setSaveLoading] = useState(false)
  const [saveSuccess, setSaveSuccess] = useState(false)
  const [syncMessage, setSyncMessage] = useState("")
  const [refreshTrigger, setRefreshTrigger] = useState(0)

  useEffect(() => {
    // Read cache on mount
    const cached = getCachedUser()
    if (cached?.role === "admin") {
      setIsAdmin(true)
      setCurrentUser(cached)
    }

    async function verifyAdminAndFetchData() {
      try {
        const resUser = await fetch("/api/auth/me")
        const { user } = await resUser.json()

        if (!user || user.role !== "admin") {
          setCachedUser(null)
          router.push("/auth/login")
          return
        }

        setIsAdmin(true)
        setCachedUser(user)
        setCurrentUser(user)

        // Fetch stats
        const resStats = await fetch("/api/admin/stats")
        const data = await resStats.json()

        if (data.error) throw new Error(data.error)

        setStats([
          {
            title: "Total Revenue",
            value: formatCurrency(Number(data.stats.totalRevenue) || 0),
            change: "+12.5%",
            trend: "up",
            icon: TrendingUp,
            color: "text-green-500 bg-green-50 border-green-500/20",
          },
          {
            title: "Total Transaksi",
            value: String(data.stats.totalTxCount || 0),
            change: "+8.2%",
            trend: "up",
            icon: ShoppingBag,
            color: "text-sky bg-sky/10 border-sky/20",
          },
          {
            title: "Total User",
            value: String(data.stats.userCount || 0),
            change: "+15.3%",
            trend: "up",
            icon: Users,
            color: "text-blue-500 bg-blue-50 border-blue-500/20",
          },
          {
            title: "Total Game",
            value: String(data.stats.gameCount || 0),
            change: "0%",
            trend: "neutral",
            icon: Gamepad2,
            color: "text-purple-500 bg-purple-50 border-purple-500/20",
          },
          {
            title: "Saldo Digiflazz",
            value: formatCurrency(Number(data.stats.digiflazzBalance) || 0),
            change: "Live",
            trend: "neutral",
            icon: Wallet,
            color: "text-amber-500 bg-amber-50 border-amber-500/20",
          },
        ])

        if (data.recentTransactions) {
          setRecentTransactions(data.recentTransactions.map((tx: any) => ({
            invoice: tx.invoice,
            product: tx.product_name,
            game: tx.game_name,
            amount: Number(tx.amount) || 0,
            status: tx.topup_status,
            time: formatDateRelative(tx.created_at),
          })))
        }

        if (data.topProducts) {
          setTopProducts(data.topProducts.map((p: any) => ({
            name: p.name,
            game: p.game_name,
            sku: p.sku,
            sold: Number(p.sold) || 0,
            revenue: Number(p.revenue) || 0
          })))
        }

        // Fetch sync settings
        try {
          const resSettings = await fetch("/api/admin/settings")
          const settingsData = await resSettings.json()
          if (settingsData.settings) {
            setIsSyncActive(settingsData.settings.isSyncActive)
            setSyncInterval(settingsData.settings.syncInterval)
            setLastSyncTime(settingsData.settings.lastSyncTime)
            setLastSyncStatus(settingsData.settings.lastSyncStatus)
          }
        } catch (err) {
          console.error("Error loading sync settings:", err)
        }

      } catch (err) {
        console.error("Error loading admin data:", err)
      } finally {
        setLoading(false)
      }
    }
    verifyAdminAndFetchData()
  }, [router, refreshTrigger])

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaveLoading(true)
    setSaveSuccess(false)
    try {
      const res = await fetch("/api/admin/settings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          isSyncActive,
          syncInterval,
        }),
      })
      const data = await res.json()
      if (data.success) {
        setSaveSuccess(true)
        setTimeout(() => setSaveSuccess(false), 3000)
      } else {
        alert(data.error || "Gagal menyimpan pengaturan")
      }
    } catch (err: any) {
      alert(err.message || "Gagal menyimpan pengaturan")
    } finally {
      setSaveLoading(false)
    }
  }

  const handleManualSync = async () => {
    if (isSyncing) return
    setIsSyncing(true)
    setSyncMessage("")
    try {
      const res = await fetch("/api/admin/sync/trigger?manual=true", {
        method: "POST",
      })
      const data = await res.json()
      if (data.success) {
        setSyncMessage(`Berhasil menyinkronkan ${data.gamesCount || 0} Game dan memperbarui produk.`)
        setRefreshTrigger(prev => prev + 1)
      } else {
        setSyncMessage(`Gagal: ${data.error || "Kesalahan tidak dikenal"}`)
      }
    } catch (err: any) {
      setSyncMessage(`Gagal: ${err.message || "Koneksi terputus"}`)
    } finally {
      setIsSyncing(false)
    }
  }

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

  // Clip paths for sky fantasy UI bevels
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
        <SidebarContentWrapper isAuthenticated={isAdmin}>
          <main className="flex-1 py-10 relative z-10">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-10">
              {/* Title */}
              <div className="space-y-2">
                <Skeleton className="h-8 w-48 rounded-lg bg-sky/10" />
                <Skeleton className="h-4 w-72 rounded-md bg-sky/10" />
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="bg-white p-6 rounded-2xl border border-sky-border shadow-sky-soft space-y-3">
                    <div className="flex justify-between items-center">
                      <Skeleton className="h-4 w-24 rounded-md bg-sky/10" />
                      <Skeleton className="h-8 w-8 rounded-xl bg-sky/10" />
                    </div>
                    <Skeleton className="h-8 w-28 rounded-lg bg-sky/10" />
                  </div>
                ))}
              </div>

              {/* Two columns */}
              <div className="grid lg:grid-cols-12 gap-8">
                {/* Left Column: Transaksi Terbaru */}
                <div className="lg:col-span-8 bg-white p-6 rounded-2xl border border-sky-border shadow-sky-soft space-y-6">
                  <Skeleton className="h-6 w-40 rounded-lg bg-sky/10" />
                  <div className="space-y-4">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <div key={i} className="flex justify-between items-center p-4 border border-sky-border/50 rounded-xl">
                        <div className="space-y-2 flex-1 mr-4">
                          <Skeleton className="h-4 w-28 rounded-md bg-sky/10" />
                          <Skeleton className="h-3 w-40 rounded-sm bg-sky/10" />
                        </div>
                        <Skeleton className="h-6 w-16 rounded-md bg-sky/10" />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Right Column: Produk Terlaris */}
                <div className="lg:col-span-4 bg-white p-6 rounded-2xl border border-sky-border shadow-sky-soft space-y-6">
                  <Skeleton className="h-6 w-40 rounded-lg bg-sky/10" />
                  <div className="space-y-4">
                    {[1, 2, 3, 4].map((i) => (
                      <div key={i} className="flex items-center gap-4 p-3 border border-sky-border/30 rounded-xl">
                        <Skeleton className="h-10 w-10 rounded-lg shrink-0 bg-sky/10" />
                        <div className="flex-1 space-y-2">
                          <Skeleton className="h-4 w-24 rounded-md bg-sky/10" />
                          <Skeleton className="h-3 w-16 rounded-sm bg-sky/10" />
                        </div>
                        <Skeleton className="h-5 w-10 rounded-md bg-sky/10" />
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

  if (!isAdmin) return null

  return (
    <div className="min-h-screen flex flex-col relative overflow-x-clip">

      {/* Background components */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-red-500/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-sky/5 rounded-full blur-3xl pointer-events-none" />

      <Header user={currentUser} />

      <SidebarContentWrapper isAuthenticated={isAdmin}>
        <main className="flex-1 py-10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">

          {/* Admin HUD Header */}
        <div className="mb-10 flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white/60 p-6 md:p-8 rounded-2xl border border-sky-border relative overflow-hidden shadow-sky-soft">
          <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-sky/20 to-transparent" />

          <div className="flex items-center gap-5">
            <div className="relative p-[1px] bg-gradient-to-tr from-sky/40 to-diamond/40 rounded-full">
              <span className="grid h-16 w-16 place-items-center bg-white rounded-full text-sky">
                <Shield className="h-8 w-8" />
              </span>
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-black uppercase text-text-primary tracking-tight">
                Admin Control Room
              </h1>
              <p className="text-xs font-bold text-text-muted uppercase tracking-widest mt-1">
                Overview &amp; Manajemen Data Penjualan Mitsuru
              </p>
            </div>
          </div>

          <div className="flex gap-3">
            <Link href="/admin/games">
              <div className="relative p-[1px] bg-sky-border hover:bg-sky/30 transition-all duration-300" style={inputBevelStyle}>
                <button className="bg-white px-4 py-2 text-[10px] font-black uppercase tracking-widest text-text-secondary hover:text-text-primary transition-colors" style={inputBevelStyle}>
                  Kelola Game
                </button>
              </div>
            </Link>
            <Link href="/admin/transactions">
              <div className="relative p-[1px] bg-sky/40 hover:bg-sky transition-all duration-300" style={inputBevelStyle}>
                <button className="bg-white/90 px-4 py-2 text-[10px] font-black uppercase tracking-widest text-sky hover:text-diamond transition-colors shimmer-hover" style={inputBevelStyle}>
                  Daftar Transaksi
                </button>
              </div>
            </Link>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6 mb-10">
          {stats.map((stat, index) => (
            <div key={index} className="relative p-[1px] bg-gradient-to-r from-sky/20 to-sky/10 hover:from-sky/30 hover:to-sky/20 transition-all duration-300" style={bevelStyle}>
              <div className="bg-white p-6 flex flex-col justify-between" style={bevelStyle}>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs font-bold text-text-muted uppercase tracking-wider">{stat.title}</span>
                  <span className={`p-2 rounded border ${stat.color.split(" ")[1]} ${stat.color.split(" ")[2]}`}>
                    <stat.icon className={`h-4.5 w-4.5 ${stat.color.split(" ")[0]}`} />
                  </span>
                </div>
                <div className="flex items-baseline justify-between">
                  <p className="text-2xl font-black text-text-primary font-mono leading-none">{stat.value}</p>
                  <span className={`text-[10px] font-bold flex items-center gap-0.5 ${
                    stat.trend === "up" ? "text-green-500" : "text-text-muted"
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
            <div className="bg-white rounded-2xl border-sky-border shadow-sky-soft relative overflow-hidden">
              <div className="p-6 border-b border-sky-border flex items-center justify-between">
                <h3 className="text-base font-black uppercase tracking-wide text-text-primary flex items-center gap-2">
                  <ShoppingBag className="h-4 w-4 text-sky" />
                  Transaksi Terbaru
                </h3>
                <Link href="/admin/transactions">
                  <div className="relative p-[1px] bg-sky-border hover:bg-sky/30 transition-all duration-300" style={inputBevelStyle}>
                    <button
                      className="bg-white px-4 py-1.5 text-[10px] font-black uppercase tracking-widest text-text-secondary hover:text-text-primary transition-colors flex items-center gap-1.5"
                      style={inputBevelStyle}
                    >
                      Semua Transaksi
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
                        <div>
                          <p className="flex items-center gap-2 font-bold text-text-primary group-hover:text-sky transition-colors text-sm uppercase tracking-tight">
                            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded bg-white p-1">
                              <img src={getItemAssetForProduct(tx.product, undefined, tx.game)} alt="" className="max-h-full max-w-full object-contain" />
                            </span>
                            {tx.product}
                          </p>
                          <p className="mt-1 flex items-center gap-1.5 text-[10px] font-semibold text-text-muted uppercase tracking-wider">
                            <img src={getGameAssetByName(tx.game)?.icon} alt="" className="h-3.5 w-3.5 rounded object-cover" />
                            {tx.game} • <span className="font-mono">{tx.invoice}</span>
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-black text-text-primary font-mono text-sm">
                            Rp {tx.amount.toLocaleString("id-ID")}
                          </p>
                          <div className="flex items-center gap-2 justify-end mt-1">
                            <span className="text-[9px] text-text-muted font-medium">{tx.time}</span>
                            <span className={`inline-block px-2 py-0.5 text-[8px] font-black uppercase tracking-wider rounded ${
                              tx.status === "success"
                                ? "bg-green-50 text-green-500 border border-green-500/20"
                                : tx.status === "pending" || tx.status === "processing"
                                ? "bg-amber-50 text-amber-500 border border-amber-500/20"
                                : "bg-red-50 text-red-500 border border-red-500/20"
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
                    <p className="text-xs text-text-muted uppercase tracking-widest font-bold">Tidak ada transaksi ditemukan</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Column: Sync & Top Products */}
          <div className="lg:col-span-4 space-y-8">
            {/* Sync Settings Card */}
            <div className="bg-white rounded-2xl border border-sky-border shadow-sky-soft relative overflow-hidden">
              <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-sky/20 to-transparent" />
              <div className="p-6 border-b border-sky-border flex items-center justify-between">
                <h3 className="text-base font-black uppercase tracking-wide text-text-primary flex items-center gap-2">
                  <Settings className="h-4 w-4 text-sky" />
                  Auto-Sync Control
                </h3>
                <span className={`inline-block px-2.5 py-0.5 text-[9px] font-black uppercase tracking-wider rounded ${
                  lastSyncStatus === "success"
                    ? "bg-green-50 text-green-500 border border-green-500/20"
                    : lastSyncStatus === "failed"
                    ? "bg-red-50 text-red-500 border border-red-500/20"
                    : "bg-blue-50 text-sky border border-sky/20"
                }`} style={tagBevelStyle}>
                  {lastSyncStatus === "success" ? "Aktif & Ok" : lastSyncStatus === "failed" ? "Gagal" : "Idle"}
                </span>
              </div>

              <form onSubmit={handleSaveSettings} className="p-6 space-y-5">
                {/* Active Toggle */}
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <label className="text-xs font-bold text-text-secondary uppercase tracking-wider flex items-center gap-1.5">
                      <Power className="h-3.5 w-3.5 text-sky" />
                      Status Sinkronisasi
                    </label>
                    <p className="text-[10px] text-text-muted">Aktifkan sinkronisasi otomatis harga.</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsSyncActive(!isSyncActive)}
                    className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                      isSyncActive ? "bg-sky" : "bg-gray-200"
                    }`}
                  >
                    <span
                      className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                        isSyncActive ? "translate-x-5" : "translate-x-0"
                      }`}
                    />
                  </button>
                </div>

                {/* Interval Input */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-text-secondary uppercase tracking-wider flex items-center gap-1.5">
                    <Clock className="h-3.5 w-3.5 text-sky" />
                    Interval Sinkronisasi
                  </label>
                  <div className="relative p-[1px] bg-sky-border" style={inputBevelStyle}>
                    <div className="flex items-center bg-white" style={inputBevelStyle}>
                      <input
                        type="number"
                        min="1"
                        max="168"
                        value={syncInterval}
                        onChange={(e) => setSyncInterval(Math.max(1, parseInt(e.target.value) || 1))}
                        className="w-full px-3 py-2 text-xs font-semibold font-mono text-text-primary focus:outline-none bg-transparent"
                      />
                      <span className="pr-3 text-[10px] font-black uppercase text-text-muted tracking-wider shrink-0 select-none">
                        Jam Sekali
                      </span>
                    </div>
                  </div>
                  <p className="text-[10px] text-text-muted leading-relaxed">
                    Sistem akan menyinkronkan katalog harga modal Digiflazz setiap {syncInterval} jam.
                  </p>
                </div>

                {/* Save Button */}
                <div className="flex gap-2">
                  <div className="relative p-[1px] bg-sky/30 hover:bg-sky transition-all duration-300 flex-1" style={inputBevelStyle}>
                    <button
                      type="submit"
                      disabled={saveLoading}
                      className="w-full bg-white/95 py-2 text-[10px] font-black uppercase tracking-widest text-sky hover:text-diamond transition-colors disabled:opacity-50"
                      style={inputBevelStyle}
                    >
                      {saveLoading ? "Menyimpan..." : "Simpan Pengaturan"}
                    </button>
                  </div>

                  <div className="relative p-[1px] bg-sky-border hover:bg-sky/30 transition-all duration-300" style={inputBevelStyle}>
                    <button
                      type="button"
                      onClick={handleManualSync}
                      disabled={isSyncing}
                      className="bg-white px-4 py-2 text-[10px] font-black uppercase tracking-widest text-text-secondary hover:text-text-primary transition-colors disabled:opacity-50 flex items-center gap-1.5"
                      style={inputBevelStyle}
                    >
                      <RefreshCw className={`h-3 w-3 text-sky ${isSyncing ? "animate-spin" : ""}`} />
                      Sync
                    </button>
                  </div>
                </div>

                {/* Status Messages */}
                {saveSuccess && (
                  <div className="p-3 bg-green-50 border border-green-500/20 text-green-600 rounded-xl flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 shrink-0" />
                    <span className="text-[10px] font-bold uppercase tracking-wider">Pengaturan disimpan!</span>
                  </div>
                )}

                {syncMessage && (
                  <div className={`p-3 border rounded-xl flex items-start gap-2 ${
                    syncMessage.startsWith("Berhasil")
                      ? "bg-green-50 border-green-500/20 text-green-600"
                      : "bg-red-50 border-red-500/20 text-red-600"
                  }`}>
                    {syncMessage.startsWith("Berhasil") ? (
                      <CheckCircle2 className="h-4 w-4 shrink-0 mt-0.5" />
                    ) : (
                      <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                    )}
                    <span className="text-[10px] font-bold leading-normal">{syncMessage}</span>
                  </div>
                )}

                {/* Metadata details */}
                <div className="pt-3 border-t border-sky-border/50 space-y-1.5 text-[10px] text-text-muted font-medium">
                  <div className="flex justify-between">
                    <span>Terakhir Sinkron:</span>
                    <span className="font-mono text-text-secondary">{lastSyncTime ? new Date(lastSyncTime).toLocaleString("id-ID") : "-"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Waktu Relatif:</span>
                    <span className="font-semibold text-text-secondary">{lastSyncTime ? formatDateRelative(lastSyncTime) : "-"}</span>
                  </div>
                </div>
              </form>
            </div>

            {/* Rekomendasi Produksi (Cron Job Tips) Card */}
            <div className="bg-white rounded-2xl border border-sky-border shadow-sky-soft relative overflow-hidden">
              <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-sky/20 to-transparent" />
              <div className="p-6 border-b border-sky-border">
                <h3 className="text-base font-black uppercase tracking-wide text-text-primary flex items-center gap-2">
                  <Code className="h-4 w-4 text-sky" />
                  Rekomendasi Produksi (Cron)
                </h3>
              </div>
              <div className="p-6 space-y-4 text-xs text-text-secondary leading-relaxed">
                <p>
                  Untuk memastikan harga modal &amp; jual selalu up-to-date, pasang penjadwal tugas otomatis (Cron Job / Task Scheduler) untuk memicu API di bawah:
                </p>

                <div className="space-y-1">
                  <span className="font-bold text-text-primary uppercase tracking-wider text-[9px]">Langkah 1: Setup Kunci Keamanan</span>
                  <p className="text-[10px] text-text-muted">
                    Definisikan token rahasia di file <code className="bg-ice px-1 py-0.5 rounded text-sky font-mono font-bold text-[9px]">.env.local</code> Anda:
                  </p>
                  <pre className="bg-ice p-2.5 rounded-lg border border-sky-border/50 text-[10px] font-mono text-sky font-bold overflow-x-auto select-all">
                    DIGIFLAZZ_WEBHOOK_SECRET=mitsurusecurewebhooksecret99f3a1b7c8d2e6a0a
                  </pre>
                </div>

                <div className="space-y-1">
                  <span className="font-bold text-text-primary uppercase tracking-wider text-[9px]">Langkah 2: Konfigurasi Penjadwal</span>
                  <p className="text-[10px] text-text-muted">
                    Tambahkan perintah berikut di Linux Crontab (<code className="font-mono text-[9px]">crontab -e</code>) untuk berjalan otomatis setiap malam (00:00):
                  </p>
                  <pre className="bg-ice p-2.5 rounded-lg border border-sky-border/50 text-[9px] font-mono text-text-primary overflow-x-auto select-all whitespace-pre-wrap break-all">
                    0 0 * * * curl -s "https://yourdomain.com/api/admin/sync/trigger?key=mitsurusecurewebhooksecret99f3a1b7c8d2e6a0a" &gt;/dev/null 2&gt;&amp;1
                  </pre>
                </div>

                <div className="bg-amber-50/50 border border-amber-500/10 p-3 rounded-xl space-y-1 text-[10px] text-text-muted">
                  <span className="font-bold text-amber-600 uppercase tracking-wider flex items-center gap-1">
                    <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                    Catatan
                  </span>
                  <p className="leading-relaxed">
                    Ganti <code className="font-mono text-[9px]">yourdomain.com</code> dengan domain web Anda. Token URL di atas disesuaikan dengan nilai env Anda.
                  </p>
                </div>
              </div>
            </div>

            {/* Top Products Panel */}
            <div className="bg-white rounded-2xl border border-sky-border shadow-sky-soft relative overflow-hidden">
              <div className="p-6 border-b border-sky-border">
                <h3 className="text-base font-black uppercase tracking-wide text-text-primary">
                  Produk Terlaris
                </h3>
              </div>
              <div className="p-6 space-y-4">
                {topProducts.map((p, idx) => (
                  <div key={idx} className="flex justify-between items-center bg-ice p-4 rounded-xl border border-sky-border/50 hover:border-sky/10 transition-all duration-300">
                    <div className="flex items-center gap-3">
                      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white p-1.5">
                        <img src={getItemAssetForProduct(p.name, p.sku, p.game)} alt="" className="max-h-full max-w-full object-contain" />
                      </span>
                      <div>
                      <p className="font-extrabold text-text-primary text-xs uppercase tracking-tight">{p.name}</p>
                      <p className="mt-0.5 flex items-center gap-1.5 text-[9px] font-bold text-text-muted uppercase tracking-wider">
                        <img src={getGameAssetByName(p.game)?.icon} alt="" className="h-3.5 w-3.5 rounded object-cover" />
                        {p.game} • {p.sold} terjual
                      </p>
                      </div>
                    </div>
                    <span className="text-xs font-black text-green-500 font-mono">
                      Rp {p.revenue.toLocaleString("id-ID")}
                    </span>
                  </div>
                ))}
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
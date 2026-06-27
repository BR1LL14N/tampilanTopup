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
  Wallet,
  MessageSquare,
  Smartphone,
  ExternalLink,
  QrCode
} from "lucide-react"

export default function AdminDashboardPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [isAdmin, setIsAdmin] = useState(false)
  const [stats, setStats] = useState<any[]>([])
  const [recentTransactions, setRecentTransactions] = useState<any[]>([])
  const [topProducts, setTopProducts] = useState<any[]>([])
  const [currentUser, setCurrentUser] = useState<any>(null)
  
  // Activity Tabs States
  const [activities, setActivities] = useState<{
    checkouts: any[];
    payments: any[];
    syncs: any[];
    feedbacks: any[];
  }>({
    checkouts: [],
    payments: [],
    syncs: [],
    feedbacks: []
  })
  const [activeTab, setActiveTab] = useState<"checkout" | "pembayaran" | "sync" | "feedback">("checkout")

  // Sync Settings States
  const [isSyncActive, setIsSyncActive] = useState(true)
  const [syncInterval, setSyncInterval] = useState(24)
  const [lastSyncTime, setLastSyncTime] = useState("")
  const [lastSyncStatus, setLastSyncStatus] = useState("idle")
  const [midtransMode, setMidtransMode] = useState("sandbox")
  const [isSyncing, setIsSyncing] = useState(false)
  const [saveLoading, setSaveLoading] = useState(false)
  const [saveSuccess, setSaveSuccess] = useState(false)
  const [syncMessage, setSyncMessage] = useState("")
  const [refreshTrigger, setRefreshTrigger] = useState(0)

  // WhatsApp States
  const [waStatus, setWaStatus] = useState("disabled")
  const [waMethod, setWaMethod] = useState("baileys")
  const [waEndpoint, setWaEndpoint] = useState("http://localhost:5000/send")
  const [waToken, setWaToken] = useState("")
  const [waAdminNumber, setWaAdminNumber] = useState("")
  const [waCustomerNotif, setWaCustomerNotif] = useState(true)
  const [baileysStatus, setBaileysStatus] = useState("disconnected")
  const [baileysQr, setBaileysQr] = useState<string | null>(null)
  const [waStatusLoading, setWaStatusLoading] = useState(false)

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
            time: tx.created_at ? new Date(tx.created_at).toLocaleDateString("id-ID") : "",
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

        if (data.activities) {
          setActivities({
            checkouts: data.activities.checkouts || [],
            payments: data.activities.payments || [],
            syncs: data.activities.syncs || [],
            feedbacks: data.activities.feedbacks || []
          });
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
            setMidtransMode(settingsData.settings.midtransMode || "sandbox")
            setWaStatus(settingsData.settings.waStatus || "disabled")
            setWaMethod(settingsData.settings.waMethod || "baileys")
            setWaEndpoint(settingsData.settings.waEndpoint || "http://localhost:5000/send")
            setWaToken(settingsData.settings.waToken || "")
            setWaAdminNumber(settingsData.settings.waAdminNumber || "")
            setWaCustomerNotif(settingsData.settings.waCustomerNotif !== false)
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

  // Polling WhatsApp status if enabled
  useEffect(() => {
    if (waStatus !== "enabled" || waMethod !== "baileys") {
      setBaileysStatus("disconnected")
      setBaileysQr(null)
      return
    }

    async function checkWaStatus() {
      try {
        const res = await fetch("/api/admin/whatsapp?action=status")
        const data = await res.json()
        setBaileysStatus(data.status || "disconnected")
        setBaileysQr(data.qr || null)
      } catch (err) {
        setBaileysStatus("disconnected")
        setBaileysQr(null)
      }
    }

    checkWaStatus()
    const interval = setInterval(checkWaStatus, 7000) // Poll every 7 seconds
    return () => clearInterval(interval)
  }, [waStatus, waMethod])

  const handleWaLogout = async () => {
    if (!confirm("Apakah Anda yakin ingin memutuskan (unlink) WhatsApp Anda?")) return
    setWaStatusLoading(true)
    try {
      const res = await fetch("/api/admin/whatsapp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "logout" }),
      })
      const data = await res.json()
      if (data.success) {
        setBaileysStatus("disconnected")
        setBaileysQr(null)
        alert("Berhasil memutuskan koneksi WhatsApp.")
      } else {
        alert("Gagal mematikan sesi WhatsApp: " + (data.error || ""))
      }
    } catch (err: any) {
      alert("Gagal: " + err.message)
    } finally {
      setWaStatusLoading(false)
    }
  }

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
          midtransMode,
          waStatus,
          waMethod,
          waEndpoint,
          waToken,
          waAdminNumber,
          waCustomerNotif
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

          {/* Recent Transactions Panel -> Web Activity Panel */}
          <div className="lg:col-span-8 space-y-6">
            <div className="bg-white rounded-2xl border-sky-border shadow-sky-soft relative overflow-hidden">
              <div className="p-6 border-b border-sky-border flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <h3 className="text-base font-black uppercase tracking-wide text-text-primary flex items-center gap-2">
                  <ShoppingBag className="h-4 w-4 text-sky" />
                  Aktivitas Web Mitsuru
                </h3>
                
                {/* Tabs selection */}
                <div className="flex flex-wrap gap-1.5 bg-slate-100 p-1 rounded-xl">
                  {(["checkout", "pembayaran", "sync", "feedback"] as const).map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className={`px-3 py-1.5 text-[9px] font-black uppercase tracking-wider rounded-lg transition-all ${
                        activeTab === tab
                          ? "bg-white text-sky shadow-sm border border-sky-border/30"
                          : "text-text-muted hover:text-text-primary"
                      }`}
                    >
                      {tab === "checkout" && "Checkout"}
                      {tab === "pembayaran" && "Pembayaran"}
                      {tab === "sync" && "Sync Digiflazz"}
                      {tab === "feedback" && "Kritik & Saran"}
                    </button>
                  ))}
                </div>
              </div>

              <div className="p-6 max-h-[500px] overflow-y-auto scrollbar-thin">
                {/* Tab: Checkout */}
                {activeTab === "checkout" && (
                  <div className="space-y-4">
                    {activities.checkouts.length > 0 ? (
                      activities.checkouts.map((tx, idx) => (
                        <div
                          key={idx}
                          className="flex items-center justify-between p-4 bg-ice border border-sky-border/50 hover:border-sky/20 rounded-xl transition-all duration-300 group"
                        >
                          <div>
                            <p className="flex items-center gap-2 font-bold text-text-primary group-hover:text-sky transition-colors text-sm uppercase tracking-tight">
                              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded bg-white p-1">
                                <img src={getItemAssetForProduct(tx.product_name, undefined, tx.game_name)} alt="" className="max-h-full max-w-full object-contain" />
                              </span>
                              {tx.product_name}
                            </p>
                            <p className="mt-1 flex flex-wrap items-center gap-1.5 text-[10px] font-semibold text-text-muted uppercase tracking-wider">
                              <img src={getGameAssetByName(tx.game_name)?.icon} alt="" className="h-3.5 w-3.5 rounded object-cover" />
                              {tx.game_name} • <span className="font-mono text-text-secondary">{tx.invoice}</span> • <span className="text-sky font-bold">Oleh {tx.user_name || "Pelanggan"}</span>
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-black text-text-primary font-mono text-sm">
                              Rp {Number(tx.amount).toLocaleString("id-ID")}
                            </p>
                            <span className="inline-block mt-1 px-2 py-0.5 text-[8px] font-black uppercase tracking-wider rounded bg-amber-50 text-amber-500 border border-amber-500/20">
                              Checkout
                            </span>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-center py-10 text-xs text-text-muted font-bold uppercase tracking-wider">Belum ada aktivitas checkout</p>
                    )}
                  </div>
                )}

                {/* Tab: Pembayaran */}
                {activeTab === "pembayaran" && (
                  <div className="space-y-4">
                    {activities.payments.length > 0 ? (
                      activities.payments.map((tx, idx) => (
                        <div
                          key={idx}
                          className="flex items-center justify-between p-4 bg-green-50/20 border border-green-500/10 hover:border-green-500/30 rounded-xl transition-all duration-300 group"
                        >
                          <div>
                            <p className="flex items-center gap-2 font-bold text-text-primary group-hover:text-green-500 transition-colors text-sm uppercase tracking-tight">
                              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded bg-white p-1">
                                <img src={getItemAssetForProduct(tx.product_name, undefined, tx.game_name)} alt="" className="max-h-full max-w-full object-contain" />
                              </span>
                              {tx.product_name}
                            </p>
                            <p className="mt-1 flex flex-wrap items-center gap-1.5 text-[10px] font-semibold text-text-muted uppercase tracking-wider">
                              <img src={getGameAssetByName(tx.game_name)?.icon} alt="" className="h-3.5 w-3.5 rounded object-cover" />
                              {tx.game_name} • <span className="font-mono text-text-secondary">{tx.invoice}</span> • <span className="text-sky font-bold">Oleh {tx.user_name || "Pelanggan"}</span>
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-black text-green-600 font-mono text-sm">
                              Rp {Number(tx.amount).toLocaleString("id-ID")}
                            </p>
                            <span className="inline-block mt-1 px-2 py-0.5 text-[8px] font-black uppercase tracking-wider rounded bg-green-50 text-green-500 border border-green-500/20">
                              Lunas
                            </span>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-center py-10 text-xs text-text-muted font-bold uppercase tracking-wider">Belum ada aktivitas pembayaran</p>
                    )}
                  </div>
                )}

                {/* Tab: Sync Digiflazz */}
                {activeTab === "sync" && (
                  <div className="space-y-4">
                    {activities.syncs.length > 0 ? (
                      activities.syncs.map((prod, idx) => (
                        <div
                          key={idx}
                          className="flex items-center justify-between p-4 bg-sky/5 border border-sky/10 hover:border-sky/30 rounded-xl transition-all duration-300"
                        >
                          <div>
                            <p className="font-bold text-text-primary text-sm uppercase tracking-tight">
                              {prod.product_name}
                            </p>
                            <p className="mt-1 flex flex-wrap items-center gap-1.5 text-[10px] font-semibold text-text-muted uppercase tracking-wider">
                              <img src={getGameAssetByName(prod.game_name)?.icon} alt="" className="h-3.5 w-3.5 rounded object-cover" />
                              {prod.game_name} • SKU: <span className="font-mono text-text-secondary">{prod.sku}</span>
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-text-primary text-xs font-mono">
                              Harga: Rp {Number(prod.sell_price).toLocaleString("id-ID")}
                            </p>
                            <span className="inline-block mt-1 text-[8px] font-medium text-text-muted">
                              Sync: {prod.updated_at ? new Date(prod.updated_at).toLocaleString("id-ID") : ""}
                            </span>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-center py-10 text-xs text-text-muted font-bold uppercase tracking-wider">Belum ada sinkronisasi Digiflazz</p>
                    )}
                  </div>
                )}

                {/* Tab: Kritik & Saran */}
                {activeTab === "feedback" && (
                  <div className="space-y-4">
                    {activities.feedbacks.length > 0 ? (
                      activities.feedbacks.map((fb, idx) => (
                        <div
                          key={idx}
                          className="p-4 bg-purple-50/20 border border-purple-500/10 hover:border-purple-500/30 rounded-xl transition-all duration-300"
                        >
                          <div className="flex items-center justify-between mb-2">
                            <p className="font-bold text-text-primary text-xs uppercase tracking-tight">
                              {fb.user_name} <span className="text-[10px] text-text-muted lowercase flex items-center">({fb.user_email})</span>
                            </p>
                            <div className="flex items-center gap-0.5">
                              {Array.from({ length: fb.rating }).map((_, rIdx) => (
                                <span key={rIdx} className="text-amber-400 text-xs">★</span>
                              ))}
                            </div>
                          </div>
                          <p className="text-xs text-text-secondary leading-relaxed bg-white/50 p-2.5 rounded-lg border border-sky-border/40 font-medium">
                            "{fb.comment}"
                          </p>
                          <div className="flex justify-between items-center mt-2.5">
                            <span className="text-[8px] font-bold text-text-muted">
                              Dikirim: {fb.created_at ? new Date(fb.created_at).toLocaleString("id-ID") : ""}
                            </span>
                            <Link href={`/admin/feedbacks`}>
                              <span className="text-[9px] font-extrabold text-sky hover:underline cursor-pointer uppercase tracking-wider">
                                Balas Ulasan &rarr;
                              </span>
                            </Link>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-center py-10 text-xs text-text-muted font-bold uppercase tracking-wider">Belum ada kritik &amp; saran</p>
                    )}
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

                {/* Midtrans Mode Input */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-text-secondary uppercase tracking-wider flex items-center gap-1.5">
                    <Wallet className="h-3.5 w-3.5 text-sky" />
                    Mode Pembayaran Midtrans
                  </label>
                  <div className="relative p-[1px] bg-sky-border" style={inputBevelStyle}>
                    <div className="flex items-center bg-white" style={inputBevelStyle}>
                      <select
                        value={midtransMode}
                        onChange={(e) => setMidtransMode(e.target.value)}
                        className="w-full px-3 py-2 text-xs font-bold text-text-primary focus:outline-none bg-transparent"
                      >
                        <option value="sandbox">SANDBOX (Testing)</option>
                        <option value="production">PRODUCTION (Live)</option>
                      </select>
                    </div>
                  </div>
                  <p className="text-[10px] text-text-muted leading-relaxed">
                    Pilih lingkungan pembayaran Midtrans yang aktif untuk transaksi.
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

            {/* WhatsApp Integration Card */}
            <div className="bg-white rounded-2xl border border-sky-border shadow-sky-soft relative overflow-hidden">
              <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-sky/20 to-transparent" />
              <div className="p-6 border-b border-sky-border flex items-center justify-between">
                <h3 className="text-base font-black uppercase tracking-wide text-text-primary flex items-center gap-2">
                  <MessageSquare className="h-4 w-4 text-sky" />
                  WhatsApp Integration
                </h3>
                <span className={`inline-block px-2.5 py-0.5 text-[9px] font-black uppercase tracking-wider rounded ${
                  waStatus === "enabled"
                    ? "bg-green-50 text-green-500 border border-green-500/20"
                    : "bg-gray-50 text-text-muted border border-gray-200"
                }`} style={tagBevelStyle}>
                  {waStatus === "enabled" ? "Aktif" : "Nonaktif"}
                </span>
              </div>

              <form onSubmit={handleSaveSettings} className="p-6 space-y-5">
                {/* Status Toggle */}
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <label className="text-xs font-bold text-text-secondary uppercase tracking-wider flex items-center gap-1.5">
                      <Power className="h-3.5 w-3.5 text-sky" />
                      Status Notifikasi
                    </label>
                    <p className="text-[10px] text-text-muted font-medium">Aktifkan notifikasi otomatis ke WhatsApp.</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setWaStatus(waStatus === "enabled" ? "disabled" : "enabled")}
                    className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                      waStatus === "enabled" ? "bg-sky" : "bg-gray-200"
                    }`}
                  >
                    <span
                      className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                        waStatus === "enabled" ? "translate-x-5" : "translate-x-0"
                      }`}
                    />
                  </button>
                </div>

                {/* Gateway Method Dropdown */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-text-secondary uppercase tracking-wider flex items-center gap-1.5">
                    <Smartphone className="h-3.5 w-3.5 text-sky" />
                    Metode Gateway
                  </label>
                  <div className="relative p-[1px] bg-sky-border" style={inputBevelStyle}>
                    <div className="flex items-center bg-white" style={inputBevelStyle}>
                      <select
                        value={waMethod}
                        onChange={(e) => setWaMethod(e.target.value)}
                        className="w-full px-3 py-2 text-xs font-bold text-text-primary focus:outline-none bg-transparent"
                      >
                        <option value="baileys">Baileys (Lokal / VPS)</option>
                        <option value="fonnte">Fonnte API Gateway</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Endpoint API */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-text-secondary uppercase tracking-wider flex items-center gap-1.5">
                    <ExternalLink className="h-3.5 w-3.5 text-sky" />
                    API Endpoint URL
                  </label>
                  <div className="relative p-[1px] bg-sky-border" style={inputBevelStyle}>
                    <input
                      type="text"
                      value={waEndpoint}
                      onChange={(e) => setWaEndpoint(e.target.value)}
                      className="w-full px-3 py-2 text-xs font-semibold text-text-primary focus:outline-none bg-transparent"
                      placeholder="e.g. http://localhost:5000/send"
                      style={inputBevelStyle}
                    />
                  </div>
                </div>

                {/* API Token / Auth Key */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-text-secondary uppercase tracking-wider flex items-center gap-1.5">
                    <Shield className="h-3.5 w-3.5 text-sky" />
                    API Token / Authorization Key
                  </label>
                  <div className="relative p-[1px] bg-sky-border" style={inputBevelStyle}>
                    <input
                      type="password"
                      value={waToken}
                      onChange={(e) => setWaToken(e.target.value)}
                      className="w-full px-3 py-2 text-xs font-semibold text-text-primary focus:outline-none bg-transparent"
                      placeholder="Masukkan Token Rahasia (jika ada)"
                      style={inputBevelStyle}
                    />
                  </div>
                </div>

                {/* Admin WA Number */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-text-secondary uppercase tracking-wider flex items-center gap-1.5">
                    <Smartphone className="h-3.5 w-3.5 text-sky" />
                    Nomor WhatsApp Admin (Notif Order)
                  </label>
                  <div className="relative p-[1px] bg-sky-border" style={inputBevelStyle}>
                    <input
                      type="text"
                      value={waAdminNumber}
                      onChange={(e) => setWaAdminNumber(e.target.value)}
                      className="w-full px-3 py-2 text-xs font-semibold text-text-primary focus:outline-none bg-transparent"
                      placeholder="e.g. 6281234567890"
                      style={inputBevelStyle}
                    />
                  </div>
                </div>

                {/* Customer Notif Toggle */}
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <label className="text-xs font-bold text-text-secondary uppercase tracking-wider">
                      Notifikasi Pelanggan
                    </label>
                    <p className="text-[10px] text-text-muted font-medium">Kirim tagihan &amp; status pesanan ke WA pembeli.</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setWaCustomerNotif(!waCustomerNotif)}
                    className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                      waCustomerNotif ? "bg-sky" : "bg-gray-200"
                    }`}
                  >
                    <span
                      className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                        waCustomerNotif ? "translate-x-5" : "translate-x-0"
                      }`}
                    />
                  </button>
                </div>

                {/* Submit Settings Button */}
                <div className="relative p-[1px] bg-sky/30 hover:bg-sky transition-all duration-300" style={inputBevelStyle}>
                  <button
                    type="submit"
                    disabled={saveLoading}
                    className="w-full bg-white py-2 text-[10px] font-black uppercase tracking-widest text-sky hover:text-diamond transition-colors disabled:opacity-50"
                    style={inputBevelStyle}
                  >
                    {saveLoading ? "Menyimpan..." : "Simpan Pengaturan WhatsApp"}
                  </button>
                </div>

                {/* Baileys QR Code / Connection HUD */}
                {waStatus === "enabled" && waMethod === "baileys" && (
                  <div className="pt-4 border-t border-sky-border/50 space-y-4">
                    <span className="font-bold text-text-primary uppercase tracking-wider text-[10px] flex items-center gap-1.5">
                      <QrCode className="h-3.5 w-3.5 text-sky" />
                      Status Koneksi WhatsApp (Baileys)
                    </span>

                    <div className="flex flex-col items-center justify-center p-4 border border-sky-border/40 bg-ice/40 rounded-xl space-y-3">
                      {baileysStatus === "connected" ? (
                        <div className="text-center space-y-2 w-full">
                          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-green-50 border border-green-500/20 text-green-600 rounded-full text-[10px] font-black uppercase tracking-wider">
                            <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                            Connected / Terhubung
                          </div>
                          <p className="text-[10px] text-text-muted">
                            Siap mengirimkan notifikasi transaksi ke WhatsApp pelanggan &amp; admin.
                          </p>
                          <button
                            type="button"
                            onClick={handleWaLogout}
                            disabled={waStatusLoading}
                            className="text-[9px] font-black uppercase text-red-500 hover:text-red-700 tracking-wider underline disabled:opacity-50 pt-1"
                          >
                            Unlink / Logout WhatsApp
                          </button>
                        </div>
                      ) : baileysStatus === "qr" && baileysQr ? (
                        <div className="text-center space-y-3">
                          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-50 border border-amber-500/20 text-amber-600 rounded-full text-[10px] font-black uppercase tracking-wider">
                            <span className="h-2 w-2 rounded-full bg-amber-500 animate-pulse" />
                            Menunggu Scan QR
                          </div>
                          <div className="bg-white p-2 border border-sky-border/60 rounded-xl inline-block shadow-sm">
                            <img src={baileysQr} alt="WhatsApp Web QR Code" className="h-40 w-40 object-contain animate-fade-in" />
                          </div>
                          <p className="text-[9px] text-text-muted leading-relaxed max-w-[200px] mx-auto">
                            Buka WhatsApp di HP Anda &gt; Perangkat Tertaut &gt; Tautkan Perangkat, lalu scan QR code di atas.
                          </p>
                        </div>
                      ) : (
                        <div className="text-center py-4 w-full space-y-2">
                          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-gray-50 border border-gray-200 text-text-muted rounded-full text-[10px] font-black uppercase tracking-wider">
                            <span className="h-2 w-2 rounded-full bg-gray-400" />
                            Connecting / Memulai...
                          </div>
                          <p className="text-[9px] text-text-muted max-w-[200px] mx-auto leading-relaxed">
                            Sedang memuat koneksi server lokal Baileys. Pastikan microservice gateway sudah menyala di VPS Anda.
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
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
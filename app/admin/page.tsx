"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { SidebarContentWrapper } from "@/components/layout/sidebar-content-wrapper"
import { Skeleton } from "@/components/ui/skeleton"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
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
  QrCode,
  Loader2,
  Volume2,
  VolumeX
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
    failed: any[];
    syncs: any[];
    feedbacks: any[];
  }>({
    checkouts: [],
    payments: [],
    failed: [],
    syncs: [],
    feedbacks: []
  })
  const [activeTab, setActiveTab] = useState<"checkout" | "pembayaran" | "failed" | "sync" | "feedback">("checkout")
  const [adminMainTab, setAdminMainTab] = useState<"overview" | "sync" | "payment" | "whatsapp">("overview")

  // Sync Settings States
  const [isSyncActive, setIsSyncActive] = useState(true)
  const [digiflazzMode, setDigiflazzMode] = useState("simulation")
  const [digiflazzUsername, setDigiflazzUsername] = useState("")
  const [syncInterval, setSyncInterval] = useState(24)
  const [lastSyncTime, setLastSyncTime] = useState("")
  const [lastSyncStatus, setLastSyncStatus] = useState("idle")
  const [midtransMode, setMidtransMode] = useState("sandbox")
  const [paymentGateway, setPaymentGateway] = useState("midtrans")
  const [paymentMethodType, setPaymentMethodType] = useState("checkout")
  const [dokuClientId, setDokuClientId] = useState("")
  const [dokuSharedKey, setDokuSharedKey] = useState("")
  const [dokuMode, setDokuMode] = useState("sandbox")
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

  // WhatsApp Test States
  const [testPhone, setTestPhone] = useState("")
  const [testMessage, setTestMessage] = useState("Uji coba koneksi WhatsApp Mitsuru Top Up Hub. Koneksi sukses! ✅")
  const [testLoading, setTestLoading] = useState(false)
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null)

  // Digiflazz Deposit Ticket Modal states
  const [isDepositModalOpen, setIsDepositModalOpen] = useState(false)
  const [depoAmount, setDepoAmount] = useState<number | string>(500000)
  const [depoBank, setDepoBank] = useState("BCA")
  const [depoOwnerName, setDepoOwnerName] = useState("MITSURU TOPUP")
  const [loadingDepoTicket, setLoadingDepoTicket] = useState(false)
  const [depoResultTicket, setDepoResultTicket] = useState<any>(null)
  const [depoTicketError, setDepoTicketError] = useState("")

  const handleCreateDepoTicket = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoadingDepoTicket(true)
    setDepoTicketError("")
    setDepoResultTicket(null)
    try {
      const res = await fetch("/api/admin/digiflazz/deposit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: depoAmount,
          bank: depoBank,
          ownerName: depoOwnerName,
        }),
      })
      const data = await res.json()
      if (data.error) {
        setDepoTicketError(data.error)
      } else if (data.depositTicket) {
        setDepoResultTicket(data.depositTicket)
      }
    } catch (err: any) {
      setDepoTicketError(err.message || "Gagal membuat tiket deposit")
    } finally {
      setLoadingDepoTicket(false)
    }
  }

  // Audio Notification Sound Alert states
  const [isSoundEnabled, setIsSoundEnabled] = useState(true)
  const [prevTxCount, setPrevTxCount] = useState<number | null>(null)

  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedSound = window.localStorage.getItem("admin_sound_alert")
      if (storedSound !== null) {
        setIsSoundEnabled(storedSound === "true")
      }
    }
  }, [])

  const toggleSound = () => {
    const nextState = !isSoundEnabled
    setIsSoundEnabled(nextState)
    if (typeof window !== "undefined") {
      window.localStorage.setItem("admin_sound_alert", String(nextState))
    }
  }

  const playNotificationChime = () => {
    if (typeof window === "undefined") return
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext
      if (!AudioCtx) return
      const ctx = new AudioCtx()
      const now = ctx.currentTime

      // Note 1: E5
      const osc1 = ctx.createOscillator()
      const gain1 = ctx.createGain()
      osc1.type = "sine"
      osc1.frequency.setValueAtTime(659.25, now)
      gain1.gain.setValueAtTime(0.12, now)
      gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.25)
      osc1.connect(gain1)
      gain1.connect(ctx.destination)
      osc1.start(now)
      osc1.stop(now + 0.25)

      // Note 2: G#5
      const osc2 = ctx.createOscillator()
      const gain2 = ctx.createGain()
      osc2.type = "sine"
      osc2.frequency.setValueAtTime(830.61, now + 0.1)
      gain2.gain.setValueAtTime(0.18, now + 0.1)
      gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.45)
      osc2.connect(gain2)
      gain2.connect(ctx.destination)
      osc2.start(now + 0.1)
      osc2.stop(now + 0.45)
    } catch (_) {}
  }

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

        if (data.stats) {
          if (data.stats.digiflazzMode) setDigiflazzMode(data.stats.digiflazzMode)
          if (data.stats.digiflazzUsername) setDigiflazzUsername(data.stats.digiflazzUsername)
        }

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
        
        // Play notification sound if new transactions arrive
        const currentTxCount = Number(data.stats.totalTxCount || 0)
        setPrevTxCount((prev) => {
          if (prev !== null && currentTxCount > prev) {
            playNotificationChime()
          }
          return currentTxCount
        })

        if (data.activities) {
          setActivities({
            checkouts: data.activities.checkouts || [],
            payments: data.activities.payments || [],
            failed: data.activities.failed || [],
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
            setDigiflazzMode(settingsData.settings.digiflazzMode || "production")
            setDigiflazzUsername(settingsData.settings.digiflazzUsername || "")
            setSyncInterval(settingsData.settings.syncInterval)
            setLastSyncTime(settingsData.settings.lastSyncTime)
            setLastSyncStatus(settingsData.settings.lastSyncStatus)
            setMidtransMode(settingsData.settings.midtransMode || "sandbox")
            setPaymentGateway(settingsData.settings.paymentGateway || "midtrans")
            setPaymentMethodType(settingsData.settings.paymentMethodType || "checkout")
            setDokuClientId(settingsData.settings.dokuClientId || "")
            setDokuSharedKey(settingsData.settings.dokuSharedKey || "")
            setDokuMode(settingsData.settings.dokuMode || "sandbox")
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

    // 8-second polling interval for real-time transactions & audio alerts
    const pollInterval = setInterval(() => {
      verifyAdminAndFetchData()
    }, 8000)

    return () => clearInterval(pollInterval)
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

  const handleSendTestMessage = async () => {
    if (!testPhone.trim()) return
    setTestLoading(true)
    setTestResult(null)
    try {
      const res = await fetch("/api/admin/whatsapp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "test",
          phone: testPhone,
          message: testMessage,
        }),
      })
      const data = await res.json()
      if (res.ok && data.success) {
        setTestResult({ success: true, message: data.message || "Pesan uji coba berhasil dikirim!" })
      } else {
        setTestResult({ success: false, message: data.error || "Gagal mengirim pesan uji coba." })
      }
    } catch (err: any) {
      setTestResult({ success: false, message: "Gagal: " + err.message })
    } finally {
      setTestLoading(false)
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
          digiflazzMode,
          digiflazzUsername,
          syncInterval,
          midtransMode,
          paymentGateway,
          paymentMethodType,
          dokuClientId,
          dokuSharedKey,
          dokuMode,
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
                  <div key={i} className="bg-mist backdrop-blur-md p-6 rounded-2xl border border-sky/30 shadow-sky-soft space-y-3">
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
                <div className="lg:col-span-8 bg-mist backdrop-blur-md p-6 rounded-2xl border border-sky/30 shadow-sky-soft space-y-6">
                  <Skeleton className="h-6 w-40 rounded-lg bg-sky/10" />
                  <div className="space-y-4">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <div key={i} className="flex justify-between items-center p-4 border border-sky/30 rounded-xl">
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
                <div className="lg:col-span-4 bg-mist backdrop-blur-md p-6 rounded-2xl border border-sky/30 shadow-sky-soft space-y-6">
                  <Skeleton className="h-6 w-40 rounded-lg bg-sky/10" />
                  <div className="space-y-4">
                    {[1, 2, 3, 4].map((i) => (
                      <div key={i} className="flex items-center gap-4 p-3 border border-sky/30 rounded-xl">
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
        <div className="mb-10 flex flex-col md:flex-row md:items-center justify-between gap-6 bg-mist backdrop-blur-md p-6 md:p-8 rounded-2xl border border-sky/30 relative overflow-hidden shadow-sky-soft">
          <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-sky/20 to-transparent" />

          <div className="flex items-center gap-5">
            <div className="relative p-[1px] bg-gradient-to-tr from-sky/40 to-diamond/40 rounded-full">
              <span className="grid h-16 w-16 place-items-center bg-mist backdrop-blur-md rounded-full text-sky">
                <Shield className="h-8 w-8" />
              </span>
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-black uppercase text-white tracking-tight flex items-center gap-3">
                Admin Control Room
              </h1>
              <div className="flex flex-wrap items-center gap-2 mt-1.5">
                <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider border ${
                  digiflazzMode === "production"
                    ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                    : "bg-amber-500/10 text-amber-400 border-amber-500/30"
                }`}>
                  <span className={`h-1.5 w-1.5 rounded-full ${digiflazzMode === "production" ? "bg-emerald-400 animate-pulse" : "bg-amber-400"}`} />
                  Digiflazz: {digiflazzMode === "production" ? "Production (Live)" : "Sandbox / Simulation"}
                </span>
                {digiflazzUsername && (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-mono text-white/60 bg-black/30 border border-white/10">
                    User: {digiflazzUsername}
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="flex gap-3">
            <Link href="/admin/games">
              <div className="relative p-[1px] bg-sky-border hover:bg-sky/30 transition-all duration-300" style={inputBevelStyle}>
                <button className="bg-mist backdrop-blur-md px-4 py-2 text-[10px] font-black uppercase tracking-widest text-white/80 hover:text-white transition-colors" style={inputBevelStyle}>
                  Kelola Game
                </button>
              </div>
            </Link>
            <Link href="/admin/transactions">
              <div className="relative p-[1px] bg-sky/40 hover:bg-sky transition-all duration-300" style={inputBevelStyle}>
                <button className="bg-mist backdrop-blur-md px-4 py-2 text-[10px] font-black uppercase tracking-widest text-sky hover:text-diamond transition-colors shimmer-hover" style={inputBevelStyle}>
                  Daftar Transaksi
                </button>
              </div>
            </Link>
            <button
              onClick={() => {
                setIsDepositModalOpen(true)
                setDepoResultTicket(null)
                setDepoTicketError("")
              }}
              className="bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 border border-emerald-500/40 px-4 py-2 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all flex items-center gap-1.5 shadow-sky-soft hover:scale-105"
            >
              <Wallet className="h-3.5 w-3.5 text-emerald-400" />
              + Isi Saldo Digiflazz
            </button>
            <button
              onClick={toggleSound}
              className={`px-3 py-2 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all flex items-center gap-1.5 border shadow-sky-soft hover:scale-105 ${
                isSoundEnabled
                  ? "bg-amber-500/20 text-amber-400 border-amber-500/40 hover:bg-amber-500/30"
                  : "bg-gray-500/20 text-gray-400 border-gray-500/40 hover:bg-gray-500/30"
              }`}
              title={isSoundEnabled ? "Suara Notifikasi Aktif (Klik untuk Matikan)" : "Suara Notifikasi Mati (Klik untuk Aktifkan)"}
            >
              {isSoundEnabled ? <Volume2 className="h-3.5 w-3.5 text-amber-400" /> : <VolumeX className="h-3.5 w-3.5 text-gray-400" />}
              {isSoundEnabled ? "Audio Notif: ON" : "Audio Notif: OFF"}
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6 mb-10">
          {stats.map((stat, index) => (
            <div key={index} className="relative p-[1px] bg-gradient-to-r from-sky/20 to-sky/10 hover:from-sky/30 hover:to-sky/20 transition-all duration-300" style={bevelStyle}>
              <div className="bg-mist backdrop-blur-md p-6 flex flex-col justify-between" style={bevelStyle}>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs font-bold text-white/60 uppercase tracking-wider">{stat.title}</span>
                  <span className={`p-2 rounded border ${stat.color.split(" ")[1]} ${stat.color.split(" ")[2]}`}>
                    <stat.icon className={`h-4.5 w-4.5 ${stat.color.split(" ")[0]}`} />
                  </span>
                </div>
                <div className="flex items-baseline justify-between">
                  <p className="text-2xl font-black text-white font-mono leading-none">{stat.value}</p>
                  <span className={`text-[10px] font-bold flex items-center gap-0.5 ${
                    stat.trend === "up" ? "text-green-500" : "text-white/60"
                  }`}>
                    {stat.trend === "up" && <ArrowUpRight className="h-3 w-3" />}
                    {stat.change}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
        {/* Main Tab Navigation Bar */}
        <div className="flex flex-wrap items-center gap-2 mb-8 bg-[#183644]/90 p-2 rounded-2xl border border-sky/30 shadow-sky-soft">
          <button
            type="button"
            onClick={() => setAdminMainTab("overview")}
            className={`px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-2 transition-all ${
              adminMainTab === "overview"
                ? "bg-sky text-white shadow-lg shadow-sky/20"
                : "text-white/70 hover:text-white hover:bg-white/5"
            }`}
          >
            <TrendingUp className="h-4 w-4 text-sky" />
            Overview & Aktivitas
          </button>

          <button
            type="button"
            onClick={() => setAdminMainTab("sync")}
            className={`px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-2 transition-all ${
              adminMainTab === "sync"
                ? "bg-sky text-white shadow-lg shadow-sky/20"
                : "text-white/70 hover:text-white hover:bg-white/5"
            }`}
          >
            <RefreshCw className="h-4 w-4 text-sky" />
            Auto-Sync Digiflazz
          </button>

          <button
            type="button"
            onClick={() => setAdminMainTab("payment")}
            className={`px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-2 transition-all ${
              adminMainTab === "payment"
                ? "bg-sky text-white shadow-lg shadow-sky/20"
                : "text-white/70 hover:text-white hover:bg-white/5"
            }`}
          >
            <Wallet className="h-4 w-4 text-sky" />
            Payment Gateway (Doku & Midtrans)
          </button>

          <button
            type="button"
            onClick={() => setAdminMainTab("whatsapp")}
            className={`px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-2 transition-all ${
              adminMainTab === "whatsapp"
                ? "bg-sky text-white shadow-lg shadow-sky/20"
                : "text-white/70 hover:text-white hover:bg-white/5"
            }`}
          >
            <MessageSquare className="h-4 w-4 text-sky" />
            WhatsApp Gateway
          </button>
        </div>

        {/* TAB 1: OVERVIEW & AKTIVITAS */}
        {adminMainTab === "overview" && (
          <div className="grid lg:grid-cols-12 gap-8 animate-fadeIn">
            {/* Recent Transactions Panel -> Web Activity Panel */}
            <div className="lg:col-span-8 space-y-6">
              <div className="bg-mist backdrop-blur-md rounded-2xl border-sky/30 shadow-sky-soft relative overflow-hidden border">
                <div className="p-6 border-b border-sky/30 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <h3 className="text-base font-black uppercase tracking-wide text-white flex items-center gap-2">
                    <ShoppingBag className="h-4 w-4 text-sky" />
                    Aktivitas Web Mitsuru
                  </h3>
                  
                  {/* Tabs selection */}
                  <div className="flex flex-wrap gap-1.5 bg-sky/10 p-1 rounded-xl">
                    {(["checkout", "pembayaran", "failed", "sync", "feedback"] as const).map((tab) => (
                      <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`px-3 py-1.5 text-[9px] font-black uppercase tracking-wider rounded-lg transition-all ${
                          activeTab === tab
                            ? "bg-mist backdrop-blur-md text-sky shadow-sm border border-sky/30"
                            : "text-white/60 hover:text-white"
                        }`}
                      >
                        {tab === "checkout" && "Checkout"}
                        {tab === "pembayaran" && "Pembayaran"}
                        {tab === "failed" && "Gagal & Eror"}
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
                            className="flex items-center justify-between p-4 bg-sky/20 border border-sky/30 hover:border-sky/20 rounded-xl transition-all duration-300 group"
                          >
                            <div>
                              <p className="flex items-center gap-2 font-bold text-white group-hover:text-sky transition-colors text-sm uppercase tracking-tight">
                                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded bg-mist backdrop-blur-md p-1">
                                  <img src={getItemAssetForProduct(tx.product_name, undefined, tx.game_name)} alt="" className="max-h-full max-w-full object-contain" />
                                </span>
                                {tx.product_name}
                              </p>
                              <p className="mt-1 flex flex-wrap items-center gap-1.5 text-[10px] font-semibold text-white/60 uppercase tracking-wider">
                                <img src={getGameAssetByName(tx.game_name)?.icon} alt="" className="h-3.5 w-3.5 rounded object-cover" />
                                {tx.game_name} • <span className="font-mono text-white/80">{tx.invoice}</span> • <span className="text-sky font-bold">Oleh {tx.user_name || "Pelanggan"}</span>
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="font-black text-white font-mono text-sm">
                                Rp {Number(tx.amount).toLocaleString("id-ID")}
                              </p>
                              <span className="inline-block mt-1 text-[8px] font-medium text-white/60">
                                {tx.created_at ? new Date(tx.created_at).toLocaleString("id-ID") : ""}
                              </span>
                            </div>
                          </div>
                        ))
                      ) : (
                        <p className="text-center py-10 text-xs text-white/60 font-bold uppercase tracking-wider">Belum ada aktivitas checkout</p>
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
                            className="flex items-center justify-between p-4 bg-emerald-500/10 border border-emerald-500/20 hover:border-emerald-500/40 rounded-xl transition-all duration-300 group"
                          >
                            <div>
                              <p className="flex items-center gap-2 font-bold text-white group-hover:text-emerald-400 transition-colors text-sm uppercase tracking-tight">
                                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded bg-mist backdrop-blur-md p-1">
                                  <img src={getItemAssetForProduct(tx.product_name, undefined, tx.game_name)} alt="" className="max-h-full max-w-full object-contain" />
                                </span>
                                {tx.product_name}
                              </p>
                              <p className="mt-1 flex flex-wrap items-center gap-1.5 text-[10px] font-semibold text-white/60 uppercase tracking-wider">
                                <img src={getGameAssetByName(tx.game_name)?.icon} alt="" className="h-3.5 w-3.5 rounded object-cover" />
                                {tx.game_name} • <span className="font-mono text-white/80">{tx.invoice}</span> • <span className="text-emerald-400 font-bold">Lunas</span>
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="font-black text-emerald-400 font-mono text-sm">
                                Rp {Number(tx.amount).toLocaleString("id-ID")}
                              </p>
                              <span className="inline-block mt-1 text-[8px] font-medium text-white/60">
                                {tx.created_at ? new Date(tx.created_at).toLocaleString("id-ID") : ""}
                              </span>
                            </div>
                          </div>
                        ))
                      ) : (
                        <p className="text-center py-10 text-xs text-white/60 font-bold uppercase tracking-wider">Belum ada pembayaran sukses</p>
                      )}
                    </div>
                  )}

                  {/* Tab: Gagal & Eror */}
                  {activeTab === "failed" && (
                    <div className="space-y-4">
                      {activities.failed.length > 0 ? (
                        activities.failed.map((tx, idx) => (
                          <div
                            key={idx}
                            className="flex items-center justify-between p-4 bg-red-500/10 border border-red-500/20 hover:border-red-500/40 rounded-xl transition-all duration-300 group"
                          >
                            <div>
                              <p className="flex items-center gap-2 font-bold text-white group-hover:text-red-400 transition-colors text-sm uppercase tracking-tight">
                                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded bg-mist backdrop-blur-md p-1">
                                  <img src={getItemAssetForProduct(tx.product_name, undefined, tx.game_name)} alt="" className="max-h-full max-w-full object-contain" />
                                </span>
                                {tx.product_name}
                              </p>
                              <p className="mt-1 flex flex-wrap items-center gap-1.5 text-[10px] font-semibold text-white/60 uppercase tracking-wider">
                                <img src={getGameAssetByName(tx.game_name)?.icon} alt="" className="h-3.5 w-3.5 rounded object-cover" />
                                {tx.game_name} • <span className="font-mono text-white/80">{tx.invoice}</span> • <span className="text-red-400 font-bold">Gagal</span>
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="font-black text-red-400 font-mono text-sm">
                                Rp {Number(tx.amount).toLocaleString("id-ID")}
                              </p>
                              <span className="inline-block mt-1 text-[8px] font-medium text-white/60">
                                {tx.created_at ? new Date(tx.created_at).toLocaleString("id-ID") : ""}
                              </span>
                            </div>
                          </div>
                        ))
                      ) : (
                        <p className="text-center py-10 text-xs text-white/60 font-bold uppercase tracking-wider">Tidak ada transaksi gagal</p>
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
                            className="flex items-center justify-between p-4 bg-sky/20 border border-sky/30 hover:border-sky/20 rounded-xl transition-all duration-300"
                          >
                            <div>
                              <p className="font-bold text-white text-sm uppercase tracking-tight">
                                {prod.product_name}
                              </p>
                              <p className="mt-1 flex flex-wrap items-center gap-1.5 text-[10px] font-semibold text-white/60 uppercase tracking-wider">
                                <img src={getGameAssetByName(prod.game_name)?.icon} alt="" className="h-3.5 w-3.5 rounded object-cover" />
                                {prod.game_name} • SKU: <span className="font-mono text-white/80">{prod.sku}</span>
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="font-bold text-white text-xs font-mono">
                                Harga: Rp {Number(prod.sell_price).toLocaleString("id-ID")}
                              </p>
                              <span className="inline-block mt-1 text-[8px] font-medium text-white/60">
                                Sync: {prod.updated_at ? new Date(prod.updated_at).toLocaleString("id-ID") : ""}
                              </span>
                            </div>
                          </div>
                        ))
                      ) : (
                        <p className="text-center py-10 text-xs text-white/60 font-bold uppercase tracking-wider">Belum ada sinkronisasi Digiflazz</p>
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
                              <p className="font-bold text-white text-xs uppercase tracking-tight">
                                {fb.user_name} <span className="text-[10px] text-white/60 lowercase flex items-center">({fb.user_email})</span>
                              </p>
                              <div className="flex items-center gap-0.5">
                                {Array.from({ length: fb.rating }).map((_, rIdx) => (
                                  <span key={rIdx} className="text-amber-400 text-xs">★</span>
                                ))}
                              </div>
                            </div>
                            <p className="text-xs text-white/80 leading-relaxed bg-mist backdrop-blur-md p-2.5 rounded-lg border border-sky/30 font-medium">
                              "{fb.comment}"
                            </p>
                            <div className="flex justify-between items-center mt-2.5">
                              <span className="text-[8px] font-bold text-white/60">
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
                        <p className="text-center py-10 text-xs text-white/60 font-bold uppercase tracking-wider">Belum ada kritik &amp; saran</p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Right Column: Top Products */}
            <div className="lg:col-span-4 space-y-8">
              <div className="bg-mist backdrop-blur-md rounded-2xl border border-sky/30 shadow-sky-soft relative overflow-hidden">
                <div className="p-6 border-b border-sky/30">
                  <h3 className="text-base font-black uppercase tracking-wide text-white">
                    Produk Terlaris
                  </h3>
                </div>
                <div className="p-6 space-y-4">
                  {topProducts.map((p, idx) => (
                    <div key={idx} className="flex justify-between items-center bg-sky/20 p-4 rounded-xl border border-sky/30 hover:border-sky/10 transition-all duration-300">
                      <div className="flex items-center gap-3">
                        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-mist backdrop-blur-md p-1.5">
                          <img src={getItemAssetForProduct(p.name, p.sku, p.game)} alt="" className="max-h-full max-w-full object-contain" />
                        </span>
                        <div>
                        <p className="font-extrabold text-white text-xs uppercase tracking-tight">{p.name}</p>
                        <p className="mt-0.5 flex items-center gap-1.5 text-[9px] font-bold text-white/60 uppercase tracking-wider">
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
        )}

        {/* TAB 2: AUTO-SYNC DIGIFLAZZ */}
        {adminMainTab === "sync" && (
          <div className="grid lg:grid-cols-12 gap-8 animate-fadeIn">
            {/* Sync Settings Card */}
            <div className="lg:col-span-7 bg-mist backdrop-blur-md rounded-2xl border border-sky/30 shadow-sky-soft relative overflow-hidden">
              <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-sky/20 to-transparent" />
              <div className="p-6 border-b border-sky/30 flex items-center justify-between">
                <h3 className="text-base font-black uppercase tracking-wide text-white flex items-center gap-2">
                  <Settings className="h-4 w-4 text-sky" />
                  Auto-Sync Control Digiflazz
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
                    <label className="text-xs font-bold text-white/80 uppercase tracking-wider flex items-center gap-1.5">
                      <Power className="h-3.5 w-3.5 text-sky" />
                      Status Sinkronisasi
                    </label>
                    <p className="text-[10px] text-white/60">Aktifkan sinkronisasi otomatis harga.</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsSyncActive(!isSyncActive)}
                    className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                      isSyncActive ? "bg-sky" : "bg-gray-200"
                    }`}
                  >
                    <span
                      className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-mist backdrop-blur-md shadow ring-0 transition duration-200 ease-in-out ${
                        isSyncActive ? "translate-x-5" : "translate-x-0"
                      }`}
                    />
                  </button>
                </div>

                {/* Interval Input */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-white/80 uppercase tracking-wider flex items-center gap-1.5">
                    <Clock className="h-3.5 w-3.5 text-sky" />
                    Interval Sinkronisasi
                  </label>
                  <div className="relative p-[1px] bg-sky-border" style={inputBevelStyle}>
                    <div className="flex items-center bg-mist backdrop-blur-md" style={inputBevelStyle}>
                      <input
                        type="number"
                        min="1"
                        max="168"
                        value={syncInterval}
                        onChange={(e) => setSyncInterval(Math.max(1, parseInt(e.target.value) || 1))}
                        className="w-full px-3 py-2 text-xs font-semibold font-mono text-white focus:outline-none bg-transparent"
                      />
                      <span className="pr-3 text-[10px] font-black uppercase text-white/60 tracking-wider shrink-0 select-none">
                        Jam Sekali
                      </span>
                    </div>
                  </div>
                  <p className="text-[10px] text-white/60 leading-relaxed">
                    Sistem akan menyinkronkan katalog harga modal Digiflazz setiap {syncInterval} jam.
                  </p>
                </div>

                {/* Digiflazz Environment Mode Selector */}
                <div className="space-y-2 pt-3 border-t border-sky/20">
                  <label className="text-xs font-bold text-white/80 uppercase tracking-wider flex items-center gap-1.5">
                    <Shield className="h-3.5 w-3.5 text-sky" />
                    Mode Transaksi Topup Digiflazz
                  </label>
                  <div className="relative p-[1px] bg-sky-border" style={inputBevelStyle}>
                    <select
                      value={digiflazzMode}
                      onChange={(e) => setDigiflazzMode(e.target.value)}
                      className="w-full bg-[#183644] px-3 py-2.5 text-xs font-bold text-white focus:outline-none cursor-pointer border-none"
                      style={inputBevelStyle}
                    >
                      <option value="production" className="bg-[#183644] text-emerald-400 font-bold">PRODUCTION (LIVE - Transaksi & Saldo Asli)</option>
                      <option value="simulation" className="bg-[#183644] text-amber-400 font-bold">SANDBOX / SIMULASI (TESTING - Gratis & Dummy)</option>
                    </select>
                  </div>
                  <p className="text-[10px] text-white/60 leading-relaxed">
                    Pilih <strong className="text-emerald-400">PRODUCTION</strong> untuk transaksi live asli, atau <strong className="text-amber-400">SANDBOX</strong> untuk pengujian simulasi tanpa memotong saldo. Kredensial diambil otomatis dari file <code className="text-sky font-mono">.env</code>.
                  </p>
                </div>

                {/* Save Button */}
                <div className="flex gap-2">
                  <div className="relative p-[1px] bg-sky/30 hover:bg-sky transition-all duration-300 flex-1" style={inputBevelStyle}>
                    <button
                      type="submit"
                      disabled={saveLoading}
                      className="w-full bg-mist backdrop-blur-md py-2 text-[10px] font-black uppercase tracking-widest text-sky hover:text-diamond transition-colors disabled:opacity-50"
                      style={inputBevelStyle}
                    >
                      {saveLoading ? "Menyimpan..." : "Simpan Pengaturan Sync"}
                    </button>
                  </div>

                  <div className="relative p-[1px] bg-sky-border hover:bg-sky/30 transition-all duration-300" style={inputBevelStyle}>
                    <button
                      type="button"
                      onClick={handleManualSync}
                      disabled={isSyncing}
                      className="bg-mist backdrop-blur-md px-4 py-2 text-[10px] font-black uppercase tracking-widest text-white/80 hover:text-white transition-colors disabled:opacity-50 flex items-center gap-1.5"
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
                <div className="pt-3 border-t border-sky/30 space-y-1.5 text-[10px] text-white/60 font-medium">
                  <div className="flex justify-between">
                    <span>Terakhir Sinkron:</span>
                    <span className="font-mono text-white/80">{lastSyncTime ? new Date(lastSyncTime).toLocaleString("id-ID") : "-"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Waktu Relatif:</span>
                    <span className="font-semibold text-white/80">{lastSyncTime ? formatDateRelative(lastSyncTime) : "-"}</span>
                  </div>
                </div>
              </form>
            </div>

            {/* Rekomendasi Produksi (Cron Job Tips) Card */}
            <div className="lg:col-span-5 bg-mist backdrop-blur-md rounded-2xl border border-sky/30 shadow-sky-soft relative overflow-hidden">
              <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-sky/20 to-transparent" />
              <div className="p-6 border-b border-sky/30">
                <h3 className="text-base font-black uppercase tracking-wide text-white flex items-center gap-2">
                  <Code className="h-4 w-4 text-sky" />
                  Rekomendasi Produksi (Cron)
                </h3>
              </div>
              <div className="p-6 space-y-4 text-xs text-white/80 leading-relaxed">
                <p>
                  Untuk memastikan harga modal &amp; jual selalu up-to-date, pasang penjadwal tugas otomatis (Cron Job / Task Scheduler) untuk memicu API di bawah:
                </p>

                <div className="space-y-1">
                  <span className="font-bold text-white uppercase tracking-wider text-[9px]">Langkah 1: Setup Kunci Keamanan</span>
                  <p className="text-[10px] text-white/60">
                    Definisikan token rahasia di file <code className="bg-sky/20 px-1 py-0.5 rounded text-sky font-mono font-bold text-[9px]">.env.local</code> Anda:
                  </p>
                  <pre className="bg-sky/20 p-2.5 rounded-lg border border-sky/30 text-[10px] font-mono text-sky font-bold overflow-x-auto select-all">
                    DIGIFLAZZ_WEBHOOK_SECRET=mitsurusecurewebhooksecret99f3a1b7c8d2e6a0a
                  </pre>
                </div>

                <div className="space-y-1">
                  <span className="font-bold text-white uppercase tracking-wider text-[9px]">Langkah 2: Konfigurasi Penjadwal</span>
                  <p className="text-[10px] text-white/60">
                    Tambahkan perintah berikut di Linux Crontab (<code className="font-mono text-[9px]">crontab -e</code>) untuk berjalan otomatis setiap malam (00:00):
                  </p>
                  <pre className="bg-sky/20 p-2.5 rounded-lg border border-sky/30 text-[9px] font-mono text-white overflow-x-auto select-all whitespace-pre-wrap break-all">
                    0 0 * * * curl -s "https://mitsurushop.com/api/admin/sync/trigger?key=mitsurusecurewebhooksecret99f3a1b7c8d2e6a0a" &gt;/dev/null 2&gt;&amp;1
                  </pre>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: PAYMENT GATEWAY (DOKU & MIDTRANS) */}
        {adminMainTab === "payment" && (
          <div className="max-w-3xl mx-auto space-y-6 animate-fadeIn">
            <div className="bg-mist backdrop-blur-md rounded-2xl border border-sky/30 shadow-sky-soft relative overflow-hidden border">
              <div className="p-6 border-b border-sky/30 flex items-center justify-between">
                <h3 className="text-base font-black uppercase tracking-wide text-white flex items-center gap-2">
                  <Wallet className="h-4 w-4 text-sky" />
                  Konfigurasi Payment Gateway (Doku & Midtrans)
                </h3>
                <span className="px-2.5 py-0.5 text-[9px] font-black uppercase tracking-wider rounded bg-sky/20 text-sky border border-sky/30">
                  Aktif: {paymentGateway.toUpperCase()}
                </span>
              </div>

              <form onSubmit={handleSaveSettings} className="p-6 space-y-6">
                {/* Active Payment Gateway Selector */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-white/80 uppercase tracking-wider flex items-center gap-1.5">
                    <Wallet className="h-3.5 w-3.5 text-sky" />
                    Payment Gateway Utama
                  </label>
                  <div className="relative p-[1px] bg-sky-border" style={inputBevelStyle}>
                    <div className="flex items-center bg-mist backdrop-blur-md" style={inputBevelStyle}>
                      <select
                        value={paymentGateway}
                        onChange={(e) => setPaymentGateway(e.target.value)}
                        className="w-full px-3 py-2 text-xs font-bold text-white focus:outline-none bg-transparent"
                      >
                        <option value="midtrans" className="bg-[#183644] text-white py-1.5 font-bold">MIDTRANS (Default)</option>
                        <option value="doku" className="bg-[#183644] text-white py-1.5 font-bold">DOKU PAYMENT GATEWAY</option>
                      </select>
                    </div>
                  </div>
                  <p className="text-[10px] text-white/60 leading-relaxed">
                    Pilih penyedia gerbang pembayaran utama untuk memproses pembayaran pelanggan di website.
                  </p>
                </div>

                {/* Integration Type Selector */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-white/80 uppercase tracking-wider flex items-center gap-1.5">
                    <Settings className="h-3.5 w-3.5 text-sky" />
                    Metode Integrasi Pembayaran
                  </label>
                  <div className="relative p-[1px] bg-sky-border" style={inputBevelStyle}>
                    <div className="flex items-center bg-mist backdrop-blur-md" style={inputBevelStyle}>
                      <select
                        value={paymentMethodType}
                        onChange={(e) => setPaymentMethodType(e.target.value)}
                        className="w-full px-3 py-2 text-xs font-bold text-white focus:outline-none bg-transparent"
                      >
                        <option value="checkout" className="bg-[#183644] text-white py-1.5 font-bold">CHECKOUT PAGE (Hosted Page Doku / Midtrans Snap)</option>
                        <option value="direct" className="bg-[#183644] text-white py-1.5 font-bold">DIRECT API (Halaman Pembayaran Kustom)</option>
                      </select>
                    </div>
                  </div>
                  <p className="text-[10px] text-white/60 leading-relaxed">
                    Checkout Page mengalihkan user ke halaman resmi Doku/Midtrans. Direct API memproses langsung di web Anda.
                  </p>
                </div>

                {paymentGateway === "doku" ? (
                  <div className="p-5 rounded-2xl border border-sky/35 bg-sky/5 space-y-4">
                    <h4 className="text-xs font-black uppercase text-white/90 tracking-wider flex items-center gap-2">
                      <Shield className="h-4 w-4 text-sky" />
                      Kredensial Merchant Doku
                    </h4>
                    
                    {/* Doku Client ID */}
                    <div className="space-y-1.5">
                      <Label htmlFor="doku-client-id" className="text-[10px] font-bold text-white/70 uppercase">Doku Client ID</Label>
                      <Input
                        id="doku-client-id"
                        value={dokuClientId}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setDokuClientId(e.target.value)}
                        placeholder="Contoh: BRN-0270-1784635922691"
                        className="rounded-xl border-sky/30 text-xs font-semibold font-mono"
                      />
                    </div>

                    {/* Doku Shared Key */}
                    <div className="space-y-1.5">
                      <Label htmlFor="doku-shared-key" className="text-[10px] font-bold text-white/70 uppercase">Doku Shared / Secret Key</Label>
                      <Input
                        id="doku-shared-key"
                        type="password"
                        value={dokuSharedKey}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setDokuSharedKey(e.target.value)}
                        placeholder="Masukkan Doku Secret Key (SK-...)"
                        className="rounded-xl border-sky/30 text-xs font-semibold font-mono"
                      />
                    </div>

                    {/* Doku Environment Mode */}
                    <div className="space-y-1.5">
                      <Label className="text-[10px] font-bold text-white/70 uppercase">Environment Doku</Label>
                      <div className="relative p-[1px] bg-sky-border" style={inputBevelStyle}>
                        <div className="flex items-center bg-mist backdrop-blur-md" style={inputBevelStyle}>
                          <select
                            value={dokuMode}
                            onChange={(e) => setDokuMode(e.target.value)}
                            className="w-full px-3 py-2 text-xs font-bold text-white focus:outline-none bg-transparent"
                          >
                            <option value="sandbox" className="bg-[#183644] text-white py-1.5 font-bold">SANDBOX (Uji Coba / Testing)</option>
                            <option value="production" className="bg-[#183644] text-white py-1.5 font-bold">PRODUCTION (Live Bisnis)</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  /* Midtrans Mode Input */
                  <div className="p-5 rounded-2xl border border-sky/35 bg-sky/5 space-y-4">
                    <h4 className="text-xs font-black uppercase text-white/90 tracking-wider flex items-center gap-2">
                      <Shield className="h-4 w-4 text-sky" />
                      Konfigurasi Midtrans
                    </h4>

                    <div className="space-y-2">
                      <label className="text-xs font-bold text-white/80 uppercase tracking-wider flex items-center gap-1.5">
                        <Wallet className="h-3.5 w-3.5 text-sky" />
                        Mode Pembayaran Midtrans
                      </label>
                      <div className="relative p-[1px] bg-sky-border" style={inputBevelStyle}>
                        <div className="flex items-center bg-mist backdrop-blur-md" style={inputBevelStyle}>
                          <select
                            value={midtransMode}
                            onChange={(e) => setMidtransMode(e.target.value)}
                            className="w-full px-3 py-2 text-xs font-bold text-white focus:outline-none bg-transparent"
                          >
                            <option value="sandbox" className="bg-[#183644] text-white py-1.5 font-bold">SANDBOX (Testing)</option>
                            <option value="production" className="bg-[#183644] text-white py-1.5 font-bold">PRODUCTION (Live)</option>
                          </select>
                        </div>
                      </div>
                    </div>
                    <p className="text-[10px] text-white/60 leading-relaxed">
                      Pilih lingkungan pembayaran Midtrans yang aktif untuk transaksi. Kunci disimpan di file env server.
                    </p>
                  </div>
                )}

                {/* Save Button */}
                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={saveLoading}
                    className="w-full bg-sky hover:bg-sky/90 text-white font-black text-xs uppercase tracking-widest py-3 rounded-xl transition-all shadow-lg shadow-sky/20 disabled:opacity-50"
                  >
                    {saveLoading ? "Menyimpan..." : "Simpan Pengaturan Gateway"}
                  </button>
                </div>

                {saveSuccess && (
                  <div className="p-3 bg-green-50 border border-green-500/20 text-green-600 rounded-xl flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 shrink-0" />
                    <span className="text-[10px] font-bold uppercase tracking-wider">Pengaturan Payment Gateway Berhasil Disimpan!</span>
                  </div>
                )}
              </form>
            </div>
          </div>
        )}

        {/* TAB 4: WHATSAPP GATEWAY */}
        {adminMainTab === "whatsapp" && (
          <div className="max-w-3xl mx-auto space-y-6 animate-fadeIn">
            <div className="bg-mist backdrop-blur-md rounded-2xl border border-sky/30 shadow-sky-soft relative overflow-hidden border">
              <div className="p-6 border-b border-sky/30 flex items-center justify-between">
                <h3 className="text-base font-black uppercase tracking-wide text-white flex items-center gap-2">
                  <MessageSquare className="h-4 w-4 text-sky" />
                  WhatsApp Integration Gateway
                </h3>
                <span className={`inline-block px-2.5 py-0.5 text-[9px] font-black uppercase tracking-wider rounded ${
                  waStatus === "enabled"
                    ? "bg-green-50 text-green-500 border border-green-500/20"
                    : "bg-gray-50 text-white/60 border border-gray-200"
                }`} style={tagBevelStyle}>
                  {waStatus === "enabled" ? "Aktif" : "Nonaktif"}
                </span>
              </div>

              <form onSubmit={handleSaveSettings} className="p-6 space-y-6">
                {/* Status Toggle */}
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <label className="text-xs font-bold text-white/80 uppercase tracking-wider flex items-center gap-1.5">
                      <Power className="h-3.5 w-3.5 text-sky" />
                      Status Notifikasi WA
                    </label>
                    <p className="text-[10px] text-white/60 font-medium">Aktifkan notifikasi otomatis ke WhatsApp pelanggan &amp; admin.</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setWaStatus(waStatus === "enabled" ? "disabled" : "enabled")}
                    className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                      waStatus === "enabled" ? "bg-sky" : "bg-gray-200"
                    }`}
                  >
                    <span
                      className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-mist backdrop-blur-md shadow ring-0 transition duration-200 ease-in-out ${
                        waStatus === "enabled" ? "translate-x-5" : "translate-x-0"
                      }`}
                    />
                  </button>
                </div>

                {/* Gateway Method Dropdown */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-white/80 uppercase tracking-wider flex items-center gap-1.5">
                    <Smartphone className="h-3.5 w-3.5 text-sky" />
                    Metode Gateway WA
                  </label>
                  <div className="relative p-[1px] bg-sky-border" style={inputBevelStyle}>
                    <div className="flex items-center bg-mist backdrop-blur-md" style={inputBevelStyle}>
                      <select
                        value={waMethod}
                        onChange={(e) => setWaMethod(e.target.value)}
                        className="w-full px-3 py-2 text-xs font-bold text-white focus:outline-none bg-transparent"
                      >
                        <option value="baileys" className="bg-[#183644] text-white py-1.5 font-bold">Baileys (Lokal / VPS)</option>
                        <option value="fonnte" className="bg-[#183644] text-white py-1.5 font-bold">Fonnte API Gateway</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Endpoint API */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-white/80 uppercase tracking-wider flex items-center gap-1.5">
                    <ExternalLink className="h-3.5 w-3.5 text-sky" />
                    API Endpoint URL
                  </label>
                  <div className="relative p-[1px] bg-sky-border" style={inputBevelStyle}>
                    <input
                      type="text"
                      value={waEndpoint}
                      onChange={(e) => setWaEndpoint(e.target.value)}
                      className="w-full px-3 py-2 text-xs font-semibold text-white focus:outline-none bg-transparent"
                      placeholder="e.g. http://localhost:5000/send"
                      style={inputBevelStyle}
                    />
                  </div>
                </div>

                {/* API Token / Auth Key */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-white/80 uppercase tracking-wider flex items-center gap-1.5">
                    <Shield className="h-3.5 w-3.5 text-sky" />
                    API Token / Authorization Key
                  </label>
                  <div className="relative p-[1px] bg-sky-border" style={inputBevelStyle}>
                    <input
                      type="password"
                      value={waToken}
                      onChange={(e) => setWaToken(e.target.value)}
                      className="w-full px-3 py-2 text-xs font-semibold text-white focus:outline-none bg-transparent"
                      placeholder="Masukkan Token Fonnte / Custom Auth"
                      style={inputBevelStyle}
                    />
                  </div>
                </div>

                {/* Admin Phone Number */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-white/80 uppercase tracking-wider flex items-center gap-1.5">
                    <Smartphone className="h-3.5 w-3.5 text-sky" />
                    Nomor WhatsApp Admin (Penerima Notif Pesanan)
                  </label>
                  <div className="relative p-[1px] bg-sky-border" style={inputBevelStyle}>
                    <input
                      type="text"
                      value={waAdminNumber}
                      onChange={(e) => setWaAdminNumber(e.target.value)}
                      className="w-full px-3 py-2 text-xs font-semibold text-white focus:outline-none bg-transparent"
                      placeholder="Contoh: 081234567890"
                      style={inputBevelStyle}
                    />
                  </div>
                </div>

                {/* Customer Notification Toggle */}
                <div className="flex items-center justify-between pt-2">
                  <div className="space-y-0.5">
                    <label className="text-xs font-bold text-white/80 uppercase tracking-wider flex items-center gap-1.5">
                      <MessageSquare className="h-3.5 w-3.5 text-sky" />
                      Kirim Notifikasi ke Pembeli
                    </label>
                    <p className="text-[10px] text-white/60 font-medium">Kirim status checkout &amp; sukses topup ke WA pembeli.</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setWaCustomerNotif(!waCustomerNotif)}
                    className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                      waCustomerNotif ? "bg-sky" : "bg-gray-200"
                    }`}
                  >
                    <span
                      className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-mist backdrop-blur-md shadow ring-0 transition duration-200 ease-in-out ${
                        waCustomerNotif ? "translate-x-5" : "translate-x-0"
                      }`}
                    />
                  </button>
                </div>
                {/* Save Button */}
                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={saveLoading}
                    className="w-full bg-sky hover:bg-sky/90 text-white font-black text-xs uppercase tracking-widest py-3 rounded-xl transition-all shadow-lg shadow-sky/20 disabled:opacity-50"
                  >
                    {saveLoading ? "Menyimpan..." : "Simpan Pengaturan WhatsApp"}
                  </button>
                </div>

                {/* Baileys QR Code / Connection HUD */}
                {waStatus === "enabled" && waMethod === "baileys" && (
                  <div className="pt-4 border-t border-sky/30 space-y-4">
                    <span className="font-bold text-white uppercase tracking-wider text-[10px] flex items-center gap-1.5">
                      <QrCode className="h-3.5 w-3.5 text-sky" />
                      Status Koneksi WhatsApp (Baileys)
                    </span>

                    <div className="flex flex-col items-center justify-center p-4 border border-sky/30 bg-sky/20/40 rounded-xl space-y-3">
                      {baileysStatus === "connected" ? (
                        <div className="text-center space-y-2 w-full">
                          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-green-50 border border-green-500/20 text-green-600 rounded-full text-[10px] font-black uppercase tracking-wider">
                            <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                            Connected / Terhubung
                          </div>
                          <p className="text-[10px] text-white/60">
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
                          <div className="bg-mist backdrop-blur-md p-2 border border-sky/30 rounded-xl inline-block shadow-sm">
                            <img src={baileysQr} alt="WhatsApp Web QR Code" className="h-40 w-40 object-contain animate-fade-in" />
                          </div>
                          <p className="text-[9px] text-white/60 leading-relaxed max-w-[200px] mx-auto">
                            Buka WhatsApp di HP Anda &gt; Perangkat Tertaut &gt; Tautkan Perangkat, lalu scan QR code di atas.
                          </p>
                        </div>
                      ) : baileysStatus === "connecting" ? (
                        <div className="text-center py-4 w-full space-y-2">
                          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-50 border border-amber-500/20 text-amber-600 rounded-full text-[10px] font-black uppercase tracking-wider">
                            <span className="h-2 w-2 rounded-full bg-amber-500 animate-pulse" />
                            Connecting / Memulai...
                          </div>
                          <p className="text-[9px] text-white/60 max-w-[200px] mx-auto leading-relaxed">
                            Sedang memuat koneksi server lokal Baileys. Harap tunggu...
                          </p>
                        </div>
                      ) : (
                        <div className="text-center py-4 w-full space-y-2">
                          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-red-50 border border-red-500/20 text-red-600 rounded-full text-[10px] font-black uppercase tracking-wider">
                            <span className="h-2 w-2 rounded-full bg-red-500" />
                            Offline / Terputus
                          </div>
                          <p className="text-[9px] text-white/60 max-w-[220px] mx-auto leading-relaxed">
                            Gagal terhubung ke microservice gateway WhatsApp. Pastikan service gateway Baileys/Fonnte sudah aktif di URL Endpoint Anda (port 5000).
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Connection Test Section */}
                {waStatus === "enabled" && (
                  <div className="pt-4 border-t border-sky/30 space-y-3">
                    <span className="font-bold text-white uppercase tracking-wider text-[10px] flex items-center gap-1.5">
                      <ExternalLink className="h-3.5 w-3.5 text-sky" />
                      Uji Coba Kirim Notifikasi WhatsApp
                    </span>

                    <div className="p-4 border border-sky/30 bg-slate-50 rounded-xl space-y-3">
                      <div className="space-y-1.5">
                        <label className="text-[9px] font-bold text-white/80 uppercase tracking-wider text-left block">
                          Nomor HP Tujuan Tes
                        </label>
                        <div className="relative p-[1px] bg-sky-border" style={inputBevelStyle}>
                          <input
                            type="text"
                            value={testPhone}
                            onChange={(e) => setTestPhone(e.target.value)}
                            placeholder="e.g. 628123456789"
                            className="w-full px-3 py-1.5 text-xs font-semibold text-white focus:outline-none bg-mist backdrop-blur-md"
                            style={inputBevelStyle}
                          />
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-[9px] font-bold text-white/80 uppercase tracking-wider text-left block">
                          Isi Pesan Tes
                        </label>
                        <div className="relative p-[1px] bg-sky-border" style={inputBevelStyle}>
                          <textarea
                            value={testMessage}
                            onChange={(e) => setTestMessage(e.target.value)}
                            rows={2}
                            className="w-full px-3 py-1.5 text-xs font-semibold text-white focus:outline-none bg-mist backdrop-blur-md"
                            style={inputBevelStyle}
                          />
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={handleSendTestMessage}
                        disabled={testLoading || !testPhone.trim()}
                        className="w-full bg-sky hover:bg-sky/90 text-white py-1.5 text-[9px] font-black uppercase tracking-widest transition-colors rounded-lg disabled:opacity-50 flex items-center justify-center gap-1"
                      >
                        {testLoading ? (
                          <>
                            <Loader2 className="h-3 w-3 animate-spin" />
                            Mengirim...
                          </>
                        ) : (
                          "Kirim Pesan Uji Coba"
                        )}
                      </button>

                      {testResult && (
                        <div className={`p-2.5 rounded-lg border text-[10px] font-semibold text-left ${
                          testResult.success 
                            ? "bg-green-50 border-green-500/20 text-green-700" 
                            : "bg-red-50 border-red-500/20 text-red-700"
                        }`}>
                          {testResult.message}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </form>
            </div>

            {/* Rekomendasi Produksi (Cron Job Tips) Card */}
            <div className="bg-mist backdrop-blur-md rounded-2xl border border-sky/30 shadow-sky-soft relative overflow-hidden">
              <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-sky/20 to-transparent" />
              <div className="p-6 border-b border-sky/30">
                <h3 className="text-base font-black uppercase tracking-wide text-white flex items-center gap-2">
                  <Code className="h-4 w-4 text-sky" />
                  Rekomendasi Produksi (Cron)
                </h3>
              </div>
              <div className="p-6 space-y-4 text-xs text-white/80 leading-relaxed">
                <p>
                  Untuk memastikan harga modal &amp; jual selalu up-to-date, pasang penjadwal tugas otomatis (Cron Job / Task Scheduler) untuk memicu API di bawah:
                </p>

                <div className="space-y-1">
                  <span className="font-bold text-white uppercase tracking-wider text-[9px]">Langkah 1: Setup Kunci Keamanan</span>
                  <p className="text-[10px] text-white/60">
                    Definisikan token rahasia di file <code className="bg-sky/20 px-1 py-0.5 rounded text-sky font-mono font-bold text-[9px]">.env.local</code> Anda:
                  </p>
                  <pre className="bg-sky/20 p-2.5 rounded-lg border border-sky/30 text-[10px] font-mono text-sky font-bold overflow-x-auto select-all">
                    DIGIFLAZZ_WEBHOOK_SECRET=mitsurusecurewebhooksecret99f3a1b7c8d2e6a0a
                  </pre>
                </div>

                <div className="space-y-1">
                  <span className="font-bold text-white uppercase tracking-wider text-[9px]">Langkah 2: Konfigurasi Penjadwal</span>
                  <p className="text-[10px] text-white/60">
                    Tambahkan perintah berikut di Linux Crontab (<code className="font-mono text-[9px]">crontab -e</code>) untuk berjalan otomatis setiap malam (00:00):
                  </p>
                  <pre className="bg-sky/20 p-2.5 rounded-lg border border-sky/30 text-[9px] font-mono text-white overflow-x-auto select-all whitespace-pre-wrap break-all">
                    0 0 * * * curl -s "https://yourdomain.com/api/admin/sync/trigger?key=mitsurusecurewebhooksecret99f3a1b7c8d2e6a0a" &gt;/dev/null 2&gt;&amp;1
                  </pre>
                </div>

                <div className="bg-amber-50/50 border border-amber-500/10 p-3 rounded-xl space-y-1 text-[10px] text-white/60">
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
            <div className="bg-mist backdrop-blur-md rounded-2xl border border-sky/30 shadow-sky-soft relative overflow-hidden">
              <div className="p-6 border-b border-sky/30">
                <h3 className="text-base font-black uppercase tracking-wide text-white">
                  Produk Terlaris
                </h3>
              </div>
              <div className="p-6 space-y-4">
                {topProducts.map((p, idx) => (
                  <div key={idx} className="flex justify-between items-center bg-sky/20 p-4 rounded-xl border border-sky/30 hover:border-sky/10 transition-all duration-300">
                    <div className="flex items-center gap-3">
                      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-mist backdrop-blur-md p-1.5">
                        <img src={getItemAssetForProduct(p.name, p.sku, p.game)} alt="" className="max-h-full max-w-full object-contain" />
                      </span>
                      <div>
                      <p className="font-extrabold text-white text-xs uppercase tracking-tight">{p.name}</p>
                      <p className="mt-0.5 flex items-center gap-1.5 text-[9px] font-bold text-white/60 uppercase tracking-wider">
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
        )}
        </div>
      </main>

      {/* Digiflazz Deposit Ticket Modal */}
      <Dialog open={isDepositModalOpen} onOpenChange={setIsDepositModalOpen}>
        <DialogContent className="max-w-md bg-[#183644] border border-sky/30 rounded-[24px] p-6 shadow-sky-medium text-white">
          <DialogHeader>
            <DialogTitle className="text-xl font-black text-white uppercase tracking-wide flex items-center gap-2">
              <Wallet className="h-5 w-5 text-emerald-400" />
              Isi Saldo Digiflazz
            </DialogTitle>
            <DialogDescription className="text-xs font-semibold text-white/60 uppercase tracking-wider">
              Buat tiket isi saldo deposit Digiflazz otomatis langsung dari admin panel.
            </DialogDescription>
          </DialogHeader>

          {!depoResultTicket ? (
            <form onSubmit={handleCreateDepoTicket} className="space-y-4 my-2">
              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-white/80 uppercase">Pilih Nominal Topup</Label>
                <div className="grid grid-cols-3 gap-2 mb-2">
                  {[100000, 250000, 500000, 1000000, 2500000, 5000000].map((amt) => (
                    <button
                      key={amt}
                      type="button"
                      onClick={() => setDepoAmount(amt)}
                      className={`py-2 rounded-xl text-xs font-bold font-mono transition-all border ${
                        Number(depoAmount) === amt
                          ? "bg-emerald-500 text-white border-emerald-400 shadow-sky-soft"
                          : "bg-black/20 text-white/80 border-sky/20 hover:border-sky/40"
                      }`}
                    >
                      Rp {(amt / 1000).toLocaleString()}k
                    </button>
                  ))}
                </div>
                <Input
                  type="number"
                  value={depoAmount === 0 || depoAmount === "" ? "" : depoAmount}
                  onFocus={(e: any) => e.target.select()}
                  onChange={(e: any) => setDepoAmount(e.target.value === "" ? "" : Number(e.target.value))}
                  placeholder="Atau masukkan nominal custom..."
                  className="bg-black/20 border-sky/30 text-white placeholder-white/40 font-mono text-sm"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-xs font-bold text-white/80 uppercase">Bank Tujuan</Label>
                  <select
                    value={depoBank}
                    onChange={(e: any) => setDepoBank(e.target.value)}
                    className="w-full rounded-xl border border-sky/30 bg-black/20 px-3 py-2 text-xs font-bold text-white focus:outline-none focus:ring-1 focus:ring-sky h-10"
                  >
                    <option value="BCA" className="bg-[#183644] text-white font-bold">BCA</option>
                    <option value="BRI" className="bg-[#183644] text-white font-bold">BRI</option>
                    <option value="MANDIRI" className="bg-[#183644] text-white font-bold">MANDIRI</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-bold text-white/80 uppercase">Nama Pengirim</Label>
                  <Input
                    type="text"
                    value={depoOwnerName}
                    onChange={(e: any) => setDepoOwnerName(e.target.value.toUpperCase())}
                    placeholder="NAMA PEMILIK TOKO"
                    className="bg-black/20 border-sky/30 text-white uppercase text-xs font-bold"
                    required
                  />
                </div>
              </div>

              {depoTicketError && (
                <p className="text-xs text-red-400 font-bold bg-red-500/10 p-3 rounded-xl border border-red-500/30">
                  {depoTicketError}
                </p>
              )}

              <DialogFooter className="pt-4 gap-2">
                <Button type="button" variant="outline" onClick={() => setIsDepositModalOpen(false)}>
                  Batal
                </Button>
                <Button type="submit" className="bg-emerald-500 hover:bg-emerald-600 text-white font-bold" disabled={loadingDepoTicket}>
                  {loadingDepoTicket && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                  Dapatkan Tiket Transfer
                </Button>
              </DialogFooter>
            </form>
          ) : (
            <div className="space-y-4 my-2">
              <div className="bg-emerald-500/10 border border-emerald-500/30 p-4 rounded-2xl space-y-3">
                <div className="flex justify-between items-center border-b border-emerald-500/20 pb-3">
                  <span className="text-xs font-bold text-white/70 uppercase">Transfer Tepat Pas</span>
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-black text-emerald-400 font-mono">
                      Rp {Number(depoResultTicket.amount || 0).toLocaleString("id-ID")}
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        navigator.clipboard.writeText(String(depoResultTicket.amount))
                        alert("Nominal transfer berhasil disalin!")
                      }}
                      className="px-2 py-1 bg-emerald-500 text-white text-[10px] font-bold rounded hover:bg-emerald-600 transition-colors uppercase"
                    >
                      Salin
                    </button>
                  </div>
                </div>

                <div className="space-y-1.5 text-xs text-white/80">
                  <p className="font-bold text-white uppercase text-[10px] tracking-wider">Instruksi Transfer:</p>
                  <p className="text-xs leading-relaxed text-emerald-300 font-medium">
                    {depoResultTicket.notes || `Silakan transfer nominal diatas ke Bank ${depoResultTicket.bank} a.n. PT DIGIFLAZZ INTERNASIONAL INDONESIA`}
                  </p>
                </div>
              </div>

              <DialogFooter className="pt-2">
                <Button
                  type="button"
                  onClick={() => setIsDepositModalOpen(false)}
                  className="w-full bg-sky text-white hover:bg-diamond font-bold"
                >
                  Selesai
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Footer />
    </SidebarContentWrapper>
  </div>
  )
}
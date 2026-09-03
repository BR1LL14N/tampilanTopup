"use client"

import { useState, useMemo } from "react"
import { useRouter } from "next/navigation"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { SidebarContentWrapper } from "@/components/layout/sidebar-content-wrapper"
import {
  Zap,
  MessagesSquare,
  BadgeCheck,
  Plus,
  Minus,
  ShoppingBag,
  Headphones,
  Star,
  User,
  Shield,
  FileText,
  Tag,
  Loader2,
  Search,
  CheckCircle2,
  Crown,
  Sparkles,
  Layers,
} from "lucide-react"
import { gameAssets, getItemAssetForProduct, paymentAssets } from "@/lib/assets"
import { formatCurrency } from "@/lib/utils"

interface Product {
  id: string
  name: string
  price: number
  sell_price: number
  provider_sku: string
  is_out_of_stock?: boolean
}

interface Game {
  name: string
  icon: string
  slug: string
  image: string
  description: string
  category: string
  products: Product[]
}

interface GameDetailContentProps {
  game: Game
  user?: {
    name: string
    email: string
    role: string
  } | null
}

const gameWallpapers: Record<string, string> = {
  "mobile-legends": gameAssets["mobile-legends"].banner,
  "free-fire": gameAssets["free-fire"].banner,
  "pubg-mobile": gameAssets["pubg-mobile"].banner,
  "valorant": gameAssets.valorant.banner,
  "genshin-impact": gameAssets["genshin-impact"].banner,
  "roblox": gameAssets.roblox.banner,
  "honor-of-kings": gameAssets["honor-of-kings"].banner,
  "steam": gameAssets.steam.banner,
  "tiktok": gameAssets.tiktok.banner,
  "bigo": gameAssets.bigo.banner,
}
const defaultWallpaper = gameAssets["mobile-legends"].banner

const getPublisher = (slug: string) => {
  const map: Record<string, string> = {
    "mobile-legends": "Moonton",
    "free-fire": "Garena",
    "pubg-mobile": "Tencent Games",
    "valorant": "Riot Games",
    "genshin-impact": "HoYoverse",
    "roblox": "Roblox Corporation",
    "honor-of-kings": "Tencent Games",
    "steam": "Valve",
    "tiktok": "TikTok",
    "bigo": "BIGO",
  }
  return map[slug] || "Game Publisher"
}

export function GameDetailContent({ game, user }: GameDetailContentProps) {
  const router = useRouter()

  // Tabs: Transaksi vs Keterangan
  const [activeTab, setActiveTab] = useState("transaksi")

  // Form states
  const [gameId, setGameId] = useState("")
  const [serverId, setServerId] = useState("")
  const [email, setEmail] = useState("")
  const [requestNotes, setRequestNotes] = useState("")

  // Selection states
  const [quantity, setQuantity] = useState(1)
  const [whatsapp, setWhatsapp] = useState("")

  // Helper to identify Pass, Membership, Weekly, Monthly, Starlight products
  const isPassOrMembership = (name: string, sku: string = "") => {
    const str = `${name} ${sku}`.toLowerCase()
    return /pass|weekly|monthly|starlight|twilight|membership|member|langganan|subscription|welkin|battle\s*pass/i.test(str)
  }

  // Filter & Sort Products (from lowest price to highest)
  const [nominalCategory, setNominalCategory] = useState<"all" | "regular" | "pass">("all")

  const sortedAllProducts = useMemo(() => {
    return [...(game.products || [])].sort(
      (a, b) => (Number(a.sell_price) || 0) - (Number(b.sell_price) || 0)
    )
  }, [game.products])

  const [selectedProduct, setSelectedProduct] = useState<Product | null>(() => {
    const sorted = [...(game.products || [])].sort(
      (a, b) => (Number(a.sell_price) || 0) - (Number(b.sell_price) || 0)
    )
    return sorted.find((p) => !p.is_out_of_stock) || sorted[0] || null
  })

  const passProducts = useMemo(() => {
    return sortedAllProducts.filter((p) => isPassOrMembership(p.name, p.provider_sku))
  }, [sortedAllProducts])

  const regularProducts = useMemo(() => {
    return sortedAllProducts.filter((p) => !isPassOrMembership(p.name, p.provider_sku))
  }, [sortedAllProducts])

  const hasPassProducts = passProducts.length > 0

  const displayedProducts = useMemo(() => {
    if (nominalCategory === "pass") return passProducts
    if (nominalCategory === "regular") return regularProducts
    return sortedAllProducts
  }, [nominalCategory, passProducts, regularProducts, sortedAllProducts])

  // Nickname verification states
  const [checkingId, setCheckingId] = useState(false)
  const [verifiedNickname, setVerifiedNickname] = useState("")
  const [checkError, setCheckError] = useState("")

  const handleCheckNickname = async () => {
    if (!gameId.trim()) {
      setCheckError("Silakan masukkan User ID terlebih dahulu")
      return
    }
    if (game.slug === "mobile-legends" && !serverId.trim()) {
      setCheckError("Silakan masukkan Server ID terlebih dahulu")
      return
    }

    setCheckingId(true)
    setCheckError("")
    setVerifiedNickname("")

    try {
      const res = await fetch("/api/game/check-id", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          gameSlug: game.slug,
          targetId: gameId.trim(),
          serverId: serverId.trim(),
          sku: selectedProduct?.provider_sku || undefined,
        }),
      })

      const data = await res.json()

      if (!res.ok || data.error) {
        setCheckError(data.error || "ID Akun tidak ditemukan / tidak valid")
      } else if (data.nickname) {
        setVerifiedNickname(data.nickname)
        setCheckError("")
      } else {
        setCheckError("ID Akun tidak ditemukan / tidak valid")
      }
    } catch (err: any) {
      setCheckError(err.message || "Gagal menghubungi server verifikasi")
    } finally {
      setCheckingId(false)
    }
  }

  // Promo Code states
  const [promoCode, setPromoCode] = useState("")
  const [appliedPromoCode, setAppliedPromoCode] = useState("")
  const [promoDiscount, setPromoDiscount] = useState(0)
  const [promoError, setPromoError] = useState("")
  const [isApplyingPromo, setIsApplyingPromo] = useState(false)

  const handleApplyPromo = async () => {
    if (!promoCode.trim()) return
    setIsApplyingPromo(true)
    setPromoError("")
    try {
      const res = await fetch("/api/promo/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: promoCode.trim() }),
      })
      const data = await res.json()
      if (data.error) {
        setPromoError(data.error)
        setAppliedPromoCode("")
        setPromoDiscount(0)
      } else if (data.promo) {
        setAppliedPromoCode(data.promo.code)
        let discount = 0
        const itemTotal = (selectedProduct?.sell_price || 0) * quantity
        if (Number(data.promo.discount_percent) > 0) {
          discount = Math.round(itemTotal * (Number(data.promo.discount_percent) / 100))
        } else if (Number(data.promo.discount_amount) > 0) {
          discount = Number(data.promo.discount_amount)
        }
        setPromoDiscount(discount)
        setPromoError("")
      }
    } catch (err) {
      setPromoError("Gagal memverifikasi kode promo")
    } finally {
      setIsApplyingPromo(false)
    }
  }

  // Validation Error state for auto-scrolling
  const [validationError, setValidationError] = useState<{ field: string; message: string } | null>(null)

  const scrollToField = (fieldId: string, message: string) => {
    setValidationError({ field: fieldId, message })
    const el = document.getElementById(fieldId)
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "center" })
      setTimeout(() => {
        el.focus()
      }, 350)
    }
  }

  const handleOrder = () => {
    setValidationError(null)

    if (!gameId.trim()) {
      scrollToField("input-user-id", "User ID akun game wajib diisi.")
      return
    }
    if (game.slug === "mobile-legends" && !serverId.trim()) {
      scrollToField("input-server-id", "Server / Zone ID Mobile Legends wajib diisi.")
      return
    }
    if (!selectedProduct) {
      scrollToField("step-2-nominal", "Silakan pilih salah satu nominal produk top up di bawah ini.")
      return
    }
    if (!whatsapp.trim()) {
      scrollToField("input-whatsapp", "Nomor WhatsApp aktif wajib diisi untuk menerima bukti transaksi.")
      return
    }

    // Redirect to dynamic checkout/invoice route
    const target = serverId ? `${gameId.trim()}${serverId.trim()}` : gameId.trim()
    
    const queryParams = new URLSearchParams({
      target,
      whatsapp: whatsapp.trim(),
      qty: String(quantity),
    })

    if (requestNotes) {
      queryParams.set("notes", requestNotes)
    }
    if (email) {
      queryParams.set("email", email)
    }
    const codeToUse = appliedPromoCode || promoCode.trim()
    if (codeToUse) {
      queryParams.set("promo", codeToUse)
    }

    router.push(
      `/checkout/${selectedProduct.provider_sku}?${queryParams.toString()}`
    )
  }

  // Hexagonal game cuts
  const bevelStyle = {
    clipPath: "polygon(12px 0%, calc(100% - 12px) 0%, 100% 12px, 100% calc(100% - 12px), calc(100% - 12px) 100%, 12px 100%, 0% calc(100% - 12px), 0% 12px)"
  }

  const cardBevelStyle = {
    clipPath: "polygon(10px 0%, calc(100% - 10px) 0%, 100% 10px, 100% calc(100% - 10px), calc(100% - 10px) 100%, 10px 100%, 0% calc(100% - 10px), 0% 10px)"
  }

  const inputBevelStyle = {
    clipPath: "polygon(8px 0%, calc(100% - 8px) 0%, 100% 8px, 100% calc(100% - 8px), calc(100% - 8px) 100%, 8px 100%, 0% calc(100% - 8px), 0% 8px)"
  }

  const tagBevelStyle = {
    clipPath: "polygon(4px 0%, calc(100% - 4px) 0%, 100% 4px, 100% calc(100% - 4px), calc(100% - 4px) 100%, 4px 100%, 0% calc(100% - 4px), 0% 4px)"
  }

  const tabBevelStyle = {
    clipPath: "polygon(8px 0%, calc(100% - 8px) 0%, 100% 8px, 100% 100%, 0% 100%)"
  }

  const bannerBg = game.image || gameWallpapers[game.slug] || defaultWallpaper
  const publisher = getPublisher(game.slug)

  return (
    <div className="min-h-screen text-text-primary antialiased relative w-full">

      <Header user={user} />

      <SidebarContentWrapper isAuthenticated={!!user}>
        <main className="relative z-10 py-6 sm:py-8 pb-28 lg:pb-8 w-full">
          <div className="mx-auto max-w-7xl px-3 sm:px-6 lg:px-8 w-full">

          {/* Game Header Banner Redesign */}
          <div className="relative mb-10 rounded-2xl border border-sky/30 overflow-hidden bg-[#183644]/90 backdrop-blur-md shadow-2xl group transition-all duration-300 w-full max-w-full min-w-0">

            {/* Banner background visual spanning the entire card */}
            <div className="absolute inset-0 z-0">
              <div
                className="absolute inset-0 bg-cover bg-center opacity-40 scale-105 transition-transform duration-750 group-hover:scale-100"
                style={{ backgroundImage: `url('${bannerBg}')` }}
              />
              {/* Dark gradient overlay from left to right */}
              <div className="absolute inset-0 bg-gradient-to-r from-[#102a36] via-[#102a36]/80 to-transparent z-10" />
              <div className="absolute inset-0 bg-gradient-to-t from-[#102a36] via-transparent to-transparent z-10" />
            </div>

            {/* Shimmer overlay sweep on hover */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden z-[15]">
              <div className="absolute top-0 left-[-150%] w-1/2 h-full bg-gradient-to-r from-transparent via-white/10 to-transparent skew-x-[-25deg] transition-all duration-1000 ease-out group-hover:left-[150%]" />
            </div>

            {/* Banner Content Grid */}
            <div className="relative z-20 grid md:grid-cols-[240px_1fr] gap-8 p-6 md:p-8 pt-12 md:pt-16 items-end">

              {/* Cover Image */}
              <div className="relative overflow-hidden w-44 md:w-52 mx-auto md:mx-0 rounded-2xl border border-sky/40 shadow-sky-glow/20 h-60 md:h-64 bg-black/40">
                <img
                  className="h-full w-full object-cover transition-transform duration-750 hover:scale-110"
                  src={game.image}
                  alt={game.name}
                />
              </div>

              {/* Title & Info Panel */}
              <div className="space-y-4 text-center md:text-left relative z-20">
                <div>
                  <span className="text-[10px] font-black uppercase text-white bg-sky px-3 py-1 rounded-full shadow-md shadow-sky/30 border border-sky/40">
                    Penyedia Resmi
                  </span>
                  <h1 className="text-3xl md:text-5xl font-black uppercase text-white mt-3 tracking-tight drop-shadow-md">
                    {game.name}
                  </h1>
                  <p className="text-xs font-bold text-white/80 uppercase tracking-widest mt-1.5">
                    Publisher: <span className="text-white font-black">{publisher}</span> • Kategori: <span className="text-sky font-black">{game.category}</span>
                  </p>
                </div>

                {/* Sub-badges layout */}
                <div className="flex flex-wrap justify-center md:justify-start gap-3.5 pt-2">
                  <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#183644]/90 border border-amber-500/30 text-amber-300 text-[10px] font-black uppercase tracking-wider shadow-sm">
                    <Zap className="h-3.5 w-3.5 fill-amber-500/20 text-amber-400" />
                    Proses Cepat
                  </span>
                  <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#183644]/90 border border-sky/30 text-white text-[10px] font-black uppercase tracking-wider shadow-sm">
                    <MessagesSquare className="h-3.5 w-3.5 fill-sky/20 text-sky" />
                    Layanan Chat 24/7
                  </span>
                  <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#183644]/90 border border-emerald-500/30 text-emerald-300 text-[10px] font-black uppercase tracking-wider shadow-sm">
                    <BadgeCheck className="h-3.5 w-3.5 fill-emerald-500/20 text-emerald-400" />
                    Pembayaran Aman!
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Dynamic content grid */}
          <div className="grid gap-6 sm:gap-8 lg:grid-cols-[minmax(0,1fr)_340px] xl:grid-cols-[minmax(0,1fr)_380px] w-full min-w-0">

            {/* Left Column Form */}
            <div className="space-y-6 w-full max-w-full min-w-0">

              {/* Folder style tabs selector */}
              <div className="flex overflow-hidden border-b border-sky-border text-xs font-black uppercase tracking-wider gap-1">
                <button
                  onClick={() => setActiveTab("transaksi")}
                  className={`px-6 py-2.5 transition-all duration-300 rounded-t-xl ${
                    activeTab === "transaksi"
                      ? "bg-sky text-white shadow-lg shadow-sky/10"
                      : "bg-ice hover:bg-sky-border/20 text-text-secondary hover:text-text-primary"
                  }`}
                >
                  Form Transaksi
                </button>
                <button
                  onClick={() => setActiveTab("keterangan")}
                  className={`px-6 py-2.5 transition-all duration-300 rounded-t-xl ${
                    activeTab === "keterangan"
                      ? "bg-sky text-white shadow-lg shadow-sky/10"
                      : "bg-ice hover:bg-sky-border/20 text-text-secondary hover:text-text-primary"
                  }`}
                >
                  Informasi Game
                </button>
              </div>

              {activeTab === "transaksi" ? (
                <>
                  {/* Step 1: Input Akun */}
                  <div className="bg-[#183644]/90 backdrop-blur-md border border-sky/30 rounded-[20px] sm:rounded-[24px] shadow-sky-medium overflow-hidden w-full max-w-full min-w-0">
                    <div className="p-4 border-b border-sky/30 flex items-center gap-3 dark-stripes-teal">
                      <span className="grid h-7 w-7 place-items-center bg-sky text-white font-black text-xs rounded-lg shadow-sky-soft">1</span>
                      <h3 className="text-xs font-black uppercase tracking-widest text-white">Masukkan Data Akun</h3>
                    </div>

                    <div className="grid gap-4 sm:gap-5 p-4 sm:p-6 sm:grid-cols-2">
                      <div className="space-y-2">
                        <span className="block text-xs font-bold uppercase tracking-wider text-white/60">User ID <span className="text-sky">*</span></span>
                        <input
                          id="input-user-id"
                          value={gameId}
                          onChange={(e) => {
                            setGameId(e.target.value);
                            if (validationError?.field === "input-user-id") setValidationError(null);
                            setVerifiedNickname("");
                            setCheckError("");
                          }}
                          placeholder="Masukkan User ID"
                          className={`w-full bg-black/20 border transition-all rounded-xl px-4 py-2.5 text-sm text-white placeholder-white/40 outline-none ${
                            validationError?.field === "input-user-id"
                              ? "border-amber-400 ring-4 ring-amber-400/30 bg-amber-500/10"
                              : "border-white/10 hover:border-white/30 focus:border-sky focus:ring-2 focus:ring-sky/20"
                          }`}
                          required
                        />
                        {validationError?.field === "input-user-id" && (
                          <p className="text-[11px] font-bold text-amber-300 flex items-center gap-1.5 mt-1 animate-fadeIn">
                            ⚠️ {validationError.message}
                          </p>
                        )}
                      </div>

                      {/* Conditionally show Server ID for Mobile Legends */}
                      {game.slug === "mobile-legends" && (
                        <div className="space-y-2">
                          <span className="block text-xs font-bold uppercase tracking-wider text-white/60">Server ID <span className="text-sky">*</span></span>
                          <input
                            id="input-server-id"
                            value={serverId}
                            onChange={(e) => {
                              setServerId(e.target.value);
                              if (validationError?.field === "input-server-id") setValidationError(null);
                              setVerifiedNickname("");
                              setCheckError("");
                            }}
                            placeholder="Masukkan Server ID"
                            className={`w-full bg-black/20 border transition-all rounded-xl px-4 py-2.5 text-sm text-white placeholder-white/40 outline-none ${
                              validationError?.field === "input-server-id"
                                ? "border-amber-400 ring-4 ring-amber-400/30 bg-amber-500/10"
                                : "border-white/10 hover:border-white/30 focus:border-sky focus:ring-2 focus:ring-sky/20"
                            }`}
                            required
                          />
                          {validationError?.field === "input-server-id" && (
                            <p className="text-[11px] font-bold text-amber-300 flex items-center gap-1.5 mt-1 animate-fadeIn">
                              ⚠️ {validationError.message}
                            </p>
                          )}
                        </div>
                      )}

                      {/* Real-time Nickname Verification Action & Result (Temporarily hidden until IP is whitelisted) */}
                      {false && (
                        <div className="sm:col-span-2 space-y-2 pt-1 pb-1">
                          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                            <button
                              type="button"
                              onClick={handleCheckNickname}
                              disabled={checkingId || !gameId.trim()}
                              className="px-4 py-2.5 bg-sky/20 hover:bg-sky/40 border border-sky/40 hover:border-sky/70 text-sky hover:text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                            >
                              {checkingId ? (
                                <Loader2 className="h-4 w-4 animate-spin text-sky" />
                              ) : (
                                <Search className="h-4 w-4 text-sky" />
                              )}
                              {checkingId ? "Mengecek ID ke Server Digiflazz..." : "🔍 Cek Nickname Akun Player"}
                            </button>

                            {verifiedNickname && (
                              <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-bold shadow-md animate-fadeIn">
                                <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                                <span>Akun Terverifikasi: <strong className="text-white underline decoration-emerald-400 decoration-2">{verifiedNickname}</strong></span>
                              </div>
                            )}
                          </div>

                          {checkError && (
                            <div className="p-3 rounded-xl bg-red-500/20 border border-red-500/30 text-red-300 text-xs font-semibold flex items-center gap-2 animate-fadeIn">
                              <span className="text-sm">⚠️</span>
                              <span>{checkError}</span>
                            </div>
                          )}
                        </div>
                      )}

                      <div className="space-y-2">
                        <span className="block text-xs font-bold uppercase tracking-wider text-white/60">Email (Opsional)</span>
                        <input
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="name@email.com"
                          className="w-full bg-black/20 border border-white/10 hover:border-white/30 focus:border-sky focus:ring-2 focus:ring-sky/20 transition-all rounded-xl px-4 py-2.5 text-sm text-white placeholder-white/40 outline-none"
                        />
                      </div>

                      <div className="space-y-2">
                        <span className="block text-xs font-bold uppercase tracking-wider text-white/60">No. WhatsApp Aktif <span className="text-sky">*</span></span>
                        <input
                          id="input-whatsapp"
                          value={whatsapp}
                          onChange={(e) => {
                            setWhatsapp(e.target.value);
                            if (validationError?.field === "input-whatsapp") setValidationError(null);
                          }}
                          placeholder="Contoh: 081234567890"
                          className={`w-full bg-black/20 border transition-all rounded-xl px-4 py-2.5 text-sm text-white placeholder-white/40 outline-none ${
                            validationError?.field === "input-whatsapp"
                              ? "border-amber-400 ring-4 ring-amber-400/30 bg-amber-500/10"
                              : "border-white/10 hover:border-white/30 focus:border-sky focus:ring-2 focus:ring-sky/20"
                          }`}
                          required
                        />
                        {validationError?.field === "input-whatsapp" && (
                          <p className="text-[11px] font-bold text-amber-300 flex items-center gap-1.5 mt-1 animate-fadeIn">
                            ⚠️ {validationError.message}
                          </p>
                        )}
                      </div>

                      <div className="sm:col-span-2 space-y-2">
                        <span className="block text-xs font-bold uppercase tracking-wider text-white/60">Catatan Khusus untuk Admin (Opsional)</span>
                        <input
                          value={requestNotes}
                          onChange={(e) => setRequestNotes(e.target.value)}
                          placeholder="Contoh: Tolong proses cepat ya admin, kirim sebagai hadiah"
                          className="w-full bg-black/20 border border-white/10 hover:border-white/30 focus:border-sky focus:ring-2 focus:ring-sky/20 transition-all rounded-xl px-4 py-2.5 text-sm text-white placeholder-white/40 outline-none"
                        />
                      </div>

                      {/* Kode Referral / Kode Voucher Promo (Opsional) */}
                      <div className="sm:col-span-2 space-y-2 pt-2 border-t border-white/10">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                            <Tag className="h-3.5 w-3.5 text-amber-400 shrink-0" />
                            Kode Referral / Promo Voucher (Opsional)
                          </span>
                          {appliedPromoCode && (
                            <span className="text-[10px] font-black uppercase text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-2 py-0.5 rounded">
                              Diskon Terpasang: -{formatCurrency(promoDiscount)}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <input
                            value={promoCode}
                            onChange={(e) => {
                              setPromoCode(e.target.value.toUpperCase());
                              setPromoError("");
                            }}
                            placeholder="Masukkan Kode Referral / Promo (Misal: MITSURU2026)"
                            className="w-full bg-black/20 border border-amber-500/30 hover:border-amber-500/50 focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20 transition-all rounded-xl px-4 py-2.5 text-sm text-amber-300 font-mono tracking-wider uppercase placeholder-amber-400/40 outline-none"
                          />
                          <button
                            type="button"
                            onClick={handleApplyPromo}
                            disabled={isApplyingPromo || !promoCode.trim()}
                            className="px-4 py-2.5 bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-slate-950 font-black text-xs uppercase tracking-wider rounded-xl transition-all shrink-0 shadow-sm"
                          >
                            {isApplyingPromo ? "Cek..." : "Gunakan"}
                          </button>
                        </div>
                        {promoError && (
                          <p className="text-[11px] font-semibold text-red-400 flex items-center gap-1 mt-1">
                            ⚠️ {promoError}
                          </p>
                        )}
                        {appliedPromoCode && (
                          <p className="text-[11px] font-semibold text-emerald-400 flex items-center gap-1 mt-1">
                            ✅ Kode promo "{appliedPromoCode}" berhasil digunakan!
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Step 2: Pilih Nominal */}
                  <div 
                    id="step-2-nominal"
                    className={`bg-[#183644] border rounded-[20px] sm:rounded-[24px] shadow-sky-medium overflow-hidden mt-6 w-full max-w-full min-w-0 transition-all duration-300 ${
                      validationError?.field === "step-2-nominal"
                        ? "border-amber-400 ring-4 ring-amber-400/30"
                        : "border-sky/30"
                    }`}
                  >
                    <div className="p-3.5 sm:p-4 border-b border-sky/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3 dark-stripes-teal w-full max-w-full min-w-0">
                      <div className="flex items-center gap-2.5 sm:gap-3 shrink-0">
                        <span className="grid h-6 w-6 sm:h-7 sm:w-7 place-items-center bg-sky text-white font-black text-xs rounded-lg shadow-sky-soft shrink-0">2</span>
                        <h3 className="text-xs font-black uppercase tracking-widest text-white">Pilih Nominal Top Up</h3>
                      </div>

                      {/* Category Filter Tabs (Semua / Diamonds / Membership Pass) */}
                      {hasPassProducts && (
                        <div className="w-full max-w-full overflow-x-auto pb-1 scrollbar-none min-w-0">
                          <div className="inline-flex items-center gap-1.5 bg-black/40 p-1 rounded-xl border border-sky/20">
                            <button
                              type="button"
                              onClick={() => setNominalCategory("all")}
                              className={`px-3 py-1.5 rounded-lg text-[10px] sm:text-[11px] font-black uppercase tracking-wider flex items-center gap-1.5 transition-all whitespace-nowrap shrink-0 ${
                                nominalCategory === "all"
                                  ? "bg-sky text-white shadow-sky-soft"
                                  : "text-white/60 hover:text-white hover:bg-white/5"
                              }`}
                            >
                              <Layers className="h-3 w-3 shrink-0" />
                              Semua ({sortedAllProducts.length})
                            </button>
                            <button
                              type="button"
                              onClick={() => setNominalCategory("regular")}
                              className={`px-3 py-1.5 rounded-lg text-[10px] sm:text-[11px] font-black uppercase tracking-wider flex items-center gap-1.5 transition-all whitespace-nowrap shrink-0 ${
                                nominalCategory === "regular"
                                  ? "bg-sky text-white shadow-sky-soft"
                                  : "text-white/60 hover:text-white hover:bg-white/5"
                              }`}
                            >
                              <Sparkles className="h-3 w-3 shrink-0" />
                              Diamonds / Koin ({regularProducts.length})
                            </button>
                            <button
                              type="button"
                              onClick={() => setNominalCategory("pass")}
                              className={`px-3 py-1.5 rounded-lg text-[10px] sm:text-[11px] font-black uppercase tracking-wider flex items-center gap-1.5 transition-all whitespace-nowrap shrink-0 ${
                                nominalCategory === "pass"
                                  ? "bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 font-extrabold shadow-sm"
                                  : "text-amber-300/70 hover:text-amber-300 hover:bg-amber-500/10"
                              }`}
                            >
                              <Crown className="h-3 w-3 shrink-0" />
                              Pass &amp; Member ({passProducts.length})
                            </button>
                          </div>
                        </div>
                      )}
                    </div>

                    {validationError?.field === "step-2-nominal" && (
                      <div className="bg-amber-500/15 border-b border-amber-500/30 px-4 py-2.5 text-xs font-bold text-amber-300 flex items-center gap-2 animate-fadeIn">
                        <span>⚠️ {validationError.message}</span>
                      </div>
                    )}

                    <div className="p-2 sm:p-5 w-full max-w-full min-w-0">
                      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 gap-2 sm:gap-4 w-full max-w-full min-w-0">
                        {displayedProducts.map((prod) => {
                          const originalPrice = Math.round(prod.sell_price * 1.25)
                          const discount = 20
                          const isSelected = selectedProduct?.id === prod.id
                          const isPassItem = isPassOrMembership(prod.name, prod.provider_sku)
                          const isOutOfStock = !!prod.is_out_of_stock
                          return (
                            <button
                              key={prod.id}
                              disabled={isOutOfStock}
                              onClick={() => {
                                if (isOutOfStock) return
                                setSelectedProduct(prod)
                                if (validationError?.field === "step-2-nominal") setValidationError(null)
                              }}
                              className={`w-full max-w-full min-w-0 p-2 sm:p-3.5 text-left group rounded-[14px] sm:rounded-[20px] transition-all duration-200 border relative overflow-hidden flex flex-col justify-between box-border ${
                                isOutOfStock
                                  ? "border-red-500/20 bg-black/40 opacity-50 cursor-not-allowed grayscale-[20%]"
                                  : isSelected
                                  ? "border-sky bg-sky/15 shadow-lg scale-[1.01] ring-2 ring-sky/30"
                                  : isPassItem
                                  ? "border-amber-500/30 bg-amber-500/5 hover:border-amber-500/50 hover:bg-amber-500/10"
                                  : "border-white/10 bg-black/25 hover:border-white/30 hover:bg-white/5"
                              }`}
                              type="button"
                            >
                              {isOutOfStock ? (
                                <span className="absolute top-0 right-0 bg-red-600/90 text-white font-black text-[7.5px] sm:text-[9px] uppercase px-1.5 sm:px-2 py-0.5 rounded-bl-lg tracking-wider shadow-sm">
                                  STOK HABIS
                                </span>
                              ) : isPassItem && (
                                <span className="absolute top-0 right-0 bg-gradient-to-l from-amber-500 to-yellow-400 text-slate-950 font-black text-[7.5px] sm:text-[9px] uppercase px-1.5 sm:px-2 py-0.5 rounded-bl-lg tracking-wider flex items-center gap-1 shadow-sm">
                                  <Crown className="h-2.5 w-2.5" />
                                  PASS
                                </span>
                              )}
                              
                              <div className="w-full max-w-full min-w-0">
                                <span className="mb-1.5 sm:mb-2 flex h-8 w-8 sm:h-10 sm:w-10 items-center justify-center rounded-lg bg-black/30 p-1 sm:p-1.5 border border-white/10 group-hover:border-white/20 transition-colors">
                                  <img
                                    src={getItemAssetForProduct(prod.name, prod.provider_sku, game.name)}
                                    alt=""
                                    loading="lazy"
                                    decoding="async"
                                    className="max-h-full max-w-full object-contain drop-shadow-md"
                                  />
                                </span>
                                <span className="block font-black text-[10px] sm:text-xs uppercase tracking-tight text-white group-hover:text-sky transition-colors line-clamp-3 leading-snug min-h-[38px] sm:min-h-[34px] break-words">
                                  {prod.name}
                                </span>
                              </div>

                              <div className="w-full max-w-full min-w-0 mt-2.5 pt-2 border-t border-white/10 flex flex-col justify-end">
                                <div className="flex items-center gap-1.5 mb-1">
                                  <span className="text-[10px] sm:text-xs text-white/50 line-through font-semibold leading-none truncate">
                                    Rp {originalPrice.toLocaleString("id-ID")}
                                  </span>
                                  <span className={`px-1.5 py-0.5 rounded text-[8px] sm:text-[9px] font-black uppercase tracking-wider leading-none shrink-0 ${
                                    isSelected 
                                      ? "bg-sky text-white shadow-sm" 
                                      : isPassItem
                                      ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                                      : "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                                  }`}>
                                    -{discount}%
                                  </span>
                                </div>
                                <div className="text-sm sm:text-base md:text-lg font-black text-sky tracking-tight leading-none truncate">
                                  Rp {prod.sell_price.toLocaleString("id-ID")}
                                </div>
                              </div>
                            </button>
                          )
                        })}
                      </div>
                    </div>
                  </div>

                </>
              ) : (
                /* Description & Rules Tab */
                <div className="dark-stripes-teal p-6 md:p-8 rounded-[24px] border border-sky/30 relative overflow-hidden shadow-sky-medium mt-6">
                  <div className="absolute top-0 right-0 w-48 h-48 bg-sky/10 rounded-full blur-2xl pointer-events-none" />
                  <h2 className="text-lg font-black uppercase tracking-wide text-white border-b border-sky/30 pb-3 flex items-center gap-2">
                    <FileText className="h-5 w-5 text-sky" />
                    Keterangan Game {game.name}
                  </h2>
                  <p className="mt-4 text-sm font-medium leading-relaxed text-white/90">
                    {game.description}
                  </p>

                  <h3 className="mt-8 font-black uppercase tracking-widest text-xs text-white flex items-center gap-2">
                    <Shield className="h-4 w-4 text-sky" />
                    Syarat &amp; Ketentuan Pengisian
                  </h3>
                  <ol className="mt-4 list-decimal space-y-3 pl-5 text-xs text-white/80 font-medium">
                    <li>Harap teliti kembali nominal produk dan target ID akun Anda. Transaksi yang salah diinput di luar tanggung jawab pihak Mitsuru.</li>
                    <li>Proses distribusi top up diselesaikan secara otomatis dalam 10-60 detik segera setelah dana masuk.</li>
                  </ol>
                </div>
              )}
            </div>

            {/* Right Column Sidebar */}
            <aside className="space-y-6 lg:sticky lg:top-24 lg:self-start">

              {/* Reviews Card */}
              <div className="bg-[#183644]/90 backdrop-blur-md p-5 rounded-2xl border border-sky/30 relative overflow-hidden shadow-sky-medium">
                <h2 className="text-xs font-bold uppercase tracking-wider text-white/60 mb-3">Ulasan Pengguna</h2>
                <div className="flex items-center gap-4 bg-black/20 p-3 rounded-xl border border-sky/10">
                  <span className="text-4xl font-black text-sky font-mono leading-none">4.99</span>
                  <div>
                    <span className="text-amber-500 text-base leading-none block">★★★★★</span>
                    <p className="text-[10px] font-bold text-white/40 uppercase tracking-wider mt-1">Berdasarkan 870 rating terverifikasi</p>
                  </div>
                </div>
              </div>

              {/* CS Support Card */}
              <div
                onClick={() => router.push("https://wa.me/6285856457892")}
                className="bg-[#183644]/90 backdrop-blur-md p-5 rounded-2xl border border-sky/30 flex items-center gap-4 hover:border-sky/50 cursor-pointer transition-all duration-300 group shadow-sky-medium"
              >
                <span className="grid h-11 w-11 place-items-center rounded bg-sky/10 text-sky group-hover:bg-sky group-hover:text-white transition-colors">
                  <Headphones className="h-5 w-5" />
                </span>
                <div>
                  <p className="font-black text-white text-xs uppercase group-hover:text-sky transition-colors">Customer Service</p>
                  <p className="text-[10px] font-bold text-white/40 uppercase tracking-wider mt-0.5">Siap melayani keluhan 24/7 jam</p>
                </div>
              </div>

              {/* Selected Product Summary */}
              <div className="bg-[#183644]/90 backdrop-blur-md p-6 rounded-2xl border border-sky/30 relative overflow-hidden shadow-sky-medium">
                <h3 className="text-xs font-bold uppercase tracking-wider text-white border-b border-sky/30 pb-3">Ringkasan Invoice</h3>

                {selectedProduct ? (
                  <div className="mt-4 space-y-3.5 text-xs font-semibold">
                    <div className="flex justify-between items-center">
                      <span className="text-white/60 uppercase text-[10px] tracking-wider">Item Produk</span>
                      <span className="flex items-center gap-2 font-bold text-white">
                        <span className="flex h-7 w-7 items-center justify-center rounded bg-black/30 p-1 border border-sky/20">
                          <img
                            src={getItemAssetForProduct(selectedProduct.name, selectedProduct.provider_sku, game.name)}
                            alt=""
                            className="max-h-full max-w-full object-contain drop-shadow-md"
                          />
                        </span>
                        {selectedProduct.name}
                      </span>
                    </div>
                    {gameId && (
                      <div className="space-y-1.5 border-t border-sky/20 pt-3">
                        <div className="flex justify-between items-center">
                          <span className="text-white/60 uppercase text-[10px] tracking-wider">ID Akun</span>
                          <span className="font-mono text-white font-bold">{gameId} {serverId && `(${serverId})`}</span>
                        </div>
                        {verifiedNickname && (
                          <div className="flex justify-between items-center text-emerald-400">
                            <span className="uppercase text-[10px] tracking-wider font-bold">Nickname Player</span>
                            <span className="font-extrabold text-xs text-emerald-400 underline decoration-emerald-500">{verifiedNickname}</span>
                          </div>
                        )}
                      </div>
                    )}
                    {promoDiscount > 0 && (
                      <div className="flex justify-between items-center border-t border-sky/20 pt-3 text-emerald-400">
                        <span className="uppercase text-[10px] tracking-wider font-bold">Diskon Promo ({appliedPromoCode})</span>
                        <span className="font-mono font-bold">- Rp {promoDiscount.toLocaleString("id-ID")}</span>
                      </div>
                    )}
                    <div className="flex justify-between items-center border-t border-sky/30 pt-4">
                      <span className="text-white font-black uppercase text-xs">Total Tagihan</span>
                      <span className="text-lg font-black text-sky font-mono">
                        Rp {Math.max(1, (selectedProduct.sell_price * quantity) - promoDiscount).toLocaleString("id-ID")}
                      </span>
                    </div>
                  </div>
                ) : (
                  <p className="mt-4 text-xs text-white/40 text-center py-4 font-bold uppercase tracking-widest">
                    Silakan pilih nominal produk
                  </p>
                )}
              </div>

              {/* Submit Button with Shimmer */}
              <button
                onClick={handleOrder}
                disabled={!selectedProduct}
                className="w-full bg-sky text-white hover:bg-diamond py-3.5 text-xs font-black uppercase tracking-widest transition-colors flex items-center justify-center gap-2.5 rounded-xl shadow-sky-soft hover:shadow-sky-glow shimmer-hover disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ShoppingBag className="h-4.5 w-4.5" />
                Pesan &amp; Kirim Instan!
              </button>

            </aside>
          </div>

          </div>

          {/* Mobile Floating Sticky Checkout Bar */}
          {selectedProduct && (
            <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-[#102a36]/95 backdrop-blur-md border-t border-sky/40 p-3 sm:p-4 shadow-2xl animate-in slide-in-from-bottom duration-300">
              <div className="mx-auto max-w-lg flex items-center justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <span className="text-[10px] text-white/60 uppercase font-bold tracking-wider block truncate">
                    {selectedProduct.name}
                  </span>
                  <div className="flex items-baseline gap-2 mt-0.5">
                    <span className="text-base font-black text-sky font-mono leading-none">
                      Rp {Math.max(1, (selectedProduct.sell_price * quantity) - promoDiscount).toLocaleString("id-ID")}
                    </span>
                    {promoDiscount > 0 && (
                      <span className="text-[9px] font-bold text-emerald-400">
                        Hemat -Rp {promoDiscount.toLocaleString("id-ID")}
                      </span>
                    )}
                  </div>
                </div>
                <button
                  onClick={handleOrder}
                  className="bg-sky text-white hover:bg-diamond px-4 py-2.5 text-xs font-black uppercase tracking-wider rounded-xl shadow-sky-soft shimmer-hover shrink-0 flex items-center gap-1.5"
                >
                  <ShoppingBag className="h-4 w-4" />
                  Pesan Instan
                </button>
              </div>
            </div>
          )}
        </main>

        <Footer />
      </SidebarContentWrapper>
    </div>
  )
}
"use client"

import { useState } from "react"
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
  FileText
} from "lucide-react"
import { gameAssets, getItemAssetForProduct, paymentAssets } from "@/lib/assets"

interface Product {
  id: string
  name: string
  price: number
  sell_price: number
  provider_sku: string
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
  const [loginMethod, setLoginMethod] = useState("Pilih Login")
  const [requestNotes, setRequestNotes] = useState("")
  const [password, setPassword] = useState("")

  // Selection states
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(game.products[0] || null)
  const [quantity, setQuantity] = useState(1)
  const [paymentMethod, setPaymentMethod] = useState("QRIS")
  const [promoCode, setPromoCode] = useState("")
  const [whatsapp, setWhatsapp] = useState("")

  const handleOrder = () => {
    if (!selectedProduct) {
      alert("Silakan pilih nominal terlebih dahulu.")
      return
    }
    if (!gameId) {
      alert("Silakan masukkan ID Game Anda.")
      return
    }

    // Redirect to dynamic checkout/invoice route
    const target = serverId ? `${gameId} (${serverId})` : gameId
    router.push(
      `/checkout/${selectedProduct.provider_sku}?target=${target}&whatsapp=${whatsapp}&qty=${quantity}&payment=${paymentMethod.toLowerCase()}&promo=${promoCode}`
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

  const bannerBg = gameWallpapers[game.slug] || defaultWallpaper
  const publisher = getPublisher(game.slug)

  return (
    <div className="min-h-screen text-text-primary antialiased relative">

      <Header user={user} />

      <SidebarContentWrapper isAuthenticated={!!user}>
        <main className="relative z-10 py-8">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">

          {/* Game Header Banner Redesign */}
          <div className="relative mb-10 rounded-2xl border border-sky-border overflow-hidden bg-white shadow-lg shadow-sky-soft">

            {/* Banner background visual on the right */}
            <div className="absolute inset-0 z-0">
              <div
                className="absolute inset-0 md:inset-y-0 md:left-1/3 md:right-0 bg-cover bg-center"
                style={{ backgroundImage: `url('${bannerBg}')` }}
              />
              {/* Light gradient overlay from left to right */}
              <div className="absolute inset-0 bg-gradient-to-r from-white via-white/80 to-transparent z-10" />
              <div className="absolute inset-0 bg-gradient-to-t from-white via-transparent to-transparent z-10" />
            </div>

            {/* Banner Content Grid */}
            <div className="relative z-20 grid md:grid-cols-[240px_1fr] gap-8 p-6 md:p-8 pt-16 md:pt-20 items-end">

              {/* Cover Image */}
              <div className="relative overflow-hidden w-44 md:w-52 mx-auto md:mx-0 rounded-2xl border border-sky-border/40 shadow-sky-glow/10 h-60 md:h-64">
                <img
                  className="h-full w-full object-cover transition-transform duration-750 hover:scale-110"
                  src={game.image}
                  alt={game.name}
                />
              </div>

              {/* Title & Info Panel */}
              <div className="space-y-4 text-center md:text-left">
                <div>
                  <span className="text-[10px] font-black uppercase text-sky bg-sky/10 border border-sky/20 px-2.5 py-1 rounded">
                    Penyedia Resmi
                  </span>
                  <h1 className="text-3xl md:text-5xl font-black uppercase text-text-primary mt-3 tracking-tight">
                    {game.name}
                  </h1>
                  <p className="text-xs font-bold text-text-secondary uppercase tracking-widest mt-1">
                    Publisher: <span className="text-text-primary">{publisher}</span> • Kategori: <span className="text-sky">{game.category}</span>
                  </p>
                </div>

                {/* Sub-badges layout */}
                <div className="flex flex-wrap justify-center md:justify-start gap-3.5 pt-2">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-50 border border-amber-500/20 text-amber-500 text-[10px] font-black uppercase tracking-wider">
                    <Zap className="h-3.5 w-3.5 fill-amber-500/20" />
                    Proses Cepat
                  </span>
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-sky/10 border border-sky/20 text-sky text-[10px] font-black uppercase tracking-wider">
                    <MessagesSquare className="h-3.5 w-3.5 fill-sky/20" />
                    Layanan Chat 24/7
                  </span>
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 border border-emerald-500/20 text-emerald-500 text-[10px] font-black uppercase tracking-wider">
                    <BadgeCheck className="h-3.5 w-3.5 fill-emerald-500/20" />
                    Pembayaran Aman!
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Dynamic content grid */}
          <div className="grid gap-8 lg:grid-cols-[1fr_380px]">

            {/* Left Column Form */}
            <div className="space-y-6">

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
                  <div className="bg-white border border-sky-border rounded-[24px] shadow-sky-medium overflow-hidden">
                    <div className="p-4 bg-white border-b border-sky-border flex items-center gap-3">
                      <span className="grid h-7 w-7 place-items-center bg-sky text-white font-black text-xs rounded-lg">1</span>
                      <h3 className="text-xs font-black uppercase tracking-widest text-text-primary">Masukkan Data Akun</h3>
                    </div>

                    <div className="grid gap-5 p-6 sm:grid-cols-2 bg-white">
                      <div className="space-y-2">
                        <span className="block text-xs font-bold uppercase tracking-wider text-text-secondary">User ID <span className="text-sky">*</span></span>
                        <input
                          value={gameId}
                          onChange={(e) => setGameId(e.target.value)}
                          placeholder="Masukkan User ID"
                          className="w-full bg-white border border-sky-border hover:border-sky/40 focus:border-sky focus:ring-2 focus:ring-sky/20 transition-all rounded-xl px-4 py-2.5 text-sm text-text-primary placeholder-text-muted outline-none"
                          required
                        />
                      </div>

                      {/* Conditionally show Server ID for Mobile Legends */}
                      {game.slug === "mobile-legends" && (
                        <div className="space-y-2">
                          <span className="block text-xs font-bold uppercase tracking-wider text-text-secondary">Server ID <span className="text-sky">*</span></span>
                          <input
                            value={serverId}
                            onChange={(e) => setServerId(e.target.value)}
                            placeholder="Masukkan Server ID"
                            className="w-full bg-white border border-sky-border hover:border-sky/40 focus:border-sky focus:ring-2 focus:ring-sky/20 transition-all rounded-xl px-4 py-2.5 text-sm text-text-primary placeholder-text-muted outline-none"
                            required
                          />
                        </div>
                      )}

                      <div className="space-y-2">
                        <span className="block text-xs font-bold uppercase tracking-wider text-text-secondary">Email (Opsional)</span>
                        <input
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="name@email.com"
                          className="w-full bg-white border border-sky-border hover:border-sky/40 focus:border-sky focus:ring-2 focus:ring-sky/20 transition-all rounded-xl px-4 py-2.5 text-sm text-text-primary placeholder-text-muted outline-none"
                        />
                      </div>

                      <div className="space-y-2">
                        <span className="block text-xs font-bold uppercase tracking-wider text-text-secondary">Metode Login</span>
                        <select
                          value={loginMethod}
                          onChange={(e) => setLoginMethod(e.target.value)}
                          className="w-full bg-white border border-sky-border hover:border-sky/40 focus:border-sky focus:ring-2 focus:ring-sky/20 transition-all rounded-xl px-4 py-2.5 text-sm text-text-primary outline-none"
                        >
                          <option value="Pilih Login">Pilih Login</option>
                          <option value="Moonton">Moonton</option>
                          <option value="Facebook">Facebook</option>
                          <option value="Tiktok">Tiktok</option>
                          <option value="VK">VK</option>
                          <option value="Google">Google</option>
                        </select>
                      </div>

                      <div className="sm:col-span-2 space-y-2">
                        <span className="block text-xs font-bold uppercase tracking-wider text-text-secondary">Password (Khusus Joki Rank)</span>
                        <input
                          type="password"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="Masukkan password akun game Anda jika memesan Joki"
                          className="w-full bg-white border border-sky-border hover:border-sky/40 focus:border-sky focus:ring-2 focus:ring-sky/20 transition-all rounded-xl px-4 py-2.5 text-sm text-text-primary placeholder-text-muted outline-none"
                        />
                      </div>

                      <div className="sm:col-span-2 space-y-2">
                        <span className="block text-xs font-bold uppercase tracking-wider text-text-secondary">Catatan Khusus untuk Admin</span>
                        <input
                          value={requestNotes}
                          onChange={(e) => setRequestNotes(e.target.value)}
                          placeholder="Contoh: Tolong matikan verifikasi 2 langkah, push di jam malam saja"
                          className="w-full bg-white border border-sky-border hover:border-sky/40 focus:border-sky focus:ring-2 focus:ring-sky/20 transition-all rounded-xl px-4 py-2.5 text-sm text-text-primary placeholder-text-muted outline-none"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Step 2: Pilih Nominal */}
                  <div className="bg-white border border-sky-border rounded-[24px] shadow-sky-medium overflow-hidden">
                    <div className="p-4 bg-white border-b border-sky-border flex items-center gap-3">
                      <span className="grid h-7 w-7 place-items-center bg-sky text-white font-black text-xs rounded-lg">2</span>
                      <h3 className="text-xs font-black uppercase tracking-widest text-text-primary">Pilih Nominal Top Up</h3>
                    </div>

                    <div className="p-6 bg-white">
                      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                        {game.products.map((prod) => {
                          const originalPrice = Math.round(prod.sell_price * 1.25)
                          const discount = 20
                          const isSelected = selectedProduct?.id === prod.id
                          return (
                            <button
                              key={prod.id}
                              onClick={() => setSelectedProduct(prod)}
                              className={`w-full p-4 text-left group shimmer-hover rounded-[20px] transition-all duration-300 border ${
                                isSelected
                                  ? "border-sky bg-sky/[0.03] shadow-sky-soft scale-[1.02] ring-2 ring-sky/20"
                                  : "border-sky-border bg-white hover:border-sky/40 hover:-translate-y-0.5 shadow-sky-soft hover:shadow-sky-medium"
                              }`}
                              type="button"
                            >
                              <span className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-white p-1.5 border border-sky-border">
                                <img
                                  src={getItemAssetForProduct(prod.name, prod.provider_sku, game.name)}
                                  alt=""
                                  className="max-h-full max-w-full object-contain"
                                />
                              </span>
                              <span className="block font-black text-xs uppercase tracking-wide text-text-primary group-hover:text-sky transition-colors">{prod.name}</span>
                              <div className="mt-3 flex items-baseline justify-between">
                                <span className="text-base font-black text-sky font-mono">
                                  Rp {prod.sell_price.toLocaleString("id-ID")}
                                </span>
                                <span className="text-[10px] text-red-500 line-through font-mono">
                                  Rp {originalPrice.toLocaleString("id-ID")}
                                </span>
                              </div>
                              <span className={`inline-block px-1.5 py-0.5 rounded text-[8px] font-black uppercase tracking-wider mt-3 ${
                                isSelected ? "bg-sky text-white" : "bg-red-500/10 text-red-500"
                              }`}>
                                HEMAT {discount}%
                              </span>
                            </button>
                          )
                        })}
                      </div>
                    </div>
                  </div>

                  {/* Step 3: Jumlah Pembelian */}
                  <div className="bg-white border border-sky-border rounded-[24px] shadow-sky-medium overflow-hidden">
                    <div className="p-4 bg-white border-b border-sky-border flex items-center gap-3">
                      <span className="grid h-7 w-7 place-items-center bg-sky text-white font-black text-xs rounded-lg">3</span>
                      <h3 className="text-xs font-black uppercase tracking-widest text-text-primary">Tentukan Jumlah Pembelian</h3>
                    </div>

                    <div className="flex gap-3.5 p-6 bg-white items-center">
                      <input
                        type="number"
                        value={quantity}
                        onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                        className="w-16 bg-white border border-sky-border hover:border-sky/40 focus:border-sky focus:ring-2 focus:ring-sky/20 transition-all rounded-xl py-3 text-center text-sm font-bold text-text-primary outline-none"
                      />
                      <button
                        onClick={() => setQuantity((q) => q + 1)}
                        className="grid h-11 w-11 place-items-center rounded-xl bg-sky/10 hover:bg-sky text-sky hover:text-white border border-sky/20 transition-all hover:scale-105 active:scale-95"
                        type="button"
                      >
                        <Plus className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                        className="grid h-11 w-11 place-items-center rounded-xl bg-ice hover:bg-sky-border text-text-secondary hover:text-text-primary border border-sky-border/50 transition-all hover:scale-105 active:scale-95"
                        type="button"
                      >
                        <Minus className="h-5 w-5" />
                      </button>
                    </div>
                  </div>

                  {/* Step 4: Pilih Pembayaran */}
                  <div className="bg-white border border-sky-border rounded-[24px] shadow-sky-medium overflow-hidden">
                    <div className="p-4 bg-white border-b border-sky-border flex items-center gap-3">
                      <span className="grid h-7 w-7 place-items-center bg-sky text-white font-black text-xs rounded-lg">4</span>
                      <h3 className="text-xs font-black uppercase tracking-widest text-text-primary">Pilih Jalur Pembayaran</h3>
                    </div>

                    <div className="grid gap-4 p-6 md:grid-cols-3 bg-white">
                      {[
                        { id: "QRIS", desc: "Verifikasi Otomatis (Instan)", logo: paymentAssets.qris },
                        { id: "VA", desc: "Transfer Bank Virtual Account", logo: paymentAssets.dana },
                        { id: "E-Wallet", desc: "DANA, OVO, LinkAja, ShopeePay", logo: paymentAssets.gopay },
                      ].map((pm) => {
                        const isSelected = paymentMethod === pm.id
                        return (
                          <button
                            key={pm.id}
                            onClick={() => setPaymentMethod(pm.id)}
                            className={`w-full p-4 text-left group shimmer-hover rounded-[20px] transition-all duration-300 border flex flex-col justify-between ${
                              isSelected
                                ? "border-sky bg-sky/[0.03] shadow-sky-soft scale-[1.02] ring-2 ring-sky/20"
                                : "border-sky-border bg-white hover:border-sky/40 hover:-translate-y-0.5 shadow-sky-soft hover:shadow-sky-medium"
                            }`}
                            type="button"
                          >
                            <span className="mb-3 flex h-9 w-16 items-center justify-center rounded bg-white p-1.5 border border-sky-border">
                              <img src={pm.logo} alt={pm.id} className="max-h-full max-w-full object-contain" />
                            </span>
                            <strong className="block text-xs font-black uppercase tracking-wide text-text-primary group-hover:text-sky transition-colors">{pm.id}</strong>
                            <span className="mt-2 block text-[10px] text-text-muted font-semibold uppercase leading-normal">{pm.desc}</span>
                          </button>
                        )
                      })}
                    </div>
                  </div>

                  {/* Step 5: Kode Promo */}
                  <div className="bg-white border border-sky-border rounded-[24px] shadow-sky-medium overflow-hidden">
                    <div className="p-4 bg-white border-b border-sky-border flex items-center gap-3">
                      <span className="grid h-7 w-7 place-items-center bg-sky text-white font-black text-xs rounded-lg">5</span>
                      <h3 className="text-xs font-black uppercase tracking-widest text-text-primary">Gunakan Kode Promo</h3>
                    </div>

                    <div className="grid gap-4 p-6 sm:grid-cols-[1fr_auto] bg-white">
                      <input
                        value={promoCode}
                        onChange={(e) => setPromoCode(e.target.value)}
                        placeholder="Masukkan kode promo jika ada"
                        className="w-full bg-white border border-sky-border hover:border-sky/40 focus:border-sky focus:ring-2 focus:ring-sky/20 transition-all rounded-xl px-4 py-3 text-sm text-text-primary placeholder-text-muted outline-none"
                      />
                      <button
                        className="bg-white border border-sky-border hover:border-sky/40 rounded-xl px-6 py-3 text-xs font-black uppercase tracking-wider text-text-secondary hover:text-text-primary transition-colors hover:bg-sky/5 shadow-sky-soft"
                        type="button"
                      >
                        Pakai
                      </button>
                      <button
                        onClick={() => setPromoCode("PROMO-MHS")}
                        className="sm:col-span-2 rounded-lg border border-dashed border-sky/20 hover:border-sky/40 bg-sky/[0.02] hover:bg-sky/[0.05] p-3 text-left text-xs font-black text-sky uppercase tracking-widest transition-all duration-300"
                        type="button"
                      >
                        Dapatkan Diskon Tambahan 5%: PROMO-MHS
                      </button>
                    </div>
                  </div>

                  {/* Step 6: Detail Kontak */}
                  <div className="bg-white border border-sky-border rounded-[24px] shadow-sky-medium overflow-hidden">
                    <div className="p-4 bg-white border-b border-sky-border flex items-center gap-3">
                      <span className="grid h-7 w-7 place-items-center bg-sky text-white font-black text-xs rounded-lg">6</span>
                      <h3 className="text-xs font-black uppercase tracking-widest text-text-primary">Detail Kontak WhatsApp</h3>
                    </div>

                    <div className="p-6 space-y-4 bg-white">
                      <div className="space-y-2">
                        <span className="block text-xs font-bold uppercase tracking-wider text-text-secondary">No. WhatsApp Aktif <span className="text-sky">*</span></span>
                        <div className="grid grid-cols-[80px_1fr] gap-3">
                          <span className="rounded-xl bg-white border border-sky-border flex items-center justify-center font-bold text-text-muted text-xs">ID (+62)</span>
                          <input
                            value={whatsapp}
                            onChange={(e) => setWhatsapp(e.target.value)}
                            placeholder="81234567890"
                            className="w-full bg-white border border-sky-border hover:border-sky/40 focus:border-sky focus:ring-2 focus:ring-sky/20 transition-all rounded-xl px-4 py-3 text-sm text-text-primary placeholder-text-muted outline-none"
                            required
                          />
                        </div>
                      </div>
                      <p className="text-[10px] text-text-muted font-bold uppercase tracking-wide">
                        *Bukti status pengiriman dan kwitansi invoice akan dikirimkan otomatis ke WhatsApp Anda.
                      </p>
                    </div>
                  </div>
                </>
              ) : (
                /* Description & Rules Tab */
                <div className="glass-sky p-6 md:p-8 rounded-2xl border-sky-border relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-48 h-48 bg-sky/5 rounded-full blur-2xl pointer-events-none" />
                  <h2 className="text-lg font-black uppercase tracking-wide text-text-primary border-b border-sky-border/50 pb-3 flex items-center gap-2">
                    <FileText className="h-5 w-5 text-sky" />
                    Keterangan Game {game.name}
                  </h2>
                  <p className="mt-4 text-xs font-medium leading-relaxed text-text-secondary">
                    {game.description}
                  </p>

                  <h3 className="mt-8 font-black uppercase tracking-widest text-xs text-text-primary flex items-center gap-2">
                    <Shield className="h-4 w-4 text-sky" />
                    Syarat &amp; Ketentuan Pengisian
                  </h3>
                  <ol className="mt-4 list-decimal space-y-3 pl-5 text-xs text-text-muted font-medium">
                    <li>Harap teliti kembali nominal produk dan target ID akun Anda. Transaksi yang salah diinput di luar tanggung jawab pihak Mitsuru.</li>
                    <li>Proses distribusi top up diselesaikan secara otomatis dalam 10-60 detik segera setelah dana masuk.</li>
                    <li>Untuk transaksi Joki Rank ML, mohon jangan membuka akun game selama proses pengerjaan oleh penjoki untuk menghindari kegagalan pengerjaan.</li>
                  </ol>
                </div>
              )}
            </div>

            {/* Right Column Sidebar */}
            <aside className="space-y-6 lg:sticky lg:top-24 lg:self-start">

              {/* Reviews Card */}
              <div className="glass-sky p-5 rounded-2xl border-sky-border relative overflow-hidden">
                <h2 className="text-xs font-bold uppercase tracking-wider text-text-muted mb-3">Ulasan Pengguna</h2>
                <div className="flex items-center gap-4 bg-white/60 p-3 rounded-xl border border-sky-border/50">
                  <span className="text-4xl font-black text-sky font-mono leading-none">4.99</span>
                  <div>
                    <span className="text-amber-500 text-base leading-none block">★★★★★</span>
                    <p className="text-[10px] font-bold text-text-muted uppercase tracking-wider mt-1">Berdasarkan 870 rating terverifikasi</p>
                  </div>
                </div>
              </div>

              {/* CS Support Card */}
              <div
                onClick={() => router.push("https://wa.me/6281234567890")}
                className="glass-sky p-5 rounded-2xl border-sky-border flex items-center gap-4 hover:border-sky/30 cursor-pointer transition-all duration-300 group"
              >
                <span className="grid h-11 w-11 place-items-center rounded bg-sky/10 text-sky group-hover:bg-sky group-hover:text-white transition-colors">
                  <Headphones className="h-5 w-5" />
                </span>
                <div>
                  <p className="font-black text-text-primary text-xs uppercase group-hover:text-sky transition-colors">Customer Service</p>
                  <p className="text-[10px] font-bold text-text-muted uppercase tracking-wider mt-0.5">Siap melayani keluhan 24/7 jam</p>
                </div>
              </div>

              {/* Selected Product Summary */}
              <div className="glass-sky p-6 rounded-2xl border border-sky-border relative overflow-hidden">
                <h3 className="text-xs font-bold uppercase tracking-wider text-text-primary border-b border-sky-border/50 pb-3">Ringkasan Invoice</h3>

                {selectedProduct ? (
                  <div className="mt-4 space-y-3.5 text-xs font-semibold">
                    <div className="flex justify-between items-center">
                      <span className="text-text-muted uppercase text-[10px] tracking-wider">Item Produk</span>
                      <span className="flex items-center gap-2 font-bold text-text-primary">
                        <span className="flex h-7 w-7 items-center justify-center rounded bg-white p-1 border border-sky-border">
                          <img
                            src={getItemAssetForProduct(selectedProduct.name, selectedProduct.provider_sku, game.name)}
                            alt=""
                            className="max-h-full max-w-full object-contain"
                          />
                        </span>
                        {selectedProduct.name}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-text-muted uppercase text-[10px] tracking-wider">Jumlah</span>
                      <span className="font-mono text-sky font-bold bg-sky/10 px-2 py-0.5 rounded">x{quantity}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-text-muted uppercase text-[10px] tracking-wider">Jalur Bayar</span>
                      <span className="font-bold text-text-primary uppercase">{paymentMethod}</span>
                    </div>
                    {gameId && (
                      <div className="flex justify-between items-center border-t border-sky-border/50 pt-3">
                        <span className="text-text-muted uppercase text-[10px] tracking-wider">ID Akun</span>
                        <span className="font-mono text-text-primary font-bold">{gameId} {serverId && `(${serverId})`}</span>
                      </div>
                    )}
                    <div className="flex justify-between items-center border-t border-sky-border pt-4">
                      <span className="text-text-primary font-black uppercase text-xs">Total Tagihan</span>
                      <span className="text-lg font-black text-sky font-mono">
                        Rp {(selectedProduct.sell_price * quantity).toLocaleString("id-ID")}
                      </span>
                    </div>
                  </div>
                ) : (
                  <p className="mt-4 text-xs text-text-muted text-center py-4 font-bold uppercase tracking-widest">
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
        </main>

        <Footer />
      </SidebarContentWrapper>
    </div>
  )
}
"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
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
    <div className="min-h-screen text-slate-100 antialiased relative">
      {/* Mesh Background */}
      <div className="pointer-events-none fixed inset-0 mesh opacity-45 z-0"></div>

      <Header user={user} />

      <main className="relative z-10 mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        
        {/* Game Header Banner Redesign */}
        <div className="relative mb-10 rounded-2xl border border-white/10 overflow-hidden bg-slate-950/60 shadow-lg shadow-cyan-300/5">
          
          {/* Banner background visual on the right */}
          <div className="absolute inset-0 z-0">
            <div 
              className="absolute inset-0 md:inset-y-0 md:left-1/3 md:right-0 bg-cover bg-center"
              style={{ backgroundImage: `url('${bannerBg}')` }}
            />
            {/* Dark gradient overlay from left to right */}
            <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/80 to-transparent z-10" />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent z-10" />
          </div>

          {/* Banner Content Grid */}
          <div className="relative z-20 grid md:grid-cols-[240px_1fr] gap-8 p-6 md:p-8 pt-16 md:pt-20 items-end">
            
            {/* Beveled Tilted Cover Image */}
            <div className="relative p-[1px] bg-gradient-to-tr from-cyan-300/40 to-blue-500/40 shadow-neon-cyan/20 w-44 md:w-52 mx-auto md:mx-0" style={bevelStyle}>
              <div className="overflow-hidden w-full h-60 md:h-64" style={bevelStyle}>
                <img 
                  className="h-full w-full object-cover transition-transform duration-750 hover:scale-110" 
                  src={game.image} 
                  alt={game.name} 
                />
              </div>
            </div>

            {/* Title & Info Panel */}
            <div className="space-y-4 text-center md:text-left">
              <div>
                <span className="text-[10px] font-black uppercase text-cyan-300 bg-cyan-300/10 border border-cyan-300/20 px-2.5 py-1 rounded" style={tagBevelStyle}>
                  Penyedia Resmi
                </span>
                <h1 className="text-3xl md:text-5xl font-black uppercase text-white mt-3 tracking-tight">
                  {game.name}
                </h1>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">
                  Publisher: <span className="text-white">{publisher}</span> • Kategori: <span className="text-cyan-300">{game.category}</span>
                </p>
              </div>

              {/* Sub-badges layout */}
              <div className="flex flex-wrap justify-center md:justify-start gap-3.5 pt-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-yellow-500/10 border border-yellow-500/20 text-yellow-400 text-[10px] font-black uppercase tracking-wider">
                  <Zap className="h-3.5 w-3.5 fill-yellow-400/20" />
                  Proses Cepat
                </span>
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-[10px] font-black uppercase tracking-wider">
                  <MessagesSquare className="h-3.5 w-3.5 fill-cyan-400/20" />
                  Layanan Chat 24/7
                </span>
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-black uppercase tracking-wider">
                  <BadgeCheck className="h-3.5 w-3.5 fill-emerald-400/20" />
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
            <div className="flex overflow-hidden border-b border-white/10 text-xs font-black uppercase tracking-wider gap-1">
              <button 
                onClick={() => setActiveTab("transaksi")}
                className={`px-6 py-2.5 transition-all duration-300 ${
                  activeTab === "transaksi" 
                    ? "bg-cyan-300 text-ink shadow-lg shadow-cyan-300/10" 
                    : "bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white"
                }`}
                style={tabBevelStyle}
              >
                Form Transaksi
              </button>
              <button 
                onClick={() => setActiveTab("keterangan")}
                className={`px-6 py-2.5 transition-all duration-300 ${
                  activeTab === "keterangan" 
                    ? "bg-cyan-300 text-ink shadow-lg shadow-cyan-300/10" 
                    : "bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white"
                }`}
                style={tabBevelStyle}
              >
                Informasi Game
              </button>
            </div>

            {activeTab === "transaksi" ? (
              <>
                {/* Step 1: Input Akun */}
                <div className="relative p-[1px] bg-white/10 rounded-2xl overflow-hidden shadow-md">
                  <div className="p-4 bg-slate-950/80 border-b border-white/5 flex items-center gap-3">
                    <span className="grid h-7 w-7 place-items-center bg-cyan-300 text-ink font-black text-xs" style={tagBevelStyle}>1</span>
                    <h3 className="text-xs font-black uppercase tracking-widest text-white">Masukkan Data Akun</h3>
                  </div>
                  
                  <div className="grid gap-5 p-6 sm:grid-cols-2 bg-slate-950/40">
                    <div className="space-y-2">
                      <span className="block text-xs font-bold uppercase tracking-wider text-slate-300">User ID <span className="text-cyan-300">*</span></span>
                      <div className="relative p-[1px] bg-white/10 focus-within:bg-cyan-300 transition-colors" style={inputBevelStyle}>
                        <input 
                          value={gameId}
                          onChange={(e) => setGameId(e.target.value)}
                          placeholder="Masukkan User ID" 
                          className="w-full bg-slate-950 px-4 py-2.5 text-sm text-white placeholder-slate-600 outline-none" 
                          style={inputBevelStyle}
                          required
                        />
                      </div>
                    </div>
                    
                    {/* Conditionally show Server ID for Mobile Legends */}
                    {game.slug === "mobile-legends" && (
                      <div className="space-y-2">
                        <span className="block text-xs font-bold uppercase tracking-wider text-slate-300">Server ID <span className="text-cyan-300">*</span></span>
                        <div className="relative p-[1px] bg-white/10 focus-within:bg-cyan-300 transition-colors" style={inputBevelStyle}>
                          <input 
                            value={serverId}
                            onChange={(e) => setServerId(e.target.value)}
                            placeholder="Masukkan Server ID" 
                            className="w-full bg-slate-950 px-4 py-2.5 text-sm text-white placeholder-slate-600 outline-none" 
                            style={inputBevelStyle}
                            required
                          />
                        </div>
                      </div>
                    )}

                    <div className="space-y-2">
                      <span className="block text-xs font-bold uppercase tracking-wider text-slate-300">Email (Opsional)</span>
                      <div className="relative p-[1px] bg-white/10 focus-within:bg-cyan-300 transition-colors" style={inputBevelStyle}>
                        <input 
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="name@email.com" 
                          className="w-full bg-slate-950 px-4 py-2.5 text-sm text-white placeholder-slate-600 outline-none" 
                          style={inputBevelStyle}
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <span className="block text-xs font-bold uppercase tracking-wider text-slate-300">Metode Login</span>
                      <div className="relative p-[1px] bg-white/10 focus-within:bg-cyan-300 transition-colors" style={inputBevelStyle}>
                        <select 
                          value={loginMethod}
                          onChange={(e) => setLoginMethod(e.target.value)}
                          className="w-full bg-slate-950 px-4 py-2.5 text-sm text-white outline-none"
                          style={inputBevelStyle}
                        >
                          <option value="Pilih Login" className="bg-slate-950">Pilih Login</option>
                          <option value="Moonton" className="bg-slate-950">Moonton</option>
                          <option value="Facebook" className="bg-slate-950">Facebook</option>
                          <option value="Tiktok" className="bg-slate-950">Tiktok</option>
                          <option value="VK" className="bg-slate-950">VK</option>
                          <option value="Google" className="bg-slate-950">Google</option>
                        </select>
                      </div>
                    </div>

                    <div className="sm:col-span-2 space-y-2">
                      <span className="block text-xs font-bold uppercase tracking-wider text-slate-300">Password (Khusus Joki Rank)</span>
                      <div className="relative p-[1px] bg-white/10 focus-within:bg-cyan-300 transition-colors" style={inputBevelStyle}>
                        <input 
                          type="password"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="Masukkan password akun game Anda jika memesan Joki" 
                          className="w-full bg-slate-950 px-4 py-2.5 text-sm text-white placeholder-slate-600 outline-none" 
                          style={inputBevelStyle}
                        />
                      </div>
                    </div>

                    <div className="sm:col-span-2 space-y-2">
                      <span className="block text-xs font-bold uppercase tracking-wider text-slate-300">Catatan Khusus untuk Admin</span>
                      <div className="relative p-[1px] bg-white/10 focus-within:bg-cyan-300 transition-colors" style={inputBevelStyle}>
                        <input 
                          value={requestNotes}
                          onChange={(e) => setRequestNotes(e.target.value)}
                          placeholder="Contoh: Tolong matikan verifikasi 2 langkah, push di jam malam saja" 
                          className="w-full bg-slate-950 px-4 py-2.5 text-sm text-white placeholder-slate-600 outline-none" 
                          style={inputBevelStyle}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Step 2: Pilih Nominal */}
                <div className="relative p-[1px] bg-white/10 rounded-2xl overflow-hidden shadow-md">
                  <div className="p-4 bg-slate-950/80 border-b border-white/5 flex items-center gap-3">
                    <span className="grid h-7 w-7 place-items-center bg-cyan-300 text-ink font-black text-xs" style={tagBevelStyle}>2</span>
                    <h3 className="text-xs font-black uppercase tracking-widest text-white">Pilih Nominal Top Up</h3>
                  </div>
                  
                  <div className="p-6 bg-slate-950/40">
                    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                      {game.products.map((prod) => {
                        const originalPrice = Math.round(prod.sell_price * 1.25)
                        const discount = 20
                        const isSelected = selectedProduct?.id === prod.id
                        return (
                          <div key={prod.id} className={`relative p-[1px] transition-all duration-300 ${isSelected ? "bg-gradient-to-r from-cyan-300 to-blue-500 shadow-neon-cyan/20 scale-[1.02]" : "bg-white/5 hover:bg-white/10"}`} style={cardBevelStyle}>
                            <button 
                              onClick={() => setSelectedProduct(prod)}
                              className="w-full bg-slate-950 p-4 text-left group shimmer-hover"
                              style={cardBevelStyle}
                              type="button"
                            >
                              <span className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-white p-1.5">
                                <img
                                  src={getItemAssetForProduct(prod.name, prod.provider_sku, game.name)}
                                  alt=""
                                  className="max-h-full max-w-full object-contain"
                                />
                              </span>
                              <span className="block font-black text-xs uppercase tracking-wide text-white group-hover:text-cyan-300 transition-colors">{prod.name}</span>
                              <div className="mt-3 flex items-baseline justify-between">
                                <span className="text-base font-black text-cyan-300 font-mono">
                                  Rp {prod.sell_price.toLocaleString("id-ID")}
                                </span>
                                <span className="text-[10px] text-pink-500 line-through font-mono">
                                  Rp {originalPrice.toLocaleString("id-ID")}
                                </span>
                              </div>
                              <span className={`inline-block px-1.5 py-0.5 rounded text-[8px] font-black uppercase tracking-wider mt-3 ${
                                isSelected ? "bg-cyan-300 text-ink" : "bg-pink-500/20 text-pink-400"
                              }`} style={tagBevelStyle}>
                                HEMAT {discount}%
                              </span>
                            </button>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                </div>

                {/* Step 3: Jumlah Pembelian */}
                <div className="relative p-[1px] bg-white/10 rounded-2xl overflow-hidden shadow-md">
                  <div className="p-4 bg-slate-950/80 border-b border-white/5 flex items-center gap-3">
                    <span className="grid h-7 w-7 place-items-center bg-cyan-300 text-ink font-black text-xs" style={tagBevelStyle}>3</span>
                    <h3 className="text-xs font-black uppercase tracking-widest text-white">Tentukan Jumlah Pembelian</h3>
                  </div>
                  
                  <div className="flex gap-3.5 p-6 bg-slate-950/40 items-center">
                    <div className="relative p-[1px] bg-white/10" style={inputBevelStyle}>
                      <input 
                        type="number"
                        value={quantity}
                        onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                        className="w-16 bg-slate-950 py-3 text-center text-sm font-bold text-white outline-none" 
                        style={inputBevelStyle}
                      />
                    </div>
                    <button 
                      onClick={() => setQuantity((q) => q + 1)}
                      className="grid h-11 w-11 place-items-center rounded bg-cyan-300/10 hover:bg-cyan-300 text-cyan-300 hover:text-ink border border-cyan-300/20 transition-all hover:scale-105 active:scale-95"
                      type="button"
                    >
                      <Plus className="h-5 w-5" />
                    </button>
                    <button 
                      onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                      className="grid h-11 w-11 place-items-center rounded bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white border border-white/10 transition-all hover:scale-105 active:scale-95"
                      type="button"
                    >
                      <Minus className="h-5 w-5" />
                    </button>
                  </div>
                </div>

                {/* Step 4: Pilih Pembayaran */}
                <div className="relative p-[1px] bg-white/10 rounded-2xl overflow-hidden shadow-md">
                  <div className="p-4 bg-slate-950/80 border-b border-white/5 flex items-center gap-3">
                    <span className="grid h-7 w-7 place-items-center bg-cyan-300 text-ink font-black text-xs" style={tagBevelStyle}>4</span>
                    <h3 className="text-xs font-black uppercase tracking-widest text-white">Pilih Jalur Pembayaran</h3>
                  </div>
                  
                  <div className="grid gap-4 p-6 md:grid-cols-3 bg-slate-950/40">
                    {[
                      { id: "QRIS", desc: "Verifikasi Otomatis (Instan)", logo: paymentAssets.qris },
                      { id: "VA", desc: "Transfer Bank Virtual Account", logo: paymentAssets.dana },
                      { id: "E-Wallet", desc: "DANA, OVO, LinkAja, ShopeePay", logo: paymentAssets.gopay },
                    ].map((pm) => {
                      const isSelected = paymentMethod === pm.id
                      return (
                        <div key={pm.id} className={`relative p-[1px] transition-all duration-300 ${isSelected ? "bg-gradient-to-r from-cyan-300 to-blue-500 shadow-neon-cyan/10" : "bg-white/5 hover:bg-white/10"}`} style={cardBevelStyle}>
                          <button 
                            onClick={() => setPaymentMethod(pm.id)}
                            className="w-full bg-slate-950 p-4 text-left group shimmer-hover h-full flex flex-col justify-between"
                            style={cardBevelStyle}
                            type="button"
                          >
                            <span className="mb-3 flex h-9 w-16 items-center justify-center rounded bg-white p-1.5">
                              <img src={pm.logo} alt={pm.id} className="max-h-full max-w-full object-contain" />
                            </span>
                            <strong className="block text-xs font-black uppercase tracking-wide text-white group-hover:text-cyan-300 transition-colors">{pm.id}</strong>
                            <span className="mt-2 block text-[10px] text-slate-500 font-semibold uppercase leading-normal">{pm.desc}</span>
                          </button>
                        </div>
                      )
                    })}
                  </div>
                </div>

                {/* Step 5: Kode Promo */}
                <div className="relative p-[1px] bg-white/10 rounded-2xl overflow-hidden shadow-md">
                  <div className="p-4 bg-slate-950/80 border-b border-white/5 flex items-center gap-3">
                    <span className="grid h-7 w-7 place-items-center bg-cyan-300 text-ink font-black text-xs" style={tagBevelStyle}>5</span>
                    <h3 className="text-xs font-black uppercase tracking-widest text-white">Gunakan Kode Promo</h3>
                  </div>
                  
                  <div className="grid gap-4 p-6 sm:grid-cols-[1fr_auto] bg-slate-950/40">
                    <div className="relative p-[1px] bg-white/10 focus-within:bg-cyan-300 transition-colors" style={inputBevelStyle}>
                      <input 
                        value={promoCode}
                        onChange={(e) => setPromoCode(e.target.value)}
                        placeholder="Masukkan kode promo jika ada" 
                        className="w-full bg-slate-950 px-4 py-3 text-sm text-white placeholder-slate-600 outline-none" 
                        style={inputBevelStyle}
                      />
                    </div>
                    <div className="relative p-[1px] bg-white/10 hover:bg-cyan-300/30 transition-all duration-300" style={inputBevelStyle}>
                      <button className="bg-slate-950 px-6 py-3 text-xs font-black uppercase tracking-wider text-slate-300 hover:text-white transition-colors" style={inputBevelStyle} type="button">
                        Pakai
                      </button>
                    </div>
                    <button 
                      onClick={() => setPromoCode("PROMO-MHS")}
                      className="sm:col-span-2 rounded-lg border border-dashed border-cyan-300/20 hover:border-cyan-300/40 bg-cyan-300/[0.02] hover:bg-cyan-300/[0.05] p-3 text-left text-xs font-black text-cyan-300 uppercase tracking-widest transition-all duration-300"
                      type="button"
                    >
                      Dapatkan Diskon Tambahan 5%: PROMO-MHS
                    </button>
                  </div>
                </div>

                {/* Step 6: Detail Kontak */}
                <div className="relative p-[1px] bg-white/10 rounded-2xl overflow-hidden shadow-md">
                  <div className="p-4 bg-slate-950/80 border-b border-white/5 flex items-center gap-3">
                    <span className="grid h-7 w-7 place-items-center bg-cyan-300 text-ink font-black text-xs" style={tagBevelStyle}>6</span>
                    <h3 className="text-xs font-black uppercase tracking-widest text-white">Detail Kontak WhatsApp</h3>
                  </div>
                  
                  <div className="p-6 space-y-4 bg-slate-950/40">
                    <div className="space-y-2">
                      <span className="block text-xs font-bold uppercase tracking-wider text-slate-300">No. WhatsApp Aktif <span className="text-cyan-300">*</span></span>
                      <div className="grid grid-cols-[80px_1fr] gap-3">
                        <span className="rounded-lg bg-slate-900 border border-white/10 flex items-center justify-center font-bold text-slate-400 text-xs">ID (+62)</span>
                        <div className="relative p-[1px] bg-white/10 focus-within:bg-cyan-300 transition-colors" style={inputBevelStyle}>
                          <input 
                            value={whatsapp}
                            onChange={(e) => setWhatsapp(e.target.value)}
                            placeholder="81234567890" 
                            className="w-full bg-slate-950 px-4 py-3 text-sm text-white placeholder-slate-600 outline-none" 
                            style={inputBevelStyle}
                            required
                          />
                        </div>
                      </div>
                    </div>
                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wide">
                      *Bukti status pengiriman dan kwitansi invoice akan dikirimkan otomatis ke WhatsApp Anda.
                    </p>
                  </div>
                </div>
              </>
            ) : (
              /* Description & Rules Tab */
              <div className="glass p-6 md:p-8 rounded-2xl border-white/10 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-48 h-48 bg-cyan-300/5 rounded-full blur-2xl pointer-events-none" />
                <h2 className="text-lg font-black uppercase tracking-wide text-white border-b border-white/5 pb-3 flex items-center gap-2">
                  <FileText className="h-5 w-5 text-cyan-300" />
                  Keterangan Game {game.name}
                </h2>
                <p className="mt-4 text-xs font-medium leading-relaxed text-slate-300">
                  {game.description}
                </p>
                
                <h3 className="mt-8 font-black uppercase tracking-widest text-xs text-white flex items-center gap-2">
                  <Shield className="h-4 w-4 text-cyan-300" />
                  Syarat &amp; Ketentuan Pengisian
                </h3>
                <ol className="mt-4 list-decimal space-y-3 pl-5 text-xs text-slate-400 font-medium">
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
            <div className="glass p-5 rounded-2xl border-white/10 relative overflow-hidden">
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">Ulasan Pengguna</h2>
              <div className="flex items-center gap-4 bg-slate-950/45 p-3 rounded-xl border border-white/5">
                <span className="text-4xl font-black text-cyan-300 font-mono leading-none">4.99</span>
                <div>
                  <span className="text-yellow-400 text-base leading-none block">★★★★★</span>
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mt-1">Berdasarkan 870 rating terverifikasi</p>
                </div>
              </div>
            </div>

            {/* CS Support Card */}
            <div 
              onClick={() => router.push("https://wa.me/6281234567890")}
              className="glass p-5 rounded-2xl border-white/10 flex items-center gap-4 hover:border-cyan-300/30 cursor-pointer transition-all duration-300 group"
            >
              <span className="grid h-11 w-11 place-items-center rounded bg-cyan-300/10 text-cyan-300 group-hover:bg-cyan-300 group-hover:text-ink transition-colors">
                <Headphones className="h-5 w-5" />
              </span>
              <div>
                <p className="font-black text-white text-xs uppercase group-hover:text-cyan-300 transition-colors">Customer Service</p>
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mt-0.5">Siap melayani keluhan 24/7 jam</p>
              </div>
            </div>

            {/* Selected Product Summary */}
            <div className="glass p-6 rounded-2xl border border-white/10 relative overflow-hidden">
              <h3 className="text-xs font-bold uppercase tracking-wider text-white border-b border-white/5 pb-3">Ringkasan Invoice</h3>
              
              {selectedProduct ? (
                <div className="mt-4 space-y-3.5 text-xs font-semibold">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500 uppercase text-[10px] tracking-wider">Item Produk</span>
                    <span className="flex items-center gap-2 font-bold text-white">
                      <span className="flex h-7 w-7 items-center justify-center rounded bg-white p-1">
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
                    <span className="text-slate-500 uppercase text-[10px] tracking-wider">Jumlah</span>
                    <span className="font-mono text-cyan-300 font-bold bg-white/5 px-2 py-0.5 rounded">x{quantity}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500 uppercase text-[10px] tracking-wider">Jalur Bayar</span>
                    <span className="font-bold text-white uppercase">{paymentMethod}</span>
                  </div>
                  {gameId && (
                    <div className="flex justify-between items-center border-t border-white/5 pt-3">
                      <span className="text-slate-500 uppercase text-[10px] tracking-wider">ID Akun</span>
                      <span className="font-mono text-white font-bold">{gameId} {serverId && `(${serverId})`}</span>
                    </div>
                  )}
                  <div className="flex justify-between items-center border-t border-white/10 pt-4">
                    <span className="text-white font-black uppercase text-xs">Total Tagihan</span>
                    <span className="text-lg font-black text-cyan-300 font-mono">
                      Rp {(selectedProduct.sell_price * quantity).toLocaleString("id-ID")}
                    </span>
                  </div>
                </div>
              ) : (
                <p className="mt-4 text-xs text-slate-500 text-center py-4 font-bold uppercase tracking-widest">
                  Silakan pilih nominal produk
                </p>
              )}
            </div>

            {/* Submit Button with Shimmer */}
            <div className="relative p-[1px] bg-gradient-to-r from-cyan-300/40 to-blue-500/40 hover:from-cyan-300 hover:to-blue-500 transition-all duration-300 shadow-lg shadow-cyan-300/5 hover:shadow-cyan-300/20" style={bevelStyle}>
              <button 
                onClick={handleOrder}
                disabled={!selectedProduct}
                className="w-full bg-slate-950/90 py-3.5 text-xs font-black uppercase tracking-widest text-cyan-300 hover:text-white transition-colors flex items-center justify-center gap-2.5 shimmer-hover"
                style={bevelStyle}
              >
                <ShoppingBag className="h-4.5 w-4.5" />
                Pesan &amp; Kirim Instan!
              </button>
            </div>

          </aside>
        </div>

      </main>

      <Footer />
    </div>
  )
}

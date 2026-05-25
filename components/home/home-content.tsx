"use client"

import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import {
  Zap,
  ChevronLeft,
  ChevronRight,
  ShoppingBag,
  Headphones,
  Flame,
} from "lucide-react"

interface HomeContentProps {
  user?: {
    name: string
    email: string
    role: string
  } | null
}

const slides = [
  {
    tag: "Promo Akun Aman",
    title: "Cari akun FF dan ML?",
    desc: "Topup, voucher, dan layanan game dengan proses cepat, aman, dan bergaransi.",
    bg: "https://images.unsplash.com/photo-1600861195091-690c92f1d2cc?auto=format&fit=crop&w=1800&q=85",
    btn1: "Topup Sekarang",
    btn2: "Cek Pesanan",
  },
  {
    tag: "Event Mingguan",
    title: "Diamond murah untuk push rank.",
    desc: "Pilih nominal favorit, bayar QRIS, lalu sistem otomatis mengirim order to provider.",
    bg: "https://images.unsplash.com/photo-1542751110-97427bbecf20?auto=format&fit=crop&w=1800&q=85",
    btn1: "Lihat Produk",
    btn2: "Hitung Profit",
  },
  {
    tag: "Voucher Digital",
    title: "Roblox, Steam, dan live app.",
    desc: "Katalog bisa dipisah per kategori agar user cepat menemukan produk yang mereka cari.",
    bg: "https://images.unsplash.com/photo-1511882150382-421056c89033?auto=format&fit=crop&w=1800&q=85",
    btn1: "Buka Katalog",
    btn2: "Leaderboard",
  },
]

const diagonalCards = [
  { name: "Free Fire", publisher: "Garena", image: "https://images.unsplash.com/photo-1605901309584-818e25960a8f?auto=format&fit=crop&w=300&q=80", slug: "free-fire" },
  { name: "Mobile Legends", publisher: "Moonton", image: "https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&w=300&q=80", slug: "mobile-legends" },
  { name: "Joki Rank", publisher: "KampusTopup", image: "https://images.unsplash.com/photo-1616588589676-62b3bd4ff6d2?auto=format&fit=crop&w=300&q=80", slug: "mobile-legends" },
  { name: "ROBLOX - Voucher", publisher: "Roblox Corporation", image: "https://images.unsplash.com/photo-1611996575749-79a3a250f948?auto=format&fit=crop&w=300&q=80", slug: "roblox" },
  { name: "Honor Of Kings", publisher: "Tencent Games", image: "https://images.unsplash.com/photo-1593305841991-05c297ba4575?auto=format&fit=crop&w=300&q=80", slug: "honor-of-kings" },
  { name: "Valorant", publisher: "Riot Games", image: "https://images.unsplash.com/photo-1542751110-97427bbecf20?auto=format&fit=crop&w=300&q=80", slug: "valorant" },
]

const catalogItems = [
  { title: "FREE FIRE", eyebrow: "TOP UP GAME", publisher: "Garena", bg: "https://images.unsplash.com/photo-1605901309584-818e25960a8f?auto=format&fit=crop&w=500&q=80", tab: "all", slug: "free-fire" },
  { title: "MOBILE LEGENDS", eyebrow: "TOP UP GAME", publisher: "Moonton", bg: "https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&w=500&q=80", tab: "all", slug: "mobile-legends" },
  { title: "JOKI RANK", eyebrow: "JOKI MOBILE LEGENDS", publisher: "KampusTopup", bg: "https://images.unsplash.com/photo-1616588589676-62b3bd4ff6d2?auto=format&fit=crop&w=500&q=80", tab: "all", slug: "mobile-legends" },
  { title: "MAGIC CHESS", eyebrow: "TOP UP GAME", publisher: "Moonton", bg: "https://images.unsplash.com/photo-1593305841991-05c297ba4575?auto=format&fit=crop&w=500&q=80", tab: "all", slug: "mobile-legends" },
  { title: "DELTA FORCE", eyebrow: "TOP UP GAME", publisher: "Level Infinite", bg: "https://images.unsplash.com/photo-1542751110-97427bbecf20?auto=format&fit=crop&w=500&q=80", tab: "all", slug: "pubg-mobile" },
  { title: "PUBG MOBILE", eyebrow: "TOP UP GAME", publisher: "Tencent Games", bg: "https://images.unsplash.com/photo-1614680376739-414d95ff43df?auto=format&fit=crop&w=500&q=80", tab: "all", slug: "pubg-mobile" },
  { title: "HONOR OF KINGS", eyebrow: "TOP UP GAME", publisher: "Tencent Games", bg: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=500&q=80", tab: "all", slug: "honor-of-kings" },
  { title: "GENSHIN", eyebrow: "TOP UP GAME", publisher: "HoYoverse", bg: "https://images.unsplash.com/photo-1600861195091-690c92f1d2cc?auto=format&fit=crop&w=500&q=80", tab: "all", slug: "genshin-impact" },
  { title: "ROBLOX", eyebrow: "VOUCHER", publisher: "Roblox Corporation", bg: "https://images.unsplash.com/photo-1611996575749-79a3a250f948?auto=format&fit=crop&w=500&q=80", tab: "voucher", slug: "roblox" },
  { title: "STEAM WALLET", eyebrow: "VOUCHER", publisher: "Valve", bg: "https://images.unsplash.com/photo-1511882150382-421056c89033?auto=format&fit=crop&w=500&q=80", tab: "voucher", slug: "steam" },
  { title: "TIKTOK LIVE", eyebrow: "LIVE APP", publisher: "TikTok", bg: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=500&q=80", tab: "live", slug: "tiktok" },
  { title: "BIGO LIVE", eyebrow: "LIVE APP", publisher: "BIGO", bg: "https://images.unsplash.com/photo-1522542550221-31fd19575a2d?auto=format&fit=crop&w=500&q=80", tab: "live", slug: "bigo" },
]

export function HomeContent({ user }: HomeContentProps) {
  const router = useRouter()
  
  // Carousel State
  const [activeSlide, setActiveSlide] = useState(0)
  const carouselInterval = useRef<NodeJS.Timeout | null>(null)

  // Catalog Tab State
  const [activeTab, setActiveTab] = useState("all")

  // Quick Checkout State
  const [gameId, setGameId] = useState("12345678")
  const [serverId, setServerId] = useState("1234")
  const [selectedNominal, setSelectedNominal] = useState("172 Diamonds")
  const [selectedPayment, setSelectedPayment] = useState("QRIS")

  useEffect(() => {
    startCarousel()
    return () => stopCarousel()
  }, [])

  const startCarousel = () => {
    stopCarousel()
    carouselInterval.current = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % slides.length)
    }, 5500)
  }

  const stopCarousel = () => {
    if (carouselInterval.current) {
      clearInterval(carouselInterval.current)
    }
  }

  const handlePrevSlide = () => {
    stopCarousel()
    setActiveSlide((prev) => (prev - 1 + slides.length) % slides.length)
    startCarousel()
  }

  const handleNextSlide = () => {
    stopCarousel()
    setActiveSlide((prev) => (prev + 1) % slides.length)
    startCarousel()
  }

  const handleDotClick = (index: number) => {
    stopCarousel()
    setActiveSlide(index)
    startCarousel()
  }

  const handleQuickCheckout = () => {
    // Redirect to dynamic checkout or invoice based on selections
    const skuMap: Record<string, string> = {
      "86 Diamonds": "ML86",
      "172 Diamonds": "ML172",
      "257 Diamonds": "ML257",
      "344 Diamonds": "ML344",
    }
    const sku = skuMap[selectedNominal] || "ML172"
    router.push(`/checkout/${sku}?target=${gameId}&serverId=${serverId}&payment=${selectedPayment.toLowerCase()}`)
  }

  return (
    <div className="min-h-screen text-slate-100 antialiased relative">
      {/* Mesh Background */}
      <div className="pointer-events-none fixed inset-0 mesh opacity-50 z-0"></div>

      <Header user={user} />

      <main className="relative z-10 mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        
        {/* Hero Carousel */}
        <div className="hero-carousel mb-10 overflow-hidden relative rounded-lg border border-white/10">
          <div 
            className="carousel-track flex transition-transform duration-500"
            style={{ transform: `translateX(-${activeSlide * 100}%)` }}
          >
            {slides.map((slide, idx) => (
              <div 
                key={idx}
                className="carousel-slide min-h-[420px] bg-cover bg-center flex items-center relative w-full shrink-0"
                style={{ backgroundImage: `url('${slide.bg}')` }}
              >
                {/* Dark overlay for readability */}
                <div className="absolute inset-0 bg-black/50 z-0"></div>
                
                <div className="relative z-10 flex min-h-[420px] items-center p-7 sm:p-10 lg:p-14">
                  <div className="max-w-2xl">
                    <span className="rounded-lg bg-white/15 px-3 py-1 text-xs font-extrabold uppercase tracking-wide text-cyan-100">
                      {slide.tag}
                    </span>
                    <h2 className="mt-5 text-4xl font-extrabold uppercase leading-tight text-white sm:text-6xl">
                      {slide.title}
                    </h2>
                    <p className="mt-4 max-w-xl text-lg font-semibold text-slate-100">
                      {slide.desc}
                    </p>
                    <div className="mt-8 flex flex-wrap gap-3">
                      <button 
                        onClick={() => router.push("/games/mobile-legends")}
                        className="rounded-lg bg-cyan-200 px-5 py-3 text-sm font-extrabold text-ink transition hover:bg-cyan-300 hover:scale-[1.02] active:scale-[0.98] shimmer-hover"
                      >
                        {slide.btn1}
                      </button>
                      <button 
                        onClick={() => router.push("/check")}
                        className="rounded-lg border border-white/30 bg-white/10 px-5 py-3 text-sm font-bold text-white transition hover:bg-white/20 hover:scale-[1.02] active:scale-[0.98] shimmer-hover"
                      >
                        {slide.btn2}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <button 
            onClick={handlePrevSlide}
            className="carousel-nav left-5 absolute top-1/2 -translate-y-1/2 grid h-12 w-12 place-items-center rounded-lg bg-white/10 border border-white/20 text-white transition hover:bg-white/20 z-20" 
            type="button" 
            aria-label="Slide sebelumnya"
          >
            <ChevronLeft className="h-7 w-7" />
          </button>
          <button 
            onClick={handleNextSlide}
            className="carousel-nav right-5 absolute top-1/2 -translate-y-1/2 grid h-12 w-12 place-items-center rounded-lg bg-white/10 border border-white/20 text-white transition hover:bg-white/20 z-20" 
            type="button" 
            aria-label="Slide berikutnya"
          >
            <ChevronRight className="h-7 w-7" />
          </button>
          <div className="absolute bottom-5 left-1/2 z-20 flex -translate-x-1/2 gap-2">
            {slides.map((_, idx) => (
              <button 
                key={idx}
                onClick={() => handleDotClick(idx)}
                className={`carousel-dot ${activeSlide === idx ? "active" : ""}`} 
                type="button" 
                aria-label={`Slide ${idx + 1}`}
              ></button>
            ))}
          </div>
        </div>

        {/* Main Grid */}
        <div className="grid gap-6 lg:grid-cols-[1.12fr_.88fr]">
          
          {/* Left Hero Card */}
          <div className="relative min-h-[520px] overflow-hidden rounded-lg border border-white/10 bg-ink">
            <img 
              className="absolute inset-0 h-full w-full object-cover opacity-55" 
              src="https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=1600&q=80" 
              alt="Setup gaming dengan lampu neon" 
            />
            <div className="absolute inset-0 bg-gradient-to-r from-ink via-ink/80 to-ink/25"></div>
            
            <div className="relative flex min-h-[520px] flex-col justify-between p-6 sm:p-8">
              <div className="flex flex-wrap gap-2">
                <span className="rounded-lg border border-emerald-300/20 bg-emerald-300/10 px-3 py-1 text-xs font-bold text-emerald-200">
                  QRIS otomatis
                </span>
                <span className="rounded-lg border border-cyan-300/20 bg-cyan-300/10 px-3 py-1 text-xs font-bold text-cyan-200">
                  Webhook ready
                </span>
                <span className="rounded-lg border border-slate-300/15 bg-white/10 px-3 py-1 text-xs font-bold text-slate-200">
                  Multi provider
                </span>
              </div>
              <div className="max-w-2xl my-6">
                <h1 className="text-4xl font-extrabold leading-tight text-white sm:text-6xl">
                  Topup game cepat untuk proyek Laravel mahasiswa.
                </h1>
                <p className="mt-5 max-w-xl text-base leading-7 text-slate-300">
                  Preview UI lengkap dari landing, pilih produk, dashboard user, admin monitoring, hingga detail invoice QRIS.
                </p>
                <div className="mt-7 flex flex-wrap gap-3">
                  <button 
                    onClick={() => router.push("/games/mobile-legends")}
                    className="rounded-lg bg-cyan-300 px-5 py-3 text-sm font-extrabold text-ink transition hover:bg-cyan-200"
                  >
                    Mulai topup
                  </button>
                  <button 
                    onClick={() => router.push("/check")}
                    className="rounded-lg border border-white/15 bg-white/10 px-5 py-3 text-sm font-bold text-white transition hover:bg-white/15"
                  >
                    Cek transaksi
                  </button>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3 text-sm">
                <div className="glass rounded-lg p-4">
                  <p className="text-2xl font-extrabold">2.1k</p>
                  <p className="mt-1 text-slate-400">Transaksi</p>
                </div>
                <div className="glass rounded-lg p-4">
                  <p className="text-2xl font-extrabold">99.7%</p>
                  <p className="mt-1 text-slate-400">Sukses</p>
                </div>
                <div className="glass rounded-lg p-4">
                  <p className="text-2xl font-extrabold">35s</p>
                  <p className="mt-1 text-slate-400">Rata-rata</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Checkout Panel */}
          <aside className="glass rounded-lg p-5">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-extrabold">Checkout Topup</h2>
                <p className="mt-1 text-sm text-slate-400">Mobile Legends dipilih otomatis</p>
              </div>
              <span className="rounded-lg bg-white/10 px-3 py-1 text-xs font-bold text-cyan-100">Live preview</span>
            </div>

            <div className="mt-5 overflow-hidden rounded-lg border border-white/10">
              <img 
                className="h-36 w-full object-cover" 
                src="https://images.unsplash.com/photo-1560253023-3ec5d502959f?auto=format&fit=crop&w=900&q=80" 
                alt="Pemain game sedang memakai headset" 
              />
            </div>

            <div className="mt-5 grid gap-3">
              <div className="grid grid-cols-2 gap-2">
                <label className="block">
                  <span className="mb-2 block text-sm font-semibold text-slate-300">ID Game</span>
                  <input 
                    value={gameId} 
                    onChange={(e) => setGameId(e.target.value)}
                    className="w-full rounded-lg border border-white/10 bg-white/10 px-4 py-3 text-sm text-white outline-none focus:ring-2 focus:ring-cyan-300/40" 
                  />
                </label>
                <label className="block">
                  <span className="mb-2 block text-sm font-semibold text-slate-300">Server ID</span>
                  <input 
                    value={serverId} 
                    onChange={(e) => setServerId(e.target.value)}
                    className="w-full rounded-lg border border-white/10 bg-white/10 px-4 py-3 text-sm text-white outline-none focus:ring-2 focus:ring-cyan-300/40" 
                  />
                </label>
              </div>

              <div>
                <span className="mb-2 block text-sm font-semibold text-slate-300">Nominal</span>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { name: "86 Diamonds", price: "Rp21.000" },
                    { name: "172 Diamonds", price: "Rp41.000" },
                    { name: "257 Diamonds", price: "Rp61.500" },
                    { name: "344 Diamonds", price: "Rp82.000" },
                  ].map((nom) => (
                    <button 
                      key={nom.name}
                      onClick={() => setSelectedNominal(nom.name)}
                      className={`rounded-lg border p-3 text-left transition ${selectedNominal === nom.name ? "border-cyan-300/50 bg-cyan-300/15" : "border-white/10 bg-white/10 hover:border-cyan-300/40 hover:bg-cyan-300/10"}`}
                    >
                      <span className="block font-bold">{nom.name}</span>
                      <span className="text-sm text-cyan-200">{nom.price}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <span className="mb-2 block text-sm font-semibold text-slate-300">Pembayaran</span>
                <div className="grid grid-cols-3 gap-2">
                  {["QRIS", "VA", "E-Wallet"].map((pay) => (
                    <button 
                      key={pay}
                      onClick={() => setSelectedPayment(pay)}
                      className={`rounded-lg border px-3 py-3 text-sm font-bold text-center transition ${selectedPayment === pay ? "border-cyan-300/50 bg-cyan-300/15 text-white" : "border-white/10 bg-white/10 text-slate-300 hover:border-cyan-300/40"}`}
                    >
                      {pay}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex gap-2 mt-2">
                <button 
                  onClick={() => router.push("/games/mobile-legends")}
                  className="flex-1 rounded-lg bg-white/10 border border-white/10 px-4 py-3 text-sm font-extrabold text-white transition hover:bg-white/20"
                >
                  Lihat Detail Game
                </button>
                <button 
                  onClick={handleQuickCheckout}
                  className="flex-1 flex items-center justify-center gap-2 rounded-lg bg-cyan-300 px-4 py-3 text-sm font-extrabold text-ink transition hover:bg-cyan-200 hover:scale-[1.02] active:scale-[0.98] shimmer-hover"
                >
                  <ShoppingBag className="h-4 w-4" />
                  Order Sekarang
                </button>
              </div>
            </div>
          </aside>
        </div>

        {/* Section: Populer Sekarang (Diagonal Cards) */}
        <div className="section-wrap">
          <div className="mb-4 flex items-center gap-3">
            <Flame className="h-7 w-7 text-cyan-300" />
            <div>
              <h2 className="text-2xl font-extrabold tracking-wide">POPULER SEKARANG!</h2>
              <p className="mt-1 text-sm text-slate-300">Berikut adalah beberapa produk yang paling populer saat ini.</p>
            </div>
          </div>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {diagonalCards.map((card, idx) => (
              <button 
                key={idx}
                onClick={() => router.push(`/games/${card.slug}`)}
                className="diagonal-card flex min-h-28 items-center gap-4 rounded-lg p-3 text-left transition hover:-translate-y-1 hover:border-cyan-300/20"
              >
                <img className="h-24 w-24 rounded-lg object-cover" src={card.image} alt={card.name} />
                <span>
                  <strong className="block text-lg">{card.name}</strong>
                  <span className="mt-1 block text-sm text-white/80">{card.publisher}</span>
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Section: Catalog Tabs */}
        <div className="section-wrap">
          <div className="mb-6 flex flex-wrap gap-3">
            <button 
              onClick={() => setActiveTab("all")}
              className={`rounded-lg px-5 py-3 text-sm font-extrabold transition-all duration-300 hover:scale-[1.03] active:scale-[0.97] shimmer-hover ${activeTab === "all" ? "catalog-tab-active" : "bg-[#244341] text-white hover:bg-[#2e5250]"}`}
            >
              Top Up
            </button>
            <button 
              onClick={() => setActiveTab("voucher")}
              className={`rounded-lg px-5 py-3 text-sm font-extrabold transition-all duration-300 hover:scale-[1.03] active:scale-[0.97] shimmer-hover ${activeTab === "voucher" ? "catalog-tab-active" : "bg-[#244341] text-white hover:bg-[#2e5250]"}`}
            >
              Voucher
            </button>
            <button 
              onClick={() => setActiveTab("live")}
              className={`rounded-lg px-5 py-3 text-sm font-extrabold transition-all duration-300 hover:scale-[1.03] active:scale-[0.97] shimmer-hover ${activeTab === "live" ? "catalog-tab-active" : "bg-[#244341] text-white hover:bg-[#2e5250]"}`}
            >
              Live App
            </button>
          </div>
          
          <div className="grid gap-7 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
            {catalogItems
              .filter((item) => activeTab === "all" ? item.tab === "all" : item.tab === activeTab)
              .map((item, idx) => (
                <button 
                  key={idx}
                  onClick={() => router.push(`/games/${item.slug}`)}
                  className="poster-card relative overflow-hidden rounded-lg text-left h-72 group transition duration-300 hover:-translate-y-1 hover:border-cyan-300/40"
                  style={{ backgroundImage: `url('${item.bg}')`, backgroundSize: 'cover', backgroundPosition: 'center' }}
                >
                  {/* Overlay for hover scale */}
                  <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-all duration-300"></div>
                  
                  <span className="poster-content z-10">
                    <span className="poster-eyebrow">{item.eyebrow}</span>
                    <span className="poster-title">{item.title}</span>
                    <span className="poster-publisher">{item.publisher}</span>
                  </span>
                </button>
              ))}
          </div>
        </div>

        {/* Floating Support Info */}
        <div className="mt-12 grid gap-6 md:grid-cols-2">
          <div className="soft-panel rounded-lg p-5 flex items-center gap-4">
            <span className="text-4xl font-extrabold">5.00</span>
            <div>
              <span className="text-2xl text-yellow-300 block">★★★★★</span>
              <p className="text-sm font-bold text-slate-300">Berdasarkan total 870 rating pengguna</p>
            </div>
          </div>
          <div 
            onClick={() => router.push("https://wa.me/6281234567890")}
            className="soft-panel flex items-center gap-4 rounded-lg p-5 cursor-pointer transition hover:border-cyan-300/30"
          >
            <Headphones className="h-8 w-8 text-[#8bb8c2]" />
            <div>
              <p className="font-extrabold">Butuh Bantuan?</p>
              <p className="text-sm text-slate-300">Hubungi layanan Customer Service 24/7 kami.</p>
            </div>
          </div>
        </div>

      </main>

      <Footer />
    </div>
  )
}

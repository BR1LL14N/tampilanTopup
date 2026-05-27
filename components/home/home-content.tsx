"use client"

import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { FlipCard } from "@/components/ui/flip-card"
import { FloatingElement } from "@/components/ui/floating-element"
import { ParallaxSection } from "@/components/ui/parallax-section"
import { MagneticButton } from "@/components/ui/magnetic-button"
import {
  Zap,
  ChevronLeft,
  ChevronRight,
  ShoppingBag,
  Headphones,
  Flame,
  Award,
} from "lucide-react"
import { gameAssets } from "@/lib/assets"

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
    bg: gameAssets["free-fire"].banner,
    btn1: "Topup Sekarang",
    btn2: "Cek Pesanan",
  },
  {
    tag: "Event Mingguan",
    title: "Diamond murah untuk push rank.",
    desc: "Pilih nominal favorit, bayar QRIS, lalu sistem otomatis mengirim order to provider.",
    bg: gameAssets["mobile-legends"].banner,
    btn1: "Lihat Produk",
    btn2: "Hitung Profit",
  },
  {
    tag: "Voucher Digital",
    title: "Roblox, Steam, dan live app.",
    desc: "Katalog bisa dipisah per kategori agar user cepat menemukan produk yang mereka cari.",
    bg: gameAssets.roblox.banner,
    btn1: "Buka Katalog",
    btn2: "Leaderboard",
  },
]

const diagonalCards = [
  { name: "Free Fire", publisher: "Garena", image: gameAssets["free-fire"].icon, slug: "free-fire" },
  { name: "Mobile Legends", publisher: "Moonton", image: gameAssets["mobile-legends"].icon, slug: "mobile-legends" },
  { name: "Joki Rank", publisher: "Mitsuru", image: gameAssets["mobile-legends"].poster, slug: "mobile-legends" },
  { name: "ROBLOX - Voucher", publisher: "Roblox Corporation", image: gameAssets.roblox.icon, slug: "roblox" },
  { name: "Honor Of Kings", publisher: "Tencent Games", image: gameAssets["honor-of-kings"].icon, slug: "honor-of-kings" },
  { name: "Valorant", publisher: "Riot Games", image: gameAssets.valorant.icon, slug: "valorant" },
]

const catalogItems = [
  { title: "FREE FIRE", eyebrow: "TOP UP GAME", publisher: "Garena", bg: gameAssets["free-fire"].poster, tab: "all", slug: "free-fire" },
  { title: "MOBILE LEGENDS", eyebrow: "TOP UP GAME", publisher: "Moonton", bg: gameAssets["mobile-legends"].poster, tab: "all", slug: "mobile-legends" },
  { title: "JOKI RANK", eyebrow: "JOKI MOBILE LEGENDS", publisher: "Mitsuru", bg: gameAssets["mobile-legends"].poster, tab: "all", slug: "mobile-legends" },
  { title: "MAGIC CHESS", eyebrow: "TOP UP GAME", publisher: "Moonton", bg: gameAssets["mobile-legends"].poster, tab: "all", slug: "mobile-legends" },
  { title: "DELTA FORCE", eyebrow: "TOP UP GAME", publisher: "Level Infinite", bg: gameAssets["pubg-mobile"].poster, tab: "all", slug: "pubg-mobile" },
  { title: "PUBG MOBILE", eyebrow: "TOP UP GAME", publisher: "Tencent Games", bg: gameAssets["pubg-mobile"].poster, tab: "all", slug: "pubg-mobile" },
  { title: "HONOR OF KINGS", eyebrow: "TOP UP GAME", publisher: "Tencent Games", bg: gameAssets["honor-of-kings"].poster, tab: "all", slug: "honor-of-kings" },
  { title: "GENSHIN", eyebrow: "TOP UP GAME", publisher: "HoYoverse", bg: gameAssets["genshin-impact"].poster, tab: "all", slug: "genshin-impact" },
  { title: "ROBLOX", eyebrow: "VOUCHER", publisher: "Roblox Corporation", bg: gameAssets.roblox.poster, tab: "voucher", slug: "roblox" },
  { title: "STEAM WALLET", eyebrow: "VOUCHER", publisher: "Valve", bg: gameAssets.steam.poster, tab: "voucher", slug: "steam" },
  { title: "TIKTOK LIVE", eyebrow: "LIVE APP", publisher: "TikTok", bg: gameAssets.tiktok.poster, tab: "live", slug: "tiktok" },
  { title: "BIGO LIVE", eyebrow: "LIVE APP", publisher: "BIGO", bg: gameAssets.bigo.poster, tab: "live", slug: "bigo" },
]

export function HomeContent({ user }: HomeContentProps) {
  const router = useRouter()
  
  const handleSliderClick = (action: string) => {
    if (action === "Topup Sekarang" || action === "Lihat Produk" || action === "Buka Katalog") {
      const catalogEl = document.getElementById("catalog")
      if (catalogEl) {
        catalogEl.scrollIntoView({ behavior: "smooth" })
      } else {
        router.push("/games")
      }
    } else if (action === "Cek Pesanan") {
      router.push("/check")
    } else if (action === "Hitung Profit") {
      router.push("/calculator")
    } else if (action === "Leaderboard") {
      router.push("/leaderboard")
    }
  }

  // Carousel State
  const [activeSlide, setActiveSlide] = useState(0)
  const carouselInterval = useRef<NodeJS.Timeout | null>(null)

  // Catalog Tab State
  const [activeTab, setActiveTab] = useState("all")

  // Flash Sale Timer State
  const [timeLeft, setTimeLeft] = useState({ hours: 2, minutes: 14, seconds: 35 })

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev.seconds > 0) {
          return { ...prev, seconds: prev.seconds - 1 }
        } else if (prev.minutes > 0) {
          return { ...prev, minutes: prev.minutes - 1, seconds: 59 }
        } else if (prev.hours > 0) {
          return { hours: prev.hours - 1, minutes: 59, seconds: 59 }
        } else {
          return { hours: 2, minutes: 14, seconds: 35 } // Reset
        }
      })
    }, 1000)
    return () => clearInterval(timer)
  }, [])

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

  // Clip path styles for hexagonal game UI cuts
  const bevelStyle = {
    clipPath: "polygon(12px 0%, calc(100% - 12px) 0%, 100% 12px, 100% calc(100% - 12px), calc(100% - 12px) 100%, 12px 100%, 0% calc(100% - 12px), 0% 12px)"
  }

  const inputBevelStyle = {
    clipPath: "polygon(8px 0%, calc(100% - 8px) 0%, 100% 8px, 100% calc(100% - 8px), calc(100% - 8px) 100%, 8px 100%, 0% calc(100% - 8px), 0% 8px)"
  }

  const tabBevelStyle = {
    clipPath: "polygon(8px 0%, calc(100% - 8px) 0%, 100% 8px, 100% 100%, 0% 100%)"
  }

  return (
    <div className="min-h-screen text-slate-100 antialiased relative">
      {/* Mesh Background */}
      <div className="pointer-events-none fixed inset-0 mesh opacity-45 z-0"></div>

      <Header user={user} />

      <main className="relative z-10 mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        
        {/* Hero Carousel */}
        <div className="hero-carousel mb-10 overflow-hidden relative rounded-2xl border border-white/10 shadow-neon-cyan/20">
          <div 
            className="carousel-track flex transition-transform duration-500"
            style={{ transform: `translateX(-${activeSlide * 100}%)` }}
          >
            {slides.map((slide, idx) => (
              <div 
                key={idx}
                className="carousel-slide min-h-[440px] bg-cover bg-center flex items-center relative w-full shrink-0 auto-shimmer-bg"
                style={{ backgroundImage: `url('${slide.bg}')` }}
              >
                {/* Dark overlay for readability */}
                <div className="absolute inset-0 bg-black/60 z-0"></div>
                
                <div className="relative z-10 flex min-h-[440px] items-center p-7 sm:p-10 lg:p-16">
                  <div className="max-w-2xl">
                    <span className="rounded bg-cyan-300/10 border border-cyan-300/30 px-3.5 py-1 text-xs font-black uppercase tracking-wider text-cyan-300">
                      {slide.tag}
                    </span>
                    <h2 className="mt-5 text-4xl font-black uppercase leading-none text-white sm:text-6xl tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white via-white to-slate-400">
                      {slide.title}
                    </h2>
                    <p className="mt-4 max-w-xl text-base font-semibold text-slate-300">
                      {slide.desc}
                    </p>
                    
                    {/* Beveled Slide Action Buttons */}
                    <div className="mt-8 flex flex-wrap gap-4">
                      {/* Primary button: solid cyan with glow default, custom hover */}
                      <div className="relative p-[1px] bg-gradient-to-r from-cyan-300 to-blue-500 rounded-lg shadow-[0_0_15px_rgba(34,211,238,0.25)] hover:shadow-[0_0_25px_rgba(34,211,238,0.55)] transition-all duration-300 hover:scale-105 active:scale-95" style={inputBevelStyle}>
                        <button 
                          onClick={() => handleSliderClick(slide.btn1)}
                          className="bg-cyan-300 text-slate-950 hover:bg-slate-950 hover:text-cyan-300 font-black px-6 py-3 text-xs tracking-widest uppercase transition-all duration-300 shimmer-hover"
                          style={inputBevelStyle}
                        >
                          {slide.btn1}
                        </button>
                      </div>
                      
                      {/* Secondary button: outline cyan default, solid cyan fill hover */}
                      <div className="relative p-[1px] bg-cyan-400/50 hover:bg-cyan-300 rounded-lg shadow-[0_0_10px_rgba(34,211,238,0.1)] hover:shadow-[0_0_20px_rgba(34,211,238,0.45)] transition-all duration-300 hover:scale-105 active:scale-95" style={inputBevelStyle}>
                        <button 
                          onClick={() => handleSliderClick(slide.btn2)}
                          className="bg-slate-950/90 text-cyan-300 hover:bg-cyan-300 hover:text-slate-950 font-black px-6 py-3 text-xs tracking-widest uppercase transition-all duration-300 shimmer-hover"
                          style={inputBevelStyle}
                        >
                          {slide.btn2}
                        </button>
                      </div>
                    </div>

                  </div>
                </div>
              </div>
            ))}
          </div>

          <MagneticButton 
            onClick={handlePrevSlide}
            className="carousel-nav left-5 absolute top-1/2 -translate-y-1/2 grid h-12 w-12 place-items-center rounded-lg bg-black/40 border border-white/10 hover:border-cyan-300/30 text-white transition-all active:scale-95 z-20" 
            strength={0.4}
          >
            <ChevronLeft className="h-6 w-6 text-cyan-300" />
          </MagneticButton>
          <MagneticButton 
            onClick={handleNextSlide}
            className="carousel-nav right-5 absolute top-1/2 -translate-y-1/2 grid h-12 w-12 place-items-center rounded-lg bg-black/40 border border-white/10 hover:border-cyan-300/30 text-white transition-all active:scale-95 z-20" 
            strength={0.4}
          >
            <ChevronRight className="h-6 w-6 text-cyan-300" />
          </MagneticButton>
          <div className="absolute bottom-5 left-1/2 z-20 flex -translate-x-1/2 gap-2.5">
            {slides.map((_, idx) => (
              <button 
                key={idx}
                onClick={() => handleDotClick(idx)}
                className={`carousel-dot h-1.5 transition-all duration-300 rounded-full ${activeSlide === idx ? "w-8 bg-cyan-300" : "w-2 bg-white/20 hover:bg-white/40"}`} 
                type="button" 
                aria-label={`Slide ${idx + 1}`}
              ></button>
            ))}
          </div>
        </div>

        {/* Flash Sale Section - Blending Cyan Theme with Orange Urgency Accent */}
        <ParallaxSection className="section-wrap mb-12 bg-gradient-to-r from-cyan-950/15 via-slate-900/10 to-transparent border border-cyan-300/20 rounded-2xl p-6 md:p-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-80 h-80 bg-cyan-300/5 rounded-full blur-3xl pointer-events-none" />
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 relative z-10">
            <div className="flex items-center gap-3.5">
              <FloatingElement delay={0.2} duration={4}>
                <span className="flex h-12 w-12 place-items-center justify-center rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 shadow-lg shadow-cyan-300/10">
                  <Zap className="h-6 w-6 fill-cyan-500/20" />
                </span>
              </FloatingElement>
              <div>
                <h2 className="text-2xl font-black tracking-wide text-white uppercase">FLASH SALE HARI INI</h2>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Promo terbatas dengan harga miring untuk game favoritmu.</p>
              </div>
            </div>
            {/* Timer */}
            <div className="flex items-center gap-2 bg-black/40 border border-white/10 rounded-xl px-4 py-2.5">
              <span className="text-[10px] font-black text-orange-400 uppercase tracking-widest mr-2">Berakhir dalam</span>
              <div className="flex gap-1.5">
                {[
                  { value: timeLeft.hours, label: "H" },
                  { value: timeLeft.minutes, label: "M" },
                  { value: timeLeft.seconds, label: "S" }
                ].map((t, idx) => (
                  <div key={idx} className="flex items-center">
                    <span className="bg-orange-600 text-white font-black px-2.5 py-1 rounded text-sm min-w-[32px] text-center shadow-lg shadow-orange-500/25 font-mono">
                      {String(t.value).padStart(2, '0')}
                    </span>
                    {idx < 2 && <span className="font-black text-orange-400 mx-1">:</span>}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Flash Sale Cards with Small Game Cover Thumbnails (Vertical Card Layout) */}
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4 relative z-10">
            {[
              { game: "Mobile Legends", name: "86 Diamonds", oriPrice: 25000, salePrice: 19800, discount: 20, sold: 82, slug: "mobile-legends" },
              { game: "Free Fire", name: "140 Diamonds", oriPrice: 34000, salePrice: 27500, discount: 19, sold: 64, slug: "free-fire" },
              { game: "PUBG Mobile", name: "325 UC", oriPrice: 105000, salePrice: 88000, discount: 16, sold: 91, slug: "pubg-mobile" },
              { game: "Valorant", name: "1000 VP", oriPrice: 85000, salePrice: 73200, discount: 14, sold: 45, slug: "valorant" }
            ].map((item, idx) => {
              const flashSaleThumbnails: Record<string, string> = {
                "mobile-legends": gameAssets["mobile-legends"].icon,
                "free-fire": gameAssets["free-fire"].icon,
                "pubg-mobile": gameAssets["pubg-mobile"].icon,
                "valorant": gameAssets.valorant.icon,
              }
              return (
                <div key={idx} className="relative p-[1px] bg-gradient-to-r from-white/10 to-white/5 hover:from-cyan-300/40 hover:to-cyan-300/20 transition-all duration-300 shadow-md" style={bevelStyle}>
                  <button 
                    onClick={() => router.push(`/games/${item.slug}`)}
                    className="w-full relative overflow-hidden bg-slate-950 p-4 text-left group flex flex-col justify-between h-full min-h-[160px] shimmer-hover"
                    style={bevelStyle}
                    type="button"
                  >
                    {/* Discount Badge */}
                    <span className="absolute top-3 right-3 rounded bg-orange-600 px-2 py-0.5 text-[9px] font-black text-white z-10 shadow-sm leading-none">
                      -{item.discount}%
                    </span>

                    <div className="flex gap-3 items-center w-full">
                      {/* Small Game Cover Thumbnail */}
                      <div className="h-12 w-12 rounded-lg overflow-hidden shrink-0 border border-white/10 group-hover:border-cyan-300/30 transition-colors" style={inputBevelStyle}>
                        <img 
                          src={flashSaleThumbnails[item.slug]} 
                          alt={item.name} 
                          className="h-full w-full object-cover group-hover:scale-110 transition-transform duration-500" 
                        />
                      </div>
                      <div className="min-w-0">
                        <p className="text-[9px] font-bold text-slate-500 uppercase tracking-wider truncate">{item.game}</p>
                        <h4 className="mt-0.5 font-black text-white text-xs group-hover:text-cyan-300 transition-colors uppercase tracking-tight truncate pr-6">{item.name}</h4>
                      </div>
                    </div>

                    <div className="mt-4 w-full">
                      <div className="flex items-baseline gap-1.5">
                        <span className="text-sm font-black text-cyan-300 font-mono">Rp {item.salePrice.toLocaleString("id-ID")}</span>
                        <span className="text-[10px] text-slate-500 line-through font-mono">Rp {item.oriPrice.toLocaleString("id-ID")}</span>
                      </div>

                      {/* Progress Bar with labels above it */}
                      <div className="mt-4">
                        <div className="flex justify-between text-[9px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                          <span>Tersisa <span className="text-cyan-400 font-mono">{100 - item.sold}</span></span>
                          <span>Terjual <span className="text-cyan-400 font-mono">{item.sold}</span></span>
                        </div>
                        <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden border border-white/5">
                          <div className="h-full bg-cyan-400 rounded-full animate-pulse" style={{ width: `${item.sold}%` }}></div>
                        </div>
                      </div>
                    </div>
                  </button>
                </div>
              )
            })}
          </div>
        </ParallaxSection>

        {/* Section: Populer Sekarang (Diagonal Cards with Glowing Beveled Outlines) */}
        <ParallaxSection className="section-wrap mb-12">
          <div className="mb-6 flex items-center gap-3">
            <FloatingElement delay={0} duration={3}>
              <Flame className="h-8 w-8 text-cyan-300" />
            </FloatingElement>
            <div>
              <h2 className="text-2xl font-black tracking-wide text-white uppercase">POPULER SEKARANG!</h2>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Berikut adalah beberapa produk yang paling populer saat ini.</p>
            </div>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {diagonalCards.map((card, idx) => (
              <div key={idx} className="relative p-[1px] bg-gradient-to-r from-white/10 to-white/5 hover:from-cyan-300/40 hover:to-cyan-300/20 transition-all duration-300 shadow-md interactive-card group" style={bevelStyle}>
                <MagneticButton 
                  onClick={() => router.push(`/games/${card.slug}`)}
                  className="w-full flex min-h-28 items-center gap-5 bg-slate-950 p-4 text-left shimmer-hover"
                  strength={0.25}
                >
                  <div className="relative h-20 w-20 shrink-0 overflow-hidden transform-gpu" style={inputBevelStyle}>
                    <img className="h-full w-full object-cover group-hover:scale-110 transition-transform duration-500" src={card.image} alt={card.name} />
                  </div>
                  <span>
                    <strong className="block text-lg font-black text-white group-hover:text-cyan-300 transition-colors uppercase tracking-tight">{card.name}</strong>
                    <span className="mt-1 block text-xs font-bold text-slate-500 uppercase tracking-wider">{card.publisher}</span>
                  </span>
                </MagneticButton>
              </div>
            ))}
          </div>
        </ParallaxSection>

        {/* Section: Catalog Tabs & Grid */}
        <div id="catalog" className="section-wrap">
          <div className="mb-8 flex flex-wrap gap-2">
            <button 
              onClick={() => setActiveTab("all")}
              className={`px-6 py-3 text-xs font-black uppercase tracking-wider transition-all duration-300 hover:translate-y-[-1px] shimmer-hover ${
                activeTab === "all" 
                  ? "bg-cyan-300 text-ink shadow-lg shadow-cyan-300/10" 
                  : "bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white border border-white/5"
              }`}
              style={tabBevelStyle}
            >
              Top Up Game
            </button>
            <button 
              onClick={() => setActiveTab("voucher")}
              className={`px-6 py-3 text-xs font-black uppercase tracking-wider transition-all duration-300 hover:translate-y-[-1px] shimmer-hover ${
                activeTab === "voucher" 
                  ? "bg-cyan-300 text-ink shadow-lg shadow-cyan-300/10" 
                  : "bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white border border-white/5"
              }`}
              style={tabBevelStyle}
            >
              Voucher Digital
            </button>
            <button 
              onClick={() => setActiveTab("live")}
              className={`px-6 py-3 text-xs font-black uppercase tracking-wider transition-all duration-300 hover:translate-y-[-1px] shimmer-hover ${
                activeTab === "live" 
                  ? "bg-cyan-300 text-ink shadow-lg shadow-cyan-300/10" 
                  : "bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white border border-white/5"
              }`}
              style={tabBevelStyle}
            >
              Live App Coins
            </button>
          </div>
          
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {catalogItems
              .filter((item) => activeTab === "all" ? item.tab === "all" : item.tab === activeTab)
              .map((item, idx) => (
                <button 
                  key={idx}
                  onClick={() => router.push(`/games/${item.slug}`)}
                  className="poster-card relative overflow-hidden text-left h-72 group transition duration-300 hover:-translate-y-1 shadow-md"
                  style={{ 
                    backgroundImage: `url('${item.bg}')`, 
                    backgroundSize: 'cover', 
                    backgroundPosition: 'center',
                    clipPath: "polygon(12px 0%, calc(100% - 12px) 0%, 100% 12px, 100% calc(100% - 12px), calc(100% - 12px) 100%, 12px 100%, 0% calc(100% - 12px), 0% 12px)"
                  }}
                >
                  {/* Glass dark overlays */}
                  <div className="absolute inset-0 bg-black/50 group-hover:bg-cyan-950/20 transition-colors duration-300" />
                  
                  {/* Subtle diagonal highlight line */}
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gradient-to-tr from-cyan-300/10 via-transparent to-transparent pointer-events-none" />

                  <span className="poster-content z-10 p-5">
                    <span className="poster-eyebrow text-[9px] font-black uppercase text-cyan-300 tracking-widest">{item.eyebrow}</span>
                    <span className="poster-title font-black uppercase italic tracking-tight text-white mt-1 group-hover:text-cyan-200 transition-colors">{item.title}</span>
                    <span className="poster-publisher text-xs font-bold text-slate-400 uppercase tracking-wider mt-1">{item.publisher}</span>
                  </span>
                </button>
              ))}
          </div>
        </div>

        {/* Dynamic Trust and Support Panels with game borders */}
        <div className="mt-16 grid gap-6 md:grid-cols-2">
          
          <div className="relative p-[1px] bg-white/10" style={bevelStyle}>
            <div className="bg-slate-950/90 p-6 flex items-center gap-5 h-full" style={bevelStyle}>
              <span className="grid h-12 w-12 place-items-center rounded bg-cyan-300 text-ink shadow font-mono font-black text-lg">
                5.0
              </span>
              <div>
                <div className="text-yellow-400 text-lg leading-none mb-1">★★★★★</div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wide">Berdasarkan total 870 rating pengguna terverifikasi</p>
              </div>
            </div>
          </div>

          <div className="relative p-[1px] bg-white/10 hover:bg-cyan-300/30 transition-all duration-300" style={bevelStyle}>
            <div 
              onClick={() => router.push("https://wa.me/6281234567890")}
              className="bg-slate-950/90 flex items-center gap-5 p-6 cursor-pointer group h-full"
              style={bevelStyle}
            >
              <span className="grid h-12 w-12 place-items-center rounded bg-cyan-300/10 text-cyan-300 group-hover:bg-cyan-300 group-hover:text-ink transition-all duration-300">
                <Headphones className="h-6 w-6" />
              </span>
              <div>
                <p className="font-black text-white uppercase group-hover:text-cyan-300 transition-colors">Butuh Bantuan?</p>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wide">Hubungi layanan Customer Service 24/7 kami.</p>
              </div>
            </div>
          </div>

        </div>

      </main>

      <Footer />
    </div>
  )
}

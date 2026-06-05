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
          return { hours: 2, minutes: 14, seconds: 35 }
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

  // Clip path styles for beveled game UI cuts - Sky Fantasy
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
    <div className="min-h-screen text-text-primary antialiased relative">
      <Header user={user} />

      <main className="relative z-10 mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">

        {/* Hero Carousel - Sky Fantasy */}
        <div className="hero-carousel mb-10 overflow-hidden relative rounded-[24px] border border-sky-border shadow-sky-medium">
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
                {/* Very thin dark overlay for readability of white text */}
                <div className="absolute inset-0 bg-black/20 z-0" />

                <div className="relative z-10 flex min-h-[440px] items-center p-7 sm:p-10 lg:p-16">
                  <div className="max-w-2xl">
                    <span className="rounded-full border border-white/30 bg-white/10 px-3.5 py-1 text-xs font-black uppercase tracking-wider text-white">
                      {slide.tag}
                    </span>
                    <h2 className="mt-5 text-4xl font-black uppercase leading-none text-white sm:text-6xl tracking-tight">
                      {slide.title}
                    </h2>
                    <p className="mt-4 max-w-xl text-base font-semibold text-white/95">
                      {slide.desc}
                    </p>

                    {/* Rounded Slide Action Buttons - Sky Fantasy */}
                    <div className="mt-8 flex flex-wrap gap-4">
                      {/* Primary button: solid sky blue with glow default */}
                      <button
                        onClick={() => handleSliderClick(slide.btn1)}
                        className="bg-sky text-white hover:bg-diamond font-black px-6 py-3.5 text-xs tracking-widest uppercase rounded-xl shadow-sky-soft hover:shadow-sky-glow transition-all duration-300 hover:scale-105 active:scale-95 shimmer-hover"
                      >
                        {slide.btn1}
                      </button>

                      {/* Secondary button: outline sky blue */}
                      <button
                        onClick={() => handleSliderClick(slide.btn2)}
                        className="bg-white text-sky border border-sky-border hover:bg-sky hover:text-white font-black px-6 py-3.5 text-xs tracking-widest uppercase rounded-xl shadow-sky-soft hover:shadow-sky-medium transition-all duration-300 hover:scale-105 active:scale-95 shimmer-hover"
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
            className="carousel-nav left-5 absolute top-1/2 -translate-y-1/2 grid h-12 w-12 place-items-center rounded-xl text-text-secondary hover:text-sky hover:bg-white hover:border-sky/30 transition-all hover:scale-105 active:scale-95 z-20"
            type="button"
            aria-label="Slide sebelumnya"
          >
            <ChevronLeft className="h-6 w-6" />
          </button>
          <button
            onClick={handleNextSlide}
            className="carousel-nav right-5 absolute top-1/2 -translate-y-1/2 grid h-12 w-12 place-items-center rounded-xl text-text-secondary hover:text-sky hover:bg-white hover:border-sky/30 transition-all hover:scale-105 active:scale-95 z-20"
            type="button"
            aria-label="Slide berikutnya"
          >
            <ChevronRight className="h-6 w-6" />
          </button>
          <div className="absolute bottom-5 left-1/2 z-20 flex -translate-x-1/2 gap-2.5">
            {slides.map((_, idx) => (
              <button
                key={idx}
                onClick={() => handleDotClick(idx)}
                className={`carousel-dot ${activeSlide === idx ? "active" : ""}`}
                type="button"
                aria-label={`Slide ${idx + 1}`}
              />
            ))}
          </div>
        </div>

        {/* Flash Sale Section - Sky Fantasy White Card */}
        <div className="section-wrap mb-12 bg-white border border-sky-border rounded-[24px] shadow-sky-medium p-6 md:p-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-80 h-80 bg-sky/5 rounded-full blur-3xl pointer-events-none" />

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 relative z-10">
            <div className="flex items-center gap-3.5">
              <span className="flex h-12 w-12 place-items-center justify-center rounded-xl bg-sky/10 border border-sky/20 text-sky animate-pulse shadow-lg shadow-sky/10">
                <Zap className="h-6 w-6 fill-sky/20" />
              </span>
              <div>
                <h2 className="text-2xl font-black tracking-wide text-text-primary uppercase">FLASH SALE HARI INI</h2>
                <p className="text-xs font-semibold text-text-muted uppercase tracking-wide">Promo terbatas dengan harga miring untuk game favoritmu.</p>
              </div>
            </div>
            {/* Timer */}
            <div className="flex items-center gap-2 bg-ice border border-sky-border rounded-xl px-4 py-2.5">
              <span className="text-[10px] font-black text-sky uppercase tracking-widest mr-2">Berakhir dalam</span>
              <div className="flex gap-1.5">
                {[
                  { value: timeLeft.hours, label: "H" },
                  { value: timeLeft.minutes, label: "M" },
                  { value: timeLeft.seconds, label: "S" }
                ].map((t, idx) => (
                  <div key={idx} className="flex items-center">
                    <span className="bg-sky text-white font-black px-2.5 py-1 rounded text-sm min-w-[32px] text-center shadow-lg shadow-sky/25 font-mono">
                      {String(t.value).padStart(2, '0')}
                    </span>
                    {idx < 2 && <span className="font-black text-sky mx-1">:</span>}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Flash Sale Cards with Clean Rounded Borders */}
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
                <button
                  key={idx}
                  onClick={() => router.push(`/games/${item.slug}`)}
                  className="w-full relative overflow-hidden bg-white border border-sky-border hover:border-sky/40 text-left group flex flex-col justify-between h-full min-h-[160px] shimmer-hover rounded-[20px] p-4 shadow-sky-soft hover:shadow-sky-medium transition-all duration-300 hover:-translate-y-1"
                  type="button"
                >
                  {/* Discount Badge */}
                  <span className="absolute top-3 right-3 rounded-full bg-red-500 px-2.5 py-0.5 text-[9px] font-black text-white z-10 shadow-sm leading-none">
                    -{item.discount}%
                  </span>

                  <div className="flex gap-3 items-center w-full">
                    {/* Small Game Cover Thumbnail */}
                    <div className="h-12 w-12 rounded-xl overflow-hidden shrink-0 border border-sky-border group-hover:border-sky/30 transition-colors">
                      <img
                        src={flashSaleThumbnails[item.slug]}
                        alt={item.name}
                        className="h-full w-full object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[9px] font-bold text-text-muted uppercase tracking-wider truncate">{item.game}</p>
                      <h4 className="mt-0.5 font-black text-text-primary text-xs group-hover:text-sky transition-colors uppercase tracking-tight truncate pr-6">{item.name}</h4>
                    </div>
                  </div>

                  <div className="mt-4 w-full">
                    <div className="flex items-baseline gap-1.5">
                      <span className="text-sm font-black text-sky font-mono">Rp {item.salePrice.toLocaleString("id-ID")}</span>
                      <span className="text-[10px] text-text-muted line-through font-mono">Rp {item.oriPrice.toLocaleString("id-ID")}</span>
                    </div>

                    {/* Progress Bar with labels above it */}
                    <div className="mt-4">
                      <div className="flex justify-between text-[9px] font-black uppercase tracking-wider text-text-muted mb-1.5">
                        <span>Tersisa <span className="text-sky font-mono">{100 - item.sold}</span></span>
                        <span>Terjual <span className="text-sky font-mono">{item.sold}</span></span>
                      </div>
                      <div className="h-1.5 w-full bg-ice rounded-full overflow-hidden border border-sky-border/50">
                        <div className="h-full bg-sky rounded-full" style={{ width: `${item.sold}%` }}></div>
                      </div>
                    </div>
                  </div>
                </button>
              )
            })}
          </div>
        </div>

        {/* Section: Populer Sekarang - Sky Fantasy Rounded Cards */}
        <div className="section-wrap mb-12">
          <div className="mb-6 flex items-center gap-3">
            <Flame className="h-8 w-8 text-sky animate-pulse" />
            <div>
              <h2 className="text-2xl font-black tracking-wide text-text-primary uppercase">POPULER SEKARANG!</h2>
              <p className="text-xs font-semibold text-text-muted uppercase tracking-wide">Berikut adalah beberapa produk yang paling populer saat ini.</p>
            </div>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {diagonalCards.map((card, idx) => (
              <button
                key={idx}
                onClick={() => router.push(`/games/${card.slug}`)}
                className="w-full flex min-h-28 items-center gap-5 bg-white border border-sky-border hover:border-sky/40 p-4 text-left group shimmer-hover rounded-[20px] shadow-sky-soft hover:shadow-sky-medium transition-all duration-300 hover:-translate-y-1"
              >
                <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl border border-sky-border group-hover:border-sky/30 transition-colors">
                  <img className="h-full w-full object-cover group-hover:scale-110 transition-transform duration-500" src={card.image} alt={card.name} />
                </div>
                <span>
                  <strong className="block text-lg font-black text-text-primary group-hover:text-sky transition-colors uppercase tracking-tight">{card.name}</strong>
                  <span className="mt-1 block text-xs font-bold text-text-muted uppercase tracking-wider">{card.publisher}</span>
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Section: Catalog Tabs & Grid - Sky Fantasy */}
        <div id="catalog" className="section-wrap">
          <div className="mb-8 flex flex-wrap gap-2">
            <button
              onClick={() => setActiveTab("all")}
              className={`px-6 py-3 text-xs font-black uppercase tracking-wider rounded-xl transition-all duration-300 hover:translate-y-[-1px] shimmer-hover ${
                activeTab === "all"
                  ? "bg-sky text-white shadow-sky-soft"
                  : "bg-white hover:bg-ice text-text-secondary hover:text-text-primary border border-sky-border"
              }`}
            >
              Top Up Game
            </button>
            <button
              onClick={() => setActiveTab("voucher")}
              className={`px-6 py-3 text-xs font-black uppercase tracking-wider rounded-xl transition-all duration-300 hover:translate-y-[-1px] shimmer-hover ${
                activeTab === "voucher"
                  ? "bg-sky text-white shadow-sky-soft"
                  : "bg-white hover:bg-ice text-text-secondary hover:text-text-primary border border-sky-border"
              }`}
            >
              Voucher Digital
            </button>
            <button
              onClick={() => setActiveTab("live")}
              className={`px-6 py-3 text-xs font-black uppercase tracking-wider rounded-xl transition-all duration-300 hover:translate-y-[-1px] shimmer-hover ${
                activeTab === "live"
                  ? "bg-sky text-white shadow-sky-soft"
                  : "bg-white hover:bg-ice text-text-secondary hover:text-text-primary border border-sky-border"
              }`}
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
                  className="poster-card relative overflow-hidden text-left h-72 group transition duration-300 hover:-translate-y-1 shadow-md rounded-[20px]"
                  style={{
                    backgroundImage: `url('${item.bg}')`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                  }}
                >
                  {/* Light overlay for Sky Fantasy */}
                  <div className="absolute inset-0 bg-white/50 group-hover:bg-sky/5 transition-colors duration-300" />

                  {/* Subtle highlight */}
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gradient-to-tr from-sky/10 via-transparent to-transparent pointer-events-none" />

                  <span className="poster-content z-10 p-5">
                    <span className="poster-eyebrow text-[9px] font-black uppercase text-sky tracking-widest">{item.eyebrow}</span>
                    <span className="poster-title font-black uppercase italic tracking-tight text-text-primary mt-1 group-hover:text-sky transition-colors">{item.title}</span>
                    <span className="poster-publisher text-xs font-bold text-text-secondary uppercase tracking-wider mt-1">{item.publisher}</span>
                  </span>
                </button>
              ))}
          </div>
        </div>

        {/* Dynamic Trust and Support Panels - Sky Fantasy */}
        <div className="mt-16 grid gap-6 md:grid-cols-2">

          <div className="bg-white p-6 flex items-center gap-5 h-full rounded-[20px] border border-sky-border shadow-sky-soft">
            <span className="grid h-12 w-12 place-items-center rounded-xl bg-sky text-white shadow-sky-soft font-mono font-black text-lg">
              5.0
            </span>
            <div>
              <div className="text-yellow-400 text-lg leading-none mb-1">★★★★★</div>
              <p className="text-xs font-bold text-text-muted uppercase tracking-wide">Berdasarkan total 870 rating pengguna terverifikasi</p>
            </div>
          </div>

          <div
            onClick={() => router.push("https://wa.me/6281234567890")}
            className="bg-white flex items-center gap-5 p-6 cursor-pointer group h-full rounded-[20px] border border-sky-border hover:border-sky/40 shadow-sky-soft hover:shadow-sky-medium transition-all duration-300"
          >
            <span className="grid h-12 w-12 place-items-center rounded-xl bg-sky/10 text-sky group-hover:bg-sky group-hover:text-white transition-all duration-300">
              <Headphones className="h-6 w-6" />
            </span>
            <div>
              <p className="font-black text-text-primary uppercase group-hover:text-sky transition-colors">Butuh Bantuan?</p>
              <p className="text-xs font-bold text-text-muted uppercase tracking-wide">Hubungi layanan Customer Service 24/7 kami.</p>
            </div>
          </div>

        </div>

      </main>

      <Footer />
    </div>
  )
}
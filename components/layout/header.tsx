"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import {
  Zap,
  Menu,
  UserRoundPlus,
  User,
  LogOut,
  LayoutDashboard,
  Search,
  Award,
  Calculator,
  History,
  X,
  Check,
  Globe,
  Settings,
  Shield,
  HelpCircle,
  ChevronLeft,
  ChevronRight,
  Gamepad2,
  ShoppingBag,
  Percent
} from "lucide-react"
import { useState, useEffect, useRef } from "react"
import { cn } from "@/lib/utils"
import { gameAssets } from "@/lib/assets"
import { getCachedUser } from "@/lib/auth-cache"

const IndonesiaFlag = ({ className = "h-3.5 w-5" }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 3 2" className={cn("rounded-sm object-cover shadow-sm inline-block border border-sky-border shrink-0", className)}>
    <rect width="3" height="1" fill="#e9232c" />
    <rect y="1" width="3" height="1" fill="#fff" />
  </svg>
)

const USFlag = ({ className = "h-3.5 w-5" }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 13" className={cn("rounded-sm object-cover shadow-sm inline-block border border-sky-border shrink-0", className)}>
    <rect width="20" height="13" fill="#b22234" />
    <path d="M0,1h20M0,3h20M0,5h20M0,7h20M0,9h20M0,11h20" stroke="#fff" strokeWidth="1" />
    <rect width="8" height="7" fill="#3c3b6e" />
    <circle cx="1.5" cy="1.5" r="0.4" fill="#fff" />
    <circle cx="3.5" cy="1.5" r="0.4" fill="#fff" />
    <circle cx="5.5" cy="1.5" r="0.4" fill="#fff" />
    <circle cx="2.5" cy="3.5" r="0.4" fill="#fff" />
    <circle cx="4.5" cy="3.5" r="0.4" fill="#fff" />
    <circle cx="6.5" cy="3.5" r="0.4" fill="#fff" />
    <circle cx="1.5" cy="5.5" r="0.4" fill="#fff" />
    <circle cx="3.5" cy="5.5" r="0.4" fill="#fff" />
    <circle cx="5.5" cy="5.5" r="0.4" fill="#fff" />
  </svg>
)

interface HeaderProps {
  user?: {
    name: string
    email: string
    role: string
  } | null
}

const staticGames = [
  { name: "Free Fire", publisher: "Garena", image: gameAssets["free-fire"].icon, slug: "free-fire" },
  { name: "Mobile Legends", publisher: "Moonton", image: gameAssets["mobile-legends"].icon, slug: "mobile-legends" },
  { name: "ROBLOX - Voucher", publisher: "Roblox Corporation", image: gameAssets.roblox.icon, slug: "roblox" },
  { name: "Honor Of Kings", publisher: "Tencent Games", image: gameAssets["honor-of-kings"].icon, slug: "honor-of-kings" },
  { name: "Valorant", publisher: "Riot Games", image: gameAssets.valorant.icon, slug: "valorant" },
  { name: "PUBG Mobile", publisher: "Tencent Games", image: gameAssets["pubg-mobile"].icon, slug: "pubg-mobile" },
  { name: "Genshin Impact", publisher: "HoYoverse", image: gameAssets["genshin-impact"].icon, slug: "genshin-impact" },
  { name: "Steam Wallet", publisher: "Valve", image: gameAssets.steam.icon, slug: "steam" },
  { name: "TikTok Live", publisher: "TikTok", image: gameAssets.tiktok.icon, slug: "tiktok" },
  { name: "Bigo Live", publisher: "BIGO", image: gameAssets.bigo.icon, slug: "bigo" }
]

export function Header({ user }: HeaderProps) {
  const pathname = usePathname()
  const router = useRouter()

  // Base states
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [currentUser, setCurrentUser] = useState<any>(() => {
    return user || null
  })

  // Search states
  const [searchQuery, setSearchQuery] = useState("")
  const [games, setGames] = useState<any[]>([])
  const [filteredGames, setFilteredGames] = useState<any[]>([])
  const [searchFocused, setSearchFocused] = useState(false)
  const searchContainerRef = useRef<HTMLDivElement>(null)

  // Language & Currency states
  const [showLangModal, setShowLangModal] = useState(false)
  const [selectedLocation, setSelectedLocation] = useState("id")
  const [selectedLang, setSelectedLang] = useState("id")

  // Logout confirmation modal state
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false)

  // Sidebar collapse state
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    if (typeof window !== "undefined") {
      const stored = window.localStorage.getItem("topup_sidebar_collapsed")
      setIsSidebarCollapsed(stored === "true")
    }
  }, [])

  const toggleSidebar = () => {
    const nextState = !isSidebarCollapsed
    setIsSidebarCollapsed(nextState)
    if (typeof window !== "undefined") {
      window.localStorage.setItem("topup_sidebar_collapsed", String(nextState))
      window.dispatchEvent(new Event("sidebar-toggle"))
    }
  }

  useEffect(() => {
    if (typeof window !== "undefined") {
      const htmlEl = document.documentElement
      const isAuth = !!currentUser
      if (isAuth) {
        htmlEl.classList.add("has-user")
        htmlEl.classList.remove("no-user")
        if (isSidebarCollapsed) {
          htmlEl.classList.add("sidebar-collapsed")
          htmlEl.classList.remove("sidebar-expanded")
        } else {
          htmlEl.classList.add("sidebar-expanded")
          htmlEl.classList.remove("sidebar-collapsed")
        }
      } else {
        htmlEl.classList.add("no-user")
        htmlEl.classList.remove("has-user", "sidebar-collapsed", "sidebar-expanded")
      }
    }
  }, [currentUser, isSidebarCollapsed])

  useEffect(() => {
    if (user !== undefined) {
      const cached = getCachedUser()
      if (!user && cached) {
        setCurrentUser(cached)
      } else {
        setCurrentUser(user)
      }
      return
    }

    // Read initial cached user immediately on mount
    const cached = getCachedUser()
    if (cached !== undefined) {
      setCurrentUser(cached)
    }

    const fetchUser = async () => {
      try {
        const res = await fetch("/api/auth/me")
        const json = await res.json()
        
        if (json.user) {
          const userObj = {
            name: json.user.name || '',
            email: json.user.email || '',
            role: json.user.role || 'user'
          }
          setCurrentUser(userObj)
          
          // Save to cache
          const { setCachedUser } = await import("@/lib/auth-cache")
          setCachedUser(userObj)
        } else {
          setCurrentUser(null)
          const { setCachedUser } = await import("@/lib/auth-cache")
          setCachedUser(null)
        }
      } catch (e) {
        // Fallback if API is not ready
      }
    }
    fetchUser()

    // Listen to global auth state changes
    const handleAuthChange = () => {
      const cached = getCachedUser()
      setCurrentUser(cached || null)
    }
    window.addEventListener("auth-state-change", handleAuthChange)
    return () => {
      window.removeEventListener("auth-state-change", handleAuthChange)
    }
  }, [user])
  
  useEffect(() => {
    const fetchGames = async () => {
      try {
        const res = await fetch("/api/calculator/data")
        const json = await res.json()

        if (json.games) {
          setGames(json.games.map((g: any) => ({
            name: g.name,
            publisher: g.category || "Game",
            image: gameAssets[g.slug as keyof typeof gameAssets]?.icon || g.image || "/assets/games/mobile-legends/icon.png",
            slug: g.slug
          })))
        }
      } catch (e) {
        console.error("Failed to fetch games for search:", e)
      }
    }
    fetchGames()
  }, [])

  useEffect(() => {
    if (typeof window !== "undefined") {
      setSelectedLocation(window.localStorage.getItem("topup_location") || "id")
      setSelectedLang(window.localStorage.getItem("topup_lang") || "id")
    }
  }, [])

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
        setSearchFocused(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredGames([])
      return
    }
    const query = searchQuery.toLowerCase()
    const gamesList = games.length > 0 ? games : staticGames
    const matches = gamesList.filter(g =>
      g.name.toLowerCase().includes(query) ||
      g.publisher.toLowerCase().includes(query)
    )
    setFilteredGames(matches)
  }, [searchQuery, games])

  const handleLogout = async () => {
    try {
      const { setCachedUser } = await import("@/lib/auth-cache")
      setCachedUser(null)
      await fetch("/api/auth/logout", { method: "POST" })
      
      // Try to sign out client-side for completeness, if Supabase is configured
      try {
        const { createClient } = await import("@/lib/supabase/client")
        const supabase = createClient()
        await supabase.auth.signOut()
      } catch (_) {}
    } catch (e) {
      console.error("Logout failed:", e)
    }
    window.location.href = "/"
  }

  const handleSaveLangSettings = () => {
    if (typeof window !== "undefined") {
      window.localStorage.setItem("topup_location", selectedLocation)
      window.localStorage.setItem("topup_currency", selectedLocation === "id" ? "IDR" : "USD")
      window.localStorage.setItem("topup_lang", selectedLang)
    }
    setShowLangModal(false)
    window.location.reload()
  }

  const t = {
    topup: selectedLang === "id" ? "Topup" : "Topup",
    check: selectedLang === "id" ? "Cek Transaksi" : "Check Order",
    leaderboard: selectedLang === "id" ? "Leaderboard" : "Leaderboard",
    calculator: selectedLang === "id" ? "Kalkulator" : "Optimizer",
    history: selectedLang === "id" ? "Riwayat Transaksi" : "Transaction History",
    masuk: selectedLang === "id" ? "Masuk" : "Sign In",
    daftar: selectedLang === "id" ? "Daftar" : "Register",
    logout: selectedLang === "id" ? "Keluar" : "Log Out",
    searchPlaceholder: selectedLang === "id" ? "Cari game favorit..." : "Search game..."
  }

  const navLinks = [
    { href: "/", label: t.topup, icon: Zap },
    { href: "/check", label: t.check, icon: Search },
    { href: "/leaderboard", label: t.leaderboard, icon: Award },
    { href: "/calculator", label: t.calculator, icon: Calculator },
  ]

  const isActive = (href: string) => href === "/" ? pathname === "/" : pathname.startsWith(href)

  // Sky Fantasy bevel styles
  const bevelStyle = {
    clipPath: "polygon(10px 0%, calc(100% - 10px) 0%, 100% 10px, 100% calc(100% - 10px), calc(100% - 10px) 100%, 10px 100%, 0% calc(100% - 10px), 0% 10px)"
  }
  const inputBevelStyle = {
    clipPath: "polygon(8px 0%, calc(100% - 8px) 0%, 100% 8px, 100% calc(100% - 8px), calc(100% - 8px) 100%, 8px 100%, 0% calc(100% - 8px), 0% 8px)"
  }

  return (
    <>
      {/* Top Navbar - Sky Fantasy Glassmorphism Light */}
      <header className="sticky top-0 z-50 w-full border-b border-sky-border bg-white/80 backdrop-blur-xl shadow-sky-soft">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3.5 sm:px-6 lg:px-8">

          {/* Left: Logo */}
          <Link href="/" className="group flex items-center gap-3 shrink-0 relative z-20">
            <div className="h-10 w-10 rounded-lg overflow-hidden bg-white border border-sky-border shadow-sky-soft group-hover:border-sky/50 group-hover:shadow-sky-medium transition-all duration-300">
              <img src="/mitsuru.png" alt="Mitsuru Logo" className="h-full w-full object-cover" />
            </div>
            <span className="hidden sm:block">
              <span className="block text-left text-base font-black tracking-wider uppercase text-text-primary group-hover:text-sky transition-colors">Mitsuru</span>
              <span className="block text-left text-[10px] font-bold text-text-muted uppercase tracking-widest leading-none">Top Up HUB</span>
            </span>
          </Link>

          {/* Center: Search input with real-time live preview */}
          <div ref={searchContainerRef} className="relative flex-1 max-w-md mx-2 md:mx-6">
            <div className="relative flex items-center">
              <span className="absolute left-4 text-text-muted pointer-events-none">
                <Search className="h-4 w-4" />
              </span>
              <input
                type="text"
                placeholder={t.searchPlaceholder}
                value={searchQuery}
                onFocus={() => setSearchFocused(true)}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-white border border-sky-border rounded-full pl-11 pr-10 py-2 text-xs font-semibold text-text-primary placeholder:text-text-muted outline-none transition-all duration-300 hover:border-sky/50 focus:border-sky focus:ring-2 focus:ring-sky/20 focus:bg-white"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 p-1 rounded-full text-text-muted hover:text-text-primary transition"
                  type="button"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>

            {/* Live Search Dropdown */}
            {searchFocused && filteredGames.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-sky-border rounded-xl shadow-sky-medium overflow-hidden z-50 p-2 space-y-1 max-h-80 overflow-y-auto animate-fadeIn">
                <p className="text-[9px] font-black text-text-muted uppercase tracking-wider px-3 py-1.5 border-b border-sky-border mb-1">
                  Hasil Pencarian Game ({filteredGames.length})
                </p>
                {filteredGames.map((game) => (
                  <Link
                    key={game.slug}
                    href={`/games/${game.slug}`}
                    onClick={() => {
                      setSearchQuery("")
                      setSearchFocused(false)
                    }}
                    className="flex items-center gap-3.5 p-2 hover:bg-ice rounded-lg group transition-colors"
                  >
                    <div className="h-10 w-10 rounded-lg overflow-hidden shrink-0 border border-sky-border group-hover:border-sky/30 transition-colors">
                      <img src={game.image} alt={game.name} className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300" />
                    </div>
                    <div>
                      <p className="text-xs font-extrabold text-text-primary group-hover:text-sky transition-colors uppercase tracking-tight">{game.name}</p>
                      <p className="text-[9px] font-bold text-text-muted uppercase tracking-wider">{game.publisher}</p>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Right: Language, Profile, and Mobile Hamburger */}
          <div className="flex items-center gap-3 shrink-0">

            {/* Lang / Currency selector */}
            <button
              onClick={() => setShowLangModal(true)}
              className="flex items-center gap-1.5 px-3 py-2 border border-sky-border rounded-full bg-white hover:bg-ice text-text-primary hover:text-sky transition duration-300 text-xs font-bold shadow-sky-soft"
              title="Pilih Lokasi & Bahasa"
            >
              <span>{selectedLocation === "id" ? <IndonesiaFlag /> : <USFlag />}</span>
              <span className="hidden md:inline">{selectedLocation === "id" ? "ID / IDR" : "US / USD"}</span>
            </button>

            {/* Desktop Navigation for Public (Non-authenticated User) */}
            {!currentUser && (
              <nav className="hidden lg:flex items-center gap-1.5">
                {navLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={cn(
                      "border px-4 py-2 text-xs font-black uppercase tracking-wider rounded-full transition-all duration-300",
                      isActive(link.href)
                        ? "border-sky-border bg-white text-sky shadow-sky-soft"
                        : "border-transparent text-text-secondary hover:text-sky hover:bg-ice"
                    )}
                  >
                    {link.label}
                  </Link>
                ))}
              </nav>
            )}

            {/* Auth Buttons / Profile summary */}
            <div className="hidden lg:flex items-center gap-2">
              {currentUser ? (
                <>
                  <Link href="/dashboard" className="flex items-center gap-1.5 border border-sky-border bg-white text-text-primary hover:text-sky px-5 py-2 text-xs font-black uppercase tracking-widest rounded-full transition-all duration-300 shadow-sky-soft hover:shadow-sky-medium">
                    <User className="h-3.5 w-3.5 text-sky" />
                    {currentUser.name}
                  </Link>
                  <button
                    onClick={() => setShowLogoutConfirm(true)}
                    className="p-2 border border-sky-border hover:border-red-400/30 rounded-full bg-white hover:bg-red-50 text-text-muted hover:text-red-500 transition duration-300 flex items-center justify-center h-[34px] w-[34px]"
                    title="Keluar"
                  >
                    <LogOut className="h-4 w-4" />
                  </button>
                </>
              ) : (
                <Link href="/auth/login" className="flex items-center gap-1.5 border border-sky-border bg-white text-sky hover:bg-sky hover:text-white px-5 py-2 text-xs font-black uppercase tracking-widest rounded-full transition-all duration-300 shadow-sky-soft hover:shadow-sky-medium shimmer-hover">
                  <UserRoundPlus className="h-3.5 w-3.5" />
                  {t.masuk}
                </Link>
              )}
            </div>

            {/* Mobile Hamburger menu trigger */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-xl border border-sky-border hover:border-sky/30 text-text-secondary hover:text-sky transition-all bg-white"
              aria-label="Menu"
            >
              <Menu className="h-5 w-5" />
            </button>

          </div>
        </div>

        {/* Mobile menu expanded overlay drawer */}
        {mobileMenuOpen && (
          <div className="border-t border-sky-border px-4 pb-6 pt-3 lg:hidden bg-white/95 backdrop-blur-xl animate-fadeIn relative z-40">
            <div className="grid grid-cols-2 gap-2.5">

              {/* If Authenticated: show user panel links */}
              {currentUser && (
                <>
                  <div className="col-span-2 p-3 bg-ice border border-sky-border rounded-xl flex items-center gap-3 mb-2">
                    <span className="grid h-8 w-8 place-items-center rounded-full bg-sky/10 text-sky">
                      <User className="h-4 w-4" />
                    </span>
                    <div>
                      <p className="text-xs font-extrabold text-text-primary uppercase tracking-tight">{currentUser.name}</p>
                      <p className="text-[9px] font-bold text-text-muted uppercase tracking-widest leading-none">{currentUser.role === 'admin' ? 'Administrator' : 'Gamer Member'}</p>
                    </div>
                  </div>
                  <Link
                    href="/dashboard"
                    className={cn(
                      "col-span-2 nav-btn rounded-lg border border-transparent px-4 py-2.5 text-xs font-black uppercase tracking-wider text-left text-text-secondary flex items-center gap-2",
                      pathname === "/dashboard" && "nav-active bg-sky/10 text-sky"
                    )}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <LayoutDashboard className="h-4 w-4 text-sky" />
                    Dashboard
                  </Link>
                </>
              )}

              {/* Navigation links for everyone */}
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "nav-btn rounded-lg border border-transparent px-4 py-2.5 text-xs font-black uppercase tracking-wider text-text-secondary flex items-center gap-2",
                    isActive(link.href) && "nav-active bg-sky/10 text-sky"
                  )}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <link.icon className="h-4 w-4 text-sky" />
                  {link.label}
                </Link>
              ))}

              {/* If authenticated & is admin: show admin links */}
              {currentUser && currentUser.role === "admin" && (
                <>
                  <div className="col-span-2 border-t border-sky-border my-2 pt-2">
                    <p className="text-[9px] font-black text-text-muted uppercase tracking-widest px-1">Admin Panel Control</p>
                  </div>
                  <Link
                    href="/admin"
                    className={cn(
                      "nav-btn rounded-lg border border-transparent px-4 py-2.5 text-xs font-black uppercase tracking-wider text-text-secondary flex items-center gap-2",
                      pathname === "/admin" && "nav-active bg-sky/10 text-sky"
                    )}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <Shield className="h-4 w-4 text-red-400" />
                    Admin Room
                  </Link>
                  <Link
                    href="/admin/games"
                    className={cn(
                      "nav-btn rounded-lg border border-transparent px-4 py-2.5 text-xs font-black uppercase tracking-wider text-text-secondary flex items-center gap-2",
                      pathname === "/admin/games" && "nav-active bg-sky/10 text-sky"
                    )}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Kelola Game
                  </Link>
                  <Link
                    href="/admin/products"
                    className={cn(
                      "nav-btn rounded-lg border border-transparent px-4 py-2.5 text-xs font-black uppercase tracking-wider text-text-secondary flex items-center gap-2",
                      pathname === "/admin/products" && "nav-active bg-sky/10 text-sky"
                    )}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Kelola Produk
                  </Link>
                  <Link
                    href="/admin/transactions"
                    className={cn(
                      "nav-btn rounded-lg border border-transparent px-4 py-2.5 text-xs font-black uppercase tracking-wider text-text-secondary flex items-center gap-2",
                      pathname === "/admin/transactions" && "nav-active bg-sky/10 text-sky"
                    )}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Transaksi Masuk
                  </Link>
                  <Link
                    href="/admin/promos"
                    className={cn(
                      "nav-btn rounded-lg border border-transparent px-4 py-2.5 text-xs font-black uppercase tracking-wider text-text-secondary flex items-center gap-2",
                      pathname === "/admin/promos" && "nav-active bg-sky/10 text-sky"
                    )}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <Percent className="h-4 w-4 text-sky" />
                    Kelola Promo
                  </Link>
                </>
              )}

              {/* Bottom buttons inside mobile menu */}
              {currentUser ? (
                <button
                  onClick={() => {
                    setMobileMenuOpen(false)
                    setShowLogoutConfirm(true)
                  }}
                  className="col-span-2 rounded-xl border border-red-200 bg-red-50 py-3 text-xs font-black uppercase tracking-widest text-red-500 text-center transition hover:bg-red-100 mt-4"
                >
                  {t.logout}
                </button>
              ) : (
                <Link
                  href="/auth/login"
                  className="col-span-2 text-center"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <div className="relative p-[1px] bg-gradient-to-r from-sky to-diamond rounded-xl">
                    <span className="w-full block bg-white py-3 text-xs font-black uppercase tracking-widest text-sky rounded-xl">
                      {t.masuk}
                    </span>
                  </div>
                </Link>
              )}

            </div>
          </div>
        )}
      </header>

      {/* Persistent Left Sidebar Navigation for Logged-In User on Desktop - Sky Fantasy */}
      {mounted && currentUser && (
        <aside className={cn(
          "fixed top-[65px] left-0 bottom-0 bg-white/90 border-r border-sky-border z-40 p-4 flex flex-col justify-between hidden lg:flex backdrop-blur-md transition-all duration-300 ease-in-out shadow-sky-soft",
          isSidebarCollapsed ? "w-20" : "w-64"
        )}>
          <div className="space-y-6">

            {/* Collapse Toggle Button */}
            <div className={cn("flex items-center", isSidebarCollapsed ? "justify-center" : "justify-between px-1")}>
              {!isSidebarCollapsed && (
                <span className="text-[10px] font-black text-text-muted uppercase tracking-widest animate-fadeIn">Pusat Navigasi</span>
              )}
              <button
                onClick={toggleSidebar}
                className="p-1.5 rounded-lg border border-sky-border hover:border-sky/30 text-text-muted hover:text-sky hover:bg-ice transition-all"
                title={isSidebarCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
              >
                {isSidebarCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
              </button>
            </div>

            {/* User Profile Info Card inside Sidebar */}
            <div className={cn(
              "p-3 bg-ice border border-sky-border rounded-xl flex items-center transition-all duration-300",
              isSidebarCollapsed ? "justify-center" : "gap-3"
            )}>
              <span className="grid h-9 w-9 place-items-center rounded-full bg-sky/10 text-sky border border-sky/20 shrink-0">
                <User className="h-4 w-4" />
              </span>
              {!isSidebarCollapsed && (
                <div className="overflow-hidden animate-fadeIn">
                  <p className="text-xs font-extrabold text-text-primary uppercase tracking-tight truncate">{currentUser.name}</p>
                  <p className="text-[9px] font-bold text-text-muted uppercase tracking-widest mt-0.5">{currentUser.role === 'admin' ? 'Administrator' : 'Gamer Member'}</p>
                </div>
              )}
            </div>

            {/* Sidebar Navigation Links */}
            <div className="space-y-1">
              {!isSidebarCollapsed ? (
                <p className="text-[9px] font-black text-text-muted uppercase tracking-widest px-3 mb-2 animate-fadeIn">Menu Utama</p>
              ) : (
                <div className="h-2" />
              )}

              <Link
                href="/dashboard"
                className={cn(
                  "flex items-center rounded-lg text-xs font-bold text-text-secondary hover:text-sky hover:bg-ice transition-all duration-200 group border border-transparent",
                  isSidebarCollapsed ? "justify-center p-2.5" : "gap-3 px-3 py-2.5",
                  pathname === "/dashboard" && "bg-sky/10 text-sky hover:text-sky hover:bg-sky/10 border-sky/10"
                )}
                title={isSidebarCollapsed ? "Dashboard" : undefined}
              >
                <LayoutDashboard className="h-4 w-4 group-hover:scale-105 transition-transform" />
                {!isSidebarCollapsed && <span className="animate-fadeIn">Dashboard</span>}
              </Link>

              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "flex items-center rounded-lg text-xs font-bold text-text-secondary hover:text-sky hover:bg-ice transition-all duration-200 group border border-transparent",
                    isSidebarCollapsed ? "justify-center p-2.5" : "gap-3 px-3 py-2.5",
                    isActive(link.href) && "bg-sky/10 text-sky hover:text-sky hover:bg-sky/10 border-sky/10"
                  )}
                  title={isSidebarCollapsed ? link.label : undefined}
                >
                  <link.icon className="h-4 w-4 group-hover:scale-105 transition-transform" />
                  {!isSidebarCollapsed && <span className="animate-fadeIn">{link.label}</span>}
                </Link>
              ))}

              <Link
                href="/history"
                className={cn(
                  "flex items-center rounded-lg text-xs font-bold text-text-secondary hover:text-sky hover:bg-ice transition-all duration-200 group border border-transparent",
                  isSidebarCollapsed ? "justify-center p-2.5" : "gap-3 px-3 py-2.5",
                  pathname === "/history" && "bg-sky/10 text-sky hover:text-sky hover:bg-sky/10 border-sky/10"
                )}
                title={isSidebarCollapsed ? t.history : undefined}
              >
                <History className="h-4 w-4 group-hover:scale-105 transition-transform" />
                {!isSidebarCollapsed && <span className="animate-fadeIn">{t.history}</span>}
              </Link>
            </div>

            {/* Admin Specific Links */}
            {currentUser.role === "admin" && (
              <div className="space-y-1 border-t border-sky-border pt-4">
                {!isSidebarCollapsed ? (
                  <p className="text-[9px] font-black text-text-muted uppercase tracking-widest px-3 mb-2 animate-fadeIn">Admin Panel</p>
                ) : (
                  <div className="h-2" />
                )}

                <Link
                  href="/admin"
                  className={cn(
                    "flex items-center rounded-lg text-xs font-bold text-text-secondary hover:text-sky hover:bg-ice transition-all duration-200 group border border-transparent",
                    isSidebarCollapsed ? "justify-center p-2.5" : "gap-3 px-3 py-2.5",
                    pathname === "/admin" && "bg-sky/10 text-sky hover:text-sky hover:bg-sky/10 border-sky/10"
                  )}
                  title={isSidebarCollapsed ? "Admin Room" : undefined}
                >
                  <Shield className="h-4 w-4 group-hover:scale-105 transition-transform" />
                  {!isSidebarCollapsed && <span className="animate-fadeIn">Admin Room</span>}
                </Link>

                <Link
                  href="/admin/games"
                  className={cn(
                    "flex items-center rounded-lg text-xs font-bold text-text-secondary hover:text-sky hover:bg-ice transition-all duration-200 group border border-transparent",
                    isSidebarCollapsed ? "justify-center p-2.5" : "gap-3 px-3 py-2.5",
                    pathname === "/admin/games" && "bg-sky/10 text-sky hover:text-sky hover:bg-sky/10 border-sky/10"
                  )}
                  title={isSidebarCollapsed ? "Kelola Game" : undefined}
                >
                  <Gamepad2 className="h-4 w-4 group-hover:scale-105 transition-transform" />
                  {!isSidebarCollapsed && <span className="animate-fadeIn">Kelola Game</span>}
                </Link>

                <Link
                  href="/admin/products"
                  className={cn(
                    "flex items-center rounded-lg text-xs font-bold text-text-secondary hover:text-sky hover:bg-ice transition-all duration-200 group border border-transparent",
                    isSidebarCollapsed ? "justify-center p-2.5" : "gap-3 px-3 py-2.5",
                    pathname === "/admin/products" && "bg-sky/10 text-sky hover:text-sky hover:bg-sky/10 border-sky/10"
                  )}
                  title={isSidebarCollapsed ? "Kelola Produk" : undefined}
                >
                  <ShoppingBag className="h-4 w-4 group-hover:scale-105 transition-transform" />
                  {!isSidebarCollapsed && <span className="animate-fadeIn">Kelola Produk</span>}
                </Link>

                <Link
                  href="/admin/transactions"
                  className={cn(
                    "flex items-center rounded-lg text-xs font-bold text-text-secondary hover:text-sky hover:bg-ice transition-all duration-200 group border border-transparent",
                    isSidebarCollapsed ? "justify-center p-2.5" : "gap-3 px-3 py-2.5",
                    pathname === "/admin/transactions" && "bg-sky/10 text-sky hover:text-sky hover:bg-sky/10 border-sky/10"
                  )}
                  title={isSidebarCollapsed ? "Transaksi Masuk" : undefined}
                >
                  <History className="h-4 w-4 group-hover:scale-105 transition-transform" />
                  {!isSidebarCollapsed && <span className="animate-fadeIn">Transaksi Masuk</span>}
                </Link>
                <Link
                  href="/admin/promos"
                  className={cn(
                    "flex items-center rounded-lg text-xs font-bold text-text-secondary hover:text-sky hover:bg-ice transition-all duration-200 group border border-transparent",
                    isSidebarCollapsed ? "justify-center p-2.5" : "gap-3 px-3 py-2.5",
                    pathname === "/admin/promos" && "bg-sky/10 text-sky hover:text-sky hover:bg-sky/10 border-sky/10"
                  )}
                  title={isSidebarCollapsed ? "Kelola Promo" : undefined}
                >
                  <Percent className="h-4 w-4 group-hover:scale-105 transition-transform" />
                  {!isSidebarCollapsed && <span className="animate-fadeIn">Kelola Promo</span>}
                </Link>
              </div>
            )}

          </div>

          {/* Sidebar Bottom: Logout Button */}
          <div className="border-t border-sky-border pt-4">
            <button
              onClick={() => setShowLogoutConfirm(true)}
              className={cn(
                "flex items-center w-full rounded-lg text-xs font-black uppercase tracking-wider text-red-500 hover:bg-red-50 hover:text-red-400 transition-all border border-transparent",
                isSidebarCollapsed ? "justify-center p-2.5" : "gap-3 px-3 py-2.5"
              )}
              title={isSidebarCollapsed ? t.logout : undefined}
            >
              <LogOut className="h-4 w-4" />
              {!isSidebarCollapsed && <span className="animate-fadeIn">{t.logout}</span>}
            </button>
          </div>
        </aside>
      )}

      {/* Language & Location Setting Modal - Sky Fantasy */}
      {showLangModal && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white p-6 md:p-8 rounded-[24px] border border-sky-border shadow-sky-medium relative animate-fadeIn">

            <button
              onClick={() => setShowLangModal(false)}
              className="absolute top-4 right-4 p-1.5 rounded-full bg-ice hover:bg-sky/10 text-text-muted hover:text-sky transition"
              type="button"
            >
              <X className="h-4 w-4" />
            </button>

            <h3 className="text-lg font-black uppercase text-text-primary tracking-tight mb-6 flex items-center gap-2">
              <Globe className="h-5 w-5 text-sky" />
              Pengaturan Lokasi &amp; Bahasa
            </h3>

            <div className="space-y-6">

              {/* Location Select (Currency) */}
              <div className="space-y-2.5">
                <label className="text-xs font-black uppercase tracking-wider text-text-secondary block">
                  Lokasi &amp; Mata Uang
                </label>

                {/* Option 1: Indonesia */}
                <button
                  onClick={() => setSelectedLocation("id")}
                  className={`w-full flex items-center justify-between p-4 border rounded-xl transition duration-300 ${
                    selectedLocation === "id"
                      ? "border-sky/40 bg-sky/5 text-text-primary font-bold"
                      : "border-sky-border bg-white text-text-secondary hover:border-sky/30 hover:bg-ice"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <IndonesiaFlag className="h-4 w-6" />
                    <span className="text-xs">Indonesia (IDR - Rupiah)</span>
                  </div>
                  {selectedLocation === "id" && <Check className="h-4 w-4 text-sky" />}
                </button>

                {/* Option 2: US */}
                <button
                  onClick={() => setSelectedLocation("us")}
                  className={`w-full flex items-center justify-between p-4 border rounded-xl transition duration-300 ${
                    selectedLocation === "us"
                      ? "border-sky/40 bg-sky/5 text-text-primary font-bold"
                      : "border-sky-border bg-white text-text-secondary hover:border-sky/30 hover:bg-ice"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <USFlag className="h-4 w-6" />
                    <span className="text-xs">United States (USD - Dollar)</span>
                  </div>
                  {selectedLocation === "us" && <Check className="h-4 w-4 text-sky" />}
                </button>
              </div>

              {/* Language Selection */}
              <div className="space-y-2.5">
                <label className="text-xs font-black uppercase tracking-wider text-text-secondary block">
                  Bahasa (Language)
                </label>
                <div className="grid grid-cols-2 gap-3">

                  {/* Indonesian */}
                  <button
                    onClick={() => setSelectedLang("id")}
                    className={`flex items-center justify-center gap-2 p-3 border rounded-xl transition duration-300 ${
                      selectedLang === "id"
                        ? "border-sky/40 bg-sky/5 text-text-primary font-bold"
                        : "border-sky-border bg-white text-text-secondary hover:border-sky/30 hover:bg-ice"
                    }`}
                  >
                    <IndonesiaFlag />
                    <span className="text-xs">Indonesia</span>
                  </button>

                  {/* English */}
                  <button
                    onClick={() => setSelectedLang("en")}
                    className={`flex items-center justify-center gap-2 p-3 border rounded-xl transition duration-300 ${
                      selectedLang === "en"
                        ? "border-sky/40 bg-sky/5 text-text-primary font-bold"
                        : "border-sky-border bg-white text-text-secondary hover:border-sky/30 hover:bg-ice"
                    }`}
                  >
                    <USFlag />
                    <span className="text-xs">English</span>
                  </button>

                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 justify-end pt-4 border-t border-sky-border">
                <button
                  onClick={() => setShowLangModal(false)}
                  className="px-5 py-2.5 text-xs font-bold text-text-secondary hover:text-text-primary transition"
                  type="button"
                >
                  Batal
                </button>
                <button
                  onClick={handleSaveLangSettings}
                  className="px-6 py-2.5 text-xs font-black uppercase tracking-widest bg-sky text-white hover:bg-diamond transition-colors rounded-xl shadow-sky-soft"
                >
                  Simpan Perubahan
                </button>
              </div>

            </div>

          </div>
        </div>
      )}

      {/* Logout Confirmation Modal Dialog - Sky Fantasy */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-white p-6 md:p-8 rounded-[24px] border border-sky-border shadow-sky-medium relative animate-fadeIn">

            <button
              onClick={() => setShowLogoutConfirm(false)}
              className="absolute top-4 right-4 p-1.5 rounded-full bg-ice hover:bg-sky/10 text-text-muted hover:text-sky transition"
              type="button"
            >
              <X className="h-4 w-4" />
            </button>

            <h3 className="text-lg font-black uppercase text-text-primary tracking-tight mb-2">
              Konfirmasi Keluar
            </h3>
            <p className="text-xs text-text-secondary mb-6 leading-relaxed">
              Apakah Anda yakin ingin mengakhiri sesi pendaftaran dan keluar dari Mitsuru?
            </p>

            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowLogoutConfirm(false)}
                className="px-4 py-2.5 text-xs font-bold text-text-secondary hover:text-text-primary transition"
              >
                Batal
              </button>
              <button
                onClick={handleLogout}
                className="px-5 py-2.5 text-xs font-black uppercase tracking-widest bg-red-500 text-white hover:bg-red-600 transition-colors rounded-xl shadow-sky-soft"
              >
                Ya, Keluar
              </button>
            </div>

          </div>
        </div>
      )}
    </>
  )
}
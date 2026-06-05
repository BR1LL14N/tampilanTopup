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
  Sun,
  Moon,
  ChevronLeft,
  ChevronRight,
  Gamepad2,
  ShoppingBag
} from "lucide-react"
import { useState, useEffect, useRef } from "react"
import { cn } from "@/lib/utils"
import { gameAssets } from "@/lib/assets"

const IndonesiaFlag = ({ className = "h-3.5 w-5" }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 3 2" className={cn("rounded-sm object-cover shadow-sm inline-block border border-white/10 shrink-0", className)}>
    <rect width="3" height="1" fill="#e9232c" />
    <rect y="1" width="3" height="1" fill="#fff" />
  </svg>
)

const USFlag = ({ className = "h-3.5 w-5" }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 13" className={cn("rounded-sm object-cover shadow-sm inline-block border border-white/10 shrink-0", className)}>
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
  const [currentUser, setCurrentUser] = useState<any>(user || null)
  
  // Search states
  const [searchQuery, setSearchQuery] = useState("")
  const [filteredGames, setFilteredGames] = useState<any[]>([])
  const [searchFocused, setSearchFocused] = useState(false)
  const searchContainerRef = useRef<HTMLDivElement>(null)

  // Language & Currency states
  const [showLangModal, setShowLangModal] = useState(false)
  const [selectedLocation, setSelectedLocation] = useState("id") // "id" (IDR) or "us" (USD)
  const [selectedLang, setSelectedLang] = useState("id") // "id" (Indonesian) or "en" (English)

  // Logout confirmation modal state
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false)

  // Theme state
  const [theme, setTheme] = useState("dark")

  // Sidebar collapse state
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false)
  const [mounted, setMounted] = useState(false)

  // Initialize collapse state from localStorage on client-side
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
      // Notify SidebarContentWrapper instances on same tab
      window.dispatchEvent(new Event("sidebar-toggle"))
    }
  }

  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedTheme = window.localStorage.getItem("theme") || "dark"
      setTheme(storedTheme)
      if (storedTheme === "dark") {
        document.documentElement.classList.add("dark")
      } else {
        document.documentElement.classList.remove("dark")
      }
    }
  }, [])

  const toggleTheme = () => {
    const nextTheme = theme === "dark" ? "light" : "dark"
    setTheme(nextTheme)
    if (typeof window !== "undefined") {
      window.localStorage.setItem("theme", nextTheme)
      if (nextTheme === "dark") {
        document.documentElement.classList.add("dark")
      } else {
        document.documentElement.classList.remove("dark")
      }
    }
  }

  useEffect(() => {
    if (user !== undefined) {
      setCurrentUser(user)
      return
    }
    const fetchUser = async () => {
      try {
        const { createClient } = await import("@/lib/supabase/client")
        const supabase = createClient()
        const { data } = await supabase.auth.getUser()
        if (data?.user) {
          const { data: profile } = await supabase
            .from("user_profiles")
            .select("role, name")
            .eq("id", data.user.id)
            .single()
          
          setCurrentUser({
            name: profile?.name || data.user.user_metadata?.name || data.user.email || '',
            email: data.user.email || '',
            role: profile?.role || data.user.user_metadata?.role || 'user'
          })
        } else {
          setCurrentUser(null)
        }
      } catch (e) {
        // Fallback if supabase client is not ready
      }
    }
    fetchUser()
  }, [user])

  // Load language and currency selections on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      setSelectedLocation(window.localStorage.getItem("topup_location") || "id")
      setSelectedLang(window.localStorage.getItem("topup_lang") || "id")
    }
  }, [])

  // Close search preview on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
        setSearchFocused(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  // Filter games based on search query
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredGames([])
      return
    }
    const query = searchQuery.toLowerCase()
    const matches = staticGames.filter(g => 
      g.name.toLowerCase().includes(query) || 
      g.publisher.toLowerCase().includes(query)
    )
    setFilteredGames(matches)
  }, [searchQuery])

  const handleLogout = async () => {
    const { createClient } = await import("@/lib/supabase/client")
    const supabase = createClient()
    await supabase.auth.signOut()
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

  // Translations based on selected language
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

  // Hexagonal cuts
  const bevelStyle = {
    clipPath: "polygon(10px 0%, calc(100% - 10px) 0%, 100% 10px, 100% calc(100% - 10px), calc(100% - 10px) 100%, 10px 100%, 0% calc(100% - 10px), 0% 10px)"
  }
  const inputBevelStyle = {
    clipPath: "polygon(8px 0%, calc(100% - 8px) 0%, 100% 8px, 100% calc(100% - 8px), calc(100% - 8px) 100%, 8px 100%, 0% calc(100% - 8px), 0% 8px)"
  }
  const tagBevelStyle = {
    clipPath: "polygon(4px 0%, calc(100% - 4px) 0%, 100% 4px, 100% calc(100% - 4px), calc(100% - 4px) 100%, 4px 100%, 0% calc(100% - 4px), 0% 4px)"
  }

  return (
    <>
      {/* Top Navbar */}
      <header className="sticky top-0 z-50 w-full border-b border-slate-200/80 dark:border-white/10 bg-white/70 dark:bg-ink/85 backdrop-blur-xl shadow-sm dark:shadow-none">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3.5 sm:px-6 lg:px-8">
          
          {/* Left: Logo */}
          <Link href="/" className="group flex items-center gap-3 shrink-0 relative z-20">
            <div className="h-10 w-10 rounded overflow-hidden bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-white/10 shadow-lg shadow-cyan-300/5 group-hover:border-cyan-400/50 transition-all duration-300">
              <img src="/mitsuru.png" alt="Mitsuru Logo" className="h-full w-full object-cover" />
            </div>
            <span className="hidden sm:block">
              <span className="block text-left text-base font-black tracking-wider uppercase text-slate-900 dark:text-white group-hover:text-cyan-600 dark:group-hover:text-cyan-300 transition-colors">Mitsuru</span>
              <span className="block text-left text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest leading-none">Top Up HUB</span>
            </span>
          </Link>

          {/* Center: Search input with real-time live preview */}
          <div ref={searchContainerRef} className="relative flex-1 max-w-md mx-2 md:mx-6">
            <div className="relative flex items-center">
              <span className="absolute left-4 text-slate-500 pointer-events-none">
                <Search className="h-4 w-4" />
              </span>
              <input
                type="text"
                placeholder={t.searchPlaceholder}
                value={searchQuery}
                onFocus={() => setSearchFocused(true)}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-100/80 dark:bg-slate-950/60 border border-slate-200 dark:border-white/10 hover:border-cyan-400/40 dark:hover:border-cyan-300/30 focus:border-cyan-500/60 dark:focus:border-cyan-300/50 focus:bg-white dark:focus:bg-slate-950 rounded-xl pl-11 pr-10 py-2 text-xs font-semibold text-slate-800 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 outline-none transition-all duration-300"
              />
              {searchQuery && (
                <button 
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 p-1 rounded-full text-slate-500 hover:text-white transition"
                  type="button"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>

            {/* Live Search Dropdown */}
            {searchFocused && filteredGames.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-slate-950 border border-white/10 rounded-xl shadow-2xl overflow-hidden z-50 p-2 space-y-1 max-h-80 overflow-y-auto animate-fadeIn backdrop-blur-md">
                <p className="text-[9px] font-black text-slate-500 uppercase tracking-wider px-3 py-1.5 border-b border-white/5 mb-1">
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
                    className="flex items-center gap-3.5 p-2 hover:bg-cyan-300/10 rounded-lg group transition-colors"
                  >
                    <div className="h-10 w-10 rounded-lg overflow-hidden shrink-0 border border-white/5 group-hover:border-cyan-300/20 transition-colors">
                      <img src={game.image} alt={game.name} className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300" />
                    </div>
                    <div>
                      <p className="text-xs font-extrabold text-white group-hover:text-cyan-300 transition-colors uppercase tracking-tight">{game.name}</p>
                      <p className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">{game.publisher}</p>
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
              className="flex items-center gap-1.5 px-3 py-2 border border-slate-200 dark:border-white/10 rounded-lg bg-white dark:bg-slate-950/60 hover:bg-slate-50 dark:hover:bg-slate-950 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition duration-300 text-xs font-bold shadow-sm dark:shadow-none"
              title="Pilih Lokasi & Bahasa"
            >
              <span>{selectedLocation === "id" ? <IndonesiaFlag /> : <USFlag />}</span>
              <span className="hidden md:inline">{selectedLocation === "id" ? "ID / IDR" : "US / USD"}</span>
            </button>

            {/* Theme Toggle sementara di matikan */}
            {/* <button
              onClick={toggleTheme}
              className="p-2 border border-slate-200 dark:border-white/10 rounded-lg bg-white dark:bg-slate-950/60 hover:bg-slate-50 dark:hover:bg-slate-950 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition duration-300 shadow-sm dark:shadow-none"
              title={theme === "dark" ? "Mode Terang" : "Mode Gelap"}
              type="button"
            >
              {theme === "dark" ? (
                <Sun className="h-4 w-4 text-amber-500 animate-pulse" />
              ) : (
                <Moon className="h-4 w-4 text-indigo-500" />
              )}
            </button> */}

            {/* Desktop Navigation for Public (Non-authenticated User) */}
            {!currentUser && (
              <nav className="hidden lg:flex items-center gap-1.5">
                {navLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={cn(
                      "nav-btn rounded-lg border border-transparent px-3 py-2 text-xs font-black uppercase tracking-wider text-slate-300 transition hover:text-white",
                      isActive(link.href) && "nav-active"
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
                  {/* Dashboard link for quick access */}
                  <Link href="/dashboard">
                    <div className="relative p-[1px] bg-white/10 hover:bg-cyan-300/30 transition-all duration-300" style={inputBevelStyle}>
                      <button className="flex items-center gap-1.5 bg-slate-950 px-4 py-2 text-xs font-black uppercase tracking-widest text-slate-300 hover:text-white transition-colors" style={inputBevelStyle}>
                        <User className="h-3.5 w-3.5 text-cyan-400" />
                        {currentUser.name}
                      </button>
                    </div>
                  </Link>
                  <button 
                    onClick={() => setShowLogoutConfirm(true)}
                    className="p-2.5 border border-white/5 hover:border-red-500/30 rounded-lg bg-slate-950/60 hover:bg-red-950/10 text-slate-400 hover:text-red-400 transition duration-300"
                    title="Keluar"
                  >
                    <LogOut className="h-4.5 w-4.5" />
                  </button>
                </>
              ) : (
                <Link href="/auth/login">
                  <div className="relative p-[1px] bg-gradient-to-r from-cyan-300/40 to-blue-500/40 hover:from-cyan-300 hover:to-blue-500 transition-all duration-300" style={inputBevelStyle}>
                    <button className="flex items-center gap-1.5 bg-slate-950/90 px-4 py-2.5 text-xs font-black uppercase tracking-widest text-cyan-300 hover:text-white transition-colors shimmer-hover" style={inputBevelStyle}>
                      <UserRoundPlus className="h-3.5 w-3.5" />
                      {t.masuk}
                    </button>
                  </div>
                </Link>
              )}
            </div>

            {/* Mobile Hamburger menu trigger */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-lg border border-white/10 hover:border-cyan-300/30 text-slate-300 hover:text-white transition-all bg-slate-950/60"
              aria-label="Menu"
            >
              <Menu className="h-5 w-5" />
            </button>

          </div>
        </div>

        {/* Mobile menu expanded overlay drawer */}
        {mobileMenuOpen && (
          <div className="border-t border-white/10 px-4 pb-6 pt-3 lg:hidden bg-slate-950/95 backdrop-blur-xl animate-fadeIn relative z-40">
            <div className="grid grid-cols-2 gap-2.5">
              
              {/* If Authenticated: show user panel links */}
              {currentUser && (
                <>
                  <div className="col-span-2 p-3 bg-white/5 border border-white/5 rounded-xl flex items-center gap-3 mb-2">
                    <span className="grid h-8 w-8 place-items-center rounded-full bg-cyan-300/10 text-cyan-300">
                      <User className="h-4 w-4" />
                    </span>
                    <div>
                      <p className="text-xs font-extrabold text-white uppercase tracking-tight">{currentUser.name}</p>
                      <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest leading-none">{currentUser.role === 'admin' ? 'Administrator' : 'Gamer Member'}</p>
                    </div>
                  </div>
                  <Link 
                    href="/dashboard"
                    className={cn(
                      "col-span-2 nav-btn rounded-lg border border-transparent px-4 py-2.5 text-xs font-black uppercase tracking-wider text-left text-slate-300 flex items-center gap-2",
                      pathname === "/dashboard" && "nav-active bg-cyan-300/10 text-cyan-300"
                    )}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <LayoutDashboard className="h-4 w-4" />
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
                    "nav-btn rounded-lg border border-transparent px-4 py-2.5 text-xs font-black uppercase tracking-wider text-slate-300 flex items-center gap-2",
                    isActive(link.href) && "nav-active bg-cyan-300/10 text-cyan-300"
                  )}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <link.icon className="h-4 w-4 text-cyan-400" />
                  {link.label}
                </Link>
              ))}

              {/* If authenticated & is admin: show admin links */}
              {currentUser && currentUser.role === "admin" && (
                <>
                  <div className="col-span-2 border-t border-white/5 my-2 pt-2">
                    <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest px-1">Admin Panel Control</p>
                  </div>
                  <Link
                    href="/admin"
                    className={cn(
                      "nav-btn rounded-lg border border-transparent px-4 py-2.5 text-xs font-black uppercase tracking-wider text-slate-300 flex items-center gap-2",
                      pathname === "/admin" && "nav-active bg-cyan-300/10 text-cyan-300"
                    )}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <Shield className="h-4 w-4 text-red-400" />
                    Admin Room
                  </Link>
                  <Link
                    href="/admin/games"
                    className={cn(
                      "nav-btn rounded-lg border border-transparent px-4 py-2.5 text-xs font-black uppercase tracking-wider text-slate-300 flex items-center gap-2",
                      pathname === "/admin/games" && "nav-active bg-cyan-300/10 text-cyan-300"
                    )}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Kelola Game
                  </Link>
                  <Link
                    href="/admin/products"
                    className={cn(
                      "nav-btn rounded-lg border border-transparent px-4 py-2.5 text-xs font-black uppercase tracking-wider text-slate-300 flex items-center gap-2",
                      pathname === "/admin/products" && "nav-active bg-cyan-300/10 text-cyan-300"
                    )}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Kelola Produk
                  </Link>
                  <Link
                    href="/admin/transactions"
                    className={cn(
                      "nav-btn rounded-lg border border-transparent px-4 py-2.5 text-xs font-black uppercase tracking-wider text-slate-300 flex items-center gap-2",
                      pathname === "/admin/transactions" && "nav-active bg-cyan-300/10 text-cyan-300"
                    )}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Transaksi Masuk
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
                  className="col-span-2 rounded-lg border border-red-500/20 bg-red-500/15 py-3 text-xs font-black uppercase tracking-widest text-red-400 text-center transition hover:bg-red-500/25 mt-4"
                >
                  {t.logout}
                </button>
              ) : (
                <Link
                  href="/auth/login"
                  className="col-span-2 text-center"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <div className="relative p-[1px] bg-gradient-to-r from-cyan-300 to-blue-500 rounded-lg">
                    <span className="w-full block bg-slate-950 py-3 text-xs font-black uppercase tracking-widest text-cyan-300">
                      {t.masuk}
                    </span>
                  </div>
                </Link>
              )}

            </div>
          </div>
        )}
      </header>

      {/* Persistent Left Sidebar Navigation for Logged-In User on Desktop */}
      {currentUser && (
        <aside className={cn(
          "fixed top-[65px] left-0 bottom-0 bg-slate-900 dark:bg-slate-950/70 border-r border-slate-700/50 dark:border-white/10 z-40 p-4 flex flex-col justify-between hidden lg:flex backdrop-blur-md transition-all duration-300 ease-in-out",
          isSidebarCollapsed ? "w-20" : "w-64"
        )}>
          <div className="space-y-6">
            
            {/* Collapse Toggle Button */}
            <div className={cn("flex items-center", isSidebarCollapsed ? "justify-center" : "justify-between px-1")}>
              {!isSidebarCollapsed && (
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest animate-fadeIn">Pusat Navigasi</span>
              )}
              <button
                onClick={toggleSidebar}
                className="p-1.5 rounded-lg border border-slate-200/10 dark:border-white/10 hover:border-cyan-300/30 text-slate-400 hover:text-cyan-300 hover:bg-slate-950 transition-all"
                title={isSidebarCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
              >
                {isSidebarCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
              </button>
            </div>
            
            {/* User Profile Info Card inside Sidebar */}
            <div className={cn(
              "p-3 bg-slate-950/40 border border-white/5 rounded-xl flex items-center transition-all duration-300",
              isSidebarCollapsed ? "justify-center" : "gap-3"
            )}>
              <span className="grid h-9 w-9 place-items-center rounded-full bg-cyan-300/10 text-cyan-300 border border-cyan-300/20 shrink-0">
                <User className="h-4.5 w-4.5" />
              </span>
              {!isSidebarCollapsed && (
                <div className="overflow-hidden animate-fadeIn">
                  <p className="text-xs font-extrabold text-white uppercase tracking-tight truncate">{currentUser.name}</p>
                  <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mt-0.5">{currentUser.role === 'admin' ? 'Administrator' : 'Gamer Member'}</p>
                </div>
              )}
            </div>

            {/* Sidebar Navigation Links */}
            <div className="space-y-1">
              {!isSidebarCollapsed ? (
                <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest px-3 mb-2 animate-fadeIn">Menu Utama</p>
              ) : (
                <div className="h-2" />
              )}
              
              <Link 
                href="/dashboard"
                className={cn(
                  "flex items-center rounded-lg text-xs font-bold text-slate-400 hover:text-white hover:bg-white/5 transition-all duration-200 group border border-transparent",
                  isSidebarCollapsed ? "justify-center p-2.5" : "gap-3 px-3 py-2.5",
                  pathname === "/dashboard" && "bg-cyan-300/10 text-cyan-300 hover:text-cyan-300 hover:bg-cyan-300/10 border-cyan-300/10"
                )}
                title={isSidebarCollapsed ? "Dashboard" : undefined}
              >
                <LayoutDashboard className="h-4.5 w-4.5 group-hover:scale-105 transition-transform" />
                {!isSidebarCollapsed && <span className="animate-fadeIn">Dashboard</span>}
              </Link>

              {navLinks.map((link) => (
                <Link 
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "flex items-center rounded-lg text-xs font-bold text-slate-400 hover:text-white hover:bg-white/5 transition-all duration-200 group border border-transparent",
                    isSidebarCollapsed ? "justify-center p-2.5" : "gap-3 px-3 py-2.5",
                    isActive(link.href) && "bg-cyan-300/10 text-cyan-300 hover:text-cyan-300 hover:bg-cyan-300/10 border-cyan-300/10"
                  )}
                  title={isSidebarCollapsed ? link.label : undefined}
                >
                  <link.icon className="h-4.5 w-4.5 group-hover:scale-105 transition-transform" />
                  {!isSidebarCollapsed && <span className="animate-fadeIn">{link.label}</span>}
                </Link>
              ))}

              <Link 
                href="/history"
                className={cn(
                  "flex items-center rounded-lg text-xs font-bold text-slate-400 hover:text-white hover:bg-white/5 transition-all duration-200 group border border-transparent",
                  isSidebarCollapsed ? "justify-center p-2.5" : "gap-3 px-3 py-2.5",
                  pathname === "/history" && "bg-cyan-300/10 text-cyan-300 hover:text-cyan-300 hover:bg-cyan-300/10 border-cyan-300/10"
                )}
                title={isSidebarCollapsed ? t.history : undefined}
              >
                <History className="h-4.5 w-4.5 group-hover:scale-105 transition-transform" />
                {!isSidebarCollapsed && <span className="animate-fadeIn">{t.history}</span>}
              </Link>
            </div>

            {/* Admin Specific Links */}
            {currentUser.role === "admin" && (
              <div className="space-y-1 border-t border-white/5 pt-4">
                {!isSidebarCollapsed ? (
                  <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest px-3 mb-2 animate-fadeIn">Admin Panel</p>
                ) : (
                  <div className="h-2" />
                )}
                
                <Link 
                  href="/admin"
                  className={cn(
                    "flex items-center rounded-lg text-xs font-bold text-slate-400 hover:text-white hover:bg-white/5 transition-all duration-200 group border border-transparent",
                    isSidebarCollapsed ? "justify-center p-2.5" : "gap-3 px-3 py-2.5",
                    pathname === "/admin" && "bg-cyan-300/10 text-cyan-300 hover:text-cyan-300 hover:bg-cyan-300/10 border-cyan-300/10"
                  )}
                  title={isSidebarCollapsed ? "Admin Room" : undefined}
                >
                  <Shield className="h-4.5 w-4.5 group-hover:scale-105 transition-transform" />
                  {!isSidebarCollapsed && <span className="animate-fadeIn">Admin Room</span>}
                </Link>

                <Link 
                  href="/admin/games"
                  className={cn(
                    "flex items-center rounded-lg text-xs font-bold text-slate-400 hover:text-white hover:bg-white/5 transition-all duration-200 group border border-transparent",
                    isSidebarCollapsed ? "justify-center p-2.5" : "gap-3 px-3 py-2.5",
                    pathname === "/admin/games" && "bg-cyan-300/10 text-cyan-300 hover:text-cyan-300 hover:bg-cyan-300/10 border-cyan-300/10"
                  )}
                  title={isSidebarCollapsed ? "Kelola Game" : undefined}
                >
                  <Gamepad2 className="h-4.5 w-4.5 group-hover:scale-105 transition-transform" />
                  {!isSidebarCollapsed && <span className="animate-fadeIn">Kelola Game</span>}
                </Link>

                <Link 
                  href="/admin/products"
                  className={cn(
                    "flex items-center rounded-lg text-xs font-bold text-slate-400 hover:text-white hover:bg-white/5 transition-all duration-200 group border border-transparent",
                    isSidebarCollapsed ? "justify-center p-2.5" : "gap-3 px-3 py-2.5",
                    pathname === "/admin/products" && "bg-cyan-300/10 text-cyan-300 hover:text-cyan-300 hover:bg-cyan-300/10 border-cyan-300/10"
                  )}
                  title={isSidebarCollapsed ? "Kelola Produk" : undefined}
                >
                  <ShoppingBag className="h-4.5 w-4.5 group-hover:scale-105 transition-transform" />
                  {!isSidebarCollapsed && <span className="animate-fadeIn">Kelola Produk</span>}
                </Link>

                <Link 
                  href="/admin/transactions"
                  className={cn(
                    "flex items-center rounded-lg text-xs font-bold text-slate-400 hover:text-white hover:bg-white/5 transition-all duration-200 group border border-transparent",
                    isSidebarCollapsed ? "justify-center p-2.5" : "gap-3 px-3 py-2.5",
                    pathname === "/admin/transactions" && "bg-cyan-300/10 text-cyan-300 hover:text-cyan-300 hover:bg-cyan-300/10 border-cyan-300/10"
                  )}
                  title={isSidebarCollapsed ? "Transaksi Masuk" : undefined}
                >
                  <History className="h-4.5 w-4.5 group-hover:scale-105 transition-transform" />
                  {!isSidebarCollapsed && <span className="animate-fadeIn">Transaksi Masuk</span>}
                </Link>
              </div>
            )}

          </div>

          {/* Sidebar Bottom: Logout Button */}
          <div className="border-t border-white/5 pt-4">
            <button
              onClick={() => setShowLogoutConfirm(true)}
              className={cn(
                "flex items-center w-full rounded-lg text-xs font-black uppercase tracking-wider text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-all border border-transparent",
                isSidebarCollapsed ? "justify-center p-2.5" : "gap-3 px-3 py-2.5"
              )}
              title={isSidebarCollapsed ? t.logout : undefined}
            >
              <LogOut className="h-4.5 w-4.5" />
              {!isSidebarCollapsed && <span className="animate-fadeIn">{t.logout}</span>}
            </button>
          </div>
        </aside>
      )}

      {/* Language & Location Setting Modal */}
      {showLangModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-md glass p-6 md:p-8 rounded-2xl border-white/10 shadow-neon-cyan relative animate-fadeIn" style={bevelStyle}>
            
            <button 
              onClick={() => setShowLangModal(false)}
              className="absolute top-4 right-4 p-1.5 rounded-full bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition"
              type="button"
            >
              <X className="h-4 w-4" />
            </button>

            <h3 className="text-lg font-black uppercase text-white tracking-tight mb-6 flex items-center gap-2">
              <Globe className="h-5 w-5 text-cyan-300" />
              Pengaturan Lokasi &amp; Bahasa
            </h3>

            <div className="space-y-6">
              
              {/* Location Select (Currency) */}
              <div className="space-y-2.5">
                <label className="text-xs font-black uppercase tracking-wider text-slate-400 block">
                  Lokasi &amp; Mata Uang
                </label>
                
                {/* Option 1: Indonesia */}
                <button
                  onClick={() => setSelectedLocation("id")}
                  className={`w-full flex items-center justify-between p-4 border rounded-xl transition duration-300 ${
                    selectedLocation === "id" 
                      ? "border-cyan-300/40 bg-cyan-300/10 text-white font-bold" 
                      : "border-white/10 bg-slate-950 text-slate-400 hover:border-white/20"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <IndonesiaFlag className="h-4.5 w-6" />
                    <span className="text-xs">Indonesia (IDR - Rupiah)</span>
                  </div>
                  {selectedLocation === "id" && <Check className="h-4 w-4 text-cyan-300" />}
                </button>

                {/* Option 2: US */}
                <button
                  onClick={() => setSelectedLocation("us")}
                  className={`w-full flex items-center justify-between p-4 border rounded-xl transition duration-300 ${
                    selectedLocation === "us" 
                      ? "border-cyan-300/40 bg-cyan-300/10 text-white font-bold" 
                      : "border-white/10 bg-slate-950 text-slate-400 hover:border-white/20"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <USFlag className="h-4.5 w-6" />
                    <span className="text-xs">United States (USD - Dollar)</span>
                  </div>
                  {selectedLocation === "us" && <Check className="h-4 w-4 text-cyan-300" />}
                </button>
              </div>

              {/* Language Selection */}
              <div className="space-y-2.5">
                <label className="text-xs font-black uppercase tracking-wider text-slate-400 block">
                  Bahasa (Language)
                </label>
                <div className="grid grid-cols-2 gap-3">
                  
                  {/* Indonesian */}
                  <button
                    onClick={() => setSelectedLang("id")}
                    className={`flex items-center justify-center gap-2 p-3 border rounded-xl transition duration-300 ${
                      selectedLang === "id"
                        ? "border-cyan-300/40 bg-cyan-300/10 text-white font-bold"
                        : "border-white/10 bg-slate-950 text-slate-400 hover:border-white/20"
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
                        ? "border-cyan-300/40 bg-cyan-300/10 text-white font-bold"
                        : "border-white/10 bg-slate-950 text-slate-400 hover:border-white/20"
                    }`}
                  >
                    <USFlag />
                    <span className="text-xs">English</span>
                  </button>

                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 justify-end pt-4 border-t border-white/5">
                <button
                  onClick={() => setShowLangModal(false)}
                  className="px-5 py-2.5 text-xs font-bold text-slate-400 hover:text-white transition"
                  type="button"
                >
                  Batal
                </button>
                <div className="relative p-[1px] bg-gradient-to-r from-cyan-300 to-blue-500 rounded-lg">
                  <button
                    onClick={handleSaveLangSettings}
                    className="bg-slate-950 hover:bg-slate-900 px-6 py-2.5 text-xs font-black uppercase tracking-widest text-cyan-300 transition-colors"
                  >
                    Simpan Perubahan
                  </button>
                </div>
              </div>

            </div>

          </div>
        </div>
      )}

      {/* Logout Confirmation Modal Dialog */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-sm glass p-6 md:p-8 rounded-2xl border-white/10 shadow-neon-cyan relative animate-fadeIn" style={bevelStyle}>
            
            <button 
              onClick={() => setShowLogoutConfirm(false)}
              className="absolute top-4 right-4 p-1.5 rounded-full bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition"
              type="button"
            >
              <X className="h-4 w-4" />
            </button>

            <h3 className="text-lg font-black uppercase text-white tracking-tight mb-2">
              Konfirmasi Keluar
            </h3>
            <p className="text-xs text-slate-400 mb-6 leading-relaxed">
              Apakah Anda yakin ingin mengakhiri sesi pendaftaran dan keluar dari Mitsuru?
            </p>

            <div className="flex gap-3 justify-end">
              <button 
                onClick={() => setShowLogoutConfirm(false)}
                className="px-4 py-2.5 text-xs font-bold text-slate-400 hover:text-white transition"
              >
                Batal
              </button>
              <div className="relative p-[1px] bg-gradient-to-r from-red-500/40 to-pink-500/40 hover:from-red-500 hover:to-pink-500 rounded-lg transition-all">
                <button 
                  onClick={handleLogout}
                  className="bg-slate-950 px-5 py-2.5 text-xs font-black uppercase tracking-widest text-red-400 hover:text-white transition-colors"
                >
                  Ya, Keluar
                </button>
              </div>
            </div>

          </div>
        </div>
      )}
    </>
  )
}

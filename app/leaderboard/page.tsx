"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Header } from "@/components/layout/header"
import { SidebarContentWrapper } from "@/components/layout/sidebar-content-wrapper"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Trophy,
  ArrowLeft,
  Search,
  Clock,
  User,
  Star,
  Zap,
  TrendingUp,
  Award,
  ChevronUp,
  Coins,
  ShoppingBag,
} from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { formatCurrency } from "@/lib/utils"

// Spender Leaderboard initial data matching top-up app theme
const initialPlayers = [
  { nickname: "ApexDominate", level: "Platinum", transactions: 165, points: 3950, totalSpent: 16500000, average: 100000, avatar: "https://api.dicebear.com/7.x/adventurer/svg?seed=ApexDominate" },
  { nickname: "Flywithme", level: "Platinum", transactions: 158, points: 3840, totalSpent: 15800000, average: 100000, avatar: "https://api.dicebear.com/7.x/adventurer/svg?seed=Flywithme" },
  { nickname: "Bigbob007", level: "Gold", transactions: 145, points: 3520, totalSpent: 14500000, average: 100000, avatar: "https://api.dicebear.com/7.x/adventurer/svg?seed=Bigbob" },
  { nickname: "GhostViper", level: "Gold", transactions: 128, points: 3420, totalSpent: 12800000, average: 100000, avatar: "https://api.dicebear.com/7.x/adventurer/svg?seed=GhostViper" },
  { nickname: "NovaStrike", level: "Silver", transactions: 117, points: 3189, totalSpent: 11700000, average: 100000, avatar: "https://api.dicebear.com/7.x/adventurer/svg?seed=NovaStrike" },
  { nickname: "AlphaKiller", level: "Silver", transactions: 110, points: 3031, totalSpent: 8800000, average: 80000, avatar: "https://api.dicebear.com/7.x/adventurer/svg?seed=AlphaKiller" },
  { nickname: "Sn1peD0wn", level: "Silver", transactions: 108, points: 2988, totalSpent: 7560000, average: 70000, avatar: "https://api.dicebear.com/7.x/adventurer/svg?seed=Sn1peD0wn" },
  { nickname: "Valkyra", level: "Bronze", transactions: 102, points: 2757, totalSpent: 5100000, average: 50000, avatar: "https://api.dicebear.com/7.x/adventurer/svg?seed=Valkyra" },
  { nickname: "FrostByte", level: "Bronze", transactions: 96, points: 2698, totalSpent: 4800000, average: 50000, avatar: "https://api.dicebear.com/7.x/adventurer/svg?seed=FrostByte" },
  { nickname: "ReaperZ", level: "Bronze", transactions: 91, points: 2543, totalSpent: 2730000, average: 30000, avatar: "https://api.dicebear.com/7.x/adventurer/svg?seed=ReaperZ" },
]

export default function LeaderboardPage() {
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [sortBy, setSortBy] = useState<"spent" | "transactions" | "points">("spent")
  const [timeFilter, setTimeFilter] = useState<"24h" | "7d" | "30d" | "seasonal">("seasonal")
  const [searchQuery, setSearchQuery] = useState("")
  const [timeLeft, setTimeLeft] = useState({ hours: 1, minutes: 44, seconds: 5 })
  const [players, setPlayers] = useState(initialPlayers)
  const [showNotification, setShowNotification] = useState(false)

  // Countdown timer effect
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev.seconds > 0) {
          return { ...prev, seconds: prev.seconds - 1 }
        } else if (prev.minutes > 0) {
          return { ...prev, minutes: prev.minutes - 1, seconds: 59 }
        } else if (prev.hours > 0) {
          return { hours: prev.hours - 1, minutes: 59, seconds: 59 }
        } else {
          return { hours: 2, minutes: 0, seconds: 0 }
        }
      })
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  // Check Supabase session
  useEffect(() => {
    const checkUser = async () => {
      try {
        const supabase = createClient()
        const { data } = await supabase.auth.getUser()
        if (data?.user) {
          const { data: profile } = await supabase
            .from("user_profiles")
            .select("role, name")
            .eq("id", data.user.id)
            .single()

          setCurrentUser({
            name: profile?.name || data.user.user_metadata?.name || data.user.email || 'Gamer',
            email: data.user.email || '',
            role: profile?.role || 'user'
          })
        }
      } catch (e) {
        console.error(e)
      }
    }
    checkUser()
  }, [])

  // Handle dynamic sorting based on Total Belanja/Transaksi/Poin Loyalty selections
  useEffect(() => {
    let sorted = [...initialPlayers]
    if (sortBy === "spent") {
      sorted.sort((a, b) => b.totalSpent - a.totalSpent)
    } else if (sortBy === "transactions") {
      sorted.sort((a, b) => b.transactions - a.transactions)
    } else if (sortBy === "points") {
      sorted.sort((a, b) => b.points - a.points)
    }

    // Apply simple mock filters for time periods to simulate data updates
    if (timeFilter === "24h") {
      sorted = sorted.map(p => {
        const transactions = Math.round(p.transactions * 0.1) || 1
        const totalSpent = Math.round(p.totalSpent * 0.08)
        return {
          ...p,
          transactions,
          points: Math.round(p.points * 0.1),
          totalSpent,
          average: transactions > 0 ? Math.round(totalSpent / transactions) : 0
        }
      })
    } else if (timeFilter === "7d") {
      sorted = sorted.map(p => {
        const transactions = Math.round(p.transactions * 0.35) || 2
        const totalSpent = Math.round(p.totalSpent * 0.3)
        return {
          ...p,
          transactions,
          points: Math.round(p.points * 0.35),
          totalSpent,
          average: transactions > 0 ? Math.round(totalSpent / transactions) : 0
        }
      })
    } else if (timeFilter === "30d") {
      sorted = sorted.map(p => {
        const transactions = Math.round(p.transactions * 0.75) || 5
        const totalSpent = Math.round(p.totalSpent * 0.7)
        return {
          ...p,
          transactions,
          points: Math.round(p.points * 0.75),
          totalSpent,
          average: transactions > 0 ? Math.round(totalSpent / transactions) : 0
        }
      })
    } else {
      sorted = sorted.map(p => ({
        ...p,
        average: p.transactions > 0 ? Math.round(p.totalSpent / p.transactions) : 0
      }))
    }

    setPlayers(sorted)
  }, [sortBy, timeFilter])

  // Filter players by search query
  const filteredPlayers = players.filter(p =>
    p.nickname.toLowerCase().includes(searchQuery.toLowerCase())
  )

  // Top 3 players
  const firstPlace = players[0]
  const secondPlace = players[1]
  const thirdPlace = players[2]

  // Ranks 4+ for the table.
  // If there is an active search query, show all matching results in the table.
  // Otherwise, skip the top 3 since they are already displayed in the podium cards.
  const tablePlayers = searchQuery ? filteredPlayers : filteredPlayers.slice(3)

  // Show dynamic notification for the user position check
  const handleShowMe = () => {
    setShowNotification(true)
    setTimeout(() => {
      setShowNotification(false)
    }, 4000)
  }

  // Format countdown string
  const formatTime = (t: number) => String(t).padStart(2, "0")

  // Function to get level badge styling
  const getLevelBadgeClass = (level: string) => {
    switch (level) {
      case "Platinum":
        return "text-sky bg-sky/10 border-sky/20"
      case "Gold":
        return "text-amber-500 bg-amber-50 border-amber-500/20"
      case "Silver":
        return "text-text-secondary bg-ice border-sky-border/30"
      case "Bronze":
      default:
        return "text-amber-600 bg-amber-50 border-amber-600/20"
    }
  }

  return (
    <div className="min-h-screen flex flex-col relative overflow-x-clip">
      {/* Background decorative elements */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-sky/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/3 -right-40 w-96 h-96 bg-sky/5 rounded-full blur-3xl pointer-events-none" />

      <Header user={currentUser} />

      <SidebarContentWrapper isAuthenticated={!!currentUser}>
        <main className="flex-1 py-8 relative z-10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">

          {/* Header Title Section */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
            <div className="flex items-center gap-3">
              <Link href="/" className="p-2 rounded-lg bg-ice border border-sky-border text-text-secondary hover:text-sky hover:border-sky transition-all duration-200 hover:scale-105 active:scale-95">
                <ArrowLeft className="h-5 w-5" />
              </Link>
              <div>
                <h1 className="text-3xl font-extrabold tracking-tight text-text-primary">Leaderboard Top Spender</h1>
                <p className="text-sm text-text-secondary">Daftar pelanggan paling aktif dan loyal bulan ini</p>
              </div>
            </div>

            {/* Realtime Countdown clock */}
            <div className="flex items-center gap-3 px-4 py-2.5 rounded-xl bg-white border border-sky-border backdrop-blur shadow-sky-soft">
              <Clock className="h-4 w-4 text-sky animate-pulse" />
              <span className="text-xs text-text-secondary font-semibold">Diperbarui dalam</span>
              <div className="flex items-center gap-1 font-mono text-sm font-bold text-text-primary">
                <span className="bg-ice px-1.5 py-0.5 rounded">{formatTime(timeLeft.hours)}</span>
                <span className="text-sky">:</span>
                <span className="bg-ice px-1.5 py-0.5 rounded">{formatTime(timeLeft.minutes)}</span>
                <span className="text-sky">:</span>
                <span className="bg-ice px-1.5 py-0.5 rounded">{formatTime(timeLeft.seconds)}</span>
              </div>
            </div>
          </div>

          {/* Alert notification if "Show Me" clicked */}
          {showNotification && (
            <div className="mb-6 p-4 rounded-xl border border-sky/20 bg-sky/10 text-text-primary flex items-center justify-between animate-fadeIn">
              <div className="flex items-center gap-2">
                <Award className="h-5 w-5 text-sky" />
                <span>
                  {currentUser ? (
                    <>Halo <strong>{currentUser.name}</strong>, total akumulasi belanja Anda saat ini berada di peringkat <strong>#12</strong> dengan total belanja <strong>Rp350.000</strong>. Tingkatkan transaksi untuk masuk 10 besar!</>
                  ) : (
                    <>Silakan login terlebih dahulu untuk melihat posisi peringkat belanja Anda.</>
                  )}
                </span>
              </div>
            </div>
          )}

          {/* Filters Bar */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-8">

            {/* Sorting Tabs: Total Belanja / Transaksi / Poin Loyalty */}
            <div className="flex bg-white border border-sky-border p-1 rounded-xl w-fit shadow-sky-soft">
              <button
                onClick={() => setSortBy("spent")}
                className={`px-5 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${
                  sortBy === "spent"
                    ? "bg-sky text-white shadow-lg shadow-sky/20 scale-[1.02]"
                    : "text-text-secondary hover:text-sky hover:bg-ice hover:scale-[1.02] active:scale-[0.98]"
                }`}
              >
                Total Belanja
              </button>
              <button
                onClick={() => setSortBy("transactions")}
                className={`px-5 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${
                  sortBy === "transactions"
                    ? "bg-sky text-white shadow-lg shadow-sky/20 scale-[1.02]"
                    : "text-text-secondary hover:text-sky hover:bg-ice hover:scale-[1.02] active:scale-[0.98]"
                }`}
              >
                Transaksi
              </button>
              <button
                onClick={() => setSortBy("points")}
                className={`px-5 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${
                  sortBy === "points"
                    ? "bg-sky text-white shadow-lg shadow-sky/20 scale-[1.02]"
                    : "text-text-secondary hover:text-sky hover:bg-ice hover:scale-[1.02] active:scale-[0.98]"
                }`}
              >
                Poin Loyalty
              </button>
            </div>

            {/* Right filters: Time Periods & "Show me" Button */}
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex bg-white border border-sky-border p-1 rounded-xl shadow-sky-soft">
                {(["24h", "7d", "30d", "seasonal"] as const).map((period) => (
                  <button
                    key={period}
                    onClick={() => setTimeFilter(period)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all duration-200 ${
                      timeFilter === period
                        ? "bg-sky/10 text-sky border border-sky/20"
                        : "text-text-secondary hover:text-sky hover:bg-ice hover:scale-[1.02] active:scale-[0.98]"
                    }`}
                  >
                    {period === "24h" ? "Hari Ini" : period === "7d" ? "7 H" : period === "30d" ? "30 H" : "Seasonal"}
                  </button>
                ))}
              </div>

              <Button
                onClick={handleShowMe}
                className="bg-emerald-500 hover:bg-emerald-600 text-white font-bold px-5 py-2 rounded-xl transition-all duration-300 transform hover:scale-105 active:scale-95 shadow-lg shadow-emerald-500/20 flex items-center gap-1.5 shimmer-hover"
              >
                <User className="h-4 w-4" />
                Show me
              </Button>
            </div>
          </div>

          {/* Top 3 Podium Layout Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end mb-12">

            {/* Podium Rank 2 (Silver) */}
            {secondPlace && (
              <div className="order-2 md:order-1 transition-all duration-300 hover:-translate-y-2">
                <Card className="glass-sky shimmer-hover relative overflow-hidden border-sky-border bg-white hover:border-sky hover:shadow-lg hover:shadow-sky/10 transition-all duration-300 rounded-[20px]">
                  {/* Decorative corner tag */}
                  <div className="absolute top-3 right-3 flex h-8 w-8 items-center justify-center rounded-full bg-ice border border-sky-border text-text-secondary font-bold">
                    2
                  </div>
                  <CardContent className="p-6 text-center">
                    <div className="relative mx-auto mb-4 w-20 h-20 rounded-full border-2 border-text-secondary bg-ice p-1 flex items-center justify-center">
                      <img src={secondPlace.avatar} alt={secondPlace.nickname} className="w-full h-full object-cover rounded-full" />
                      <div className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-text-secondary text-white shadow text-[10px] font-extrabold">
                        🥈
                      </div>
                    </div>

                    <h3 className="text-xl font-extrabold text-text-primary mb-1 flex items-center justify-center gap-1">
                      {secondPlace.nickname}
                      <Trophy className="h-4 w-4 text-text-secondary" />
                    </h3>
                    <span className={`text-[10px] px-2.5 py-0.5 rounded-full border font-bold ${getLevelBadgeClass(secondPlace.level)}`}>
                      {secondPlace.level} Member
                    </span>

                    <div className="grid grid-cols-3 gap-2 mt-6 pt-5 border-t border-sky-border/50">
                      <div>
                        <p className="text-[10px] text-text-muted uppercase font-semibold">Total Belanja</p>
                        <p className="text-xs font-bold text-text-secondary">{formatCurrency(secondPlace.totalSpent)}</p>
                      </div>
                      <div>
                        <p className="text-[10px] text-text-muted uppercase font-semibold">Transaksi</p>
                        <p className="text-xs font-bold text-text-secondary">{secondPlace.transactions}</p>
                      </div>
                      <div>
                        <p className="text-[10px] text-text-muted uppercase font-semibold">Poin</p>
                        <p className="text-xs font-bold text-sky">{secondPlace.points}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Podium Rank 1 (Gold) */}
            {firstPlace && (
              <div className="order-1 md:order-2 transition-all duration-300 hover:-translate-y-2">
                <Card className="glass-sky shimmer-hover relative overflow-hidden border-sky bg-sky/5 shadow-lg shadow-sky/10 py-4 hover:border-sky hover:shadow-sky/20 transition-all duration-300 rounded-[20px]">
                  {/* Decorative glow line at top */}
                  <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-sky to-diamond" />

                  {/* Gold Rank Tag */}
                  <div className="absolute top-4 right-4 flex h-10 w-10 items-center justify-center rounded-full bg-sky text-white font-black shadow-lg shadow-sky/30">
                    1
                  </div>

                  <CardContent className="p-6 text-center">
                    <div className="relative mx-auto mb-4 w-24 h-24 rounded-full border-4 border-sky bg-sky/10 p-1 flex items-center justify-center shadow-lg shadow-sky/10">
                      <img src={firstPlace.avatar} alt={firstPlace.nickname} className="w-full h-full object-cover rounded-full" />
                      <div className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-sky text-white shadow text-[10px] font-extrabold">
                        👑
                      </div>
                    </div>

                    <h3 className="text-2xl font-black text-text-primary mb-1 flex items-center justify-center gap-1.5">
                      {firstPlace.nickname}
                      <Trophy className="h-5 w-5 text-sky animate-bounce" />
                    </h3>
                    <span className={`text-[10px] px-3 py-1 rounded-full border font-bold ${getLevelBadgeClass(firstPlace.level)}`}>
                      {firstPlace.level} Member
                    </span>

                    <div className="grid grid-cols-3 gap-2 mt-6 pt-5 border-t border-sky-border">
                      <div>
                        <p className="text-[10px] text-text-secondary uppercase font-semibold">Total Belanja</p>
                        <p className="text-xs font-black text-text-primary">{formatCurrency(firstPlace.totalSpent)}</p>
                      </div>
                      <div>
                        <p className="text-[10px] text-text-secondary uppercase font-semibold">Transaksi</p>
                        <p className="text-xs font-black text-text-primary">{firstPlace.transactions}</p>
                      </div>
                      <div>
                        <p className="text-[10px] text-text-secondary uppercase font-semibold">Poin</p>
                        <p className="text-xs font-black text-sky">{firstPlace.points}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Podium Rank 3 (Bronze) */}
            {thirdPlace && (
              <div className="order-3 transition-all duration-300 hover:-translate-y-2">
                <Card className="glass-sky shimmer-hover relative overflow-hidden border-amber-600/40 bg-white hover:border-amber-500/50 hover:shadow-lg hover:shadow-sky/10 transition-all duration-300 rounded-[20px]">
                  {/* Decorative corner tag */}
                  <div className="absolute top-3 right-3 flex h-8 w-8 items-center justify-center rounded-full bg-amber-50 border border-amber-600/30 text-amber-600 font-bold">
                    3
                  </div>
                  <CardContent className="p-6 text-center">
                    <div className="relative mx-auto mb-4 w-20 h-20 rounded-full border-2 border-amber-600 bg-amber-50 p-1 flex items-center justify-center">
                      <img src={thirdPlace.avatar} alt={thirdPlace.nickname} className="w-full h-full object-cover rounded-full" />
                      <div className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-amber-600 text-white shadow text-[10px] font-extrabold">
                        🥉
                      </div>
                    </div>

                    <h3 className="text-xl font-extrabold text-text-primary mb-1 flex items-center justify-center gap-1">
                      {thirdPlace.nickname}
                      <Trophy className="h-4 w-4 text-amber-600" />
                    </h3>
                    <span className={`text-[10px] px-2.5 py-0.5 rounded-full border font-bold ${getLevelBadgeClass(thirdPlace.level)}`}>
                      {thirdPlace.level} Member
                    </span>

                    <div className="grid grid-cols-3 gap-2 mt-6 pt-5 border-t border-sky-border/50">
                      <div>
                        <p className="text-[10px] text-text-muted uppercase font-semibold">Total Belanja</p>
                        <p className="text-xs font-bold text-text-secondary">{formatCurrency(thirdPlace.totalSpent)}</p>
                      </div>
                      <div>
                        <p className="text-[10px] text-text-muted uppercase font-semibold">Transaksi</p>
                        <p className="text-xs font-bold text-text-secondary">{thirdPlace.transactions}</p>
                      </div>
                      <div>
                        <p className="text-[10px] text-text-muted uppercase font-semibold">Poin</p>
                        <p className="text-xs font-bold text-sky">{thirdPlace.points}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>

          {/* Search Box */}
          <div className="relative max-w-md mb-6 transition-all duration-300 focus-within:scale-[1.01]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted" />
            <Input
              placeholder="Cari nama pengguna..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-white border-sky-border rounded-xl focus:border-sky focus:ring-sky/20 text-text-primary transition-all duration-200"
            />
          </div>

          {/* Leaders List Table */}
          <Card className="glass-sky overflow-hidden border-sky-border bg-white/80 rounded-[20px]">
            <CardContent className="p-0">
              <Table>
                <TableHeader className="bg-ice border-b border-sky-border">
                  <TableRow className="hover:bg-transparent border-b border-sky-border">
                    <TableHead className="text-text-secondary font-bold w-20">RANK</TableHead>
                    <TableHead className="text-text-secondary font-bold">PENGGUNA</TableHead>
                    <TableHead className="text-text-secondary font-bold">LEVEL MEMBER</TableHead>
                    <TableHead className="text-text-secondary font-bold">TRANSAKSI</TableHead>
                    <TableHead className="text-text-secondary font-bold">LOYALTY POIN</TableHead>
                    <TableHead className="text-text-secondary font-bold">TOTAL BELANJA</TableHead>
                    <TableHead className="text-text-secondary font-bold">RATA-RATA TOPUP</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {tablePlayers.length > 0 ? (
                    tablePlayers.map((player, index) => {
                      const actualRankIndex = players.findIndex(p => p.nickname === player.nickname) + 1

                      return (
                        <TableRow key={player.nickname} className="border-b border-sky-border/50 hover:bg-sky/5 hover:text-sky transition-all duration-200">
                          <TableCell className="font-mono text-sm font-bold text-text-secondary">
                            #{actualRankIndex}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-ice p-0.5 overflow-hidden transition-transform duration-300 hover:scale-110">
                                <img src={player.avatar} alt={player.nickname} className="w-full h-full object-cover rounded-full" />
                              </div>
                              <span className="font-semibold text-text-primary">{player.nickname}</span>
                              {player.nickname === "GhostViper" && (
                                <Star className="h-3 w-3 fill-amber-500 text-amber-500 animate-spin" style={{ animationDuration: '4s' }} />
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <span className={`px-2 py-0.5 rounded-full border text-xs font-semibold font-mono ${getLevelBadgeClass(player.level)}`}>
                              {player.level}
                            </span>
                          </TableCell>
                          <TableCell className="font-medium text-text-secondary">{player.transactions}</TableCell>
                          <TableCell className="text-text-secondary">{new Intl.NumberFormat("id-ID").format(player.points)}</TableCell>
                          <TableCell className="font-bold text-text-secondary">
                            {formatCurrency(player.totalSpent)}
                          </TableCell>
                          <TableCell className="text-sky font-semibold flex items-center gap-1">
                            {formatCurrency(player.average)}
                            {player.average > 50000 && (
                              <ChevronUp className="h-3.5 w-3.5 text-emerald-500" />
                            )}
                          </TableCell>
                        </TableRow>
                      )
                    })
                  ) : (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8 text-text-muted">
                        Tidak ada pengguna ditemukan dengan nama "{searchQuery}"
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
        </main>

        {/* Footer copyright matches other pages */}
        <footer className="border-t border-sky-border bg-white py-6 mt-12 relative z-10">
          <div className="mx-auto max-w-7xl px-4 text-center text-xs text-text-muted sm:px-6 lg:px-8">
            © 2026 Mitsuru. All rights reserved.
          </div>
        </footer>
      </SidebarContentWrapper>
    </div>
  )
}
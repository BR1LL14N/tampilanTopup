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
  Award,
  ChevronUp,
} from "lucide-react"
import { formatCurrency } from "@/lib/utils"

interface Player {
  nickname: string
  level: string
  transactions: number
  points: number
  totalSpent: number
  average: number
  avatar: string
}

export default function LeaderboardPage() {
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [sortBy, setSortBy] = useState<"spent" | "transactions" | "points">("spent")
  const [timeFilter, setTimeFilter] = useState<"24h" | "7d" | "30d" | "seasonal">("seasonal")
  const [searchQuery, setSearchQuery] = useState("")
  const [timeLeft, setTimeLeft] = useState({ hours: 0, minutes: 5, seconds: 0 })
  const [players, setPlayers] = useState<Player[]>([])
  const [loading, setLoading] = useState(true)
  const [currentUserRank, setCurrentUserRank] = useState<{ rank: number; totalSpent: number } | null>(null)
  const [showNotification, setShowNotification] = useState(false)

  // Fetch real leaderboard data from the database
  const fetchLeaderboard = async () => {
    try {
      const res = await fetch(`/api/leaderboard?period=${timeFilter}`)
      const data = await res.json()
      if (data.error) throw new Error(data.error)
      setPlayers(data.players || [])
      setCurrentUserRank(data.currentUserRank || null)
    } catch (e) {
      console.error("Failed to load leaderboard:", e)
    } finally {
      setLoading(false)
      setTimeLeft({ hours: 0, minutes: 5, seconds: 0 })
    }
  }

  useEffect(() => {
    setLoading(true)
    fetchLeaderboard()
  }, [timeFilter])

  // Countdown timer that triggers a real data refresh every 5 minutes
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
          fetchLeaderboard()
          return { hours: 0, minutes: 5, seconds: 0 }
        }
      })
    }, 1000)
    return () => clearInterval(timer)
  }, [timeFilter])

  // Check session
  useEffect(() => {
    const checkUser = async () => {
      try {
        const res = await fetch("/api/auth/me")
        const json = await res.json()
        if (json.user) {
          setCurrentUser({
            name: json.user.name || 'Gamer',
            email: json.user.email || '',
            role: json.user.role || 'user'
          })
        }
      } catch (e) {
        console.error(e)
      }
    }
    checkUser()
  }, [])

  // Sort the fetched players client-side based on the selected metric, then
  // stamp each entry with its rank in that order (used as a stable key/label
  // instead of relying on nickname, which can collide after masking).
  const sortedPlayers = [...players]
    .sort((a, b) => {
      if (sortBy === "spent") return b.totalSpent - a.totalSpent
      if (sortBy === "transactions") return b.transactions - a.transactions
      return b.points - a.points
    })
    .map((p, i) => ({ ...p, rank: i + 1 }))

  // Filter players by search query
  const filteredPlayers = sortedPlayers.filter(p =>
    p.nickname.toLowerCase().includes(searchQuery.toLowerCase())
  )

  // Top 3 players
  const firstPlace = sortedPlayers[0]
  const secondPlace = sortedPlayers[1]
  const thirdPlace = sortedPlayers[2]

  // Ranks 4+ for the table.
  // If there is an active search query, show all matching results in the table.
  // Otherwise, skip the top 3 since they are already displayed in the podium cards.
  const tablePlayers = searchQuery ? filteredPlayers : filteredPlayers.slice(3)

  // Show the logged-in user's real rank/position based on database data
  const handleShowMe = () => {
    setShowNotification(true)
    setTimeout(() => {
      setShowNotification(false)
    }, 5000)
  }

  // Format countdown string
  const formatTime = (t: number) => String(t).padStart(2, "0")

  // Function to get level badge styling
  const getLevelBadgeClass = (level: string) => {
    switch (level) {
      case "Platinum":
        return "text-sky bg-sky/20 border border-sky/30 border-sky/20"
      case "Gold":
        return "text-amber-500 bg-amber-50 border-amber-500/20"
      case "Silver":
        return "text-white/80 bg-sky/20 border-sky/30/30"
      case "Bronze":
      default:
        return "text-amber-600 bg-amber-50 border-amber-600/20"
    }
  }

  return (
    <div className="min-h-screen flex flex-col relative ">
      {/* Background decorative elements */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-sky/20 border border-sky/30 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/3 -right-40 w-96 h-96 bg-sky/5 rounded-full blur-3xl pointer-events-none" />

      <Header user={currentUser} />

      <SidebarContentWrapper isAuthenticated={!!currentUser}>
        <main className="flex-1 py-8 relative z-10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">

          {/* Header Title Section */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
            <div className="flex items-center gap-3">
              <Link href="/" className="p-2 rounded-lg bg-sky/20 border border-sky/30 text-white/80 hover:text-sky hover:border-sky transition-all duration-200 hover:scale-105 active:scale-95">
                <ArrowLeft className="h-5 w-5" />
              </Link>
              <div>
                <h1 className="text-3xl font-extrabold tracking-tight text-white">Leaderboard Top Spender</h1>
                <p className="text-sm text-white/80">Daftar pelanggan paling aktif dan loyal bulan ini</p>
              </div>
            </div>

            {/* Realtime Countdown clock */}
            <div className="flex items-center gap-3 px-4 py-2.5 rounded-xl bg-[#183644]/90 backdrop-blur-md border border-sky/30 backdrop-blur shadow-sky-soft">
              <Clock className="h-4 w-4 text-sky animate-pulse" />
              <span className="text-xs text-white/80 font-semibold">Diperbarui dalam</span>
              <div className="flex items-center gap-1 font-mono text-sm font-bold text-white">
                <span className="bg-sky/20 px-1.5 py-0.5 rounded">{formatTime(timeLeft.hours)}</span>
                <span className="text-sky">:</span>
                <span className="bg-sky/20 px-1.5 py-0.5 rounded">{formatTime(timeLeft.minutes)}</span>
                <span className="text-sky">:</span>
                <span className="bg-sky/20 px-1.5 py-0.5 rounded">{formatTime(timeLeft.seconds)}</span>
              </div>
            </div>
          </div>

          {/* Alert notification if "Show Me" clicked */}
          {showNotification && (
            <div className="mb-6 p-4 rounded-xl border border-sky/20 bg-sky/20 border border-sky/30 text-white flex items-center justify-between animate-fadeIn">
              <div className="flex items-center gap-2">
                <Award className="h-5 w-5 text-sky" />
                <span>
                  {!currentUser ? (
                    <>Silakan login terlebih dahulu untuk melihat posisi peringkat belanja Anda.</>
                  ) : currentUserRank ? (
                    <>Halo <strong>{currentUser.name}</strong>, total akumulasi belanja Anda saat ini berada di peringkat <strong>#{currentUserRank.rank}</strong> dengan total belanja <strong>{formatCurrency(currentUserRank.totalSpent)}</strong>.</>
                  ) : (
                    <>Halo <strong>{currentUser.name}</strong>, Anda belum memiliki transaksi sukses. Yuk top up sekarang untuk mulai naik peringkat!</>
                  )}
                </span>
              </div>
            </div>
          )}

          {/* Filters Bar */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-8">

            {/* Sorting Tabs: Total Belanja / Transaksi / Poin Loyalty */}
            <div className="flex bg-[#183644]/90 backdrop-blur-md border border-sky/30 p-1 rounded-xl w-fit shadow-sky-soft">
              <button
                onClick={() => setSortBy("spent")}
                className={`px-5 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${
                  sortBy === "spent"
                    ? "bg-sky text-white shadow-lg shadow-sky/20 scale-[1.02]"
                    : "text-white/80 hover:text-sky hover:bg-sky/20 hover:scale-[1.02] active:scale-[0.98]"
                }`}
              >
                Total Belanja
              </button>
              <button
                onClick={() => setSortBy("transactions")}
                className={`px-5 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${
                  sortBy === "transactions"
                    ? "bg-sky text-white shadow-lg shadow-sky/20 scale-[1.02]"
                    : "text-white/80 hover:text-sky hover:bg-sky/20 hover:scale-[1.02] active:scale-[0.98]"
                }`}
              >
                Transaksi
              </button>
              <button
                onClick={() => setSortBy("points")}
                className={`px-5 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${
                  sortBy === "points"
                    ? "bg-sky text-white shadow-lg shadow-sky/20 scale-[1.02]"
                    : "text-white/80 hover:text-sky hover:bg-sky/20 hover:scale-[1.02] active:scale-[0.98]"
                }`}
              >
                Poin Loyalty
              </button>
            </div>

            {/* Right filters: Time Periods & "Show me" Button */}
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex bg-[#183644]/90 backdrop-blur-md border border-sky/30 p-1 rounded-xl shadow-sky-soft">
                {(["24h", "7d", "30d", "seasonal"] as const).map((period) => (
                  <button
                    key={period}
                    onClick={() => setTimeFilter(period)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all duration-200 ${
                      timeFilter === period
                        ? "bg-sky/20 border border-sky/30 text-sky border border-sky/20"
                        : "text-white/80 hover:text-sky hover:bg-sky/20 hover:scale-[1.02] active:scale-[0.98]"
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
          <div className="grid grid-cols-3 gap-2 md:gap-6 items-end mb-12">

            {/* Podium Rank 2 (Silver) */}
            {secondPlace && (
              <div className="order-1 transition-all duration-300 hover:-translate-y-2">
                <Card className="glass-sky shimmer-hover relative overflow-hidden border-sky/30 bg-[#183644]/90 backdrop-blur-md hover:border-sky hover:shadow-lg hover:shadow-sky/10 transition-all duration-300 rounded-[20px]">
                  {/* Decorative corner tag */}
                  <div className="absolute top-2 right-2 md:top-3 md:right-3 flex h-5 w-5 md:h-8 md:w-8 text-[10px] md:text-sm items-center justify-center rounded-full bg-sky/20 border border-sky/30 text-white/80 font-bold">
                    2
                  </div>
                  <CardContent className="p-2 sm:p-4 md:p-6 text-center">
                    <div className="relative mx-auto mb-2 md:mb-4 w-12 h-12 md:w-20 md:h-20 rounded-full border-2 border-text-secondary bg-sky/20 p-0.5 md:p-1 flex items-center justify-center">
                      <img src={secondPlace.avatar} alt={secondPlace.nickname} className="w-full h-full object-cover rounded-full" />
                      <div className="absolute -bottom-1 -right-1 flex h-4 w-4 md:h-6 md:w-6 items-center justify-center rounded-full bg-text-secondary text-white shadow text-[8px] md:text-[10px] font-extrabold">
                        🥈
                      </div>
                    </div>

                    <h3 className="text-[10px] md:text-xl font-extrabold text-white mb-1 flex items-center justify-center gap-1 truncate w-full">
                      {secondPlace.nickname}
                      <Trophy className="h-3 w-3 md:h-4 md:w-4 text-white/80 shrink-0" />
                    </h3>
                    <span className={`hidden md:inline-block text-[10px] px-2.5 py-0.5 rounded-full border font-bold ${getLevelBadgeClass(secondPlace.level)}`}>
                      {secondPlace.level} Member
                    </span>

                    {/* Mobile Only Score */}
                    <p className="md:hidden text-[8px] sm:text-[10px] font-bold text-sky mt-1 truncate">
                      {sortBy === "spent" ? formatCurrency(secondPlace.totalSpent) : sortBy === "transactions" ? `${secondPlace.transactions} Trx` : `${secondPlace.points} Pts`}
                    </p>

                    <div className="hidden md:grid grid-cols-3 gap-2 mt-6 pt-5 border-t border-sky/30/50">
                      <div>
                        <p className="text-[10px] text-white/60 uppercase font-semibold">Total Belanja</p>
                        <p className="text-xs font-bold text-white/80">{formatCurrency(secondPlace.totalSpent)}</p>
                      </div>
                      <div>
                        <p className="text-[10px] text-white/60 uppercase font-semibold">Transaksi</p>
                        <p className="text-xs font-bold text-white/80">{secondPlace.transactions}</p>
                      </div>
                      <div>
                        <p className="text-[10px] text-white/60 uppercase font-semibold">Poin</p>
                        <p className="text-xs font-bold text-sky">{secondPlace.points}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Podium Rank 1 (Gold) */}
            {firstPlace && (
              <div className="order-2 transition-all duration-300 hover:-translate-y-2">
                <Card className="glass-sky shimmer-hover relative overflow-hidden border-sky bg-sky/5 shadow-lg shadow-sky/10 py-4 hover:border-sky hover:shadow-sky/20 transition-all duration-300 rounded-[20px]">
                  {/* Decorative glow line at top */}
                  <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-sky to-diamond" />

                  {/* Gold Rank Tag */}
                  <div className="absolute top-2 right-2 md:top-4 md:right-4 flex h-6 w-6 md:h-10 md:w-10 text-[10px] md:text-base items-center justify-center rounded-full bg-sky text-white font-black shadow-lg shadow-sky/30">
                    1
                  </div>

                  <CardContent className="p-2 sm:p-4 md:p-6 text-center">
                    <div className="relative mx-auto mb-2 md:mb-4 w-16 h-16 md:w-24 md:h-24 rounded-full border-4 border-sky bg-sky/20 border border-sky/30 p-1 flex items-center justify-center shadow-lg shadow-sky/10">
                      <img src={firstPlace.avatar} alt={firstPlace.nickname} className="w-full h-full object-cover rounded-full" />
                      <div className="absolute -bottom-1 -right-1 flex h-5 w-5 md:h-6 md:w-6 items-center justify-center rounded-full bg-sky text-white shadow text-[10px] font-extrabold">
                        👑
                      </div>
                    </div>

                    <h3 className="text-xs md:text-2xl font-black text-white mb-1 flex items-center justify-center gap-1 md:gap-1.5 truncate w-full">
                      {firstPlace.nickname}
                      <Trophy className="h-4 w-4 md:h-5 md:w-5 text-sky animate-bounce shrink-0" />
                    </h3>
                    <span className={`hidden md:inline-block text-[10px] px-3 py-1 rounded-full border font-bold ${getLevelBadgeClass(firstPlace.level)}`}>
                      {firstPlace.level} Member
                    </span>

                    {/* Mobile Only Score */}
                    <p className="md:hidden text-[9px] sm:text-xs font-black text-sky mt-1 truncate">
                      {sortBy === "spent" ? formatCurrency(firstPlace.totalSpent) : sortBy === "transactions" ? `${firstPlace.transactions} Trx` : `${firstPlace.points} Pts`}
                    </p>

                    <div className="hidden md:grid grid-cols-3 gap-2 mt-6 pt-5 border-t border-sky/30">
                      <div>
                        <p className="text-[10px] text-white/80 uppercase font-semibold">Total Belanja</p>
                        <p className="text-xs font-black text-white">{formatCurrency(firstPlace.totalSpent)}</p>
                      </div>
                      <div>
                        <p className="text-[10px] text-white/80 uppercase font-semibold">Transaksi</p>
                        <p className="text-xs font-black text-white">{firstPlace.transactions}</p>
                      </div>
                      <div>
                        <p className="text-[10px] text-white/80 uppercase font-semibold">Poin</p>
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
                <Card className="glass-sky shimmer-hover relative overflow-hidden border-amber-600/40 bg-[#183644]/90 backdrop-blur-md hover:border-amber-500/50 hover:shadow-lg hover:shadow-sky/10 transition-all duration-300 rounded-[20px]">
                  {/* Decorative corner tag */}
                  <div className="absolute top-2 right-2 md:top-3 md:right-3 flex h-5 w-5 md:h-8 md:w-8 text-[10px] md:text-sm items-center justify-center rounded-full bg-amber-50 border border-amber-600/30 text-amber-600 font-bold">
                    3
                  </div>
                  <CardContent className="p-2 sm:p-4 md:p-6 text-center">
                    <div className="relative mx-auto mb-2 md:mb-4 w-12 h-12 md:w-20 md:h-20 rounded-full border-2 border-amber-600 bg-amber-50 p-0.5 md:p-1 flex items-center justify-center">
                      <img src={thirdPlace.avatar} alt={thirdPlace.nickname} className="w-full h-full object-cover rounded-full" />
                      <div className="absolute -bottom-1 -right-1 flex h-4 w-4 md:h-6 md:w-6 items-center justify-center rounded-full bg-amber-600 text-white shadow text-[8px] md:text-[10px] font-extrabold">
                        🥉
                      </div>
                    </div>

                    <h3 className="text-[10px] md:text-xl font-extrabold text-white mb-1 flex items-center justify-center gap-1 truncate w-full">
                      {thirdPlace.nickname}
                      <Trophy className="h-3 w-3 md:h-4 md:w-4 text-amber-600 shrink-0" />
                    </h3>
                    <span className={`hidden md:inline-block text-[10px] px-2.5 py-0.5 rounded-full border font-bold ${getLevelBadgeClass(thirdPlace.level)}`}>
                      {thirdPlace.level} Member
                    </span>

                    {/* Mobile Only Score */}
                    <p className="md:hidden text-[8px] sm:text-[10px] font-bold text-amber-600 mt-1 truncate">
                      {sortBy === "spent" ? formatCurrency(thirdPlace.totalSpent) : sortBy === "transactions" ? `${thirdPlace.transactions} Trx` : `${thirdPlace.points} Pts`}
                    </p>

                    <div className="hidden md:grid grid-cols-3 gap-2 mt-6 pt-5 border-t border-sky/30/50">
                      <div>
                        <p className="text-[10px] text-white/60 uppercase font-semibold">Total Belanja</p>
                        <p className="text-xs font-bold text-white/80">{formatCurrency(thirdPlace.totalSpent)}</p>
                      </div>
                      <div>
                        <p className="text-[10px] text-white/60 uppercase font-semibold">Transaksi</p>
                        <p className="text-xs font-bold text-white/80">{thirdPlace.transactions}</p>
                      </div>
                      <div>
                        <p className="text-[10px] text-white/60 uppercase font-semibold">Poin</p>
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
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/60" />
            <Input
              placeholder="Cari nama pengguna..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-[#183644]/90 backdrop-blur-md border-sky/30 rounded-xl focus:border-sky focus:ring-sky/20 text-white transition-all duration-200"
            />
          </div>

          {/* Leaders List Table */}
          <Card className="glass-sky overflow-hidden border-sky/30 bg-[#183644]/90 backdrop-blur-md/80 rounded-[20px]">
            <CardContent className="p-0">
              <Table>
                <TableHeader className="bg-sky/20 border-b border-sky/30">
                  <TableRow className="hover:bg-transparent border-b border-sky/30">
                    <TableHead className="text-white/80 font-bold w-12 md:w-20">RANK</TableHead>
                    <TableHead className="text-white/80 font-bold">PENGGUNA</TableHead>
                    <TableHead className="hidden md:table-cell text-white/80 font-bold">LEVEL</TableHead>
                    <TableHead className="hidden lg:table-cell text-white/80 font-bold">TRANSAKSI</TableHead>
                    <TableHead className="hidden lg:table-cell text-white/80 font-bold">POIN</TableHead>
                    <TableHead className="text-right sm:text-left text-white/80 font-bold">TOTAL BELANJA</TableHead>
                    <TableHead className="hidden md:table-cell text-white/80 font-bold">RATA-RATA</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8 text-white/60">
                        Memuat data leaderboard...
                      </TableCell>
                    </TableRow>
                  ) : tablePlayers.length > 0 ? (
                    tablePlayers.map((player) => (
                      <TableRow key={player.rank} className="border-b border-sky/30/50 hover:bg-sky/5 hover:text-sky transition-all duration-200">
                          <TableCell className="font-mono text-sm font-bold text-white/80">
                            #{player.rank}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-sky/20 p-0.5 overflow-hidden transition-transform duration-300 hover:scale-110">
                                <img src={player.avatar} alt={player.nickname} className="w-full h-full object-cover rounded-full" />
                              </div>
                              <span className="font-semibold text-white">{player.nickname}</span>
                            </div>
                          </TableCell>
                          <TableCell className="hidden md:table-cell">
                            <span className={`px-2 py-0.5 rounded-full border text-xs font-semibold font-mono ${getLevelBadgeClass(player.level)}`}>
                              {player.level}
                            </span>
                          </TableCell>
                          <TableCell className="hidden lg:table-cell font-medium text-white/80">{player.transactions}</TableCell>
                          <TableCell className="hidden lg:table-cell text-white/80">{new Intl.NumberFormat("id-ID").format(player.points)}</TableCell>
                          <TableCell className="font-bold text-white/80 text-right sm:text-left whitespace-nowrap">
                            {formatCurrency(player.totalSpent)}
                          </TableCell>
                          <TableCell className="hidden md:table-cell text-sky font-semibold">
                            <div className="flex items-center gap-1">
                              {formatCurrency(player.average)}
                              {player.average > 50000 && (
                                <ChevronUp className="h-3.5 w-3.5 text-emerald-500" />
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8 text-white/60">
                        {searchQuery
                          ? `Tidak ada pengguna ditemukan dengan nama "${searchQuery}"`
                          : "Belum ada transaksi sukses yang tercatat untuk periode ini."}
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
        <footer className="border-t border-sky/30 bg-[#183644]/90 backdrop-blur-md py-6 mt-12 relative z-10">
          <div className="mx-auto max-w-7xl px-4 text-center text-xs text-white/60 sm:px-6 lg:px-8">
            © 2026 Mitsuru. All rights reserved.
          </div>
        </footer>
      </SidebarContentWrapper>
    </div>
  )
}
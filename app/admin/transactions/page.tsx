"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Header } from "@/components/layout/header"
import { SidebarContentWrapper } from "@/components/layout/sidebar-content-wrapper"
import { Skeleton } from "@/components/ui/skeleton"
import { getCachedUser, setCachedUser } from "@/lib/auth-cache"
import { formatCurrency, formatDate, getStatusBgColor } from "@/lib/utils"
import { getGameAssetByName, getItemAssetForProduct } from "@/lib/assets"
import {
  Plus,
  Search,
  MoreHorizontal,
  Eye,
  Download,
  Filter,
  TrendingUp,
  Wallet,
  Clock,
  CheckCircle,
  XCircle,
  Loader2,
} from "lucide-react"

export default function AdminTransactionsPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [transactionsList, setTransactionsList] = useState<any[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")

  const fetchAdminData = async () => {
    try {
      // Verify user auth session
      const resUser = await fetch("/api/auth/me")
      const { user } = await resUser.json()

      if (!user || user.role !== "admin") {
        setCachedUser(null)
        router.push("/auth/login")
        return
      }

      setCurrentUser(user)
      setCachedUser(user)

      // Fetch transactions list
      const resTransactions = await fetch("/api/admin/transactions")
      const { transactions, error } = await resTransactions.json()

      if (error) throw new Error(error)

      if (transactions) {
        setTransactionsList(transactions.map((tx: any) => ({
          id: tx.id,
          invoice: tx.invoice,
          user: tx.user_email || "Guest",
          product: tx.product_name,
          game: tx.game_name || "Game",
          target_id: tx.target_id,
          amount: Number(tx.amount) || 0,
          topup_status: tx.topup_status,
          created_at: tx.created_at,
        })))
      } else {
        setTransactionsList([])
      }
    } catch (err) {
      console.error("Failed to load admin transactions:", err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    // Read cache on mount
    const cached = getCachedUser()
    if (cached) {
      setCurrentUser(cached)
    }
    fetchAdminData()
  }, [router])

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Header user={currentUser} />
        <SidebarContentWrapper isAuthenticated={!!currentUser}>
          <main className="flex-1 py-8">
            <div className="container space-y-8">
              {/* Header */}
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <Skeleton className="h-8 w-36 rounded-lg bg-sky/10" />
                  <Skeleton className="h-4 w-56 rounded-md bg-sky/10" />
                </div>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="bg-white p-4 rounded-xl border border-sky-border shadow-sky-soft space-y-2">
                    <Skeleton className="h-3.5 w-24 rounded bg-sky/10" />
                    <Skeleton className="h-7 w-16 rounded-md bg-sky/10" />
                  </div>
                ))}
              </div>

              {/* Table Card */}
              <div className="bg-white rounded-[20px] border border-sky-border shadow-sky-soft p-6 space-y-6">
                <div className="flex gap-4 flex-wrap">
                  <Skeleton className="h-10 w-72 rounded-xl bg-sky/10" />
                  <Skeleton className="h-10 w-36 rounded-xl bg-sky/10" />
                </div>
                <div className="space-y-3">
                  {/* Header row */}
                  <div className="grid grid-cols-7 gap-4 py-2 border-b border-sky-border/50">
                    <Skeleton className="h-4 w-16 rounded bg-sky/10" />
                    <Skeleton className="h-4 w-20 rounded bg-sky/10" />
                    <Skeleton className="h-4 w-24 rounded bg-sky/10" />
                    <Skeleton className="h-4 w-16 rounded bg-sky/10" />
                    <Skeleton className="h-4 w-16 rounded bg-sky/10" />
                    <Skeleton className="h-4 w-12 rounded bg-sky/10" />
                    <Skeleton className="h-4 w-8 justify-self-end rounded bg-sky/10" />
                  </div>
                  {/* Data rows */}
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className="grid grid-cols-7 gap-4 py-4 items-center border-b border-sky-border/30">
                      <Skeleton className="h-4 w-20 rounded-md font-mono bg-sky/10" />
                      <Skeleton className="h-4 w-28 rounded-md bg-sky/10" />
                      <Skeleton className="h-4 w-32 rounded-md bg-sky/10" />
                      <Skeleton className="h-4 w-20 rounded-md bg-sky/10" />
                      <Skeleton className="h-5 w-16 rounded-md bg-sky/10" />
                      <Skeleton className="h-6 w-16 rounded-full bg-sky/10" />
                      <Skeleton className="h-8 w-8 justify-self-end rounded-md bg-sky/10" />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </main>
        </SidebarContentWrapper>
      </div>
    )
  }

  const filteredTransactions = transactionsList.filter((tx) => {
    const matchesSearch =
      tx.invoice.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tx.user.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tx.target_id.includes(searchQuery);
    const matchesStatus =
      statusFilter === "all" || tx.topup_status === statusFilter;
    return matchesSearch && matchesStatus;
  })

  // Calculate dynamic stats
  const totalTransactions = transactionsList.length.toString()

  const todayStr = new Date().toISOString().split('T')[0]
  const todayTransactions = transactionsList.filter((tx) =>
    tx.created_at && tx.created_at.startsWith(todayStr)
  ).length.toString()

  const pendingTransactions = transactionsList.filter((tx) =>
    tx.topup_status === "pending" || tx.topup_status === "processing"
  ).length.toString()

  const failedTransactions = transactionsList.filter((tx) =>
    tx.topup_status === "failed"
  ).length.toString()

  const stats = [
    { label: "Total Transaksi", value: totalTransactions, icon: TrendingUp, color: "text-primary" },
    { label: "Hari Ini", value: todayTransactions, icon: Clock, color: "text-secondary" },
    { label: "Pending", value: pendingTransactions, icon: Clock, color: "text-yellow-500" },
    { label: "Gagal", value: failedTransactions, icon: XCircle, color: "text-red-500" },
  ]

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header user={currentUser} />

      <SidebarContentWrapper isAuthenticated={!!currentUser}>
        <main className="flex-1 py-8">
        <div className="container">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold mb-2">Transaksi</h1>
              <p className="text-muted-foreground">
                Monitoring semua transaksi top up
              </p>
            </div>
            <Button variant="outline" className="gap-2">
              <Download className="h-4 w-4" />
              Export
            </Button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {stats.map((stat, index) => (
              <Card key={index}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-2">
                    <stat.icon className={`h-5 w-5 ${stat.color}`} />
                  </div>
                  <p className="text-2xl font-bold">{stat.value}</p>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Search and Filter */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Cari invoice, email, atau ID player..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 rounded-lg border border-sky-border bg-white text-sm"
            >
              <option value="all">Semua Status</option>
              <option value="success">Berhasil</option>
              <option value="processing">Diproses</option>
              <option value="pending">Pending</option>
              <option value="failed">Gagal</option>
            </select>
          </div>

          {/* Transactions Table */}
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Invoice</TableHead>
                    <TableHead>Pengguna</TableHead>
                    <TableHead>Produk</TableHead>
                    <TableHead>Target</TableHead>
                    <TableHead>Jumlah</TableHead>
                    <TableHead>Status Topup</TableHead>
                    <TableHead>Tanggal</TableHead>
                    <TableHead className="text-right">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTransactions.map((tx) => (
                    <TableRow key={tx.id}>
                      <TableCell className="font-mono text-sm">
                        {tx.invoice}
                      </TableCell>
                      <TableCell>{tx.user}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-ice p-1.5">
                            <img
                              src={getItemAssetForProduct(tx.product, undefined, tx.game)}
                              alt=""
                              className="max-h-full max-w-full object-contain"
                            />
                          </span>
                          <div>
                            <p className="font-medium">{tx.product}</p>
                            <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
                              <img
                                src={getGameAssetByName(tx.game)?.icon}
                                alt=""
                                className="h-3.5 w-3.5 rounded object-cover"
                              />
                              {tx.game}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{tx.target_id}</TableCell>
                      <TableCell className="font-semibold">
                        {formatCurrency(tx.amount)}
                      </TableCell>
                      <TableCell>
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBgColor(
                            tx.topup_status
                          )}`}
                        >
                          {tx.topup_status === "success"
                            ? "Berhasil"
                            : tx.topup_status === "processing"
                            ? "Diproses"
                            : tx.topup_status === "pending"
                            ? "Pending"
                            : "Gagal"}
                        </span>
                      </TableCell>
                      <TableCell className="text-muted-foreground text-sm">
                        {formatDate(tx.created_at)}
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => router.push(`/history/${tx.invoice}`)}>
                              <Eye className="h-4 w-4 mr-2" />
                              Detail
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
        </main>
      </SidebarContentWrapper>
    </div>
  )
}
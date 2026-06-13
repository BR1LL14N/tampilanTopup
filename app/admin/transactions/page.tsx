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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
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
  
  // Detail Dialog states
  const [selectedTx, setSelectedTx] = useState<any | null>(null)
  const [isDetailOpen, setIsDetailOpen] = useState(false)
  const [showAdminPassword, setShowAdminPassword] = useState(false)
  const [updatingStatus, setUpdatingStatus] = useState(false)

  const handleUpdateStatus = async (txId: string, paymentStatus: string | undefined, topupStatus: string) => {
    setUpdatingStatus(true)
    try {
      const res = await fetch("/api/admin/transactions", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          id: txId, 
          payment_status: paymentStatus, 
          topup_status: topupStatus 
        })
      })
      const data = await res.json()
      if (data.error) throw new Error(data.error)
      
      // Update local state list
      setTransactionsList((prev: any[]) => prev.map(tx => tx.id === txId ? { ...tx, topup_status: topupStatus } : tx))
      if (selectedTx && selectedTx.id === txId) {
        setSelectedTx((prev: any) => prev ? { ...prev, topup_status: topupStatus } : null)
      }
    } catch (err: any) {
      alert(`Gagal memperbarui status: ${err.message}`)
    } finally {
      setUpdatingStatus(false)
    }
  }

  const handleRetry = async (txId: string) => {
    if (!confirm("Apakah Anda yakin ingin memproses ulang transaksi ini via Digiflazz?")) return;
    setUpdatingStatus(true)
    try {
      const res = await fetch("/api/admin/transactions", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: txId, action: "retry" })
      })
      const data = await res.json()
      if (data.error) throw new Error(data.error)
      
      const newStatus = data.topup_status
      const providerRef = data.provider_ref
      
      // Update local state list
      setTransactionsList((prev: any[]) => prev.map(tx => tx.id === txId ? { ...tx, topup_status: newStatus, provider_ref: providerRef } : tx))
      if (selectedTx && selectedTx.id === txId) {
        setSelectedTx((prev: any) => prev ? { ...prev, topup_status: newStatus, provider_ref: providerRef } : null)
      }
      alert(`Transaksi berhasil diproses ulang. Status terbaru: ${newStatus === "success" ? "Sukses" : newStatus === "processing" ? "Diproses/Pending" : "Gagal"}`)
    } catch (err: any) {
      alert(`Gagal memproses ulang: ${err.message}`)
    } finally {
      setUpdatingStatus(false)
    }
  }

  const handleRefund = async (txId: string) => {
    if (!confirm("Apakah Anda yakin ingin menandai transaksi ini sebagai REFUNDED dan menyetel status ke GAGAL?")) return;
    setUpdatingStatus(true)
    try {
      const res = await fetch("/api/admin/transactions", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: txId, action: "refund" })
      })
      const data = await res.json()
      if (data.error) throw new Error(data.error)
      
      // Update local state list
      setTransactionsList((prev: any[]) => prev.map(tx => tx.id === txId ? { ...tx, topup_status: "failed", provider_ref: "REFUNDED" } : tx))
      if (selectedTx && selectedTx.id === txId) {
        setSelectedTx((prev: any) => prev ? { ...prev, topup_status: "failed", provider_ref: "REFUNDED" } : null)
      }
      alert("Transaksi berhasil ditandai sebagai REFUNDED.")
    } catch (err: any) {
      alert(`Gagal memproses refund: ${err.message}`)
    } finally {
      setUpdatingStatus(false)
    }
  }

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
          login_method: tx.login_method,
          password: tx.password,
          request_notes: tx.request_notes,
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
                            <DropdownMenuItem onClick={() => { setSelectedTx(tx); setIsDetailOpen(true); setShowAdminPassword(false); }}>
                              <Eye className="h-4 w-4 mr-2" />
                              Detail & Kelola
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => router.push(`/history/${tx.invoice}`)}>
                              <Eye className="h-4 w-4 mr-2" />
                              Lihat Invoice
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

      {/* Detail & Status Management Dialog */}
      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="max-w-md bg-white border border-sky-border shadow-sky-medium rounded-[24px] overflow-hidden p-6 text-text-primary">
          <DialogHeader className="mb-4">
            <DialogTitle className="text-base font-black uppercase text-text-primary">
              Detail Transaksi
            </DialogTitle>
            <DialogDescription className="text-xs text-text-muted font-bold tracking-wider font-mono">
              Invoice: {selectedTx?.invoice}
            </DialogDescription>
          </DialogHeader>

          {selectedTx && (
            <div className="space-y-5 text-xs">
              {/* Product and general info */}
              <div className="border border-sky-border rounded-xl bg-ice/40 p-4 space-y-2.5">
                <div className="flex justify-between items-center">
                  <span className="text-text-secondary font-medium">Game / Produk</span>
                  <span className="font-bold text-text-primary">{selectedTx.game} - {selectedTx.product}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-text-secondary font-medium">Target ID / No. Tujuan</span>
                  <span className="font-mono font-bold text-text-primary bg-white px-2 py-0.5 rounded border border-sky-border/20">{selectedTx.target_id}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-text-secondary font-medium">Total Pembayaran</span>
                  <span className="font-black text-sky text-sm">{formatCurrency(selectedTx.amount)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-text-secondary font-medium">Status Saat Ini</span>
                  <span className={`px-2 py-0.5 rounded-full font-bold uppercase text-[9px] ${getStatusBgColor(selectedTx.topup_status)}`}>
                    {selectedTx.topup_status === "success" ? "Berhasil" : selectedTx.topup_status === "processing" ? "Diproses" : selectedTx.topup_status === "pending" ? "Pending" : "Gagal"}
                  </span>
                </div>
              </div>

              {/* Joki credentials if present */}
              {selectedTx.login_method && (
                <div className="bg-ice border border-sky-border/60 p-4 rounded-xl space-y-3">
                  <h4 className="text-[10px] font-black uppercase tracking-widest text-sky">Kredensial Akun Joki</h4>
                  
                  <div className="flex justify-between text-xs items-center">
                    <span className="text-text-secondary font-medium">Metode Login:</span>
                    <strong className="text-text-primary bg-white px-2.5 py-1 border border-sky-border/20 rounded-lg">{selectedTx.login_method}</strong>
                  </div>
                  
                  {selectedTx.password && (
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-text-secondary font-medium">Password Akun:</span>
                      <div className="flex items-center gap-2">
                        <span className="font-mono bg-white px-2.5 py-1 border border-sky-border/20 rounded-lg font-semibold text-text-primary">
                          {showAdminPassword ? selectedTx.password : "••••••••"}
                        </span>
                        <button
                          type="button"
                          onClick={() => setShowAdminPassword(!showAdminPassword)}
                          className="text-[10px] text-sky font-black uppercase hover:underline"
                        >
                          {showAdminPassword ? "Sembunyikan" : "Tampilkan"}
                        </button>
                      </div>
                    </div>
                  )}
                  
                  {selectedTx.request_notes && (
                    <div className="flex flex-col gap-1 text-xs text-left pt-1 border-t border-sky-border/30">
                      <span className="text-text-secondary font-semibold">Catatan Khusus Pelanggan:</span>
                      <p className="bg-white p-2.5 rounded-lg border border-sky-border/20 font-medium text-text-primary whitespace-pre-wrap leading-relaxed">{selectedTx.request_notes}</p>
                    </div>
                  )}
                </div>
              )}

              {/* Action Buttons to edit topup status */}
              <div className="space-y-2 pt-2 border-t border-sky-border/40">
                <span className="text-text-secondary font-black uppercase tracking-wider text-[10px] block">Kelola Status Pesanan</span>
                <div className="grid grid-cols-3 gap-2">
                  <Button
                    disabled={updatingStatus || selectedTx.topup_status === "processing"}
                    onClick={() => handleUpdateStatus(selectedTx.id, undefined, "processing")}
                    variant="outline"
                    className="h-9 text-[10px] font-black uppercase tracking-wider border-amber-300 hover:bg-amber-50 text-amber-600 shrink-0"
                  >
                    Set Diproses
                  </Button>
                  <Button
                    disabled={updatingStatus || selectedTx.topup_status === "success"}
                    onClick={() => handleUpdateStatus(selectedTx.id, undefined, "success")}
                    className="h-9 text-[10px] font-black uppercase tracking-wider bg-emerald-600 text-white hover:bg-emerald-700 shrink-0"
                  >
                    Set Berhasil
                  </Button>
                  <Button
                    disabled={updatingStatus || selectedTx.topup_status === "failed"}
                    onClick={() => handleUpdateStatus(selectedTx.id, undefined, "failed")}
                    variant="destructive"
                    className="h-9 text-[10px] font-black uppercase tracking-wider bg-red-500 text-white hover:bg-red-600 shrink-0"
                  >
                    Set Gagal
                  </Button>
                </div>
              </div>

              {/* Special Actions for failed or problem transactions */}
              <div className="space-y-2 pt-2 border-t border-sky-border/40">
                <span className="text-text-secondary font-black uppercase tracking-wider text-[10px] block">Tindakan Penyelesaian (Gagal/Error)</span>
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    disabled={updatingStatus}
                    onClick={() => handleRetry(selectedTx.id)}
                    variant="outline"
                    className="h-9 text-[10px] font-black uppercase tracking-wider border-sky-border hover:bg-sky-border/20 text-sky shrink-0"
                  >
                    Proses Ulang (API)
                  </Button>
                  <Button
                    disabled={updatingStatus || selectedTx.provider_ref === "REFUNDED"}
                    onClick={() => handleRefund(selectedTx.id)}
                    variant="destructive"
                    className="h-9 text-[10px] font-black uppercase tracking-wider bg-red-600 hover:bg-red-700 text-white shrink-0"
                  >
                    Refund & Set Gagal
                  </Button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
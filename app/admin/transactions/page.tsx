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
  const [updatingStatus, setUpdatingStatus] = useState(false)
  const [showAdminPassword, setShowAdminPassword] = useState(false) // untuk toggle visibility password di detail dialog

  // Direct Topup / Gift Modal states
  const [isDirectTopupOpen, setIsDirectTopupOpen] = useState(false)
  const [productsList, setProductsList] = useState<any[]>([])
  const [loadingProducts, setLoadingProducts] = useState(false)
  const [productSearch, setProductSearch] = useState("")
  const [directForm, setDirectForm] = useState({
    product_id: "",
    target_id: "",
    server_id: "",
    request_notes: "",
    process_digiflazz: true,
  })
  const [submittingDirect, setSubmittingDirect] = useState(false)

  const selectedProductObj = productsList.find(p => p.id === directForm.product_id)
  const selectedGameSlug = selectedProductObj?.game_slug || selectedProductObj?.game_name?.toLowerCase().replace(/[^a-z0-9]+/g, '-') || ""
  const isMobileLegends = selectedGameSlug.includes("mobile-legend") || selectedGameSlug.includes("mlbb")

  const filteredProductsForSelect = productsList.filter(p => {
    if (!productSearch.trim()) return true
    const q = productSearch.toLowerCase()
    const pName = (p.name || "").toLowerCase()
    const gName = (p.game_name || "").toLowerCase()
    const sku = (p.provider_sku || "").toLowerCase()
    return pName.includes(q) || gName.includes(q) || sku.includes(q)
  })

  const openDirectTopupModal = async () => {
    setIsDirectTopupOpen(true)
    setProductSearch("")
    if (productsList.length === 0) {
      setLoadingProducts(true)
      try {
        const res = await fetch("/api/admin/products")
        const data = await res.json()
        if (data.products) {
          setProductsList(data.products)
        }
      } catch (err) {
        console.error("Failed to load products for direct topup:", err)
      } finally {
        setLoadingProducts(false)
      }
    }
  }

  const handleDirectTopupSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!directForm.product_id || !directForm.target_id) {
      alert("Pilih produk dan isi ID Target / User ID terlebih dahulu!")
      return
    }
    setSubmittingDirect(true)
    try {
      const fullTargetId = isMobileLegends && directForm.server_id
        ? `${directForm.target_id.trim()} (${directForm.server_id.trim()})`
        : directForm.target_id.trim()

      const res = await fetch("/api/admin/transactions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          product_id: directForm.product_id,
          target_id: fullTargetId,
          request_notes: directForm.request_notes,
          process_digiflazz: directForm.process_digiflazz
        }),
      })
      const data = await res.json()
      if (data.error) throw new Error(data.error)

      alert(`Direct Topup Berhasil! Invoice: ${data.invoice} Status: ${data.topup_status}`)
      setIsDirectTopupOpen(false)
      setDirectForm({
        product_id: "",
        target_id: "",
        server_id: "",
        request_notes: "",
        process_digiflazz: true,
      })
      fetchAdminData()
    } catch (err: any) {
      alert(`Gagal membuat Direct Topup: ${err.message}`)
    } finally {
      setSubmittingDirect(false)
    }
  }

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
          provider_ref: tx.provider_ref,
          provider_response: tx.provider_response,
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
      <div className="min-h-screen flex flex-col ">
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
                  <div key={i} className="bg-mist backdrop-blur-md p-4 rounded-xl border border-sky/30 shadow-sky-soft space-y-2">
                    <Skeleton className="h-3.5 w-24 rounded bg-sky/10" />
                    <Skeleton className="h-7 w-16 rounded-md bg-sky/10" />
                  </div>
                ))}
              </div>

              {/* Table Card */}
              <div className="bg-mist backdrop-blur-md rounded-[20px] border border-sky/30 shadow-sky-soft p-6 space-y-6">
                <div className="flex gap-4 flex-wrap">
                  <Skeleton className="h-10 w-72 rounded-xl bg-sky/10" />
                  <Skeleton className="h-10 w-36 rounded-xl bg-sky/10" />
                </div>
                <div className="space-y-3">
                  {/* Header row */}
                  <div className="grid grid-cols-7 gap-4 py-2 border-b border-sky/30">
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
                    <div key={i} className="grid grid-cols-7 gap-4 py-4 items-center border-b border-sky/30">
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
    <div className="min-h-screen flex flex-col ">
      <Header user={currentUser} />

      <SidebarContentWrapper isAuthenticated={!!currentUser}>
        <main className="flex-1 py-8">
        <div className="container">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold mb-2">Transaksi</h1>
              <p className="text-white/60">
                Monitoring semua transaksi top up
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Button onClick={openDirectTopupModal} className="bg-sky hover:bg-sky-dark text-white font-bold gap-2">
                <Plus className="h-4 w-4" />
                Direct Top Up / Gift
              </Button>
              <Button variant="outline" className="gap-2">
                <Download className="h-4 w-4" />
                Export
              </Button>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {stats.map((stat, index) => (
              <Card key={index}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-2">
                    <stat.icon className={`h-5 w-5 ${stat.color}`} />
                  </div>
                  <p className="text-2xl font-black text-white">{stat.value}</p>
                  <p className="text-xs font-bold text-white uppercase tracking-wider">{stat.label}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Search and Filter */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/60" />
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
              className="px-4 py-2 rounded-lg border border-sky/30 bg-[#183644] text-white text-xs font-bold focus:outline-none focus:border-sky cursor-pointer"
            >
              <option value="all" className="bg-[#183644] text-white">Semua Status</option>
              <option value="success" className="bg-[#183644] text-white">Berhasil</option>
              <option value="processing" className="bg-[#183644] text-white">Diproses</option>
              <option value="pending" className="bg-[#183644] text-white">Pending</option>
              <option value="failed" className="bg-[#183644] text-white">Gagal</option>
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
                          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-sky/20 p-1.5">
                            <img
                              src={getItemAssetForProduct(tx.product, undefined, tx.game)}
                              alt=""
                              className="max-h-full max-w-full object-contain"
                            />
                          </span>
                          <div>
                            <p className="font-medium">{tx.product}</p>
                            <p className="flex items-center gap-1.5 text-xs text-white/60">
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
                      <TableCell className="text-white/60 text-sm">
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
        <DialogContent className="max-w-md bg-mist backdrop-blur-md border border-sky/30 shadow-sky-medium rounded-[24px] overflow-hidden p-6 text-white">
          <DialogHeader className="mb-4">
            <DialogTitle className="text-base font-black uppercase text-white">
              Detail Transaksi
            </DialogTitle>
            <DialogDescription className="text-xs text-white/60 font-bold tracking-wider font-mono">
              Invoice: {selectedTx?.invoice}
            </DialogDescription>
          </DialogHeader>

          {selectedTx && (
            <div className="space-y-5 text-xs">
              {/* Product and general info */}
              <div className="border border-sky/30 rounded-xl bg-sky/20/40 p-4 space-y-2.5">
                <div className="flex justify-between items-center">
                  <span className="text-white/80 font-medium">Game / Produk</span>
                  <span className="font-bold text-white">{selectedTx.game} - {selectedTx.product}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-white/80 font-medium">Target ID / No. Tujuan</span>
                  <span className="font-mono font-bold text-white bg-mist backdrop-blur-md px-2 py-0.5 rounded border border-sky/30">{selectedTx.target_id}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-white/80 font-medium">Total Pembayaran</span>
                  <span className="font-black text-sky text-sm">{formatCurrency(selectedTx.amount)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-white/80 font-medium">Status Saat Ini</span>
                  <span className={`px-2 py-0.5 rounded-full font-bold uppercase text-[9px] ${getStatusBgColor(selectedTx.topup_status)}`}>
                    {selectedTx.topup_status === "success" ? "Berhasil" : selectedTx.topup_status === "processing" ? "Diproses" : selectedTx.topup_status === "pending" ? "Pending" : "Gagal"}
                  </span>
                </div>
              </div>

              {/* Digiflazz Response / Error Details Box */}
              {(selectedTx.provider_ref || selectedTx.provider_response) && (
                <div className="bg-red-500/10 border border-red-500/30 p-4 rounded-xl space-y-2 text-left">
                  <div className="flex justify-between items-center border-b border-red-500/20 pb-2">
                    <span className="text-red-400 font-bold uppercase tracking-wider text-[10px]">Detail Respon Provider (Digiflazz)</span>
                    <span className="font-mono text-[10px] text-white/70 font-semibold">SN/Ref: {selectedTx.provider_ref || "-"}</span>
                  </div>
                  {(() => {
                    let parsed: any = null;
                    try {
                      parsed = typeof selectedTx.provider_response === "string" ? JSON.parse(selectedTx.provider_response) : selectedTx.provider_response;
                    } catch (e) {
                      parsed = selectedTx.provider_response;
                    }
                    const dataObj = parsed?.data || parsed;
                    const message = dataObj?.message || dataObj?.error || (typeof dataObj === "string" ? dataObj : null);
                    const rc = dataObj?.rc;

                    return (
                      <div className="space-y-2 font-mono text-[11px] text-white/90">
                        {rc && <p><span className="text-red-300 font-bold">Response Code (RC):</span> {rc}</p>}
                        {message && <p><span className="text-red-300 font-bold">Keterangan Error:</span> {message}</p>}
                        <div className="mt-2 pt-2 border-t border-red-500/10">
                          <span className="text-[10px] text-white/50 block mb-1">Payload JSON Lengkap:</span>
                          <pre className="text-[10px] text-emerald-400 overflow-x-auto whitespace-pre-wrap max-h-40 p-2.5 bg-black/50 rounded-lg border border-white/10 font-mono">
                            {JSON.stringify(parsed, null, 2)}
                          </pre>
                        </div>
                      </div>
                    );
                  })()}
                </div>
              )}

              {selectedTx.request_notes && (
                <div className="bg-sky/20 border border-sky/30 p-4 rounded-xl">
                  <div className="flex flex-col gap-1 text-xs text-left">
                    <span className="text-white/80 font-semibold">Catatan Khusus Pelanggan:</span>
                    <p className="bg-mist backdrop-blur-md p-2.5 rounded-lg border border-sky/30 font-medium text-white whitespace-pre-wrap leading-relaxed">{selectedTx.request_notes}</p>
                  </div>
                </div>
              )}

              {/* Action Buttons to edit topup status */}
              <div className="space-y-2 pt-2 border-t border-sky/30">
                <span className="text-white/80 font-black uppercase tracking-wider text-[10px] block">Kelola Status Pesanan</span>
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
              <div className="space-y-2 pt-2 border-t border-sky/30">
                <span className="text-white/80 font-black uppercase tracking-wider text-[10px] block">Tindakan Penyelesaian (Gagal/Error)</span>
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    disabled={updatingStatus}
                    onClick={() => handleRetry(selectedTx.id)}
                    variant="outline"
                    className="h-9 text-[10px] font-black uppercase tracking-wider border-sky/30 hover:bg-sky-border/20 text-sky shrink-0"
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

      {/* Direct Top Up / Gift Modal */}
      <Dialog open={isDirectTopupOpen} onOpenChange={setIsDirectTopupOpen}>
        <DialogContent className="max-w-md bg-[#183644] text-white border-sky/30">
          <DialogHeader>
            <DialogTitle className="text-lg font-black uppercase tracking-wide text-white">Direct Top Up / Gift (Admin)</DialogTitle>
            <DialogDescription className="text-xs text-white/60">
              Isi data untuk memproses topup / gift secara langsung tanpa melalui jalur pembayaran.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleDirectTopupSubmit} className="space-y-4 pt-2">
            <div>
              <label className="text-xs font-bold text-white/80 uppercase block mb-1.5">Pilih Produk *</label>
              {loadingProducts ? (
                <div className="h-10 bg-white/10 rounded-lg animate-pulse" />
              ) : (
                <div className="space-y-2">
                  <Input
                    placeholder="🔍 Ketik nama game/produk atau SKU untuk mencari..."
                    value={productSearch}
                    onChange={(e) => setProductSearch(e.target.value)}
                    className="bg-black/40 border-sky/30 text-white placeholder:text-white/40 text-xs"
                  />
                  <select
                    required
                    value={directForm.product_id}
                    onChange={(e) => setDirectForm(prev => ({ ...prev, product_id: e.target.value }))}
                    className="w-full h-10 px-3 rounded-lg bg-black/30 border border-sky/30 text-white text-xs focus:outline-none focus:border-sky"
                  >
                    <option value="" className="bg-[#183644]">-- Pilih Produk Topup ({filteredProductsForSelect.length} Produk) --</option>
                    {filteredProductsForSelect.map((p) => (
                      <option key={p.id} value={p.id} className="bg-[#183644]">
                        {p.game_name ? `${p.game_name} - ` : ''}{p.name} (SKU: {p.provider_sku || '-'}) - Rp {Number(p.price).toLocaleString("id-ID")}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            {/* Target ID / Server ID inputs */}
            <div className={isMobileLegends ? "grid grid-cols-2 gap-3" : ""}>
              <div>
                <label className="text-xs font-bold text-white/80 uppercase block mb-1.5">User ID / ID Target *</label>
                <Input
                  required
                  placeholder="Contoh: 12345678"
                  value={directForm.target_id}
                  onChange={(e) => setDirectForm(prev => ({ ...prev, target_id: e.target.value }))}
                  className="bg-black/30 border-sky/30 text-white placeholder:text-white/30 text-xs"
                />
              </div>

              {isMobileLegends && (
                <div>
                  <label className="text-xs font-bold text-white/80 uppercase block mb-1.5">Server ID (Zone ID) *</label>
                  <Input
                    required
                    placeholder="Contoh: 1234"
                    value={directForm.server_id}
                    onChange={(e) => setDirectForm(prev => ({ ...prev, server_id: e.target.value }))}
                    className="bg-black/30 border-sky/30 text-white placeholder:text-white/30 text-xs"
                  />
                </div>
              )}
            </div>

            <div>
              <label className="text-xs font-bold text-white/80 uppercase block mb-1.5">Catatan / Keterangan (Opsional)</label>
              <Input
                placeholder="Contoh: Gift Pemenang Tournament / Bonus"
                value={directForm.request_notes}
                onChange={(e) => setDirectForm(prev => ({ ...prev, request_notes: e.target.value }))}
                className="bg-black/30 border-sky/30 text-white placeholder:text-white/30 text-xs"
              />
            </div>

            <div className="flex items-center gap-2 pt-1">
              <input
                type="checkbox"
                id="process_digiflazz"
                checked={directForm.process_digiflazz}
                onChange={(e) => setDirectForm(prev => ({ ...prev, process_digiflazz: e.target.checked }))}
                className="h-4 w-4 rounded border-sky/30 bg-black/30 text-sky focus:ring-sky"
              />
              <label htmlFor="process_digiflazz" className="text-xs text-white/80 font-semibold cursor-pointer">
                Kirim transaksi otomatis ke Digiflazz (H2H)
              </label>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-sky/20">
              <Button
                type="button"
                variant="ghost"
                onClick={() => setIsDirectTopupOpen(false)}
                className="text-white/70 hover:text-white text-xs"
              >
                Batal
              </Button>
              <Button
                type="submit"
                disabled={submittingDirect}
                className="bg-sky hover:bg-sky-dark text-white font-bold text-xs"
              >
                {submittingDirect ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : null}
                Proses Direct Top Up
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
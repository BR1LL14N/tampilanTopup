"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog"
import { Header } from "@/components/layout/header"
import { SidebarContentWrapper } from "@/components/layout/sidebar-content-wrapper"
import { Skeleton } from "@/components/ui/skeleton"
import { getCachedUser, setCachedUser } from "@/lib/auth-cache"
import { formatCurrency, getStatusBgColor } from "@/lib/utils"
import { getGameAssetByName, getItemAssetForProduct } from "@/lib/assets"
import {
  Plus,
  Search,
  MoreHorizontal,
  Edit,
  Trash2,
  TrendingUp,
  Loader2,
  AlertCircle,
  CheckCircle2,
  Eye,
  CheckSquare,
  Power,
  PowerOff,
} from "lucide-react"

export default function AdminProductsPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [productsList, setProductsList] = useState<any[]>([])
  const [games, setGames] = useState<any[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [activeTab, setActiveTab] = useState("all")
  const [selectedGameFilter, setSelectedGameFilter] = useState("all")

  // Bulk Action States
  const [selectedProductIds, setSelectedProductIds] = useState<string[]>([])
  const [isBulkUpdating, setIsBulkUpdating] = useState(false)
  
  // Sync States
  const [syncing, setSyncing] = useState(false)
  const [markupPercent, setMarkupPercent] = useState("10")
  const [syncStatus, setSyncStatus] = useState<string | null>(null)
  const [syncLogs, setSyncLogs] = useState<any[] | null>(null)
  const [rawDigiflazzResponse, setRawDigiflazzResponse] = useState<any | null>(null)
  const [syncModalTab, setSyncModalTab] = useState<"log" | "raw">("log")
  const [copiedJson, setCopiedJson] = useState(false)
  const [isSyncLogOpen, setIsSyncLogOpen] = useState(false)
  
  // Edit Quick Price States
  const [editingProduct, setEditingProduct] = useState<any | null>(null)
  const [editedSellPrice, setEditedSellPrice] = useState("")
  const [warnBelowCost, setWarnBelowCost] = useState(false)

  // Full Form Edit States
  const [selectedProduct, setSelectedProduct] = useState<any | null>(null)
  const [isFormDialogOpen, setIsFormDialogOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [editForm, setEditForm] = useState({
    game_id: "",
    name: "",
    provider_sku: "",
    price: 0,
    sell_price: 0,
    status: true,
    sort_order: 0,
    is_flash_sale: false,
    flash_sale_price: 0,
    flash_sale_stock: 100,
  })

  // Clip Paths for UI Bevels
  const bevelStyle = {
    clipPath: "polygon(10px 0%, calc(100% - 10px) 0%, 100% 10px, 100% calc(100% - 10px), calc(100% - 10px) 100%, 10px 100%, 0% calc(100% - 10px), 0% 10px)"
  }
  const buttonBevelStyle = {
    clipPath: "polygon(8px 0%, calc(100% - 8px) 0%, 100% 8px, 100% calc(100% - 8px), calc(100% - 8px) 100%, 8px 100%, 0% calc(100% - 8px), 0% 8px)"
  }

  const fetchAdminData = async () => {
    try {
      // 1. Authenticate user
      const resUser = await fetch("/api/auth/me")
      const { user } = await resUser.json()

      if (!user || user.role !== "admin") {
        setCachedUser(null)
        router.push("/auth/login")
        return
      }

      setCurrentUser(user)
      setCachedUser(user)

      // 2. Fetch products list database-agnostically
      const resProducts = await fetch("/api/admin/products")
      const prodData = await resProducts.json()
      if (prodData.products) {
        setProductsList(prodData.products)
      }

      // 3. Fetch games list database-agnostically
      const resGames = await fetch("/api/admin/games")
      const gamesData = await resGames.json()
      if (gamesData.games) {
        setGames(gamesData.games)
      }
    } catch (err) {
      console.error("Failed to load admin products data:", err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    // Read cache on mount
    const cached = getCachedUser()
    if (cached?.role === "admin") {
      setCurrentUser(cached)
    }
    fetchAdminData()
  }, [router])

  // Sync products trigger
  const handleSync = async () => {
    const markupNum = parseFloat(markupPercent)
    if (isNaN(markupNum) || markupNum < 0) {
      setSyncStatus("Error: Markup tidak boleh negatif. Masukkan nilai antara 0–100.")
      return
    }
    try {
      setSyncing(true)
      setSyncStatus(null)
      const res = await fetch(`/api/admin/sync/trigger?manual=true&markup=${markupPercent}`, {
        method: "POST"
      })
      const data = await res.json()
      if (data.success) {
        const newAdded = data.productsCreated ?? data.summary?.newAdded ?? 0
        const updated = data.productsUpdated ?? data.summary?.updated ?? 0
        const skipped = data.skippedProductsCount ?? data.summary?.skipped ?? 0
        let msg = `Berhasil menyinkronkan: ${newAdded} produk baru, ${updated} produk diperbarui.`
        if (skipped > 0) {
          msg += ` (${skipped} produk dari Digiflazz dilewati karena nonaktif dari supplier/game).`
        }
        setSyncStatus(msg)
        if (data.log || data.sampleItems) {
          setSyncLogs(data.log || data.sampleItems || [])
        }
        if (data.rawResponse) {
          setRawDigiflazzResponse(data.rawResponse)
        }
        fetchAdminData() // Reload catalog
      } else {
        setSyncStatus(`Error: ${data.error || "Gagal melakukan sync"}`)
        if (data.details) {
          setRawDigiflazzResponse(data.details)
          setSyncLogs([data.details])
        } else if (data.log) {
          setSyncLogs(Array.isArray(data.log) ? data.log : [data.log])
        } else {
          setSyncLogs([data])
        }
      }
    } catch (err: any) {
      console.error(err)
      setSyncStatus(`Error: ${err.message || "Gagal melakukan sync"}`)
      setSyncLogs([{ error: err.message }])
    } finally {
      setSyncing(false)
    }
  }

  // Quick edit price handler
  const handleSavePrice = async (forceSubmit = false) => {
    if (!editingProduct) return
    const priceNum = parseInt(editedSellPrice)
    if (isNaN(priceNum) || priceNum <= 0) {
      alert("Harga jual tidak valid. Harus lebih dari 0.")
      return
    }

    if (!forceSubmit && priceNum < editingProduct.price) {
      setWarnBelowCost(true)
      return
    }

    setWarnBelowCost(false)
    try {
      const res = await fetch("/api/admin/products", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: editingProduct.id,
          sell_price: priceNum
        })
      })
      const data = await res.json()
      if (data.error) {
        alert(`Gagal mengupdate harga: ${data.error}`)
      } else {
        setProductsList(prev => prev.map(p => p.id === editingProduct.id ? { ...p, sell_price: priceNum } : p))
        setEditingProduct(null)
      }
    } catch (err: any) {
      alert(`Error: ${err.message}`)
    }
  }

  // Full product Add/Edit Form Handlers
  const handleOpenEdit = (product: any) => {
    setSelectedProduct(product)
    setEditForm({
      game_id: product.game_id || (games[0]?.id || ""),
      name: product.name,
      provider_sku: product.provider_sku,
      price: product.price,
      sell_price: product.sell_price,
      status: product.status === 1 || product.status === true,
      sort_order: product.sort_order || 0,
      is_flash_sale: product.is_flash_sale === 1 || product.is_flash_sale === true,
      flash_sale_price: product.flash_sale_price || 0,
      flash_sale_stock: product.flash_sale_stock || 100,
    })
    setIsFormDialogOpen(true)
  }

  const handleOpenAdd = () => {
    setSelectedProduct(null)
    setEditForm({
      game_id: games[0]?.id || "",
      name: "",
      provider_sku: "",
      price: 0,
      sell_price: 0,
      status: true,
      sort_order: 0,
      is_flash_sale: false,
      flash_sale_price: 0,
      flash_sale_stock: 100,
    })
    setIsFormDialogOpen(true)
  }

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
      const payload: any = {
        name: editForm.name,
        provider_sku: editForm.provider_sku,
        price: Number(editForm.price) || 0,
        sell_price: Number(editForm.sell_price) || 0,
        status: editForm.status ? 1 : 0,
        sort_order: Number(editForm.sort_order) || 0,
        is_flash_sale: editForm.is_flash_sale ? 1 : 0,
        flash_sale_price: editForm.is_flash_sale ? (Number(editForm.flash_sale_price) || 0) : null,
        flash_sale_stock: editForm.is_flash_sale ? (Number(editForm.flash_sale_stock) || 100) : 100,
      }

      const method = selectedProduct ? "PUT" : "POST"
      const body = selectedProduct ? { id: selectedProduct.id, ...payload } : { ...payload, game_id: editForm.game_id }

      const res = await fetch("/api/admin/products", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body)
      })

      const data = await res.json()
      if (data.error) throw new Error(data.error)

      setIsFormDialogOpen(false)
      fetchAdminData()
    } catch (err: any) {
      alert("Gagal menyimpan data produk: " + err.message)
    } finally {
      setSaving(false)
    }
  }

  // Bulk Status Update Handlers
  const handleBulkStatusUpdate = async (targetStatus: boolean, scope: 'selected' | 'filtered' | 'all') => {
    let idsToUpdate: string[] | undefined = undefined
    let confirmMsg = ""

    if (scope === 'selected') {
      if (selectedProductIds.length === 0) {
        alert("Pilih setidaknya 1 produk untuk diubah statusnya.")
        return
      }
      idsToUpdate = selectedProductIds
      confirmMsg = `Apakah Anda yakin ingin ${targetStatus ? 'MENGAKTIFKAN' : 'MENONAKTIFKAN'} ${selectedProductIds.length} produk terpilih?`
    } else if (scope === 'filtered') {
      idsToUpdate = filteredProducts.map((p) => p.id)
      if (idsToUpdate.length === 0) {
        alert("Tidak ada produk dalam hasil pencarian/filter saat ini.")
        return
      }
      confirmMsg = `Apakah Anda yakin ingin ${targetStatus ? 'MENGAKTIFKAN' : 'MENONAKTIFKAN'} ${idsToUpdate.length} produk hasil filter ini?`
    } else {
      confirmMsg = `Apakah Anda yakin ingin ${targetStatus ? 'MENGAKTIFKAN SEMUA' : 'MENONAKTIFKAN SEMUA'} ${productsList.length} produk di database?`
    }

    if (!confirm(confirmMsg)) return

    try {
      setIsBulkUpdating(true)
      const res = await fetch("/api/admin/products", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "bulk_status",
          status: targetStatus,
          ids: idsToUpdate,
        })
      })

      const data = await res.json()
      if (data.error) throw new Error(data.error)

      // Optimistically update local state
      setProductsList((prev) =>
        prev.map((p) => {
          if (!idsToUpdate || idsToUpdate.includes(p.id)) {
            return { ...p, status: targetStatus ? 1 : 0 }
          }
          return p
        })
      )

      if (scope === 'selected') {
        setSelectedProductIds([])
      }

      setSyncStatus(`Berhasil ${targetStatus ? 'mengaktifkan' : 'menonaktifkan'} produk!`)
    } catch (err: any) {
      alert("Gagal mengubah status massal: " + err.message)
    } finally {
      setIsBulkUpdating(false)
    }
  }

  const toggleSelectProduct = (id: string) => {
    setSelectedProductIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    )
  }

  const toggleSelectAllFiltered = () => {
    const filteredIds = filteredProducts.map((p) => p.id)
    const allSelected = filteredIds.length > 0 && filteredIds.every((id) => selectedProductIds.includes(id))

    if (allSelected) {
      setSelectedProductIds((prev) => prev.filter((id) => !filteredIds.includes(id)))
    } else {
      const combined = Array.from(new Set([...selectedProductIds, ...filteredIds]))
      setSelectedProductIds(combined)
    }
  }

  const handleDeleteProduct = async (productId: string) => {
    if (!confirm("Apakah Anda yakin ingin menghapus produk ini?")) return
    try {
      const res = await fetch(`/api/admin/products?id=${productId}`, {
        method: "DELETE"
      })

      const data = await res.json()
      if (data.error) throw new Error(data.error)

      fetchAdminData()
    } catch (err: any) {
      alert("Gagal menghapus produk: " + err.message)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col ">
        <Header user={currentUser} />
        <SidebarContentWrapper isAuthenticated={!!currentUser}>
          <main className="flex-1 py-8">
            <div className="container space-y-8">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <Skeleton className="h-8 w-44 rounded-lg bg-sky/10" />
                  <Skeleton className="h-4 w-64 rounded-md bg-sky/10" />
                </div>
                <Skeleton className="h-10 w-36 rounded-xl bg-sky/10" />
              </div>
              <div className="flex gap-2">
                <Skeleton className="h-9 w-20 rounded-lg bg-sky/10" />
                <Skeleton className="h-9 w-24 rounded-lg bg-sky/10" />
                <Skeleton className="h-9 w-24 rounded-lg bg-sky/10" />
              </div>
              <div className="bg-mist backdrop-blur-md rounded-[20px] border border-sky/30 shadow-sky-soft p-6 space-y-6">
                <Skeleton className="h-10 w-80 rounded-xl bg-sky/10" />
                <div className="space-y-3">
                  <div className="grid grid-cols-6 gap-4 py-2 border-b border-sky/30">
                    <Skeleton className="h-4 w-24 rounded bg-sky/10" />
                    <Skeleton className="h-4 w-16 rounded bg-sky/10" />
                    <Skeleton className="h-4 w-20 rounded bg-sky/10" />
                    <Skeleton className="h-4 w-16 rounded bg-sky/10" />
                    <Skeleton className="h-4 w-12 rounded bg-sky/10" />
                    <Skeleton className="h-4 w-8 justify-self-end rounded bg-sky/10" />
                  </div>
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className="grid grid-cols-6 gap-4 py-4 items-center border-b border-sky/30">
                      <Skeleton className="h-4 w-32 rounded-md bg-sky/10" />
                      <Skeleton className="h-4 w-24 rounded-md bg-sky/10" />
                      <Skeleton className="h-4.5 w-16 rounded-md bg-sky/10" />
                      <Skeleton className="h-4 w-16 rounded-md bg-sky/10" />
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

  // Filter products by game, tab, and search query
  const filteredProducts = productsList.filter((product) => {
    const nameStr = product.name || ""
    const gameStr = product.game_name || product.game || ""
    const gameId = product.game_id || ""
    const skuStr = product.provider_sku || ""
    const isFlash = product.is_flash_sale === 1 || product.is_flash_sale === true

    const matchesSearch =
      nameStr.toLowerCase().includes(searchQuery.toLowerCase()) || 
      gameStr.toLowerCase().includes(searchQuery.toLowerCase()) ||
      skuStr.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesTab =
      activeTab === "all" ||
      (activeTab === "active" && (product.status === 1 || product.status === true)) ||
      (activeTab === "inactive" && !(product.status === 1 || product.status === true)) ||
      (activeTab === "flash_sale" && isFlash)

    const matchesGame =
      selectedGameFilter === "all" ||
      gameId === selectedGameFilter ||
      product.game_slug === selectedGameFilter ||
      gameStr.toLowerCase() === selectedGameFilter.toLowerCase()

    return matchesSearch && matchesTab && matchesGame
  })

  return (
    <div className="min-h-screen flex flex-col ">
      <Header user={currentUser} />

      <SidebarContentWrapper isAuthenticated={!!currentUser}>
        <main className="flex-1 py-8">
          <div className="container">
            {/* Header section */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
              <div>
                <h1 className="text-3xl font-black uppercase tracking-tight text-white">Kelola Produk</h1>
                <p className="text-sm font-bold text-white/60 uppercase tracking-widest mt-1">
                  Pengaturan Katalog Voucher &amp; Nominal Top-Up
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <div className="flex items-center gap-2 bg-mist backdrop-blur-md px-3 py-1.5 rounded-xl border border-sky/30 shadow-sm">
                  <span className="text-xs font-semibold text-white/80 whitespace-nowrap">Markup:</span>
                  <Input
                    type="number"
                    value={markupPercent}
                    onChange={(e) => setMarkupPercent(e.target.value)}
                    className="w-14 h-7 text-center text-xs font-semibold p-1 focus-visible:ring-sky font-mono"
                    min="0"
                    max="100"
                  />
                  <span className="text-xs font-semibold text-white/80">%</span>
                </div>
                
                <Button 
                  variant="outline"
                  onClick={handleSync} 
                  disabled={syncing}
                  className="gap-2 border-sky text-sky hover:bg-sky/5 rounded-xl shadow-sm h-10 text-xs font-bold uppercase tracking-wider"
                >
                  {syncing ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Syncing...
                    </>
                  ) : (
                    <>
                      <TrendingUp className="h-4 w-4" />
                      Sync dari Digiflazz
                    </>
                  )}
                </Button>

                <Button
                  variant="outline"
                  onClick={async () => {
                    setIsSyncLogOpen(true)
                    if (!syncLogs || syncLogs.length === 0) {
                      try {
                        const res = await fetch(`/api/admin/sync/trigger?manual=true&markup=${markupPercent}`, { method: "POST" })
                        const data = await res.json()
                        if (data.log || data.sampleItems) {
                          setSyncLogs(data.log || data.sampleItems || [])
                        }
                      } catch (e) {}
                    }
                  }}
                  className="gap-2 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20 rounded-xl shadow-sm h-10 text-xs font-bold uppercase tracking-wider"
                >
                  <Eye className="h-4 w-4" />
                  History Respon Sync
                </Button>

                <Button onClick={handleOpenAdd} className="gap-2 rounded-xl h-10 text-xs font-bold uppercase tracking-wider shimmer-hover">
                  <Plus className="h-4 w-4" />
                  Tambah Produk
                </Button>
              </div>
            </div>

            {/* Sync Status Banner */}
            {syncStatus && (
              <div className={`mb-6 p-4 rounded-xl border text-xs font-bold uppercase tracking-wider flex items-center justify-between gap-2.5 ${
                syncStatus.startsWith('Error') 
                  ? 'bg-red-500/10 border-red-500/30 text-red-400' 
                  : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
              }`}>
                <div className="flex items-center gap-2.5">
                  {syncStatus.startsWith('Error') ? <AlertCircle className="h-4 w-4 shrink-0" /> : <CheckCircle2 className="h-4 w-4 shrink-0" />}
                  <span>{syncStatus}</span>
                </div>
                {syncLogs && syncLogs.length > 0 && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setIsSyncLogOpen(true)}
                    className="h-7 text-[10px] font-black uppercase border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20"
                  >
                    Lihat History Respon Sync ({syncLogs.length})
                  </Button>
                )}
              </div>
            )}

            {/* Stats Overview */}
            <div className="grid grid-cols-3 gap-6 mb-8">
              <div className="relative p-[1px] bg-sky-border" style={bevelStyle}>
                <div className="bg-mist backdrop-blur-md p-6" style={bevelStyle}>
                  <p className="text-white/60 text-[10px] font-black uppercase tracking-wider">Total Produk</p>
                  <p className="text-3xl font-black font-mono text-white mt-1">{productsList.length}</p>
                </div>
              </div>
              <div className="relative p-[1px] bg-sky-border" style={bevelStyle}>
                <div className="bg-mist backdrop-blur-md p-6" style={bevelStyle}>
                  <p className="text-white/60 text-[10px] font-black uppercase tracking-wider">Aktif</p>
                  <p className="text-3xl font-black font-mono text-green-500 mt-1">
                    {productsList.filter((p) => p.status === 1 || p.status === true).length}
                  </p>
                </div>
              </div>
              <div className="relative p-[1px] bg-sky-border" style={bevelStyle}>
                <div className="bg-mist backdrop-blur-md p-6" style={bevelStyle}>
                  <p className="text-white/60 text-[10px] font-black uppercase tracking-wider">Flash Sale</p>
                  <p className="text-3xl font-black font-mono text-sky mt-1">
                    {productsList.filter((p) => p.is_flash_sale === 1 || p.is_flash_sale === true).length}
                  </p>
                </div>
              </div>
            </div>

            {/* Search and Filters */}
            <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3 mb-4">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/60" />
                <Input
                  placeholder="Cari nama produk, game, atau SKU..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 rounded-xl border-sky/30 text-xs font-semibold focus-visible:ring-sky h-10"
                />
              </div>

              {/* Filter Game Dropdown */}
              <div className="min-w-[200px]">
                <select
                  value={selectedGameFilter}
                  onChange={(e) => setSelectedGameFilter(e.target.value)}
                  className="w-full bg-[#183644] text-white border border-sky/30 rounded-xl px-3.5 py-2 text-xs font-bold focus:outline-none focus:ring-1 focus:ring-sky cursor-pointer h-10 shadow-sm"
                >
                  <option value="all" className="bg-[#183644] text-white font-bold">
                    🎮 Semua Game ({productsList.length})
                  </option>
                  {games.map((g) => {
                    const count = productsList.filter(
                      p => p.game_id === g.id || p.game_name === g.name || p.game_slug === g.slug
                    ).length
                    return (
                      <option key={g.id} value={g.id} className="bg-[#183644] text-white font-medium">
                        {g.name} ({count})
                      </option>
                    )
                  })}
                </select>
              </div>

              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="bg-sky/20 border border-sky/30 p-1 rounded-xl h-10">
                  <TabsTrigger value="all" className="rounded-lg text-xs font-bold uppercase tracking-wider">Semua ({productsList.length})</TabsTrigger>
                  <TabsTrigger value="active" className="rounded-lg text-xs font-bold uppercase tracking-wider">Aktif ({productsList.filter(p => p.status === 1 || p.status === true).length})</TabsTrigger>
                  <TabsTrigger value="inactive" className="rounded-lg text-xs font-bold uppercase tracking-wider">Nonaktif ({productsList.filter(p => !(p.status === 1 || p.status === true)).length})</TabsTrigger>
                  <TabsTrigger value="flash_sale" className="rounded-lg text-xs font-bold uppercase tracking-wider">Flash Sale</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>

            {/* Bulk Action Controls Toolbar */}
            <div className="flex flex-wrap items-center justify-between gap-3 mb-6 bg-[#183644]/90 backdrop-blur-md p-3.5 rounded-2xl border border-sky/30 shadow-sky-soft">
              <div className="flex items-center gap-2.5">
                <span className="text-xs font-black uppercase tracking-wider text-white flex items-center gap-1.5">
                  <CheckSquare className="h-4 w-4 text-sky" />
                  Kontrol Status Massal:
                </span>
                {selectedProductIds.length > 0 && (
                  <span className="px-2.5 py-1 rounded-lg bg-sky/20 border border-sky/30 text-sky text-[11px] font-black uppercase tracking-wider animate-pulse">
                    {selectedProductIds.length} Terpilih
                  </span>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-2">
                {selectedProductIds.length > 0 ? (
                  <>
                    <Button
                      size="sm"
                      onClick={() => handleBulkStatusUpdate(true, 'selected')}
                      disabled={isBulkUpdating}
                      className="bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 border border-emerald-500/40 text-[10px] font-black uppercase tracking-wider rounded-xl h-8 shadow-sm transition-all"
                    >
                      {isBulkUpdating ? <Loader2 className="h-3.5 w-3.5 animate-spin mr-1" /> : <Power className="h-3.5 w-3.5 mr-1 text-emerald-400" />}
                      Aktifkan ({selectedProductIds.length}) Terpilih
                    </Button>

                    <Button
                      size="sm"
                      onClick={() => handleBulkStatusUpdate(false, 'selected')}
                      disabled={isBulkUpdating}
                      className="bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-500/40 text-[10px] font-black uppercase tracking-wider rounded-xl h-8 shadow-sm transition-all"
                    >
                      {isBulkUpdating ? <Loader2 className="h-3.5 w-3.5 animate-spin mr-1" /> : <PowerOff className="h-3.5 w-3.5 mr-1 text-red-400" />}
                      Nonaktifkan ({selectedProductIds.length}) Terpilih
                    </Button>

                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setSelectedProductIds([])}
                      className="text-white/60 hover:text-white text-[10px] font-bold uppercase h-8"
                    >
                      Batal Pilih
                    </Button>
                  </>
                ) : (
                  <>
                    {searchQuery || activeTab !== 'all' ? (
                      <>
                        <Button
                          size="sm"
                          onClick={() => handleBulkStatusUpdate(true, 'filtered')}
                          disabled={isBulkUpdating || filteredProducts.length === 0}
                          className="bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 border border-emerald-500/40 text-[10px] font-black uppercase tracking-wider rounded-xl h-8 shadow-sm"
                          title="Aktifkan semua produk di hasil pencarian/filter"
                        >
                          <Power className="h-3.5 w-3.5 mr-1 text-emerald-400" />
                          Aktifkan Hasil Filter ({filteredProducts.length})
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => handleBulkStatusUpdate(false, 'filtered')}
                          disabled={isBulkUpdating || filteredProducts.length === 0}
                          className="bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-500/40 text-[10px] font-black uppercase tracking-wider rounded-xl h-8 shadow-sm"
                          title="Nonaktifkan semua produk di hasil pencarian/filter"
                        >
                          <PowerOff className="h-3.5 w-3.5 mr-1 text-red-400" />
                          Nonaktifkan Hasil Filter ({filteredProducts.length})
                        </Button>
                      </>
                    ) : null}

                    <Button
                      size="sm"
                      onClick={() => handleBulkStatusUpdate(true, 'all')}
                      disabled={isBulkUpdating}
                      className="bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 border border-emerald-500/40 text-[10px] font-black uppercase tracking-wider rounded-xl h-8 shadow-sm"
                    >
                      <Power className="h-3.5 w-3.5 mr-1 text-emerald-400" />
                      Aktifkan SEMUA ({productsList.length})
                    </Button>

                    <Button
                      size="sm"
                      onClick={() => handleBulkStatusUpdate(false, 'all')}
                      disabled={isBulkUpdating}
                      className="bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-500/40 text-[10px] font-black uppercase tracking-wider rounded-xl h-8 shadow-sm"
                    >
                      <PowerOff className="h-3.5 w-3.5 mr-1 text-red-400" />
                      Nonaktifkan SEMUA ({productsList.length})
                    </Button>
                  </>
                )}
              </div>
            </div>

            {/* Products Table Card */}
            <div className="bg-mist backdrop-blur-md rounded-2xl border border-sky/30 shadow-sky-soft overflow-hidden">
              <Table>
                <TableHeader className="bg-sky/20/50">
                  <TableRow>
                    <TableHead className="w-10 text-center">
                      <input
                        type="checkbox"
                        checked={
                          filteredProducts.length > 0 &&
                          filteredProducts.every((p) => selectedProductIds.includes(p.id))
                        }
                        onChange={toggleSelectAllFiltered}
                        className="h-4 w-4 rounded border-sky/30 accent-sky cursor-pointer align-middle"
                        title="Pilih / Batal Pilih Semua"
                      />
                    </TableHead>
                    <TableHead className="text-xs font-black uppercase text-white/80 tracking-wider">Produk</TableHead>
                    <TableHead className="text-xs font-black uppercase text-white/80 tracking-wider">SKU</TableHead>
                    <TableHead className="text-xs font-black uppercase text-white/80 tracking-wider">Harga Modal</TableHead>
                    <TableHead className="text-xs font-black uppercase text-white/80 tracking-wider">Harga Jual</TableHead>
                    <TableHead className="text-xs font-black uppercase text-white/80 tracking-wider">Profit</TableHead>
                    <TableHead className="text-xs font-black uppercase text-white/80 tracking-wider">Status</TableHead>
                    <TableHead className="text-xs font-black uppercase text-white/80 tracking-wider text-right">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredProducts.map((product) => {
                    const gameName = product.game_name || product.game || "Game"
                    const profit = product.sell_price - product.price
                    const isFlash = product.is_flash_sale === 1 || product.is_flash_sale === true

                    return (
                      <TableRow key={product.id} className={`hover:bg-sky/20/20 border-b border-sky/30 ${selectedProductIds.includes(product.id) ? 'bg-sky/10' : ''}`}>
                        <TableCell className="w-10 text-center">
                          <input
                            type="checkbox"
                            checked={selectedProductIds.includes(product.id)}
                            onChange={() => toggleSelectProduct(product.id)}
                            className="h-4 w-4 rounded border-sky/30 accent-sky cursor-pointer align-middle"
                          />
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-mist backdrop-blur-md p-1.5 border border-sky/30">
                              <img
                                src={getItemAssetForProduct(product.name, product.provider_sku, gameName)}
                                alt=""
                                className="max-h-full max-w-full object-contain"
                              />
                            </span>
                            <div>
                              <p className="font-extrabold text-sm text-white uppercase tracking-tight flex items-center gap-1.5 flex-wrap">
                                {product.name}
                                {isFlash && (
                                  <span className="inline-block bg-amber-50 text-amber-500 border border-amber-500/20 text-[8px] font-black uppercase px-1.5 py-0.5 rounded">
                                    Flash Sale
                                  </span>
                                )}
                                <span className={`inline-block text-[8px] font-black uppercase px-1.5 py-0.5 rounded ${
                                  (product.provider === 'digiflazz' || (product.provider_sku && product.provider_sku.trim() !== ''))
                                    ? "bg-sky/10 text-sky border border-sky/20"
                                    : "bg-purple-50 text-purple-600 border border-purple-500/20"
                                }`}>
                                  {(product.provider === 'digiflazz' || (product.provider_sku && product.provider_sku.trim() !== '')) ? 'Digiflazz' : 'Manual'}
                                </span>
                              </p>
                              <p className="flex items-center gap-1.5 text-[10px] font-bold text-white/60 uppercase tracking-wider mt-0.5">
                                <img
                                  src={getGameAssetByName(gameName)?.icon}
                                  alt=""
                                  className="h-3.5 w-3.5 rounded object-cover"
                                />
                                {gameName}
                              </p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="font-mono text-xs text-white/80 font-semibold">
                          {product.provider_sku}
                        </TableCell>
                        <TableCell className="font-mono font-bold text-xs text-white">
                          {formatCurrency(product.price)}
                        </TableCell>
                        <TableCell className="font-mono font-bold text-xs text-white">
                          {formatCurrency(product.sell_price)}
                        </TableCell>
                        <TableCell className={`font-mono font-bold text-xs ${profit >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                          {profit >= 0 ? '+' : ''}{formatCurrency(profit)}
                        </TableCell>
                        <TableCell>
                          <span
                            className={`px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider border ${
                              (product.status === 1 || product.status === true)
                                ? "bg-green-50 text-green-500 border-green-500/20"
                                : "bg-red-50 text-red-500 border-red-500/20"
                            }`}
                          >
                            {(product.status === 1 || product.status === true) ? "Aktif" : "Nonaktif"}
                          </span>
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="hover:bg-sky/20 rounded-lg text-white">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="bg-[#183644] border-sky/30 text-white rounded-xl shadow-2xl">
                              <DropdownMenuItem 
                                onClick={() => handleOpenEdit(product)}
                                className="text-xs font-bold uppercase tracking-wider cursor-pointer text-white focus:bg-sky/20 focus:text-white"
                              >
                                <Edit className="h-3.5 w-3.5 mr-2 text-sky" />
                                Edit Detail
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                onClick={() => {
                                  setEditingProduct(product);
                                  setEditedSellPrice(product.sell_price.toString());
                                }}
                                className="text-xs font-bold uppercase tracking-wider cursor-pointer text-white focus:bg-sky/20 focus:text-white"
                              >
                                <TrendingUp className="h-3.5 w-3.5 mr-2 text-sky" />
                                Edit Harga Jual
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                onClick={() => handleDeleteProduct(product.id)}
                                className="text-xs font-bold uppercase tracking-wider text-red-400 focus:bg-red-500/20 focus:text-red-400 cursor-pointer"
                              >
                                <Trash2 className="h-3.5 w-3.5 mr-2 text-red-400" />
                                Hapus Produk
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                  {filteredProducts.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-10">
                        <p className="text-xs text-white/60 uppercase tracking-widest font-black">Tidak ada produk ditemukan</p>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        </main>
      </SidebarContentWrapper>

      {/* Quick Edit Price Dialog */}
      <Dialog open={!!editingProduct} onOpenChange={(open) => { if (!open) setEditingProduct(null); }}>
        <DialogContent className="sm:max-w-[425px] rounded-2xl border-sky/30">
          <DialogHeader>
            <DialogTitle className="text-base font-black uppercase tracking-tight text-white">Edit Harga Jual</DialogTitle>
            <DialogDescription className="text-[11px] font-medium text-white/60">
              Ubah harga jual nominal voucher <strong>{editingProduct?.name}</strong> secara instan.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <span className="text-right text-xs font-bold text-white/80 uppercase tracking-wider">
                Harga Modal
              </span>
              <div className="col-span-3 font-mono text-xs font-bold text-white">
                {editingProduct ? formatCurrency(editingProduct.price) : "-"}
              </div>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="sell-price" className="text-right text-xs font-bold text-white/80 uppercase tracking-wider">
                Harga Jual
              </label>
              <Input
                id="sell-price"
                type="number"
                value={editedSellPrice}
                onChange={(e) => { setEditedSellPrice(e.target.value); setWarnBelowCost(false); }}
                className="col-span-3 rounded-xl border-sky/30 text-xs font-semibold font-mono"
              />
            </div>
            {editingProduct && parseInt(editedSellPrice) > 0 && (() => {
              const profit = parseInt(editedSellPrice) - editingProduct.price;
              return (
                <div className="grid grid-cols-4 items-center gap-4">
                  <span className="text-right text-xs font-bold text-white/80 uppercase tracking-wider">Profit</span>
                  <span className={`col-span-3 text-xs font-black font-mono ${profit >= 0 ? "text-green-500" : "text-red-500"}`}>
                    {profit >= 0 ? "+" : ""}{formatCurrency(profit)}
                  </span>
                </div>
              );
            })()}

            {warnBelowCost && (
              <div className="col-span-4 rounded-xl bg-amber-50 border border-amber-200 p-4 text-xs text-amber-800">
                <p className="font-bold mb-1 flex items-center gap-1">⚠️ Peringatan Rugi!</p>
                <p className="leading-relaxed mb-3">
                  Menetapkan harga jual di bawah harga modal (HPP) akan menyebabkan kerugian per transaksi. Klik tombol di bawah jika ingin tetap menyimpan.
                </p>
                <div className="flex gap-2 justify-end">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setWarnBelowCost(false)}
                    className="rounded-lg text-[10px] font-bold uppercase tracking-wider h-7 border-amber-400 text-amber-700 hover:bg-amber-100"
                  >
                    Batal
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => handleSavePrice(true)}
                    className="rounded-lg text-[10px] font-bold uppercase tracking-wider h-7 bg-amber-600 hover:bg-amber-700 text-white"
                  >
                    Tetap Simpan
                  </Button>
                </div>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setEditingProduct(null); setWarnBelowCost(false); }} className="rounded-xl text-[10px] font-bold uppercase tracking-wider">
              Batal
            </Button>
            <Button onClick={() => handleSavePrice(false)} className="rounded-xl text-[10px] font-bold uppercase tracking-wider shimmer-hover">
              Simpan Harga
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Full Product Add/Edit Dialog Form */}
      <Dialog open={isFormDialogOpen} onOpenChange={setIsFormDialogOpen}>
        <DialogContent className="sm:max-w-[500px] rounded-2xl border-sky/30 overflow-y-auto max-h-[90vh]">
          <DialogHeader>
            <DialogTitle className="text-base font-black uppercase tracking-tight text-white">
              {selectedProduct ? "Edit Detail Produk" : "Tambah Produk Baru"}
            </DialogTitle>
            <DialogDescription className="text-[11px] font-medium text-white/60">
              Isi data detail item katalog produk di bawah ini secara lengkap.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSaveProduct} className="space-y-4 py-3">
            {/* Game Selector (only for adding) */}
            {!selectedProduct && (
              <div className="space-y-1.5">
                <Label htmlFor="game-select" className="text-xs font-bold text-white/80 uppercase tracking-wider">Game Kategori</Label>
                <select
                  id="game-select"
                  value={editForm.game_id}
                  onChange={(e) => setEditForm(prev => ({ ...prev, game_id: e.target.value }))}
                  className="w-full bg-mist backdrop-blur-md border border-sky/30 rounded-xl px-3 py-2 text-xs font-semibold text-white focus:outline-none focus:ring-1 focus:ring-sky h-9"
                  required
                >
                  <option value="" disabled className="bg-[#183644] text-white">Pilih Game...</option>
                  {games.map((g) => (
                    <option key={g.id} value={g.id} className="bg-[#183644] text-white py-1.5 font-bold">{g.name}</option>
                  ))}
                </select>
              </div>
            )}

            {/* Product Name */}
            <div className="space-y-1.5">
              <Label htmlFor="prod-name" className="text-xs font-bold text-white/80 uppercase tracking-wider">Nama Produk (Voucher)</Label>
              <Input
                id="prod-name"
                value={editForm.name}
                onChange={(e) => setEditForm(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Contoh: 86 Diamonds, Weekly Diamond Pass"
                className="rounded-xl border-sky/30 text-xs font-semibold"
                required
              />
            </div>

            {/* SKU Code */}
            <div className="space-y-1.5">
              <Label htmlFor="prod-sku" className="text-xs font-bold text-white/80 uppercase tracking-wider">Provider SKU / Kode Item</Label>
              <Input
                id="prod-sku"
                value={editForm.provider_sku}
                onChange={(e) => setEditForm(prev => ({ ...prev, provider_sku: e.target.value }))}
                placeholder="Contoh: mlbb-86, wdp-weekly"
                className="rounded-xl border-sky/30 text-xs font-semibold font-mono"
                required
              />
            </div>

            {/* Cost and Sell Prices */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="prod-price" className="text-xs font-bold text-white/80 uppercase tracking-wider">Harga Modal (Rp)</Label>
                <Input
                  id="prod-price"
                  type="number"
                  value={editForm.price === 0 ? "" : editForm.price}
                  onFocus={(e) => e.target.select()}
                  onChange={(e) => setEditForm(prev => ({ ...prev, price: e.target.value === "" ? 0 : Number(e.target.value) || 0 }))}
                  placeholder="0"
                  className="rounded-xl border-sky/30 text-xs font-semibold font-mono"
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="prod-sell" className="text-xs font-bold text-white/80 uppercase tracking-wider">Harga Jual (Rp)</Label>
                <Input
                  id="prod-sell"
                  type="number"
                  value={editForm.sell_price === 0 ? "" : editForm.sell_price}
                  onFocus={(e) => e.target.select()}
                  onChange={(e) => setEditForm(prev => ({ ...prev, sell_price: e.target.value === "" ? 0 : Number(e.target.value) || 0 }))}
                  placeholder="0"
                  className="rounded-xl border-sky/30 text-xs font-semibold font-mono"
                  required
                />
              </div>
            </div>

            {/* Status and Sort Order */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="prod-status" className="text-xs font-bold text-white/80 uppercase tracking-wider block">Status</Label>
                <select
                  id="prod-status"
                  value={editForm.status ? "active" : "inactive"}
                  onChange={(e) => setEditForm(prev => ({ ...prev, status: e.target.value === "active" }))}
                  className="w-full bg-mist backdrop-blur-md border border-sky/30 rounded-xl px-3 py-2 text-xs font-semibold text-white focus:outline-none focus:ring-1 focus:ring-sky h-9"
                >
                  <option value="active" className="bg-[#183644] text-white py-1.5 font-bold">Aktif</option>
                  <option value="inactive" className="bg-[#183644] text-white py-1.5 font-bold">Nonaktif</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="prod-sort" className="text-xs font-bold text-white/80 uppercase tracking-wider">No. Urut (Sort)</Label>
                <Input
                  id="prod-sort"
                  type="number"
                  value={editForm.sort_order === 0 ? "" : editForm.sort_order}
                  onFocus={(e) => e.target.select()}
                  onChange={(e) => setEditForm(prev => ({ ...prev, sort_order: e.target.value === "" ? 0 : Number(e.target.value) || 0 }))}
                  placeholder="0"
                  className="rounded-xl border-sky/30 text-xs font-semibold font-mono"
                />
              </div>
            </div>

            {/* Flash Sale Section */}
            <div className="p-4 rounded-xl border border-amber-500/40 bg-amber-500/10 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="prod-flash" className="text-xs font-black text-amber-400 uppercase tracking-wider block cursor-pointer">Set Event Flash Sale</Label>
                  <span className="text-[10px] text-white/80 font-medium">Masukkan produk ke dalam listing promo flash sale di beranda.</span>
                </div>
                <input
                  id="prod-flash"
                  type="checkbox"
                  checked={editForm.is_flash_sale}
                  onChange={(e) => setEditForm(prev => ({ ...prev, is_flash_sale: e.target.checked }))}
                  className="h-4.5 w-4.5 rounded border-amber-400/50 text-amber-500 focus:ring-amber-400 cursor-pointer"
                />
              </div>

              {editForm.is_flash_sale && (
                <div className="grid grid-cols-2 gap-4 pt-1.5 animate-fadeIn">
                  <div className="space-y-1.5">
                    <Label htmlFor="flash-price" className="text-xs font-bold text-amber-400 uppercase tracking-wider">Harga Promo (Rp)</Label>
                    <Input
                      id="flash-price"
                      type="number"
                      value={editForm.flash_sale_price === 0 ? "" : editForm.flash_sale_price}
                      onFocus={(e) => e.target.select()}
                      onChange={(e) => setEditForm(prev => ({ ...prev, flash_sale_price: e.target.value === "" ? 0 : Number(e.target.value) || 0 }))}
                      placeholder="0"
                      className="rounded-xl border-amber-500/40 text-xs font-semibold font-mono text-white bg-black/20 focus-visible:ring-amber-400"
                      required={editForm.is_flash_sale}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="flash-stock" className="text-xs font-bold text-amber-400 uppercase tracking-wider">Stok Kuota Promo</Label>
                    <Input
                      id="flash-stock"
                      type="number"
                      value={editForm.flash_sale_stock === 0 ? "" : editForm.flash_sale_stock}
                      onFocus={(e) => e.target.select()}
                      onChange={(e) => setEditForm(prev => ({ ...prev, flash_sale_stock: e.target.value === "" ? 0 : Number(e.target.value) || 0 }))}
                      placeholder="0"
                      className="rounded-xl border-amber-500/40 text-xs font-semibold font-mono text-white bg-black/20 focus-visible:ring-amber-400"
                      required={editForm.is_flash_sale}
                    />
                  </div>
                </div>
              )}
            </div>

            <DialogFooter className="pt-2">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setIsFormDialogOpen(false)} 
                className="rounded-xl text-[10px] font-bold uppercase tracking-wider"
              >
                Batal
              </Button>
              <Button 
                type="submit" 
                disabled={saving} 
                className="rounded-xl text-[10px] font-bold uppercase tracking-wider shimmer-hover"
              >
                {saving ? "Menyimpan..." : "Simpan Produk"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Sync Response Log Dialog */}
      <Dialog open={isSyncLogOpen} onOpenChange={setIsSyncLogOpen}>
        <DialogContent className="max-w-3xl bg-[#183644] text-white border-sky/30 max-h-[85vh] flex flex-col">
          <DialogHeader>
            <DialogTitle className="text-base font-black uppercase text-white flex items-center justify-between">
              <span>History &amp; Log Respon Digiflazz Sync</span>
              <span className="text-xs font-mono bg-sky/20 px-2 py-0.5 rounded text-sky">Total: {syncLogs?.length || 0} Data</span>
            </DialogTitle>
            <DialogDescription className="text-xs text-white/60">
              Menampilkan rincian data produk dan status keaktifan SKU yang dikembalikan oleh API Digiflazz saat sinkronisasi terakhir.
            </DialogDescription>
          </DialogHeader>

          <div className="flex items-center justify-between border-b border-sky/20 pb-2.5 pt-1">
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setSyncModalTab("log")}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${
                  syncModalTab === "log"
                    ? "bg-sky text-white shadow"
                    : "text-white/60 hover:text-white hover:bg-white/5"
                }`}
              >
                📋 Log Item ({syncLogs?.length || 0})
              </button>
              <button
                type="button"
                onClick={() => setSyncModalTab("raw")}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${
                  syncModalTab === "raw"
                    ? "bg-sky text-white shadow"
                    : "text-white/60 hover:text-white hover:bg-white/5"
                }`}
              >
                📄 Raw Respon Digiflazz API (JSON)
              </button>
            </div>

            {syncModalTab === "raw" && (
              <button
                type="button"
                onClick={() => {
                  const content = JSON.stringify(rawDigiflazzResponse || syncLogs, null, 2)
                  navigator.clipboard.writeText(content)
                  setCopiedJson(true)
                  setTimeout(() => setCopiedJson(false), 2000)
                }}
                className="px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/30 transition-all flex items-center gap-1"
              >
                {copiedJson ? "✓ Tersalin" : "📋 Salin JSON"}
              </button>
            )}
          </div>

          {syncModalTab === "raw" ? (
            <div className="flex-1 overflow-y-auto pr-1 my-2">
              <pre className="p-4 bg-black/70 border border-sky/30 rounded-xl text-[11px] font-mono text-emerald-400 overflow-x-auto whitespace-pre-wrap select-all max-h-[55vh]">
                {JSON.stringify(rawDigiflazzResponse || syncLogs, null, 2)}
              </pre>
            </div>
          ) : (
            <div className="flex-1 overflow-y-auto pr-1 my-2 space-y-2">
              {syncLogs && syncLogs.length > 0 ? (
                <div className="space-y-2">
                  {syncLogs.map((logItem: any, idx: number) => {
                    if (!logItem.sku && !logItem.name && !logItem.product_name) {
                      return (
                        <pre key={idx} className="p-3 bg-black/60 border border-sky/30 rounded-xl text-xs font-mono text-emerald-400 overflow-x-auto whitespace-pre-wrap">
                          {JSON.stringify(logItem, null, 2)}
                        </pre>
                      )
                    }
                    return (
                      <div key={idx} className="p-3 bg-black/40 border border-sky/20 rounded-xl text-xs flex flex-col sm:flex-row justify-between sm:items-center gap-2">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-bold text-sky text-[11px] bg-sky/10 px-1.5 py-0.5 rounded border border-sky/20">{logItem.sku}</span>
                            <span className="font-bold text-white">{logItem.name || logItem.product_name}</span>
                          </div>
                          <p className="text-[10px] text-white/60 mt-1">
                            Game/Brand: <span className="text-white font-semibold">{logItem.game || logItem.brand || "-"}</span> | Kategori: <span className="text-white font-semibold">{logItem.category || "-"}</span>
                          </p>
                          {logItem.reason && (
                            <p className="text-[9px] font-bold text-amber-300 mt-1 flex items-center gap-1">
                              <span>Alasan:</span> {logItem.reason}
                            </p>
                          )}
                        </div>

                        <div className="text-right shrink-0">
                          {logItem.type === 'NEW' && (
                            <span className="inline-block px-2 py-0.5 rounded text-[10px] font-black uppercase bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                              + BARU (Rp {Number(logItem.price).toLocaleString("id-ID")})
                            </span>
                          )}
                          {logItem.type === 'UPDATE' && (
                            <span className="inline-block px-2 py-0.5 rounded text-[10px] font-black uppercase bg-sky/20 text-sky border border-sky/30">
                              DIPERBARUI (Rp {Number(logItem.new_price).toLocaleString("id-ID")})
                            </span>
                          )}
                          {logItem.type === 'SKIPPED_INACTIVE' && (
                            <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-red-500/20 text-red-300 border border-red-500/30">
                              DILEWATI (NONAKTIF SUPPLIER)
                            </span>
                          )}
                          {logItem.type === 'SKIPPED_NO_GAME' && (
                            <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-amber-500/20 text-amber-300 border border-amber-500/30">
                              DILEWATI (GAME BELUM DAFTAR)
                            </span>
                          )}
                          {(!logItem.type || (logItem.type !== 'NEW' && logItem.type !== 'UPDATE' && logItem.type !== 'SKIPPED_INACTIVE' && logItem.type !== 'SKIPPED_NO_GAME')) && (
                            <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-black uppercase ${
                              logItem.active ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'
                            }`}>
                              {logItem.active ? 'AKTIF DI SUPPLIER' : 'NONAKTIF/SKU TIDAK DITEMUK'}
                            </span>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              ) : (
                <p className="text-xs text-white/50 text-center py-6">Tidak ada log respon sync tersedia.</p>
              )}
            </div>
          )}

          <DialogFooter className="border-t border-sky/20 pt-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsSyncLogOpen(false)}
              className="rounded-xl text-[10px] font-bold uppercase tracking-wider border-sky/30 text-sky hover:bg-sky/20"
            >
              Tutup Modal
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
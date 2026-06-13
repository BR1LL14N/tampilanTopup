"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
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
import { getGameAsset, getItemAssetForProduct } from "@/lib/assets"
import {
  Plus,
  Search,
  MoreHorizontal,
  Edit,
  Trash2,
  Eye,
  TrendingUp,
  Loader2,
} from "lucide-react"

export default function AdminProductsPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [productsList, setProductsList] = useState<any[]>([])
  const [games, setGames] = useState<any[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [activeTab, setActiveTab] = useState("all")
  const [syncing, setSyncing] = useState(false)
  const [markupPercent, setMarkupPercent] = useState("10")
  const [syncStatus, setSyncStatus] = useState<string | null>(null)
  const [editingProduct, setEditingProduct] = useState<any | null>(null)
  const [editedSellPrice, setEditedSellPrice] = useState("")
  const [warnBelowCost, setWarnBelowCost] = useState(false)

  const handleSync = async () => {
    // Bug #5 fix: validate markup is not negative before sending to API
    const markupNum = parseFloat(markupPercent)
    if (isNaN(markupNum) || markupNum < 0) {
      setSyncStatus("Error: Markup tidak boleh negatif. Masukkan nilai antara 0–100.")
      return
    }
    try {
      setSyncing(true)
      setSyncStatus(null)
      const res = await fetch(`/api/admin/sync-products?markup=${markupPercent}`, {
        method: "POST"
      })
      const data = await res.json()
      if (data.success) {
        const { newAdded, updated, skipped, totalFromDigiflazz } = data.summary;
        let msg = `Berhasil menyinkronkan: ${newAdded} produk baru, ${updated} produk diperbarui.`;
        if (totalFromDigiflazz > 0 && (newAdded + updated) === 0) {
          msg += ` (${skipped} produk dari Digiflazz tidak cocok dengan game yang terdaftar di database — cek konsol browser untuk detail sampleItems.)`;
        } else if (totalFromDigiflazz === 0) {
          msg += ` Digiflazz mengembalikan 0 produk — kemungkinan API key atau koneksi bermasalah.`;
        }
        setSyncStatus(msg);
        // Log Digiflazz sample items to console for debugging category/brand names
        if (data.sampleItems?.length > 0) {
          console.log('[Digiflazz Sync] Sample items dari API (10 pertama):', data.sampleItems);
        }
        if (data.log?.length > 0) {
          console.log('[Digiflazz Sync] Produk yang cocok:', data.log);
        }
        
        // Refresh products list
        const supabase = createClient()
        const { data: dbProducts } = await supabase
          .from("product_details")
          .select("*")
          .order("sort_order", { ascending: true })
        
        if (dbProducts && dbProducts.length > 0) {
          setProductsList(dbProducts.map((p: any) => ({
            id: p.id,
            name: p.name,
            game: p.game_name,
            slug: p.game_slug,
            icon: p.game_icon || "🎮",
            provider_sku: p.provider_sku,
            price: p.price,
            sell_price: p.sell_price,
            status: p.status,
            transactions: 0
          })))
        }
      } else {
        setSyncStatus(`Error: ${data.error || "Gagal melakukan sync"}`)
      }
    } catch (err: any) {
      console.error(err)
      setSyncStatus(`Error: ${err.message || "Gagal melakukan sync"}`)
    } finally {
      setSyncing(false)
    }
  }

  const handleSavePrice = async (forceSubmit = false) => {
    if (!editingProduct) return
    const priceNum = parseInt(editedSellPrice)
    if (isNaN(priceNum) || priceNum <= 0) {
      alert("Harga jual tidak valid. Harus lebih dari 0.")
      return
    }

    // Bug #4 fix: warn if sell price is below cost price (HPP) but allow with confirmation
    if (!forceSubmit && priceNum < editingProduct.price) {
      setWarnBelowCost(true)
      return
    }

    setWarnBelowCost(false)
    try {
      const supabase = createClient()
      const { error } = await supabase
        .from("products")
        .update({ 
          sell_price: priceNum, 
          updated_at: new Date().toISOString() 
        })
        .eq("id", editingProduct.id)

      if (error) {
        alert(`Gagal mengupdate harga: ${error.message}`)
      } else {
        setProductsList(prev => prev.map(p => p.id === editingProduct.id ? { ...p, sell_price: priceNum } : p))
        setEditingProduct(null)
      }
    } catch (err: any) {
      alert(`Error: ${err.message}`)
    }
  }

  useEffect(() => {
    // Read cache on mount
    const cached = getCachedUser()
    if (cached) {
      setCurrentUser(cached)
    }

    const fetchAdminData = async () => {
      try {
        const supabase = createClient()
        const { data: { user: authUser } } = await supabase.auth.getUser()

        if (!authUser) {
          router.push("/auth/login")
          return
        }

        // Fetch profile and check role
        const { data: profile } = await supabase
          .from("user_profiles")
          .select("name, email, role")
          .eq("id", authUser.id)
          .single()

        if (!profile || profile.role !== "admin") {
          router.push("/dashboard")
          return
        }

        setCurrentUser({
          name: profile.name || authUser.user_metadata?.name || authUser.email || "Admin",
          email: authUser.email || "",
          role: profile.role
        })

        // Fetch products list from view public.product_details
        const { data: dbProducts } = await supabase
          .from("product_details")
          .select("*")
          .order("sort_order", { ascending: true })

        if (dbProducts && dbProducts.length > 0) {
          setProductsList(dbProducts.map((p: any) => ({
            id: p.id,
            name: p.name,
            game: p.game_name,
            slug: p.game_slug,
            icon: p.game_icon || "🎮",
            provider_sku: p.provider_sku,
            price: p.price,
            sell_price: p.sell_price,
            status: p.status,
            transactions: 0
          })))
        } else {
          setProductsList([])
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
    if (cached) {
      setCurrentUser(cached)
    }
    fetchAdminData()
  }, [router])

  const handleOpenEdit = (product: any) => {
    setSelectedProduct(product)
    setEditForm({
      game_id: product.game_id || "",
      name: product.name,
      provider_sku: product.provider_sku,
      price: product.price,
      sell_price: product.sell_price,
      status: product.status,
      sort_order: product.sort_order || 0,
      is_flash_sale: product.is_flash_sale || false,
      flash_sale_price: product.flash_sale_price || 0,
      flash_sale_stock: product.flash_sale_stock || 100,
    })
    setIsEditDialogOpen(true)
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
    setIsEditDialogOpen(true)
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
        status: editForm.status,
        sort_order: Number(editForm.sort_order) || 0,
        is_flash_sale: editForm.is_flash_sale,
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

      setIsEditDialogOpen(false)
      fetchAdminData()
    } catch (err: any) {
      alert("Gagal menyimpan data produk: " + err.message)
    } finally {
      setSaving(false)
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
      <div className="min-h-screen flex flex-col bg-background">
        <Header user={currentUser} />
        <SidebarContentWrapper isAuthenticated={!!currentUser}>
          <main className="flex-1 py-8">
            <div className="container space-y-8">
              {/* Header */}
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <Skeleton className="h-8 w-44 rounded-lg bg-sky/10" />
                  <Skeleton className="h-4 w-64 rounded-md bg-sky/10" />
                </div>
                <Skeleton className="h-10 w-36 rounded-xl bg-sky/10" />
              </div>

              {/* Tabs */}
              <div className="flex gap-2">
                <Skeleton className="h-9 w-20 rounded-lg bg-sky/10" />
                <Skeleton className="h-9 w-24 rounded-lg bg-sky/10" />
                <Skeleton className="h-9 w-24 rounded-lg bg-sky/10" />
              </div>

              {/* Table Card */}
              <div className="bg-white rounded-[20px] border border-sky-border shadow-sky-soft p-6 space-y-6">
                <Skeleton className="h-10 w-80 rounded-xl bg-sky/10" />
                <div className="space-y-3">
                  {/* Header row */}
                  <div className="grid grid-cols-6 gap-4 py-2 border-b border-sky-border/50">
                    <Skeleton className="h-4 w-24 rounded bg-sky/10" />
                    <Skeleton className="h-4 w-16 rounded bg-sky/10" />
                    <Skeleton className="h-4 w-20 rounded bg-sky/10" />
                    <Skeleton className="h-4 w-16 rounded bg-sky/10" />
                    <Skeleton className="h-4 w-12 rounded bg-sky/10" />
                    <Skeleton className="h-4 w-8 justify-self-end rounded bg-sky/10" />
                  </div>
                  {/* Data rows */}
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className="grid grid-cols-6 gap-4 py-4 items-center border-b border-sky-border/30">
                      <Skeleton className="h-4 w-32 rounded-md bg-sky/10" />
                      <Skeleton className="h-4 w-24 rounded-md bg-sky/10" />
                      <Skeleton className="h-4.5 w-16 rounded-md font-mono bg-sky/10" />
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

  const filteredProducts = productsList.filter((product) => {
    const matchesSearch = product.name
      .toLowerCase()
      .includes(searchQuery.toLowerCase()) || 
      product.game.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.provider_sku.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTab =
      activeTab === "all" ||
      (activeTab === "active" && product.status) ||
      (activeTab === "inactive" && !product.status) ||
      (activeTab === "flash_sale" && product.is_flash_sale);
    return matchesSearch && matchesTab;
  })

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header user={currentUser} />

      <SidebarContentWrapper isAuthenticated={!!currentUser}>
        <main className="flex-1 py-8">
        <div className="container">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
            <div>
              <h1 className="text-3xl font-bold mb-2">Kelola Produk</h1>
              <p className="text-muted-foreground">
                Kelola produk top up untuk setiap game
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-xl border border-sky-border shadow-sm">
                <span className="text-xs font-semibold text-text-secondary whitespace-nowrap">Markup:</span>
                <Input
                  type="number"
                  value={markupPercent}
                  onChange={(e) => setMarkupPercent(e.target.value)}
                  className="w-14 h-7 text-center text-xs font-semibold p-1 focus-visible:ring-sky"
                  min="0"
                  max="100"
                />
                <span className="text-xs font-semibold text-text-secondary">%</span>
              </div>
              
              <Button 
                variant="outline"
                onClick={handleSync} 
                disabled={syncing}
                className="gap-2 border-sky text-sky hover:bg-sky/5 rounded-xl shadow-sm h-10"
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

              <Button className="gap-2 rounded-xl h-10">
                <Plus className="h-4 w-4" />
                Tambah Produk
              </Button>
            </div>
          </div>

          {/* Sync Status Banner */}
          {syncStatus && (
            <div className={`mb-6 p-4 rounded-xl border text-sm font-medium ${
              syncStatus.startsWith('Error') 
                ? 'bg-red-50 border-red-200 text-red-700' 
                : 'bg-green-50 border-green-200 text-green-700'
            }`}>
              {syncStatus}
            </div>
          )}

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 mb-8">
              <Card>
                <CardContent className="p-6">
                  <p className="text-muted-foreground text-sm">Total Produk</p>
                  <p className="text-2xl font-bold">{productsList.length}</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <p className="text-muted-foreground text-sm">Aktif</p>
                  <p className="text-2xl font-bold text-green-500">
                    {productsList.filter((p) => p.status).length}
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <p className="text-muted-foreground text-sm">Flash Sale</p>
                  <p className="text-2xl font-bold text-sky">
                    {productsList.filter((p) => p.is_flash_sale).length}
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Search and Filter */}
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Cari nama, game, atau SKU..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList>
                  <TabsTrigger value="all">Semua</TabsTrigger>
                  <TabsTrigger value="active">Aktif</TabsTrigger>
                  <TabsTrigger value="inactive">Nonaktif</TabsTrigger>
                  <TabsTrigger value="flash_sale">Flash Sale</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>

          {/* Products Table */}
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Produk</TableHead>
                    <TableHead>SKU</TableHead>
                    <TableHead>Harga Modal</TableHead>
                    <TableHead>Harga Jual</TableHead>
                    <TableHead>Profit</TableHead>
                    <TableHead>Transaksi</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredProducts.map((product) => (
                    <TableRow key={product.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-ice p-1.5">
                            <img
                              src={getItemAssetForProduct(product.name, product.provider_sku, product.game)}
                              alt=""
                              className="max-h-full max-w-full object-contain"
                            />
                          </span>
                          <div>
                            <p className="font-medium">{product.name}</p>
                            <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
                              <img
                                src={getGameAsset(product.slug)?.icon}
                                alt=""
                                className="h-4 w-4 rounded object-cover"
                              />
                              {product.game}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="font-mono text-sm">
                        {product.provider_sku}
                      </TableCell>
                      <TableCell>{formatCurrency(product.price)}</TableCell>
                      <TableCell>{formatCurrency(product.sell_price)}</TableCell>
                      <TableCell className="text-green-500">
                        +{formatCurrency(product.sell_price - product.price)}
                      </TableCell>
                      <TableCell>{product.transactions}</TableCell>
                      <TableCell>
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBgColor(
                            product.status ? "success" : "failed"
                          )}`}
                        >
                          {product.status ? "Aktif" : "Nonaktif"}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem>
                              <Eye className="h-4 w-4 mr-2" />
                              Lihat
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => {
                              setEditingProduct(product);
                              setEditedSellPrice(product.sell_price.toString());
                            }}>
                              <Edit className="h-4 w-4 mr-2" />
                              Edit Harga
                            </DropdownMenuItem>
                            <DropdownMenuItem className="text-red-500">
                              <Trash2 className="h-4 w-4 mr-2" />
                              Hapus
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

      {/* Dialog Edit Harga */}
      <Dialog open={!!editingProduct} onOpenChange={(open) => { if (!open) setEditingProduct(null); }}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit Harga Jual</DialogTitle>
            <DialogDescription>
              Ubah harga jual untuk produk <strong>{editingProduct?.name}</strong>.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <span className="text-right text-sm font-medium text-text-secondary">
                Harga Modal
              </span>
              <div className="col-span-3 font-mono text-sm font-semibold text-text-primary">
                {editingProduct ? formatCurrency(editingProduct.price) : "-"}
              </div>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="sell-price" className="text-right text-sm font-medium text-text-secondary">
                Harga Jual
              </label>
              <Input
                id="sell-price"
                type="number"
                value={editedSellPrice}
                onChange={(e) => { setEditedSellPrice(e.target.value); setWarnBelowCost(false); }}
                className="col-span-3 rounded-xl border-sky-border"
              />
            </div>
            {editingProduct && parseInt(editedSellPrice) > 0 && (() => {
              const profit = parseInt(editedSellPrice) - editingProduct.price;
              return (
                <div className="grid grid-cols-4 items-center gap-4">
                  <span className="text-right text-xs font-semibold text-text-secondary">Profit</span>
                  <span className={`col-span-3 text-xs font-black ${profit >= 0 ? "text-green-500" : "text-red-500"}`}>
                    {profit >= 0 ? "+" : ""}{formatCurrency(profit)}
                  </span>
                </div>
              );
            })()}

            {/* Bug #4 fix: Warning banner when sell_price < HPP */}
            {warnBelowCost && (
              <div className="col-span-4 rounded-xl bg-amber-50 border border-amber-300 p-3 text-sm text-amber-800">
                <p className="font-semibold mb-2">⚠️ Harga jual di bawah harga modal!</p>
                <p className="text-xs mb-3">
                  Menetapkan harga jual lebih rendah dari harga modal akan menyebabkan <strong>kerugian per transaksi</strong>. Apakah Anda yakin ingin menyimpan?
                </p>
                <div className="flex gap-2 justify-end">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setWarnBelowCost(false)}
                    className="rounded-lg text-xs h-7 border-amber-400 text-amber-700 hover:bg-amber-100"
                  >
                    Ubah Harga
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => handleSavePrice(true)}
                    className="rounded-lg text-xs h-7 bg-amber-600 hover:bg-amber-700 text-white"
                  >
                    Tetap Simpan
                  </Button>
                </div>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setEditingProduct(null); setWarnBelowCost(false); }} className="rounded-xl">
              Batal
            </Button>
            <Button onClick={() => handleSavePrice(false)} className="rounded-xl">
              Simpan Perubahan
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
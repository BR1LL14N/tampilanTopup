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
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
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

  // Modal States
  const [selectedProduct, setSelectedProduct] = useState<any>(null)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
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

      // Fetch games list for select input
      const resGames = await fetch("/api/admin/games")
      const { games } = await resGames.json()
      if (games) {
        setGames(games)
      }

      // Fetch products list from API
      const resProducts = await fetch("/api/admin/products")
      const { products, error } = await resProducts.json()

      if (error) throw new Error(error)

      if (products && products.length > 0) {
        setProductsList(products.map((p: any) => ({
          id: p.id,
          game_id: p.game_id,
          name: p.name,
          game: p.game_name,
          slug: p.game_slug,
          icon: p.game_icon || "🎮",
          provider_sku: p.provider_sku,
          price: Number(p.price) || 0,
          sell_price: Number(p.sell_price) || 0,
          status: p.status ? true : false,
          sort_order: p.sort_order || 0,
          is_flash_sale: p.is_flash_sale ? true : false,
          flash_sale_price: Number(p.flash_sale_price) || 0,
          flash_sale_stock: Number(p.flash_sale_stock) || 100,
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
            <div className="flex items-center justify-between mb-8">
              <div>
                <h1 className="text-3xl font-bold mb-2">Kelola Produk</h1>
                <p className="text-muted-foreground">
                  Kelola produk top up untuk setiap game
                </p>
              </div>
              <Button onClick={handleOpenAdd} className="gap-2 bg-sky text-white hover:bg-sky/90">
                <Plus className="h-4 w-4" />
                Tambah Produk
              </Button>
            </div>

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
                      <TableHead>Event</TableHead>
                      <TableHead>Profit</TableHead>
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
                                <span className="text-[10px]">{getGameAsset(product.slug)?.icon}</span>
                                {product.game}
                              </p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="font-mono text-sm">
                          {product.provider_sku}
                        </TableCell>
                        <TableCell>{formatCurrency(product.price)}</TableCell>
                        <TableCell>
                          {product.is_flash_sale ? (
                            <div>
                              <span className="font-semibold text-sky">{formatCurrency(product.flash_sale_price)}</span>
                              <span className="block text-[10px] text-text-muted line-through">{formatCurrency(product.sell_price)}</span>
                            </div>
                          ) : (
                            formatCurrency(product.sell_price)
                          )}
                        </TableCell>
                        <TableCell>
                          {product.is_flash_sale ? (
                            <span className="px-2 py-0.5 rounded bg-red-100 text-red-600 text-[10px] font-black uppercase">
                              Flash Sale
                            </span>
                          ) : (
                            <span className="text-[11px] text-text-muted">-</span>
                          )}
                        </TableCell>
                        <TableCell className="text-green-500">
                          +{formatCurrency(
                            (product.is_flash_sale ? product.flash_sale_price : product.sell_price) - product.price
                          )}
                        </TableCell>
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
                              <DropdownMenuItem onClick={() => router.push("/games/" + product.slug)}>
                                <Eye className="h-4 w-4 mr-2" />
                                Lihat di Toko
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleOpenEdit(product)}>
                                <Edit className="h-4 w-4 mr-2" />
                                Edit Produk
                              </DropdownMenuItem>
                              <DropdownMenuItem className="text-red-500" onClick={() => handleDeleteProduct(product.id)}>
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

      {/* Edit/Add Product Dialog Modal */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-md bg-white border border-sky-border rounded-[24px] p-6 shadow-sky-medium">
          <DialogHeader>
            <DialogTitle className="text-xl font-black text-text-primary uppercase tracking-wide">
              {selectedProduct ? "Edit Produk" : "Tambah Produk Baru"}
            </DialogTitle>
            <DialogDescription className="text-xs font-semibold text-text-muted uppercase tracking-wider">
              {selectedProduct ? "Atur harga markup, status aktif, dan parameter Flash Sale." : "Masukkan data nominal produk baru."}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSaveProduct} className="space-y-4 my-2">
            {!selectedProduct && (
              <div className="space-y-1.5">
                <Label htmlFor="product_game" className="text-xs font-bold text-text-secondary uppercase">Game</Label>
                <select
                  id="product_game"
                  value={editForm.game_id}
                  onChange={(e) => setEditForm({ ...editForm, game_id: e.target.value })}
                  className="w-full rounded-lg border border-input bg-transparent px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                  required
                >
                  {games.map((game) => (
                    <option key={game.id} value={game.id}>{game.name}</option>
                  ))}
                </select>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="product_name" className="text-xs font-bold text-text-secondary uppercase">Nama Item / Nominal</Label>
                <Input
                  id="product_name"
                  value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  placeholder="e.g. 86 Diamonds"
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="product_sku" className="text-xs font-bold text-text-secondary uppercase">SKU Provider (Digiflazz)</Label>
                <Input
                  id="product_sku"
                  value={editForm.provider_sku}
                  onChange={(e) => setEditForm({ ...editForm, provider_sku: e.target.value })}
                  placeholder="e.g. ML86"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="product_price" className="text-xs font-bold text-text-secondary uppercase">Harga Modal (Rp)</Label>
                <Input
                  id="product_price"
                  type="number"
                  value={editForm.price}
                  onChange={(e) => setEditForm({ ...editForm, price: Number(e.target.value) || 0 })}
                  placeholder="Harga modal provider"
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="product_sell_price" className="text-xs font-bold text-text-secondary uppercase">Harga Jual (Rp) - Markup</Label>
                <Input
                  id="product_sell_price"
                  type="number"
                  value={editForm.sell_price}
                  onChange={(e) => setEditForm({ ...editForm, sell_price: Number(e.target.value) || 0 })}
                  placeholder="Harga jual web"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="product_sort" className="text-xs font-bold text-text-secondary uppercase">Sort Order</Label>
                <Input
                  id="product_sort"
                  type="number"
                  value={editForm.sort_order}
                  onChange={(e) => setEditForm({ ...editForm, sort_order: Number(e.target.value) || 0 })}
                  placeholder="0"
                />
              </div>
              <div className="flex items-center gap-2 pt-6">
                <input
                  id="product_status"
                  type="checkbox"
                  checked={editForm.status}
                  onChange={(e) => setEditForm({ ...editForm, status: e.target.checked })}
                  className="h-4 w-4 rounded border-gray-300 text-sky focus:ring-sky cursor-pointer"
                />
                <Label htmlFor="product_status" className="text-xs font-bold text-text-secondary uppercase cursor-pointer select-none">
                  Produk Aktif
                </Label>
              </div>
            </div>

            {/* Flash Sale Section */}
            <div className="border-t border-sky-border pt-4 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-black text-text-primary uppercase tracking-wide">Setting Event Flash Sale</h4>
                  <p className="text-[10px] text-text-muted">Masukkan produk ini ke halaman promo flash sale</p>
                </div>
                <input
                  type="checkbox"
                  checked={editForm.is_flash_sale}
                  onChange={(e) => setEditForm({ ...editForm, is_flash_sale: e.target.checked })}
                  className="h-4.5 w-4.5 rounded border-gray-300 text-sky focus:ring-sky cursor-pointer"
                />
              </div>

              {editForm.is_flash_sale && (
                <div className="grid grid-cols-2 gap-4 animate-in fade-in-50 duration-200">
                  <div className="space-y-1.5">
                    <Label htmlFor="fs_price" className="text-[10px] font-bold text-text-secondary uppercase">Harga Flash Sale (Rp)</Label>
                    <Input
                      id="fs_price"
                      type="number"
                      value={editForm.flash_sale_price}
                      onChange={(e) => setEditForm({ ...editForm, flash_sale_price: Number(e.target.value) || 0 })}
                      placeholder="e.g. 19800"
                      required={editForm.is_flash_sale}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="fs_stock" className="text-[10px] font-bold text-text-secondary uppercase">Kuota Stok Flash Sale</Label>
                    <Input
                      id="fs_stock"
                      type="number"
                      value={editForm.flash_sale_stock}
                      onChange={(e) => setEditForm({ ...editForm, flash_sale_stock: Number(e.target.value) || 0 })}
                      placeholder="100"
                      required={editForm.is_flash_sale}
                    />
                  </div>
                </div>
              )}
            </div>

            <DialogFooter className="pt-4 gap-2">
              <Button type="button" variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                Batal
              </Button>
              <Button type="submit" className="bg-sky text-white hover:bg-sky/90" disabled={saving}>
                {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                Simpan
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
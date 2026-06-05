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
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Header } from "@/components/layout/header"
import { SidebarContentWrapper } from "@/components/layout/sidebar-content-wrapper"
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
import { createClient } from "@/lib/supabase/client"

export default function AdminProductsPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [productsList, setProductsList] = useState<any[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [activeTab, setActiveTab] = useState("all")

  useEffect(() => {
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

    fetchAdminData()
  }, [router])

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </main>
      </div>
    )
  }

  const filteredProducts = productsList.filter((product) => {
    const matchesSearch = product.name
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const matchesTab =
      activeTab === "all" ||
      (activeTab === "active" && product.status) ||
      (activeTab === "inactive" && !product.status);
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
            <Button className="gap-2">
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
                <p className="text-muted-foreground text-sm">Total Profit</p>
                <p className="text-2xl font-bold text-primary">
                  {formatCurrency(
                    productsList.reduce(
                      (sum, p) =>
                        sum + (p.sell_price - p.price) * p.transactions,
                      0
                    )
                  )}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Search and Filter */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Cari produk..."
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
                            <DropdownMenuItem>
                              <Edit className="h-4 w-4 mr-2" />
                              Edit
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
    </div>
  )
}
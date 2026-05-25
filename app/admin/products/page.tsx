"use client"

import { useState } from "react"
import Link from "next/link"
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
import { formatCurrency, getStatusBgColor } from "@/lib/utils"
import { GameIcon } from "@/components/game/game-icon"
import {
  Plus,
  Search,
  MoreHorizontal,
  Edit,
  Trash2,
  Eye,
  TrendingUp,
} from "lucide-react"

// Mock data
const products = [
  {
    id: "1",
    name: "86 Diamonds",
    game: "Mobile Legends",
    icon: "🎮",
    provider_sku: "ML86",
    price: 21000,
    sell_price: 25000,
    status: true,
    transactions: 156,
  },
  {
    id: "2",
    name: "172 Diamonds",
    game: "Mobile Legends",
    icon: "🎮",
    provider_sku: "ML172",
    price: 42000,
    sell_price: 49000,
    status: true,
    transactions: 98,
  },
  {
    id: "3",
    name: "50 Diamonds",
    game: "Free Fire",
    icon: "🔥",
    provider_sku: "FF50",
    price: 12000,
    sell_price: 15000,
    status: true,
    transactions: 234,
  },
  {
    id: "4",
    name: "60 UC",
    game: "PUBG Mobile",
    icon: "🎯",
    provider_sku: "PUBG60",
    price: 18000,
    sell_price: 22000,
    status: false,
    transactions: 0,
  },
]

export default function AdminProductsPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [activeTab, setActiveTab] = useState("all")

  const filteredProducts = products.filter((product) => {
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
      <Header user={{ name: "Admin", email: "admin@gametopup.com", role: "admin" }} />

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
                <p className="text-2xl font-bold">{products.length}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <p className="text-muted-foreground text-sm">Aktif</p>
                <p className="text-2xl font-bold text-green-500">
                  {products.filter((p) => p.status).length}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <p className="text-muted-foreground text-sm">Total Profit</p>
                <p className="text-2xl font-bold text-primary">
                  {formatCurrency(
                    products.reduce(
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
                          <GameIcon slug={product.game.toLowerCase().replace(/ /g, "-")} className="h-5 w-5 text-muted-foreground" />
                          <div>
                            <p className="font-medium">{product.name}</p>
                            <p className="text-sm text-muted-foreground">
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
    </div>
  )
}
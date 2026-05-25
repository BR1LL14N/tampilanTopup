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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Header } from "@/components/layout/header"
import { formatCurrency, formatDate, getStatusBgColor } from "@/lib/utils"
import { GameIcon } from "@/components/game/game-icon"
import {
  Plus,
  Search,
  MoreHorizontal,
  Edit,
  Trash2,
  Eye,
  Gamepad2,
} from "lucide-react"

// Mock data
const games = [
  {
    id: "1",
    name: "Mobile Legends",
    slug: "mobile-legends",
    icon: "🎮",
    category: "MOBA",
    image: "https://images.unsplash.com/photo-1538481199705-c710c4e965fc?w=400&h=300&fit=crop",
    status: true,
    products_count: 12,
  },
  {
    id: "2",
    name: "Free Fire",
    slug: "free-fire",
    icon: "🔥",
    category: "Battle Royale",
    image: "https://images.unsplash.com/photo-1552820728-8b83bb6b773f?w=400&h=300&fit=crop",
    status: true,
    products_count: 8,
  },
  {
    id: "3",
    name: "PUBG Mobile",
    slug: "pubg-mobile",
    icon: "🎯",
    category: "Battle Royale",
    image: "https://images.unsplash.com/photo-1542751110-97427bbecf20?w=400&h=300&fit=crop",
    status: true,
    products_count: 10,
  },
]

export default function AdminGamesPage() {
  const [searchQuery, setSearchQuery] = useState("")

  const filteredGames = games.filter((game) =>
    game.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header user={{ name: "Admin", email: "admin@gametopup.com", role: "admin" }} />

      <main className="flex-1 py-8">
        <div className="container">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold mb-2">Kelola Game</h1>
              <p className="text-muted-foreground">
                Kelola daftar game yang tersedia
              </p>
            </div>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Tambah Game
            </Button>
          </div>

          {/* Search */}
          <div className="mb-6">
            <div className="relative max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Cari game..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Games Table */}
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Game</TableHead>
                    <TableHead>Kategori</TableHead>
                    <TableHead>Produk</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredGames.map((game) => (
                    <TableRow key={game.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg overflow-hidden bg-white/5">
                            <img
                              src={game.image}
                              alt={game.name}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div>
                            <p className="font-medium flex items-center gap-1.5">
                              <GameIcon slug={game.slug} className="h-4 w-4 text-muted-foreground" />
                              {game.name}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              /{game.slug}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{game.category}</TableCell>
                      <TableCell>{game.products_count}</TableCell>
                      <TableCell>
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBgColor(
                            game.status ? "success" : "failed"
                          )}`}
                        >
                          {game.status ? "Aktif" : "Nonaktif"}
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
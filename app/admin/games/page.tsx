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
import { formatCurrency, formatDate, getStatusBgColor } from "@/lib/utils"
import { gameAssets, getGameAsset } from "@/lib/assets"
import {
  Plus,
  Search,
  MoreHorizontal,
  Edit,
  Trash2,
  Eye,
  Gamepad2,
  Loader2,
} from "lucide-react"
import { createClient } from "@/lib/supabase/client"

export default function AdminGamesPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [gamesList, setGamesList] = useState<any[]>([])
  const [searchQuery, setSearchQuery] = useState("")

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

        // Fetch games list
        const { data: dbGames } = await supabase
          .from("games")
          .select("*")
          .order("sort_order", { ascending: true })

        if (dbGames && dbGames.length > 0) {
          const gamesWithCount = await Promise.all(
            dbGames.map(async (game: any) => {
              const { count } = await supabase
                .from("products")
                .select("*", { count: "exact", head: true })
                .eq("game_id", game.id)
              
              return {
                id: game.id,
                name: game.name,
                slug: game.slug,
                icon: game.icon || "🎮",
                category: game.category || "Game",
                image: getGameAsset(game.slug)?.banner || game.image || gameAssets["mobile-legends"].banner,
                status: game.status,
                products_count: count || 0
              }
            })
          )
          setGamesList(gamesWithCount)
        } else {
          setGamesList([])
        }
      } catch (err) {
        console.error("Failed to load admin games data:", err)
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

  const filteredGames = gamesList.filter((game) =>
    game.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header user={currentUser} />

      <SidebarContentWrapper isAuthenticated={!!currentUser}>
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
                                <img src={getGameAsset(game.slug)?.icon} alt="" className="h-4 w-4 rounded object-cover" />
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
      </SidebarContentWrapper>
    </div>
  )
}

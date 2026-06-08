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
import { getStatusBgColor } from "@/lib/utils"
import { gameAssets, getGameAsset } from "@/lib/assets"
import {
  Plus,
  Search,
  MoreHorizontal,
  Edit,
  Trash2,
  Eye,
  Loader2,
} from "lucide-react"

export default function AdminGamesPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [gamesList, setGamesList] = useState<any[]>([])
  const [searchQuery, setSearchQuery] = useState("")

  // Form States for Modal
  const [selectedGame, setSelectedGame] = useState<any>(null)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [editForm, setEditForm] = useState({
    name: "",
    slug: "",
    publisher: "",
    category: "",
    description: "",
    icon: "",
    image: "",
    status: true,
    sort_order: 0,
  })

  const fetchAdminData = async () => {
    try {
      // Fetch user profile from unified API
      const resUser = await fetch("/api/auth/me")
      const { user } = await resUser.json()

      if (!user || user.role !== "admin") {
        setCachedUser(null)
        router.push("/auth/login")
        return
      }

      setCurrentUser(user)
      setCachedUser(user)

      // Fetch games list from unified API
      const resGames = await fetch("/api/admin/games")
      const { games, error } = await resGames.json()

      if (error) throw new Error(error)

      if (games && games.length > 0) {
        setGamesList(games.map((game: any) => ({
          ...game,
          image: game.image || getGameAsset(game.slug)?.banner || gameAssets["mobile-legends"].banner,
        })))
      } else {
        setGamesList([])
      }
    } catch (err) {
      console.error("Failed to load admin games data:", err)
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

  const handleOpenEdit = (game: any) => {
    setSelectedGame(game)
    setEditForm({
      name: game.name,
      slug: game.slug,
      publisher: game.publisher || "",
      category: game.category || "",
      description: game.description || "",
      icon: game.icon || "🎮",
      image: game.image || "",
      status: game.status ? true : false,
      sort_order: game.sort_order || 0,
    })
    setIsEditDialogOpen(true)
  }

  const handleOpenAdd = () => {
    setSelectedGame(null)
    setEditForm({
      name: "",
      slug: "",
      publisher: "",
      category: "Game",
      description: "Top up voucher dan diamonds dengan proses instan.",
      icon: "🎮",
      image: "",
      status: true,
      sort_order: 0,
    })
    setIsEditDialogOpen(true)
  }

  const handleSaveGame = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
      const payload = {
        name: editForm.name,
        slug: editForm.slug.toLowerCase().trim().replace(/\s+/g, "-"),
        publisher: editForm.publisher,
        category: editForm.category,
        description: editForm.description,
        icon: editForm.icon,
        image: editForm.image || null,
        status: editForm.status,
        sort_order: Number(editForm.sort_order) || 0,
      }

      const method = selectedGame ? "PUT" : "POST"
      const body = selectedGame ? { id: selectedGame.id, ...payload } : payload

      const res = await fetch("/api/admin/games", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body)
      })

      const data = await res.json()
      if (data.error) throw new Error(data.error)

      setIsEditDialogOpen(false)
      fetchAdminData()
    } catch (err: any) {
      alert("Gagal menyimpan data game: " + err.message)
    } finally {
      setSaving(false)
    }
  }

  const handleDeleteGame = async (gameId: string) => {
    if (!confirm("Apakah Anda yakin ingin menghapus game ini? Semua produk terkait juga akan terpengaruh.")) return
    try {
      const res = await fetch(`/api/admin/games?id=${gameId}`, {
        method: "DELETE"
      })

      const data = await res.json()
      if (data.error) throw new Error(data.error)

      fetchAdminData()
    } catch (err: any) {
      alert("Gagal menghapus game: " + err.message)
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
                  <Skeleton className="h-8 w-40 rounded-lg bg-sky/10" />
                  <Skeleton className="h-4 w-60 rounded-md bg-sky/10" />
                </div>
                <Skeleton className="h-10 w-32 rounded-xl bg-sky/10" />
              </div>

              {/* Table Card */}
              <div className="bg-white rounded-[20px] border border-sky-border shadow-sky-soft p-6 space-y-6">
                <Skeleton className="h-10 w-72 rounded-xl bg-sky/10" />
                <div className="space-y-3">
                  {/* Header row */}
                  <div className="grid grid-cols-5 gap-4 py-2 border-b border-sky-border/50">
                    <Skeleton className="h-4 w-20 rounded bg-sky/10" />
                    <Skeleton className="h-4 w-16 rounded bg-sky/10" />
                    <Skeleton className="h-4 w-24 rounded bg-sky/10" />
                    <Skeleton className="h-4 w-12 rounded bg-sky/10" />
                    <Skeleton className="h-4 w-8 justify-self-end rounded bg-sky/10" />
                  </div>
                  {/* Data rows */}
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className="grid grid-cols-5 gap-4 py-4 items-center border-b border-sky-border/30">
                      <div className="flex items-center gap-3">
                        <Skeleton className="h-8 w-8 rounded-lg shrink-0 bg-sky/10" />
                        <Skeleton className="h-4 w-28 rounded-md bg-sky/10" />
                      </div>
                      <Skeleton className="h-4 w-20 rounded-md bg-sky/10" />
                      <Skeleton className="h-4 w-10 rounded-md bg-sky/10" />
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
              <Button onClick={handleOpenAdd} className="gap-2 bg-sky text-white hover:bg-sky/90">
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
                            <div className="w-10 h-10 rounded-lg overflow-hidden bg-ice shrink-0">
                              <img
                                src={game.image}
                                alt={game.name}
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <div>
                              <p className="font-medium flex items-center gap-1.5">
                                <span className="text-base">{game.icon}</span>
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
                              <DropdownMenuItem onClick={() => router.push("/games/" + game.slug)}>
                                <Eye className="h-4 w-4 mr-2" />
                                Lihat Catalog
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleOpenEdit(game)}>
                                <Edit className="h-4 w-4 mr-2" />
                                Edit Game
                              </DropdownMenuItem>
                              <DropdownMenuItem className="text-red-500" onClick={() => handleDeleteGame(game.id)}>
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

      {/* Edit/Add Game Dialog Modal */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-md bg-white border border-sky-border rounded-[24px] p-6 shadow-sky-medium">
          <DialogHeader>
            <DialogTitle className="text-xl font-black text-text-primary uppercase tracking-wide">
              {selectedGame ? "Edit Game" : "Tambah Game Baru"}
            </DialogTitle>
            <DialogDescription className="text-xs font-semibold text-text-muted uppercase tracking-wider">
              {selectedGame ? "Ubah detail parameter game di bawah ini." : "Masukkan data game baru yang ingin ditampilkan."}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSaveGame} className="space-y-4 my-2">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="game_name" className="text-xs font-bold text-text-secondary uppercase">Nama Game</Label>
                <Input
                  id="game_name"
                  value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  placeholder="e.g. Free Fire"
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="game_slug" className="text-xs font-bold text-text-secondary uppercase">Slug URL</Label>
                <Input
                  id="game_slug"
                  value={editForm.slug}
                  onChange={(e) => setEditForm({ ...editForm, slug: e.target.value })}
                  placeholder="e.g. free-fire"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="game_publisher" className="text-xs font-bold text-text-secondary uppercase">Publisher</Label>
                <Input
                  id="game_publisher"
                  value={editForm.publisher}
                  onChange={(e) => setEditForm({ ...editForm, publisher: e.target.value })}
                  placeholder="e.g. Garena"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="game_category" className="text-xs font-bold text-text-secondary uppercase">Kategori</Label>
                <Input
                  id="game_category"
                  value={editForm.category}
                  onChange={(e) => setEditForm({ ...editForm, category: e.target.value })}
                  placeholder="e.g. Battle Royale, MOBA"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="game_desc" className="text-xs font-bold text-text-secondary uppercase">Deskripsi</Label>
              <textarea
                id="game_desc"
                value={editForm.description}
                onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                className="w-full min-h-[60px] rounded-lg border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                placeholder="Deskripsi game..."
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="game_icon" className="text-xs font-bold text-text-secondary uppercase">Icon Emoji</Label>
                <Input
                  id="game_icon"
                  value={editForm.icon}
                  onChange={(e) => setEditForm({ ...editForm, icon: e.target.value })}
                  placeholder="e.g. 🎮 atau 🔥"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="game_sort" className="text-xs font-bold text-text-secondary uppercase">Sort Order</Label>
                <Input
                  id="game_sort"
                  type="number"
                  value={editForm.sort_order}
                  onChange={(e) => setEditForm({ ...editForm, sort_order: parseInt(e.target.value) || 0 })}
                  placeholder="0"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="game_image" className="text-xs font-bold text-text-secondary uppercase">Image Banner URL (Opsional)</Label>
              <Input
                id="game_image"
                value={editForm.image}
                onChange={(e) => setEditForm({ ...editForm, image: e.target.value })}
                placeholder="https://..."
              />
            </div>

            <div className="flex items-center gap-2 pt-2">
              <input
                id="game_status"
                type="checkbox"
                checked={editForm.status}
                onChange={(e) => setEditForm({ ...editForm, status: e.target.checked })}
                className="h-4 w-4 rounded border-gray-300 text-sky focus:ring-sky cursor-pointer"
              />
              <Label htmlFor="game_status" className="text-xs font-bold text-text-secondary uppercase cursor-pointer select-none">
                Game Aktif (Tampil di Catalog Web)
              </Label>
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
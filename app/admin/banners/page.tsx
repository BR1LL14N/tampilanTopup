"use client"

import { useState, useEffect } from "react"
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
import {
  Plus,
  Search,
  MoreHorizontal,
  Edit,
  Trash2,
  Image as ImageIcon,
  Link as LinkIcon,
  Loader2,
  CheckCircle2,
  XCircle,
} from "lucide-react"

export default function AdminBannersPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [bannersList, setBannersList] = useState<any[]>([])
  const [searchQuery, setSearchQuery] = useState("")

  // Form States for Modal
  const [selectedBanner, setSelectedBanner] = useState<any>(null)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [uploadingImage, setUploadingImage] = useState(false)
  const [editForm, setEditForm] = useState({
    title: "",
    image_url: "",
    link_url: "",
    status: true,
    sort_order: 0,
  })

  const fetchAdminData = async () => {
    try {
      const resUser = await fetch("/api/auth/me")
      const { user } = await resUser.json()

      if (!user || user.role !== "admin") {
        setCachedUser(null)
        router.push("/auth/login")
        return
      }

      setCurrentUser(user)
      setCachedUser(user)

      const resBanners = await fetch("/api/admin/banners")
      const { banners, error } = await resBanners.json()

      if (error) throw new Error(error)
      setBannersList(banners || [])
    } catch (err) {
      console.error("Failed to load admin banners data:", err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const cached = getCachedUser()
    if (cached) {
      setCurrentUser(cached)
    }
    fetchAdminData()
  }, [router])

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploadingImage(true)
    try {
      const formData = new FormData()
      formData.append("file", file)
      formData.append("folder", "hero")

      const res = await fetch("/api/admin/upload", {
        method: "POST",
        body: formData,
      })
      const data = await res.json()
      if (data.url) {
        setEditForm(prev => ({ ...prev, image_url: data.url }))
      } else {
        alert(data.error || "Gagal mengunggah gambar")
      }
    } catch (err: any) {
      alert(err.message || "Gagal mengunggah gambar")
    } finally {
      setUploadingImage(false)
    }
  }

  const handleOpenEdit = (banner: any) => {
    setSelectedBanner(banner)
    setEditForm({
      title: banner.title || "",
      image_url: banner.image_url || "",
      link_url: banner.link_url || "",
      status: banner.status ? true : false,
      sort_order: banner.sort_order || 0,
    })
    setIsEditDialogOpen(true)
  }

  const handleOpenAdd = () => {
    setSelectedBanner(null)
    setEditForm({
      title: "",
      image_url: "",
      link_url: "",
      status: true,
      sort_order: 0,
    })
    setIsEditDialogOpen(true)
  }

  const handleSaveBanner = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editForm.image_url.trim()) {
      alert("Silakan masukkan URL gambar atau unggah gambar banner!")
      return
    }
    setSaving(true)

    try {
      if (selectedBanner) {
        const res = await fetch("/api/admin/banners", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: selectedBanner.id, ...editForm }),
        })
        const data = await res.json()
        if (!res.ok) throw new Error(data.error || "Gagal mengupdate banner")
      } else {
        const res = await fetch("/api/admin/banners", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(editForm),
        })
        const data = await res.json()
        if (!res.ok) throw new Error(data.error || "Gagal menambahkan banner")
      }

      setIsEditDialogOpen(false)
      fetchAdminData()
    } catch (err: any) {
      alert(err.message || "Terjadi kesalahan saat menyimpan banner.")
    } finally {
      setSaving(false)
    }
  }

  const handleDeleteBanner = async (id: string) => {
    if (!confirm("Apakah Anda yakin ingin menghapus banner ini?")) return

    try {
      const res = await fetch(`/api/admin/banners?id=${id}`, {
        method: "DELETE",
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Gagal menghapus banner")

      fetchAdminData()
    } catch (err: any) {
      alert(err.message || "Terjadi kesalahan saat menghapus banner.")
    }
  }

  const filteredBanners = bannersList.filter((b) => {
    const q = searchQuery.toLowerCase().trim()
    if (!q) return true
    const titleMatch = (b.title || "").toLowerCase().includes(q)
    const linkMatch = (b.link_url || "").toLowerCase().includes(q)
    return titleMatch || linkMatch
  })

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0f242e] text-white">
        <Header user={currentUser} />
        <SidebarContentWrapper isAuthenticated={!!currentUser}>
          <main className="py-8">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-6">
              <Skeleton className="h-10 w-48 bg-white/10" />
              <Skeleton className="h-64 w-full bg-white/10 rounded-2xl" />
            </div>
          </main>
        </SidebarContentWrapper>
      </div>
    )
  }

  return (
    <div className="min-h-screen text-white antialiased">
      <Header user={currentUser} />

      <SidebarContentWrapper isAuthenticated={!!currentUser}>
        <main className="relative z-10 py-8">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            {/* Header Section */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
              <div>
                <h1 className="text-2xl sm:text-3xl font-black uppercase text-white tracking-wide">
                  Kelola Banner Homepage
                </h1>
                <p className="text-xs font-semibold text-white/60 uppercase tracking-wider mt-1">
                  Atur carousel banner hero slider di halaman depan website Anda.
                </p>
              </div>

              <Button
                onClick={handleOpenAdd}
                className="bg-sky hover:bg-sky/90 text-white font-bold gap-2 shadow-lg shadow-sky/20"
              >
                <Plus className="h-4 w-4" />
                Tambah Banner Baru
              </Button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
              <Card className="bg-[#183644]/90 border border-sky/30">
                <CardContent className="p-5 flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold text-white/60 uppercase tracking-wider">Total Banner</p>
                    <p className="text-2xl font-black text-white mt-1">{bannersList.length}</p>
                  </div>
                  <ImageIcon className="h-8 w-8 text-sky opacity-80" />
                </CardContent>
              </Card>

              <Card className="bg-[#183644]/90 border border-emerald-500/30">
                <CardContent className="p-5 flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold text-white/60 uppercase tracking-wider">Banner Aktif</p>
                    <p className="text-2xl font-black text-emerald-400 mt-1">
                      {bannersList.filter(b => b.status).length}
                    </p>
                  </div>
                  <CheckCircle2 className="h-8 w-8 text-emerald-400 opacity-80" />
                </CardContent>
              </Card>

              <Card className="bg-[#183644]/90 border border-red-500/30">
                <CardContent className="p-5 flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold text-white/60 uppercase tracking-wider">Banner Nonaktif</p>
                    <p className="text-2xl font-black text-red-400 mt-1">
                      {bannersList.filter(b => !b.status).length}
                    </p>
                  </div>
                  <XCircle className="h-8 w-8 text-red-400 opacity-80" />
                </CardContent>
              </Card>
            </div>

            {/* Search Box */}
            <div className="mb-6">
              <div className="relative max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40" />
                <Input
                  placeholder="Cari judul banner atau link..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-black/40 border-sky/30 text-white placeholder:text-white/40 text-xs"
                />
              </div>
            </div>

            {/* Banners Table */}
            <Card className="bg-[#183644]/90 border border-sky/30 overflow-hidden shadow-2xl">
              <CardContent className="p-0">
                <Table>
                  <TableHeader className="bg-black/30">
                    <TableRow className="border-sky/20">
                      <TableHead className="text-white text-xs font-bold">Gambar Banner</TableHead>
                      <TableHead className="text-white text-xs font-bold">Judul / Keterangan</TableHead>
                      <TableHead className="text-white text-xs font-bold">Target Link URL</TableHead>
                      <TableHead className="text-white text-xs font-bold text-center">Urutan</TableHead>
                      <TableHead className="text-white text-xs font-bold text-center">Status</TableHead>
                      <TableHead className="text-right text-white text-xs font-bold">Aksi</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredBanners.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-10 text-white/40 text-xs font-bold uppercase tracking-wider">
                          Belum ada banner banner. Klik "Tambah Banner Baru" untuk mengunggah.
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredBanners.map((b) => (
                        <TableRow key={b.id} className="border-sky/20 hover:bg-white/5">
                          <TableCell>
                            <div className="h-16 w-36 rounded-xl border border-sky/30 overflow-hidden bg-black/40 relative shadow-md">
                              <img
                                src={b.image_url}
                                alt={b.title || "Banner"}
                                className="h-full w-full object-cover"
                              />
                            </div>
                          </TableCell>
                          <TableCell>
                            <p className="font-bold text-white text-xs">{b.title || "(Tanpa Judul)"}</p>
                            <p className="text-[10px] font-mono text-white/50 truncate max-w-[200px]">{b.image_url}</p>
                          </TableCell>
                          <TableCell className="text-xs text-sky font-mono font-medium">
                            {b.link_url ? (
                              <span className="flex items-center gap-1.5 hover:underline">
                                <LinkIcon className="h-3 w-3 shrink-0" />
                                {b.link_url}
                              </span>
                            ) : (
                              <span className="text-white/40 text-[10px] uppercase font-sans font-bold">- Tidak ada link -</span>
                            )}
                          </TableCell>
                          <TableCell className="text-center font-mono font-bold text-xs text-white">
                            {b.sort_order}
                          </TableCell>
                          <TableCell className="text-center">
                            <span
                              className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border ${
                                b.status
                                  ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30"
                                  : "bg-red-500/20 text-red-400 border-red-500/30"
                              }`}
                            >
                              {b.status ? "Aktif" : "Nonaktif"}
                            </span>
                          </TableCell>
                          <TableCell className="text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="hover:bg-sky/20 hover:text-white">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="bg-[#183644] border-sky/30 text-white shadow-2xl">
                                <DropdownMenuItem
                                  onClick={() => handleOpenEdit(b)}
                                  className="focus:bg-sky/20 focus:text-white cursor-pointer font-bold text-xs"
                                >
                                  <Edit className="h-4 w-4 mr-2 text-sky" />
                                  Edit Banner
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => handleDeleteBanner(b.id)}
                                  className="text-red-400 focus:bg-red-500/20 focus:text-red-400 cursor-pointer font-bold text-xs"
                                >
                                  <Trash2 className="h-4 w-4 mr-2 text-red-400" />
                                  Hapus Banner
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        </main>
      </SidebarContentWrapper>

      {/* Edit / Add Banner Dialog Modal */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-md bg-[#183644] border border-sky/30 rounded-[24px] p-6 shadow-2xl text-white">
          <DialogHeader>
            <DialogTitle className="text-xl font-black text-white uppercase tracking-wide">
              {selectedBanner ? "Edit Banner" : "Tambah Banner Baru"}
            </DialogTitle>
            <DialogDescription className="text-xs font-semibold text-white/60 uppercase tracking-wider">
              {selectedBanner ? "Ubah detail banner hero di bawah ini." : "Unggah gambar banner hero baru untuk halaman depan."}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSaveBanner} className="space-y-4 my-2">
            <div className="space-y-1.5">
              <Label htmlFor="banner_title" className="text-xs font-bold text-white/80 uppercase">Judul / Catatan Banner (Opsional)</Label>
              <Input
                id="banner_title"
                value={editForm.title}
                onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                placeholder="e.g. Promo Diamond MLBB Murah"
                className="bg-[#102530] border-sky/30 text-white font-semibold placeholder:text-white/40 focus-visible:ring-sky text-xs"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="banner_image" className="text-xs font-bold text-white/80 uppercase block">
                Gambar Banner *
              </Label>
              <div className="space-y-2">
                <Input
                  id="banner_image"
                  required
                  value={editForm.image_url}
                  onChange={(e) => setEditForm({ ...editForm, image_url: e.target.value })}
                  placeholder="https://... atau /uploads/hero/..."
                  className="bg-[#102530] border-sky/30 text-white font-semibold placeholder:text-white/40 focus-visible:ring-sky text-xs"
                />

                <div className="flex items-center gap-3 pt-1">
                  <label className="cursor-pointer bg-sky/20 hover:bg-sky/40 border border-sky/30 hover:border-sky/60 text-sky hover:text-white px-3 py-1.5 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition-all">
                    {uploadingImage ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Plus className="h-3.5 w-3.5" />}
                    {uploadingImage ? "Mengunggah..." : "Upload File Gambar Banner"}
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      disabled={uploadingImage}
                      className="hidden"
                    />
                  </label>
                </div>

                {editForm.image_url && (
                  <div className="h-28 w-full rounded-xl border border-sky/30 overflow-hidden bg-black/40 relative shadow-inner mt-2">
                    <img src={editForm.image_url} alt="Preview" className="h-full w-full object-cover" />
                  </div>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="banner_link" className="text-xs font-bold text-white/80 uppercase">Target Link URL (Opsional)</Label>
                <Input
                  id="banner_link"
                  value={editForm.link_url}
                  onChange={(e) => setEditForm({ ...editForm, link_url: e.target.value })}
                  placeholder="e.g. /games/mobile-legends"
                  className="bg-[#102530] border-sky/30 text-white font-semibold placeholder:text-white/40 focus-visible:ring-sky text-xs"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="banner_sort" className="text-xs font-bold text-white/80 uppercase">Urutan (Sort Order)</Label>
                <Input
                  id="banner_sort"
                  type="number"
                  value={editForm.sort_order === 0 ? "" : editForm.sort_order}
                  onFocus={(e) => e.target.select()}
                  onChange={(e) => setEditForm({ ...editForm, sort_order: e.target.value === "" ? 0 : parseInt(e.target.value) || 0 })}
                  placeholder="0"
                  className="bg-[#102530] border-sky/30 text-white font-semibold placeholder:text-white/40 focus-visible:ring-sky text-xs"
                />
              </div>
            </div>

            <div className="flex items-center gap-2 pt-2">
              <input
                id="banner_status"
                type="checkbox"
                checked={editForm.status}
                onChange={(e) => setEditForm({ ...editForm, status: e.target.checked })}
                className="h-4 w-4 rounded border-sky/30 text-sky focus:ring-sky cursor-pointer"
              />
              <Label htmlFor="banner_status" className="text-xs font-bold text-white/80 uppercase cursor-pointer select-none">
                Banner Aktif (Tampil di Hero Slider)
              </Label>
            </div>

            <DialogFooter className="pt-4 gap-2 border-t border-sky/20">
              <Button type="button" variant="ghost" onClick={() => setIsEditDialogOpen(false)} className="text-white/70 hover:text-white text-xs">
                Batal
              </Button>
              <Button type="submit" className="bg-sky text-white hover:bg-sky/90 font-bold text-xs" disabled={saving}>
                {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                Simpan Banner
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}

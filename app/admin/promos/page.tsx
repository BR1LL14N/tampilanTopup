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
import { formatCurrency, getStatusBgColor } from "@/lib/utils"
import {
  Plus,
  Search,
  MoreHorizontal,
  Edit,
  Trash2,
  Ticket,
  Loader2,
} from "lucide-react"

export default function AdminPromosPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [promosList, setPromosList] = useState<any[]>([])
  const [searchQuery, setSearchQuery] = useState("")

  // Form States for Modal
  const [selectedPromo, setSelectedPromo] = useState<any>(null)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [discountType, setDiscountType] = useState<"flat" | "percent">("flat")
  const [editForm, setEditForm] = useState({
    code: "",
    discount_amount: 0,
    discount_percent: 0,
    max_uses: 100,
    uses_count: 0,
    status: true,
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

      // Fetch promos list
      const resPromos = await fetch("/api/admin/promos")
      const { promos, error } = await resPromos.json()

      if (error) throw new Error(error)

      if (promos) {
        setPromosList(promos)
      } else {
        setPromosList([])
      }
    } catch (err) {
      console.error("Failed to load admin promos data:", err)
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

  const handleOpenEdit = (promo: any) => {
    setSelectedPromo(promo)
    setDiscountType(Number(promo.discount_percent) > 0 ? "percent" : "flat")
    setEditForm({
      code: promo.code,
      discount_amount: Number(promo.discount_amount) || 0,
      discount_percent: Number(promo.discount_percent) || 0,
      max_uses: promo.max_uses || 100,
      uses_count: promo.uses_count || 0,
      status: promo.status ? true : false,
    })
    setIsEditDialogOpen(true)
  }

  const handleOpenAdd = () => {
    setSelectedPromo(null)
    setDiscountType("flat")
    setEditForm({
      code: "",
      discount_amount: 0,
      discount_percent: 0,
      max_uses: 100,
      uses_count: 0,
      status: true,
    })
    setIsEditDialogOpen(true)
  }

  const handleSavePromo = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
      const codeUpper = editForm.code.trim().toUpperCase()

      const payload = {
        code: codeUpper,
        discount_amount: discountType === "flat" ? Number(editForm.discount_amount) : 0,
        discount_percent: discountType === "percent" ? Number(editForm.discount_percent) : 0,
        max_uses: Number(editForm.max_uses) || 100,
        uses_count: Number(editForm.uses_count) || 0,
        status: editForm.status,
      }

      const method = selectedPromo ? "PUT" : "POST"
      const body = selectedPromo ? { id: selectedPromo.id, ...payload } : payload

      const res = await fetch("/api/admin/promos", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body)
      })

      const data = await res.json()
      if (data.error) throw new Error(data.error)

      setIsEditDialogOpen(false)
      fetchAdminData()
    } catch (err: any) {
      alert("Gagal menyimpan kode promo: " + err.message)
    } finally {
      setSaving(false)
    }
  }

  const handleDeletePromo = async (promoId: string) => {
    if (!confirm("Apakah Anda yakin ingin menghapus kode promo ini?")) return
    try {
      const res = await fetch(`/api/admin/promos?id=${promoId}`, {
        method: "DELETE"
      })

      const data = await res.json()
      if (data.error) throw new Error(data.error)

      fetchAdminData()
    } catch (err: any) {
      alert("Gagal menghapus kode promo: " + err.message)
    }
  }

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
                  <Skeleton className="h-8 w-40 rounded-lg bg-sky/10" />
                  <Skeleton className="h-4 w-60 rounded-md bg-sky/10" />
                </div>
                <Skeleton className="h-10 w-32 rounded-xl bg-sky/10" />
              </div>

              {/* Table Card */}
              <div className="bg-mist backdrop-blur-md rounded-[20px] border border-sky/30 shadow-sky-soft p-6 space-y-6">
                <Skeleton className="h-10 w-72 rounded-xl bg-sky/10" />
                <div className="space-y-3">
                  {/* Header row */}
                  <div className="grid grid-cols-5 gap-4 py-2 border-b border-sky/30">
                    <Skeleton className="h-4 w-20 rounded bg-sky/10" />
                    <Skeleton className="h-4 w-16 rounded bg-sky/10" />
                    <Skeleton className="h-4 w-24 rounded bg-sky/10" />
                    <Skeleton className="h-4 w-12 rounded bg-sky/10" />
                    <Skeleton className="h-4 w-8 justify-self-end rounded bg-sky/10" />
                  </div>
                  {/* Data rows */}
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className="grid grid-cols-5 gap-4 py-4 items-center border-b border-sky/30">
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

  const filteredPromos = promosList.filter((promo) =>
    promo.code.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="min-h-screen flex flex-col ">
      <Header user={currentUser} />

      <SidebarContentWrapper isAuthenticated={!!currentUser}>
        <main className="flex-1 py-8">
          <div className="container">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
              <div>
                <h1 className="text-3xl font-bold mb-2">Kelola Promo</h1>
                <p className="text-white/60">
                  Kelola kode voucher dan diskon referral pelanggan
                </p>
              </div>
              <Button onClick={handleOpenAdd} className="gap-2 bg-sky text-white hover:bg-sky/90">
                <Plus className="h-4 w-4" />
                Tambah Promo
              </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 mb-8">
              <Card className="bg-[#183644]/90 border border-sky/30">
                <CardContent className="p-6">
                  <p className="text-white/60 text-sm">Total Voucher</p>
                  <p className="text-2xl font-bold text-white">{promosList.length}</p>
                </CardContent>
              </Card>
              <Card className="bg-[#183644]/90 border border-sky/30">
                <CardContent className="p-6">
                  <p className="text-white/60 text-sm">Aktif</p>
                  <p className="text-2xl font-bold text-emerald-400">
                    {promosList.filter((p) => p.status).length}
                  </p>
                </CardContent>
              </Card>
              <Card className="bg-[#183644]/90 border border-sky/30">
                <CardContent className="p-6">
                  <p className="text-white/60 text-sm">Total Penggunaan</p>
                  <p className="text-2xl font-bold text-sky">
                    {promosList.reduce((sum, p) => sum + (Number(p.uses_count) || 0), 0)}x
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Search */}
            <div className="mb-6">
              <div className="relative max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/60" />
                <Input
                  placeholder="Cari kode promo..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Promos Table */}
            <Card className="bg-[#183644]/90 border border-sky/30 overflow-hidden">
              <CardContent className="p-0">
                <Table>
                  <TableHeader className="bg-black/20">
                    <TableRow className="border-sky/20">
                      <TableHead className="text-white">Kode Promo</TableHead>
                      <TableHead className="text-white">Tipe Diskon</TableHead>
                      <TableHead className="text-white">Potongan</TableHead>
                      <TableHead className="text-white">Kuota Pemakaian</TableHead>
                      <TableHead className="text-white">Status</TableHead>
                      <TableHead className="text-right text-white">Aksi</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredPromos.map((promo) => (
                      <TableRow key={promo.id} className="border-sky/20 hover:bg-white/5">
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-sky/20 text-sky">
                              <Ticket className="h-4 w-4" />
                            </span>
                            <span className="font-bold tracking-wider font-mono text-sm text-white">{promo.code}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          {Number(promo.discount_percent) > 0 ? (
                            <span className="px-2 py-0.5 rounded bg-blue-500/20 text-blue-400 border border-blue-500/30 text-[10px] font-bold uppercase">
                              Persentase
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold uppercase">
                              Nominal Tetap
                            </span>
                          )}
                        </TableCell>
                        <TableCell className="font-semibold text-white">
                          {Number(promo.discount_percent) > 0 ? (
                            `${promo.discount_percent}%`
                          ) : (
                            formatCurrency(promo.discount_amount)
                          )}
                        </TableCell>
                        <TableCell className="text-white">
                          <span className="font-mono text-white">{promo.uses_count}</span>
                          <span className="text-white/60"> / {promo.max_uses}</span>
                        </TableCell>
                        <TableCell>
                          <span
                            className={`px-2.5 py-1 rounded-full text-xs font-semibold ${getStatusBgColor(
                              promo.status && Number(promo.uses_count) < Number(promo.max_uses) ? "success" : "failed"
                            )}`}
                          >
                            {promo.status && Number(promo.uses_count) < Number(promo.max_uses) ? "Aktif" : "Nonaktif / Habis"}
                          </span>
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="hover:bg-white/10 text-white">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="bg-[#183644] border border-sky/30 text-white shadow-sky-medium z-50">
                              <DropdownMenuItem className="hover:bg-sky/20 focus:bg-sky/20 cursor-pointer text-white flex items-center gap-2" onClick={() => handleOpenEdit(promo)}>
                                <Edit className="h-4 w-4 text-sky" />
                                Edit Promo
                              </DropdownMenuItem>
                              <DropdownMenuItem className="hover:bg-red-500/20 focus:bg-red-500/20 cursor-pointer text-red-400 flex items-center gap-2" onClick={() => handleDeletePromo(promo.id)}>
                                <Trash2 className="h-4 w-4 text-red-400" />
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

      {/* Edit/Add Promo Dialog Modal */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-md bg-[#183644] border border-sky/30 rounded-[24px] p-6 shadow-sky-medium text-white">
          <DialogHeader>
            <DialogTitle className="text-xl font-black text-white uppercase tracking-wide">
              {selectedPromo ? "Edit Promo" : "Tambah Promo Baru"}
            </DialogTitle>
            <DialogDescription className="text-xs font-semibold text-white/60 uppercase tracking-wider">
              {selectedPromo ? "Ubah detail parameter diskon di bawah ini." : "Masukkan parameter voucher kode promo baru."}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSavePromo} className="space-y-4 my-2">
            <div className="space-y-1.5">
              <Label htmlFor="promo_code" className="text-xs font-bold text-white/80 uppercase">Kode Promo</Label>
              <Input
                id="promo_code"
                value={editForm.code}
                onChange={(e) => setEditForm({ ...editForm, code: e.target.value.toUpperCase() })}
                placeholder="e.g. MITSURUNEW"
                required
                className="bg-black/20 border-sky/30 text-white placeholder-white/40 uppercase"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="discount_type" className="text-xs font-bold text-white/80 uppercase">Tipe Diskon</Label>
                <select
                  id="discount_type"
                  value={discountType}
                  onChange={(e: any) => setDiscountType(e.target.value)}
                  className="w-full rounded-lg border border-sky/30 bg-black/20 px-3 py-2 text-xs font-bold text-white shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-sky"
                >
                  <option value="flat" className="bg-[#183644] text-white">Nominal Tetap (Rupiah)</option>
                  <option value="percent" className="bg-[#183644] text-white">Persentase (%)</option>
                </select>
              </div>

              {discountType === "flat" ? (
                <div className="space-y-1.5">
                  <Label htmlFor="discount_amount" className="text-xs font-bold text-white/80 uppercase">Nominal Potongan (Rp)</Label>
                  <Input
                    id="discount_amount"
                    type="number"
                    value={editForm.discount_amount === 0 || (editForm.discount_amount as any) === "" ? "" : editForm.discount_amount}
                    onChange={(e) => setEditForm({ ...editForm, discount_amount: e.target.value === "" ? 0 : Number(e.target.value) })}
                    placeholder="0"
                    required={discountType === "flat"}
                    className="bg-black/20 border-sky/30 text-white placeholder-white/40"
                  />
                </div>
              ) : (
                <div className="space-y-1.5">
                  <Label htmlFor="discount_percent" className="text-xs font-bold text-white/80 uppercase">Persen Potongan (%)</Label>
                  <Input
                    id="discount_percent"
                    type="number"
                    min="1"
                    max="100"
                    value={editForm.discount_percent === 0 || (editForm.discount_percent as any) === "" ? "" : editForm.discount_percent}
                    onChange={(e) => setEditForm({ ...editForm, discount_percent: e.target.value === "" ? 0 : Number(e.target.value) })}
                    placeholder="0"
                    required={discountType === "percent"}
                    className="bg-black/20 border-sky/30 text-white placeholder-white/40"
                  />
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="max_uses" className="text-xs font-bold text-white/80 uppercase">Batas Pemakaian (Max Uses)</Label>
                <Input
                  id="max_uses"
                  type="number"
                  value={editForm.max_uses === 0 || (editForm.max_uses as any) === "" ? "" : editForm.max_uses}
                  onChange={(e) => setEditForm({ ...editForm, max_uses: e.target.value === "" ? 0 : Number(e.target.value) })}
                  placeholder="100"
                  required
                  className="bg-black/20 border-sky/30 text-white placeholder-white/40"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="uses_count" className="text-xs font-bold text-white/80 uppercase">Jumlah Terpakai</Label>
                <Input
                  id="uses_count"
                  type="number"
                  value={editForm.uses_count === 0 || (editForm.uses_count as any) === "" ? "" : editForm.uses_count}
                  onChange={(e) => setEditForm({ ...editForm, uses_count: e.target.value === "" ? 0 : Number(e.target.value) })}
                  placeholder="0"
                  required
                  className="bg-black/20 border-sky/30 text-white placeholder-white/40"
                />
              </div>
            </div>

            <div className="flex items-center gap-2 pt-2">
              <input
                id="promo_status"
                type="checkbox"
                checked={editForm.status}
                onChange={(e) => setEditForm({ ...editForm, status: e.target.checked })}
                className="h-4 w-4 rounded border-gray-300 text-sky focus:ring-sky cursor-pointer"
              />
              <Label htmlFor="promo_status" className="text-xs font-bold text-white/80 uppercase cursor-pointer select-none">
                Promo Aktif
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

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

  const filteredPromos = promosList.filter((promo) =>
    promo.code.toLowerCase().includes(searchQuery.toLowerCase())
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
                <h1 className="text-3xl font-bold mb-2">Kelola Promo</h1>
                <p className="text-muted-foreground">
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
              <Card>
                <CardContent className="p-6">
                  <p className="text-muted-foreground text-sm">Total Voucher</p>
                  <p className="text-2xl font-bold">{promosList.length}</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <p className="text-muted-foreground text-sm">Aktif</p>
                  <p className="text-2xl font-bold text-green-500">
                    {promosList.filter((p) => p.status).length}
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <p className="text-muted-foreground text-sm">Total Penggunaan</p>
                  <p className="text-2xl font-bold text-sky">
                    {promosList.reduce((sum, p) => sum + (Number(p.uses_count) || 0), 0)}x
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Search */}
            <div className="mb-6">
              <div className="relative max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Cari kode promo..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Promos Table */}
            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Kode Promo</TableHead>
                      <TableHead>Tipe Diskon</TableHead>
                      <TableHead>Potongan</TableHead>
                      <TableHead>Kuota Pemakaian</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Aksi</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredPromos.map((promo) => (
                      <TableRow key={promo.id}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-ice text-sky">
                              <Ticket className="h-4 w-4" />
                            </span>
                            <span className="font-bold tracking-wider font-mono text-sm">{promo.code}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          {Number(promo.discount_percent) > 0 ? (
                            <span className="px-2 py-0.5 rounded bg-blue-100 text-blue-600 text-[10px] font-bold uppercase">
                              Persentase
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded bg-green-100 text-green-600 text-[10px] font-bold uppercase">
                              Nominal Tetap
                            </span>
                          )}
                        </TableCell>
                        <TableCell className="font-semibold text-text-primary">
                          {Number(promo.discount_percent) > 0 ? (
                            `${promo.discount_percent}%`
                          ) : (
                            formatCurrency(promo.discount_amount)
                          )}
                        </TableCell>
                        <TableCell>
                          <span className="font-mono">{promo.uses_count}</span>
                          <span className="text-text-muted"> / {promo.max_uses}</span>
                        </TableCell>
                        <TableCell>
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBgColor(
                              promo.status && Number(promo.uses_count) < Number(promo.max_uses) ? "success" : "failed"
                            )}`}
                          >
                            {promo.status && Number(promo.uses_count) < Number(promo.max_uses) ? "Aktif" : "Nonaktif / Habis"}
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
                              <DropdownMenuItem onClick={() => handleOpenEdit(promo)}>
                                <Edit className="h-4 w-4 mr-2" />
                                Edit Promo
                              </DropdownMenuItem>
                              <DropdownMenuItem className="text-red-500" onClick={() => handleDeletePromo(promo.id)}>
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

      {/* Edit/Add Promo Dialog Modal */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-md bg-white border border-sky-border rounded-[24px] p-6 shadow-sky-medium">
          <DialogHeader>
            <DialogTitle className="text-xl font-black text-text-primary uppercase tracking-wide">
              {selectedPromo ? "Edit Promo" : "Tambah Promo Baru"}
            </DialogTitle>
            <DialogDescription className="text-xs font-semibold text-text-muted uppercase tracking-wider">
              {selectedPromo ? "Ubah detail parameter diskon di bawah ini." : "Masukkan parameter voucher kode promo baru."}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSavePromo} className="space-y-4 my-2">
            <div className="space-y-1.5">
              <Label htmlFor="promo_code" className="text-xs font-bold text-text-secondary uppercase">Kode Promo</Label>
              <Input
                id="promo_code"
                value={editForm.code}
                onChange={(e) => setEditForm({ ...editForm, code: e.target.value.toUpperCase() })}
                placeholder="e.g. MITSURUNEW"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="discount_type" className="text-xs font-bold text-text-secondary uppercase">Tipe Diskon</Label>
                <select
                  id="discount_type"
                  value={discountType}
                  onChange={(e: any) => setDiscountType(e.target.value)}
                  className="w-full rounded-lg border border-input bg-transparent px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                >
                  <option value="flat">Nominal Tetap (Rupiah)</option>
                  <option value="percent">Persentase (%)</option>
                </select>
              </div>

              {discountType === "flat" ? (
                <div className="space-y-1.5">
                  <Label htmlFor="discount_amount" className="text-xs font-bold text-text-secondary uppercase">Nominal Potongan (Rp)</Label>
                  <Input
                    id="discount_amount"
                    type="number"
                    value={editForm.discount_amount}
                    onChange={(e) => setEditForm({ ...editForm, discount_amount: Number(e.target.value) || 0 })}
                    placeholder="e.g. 5000"
                    required={discountType === "flat"}
                  />
                </div>
              ) : (
                <div className="space-y-1.5">
                  <Label htmlFor="discount_percent" className="text-xs font-bold text-text-secondary uppercase">Persen Potongan (%)</Label>
                  <Input
                    id="discount_percent"
                    type="number"
                    min="1"
                    max="100"
                    value={editForm.discount_percent}
                    onChange={(e) => setEditForm({ ...editForm, discount_percent: Number(e.target.value) || 0 })}
                    placeholder="e.g. 10"
                    required={discountType === "percent"}
                  />
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="max_uses" className="text-xs font-bold text-text-secondary uppercase">Batas Pemakaian (Max Uses)</Label>
                <Input
                  id="max_uses"
                  type="number"
                  value={editForm.max_uses}
                  onChange={(e) => setEditForm({ ...editForm, max_uses: Number(e.target.value) || 0 })}
                  placeholder="100"
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="uses_count" className="text-xs font-bold text-text-secondary uppercase">Jumlah Terpakai</Label>
                <Input
                  id="uses_count"
                  type="number"
                  value={editForm.uses_count}
                  onChange={(e) => setEditForm({ ...editForm, uses_count: Number(e.target.value) || 0 })}
                  placeholder="0"
                  required
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
              <Label htmlFor="promo_status" className="text-xs font-bold text-text-secondary uppercase cursor-pointer select-none">
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

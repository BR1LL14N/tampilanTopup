"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { SidebarContentWrapper } from "@/components/layout/sidebar-content-wrapper"
import { Card, CardContent } from "@/components/ui/card"
import { Shield, MessageSquare, Star, Eye, EyeOff, Trash2 } from "lucide-react"

export default function AdminFeedbacksPage() {
  const router = useRouter()
  
  const [reviews, setReviews] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  const fetchReviews = async () => {
    try {
      const res = await fetch("/api/admin/feedback")
      const data = await res.json()
      
      if (res.status === 403 || res.status === 401) {
        router.push("/")
        return
      }
      
      if (data.error) {
        setError(data.error)
      } else {
        setReviews(data.reviews)
      }
    } catch (err) {
      console.error("Failed to load admin feedbacks:", err)
      setError("Gagal memuat daftar kritik & saran.")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchReviews()
  }, [])

  const handleToggleVisibility = async (reviewId: string, currentStatus: number) => {
    try {
      const newVisibility = currentStatus === 1 ? 0 : 1
      const res = await fetch("/api/admin/feedback", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reviewId, visibility: newVisibility }),
      })
      const data = await res.json()
      if (data.success) {
        fetchReviews()
      } else {
        alert(data.error || "Gagal mengubah visibilitas.")
      }
    } catch (err) {
      console.error("Error toggling review visibility:", err)
      alert("Terjadi kesalahan koneksi.")
    }
  }

  const handleDeleteReview = async (reviewId: string) => {
    if (!confirm("Apakah Anda yakin ingin menghapus ulasan ini secara permanen beserta seluruh diskusi chat didalamnya?")) return

    try {
      const res = await fetch(`/api/admin/feedback?id=${reviewId}`, {
        method: "DELETE",
      })
      const data = await res.json()
      if (data.success) {
        fetchReviews()
      } else {
        alert(data.error || "Gagal menghapus ulasan.")
      }
    } catch (err) {
      console.error("Error deleting review:", err)
      alert("Terjadi kesalahan koneksi.")
    }
  }

  // Calculate stats
  const averageRating = reviews.length > 0
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
    : "0.0"

  const totalVisible = reviews.filter((r) => r.status === 1 || r.status === true).length

  return (
    <div className="relative min-h-screen bg-slate-50 text-slate-900 flex flex-col justify-between">
      <Header />
      
      <SidebarContentWrapper isAuthenticated={true}>
        <main className="relative z-10 mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 w-full flex-grow">
          
          {/* Header Area */}
          <div className="mb-8">
            <h1 className="text-2xl md:text-3xl font-black uppercase tracking-tight text-text-primary flex items-center gap-2">
              <Shield className="h-6 w-6 text-red-500" />
              Kelola Kritik, Saran &amp; Ulasan (Admin)
            </h1>
            <p className="text-xs font-bold text-text-secondary uppercase tracking-widest mt-1">
              Moderasi ulasan pelanggan, kelola visibilitas testimoni halaman depan, dan balas masukan
            </p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
            <Card className="rounded-[20px] border-sky-border shadow-sky-soft bg-white">
              <CardContent className="p-6">
                <p className="text-[10px] font-bold text-text-muted uppercase tracking-wider mb-2">Total Tiket Masuk</p>
                <p className="text-3xl font-black text-text-primary font-mono">{reviews.length}</p>
              </CardContent>
            </Card>

            <Card className="rounded-[20px] border-sky-border shadow-sky-soft bg-white">
              <CardContent className="p-6">
                <p className="text-[10px] font-bold text-text-muted uppercase tracking-wider mb-2">Rata-Rata Rating</p>
                <p className="text-3xl font-black text-yellow-500 font-mono flex items-center gap-2">
                  {averageRating} <Star className="h-6 w-6 fill-current text-yellow-500" />
                </p>
              </CardContent>
            </Card>

            <Card className="rounded-[20px] border-sky-border shadow-sky-soft bg-white">
              <CardContent className="p-6">
                <p className="text-[10px] font-bold text-text-muted uppercase tracking-wider mb-2">Ditampilkan di Beranda</p>
                <p className="text-3xl font-black text-sky font-mono">{totalVisible}</p>
              </CardContent>
            </Card>
          </div>

          {/* Reviews Table Card */}
          <Card className="rounded-[20px] border-sky-border shadow-sky-soft bg-white overflow-hidden">
            <CardContent className="p-6">
              {loading ? (
                <div className="text-center py-10 text-xs font-black uppercase tracking-widest text-text-muted">
                  Memuat Daftar Ulasan...
                </div>
              ) : error ? (
                <div className="text-center py-10 text-xs font-bold text-red-500 uppercase">
                  {error}
                </div>
              ) : reviews.length === 0 ? (
                <div className="text-center py-10 text-xs font-bold text-text-muted uppercase">
                  Belum ada kritik &amp; saran yang masuk.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs font-bold text-text-secondary">
                    <thead>
                      <tr className="border-b border-sky-border/60 text-[9px] text-text-muted uppercase tracking-widest">
                        <th className="pb-3 pl-2">Tanggal</th>
                        <th className="pb-3">Nama Pelanggan</th>
                        <th className="pb-3">Rating</th>
                        <th className="pb-3">Ulasan / Masukan</th>
                        <th className="pb-3 text-center">Tampil Beranda</th>
                        <th className="pb-3 pr-2 text-right">Aksi</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-sky-border/40">
                      {reviews.map((rev) => {
                        const isVisible = rev.status === 1 || rev.status === true
                        return (
                          <tr key={rev.id} className="hover:bg-slate-50/50 transition-colors">
                            <td className="py-4 pl-2 font-mono text-text-muted">
                              {new Date(rev.created_at).toLocaleDateString("id-ID", {
                                day: "numeric",
                                month: "short",
                                year: "numeric",
                              })}
                            </td>
                            <td className="py-4">
                              <p className="text-text-primary uppercase">{rev.user_name}</p>
                              <p className="text-[10px] text-text-muted font-normal lowercase">{rev.user_email}</p>
                            </td>
                            <td className="py-4">
                              <div className="text-yellow-400 font-mono text-[11px]">
                                {"★".repeat(rev.rating) + "☆".repeat(5 - rev.rating)}
                              </div>
                            </td>
                            <td className="py-4 max-w-xs truncate" title={rev.comment}>
                              "{rev.comment}"
                            </td>
                            <td className="py-4 text-center">
                              <button
                                onClick={() => handleToggleVisibility(rev.id, isVisible ? 1 : 0)}
                                className={`p-1.5 rounded-lg border transition ${
                                  isVisible
                                    ? "bg-emerald-50 text-emerald-500 border-emerald-500/20 hover:bg-emerald-100"
                                    : "bg-red-50 text-red-500 border-red-500/20 hover:bg-red-100"
                                }`}
                                title={isVisible ? "Sembunyikan dari Beranda" : "Tampilkan di Beranda"}
                              >
                                {isVisible ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                              </button>
                            </td>
                            <td className="py-4 pr-2 text-right space-x-2">
                              <Link
                                href={`/admin/feedbacks/${rev.id}`}
                                className="inline-flex items-center gap-1 bg-sky hover:bg-sky-dark text-white text-[9px] font-black uppercase tracking-wider px-3 py-1.5 rounded-lg shadow-sky-soft transition"
                              >
                                <MessageSquare className="h-3 w-3" />
                                Balas Chat
                              </Link>
                              <button
                                onClick={() => handleDeleteReview(rev.id)}
                                className="inline-flex items-center p-1.5 bg-red-50 hover:bg-red-100 text-red-500 border border-red-500/10 rounded-lg transition"
                                title="Hapus Ulasan"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>

        </main>
      </SidebarContentWrapper>
      
      <Footer />
    </div>
  )
}

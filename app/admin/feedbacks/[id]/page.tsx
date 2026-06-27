"use client"

import { useState, useEffect, useRef } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { SidebarContentWrapper } from "@/components/layout/sidebar-content-wrapper"
import { Card, CardContent } from "@/components/ui/card"
import { ChevronLeft, Send, MessageSquare, Shield, Eye, EyeOff } from "lucide-react"

export default function AdminReviewChatPage() {
  const { id } = useParams()
  const router = useRouter()
  
  const [review, setReview] = useState<any>(null)
  const [messages, setMessages] = useState<any[]>([])
  const [newMessage, setNewMessage] = useState("")
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [error, setError] = useState("")
  
  const chatEndRef = useRef<HTMLDivElement>(null)

  const fetchChatData = async () => {
    try {
      const res = await fetch(`/api/feedback/${id}`)
      const data = await res.json()
      
      if (res.status === 403 || res.status === 401) {
        router.push("/")
        return
      }
      
      if (data.error) {
        setError(data.error)
      } else {
        setReview(data.review)
        setMessages(data.messages)
        setError("")
      }
    } catch (err) {
      console.error("Failed to load chat thread:", err)
      setError("Gagal memuat diskusi chat.")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (id) {
      fetchChatData()
    }
  }, [id])

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  // Poll for messages every 8 seconds
  useEffect(() => {
    if (!id || error) return
    const interval = setInterval(() => {
      fetchChatData()
    }, 8500)
    return () => clearInterval(interval)
  }, [id, error])

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (newMessage.trim() === "" || sending) return

    setSending(true)
    try {
      const res = await fetch(`/api/feedback/${id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: newMessage }),
      })
      const data = await res.json()
      if (data.success) {
        setNewMessage("")
        await fetchChatData()
      } else {
        alert(data.error || "Gagal mengirimkan pesan.")
      }
    } catch (err) {
      console.error("Failed to post message:", err)
      alert("Terjadi kesalahan koneksi.")
    } finally {
      setSending(false)
    }
  }

  const handleToggleVisibility = async () => {
    try {
      const isCurrentlyVisible = review.status === 1 || review.status === true
      const newVisibility = isCurrentlyVisible ? 0 : 1
      const res = await fetch("/api/admin/feedback", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reviewId: review.id, visibility: newVisibility }),
      })
      const data = await res.json()
      if (data.success) {
        fetchChatData()
      } else {
        alert(data.error || "Gagal mengubah visibilitas.")
      }
    } catch (err) {
      console.error("Error toggling review visibility:", err)
      alert("Terjadi kesalahan koneksi.")
    }
  }

  return (
    <div className="relative min-h-screen bg-slate-50 text-slate-900 flex flex-col justify-between">
      <Header />
      
      <SidebarContentWrapper isAuthenticated={true}>
        <main className="relative z-10 mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8 w-full flex-grow">
          
          {/* Back Button */}
          <Link
            href="/admin/feedbacks"
            className="inline-flex items-center gap-1.5 text-xs font-black uppercase text-text-muted hover:text-sky tracking-wider mb-6 transition-colors"
          >
            <ChevronLeft className="h-4 w-4" />
            Kembali ke Daftar Ulasan
          </Link>

          {loading ? (
            <div className="text-center py-20 text-xs font-black uppercase tracking-widest text-text-muted">
              Memuat Ruang Diskusi Admin...
            </div>
          ) : error ? (
            <div className="bg-red-50/50 p-8 text-center rounded-[20px] border border-red-200/40 shadow-sky-soft max-w-md mx-auto">
              <p className="text-xs font-black text-red-600 uppercase tracking-wider mb-4">
                {error}
              </p>
              <Link
                href="/admin/feedbacks"
                className="inline-block bg-sky hover:bg-sky-dark text-white text-xs font-black uppercase tracking-widest py-3 px-6 rounded-xl transition-all"
              >
                Kembali ke Daftar
              </Link>
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-3">
              {/* Left Column: Admin Ticket Panel */}
              <div className="md:col-span-1 space-y-6">
                <Card className="rounded-[20px] border-sky-border shadow-sky-soft overflow-hidden bg-white">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-2 mb-4">
                      <div className="w-10 h-10 rounded-xl bg-red-50 text-red-500 grid place-items-center">
                        <Shield className="h-5 w-5" />
                      </div>
                      <div>
                        <h2 className="text-sm font-black text-text-primary uppercase leading-tight">
                          Modul Admin
                        </h2>
                        <p className="text-[10px] font-bold text-text-muted uppercase tracking-wider">
                          Kontrol Ulasan
                        </p>
                      </div>
                    </div>

                    <div className="space-y-4 border-t border-sky-border pt-4 text-xs font-bold text-text-secondary">
                      <div>
                        <p className="text-[9px] font-bold text-text-muted uppercase tracking-wide">
                          Pengirim
                        </p>
                        <p className="text-text-primary uppercase">{review.user_name}</p>
                      </div>

                      <div>
                        <p className="text-[9px] font-bold text-text-muted uppercase tracking-wide">
                          Rating Bintang
                        </p>
                        <div className="text-yellow-400 text-sm mt-0.5">
                          {"★".repeat(review.rating) + "☆".repeat(5 - review.rating)}
                        </div>
                      </div>

                      <div>
                        <p className="text-[9px] font-bold text-text-muted uppercase tracking-wide">
                          Visibilitas Beranda
                        </p>
                        <span className={`inline-block px-2 py-0.5 text-[8px] font-black uppercase tracking-wider rounded mt-1 ${
                          review.status === 1 || review.status === true
                            ? "bg-emerald-50 text-emerald-500 border border-emerald-500/20"
                            : "bg-red-50 text-red-500 border border-red-500/20"
                        }`}>
                          {review.status === 1 || review.status === true ? "Tampil" : "Sembunyi"}
                        </span>
                      </div>

                      <div className="pt-2">
                        <button
                          onClick={handleToggleVisibility}
                          className="w-full bg-slate-100 hover:bg-slate-200/80 text-text-primary text-[10px] font-black uppercase tracking-widest py-2.5 px-4 rounded-xl border border-sky-border/40 transition flex items-center justify-center gap-1.5"
                        >
                          {review.status === 1 || review.status === true ? (
                            <>
                              <EyeOff className="h-3.5 w-3.5" />
                              Sembunyikan Ulasan
                            </>
                          ) : (
                            <>
                              <Eye className="h-3.5 w-3.5" />
                              Tampilkan Ulasan
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Right Column: Admin Chat Interface */}
              <div className="md:col-span-2 flex flex-col h-[550px] bg-white rounded-[20px] border border-sky-border shadow-sky-soft overflow-hidden">
                {/* Chat Header */}
                <div className="bg-slate-50/80 px-6 py-4 border-b border-sky-border flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-red-500" />
                    <p className="text-xs font-black uppercase tracking-wider text-text-primary">
                      Membalas Kritik/Saran: {review.user_name}
                    </p>
                  </div>
                  <span className="text-[9px] font-black uppercase text-red-500 bg-red-50 px-2 py-0.5 rounded border border-red-500/10">
                    Mode Admin
                  </span>
                </div>

                {/* Message List area */}
                <div className="flex-grow p-6 overflow-y-auto space-y-4 bg-slate-50/20">
                  {messages.map((msg) => {
                    const isAdmin = msg.sender === "admin"
                    return (
                      <div
                        key={msg.id}
                        className={`flex ${isAdmin ? "justify-end" : "justify-start"}`}
                      >
                        <div
                          className={`max-w-[75%] p-4 rounded-2xl shadow-sky-soft text-xs font-bold leading-relaxed ${
                            isAdmin
                              ? "bg-sky text-white rounded-tr-none"
                              : "bg-white border border-sky-border text-text-primary rounded-tl-none"
                          }`}
                        >
                          <p className="break-words">{msg.message}</p>
                          <p
                            className={`text-[8px] mt-1 text-right leading-none ${
                              isAdmin ? "text-sky-light/80" : "text-text-muted"
                            }`}
                          >
                            {new Date(msg.created_at).toLocaleTimeString("id-ID", {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </p>
                        </div>
                      </div>
                    )
                  })}
                  <div ref={chatEndRef} />
                </div>

                {/* Message Form input area */}
                <form
                  onSubmit={handleSendMessage}
                  className="p-4 border-t border-sky-border bg-white flex gap-2 items-center"
                >
                  <input
                    type="text"
                    required
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Ketik balasan Anda untuk pelanggan di sini..."
                    className="flex-grow text-xs font-bold text-text-primary placeholder:text-text-muted/60 p-3 bg-slate-50 rounded-xl border border-sky-border focus:border-sky/40 focus:bg-white focus:outline-none transition-all duration-300"
                  />
                  <button
                    type="submit"
                    disabled={sending || newMessage.trim() === ""}
                    className="h-11 w-11 rounded-xl bg-sky hover:bg-sky-dark text-white shadow-sky-soft flex items-center justify-center transition-all duration-300 disabled:opacity-50"
                  >
                    <Send className="h-4 w-4" />
                  </button>
                </form>
              </div>
            </div>
          )}

        </main>
      </SidebarContentWrapper>
      
      <Footer />
    </div>
  )
}

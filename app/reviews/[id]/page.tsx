"use client"

import { useState, useEffect, useRef } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { SidebarContentWrapper } from "@/components/layout/sidebar-content-wrapper"
import { Card, CardContent } from "@/components/ui/card"
import { ChevronLeft, Send, MessageSquare, AlertCircle } from "lucide-react"

export default function ReviewChatPage() {
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
      
      if (res.status === 401) {
        router.push("/auth/login")
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

  // Initial load
  useEffect(() => {
    if (id) {
      fetchChatData()
    }
  }, [id])

  // Scroll to bottom on new messages
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  // Optional: Poll for new messages every 8 seconds
  useEffect(() => {
    if (!id || error) return
    const interval = setInterval(() => {
      fetchChatData()
    }, 8000)
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

  return (
    <div className="relative min-h-screen bg-slate-50 text-slate-900 flex flex-col justify-between">
      <Header />
      
      <SidebarContentWrapper>
        <main className="relative z-10 mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8 w-full flex-grow">
          
          {/* Back to Home Button */}
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs font-black uppercase text-text-muted hover:text-sky tracking-wider mb-6 transition-colors"
          >
            <ChevronLeft className="h-4 w-4" />
            Kembali ke Beranda
          </Link>

          {loading ? (
            <div className="text-center py-20 text-xs font-black uppercase tracking-widest text-text-muted">
              Memuat Ruang Diskusi...
            </div>
          ) : error ? (
            <div className="bg-red-50/50 p-8 text-center rounded-[20px] border border-red-200/40 shadow-sky-soft max-w-md mx-auto">
              <AlertCircle className="h-10 w-10 text-red-500 mx-auto mb-4" />
              <p className="text-xs font-black text-red-600 uppercase tracking-wider mb-4 leading-relaxed">
                {error === "Forbidden" 
                  ? "Akses Ditolak. Anda hanya dapat melihat ruang chat kritik & saran milik Anda sendiri." 
                  : error}
              </p>
              <Link
                href="/"
                className="inline-block bg-sky hover:bg-sky-dark text-white text-xs font-black uppercase tracking-widest py-3 px-6 rounded-xl transition-all duration-300 shadow-sky-soft"
              >
                Kembali ke Beranda
              </Link>
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-3">
              {/* Left Column: Review Overview card */}
              <div className="md:col-span-1 space-y-6">
                <Card className="rounded-[20px] border-sky-border shadow-sky-soft overflow-hidden bg-white">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-2 mb-4">
                      <div className="w-10 h-10 rounded-xl bg-sky/10 text-sky grid place-items-center">
                        <MessageSquare className="h-5 w-5" />
                      </div>
                      <div>
                        <h2 className="text-sm font-black text-text-primary uppercase leading-tight">
                          Detail Tiket
                        </h2>
                        <p className="text-[10px] font-bold text-text-muted uppercase tracking-wider">
                          Kritik & Saran
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
                          Dibuat Pada
                        </p>
                        <p className="text-text-primary">
                          {new Date(review.created_at).toLocaleDateString("id-ID", {
                            day: "numeric",
                            month: "long",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit"
                          })}
                        </p>
                      </div>

                      <div className="bg-sky/5 p-3 rounded-xl border border-sky-border/40">
                        <p className="text-[9px] font-black text-sky uppercase tracking-widest mb-1">
                          Masukan Pertama:
                        </p>
                        <p className="text-[11px] leading-relaxed text-text-primary italic">
                          "{review.comment}"
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Right Column: Chat Box */}
              <div className="md:col-span-2 flex flex-col h-[550px] bg-white rounded-[20px] border border-sky-border shadow-sky-soft overflow-hidden">
                {/* Chat Header */}
                <div className="bg-slate-50/80 px-6 py-4 border-b border-sky-border flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                    <p className="text-xs font-black uppercase tracking-wider text-text-primary">
                      Diskusi dengan Admin Mitsuru
                    </p>
                  </div>
                  <span className="text-[9px] font-black uppercase text-sky bg-sky/10 px-2 py-0.5 rounded border border-sky-border">
                    Kritik & Saran
                  </span>
                </div>

                {/* Message List area */}
                <div className="flex-grow p-6 overflow-y-auto space-y-4 bg-slate-50/20">
                  {messages.map((msg) => {
                    const isAdmin = msg.sender === "admin"
                    return (
                      <div
                        key={msg.id}
                        className={`flex ${isAdmin ? "justify-start" : "justify-end"}`}
                      >
                        <div
                          className={`max-w-[75%] p-4 rounded-2xl shadow-sky-soft text-xs font-bold leading-relaxed ${
                            isAdmin
                              ? "bg-white border border-sky-border text-text-primary rounded-tl-none"
                              : "bg-sky text-white rounded-tr-none"
                          }`}
                        >
                          <p className="break-words">{msg.message}</p>
                          <p
                            className={`text-[8px] mt-1 text-right leading-none ${
                              isAdmin ? "text-text-muted" : "text-sky-light/80"
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
                    placeholder="Ketik pesan Anda untuk Admin di sini..."
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

"use client"

import { useState } from "react"
import Link from "next/link"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { SidebarContentWrapper } from "@/components/layout/sidebar-content-wrapper"
import { createClient } from "@/lib/supabase/client"
import { Loader2, Search, CheckCircle2, AlertTriangle, Clock, ArrowLeft, ShieldAlert } from "lucide-react"

export default function CheckTransactionPage() {
  const supabase = createClient()
  const [invoice, setInvoice] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState("")

  const handleCheck = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")
    setResult(null)

    try {
      const { data, error: fetchError } = await supabase
        .from("transaction_details")
        .select("*")
        .eq("invoice", invoice.trim().toUpperCase())
        .single()

      if (fetchError || !data) {
        setError("Transaksi tidak ditemukan. Harap periksa kembali nomor invoice Anda.")
        return
      }

      setResult({
        invoice: data.invoice,
        product: data.product_name,
        game: data.game_name,
        target_id: data.target_id,
        amount: data.amount,
        status: data.topup_status,
        payment_method: data.payment_method,
        payment_status: data.payment_status,
        date: data.created_at,
      })
    } catch (err) {
      setError("Terjadi kesalahan saat memeriksa transaksi. Silakan coba lagi.")
    } finally {
      setIsLoading(false)
    }
  }

  // Clip path styles for hexagonal game UI cuts
  const bevelStyle = {
    clipPath: "polygon(10px 0%, calc(100% - 10px) 0%, 100% 10px, 100% calc(100% - 10px), calc(100% - 10px) 100%, 10px 100%, 0% calc(100% - 10px), 0% 10px)"
  }

  const inputBevelStyle = {
    clipPath: "polygon(8px 0%, calc(100% - 8px) 0%, 100% 8px, 100% calc(100% - 8px), calc(100% - 8px) 100%, 8px 100%, 0% calc(100% - 8px), 0% 8px)"
  }

  const tagBevelStyle = {
    clipPath: "polygon(4px 0%, calc(100% - 4px) 0%, 100% 4px, 100% calc(100% - 4px), calc(100% - 4px) 100%, 4px 100%, 0% calc(100% - 4px), 0% 4px)"
  }

  return (
    <div className="min-h-screen flex flex-col relative overflow-x-clip text-slate-100">
      
      {/* Mesh Background Grid */}
      <div className="pointer-events-none fixed inset-0 mesh opacity-45 z-0" />

      <Header />

      <SidebarContentWrapper>
        <main className="flex-1 py-16 px-4 relative z-20 flex items-center justify-center">
        <div className="w-full max-w-xl">
          
          {/* Section Title */}
          <div className="text-center mb-8">
            <h1 className="text-3xl md:text-4xl font-black uppercase tracking-tight text-white mb-3 bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">
              Cek Transaksi
            </h1>
            <p className="text-xs font-semibold tracking-wider text-cyan-300 uppercase">
              Pantau Status Pengiriman Topup Game Anda
            </p>
          </div>

          {/* Glass Card Container */}
          <div className="w-full glass rounded-2xl shadow-neon-cyan border-white/10 backdrop-blur-md p-6 md:p-8 relative">
            {/* Corner ambient glows */}
            <div className="absolute top-0 left-0 w-20 h-20 bg-cyan-300/10 rounded-full blur-2xl pointer-events-none" />
            <div className="absolute bottom-0 right-0 w-20 h-20 bg-blue-500/10 rounded-full blur-2xl pointer-events-none" />

            <form onSubmit={handleCheck} className="space-y-6">
              <div className="space-y-2">
                <label htmlFor="invoice" className="text-xs font-bold uppercase tracking-wider text-slate-300 block">
                  Nomor Invoice <span className="text-cyan-300">*</span>
                </label>
                <div
                  className="relative p-[1px] bg-gradient-to-r from-white/10 to-white/5 focus-within:from-cyan-300 focus-within:to-cyan-400 transition-all duration-300"
                  style={inputBevelStyle}
                >
                  <div className="relative flex items-center">
                    <span className="absolute left-4 text-slate-500">
                      <Search className="h-4 w-4" />
                    </span>
                    <input
                      id="invoice"
                      type="text"
                      placeholder="Contoh: INV-20260525-0001"
                      value={invoice}
                      onChange={(e) => setInvoice(e.target.value)}
                      className="w-full bg-slate-950/80 pl-11 pr-4 py-3 text-white placeholder-slate-500 outline-none border-none text-sm transition-colors duration-200"
                      style={inputBevelStyle}
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Submit Button with Shimmer Hover */}
              <div
                className="relative p-[1px] bg-gradient-to-r from-cyan-300/40 to-blue-500/40 hover:from-cyan-300 hover:to-blue-500 transition-all duration-300 shadow-lg shadow-cyan-300/5 hover:shadow-cyan-300/20"
                style={bevelStyle}
              >
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-slate-950/90 py-3 text-sm font-bold uppercase tracking-wider text-cyan-300 hover:text-white transition flex items-center justify-center gap-2 shimmer-hover"
                  style={bevelStyle}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin text-cyan-300" />
                      Mencari Transaksi...
                    </>
                  ) : (
                    "Periksa Status Transaksi"
                  )}
                </button>
              </div>
            </form>

            {/* Error Message */}
            {error && (
              <div className="mt-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-semibold flex items-center gap-3 animate-fadeIn">
                <ShieldAlert className="h-5 w-5 text-red-500 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Transaction Result Panel */}
            {result && (
              <div className="mt-8 border border-white/10 rounded-xl bg-slate-950/60 overflow-hidden relative">
                {/* Visual Status Header bar */}
                <div className={`p-4 flex items-center justify-between border-b border-white/10 ${
                  result.status === 'success' ? 'bg-green-500/10' :
                  result.status === 'processing' ? 'bg-yellow-500/10' :
                  result.status === 'pending' ? 'bg-blue-500/10' :
                  'bg-red-500/10'
                }`}>
                  <div className="flex items-center gap-2">
                    {result.status === 'success' ? (
                      <CheckCircle2 className="h-5 w-5 text-green-400" />
                    ) : result.status === 'processing' || result.status === 'pending' ? (
                      <Clock className="h-5 w-5 text-yellow-400 animate-spin" />
                    ) : (
                      <AlertTriangle className="h-5 w-5 text-red-400" />
                    )}
                    <span className="text-xs font-bold uppercase tracking-wider">
                      Status Topup
                    </span>
                  </div>
                  <span className={`px-3 py-1 text-[10px] font-black uppercase tracking-wider ${
                    result.status === 'success' ? 'bg-green-500 text-ink' :
                    result.status === 'processing' ? 'bg-yellow-500 text-ink' :
                    result.status === 'pending' ? 'bg-blue-500 text-white' :
                    'bg-red-500 text-white'
                  }`} style={tagBevelStyle}>
                    {result.status === 'success' ? 'Berhasil' :
                     result.status === 'processing' ? 'Diproses' : 
                     result.status === 'pending' ? 'Tertunda' : 'Gagal'}
                  </span>
                </div>

                <div className="p-5 space-y-4 text-xs">
                  <div className="flex justify-between items-center border-b border-white/5 pb-2">
                    <span className="text-slate-400 font-medium">Nomor Invoice</span>
                    <span className="font-mono text-cyan-300 font-bold">{result.invoice}</span>
                  </div>
                  <div className="flex justify-between items-center border-b border-white/5 pb-2">
                    <span className="text-slate-400 font-medium">Game</span>
                    <span className="font-bold text-white uppercase">{result.game}</span>
                  </div>
                  <div className="flex justify-between items-center border-b border-white/5 pb-2">
                    <span className="text-slate-400 font-medium">Item Produk</span>
                    <span className="font-bold text-white">{result.product}</span>
                  </div>
                  <div className="flex justify-between items-center border-b border-white/5 pb-2">
                    <span className="text-slate-400 font-medium">User ID Tujuan</span>
                    <span className="font-mono bg-white/5 px-2.5 py-1 rounded text-cyan-100 font-semibold">{result.target_id}</span>
                  </div>
                  <div className="flex justify-between items-center border-b border-white/5 pb-2">
                    <span className="text-slate-400 font-medium">Metode Pembayaran</span>
                    <span className="font-bold text-white uppercase">{result.payment_method || "-"}</span>
                  </div>
                  <div className="flex justify-between items-center border-b border-white/5 pb-2">
                    <span className="text-slate-400 font-medium">Status Pembayaran</span>
                    <span className={`font-semibold capitalize ${
                      result.payment_status === 'paid' ? 'text-green-400' :
                      result.payment_status === 'failed' ? 'text-red-400' :
                      'text-yellow-400'
                    }`}>{result.payment_status || "Pending"}</span>
                  </div>
                  <div className="flex justify-between items-center pt-1">
                    <span className="text-slate-400 font-medium">Total Pembayaran</span>
                    <span className="text-lg font-black text-cyan-300">Rp {result.amount.toLocaleString("id-ID")}</span>
                  </div>
                </div>
              </div>
            )}
            
            <div className="mt-8 flex justify-center">
              <Link href="/" className="inline-flex items-center gap-2 text-xs font-bold text-slate-400 hover:text-cyan-300 transition duration-300 uppercase tracking-widest hover:translate-x-[-2px]">
                <ArrowLeft className="h-4 w-4 text-cyan-300" />
                Kembali ke Beranda
              </Link>
            </div>

          </div>
        </div>
        </main>

        <Footer />
      </SidebarContentWrapper>
    </div>
  )
}
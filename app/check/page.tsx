"use client"

import { useState } from "react"
import Link from "next/link"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { SidebarContentWrapper } from "@/components/layout/sidebar-content-wrapper"
import { Loader2, Search, CheckCircle2, AlertTriangle, Clock, ArrowLeft, ShieldAlert } from "lucide-react"

export default function CheckTransactionPage() {
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
      const res = await fetch(`/api/transactions/check?invoice=${encodeURIComponent(invoice.trim().toUpperCase())}`)
      const dataJson = await res.json()

      if (dataJson.error || !dataJson.transaction) {
        setError(dataJson.error || "Transaksi tidak ditemukan. Harap periksa kembali nomor invoice Anda.")
        return
      }

      const data = dataJson.transaction;

      setResult({
        invoice: data.invoice,
        product: data.product_name,
        game: data.game_name,
        target_id: data.target_id,
        amount: Number(data.amount),
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
    <div className="min-h-screen flex flex-col relative overflow-x-clip text-text-primary">

      <Header />

      <SidebarContentWrapper>
        <main className="flex-1 py-16 px-4 relative z-20 flex items-center justify-center">
        <div className="w-full max-w-xl">

          {/* Section Title */}
          <div className="text-center mb-8">
            <h1 className="text-3xl md:text-4xl font-black uppercase tracking-tight text-text-primary mb-3 bg-clip-text text-transparent bg-gradient-to-r from-text-primary to-text-secondary">
              Cek Transaksi
            </h1>
            <p className="text-xs font-semibold tracking-wider text-sky uppercase">
              Pantau Status Pengiriman Topup Game Anda
            </p>
          </div>

          {/* Glass Card Container */}
          <div className="w-full glass-sky rounded-2xl shadow-sky-glow border-sky-border backdrop-blur-md p-6 md:p-8 relative bg-white/80">
            {/* Corner ambient glows */}
            <div className="absolute top-0 left-0 w-20 h-20 bg-sky/10 rounded-full blur-2xl pointer-events-none" />
            <div className="absolute bottom-0 right-0 w-20 h-20 bg-diamond/10 rounded-full blur-2xl pointer-events-none" />

            <form onSubmit={handleCheck} className="space-y-6">
              <div className="space-y-2">
                <label htmlFor="invoice" className="text-xs font-bold uppercase tracking-wider text-text-secondary block">
                  Nomor Invoice <span className="text-sky">*</span>
                </label>
                <div className="relative flex items-center">
                  <span className="absolute left-4 text-text-muted">
                    <Search className="h-4 w-4" />
                  </span>
                  <input
                    id="invoice"
                    type="text"
                    placeholder="Contoh: INV-20260525-0001"
                    value={invoice}
                    onChange={(e) => setInvoice(e.target.value)}
                    className="w-full bg-white border border-sky-border pl-11 pr-4 py-3 text-text-primary placeholder-text-muted outline-none text-sm transition-all duration-300 rounded-xl hover:border-sky/40 focus:border-sky focus:ring-2 focus:ring-sky/20"
                    required
                  />
                </div>
              </div>

              {/* Submit Button with Shimmer Hover */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-sky hover:bg-diamond py-3 text-sm font-bold uppercase tracking-wider text-white transition rounded-xl flex items-center justify-center gap-2 shadow-sky-soft hover:shadow-sky-glow shimmer-hover disabled:opacity-50"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin text-white" />
                    Mencari Transaksi...
                  </>
                ) : (
                  "Periksa Status Transaksi"
                )}
              </button>
            </form>

            {/* Error Message */}
            {error && (
              <div className="mt-6 p-4 rounded-xl bg-red-50 border border-red-500/20 text-red-500 text-xs font-semibold flex items-center gap-3 animate-fadeIn">
                <ShieldAlert className="h-5 w-5 text-red-500 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Transaction Result Panel */}
            {result && (
              <div className="mt-8 border border-sky-border rounded-xl bg-ice overflow-hidden relative">
                {/* Visual Status Header bar */}
                <div className={`p-4 flex items-center justify-between border-b border-sky-border ${
                  result.status === 'success' ? 'bg-emerald-50' :
                  result.status === 'processing' ? 'bg-amber-50' :
                  result.status === 'pending' ? 'bg-blue-50' :
                  'bg-red-50'
                }`}>
                  <div className="flex items-center gap-2">
                    {result.status === 'success' ? (
                      <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                    ) : result.status === 'processing' || result.status === 'pending' ? (
                      <Clock className="h-5 w-5 text-amber-500 animate-spin" />
                    ) : (
                      <AlertTriangle className="h-5 w-5 text-red-500" />
                    )}
                    <span className="text-xs font-bold uppercase tracking-wider text-text-primary">
                      Status Topup
                    </span>
                  </div>
                  <span className={`px-3 py-1 text-[10px] font-black uppercase tracking-wider ${
                    result.status === 'success' ? 'bg-emerald-500 text-white' :
                    result.status === 'processing' ? 'bg-amber-500 text-white' :
                    result.status === 'pending' ? 'bg-blue-500 text-white' :
                    'bg-red-500 text-white'
                  }`} style={tagBevelStyle}>
                    {result.status === 'success' ? 'Berhasil' :
                     result.status === 'processing' ? 'Diproses' :
                     result.status === 'pending' ? 'Tertunda' : 'Gagal'}
                  </span>
                </div>

                <div className="p-5 space-y-4 text-xs">
                  <div className="flex justify-between items-center border-b border-sky-border/50 pb-2">
                    <span className="text-text-secondary font-medium">Nomor Invoice</span>
                    <span className="font-mono text-sky font-bold">{result.invoice}</span>
                  </div>
                  <div className="flex justify-between items-center border-b border-sky-border/50 pb-2">
                    <span className="text-text-secondary font-medium">Game</span>
                    <span className="font-bold text-text-primary uppercase">{result.game}</span>
                  </div>
                  <div className="flex justify-between items-center border-b border-sky-border/50 pb-2">
                    <span className="text-text-secondary font-medium">Item Produk</span>
                    <span className="font-bold text-text-primary">{result.product}</span>
                  </div>
                  <div className="flex justify-between items-center border-b border-sky-border/50 pb-2">
                    <span className="text-text-secondary font-medium">User ID Tujuan</span>
                    <span className="font-mono bg-white px-2.5 py-1 rounded text-text-primary font-semibold border border-sky-border/30">{result.target_id}</span>
                  </div>
                  <div className="flex justify-between items-center border-b border-sky-border/50 pb-2">
                    <span className="text-text-secondary font-medium">Metode Pembayaran</span>
                    <span className="font-bold text-text-primary uppercase">{result.payment_method || "-"}</span>
                  </div>
                  <div className="flex justify-between items-center border-b border-sky-border/50 pb-2">
                    <span className="text-text-secondary font-medium">Status Pembayaran</span>
                    <span className={`font-semibold capitalize ${
                      result.payment_status === 'paid' ? 'text-emerald-500' :
                      result.payment_status === 'failed' ? 'text-red-500' :
                      'text-amber-500'
                    }`}>{result.payment_status || "Pending"}</span>
                  </div>
                  <div className="flex justify-between items-center pt-1">
                    <span className="text-text-secondary font-medium">Total Pembayaran</span>
                    <span className="text-lg font-black text-sky">Rp {result.amount.toLocaleString("id-ID")}</span>
                  </div>
                </div>
              </div>
            )}

            <div className="mt-8 flex justify-center">
              <Link href="/" className="inline-flex items-center gap-2 text-xs font-bold text-text-secondary hover:text-sky transition duration-300 uppercase tracking-widest hover:translate-x-[-2px]">
                <ArrowLeft className="h-4 w-4 text-sky" />
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
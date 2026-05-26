"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { createClient } from "@/lib/supabase/client"
import { formatCurrency, formatDate } from "@/lib/utils"
import { cn } from "@/lib/utils"
import { getGameAssetByName, getItemAssetForProduct, paymentAssets } from "@/lib/assets"
import { 
  Loader2, 
  CheckCircle2, 
  AlertTriangle, 
  Clock, 
  ArrowLeft, 
  ShieldAlert, 
  Receipt,
  FileText
} from "lucide-react"

const mockTransactions = [
  {
    invoice: "INV-20260525-0001",
    target_id: "12345678",
    amount: 25000,
    payment_status: "paid",
    topup_status: "success",
    created_at: "2026-05-25T10:30:00Z",
    product_name: "86 Diamonds",
    game_name: "Mobile Legends",
    payment_method: "QRIS",
  },
  {
    invoice: "INV-20260524-0001",
    target_id: "98765432",
    amount: 18000,
    payment_status: "paid",
    topup_status: "success",
    created_at: "2026-05-24T15:45:00Z",
    product_name: "70 Diamonds + 10 Bonus",
    game_name: "Free Fire",
    payment_method: "QRIS",
  },
  {
    invoice: "INV-20260523-0001",
    target_id: "55556666",
    amount: 22000,
    payment_status: "paid",
    topup_status: "processing",
    created_at: "2026-05-23T08:20:00Z",
    product_name: "60 UC",
    game_name: "PUBG Mobile",
    payment_method: "QRIS",
  },
]

export default function InvoiceDetailPage() {
  const { invoiceId } = useParams()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState("")

  useEffect(() => {
    if (!invoiceId) return

    const fetchInvoice = async () => {
      setIsLoading(true)
      setError("")
      setResult(null)

      try {
        const invStr = String(invoiceId).toUpperCase()

        // 1. Check Mock Data
        const mockMatch = mockTransactions.find(t => t.invoice === invStr)
        if (mockMatch) {
          setResult({
            invoice: mockMatch.invoice,
            product: mockMatch.product_name,
            game: mockMatch.game_name,
            target_id: mockMatch.target_id,
            amount: mockMatch.amount,
            status: mockMatch.topup_status,
            payment_method: mockMatch.payment_method,
            payment_status: mockMatch.payment_status,
            date: mockMatch.created_at,
          })
          setIsLoading(false)
          return
        }

        // 2. Check Supabase database
        const supabase = createClient()
        const { data, error: fetchError } = await supabase
          .from("transaction_details")
          .select("*")
          .eq("invoice", invStr)
          .single()

        if (fetchError || !data) {
          setError("Transaksi tidak ditemukan. Harap periksa kembali nomor invoice Anda.")
        } else {
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
        }
      } catch (err) {
        setError("Terjadi kesalahan saat memeriksa transaksi. Silakan coba lagi.")
      } finally {
        setIsLoading(false)
      }
    }

    fetchInvoice()
  }, [invoiceId])

  const bevelStyle = {
    clipPath: "polygon(10px 0%, calc(100% - 10px) 0%, 100% 10px, 100% calc(100% - 10px), calc(100% - 10px) 100%, 10px 100%, 0% calc(100% - 10px), 0% 10px)"
  }

  const tagBevelStyle = {
    clipPath: "polygon(4px 0%, calc(100% - 4px) 0%, 100% 4px, 100% calc(100% - 4px), calc(100% - 4px) 100%, 4px 100%, 0% calc(100% - 4px), 0% 4px)"
  }

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden text-slate-100">
      {/* Mesh Background Grid */}
      <div className="pointer-events-none fixed inset-0 mesh opacity-45 z-0" />

      <Header />

      <main className="flex-1 py-16 px-4 relative z-20 flex items-center justify-center">
        <div className="w-full max-w-xl">
          
          {/* Section Title */}
          <div className="text-center mb-8">
            <h1 className="text-2xl md:text-3xl font-black uppercase tracking-tight text-white mb-2 flex items-center justify-center gap-2">
              <Receipt className="h-6 w-6 text-cyan-300" />
              Detail Transaksi
            </h1>
            <p className="text-xs font-semibold tracking-wider text-cyan-300 uppercase">
              Nomor Invoice: {invoiceId}
            </p>
          </div>

          {/* Glass Card Container */}
          <div className="w-full glass rounded-2xl shadow-neon-cyan border-white/10 backdrop-blur-md p-6 md:p-8 relative">
            <div className="absolute top-0 left-0 w-20 h-20 bg-cyan-300/10 rounded-full blur-2xl pointer-events-none" />
            <div className="absolute bottom-0 right-0 w-20 h-20 bg-blue-500/10 rounded-full blur-2xl pointer-events-none" />

            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-12 gap-3">
                <Loader2 className="h-8 w-8 animate-spin text-cyan-300" />
                <p className="text-xs font-bold uppercase tracking-widest text-slate-400">Memuat Detail Invoice...</p>
              </div>
            ) : error ? (
              <div className="space-y-6">
                <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-semibold flex items-center gap-3 animate-fadeIn">
                  <ShieldAlert className="h-5 w-5 text-red-500 shrink-0" />
                  <span>{error}</span>
                </div>
                <div className="flex justify-center">
                  <Link href="/history" className="inline-flex items-center gap-2 text-xs font-bold text-slate-400 hover:text-cyan-300 transition duration-300 uppercase tracking-widest">
                    <ArrowLeft className="h-4 w-4" />
                    Kembali ke Riwayat
                  </Link>
                </div>
              </div>
            ) : (
              <div className="space-y-6 animate-fadeIn">
                
                {/* Visual Status Header bar */}
                <div className={`p-4 rounded-xl flex items-center justify-between border border-white/5 ${
                  result.status === 'success' ? 'bg-green-500/10 border-green-500/20' :
                  result.status === 'processing' ? 'bg-yellow-500/10 border-yellow-500/20' :
                  result.status === 'pending' ? 'bg-blue-500/10 border-blue-500/20' :
                  'bg-red-500/10 border-red-500/20'
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

                {/* Details Table */}
                <div className="border border-white/10 rounded-xl bg-slate-950/60 p-5 space-y-4 text-xs">
                  <div className="flex justify-between items-center border-b border-white/5 pb-2">
                    <span className="text-slate-400 font-medium">Nomor Invoice</span>
                    <span className="font-mono text-cyan-300 font-bold">{result.invoice}</span>
                  </div>
                  <div className="flex justify-between items-center border-b border-white/5 pb-2">
                    <span className="text-slate-400 font-medium">Tanggal Transaksi</span>
                    <span className="text-white font-semibold">{formatDate(result.date)}</span>
                  </div>
                  <div className="flex justify-between items-center border-b border-white/5 pb-2">
                    <span className="text-slate-400 font-medium">Game</span>
                    <span className="flex items-center gap-2 font-bold text-white uppercase">
                      <img
                        src={getGameAssetByName(result.game)?.icon}
                        alt=""
                        className="h-5 w-5 rounded object-cover"
                      />
                      {result.game}
                    </span>
                  </div>
                  <div className="flex justify-between items-center border-b border-white/5 pb-2">
                    <span className="text-slate-400 font-medium">Item Produk</span>
                    <span className="flex items-center gap-2 font-bold text-white">
                      <span className="flex h-7 w-7 items-center justify-center rounded bg-white p-1">
                        <img
                          src={getItemAssetForProduct(result.product, undefined, result.game)}
                          alt=""
                          className="max-h-full max-w-full object-contain"
                        />
                      </span>
                      {result.product}
                    </span>
                  </div>
                  <div className="flex justify-between items-center border-b border-white/5 pb-2">
                    <span className="text-slate-400 font-medium">User ID Tujuan</span>
                    <span className="font-mono bg-white/5 px-2.5 py-1 rounded text-cyan-100 font-semibold">{result.target_id}</span>
                  </div>
                  <div className="flex justify-between items-center border-b border-white/5 pb-2">
                    <span className="text-slate-400 font-medium">Metode Pembayaran</span>
                    <span className="flex items-center gap-2 font-bold text-white uppercase">
                      {String(result.payment_method || "").toLowerCase().includes("qris") && (
                        <span className="flex h-6 w-10 items-center justify-center rounded bg-white p-1">
                          <img src={paymentAssets.qris} alt="" className="max-h-full max-w-full object-contain" />
                        </span>
                      )}
                      {result.payment_method || "-"}
                    </span>
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
                    <span className="text-lg font-black text-cyan-300">{formatCurrency(result.amount)}</span>
                  </div>
                </div>

                {/* Back Link */}
                <div className="flex justify-center pt-4">
                  <Link href="/history" className="inline-flex items-center gap-2 text-xs font-bold text-slate-400 hover:text-cyan-300 transition duration-300 uppercase tracking-widest hover:translate-x-[-2px]">
                    <ArrowLeft className="h-4 w-4 text-cyan-300" />
                    Kembali ke Riwayat
                  </Link>
                </div>

              </div>
            )}

          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}

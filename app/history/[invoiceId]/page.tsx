"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { SidebarContentWrapper } from "@/components/layout/sidebar-content-wrapper"
import { Skeleton } from "@/components/ui/skeleton"
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

        // 2. Check Database via API
        const res = await fetch(`/api/transactions/check?invoice=${encodeURIComponent(invStr)}`)
        const dataJson = await res.json()

        if (dataJson.error || !dataJson.transaction) {
          setError(dataJson.error || "Transaksi tidak ditemukan. Harap periksa kembali nomor invoice Anda.")
        } else {
          const data = dataJson.transaction
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
    <div className="min-h-screen flex flex-col relative overflow-x-clip text-text-primary">

      <Header />

      <SidebarContentWrapper>
        <main className="flex-1 py-16 px-4 relative z-20 flex items-center justify-center">
          <div className="w-full max-w-xl">

            {/* Section Title */}
            <div className="text-center mb-8">
              <h1 className="text-2xl md:text-3xl font-black uppercase tracking-tight text-text-primary mb-2 flex items-center justify-center gap-2">
                <Receipt className="h-6 w-6 text-sky" />
                Detail Transaksi
              </h1>
              <p className="text-xs font-semibold tracking-wider text-sky uppercase">
                Nomor Invoice: {invoiceId}
              </p>
            </div>

            {/* Glass Card Container */}
            <div className="w-full glass-sky rounded-2xl shadow-sky-glow border-sky-border backdrop-blur-md p-6 md:p-8 relative bg-white/80">
              <div className="absolute top-0 left-0 w-20 h-20 bg-sky/10 rounded-full blur-2xl pointer-events-none" />
              <div className="absolute bottom-0 right-0 w-20 h-20 bg-diamond/10 rounded-full blur-2xl pointer-events-none" />

              {isLoading ? (
                <div className="space-y-6">
                  {/* Visual Status Header bar Skeleton */}
                  <div className="p-4 rounded-xl flex items-center justify-between border bg-slate-50/50 border-sky-border/50">
                    <div className="flex items-center gap-2">
                      <Skeleton className="h-5 w-5 rounded-full bg-sky/10" />
                      <Skeleton className="h-4 w-28 rounded bg-sky/10" />
                    </div>
                    <Skeleton className="h-6 w-20 rounded bg-sky/10" />
                  </div>

                  {/* Details Table Skeleton */}
                  <div className="border border-sky-border rounded-xl bg-ice/40 p-5 space-y-4">
                    {[1, 2, 3, 4, 5, 6].map((i) => (
                      <div key={i} className="flex justify-between items-center border-b border-sky-border/30 pb-2">
                        <Skeleton className="h-4 w-24 rounded bg-sky/10" />
                        <Skeleton className="h-4 w-32 rounded bg-sky/10" />
                      </div>
                    ))}
                  </div>

                  {/* Footer button Skeleton */}
                  <div className="flex justify-center pt-2">
                    <Skeleton className="h-10 w-48 rounded-xl bg-sky/10" />
                  </div>
                </div>
              ) : error ? (
                <div className="space-y-6">
                  <div className="p-4 rounded-xl bg-red-50 border border-red-500/20 text-red-500 text-xs font-semibold flex items-center gap-3 animate-fadeIn">
                    <ShieldAlert className="h-5 w-5 text-red-500 shrink-0" />
                    <span>{error}</span>
                  </div>
                  <div className="flex justify-center">
                    <Link href="/history" className="inline-flex items-center gap-2 text-xs font-bold text-text-secondary hover:text-sky transition duration-300 uppercase tracking-widest">
                      <ArrowLeft className="h-4 w-4" />
                      Kembali ke Riwayat
                    </Link>
                  </div>
                </div>
              ) : (
                <div className="space-y-6 animate-fadeIn">

                  {/* Visual Status Header bar */}
                  <div className={`p-4 rounded-xl flex items-center justify-between border ${
                    result.status === 'success' ? 'bg-emerald-50 border-emerald-500/20' :
                    result.status === 'processing' ? 'bg-amber-50 border-amber-500/20' :
                    result.status === 'pending' ? 'bg-blue-50 border-blue-500/20' :
                    'bg-red-50 border-red-500/20'
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

                  {/* Details Table */}
                  <div className="border border-sky-border rounded-xl bg-ice p-5 space-y-4 text-xs">
                    <div className="flex justify-between items-center border-b border-sky-border/50 pb-2">
                      <span className="text-text-secondary font-medium">Nomor Invoice</span>
                      <span className="font-mono text-sky font-bold">{result.invoice}</span>
                    </div>
                    <div className="flex justify-between items-center border-b border-sky-border/50 pb-2">
                      <span className="text-text-secondary font-medium">Tanggal Transaksi</span>
                      <span className="text-text-primary font-semibold">{formatDate(result.date)}</span>
                    </div>
                    <div className="flex justify-between items-center border-b border-sky-border/50 pb-2">
                      <span className="text-text-secondary font-medium">Game</span>
                      <span className="flex items-center gap-2 font-bold text-text-primary uppercase">
                        <img
                          src={getGameAssetByName(result.game)?.icon}
                          alt=""
                          className="h-5 w-5 rounded object-cover"
                        />
                        {result.game}
                      </span>
                    </div>
                    <div className="flex justify-between items-center border-b border-sky-border/50 pb-2">
                      <span className="text-text-secondary font-medium">Item Produk</span>
                      <span className="flex items-center gap-2 font-bold text-text-primary">
                        <span className="flex h-7 w-7 items-center justify-center rounded bg-white p-1 border border-sky-border/30">
                          <img
                            src={getItemAssetForProduct(result.product, undefined, result.game)}
                            alt=""
                            className="max-h-full max-w-full object-contain"
                          />
                        </span>
                        {result.product}
                      </span>
                    </div>
                    <div className="flex justify-between items-center border-b border-sky-border/50 pb-2">
                      <span className="text-text-secondary font-medium">User ID Tujuan</span>
                      <span className="font-mono bg-ice px-2.5 py-1 rounded text-text-primary font-semibold border border-sky-border/30">{result.target_id}</span>
                    </div>
                    <div className="flex justify-between items-center border-b border-sky-border/50 pb-2">
                      <span className="text-text-secondary font-medium">Metode Pembayaran</span>
                      <span className="flex items-center gap-2 font-bold text-text-primary uppercase">
                        {String(result.payment_method || "").toLowerCase().includes("qris") && (
                          <span className="flex h-6 w-10 items-center justify-center rounded bg-white p-1 border border-sky-border/30">
                            <img src={paymentAssets.qris} alt="" className="max-h-full max-w-full object-contain" />
                          </span>
                        )}
                        {result.payment_method || "-"}
                      </span>
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
                      <span className="text-lg font-black text-sky">{formatCurrency(result.amount)}</span>
                    </div>
                  </div>

                  {/* Back Link */}
                  <div className="flex justify-center pt-4">
                    <Link href="/history" className="inline-flex items-center gap-2 text-xs font-bold text-text-secondary hover:text-sky transition duration-300 uppercase tracking-widest hover:translate-x-[-2px]">
                      <ArrowLeft className="h-4 w-4 text-sky" />
                      Kembali ke Riwayat
                    </Link>
                  </div>

                </div>
              )}

            </div>
          </div>
        </main>

        <Footer />
      </SidebarContentWrapper>
    </div>
  )
}
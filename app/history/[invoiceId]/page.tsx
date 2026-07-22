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

const WhatsappIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    viewBox="0 0 24 24"
    width="16"
    height="16"
    fill="currentColor"
    {...props}
  >
    <path d="M12.012 2c-5.506 0-9.989 4.478-9.99 9.984a9.96 9.96 0 001.37 5.054L2 22l5.077-1.331a9.927 9.927 0 004.93 1.315h.005c5.505 0 9.989-4.478 9.99-9.984 0-2.667-1.037-5.176-2.922-7.062C17.198 3.053 14.686 2 12.012 2zm5.726 14.195c-.3.845-1.5 1.55-2.073 1.65-.5.086-1.15.114-1.85-.114-2.883-1.02-4.743-3.957-4.887-4.148-.144-.19-1.15-1.529-1.15-2.916a2.916 2.916 0 01.865-2.122c.26-.26.577-.327.768-.327.144 0 .288.006.41.012.13.006.3.018.47.42.173.407.605 1.472.656 1.579.052.107.087.23.012.378-.076.15-.116.242-.23.379-.115.13-.242.29-.346.39-.115.11-.237.23-.104.46.133.226.592.977 1.272 1.58.877.78 1.616 1.02 1.84.113.226-.226.502-.605.696-.86.23-.3.467-.256.768-.144.301.11.1.91 1.906.96.225.052.45.1.583.127.133.023.266.113.202.22-.064.108-.362.613-.666 1.458z" />
  </svg>
)

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
  const [waAdminNumber, setWaAdminNumber] = useState("6285856457892")

  useEffect(() => {
    const fetchWaNumber = async () => {
      try {
        const res = await fetch("/api/settings/public")
        const data = await res.json()
        if (data.wa_admin_number) {
          setWaAdminNumber(data.wa_admin_number)
        }
      } catch (err) {
        console.error("Failed to load public WA number:", err)
      }
    }
    fetchWaNumber()
  }, [])

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
            login_method: data.login_method,
            password: data.password,
            request_notes: data.request_notes,
            sn: data.sn || data.provider_ref,
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
    <div className="min-h-screen flex flex-col relative  text-white">

      <Header />

      <SidebarContentWrapper>
        <main className="flex-1 py-16 px-4 relative z-20 flex items-center justify-center">
          <div className="w-full max-w-xl">

            {/* Section Title */}
            <div className="text-center mb-8">
              <h1 className="text-2xl md:text-3xl font-black uppercase tracking-tight text-white mb-2 flex items-center justify-center gap-2">
                <Receipt className="h-6 w-6 text-sky" />
                Detail Transaksi
              </h1>
              <p className="text-xs font-semibold tracking-wider text-sky uppercase">
                Nomor Invoice: {invoiceId}
              </p>
            </div>

            {/* Glass Card Container */}
            <div className="w-full glass-sky rounded-2xl shadow-sky-glow border-sky/30 backdrop-blur-md p-6 md:p-8 relative bg-mist backdrop-blur-md">
              <div className="absolute top-0 left-0 w-20 h-20 bg-sky/10 rounded-full blur-2xl pointer-events-none" />
              <div className="absolute bottom-0 right-0 w-20 h-20 bg-diamond/10 rounded-full blur-2xl pointer-events-none" />

              {isLoading ? (
                <div className="space-y-6">
                  {/* Visual Status Header bar Skeleton */}
                  <div className="p-4 rounded-xl flex items-center justify-between border bg-sky/5/50 border-sky/30">
                    <div className="flex items-center gap-2">
                      <Skeleton className="h-5 w-5 rounded-full bg-sky/10" />
                      <Skeleton className="h-4 w-28 rounded bg-sky/10" />
                    </div>
                    <Skeleton className="h-6 w-20 rounded bg-sky/10" />
                  </div>

                  {/* Details Table Skeleton */}
                  <div className="border border-sky/30 rounded-xl bg-sky/20/40 p-5 space-y-4">
                    {[1, 2, 3, 4, 5, 6].map((i) => (
                      <div key={i} className="flex justify-between items-center border-b border-sky/30 pb-2">
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
                    <AlertTriangle className="h-5 w-5 text-red-500 shrink-0" />
                    <span>{error}</span>
                  </div>
                  <div className="flex justify-center">
                    <Link href="/history" className="inline-flex items-center gap-2 text-xs font-bold text-white/80 hover:text-sky transition duration-300 uppercase tracking-widest">
                      <ArrowLeft className="h-4 w-4" />
                      Kembali ke Riwayat
                    </Link>
                  </div>
                </div>
              ) : result ? (
                <div className="space-y-6 animate-fadeIn">

            {/* Visual Status Header Bar with BOTH Payment & Topup status */}
            <div className="bg-[#183644] border border-sky/30 p-4 rounded-xl space-y-3">
              <div className="flex items-center justify-between border-b border-sky/20 pb-2.5">
                <span className="text-xs font-black uppercase tracking-wider text-white/90">
                  Status Pembayaran
                </span>
                <span className={`px-3 py-1 text-[10px] font-black uppercase tracking-wider rounded-full border ${
                  result.payment_status === 'paid' || result.payment_status === 'settlement' || result.payment_status === 'success'
                    ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                    : result.payment_status === 'failed' || result.payment_status === 'expire' || result.payment_status === 'cancel'
                    ? 'bg-red-500/20 text-red-400 border-red-500/30'
                    : 'bg-amber-500/20 text-amber-400 border-amber-500/30'
                }`}>
                  {result.payment_status === 'paid' || result.payment_status === 'settlement' || result.payment_status === 'success'
                    ? 'Lunas'
                    : result.payment_status === 'failed' || result.payment_status === 'expire' || result.payment_status === 'cancel'
                    ? 'Gagal / Expired'
                    : 'Menunggu Pembayaran'}
                </span>
              </div>

              <div className="flex items-center justify-between pt-0.5">
                <span className="text-xs font-black uppercase tracking-wider text-white/90">
                  Status Topup / Pengiriman
                </span>
                <span className={`px-3 py-1 text-[10px] font-black uppercase tracking-wider rounded-full border ${
                  result.status === 'success' ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' :
                  result.status === 'processing' ? 'bg-amber-500/20 text-amber-400 border-amber-500/30' :
                  result.status === 'pending' ? 'bg-blue-500/20 text-sky border-sky/30' :
                  'bg-red-500/20 text-red-400 border-red-500/30'
                }`}>
                  {result.status === 'success' ? 'Berhasil' :
                   result.status === 'processing' ? 'Diproses' :
                   result.status === 'pending' ? 'Pending' : 'Gagal'}
                </span>
              </div>
            </div>

            {/* Error Detail Callout Box for Failed Transactions */}
            {(result.status === 'failed' || result.payment_status === 'failed') && (
              <div className="bg-red-500/10 border border-red-500/40 p-4 rounded-xl space-y-1.5 text-left">
                <span className="text-[10px] font-black text-red-400 uppercase tracking-widest flex items-center gap-1.5">
                  <AlertTriangle className="h-3.5 w-3.5 text-red-400 shrink-0" />
                  Detail Alasan Transaksi Gagal (Provider / Digiflazz)
                </span>
                <p className="text-xs font-bold text-white leading-relaxed">
                  {result.errorMessage || "Gagal memproses pengiriman ke provider. Silakan periksa kembali format User ID (ID + Zone ID) tujuan Anda atau hubungi Admin via WhatsApp."}
                </p>
              </div>
            )}

            {/* Serial Number (SN / Token PLN / Kode Voucher) Box if available */}
            {result.sn && (
              <div className="bg-emerald-500/10 border border-emerald-500/30 p-4 rounded-xl space-y-2">
                <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest block">
                  Serial Number / Kode Token / SN Voucher
                </span>
                <div className="flex items-center justify-between gap-2">
                  <span className="font-mono text-sm font-black text-white bg-black/40 px-3 py-1.5 rounded-lg border border-emerald-500/30 select-all tracking-wider">
                    {result.sn}
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText(result.sn)
                      alert("SN / Token berhasil disalin!")
                    }}
                    className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-white text-[10px] font-bold rounded-lg transition-colors uppercase shrink-0"
                  >
                    Salin SN
                  </button>
                </div>
              </div>
            )}

                  {/* Details Receipt Table */}
                  <div className="border border-sky/30 rounded-xl bg-[#183644]/90 p-5 space-y-3.5 text-xs shadow-sky-soft">
                    <div className="flex justify-between items-center border-b border-sky/20 pb-2.5">
                      <span className="text-white/80 font-bold uppercase text-[11px] tracking-wider">Nomor Invoice</span>
                      <span className="font-mono text-sky font-black text-sm">{result.invoice}</span>
                    </div>
                    <div className="flex justify-between items-center border-b border-sky/20 pb-2.5">
                      <span className="text-white/80 font-bold uppercase text-[11px] tracking-wider">Tanggal Transaksi</span>
                      <span className="text-white font-extrabold">{formatDate(result.date)}</span>
                    </div>
                    <div className="flex justify-between items-center border-b border-sky/20 pb-2.5">
                      <span className="text-white/80 font-bold uppercase text-[11px] tracking-wider">Game</span>
                      <span className="flex items-center gap-2 font-black text-white uppercase">
                        <img
                          src={getGameAssetByName(result.game)?.icon}
                          alt=""
                          className="h-5 w-5 rounded object-cover"
                        />
                        {result.game}
                      </span>
                    </div>
                    <div className="flex justify-between items-center border-b border-sky/20 pb-2.5">
                      <span className="text-white/80 font-bold uppercase text-[11px] tracking-wider">Item Produk</span>
                      <span className="flex items-center gap-2 font-black text-white">
                        <span className="flex h-7 w-7 items-center justify-center rounded bg-black/40 p-1 border border-sky/30">
                          <img
                            src={getItemAssetForProduct(result.product, undefined, result.game)}
                            alt=""
                            className="max-h-full max-w-full object-contain"
                          />
                        </span>
                        {result.product}
                      </span>
                    </div>
                    <div className="flex justify-between items-center border-b border-sky/20 pb-2.5">
                      <span className="text-white/80 font-bold uppercase text-[11px] tracking-wider">User ID Tujuan</span>
                      <span className="font-mono bg-black/40 px-3 py-1 rounded-lg text-white font-black border border-sky/30 text-xs">{result.target_id}</span>
                    </div>
                    {result.request_notes && (
                      <div className="flex flex-col gap-1 border-b border-sky/20 pb-2.5 text-left">
                        <span className="text-white/80 font-bold uppercase text-[11px] tracking-wider">Catatan Khusus Admin</span>
                        <span className="text-white bg-black/40 p-2.5 rounded-lg border border-sky/30 font-semibold whitespace-pre-wrap leading-relaxed">{result.request_notes}</span>
                      </div>
                    )}
                    <div className="flex justify-between items-center border-b border-sky/20 pb-2.5">
                      <span className="text-white/80 font-bold uppercase text-[11px] tracking-wider">Metode Pembayaran</span>
                      <span className="flex items-center gap-2 font-black text-white uppercase">
                        {String(result.payment_method || "").toLowerCase().includes("qris") && (
                          <span className="flex h-6 w-10 items-center justify-center rounded bg-black/40 p-1 border border-sky/30">
                            <img src={paymentAssets.qris} alt="" className="max-h-full max-w-full object-contain" />
                          </span>
                        )}
                        {result.payment_method || "-"}
                      </span>
                    </div>
                    <div className="flex justify-between items-center border-b border-sky/20 pb-2.5">
                      <span className="text-white/80 font-bold uppercase text-[11px] tracking-wider">Status Pembayaran</span>
                      <span className={`font-black uppercase text-xs ${
                        result.payment_status === 'paid' || result.payment_status === 'settlement' || result.payment_status === 'success' ? 'text-emerald-400' :
                        result.payment_status === 'failed' || result.payment_status === 'expire' ? 'text-red-400' :
                        'text-amber-400'
                      }`}>
                        {result.payment_status === 'paid' || result.payment_status === 'settlement' || result.payment_status === 'success' ? 'LUNAS' :
                         result.payment_status === 'failed' || result.payment_status === 'expire' ? 'GAGAL / EXPIRED' : 'MENUNGGU PEMBAYARAN'}
                      </span>
                    </div>
                    <div className="flex justify-between items-center pt-1.5">
                      <span className="text-white/80 font-bold uppercase text-[11px] tracking-wider">Total Pembayaran</span>
                      <span className="text-xl font-black text-sky font-mono">{formatCurrency(result.amount)}</span>
                    </div>
                  </div>

                  {/* WhatsApp Support Button */}
                  <div className="pt-6 border-t border-sky/30">
                    <a
                      href={`https://wa.me/${waAdminNumber.replace(/[^0-9]/g, "")}?text=Halo%20Admin%20Mitsuru,%20saya%20butuh%20bantuan%20mengenai%20transaksi%20Invoice%20${result.invoice}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-black uppercase tracking-widest py-3 px-4 rounded-xl shadow-sky-soft hover:shadow-sky-medium transition-all duration-300 flex items-center justify-center gap-2"
                    >
                      <WhatsappIcon className="h-4 w-4 shrink-0 fill-white" />
                      Hubungi Admin via WhatsApp
                    </a>
                  </div>

                  {/* Back Link */}
                  <div className="flex justify-center pt-4">
                    <Link href="/history" className="inline-flex items-center gap-2 text-xs font-bold text-white/80 hover:text-sky transition duration-300 uppercase tracking-widest hover:translate-x-[-2px]">
                      <ArrowLeft className="h-4 w-4 text-sky" />
                      Kembali ke Riwayat
                    </Link>
                  </div>

                </div>
              ) : null}

            </div>
          </div>
        </main>

        <Footer />
      </SidebarContentWrapper>
    </div>
  )
}
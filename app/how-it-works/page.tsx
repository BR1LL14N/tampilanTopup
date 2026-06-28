"use client"

import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { SidebarContentWrapper } from "@/components/layout/sidebar-content-wrapper"
import { Card, CardContent } from "@/components/ui/card"
import { HelpCircle, ChevronRight, ShoppingBag, CreditCard, CheckCircle2, QrCode } from "lucide-react"

export default function HowItWorksPage() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col justify-between">
      <Header />
      
      <SidebarContentWrapper>
        <main className="relative z-10 mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8 w-full flex-grow">
          
          <div className="text-center mb-12">
            <h1 className="text-3xl md:text-4xl font-black uppercase tracking-tight text-text-primary mb-3">
              Cara Kerja Mitsuru
            </h1>
            <p className="text-xs font-bold text-text-secondary uppercase tracking-widest max-w-md mx-auto leading-relaxed">
              Membeli kebutuhan game favorit Anda hanya butuh 4 langkah mudah
            </p>
          </div>

          <div className="space-y-8">
            {/* Step cards */}
            <div className="grid md:grid-cols-4 gap-6">
              
              {/* Step 1 */}
              <Card className="rounded-[24px] border-sky-border shadow-sky-soft bg-white text-center p-6 relative">
                <div className="absolute top-4 right-4 text-3xl font-black text-sky/15">01</div>
                <CardContent className="pt-4 flex flex-col items-center">
                  <div className="h-12 w-12 rounded-2xl bg-sky/10 text-sky grid place-items-center mb-4">
                    <ShoppingBag className="h-6 w-6" />
                  </div>
                  <h3 className="font-extrabold text-xs uppercase text-text-primary mb-2">Pilih Game &amp; Isi Data</h3>
                  <p className="text-[11px] text-text-secondary leading-relaxed">
                    Pilih game favorit Anda, tentukan nominal item, isi data ID Akun Game, dan lengkapi nomor WhatsApp aktif Anda.
                  </p>
                </CardContent>
              </Card>

              {/* Step 2 */}
              <Card className="rounded-[24px] border-sky-border shadow-sky-soft bg-white text-center p-6 relative">
                <div className="absolute top-4 right-4 text-3xl font-black text-sky/15">02</div>
                <CardContent className="pt-4 flex flex-col items-center">
                  <div className="h-12 w-12 rounded-2xl bg-sky/10 text-sky grid place-items-center mb-4">
                    <CreditCard className="h-6 w-6" />
                  </div>
                  <h3 className="font-extrabold text-xs uppercase text-text-primary mb-2">Pilih Pembayaran</h3>
                  <p className="text-[11px] text-text-secondary leading-relaxed">
                    Di halaman checkout, pilih jalur pembayaran yang Anda inginkan (QRIS, E-Wallet, atau VA) dan gunakan voucher promo jika ada.
                  </p>
                </CardContent>
              </Card>

              {/* Step 3 */}
              <Card className="rounded-[24px] border-sky-border shadow-sky-soft bg-white text-center p-6 relative">
                <div className="absolute top-4 right-4 text-3xl font-black text-sky/15">03</div>
                <CardContent className="pt-4 flex flex-col items-center">
                  <div className="h-12 w-12 rounded-2xl bg-sky/10 text-sky grid place-items-center mb-4">
                    <QrCode className="h-6 w-6" />
                  </div>
                  <h3 className="font-extrabold text-xs uppercase text-text-primary mb-2">Scan QRIS &amp; Bayar</h3>
                  <p className="text-[11px] text-text-secondary leading-relaxed">
                    Scan kode QRIS dinamis yang muncul di layar Anda atau salin kode pembayaran sebelum batas waktu kedaluwarsa.
                  </p>
                </CardContent>
              </Card>

              {/* Step 4 */}
              <Card className="rounded-[24px] border-sky-border shadow-sky-soft bg-white text-center p-6 relative">
                <div className="absolute top-4 right-4 text-3xl font-black text-sky/15">04</div>
                <CardContent className="pt-4 flex flex-col items-center">
                  <div className="h-12 w-12 rounded-2xl bg-sky/10 text-sky grid place-items-center mb-4">
                    <CheckCircle2 className="h-6 w-6" />
                  </div>
                  <h3 className="font-extrabold text-xs uppercase text-text-primary mb-2">Proses Otomatis &amp; Masuk</h3>
                  <p className="text-[11px] text-text-secondary leading-relaxed">
                    Sistem kami memverifikasi pembayaran secara otomatis, memicu pengiriman item oleh distributor, dan langsung masuk ke akun Anda.
                  </p>
                </CardContent>
              </Card>

            </div>

            {/* Bottom details card */}
            <Card className="rounded-[24px] border-sky-border shadow-sky-soft bg-white">
              <CardContent className="p-8 space-y-4">
                <h3 className="font-black text-sm uppercase text-text-primary">Mengapa memilih proses otomatis?</h3>
                <p className="text-xs text-text-secondary leading-relaxed">
                  Semua transaksi yang dilakukan melalui Mitsuru divalidasi secara real-time oleh server payment gateway kami yang langsung terintegrasi dengan distributor game. Kami tidak melakukan pengisian manual yang lama atau rentan salah ketik. Apabila terdapat kesalahan pengisian karena server utama sedang maintenance, sistem akan otomatis melakukan percobaan pengiriman ulang atau menandainya untuk kami tinjau segera.
                </p>
              </CardContent>
            </Card>
          </div>

        </main>
      </SidebarContentWrapper>

      <Footer />
    </div>
  )
}

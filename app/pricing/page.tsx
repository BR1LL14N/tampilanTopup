"use client"

import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { SidebarContentWrapper } from "@/components/layout/sidebar-content-wrapper"
import { Card, CardContent } from "@/components/ui/card"
import { PiggyBank, BadgePercent, ShieldAlert } from "lucide-react"

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col justify-between">
      <Header />
      
      <SidebarContentWrapper>
        <main className="relative z-10 mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8 w-full flex-grow">
          
          <div className="text-center mb-12">
            <h1 className="text-3xl md:text-4xl font-black uppercase tracking-tight text-text-primary mb-3">
              Kebijakan Harga Mitsuru
            </h1>
            <p className="text-xs font-bold text-text-secondary uppercase tracking-widest max-w-md mx-auto leading-relaxed">
              Kami menjamin transparansi harga, tanpa biaya tersembunyi
            </p>
          </div>

          <div className="space-y-8">
            <Card className="rounded-[24px] border-sky-border shadow-sky-soft bg-white">
              <CardContent className="p-8 space-y-6">
                <p className="text-sm text-text-secondary leading-relaxed">
                  Di Mitsuru, kami berkomitmen untuk selalu memberikan penawaran harga terbaik. Seluruh harga produk diamond, coin, dan voucher game yang Anda lihat di katalog utama kami bersifat **real-time** dan diselaraskan secara instan dengan harga distributor resmi.
                </p>
                <p className="text-sm text-text-secondary leading-relaxed">
                  Kami tidak membebankan biaya keanggotaan rahasia. Semua biaya tambahan (seperti biaya penanganan metode pembayaran) akan ditampilkan secara transparan di halaman checkout sebelum Anda melakukan transfer.
                </p>
              </CardContent>
            </Card>

            <div className="grid md:grid-cols-3 gap-6">
              
              <Card className="rounded-[24px] border-sky-border shadow-sky-soft bg-white">
                <CardContent className="p-6 text-center">
                  <div className="h-12 w-12 rounded-2xl bg-sky/10 text-sky grid place-items-center mx-auto mb-4">
                    <PiggyBank className="h-6 w-6" />
                  </div>
                  <h3 className="font-extrabold text-xs uppercase text-text-primary mb-2">Harga Distributor</h3>
                  <p className="text-[11px] text-text-secondary leading-relaxed">
                    Kami mengambil margin keuntungan yang sangat kecil agar harga jual di platform kami tetap kompetitif dan hemat bagi Anda.
                  </p>
                </CardContent>
              </Card>

              <Card className="rounded-[24px] border-sky-border shadow-sky-soft bg-white">
                <CardContent className="p-6 text-center">
                  <div className="h-12 w-12 rounded-2xl bg-sky/10 text-sky grid place-items-center mx-auto mb-4">
                    <BadgePercent className="h-6 w-6" />
                  </div>
                  <h3 className="font-extrabold text-xs uppercase text-text-primary mb-2">Diskon Promo</h3>
                  <p className="text-[11px] text-text-secondary leading-relaxed">
                    Kami rutin membagikan kode kupon promo potongan harga langsung yang dapat Anda input di halaman checkout.
                  </p>
                </CardContent>
              </Card>

              <Card className="rounded-[24px] border-sky-border shadow-sky-soft bg-white">
                <CardContent className="p-6 text-center">
                  <div className="h-12 w-12 rounded-2xl bg-sky/10 text-sky grid place-items-center mx-auto mb-4">
                    <ShieldAlert className="h-6 w-6" />
                  </div>
                  <h3 className="font-extrabold text-xs uppercase text-text-primary mb-2">Bebas PPN Tambahan</h3>
                  <p className="text-[11px] text-text-secondary leading-relaxed">
                    Harga tertera di katalog kami sudah final. Anda tidak akan dibebankan PPN tambahan 11% lagi saat membayar.
                  </p>
                </CardContent>
              </Card>

            </div>
          </div>

        </main>
      </SidebarContentWrapper>

      <Footer />
    </div>
  )
}

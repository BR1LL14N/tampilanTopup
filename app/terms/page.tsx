"use client"

import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { SidebarContentWrapper } from "@/components/layout/sidebar-content-wrapper"
import { Card, CardContent } from "@/components/ui/card"
import { FileText } from "lucide-react"

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col justify-between">
      <Header />
      
      <SidebarContentWrapper>
        <main className="relative z-10 mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8 w-full flex-grow">
          
          <div className="text-center mb-12">
            <h1 className="text-3xl md:text-4xl font-black uppercase tracking-tight text-text-primary mb-3">
              Syarat &amp; Ketentuan
            </h1>
            <p className="text-xs font-bold text-text-secondary uppercase tracking-widest max-w-md mx-auto leading-relaxed">
              Aturan penggunaan layanan dan perjanjian transaksi di platform Mitsuru
            </p>
          </div>

          <Card className="rounded-[24px] border-sky-border shadow-sky-soft bg-white">
            <CardContent className="p-8 space-y-6 text-sm text-text-secondary leading-relaxed">
              <div className="flex items-center gap-3 mb-4">
                <FileText className="h-6 w-6 text-sky" />
                <h2 className="font-extrabold text-base uppercase text-text-primary">Perjanjian Pengguna</h2>
              </div>
              
              <div className="space-y-4">
                <h3 className="font-extrabold text-xs uppercase text-text-primary">1. Penerimaan Syarat</h3>
                <p className="text-xs">
                  Dengan mengakses dan melakukan pembelian di website Mitsuru, Anda secara sadar setuju untuk terikat oleh seluruh Syarat &amp; Ketentuan yang berlaku di bawah ini. Jika Anda tidak menyetujui bagian mana pun, harap hentikan penggunaan platform segera.
                </p>

                <h3 className="font-extrabold text-xs uppercase text-text-primary">2. Tanggung Jawab Data Pengguna</h3>
                <p className="text-xs">
                  Pengguna bertanggung jawab penuh atas keakuratan data ID Game, Server, Nomor HP, dan email yang diisi pada saat transaksi. Mitsuru tidak bertanggung jawab atas kegagalan transaksi atau kesalahan pengiriman akibat salah ketik data dari pihak pengguna.
                </p>

                <h3 className="font-extrabold text-xs uppercase text-text-primary">3. Transaksi &amp; Pembayaran</h3>
                <p className="text-xs">
                  Seluruh pembayaran menggunakan sistem tagihan Midtrans. Segala bentuk kecurangan transaksi, pembayaran palsu, atau tindakan meretas sistem pembayaran akan langsung dilaporkan ke pihak berwajib dan akun Anda akan diblokir permanen.
                </p>

                <h3 className="font-extrabold text-xs uppercase text-text-primary">4. Batasan Tanggung Jawab</h3>
                <p className="text-xs">
                  Kami tidak bertanggung jawab atas segala kerugian tidak langsung yang ditimbulkan oleh maintenance server game, pembaruan aplikasi pihak ketiga, atau banned akun game yang disebabkan oleh pelanggaran aturan resmi publisher oleh pengguna.
                </p>

                <h3 className="font-extrabold text-xs uppercase text-text-primary">5. Perubahan Syarat</h3>
                <p className="text-xs">
                  Mitsuru berhak mengubah Syarat &amp; Ketentuan ini sewaktu-waktu tanpa pemberitahuan tertulis terlebih dahulu. Syarat yang berlaku adalah versi terbaru yang terbit di halaman ini.
                </p>
              </div>
            </CardContent>
          </Card>

        </main>
      </SidebarContentWrapper>

      <Footer />
    </div>
  )
}

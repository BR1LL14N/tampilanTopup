"use client"

import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { SidebarContentWrapper } from "@/components/layout/sidebar-content-wrapper"
import { Card, CardContent } from "@/components/ui/card"
import { Shield, Sparkles, Zap, Award } from "lucide-react"

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col justify-between">
      <Header />
      
      <SidebarContentWrapper>
        <main className="relative z-10 mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8 w-full flex-grow">
          
          <div className="text-center mb-12">
            <h1 className="text-3xl md:text-4xl font-black uppercase tracking-tight text-text-primary mb-3">
              Tentang Mitsuru Top Up Hub
            </h1>
            <p className="text-xs font-bold text-text-secondary uppercase tracking-widest max-w-md mx-auto leading-relaxed">
              Platform top up game tercepat, termurah, dan terpercaya nomor 1 di Indonesia
            </p>
          </div>

          <div className="space-y-8">
            <Card className="rounded-[24px] border-sky-border shadow-sky-soft bg-white overflow-hidden">
              <CardContent className="p-8 space-y-6">
                <p className="text-sm text-text-secondary leading-relaxed">
                  <strong>Mitsuru</strong> didirikan dengan satu misi sederhana: memberikan pengalaman top up game yang instan, murah, dan aman bagi seluruh gamer di Indonesia. Kami memahami betapa pentingnya kecepatan saat Anda membutuhkan Diamond, UC, atau Voucher untuk kompetisi game Anda. Oleh karena itu, kami membangun infrastruktur otomatisasi canggih yang terhubung langsung dengan penyedia layanan, memastikan pesanan Anda selesai hanya dalam hitungan detik.
                </p>
                <p className="text-sm text-text-secondary leading-relaxed">
                  Dengan dukungan teknologi mutakhir, layanan pelanggan responsif 24/7, dan kerja sama resmi dengan Digiflazz, kami terus berkembang untuk mencakup ratusan judul game populer dari mobile hingga PC.
                </p>
              </CardContent>
            </Card>

            <div className="grid md:grid-cols-2 gap-6">
              <Card className="rounded-[24px] border-sky-border shadow-sky-soft bg-white">
                <CardContent className="p-6 flex items-start gap-4">
                  <div className="h-10 w-10 rounded-xl bg-sky/10 text-sky grid place-items-center shrink-0">
                    <Zap className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-sm text-text-primary uppercase mb-1">Proses Instan 24/7</h3>
                    <p className="text-xs text-text-secondary leading-relaxed">
                      Sistem kami sepenuhnya otomatis. Begitu pembayaran terverifikasi oleh Midtrans, saldo game Anda dikirimkan seketika tanpa perlu persetujuan manual.
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card className="rounded-[24px] border-sky-border shadow-sky-soft bg-white">
                <CardContent className="p-6 flex items-start gap-4">
                  <div className="h-10 w-10 rounded-xl bg-sky/10 text-sky grid place-items-center shrink-0">
                    <Shield className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-sm text-text-primary uppercase mb-1">Keamanan Terjamin</h3>
                    <p className="text-xs text-text-secondary leading-relaxed">
                      Kami menggunakan gateway pembayaran Midtrans yang diawasi oleh Bank Indonesia, memastikan data pembayaran dan kartu kredit Anda aman.
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card className="rounded-[24px] border-sky-border shadow-sky-soft bg-white">
                <CardContent className="p-6 flex items-start gap-4">
                  <div className="h-10 w-10 rounded-xl bg-sky/10 text-sky grid place-items-center shrink-0">
                    <Sparkles className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-sm text-text-primary uppercase mb-1">Harga Termurah</h3>
                    <p className="text-xs text-text-secondary leading-relaxed">
                      Kami memotong jalur distribusi tradisional untuk memberikan harga langsung dari provider utama kepada Anda dengan selisih keuntungan yang sangat tipis.
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card className="rounded-[24px] border-sky-border shadow-sky-soft bg-white">
                <CardContent className="p-6 flex items-start gap-4">
                  <div className="h-10 w-10 rounded-xl bg-sky/10 text-sky grid place-items-center shrink-0">
                    <Award className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-sm text-text-primary uppercase mb-1">Resmi &amp; Legal</h3>
                    <p className="text-xs text-text-secondary leading-relaxed">
                      Seluruh produk yang kami tawarkan adalah legal dan resmi dari publisher game masing-masing. Akun game Anda aman dari banned.
                    </p>
                  </div>
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

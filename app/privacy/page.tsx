"use client"

import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { SidebarContentWrapper } from "@/components/layout/sidebar-content-wrapper"
import { Card, CardContent } from "@/components/ui/card"
import { Shield } from "lucide-react"

export default function PrivacyPage() {
  return (
    <div className="min-h-screen text-text-primary antialiased relative flex flex-col justify-between">
      <Header />
      
      <SidebarContentWrapper>
        <main className="relative z-10 mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8 w-full flex-grow">
          
          <div className="text-center mb-12">
            <h1 className="text-3xl md:text-4xl font-black uppercase tracking-tight text-white mb-3">
              Kebijakan Privasi
            </h1>
            <p className="text-xs font-bold text-white/80 uppercase tracking-widest max-w-md mx-auto leading-relaxed">
              Bagaimana kami menjaga, mengelola, dan melindungi data pribadi Anda
            </p>
          </div>

          <Card className="rounded-[24px] border-sky/30 shadow-sky-soft bg-[#183644]/90 backdrop-blur-md">
            <CardContent className="p-8 space-y-6 text-sm text-white/80 leading-relaxed">
              <div className="flex items-center gap-3 mb-4">
                <Shield className="h-6 w-6 text-sky" />
                <h2 className="font-extrabold text-base uppercase text-white">Perlindungan Data Pribadi</h2>
              </div>
              
              <div className="space-y-4">
                <h3 className="font-extrabold text-xs uppercase text-white">1. Informasi Yang Kami Kumpulkan</h3>
                <p className="text-xs">
                  Kami mengumpulkan data yang diperlukan untuk kelancaran transaksi Anda, termasuk namun tidak terbatas pada: Nama Pengguna, Alamat Email, Nomor WhatsApp, ID Game, dan Riwayat Pembelian Anda.
                </p>

                <h3 className="font-extrabold text-xs uppercase text-white">2. Penggunaan Informasi</h3>
                <p className="text-xs">
                  Semua informasi pribadi yang kami kumpulkan digunakan semata-mata untuk: memproses transaksi pembelian Anda, mengirimkan notifikasi status pesanan via WhatsApp/Email, melakukan audit keamanan berkala, serta meningkatkan kualitas pelayanan kami.
                </p>

                <h3 className="font-extrabold text-xs uppercase text-white">3. Keamanan Data Anda</h3>
                <p className="text-xs">
                  Kami menerapkan enkripsi standar industri (SSL) untuk melindungi data yang dikirimkan antara browser Anda dan server kami. Kami tidak pernah menjual, menyewakan, atau menyebarluaskan data pribadi Anda kepada pihak ketiga mana pun tanpa persetujuan eksplisit dari Anda.
                </p>

                <h3 className="font-extrabold text-xs uppercase text-white">4. Cookies</h3>
                <p className="text-xs">
                  Website kami menggunakan cookies untuk menyimpan sesi login Anda dan mengingat preferensi navigasi Anda agar memberikan pengalaman browsing yang lebih cepat dan nyaman.
                </p>

                <h3 className="font-extrabold text-xs uppercase text-white">5. Hak Akses Anda</h3>
                <p className="text-xs">
                  Anda memiliki hak penuh untuk memperbarui profil Anda melalui menu pengaturan akun di halaman dashboard Anda, atau meminta penghapusan akun Anda secara permanen dengan menghubungi customer support kami.
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

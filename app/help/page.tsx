"use client"

import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { SidebarContentWrapper } from "@/components/layout/sidebar-content-wrapper"
import { Card, CardContent } from "@/components/ui/card"
import { HelpCircle, MessageCircle, AlertCircle, RefreshCw } from "lucide-react"

export default function HelpPage() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col justify-between">
      <Header />
      
      <SidebarContentWrapper>
        <main className="relative z-10 mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8 w-full flex-grow">
          
          <div className="text-center mb-12">
            <h1 className="text-3xl md:text-4xl font-black uppercase tracking-tight text-text-primary mb-3">
              Pusat Bantuan Mitsuru
            </h1>
            <p className="text-xs font-bold text-text-secondary uppercase tracking-widest max-w-md mx-auto leading-relaxed">
              Butuh bantuan dengan pesanan Anda? Customer Service kami siap melayani 24 jam
            </p>
          </div>

          <div className="space-y-8">
            <div className="grid md:grid-cols-2 gap-6">
              
              <Card className="rounded-[24px] border-sky-border shadow-sky-soft bg-white">
                <CardContent className="p-6 space-y-4">
                  <div className="h-10 w-10 rounded-xl bg-sky/10 text-sky grid place-items-center">
                    <MessageCircle className="h-5 w-5" />
                  </div>
                  <h3 className="font-extrabold text-sm text-text-primary uppercase">Hubungi Via WhatsApp</h3>
                  <p className="text-xs text-text-secondary leading-relaxed">
                    Cara tercepat untuk mendapatkan bantuan terkait pesanan tertunda, salah memasukkan ID Akun, atau kendala transaksi lainnya. Hubungi admin WhatsApp kami secara langsung.
                  </p>
                  <a
                    href="https://wa.me/62881026337051"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex h-10 items-center justify-center rounded-xl bg-green-500 hover:bg-green-600 text-white font-extrabold text-xs uppercase px-6 tracking-wider transition-colors"
                  >
                    Chat Admin WhatsApp
                  </a>
                </CardContent>
              </Card>

              <Card className="rounded-[24px] border-sky-border shadow-sky-soft bg-white">
                <CardContent className="p-6 space-y-4">
                  <div className="h-10 w-10 rounded-xl bg-sky/10 text-sky grid place-items-center">
                    <RefreshCw className="h-5 w-5" />
                  </div>
                  <h3 className="font-extrabold text-sm text-text-primary uppercase">Cek Status Transaksi</h3>
                  <p className="text-xs text-text-secondary leading-relaxed">
                    Sebelum menghubungi customer service, Anda juga dapat melakukan pengecekan status transaksi secara mandiri di halaman Riwayat Pembelian Anda. Cukup masukkan nomor invoice Anda.
                  </p>
                  <a
                    href="/check"
                    className="inline-flex h-10 items-center justify-center rounded-xl bg-sky hover:bg-sky-dark text-white font-extrabold text-xs uppercase px-6 tracking-wider transition-colors"
                  >
                    Lacak Pesanan
                  </a>
                </CardContent>
              </Card>

            </div>

            <Card className="rounded-[24px] border-sky-border shadow-sky-soft bg-white">
              <CardContent className="p-8 space-y-4">
                <div className="flex items-center gap-3">
                  <AlertCircle className="h-5 w-5 text-amber-500" />
                  <h3 className="font-extrabold text-sm uppercase text-text-primary">Panduan Penting Sebelum Mengajukan Komplain</h3>
                </div>
                <ul className="list-disc list-inside text-xs text-text-secondary space-y-2 leading-relaxed">
                  <li>Pastikan Anda menyimpan tangkapan layar (screenshot) bukti transfer/pembayaran Anda dari M-Banking atau E-Wallet.</li>
                  <li>Sebutkan selalu <strong>Nomor Invoice</strong> transaksi Anda (misal: INV-2026xxxxxx) kepada Admin kami agar pelacakan data berjalan lebih cepat.</li>
                  <li>Periksa folder Spam email Anda jika tidak menerima struk transaksi digital.</li>
                </ul>
              </CardContent>
            </Card>
          </div>

        </main>
      </SidebarContentWrapper>

      <Footer />
    </div>
  )
}

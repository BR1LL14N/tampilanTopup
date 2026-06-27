"use client"

import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { SidebarContentWrapper } from "@/components/layout/sidebar-content-wrapper"
import { Card, CardContent } from "@/components/ui/card"
import { RefreshCw } from "lucide-react"

export default function RefundPage() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col justify-between">
      <Header />
      
      <SidebarContentWrapper>
        <main className="relative z-10 mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8 w-full flex-grow">
          
          <div className="text-center mb-12">
            <h1 className="text-3xl md:text-4xl font-black uppercase tracking-tight text-text-primary mb-3">
              Kebijakan Pengembalian Dana (Refund)
            </h1>
            <p className="text-xs font-bold text-text-secondary uppercase tracking-widest max-w-md mx-auto leading-relaxed">
              Panduan dan aturan mengenai pengembalian dana atas transaksi di Mitsuru
            </p>
          </div>

          <Card className="rounded-[24px] border-sky-border shadow-sky-soft bg-white">
            <CardContent className="p-8 space-y-6 text-sm text-text-secondary leading-relaxed">
              <div className="flex items-center gap-3 mb-4">
                <RefreshCw className="h-6 w-6 text-sky" />
                <h2 className="font-extrabold text-base uppercase text-text-primary">Syarat Pengembalian Dana</h2>
              </div>
              
              <div className="space-y-4">
                <h3 className="font-extrabold text-xs uppercase text-text-primary">1. Transaksi Selesai Bersifat Final</h3>
                <p className="text-xs">
                  Seluruh produk top up game (diamond, UC, voucher) yang status pengirimannya telah dinyatakan **'Success' (Berhasil)** oleh provider kami bersifat **final** dan tidak dapat dikembalikan dengan alasan apa pun.
                </p>

                <h3 className="font-extrabold text-xs uppercase text-text-primary">2. Refund Atas Kesalahan Sistem</h3>
                <p className="text-xs">
                  Refund 100% penuh dari total belanja Anda akan dilakukan apabila:
                  <ul className="list-disc list-inside mt-2 space-y-1">
                    <li>Terjadi error sistem internal pada platform kami sehingga saldo game tidak dapat dikirimkan sama sekali.</li>
                    <li>Produk game yang Anda pilih sedang mengalami out-of-stock (kehabisan stok) dalam kurun waktu 1x24 jam sejak pembayaran lunas.</li>
                  </ul>
                </p>

                <h3 className="font-extrabold text-xs uppercase text-text-primary">3. Kesalahan ID Akun Pelanggan</h3>
                <p className="text-xs">
                  Jika transaksi gagal/terhambat akibat kesalahan pengisian ID Game oleh Anda (misal ID tidak ditemukan), kami akan mendahulukan opsi **Koreksi Data** (mengubah data ID ke ID yang benar) terlebih dahulu. Jika Anda tetap mengajukan refund, maka biaya administrasi transfer atau potongan biaya payment gateway (jika ada) akan dibebankan kepada Anda.
                </p>

                <h3 className="font-extrabold text-xs uppercase text-text-primary">4. Waktu Proses Refund</h3>
                <p className="text-xs">
                  Proses verifikasi refund membutuhkan waktu maksimal 1x24 jam hari kerja. Pengembalian dana akan ditransfer kembali ke rekening Bank atau E-Wallet yang Anda tunjukkan pada saat verifikasi kepemilikan bukti pembayaran asli kepada Admin CS WhatsApp kami.
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

"use client"

import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { SidebarContentWrapper } from "@/components/layout/sidebar-content-wrapper"
import { Card, CardContent } from "@/components/ui/card"
import { HelpCircle } from "lucide-react"

export default function FAQPage() {
  const faqs = [
    {
      q: "Berapa lama waktu yang dibutuhkan untuk proses Top Up?",
      a: "Umumnya pesanan Anda akan selesai diproses otomatis dalam 10 hingga 60 detik setelah pembayaran terverifikasi oleh sistem payment gateway kami."
    },
    {
      q: "Bagaimana jika saya salah menuliskan ID Akun / Game ID?",
      a: "Jika ID Akun yang Anda masukkan valid milik akun lain, maka top-up akan tetap terkirim ke akun tersebut dan tidak dapat ditarik kembali. Namun, jika ID Akun tidak valid, sistem kami akan menandai transaksi sebagai pending/gagal. Harap segera hubungi CS WhatsApp kami untuk koreksi data."
    },
    {
      q: "Apakah harga di Mitsuru sudah termasuk admin fee?",
      a: "Harga produk yang tertera di halaman utama adalah harga bersih produk. Biaya admin fee/penanganan metode pembayaran akan dihitung secara transparan di halaman pembayaran sesuai jenis pembayaran pilihan Anda (misal QRIS memiliki fee yang berbeda dengan Bank Transfer)."
    },
    {
      q: "Bagaimana cara melakukan konfirmasi pembayaran manual?",
      a: "Anda tidak perlu melakukan konfirmasi manual! Sistem payment gateway kami akan mendeteksi transfer Anda secara otomatis dan langsung mengubah status pesanan Anda menjadi 'paid' seketika."
    },
    {
      q: "Mengapa pesanan saya berstatus pending padahal saldo sudah terpotong?",
      a: "Hal ini biasanya terjadi karena server provider game (seperti Moonton/Garena) atau server Digiflazz sedang mengalami maintenance/antrean padat. Mohon tunggu maksimal 1x24 jam, atau langsung hubungi CS kami dengan melampirkan nomor Invoice Anda."
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col justify-between">
      <Header />
      
      <SidebarContentWrapper>
        <main className="relative z-10 mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8 w-full flex-grow">
          
          <div className="text-center mb-12">
            <h1 className="text-3xl md:text-4xl font-black uppercase tracking-tight text-text-primary mb-3">
              Frequently Asked Questions (FAQ)
            </h1>
            <p className="text-xs font-bold text-text-secondary uppercase tracking-widest max-w-md mx-auto leading-relaxed">
              Temukan jawaban cepat untuk pertanyaan yang paling sering diajukan pelanggan
            </p>
          </div>

          <div className="space-y-6">
            {faqs.map((faq, idx) => (
              <Card key={idx} className="rounded-[24px] border-sky-border shadow-sky-soft bg-white">
                <CardContent className="p-6 space-y-3">
                  <div className="flex gap-3">
                    <HelpCircle className="h-5 w-5 text-sky shrink-0 mt-0.5" />
                    <h3 className="font-extrabold text-sm text-text-primary leading-snug">{faq.q}</h3>
                  </div>
                  <p className="text-xs text-text-secondary pl-8 leading-relaxed">
                    {faq.a}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>

        </main>
      </SidebarContentWrapper>

      <Footer />
    </div>
  )
}

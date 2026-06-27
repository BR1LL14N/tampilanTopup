"use client"

import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { SidebarContentWrapper } from "@/components/layout/sidebar-content-wrapper"
import { Card, CardContent } from "@/components/ui/card"
import { Mail, Phone, MapPin, Globe } from "lucide-react"

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col justify-between">
      <Header />
      
      <SidebarContentWrapper>
        <main className="relative z-10 mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8 w-full flex-grow">
          
          <div className="text-center mb-12">
            <h1 className="text-3xl md:text-4xl font-black uppercase tracking-tight text-text-primary mb-3">
              Hubungi Kami
            </h1>
            <p className="text-xs font-bold text-text-secondary uppercase tracking-widest max-w-md mx-auto leading-relaxed">
              Ada pertanyaan, kerja sama bisnis, atau kritik &amp; saran? Hubungi kontak resmi kami
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            
            {/* Contact info list */}
            <div className="space-y-6">
              <Card className="rounded-[24px] border-sky-border shadow-sky-soft bg-white">
                <CardContent className="p-6 flex items-start gap-4">
                  <div className="h-10 w-10 rounded-xl bg-sky/10 text-sky grid place-items-center shrink-0">
                    <Mail className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-sm text-text-primary uppercase mb-1">Email Resmi</h3>
                    <p className="text-xs text-text-secondary leading-relaxed mb-1">
                      Untuk penawaran kerja sama, kolaborasi, developer API, atau urusan bisnis:
                    </p>
                    <a href="mailto:support@mitsurushop.com" className="text-xs font-bold text-sky hover:underline">
                      support@mitsurushop.com
                    </a>
                  </div>
                </CardContent>
              </Card>

              <Card className="rounded-[24px] border-sky-border shadow-sky-soft bg-white">
                <CardContent className="p-6 flex items-start gap-4">
                  <div className="h-10 w-10 rounded-xl bg-sky/10 text-sky grid place-items-center shrink-0">
                    <Phone className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-sm text-text-primary uppercase mb-1">WhatsApp Customer Service</h3>
                    <p className="text-xs text-text-secondary leading-relaxed mb-1">
                      Untuk komplain pesanan, kendala transaksi, atau petunjuk penggunaan web:
                    </p>
                    <a href="https://wa.me/62881026337051" target="_blank" rel="noopener noreferrer" className="text-xs font-bold text-sky hover:underline">
                      +62 881-0263-37051
                    </a>
                  </div>
                </CardContent>
              </Card>

              <Card className="rounded-[24px] border-sky-border shadow-sky-soft bg-white">
                <CardContent className="p-6 flex items-start gap-4">
                  <div className="h-10 w-10 rounded-xl bg-sky/10 text-sky grid place-items-center shrink-0">
                    <MapPin className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-sm text-text-primary uppercase mb-1">Kantor Utama</h3>
                    <p className="text-xs text-text-secondary leading-relaxed">
                      Mitsuru Shop Office HQ<br />
                      Jl. Mahasiswa Raya No. 45, Kecamatan Lowokwaru,<br />
                      Kota Malang, Jawa Timur, Indonesia.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Quick message card */}
            <Card className="rounded-[24px] border-sky-border shadow-sky-soft bg-white overflow-hidden">
              <CardContent className="p-8 space-y-6">
                <h3 className="font-black text-sm uppercase text-text-primary">Kirim Pesan Feedback</h3>
                <p className="text-xs text-text-secondary leading-relaxed">
                  Kami sangat menghargai masukan dari Anda demi kenyamanan bersama. Anda juga dapat mengirimkan masukan secara langsung melalui halaman dashboard pelanggan di menu <strong>Kritik &amp; Saran</strong> setelah melakukan pendaftaran akun.
                </p>
                <div className="h-32 rounded-2xl bg-sky/5 border border-sky-border/40 grid place-items-center text-center p-4">
                  <span className="text-xs font-bold text-text-secondary">
                    Dashboard Pelanggan Terintegrasi dengan Sistem Tiket Kritik &amp; Saran Otomatis.
                  </span>
                </div>
              </CardContent>
            </Card>

          </div>

        </main>
      </SidebarContentWrapper>

      <Footer />
    </div>
  )
}

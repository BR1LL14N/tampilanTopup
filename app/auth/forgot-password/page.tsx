"use client"

import Link from "next/link"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { ShieldAlert, ArrowLeft, MessageCircle } from "lucide-react"

export default function ForgotPasswordPage() {
  // Clip path style for sky fantasy theme
  const bevelStyle = {
    clipPath: "polygon(12px 0%, calc(100% - 12px) 0%, 100% 12px, 100% calc(100% - 12px), calc(100% - 12px) 100%, 12px 100%, 0% calc(100% - 12px), 0% 12px)"
  }
  const buttonBevelStyle = {
    clipPath: "polygon(8px 0%, calc(100% - 8px) 0%, 100% 8px, 100% calc(100% - 8px), calc(100% - 8px) 100%, 8px 100%, 0% calc(100% - 8px), 0% 8px)"
  }

  return (
    <div className="min-h-screen flex flex-col relative overflow-x-clip bg-gradient-to-b from-mist/50 to-white">
      {/* Background accents */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-sky/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-fantasy/5 rounded-full blur-3xl pointer-events-none" />

      <Header />

      <main className="flex-1 flex items-center justify-center py-20 px-4 relative z-10">
        <div className="w-full max-w-md relative p-[1px] bg-gradient-to-tr from-sky/30 via-sky-border to-fantasy/20 shadow-sky-medium" style={bevelStyle}>
          <div className="bg-white/95 backdrop-blur-md p-8 md:p-10 flex flex-col" style={bevelStyle}>
            
            {/* Header Icon */}
            <div className="flex justify-center mb-6">
              <span className="grid h-16 w-16 place-items-center bg-sky/10 text-sky rounded-2xl border border-sky/20">
                <ShieldAlert className="h-8 w-8" />
              </span>
            </div>

            {/* Title */}
            <h2 className="text-2xl font-black uppercase text-center tracking-tight text-text-primary mb-2">
              Lupa Kata Sandi?
            </h2>
            <p className="text-xs font-bold text-text-muted text-center uppercase tracking-widest mb-6">
              Sistem Pemulihan Akun Mitsuru
            </p>

            {/* Description Box */}
            <div className="space-y-4 text-sm text-text-secondary leading-relaxed mb-8 text-center">
              <p>
                Untuk menjaga keamanan akun Anda, proses pemulihan dan setel ulang kata sandi dilakukan secara manual oleh tim Administrator kami.
              </p>
              <p className="text-xs text-text-muted">
                Silakan hubungi admin dengan melampirkan email akun Anda untuk proses verifikasi identitas dan penyetelan ulang sandi baru.
              </p>
            </div>

            {/* Contact Button */}
            <a 
              href="https://wa.me/628123456789" // Placeholder support number, can be modified in .env later
              target="_blank"
              rel="noopener noreferrer"
              className="relative p-[1px] bg-sky hover:bg-sky-dark transition-all duration-300 mb-4 inline-block text-center"
              style={buttonBevelStyle}
            >
              <span 
                className="bg-sky text-white px-6 py-3 text-xs font-black uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-sky/90 transition-colors"
                style={buttonBevelStyle}
              >
                <MessageCircle className="h-4 w-4" />
                Hubungi Admin via WhatsApp
              </span>
            </a>

            {/* Back to Login */}
            <Link 
              href="/auth/login" 
              className="text-xs font-bold text-text-secondary hover:text-sky uppercase tracking-wider text-center flex items-center justify-center gap-1.5 transition-colors"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              Kembali ke Login
            </Link>

          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}

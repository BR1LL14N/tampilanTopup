import Link from "next/link"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col bg-background relative">
      {/* Mesh Background */}
      <div className="pointer-events-none fixed inset-0 mesh opacity-50 z-0"></div>
      
      <Header />
      
      <main className="flex-1 flex flex-col items-center justify-center text-center p-6 relative z-10 max-w-md mx-auto">
        <h1 className="text-8xl font-extrabold text-white tracking-widest relative">
          404
        </h1>
        <div className="bg-cyan-300 text-ink px-3 py-1 text-xs font-bold rounded uppercase tracking-wider -rotate-12 mt-2">
          Halaman Tidak Ditemukan
        </div>
        <p className="text-slate-300 mt-8 mb-8 text-sm leading-relaxed">
          Mohon maaf, halaman yang Anda cari tidak ditemukan, tidak tersedia, atau telah dihapus dari sistem.
        </p>
        <Link href="/">
          <button className="rounded-lg bg-[#82aeb8] hover:bg-[#82aeb8]/80 px-6 py-3 text-sm font-extrabold text-white transition duration-300 shadow-neon-cyan">
            Kembali ke Beranda
          </button>
        </Link>
      </main>
      
      <Footer />
    </div>
  )
}

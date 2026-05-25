import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
})

export const metadata: Metadata = {
  title: "KampusTopup - Top Up Game Murah & Cepat 24/7",
  description:
    "Top up game favorite kamu dengan harga terbaik. Mobile Legends, Free Fire, PUBG, dan masih banyak lagi. Proses otomatis 24/7.",
  keywords: [
    "top up game",
    "diamond mobile legends",
    "top up free fire",
    "jual diamond",
    "top up murah",
  ],
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="id" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
      </head>
      <body className={`${inter.className} min-h-screen text-slate-100 antialiased`}>
        <div className="relative min-h-screen flex flex-col">
          {/* Mesh Background */}
          <div className="pointer-events-none fixed inset-0 mesh opacity-50" />

          {/* Background Gradient Effects */}
          <div className="fixed top-0 left-1/4 w-96 h-96 bg-cyan-300/10 rounded-full blur-3xl pointer-events-none" />
          <div className="fixed bottom-0 right-1/4 w-96 h-96 bg-slate-300/10 rounded-full blur-3xl pointer-events-none" />

          {/* Content */}
          <div className="relative flex-1">
            {children}
          </div>
        </div>
      </body>
    </html>
  )
}
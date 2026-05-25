import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
})

export const metadata: Metadata = {
  title: "Mitsuru - Top Up Game Murah & Cepat 24/7",
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
    <html lang="id">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
        <script dangerouslySetInnerHTML={{ __html: `
          (function() {
            var theme = localStorage.getItem('theme') || 'dark';
            if (theme === 'dark') {
              document.documentElement.classList.add('dark');
            } else {
              document.documentElement.classList.remove('dark');
            }
          })()
        ` }} />
      </head>
      <body className={`${inter.className} min-h-screen antialiased`}>
        <div className="relative min-h-screen flex flex-col">
          {/* Mesh Background - visible in both themes */}
          <div className="pointer-events-none fixed inset-0 mesh opacity-75 dark:opacity-50 z-0" />

          {/* Background Gradient accents */}
          <div className="fixed top-0 left-1/4 w-96 h-96 bg-cyan-400/8 dark:bg-cyan-300/10 rounded-full blur-3xl pointer-events-none z-0" />
          <div className="fixed bottom-0 right-1/4 w-96 h-96 bg-indigo-400/6 dark:bg-slate-300/10 rounded-full blur-3xl pointer-events-none z-0" />

          {/* Content */}
          <div className="relative flex-1 z-10">
            {children}
          </div>
        </div>
      </body>
    </html>
  )
}
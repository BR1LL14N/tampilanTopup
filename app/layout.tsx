import type { Metadata } from "next"
import { Montserrat, Poppins } from "next/font/google"
import "./globals.css"

const montserrat = Montserrat({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-montserrat",
})

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-poppins",
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
      </head>
      <body className={`${montserrat.variable} ${poppins.variable} min-h-screen antialiased font-body`}>
        <div className="relative min-h-screen flex flex-col">
          {/* Mesh/Topography Background Pattern - Sky Fantasy */}
          <div className="pointer-events-none fixed inset-0 mesh opacity-60 z-0" />

          {/* Background Gradient Accents - Sky Fantasy */}
          <div className="fixed top-0 left-1/4 w-96 h-96 bg-sky-400/10 rounded-full blur-3xl pointer-events-none z-0" />
          <div className="fixed bottom-0 right-1/4 w-96 h-96 bg-sky-300/8 rounded-full blur-3xl pointer-events-none z-0" />
          <div className="fixed top-1/2 right-0 w-64 h-64 bg-fantasy/5 rounded-full blur-3xl pointer-events-none z-0" />

          {/* Floating Sparkle Decorations */}
          <div className="fixed top-20 left-20 w-2 h-2 bg-sky/40 rounded-full blur-sm animate-float pointer-events-none z-0" />
          <div className="fixed top-40 right-32 w-3 h-3 bg-sky/30 rounded-full blur-sm animate-float pointer-events-none z-0" style={{ animationDelay: '1s' }} />
          <div className="fixed bottom-32 left-1/3 w-2 h-2 bg-diamond/30 rounded-full blur-sm animate-float pointer-events-none z-0" style={{ animationDelay: '2s' }} />
          <div className="fixed top-1/3 left-1/2 w-1.5 h-1.5 bg-glow/40 rounded-full blur-sm animate-float pointer-events-none z-0" style={{ animationDelay: '0.5s' }} />

          {/* Content */}
          <div className="relative flex-1 z-10">
            {children}
          </div>
        </div>
      </body>
    </html>
  )
}
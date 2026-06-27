import type { Metadata } from "next"
import { Montserrat, Poppins } from "next/font/google"
import "./globals.css"
import PWARegister from "@/components/pwa-register"

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

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://mitsurushop.com"

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Mitsuru - Top Up Game Murah, Cepat & Terpercaya 24/7",
    template: "%s | Mitsuru Top Up Hub"
  },
  description:
    "Top up game favorit kamu dengan harga termurah, aman, dan proses instan otomatis 24 jam. Beli Diamond Mobile Legends, Free Fire UC PUBG Mobile, dan game lainnya.",
  keywords: [
    "top up game",
    "top up game murah",
    "diamond mobile legends murah",
    "top up free fire",
    "jual diamond ml",
    "top up ml murah",
    "pubg uc murah",
    "valorant points",
    "mitsuru",
    "mitsuru topup",
    "top up game otomatis",
    "tempat top up game termurah"
  ],
  authors: [{ name: "Mitsuru Team", url: siteUrl }],
  creator: "Mitsuru",
  publisher: "Mitsuru",
  alternates: {
    canonical: "/",
  },
  manifest: "/site.webmanifest",
  icons: {
    icon: [
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon.ico" }
    ],
    shortcut: "/favicon.ico",
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" }
    ]
  },
  openGraph: {
    title: "Mitsuru - Top Up Game Murah & Cepat 24/7",
    description: "Top up game favorit kamu dengan harga termurah, aman, dan proses instan otomatis 24 jam. Beli Diamond Mobile Legends, Free Fire UC PUBG Mobile, dan game lainnya.",
    url: siteUrl,
    siteName: "Mitsuru Top Up Hub",
    locale: "id_ID",
    type: "website",
    images: [
      {
        url: "/logo.png",
        width: 1200,
        height: 630,
        alt: "Mitsuru Top Up Hub Banner"
      }
    ]
  },
  twitter: {
    card: "summary_large_image",
    title: "Mitsuru - Top Up Game Murah & Cepat 24/7",
    description: "Top up game favorit kamu dengan harga termurah, aman, dan proses instan otomatis 24 jam.",
    images: ["/logo.png"]
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    }
  },
  applicationName: "Mitsuru Top Up Hub",
  appleWebApp: {
    capable: true,
    title: "Mitsuru",
    statusBarStyle: "default"
  }
}

// Global JSON-LD Schema Markup
const jsonLdWebsite = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  "name": "Mitsuru Top Up Hub",
  "url": siteUrl,
  "description": "Top up game favorit kamu dengan harga termurah, aman, dan proses instan otomatis 24 jam. Beli Diamond Mobile Legends, Free Fire UC PUBG Mobile, dan game lainnya.",
  "potentialAction": {
    "@type": "SearchAction",
    "target": `${siteUrl}/?search={search_term_string}`,
    "query-input": "required name=search_term_string"
  }
}

const jsonLdOrganization = {
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "Mitsuru",
  "url": siteUrl,
  "logo": `${siteUrl}/logo.png`,
  "contactPoint": {
    "@type": "ContactPoint",
    "telephone": "+62-812-3456-7890",
    "contactType": "customer service",
    "email": "support@mitsurutopup.com",
    "availableLanguage": ["Indonesian", "English"]
  }
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="id" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdWebsite) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdOrganization) }}
        />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var userStored = sessionStorage.getItem('topup_cached_user');
                  if (userStored) {
                    document.documentElement.classList.add('has-user');
                    var sidebarCollapsed = localStorage.getItem('topup_sidebar_collapsed');
                    if (sidebarCollapsed === 'true') {
                      document.documentElement.classList.add('sidebar-collapsed');
                      document.documentElement.classList.remove('sidebar-expanded');
                    } else {
                      document.documentElement.classList.add('sidebar-expanded');
                      document.documentElement.classList.remove('sidebar-collapsed');
                    }
                  } else {
                    document.documentElement.classList.add('no-user');
                    document.documentElement.classList.remove('has-user', 'sidebar-collapsed', 'sidebar-expanded');
                  }
                } catch (e) {}
              })();
            `
          }}
        />
      </head>
      <body className={`${montserrat.variable} ${poppins.variable} min-h-screen antialiased font-body`}>
        <PWARegister />
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
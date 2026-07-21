"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Instagram, Facebook, Youtube } from "lucide-react"

const WhatsappIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    viewBox="0 0 24 24"
    width="16"
    height="16"
    fill="currentColor"
    {...props}
  >
    <path d="M12.012 2c-5.506 0-9.989 4.478-9.99 9.984a9.96 9.96 0 001.37 5.054L2 22l5.077-1.331a9.927 9.927 0 004.93 1.315h.005c5.505 0 9.989-4.478 9.99-9.984 0-2.667-1.037-5.176-2.922-7.062C17.198 3.053 14.686 2 12.012 2zm5.726 14.195c-.3.845-1.5 1.55-2.073 1.65-.5.086-1.15.114-1.85-.114-2.883-1.02-4.743-3.957-4.887-4.148-.144-.19-1.15-1.529-1.15-2.916a2.916 2.916 0 01.865-2.122c.26-.26.577-.327.768-.327.144 0 .288.006.41.012.13.006.3.018.47.42.173.407.605 1.472.656 1.579.052.107.087.23.012.378-.076.15-.116.242-.23.379-.115.13-.242.29-.346.39-.115.11-.237.23-.104.46.133.226.592.977 1.272 1.58.877.78 1.616 1.02 1.84.113.226-.226.502-.605.696-.86.23-.3.467-.256.768-.144.301.11.1.91 1.906.96.225.052.45.1.583.127.133.023.266.113.202.22-.064.108-.362.613-.666 1.458z" />
  </svg>
)

const TiktokIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" {...props}>
    <path d="M16.6 5.82s.51.5 0 0A4.278 4.278 0 0115.54 3h-3.09v12.4a2.592 2.592 0 01-2.59 2.5c-1.42 0-2.6-1.16-2.6-2.6 0-1.72 1.66-3.01 3.37-2.48V9.66c-3.45-.46-6.47 2.22-6.47 5.64 0 3.33 2.76 5.7 5.69 5.7 3.14 0 5.69-2.55 5.69-5.7V9.01a7.35 7.35 0 004.3 1.38V7.3s-1.88.09-3.24-1.48z" />
  </svg>
)

export function Footer() {
  const currentYear = new Date().getFullYear()

  const [waAdminNumber, setWaAdminNumber] = useState("6281234567890")
  const [siteInfo, setSiteInfo] = useState({
    logoUrl: "",
    legalName: "",
    address: "",
    instagram: "",
    tiktok: "",
    facebook: "",
    youtube: "",
  })

  useEffect(() => {
    const fetchPublicSettings = async () => {
      try {
        const res = await fetch("/api/settings/public")
        const data = await res.json()
        if (data.wa_admin_number) {
          setWaAdminNumber(data.wa_admin_number)
        }
        setSiteInfo({
          logoUrl: data.logo_url || "",
          legalName: data.business_legal_name || "",
          address: data.business_address || "",
          instagram: data.social_instagram || "",
          tiktok: data.social_tiktok || "",
          facebook: data.social_facebook || "",
          youtube: data.social_youtube || "",
        })
      } catch (err) {
        console.error("Failed to load public settings for footer:", err)
      }
    }
    fetchPublicSettings()
  }, [])

  const footerLinks = {
    product: [
      { label: "Tentang Kami", href: "/about" },
      { label: "Cara Kerja", href: "/how-it-works" },
      { label: "Harga", href: "/pricing" },
    ],
    support: [
      { label: "Pusat Bantuan", href: "/help" },
      { label: "Kontak", href: "/contact" },
      { label: "FAQ", href: "/faq" },
    ],
    legal: [
      { label: "Syarat & Ketentuan", href: "/terms" },
      { label: "Privasi", href: "/privacy" },
      { label: "Refund Policy", href: "/refund" },
    ],
  }

  return (
    <footer className="relative mt-8 border-t border-sky/20 footer-stripes-teal py-6 shadow-2xl text-white">
      {/* Cloud decoration - subtle */}
      <div className="absolute bottom-0 left-0 w-full h-10 opacity-5 pointer-events-none overflow-hidden">
        <div className="absolute bottom-0 left-1/4 w-32 h-10 bg-white rounded-full blur-xl" />
        <div className="absolute bottom-0 right-1/3 w-24 h-8 bg-white rounded-full blur-lg" />
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 items-start">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1 space-y-2">
            <Link href="/" className="flex items-center gap-2.5 group">
              <div className="h-8 w-8 rounded-lg overflow-hidden bg-white/5 border border-white/10 shadow group-hover:border-white/30 transition-all duration-300">
                <img src={siteInfo.logoUrl || "/mitsuru.png"} alt="Mitsuru Logo" className="h-full w-full object-cover" />
              </div>
              <span>
                <span className="block text-left text-sm font-extrabold tracking-wide text-white group-hover:text-sky transition-colors">Mitsuru</span>
              </span>
            </Link>
            <p className="text-xs text-white/60 leading-relaxed max-w-xs">
              Top up game favorite kamu dengan harga terbaik dan proses otomatis 24/7.
            </p>
            <div className="flex gap-2 flex-wrap pt-1">
              <a
                href={siteInfo.instagram || "https://www.instagram.com/mitsurushopcom"}
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-7 w-7 items-center justify-center rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 transition-colors text-white/60 hover:text-white"
                title="Instagram"
              >
                <Instagram className="h-3.5 w-3.5" />
              </a>
              <a
                href={`https://wa.me/${waAdminNumber.replace(/[^0-9]/g, "")}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-7 w-7 items-center justify-center rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 transition-colors text-white/60 hover:text-white"
                title="WhatsApp Admin"
              >
                <WhatsappIcon className="h-3.5 w-3.5 shrink-0 fill-current" />
              </a>
              {siteInfo.tiktok && (
                <a
                  href={siteInfo.tiktok}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex h-7 w-7 items-center justify-center rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 transition-colors text-white/60 hover:text-white"
                  title="TikTok"
                >
                  <TiktokIcon className="h-3.5 w-3.5 shrink-0 fill-current" />
                </a>
              )}
              {siteInfo.facebook && (
                <a
                  href={siteInfo.facebook}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex h-7 w-7 items-center justify-center rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 transition-colors text-white/60 hover:text-white"
                  title="Facebook"
                >
                  <Facebook className="h-3.5 w-3.5" />
                </a>
              )}
              {siteInfo.youtube && (
                <a
                  href={siteInfo.youtube}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex h-7 w-7 items-center justify-center rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 transition-colors text-white/60 hover:text-white"
                  title="YouTube"
                >
                  <Youtube className="h-3.5 w-3.5" />
                </a>
              )}
            </div>
          </div>

          {/* Product */}
          <div>
            <h4 className="text-xs font-black uppercase tracking-wider mb-2.5 text-white">Produk</h4>
            <ul className="space-y-1.5">
              {footerLinks.product.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-xs text-white/60 hover:text-white transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="text-xs font-black uppercase tracking-wider mb-2.5 text-white">Bantuan</h4>
            <ul className="space-y-1.5">
              {footerLinks.support.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-xs text-white/60 hover:text-white transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="text-xs font-black uppercase tracking-wider mb-2.5 text-white">Legal</h4>
            <ul className="space-y-1.5">
              {footerLinks.legal.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-xs text-white/60 hover:text-white transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-5 pt-3 border-t border-white/10 text-center space-y-1">
          {siteInfo.legalName && (
            <p className="text-[11px] text-white/50 font-semibold">{siteInfo.legalName}</p>
          )}
          {siteInfo.address && (
            <p className="text-[10px] text-white/35 max-w-md mx-auto leading-relaxed">{siteInfo.address}</p>
          )}
          <p className="text-xs text-white/40">
            &copy; {currentYear} Mitsuru. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}
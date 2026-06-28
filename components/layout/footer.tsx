"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Instagram } from "lucide-react"

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

export function Footer() {
  const currentYear = new Date().getFullYear()
  
  const [waAdminNumber, setWaAdminNumber] = useState("6281234567890")

  useEffect(() => {
    const fetchWaNumber = async () => {
      try {
        const res = await fetch("/api/settings/public")
        const data = await res.json()
        if (data.wa_admin_number) {
          setWaAdminNumber(data.wa_admin_number)
        }
      } catch (err) {
        console.error("Failed to load public WA number for footer:", err)
      }
    }
    fetchWaNumber()
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
    <footer className="relative mt-10 border-t border-sky-border bg-mist py-8">
      {/* Cloud decoration */}
      <div className="absolute bottom-0 left-0 w-full h-16 opacity-20 pointer-events-none overflow-hidden">
        <div className="absolute bottom-0 left-1/4 w-32 h-16 bg-white rounded-full blur-xl" />
        <div className="absolute bottom-0 right-1/3 w-24 h-12 bg-white rounded-full blur-lg" />
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="flex items-center gap-3 mb-4 group">
              <div className="h-10 w-10 rounded-lg overflow-hidden bg-white border border-sky-border shadow-sky-soft group-hover:border-sky/50 group-hover:shadow-sky-medium transition-all duration-300">
                <img src="/mitsuru.png" alt="Mitsuru Logo" className="h-full w-full object-cover" />
              </div>
              <span>
                <span className="block text-left text-base font-extrabold tracking-wide text-text-primary group-hover:text-sky transition-colors">Mitsuru</span>
              </span>
            </Link>
            <p className="text-sm text-text-secondary mb-4">
              Top up game favorite kamu dengan harga terbaik dan proses otomatis 24/7.
            </p>
            <div className="flex gap-3">
              <a
                href="https://www.instagram.com/mitsurushopcom"
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-9 w-9 items-center justify-center rounded-lg bg-white border border-sky-border hover:bg-sky/5 hover:border-sky/30 transition-colors text-text-secondary hover:text-sky"
                title="Instagram"
              >
                <Instagram className="h-4 w-4" />
              </a>
              <a
                href={`https://wa.me/${waAdminNumber.replace(/[^0-9]/g, "")}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-9 w-9 items-center justify-center rounded-lg bg-white border border-sky-border hover:bg-sky/5 hover:border-sky/30 transition-colors text-text-secondary hover:text-sky"
                title="WhatsApp Admin"
              >
                <WhatsappIcon className="h-4 w-4 shrink-0 fill-current" />
              </a>
            </div>
          </div>

          {/* Product */}
          <div>
            <h4 className="font-extrabold mb-4 text-text-primary">Produk</h4>
            <ul className="space-y-2">
              {footerLinks.product.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-text-secondary hover:text-sky transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="font-extrabold mb-4 text-text-primary">Bantuan</h4>
            <ul className="space-y-2">
              {footerLinks.support.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-text-secondary hover:text-sky transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="font-extrabold mb-4 text-text-primary">Legal</h4>
            <ul className="space-y-2">
              {footerLinks.legal.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-text-secondary hover:text-sky transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-sky-border text-center">
          <p className="text-sm text-text-muted">
            &copy; {currentYear} Mitsuru. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}
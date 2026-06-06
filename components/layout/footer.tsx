import Link from "next/link"
import { Github, Twitter, Instagram, Gamepad2 } from "lucide-react"

export function Footer() {
  const currentYear = new Date().getFullYear()

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
                href="#"
                className="flex h-9 w-9 items-center justify-center rounded-lg bg-white border border-sky-border hover:bg-sky/5 hover:border-sky/30 transition-colors text-text-secondary hover:text-sky"
              >
                <Twitter className="h-4 w-4" />
              </a>
              <a
                href="#"
                className="flex h-9 w-9 items-center justify-center rounded-lg bg-white border border-sky-border hover:bg-sky/5 hover:border-sky/30 transition-colors text-text-secondary hover:text-sky"
              >
                <Instagram className="h-4 w-4" />
              </a>
              <a
                href="#"
                className="flex h-9 w-9 items-center justify-center rounded-lg bg-white border border-sky-border hover:bg-sky/5 hover:border-sky/30 transition-colors text-text-secondary hover:text-sky"
              >
                <Github className="h-4 w-4" />
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
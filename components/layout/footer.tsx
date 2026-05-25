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
    <footer className="relative mt-10 border-t border-white/10 px-4 py-8">
      <div className="mx-auto max-w-7xl">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <span className="grid h-10 w-10 place-items-center rounded-lg bg-cyan-300 text-ink">
                <Gamepad2 className="h-6 w-6" />
              </span>
              <span>
                <span className="block text-left text-base font-extrabold tracking-wide">KampusTopup</span>
              </span>
            </Link>
            <p className="text-sm text-slate-400 mb-4">
              Top up game favorite kamu dengan harga terbaik dan proses otomatis 24/7.
            </p>
            <div className="flex gap-3">
              <a
                href="#"
                className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/5 hover:bg-cyan-300/20 transition-colors"
              >
                <Twitter className="h-4 w-4" />
              </a>
              <a
                href="#"
                className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/5 hover:bg-cyan-300/20 transition-colors"
              >
                <Instagram className="h-4 w-4" />
              </a>
              <a
                href="#"
                className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/5 hover:bg-cyan-300/20 transition-colors"
              >
                <Github className="h-4 w-4" />
              </a>
            </div>
          </div>

          {/* Product */}
          <div>
            <h4 className="font-extrabold mb-4">Produk</h4>
            <ul className="space-y-2">
              {footerLinks.product.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-slate-400 hover:text-cyan-200 transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="font-extrabold mb-4">Bantuan</h4>
            <ul className="space-y-2">
              {footerLinks.support.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-slate-400 hover:text-cyan-200 transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="font-extrabold mb-4">Legal</h4>
            <ul className="space-y-2">
              {footerLinks.legal.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-slate-400 hover:text-cyan-200 transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-white/10 text-center">
          <p className="text-sm text-slate-500">
            &copy; {currentYear} KampusTopup. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}
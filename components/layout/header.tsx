"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  Zap,
  Menu,
  UserRoundPlus,
  User,
  LogOut,
  LayoutDashboard,
} from "lucide-react"
import { useState } from "react"
import { cn } from "@/lib/utils"

interface HeaderProps {
  user?: {
    name: string
    email: string
    role: string
  } | null
}

export function Header({ user }: HeaderProps) {
  const pathname = usePathname()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const navLinks = [
    { href: "/", label: "Topup", view: "home" },
    { href: "/check", label: "Cek Transaksi", view: "track" },
    { href: "/leaderboard", label: "Leaderboard", view: "leaderboard" },
    { href: "/calculator", label: "Kalkulator", view: "calculator" },
    { href: "/dashboard", label: "Dashboard", view: "dashboard" },
    { href: "/admin", label: "Admin", view: "admin" },
  ]

  const isActive = (href: string) => href === "/" ? pathname === "/" : pathname.startsWith(href)

  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/10 bg-ink/80 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center gap-3 px-4 py-3 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link href="/" className="group flex items-center gap-3">
          <span className="grid h-10 w-10 place-items-center rounded-lg bg-cyan-300 text-ink">
            <Zap className="h-5 w-5" />
          </span>
          <span>
            <span className="block text-left text-base font-extrabold tracking-wide">KampusTopup</span>
            <span className="block text-left text-xs text-slate-400">Topup preview</span>
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="ml-auto hidden items-center gap-2 lg:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "nav-btn rounded-lg border border-transparent px-3 py-2 text-sm font-semibold text-slate-300 transition hover:text-white",
                isActive(link.href) && "nav-active"
              )}
            >
              {link.label}
            </Link>
          ))}
          <Link
            href="/invoice"
            className="nav-btn rounded-lg border border-cyan-300/25 bg-cyan-300/10 px-3 py-2 text-sm font-semibold text-cyan-100 transition hover:bg-cyan-300/15"
          >
            Invoice
          </Link>
        </nav>

        {/* Right Section */}
        <div className="flex items-center gap-2">
          {user ? (
            <>
              {user.role === "admin" && (
                <Link href="/admin">
                  <button className="nav-btn rounded-lg border border-transparent p-2 text-slate-300 transition hover:text-white">
                    <LayoutDashboard className="h-5 w-5" />
                  </button>
                </Link>
              )}
              <Link href="/dashboard">
                <button className="nav-btn flex items-center gap-2 rounded-lg border border-transparent px-3 py-2 text-sm font-semibold text-slate-300 transition hover:text-white">
                  <User className="h-4 w-4" />
                  <span className="hidden sm:inline">{user.name}</span>
                </button>
              </Link>
              <button className="nav-btn rounded-lg border border-transparent p-2 text-slate-300 transition hover:text-white">
                <LogOut className="h-5 w-5" />
              </button>
            </>
          ) : (
            <>
              <Link href="/auth/login">
                <button className="hidden items-center gap-2 rounded-lg border border-white/10 bg-white px-4 py-2 text-sm font-bold text-ink transition hover:bg-cyan-100 sm:flex">
                  <UserRoundPlus className="h-4 w-4" />
                  Masuk
                </button>
              </Link>
            </>
          )}

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="ml-auto rounded-lg border border-white/10 p-2 text-slate-300 lg:hidden"
            aria-label="Buka menu"
          >
            <Menu className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="border-t border-white/10 px-4 pb-4 lg:hidden">
          <div className="grid grid-cols-2 gap-2 pt-3">
            {navLinks.slice(0, 4).map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "nav-btn rounded-lg border border-transparent px-3 py-2 text-sm font-semibold text-slate-300",
                  isActive(link.href) && "nav-active"
                )}
                onClick={() => setMobileMenuOpen(false)}
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      )}
    </header>
  )
}
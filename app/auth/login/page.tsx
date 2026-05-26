"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Eye, EyeOff, Loader2, ArrowLeft } from "lucide-react"
import { createClient } from "@/lib/supabase/client"

// Beautiful gaming wallpapers for rotating backgrounds
const wallpapers = [
  "https://images.unsplash.com/photo-1542751110-97427bbecf20?auto=format&fit=crop&w=1920&q=80",
  "https://images.unsplash.com/photo-1538481199705-c710c4e965fc?auto=format&fit=crop&w=1920&q=80",
  "https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&w=1920&q=80",
  "https://images.unsplash.com/photo-1612287230202-1bf1d85d1bdf?auto=format&fit=crop&w=1920&q=80"
]

export default function LoginPage() {
  const router = useRouter()
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [oauthLoading, setOauthLoading] = useState<"google" | "discord" | null>(null)
  const [error, setError] = useState("")
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  })
  
  // Background rotating state
  const [bgIndex, setBgIndex] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setBgIndex((prev) => (prev + 1) % wallpapers.length)
    }, 6000)
    return () => clearInterval(interval)
  }, [])

  const supabase = createClient()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    try {
      const { error: authError } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password,
      })

      if (authError) throw authError

      router.push("/dashboard")
      router.refresh()
    } catch (err: any) {
      setError(err.message || "Login gagal. Silakan periksa email dan password Anda.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleOAuth = async (provider: "google" | "discord") => {
    setOauthLoading(provider)
    setError("")
    try {
      const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || window.location.origin
      const { error: oauthError } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${siteUrl}/auth/callback`,
        },
      })
      if (oauthError) throw oauthError
    } catch (err: any) {
      setError(err.message || `Login dengan ${provider} gagal.`)
      setOauthLoading(null)
    }
  }

  // Clip path polygon string for beveled corners (hexagonal style)
  const bevelStyle = {
    clipPath: "polygon(10px 0%, calc(100% - 10px) 0%, 100% 10px, 100% calc(100% - 10px), calc(100% - 10px) 100%, 10px 100%, 0% calc(100% - 10px), 0% 10px)"
  }

  const inputBevelStyle = {
    clipPath: "polygon(8px 0%, calc(100% - 8px) 0%, 100% 8px, 100% calc(100% - 8px), calc(100% - 8px) 100%, 8px 100%, 0% calc(100% - 8px), 0% 8px)"
  }

  const tabBevelStyle = {
    clipPath: "polygon(6px 0%, calc(100% - 6px) 0%, 100% 6px, 100% 100%, 0% 100%)"
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden bg-ink">

      {/* Background Rotating Images with smooth cross-fade (Midpoint visibility) */}
      <div className="absolute inset-0 z-0">
        {wallpapers.map((url, index) => (
          <div
            key={url}
            className="absolute inset-0 bg-cover bg-center transition-opacity duration-1500 ease-in-out"
            style={{
              backgroundImage: `url(${url})`,
              opacity: bgIndex === index ? 0.45 : 0,
            }}
          />
        ))}
        {/* Dark overlay & grid lines to match theme (Midpoint overlay darkness to reveal details without being too bright) */}
        <div className="absolute inset-0 bg-gradient-to-b from-ink/85 via-ink/55 to-ink/90 z-10" />
        <div className="pointer-events-none absolute inset-0 mesh opacity-40 z-10" />
      </div>

      {/* Main Glass login card */}
      <div className="w-full max-w-4xl glass relative z-20 overflow-hidden rounded-2xl shadow-neon-cyan border-white/10 backdrop-blur-md flex flex-col md:flex-row">
        
        {/* Decorative corner glows */}
        <div className="absolute top-0 left-0 w-24 h-24 bg-cyan-300/10 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-24 h-24 bg-blue-500/10 rounded-full blur-2xl pointer-events-none" />

        {/* Tab switchers at the top absolute container */}
        <div className="absolute top-0 left-6 flex z-30 items-center">
          <button
            className="px-6 py-2.5 bg-cyan-300 text-ink font-bold text-sm tracking-wide shadow-lg shadow-cyan-300/10 shimmer-hover"
            style={tabBevelStyle}
          >
            Sign in
          </button>
          <Link href="/auth/register">
            <button
              className="px-6 py-2.5 bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white font-bold text-sm tracking-wide transition border-r border-white/5 shimmer-hover"
              style={tabBevelStyle}
            >
              Register
            </button>
          </Link>
          <Link href="/">
            <button
              className="px-5 py-2 ml-2 bg-slate-900/80 hover:bg-slate-800 text-slate-400 hover:text-cyan-300 font-bold text-xs tracking-wide transition border border-white/10 hover:border-cyan-300/20 flex items-center gap-1.5 shadow-md shimmer-hover"
              style={tabBevelStyle}
              title="Kembali ke Beranda"
            >
              <ArrowLeft className="h-3.5 w-3.5 text-cyan-400" />
              Kembali
            </button>
          </Link>
        </div>

        {/* Left Column: Form Content */}
        <div className="flex-1 p-8 md:p-12 pt-16 md:pt-20">
          <div className="mb-8">
            <h2 className="text-3xl font-black tracking-tight text-white mb-2 uppercase bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">
              Welcome Back!
            </h2>
            <p className="text-xs tracking-wider text-cyan-300 font-semibold uppercase">
              Ready to top up your favorite games?
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-500 text-xs font-semibold animate-fadeIn">
                {error}
              </div>
            )}

            {/* Email field */}
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-300 block">
                Your email <span className="text-cyan-300">*</span>
              </label>
              <div
                className="relative p-[1px] bg-gradient-to-r from-white/10 to-white/5 focus-within:from-cyan-300 focus-within:to-cyan-400 transition-all duration-300"
                style={inputBevelStyle}
              >
                <input
                  id="email"
                  type="email"
                  placeholder="name@email.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full bg-slate-950/80 px-4 py-2.5 text-white placeholder-slate-500 outline-none border-none text-sm transition-colors duration-200"
                  style={inputBevelStyle}
                  required
                />
              </div>
            </div>

            {/* Password field */}
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-300 block">
                Your password <span className="text-cyan-300">*</span>
              </label>
              <div
                className="relative p-[1px] bg-gradient-to-r from-white/10 to-white/5 focus-within:from-cyan-300 focus-within:to-cyan-400 transition-all duration-300"
                style={inputBevelStyle}
              >
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="w-full bg-slate-950/80 pl-4 pr-12 py-2.5 text-white placeholder-slate-500 outline-none border-none text-sm transition-colors duration-200"
                    style={inputBevelStyle}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white transition"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
            </div>

            {/* Remember & Forgot options */}
            <div className="flex items-center justify-between text-xs font-semibold">
              <label className="flex items-center gap-2 text-slate-400 cursor-pointer select-none hover:text-white transition">
                <input
                  type="checkbox"
                  className="rounded border-white/10 bg-slate-950 text-cyan-300 focus:ring-0 focus:ring-offset-0 cursor-pointer"
                />
                Remember me
              </label>
              <Link href="/auth/forgot-password" className="text-cyan-300 hover:text-cyan-200 transition">
                I forgot my password
              </Link>
            </div>

            {/* Submit Button */}
            <div
              className="relative p-[1px] bg-gradient-to-r from-cyan-300/40 to-blue-500/40 hover:from-cyan-300 hover:to-blue-500 transition-all duration-300 shadow-lg shadow-cyan-300/5 hover:shadow-cyan-300/20"
              style={bevelStyle}
            >
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-slate-950/90 py-3 text-sm font-bold uppercase tracking-wider text-cyan-300 hover:text-white transition flex items-center justify-center gap-2 shimmer-hover"
                style={bevelStyle}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Signing in...
                  </>
                ) : (
                  "Sign in and access dashboard"
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Center Divider: "Or" vertical line */}
        <div className="flex items-center justify-center md:flex-col py-4 md:py-0 px-8 md:px-0">
          <div className="h-[1px] md:h-24 w-full md:w-[1px] bg-white/10" />
          <span className="px-4 py-2 text-xs font-bold uppercase tracking-wider text-slate-500 bg-transparent select-none">
            Or
          </span>
          <div className="h-[1px] md:h-24 w-full md:w-[1px] bg-white/10" />
        </div>

        {/* Right Column: Social Sign-In buttons */}
        <div className="flex-1 p-8 md:p-12 md:pl-8 flex flex-col justify-center space-y-4">

          <div className="mb-2">
            <p className="text-xs font-black uppercase tracking-widest text-slate-400">Masuk cepat dengan</p>
          </div>

          {/* Google Button */}
          <div
            className="relative p-[1px] bg-gradient-to-r from-white/10 to-white/5 hover:from-red-400/40 hover:to-yellow-400/30 transition-all duration-300"
            style={bevelStyle}
          >
            <button
              type="button"
              onClick={() => handleOAuth("google")}
              disabled={oauthLoading === "google"}
              className="w-full bg-slate-950/80 py-3.5 px-4 text-xs font-bold uppercase tracking-wider text-slate-300 hover:text-white transition flex items-center gap-4 hover:scale-[1.01] shimmer-hover disabled:opacity-60 disabled:cursor-not-allowed"
              style={bevelStyle}
            >
              {oauthLoading === "google" ? (
                <Loader2 className="h-4 w-4 animate-spin text-cyan-300" />
              ) : (
                <svg className="h-4 w-4" viewBox="0 0 24 24">
                  <path fill="#EA4335" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                  <path fill="#4285F4" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                </svg>
              )}
              <span>{oauthLoading === "google" ? "Menghubungkan..." : "Sign in with Google"}</span>
            </button>
          </div>

          {/* Discord Button */}
          <div
            className="relative p-[1px] bg-gradient-to-r from-white/10 to-white/5 hover:from-indigo-500/40 hover:to-blue-500/30 transition-all duration-300"
            style={bevelStyle}
          >
            <button
              type="button"
              onClick={() => handleOAuth("discord")}
              disabled={oauthLoading === "discord"}
              className="w-full bg-slate-950/80 py-3.5 px-4 text-xs font-bold uppercase tracking-wider text-slate-300 hover:text-white transition flex items-center gap-4 hover:scale-[1.01] shimmer-hover disabled:opacity-60 disabled:cursor-not-allowed"
              style={bevelStyle}
            >
              {oauthLoading === "discord" ? (
                <Loader2 className="h-4 w-4 animate-spin text-cyan-300" />
              ) : (
                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="#5865F2">
                  <path d="M20.3 4.4C18.7 3.6 17.1 3 15.4 2.7c-.2.4-.4.8-.6 1.2-1.8-.3-3.7-.3-5.5 0-.2-.4-.4-.8-.6-1.2-1.7.3-3.3.9-4.9 1.7C.6 9 .1 13.5.3 17.9c2.4 1.8 4.7 2.9 7 3.6.6-.8 1-1.6 1.4-2.5-.8-.3-1.6-.7-2.4-1.2.2-.1.4-.3.6-.5 4.5 2.1 9.4 2.1 13.9 0 .2.2.4.3.6.5-.8.5-1.6.9-2.4 1.2.4.9.8 1.7 1.4 2.5 2.3-.7 4.6-1.8 7-3.6.3-5 .4-9.5-2.9-13.5zM8.9 15.1c-1.4 0-2.5-1.3-2.5-2.8 0-1.5 1.1-2.8 2.5-2.8s2.5 1.3 2.5 2.8c.1 1.5-1 2.8-2.5 2.8zm6.2 0c-1.4 0-2.5-1.3-2.5-2.8 0-1.5 1.1-2.8 2.5-2.8s2.5 1.3 2.5 2.8c0 1.5-1.1 2.8-2.5 2.8z" />
                </svg>
              )}
              <span>{oauthLoading === "discord" ? "Menghubungkan..." : "Sign in with Discord"}</span>
            </button>
          </div>

          {/* Info note */}
          <p className="text-[10px] text-slate-600 text-center leading-relaxed pt-2">
            Dengan masuk, Anda menyetujui<br />
            <span className="text-cyan-400">Syarat &amp; Ketentuan</span> dan <span className="text-cyan-400">Kebijakan Privasi</span> Mitsuru.
          </p>

        </div>


      </div>
    </div>
  )
}
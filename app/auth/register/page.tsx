"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Eye, EyeOff, Loader2, Check, ArrowLeft } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { gameAssets } from "@/lib/assets"

// Beautiful gaming wallpapers for rotating backgrounds
const wallpapers = [
  gameAssets["mobile-legends"].banner,
  gameAssets["free-fire"].banner,
  gameAssets.valorant.banner,
  gameAssets["pubg-mobile"].banner,
]

export default function RegisterPage() {
  const router = useRouter()
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
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

  const passwordRequirements = [
    { met: formData.password.length >= 8, text: "Minimal 8 karakter" },
    { met: /[A-Z]/.test(formData.password), text: "Huruf kapital" },
    { met: /[0-9]/.test(formData.password), text: "Angka" },
  ]

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    if (formData.password !== formData.confirmPassword) {
      setError("Password tidak cocok")
      setIsLoading(false)
      return
    }

    try {
      const { error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            name: formData.name,
          },
        },
      })

      if (authError) throw authError

      // Redirect to login with success message
      router.push("/auth/login?registered=true")
    } catch (err: any) {
      setError(err.message || "Registrasi gagal. Silakan coba lagi.")
    } finally {
      setIsLoading(false)
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

      {/* Main Glass register card */}
      <div className="w-full max-w-4xl glass relative z-20 overflow-hidden rounded-2xl shadow-neon-cyan border-white/10 backdrop-blur-md flex flex-col md:flex-row">
        
        {/* Decorative corner glows */}
        <div className="absolute top-0 left-0 w-24 h-24 bg-cyan-300/10 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-24 h-24 bg-blue-500/10 rounded-full blur-2xl pointer-events-none" />

        {/* Tab switchers at the top absolute container */}
        <div className="absolute top-0 left-6 flex z-30 items-center">
          <Link href="/auth/login">
            <button
              className="px-6 py-2.5 bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white font-bold text-sm tracking-wide transition border-r border-white/5 shimmer-hover"
              style={tabBevelStyle}
            >
              Sign in
            </button>
          </Link>
          <button
            className="px-6 py-2.5 bg-cyan-300 text-ink font-bold text-sm tracking-wide shadow-lg shadow-cyan-300/10 shimmer-hover"
            style={tabBevelStyle}
          >
            Register
          </button>
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
          <div className="mb-6">
            <h2 className="text-3xl font-black tracking-tight text-white mb-2 uppercase bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">
              Join Us!
            </h2>
            <p className="text-xs tracking-wider text-cyan-300 font-semibold uppercase">
              Create an account to start top up
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-500 text-xs font-semibold animate-fadeIn">
                {error}
              </div>
            )}

            {/* Name field */}
            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-300 block">
                Full Name <span className="text-cyan-300">*</span>
              </label>
              <div
                className="relative p-[1px] bg-gradient-to-r from-white/10 to-white/5 focus-within:from-cyan-300 focus-within:to-cyan-400 transition-all duration-300"
                style={inputBevelStyle}
              >
                <input
                  id="name"
                  type="text"
                  placeholder="John Doe"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-slate-950/80 px-4 py-2 text-white placeholder-slate-500 outline-none border-none text-sm transition-colors duration-200"
                  style={inputBevelStyle}
                  required
                />
              </div>
            </div>

            {/* Email field */}
            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-300 block">
                Email Address <span className="text-cyan-300">*</span>
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
                  className="w-full bg-slate-950/80 px-4 py-2 text-white placeholder-slate-500 outline-none border-none text-sm transition-colors duration-200"
                  style={inputBevelStyle}
                  required
                />
              </div>
            </div>

            {/* Password field */}
            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-300 block">
                Password <span className="text-cyan-300">*</span>
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
                    className="w-full bg-slate-950/80 pl-4 pr-12 py-2 text-white placeholder-slate-500 outline-none border-none text-sm transition-colors duration-200"
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

              {/* Requirement checkers */}
              <div className="flex flex-wrap gap-x-3 gap-y-1 pt-1">
                {passwordRequirements.map((req, index) => (
                  <div
                    key={index}
                    className={`flex items-center gap-1 text-[10px] ${
                      req.met ? "text-cyan-300 font-bold" : "text-slate-500"
                    }`}
                  >
                    <Check className={`h-3 w-3 ${req.met ? "text-cyan-300" : "text-slate-500"}`} />
                    <span>{req.text}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Confirm Password field */}
            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-300 block">
                Confirm Password <span className="text-cyan-300">*</span>
              </label>
              <div
                className="relative p-[1px] bg-gradient-to-r from-white/10 to-white/5 focus-within:from-cyan-300 focus-within:to-cyan-400 transition-all duration-300"
                style={inputBevelStyle}
              >
                <input
                  id="confirmPassword"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  className="w-full bg-slate-950/80 px-4 py-2 text-white placeholder-slate-500 outline-none border-none text-sm transition-colors duration-200"
                  style={inputBevelStyle}
                  required
                />
              </div>
            </div>

            {/* Submit Button */}
            <div
              className="relative p-[1px] bg-gradient-to-r from-cyan-300/40 to-blue-500/40 hover:from-cyan-300 hover:to-blue-500 transition-all duration-300 shadow-lg shadow-cyan-300/5 hover:shadow-cyan-300/20"
              style={bevelStyle}
            >
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-slate-950/90 py-2.5 text-sm font-bold uppercase tracking-wider text-cyan-300 hover:text-white transition flex items-center justify-center gap-2 shimmer-hover"
                style={bevelStyle}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Registering...
                  </>
                ) : (
                  "Register and start top up"
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Center Divider */}
        <div className="flex items-center justify-center md:flex-col py-4 md:py-0 px-8 md:px-0">
          <div className="h-[1px] md:h-24 w-full md:w-[1px] bg-white/10" />
          <span className="px-4 py-2 text-xs font-bold uppercase tracking-wider text-slate-500 bg-transparent select-none">
            Or
          </span>
          <div className="h-[1px] md:h-24 w-full md:w-[1px] bg-white/10" />
        </div>

        {/* Right Column: Social Sign-In buttons */}
        <div className="flex-1 p-8 md:p-12 md:pl-8 flex flex-col justify-center space-y-4">
          
          {/* Google Button */}
          <div
            className="relative p-[1px] bg-gradient-to-r from-white/10 to-white/5 hover:from-cyan-300/50 hover:to-cyan-300/30 transition-all duration-300"
            style={bevelStyle}
          >
            <button
              onClick={() => supabase.auth.signInWithOAuth({ provider: "google" })}
              className="w-full bg-slate-950/80 py-3 px-4 text-xs font-bold uppercase tracking-wider text-slate-300 hover:text-white transition flex items-center gap-4 hover:scale-[1.01] shimmer-hover"
              style={bevelStyle}
            >
              <svg className="h-4 w-4" viewBox="0 0 24 24">
                <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
              </svg>
              <span>Sign up with Google</span>
            </button>
          </div>

          {/* Steam Button */}
          <div
            className="relative p-[1px] bg-gradient-to-r from-white/10 to-white/5 hover:from-cyan-300/50 hover:to-cyan-300/30 transition-all duration-300"
            style={bevelStyle}
          >
            <button
              className="w-full bg-slate-950/80 py-3 px-4 text-xs font-bold uppercase tracking-wider text-slate-300 hover:text-white transition flex items-center gap-4 hover:scale-[1.01] shimmer-hover"
              style={bevelStyle}
            >
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 0c-6.1 0-11.1 4.7-11.9 10.7l6 2.5c.6-.5 1.5-.7 2.3-.5l3.1-4.5c0-.1 0-.3-.1-.4 0-1.4 1.1-2.5 2.5-2.5s2.5 1.1 2.5 2.5-1.1 2.5-2.5 2.5c-.1 0-.3 0-.4-.1l-4.5 3.1c.2.8.1 1.7-.5 2.3l2.5 6c6-.8 10.7-5.8 10.7-11.9 0-6.6-5.4-12-12-12zm-3.3 14.3c-.6.6-1.5.6-2.1 0l-4.5-1.9c.2-3.1 2.3-5.7 5.1-6.7l1.5 3.5c-.6.5-1 1.3-.9 2.1l.9 3zm3.3-5.3c.6 0 1.1-.5 1.1-1.1s-.5-1.1-1.1-1.1-1.1.5-1.1 1.1.5 1.1 1.1 1.1z" />
              </svg>
              <span>Sign up with Steam</span>
            </button>
          </div>

          {/* Discord Button */}
          <div
            className="relative p-[1px] bg-gradient-to-r from-white/10 to-white/5 hover:from-cyan-300/50 hover:to-cyan-300/30 transition-all duration-300"
            style={bevelStyle}
          >
            <button
              className="w-full bg-slate-950/80 py-3 px-4 text-xs font-bold uppercase tracking-wider text-slate-300 hover:text-white transition flex items-center gap-4 hover:scale-[1.01] shimmer-hover"
              style={bevelStyle}
            >
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                <path d="M20.3 4.4C18.7 3.6 17.1 3 15.4 2.7c-.2.4-.4.8-.6 1.2-1.8-.3-3.7-.3-5.5 0-.2-.4-.4-.8-.6-1.2-1.7.3-3.3.9-4.9 1.7C.6 9 .1 13.5.3 17.9c2.4 1.8 4.7 2.9 7 3.6.6-.8 1-1.6 1.4-2.5-.8-.3-1.6-.7-2.4-1.2.2-.1.4-.3.6-.5 4.5 2.1 9.4 2.1 13.9 0 .2.2.4.3.6.5-.8.5-1.6.9-2.4 1.2.4.9.8 1.7 1.4 2.5 2.3-.7 4.6-1.8 7-3.6.3-5 .4-9.5-2.9-13.5zM8.9 15.1c-1.4 0-2.5-1.3-2.5-2.8 0-1.5 1.1-2.8 2.5-2.8s2.5 1.3 2.5 2.8c.1 1.5-1 2.8-2.5 2.8zm6.2 0c-1.4 0-2.5-1.3-2.5-2.8 0-1.5 1.1-2.8 2.5-2.8s2.5 1.3 2.5 2.8c0 1.5-1.1 2.8-2.5 2.8z" />
              </svg>
              <span>Sign up with Discord</span>
            </button>
          </div>

          {/* Xbox Button */}
          <div
            className="relative p-[1px] bg-gradient-to-r from-white/10 to-white/5 hover:from-cyan-300/50 hover:to-cyan-300/30 transition-all duration-300"
            style={bevelStyle}
          >
            <button
              className="w-full bg-slate-950/80 py-3 px-4 text-xs font-bold uppercase tracking-wider text-slate-300 hover:text-white transition flex items-center gap-4 hover:scale-[1.01] shimmer-hover"
              style={bevelStyle}
            >
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                <path d="M11.2 21.6c-4.9-.7-8.7-4.6-9.4-9.5-.1-.7.2-1.3.7-1.8 1.9-1.9 4.9-2.8 7.5-2.2.8.2 1.4-.4 1.4-1.2V3.7c0-1 .9-1.7 1.8-1.5 4.8 1 8.5 4.7 9.5 9.5.2.9-.5 1.8-1.5 1.8h-3.2c-.8 0-1.4.6-1.2 1.4.6 2.6-.3 5.6-2.2 7.5-.5.5-1.1.8-1.8.7l-.7-.1z" />
              </svg>
              <span>Sign up with Xbox</span>
            </button>
          </div>

        </div>

      </div>
    </div>
  )
}

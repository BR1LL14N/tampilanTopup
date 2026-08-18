"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Header } from "@/components/layout/header"
import { SidebarContentWrapper } from "@/components/layout/sidebar-content-wrapper"
import { Skeleton } from "@/components/ui/skeleton"
import { getCachedUser, setCachedUser } from "@/lib/auth-cache"
import {
  Building2,
  ImageIcon,
  Share2,
  Loader2,
  UploadCloud,
  Save,
  Instagram,
  Wallet,
  ShieldCheck,
} from "lucide-react"

const emptyForm = {
  paymentGateway: "midtrans",
  midtransMode: "sandbox",
  paymentMethodType: "checkout",
  dokuClientId: "",
  dokuSharedKey: "",
  dokuMode: "sandbox",
  businessOwnerName: "",
  businessLegalName: "",
  businessAddress: "",
  businessNpwp: "",
  businessPhone: "",
  businessEmail: "",
  waAdminNumber: "",
  logoUrl: "",
  faviconUrl: "",
  socialInstagram: "",
  socialTiktok: "",
  socialFacebook: "",
  socialYoutube: "",
}

export default function AdminSettingsPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [form, setForm] = useState(emptyForm)
  const [uploadingLogo, setUploadingLogo] = useState(false)
  const [uploadingFavicon, setUploadingFavicon] = useState(false)

  const logoInputRef = useRef<HTMLInputElement>(null)
  const faviconInputRef = useRef<HTMLInputElement>(null)

  const fetchAdminData = async () => {
    try {
      const resUser = await fetch("/api/auth/me")
      const { user } = await resUser.json()

      if (!user || user.role !== "admin") {
        setCachedUser(null)
        router.push("/auth/login")
        return
      }

      setCurrentUser(user)
      setCachedUser(user)

      const resSettings = await fetch("/api/admin/settings")
      const { settings, error } = await resSettings.json()
      if (error) throw new Error(error)

      if (settings) {
        setForm({
          paymentGateway: settings.paymentGateway || "midtrans",
          midtransMode: settings.midtransMode || "sandbox",
          paymentMethodType: settings.paymentMethodType || "checkout",
          dokuClientId: settings.dokuClientId || "",
          dokuSharedKey: settings.dokuSharedKey || "",
          dokuMode: settings.dokuMode || "sandbox",
          businessOwnerName: settings.businessOwnerName || "",
          businessLegalName: settings.businessLegalName || "",
          businessAddress: settings.businessAddress || "",
          businessNpwp: settings.businessNpwp || "",
          businessPhone: settings.businessPhone || "",
          businessEmail: settings.businessEmail || "",
          waAdminNumber: settings.waAdminNumber || "",
          logoUrl: settings.logoUrl || "",
          faviconUrl: settings.faviconUrl || "",
          socialInstagram: settings.socialInstagram || "",
          socialTiktok: settings.socialTiktok || "",
          socialFacebook: settings.socialFacebook || "",
          socialYoutube: settings.socialYoutube || "",
        })
      }
    } catch (err) {
      console.error("Failed to load admin settings:", err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const cached = getCachedUser()
    if (cached) setCurrentUser(cached)
    fetchAdminData()
  }, [router])

  const handleChange = (field: keyof typeof emptyForm, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  const handleUpload = async (
    file: File,
    folder: "logo" | "favicon",
    field: "logoUrl" | "faviconUrl",
    setUploading: (v: boolean) => void
  ) => {
    setUploading(true)
    try {
      const body = new FormData()
      body.append("file", file)
      body.append("folder", folder)

      const res = await fetch("/api/admin/upload", { method: "POST", body })
      const data = await res.json()
      if (data.error) throw new Error(data.error)

      handleChange(field, data.url)
    } catch (err: any) {
      alert("Gagal mengunggah file: " + err.message)
    } finally {
      setUploading(false)
    }
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const res = await fetch("/api/admin/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (data.error) throw new Error(data.error)
      alert("Pengaturan berhasil disimpan.")
    } catch (err: any) {
      alert("Gagal menyimpan pengaturan: " + err.message)
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col ">
        <Header user={currentUser} />
        <SidebarContentWrapper isAuthenticated={!!currentUser}>
          <main className="flex-1 py-8">
            <div className="container space-y-6">
              <Skeleton className="h-8 w-56 rounded-lg bg-sky/10" />
              <Skeleton className="h-40 w-full rounded-[20px] bg-sky/10" />
              <Skeleton className="h-40 w-full rounded-[20px] bg-sky/10" />
            </div>
          </main>
        </SidebarContentWrapper>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col ">
      <Header user={currentUser} />
      <SidebarContentWrapper isAuthenticated={!!currentUser}>
        <main className="flex-1 py-8">
          <div className="container space-y-8 max-w-4xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl font-black uppercase tracking-tight text-white">
                  Pengaturan Situs
                </h1>
                <p className="text-xs font-semibold text-white/60 uppercase tracking-wide mt-1">
                  Identitas bisnis, logo, favicon, dan tautan media sosial
                </p>
              </div>
              <Button
                onClick={handleSave}
                disabled={saving}
                className="bg-sky hover:bg-diamond text-white font-black uppercase tracking-wider gap-2"
              >
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                Simpan Semua
              </Button>
            </div>

            {/* Payment Gateway Configuration */}
            <Card className="rounded-[20px] border-sky/30 shadow-sky-soft bg-mist backdrop-blur-md">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2 text-sm font-black uppercase text-white">
                    <Wallet className="h-5 w-5 text-sky" />
                    Konfigurasi Payment Gateway (Midtrans / DOKU)
                  </CardTitle>
                  <span className="px-2.5 py-0.5 text-[9px] font-black uppercase tracking-wider rounded bg-sky/20 text-sky border border-sky/30">
                    Aktif: {form.paymentGateway.toUpperCase()}
                  </span>
                </div>
                <p className="text-[11px] text-white/60 font-medium leading-relaxed">
                  Pilih gerbang pembayaran utama yang digunakan oleh sistem untuk memproses transaksi checkout pelanggan.
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="paymentGateway">Penyedia Payment Gateway Utama</Label>
                    <select
                      id="paymentGateway"
                      value={form.paymentGateway}
                      onChange={(e) => handleChange("paymentGateway" as any, e.target.value)}
                      className="flex w-full rounded-xl border border-sky/30 bg-[#183644] px-4 py-2.5 text-sm font-bold text-white focus:border-sky focus:outline-none focus:ring-2 focus:ring-sky/20 transition-all"
                    >
                      <option value="midtrans">MIDTRANS (Default)</option>
                      <option value="doku">DOKU PAYMENT GATEWAY</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="paymentMethodType">Metode Integrasi Pembayaran</Label>
                    <select
                      id="paymentMethodType"
                      value={form.paymentMethodType}
                      onChange={(e) => handleChange("paymentMethodType" as any, e.target.value)}
                      className="flex w-full rounded-xl border border-sky/30 bg-[#183644] px-4 py-2.5 text-sm font-bold text-white focus:border-sky focus:outline-none focus:ring-2 focus:ring-sky/20 transition-all"
                    >
                      <option value="checkout">CHECKOUT PAGE (Hosted Page Doku / Midtrans Snap)</option>
                      <option value="direct">DIRECT API (Halaman Pembayaran Kustom)</option>
                    </select>
                  </div>
                </div>

                {form.paymentGateway === "midtrans" ? (
                  <div className="p-4 rounded-xl border border-sky/30 bg-sky/5 space-y-3">
                    <div className="flex items-center gap-2 text-xs font-black uppercase text-sky">
                      <ShieldCheck className="h-4 w-4" />
                      Pengaturan Lingkungan Midtrans
                    </div>
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <Label htmlFor="midtransMode">Mode Midtrans</Label>
                        <select
                          id="midtransMode"
                          value={form.midtransMode}
                          onChange={(e) => handleChange("midtransMode" as any, e.target.value)}
                          className="flex w-full rounded-xl border border-sky/30 bg-[#183644] px-4 py-2 text-xs font-bold text-white focus:border-sky focus:outline-none"
                        >
                          <option value="sandbox">SANDBOX (Mode Testing / Uji Coba)</option>
                          <option value="production">PRODUCTION (Mode Live Bisnis)</option>
                        </select>
                      </div>
                      <div className="text-[11px] text-white/70 space-y-1 self-center bg-black/20 p-2.5 rounded-lg border border-white/10">
                        <p className="font-bold text-sky">📍 Webhook Notification URL Midtrans:</p>
                        <code className="text-[10px] text-white font-mono block break-all">
                          https://mitsurushop.com/api/payment/midtrans-callback
                        </code>
                      </div>
                    </div>
                    <p className="text-[10px] text-white/60">
                      *Kunci <code>MIDTRANS_SERVER_KEY</code> dan <code>MIDTRANS_CLIENT_KEY</code> dikonfigurasi melalui file <code>.env.local</code> di VPS demi keamanan server.
                    </p>
                  </div>
                ) : (
                  <div className="p-4 rounded-xl border border-sky/30 bg-sky/5 space-y-3">
                    <div className="flex items-center gap-2 text-xs font-black uppercase text-sky">
                      <ShieldCheck className="h-4 w-4" />
                      Kredensial Merchant DOKU
                    </div>
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <Label htmlFor="dokuClientId">DOKU Client ID</Label>
                        <Input
                          id="dokuClientId"
                          value={form.dokuClientId}
                          onChange={(e) => handleChange("dokuClientId" as any, e.target.value)}
                          placeholder="Contoh: BRN-0270-1784635922691"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label htmlFor="dokuSharedKey">DOKU Shared / Secret Key</Label>
                        <Input
                          id="dokuSharedKey"
                          type="password"
                          value={form.dokuSharedKey}
                          onChange={(e) => handleChange("dokuSharedKey" as any, e.target.value)}
                          placeholder="SK-..."
                        />
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Business Identity */}
            <Card className="rounded-[20px] border-sky/30 shadow-sky-soft bg-mist backdrop-blur-md">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-sm font-black uppercase text-white">
                  <Building2 className="h-5 w-5 text-sky" />
                  Identitas Bisnis
                </CardTitle>
                <p className="text-[11px] text-white/60 font-medium leading-relaxed">
                  Digunakan untuk kelengkapan legal di halaman Tentang/Kontak dan pengajuan payment gateway. Data ini hanya untuk kelengkapan situs — pastikan sesuai dengan identitas yang terdaftar di akun pembayaran Anda.
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="businessOwnerName">Nama Pemilik Usaha</Label>
                    <Input
                      id="businessOwnerName"
                      placeholder="Nama sesuai KTP"
                      value={form.businessOwnerName}
                      onChange={(e) => handleChange("businessOwnerName", e.target.value)}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="businessLegalName">Nama Usaha/Brand Terdaftar</Label>
                    <Input
                      id="businessLegalName"
                      placeholder="Mis. Mitsuru Top Up Hub"
                      value={form.businessLegalName}
                      onChange={(e) => handleChange("businessLegalName", e.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="businessAddress">Alamat Domisili Usaha</Label>
                  <textarea
                    id="businessAddress"
                    placeholder="Alamat lengkap sesuai KTP/domisili"
                    value={form.businessAddress}
                    onChange={(e) => handleChange("businessAddress", e.target.value)}
                    rows={3}
                    className="flex w-full rounded-xl border border-sky/30 bg-mist backdrop-blur-md px-4 py-3 text-sm text-white placeholder:text-white/60 focus:border-sky focus:outline-none focus:ring-2 focus:ring-sky/20 transition-all duration-300"
                  />
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="businessNpwp">NPWP Pribadi (opsional)</Label>
                    <Input
                      id="businessNpwp"
                      placeholder="Tidak ditampilkan ke publik"
                      value={form.businessNpwp}
                      onChange={(e) => handleChange("businessNpwp", e.target.value)}
                    />
                    <p className="text-[10px] text-white/60">Disimpan untuk arsip internal saja, tidak ikut tampil di halaman publik.</p>
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="waAdminNumber">Nomor WhatsApp Resmi</Label>
                    <Input
                      id="waAdminNumber"
                      placeholder="62881xxxxxxxxx"
                      value={form.waAdminNumber}
                      onChange={(e) => handleChange("waAdminNumber", e.target.value)}
                    />
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="businessPhone">Telepon Resmi (opsional)</Label>
                    <Input
                      id="businessPhone"
                      placeholder="Jika berbeda dari WhatsApp"
                      value={form.businessPhone}
                      onChange={(e) => handleChange("businessPhone", e.target.value)}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="businessEmail">Email Resmi</Label>
                    <Input
                      id="businessEmail"
                      placeholder="support@mitsurushop.com"
                      value={form.businessEmail}
                      onChange={(e) => handleChange("businessEmail", e.target.value)}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Logo & Favicon */}
            <Card className="rounded-[20px] border-sky/30 shadow-sky-soft bg-mist backdrop-blur-md">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-sm font-black uppercase text-white">
                  <ImageIcon className="h-5 w-5 text-sky" />
                  Logo &amp; Favicon
                </CardTitle>
              </CardHeader>
              <CardContent className="grid sm:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label>Logo Situs</Label>
                  <div className="flex items-center gap-4">
                    <div className="h-16 w-16 rounded-xl border border-sky/30 bg-sky/20 overflow-hidden shrink-0 grid place-items-center">
                      {form.logoUrl ? (
                        <img src={form.logoUrl} alt="Logo preview" className="h-full w-full object-cover" />
                      ) : (
                        <ImageIcon className="h-6 w-6 text-white/60" />
                      )}
                    </div>
                    <div className="space-y-2">
                      <input
                        ref={logoInputRef}
                        type="file"
                        accept="image/png,image/jpeg,image/webp,image/svg+xml"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0]
                          if (file) handleUpload(file, "logo", "logoUrl", setUploadingLogo)
                        }}
                      />
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => logoInputRef.current?.click()}
                        disabled={uploadingLogo}
                        className="gap-2 text-xs"
                      >
                        {uploadingLogo ? <Loader2 className="h-4 w-4 animate-spin" /> : <UploadCloud className="h-4 w-4" />}
                        Unggah Logo
                      </Button>
                      <p className="text-[10px] text-white/60">PNG/JPG/WEBP/SVG, maks 3MB</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Favicon</Label>
                  <div className="flex items-center gap-4">
                    <div className="h-16 w-16 rounded-xl border border-sky/30 bg-sky/20 overflow-hidden shrink-0 grid place-items-center">
                      {form.faviconUrl ? (
                        <img src={form.faviconUrl} alt="Favicon preview" className="h-8 w-8 object-cover" />
                      ) : (
                        <ImageIcon className="h-6 w-6 text-white/60" />
                      )}
                    </div>
                    <div className="space-y-2">
                      <input
                        ref={faviconInputRef}
                        type="file"
                        accept="image/png,image/x-icon,image/vnd.microsoft.icon"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0]
                          if (file) handleUpload(file, "favicon", "faviconUrl", setUploadingFavicon)
                        }}
                      />
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => faviconInputRef.current?.click()}
                        disabled={uploadingFavicon}
                        className="gap-2 text-xs"
                      >
                        {uploadingFavicon ? <Loader2 className="h-4 w-4 animate-spin" /> : <UploadCloud className="h-4 w-4" />}
                        Unggah Favicon
                      </Button>
                      <p className="text-[10px] text-white/60">PNG/ICO persegi, maks 3MB</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Social Media */}
            <Card className="rounded-[20px] border-sky/30 shadow-sky-soft bg-mist backdrop-blur-md">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-sm font-black uppercase text-white">
                  <Share2 className="h-5 w-5 text-sky" />
                  Media Sosial
                </CardTitle>
              </CardHeader>
              <CardContent className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="socialInstagram">Instagram (URL)</Label>
                  <Input
                    id="socialInstagram"
                    placeholder="https://instagram.com/username"
                    value={form.socialInstagram}
                    onChange={(e) => handleChange("socialInstagram", e.target.value)}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="socialTiktok">TikTok (URL)</Label>
                  <Input
                    id="socialTiktok"
                    placeholder="https://tiktok.com/@username"
                    value={form.socialTiktok}
                    onChange={(e) => handleChange("socialTiktok", e.target.value)}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="socialFacebook">Facebook (URL)</Label>
                  <Input
                    id="socialFacebook"
                    placeholder="https://facebook.com/username"
                    value={form.socialFacebook}
                    onChange={(e) => handleChange("socialFacebook", e.target.value)}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="socialYoutube">YouTube (URL)</Label>
                  <Input
                    id="socialYoutube"
                    placeholder="https://youtube.com/@username"
                    value={form.socialYoutube}
                    onChange={(e) => handleChange("socialYoutube", e.target.value)}
                  />
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-end">
              <Button
                onClick={handleSave}
                disabled={saving}
                className="bg-sky hover:bg-diamond text-white font-black uppercase tracking-wider gap-2"
              >
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                Simpan Semua
              </Button>
            </div>
          </div>
        </main>
      </SidebarContentWrapper>
    </div>
  )
}

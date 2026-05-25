"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import {
  Zap,
  MessagesSquare,
  BadgeCheck,
  Plus,
  Minus,
  ShoppingBag,
  Headphones,
  Star,
} from "lucide-react"

interface Product {
  id: string
  name: string
  price: number
  sell_price: number
  provider_sku: string
}

interface Game {
  name: string
  icon: string
  slug: string
  image: string
  description: string
  category: string
  products: Product[]
}

interface GameDetailContentProps {
  game: Game
  user?: {
    name: string
    email: string
    role: string
  } | null
}

export function GameDetailContent({ game, user }: GameDetailContentProps) {
  const router = useRouter()

  // Tabs: Transaksi vs Keterangan
  const [activeTab, setActiveTab] = useState("transaksi")

  // Form states
  const [gameId, setGameId] = useState("")
  const [serverId, setServerId] = useState("")
  const [email, setEmail] = useState("")
  const [loginMethod, setLoginMethod] = useState("Pilih Login")
  const [requestNotes, setRequestNotes] = useState("")
  const [password, setPassword] = useState("")
  
  // Selection states
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(game.products[0] || null)
  const [quantity, setQuantity] = useState(1)
  const [paymentMethod, setPaymentMethod] = useState("QRIS")
  const [promoCode, setPromoCode] = useState("")
  const [whatsapp, setWhatsapp] = useState("")

  const handleOrder = () => {
    if (!selectedProduct) {
      alert("Silakan pilih nominal terlebih dahulu.")
      return
    }
    if (!gameId) {
      alert("Silakan masukkan ID Game Anda.")
      return
    }
    
    // Redirect to dynamic checkout/invoice route
    const target = serverId ? `${gameId} (${serverId})` : gameId
    router.push(
      `/checkout/${selectedProduct.provider_sku}?target=${target}&whatsapp=${whatsapp}&qty=${quantity}&payment=${paymentMethod.toLowerCase()}&promo=${promoCode}`
    )
  }

  return (
    <div className="min-h-screen text-slate-100 antialiased relative">
      {/* Mesh Background */}
      <div className="pointer-events-none fixed inset-0 mesh opacity-50 z-0"></div>

      <Header user={user} />

      <main className="relative z-10 mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        
        {/* Game Header Banner */}
        <div className="diagonal-card mb-6 overflow-hidden rounded-lg border border-cyan-200/20">
          <div className="grid min-h-[360px] items-end gap-6 p-6 sm:p-8 lg:grid-cols-[280px_1fr] lg:p-10">
            <img 
              className="h-72 w-full max-w-[260px] rounded-lg object-cover shadow-2xl" 
              src={game.image} 
              alt={game.name} 
            />
            <div className="pb-3">
              <p className="text-sm font-extrabold uppercase tracking-wider text-cyan-100">Top Up Game</p>
              <h1 className="mt-2 text-4xl font-extrabold uppercase tracking-wide text-white">{game.name}</h1>
              <p className="mt-2 text-lg font-semibold text-slate-200">{game.category}</p>
              <div className="mt-8 flex flex-wrap gap-5 text-sm font-bold text-white">
                <span className="inline-flex items-center gap-2">
                  <Zap className="h-4 w-4 text-yellow-300" />
                  Proses Cepat
                </span>
                <span className="inline-flex items-center gap-2">
                  <MessagesSquare className="h-4 w-4 text-blue-300" />
                  Layanan Chat 24/7
                </span>
                <span className="inline-flex items-center gap-2">
                  <BadgeCheck className="h-4 w-4 text-emerald-300" />
                  Pembayaran Aman
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Dynamic content grid */}
        <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
          
          {/* Left Column Form */}
          <div className="space-y-6">
            
            {/* View tabs */}
            <div className="flex w-fit overflow-hidden rounded-lg border border-white/10 bg-ink/50 text-sm font-extrabold">
              <button 
                onClick={() => setActiveTab("transaksi")}
                className={`px-5 py-3 ${activeTab === "transaksi" ? "tab-active" : "text-slate-300"}`}
              >
                Transaksi
              </button>
              <button 
                onClick={() => setActiveTab("keterangan")}
                className={`px-5 py-3 ${activeTab === "keterangan" ? "tab-active" : "text-slate-300"}`}
              >
                Keterangan
              </button>
            </div>

            {activeTab === "transaksi" ? (
              <>
                {/* Step 1: Input Akun */}
                <div className="order-step">
                  <div className="step-head">
                    <span className="step-number">1</span>
                    <span className="px-5 font-bold">Masukkan Data Akun</span>
                  </div>
                  <div className="grid gap-4 p-5 sm:grid-cols-2">
                    <label>
                      <span className="mb-2 block text-sm font-bold">User ID</span>
                      <input 
                        value={gameId}
                        onChange={(e) => setGameId(e.target.value)}
                        placeholder="Masukkan User ID" 
                        className="w-full rounded-lg border border-transparent bg-[#82aeb8]/30 px-4 py-3 text-sm text-white placeholder:text-white/55 outline-none focus:bg-[#82aeb8]/40" 
                      />
                    </label>
                    
                    {/* Conditionally show Server ID for Mobile Legends */}
                    {game.slug === "mobile-legends" && (
                      <label>
                        <span className="mb-2 block text-sm font-bold">Server ID</span>
                        <input 
                          value={serverId}
                          onChange={(e) => setServerId(e.target.value)}
                          placeholder="Masukkan Server ID" 
                          className="w-full rounded-lg border border-transparent bg-[#82aeb8]/30 px-4 py-3 text-sm text-white placeholder:text-white/55 outline-none focus:bg-[#82aeb8]/40" 
                        />
                      </label>
                    )}

                    {/* Additional simulated fields for Joki/Vouchers if needed */}
                    <label>
                      <span className="mb-2 block text-sm font-bold">Email (Opsional)</span>
                      <input 
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Masukkan Email" 
                        className="w-full rounded-lg border border-transparent bg-[#82aeb8]/30 px-4 py-3 text-sm text-white placeholder:text-white/55 outline-none focus:bg-[#82aeb8]/40" 
                      />
                    </label>
                    
                    <label>
                      <span className="mb-2 block text-sm font-bold">Pilih Login</span>
                      <select 
                        value={loginMethod}
                        onChange={(e) => setLoginMethod(e.target.value)}
                        className="w-full rounded-lg border border-transparent bg-[#82aeb8]/30 px-4 py-3 text-sm text-white outline-none focus:bg-[#82aeb8]/40"
                      >
                        <option value="Pilih Login">Pilih Login</option>
                        <option value="Moonton">Moonton</option>
                        <option value="Facebook">Facebook</option>
                        <option value="Tiktok">Tiktok</option>
                        <option value="VK">VK</option>
                        <option value="Google">Google</option>
                      </select>
                    </label>

                    <label className="sm:col-span-2">
                      <span className="mb-2 block text-sm font-bold">Password (Hanya untuk Joki)</span>
                      <input 
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Masukkan Password" 
                        className="w-full rounded-lg border border-transparent bg-[#82aeb8]/30 px-4 py-3 text-sm text-white placeholder:text-white/55 outline-none focus:bg-[#82aeb8]/40" 
                      />
                    </label>

                    <label className="sm:col-span-2">
                      <span className="mb-2 block text-sm font-bold">Request ke Admin/Penjoki</span>
                      <input 
                        value={requestNotes}
                        onChange={(e) => setRequestNotes(e.target.value)}
                        placeholder="Contoh: Main hero mage, jangan pakai chat all" 
                        className="w-full rounded-lg border border-transparent bg-[#82aeb8]/30 px-4 py-3 text-sm text-white placeholder:text-white/55 outline-none focus:bg-[#82aeb8]/40" 
                      />
                    </label>
                    
                    <p className="sm:col-span-2 text-xs text-slate-300">
                      *Pastikan data akun yang Anda isi sudah benar sebelum melanjutkan ke pembayaran.
                    </p>
                  </div>
                </div>

                {/* Step 2: Pilih Nominal */}
                <div className="order-step">
                  <div className="step-head">
                    <span className="step-number">2</span>
                    <span className="px-5 font-bold">Pilih Nominal</span>
                  </div>
                  <div className="p-5">
                    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                      {game.products.map((prod) => {
                        const originalPrice = Math.round(prod.sell_price * 1.25)
                        const discount = 20
                        const isSelected = selectedProduct?.id === prod.id
                        return (
                          <button 
                            key={prod.id}
                            onClick={() => setSelectedProduct(prod)}
                            className={`rank-card p-4 text-left transition duration-300 hover:scale-[1.02] ${isSelected ? "border-cyan-300/50 bg-cyan-300/10 ring-2 ring-cyan-300/30" : "border-white/10 bg-white/5"}`}
                          >
                            <span className="block font-extrabold text-sm">{prod.name}</span>
                            <span className="mt-3 block text-xl font-extrabold text-[#82b7c2]">
                              Rp {prod.sell_price.toLocaleString("id-ID")}
                            </span>
                            <span className="mt-1 block text-xs font-bold text-pink-500 line-through">
                              Rp {originalPrice.toLocaleString("id-ID")}
                            </span>
                            <span className="mt-4 inline-block rounded bg-[#82aeb8] px-2 py-0.5 text-[10px] font-bold text-ink">
                              Disc {discount}%
                            </span>
                          </button>
                        )
                      })}
                    </div>
                  </div>
                </div>

                {/* Step 3: Masukkan Jumlah Pembelian */}
                <div className="order-step">
                  <div className="step-head">
                    <span className="step-number">3</span>
                    <span className="px-5 font-bold">Masukkan Jumlah Pembelian</span>
                  </div>
                  <div className="flex gap-3 p-5 items-center">
                    <input 
                      type="number"
                      value={quantity}
                      onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                      className="min-w-0 max-w-[80px] rounded-lg bg-[#82aeb8]/30 px-4 py-3 text-center text-white outline-none focus:ring-2 focus:ring-cyan-300/40" 
                    />
                    <button 
                      onClick={() => setQuantity((q) => q + 1)}
                      className="grid h-12 w-12 place-items-center rounded-lg bg-[#82aeb8]/20 transition hover:bg-[#82aeb8]/30 text-white"
                    >
                      <Plus className="h-5 w-5" />
                    </button>
                    <button 
                      onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                      className="grid h-12 w-12 place-items-center rounded-lg bg-white/15 transition hover:bg-white/20 text-white"
                    >
                      <Minus className="h-5 w-5" />
                    </button>
                  </div>
                </div>

                {/* Step 4: Pilih Pembayaran */}
                <div className="order-step">
                  <div className="step-head">
                    <span className="step-number">4</span>
                    <span className="px-5 font-bold">Pilih Pembayaran</span>
                  </div>
                  <div className="grid gap-3 p-5 md:grid-cols-3">
                    {[
                      { id: "QRIS", desc: "Instan & Otomatis" },
                      { id: "VA", desc: "Transfer Bank" },
                      { id: "E-Wallet", desc: "DANA, OVO, ShopeePay" },
                    ].map((pm) => {
                      const isSelected = paymentMethod === pm.id
                      return (
                        <button 
                          key={pm.id}
                          onClick={() => setPaymentMethod(pm.id)}
                          className={`rounded-lg border p-4 text-left transition duration-300 ${isSelected ? "border-cyan-200/40 bg-[#2a5652]" : "border-white/10 bg-white/5 hover:border-cyan-200/25"}`}
                        >
                          <strong>{pm.id}</strong>
                          <span className="mt-1 block text-xs text-slate-300">{pm.desc}</span>
                        </button>
                      )
                    })}
                  </div>
                </div>

                {/* Step 5: Kode Promo */}
                <div className="order-step">
                  <div className="step-head">
                    <span className="step-number">5</span>
                    <span className="px-5 font-bold">Kode Promo</span>
                  </div>
                  <div className="grid gap-3 p-5 sm:grid-cols-[1fr_auto]">
                    <input 
                      value={promoCode}
                      onChange={(e) => setPromoCode(e.target.value)}
                      placeholder="Masukkan kode promo" 
                      className="rounded-lg bg-[#82aeb8]/30 px-4 py-3 text-white placeholder:text-white/55 outline-none focus:ring-2 focus:ring-cyan-300/40" 
                    />
                    <button className="rounded-lg bg-white px-5 py-3 font-extrabold text-ink transition hover:bg-cyan-100">
                      Gunakan
                    </button>
                    <button 
                      onClick={() => setPromoCode("PROMO-MHS")}
                      className="sm:col-span-2 rounded-lg border border-dashed border-cyan-200/50 px-4 py-3 text-left font-bold text-cyan-100 transition hover:bg-cyan-300/10"
                    >
                      Pakai Promo Yang Tersedia: PROMO-MHS (Diskon 5%)
                    </button>
                  </div>
                </div>

                {/* Step 6: Detail Kontak */}
                <div className="order-step">
                  <div className="step-head">
                    <span className="step-number">6</span>
                    <span className="px-5 font-bold">Detail Kontak</span>
                  </div>
                  <div className="p-5">
                    <label>
                      <span className="mb-2 block text-sm font-bold">No. WhatsApp</span>
                      <div className="grid grid-cols-[72px_1fr] gap-3">
                        <span className="rounded-lg bg-[#82aeb8]/30 flex items-center justify-center font-bold">ID (+62)</span>
                        <input 
                          value={whatsapp}
                          onChange={(e) => setWhatsapp(e.target.value)}
                          placeholder="81234567890" 
                          className="rounded-lg bg-[#82aeb8]/30 px-4 py-3 text-white placeholder:text-white/55 outline-none focus:ring-2 focus:ring-cyan-300/40" 
                        />
                      </div>
                    </label>
                    <p className="mt-3 text-xs text-slate-300">
                      Nomor ini akan dihubungi jika terjadi masalah. Bukti transaksi akan kami kirim ke WhatsApp Anda.
                    </p>
                  </div>
                </div>
              </>
            ) : (
              /* Description & Rules Tab */
              <div className="soft-panel rounded-lg p-6">
                <h2 className="text-xl font-extrabold">Deskripsi {game.name}</h2>
                <p className="mt-3 text-sm leading-7 text-slate-300">
                  {game.description}
                </p>
                <h3 className="mt-5 font-extrabold">Ketentuan & Aturan Topup:</h3>
                <ol className="mt-2 list-decimal space-y-2 pl-5 text-sm text-slate-300">
                  <li>Pastikan User ID dan Server ID diisi dengan benar. Kesalahan penginputan di luar tanggung jawab kami.</li>
                  <li>Proses transaksi umumnya memakan waktu 10-60 detik setelah pembayaran diverifikasi.</li>
                  <li>Untuk joki rank, harap matikan verifikasi perangkat baru di pengaturan game dan jangan login selama proses joki berlangsung.</li>
                </ol>
              </div>
            )}
          </div>

          {/* Right Column Sidebar */}
          <aside className="space-y-5 lg:sticky lg:top-28 lg:self-start">
            
            {/* Review Card */}
            <div className="soft-panel rounded-lg p-5">
              <h2 className="font-extrabold text-base">Ulasan dan rating</h2>
              <div className="mt-3 flex items-center gap-4">
                <span className="text-5xl font-extrabold">5.00</span>
                <div className="flex flex-col">
                  <span className="text-3xl text-yellow-300">★★★★★</span>
                  <p className="text-xs font-bold text-slate-400">Berdasarkan 870 rating</p>
                </div>
              </div>
            </div>

            {/* Help Card */}
            <div className="soft-panel flex items-center gap-4 rounded-lg p-5">
              <Headphones className="h-8 w-8 text-slate-200" />
              <div>
                <p className="font-extrabold text-sm">Butuh Bantuan?</p>
                <p className="text-xs text-slate-300">Hubungi kami jika terjadi kendala pembayaran.</p>
              </div>
            </div>

            {/* Selected Product Review */}
            <div className="soft-panel rounded-lg p-5 border border-white/10">
              <h3 className="font-bold border-b border-white/10 pb-3">Ringkasan Pembelian</h3>
              {selectedProduct ? (
                <div className="mt-4 space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Nominal:</span>
                    <span className="font-bold">{selectedProduct.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Jumlah:</span>
                    <span className="font-bold">{quantity}x</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Metode:</span>
                    <span className="font-bold text-cyan-300">{paymentMethod}</span>
                  </div>
                  {gameId && (
                    <div className="flex justify-between">
                      <span className="text-slate-400">Target ID:</span>
                      <span className="font-bold">{gameId} {serverId && `(${serverId})`}</span>
                    </div>
                  )}
                  <div className="flex justify-between border-t border-white/10 pt-3 text-base">
                    <span className="text-white font-bold">Total:</span>
                    <span className="font-extrabold text-cyan-200">
                      Rp {(selectedProduct.sell_price * quantity).toLocaleString("id-ID")}
                    </span>
                  </div>
                </div>
              ) : (
                <p className="mt-4 text-sm text-slate-400 text-center py-4">
                  Belum ada item produk yang dipilih.
                </p>
              )}
            </div>

            {/* Submit Button */}
            <button 
              onClick={handleOrder}
              disabled={!selectedProduct}
              className="flex w-full items-center justify-center gap-3 rounded-lg bg-[#82aeb8] hover:bg-[#82aeb8]/80 disabled:opacity-50 px-5 py-3 font-extrabold text-white transition duration-300 shadow-neon-cyan"
            >
              <ShoppingBag className="h-5 w-5" />
              Pesan Sekarang!
            </button>
          </aside>
        </div>

      </main>

      <Footer />
    </div>
  )
}

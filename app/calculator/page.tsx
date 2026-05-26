"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { createClient } from "@/lib/supabase/client"
import { getItemAssetForProduct } from "@/lib/assets"
import { Loader2, Calculator, Info, Zap, ChevronRight, Award, Flame, RefreshCw, ShoppingCart } from "lucide-react"

export default function CalculatorPage() {
  const supabase = createClient()
  const [games, setGames] = useState<any[]>([])
  const [products, setProducts] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedGameId, setSelectedGameId] = useState("")
  const [targetQty, setTargetQty] = useState<number>(300)
  const [paymentMethod, setPaymentMethod] = useState("qris")
  
  // Results
  const [optimizationResult, setOptimizationResult] = useState<any>(null)
  const [gameCurrencyName, setGameCurrencyName] = useState("Diamonds")

  useEffect(() => {
    async function fetchData() {
      try {
        const { data: dbGames } = await supabase.from("games").select("*")
        const { data: dbProducts } = await supabase.from("products").select("*")
        
        if (dbGames) setGames(dbGames)
        if (dbProducts) setProducts(dbProducts)
        
        if (dbGames && dbGames.length > 0) {
          setSelectedGameId(dbGames[0].id)
        }
      } catch (err) {
        console.error("Error fetching data for calculator:", err)
      } finally {
        setIsLoading(false)
      }
    }
    fetchData()
  }, [])

  // Update currency name when selected game changes
  useEffect(() => {
    if (!selectedGameId || games.length === 0) return
    const activeGame = games.find(g => g.id === selectedGameId)
    if (activeGame) {
      const name = activeGame.name.toLowerCase()
      if (name.includes("valorant")) {
        setGameCurrencyName("VP (Valorant Points)")
      } else if (name.includes("pubg")) {
        setGameCurrencyName("UC")
      } else if (name.includes("free fire")) {
        setGameCurrencyName("Diamonds")
      } else if (name.includes("roblox")) {
        setGameCurrencyName("Robux")
      } else if (name.includes("genshin")) {
        setGameCurrencyName("Genesis Crystals")
      } else {
        setGameCurrencyName("Diamonds")
      }
      // Reset optimization result when game changes
      setOptimizationResult(null)
    }
  }, [selectedGameId, games])

  // Optimize combination using Dynamic Programming
  const handleOptimize = (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedGameId || targetQty <= 0) return

    // Filter products for this game
    const gameProducts = products.filter(p => p.game_id === selectedGameId)
    const activeGame = games.find(g => g.id === selectedGameId)
    
    // Parse quantity of currency from name
    // Examples: "86 Diamonds" -> 86, "70 Diamonds + 10 Bonus" -> 80
    const parsedPackages = gameProducts.map(p => {
      const numbers = p.name.match(/\d+/g)
      let qty = 0
      if (numbers) {
        qty = numbers.reduce((acc: number, curr: string) => acc + parseInt(curr), 0)
        // If it was addition (like 70 + 10), it is correct. 
        // If the name is "86 Diamonds", numbers matches ["86"], qty = 86.
        // Let's make sure it handles Roblox like "Robux 800" or UC "60 UC"
      }
      return {
        id: p.id,
        name: p.name,
        slug: p.sku || p.id,
        sku: p.provider_sku,
        gameName: activeGame?.name,
        qty: qty,
        price: p.sell_price,
      }
    }).filter(p => p.qty > 0)

    if (parsedPackages.length === 0) {
      setOptimizationResult({
        error: "Tidak ada data paket produk aktif untuk game ini."
      })
      return
    }

    const optimal = solveOptimalCombination(targetQty, parsedPackages)
    
    if (optimal) {
      // Calculate Loyalty Points (e.g. 1 point for every Rp 1000 spent)
      const points = Math.floor(optimal.totalPrice / 1000)
      
      // Calculate payment method processing fee & discount
      let fee = 0
      let discount = 0
      if (paymentMethod === "qris") {
        fee = 0 // 0% QRIS promo
        discount = Math.floor(optimal.totalPrice * 0.02) // 2% dynamic promo discount
      } else if (paymentMethod === "shopeepay" || paymentMethod === "gopay") {
        fee = 500
      } else {
        fee = 1000 // Virtual Account
      }

      setOptimizationResult({
        ...optimal,
        points,
        fee,
        discount,
        finalPrice: optimal.totalPrice + fee - discount
      })
    } else {
      setOptimizationResult({
        error: "Gagal menemukan kombinasi optimal. Coba kurangi target nominal Anda."
      })
    }
  }

  // Solves the optimal combo to reach or exceed target qty with minimum cost
  const solveOptimalCombination = (target: number, packages: any[]) => {
    const pkgs = packages.filter(p => p.qty > 0)
    if (pkgs.length === 0) return null

    const maxQty = Math.max(...pkgs.map(p => p.qty))
    // We limit target + maxQty to keep DP array size small and search bounded
    const limit = Math.min(target + maxQty, 20000) 

    const dp = new Array(limit + 1).fill(Infinity)
    const parent = new Array(limit + 1).fill(-1)
    const pkgIdx = new Array(limit + 1).fill(-1)

    dp[0] = 0

    for (let i = 0; i <= limit; i++) {
      if (dp[i] === Infinity) continue
      for (let j = 0; j < pkgs.length; j++) {
        const p = pkgs[j]
        const next = i + p.qty
        if (next <= limit) {
          const cost = dp[i] + p.price
          if (cost < dp[next]) {
            dp[next] = cost
            parent[next] = i
            pkgIdx[next] = j
          }
        }
      }
    }

    // Find the minimum cost to get at least target
    let bestQty = target
    let minCost = Infinity
    for (let i = target; i <= limit; i++) {
      if (dp[i] < minCost) {
        minCost = dp[i]
        bestQty = i
      }
    }

    if (minCost === Infinity) return null

    // Reconstruct combination
    const resultQuantities: Record<string, number> = {}
    let curr = bestQty
    while (curr > 0 && parent[curr] !== -1) {
      const idx = pkgIdx[curr]
      if (idx === -1) break
      const p = pkgs[idx]
      resultQuantities[p.id] = (resultQuantities[p.id] || 0) + 1
      curr = parent[curr]
    }

    const items = pkgs.map(p => ({
      ...p,
      count: resultQuantities[p.id] || 0
    })).filter(item => item.count > 0)

    return {
      totalQty: bestQty,
      totalPrice: minCost,
      items
    }
  }

  // Bevel cut shapes
  const bevelStyle = {
    clipPath: "polygon(10px 0%, calc(100% - 10px) 0%, 100% 10px, 100% calc(100% - 10px), calc(100% - 10px) 100%, 10px 100%, 0% calc(100% - 10px), 0% 10px)"
  }

  const inputBevelStyle = {
    clipPath: "polygon(8px 0%, calc(100% - 8px) 0%, 100% 8px, 100% calc(100% - 8px), calc(100% - 8px) 100%, 8px 100%, 0% calc(100% - 8px), 0% 8px)"
  }

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden text-slate-100">
      
      {/* Mesh grid & glowing spots */}
      <div className="pointer-events-none fixed inset-0 mesh opacity-45 z-0" />
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-cyan-300/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl pointer-events-none" />

      <Header />

      <main className="flex-1 py-12 px-4 relative z-10 max-w-7xl mx-auto w-full">
        
        {/* Title HUD */}
        <div className="mb-10 text-center">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-cyan-300 text-ink mb-4 shadow-lg shadow-cyan-300/20">
            <Calculator className="h-6 w-6" />
          </div>
          <h1 className="text-3xl md:text-5xl font-black uppercase tracking-tight text-white mb-2">
            Topup Optimizer
          </h1>
          <p className="text-xs font-semibold tracking-widest text-cyan-300 uppercase">
            Kalkulator Belanja & Kombinasi Paket Hemat Game
          </p>
        </div>

        {isLoading ? (
          <div className="min-h-[300px] flex items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-cyan-300" />
          </div>
        ) : (
          <div className="grid md:grid-cols-12 gap-8 items-start">
            
            {/* Left Column: Form Input */}
            <div className="md:col-span-5 glass p-6 md:p-8 rounded-2xl border-white/10 shadow-xl relative overflow-hidden">
              <h2 className="text-lg font-black uppercase tracking-wide text-white mb-6 border-b border-white/5 pb-2 flex items-center gap-2">
                <Flame className="h-4 w-4 text-cyan-300 animate-pulse" />
                Parameter Optimasi
              </h2>

              <form onSubmit={handleOptimize} className="space-y-6">
                
                {/* Select Game */}
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-300 block">
                    Pilih Game Favorit
                  </label>
                  <div className="relative p-[1px] bg-white/10 focus-within:bg-cyan-300 transition-colors" style={inputBevelStyle}>
                    <select
                      value={selectedGameId}
                      onChange={(e) => setSelectedGameId(e.target.value)}
                      className="w-full bg-slate-950 px-4 py-3 outline-none text-sm text-white"
                      style={inputBevelStyle}
                    >
                      {games.map((g) => (
                        <option key={g.id} value={g.id} className="bg-slate-950 text-white">
                          {g.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Target Currency Input */}
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-300 block">
                    Target Jumlah {gameCurrencyName}
                  </label>
                  <div className="relative p-[1px] bg-white/10 focus-within:bg-cyan-300 transition-colors" style={inputBevelStyle}>
                    <input
                      type="number"
                      min="1"
                      max="15000"
                      value={targetQty}
                      onChange={(e) => setTargetQty(parseInt(e.target.value) || 0)}
                      className="w-full bg-slate-950 px-4 py-3 outline-none text-sm text-white font-mono"
                      style={inputBevelStyle}
                      required
                    />
                  </div>
                  <span className="text-[10px] text-slate-400 block">
                    Masukkan nominal yang Anda butuhkan (contoh: 250 atau 1000).
                  </span>
                </div>

                {/* Payment Method */}
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-300 block">
                    Metode Pembayaran
                  </label>
                  <div className="relative p-[1px] bg-white/10 focus-within:bg-cyan-300 transition-colors" style={inputBevelStyle}>
                    <select
                      value={paymentMethod}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="w-full bg-slate-950 px-4 py-3 outline-none text-sm text-white"
                      style={inputBevelStyle}
                    >
                      <option value="qris" className="bg-slate-950 text-white">QRIS (Potongan 2%)</option>
                      <option value="gopay" className="bg-slate-950 text-white">GoPay (Biaya Rp 500)</option>
                      <option value="shopeepay" className="bg-slate-950 text-white">ShopeePay (Biaya Rp 500)</option>
                      <option value="bca" className="bg-slate-950 text-white">BCA Virtual Account (Biaya Rp 1.000)</option>
                    </select>
                  </div>
                </div>

                {/* Submit Button */}
                <div
                  className="relative p-[1px] bg-gradient-to-r from-cyan-300/40 to-blue-500/40 hover:from-cyan-300 hover:to-blue-500 transition-all duration-300"
                  style={bevelStyle}
                >
                  <button
                    type="submit"
                    className="w-full bg-slate-950 py-3 text-xs font-bold uppercase tracking-widest text-cyan-300 hover:text-white transition flex items-center justify-center gap-2 shimmer-hover"
                    style={bevelStyle}
                  >
                    <RefreshCw className="h-4 w-4" />
                    Kalkulasikan Kombinasi Hemat
                  </button>
                </div>

              </form>
            </div>

            {/* Right Column: Output Results */}
            <div className="md:col-span-7 space-y-6">
              {optimizationResult ? (
                optimizationResult.error ? (
                  <div className="glass p-6 rounded-2xl border-red-500/20 bg-red-950/10 text-red-400 text-sm font-semibold flex items-center gap-3">
                    <Info className="h-5 w-5 text-red-500" />
                    {optimizationResult.error}
                  </div>
                ) : (
                  <div className="glass p-6 md:p-8 rounded-2xl border-white/10 shadow-neon-cyan relative overflow-hidden animate-fadeIn">
                    
                    {/* Header Summary */}
                    <div className="flex justify-between items-start border-b border-white/10 pb-4 mb-6">
                      <div>
                        <span className="text-[10px] font-black uppercase tracking-wider text-cyan-300 bg-cyan-300/10 px-2.5 py-1 rounded" style={inputBevelStyle}>
                          Optimasi Berhasil
                        </span>
                        <h3 className="text-xl font-extrabold uppercase mt-2 text-white">
                          Rekomendasi Paket
                        </h3>
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] text-slate-400 font-bold uppercase block">Estimasi Biaya</span>
                        <span className="text-2xl font-black text-cyan-300">
                          Rp {optimizationResult.finalPrice.toLocaleString("id-ID")}
                        </span>
                      </div>
                    </div>

                    {/* Combinations List */}
                    <div className="space-y-3 mb-6">
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Item yang Harus Dibeli:</p>
                      
                      {optimizationResult.items.map((item: any, idx: number) => (
                        <div key={idx} className="flex justify-between items-center bg-slate-950/50 p-4 rounded-xl border border-white/5 hover:border-cyan-300/20 transition-all duration-300 group">
                          <div className="flex items-center gap-3">
                            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white p-1.5">
                              <img
                                src={getItemAssetForProduct(item.name, item.sku, item.gameName)}
                                alt=""
                                className="max-h-full max-w-full object-contain"
                              />
                            </span>
                            <div>
                              <span className="text-[10px] font-bold text-cyan-300 bg-cyan-300/10 px-2 py-0.5 rounded">
                                {item.qty} Qty per Item
                              </span>
                              <p className="font-extrabold text-white mt-1 group-hover:text-cyan-300 transition-colors">
                                {item.name}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <span className="font-mono text-cyan-300 font-bold text-sm bg-white/5 px-2.5 py-1 rounded mr-3">
                              x{item.count} Paket
                            </span>
                            <span className="font-extrabold text-white text-sm">
                              Rp {(item.price * item.count).toLocaleString("id-ID")}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Optimization Specs */}
                    <div className="grid grid-cols-2 gap-4 bg-slate-950/80 p-5 rounded-xl border border-white/5 mb-6 text-xs">
                      <div>
                        <span className="text-slate-400 block font-medium mb-0.5">Mata Uang Target</span>
                        <span className="text-white font-bold">{targetQty} {gameCurrencyName}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block font-medium mb-0.5">Dihasilkan Paket</span>
                        <span className="text-green-400 font-bold flex items-center gap-1">
                          {optimizationResult.totalQty} {gameCurrencyName}
                          {optimizationResult.totalQty > targetQty && (
                            <span className="text-[10px] bg-green-500/15 text-green-300 px-1.5 py-0.5 rounded-full font-extrabold">
                              +{optimizationResult.totalQty - targetQty} Bonus
                            </span>
                          )}
                        </span>
                      </div>
                      <div className="border-t border-white/5 pt-2 mt-2">
                        <span className="text-slate-400 block font-medium mb-0.5">Subtotal Belanja</span>
                        <span className="text-white font-bold">Rp {optimizationResult.totalPrice.toLocaleString("id-ID")}</span>
                      </div>
                      <div className="border-t border-white/5 pt-2 mt-2">
                        <span className="text-slate-400 block font-medium mb-0.5">Potongan Promo QRIS</span>
                        <span className="text-green-400 font-bold">
                          {optimizationResult.discount > 0 ? `-Rp ${optimizationResult.discount.toLocaleString("id-ID")}` : "Rp 0"}
                        </span>
                      </div>
                    </div>

                    {/* Loyalty Points HUD panel */}
                    <div className="bg-gradient-to-r from-cyan-300/10 via-blue-500/5 to-transparent p-4 rounded-xl border border-cyan-300/20 flex items-center justify-between mb-6">
                      <div className="flex items-center gap-3">
                        <span className="grid h-8 w-8 place-items-center rounded bg-cyan-300 text-ink shadow">
                          <Award className="h-4.5 w-4.5" />
                        </span>
                        <div>
                          <p className="font-extrabold text-sm text-white">Loyalty Reward Points</p>
                          <p className="text-[10px] text-slate-400 font-semibold">Bisa ditukarkan dengan diskon topup berikutnya</p>
                        </div>
                      </div>
                      <span className="text-lg font-black text-cyan-300 font-mono">
                        +{optimizationResult.points} Poin
                      </span>
                    </div>

                    {/* Dynamic Action Button */}
                    <div className="flex justify-end">
                      <Link href={`/games/${games.find(g => g.id === selectedGameId)?.slug || "mobile-legends"}`} className="w-full">
                        <div
                          className="relative p-[1px] bg-gradient-to-r from-cyan-300/60 to-blue-500/60 hover:from-cyan-300 hover:to-blue-500 transition-all duration-300"
                          style={bevelStyle}
                        >
                          <button
                            className="w-full bg-slate-950 py-3.5 text-xs font-black uppercase tracking-widest text-cyan-300 hover:text-white transition flex items-center justify-center gap-2 shimmer-hover"
                            style={bevelStyle}
                          >
                            <ShoppingCart className="h-4 w-4 text-cyan-300" />
                            Beli Langsung ke Halaman Produk
                            <ChevronRight className="h-4 w-4" />
                          </button>
                        </div>
                      </Link>
                    </div>

                  </div>
                )
              ) : (
                <div className="glass p-8 rounded-2xl border-white/10 text-center flex flex-col items-center justify-center min-h-[350px]">
                  <Calculator className="h-12 w-12 text-slate-500 mb-4 animate-pulse" />
                  <h3 className="text-base font-extrabold uppercase text-white mb-2">Optimalisasi Belanja</h3>
                  <p className="text-xs text-slate-400 max-w-sm">
                    Isi target nominal mata uang game yang Anda butuhkan di sebelah kiri, kemudian klik tombol kalkulasi untuk melihat kombinasi paket harga paling hemat.
                  </p>
                </div>
              )}
            </div>

          </div>
        )}
      </main>

      <Footer />
    </div>
  )
}

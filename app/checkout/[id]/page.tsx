"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams, useSearchParams } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { SidebarContentWrapper } from "@/components/layout/sidebar-content-wrapper"
import { Skeleton } from "@/components/ui/skeleton"
import { createClient } from "@/lib/supabase/client"
import { formatCurrency } from "@/lib/utils"
import { gameAssets, getItemAssetForProduct, paymentAssets, getGameAsset } from "@/lib/assets"
import {
  ArrowLeft,
  QrCode,
  CreditCard,
  Smartphone,
  CheckCircle,
  Loader2,
} from "lucide-react"

const paymentMethods = [
  { id: "qris", name: "QRIS", icon: QrCode, logo: paymentAssets.qris, description: "Scan dengan aplikasi apapun" },
  { id: "gopay", name: "GoPay", icon: Smartphone, logo: paymentAssets.gopay, description: "Bayar dengan GoPay" },
  { id: "shopeepay", name: "ShopeePay", icon: CreditCard, logo: paymentAssets.shopeepay, description: "Bayar dengan ShopeePay" },
  { id: "ovo", name: "OVO", icon: CreditCard, logo: paymentAssets.ovo, description: "Bayar dengan OVO" },
  { id: "dana", name: "DANA", icon: Smartphone, logo: paymentAssets.dana, description: "Bayar dengan saldo DANA" },
]

export default function CheckoutPage() {
  const router = useRouter()
  const { id } = useParams() // id = provider_sku
  const searchParams = useSearchParams()
  const supabase = createClient()

  const targetFromUrl = searchParams.get("target") || ""
  const qtyFromUrl = parseInt(searchParams.get("qty") || "1", 10)
  const paymentFromUrl = searchParams.get("payment") || ""
  const loginMethodFromUrl = searchParams.get("login_method") || ""
  const passwordFromUrl = searchParams.get("password") || ""
  const notesFromUrl = searchParams.get("notes") || ""
  const whatsappFromUrl = searchParams.get("whatsapp") || ""

  const [step, setStep] = useState(1)
  const [isLoading, setIsLoading] = useState(false)
  const [autoSubmitted, setAutoSubmitted] = useState(false)
  const [selectedPayment, setSelectedPayment] = useState("")
  const [formData, setFormData] = useState({
    target_id: "",
    target_name: "",
    login_method: "",
    password: "",
    request_notes: "",
    customer_phone: "",
  })
  const [transactionData, setTransactionData] = useState<{
    invoice: string
    amount: number
    qr_string?: string
  } | null>(null)

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
        console.error("Failed to load public WA number:", err)
      }
    }
    fetchWaNumber()
  }, [])

  // Promo code states
  const [promoInput, setPromoInput] = useState("")
  const [promoApplied, setPromoApplied] = useState(false)
  const [validatingPromo, setValidatingPromo] = useState(false)
  const [promoError, setPromoError] = useState("")
  const [promoData, setPromoData] = useState<any>(null)

  const [product, setProduct] = useState<any>(null)
  const [loadingProduct, setLoadingProduct] = useState(true)

  // Fetch product based on provider_sku (with fallback support for mock checkout invoice lookup)
  useEffect(() => {
    if (!id) return

    const fetchProduct = async () => {
      setLoadingProduct(true)
      try {
        let skuStr = String(id)
        const invoiceNo = searchParams.get("invoice")

        if (skuStr === "mock" && invoiceNo) {
          const txRes = await fetch(`/api/transactions/check?invoice=${invoiceNo}`)
          const txData = await txRes.json()
          if (!txData.error && txData.transaction) {
            const tx = txData.transaction
            skuStr = tx.provider_sku
            
            setTransactionData({
              invoice: tx.invoice,
              amount: Number(tx.amount),
              qr_string: tx.qr_string || "MOCK_QR_STRING"
            })
            setFormData((prev) => ({
              ...prev,
              target_id: tx.target_id,
              customer_phone: tx.customer_phone || ""
            }))
            setStep(3)
          } else {
            console.error("Failed to load mock transaction:", txData.error)
            setLoadingProduct(false)
            return
          }
        }

        const res = await fetch(`/api/products/${skuStr}`)
        const { product: data, error } = await res.json()

        if (error || !data) {
          console.error("Failed to load product details:", error)
        } else {
          setProduct({
            id: data.id,
            name: data.name,
            sell_price: Number(data.sell_price) || 0,
            provider_sku: data.provider_sku,
            is_flash_sale: data.is_flash_sale ? true : false,
            flash_sale_price: Number(data.flash_sale_price) || 0,
            game: {
              name: data.game_name,
              icon: data.game_icon || "🎮",
              image: getGameAsset(data.game_slug)?.poster || data.game_icon || gameAssets["mobile-legends"].poster,
            },
          })
        }
      } catch (err) {
        console.error("Error fetching product:", err)
      } finally {
        setLoadingProduct(false)
      }
    }

    fetchProduct()
  }, [id, searchParams])

  useEffect(() => {
    if (targetFromUrl) {
      setFormData((prev) => ({ 
        ...prev, 
        target_id: targetFromUrl,
        login_method: loginMethodFromUrl,
        password: passwordFromUrl,
        request_notes: notesFromUrl,
        customer_phone: whatsappFromUrl
      }))
    }
  }, [targetFromUrl, loginMethodFromUrl, passwordFromUrl, notesFromUrl, whatsappFromUrl])

  useEffect(() => {
    if (targetFromUrl && whatsappFromUrl && id !== "mock") {
      setStep(2)
    }
  }, [targetFromUrl, whatsappFromUrl, id])

  useEffect(() => {
    if (paymentFromUrl) {
      const pm = paymentFromUrl.toLowerCase();
      if (pm === "va") {
        setSelectedPayment("qris")
      } else if (pm === "e-wallet") {
        setSelectedPayment("gopay")
      } else {
        setSelectedPayment(pm)
      }
    }
  }, [paymentFromUrl])

  // Automatically submit payment generation if user comes with complete URL params
  useEffect(() => {
    if (loadingProduct || !product) return
    if (autoSubmitted) return
    
    const targetVal = searchParams.get("target")
    const paymentVal = searchParams.get("payment")
    const whatsappVal = searchParams.get("whatsapp")

    // Do not run if id === "mock" because it is a mockup screen for already existing invoice
    if (id === "mock") return

    if (targetVal && paymentVal && whatsappVal) {
      setAutoSubmitted(true)
      
      let pm = paymentVal.toLowerCase()
      if (pm === "va") pm = "qris"
      else if (pm === "e-wallet") pm = "gopay"
      
      const matchedMethod = paymentMethods.find(m => m.id === pm)
      if (matchedMethod) {
        setSelectedPayment(matchedMethod.id)
        
        const autoSubmit = async () => {
          setIsLoading(true)
          try {
            // Check promo code if present
            const promoVal = searchParams.get("promo")
            let activePromo = null
            if (promoVal) {
              const promoRes = await fetch("/api/promo/validate", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ code: promoVal }),
              })
              const promoJson = await promoRes.json()
              if (!promoJson.error) {
                activePromo = promoVal
              }
            }

            const response = await fetch("/api/transactions/create", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                product_id: product.id,
                target_id: targetVal,
                target_name: null,
                payment_method: matchedMethod.id,
                quantity: qtyFromUrl,
                promo_code: activePromo,
                login_method: loginMethodFromUrl || null,
                password: passwordFromUrl || null,
                request_notes: notesFromUrl || null,
                customer_phone: whatsappFromUrl || null,
              }),
            })

            const resJson = await response.json()
            if (resJson.error) {
              throw new Error(resJson.error)
            }

            const tx = resJson.data
            if (tx.payment_url) {
              window.location.href = tx.payment_url;
              return;
            }

            setTransactionData({
              invoice: tx.invoice,
              amount: tx.amount,
              qr_string: tx.qr_string,
            })
            setStep(3)
          } catch (error: any) {
            console.error("Auto checkout payment creation failed:", error)
            alert(`Gagal membuat pembayaran otomatis: ${error.message}`)
          } finally {
            setIsLoading(false)
          }
        }
        
        setTimeout(autoSubmit, 500)
      }
    }
  }, [id, loadingProduct, product, autoSubmitted, searchParams, qtyFromUrl, loginMethodFromUrl, passwordFromUrl, notesFromUrl, whatsappFromUrl])

  const handleApplyPromo = async () => {
    if (!promoInput.trim() || !product) return
    setValidatingPromo(true)
    setPromoError("")
    try {
      const response = await fetch("/api/promo/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: promoInput }),
      })
      const resJson = await response.json()
      if (resJson.error) {
        setPromoError(resJson.error)
      } else {
        setPromoData(resJson.promo)
        setPromoApplied(true)
      }
    } catch (err: any) {
      setPromoError("Gagal memvalidasi kode promo.")
    } finally {
      setValidatingPromo(false)
    }
  }

  const handleRemovePromo = () => {
    setPromoInput("")
    setPromoApplied(false)
    setPromoData(null)
    setPromoError("")
  }

  const handleSubmitTarget = async (e: React.FormEvent) => {
    e.preventDefault()
    setStep(2)
  }

  const handleSelectPayment = (method: string) => {
    setSelectedPayment(method)
  }

  const handleCreatePayment = async () => {
    if (!selectedPayment || !product) return

    setIsLoading(true)
    try {
      const response = await fetch("/api/transactions/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          product_id: product.id,
          target_id: formData.target_id,
          target_name: formData.target_name || null,
          payment_method: selectedPayment,
          quantity: qtyFromUrl,
          promo_code: promoApplied ? promoInput : null,
          login_method: formData.login_method || null,
          password: formData.password || null,
          request_notes: formData.request_notes || null,
          customer_phone: formData.customer_phone || null,
        }),
      })

      const resJson = await response.json()
      if (resJson.error) {
        throw new Error(resJson.error)
      }

      const tx = resJson.data
      if (tx.payment_url) {
        window.location.href = tx.payment_url;
        return;
      }

      setTransactionData({
        invoice: tx.invoice,
        amount: tx.amount,
        qr_string: tx.qr_string,
      })

      setStep(3)
    } catch (error: any) {
      console.error("Payment creation failed:", error)
      alert(`Gagal membuat pembayaran: ${error.message}`)
    } finally {
      setIsLoading(false)
    }
  }

  const handlePaymentComplete = async () => {
    if (!transactionData) return

    setIsLoading(true)
    try {
      const response = await fetch("/api/transactions/pay", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          invoice: transactionData.invoice,
        }),
      })

      const resJson = await response.json()
      if (resJson.error) {
        throw new Error(resJson.error)
      }

      // Redirect to success page
      router.push(`/history/${transactionData.invoice}`)
    } catch (error: any) {
      console.error("Payment verification failed:", error)
      alert(`Verifikasi pembayaran gagal: ${error.message}`)
    } finally {
      setIsLoading(false)
    }
  }

  const basePrice = product?.is_flash_sale && product?.flash_sale_price
    ? Number(product.flash_sale_price)
    : product?.sell_price || 0;

  const rawTotal = basePrice * qtyFromUrl;

  let discount = 0;
  if (promoApplied && promoData) {
    if (Number(promoData.discount_percent) > 0) {
      discount = Math.round(rawTotal * (Number(promoData.discount_percent) / 100));
    } else if (Number(promoData.discount_amount) > 0) {
      discount = Number(promoData.discount_amount);
    }
    discount = Math.min(discount, rawTotal - 1);
  }
  const finalTotal = rawTotal - discount;

  if (loadingProduct || !product) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        <SidebarContentWrapper>
          <main className="flex-1 py-8">
            <div className="container max-w-4xl space-y-8">
              {/* Back link */}
              <Skeleton className="h-4 w-20 rounded bg-sky/10" />

              {/* Progress Steps */}
              <div className="flex items-center justify-center gap-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-center gap-2">
                    <Skeleton className="h-8 w-8 rounded-full bg-sky/10" />
                    <Skeleton className="hidden sm:block h-4 w-16 rounded bg-sky/10" />
                    {i < 3 && <Skeleton className="h-0.5 w-12 rounded bg-sky/10" />}
                  </div>
                ))}
              </div>

              {/* Main Grid */}
              <div className="grid md:grid-cols-12 gap-8 items-start">
                {/* Left Column: Form Placeholder */}
                <div className="md:col-span-7 bg-white/60 p-6 md:p-8 rounded-2xl border border-sky-border shadow-sky-soft space-y-6">
                  <Skeleton className="h-6 w-48 rounded-lg bg-sky/10" />
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Skeleton className="h-4.5 w-28 rounded bg-sky/10" />
                      <Skeleton className="h-11 w-full rounded-xl bg-sky/10" />
                    </div>
                    <div className="space-y-2">
                      <Skeleton className="h-4.5 w-28 rounded bg-sky/10" />
                      <Skeleton className="h-11 w-full rounded-xl bg-sky/10" />
                    </div>
                  </div>
                  <Skeleton className="h-11 w-full rounded-xl mt-6 bg-sky/10" />
                </div>

                {/* Right Column: Order Details */}
                <div className="md:col-span-5 bg-white p-6 rounded-2xl border border-sky-border shadow-sky-soft space-y-6">
                  <Skeleton className="h-6 w-36 rounded-lg bg-sky/10" />
                  <div className="flex items-center gap-4 p-4 border border-sky-border/30 rounded-xl">
                    <Skeleton className="h-12 w-12 rounded-xl shrink-0 bg-sky/10" />
                    <div className="space-y-2 flex-1">
                      <Skeleton className="h-4.5 w-20 rounded bg-sky/10" />
                      <Skeleton className="h-3.5 w-32 rounded bg-sky/10" />
                    </div>
                  </div>
                  <div className="space-y-3 pt-4 border-t border-sky-border">
                    <div className="flex justify-between">
                      <Skeleton className="h-4 w-20 rounded bg-sky/10" />
                      <Skeleton className="h-4 w-16 rounded bg-sky/10" />
                    </div>
                    <div className="flex justify-between">
                      <Skeleton className="h-4 w-24 rounded bg-sky/10" />
                      <Skeleton className="h-4 w-20 rounded bg-sky/10" />
                    </div>
                    <div className="flex justify-between pt-2 border-t border-sky-border/50">
                      <Skeleton className="h-5 w-24 rounded bg-sky/10" />
                      <Skeleton className="h-5 w-28 rounded bg-sky/10" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </main>
          <Footer />
        </SidebarContentWrapper>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <SidebarContentWrapper>
        <main className="flex-1 py-8">
        <div className="container max-w-4xl">
          {/* Back Button */}
          <Link
            href="/games/mobile-legends"
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-text-primary mb-6"
          >
            <ArrowLeft className="h-4 w-4" />
            Kembali
          </Link>

          {/* Progress Steps */}
          <div className="flex items-center justify-center gap-4 mb-8">
            {["Input Data", "Pembayaran", "Selesai"].map((label, index) => (
              <div key={label} className="flex items-center gap-2">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                    step > index + 1
                      ? "bg-green-500 text-white"
                      : step === index + 1
                      ? "bg-primary text-white"
                      : "bg-ice text-muted-foreground"
                  }`}
                >
                  {step > index + 1 ? (
                    <CheckCircle className="h-4 w-4" />
                  ) : (
                    index + 1
                  )}
                </div>
                <span className="text-sm hidden sm:inline">{label}</span>
                {index < 2 && (
                  <div className="w-12 h-0.5 bg-sky-border hidden sm:block" />
                )}
              </div>
            ))}
          </div>

          {/* Step 1: Input Target */}
          {step === 1 && (
            <div className="grid md:grid-cols-2 gap-6">
              {/* Product Summary */}
              <Card>
                <CardHeader>
                  <CardTitle>Ringkasan Pesanan</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex gap-4 mb-4">
                    <div className="relative w-20 h-20 rounded-lg overflow-hidden">
                      <Image
                        src={product.game.image}
                        alt={product.game.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div>
                      <span className="mb-2 flex h-9 w-9 items-center justify-center rounded-lg bg-ice p-1.5">
                        <img
                          src={getItemAssetForProduct(product.name, product.provider_sku, product.game.name)}
                          alt=""
                          className="max-h-full max-w-full object-contain"
                        />
                      </span>
                      <p className="font-semibold">{product.game.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {product.name}
                      </p>
                    </div>
                  </div>
                  <div className="border-t border-sky-border pt-4">
                    <div className="flex justify-between mb-2">
                      <span className="text-muted-foreground">Harga</span>
                      <span>{formatCurrency(basePrice)}</span>
                    </div>
                    {discount > 0 && (
                      <div className="flex justify-between mb-2 text-green-600 font-semibold">
                        <span>Diskon Promo</span>
                        <span>-{formatCurrency(discount)}</span>
                      </div>
                    )}
                    <div className="flex justify-between font-semibold text-lg">
                      <span>Total</span>
                      <span className="text-primary">
                        {formatCurrency(finalTotal)}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Target Form */}
              <Card>
                <CardHeader>
                  <CardTitle>Data Player</CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmitTarget} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="target_id">ID Player</Label>
                      <Input
                        id="target_id"
                        placeholder="Masukkan ID game kamu"
                        value={formData.target_id}
                        onChange={(e) =>
                          setFormData({ ...formData, target_id: e.target.value })
                        }
                        required
                      />
                      <p className="text-xs text-muted-foreground">
                        Contoh: 12345678 (1234)
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="target_name">Nickname (Opsional)</Label>
                      <Input
                        id="target_name"
                        placeholder="Masukkan nickname"
                        value={formData.target_name}
                        onChange={(e) =>
                          setFormData({ ...formData, target_name: e.target.value })
                        }
                      />
                    </div>

                    {formData.login_method && (
                      <div className="space-y-2">
                        <Label htmlFor="login_method">Metode Login</Label>
                        <Input
                          id="login_method"
                          value={formData.login_method}
                          disabled
                          className="bg-slate-50 text-muted-foreground"
                        />
                      </div>
                    )}

                    {formData.password && (
                      <div className="space-y-2">
                        <Label htmlFor="password">Password Akun</Label>
                        <Input
                          id="password"
                          type="password"
                          value={formData.password}
                          disabled
                          className="bg-slate-50 text-muted-foreground"
                        />
                      </div>
                    )}

                    {formData.request_notes && (
                      <div className="space-y-2">
                        <Label htmlFor="request_notes">Catatan Khusus</Label>
                        <Input
                          id="request_notes"
                          value={formData.request_notes}
                          disabled
                          className="bg-slate-50 text-muted-foreground"
                        />
                      </div>
                    )}

                    <div className="space-y-2 pt-2 border-t border-sky-border/40">
                      <Label htmlFor="promo_code">Kode Promo / Referral (Opsional)</Label>
                      <div className="flex gap-2">
                        <Input
                          id="promo_code"
                          placeholder="Contoh: MITSURU20"
                          value={promoInput}
                          onChange={(e) => setPromoInput(e.target.value)}
                          disabled={promoApplied}
                          className="flex-1"
                        />
                        {promoApplied ? (
                          <Button
                            type="button"
                            variant="destructive"
                            onClick={handleRemovePromo}
                          >
                            Hapus
                          </Button>
                        ) : (
                          <Button
                            type="button"
                            onClick={handleApplyPromo}
                            disabled={!promoInput.trim() || validatingPromo}
                          >
                            {validatingPromo ? <Loader2 className="h-4 w-4 animate-spin" /> : "Terapkan"}
                          </Button>
                        )}
                      </div>
                      {promoError && (
                        <p className="text-xs text-red-500 font-semibold">{promoError}</p>
                      )}
                      {promoApplied && promoData && (
                        <p className="text-xs text-green-600 font-bold">
                          Promo berhasil diterapkan! Diskon: {Number(promoData.discount_percent) > 0 ? `${promoData.discount_percent}%` : formatCurrency(promoData.discount_amount)}
                        </p>
                      )}
                    </div>

                    <Button type="submit" className="w-full">
                      Lanjutkan ke Pembayaran
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Step 2: Payment Method */}
          {step === 2 && (
            <div className="grid md:grid-cols-2 gap-6">
              {/* Payment Methods */}
              <Card>
                <CardHeader>
                  <CardTitle>Pilih Metode Pembayaran</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {paymentMethods.map((method) => (
                      <button
                        key={method.id}
                        onClick={() => handleSelectPayment(method.id)}
                        className={`w-full p-4 rounded-xl border transition-all ${
                          selectedPayment === method.id
                            ? "border-primary bg-primary/10"
                            : "border-sky-border hover:border-sky-border/80"
                        }`}
                      >
                        <div className="flex items-center gap-4">
                          <span className="flex h-9 w-14 items-center justify-center rounded bg-white p-1.5">
                            <img src={method.logo} alt={method.name} className="max-h-full max-w-full object-contain" />
                          </span>
                          <div className="text-left flex-1">
                            <p className="font-medium">{method.name}</p>
                            <p className="text-sm text-muted-foreground">
                              {method.description}
                            </p>
                          </div>
                          {selectedPayment === method.id && (
                            <CheckCircle className="h-5 w-5 text-primary" />
                          )}
                        </div>
                      </button>
                    ))}
                  </div>

                  <Button
                    onClick={handleCreatePayment}
                    disabled={!selectedPayment || isLoading}
                    className="w-full mt-6"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Membuat Pembayaran...
                      </>
                    ) : (
                      "Bayar Sekarang"
                    )}
                  </Button>
                </CardContent>
              </Card>

              {/* Order Summary */}
              <Card>
                <CardHeader>
                  <CardTitle>Ringkasan Pesanan</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4 pb-4 border-b border-sky-border/40">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground text-sm">Produk</span>
                      <span className="font-semibold text-sm">{product.name} (x{qtyFromUrl})</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground text-sm">Target</span>
                      <span className="font-semibold text-sm">{formData.target_id}</span>
                    </div>
                  </div>

                  {/* Promo Voucher block in Step 2 */}
                  <div className="space-y-2">
                    <Label htmlFor="promo_code_step2" className="text-xs font-bold uppercase tracking-wider text-text-secondary">Kode Promo / Voucher (Opsional)</Label>
                    <div className="flex gap-2">
                      <Input
                        id="promo_code_step2"
                        placeholder="Masukkan kode promo"
                        value={promoInput}
                        onChange={(e) => setPromoInput(e.target.value)}
                        disabled={promoApplied}
                        className="flex-1 text-sm h-10"
                      />
                      {promoApplied ? (
                        <Button
                          type="button"
                          variant="destructive"
                          onClick={handleRemovePromo}
                          className="h-10"
                        >
                          Hapus
                        </Button>
                      ) : (
                        <Button
                          type="button"
                          onClick={handleApplyPromo}
                          disabled={!promoInput.trim() || validatingPromo}
                          className="h-10 px-4"
                        >
                          {validatingPromo ? <Loader2 className="h-4 w-4 animate-spin" /> : "Gunakan"}
                        </Button>
                      )}
                    </div>
                    {promoError && (
                      <p className="text-xs text-red-500 font-semibold mt-1">{promoError}</p>
                    )}
                    {promoApplied && promoData && (
                      <p className="text-xs text-green-600 font-bold mt-1">
                        Promo berhasil diterapkan! Diskon: {Number(promoData.discount_percent) > 0 ? `${promoData.discount_percent}%` : formatCurrency(promoData.discount_amount)}
                      </p>
                    )}
                  </div>

                  <div className="pt-2">
                    {discount > 0 && (
                      <div className="flex justify-between text-green-600 font-semibold mb-2 text-sm">
                        <span>Diskon Promo</span>
                        <span>-{formatCurrency(discount)}</span>
                      </div>
                    )}
                    <div className="border-t border-sky-border pt-4 flex justify-between font-semibold text-lg">
                      <span>Total</span>
                      <span className="text-primary font-mono text-xl">
                        {formatCurrency(finalTotal)}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Step 3: Payment */}
          {step === 3 && transactionData && (
            <div className="grid md:grid-cols-2 gap-6">
              {/* QR Code */}
              <Card>
                <CardHeader>
                  <CardTitle>Scan QRIS</CardTitle>
                </CardHeader>
                <CardContent className="text-center">
                  <div className="bg-white p-4 rounded-xl inline-block mb-4 shadow-sm border border-sky-border/40">
                    <img
                      src={`https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(transactionData.qr_string || transactionData.invoice)}`}
                      alt="QRIS Code"
                      className="h-48 w-48 object-contain"
                    />
                  </div>
                  <p className="text-sm text-muted-foreground mb-4">
                    Scan QRIS di atas menggunakan aplikasi E-Wallet atau Mobile
                    Banking kamu
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Kadaluarsa: 15 menit
                  </p>
                </CardContent>
              </Card>

              {/* Order Summary */}
              <Card>
                <CardHeader>
                  <CardTitle>Detail Pembayaran</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Invoice</span>
                      <span className="font-mono">{transactionData.invoice}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Produk</span>
                      <span>{product.name} (x{qtyFromUrl})</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Target</span>
                      <span>{formData.target_id}</span>
                    </div>
                    <div className="border-t border-sky-border pt-4 flex justify-between font-semibold text-lg">
                      <span>Total</span>
                      <span className="text-primary">
                        {formatCurrency(transactionData.amount)}
                      </span>
                    </div>
                  </div>

                  <Button
                    onClick={handlePaymentComplete}
                    disabled={isLoading}
                    className="w-full mt-6"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Memverifikasi Pembayaran...
                      </>
                    ) : (
                      <>
                        Saya Sudah Bayar
                      </>
                    )}
                  </Button>

                  <p className="text-xs text-muted-foreground text-center mt-4">
                    Jangan tutup halaman ini sampai pembayaran selesai
                  </p>

                  {/* Help Button */}
                  <div className="mt-4 border-t border-sky-border pt-4">
                    <a
                      href={`https://wa.me/${waAdminNumber.replace(/[^0-9]/g, "")}?text=Halo%20Admin%20Mitsuru,%20saya%20butuh%20bantuan%20mengenai%20transaksi%20Invoice%20${transactionData.invoice}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-black uppercase tracking-widest py-3 px-4 rounded-xl shadow-sky-soft hover:shadow-sky-medium transition-all duration-300 flex items-center justify-center gap-2"
                    >
                      Bantuan WhatsApp Admin 💬
                    </a>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
        </main>

        <Footer />
      </SidebarContentWrapper>
    </div>
  )
}
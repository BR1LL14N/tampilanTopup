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
]

export default function CheckoutPage() {
  const router = useRouter()
  const { id } = useParams() // id = provider_sku
  const searchParams = useSearchParams()
  const supabase = createClient()

  const targetFromUrl = searchParams.get("target") || ""
  const qtyFromUrl = parseInt(searchParams.get("qty") || "1", 10)
  const paymentFromUrl = searchParams.get("payment") || ""

  const [step, setStep] = useState(1)
  const [isLoading, setIsLoading] = useState(false)
  const [selectedPayment, setSelectedPayment] = useState("")
  const [formData, setFormData] = useState({
    target_id: "",
    target_name: "",
  })
  const [transactionData, setTransactionData] = useState<{
    invoice: string
    amount: number
    qr_string?: string
  } | null>(null)

  const [product, setProduct] = useState<any>(null)
  const [loadingProduct, setLoadingProduct] = useState(true)

  // Fetch product from Supabase based on provider_sku
  useEffect(() => {
    if (!id) return

    const fetchProduct = async () => {
      setLoadingProduct(true)
      try {
        const skuStr = String(id)
        const { data, error } = await supabase
          .from("product_details")
          .select("*")
          .eq("provider_sku", skuStr)
          .single()

        if (error || !data) {
          console.error("Failed to load product details:", error)
        } else {
          setProduct({
            id: data.id,
            name: data.name,
            sell_price: data.sell_price,
            provider_sku: data.provider_sku,
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
  }, [id])

  // Populate data from URL params
  useEffect(() => {
    if (targetFromUrl) {
      setFormData((prev) => ({ ...prev, target_id: targetFromUrl }))
    }
  }, [targetFromUrl])

  useEffect(() => {
    if (paymentFromUrl) {
      setSelectedPayment(paymentFromUrl.toLowerCase())
    }
  }, [paymentFromUrl])

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
        }),
      })

      const resJson = await response.json()
      if (resJson.error) {
        throw new Error(resJson.error)
      }

      const tx = resJson.data
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

  if (loadingProduct || !product) {
    return (
      <div className="min-h-screen flex flex-col bg-background text-white">
        <Header />
        <main className="flex-1 flex flex-col items-center justify-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-xs font-bold uppercase tracking-widest text-slate-400">Memuat Rincian Produk...</p>
        </main>
        <Footer />
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
                      <span>{formatCurrency(product.sell_price)}</span>
                    </div>
                    <div className="flex justify-between font-semibold text-lg">
                      <span>Total</span>
                      <span className="text-primary">
                        {formatCurrency(product.sell_price * qtyFromUrl)}
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
                <CardContent>
                  <div className="space-y-4">
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
                        {formatCurrency(product.sell_price * qtyFromUrl)}
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
                  <div className="bg-white p-4 rounded-xl inline-block mb-4">
                    <QrCode className="h-48 w-48 text-black" />
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
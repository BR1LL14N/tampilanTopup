"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { createClient } from "@/lib/supabase/client"
import { formatCurrency, generateInvoice } from "@/lib/utils"
import { GameIcon } from "@/components/game/game-icon"
import {
  ArrowLeft,
  QrCode,
  CreditCard,
  Smartphone,
  CheckCircle,
  Loader2,
} from "lucide-react"

// Mock product data
const mockProduct = {
  id: "1",
  name: "86 Diamonds",
  sell_price: 25000,
  provider_sku: "ML86",
  game: {
    name: "Mobile Legends",
    icon: "🎮",
    image: "https://images.unsplash.com/photo-1538481199705-c710c4e965fc?w=400&h=300&fit=crop",
  },
}

const paymentMethods = [
  { id: "qris", name: "QRIS", icon: QrCode, description: "Scan dengan aplikasi apapun" },
  { id: "gopay", name: "GoPay", icon: Smartphone, description: "Bayar dengan GoPay" },
  { id: "shopeepay", name: "ShopeePay", icon: CreditCard, description: "Bayar dengan ShopeePay" },
  { id: "ovo", name: "OVO", icon: CreditCard, description: "Bayar dengan OVO" },
]

export default function CheckoutPage() {
  const router = useRouter()
  const supabase = createClient()
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

  const handleSubmitTarget = async (e: React.FormEvent) => {
    e.preventDefault()
    setStep(2)
  }

  const handleSelectPayment = (method: string) => {
    setSelectedPayment(method)
  }

  const handleCreatePayment = async () => {
    if (!selectedPayment) return

    setIsLoading(true)
    try {
      // Generate invoice
      const invoice = generateInvoice()

      // Create transaction in Supabase (mock for now)
      // In production, this would call your backend API

      // Simulate payment creation
      await new Promise((resolve) => setTimeout(resolve, 1500))

      setTransactionData({
        invoice,
        amount: mockProduct.sell_price,
        qr_string: "00020101021226620009com.bri.ccho.id010911000000000001020326303003000000000000000052040000000000000000052069000016000000000000000000103015802091573303710501000008000005820333待定00000000000000000000000000",
      })

      setStep(3)
    } catch (error) {
      console.error("Payment creation failed:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handlePaymentComplete = async () => {
    setIsLoading(true)
    try {
      // Simulate payment verification
      await new Promise((resolve) => setTimeout(resolve, 2000))

      // Redirect to success page
      router.push(`/history/${transactionData?.invoice}`)
    } catch (error) {
      console.error("Payment verification failed:", error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 py-8">
        <div className="container max-w-4xl">
          {/* Back Button */}
          <Link
            href="/games/mobile-legends"
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-white mb-6"
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
                      : "bg-white/10 text-muted-foreground"
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
                  <div className="w-12 h-0.5 bg-white/10 hidden sm:block" />
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
                        src={mockProduct.game.image}
                        alt={mockProduct.game.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div>
                      <GameIcon slug={mockProduct.game.name.toLowerCase().replace(/ /g, "-")} className="h-6 w-6 text-muted-foreground align-text-bottom mb-1" />
                      <p className="font-semibold">{mockProduct.game.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {mockProduct.name}
                      </p>
                    </div>
                  </div>
                  <div className="border-t border-white/10 pt-4">
                    <div className="flex justify-between mb-2">
                      <span className="text-muted-foreground">Harga</span>
                      <span>{formatCurrency(mockProduct.sell_price)}</span>
                    </div>
                    <div className="flex justify-between font-semibold text-lg">
                      <span>Total</span>
                      <span className="text-primary">
                        {formatCurrency(mockProduct.sell_price)}
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
                            : "border-white/10 hover:border-white/20"
                        }`}
                      >
                        <div className="flex items-center gap-4">
                          <method.icon className="h-6 w-6 text-primary" />
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
                      <span>{mockProduct.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Target</span>
                      <span>{formData.target_id}</span>
                    </div>
                    <div className="border-t border-white/10 pt-4 flex justify-between font-semibold text-lg">
                      <span>Total</span>
                      <span className="text-primary">
                        {formatCurrency(mockProduct.sell_price)}
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
                      <span>{mockProduct.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Target</span>
                      <span>{formData.target_id}</span>
                    </div>
                    <div className="border-t border-white/10 pt-4 flex justify-between font-semibold text-lg">
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
    </div>
  )
}
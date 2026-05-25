"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { createClient } from "@/lib/supabase/client"
import { Loader2 } from "lucide-react"

export default function CheckTransactionPage() {
  const supabase = createClient()
  const [invoice, setInvoice] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState("")

  const handleCheck = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")
    setResult(null)

    try {
      // Mock for now - in production, query Supabase
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // Simulate not found
      setError("Transaksi tidak ditemukan")
    } catch (err) {
      setError("Terjadi kesalahan. Silakan coba lagi.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 py-16">
        <div className="container max-w-xl">
          <div className="text-center mb-8">
            <h1 className="text-3xl md:text-4xl font-bold mb-4">
              Cek Transaksi
            </h1>
            <p className="text-muted-foreground">
              Masukkan nomor invoice untuk melihat status transaksi kamu
            </p>
          </div>

          <Card>
            <CardContent className="p-6">
              <form onSubmit={handleCheck} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="invoice">Nomor Invoice</Label>
                  <Input
                    id="invoice"
                    placeholder="Contoh: INV-20260525-0001"
                    value={invoice}
                    onChange={(e) => setInvoice(e.target.value)}
                    required
                  />
                </div>

                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Mencari...
                    </>
                  ) : (
                    "Cek Status"
                  )}
                </Button>
              </form>

              {error && (
                <div className="mt-4 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-center">
                  {error}
                </div>
              )}

              {result && (
                <div className="mt-6 p-4 rounded-xl bg-white/5 border border-white/10">
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Invoice</span>
                      <span className="font-mono">{result.invoice}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Produk</span>
                      <span>{result.product}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Target</span>
                      <span>{result.target_id}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Total</span>
                      <span className="font-bold">Rp {result.amount.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Status</span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        result.status === 'success' ? 'bg-green-500/10 text-green-500' :
                        result.status === 'processing' ? 'bg-yellow-500/10 text-yellow-500' :
                        'bg-red-500/10 text-red-500'
                      }`}>
                        {result.status === 'success' ? 'Berhasil' :
                         result.status === 'processing' ? 'Diproses' : 'Gagal'}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  )
}
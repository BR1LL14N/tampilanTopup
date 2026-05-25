"use client"

import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { formatCurrency, formatDate } from "@/lib/utils"
import { GameIcon } from "@/components/game/game-icon"
import {
  Wallet,
  Clock,
  CheckCircle,
  XCircle,
  ArrowRight,
  TrendingUp,
  ShoppingBag,
} from "lucide-react"

// Mock user data
const userData = {
  name: "John Doe",
  email: "john@example.com",
}

const stats = [
  { label: "Total Transaksi", value: "12", icon: ShoppingBag, color: "text-primary" },
  { label: "Berhasil", value: "10", icon: CheckCircle, color: "text-green-500" },
  { label: "Pending", value: "1", icon: Clock, color: "text-yellow-500" },
  { label: "Gagal", value: "1", icon: XCircle, color: "text-red-500" },
]

const recentTransactions = [
  {
    invoice: "INV-20260525-0001",
    product: "86 Diamonds",
    game: "Mobile Legends",
    icon: "🎮",
    amount: 25000,
    status: "success",
    date: "2026-05-25T10:30:00Z",
  },
  {
    invoice: "INV-20260524-0001",
    product: "70 Diamonds + 10 Bonus",
    game: "Free Fire",
    icon: "🔥",
    amount: 18000,
    status: "success",
    date: "2026-05-24T15:45:00Z",
  },
  {
    invoice: "INV-20260523-0001",
    product: "60 UC",
    game: "PUBG Mobile",
    icon: "🎯",
    amount: 22000,
    status: "processing",
    date: "2026-05-23T08:20:00Z",
  },
]

export default function DashboardPage() {
  const totalSpent = recentTransactions.reduce((sum, tx) => sum + tx.amount, 0)

  return (
    <div className="min-h-screen flex flex-col">
      <Header user={{ name: userData.name, email: userData.email, role: "user" }} />

      <main className="flex-1 py-8">
        <div className="container">
          {/* Welcome Section */}
          <div className="mb-8">
            <h1 className="text-3xl md:text-4xl font-bold mb-2">
              Halo, {userData.name}! 👋
            </h1>
            <p className="text-muted-foreground">
              Selamat datang di dashboard GameTopup
            </p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {stats.map((stat, index) => (
              <Card key={index}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-2">
                    <stat.icon className={`h-5 w-5 ${stat.color}`} />
                  </div>
                  <p className="text-2xl font-bold">{stat.value}</p>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="grid lg:grid-cols-3 gap-6">
            {/* Recent Transactions */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle>Transaksi Terakhir</CardTitle>
                  <Link href="/history">
                    <Button variant="ghost" size="sm" className="gap-2">
                      Lihat Semua
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </Link>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {recentTransactions.map((tx, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-4 bg-white/5 rounded-xl"
                      >
                        <div className="flex items-center gap-4">
                          <GameIcon slug={tx.game.toLowerCase().replace(/ /g, "-")} className="h-6 w-6 text-muted-foreground align-text-bottom" />
                          <div>
                            <p className="font-medium">{tx.product}</p>
                            <p className="text-sm text-muted-foreground">
                              {tx.game} • {tx.invoice}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold">
                            {formatCurrency(tx.amount)}
                          </p>
                          <p
                            className={`text-xs ${
                              tx.status === "success"
                                ? "text-green-500"
                                : "text-yellow-500"
                            }`}
                          >
                            {tx.status === "success" ? "Berhasil" : "Diproses"}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Quick Actions */}
            <div className="space-y-6">
              {/* Total Spending */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-primary" />
                    Total Pengeluaran
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold text-primary">
                    {formatCurrency(totalSpent)}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Dari {recentTransactions.length} transaksi
                  </p>
                </CardContent>
              </Card>

              {/* Quick Actions */}
              <Card>
                <CardHeader>
                  <CardTitle>Aksi Cepat</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Link href="/games" className="block">
                    <Button variant="outline" className="w-full justify-start gap-2">
                      <ShoppingBag className="h-4 w-4" />
                      Top Up Sekarang
                    </Button>
                  </Link>
                  <Link href="/history" className="block">
                    <Button variant="outline" className="w-full justify-start gap-2">
                      <Clock className="h-4 w-4" />
                      Riwayat Transaksi
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
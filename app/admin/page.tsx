"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Header } from "@/components/layout/header"
import { formatCurrency } from "@/lib/utils"
import {
  TrendingUp,
  ShoppingBag,
  Users,
  Gamepad2,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react"

// Mock data
const stats = [
  {
    title: "Total Revenue",
    value: "Rp 15.750.000",
    change: "+12.5%",
    trend: "up",
    icon: TrendingUp,
  },
  {
    title: "Total Transaksi",
    value: "156",
    change: "+8.2%",
    trend: "up",
    icon: ShoppingBag,
  },
  {
    title: "Total User",
    value: "89",
    change: "+15.3%",
    trend: "up",
    icon: Users,
  },
  {
    title: "Total Game",
    value: "6",
    change: "0%",
    trend: "neutral",
    icon: Gamepad2,
  },
]

const recentTransactions = [
  {
    invoice: "INV-20260525-0001",
    product: "86 Diamonds",
    game: "Mobile Legends",
    amount: 25000,
    status: "success",
    time: "10 menit lalu",
  },
  {
    invoice: "INV-20260525-0002",
    product: "70 Diamonds + 10 Bonus",
    game: "Free Fire",
    amount: 18000,
    status: "success",
    time: "25 menit lalu",
  },
  {
    invoice: "INV-20260525-0003",
    product: "475 VP",
    game: "Valorant",
    amount: 42000,
    status: "processing",
    time: "1 jam lalu",
  },
]

const topProducts = [
  { name: "86 Diamonds", game: "Mobile Legends", sold: 45, revenue: 1125000 },
  { name: "50 Diamonds", game: "Free Fire", sold: 38, revenue: 684000 },
  { name: "60 UC", game: "PUBG Mobile", sold: 28, revenue: 616000 },
]

export default function AdminDashboardPage() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header user={{ name: "Admin", email: "admin@gametopup.com", role: "admin" }} />

      <main className="flex-1 py-8">
        <div className="container">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">Dashboard</h1>
            <p className="text-muted-foreground">
              Overview sistem GameTopup
            </p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {stats.map((stat, index) => (
              <Card key={index} className="hover:border-primary/30 transition-all">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className={`p-2 rounded-lg bg-primary/10`}>
                      <stat.icon className="h-5 w-5 text-primary" />
                    </div>
                    <span
                      className={`flex items-center gap-1 text-xs font-medium ${
                        stat.trend === "up"
                          ? "text-green-500"
                          : stat.trend === "down"
                          ? "text-red-500"
                          : "text-muted-foreground"
                      }`}
                    >
                      {stat.trend === "up" ? (
                        <ArrowUpRight className="h-3 w-3" />
                      ) : stat.trend === "down" ? (
                        <ArrowDownRight className="h-3 w-3" />
                      ) : null}
                      {stat.change}
                    </span>
                  </div>
                  <p className="text-2xl font-bold mb-1">{stat.value}</p>
                  <p className="text-sm text-muted-foreground">{stat.title}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="grid lg:grid-cols-3 gap-6">
            {/* Recent Transactions */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle>Transaksi Terbaru</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {recentTransactions.map((tx, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-4 bg-white/5 rounded-xl"
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                            <ShoppingBag className="h-5 w-5 text-primary" />
                          </div>
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
                          <p className="text-xs text-muted-foreground">
                            {tx.time}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Top Products */}
            <div>
              <Card>
                <CardHeader>
                  <CardTitle>Produk Terlaris</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {topProducts.map((product, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between"
                      >
                        <div>
                          <p className="font-medium">{product.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {product.game} • {product.sold} terjual
                          </p>
                        </div>
                        <p className="font-semibold text-green-500">
                          {formatCurrency(product.revenue)}
                        </p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
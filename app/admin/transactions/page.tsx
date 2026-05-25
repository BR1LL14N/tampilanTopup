"use client"

import { useState } from "react"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Header } from "@/components/layout/header"
import { formatCurrency, formatDate, getStatusBgColor } from "@/lib/utils"
import { GameIcon } from "@/components/game/game-icon"
import {
  Plus,
  Search,
  MoreHorizontal,
  Eye,
  Download,
  Filter,
  TrendingUp,
  Wallet,
  Clock,
  CheckCircle,
  XCircle,
} from "lucide-react"

// Mock data
const transactions = [
  {
    id: "1",
    invoice: "INV-20260525-0001",
    user: "john@example.com",
    product: "86 Diamonds",
    game: "Mobile Legends",
    icon: "🎮",
    target_id: "12345678",
    amount: 25000,
    payment_status: "paid",
    topup_status: "success",
    created_at: "2026-05-25T10:30:00Z",
  },
  {
    id: "2",
    invoice: "INV-20260524-0001",
    user: "jane@example.com",
    product: "70 Diamonds + 10 Bonus",
    game: "Free Fire",
    icon: "🔥",
    target_id: "98765432",
    amount: 18000,
    payment_status: "paid",
    topup_status: "success",
    created_at: "2026-05-24T15:45:00Z",
  },
  {
    id: "3",
    invoice: "INV-20260523-0001",
    user: "bob@example.com",
    product: "60 UC",
    game: "PUBG Mobile",
    icon: "🎯",
    target_id: "55556666",
    amount: 22000,
    payment_status: "paid",
    topup_status: "processing",
    created_at: "2026-05-23T08:20:00Z",
  },
]

const stats = [
  { label: "Total Transaksi", value: "156", icon: TrendingUp, color: "text-primary" },
  { label: "Hari Ini", value: "12", icon: Clock, color: "text-secondary" },
  { label: "Pending", value: "3", icon: Clock, color: "text-yellow-500" },
  { label: "Gagal", value: "2", icon: XCircle, color: "text-red-500" },
]

export default function AdminTransactionsPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")

  const filteredTransactions = transactions.filter((tx) => {
    const matchesSearch =
      tx.invoice.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tx.user.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tx.target_id.includes(searchQuery);
    const matchesStatus =
      statusFilter === "all" || tx.topup_status === statusFilter;
    return matchesSearch && matchesStatus;
  })

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header user={{ name: "Admin", email: "admin@gametopup.com", role: "admin" }} />

      <main className="flex-1 py-8">
        <div className="container">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold mb-2">Transaksi</h1>
              <p className="text-muted-foreground">
                Monitoring semua transaksi top up
              </p>
            </div>
            <Button variant="outline" className="gap-2">
              <Download className="h-4 w-4" />
              Export
            </Button>
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

          {/* Search and Filter */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Cari invoice, email, atau ID player..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 rounded-lg border border-white/10 bg-white/5 text-sm"
            >
              <option value="all">Semua Status</option>
              <option value="success">Berhasil</option>
              <option value="processing">Diproses</option>
              <option value="pending">Pending</option>
              <option value="failed">Gagal</option>
            </select>
          </div>

          {/* Transactions Table */}
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Invoice</TableHead>
                    <TableHead>Pengguna</TableHead>
                    <TableHead>Produk</TableHead>
                    <TableHead>Target</TableHead>
                    <TableHead>Jumlah</TableHead>
                    <TableHead>Status Topup</TableHead>
                    <TableHead>Tanggal</TableHead>
                    <TableHead className="text-right">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTransactions.map((tx) => (
                    <TableRow key={tx.id}>
                      <TableCell className="font-mono text-sm">
                        {tx.invoice}
                      </TableCell>
                      <TableCell>{tx.user}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <GameIcon slug={tx.game.toLowerCase().replace(/ /g, "-")} className="h-5 w-5 text-muted-foreground" />
                          <div>
                            <p className="font-medium">{tx.product}</p>
                            <p className="text-xs text-muted-foreground">
                              {tx.game}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{tx.target_id}</TableCell>
                      <TableCell className="font-semibold">
                        {formatCurrency(tx.amount)}
                      </TableCell>
                      <TableCell>
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBgColor(
                            tx.topup_status
                          )}`}
                        >
                          {tx.topup_status === "success"
                            ? "Berhasil"
                            : tx.topup_status === "processing"
                            ? "Diproses"
                            : tx.topup_status === "pending"
                            ? "Pending"
                            : "Gagal"}
                        </span>
                      </TableCell>
                      <TableCell className="text-muted-foreground text-sm">
                        {formatDate(tx.created_at)}
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem>
                              <Eye className="h-4 w-4 mr-2" />
                              Detail
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
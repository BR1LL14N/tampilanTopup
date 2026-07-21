import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Cek Transaksi",
  description: "Cek status transaksi dan pengiriman top up game Anda di Mitsuru secara otomatis dan real-time 24 jam.",
}

export default function CheckLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}

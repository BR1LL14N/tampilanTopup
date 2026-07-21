import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Hubungi Kami",
  description: "Hubungi tim resmi Mitsuru Top Up Hub untuk layanan pelanggan, kerjasama bisnis, atau bantuan transaksi 24/7.",
}

export default function ContactLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}

import { notFound } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { GameDetailContent } from "@/components/game/game-detail-content"
import { gameAssets } from "@/lib/assets"

// Game data mapping
const gameData = {
  "mobile-legends": {
    name: "Mobile Legends",
    icon: "🎮",
    slug: "mobile-legends",
    image: gameAssets["mobile-legends"].poster,
    description: "Top up diamond Mobile Legends Bang Bang dengan harga terbaik dan proses instant. Diamond langsung masuk ke akun Anda.",
    category: "MOBA",
    products: [
      { id: "1", name: "86 Diamonds", price: 21000, sell_price: 25000, provider_sku: "ML86" },
      { id: "2", name: "172 Diamonds", price: 42000, sell_price: 49000, provider_sku: "ML172" },
      { id: "3", name: "257 Diamonds", price: 63000, sell_price: 72000, provider_sku: "ML257" },
      { id: "4", name: "429 Diamonds", price: 105000, sell_price: 119000, provider_sku: "ML429" },
      { id: "5", name: "860 Diamonds", price: 210000, sell_price: 239000, provider_sku: "ML860" },
      { id: "6", name: "1720 Diamonds", price: 420000, sell_price: 479000, provider_sku: "ML1720" },
    ],
  },
  "free-fire": {
    name: "Free Fire",
    icon: "🔥",
    slug: "free-fire",
    image: gameAssets["free-fire"].poster,
    description: "Top up diamond Free Fire MAX dan Free Fire dengan proses cepat dan harga murah.",
    category: "Battle Royale",
    products: [
      { id: "1", name: "50 Diamonds", price: 12000, sell_price: 15000, provider_sku: "FF50" },
      { id: "2", name: "70 Diamonds + 10 Bonus", price: 15000, sell_price: 18000, provider_sku: "FF70" },
      { id: "3", name: "140 Diamonds + 20 Bonus", price: 29000, sell_price: 34000, provider_sku: "FF140" },
      { id: "4", name: "355 Diamonds + 45 Bonus", price: 73000, sell_price: 85000, provider_sku: "FF355" },
      { id: "5", name: "720 Diamonds + 95 Bonus", price: 148000, sell_price: 169000, provider_sku: "FF720" },
    ],
  },
  "pubg-mobile": {
    name: "PUBG Mobile",
    icon: "🎯",
    slug: "pubg-mobile",
    image: gameAssets["pubg-mobile"].poster,
    description: "Top up UC PUBG Mobile dengan harga terbaik. UC langsung masuk dalam hitungan menit.",
    category: "Battle Royale",
    products: [
      { id: "1", name: "60 UC", price: 18000, sell_price: 22000, provider_sku: "PUBG60" },
      { id: "2", name: "325 UC", price: 90000, sell_price: 105000, provider_sku: "PUBG325" },
      { id: "3", name: "660 UC", price: 180000, sell_price: 209000, provider_sku: "PUBG660" },
      { id: "4", name: "1800 UC", price: 480000, sell_price: 549000, provider_sku: "PUBG1800" },
    ],
  },
  "valorant": {
    name: "Valorant",
    icon: "💜",
    slug: "valorant",
    image: gameAssets.valorant.poster,
    description: "Top up Valorant Points (VP) untuk membeli senjata, skin, dan konten lainnya.",
    category: "FPS",
    products: [
      { id: "1", name: "475 VP", price: 35000, sell_price: 42000, provider_sku: "VP475" },
      { id: "2", name: "1000 VP", price: 72000, sell_price: 85000, provider_sku: "VP1000" },
      { id: "3", name: "2150 VP", price: 150000, sell_price: 178000, provider_sku: "VP2150" },
      { id: "4", name: "3650 VP", price: 250000, sell_price: 295000, provider_sku: "VP3650" },
    ],
  },
  "genshin-impact": {
    name: "Genshin Impact",
    icon: "✨",
    slug: "genshin-impact",
    image: gameAssets["genshin-impact"].poster,
    description: "Top up Genesis Crystals untuk Genshin Impact secara instan dan aman.",
    category: "RPG",
    products: [
      { id: "1", name: "60 Genesis Crystals", price: 12000, sell_price: 16000, provider_sku: "GEN60" },
      { id: "2", name: "300 Genesis Crystals", price: 62000, sell_price: 79000, provider_sku: "GEN300" },
      { id: "3", name: "980 Genesis Crystals", price: 185000, sell_price: 219000, provider_sku: "GEN980" },
      { id: "4", name: "1980 Genesis Crystals", price: 370000, sell_price: 439000, provider_sku: "GEN1980" },
      { id: "5", name: "Welkin Moon", price: 62000, sell_price: 79000, provider_sku: "WELKIN" },
    ],
  },
  "honor-of-kings": {
    name: "Honor of Kings",
    icon: "👑",
    slug: "honor-of-kings",
    image: gameAssets["honor-of-kings"].poster,
    description: "Top up Honor of Kings Tokens dengan proses instan 24 jam.",
    category: "MOBA",
    products: [
      { id: "1", name: "80 Tokens", price: 15000, sell_price: 18000, provider_sku: "HOK80" },
      { id: "2", name: "240 Tokens", price: 42000, sell_price: 49000, provider_sku: "HOK240" },
      { id: "3", name: "400 Tokens", price: 73000, sell_price: 85000, provider_sku: "HOK400" },
      { id: "4", name: "800 Tokens", price: 148000, sell_price: 169000, provider_sku: "HOK800" },
      { id: "5", name: "1200 Tokens", price: 210000, sell_price: 239000, provider_sku: "HOK1200" },
    ],
  },
  "roblox": {
    name: "Roblox",
    icon: "🧱",
    slug: "roblox",
    image: gameAssets.roblox.poster,
    description: "Top up Robux atau beli Roblox Gift Card untuk mengakses item eksklusif.",
    category: "Voucher",
    products: [
      { id: "1", name: "800 Robux", price: 120000, sell_price: 145000, provider_sku: "ROBUX800" },
      { id: "2", name: "1700 Robux", price: 250000, sell_price: 295000, provider_sku: "ROBUX1700" },
      { id: "3", name: "4500 Robux", price: 620000, sell_price: 729000, provider_sku: "ROBUX4500" },
      { id: "4", name: "$10 Gift Card", price: 148000, sell_price: 165000, provider_sku: "RBLX10" },
      { id: "5", name: "$25 Gift Card", price: 370000, sell_price: 412000, provider_sku: "RBLX25" },
    ],
  },
  "steam": {
    name: "Steam Wallet",
    icon: "🎮",
    slug: "steam",
    image: gameAssets.steam.poster,
    description: "Top up saldo Steam Wallet USD/IDR untuk membeli game favorit Anda di Steam.",
    category: "Voucher",
    products: [
      { id: "1", name: "Steam Wallet $5", price: 72000, sell_price: 85000, provider_sku: "STEAM5" },
      { id: "2", name: "Steam Wallet $10", price: 148000, sell_price: 169000, provider_sku: "STEAM10" },
      { id: "3", name: "Steam Wallet $20", price: 295000, sell_price: 335000, provider_sku: "STEAM20" },
      { id: "4", name: "Steam Wallet $50", price: 735000, sell_price: 829000, provider_sku: "STEAM50" },
    ],
  },
  "tiktok": {
    name: "TikTok Live",
    icon: "📱",
    slug: "tiktok",
    image: gameAssets.tiktok.poster,
    description: "Top up Koin TikTok Live untuk memberikan gift kepada kreator favorit Anda.",
    category: "Live App",
    products: [
      { id: "1", name: "70 Coins", price: 11000, sell_price: 14000, provider_sku: "TT70" },
      { id: "2", name: "350 Coins", price: 58000, sell_price: 69000, provider_sku: "TT350" },
      { id: "3", name: "700 Coins", price: 115000, sell_price: 135000, provider_sku: "TT700" },
      { id: "4", name: "1400 Coins", price: 228000, sell_price: 265000, provider_sku: "TT1400" },
      { id: "5", name: "3500 Coins", price: 570000, sell_price: 649000, provider_sku: "TT3500" },
    ],
  },
  "bigo": {
    name: "Bigo Live",
    icon: "🎙️",
    slug: "bigo",
    image: gameAssets.bigo.poster,
    description: "Top up Diamond Bigo Live instan untuk mendukung broadcaster favorit Anda.",
    category: "Live App",
    products: [
      { id: "1", name: "10 Diamonds", price: 3000, sell_price: 4500, provider_sku: "BG10" },
      { id: "2", name: "50 Diamonds", price: 14000, sell_price: 19000, provider_sku: "BG50" },
      { id: "3", name: "100 Diamonds", price: 28000, sell_price: 36000, provider_sku: "BG100" },
      { id: "4", name: "500 Diamonds", price: 138000, sell_price: 169000, provider_sku: "BG500" },
      { id: "5", name: "1000 Diamonds", price: 275000, sell_price: 329000, provider_sku: "BG1000" },
    ],
  },
}

interface Props {
  params: Promise<{ slug: string }>
}

export default async function GameDetailPage({ params }: Props) {
  const { slug } = await params
  const game = gameData[slug as keyof typeof gameData]

  if (!game) {
    notFound()
  }

  let user = null
  try {
    const supabase = await createClient()
    const { data } = await supabase.auth.getUser()
    if (data?.user) {
      user = {
        name: data.user.user_metadata?.name || data.user.email || '',
        email: data.user.email || '',
        role: 'user'
      }
    }
  } catch (e) {
    // Ignore error
  }

  return <GameDetailContent game={game} user={user} />
}

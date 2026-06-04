import { notFound } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { GameDetailContent } from "@/components/game/game-detail-content"
import { gameAssets, getGameAsset } from "@/lib/assets"

interface Props {
  params: Promise<{ slug: string }>
}

export default async function GameDetailPage({ params }: Props) {
  const { slug } = await params
  const supabase = await createClient()

  // Fetch game and its products from Supabase
  const { data: dbGame } = await supabase
    .from('games')
    .select('*, products(*)')
    .eq('slug', slug)
    .eq('status', true)
    .eq('products.status', true)
    .single()

  if (!dbGame) {
    notFound()
  }

  // Sort products by sort_order
  const sortedProducts = (dbGame.products || []).sort((a: any, b: any) => (a.sort_order || 0) - (b.sort_order || 0))

  const game = {
    name: dbGame.name,
    icon: dbGame.icon || "🎮",
    slug: dbGame.slug,
    image: getGameAsset(dbGame.slug)?.poster || dbGame.image || gameAssets["mobile-legends"].poster,
    description: dbGame.description || "",
    category: dbGame.category || "Game",
    products: sortedProducts.map((p: any) => ({
      id: p.id,
      name: p.name,
      price: p.price,
      sell_price: p.sell_price,
      provider_sku: p.provider_sku,
    }))
  }

  let user = null
  try {
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

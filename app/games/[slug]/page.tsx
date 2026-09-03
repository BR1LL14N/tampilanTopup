import { notFound } from "next/navigation"
import { getCurrentUser } from "@/lib/auth"
import { GameService } from "@/lib/services/game-service"
import { ProductService } from "@/lib/services/product-service"
import { GameDetailContent } from "@/components/game/game-detail-content"
import { gameAssets, getGameAsset } from "@/lib/assets"

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ slug: string }>
}

export default async function GameDetailPage({ params }: Props) {
  const { slug } = await params

  // Fetch game by slug
  const dbGame = await GameService.getBySlug(slug);

  if (!dbGame || !dbGame.status) {
    notFound()
  }

  // Fetch active products for this game slug
  const dbProducts = await ProductService.getProductsByGameSlug(slug);

  // Smart Balance Guard: Fetch current available Digiflazz balance (in-memory cached)
  let availableBalance = 99999999;
  try {
    const { BalanceGuardService } = await import("@/lib/services/balance-guard-service");
    availableBalance = await BalanceGuardService.getAvailableBalance();
  } catch (err) {
    console.error("Failed to check balance in game page:", err);
  }

  const game = {
    name: dbGame.name,
    icon: dbGame.icon || "🎮",
    slug: dbGame.slug,
    image: dbGame.image || getGameAsset(dbGame.slug)?.poster || getGameAsset(dbGame.slug)?.banner || gameAssets["mobile-legends"].poster,
    description: dbGame.description || "",
    category: dbGame.category || "Game",
    products: dbProducts.map((p: any) => {
      const modalPrice = Number(p.price) || 0;
      const isOutOfStock = modalPrice > availableBalance;
      return {
        id: p.id,
        name: p.name,
        price: modalPrice,
        sell_price: Number(p.sell_price) || 0,
        provider_sku: p.provider_sku,
        is_out_of_stock: isOutOfStock,
      };
    })
  }

  let user = null
  try {
    const sessionUser = await getCurrentUser()
    if (sessionUser) {
      user = {
        name: sessionUser.name,
        email: sessionUser.email,
        role: sessionUser.role
      }
    }
  } catch (e) {
    // Ignore error
  }

  return <GameDetailContent game={game} user={user} />
}

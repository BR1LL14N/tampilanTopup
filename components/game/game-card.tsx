import { Game, Product } from "@/types"
import Image from "next/image"
import Link from "next/link"
import { Card } from "@/components/ui/card"
import { getGameAsset, getItemAssetForProduct } from "@/lib/assets"

interface GameCardProps {
  game: Game
}

export function GameCard({ game }: GameCardProps) {
  return (
    <Link href={`/games/${game.slug}`}>
      <Card className="group overflow-hidden hover:border-primary/50 transition-all duration-300">
        <div className="relative aspect-[4/3] overflow-hidden">
          <Image
            src={getGameAsset(game.slug)?.banner || game.image || "/placeholder-game.jpg"}
            alt={game.name}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-110"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-4">
            <div className="flex items-center gap-2 mb-2">
              <span className="flex items-center gap-1 px-2 py-1 text-xs font-medium bg-primary/20 text-primary rounded-full">
            <img src={getGameAsset(game.slug)?.icon} alt="" className="h-3.5 w-3.5 rounded object-cover" /> {game.category}
              </span>
            </div>
            <h3 className="text-lg font-bold text-white">{game.name}</h3>
          </div>
        </div>
      </Card>
    </Link>
  )
}

interface ProductCardProps {
  product: Product
  game?: Game
  onSelect?: () => void
}

export function ProductCard({ product, game, onSelect }: ProductCardProps) {
  const profit = product.sell_price - product.price

  return (
    <Card
      className="p-4 hover:border-primary/50 transition-all duration-300 cursor-pointer"
      onClick={onSelect}
    >
      <div className="flex items-center justify-between mb-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white p-1.5">
              <img
                src={getItemAssetForProduct(product.name, product.provider_sku, game?.name)}
                alt=""
                className="max-h-full max-w-full object-contain"
              />
            </span>
            <h4 className="font-semibold">{product.name}</h4>
          </div>
          {game && (
            <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
              <img src={getGameAsset(game.slug)?.icon} alt="" className="h-3.5 w-3.5 rounded object-cover" /> {game.name}
            </p>
          )}
        </div>
        <span className="text-xs px-2 py-1 bg-green-500/10 text-green-500 rounded-full">
          +{profit.toLocaleString("id-ID")}
        </span>
      </div>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs text-muted-foreground">Harga</p>
          <p className="text-xl font-bold text-primary">
            Rp {product.sell_price.toLocaleString("id-ID")}
          </p>
        </div>
        <span className="px-3 py-1.5 text-xs font-medium bg-primary/10 text-primary rounded-lg">
          Pilih
        </span>
      </div>
    </Card>
  )
}

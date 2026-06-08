import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { SidebarContentWrapper } from "@/components/layout/sidebar-content-wrapper"
import { getCurrentUser } from "@/lib/auth"
import { GameService } from "@/lib/services/game-service"
import { executeQuery } from "@/lib/db"
import { ArrowRight } from "lucide-react"
import { gameAssets, getGameAsset } from "@/lib/assets"

export const dynamic = "force-dynamic";

export default async function GamesPage() {
  const sessionUser = await getCurrentUser()

  let user = null
  if (sessionUser) {
    user = {
      name: sessionUser.name,
      email: sessionUser.email,
      role: sessionUser.role
    }
  }

  // Fetch games dynamically from database
  let games: any[] = []
  try {
    const dbGames = await GameService.getAllActive()

    games = await Promise.all(
      dbGames.map(async (game: any) => {
        // Calculate active products for this game
        const rows = await executeQuery(
          `SELECT COUNT(*) as count FROM products WHERE game_id = $1 AND status = $2`,
          [game.id, true]
        );
        const count = Number(rows[0]?.count ?? rows[0]?.COUNT ?? 0);

        return {
          name: game.name,
          icon: game.icon || "🎮",
          slug: game.slug,
          image: game.image || getGameAsset(game.slug)?.banner || gameAssets["mobile-legends"].banner,
          description: game.description || "",
          category: game.category || "Game",
          products: count,
        };
      })
    )
  } catch (err) {
    console.error("Error loading games page database content:", err)
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header user={user} />

      <SidebarContentWrapper isAuthenticated={!!user}>
        <main className="flex-1 py-8">
          <div className="container">
            {/* Header */}
            <div className="mb-8">
              <h1 className="text-3xl md:text-4xl font-bold mb-2">
                Semua Game
              </h1>
              <p className="text-muted-foreground">
                Pilih game favorit kamu dan mulai top up
              </p>
            </div>

            {/* Game Grid */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {games.map((game) => (
                <Link key={game.slug} href={`/games/${game.slug}`}>
                  <Card className="group overflow-hidden hover:border-primary/50 transition-all duration-300">
                    <div className="relative aspect-video overflow-hidden">
                      <Image
                         src={game.image}
                        alt={game.name}
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-text-primary/80 via-text-primary/30 to-transparent" />
                      <div className="absolute top-4 left-4">
                        <span className="px-3 py-1.5 text-xs font-medium bg-primary/20 text-primary backdrop-blur-sm rounded-full">
                          <img src={getGameAsset(game.slug)?.icon} alt="" className="mr-1.5 inline-block h-3.5 w-3.5 rounded object-cover align-text-bottom" /> {game.category}
                        </span>
                      </div>
                    </div>
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h3 className="text-xl font-bold mb-1">{game.name}</h3>
                          <p className="text-sm text-muted-foreground">
                            {game.description}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">
                          {game.products} produk
                        </span>
                        <Button variant="ghost" size="sm" className="gap-2">
                          Top Up
                          <ArrowRight className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        </main>

        <Footer />
      </SidebarContentWrapper>
    </div>
  )
}
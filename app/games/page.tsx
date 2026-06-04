import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { SidebarContentWrapper } from "@/components/layout/sidebar-content-wrapper"
import { createClient } from "@/lib/supabase/server"
import { ArrowRight } from "lucide-react"
import { gameAssets, getGameAsset } from "@/lib/assets"

export default async function GamesPage() {
  const supabase = await createClient()
  const { data: { user: authUser } } = await supabase.auth.getUser()

  let user = null
  if (authUser) {
    user = {
      name: authUser.user_metadata?.name || authUser.email || '',
      email: authUser.email || '',
      role: 'user'
    }
  }

  // Fetch games dynamically from Supabase
  const { data: dbGames } = await supabase
    .from('games')
    .select('*, products(id, status)')
    .eq('status', true)
    .order('sort_order', { ascending: true })

  const games = (dbGames || []).map((game: any) => ({
    name: game.name,
    icon: game.icon || "🎮",
    slug: game.slug,
    image: getGameAsset(game.slug)?.banner || game.image || gameAssets["mobile-legends"].banner,
    description: game.description || "",
    category: game.category || "Game",
    products: game.products ? game.products.filter((p: any) => p.status).length : 0,
  }))

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
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
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

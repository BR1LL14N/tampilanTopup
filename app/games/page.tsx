import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { createClient } from "@/lib/supabase/server"
import { ArrowRight } from "lucide-react"
import { GameIcon } from "@/components/game/game-icon"

const games = [
  {
    name: "Mobile Legends",
    icon: "🎮",
    slug: "mobile-legends",
    image: "https://images.unsplash.com/photo-1538481199705-c710c4e965fc?w=600&h=400&fit=crop",
    description: "Top up diamond Mobile Legends dengan harga terbaik",
    category: "MOBA",
    products: 12,
  },
  {
    name: "Free Fire",
    icon: "🔥",
    slug: "free-fire",
    image: "https://images.unsplash.com/photo-1552820728-8b83bb6b773f?w=600&h=400&fit=crop",
    description: "Diamond Free Fire langsung masuk ke akun",
    category: "Battle Royale",
    products: 8,
  },
  {
    name: "PUBG Mobile",
    icon: "🎯",
    slug: "pubg-mobile",
    image: "https://images.unsplash.com/photo-1542751110-97427bbecf20?w=600&h=400&fit=crop",
    description: "UC PUBG Mobile dengan proses instant",
    category: "Battle Royale",
    products: 10,
  },
  {
    name: "Valorant",
    icon: "💜",
    slug: "valorant",
    image: "https://images.unsplash.com/photo-1614680096145-8c4c4c2dddbb?w=600&h=400&fit=crop",
    description: "VP Valorant untuk pengalaman gaming terbaik",
    category: "FPS",
    products: 6,
  },
  {
    name: "Genshin Impact",
    icon: "✨",
    slug: "genshin-impact",
    image: "https://images.unsplash.com/photo-1535567464580-5f6d4f7e2b1e?w=600&h=400&fit=crop",
    description: "Genesis Crystal Genshin Impact termurah",
    category: "RPG",
    products: 15,
  },
  {
    name: "Honor of Kings",
    icon: "👑",
    slug: "honor-of-kings",
    image: "https://images.unsplash.com/photo-1606588271854-e09e8e9c0b3a?w=600&h=400&fit=crop",
    description: "Top up荣耀Token dengan proses cepat",
    category: "MOBA",
    products: 8,
  },
]

export default async function GamesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  return (
    <div className="min-h-screen flex flex-col">
      <Header user={user ? { name: user.user_metadata?.name || user.email || '', email: user.email || '', role: 'user' } : null} />

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
                        <GameIcon slug={game.slug} className="inline-block h-3.5 w-3.5 mr-1.5 align-text-bottom text-primary" /> {game.category}
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
    </div>
  )
}
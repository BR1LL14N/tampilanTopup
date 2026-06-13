import { getCurrentUser } from "@/lib/auth"
import { GameService } from "@/lib/services/game-service"
import { ProductService } from "@/lib/services/product-service"
import { HomeContent } from "@/components/home/home-content"

export const dynamic = "force-dynamic";

export default async function HomePage() {
  let user = null;
  let games: any[] = [];
  let flashSalesList: any[] = [];
  
  try {
    // Fetch user profile from session JWT or Supabase based on provider
    const sessionUser = await getCurrentUser();
    if (sessionUser) {
      user = {
        name: sessionUser.name,
        email: sessionUser.email,
        role: sessionUser.role
      }
    }

    // Fetch active games from unified database layer
    games = await GameService.getAllActive();

    // Fetch active flash sale products from unified database layer
    flashSalesList = await ProductService.getFlashSales(4);

  } catch (e) {
    console.error("Error loading home page database content:", e);
  }

  return <HomeContent user={user} dbGames={games} flashSales={flashSalesList} />
}
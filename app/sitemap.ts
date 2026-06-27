import { MetadataRoute } from "next";
import { GameService } from "@/lib/services/game-service";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://mitsurushop.com";

  let games: any[] = [];
  try {
    games = await GameService.getAllActive();
  } catch (error) {
    console.error("Error fetching active games for sitemap:", error);
  }

  // Buat URL sitemap dinamis untuk tiap game yang aktif
  const gameUrls = games.map((game) => ({
    url: `${baseUrl}/games/${game.slug}`,
    lastModified: new Date(),
    changeFrequency: "daily" as const,
    priority: 0.8,
  }));

  // Daftar URL statis utama
  const staticUrls = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "daily" as const,
      priority: 1.0,
    },
    {
      url: `${baseUrl}/calculator`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.6,
    },
    {
      url: `${baseUrl}/check`,
      lastModified: new Date(),
      changeFrequency: "always" as const,
      priority: 0.7,
    },
  ];

  return [...staticUrls, ...gameUrls];
}

export const gameAssets = {
  "mobile-legends": {
    icon: "/assets/games/mobile-legends/icon.png",
    poster: "/assets/games/mobile-legends/poster.png",
    banner: "/assets/games/mobile-legends/banner.png",
  },
  "free-fire": {
    icon: "/assets/games/free-fire/icon.png",
    poster: "/assets/games/free-fire/poster.png",
    banner: "/assets/games/free-fire/banner.png",
  },
  "pubg-mobile": {
    icon: "/assets/games/pubg-mobile/icon.png",
    poster: "/assets/games/pubg-mobile/poster.png",
    banner: "/assets/games/pubg-mobile/banner.png",
  },
  valorant: {
    icon: "/assets/games/valorant/icon.png",
    poster: "/assets/games/valorant/poster.png",
    banner: "/assets/games/valorant/banner.png",
  },
  "genshin-impact": {
    icon: "/assets/games/genshin-impact/icon.png",
    poster: "/assets/games/genshin-impact/poster.png",
    banner: "/assets/games/genshin-impact/banner.png",
  },
  "honor-of-kings": {
    icon: "/assets/games/honor-of-kings/icon.png",
    poster: "/assets/games/honor-of-kings/poster.png",
    banner: "/assets/games/honor-of-kings/banner.png",
  },
  roblox: {
    icon: "/assets/games/roblox/icon.png",
    poster: "/assets/games/roblox/poster.png",
    banner: "/assets/games/roblox/banner.png",
  },
  steam: {
    icon: "/assets/games/steam-wallet/icon.png",
    poster: "/assets/games/steam-wallet/poster.png",
    banner: "/assets/games/steam-wallet/banner.png",
  },
  "steam-wallet": {
    icon: "/assets/games/steam-wallet/icon.png",
    poster: "/assets/games/steam-wallet/poster.png",
    banner: "/assets/games/steam-wallet/banner.png",
  },
  tiktok: {
    icon: "/assets/games/tiktok-live/icon.png",
    poster: "/assets/games/tiktok-live/poster.png",
    banner: "/assets/games/tiktok-live/banner.png",
  },
  "tiktok-live": {
    icon: "/assets/games/tiktok-live/icon.png",
    poster: "/assets/games/tiktok-live/poster.png",
    banner: "/assets/games/tiktok-live/banner.png",
  },
  bigo: {
    icon: "/assets/games/bigo-live/icon.png",
    poster: "/assets/games/bigo-live/poster.png",
    banner: "/assets/games/bigo-live/banner.png",
  },
  "bigo-live": {
    icon: "/assets/games/bigo-live/icon.png",
    poster: "/assets/games/bigo-live/poster.png",
    banner: "/assets/games/bigo-live/banner.png",
  },
} as const;

export const itemAssets = {
  diamond: "/assets/games/mobile-legends/icon.png",
  uc: "/assets/items/uc.png",
  "valorant-point": "/assets/items/valorant-point.png",
  "genesis-crystal": "/assets/items/genesis-crystal.png",
  "welkin-moon": "/assets/items/welkin-moon.png",
  "honor-token": "/assets/items/honor-token.png",
  robux: "/assets/items/robux.png",
  "steam-wallet-code": "/assets/items/steam-wallet-code.png",
  "tiktok-coin": "/assets/items/tiktok-coin.png",
  "bigo-diamond": "/assets/games/bigo-live/icon.png",
  wuwa: "/assets/items/wuwa.png",
} as const;

export const rankAssets = {
  grandmaster: "/assets/ranks/grandmaster.png",
  epic: "/assets/ranks/epic.png",
  legend: "/assets/ranks/legend.png",
  mythic: "/assets/ranks/mythic.png",
  "mythic-honor": "/assets/ranks/mythic-honor.png",
  "mythic-glory": "/assets/ranks/mythic-glory.png",
  "mythic-immortal": "/assets/ranks/mythic-immortal.png",
} as const;

export const paymentAssets = {
  qris: "/assets/payments/qris.png",
  gopay: "/assets/payments/gopay.png",
  shopeepay: "/assets/payments/shopeepay.png",
  ovo: "/assets/payments/ovo.png",
  dana: "/assets/payments/dana.png",
} as const;

export type GameAssetSlug = keyof typeof gameAssets;

export function getGameAsset(slug: string) {
  return gameAssets[slug as GameAssetSlug];
}

export function slugFromGameName(name?: string | null) {
  if (!name) return "";
  const normalized = name.toLowerCase().replace(/&/g, "and").replace(/\s+/g, "-");
  const aliases: Record<string, GameAssetSlug> = {
    "mobile-legends": "mobile-legends",
    "free-fire": "free-fire",
    "pubg-mobile": "pubg-mobile",
    valorant: "valorant",
    "genshin-impact": "genshin-impact",
    "honor-of-kings": "honor-of-kings",
    roblox: "roblox",
    "steam-wallet": "steam",
    steam: "steam",
    "tiktok-live": "tiktok",
    tiktok: "tiktok",
    "bigo-live": "bigo",
    bigo: "bigo",
  };
  return aliases[normalized] || normalized;
}

export function getGameAssetByName(name?: string | null) {
  return getGameAsset(slugFromGameName(name));
}

export function getItemAssetForProduct(productName?: string | null, sku?: string | null, gameName?: string | null) {
  const text = `${productName || ""} ${sku || ""} ${gameName || ""}`.toLowerCase();

  if (text.includes("uc") || text.includes("pubg")) return itemAssets.uc;
  if (text.includes("vp") || text.includes("valorant")) return itemAssets["valorant-point"];
  if (text.includes("genesis") || text.includes("crystal")) return itemAssets["genesis-crystal"];
  if (text.includes("welkin")) return itemAssets["welkin-moon"];
  if (text.includes("honor") || text.includes("hok") || text.includes("token")) return itemAssets["honor-token"];
  if (text.includes("robux")) return itemAssets.robux;
  if (text.includes("gift card") || text.includes("steam")) return itemAssets["steam-wallet-code"];
  if (text.includes("tiktok") || text.includes("coin")) return itemAssets["tiktok-coin"];
  if (text.includes("bigo")) return itemAssets["bigo-diamond"];
  if (text.includes("diamond") || text.includes("ml") || text.includes("ff")) return itemAssets.diamond;

  return getGameAssetByName(gameName)?.icon || itemAssets.diamond;
}

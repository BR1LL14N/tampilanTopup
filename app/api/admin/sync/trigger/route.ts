import { NextRequest, NextResponse } from "next/server";
import { verifyAdmin } from "@/lib/auth";
import { SettingService } from "@/lib/services/setting-service";
import { executeQuery } from "@/lib/db";
import crypto from "crypto";

export const dynamic = "force-dynamic";

function slugify(text: string) {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^\w\-]+/g, "")
    .replace(/\-\-+/g, "-");
}

export async function POST(req: NextRequest) {
  return handleSync(req);
}

export async function GET(req: NextRequest) {
  return handleSync(req);
}

async function handleSync(req: NextRequest) {
  try {
    // 1. Authorization: either admin session OR valid webhook secret key query param
    let authorized = false;
    const { searchParams } = new URL(req.url);
    const key = searchParams.get("key");
    const secretKey = process.env.DIGIFLAZZ_WEBHOOK_SECRET || "mitsurusecurewebhooksecret99f3a1b7c8d2e6a0a";

    if (key === secretKey) {
      authorized = true;
    } else {
      const isAdmin = await verifyAdmin();
      if (isAdmin) {
        authorized = true;
      }
    }

    if (!authorized) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    // 2. Check if cron sync is active in settings (skip if forced manual sync from admin panel)
    const isManual = searchParams.get("manual") === "true";
    const isSyncActive = await SettingService.get("is_sync_cron_active", true);
    
    if (!isSyncActive && !isManual) {
      return NextResponse.json({ message: "Auto-sync is disabled by administrator." });
    }

    // 3. Fetch credentials using getDigiflazzCredentials()
    const { getDigiflazzCredentials } = await import("@/lib/digiflazz");
    const { username, apiKey } = getDigiflazzCredentials();

    if (!username || !apiKey) {
      await SettingService.set("last_sync_status", "failed");
      return NextResponse.json({ error: "Missing Digiflazz credentials in env configuration" }, { status: 500 });
    }

    // 4. Call Digiflazz API
    const sign = crypto.createHash("md5").update(`${username}${apiKey}pricelist`).digest("hex");
    
    const response = await fetch("https://api.digiflazz.com/v1/price-list", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ cmd: "prepaid", username, sign }),
    });

    const result = await response.json();
    if (!result.data || !Array.isArray(result.data)) {
      await SettingService.set("last_sync_status", "failed");
      return NextResponse.json({ error: "Failed to retrieve price list from Digiflazz API", details: result }, { status: 502 });
    }

    const allItems = result.data;
    
    // Process ALL active Digiflazz products across all categories (Games, Pulsa, Data, PLN, TV, Voucher, etc.)
    const activeProducts = allItems.filter((item: any) => 
      item && item.brand && item.brand.trim() !== '' &&
      item.buyer_product_status === true && item.seller_product_status === true
    );

    const skippedProductsCount = allItems.length - activeProducts.length;

    // Fetch existing games/categories from database
    const dbGames = await executeQuery("SELECT id, name, slug FROM games");
    let gamesList: any[] = [...dbGames];

    // Smart Fuzzy Match Digiflazz brand to DB game
    const findGameMatch = (brandInput: string) => {
      if (!brandInput) return undefined;
      const bLower = brandInput.toLowerCase().trim();
      const cleanB = bLower.replace(/[^a-z0-9]/g, '');

      if (cleanB.includes('mobilelegend') || cleanB.includes('mlbb')) {
        return gamesList.find(g => 
          g.slug === 'mobile-legends' || 
          g.slug === 'mobile-legend' || 
          g.slug === 'mobilelegends' ||
          (g.name || '').toLowerCase().includes('mobile legend')
        );
      }
      if (cleanB.includes('freefire')) {
        return gamesList.find(g => 
          g.slug === 'free-fire' || 
          g.slug === 'freefire' ||
          (g.name || '').toLowerCase().includes('free fire')
        );
      }
      if (cleanB.includes('pubg')) {
        return gamesList.find(g => 
          g.slug === 'pubg-mobile' || 
          g.slug === 'pubg' ||
          (g.name || '').toLowerCase().includes('pubg')
        );
      }
      if (cleanB.includes('valorant')) {
        return gamesList.find(g => g.slug === 'valorant' || (g.name || '').toLowerCase().includes('valorant'));
      }
      if (cleanB.includes('genshin')) {
        return gamesList.find(g => g.slug === 'genshin-impact' || (g.name || '').toLowerCase().includes('genshin'));
      }
      if (cleanB.includes('honorofkings') || cleanB.includes('hok')) {
        return gamesList.find(g => g.slug === 'honor-of-kings' || (g.name || '').toLowerCase().includes('honor of kings'));
      }
      if (cleanB.includes('roblox')) {
        return gamesList.find(g => g.slug === 'roblox' || (g.name || '').toLowerCase().includes('roblox'));
      }
      if (cleanB.includes('steam')) {
        return gamesList.find(g => g.slug === 'steam' || (g.name || '').toLowerCase().includes('steam'));
      }

      const slug = bLower.replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
      return gamesList.find(g => {
        const gNameLower = (g.name || '').toLowerCase().trim();
        const gSlugLower = (g.slug || '').toLowerCase().trim();
        const gCleanName = gNameLower.replace(/[^a-z0-9]/g, '');

        return (
          gSlugLower === slug ||
          gCleanName === cleanB ||
          gNameLower === bLower ||
          bLower === gNameLower ||
          gNameLower.includes(bLower) ||
          bLower.includes(gNameLower)
        );
      });
    };

    let productsCreated = 0;
    let productsUpdated = 0;
    let gamesCreated = 0;

    for (const item of activeProducts) {
      const brand = item.brand || '';
      if (!brand || !brand.trim()) continue;

      let gameObj = findGameMatch(brand);

      if (!gameObj) {
        let slug = brand.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
        if (!slug) slug = 'cat-' + crypto.randomUUID().slice(0, 8);

        const categoryName = item.category || 'Voucher';
        const newGameId = crypto.randomUUID();
        await executeQuery(
          `INSERT INTO games (id, name, slug, icon, category, description, status, sort_order) 
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
          [newGameId, brand, slug, "⚡", categoryName, `Top up ${brand} (${categoryName}) instan 24 jam.`, true, 0]
        );
        gameObj = { id: newGameId, name: brand, slug };
        gamesList.push(gameObj);
        gamesCreated++;
      }

      const gameId = gameObj.id;
      const providerSku = item.buyer_sku_code;
      const productName = item.product_name;
      const modalPrice = Number(item.price);
      
      // Calculate sell price: Add 8% markup, rounded up to the nearest Rp 100
      const markupPercentage = 1.08; 
      const rawSellPrice = modalPrice * markupPercentage;
      const sellPrice = Math.ceil(rawSellPrice / 100) * 100;

      const isActive = true; // activeProducts filter guarantees buyer & seller status are true

      const existingProduct = await executeQuery(
        "SELECT id FROM products WHERE game_id = $1 AND provider_sku = $2 LIMIT 1",
        [gameId, providerSku]
      );

      if (existingProduct.length > 0) {
        await executeQuery(
          `UPDATE products 
           SET name = $1, price = $2, sell_price = $3, status = $4, updated_at = CURRENT_TIMESTAMP 
           WHERE id = $5`,
          [productName, modalPrice, sellPrice, isActive, existingProduct[0].id]
        );
        productsUpdated++;
      } else {
        const id = crypto.randomUUID();
        await executeQuery(
          `INSERT INTO products (id, game_id, provider_sku, name, price, sell_price, status, sort_order) 
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
          [id, gameId, providerSku, productName, modalPrice, sellPrice, isActive, 0]
        );
        productsCreated++;
      }
    }

    // 5. Update settings metadata
    await SettingService.set("last_sync_status", "success");
    await SettingService.set("last_sync_time", new Date().toISOString());

    return NextResponse.json({
      success: true,
      gamesCount: gamesList.length,
      productsCreated,
      productsUpdated,
      gamesCreated,
      skippedProductsCount,
      totalDigiflazzCount: allItems.length,
      timestamp: new Date().toISOString()
    });

  } catch (err: any) {
    console.error("Cron trigger error:", err);
    try {
      await SettingService.set("last_sync_status", "failed");
    } catch (_) {}
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

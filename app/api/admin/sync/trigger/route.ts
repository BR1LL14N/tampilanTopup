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

function isGameProduct(item: any): boolean {
  if (!item || !item.brand) return false;

  const category = (item.category || "").toLowerCase().trim();
  const brand = (item.brand || "").toLowerCase().trim();
  const productName = (item.product_name || "").toLowerCase().trim();
  const cleanBrand = brand.replace(/[^a-z0-9]/g, "");

  // 1. Explicit Non-Game Brand Exclusions (Pulsa, Operator, PLN, TV, E-Money)
  const nonGameBrandList = [
    "telkomsel", "indosat", "xl", "axis", "tri", "three", "smartfren", "byu",
    "pln", "kvision", "kvisiondangol", "nexparabola", "matrixtv", "indovision", "tv",
    "gopay", "ovo", "dana", "linkaja", "shopeepay", "maxim", "grab", "gojek", "isaku", "doku"
  ];

  if (nonGameBrandList.some(b => cleanBrand === b || cleanBrand.includes(b))) {
    return false;
  }

  // 2. Explicit Non-Game Category Keywords
  if (
    category.includes("pulsa") ||
    category.includes("data") ||
    category.includes("internet") ||
    category.includes("pln") ||
    category.includes("pasca") ||
    category.includes("e-money") ||
    category.includes("emoney") ||
    category.includes("tv") ||
    category.includes("telepon") ||
    category.includes("sms")
  ) {
    return false;
  }

  // 3. Explicit Non-Game Product Name Keywords
  if (
    productName.includes("pulsa") ||
    productName.includes("paket data") ||
    productName.includes("token pln") ||
    productName.includes("voucher tv") ||
    productName.includes("paket internet") ||
    productName.includes("kuota")
  ) {
    return false;
  }

  // 4. Positive Game Inclusion Rules
  if (category.includes("game") || category === "games" || category.includes("voucher game")) {
    return true;
  }

  const gameKeywords = [
    "mobile legend", "mlbb", "free fire", "pubg", "valorant", "genshin", "roblox",
    "honor of kings", "hok", "steam", "point blank", "call of duty", "codm",
    "arena of valor", "aov", "ragnarok", "clash of clans", "clash royale",
    "fifa", "ea sports", "efootball", "eggy party", "honkai", "lifeafter", "stumble guys",
    "higgs domino", "undawn", "arena breakout", "blood strike", "marvel", "supercell",
    "garena", "unipin", "razer", "google play", "playstation", "xbox", "nintendo"
  ];

  if (gameKeywords.some(g => brand.includes(g) || productName.includes(g))) {
    return true;
  }

  // If category is Voucher and not non-game, allow it as game voucher
  if (category.includes("voucher")) {
    return true;
  }

  return false;
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
    
    // Process ONLY active GAME products (filtering out Pulsa, Data, PLN, TV, Operator Telco, E-Money)
    const activeProducts = allItems.filter((item: any) => 
      item && item.brand && item.brand.trim() !== '' &&
      item.buyer_product_status === true && item.seller_product_status === true &&
      isGameProduct(item)
    );

    const skippedProductsCount = allItems.length - activeProducts.length;

    // Clean up non-game operator and utility entries from games and products tables
    try {
      await executeQuery(
        `DELETE FROM products WHERE game_id IN (
          SELECT id FROM games WHERE category IN ('Pulsa', 'Data', 'PLN', 'E-Money', 'TV') OR slug IN ('telkomsel', 'indosat', 'xl', 'axis', 'tri', 'three', 'smartfren', 'by-u', 'byu', 'pln', 'k-vision-dan-gol', 'k-vision', 'kvision', 'gopay', 'ovo', 'dana', 'linkaja', 'shopeepay')
        )`
      );
      await executeQuery(
        `DELETE FROM games WHERE category IN ('Pulsa', 'Data', 'PLN', 'E-Money', 'TV') OR slug IN ('telkomsel', 'indosat', 'xl', 'axis', 'tri', 'three', 'smartfren', 'by-u', 'byu', 'pln', 'k-vision-dan-gol', 'k-vision', 'kvision', 'gopay', 'ovo', 'dana', 'linkaja', 'shopeepay')`
      );
    } catch (cleanupErr) {
      console.warn("Non-game cleanup warning:", cleanupErr);
    }

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

    // Dynamic markup from query param (default 8%)
    const markupParam = searchParams.get("markup");
    const markupPercentage = (markupParam && !isNaN(parseFloat(markupParam)) && parseFloat(markupParam) >= 0)
      ? (1 + parseFloat(markupParam) / 100)
      : 1.08;

    const syncedItemsLog: any[] = [];

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
      
      const rawSellPrice = modalPrice * markupPercentage;
      const sellPrice = Math.ceil(rawSellPrice / 100) * 100;

      const isActive = true; // activeProducts filter guarantees buyer & seller status are true

      const existingProduct = await executeQuery(
        "SELECT id, price, sell_price FROM products WHERE game_id = $1 AND provider_sku = $2 LIMIT 1",
        [gameId, providerSku]
      );

      if (existingProduct.length > 0) {
        await executeQuery(
          `UPDATE products 
           SET name = $1, price = $2, sell_price = $3, status = $4, provider_sku = $5, updated_at = CURRENT_TIMESTAMP 
           WHERE id = $6`,
          [productName, modalPrice, sellPrice, isActive ? 1 : 0, providerSku, existingProduct[0].id]
        );
        productsUpdated++;
        syncedItemsLog.push({
          sku: providerSku,
          name: productName,
          game: gameObj.name,
          brand,
          category: item.category,
          old_price: existingProduct[0].price,
          new_price: modalPrice,
          sell_price: sellPrice,
          type: 'UPDATE'
        });
      } else {
        const id = crypto.randomUUID();
        await executeQuery(
          `INSERT INTO products (id, game_id, provider_sku, name, price, sell_price, status, sort_order) 
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
          [id, gameId, providerSku, productName, modalPrice, sellPrice, isActive ? 1 : 0, 0]
        );
        productsCreated++;
        syncedItemsLog.push({
          sku: providerSku,
          name: productName,
          game: gameObj.name,
          brand,
          category: item.category,
          price: modalPrice,
          sell_price: sellPrice,
          type: 'NEW'
        });
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
      summary: {
        totalFromDigiflazz: allItems.length,
        newAdded: productsCreated,
        updated: productsUpdated,
        skipped: skippedProductsCount
      },
      sampleItems: activeProducts.slice(0, 10).map((i: any) => ({
        name: i.product_name,
        brand: i.brand,
        category: i.category,
        sku: i.buyer_sku_code,
        active: i.buyer_product_status && i.seller_product_status
      })),
      log: syncedItemsLog.slice(0, 500),
      rawResponse: result,
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

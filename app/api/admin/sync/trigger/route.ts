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

    // 3. Fetch credentials from env
    const username = process.env.DIGIFLAZZ_USERNAME;
    const apiKey = process.env.DIGIFLAZZ_API_KEY;

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
    
    // Filter game products
    const gameProducts = allItems.filter((item: any) =>
      item.category &&
      (item.category.toLowerCase().includes("voucher game") ||
        item.category.toLowerCase().includes("game") ||
        item.category.toLowerCase().includes("voucher") ||
        item.brand.toLowerCase().includes("mobile legends") ||
        item.brand.toLowerCase().includes("free fire") ||
        item.brand.toLowerCase().includes("pubg") ||
        item.brand.toLowerCase().includes("valorant"))
    );

    if (gameProducts.length === 0) {
      await SettingService.set("last_sync_status", "success");
      await SettingService.set("last_sync_time", new Date().toISOString());
      return NextResponse.json({ success: true, message: "Sync finished. No game products found." });
    }

    const brands = gameProducts
      .map((item: any) => item.brand)
      .filter((value: any, index: number, self: any[]) => value && self.indexOf(value) === index) as string[];

    // A. Sync Games
    const brandToGameId: Record<string, string> = {};
    for (const brand of brands) {
      const slug = slugify(brand);
      const existing = await executeQuery("SELECT id FROM games WHERE slug = $1 LIMIT 1", [slug]);

      if (existing.length > 0) {
        brandToGameId[brand] = existing[0].id;
      } else {
        const id = crypto.randomUUID();
        await executeQuery(
          `INSERT INTO games (id, name, slug, icon, category, description, status, sort_order) 
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
          [id, brand, slug, "🎮", "Game", `Top up voucher dan diamonds untuk ${brand} dengan proses instan.`, true, 0]
        );
        brandToGameId[brand] = id;
      }
    }

    // B. Sync Products
    let productsCreated = 0;
    let productsUpdated = 0;

    for (const item of gameProducts) {
      const gameId = brandToGameId[item.brand];
      if (!gameId) continue;

      const providerSku = item.buyer_sku_code;
      const productName = item.product_name;
      const modalPrice = Number(item.price);
      
      // Calculate sell price: Add 8% markup, rounded up to the nearest Rp 100
      const markupPercentage = 1.08; 
      const rawSellPrice = modalPrice * markupPercentage;
      const sellPrice = Math.ceil(rawSellPrice / 100) * 100;

      const isActive = item.buyer_product_status === true && item.seller_product_status === true;

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
      gamesCount: brands.length,
      productsCreated,
      productsUpdated,
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

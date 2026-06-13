const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const mysql = require("mysql2/promise");
const { Pool } = require("pg");

// 1. Parse .env.local manually
const envPath = path.join(__dirname, "..", ".env.local");
let env = {};
if (fs.existsSync(envPath)) {
  const envFile = fs.readFileSync(envPath, "utf-8");
  envFile.split(/\r?\n/).forEach((line) => {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith("#")) {
      const idx = trimmed.indexOf("=");
      if (idx > 0) {
        const key = trimmed.substring(0, idx).trim();
        let val = trimmed.substring(idx + 1).trim();
        if (val.startsWith('"') && val.endsWith('"')) val = val.slice(1, -1);
        if (val.startsWith("'") && val.endsWith("'")) val = val.slice(1, -1);
        env[key] = val;
      }
    }
  });
} else {
  console.error("Error: .env.local file not found at:", envPath);
  process.exit(1);
}

const provider = env.DB_PROVIDER || "mysql";
const username = env.DIGIFLAZZ_USERNAME;
const apiKey = env.DIGIFLAZZ_API_KEY;

if (!username || !apiKey) {
  console.error("Error: Missing DIGIFLAZZ_USERNAME or DIGIFLAZZ_API_KEY in env.local!");
  process.exit(1);
}

// 2. Database connection pools
let mysqlPool = null;
let pgPool = null;

async function executeQuery(sql, params = []) {
  let formattedSql = sql;
  const formattedParams = [...params];

  if (provider === "mysql") {
    formattedSql = sql.replace(/\$\d+/g, "?");
    for (let i = 0; i < formattedParams.length; i++) {
      if (typeof formattedParams[i] === "boolean") {
        formattedParams[i] = formattedParams[i] ? 1 : 0;
      }
    }
    if (!mysqlPool) {
      mysqlPool = mysql.createPool({
        host: env.MYSQL_HOST || "localhost",
        port: parseInt(env.MYSQL_PORT || "3306"),
        user: env.MYSQL_USER || "root",
        password: env.MYSQL_PASSWORD || "",
        database: env.MYSQL_DATABASE || "freelance_topup",
        waitForConnections: true,
        connectionLimit: 5,
      });
    }
    const [rows] = await mysqlPool.execute(formattedSql, formattedParams);
    return rows;
  } else {
    if (!pgPool) {
      pgPool = new Pool({
        connectionString: env.POSTGRES_URL,
      });
    }
    const result = await pgPool.query(formattedSql, formattedParams);
    return result.rows;
  }
}

// Helper to slugify brand names into game slugs
function slugify(text) {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^\w\-]+/g, "")
    .replace(/\-\-+/g, "-");
}

// Generate MD5 signature for price list
const sign = crypto.createHash("md5").update(`${username}${apiKey}pricelist`).digest("hex");

async function sync() {
  console.log(`=== Digiflazz Database Auto-Sync (Active Provider: ${provider.toUpperCase()}) ===`);
  console.log("Fetching price-list from Digiflazz...");

  try {
    const response = await fetch("https://api.digiflazz.com/v1/price-list", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ cmd: "prepaid", username, sign }),
    });

    const result = await response.json();
    if (!result.data || !Array.isArray(result.data)) {
      console.error("Failed to retrieve product list from Digiflazz. Response:", result);
      return;
    }

    const allItems = result.data;
    console.log(`Fetched ${allItems.length} total items from Digiflazz.`);

    // Filter only game-related products (Voucher Game category)
    const gameProducts = allItems.filter((item) =>
      item.category &&
      (item.category.toLowerCase().includes("voucher game") ||
        item.category.toLowerCase().includes("game") ||
        item.category.toLowerCase().includes("voucher") ||
        item.brand.toLowerCase().includes("mobile legends") ||
        item.brand.toLowerCase().includes("free fire") ||
        item.brand.toLowerCase().includes("pubg") ||
        item.brand.toLowerCase().includes("valorant"))
    );

    console.log(`Found ${gameProducts.length} game products.`);

    if (gameProducts.length === 0) {
      console.log("No game products found. Exiting.");
      return;
    }

    // Get unique brand names (which represent the games)
    const brands = [...new Set(gameProducts.map((item) => item.brand))].filter(Boolean);
    console.log(`Unique game brands found (${brands.length}):`, brands);

    // 1. Sync Games Table
    const brandToGameId = {};
    for (const brand of brands) {
      const slug = slugify(brand);
      
      // Check if game already exists
      const existing = await executeQuery("SELECT id FROM games WHERE slug = $1 LIMIT 1", [slug]);

      if (existing.length > 0) {
        brandToGameId[brand] = existing[0].id;
        console.log(`Game already exists: ${brand} (ID: ${existing[0].id})`);
      } else {
        // Create new game entry
        const id = crypto.randomUUID();
        console.log(`Creating new game entry: ${brand}...`);
        await executeQuery(
          `INSERT INTO games (id, name, slug, icon, category, description, status, sort_order) 
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
          [id, brand, slug, "🎮", "Game", `Top up voucher dan diamonds untuk ${brand} dengan proses instan.`, true, 0]
        );
        brandToGameId[brand] = id;
        console.log(`✅ Created game: ${brand} (ID: ${id})`);
      }
    }

    // 2. Sync Products Table
    console.log("\nSyncing products...");
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

      // Check if product exists
      const existingProduct = await executeQuery(
        "SELECT id FROM products WHERE game_id = $1 AND provider_sku = $2 LIMIT 1",
        [gameId, providerSku]
      );

      if (existingProduct.length > 0) {
        // Update product price and status
        await executeQuery(
          `UPDATE products 
           SET name = $1, price = $2, sell_price = $3, status = $4, updated_at = CURRENT_TIMESTAMP 
           WHERE id = $5`,
          [productName, modalPrice, sellPrice, isActive, existingProduct[0].id]
        );
        productsUpdated++;
      } else {
        // Insert new product
        const id = crypto.randomUUID();
        await executeQuery(
          `INSERT INTO products (id, game_id, provider_sku, name, price, sell_price, status, sort_order) 
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
          [id, gameId, providerSku, productName, modalPrice, sellPrice, isActive, 0]
        );
        productsCreated++;
        console.log(`✅ Added product: ${productName} (SKU: ${providerSku}) - Modal: Rp ${modalPrice} | Jual: Rp ${sellPrice}`);
      }
    }

    console.log("\n=== Sync Complete ===");
    console.log(`Total Game Brands Synced: ${brands.length}`);
    console.log(`New Products Created: ${productsCreated}`);
    console.log(`Existing Products Updated: ${productsUpdated}`);

  } catch (error) {
    console.error("Error during synchronization:", error);
  } finally {
    // Close pools
    if (mysqlPool) await mysqlPool.end();
    if (pgPool) await pgPool.end();
  }
}

sync();

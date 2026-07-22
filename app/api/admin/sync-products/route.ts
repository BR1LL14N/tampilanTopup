import { NextRequest, NextResponse } from 'next/server';
import { verifyAdmin } from '@/lib/auth';
import { executeQuery } from '@/lib/db';
import { checkPriceList } from '@/lib/digiflazz';
import crypto from 'crypto';

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    // 1. Authenticate user database-agnostically
    const isAdmin = await verifyAdmin();
    if (!isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // 2. Get query parameters / body options
    const url = new URL(req.url);
    const markupParam = url.searchParams.get('markup') || '10'; // Default 10% markup
    const markupPercent = parseFloat(markupParam);
    const multiplier = 1 + (isNaN(markupPercent) ? 10 : markupPercent) / 100;

    // 3. Fetch Digiflazz price list
    const priceListRes = await checkPriceList();

    let rawProducts: any[] | null = null;

    if (Array.isArray(priceListRes?.data)) {
      rawProducts = priceListRes.data;
    } else if (Array.isArray(priceListRes?.data?.data)) {
      rawProducts = priceListRes.data.data;
    } else if (Array.isArray(priceListRes)) {
      rawProducts = priceListRes;
    }

    if (!rawProducts) {
      let digiErrMsg = 'Struktur respons tidak dikenali.';
      if (priceListRes?.data?.message) {
        digiErrMsg = `${priceListRes.data.message}${priceListRes.data.rc ? ` (RC: ${priceListRes.data.rc})` : ''}`;
      } else if (priceListRes?.message) {
        digiErrMsg = priceListRes.message;
      } else if (priceListRes?.error) {
        digiErrMsg = typeof priceListRes.error === 'string' ? priceListRes.error : JSON.stringify(priceListRes.error);
      } else if (typeof priceListRes === 'string') {
        digiErrMsg = priceListRes;
      }

      return NextResponse.json({
        error: `Gagal membaca daftar produk dari Digiflazz: ${digiErrMsg}`,
        digiflazzRawResponse: priceListRes
      }, { status: 502 });
    }

    // 4. Fetch current games from database
    const dbGames = await executeQuery("SELECT id, name, slug FROM games");
    let gamesList: any[] = [...dbGames];

    // 5. Auto-create missing games from Digiflazz brands for ALL products
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
      if (cleanB.includes('telkomsel')) {
        return gamesList.find(g => g.slug === 'telkomsel' || (g.name || '').toLowerCase().includes('telkomsel'));
      }
      if (cleanB.includes('indosat')) {
        return gamesList.find(g => g.slug === 'indosat' || (g.name || '').toLowerCase().includes('indosat'));
      }
      if (cleanB === 'xl') {
        return gamesList.find(g => g.slug === 'xl' || (g.name || '').toLowerCase().trim() === 'xl');
      }
      if (cleanB === 'axis') {
        return gamesList.find(g => g.slug === 'axis' || (g.name || '').toLowerCase().trim() === 'axis');
      }
      if (cleanB === 'tri' || cleanB === 'three') {
        return gamesList.find(g => g.slug === 'tri' || g.slug === 'three' || (g.name || '').toLowerCase().includes('tri'));
      }
      if (cleanB.includes('byu')) {
        return gamesList.find(g => g.slug === 'by-u' || g.slug === 'byu' || (g.name || '').toLowerCase().includes('by.u'));
      }
      if (cleanB.includes('smartfren')) {
        return gamesList.find(g => g.slug === 'smartfren' || (g.name || '').toLowerCase().includes('smartfren'));
      }
      if (cleanB.includes('pln')) {
        return gamesList.find(g => g.slug === 'pln' || (g.name || '').toLowerCase().includes('pln'));
      }
      if (cleanB.includes('kvision') || cleanB.includes('gol')) {
        return gamesList.find(g => g.slug === 'k-vision' || g.slug === 'kvision' || (g.name || '').toLowerCase().includes('k-vision'));
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

    for (const item of rawProducts) {
      const category = (item.category || '').toLowerCase();
      const brand = item.brand || '';
      if (!brand || !brand.trim()) continue;

      const brandLower = brand.toLowerCase().trim();
      const existingGame = findGameMatch(brandLower);

      if (!existingGame) {
        let slug = brandLower.replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
        if (!slug) slug = 'game-' + crypto.randomUUID().slice(0, 8);
        
        if (gamesList.some(g => g.slug === slug)) {
          continue;
        }
        
        const newGameId = crypto.randomUUID();
        const categoryLower = category.toLowerCase();
        let gameCategory = 'Games';
        
        if (categoryLower.includes('pulsa') || categoryLower.includes('telepon') || categoryLower.includes('sms')) {
          gameCategory = 'Pulsa';
        } else if (categoryLower.includes('data') || categoryLower.includes('internet') || categoryLower.includes('paket internet') || categoryLower.includes('kuota')) {
          gameCategory = 'Data';
        } else if (categoryLower.includes('pln') || categoryLower.includes('token') || categoryLower.includes('listrik')) {
          gameCategory = 'PLN';
        } else if (
          categoryLower.includes('money') ||
          categoryLower.includes('wallet') ||
          categoryLower.includes('balance') ||
          categoryLower.includes('pay') ||
          brandLower.includes('ovo') ||
          brandLower.includes('gopay') ||
          brandLower.includes('dana') ||
          brandLower.includes('linkaja') ||
          brandLower.includes('shopeepay') ||
          brandLower.includes('grab') ||
          brandLower.includes('gojek') ||
          brandLower.includes('isaku') ||
          brandLower.includes('doku')
        ) {
          gameCategory = 'E-Money';
        } else if (categoryLower.includes('voucher') && !categoryLower.includes('game')) {
          gameCategory = 'Voucher';
        } else if (categoryLower.includes('game') || categoryLower.includes('voucher game') || brandLower.includes('mobile legend') || brandLower.includes('free fire') || brandLower.includes('pubg') || brandLower.includes('valorant') || brandLower.includes('hok') || brandLower.includes('honor of kings') || brandLower.includes('steam')) {
          gameCategory = 'Games';
        } else {
          gameCategory = item.category ? (item.category.charAt(0).toUpperCase() + item.category.slice(1)) : 'Games';
        }

        const formattedBrandName = brand.trim().toUpperCase();
        const newGame = {
          id: newGameId,
          name: formattedBrandName,
          slug: slug,
          image: 'https://images.unsplash.com/photo-1542751110-97427bbecf20?w=400',
          icon: '🎮',
          category: gameCategory,
          status: true,
          description: `Top up ${formattedBrandName} murah dan proses instan.`,
          publisher: 'Digiflazz'
        };

        try {
          await executeQuery(
            `INSERT INTO games (id, name, slug, image, icon, category, status, description, publisher) 
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
            [newGame.id, newGame.name, newGame.slug, newGame.image, newGame.icon, newGame.category, true, newGame.description, newGame.publisher]
          );
        } catch (insertErr) {
          console.error(`Auto-insert game ${brand} log:`, insertErr);
        }
        gamesList.push(newGame);
      }
    }

    // 6. Fetch existing products from database
    const dbProducts = await executeQuery("SELECT id, game_id, provider_sku, name, price, sell_price, status FROM products");

    // Create a map of existing products by provider_sku for fast lookup
    const existingProductsMap = new Map<string, any>();
    dbProducts.forEach((p: any) => {
      existingProductsMap.set(p.provider_sku.toLowerCase(), p);
    });

    let newCount = 0;
    let updateCount = 0;
    let skippedCount = 0;
    const syncedItemsLog: any[] = [];

    // 7. Sync products database-agnostically
    for (const item of rawProducts) {
      const category = (item.category || '').toLowerCase();
      const brand = item.brand || '';
      const sku = item.buyer_sku_code;
      const name = item.product_name;
      const price = parseInt(item.price) || 0;

      const brandLower = brand.toLowerCase();
      const isActive = item.buyer_product_status === true && item.seller_product_status === true;

      if (!isActive) {
        skippedCount++;
        syncedItemsLog.push({
          sku,
          name,
          brand,
          category: item.category,
          price,
          type: 'SKIPPED_INACTIVE',
          reason: 'Nonaktif dari supplier / Digiflazz status OFF'
        });
        continue;
      }

      const matchingGame = findGameMatch(brand);
      if (!matchingGame) {
        skippedCount++;
        syncedItemsLog.push({
          sku,
          name,
          brand,
          category: item.category,
          price,
          type: 'SKIPPED_NO_GAME',
          reason: `Brand '${brand}' belum terdaftar di Kategori Game Database`
        });
        continue; 
      }

      const skuLower = sku.toLowerCase();
      const existingProduct = existingProductsMap.get(skuLower);

      if (existingProduct) {
        // Product exists - update cost price and keep/adjust selling price to avoid loss
        let newSellPrice = existingProduct.sell_price;
        let adjusted = false;

        if (price >= existingProduct.sell_price) {
          // Auto-markup to avoid selling at a loss, rounded up to nearest Rp 100
          const rawPrice = price * multiplier;
          newSellPrice = Math.ceil(rawPrice / 100) * 100;
          adjusted = true;
        }

        try {
          await executeQuery(
            `UPDATE products 
             SET game_id = $1, name = $2, price = $3, sell_price = $4, status = $5, provider = $6, provider_sku = $7, updated_at = CURRENT_TIMESTAMP 
             WHERE id = $8`,
            [matchingGame.id, name, price, newSellPrice, isActive ? 1 : 0, 'digiflazz', sku, existingProduct.id]
          );
          updateCount++;
          syncedItemsLog.push({
            sku,
            name,
            game: matchingGame.name,
            brand,
            category: item.category,
            old_price: existingProduct.price,
            new_price: price,
            sell_price: newSellPrice,
            type: 'UPDATE',
            adjusted_sell_price: adjusted
          });
        } catch (err) {
          console.error(`Failed to update product ${sku}:`, err);
        }
      } else {
        // Brand-new product - insert with default markup, rounded to nearest Rp 100
        const rawSellPrice = price * multiplier;
        const initialSellPrice = Math.ceil(rawSellPrice / 100) * 100;
        const id = crypto.randomUUID();

        try {
          await executeQuery(
            `INSERT INTO products (id, game_id, provider_sku, name, price, sell_price, status, sort_order, provider) 
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
            [id, matchingGame.id, sku, name, price, initialSellPrice, isActive ? 1 : 0, 0, 'digiflazz']
          );
          newCount++;
          syncedItemsLog.push({
            sku,
            name,
            game: matchingGame.name,
            brand,
            category: item.category,
            price: price,
            sell_price: initialSellPrice,
            type: 'NEW'
          });
        } catch (err) {
          console.error(`Failed to insert product ${sku}:`, err);
        }
      }
    }

    return NextResponse.json({
      success: true,
      summary: {
        totalFromDigiflazz: rawProducts.length,
        newAdded: newCount,
        updated: updateCount,
        skipped: skippedCount
      },
      sampleItems: rawProducts.slice(0, 10).map((i: any) => ({
        name: i.product_name,
        brand: i.brand,
        category: i.category,
        sku: i.buyer_sku_code,
        active: i.buyer_product_status && i.seller_product_status
      })),
      log: syncedItemsLog.slice(0, 500),
      rawResponse: priceListRes
    });

  } catch (error: any) {
    console.error('Sync products route error:', error);
    return NextResponse.json({ 
      error: error.message || 'Internal Server Error' 
    }, { status: 500 });
  }
}

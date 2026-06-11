import { NextRequest, NextResponse } from 'next/server';
import { createClient, createAdminClient } from '@/lib/supabase/server';
import { checkPriceList } from '@/lib/digiflazz';

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();

    // 1. Authenticate user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 2. Check if user is an admin
    const { data: profile, error: profileError } = await supabase
      .from('user_profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (profileError || !profile || profile.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const adminSupabase = await createAdminClient();

    // 3. Get query parameters / body options
    const url = new URL(req.url);
    const markupParam = url.searchParams.get('markup') || '10'; // Default 10% markup
    const markupPercent = parseFloat(markupParam);
    const multiplier = 1 + (isNaN(markupPercent) ? 10 : markupPercent) / 100;

    // 4. Fetch Digiflazz price list
    const priceListRes = await checkPriceList();

    // Digiflazz wraps response in different ways depending on API version / mode.
    // Possible structures:
    //   A) { data: [ ...items ] }                          ← standard prepaid list
    //   B) { data: { code, message, data: [ ...items ] } } ← error or alternate wrapper
    //   C) { rc, message, ... }                            ← top-level error response
    let rawProducts: any[] | null = null;

    if (Array.isArray(priceListRes?.data)) {
      // Structure A — standard
      rawProducts = priceListRes.data;
    } else if (Array.isArray(priceListRes?.data?.data)) {
      // Structure B — nested
      rawProducts = priceListRes.data.data;
    } else if (Array.isArray(priceListRes)) {
      // Structure C — response IS the array directly
      rawProducts = priceListRes;
    }

    if (!rawProducts) {
      // Could not extract a product list — return debug info so admin can inspect
      return NextResponse.json({
        error: 'Gagal membaca daftar produk dari Digiflazz. Struktur respons tidak dikenali.',
        digiflazzRawResponse: priceListRes
      }, { status: 502 });
    }

    // 5. Fetch current games and products from Supabase database
    let { data: games, error: gamesError } = await adminSupabase
      .from('games')
      .select('id, name, slug');
    
    if (gamesError || !games) {
      return NextResponse.json({ error: 'Failed to fetch games from database' }, { status: 500 });
    }

    // 5b. Auto-create missing games from Digiflazz brands
    const missingGamesToInsert: any[] = [];
    const processedBrands = new Set<string>();

    for (const item of rawProducts) {
      const category = (item.category || '').toLowerCase();
      const brand = item.brand || '';
      if (!brand) continue;

      const brandLower = brand.toLowerCase();
      const isGameCategory =
        category.includes('voucher') ||
        category.includes('game') ||
        brandLower.includes('mobile legend') ||
        brandLower.includes('free fire') ||
        brandLower.includes('pubg') ||
        brandLower.includes('valorant') ||
        brandLower.includes('genshin') ||
        brandLower.includes('honor of kings') ||
        brandLower.includes('mlbb');

      if (!isGameCategory || !item.buyer_product_status || !item.seller_product_status) {
        continue;
      }

      if (processedBrands.has(brandLower)) {
        continue;
      }
      processedBrands.add(brandLower);

      // Check if this brand has a match in current games
      const existingGame = games.find(g => {
        const normalizedBrand = brandLower.trim();
        if (normalizedBrand.includes('mobile legend') && g.slug === 'mobile-legends') return true;
        if (normalizedBrand.includes('free fire') && g.slug === 'free-fire') return true;
        if (normalizedBrand.includes('pubg') && g.slug === 'pubg-mobile') return true;
        if (normalizedBrand.includes('valorant') && g.slug === 'valorant') return true;
        if (normalizedBrand.includes('genshin') && g.slug === 'genshin-impact') return true;
        if ((normalizedBrand.includes('honor of kings') || normalizedBrand.includes('hok')) && g.slug === 'honor-of-kings') return true;
        if (normalizedBrand.includes('mlbb') && g.slug === 'mobile-legends') return true;
        return normalizedBrand === g.name.toLowerCase() || g.name.toLowerCase().includes(normalizedBrand);
      });

      if (!existingGame) {
        // Generate a clean slug
        const slug = brandLower.trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
        // If slug matches an existing slug exactly, avoid inserting it to prevent duplicate keys
        if (games.some(g => g.slug === slug)) {
          continue;
        }
        
        missingGamesToInsert.push({
          name: brand,
          slug: slug,
          image: 'https://images.unsplash.com/photo-1542751110-97427bbecf20?w=400',
          icon: '🎮',
          category: 'Games',
          status: true,
          description: `Top up ${brand} murah dan proses instan.`,
          publisher: 'Digiflazz'
        });
      }
    }

    if (missingGamesToInsert.length > 0) {
      const { error: insertGamesError } = await adminSupabase
        .from('games')
        .insert(missingGamesToInsert);

      if (insertGamesError) {
        console.error('Failed to auto-insert missing games:', insertGamesError);
      } else {
        // Refresh games list to include newly inserted games
        const { data: refreshedGames, error: refreshError } = await adminSupabase
          .from('games')
          .select('id, name, slug');
        if (!refreshError && refreshedGames) {
          games = refreshedGames;
        }
      }
    }

    const { data: existingProducts, error: productsError } = await adminSupabase
      .from('products')
      .select('id, game_id, provider_sku, name, price, sell_price, status');

    if (productsError || !existingProducts) {
      return NextResponse.json({ error: 'Failed to fetch existing products from database' }, { status: 500 });
    }

    // Create a map of existing products by provider_sku for fast lookup
    const existingProductsMap = new Map<string, any>();
    existingProducts.forEach(p => {
      existingProductsMap.set(p.provider_sku.toLowerCase(), p);
    });

    // 6. Map Digiflazz products to existing games in database
    // Separated into insertData (new) and updateData (existing) to avoid needing
    // a UNIQUE constraint on provider_sku — we match existing rows by their primary key (id).
    const insertData: any[] = [];
    const updateData: { id: string; payload: any }[] = [];
    let newCount = 0;
    let updateCount = 0;
    let skippedCount = 0;
    const syncedItemsLog: any[] = [];

    // Helper to find the matching game based on Digiflazz brand
    const findMatchingGame = (brand: string) => {
      const normalizedBrand = brand.toLowerCase().trim();
      
      // Match rules
      if (normalizedBrand.includes('mobile legend') || normalizedBrand.includes('mlbb')) {
        return games.find(g => g.slug === 'mobile-legends');
      }
      if (normalizedBrand.includes('free fire')) {
        return games.find(g => g.slug === 'free-fire');
      }
      if (normalizedBrand.includes('pubg')) {
        return games.find(g => g.slug === 'pubg-mobile');
      }
      if (normalizedBrand.includes('valorant')) {
        return games.find(g => g.slug === 'valorant');
      }
      if (normalizedBrand.includes('genshin')) {
        return games.find(g => g.slug === 'genshin-impact');
      }
      if (normalizedBrand.includes('honor of kings') || normalizedBrand.includes('hok')) {
        return games.find(g => g.slug === 'honor-of-kings');
      }
      
      // Try exact or prefix slug matching as fallback
      return games.find(g => 
        normalizedBrand === g.name.toLowerCase() || 
        g.name.toLowerCase().includes(normalizedBrand)
      );
    };

    for (const item of rawProducts) {
      const category = (item.category || '').toLowerCase();
      const brand = item.brand || '';
      const sku = item.buyer_sku_code;
      const name = item.product_name;
      const price = parseInt(item.price) || 0;

      // Filter: Only game vouchers/items that are active on both sides.
      // Note: Digiflazz category names in production can differ from simulation.
      // We use a broad match to catch variants like "Games", "Voucher Game", "game voucher", etc.
      const brandLower = brand.toLowerCase();
      const isGameCategory =
        category.includes('voucher') ||
        category.includes('game') ||
        brandLower.includes('mobile legend') ||
        brandLower.includes('free fire') ||
        brandLower.includes('pubg') ||
        brandLower.includes('valorant') ||
        brandLower.includes('genshin') ||
        brandLower.includes('honor of kings') ||
        brandLower.includes('mlbb');

      if (!isGameCategory || !item.buyer_product_status || !item.seller_product_status) {
        skippedCount++;
        continue;
      }

      const matchingGame = findMatchingGame(brand);
      if (!matchingGame) {
        skippedCount++;
        continue; // Skip if no game matches the brand
      }

      const skuLower = sku.toLowerCase();
      const existingProduct = existingProductsMap.get(skuLower);

      if (existingProduct) {
        // Product exists - update the HPP price, keep sell_price unless it would cause a loss
        let newSellPrice = existingProduct.sell_price;
        let adjusted = false;

        if (price >= existingProduct.sell_price) {
          // New cost price is >= current sell price - auto-markup to avoid selling at a loss
          newSellPrice = Math.round(price * multiplier);
          adjusted = true;
        }

        // Push to update batch: matched by primary key (id), no UNIQUE constraint needed
        updateData.push({
          id: existingProduct.id,
          payload: {
            game_id: matchingGame.id,
            provider_sku: sku,
            name: name,
            price: price,
            sell_price: newSellPrice,
            updated_at: new Date().toISOString()
          }
        });

        updateCount++;
        syncedItemsLog.push({
          sku,
          name,
          game: matchingGame.name,
          old_price: existingProduct.price,
          new_price: price,
          sell_price: newSellPrice,
          type: 'UPDATE',
          adjusted_sell_price: adjusted
        });
      } else {
        // Brand-new product - insert with default markup
        const initialSellPrice = Math.round(price * multiplier);

        insertData.push({
          game_id: matchingGame.id,
          provider_sku: sku,
          name: name,
          price: price,
          sell_price: initialSellPrice,
          status: true
        });

        newCount++;
        syncedItemsLog.push({
          sku,
          name,
          game: matchingGame.name,
          price: price,
          sell_price: initialSellPrice,
          type: 'NEW'
        });
      }
    }

    // 7a. Bulk INSERT new products (no unique constraint needed)
    if (insertData.length > 0) {
      const { error: insertError } = await adminSupabase
        .from('products')
        .insert(insertData);

      if (insertError) {
        console.error('Bulk insert failed during sync:', insertError);
        return NextResponse.json({
          error: 'Failed to insert new products to database',
          details: insertError.message
        }, { status: 500 });
      }
    }

    // 7b. UPDATE existing products one-by-one using their primary key (id)
    // This avoids needing a UNIQUE constraint on provider_sku.
    const updateErrors: string[] = [];
    for (const item of updateData) {
      const { error: updateError } = await adminSupabase
        .from('products')
        .update(item.payload)
        .eq('id', item.id);

      if (updateError) {
        console.error(`Failed to update product id=${item.id}:`, updateError);
        updateErrors.push(`id=${item.id}: ${updateError.message}`);
      }
    }

    return NextResponse.json({
      success: true,
      summary: {
        totalFromDigiflazz: rawProducts.length,
        newAdded: newCount,
        updated: updateCount,
        skipped: skippedCount,
        updateErrors: updateErrors.length > 0 ? updateErrors : undefined
      },
      // First 10 items for debugging (so admin can verify categories/brands look correct)
      sampleItems: rawProducts.slice(0, 10).map((i: any) => ({
        name: i.product_name,
        brand: i.brand,
        category: i.category,
        sku: i.buyer_sku_code,
        active: i.buyer_product_status && i.seller_product_status
      })),
      log: syncedItemsLog.slice(0, 50)
    });

  } catch (error: any) {
    console.error('Sync products route error:', error);
    return NextResponse.json({ 
      error: error.message || 'Internal Server Error' 
    }, { status: 500 });
  }
}

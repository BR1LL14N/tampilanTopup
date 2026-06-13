import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { ProductService } from '@/lib/services/product-service';
import { PromoService } from '@/lib/services/promo-service';
import { TransactionService } from '@/lib/services/transaction-service';
import { generateInvoice } from '@/lib/utils';

export async function POST(req: NextRequest) {
  try {
    const { product_id, target_id, target_name, payment_method, quantity, promo_code, login_method, password, request_notes } = await req.json();

    if (!product_id || !target_id || !payment_method) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Get current user if authenticated
    let userId = null;
    try {
      const user = await getCurrentUser();
      if (user) {
        userId = user.id;
      }
    } catch (e) {
      // Ignore auth fetch error (unauthenticated checkout allowed)
    }

    // Fetch product details to verify and get price
    const product = await ProductService.getById(product_id);

    if (!product || !product.status) {
      return NextResponse.json({ error: 'Product not found or inactive' }, { status: 404 });
    }

    const qty = Math.max(1, parseInt(quantity) || 1);
    
    // Check if product is currently on flash sale
    const basePrice = product.is_flash_sale && product.flash_sale_price 
      ? Number(product.flash_sale_price) 
      : product.sell_price;

    let amount = basePrice * qty;
    const invoice = generateInvoice();

    // Apply promo code discount if provided
    let discountAmount = 0;
    let promoCodeId = null;

    if (promo_code) {
      const uppercaseCode = String(promo_code).trim().toUpperCase();
      const promo = await PromoService.getByCode(uppercaseCode);

      if (promo && promo.status && Number(promo.uses_count) < Number(promo.max_uses)) {
        promoCodeId = promo.id;
        if (Number(promo.discount_percent) > 0) {
          discountAmount = Math.round(amount * (Number(promo.discount_percent) / 100));
        } else if (Number(promo.discount_amount) > 0) {
          discountAmount = Number(promo.discount_amount);
        }

        // Limit discount to ensure final amount is at least Rp 1
        discountAmount = Math.min(discountAmount, amount - 1);
        amount -= discountAmount;

        // Increment usage count of the promo code
        await PromoService.incrementUsesCount(promo.id);
      }
    }

    // Real Mayar.id integration or Mock fallback
    let qr_string = null;
    let payment_url = null;
    
    const mayarApiKey = process.env.MAYAR_API_KEY;
    if (mayarApiKey) {
      try {
        const authHeader = mayarApiKey.startsWith('Bearer ') ? mayarApiKey : `Bearer ${mayarApiKey}`;
        const isProduction = process.env.DIGIFLAZZ_MODE === 'production';
        const mayarBaseUrl = isProduction ? 'https://api.mayar.id' : 'https://api.mayar.club';
        const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
        const redirectUrl = `${siteUrl}/history/${invoice}`;

        let customerName = 'Pelanggan';
        let customerEmail = `${invoice.toLowerCase()}@mitsuru-shop.sir-l.web.id`;
        let customerPhone = '08123456789';

        if (userId) {
          try {
            const { executeQuery } = await import('@/lib/db');
            const userProfile = await executeQuery(
              "SELECT name, email, phone FROM user_profiles WHERE id = $1 LIMIT 1",
              [userId]
            );
            if (userProfile && userProfile.length > 0) {
              customerName = userProfile[0].name || customerName;
              customerEmail = userProfile[0].email || customerEmail;
              customerPhone = userProfile[0].phone || customerPhone;
            }
          } catch (dbErr) {
            console.error('Failed to fetch user profile for Mayar:', dbErr);
          }
        }

        const mayarRes = await fetch(`${mayarBaseUrl}/hl/v1/invoice/create`, {
          method: 'POST',
          headers: {
            'Authorization': authHeader,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            name: customerName,
            email: customerEmail,
            mobile: customerPhone,
            description: `Top Up ${product.name} (${invoice})`,
            redirectUrl: redirectUrl,
            items: [
              {
                quantity: qty,
                rate: amount,
                description: product.name,
              }
            ]
          })
        });

        const mayarData = await mayarRes.json();
        if (mayarData && mayarData.link) {
          payment_url = mayarData.link;
        } else {
          console.error('Mayar API error response:', mayarData);
          payment_url = `${siteUrl}/checkout/mock?invoice=${invoice}`;
        }
      } catch (mayarErr) {
        console.error('Failed to call Mayar API:', mayarErr);
        const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
        payment_url = `${siteUrl}/checkout/mock?invoice=${invoice}`;
      }
    } else {
      if (payment_method.toLowerCase() === 'qris') {
        qr_string = "00020101021226620009com.bri.ccho.id010911000000000001020326303003000000000000000052040000000000000000052069000016000000000000000000103015802091573303710501000008000005820333待定00000000000000000000000000";
      } else {
        payment_url = "https://checkout.sandbox.gateway.com/" + invoice;
      }
    }

    const expired_at = new Date(Date.now() + 15 * 60 * 1000).toISOString(); // 15 minutes from now

    // Insert transaction
    const transaction = await TransactionService.create({
      invoice,
      user_id: userId,
      product_id: product.id,
      target_id,
      target_name: target_name || null,
      amount,
      payment_method,
      payment_status: 'pending',
      topup_status: 'pending',
      qr_string,
      payment_url,
      expired_at,
      promo_code_id: promoCodeId,
      discount_amount: discountAmount,
      login_method: login_method || null,
      password: password || null,
      request_notes: request_notes || null,
    });

    return NextResponse.json({ data: transaction });
  } catch (error: any) {
    console.error('Create transaction API error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}

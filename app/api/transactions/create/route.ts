import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { generateInvoice } from '@/lib/utils';

export async function POST(req: NextRequest) {
  try {
    const { product_id, target_id, target_name, payment_method, quantity } = await req.json();

    if (!product_id || !target_id || !payment_method) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const supabase = await createClient();

    // Get current user if authenticated
    let userId = null;
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        userId = user.id;
      }
    } catch (e) {
      // Ignore auth fetch error (unauthenticated checkout allowed)
    }

    // Fetch product details to verify and get price
    const { data: product, error: productError } = await supabase
      .from('products')
      .select('*')
      .eq('id', product_id)
      .eq('status', true)
      .single();

    if (productError || !product) {
      return NextResponse.json({ error: 'Product not found or inactive' }, { status: 404 });
    }

    const qty = Math.max(1, parseInt(quantity) || 1);
    const amount = product.sell_price * qty;
    const invoice = generateInvoice();

    // Mock QRIS or Payment Details
    let qr_string = null;
    let payment_url = null;
    
    if (payment_method.toLowerCase() === 'qris') {
      // Mock QRIS payload
      qr_string = "00020101021226620009com.bri.ccho.id010911000000000001020326303003000000000000000052040000000000000000052069000016000000000000000000103015802091573303710501000008000005820333待定00000000000000000000000000";
    } else {
      payment_url = "https://checkout.sandbox.gateway.com/" + invoice;
    }

    const expired_at = new Date(Date.now() + 15 * 60 * 1000).toISOString(); // 15 minutes from now

    // Insert transaction
    const { data: transaction, error: insertError } = await supabase
      .from('transactions')
      .insert({
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
      })
      .select('*')
      .single();

    if (insertError) {
      console.error('Insert transaction error:', insertError);
      return NextResponse.json({ error: 'Failed to create transaction' }, { status: 500 });
    }

    return NextResponse.json({ data: transaction });
  } catch (error: any) {
    console.error('Create transaction API error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}

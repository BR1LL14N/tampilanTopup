import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createTopup } from '@/lib/digiflazz';

export async function POST(req: NextRequest) {
  try {
    const { invoice } = await req.json();

    if (!invoice) {
      return NextResponse.json({ error: 'Invoice is required' }, { status: 400 });
    }

    const supabase = await createClient();

    // 1. Fetch transaction
    const { data: transaction, error: txError } = await supabase
      .from('transactions')
      .select('*')
      .eq('invoice', invoice)
      .single();

    if (txError || !transaction) {
      return NextResponse.json({ error: 'Transaction not found' }, { status: 404 });
    }

    if (transaction.payment_status === 'paid') {
      return NextResponse.json({ 
        message: 'Transaction already paid', 
        data: transaction 
      });
    }

    // 2. Fetch associated product to get sku
    const { data: product, error: prodError } = await supabase
      .from('products')
      .select('provider_sku')
      .eq('id', transaction.product_id)
      .single();

    if (prodError || !product) {
      return NextResponse.json({ error: 'Product SKU not found' }, { status: 404 });
    }

    // 3. Mark as paid in database and set status to processing
    const now = new Date().toISOString();
    const { error: updateError } = await supabase
      .from('transactions')
      .update({
        payment_status: 'paid',
        paid_at: now,
        topup_status: 'processing',
        updated_at: now,
      })
      .eq('id', transaction.id);

    if (updateError) {
      console.error('Failed to update payment status:', updateError);
      return NextResponse.json({ error: 'Failed to update transaction status' }, { status: 500 });
    }

    // 4. Call Digiflazz API
    let topupStatus = 'processing';
    let providerRef = null;
    let providerResponse = null;

    try {
      const response = await createTopup(
        product.provider_sku,
        transaction.target_id,
        transaction.invoice,
        true // testing = true for dev/sandbox env
      );

      providerResponse = response;
      const responseData = response?.data;

      if (responseData) {
        providerRef = responseData.sn || null;
        
        // Digiflazz Response Codes:
        // '00' = Success
        // '03' = Pending
        // Others = Failed (e.g. '02' = Gagal, '50' = Saldo Kurang)
        if (responseData.rc === '00') {
          topupStatus = 'success';
        } else if (responseData.rc === '03' || responseData.rc === '39') {
          topupStatus = 'processing';
        } else {
          topupStatus = 'failed';
        }
      } else {
        topupStatus = 'failed';
      }
    } catch (apiError: any) {
      console.error('Digiflazz API call failed:', apiError);
      topupStatus = 'failed';
      providerResponse = { error: apiError.message || 'API Call failed' };
    }

    // 5. Save Digiflazz response to transaction
    const { data: updatedTx, error: finalUpdateError } = await supabase
      .from('transactions')
      .update({
        topup_status: topupStatus,
        provider_ref: providerRef,
        provider_response: providerResponse,
        updated_at: new Date().toISOString(),
      })
      .eq('id', transaction.id)
      .select('*')
      .single();

    if (finalUpdateError) {
      console.error('Failed to update final topup status:', finalUpdateError);
      return NextResponse.json({ error: 'Failed to complete topup status update' }, { status: 500 });
    }

    return NextResponse.json({ 
      message: 'Payment verified and topup processed', 
      data: updatedTx 
    });
  } catch (error: any) {
    console.error('Pay transaction API error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}

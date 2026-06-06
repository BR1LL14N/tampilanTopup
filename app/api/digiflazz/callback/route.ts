import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(req: NextRequest) {
  try {
    const payload = await req.json();
    console.log('Received Digiflazz Callback payload:', payload);

    const { ref_id, status, rc, sn, message } = payload;

    if (!ref_id) {
      return NextResponse.json({ error: 'Missing ref_id' }, { status: 400 });
    }

    // Security Check: Whitelist Digiflazz Callback IP in Production
    const isProduction = process.env.DIGIFLAZZ_MODE === 'production';
    if (isProduction) {
      const forwardedFor = req.headers.get('x-forwarded-for') || '';
      const clientIp = forwardedFor.split(',')[0].trim() || req.ip || '';
      
      // Digiflazz official callback IP is 52.74.250.133
      if (clientIp !== '52.74.250.133' && !clientIp.includes('127.0.0.1')) {
        console.warn(`Blocked unauthorized callback attempt from IP: ${clientIp}`);
        return NextResponse.json({ error: 'Unauthorized sender IP' }, { status: 403 });
      }
    }

    const supabase = await createClient();

    // 1. Find transaction by invoice (ref_id)
    const { data: transaction, error: txError } = await supabase
      .from('transactions')
      .select('*')
      .eq('invoice', ref_id)
      .single();

    if (txError || !transaction) {
      console.error(`Transaction for invoice ${ref_id} not found in database:`, txError);
      return NextResponse.json({ error: 'Transaction not found' }, { status: 404 });
    }

    // 2. Map Digiflazz status to Supabase topup_status
    let topupStatus = 'processing';
    
    // Digiflazz status codes: '00' = Success, '03' = Pending
    if (rc === '00' || status?.toLowerCase() === 'sukses') {
      topupStatus = 'success';
    } else if (rc === '03' || status?.toLowerCase() === 'pending' || status?.toLowerCase() === 'proses') {
      topupStatus = 'processing';
    } else {
      topupStatus = 'failed';
    }

    // 3. Update database record
    const { error: updateError } = await supabase
      .from('transactions')
      .update({
        topup_status: topupStatus,
        provider_ref: sn || transaction.provider_ref,
        provider_response: {
          ...((transaction.provider_response as object) || {}),
          callback: payload,
        },
        updated_at: new Date().toISOString(),
      })
      .eq('id', transaction.id);

    if (updateError) {
      console.error(`Failed to update transaction ${ref_id} status via callback:`, updateError);
      return NextResponse.json({ error: 'Failed to update transaction' }, { status: 500 });
    }

    console.log(`Successfully updated transaction ${ref_id} status to ${topupStatus} via callback.`);
    
    // Return standard success to Digiflazz
    return NextResponse.json({ 
      success: true, 
      message: 'Callback processed successfully' 
    });
  } catch (error: any) {
    console.error('Digiflazz Callback Handler Error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}

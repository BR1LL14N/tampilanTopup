import { NextRequest, NextResponse } from 'next/server';
import { TransactionService } from '@/lib/services/transaction-service';
import crypto from 'crypto';

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.text();
    let payload;
    try {
      payload = JSON.parse(rawBody);
    } catch (parseErr) {
      return NextResponse.json({ error: 'Invalid JSON payload' }, { status: 400 });
    }
    
    console.log('Received Digiflazz Callback payload:', payload);

    const { ref_id, status, rc, sn, message } = payload;

    if (!ref_id) {
      return NextResponse.json({ error: 'Missing ref_id' }, { status: 400 });
    }

    // Security Check: Whitelist Digiflazz Callback IP and/or Verify Signature in Production
    const isProduction = process.env.DIGIFLAZZ_MODE === 'production';
    if (isProduction) {
      const webhookSecret = process.env.DIGIFLAZZ_WEBHOOK_SECRET;

      if (webhookSecret) {
        // Verify HMAC SHA1 Signature sent by Digiflazz
        const signature = req.headers.get('x-hub-signature');
        if (!signature) {
          console.warn('Blocked callback: Missing x-hub-signature header');
          return NextResponse.json({ error: 'Missing signature' }, { status: 401 });
        }

        const hmac = crypto.createHmac('sha1', webhookSecret);
        const digest = 'sha1=' + hmac.update(rawBody).digest('hex');

        if (signature !== digest) {
          console.warn('Blocked callback: Invalid signature');
          return NextResponse.json({ error: 'Invalid signature' }, { status: 403 });
        }
      } else {
        // Fallback to IP Whitelist verification
        const forwardedFor = req.headers.get('x-forwarded-for') || '';
        const clientIp = forwardedFor.split(',')[0].trim() || req.ip || '';
        
        // Digiflazz official callback IP is 52.74.250.133
        if (clientIp !== '52.74.250.133' && !clientIp.includes('127.0.0.1')) {
          console.warn(`Blocked unauthorized callback attempt from IP: ${clientIp}`);
          return NextResponse.json({ error: 'Unauthorized sender IP' }, { status: 403 });
        }
      }
    }

    // 1. Find transaction by invoice (ref_id)
    const transaction = await TransactionService.getByInvoice(ref_id);

    if (!transaction) {
      console.error(`Transaction for invoice ${ref_id} not found in database`);
      return NextResponse.json({ error: 'Transaction not found' }, { status: 404 });
    }

    // 2. Map Digiflazz status to topup_status
    let topupStatus = 'processing';
    
    // Digiflazz status codes: '00' = Success, '03' = Pending
    if (rc === '00' || status?.toLowerCase() === 'sukses') {
      topupStatus = 'success';
    } else if (rc === '03' || status?.toLowerCase() === 'pending' || status?.toLowerCase() === 'proses') {
      topupStatus = 'processing';
    } else {
      topupStatus = 'failed';
    }

    // 3. Parse existing provider response
    let prevResponse = {};
    if (transaction.provider_response) {
      try {
        prevResponse = typeof transaction.provider_response === 'string'
          ? JSON.parse(transaction.provider_response)
          : transaction.provider_response;
      } catch (e) {
        // ignore
      }
    }

    const providerResponse = {
      ...prevResponse,
      callback: payload,
    };

    // 4. Update database record
    try {
      await TransactionService.update(transaction.id, {
        topup_status: topupStatus,
        provider_ref: sn || transaction.provider_ref,
        provider_response: JSON.stringify(providerResponse),
        updated_at: new Date().toISOString(),
      });
    } catch (updateError) {
      console.error(`Failed to update transaction ${ref_id} status via callback:`, updateError);
      return NextResponse.json({ error: 'Failed to update transaction' }, { status: 500 });
    }

    console.log(`Successfully updated transaction ${ref_id} status to ${topupStatus} via callback.`);
    
    return NextResponse.json({ 
      success: true, 
      message: 'Callback processed successfully' 
    });
  } catch (error: any) {
    console.error('Digiflazz Callback Handler Error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}

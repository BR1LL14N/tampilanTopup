import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { TransactionService } from '@/lib/services/transaction-service';

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const payload = await req.json();
    console.log('Received Midtrans Notification Callback:', payload);

    const {
      order_id,
      status_code,
      gross_amount,
      signature_key,
      transaction_status,
      fraud_status,
      payment_type
    } = payload;

    if (!order_id) {
      return NextResponse.json({ error: 'Missing order_id' }, { status: 400 });
    }

    // 1. Verify Midtrans signature key for security
    const { SettingService } = await import('@/lib/services/setting-service');
    const dbMidtransMode = await SettingService.get('midtrans_mode', 'sandbox');
    const isProduction = dbMidtransMode === 'production';
    const serverKey = isProduction
      ? process.env.MIDTRANS_SERVER_KEY
      : (process.env.MIDTRANS_SANDBOX_SERVER_KEY || process.env.MIDTRANS_SERVER_KEY);

    if (serverKey) {
      const signatureSource = `${order_id}${status_code}${gross_amount}${serverKey}`;
      const calculatedSignature = crypto.createHash('sha512').update(signatureSource).digest('hex');
      
      if (calculatedSignature !== signature_key) {
        console.error('Invalid Midtrans signature. Verification failed.');
        return NextResponse.json({ error: 'Invalid signature key' }, { status: 403 });
      }
    } else {
      console.warn('Midtrans Server Key is not defined. Skipping signature validation (Development Mode).');
    }

    // 2. Fetch the corresponding transaction
    const transaction = await TransactionService.getByInvoice(order_id);
    if (!transaction) {
      console.error(`Transaction with invoice ${order_id} not found.`);
      return NextResponse.json({ error: 'Transaction not found' }, { status: 404 });
    }

    // 3. Map Midtrans transaction_status to database status
    let isPaid = false;
    let isFailed = false;

    if (transaction_status === 'settlement') {
      isPaid = true;
    } else if (transaction_status === 'capture') {
      if (payment_type === 'credit_card' && fraud_status === 'accept') {
        isPaid = true;
      } else if (fraud_status === 'challenge') {
        console.log(`Transaction ${order_id} is challenged. Awaiting manual review.`);
      }
    } else if (['cancel', 'deny', 'expire'].includes(transaction_status)) {
      isFailed = true;
    }

    // 4. Update transaction status
    if (isPaid) {
      if (transaction.payment_status === 'paid') {
        return NextResponse.json({ success: true, message: 'Transaction already marked as paid' });
      }

      console.log(`Midtrans Webhook: Transaction ${order_id} is PAID. Fulfilling order...`);
      const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
      
      try {
        const payRes = await fetch(`${siteUrl}/api/transactions/pay`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ invoice: order_id }),
        });
        const payData = await payRes.json();
        console.log(`Pay API execution result for ${order_id}:`, payData);
      } catch (payErr) {
        console.error(`Failed to trigger pay API for ${order_id}, falling back to manual DB update:`, payErr);
        
        // Manual database fallback
        const now = new Date().toISOString();
        await TransactionService.update(transaction.id, {
          payment_status: 'paid',
          paid_at: now,
          topup_status: 'processing',
          updated_at: now,
        });
      }
    } else if (isFailed) {
      console.log(`Midtrans Webhook: Transaction ${order_id} is FAILED/EXPIRED/CANCELLED.`);
      await TransactionService.update(transaction.id, {
        payment_status: 'failed',
        topup_status: 'failed',
        updated_at: new Date().toISOString(),
      });
    } else {
      console.log(`Midtrans Webhook: Transaction ${order_id} has status: ${transaction_status}. No action taken.`);
    }

    return NextResponse.json({ success: true, message: 'Notification processed successfully' });
  } catch (error: any) {
    console.error('Midtrans Webhook Callback Handler Error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}

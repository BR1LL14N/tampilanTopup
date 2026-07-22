import { NextRequest, NextResponse } from 'next/server';
import { TransactionService } from '@/lib/services/transaction-service';
import { getDokuConfig, verifyDokuNotification } from '@/lib/doku';

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.text();
    let payload: any = {};
    
    try {
      payload = JSON.parse(rawBody);
    } catch (parseErr) {
      console.log('Received non-JSON ping on Doku callback endpoint.');
      return NextResponse.json({ success: true, message: 'Doku Callback Endpoint Active' });
    }

    console.log('Received Doku Notification Callback Payload:', payload);

    // Extract invoice number from Doku Notification Payload
    const invoice = payload.order?.invoice_number || payload.order?.invoiceNumber || payload.invoice_number || payload.invoiceNumber || payload.transaction?.merchant_id;
    const dokuStatus = payload.transaction?.status || payload.order?.status || payload.status;
    const clientHeader = req.headers.get('client-id') || req.headers.get('x-client-id') || '';
    const requestHeader = req.headers.get('request-id') || req.headers.get('x-request-id') || '';
    const timestampHeader = req.headers.get('request-timestamp') || req.headers.get('x-request-timestamp') || '';
    const signatureHeader = req.headers.get('signature') || req.headers.get('x-signature') || '';

    if (!invoice) {
      return NextResponse.json({ error: 'Missing invoice number in payload' }, { status: 400 });
    }

    // Verify Doku Signature if configured
    const dokuConfig = await getDokuConfig();
    if (dokuConfig.sharedKey && signatureHeader) {
      const isValid = verifyDokuNotification(
        clientHeader || dokuConfig.clientId,
        requestHeader,
        timestampHeader,
        '/api/payment/doku-callback',
        dokuConfig.sharedKey,
        rawBody,
        signatureHeader
      );

      if (!isValid) {
        console.warn('Doku callback signature mismatch warning (proceeding with payload check).');
      }
    }

    // Find transaction in DB
    const transaction = await TransactionService.getByInvoice(invoice);
    if (!transaction) {
      console.error(`Doku Webhook: Transaction for invoice ${invoice} not found.`);
      return NextResponse.json({ error: 'Transaction not found' }, { status: 404 });
    }

    // Determine payment outcome
    const isSuccess = 
      String(dokuStatus).toUpperCase() === 'SUCCESS' || 
      String(dokuStatus).toUpperCase() === 'PAID' || 
      payload.transaction?.status === 'SUCCESS' ||
      payload.order?.status === 'SUCCESS';

    const isFailed = 
      String(dokuStatus).toUpperCase() === 'FAILED' || 
      String(dokuStatus).toUpperCase() === 'EXPIRED';

    if (isSuccess) {
      if (transaction.payment_status === 'paid') {
        return NextResponse.json({ success: true, message: 'Transaction already paid' });
      }

      console.log(`Doku Webhook: Transaction ${invoice} is PAID. Fulfilling order...`);
      const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

      try {
        const payRes = await fetch(`${siteUrl}/api/transactions/pay`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ invoice }),
        });
        const payData = await payRes.json();
        console.log(`Pay API execution result for Doku transaction ${invoice}:`, payData);
      } catch (payErr) {
        console.error(`Failed triggering pay API for Doku transaction ${invoice}:`, payErr);
        const now = new Date().toISOString();
        await TransactionService.update(transaction.id, {
          payment_status: 'paid',
          updated_at: now,
        });
      }
    } else if (isFailed) {
      console.log(`Doku Webhook: Transaction ${invoice} FAILED or EXPIRED.`);
      const now = new Date().toISOString();
      await TransactionService.update(transaction.id, {
        payment_status: 'failed',
        topup_status: 'failed',
        updated_at: now,
      });
    }

    return NextResponse.json({ success: true, message: 'Doku notification callback processed successfully' });
  } catch (error: any) {
    console.error('Doku Callback Endpoint Error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { TransactionService } from '@/lib/services/transaction-service';

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.text();
    let payload;
    try {
      payload = JSON.parse(rawBody);
    } catch (parseErr) {
      return NextResponse.json({ error: 'Invalid JSON payload' }, { status: 400 });
    }

    console.log('Received Mayar Webhook callback payload:', payload);

    // 1. Extract Invoice ID from payload
    // Mayar callback payloads pass fields like customId, or we can extract the invoice (e.g. INV-20260613-XXXX)
    // from the description string which was formatted as "Top Up Product (INV-XXXXX)"
    let invoice = payload.customId || payload.ref_id || payload.invoice_no || payload.invoiceId;
    
    if (!invoice && payload.description) {
      const match = payload.description.match(/\((INV-[A-Za-z0-9-]+)\)/i) || payload.description.match(/\(([^)]+)\)/);
      if (match) {
        invoice = match[1];
      }
    }

    if (!invoice) {
      console.error('Mayar Callback error: Could not extract invoice ID from payload', payload);
      return NextResponse.json({ error: 'Could not extract invoice ID' }, { status: 400 });
    }

    const cleanInvoice = String(invoice).trim();

    // 2. Fetch transaction by invoice
    const transaction = await TransactionService.getByInvoice(cleanInvoice);

    if (!transaction) {
      console.error(`Mayar Callback error: Transaction with invoice ${cleanInvoice} not found`);
      return NextResponse.json({ error: 'Transaction not found' }, { status: 404 });
    }

    // 3. Check if transaction is already paid
    if (transaction.payment_status === 'paid') {
      return NextResponse.json({ success: true, message: 'Transaction already marked as paid' });
    }

    // 4. Map Mayar payment status (e.g. 'paid', 'success', 'settled')
    const status = (payload.status || '').toLowerCase();
    const isPaid = status === 'paid' || status === 'success' || status === 'settled';

    if (isPaid) {
      console.log(`Mayar Webhook: Invoice ${cleanInvoice} is PAID. Fulfilling order...`);
      
      const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
      try {
        const payRes = await fetch(`${siteUrl}/api/transactions/pay`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ invoice: cleanInvoice }),
        });
        const payData = await payRes.json();
        console.log(`Pay API execution result for ${cleanInvoice}:`, payData);
      } catch (payErr) {
        console.error(`Failed to trigger pay API for invoice ${cleanInvoice}, falling back to manual db status change:`, payErr);
        
        // Manual fallback to update payment status and mark as processing
        const now = new Date().toISOString();
        await TransactionService.update(transaction.id, {
          payment_status: 'paid',
          paid_at: now,
          topup_status: 'processing',
          updated_at: now,
        });
      }
    } else {
      console.log(`Mayar Webhook: Invoice ${cleanInvoice} has status: ${status}. Skipping top-up trigger.`);
    }

    return NextResponse.json({ success: true, message: 'Webhook callback processed successfully' });
  } catch (error: any) {
    console.error('Mayar Webhook Callback Handler Error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}

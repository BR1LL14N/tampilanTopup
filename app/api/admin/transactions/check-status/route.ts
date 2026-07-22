import { NextRequest, NextResponse } from 'next/server';
import { verifyAdmin } from '@/lib/auth';
import { TransactionService } from '@/lib/services/transaction-service';
import { ProductService } from '@/lib/services/product-service';
import { createTopup } from '@/lib/digiflazz';

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const isAdmin = await verifyAdmin();
    if (!isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const { invoice } = await req.json();
    if (!invoice) {
      return NextResponse.json({ error: 'Invoice parameter is required' }, { status: 400 });
    }

    // 1. Fetch transaction
    const transaction = await TransactionService.getByInvoice(invoice);
    if (!transaction) {
      return NextResponse.json({ error: 'Transaction not found' }, { status: 404 });
    }

    // 2. Fetch product details
    const product = await ProductService.getById(transaction.product_id);
    if (!product) {
      return NextResponse.json({ error: 'Product SKU not found' }, { status: 404 });
    }

    // 3. Query Digiflazz API status
    const isTesting = process.env.DIGIFLAZZ_MODE !== 'production';
    console.log(`[Check Status API] Querying Digiflazz status for Invoice: ${invoice}, SKU: ${product.provider_sku}, Target: ${transaction.target_id}`);

    const response = await createTopup(
      product.provider_sku,
      transaction.target_id,
      transaction.invoice,
      isTesting
    );

    const responseData = response?.data;
    if (!responseData) {
      return NextResponse.json({ 
        error: 'Gagal mendapat respon status dari Digiflazz',
        digiflazzRaw: response
      }, { status: 502 });
    }

    const rc = responseData.rc;
    const statusStr = String(responseData.status || responseData.message || '').toLowerCase();
    const sn = responseData.sn || transaction.provider_ref || null;

    let topupStatus = 'processing';
    if (rc === '00' || statusStr === 'sukses' || statusStr === 'success') {
      topupStatus = 'success';
    } else if (rc === '03' || rc === '39' || statusStr === 'pending' || statusStr === 'proses' || statusStr === 'processing') {
      topupStatus = 'processing';
    } else {
      topupStatus = 'failed';
    }

    // 4. Update transaction in DB
    const now = new Date().toISOString();
    await TransactionService.update(transaction.id, {
      topup_status: topupStatus,
      provider_ref: sn,
      provider_response: JSON.stringify({
        ...JSON.parse(transaction.provider_response || '{}'),
        manual_check_status: responseData
      }),
      updated_at: now
    });

    // 5. Trigger notifications if status changed to success
    if (topupStatus === 'success' && transaction.topup_status !== 'success') {
      try {
        const { WhatsappService } = await import('@/lib/services/whatsapp-service');
        const freshTx = await TransactionService.getByInvoice(invoice);
        if (freshTx) {
          WhatsappService.sendSuccessNotification(freshTx).catch(err => {
            console.error('[Check Status API] WA Notification Error:', err);
          });
        }
      } catch (waErr) {
        console.error('[Check Status API] WA Init Error:', waErr);
      }
    }

    const updatedTx = await TransactionService.getByInvoice(invoice);
    return NextResponse.json({
      success: true,
      message: `Status transaksi berhasil diperbarui menjadi '${topupStatus.toUpperCase()}'.`,
      topupStatus,
      sn,
      digiflazzData: responseData,
      transaction: updatedTx
    });

  } catch (error: any) {
    console.error('Check status API error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}

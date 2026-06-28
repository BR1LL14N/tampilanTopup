import { NextRequest, NextResponse } from 'next/server';
import { ProductService } from '@/lib/services/product-service';
import { TransactionService } from '@/lib/services/transaction-service';
import { createTopup } from '@/lib/digiflazz';

export async function POST(req: NextRequest) {
  try {
    const { invoice } = await req.json();

    if (!invoice) {
      return NextResponse.json({ error: 'Invoice is required' }, { status: 400 });
    }

    // Security check: If running in production mode, require authorization token matching Midtrans Server Key
    try {
      const { SettingService } = await import('@/lib/services/setting-service');
      const dbMidtransMode = await SettingService.get('midtrans_mode', 'sandbox');
      const isProduction = dbMidtransMode === 'production';
      const serverKey = isProduction
        ? process.env.MIDTRANS_SERVER_KEY
        : (process.env.MIDTRANS_SANDBOX_SERVER_KEY || process.env.MIDTRANS_SERVER_KEY);

      if (isProduction && serverKey) {
        const authHeader = req.headers.get('authorization');
        if (!authHeader || authHeader !== `Bearer ${serverKey}`) {
          console.warn(`Unauthorized attempt to call pay API directly for invoice: ${invoice}`);
          return NextResponse.json({ error: 'Unauthorized access' }, { status: 401 });
        }
      }
    } catch (secError) {
      console.error('Failed to perform API pay security verification:', secError);
      return NextResponse.json({ error: 'Internal security check error' }, { status: 500 });
    }

    // 1. Fetch transaction
    const transaction = await TransactionService.getByInvoice(invoice);

    if (!transaction) {
      return NextResponse.json({ error: 'Transaction not found' }, { status: 404 });
    }

    if (transaction.payment_status === 'paid') {
      return NextResponse.json({ 
        message: 'Transaction already paid', 
        data: transaction 
      });
    }

    // 2. Fetch associated product to get sku
    const product = await ProductService.getById(transaction.product_id);

    if (!product) {
      return NextResponse.json({ error: 'Product SKU not found' }, { status: 404 });
    }

    // 3. Mark as paid in database and set status to processing
    const now = new Date().toISOString();
    try {
      await TransactionService.update(transaction.id, {
        payment_status: 'paid',
        paid_at: now,
        topup_status: 'processing',
        updated_at: now,
      });
    } catch (updateError) {
      console.error('Failed to update payment status:', updateError);
      return NextResponse.json({ error: 'Failed to update transaction status' }, { status: 500 });
    }

    // 4. Call Digiflazz API
    let topupStatus = 'processing';
    let providerRef = null;
    let providerResponse = null;

    try {
      const isTesting = process.env.DIGIFLAZZ_MODE !== 'production';
      const response = await createTopup(
        product.provider_sku,
        transaction.target_id,
        transaction.invoice,
        isTesting // false in production, true in development/sandbox
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
    try {
      await TransactionService.update(transaction.id, {
        topup_status: topupStatus,
        provider_ref: providerRef,
        provider_response: JSON.stringify(providerResponse),
        updated_at: new Date().toISOString(),
      });

      // Trigger WhatsApp Success Notification asynchronously if top-up is completed
      if (topupStatus === 'success') {
        try {
          const { WhatsappService } = await import("@/lib/services/whatsapp-service");
          const freshTx = await TransactionService.getByInvoice(transaction.invoice);
          if (freshTx) {
            WhatsappService.sendSuccessNotification(freshTx).catch(err => {
              console.error("Failed sending success WA notification asynchronously:", err);
            });
          }
        } catch (waErr) {
          console.error("Failed initiating success WA notification:", waErr);
        }

        // Trigger In-App Notifications asynchronously
        try {
          const { executeQuery } = await import("@/lib/db");
          const provider = process.env.DB_PROVIDER || "mysql";
          const notifTable = provider === "supabase" ? "public.notifications" : "notifications";

          // 1. Notify Customer (if logged in)
          if (transaction.user_id) {
            const cNotifId = require("crypto").randomUUID();
            const clientNotifSql = `
              INSERT INTO ${notifTable} (id, user_id, is_admin, title, message, type, link)
              VALUES ($1, $2, $3, $4, $5, $6, $7)
            `;
            await executeQuery(clientNotifSql, [
              cNotifId,
              transaction.user_id,
              provider === "supabase" ? false : 0,
              "Top-Up Sukses! 🎉",
              `Pembelian ${product.name} untuk Target ${transaction.target_id} berhasil dikirim. SN: ${providerRef || "-"}`,
              "payment_success",
              `/history/${transaction.invoice}`
            ]);
          }

          // 2. Notify Admin
          const aNotifId = require("crypto").randomUUID();
          const adminNotifSql = `
            INSERT INTO ${notifTable} (id, user_id, is_admin, title, message, type, link)
            VALUES ($1, $2, $3, $4, $5, $6, $7)
          `;
          await executeQuery(adminNotifSql, [
            aNotifId,
            null,
            provider === "supabase" ? true : 1,
            "Top-Up Sukses Diproses",
            `Transaksi #${transaction.invoice} selesai. SN: ${providerRef || "-"}`,
            "payment_success",
            `/admin/transactions`
          ]);
        } catch (inAppErr) {
          console.error("Failed creating in-app topup success notifications:", inAppErr);
        }
      }
    } catch (finalUpdateError) {
      console.error('Failed to update final topup status:', finalUpdateError);
      return NextResponse.json({ error: 'Failed to complete topup status update' }, { status: 500 });
    }

    // Fetch refreshed transaction to return
    const refreshedTx = await TransactionService.getByInvoice(transaction.invoice);

    return NextResponse.json({ 
      message: 'Payment verified and topup processed', 
      data: refreshedTx 
    });
  } catch (error: any) {
    console.error('Pay transaction API error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}

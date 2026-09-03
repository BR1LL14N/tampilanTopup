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

    const dataObj = payload.data || payload;
    const { ref_id, status, rc, sn, message } = dataObj;

    // Handle Digiflazz Test Ping / Verification request when clicking 'Simpan' in Digiflazz dashboard
    if (!ref_id || payload.ping || payload.event === 'ping') {
      console.log('Digiflazz Webhook test ping received successfully.');
      return NextResponse.json({ success: true, message: 'Digiflazz Webhook Endpoint Active' }, { status: 200 });
    }

    // Security Verification: Read Webhook Secret from SettingService or ENV
    const { SettingService } = await import('@/lib/services/setting-service');
    const webhookSecret = (await SettingService.get('digiflazz_webhook_secret', '')) || process.env.DIGIFLAZZ_WEBHOOK_SECRET;

    if (webhookSecret) {
      const signature = req.headers.get('x-hub-signature') || req.headers.get('x-digiflazz-signature') || '';
      if (signature) {
        const hmac = crypto.createHmac('sha1', webhookSecret);
        const digest = 'sha1=' + hmac.update(rawBody).digest('hex');
        if (signature !== digest) {
          console.error(`[Digiflazz Callback Rejected] Invalid signature. Recv: ${signature}, Calc: ${digest}`);
          return NextResponse.json({ error: 'Invalid webhook signature' }, { status: 401 });
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
    const statusLower = String(status || '').toLowerCase();
    
    // Digiflazz status codes: '00' = Success, '03' / '39' = Pending/Proses
    if (rc === '00' || statusLower === 'sukses' || statusLower === 'success') {
      topupStatus = 'success';
    } else if (rc === '03' || rc === '39' || statusLower === 'pending' || statusLower === 'proses' || statusLower === 'processing') {
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

      // Trigger WhatsApp Success Notification asynchronously if top-up is completed
      if (topupStatus === 'success') {
        try {
          const { WhatsappService } = await import("@/lib/services/whatsapp-service");
          const freshTx = await TransactionService.getByInvoice(ref_id);
          if (freshTx) {
            WhatsappService.sendSuccessNotification(freshTx).catch(err => {
              console.error("Failed sending success WA notification via Digiflazz callback:", err);
            });
          }
        } catch (waErr) {
          console.error("Failed initiating success WA notification in Digiflazz callback:", waErr);
        }

        // Trigger In-App Notifications asynchronously
        try {
          const { executeQuery } = await import("@/lib/db");
          const provider = process.env.DB_PROVIDER || "mysql";
          const notifTable = provider === "supabase" ? "public.notifications" : "notifications";

          let prodName = "Produk Top-Up";
          const pRows = await executeQuery("SELECT name FROM products WHERE id = $1 LIMIT 1", [transaction.product_id]);
          if (pRows && pRows.length > 0) {
            prodName = pRows[0].name;
          }

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
              `Pembelian ${prodName} untuk Target ${transaction.target_id} berhasil dikirim. SN: ${sn || "-"}`,
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
            `Transaksi #${transaction.invoice} selesai via callback. SN: ${sn || "-"}`,
            "payment_success",
            `/admin/transactions`
          ]);
        } catch (inAppErr) {
          console.error("Failed creating in-app topup success notifications in Digiflazz callback:", inAppErr);
        }
      }
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

import { TransactionService } from '@/lib/services/transaction-service';
import { ProductService } from '@/lib/services/product-service';
import { createTopup } from '@/lib/digiflazz';
import { executeQuery } from '@/lib/db';
import crypto from 'crypto';

export async function processOrderFulfillment(invoice: string): Promise<any> {
  console.log(`[Fulfillment] Starting order fulfillment for invoice: ${invoice}`);

  // 1. Fetch transaction
  const transaction = await TransactionService.getByInvoice(invoice);
  if (!transaction) {
    console.error(`[Fulfillment] Transaction ${invoice} not found.`);
    return { success: false, error: 'Transaction not found' };
  }

  if (transaction.payment_status === 'paid' && transaction.topup_status === 'success') {
    console.log(`[Fulfillment] Transaction ${invoice} already paid and fulfilled.`);
    return { success: true, message: 'Already fulfilled', transaction };
  }

  // 2. Fetch associated product
  const product = await ProductService.getById(transaction.product_id);
  if (!product) {
    console.error(`[Fulfillment] Product for transaction ${invoice} not found.`);
    return { success: false, error: 'Product not found' };
  }

  // 3. Mark transaction paid and processing in database
  const now = new Date().toISOString();
  await TransactionService.update(transaction.id, {
    payment_status: 'paid',
    paid_at: transaction.paid_at || now,
    topup_status: 'processing',
    updated_at: now,
  });

  // 4. Trigger Digiflazz Top-up API Call
  let topupStatus = 'processing';
  let providerRef = null;
  let providerResponse = null;

  try {
    const { SettingService } = await import('@/lib/services/setting-service');
    const { getDigiflazzCredentials } = await import('@/lib/digiflazz');
    const dbMode = await SettingService.get('digiflazz_mode', '');
    const dbPaymentGateway = await SettingService.get('payment_gateway', 'midtrans');
    const dbMidtransMode = await SettingService.get('midtrans_mode', 'sandbox');
    const dbDokuMode = await SettingService.get('doku_mode', 'sandbox');

    const isGatewaySandbox = (dbPaymentGateway === 'midtrans' && dbMidtransMode === 'sandbox') ||
                             (dbPaymentGateway === 'doku' && dbDokuMode === 'sandbox');

    const { mode } = getDigiflazzCredentials();
    const activeMode = (dbMode || mode || process.env.DIGIFLAZZ_MODE || 'production').trim();
    
    // Safety Shield: If payment was made via Sandbox OR Digiflazz is in Simulation, treat as safe testing (never deduct real production balance)
    const isTesting = isGatewaySandbox || (activeMode === 'simulation' || activeMode === 'sandbox');

    console.log(`[Fulfillment] Executing Digiflazz topup SKU: ${product.provider_sku}, Target: ${transaction.target_id}, Ref: ${transaction.invoice}, Mode: ${isTesting ? 'Sandbox / Simulasi' : 'Production'}`);

    const response = await createTopup(
      product.provider_sku,
      transaction.target_id,
      transaction.invoice,
      isTesting
    );

    providerResponse = response;
    const responseData = response?.data;

    if (responseData) {
      providerRef = responseData.sn || null;

      // Digiflazz Response Codes:
      // '00' = Success
      // '03' / '39' = Pending / Processing
      // Others = Failed (e.g. '02', '50')
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
    console.error(`[Fulfillment] Digiflazz API exception for ${invoice}:`, apiError);
    topupStatus = 'failed';
    providerResponse = { error: apiError.message || 'API Call failed' };
  }

  // 5. Save Digiflazz response to transaction
  await TransactionService.update(transaction.id, {
    topup_status: topupStatus,
    provider_ref: providerRef,
    provider_response: JSON.stringify(providerResponse),
    updated_at: new Date().toISOString(),
  });

  // Invalidate balance cache so next user balance check fetches fresh balance
  try {
    const { BalanceGuardService } = await import('@/lib/services/balance-guard-service');
    BalanceGuardService.invalidateCache();
  } catch (_) {}

  const freshTx = await TransactionService.getByInvoice(invoice);

  // 6. Trigger WhatsApp & In-App Notifications if topup is successful
  if (topupStatus === 'success') {
    // WhatsApp Notification
    try {
      const { WhatsappService } = await import('@/lib/services/whatsapp-service');
      if (freshTx) {
        WhatsappService.sendSuccessNotification(freshTx).catch(err => {
          console.error('[Fulfillment] Failed sending WhatsApp success notification:', err);
        });
      }
    } catch (waErr) {
      console.error('[Fulfillment] Error initiating WhatsApp notification:', waErr);
    }

    // In-App Notifications
    try {
      const dbProvider = process.env.DB_PROVIDER || 'mysql';
      const notifTable = dbProvider === 'supabase' ? 'public.notifications' : 'notifications';

      // Notify Customer
      if (transaction.user_id) {
        const cNotifId = crypto.randomUUID();
        const clientNotifSql = `
          INSERT INTO ${notifTable} (id, user_id, is_admin, title, message, type, link)
          VALUES ($1, $2, $3, $4, $5, $6, $7)
        `;
        await executeQuery(clientNotifSql, [
          cNotifId,
          transaction.user_id,
          dbProvider === 'supabase' ? false : 0,
          'Top-Up Sukses! 🎉',
          `Pembelian ${product.name} untuk Target ${transaction.target_id} berhasil dikirim. SN: ${providerRef || '-'}`,
          'payment_success',
          `/history/${transaction.invoice}`
        ]);
      }

      // Notify Admin
      const aNotifId = crypto.randomUUID();
      const adminNotifSql = `
        INSERT INTO ${notifTable} (id, user_id, is_admin, title, message, type, link)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
      `;
      await executeQuery(adminNotifSql, [
        aNotifId,
        null,
        dbProvider === 'supabase' ? true : 1,
        'Top-Up Sukses Diproses',
        `Transaksi #${transaction.invoice} selesai. SN: ${providerRef || '-'}`,
        'payment_success',
        '/admin/transactions'
      ]);
    } catch (inAppErr) {
      console.error('[Fulfillment] Error creating in-app notifications:', inAppErr);
    }
  }

  console.log(`[Fulfillment] Order fulfillment completed for ${invoice}. Final Topup Status: ${topupStatus}`);
  return { success: true, topupStatus, providerRef, transaction: freshTx };
}

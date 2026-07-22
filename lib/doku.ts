import crypto from 'crypto';
import { SettingService } from './services/setting-service';

export interface DokuConfig {
  clientId: string;
  sharedKey: string;
  isProduction: boolean;
  mode: 'checkout' | 'direct';
}

export async function getDokuConfig(): Promise<DokuConfig> {
  const clientId = await SettingService.get('doku_client_id', process.env.DOKU_CLIENT_ID || '');
  const sharedKey = await SettingService.get('doku_shared_key', process.env.DOKU_SHARED_KEY || '');
  const dokuMode = await SettingService.get('doku_mode', process.env.DOKU_MODE || 'sandbox');
  const paymentMethodType = await SettingService.get('payment_method_type', 'checkout');

  return {
    clientId: clientId.trim(),
    sharedKey: sharedKey.trim(),
    isProduction: dokuMode === 'production',
    mode: paymentMethodType === 'direct' ? 'direct' : 'checkout',
  };
}

/**
 * Generate SHA-256 Digest encoded in Base64 for DOKU HTTP Body
 */
export function generateDokuDigest(body: any): string {
  const jsonString = typeof body === 'string' ? body : JSON.stringify(body);
  return crypto.createHash('sha256').update(jsonString).digest('base64');
}

/**
 * Generate Symmetric HMAC-SHA256 Signature for DOKU API
 * Format: HMACSHA256=<base64_signature>
 */
export function generateDokuSignature(
  clientId: string,
  requestId: string,
  timestamp: string,
  targetPath: string,
  sharedKey: string,
  digest?: string
): string {
  let rawString = `Client-Id:${clientId}\nRequest-Id:${requestId}\nRequest-Timestamp:${timestamp}\nRequest-Target:${targetPath}`;
  if (digest) {
    rawString += `\nDigest:${digest}`;
  }

  const hmac = crypto.createHmac('sha256', sharedKey).update(rawString).digest('base64');
  return `HMACSHA256=${hmac}`;
}

/**
 * Create a DOKU Checkout Session (Hosted Payment Page)
 */
export async function createDokuCheckoutSession(params: {
  invoice: string;
  amount: number;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  productName: string;
  expiredMinutes?: number;
}): Promise<{ payment_url?: string; error?: string; raw?: any }> {
  const config = await getDokuConfig();

  if (!config.clientId || !config.sharedKey) {
    return { error: 'Doku Client ID atau Shared Key belum dikonfigurasi di Admin Settings.' };
  }

  const baseUrl = config.isProduction
    ? 'https://api.doku.com'
    : 'https://api-sandbox.doku.com';
  
  const targetPath = '/checkout/v1/payment';
  const url = `${baseUrl}${targetPath}`;

  const requestId = crypto.randomUUID();
  const timestamp = new Date().toISOString().replace(/\.\d{3}Z$/, 'Z');

  const requestBody = {
    order: {
      invoice_number: params.invoice,
      amount: Math.round(params.amount),
      line_items: [
        {
          name: params.productName.substring(0, 50),
          price: Math.round(params.amount),
          quantity: 1,
        },
      ],
    },
    payment: {
      payment_due_date: params.expiredMinutes || 60,
    },
    customer: {
      name: params.customerName || 'Pelanggan Mitsuru',
      email: params.customerEmail || `${params.invoice.toLowerCase()}@mitsuru-shop.com`,
      phone: params.customerPhone || '08123456789',
    },
  };

  const digest = generateDokuDigest(requestBody);
  const signature = generateDokuSignature(
    config.clientId,
    requestId,
    timestamp,
    targetPath,
    config.sharedKey,
    digest
  );

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Client-Id': config.clientId,
        'Request-Id': requestId,
        'Request-Timestamp': timestamp,
        'Signature': signature,
      },
      body: JSON.stringify(requestBody),
    });

    const data = await response.json();

    if (data && data.response && data.response.payment && data.response.payment.url) {
      return {
        payment_url: data.response.payment.url,
        raw: data,
      };
    } else if (data && data.payment && data.payment.url) {
      return {
        payment_url: data.payment.url,
        raw: data,
      };
    } else {
      console.error('Doku Checkout API Error Response:', data);
      return {
        error: data.message || data.error?.message || 'Gagal membuat sesi pembayaran Doku.',
        raw: data,
      };
    }
  } catch (err: any) {
    console.error('Doku Checkout Request Exception:', err);
    return { error: err.message || 'Koneksi ke Doku gagal.' };
  }
}

/**
 * Create a DOKU Direct API Payment Session (QRIS / VA / Direct)
 */
export async function createDokuDirectPayment(params: {
  invoice: string;
  amount: number;
  paymentMethod: string; // e.g. qris, va_bca, va_mandiri, etc.
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  productName: string;
}): Promise<{ qr_string?: string; payment_url?: string; va_number?: string; error?: string; raw?: any }> {
  const config = await getDokuConfig();

  if (!config.clientId || !config.sharedKey) {
    return { error: 'Doku Client ID atau Shared Key belum dikonfigurasi di Admin Settings.' };
  }

  // Fallback / direct handler: try hosted checkout session first if direct method requires hosted url,
  // or return direct response format.
  const checkoutRes = await createDokuCheckoutSession(params);
  if (checkoutRes.payment_url) {
    return {
      payment_url: checkoutRes.payment_url,
      raw: checkoutRes.raw,
    };
  }

  return { error: checkoutRes.error || 'Gagal memproses Direct API Doku.' };
}

/**
 * Verify incoming Doku Webhook Notification Signature
 */
export function verifyDokuNotification(
  clientId: string,
  requestId: string,
  timestamp: string,
  targetPath: string,
  sharedKey: string,
  rawBody: string,
  incomingSignature: string
): boolean {
  if (!incomingSignature) return false;
  const digest = generateDokuDigest(rawBody);
  const expectedSignature = generateDokuSignature(
    clientId,
    requestId,
    timestamp,
    targetPath,
    sharedKey,
    digest
  );
  return incomingSignature === expectedSignature;
}

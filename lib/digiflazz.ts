import crypto from 'crypto';
import { DIGIFLAZZ_CONFIG } from './constants';

export function getDigiflazzCredentials() {
  const mode = (process.env.DIGIFLAZZ_MODE || DIGIFLAZZ_CONFIG.mode || 'production').trim();
  const username = (
    mode === 'simulation' || mode === 'sandbox'
      ? (process.env.DIGIFLAZZ_USERNAME_DEV || process.env.DIGIFLAZZ_USERNAME || DIGIFLAZZ_CONFIG.username)
      : (process.env.DIGIFLAZZ_USERNAME_PROD || process.env.DIGIFLAZZ_USERNAME || DIGIFLAZZ_CONFIG.username)
  ).trim();

  const apiKey = (
    mode === 'simulation' || mode === 'sandbox'
      ? (process.env.DIGIFLAZZ_API_KEY_DEV || process.env.DIGIFLAZZ_API_KEY_SANDBOX || process.env.DIGIFLAZZ_API_KEY || DIGIFLAZZ_CONFIG.apiKey)
      : (process.env.DIGIFLAZZ_API_KEY_PROD || process.env.DIGIFLAZZ_API_KEY || DIGIFLAZZ_CONFIG.apiKey)
  ).trim();

  return { username, apiKey, mode };
}

export function generateDigiflazzSignature(refId: string): string {
  const { username, apiKey } = getDigiflazzCredentials();
  const cleanRef = refId.trim();
  return crypto.createHash('md5').update(`${username}${apiKey}${cleanRef}`).digest('hex');
}

export function generatePriceListSignature(): string {
  const { username, apiKey } = getDigiflazzCredentials();
  return crypto.createHash('md5').update(`${username}${apiKey}pricelist`).digest('hex');
}

export function generateDepoSignature(): string {
  const { username, apiKey } = getDigiflazzCredentials();
  return crypto.createHash('md5').update(`${username}${apiKey}depo`).digest('hex');
}

export async function checkBalance(): Promise<any> {
  const { username, mode } = getDigiflazzCredentials();

  if (mode === 'simulation') {
    return {
      data: {
        deposit: 1250000
      }
    };
  }

  const sign = generateDepoSignature();

  const response = await fetch('https://api.digiflazz.com/v1/cek-saldo', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      cmd: 'deposit',
      username,
      sign,
    }),
  });

  const text = await response.text();
  try {
    return JSON.parse(text);
  } catch (e) {
    return {
      error: "Respons Digiflazz bukan JSON yang valid. Kemungkinan IP Server belum di-whitelist.",
      raw: text.substring(0, 150)
    };
  }
}

export async function checkPriceList(): Promise<any> {
  const { username, mode } = getDigiflazzCredentials();

  if (mode === 'simulation') {
    return {
      data: [
        {
          product_name: "Mobile Legends 86 Diamonds (Simulasi)",
          category: "Voucher Game",
          brand: "MOBILE LEGENDS",
          type: "Umum",
          seller_name: "PT. Simulasi",
          price: 19000,
          buyer_sku_code: "ML86",
          buyer_product_status: true,
          seller_product_status: true,
          unlimited_stock: true,
          stock: 0,
          multi: true,
          start_cut_off: "23:45",
          end_cut_off: "00:15",
          desc: "86 Diamonds MLBB"
        },
        {
          product_name: "XL Rp 10.000 (Simulasi)",
          category: "Pulsa",
          brand: "XL",
          type: "Umum",
          seller_name: "PT. Simulasi",
          price: 10000,
          buyer_sku_code: "xld10",
          buyer_product_status: true,
          seller_product_status: true,
          unlimited_stock: true,
          stock: 0,
          multi: true,
          start_cut_off: "00:00",
          end_cut_off: "00:00",
          desc: "Pulsa XL reguler"
        }
      ]
    };
  }

  const sign = generatePriceListSignature();

  const response = await fetch('https://api.digiflazz.com/v1/price-list', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      cmd: 'prepaid',
      username,
      sign,
    }),
  });

  const text = await response.text();
  try {
    return JSON.parse(text);
  } catch (e) {
    return {
      error: "Respons Digiflazz bukan JSON yang valid. Pastikan IP Server sudah didaftarkan di IP Whitelist.",
      raw: text.substring(0, 150)
    };
  }
}

export async function createTopup(
  sku: string,
  customerNo: string,
  refId: string,
  testing: boolean = false
): Promise<any> {
  const { mode } = getDigiflazzCredentials();

  if (mode === 'simulation' || mode === 'sandbox' || testing) {
    // Simulasi Pengujian Dev / Sandbox (Tidak Memotong Saldo Riil)
    if (customerNo === '087800001230') {
      // Skenario Sukses
      return {
        data: {
          ref_id: refId,
          customer_no: customerNo,
          buyer_sku_code: sku,
          message: "Transaksi Sukses (Simulation)",
          status: "Sukses",
          rc: "00",
          sn: "SIM-1234567890",
          buyer_last_saldo: 990000,
          price: 10000
        }
      };
    } else if (customerNo === '087800001232') {
      // Skenario Gagal
      return {
        data: {
          ref_id: refId,
          customer_no: customerNo,
          buyer_sku_code: sku,
          message: "Transaksi Gagal (Simulation)",
          status: "Gagal",
          rc: "02",
          buyer_last_saldo: 1000000,
          price: 10000
        }
      };
    } else if (customerNo === '087800001233' || customerNo === '087800001234') {
      // Skenario Pending
      return {
        data: {
          ref_id: refId,
          customer_no: customerNo,
          buyer_sku_code: sku,
          message: "Transaksi Pending (Simulation)",
          status: "Pending",
          rc: "03",
          buyer_last_saldo: 990000,
          price: 10000
        }
      };
    } else {
      // Default fallback simulasi sukses
      return {
        data: {
          ref_id: refId,
          customer_no: customerNo,
          buyer_sku_code: sku,
          message: "Transaksi Sukses (Simulation Fallback)",
          status: "Sukses",
          rc: "00",
          sn: "SIM-8888888888",
          buyer_last_saldo: 500000,
          price: 10000
        }
      };
    }
  }

  const { username } = getDigiflazzCredentials();
  const sign = generateDigiflazzSignature(refId);

  // Clean customerNo: remove spaces and parentheses (e.g. "65742688 (2116)" -> "657426882116")
  const cleanCustomerNo = customerNo.replace(/[\s()]/g, '');

  const requestBody: any = {
    username,
    buyer_sku_code: sku,
    customer_no: cleanCustomerNo,
    ref_id: refId,
    sign,
  };

  if (testing) {
    requestBody.testing = true;
  }

  const response = await fetch('https://api.digiflazz.com/v1/transaction', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(requestBody),
  });

  return response.json();
}

export async function requestDepositTicket(amount: number, bank: string, ownerName: string): Promise<any> {
  const { username, mode } = getDigiflazzCredentials();

  if (mode === 'simulation') {
    const uniqueAmount = amount + Math.floor(Math.random() * 900) + 100;
    return {
      data: {
        rc: "00",
        amount: uniqueAmount,
        notes: `Silahkan transfer Rp ${uniqueAmount.toLocaleString('id-ID')} ke Bank ${bank} a.n. PT DIGIFLAZZ INTERNASIONAL INDONESIA (Simulasi)`,
        bank: bank,
        owner_name: ownerName
      }
    };
  }

  const sign = generateDepoSignature();

  const response = await fetch('https://api.digiflazz.com/v1/deposit', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      username,
      amount,
      Bank: bank,
      owner_name: ownerName,
      sign,
    }),
  });

  return response.json();
}
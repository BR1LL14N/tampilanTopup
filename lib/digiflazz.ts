import crypto from 'crypto';
import { DIGIFLAZZ_CONFIG } from './constants';

export function generateDigiflazzSignature(refId: string): string {
  const { username, apiKey } = DIGIFLAZZ_CONFIG;
  return crypto.createHash('md5').update(`${username}${apiKey}${refId}`).digest('hex');
}

export function generatePriceListSignature(): string {
  const { username, apiKey } = DIGIFLAZZ_CONFIG;
  return crypto.createHash('md5').update(`${username}${apiKey}pricelist`).digest('hex');
}

export function generateDepoSignature(): string {
  const { username, apiKey } = DIGIFLAZZ_CONFIG;
  return crypto.createHash('md5').update(`${username}${apiKey}depo`).digest('hex');
}

export async function checkBalance(): Promise<any> {
  const { mode } = DIGIFLAZZ_CONFIG;

  if (mode === 'simulation') {
    return {
      data: {
        deposit: 1250000
      }
    };
  }

  const sign = generateDepoSignature();

  const response = await fetch('https://api.digiflazz.com/v1/depo', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      cmd: 'depo',
      username: DIGIFLAZZ_CONFIG.username,
      sign,
    }),
  });

  return response.json();
}

export async function checkPriceList(): Promise<any> {
  const { mode } = DIGIFLAZZ_CONFIG;

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
      username: DIGIFLAZZ_CONFIG.username,
      sign,
    }),
  });

  return response.json();
}

export async function createTopup(
  sku: string,
  customerNo: string,
  refId: string,
  testing: boolean = false
): Promise<any> {
  const { mode } = DIGIFLAZZ_CONFIG;

  if (mode === 'simulation') {
    // Simulasi berdasarkan Test Case Resmi Digiflazz
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

  const sign = generateDigiflazzSignature(refId);

  const response = await fetch('https://api.digiflazz.com/v1/transaction', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      username: DIGIFLAZZ_CONFIG.username,
      buyer_sku_code: sku,
      customer_no: customerNo,
      ref_id: refId,
      sign,
      testing,
    }),
  });

  return response.json();
}
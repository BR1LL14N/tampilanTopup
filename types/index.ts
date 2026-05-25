export type Game = {
  id: string;
  name: string;
  slug: string;
  image: string;
  icon: string;
  category: string;
  status: boolean;
  created_at: string;
};

export type Product = {
  id: string;
  game_id: string;
  provider_sku: string;
  name: string;
  price: number;
  sell_price: number;
  admin_fee: number;
  status: boolean;
  created_at: string;
  updated_at: string;
  game?: Game;
};

export type Transaction = {
  id: string;
  invoice: string;
  user_id: string;
  product_id: string;
  target_id: string;
  target_name: string | null;
  amount: number;
  payment_method: string | null;
  payment_status: 'pending' | 'paid' | 'failed' | 'expired';
  topup_status: 'pending' | 'processing' | 'success' | 'failed';
  provider_ref: string | null;
  provider_response: DigiflazzResponse | null;
  payment_token: string | null;
  payment_url: string | null;
  qr_string: string | null;
  expired_at: string | null;
  paid_at: string | null;
  created_at: string;
  updated_at: string;
  product?: Product;
  user?: User;
};

export type User = {
  id: string;
  email: string;
  name: string;
  phone: string | null;
  role: 'user' | 'admin';
  created_at: string;
  updated_at: string;
};

export interface DigiflazzResponse {
  ref_id: string;
  customer_no: string;
  buyer_sku_code: string;
  message: string;
  status: 'Sukses' | 'Pending' | 'Gagal';
  rc: string;
  sn: string;
  buyer_last_saldo?: number;
  price: number;
  tele?: string;
  wa?: string;
}

export interface PriceListResponse {
  product_name: string;
  category: string;
  brand: string;
  type: string;
  seller_name: string;
  price: number;
  buyer_sku_code: string;
  buyer_product_status: boolean;
  seller_product_status: boolean;
  unlimited_stock: boolean;
  stock: number;
  multi: boolean;
  start_cut_off: string;
  end_cut_off: string;
  desc: string;
}

export interface PaymentRequest {
  product_id: string;
  target_id: string;
  target_name?: string;
  payment_method: string;
}

export interface PaymentResponse {
  success: boolean;
  data?: {
    reference: string;
    merchant_ref: string;
    amount: number;
    payment_url: string;
    qr_string?: string;
    expiry_time: number;
  };
  error?: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}
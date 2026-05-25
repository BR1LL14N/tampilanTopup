export const DIGIFLAZZ_CONFIG = {
  username: process.env.DIGIFLAZZ_USERNAME || 'tuwumiWXAdqg',
  apiKey: process.env.DIGIFLAZZ_API_KEY || 'dev-b8bd5f40-d97c-11ef-8d09-333896381645',
  baseUrl: 'https://api.digiflazz.com/v1',
  mode: process.env.DIGIFLAZZ_MODE || 'simulation',
};

export const PAYMENT_METHODS = [
  {
    id: 'qris',
    name: 'QRIS',
    icon: 'qr-code',
    description: 'Scan QR dengan aplikasi apapun',
  },
  {
    id: 'gopay',
    name: 'GoPay',
    icon: 'wallet',
    description: 'Bayar dengan GoPay',
  },
  {
    id: 'shopeepay',
    name: 'ShopeePay',
    icon: 'shopping-bag',
    description: 'Bayar dengan ShopeePay',
  },
  {
    id: 'ovo',
    name: 'OVO',
    icon: 'credit-card',
    description: 'Bayar dengan OVO',
  },
];

export const GAME_CATEGORIES = [
  'MOBA',
  'Battle Royale',
  'FPS',
  'RPG',
  'Sports',
  'Strategy',
];

export const TRANSACTION_STATUS = {
  PAYMENT: {
    PENDING: 'pending',
    PAID: 'paid',
    FAILED: 'failed',
    EXPIRED: 'expired',
  },
  TOPUP: {
    PENDING: 'pending',
    PROCESSING: 'processing',
    SUCCESS: 'success',
    FAILED: 'failed',
  },
};

export const ROUTES = {
  HOME: '/',
  GAMES: '/games',
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
  },
  USER: {
    DASHBOARD: '/dashboard',
    HISTORY: '/history',
    PROFILE: '/profile',
  },
  ADMIN: {
    DASHBOARD: '/admin',
    GAMES: '/admin/games',
    PRODUCTS: '/admin/products',
    TRANSACTIONS: '/admin/transactions',
    SETTINGS: '/admin/settings',
  },
};
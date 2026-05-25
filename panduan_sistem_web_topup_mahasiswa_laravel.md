# Sistem Website Topup Game

## Overview
Dokumen ini menjelaskan konsep, arsitektur, kebutuhan sistem, flow transaksi, teknologi, dan model bisnis website topup game.

Cocok untuk:
- Mahasiswa
- Freelance beginner
- UMKM topup game
- Portfolio project
- Startup kecil

---

# Arsitektur Development vs Production

## Development Phase

```
┌─────────────────────────────────────────────────────────┐
│                    Frontend (Next.js)                   │
│              Vercel / Local Dev Server                  │
└─────────────────────────┬─────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────┐
│                    Supabase (Backend)                   │
│  ├── PostgreSQL Database                               │
│  ├── Auth (Login/Register)                             │
│  ├── Realtime (Status transaksi live)                   │
│  ├── Storage (Images)                                  │
│  └── Edge Functions (Digiflazz API)                    │
└─────────────────────────────────────────────────────────┘
```

### Kelebihan Supabase untuk Development:
- Cepat banget - langsung bisa coding frontend
- No setup - Auth, database, API auto-generated
- Real-time gratis - untuk update status transaksi
- Free tier generous
- Schema migrate-able ke PostgreSQL Laravel

---

## Production Phase

```
┌─────────────────────────────────────────────────────────┐
│                    Frontend (Next.js)                   │
│                       Vercel                            │
└─────────────────────────┬─────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────┐
│                  Backend (Laravel)                      │
│  ├── Payment webhook handler (Tripay/Midtrans)          │
│  ├── Queue jobs (topup processing async)                │
│  ├── Digiflazz API integration                          │
│  ├── Business logic & validation                        │
│  ├── Cron jobs (cek status pending)                     │
│  └── Security (CSRF, rate limiting)                    │
└─────────────────────────┬─────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────┐
│               PostgreSQL (Database)                     │
│        (Schema sama dengan Supabase dev)                │
└─────────────────────────────────────────────────────────┘
```

### Kelebihan Laravel untuk Production:
- Queue System - topup butuh async processing
- Webhook Robust - payment gateway callback reliable
- Payment Packages - banyak package ready untuk Tripay/Midtrans
- Transaction Safety - DB transactions untuk financial
- Scheduling - auto check status pending
- Security - CSRF, rate limiting, validation built-in
- Portfolio - Laravel skill值钱

---

## Alasan Tidak Pakai Next.js Only untuk Production:

Game topup = financial transactions
- Perlu queue untuk proses topup async
- Webhook dari payment gateway harus reliable
- Laravel lebih mature untuk use case ini

---

# Teknologi yang Digunakan

## Development Stack

| Komponen | Teknologi |
|---|---|
| Frontend | Next.js 14+ (App Router) |
| Styling | TailwindCSS |
| UI Components | shadcn/ui |
| Backend | Supabase |
| Database | PostgreSQL |
| Auth | Supabase Auth |
| Realtime | Supabase Realtime |
| Storage | Supabase Storage |
| API Functions | Supabase Edge Functions |
| Hosting | Vercel (frontend) |

## Production Stack

| Komponen | Teknologi |
|---|---|
| Frontend | Next.js 14+ (App Router) |
| Styling | TailwindCSS |
| UI Components | shadcn/ui |
| Backend | Laravel 11 |
| Database | PostgreSQL |
| Auth | Laravel Sanctum |
| Queue | Redis/Database |
| Payment | Tripay/Midtrans |
| Hosting | Vercel + VPS |

---

# Supabase Configuration

## Environment Variables

```env
# Frontend (.env.local)
VITE_SUPABASE_URL=https://gkbdophlnktmsfyvvszr.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdrYmRvcGhsbmt0bXNmeXZ2c3pyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg1NTIwOTUsImV4cCI6MjA5NDEyODA5NX0.0gG643LvsaCcVfHdmwqRjs9gyEK98SQAYDSgf3Ux-M4
```

## IP Whitelisting

| IP Address | Purpose |
|---|---|
| 140.213.118.165 | Server IP (whitelist di Digiflazz) |
| 52.74.250.133 | Digiflazz IP (whitelist di server) |

---

# Digiflazz API Integration

## Credentials

| Field | Value |
|---|---|
| Username | tuwumiWXAdqg |
| API Key | dev-b8bd5f40-d97c-11ef-8d09-333896381645 |
| Server IP | 140.213.118.165 (pending whitelist) |

## Endpoint

```
POST https://api.digiflazz.com/v1/transaction
POST https://api.digiflazz.com/v1/price-list
```

## Signature Generation

```javascript
// Transaction
sign = md5(username + apiKey + ref_id)

// Price List
sign = md5(username + apiKey + "pricelist")
```

### Example Signatures

| Type | Sign |
|---|---|
| Pricelist | 77cb30202b93e6087a0dbc703bb4d0f2 |
| Transaction (ref_id: TEST-GAME-001) | 594eb9d3139dabc1969a0f47964c8a7f |

## Request Parameters (Transaction)

| Parameter | Type | Required | Description |
|---|---|---|---|
| username | string | Yes | Username API |
| buyer_sku_code | string | Yes | Kode produk/SKU |
| customer_no | string | Yes | ID player game |
| ref_id | string | Yes | Unique reference ID |
| sign | string | Yes | MD5 signature |
| testing | boolean | No | Enable test mode |
| max_price | integer | No | Batas harga maksimal |
| cb_url | string | No | Callback URL |

## Request Parameters (Price List)

| Parameter | Type | Required | Description |
|---|---|---|---|
| cmd | string | Yes | "prepaid" atau "pasca" |
| username | string | Yes | Username API |
| sign | string | Yes | MD5 signature |
| code | string | No | Kode produk |
| category | string | No | Kategori |
| brand | string | No | Brand |
| type | string | No | Tipe |

## Response Codes

| RC | Status | Keterangan |
|---|---|---|
| 00 | Sukses | Transaksi berhasil |
| 03 | Pending | Transaksi sedang diproses |
| 39 | Gagal | Produk tidak ditemukan |
| 45 | Gagal | IP tidak dikenali |
| 50 | Gagal | Saldo tidak cukup |
| 83 | Limit | Rate limit pricelist |

## Response Example (Transaction)

```json
{
  "data": {
    "ref_id": "INV-2026-0001",
    "customer_no": "087800001233",
    "buyer_sku_code": "xld10",
    "message": "Transaksi Pending",
    "status": "Pending",
    "rc": "03",
    "sn": "",
    "buyer_last_saldo": 100000,
    "price": 25000,
    "tele": "@telegram",
    "wa": "081234512345"
  }
}
```

## Response Example (Price List)

```json
{
  "data": [
    {
      "product_name": "Telkomsel 10.000",
      "category": "Pulsa",
      "brand": "TELKOMSEL",
      "type": "Umum",
      "seller_name": "Lucky 7 Cell",
      "price": 10335,
      "buyer_sku_code": "SBT10",
      "buyer_product_status": true,
      "seller_product_status": true,
      "unlimited_stock": true,
      "stock": 0,
      "multi": true,
      "start_cut_off": "0:0",
      "end_cut_off": "0:0",
      "desc": "Reguler"
    }
  ]
}
```

---

# Flow Transaksi Lengkap

## 1. User Memilih Produk

```
Game: Mobile Legends, Free Fire, PUBG, Valorant
↓
Pilih nominal diamond
↓
Input ID game player
```

## 2. Sistem Membuat Invoice

```
Invoice: INV-2026-0001
Status: Pending
```

## 3. Generate Payment (Tripay/Midtrans)

```json
{
  "method": "QRIS",
  "amount": 21000,
  "qr_string": "..."
}
```

## 4. User Bayar

```
User scan QRIS
↓
Payment gateway proses
```

## 5. Webhook Callback (Payment)

```json
{
  "status": "PAID",
  "invoice": "INV-2026-0001"
}
```

## 6. Trigger Topup (Digiflazz)

```json
{
  "username": "tuwumiWXAdqg",
  "buyer_sku_code": "ML86",
  "customer_no": "12345678",
  "ref_id": "INV-2026-0001",
  "sign": "..."
}
```

## 7. Response Topup

```json
{
  "status": "Sukses",
  "sn": "SN123456789"
}
```

## 8. Update & Notifikasi

```
transaction.topup_status = "success"
↓
Kirim notifikasi ke user
↓
Topup berhasil 🎉
```

---

# Database Schema (Supabase)

## users (via Supabase Auth)

Ext profile table:

| Field | Type | Description |
|---|---|---|
| id | uuid | Primary key (FK to auth.users) |
| email | text | User email |
| name | text | Display name |
| phone | text | Phone number |
| role | text | "user" or "admin" |
| created_at | timestamp | Creation time |
| updated_at | timestamp | Last update |

## games

| Field | Type | Description |
|---|---|---|
| id | uuid | Primary key |
| name | text | Game name |
| slug | text | URL slug |
| image | text | Image URL |
| icon | text | Icon emoji |
| category | text | Category |
| status | boolean | Active/inactive |
| created_at | timestamp | Creation time |

## products

| Field | Type | Description |
|---|---|---|
| id | uuid | Primary key |
| game_id | uuid | FK to games |
| provider_sku | text | Digiflazz SKU |
| name | text | Product name |
| price | integer | API price |
| sell_price | integer | Selling price |
| admin_fee | integer | Admin fee |
| status | boolean | Active/inactive |
| created_at | timestamp | Creation time |
| updated_at | timestamp | Last update |

## transactions

| Field | Type | Description |
|---|---|---|
| id | uuid | Primary key |
| invoice | text | Invoice number |
| user_id | uuid | FK to users |
| product_id | uuid | FK to products |
| target_id | text | Game player ID |
| target_name | text | Player name (optional) |
| amount | integer | Total amount |
| payment_method | text | Payment method |
| payment_status | text | pending/paid/failed |
| topup_status | text | pending/processing/success/failed |
| provider_ref | text | Digiflazz ref_id |
| provider_response | jsonb | Full response |
| payment_token | text | Payment gateway token |
| payment_url | text | Payment URL |
| qr_string | text | QRIS string |
| expired_at | timestamp | Payment expiry |
| paid_at | timestamp | Payment time |
| created_at | timestamp | Creation time |
| updated_at | timestamp | Last update |

## settings

| Field | Type | Description |
|---|---|---|
| id | uuid | Primary key |
| key | text | Setting key |
| value | jsonb | Setting value |
| updated_at | timestamp | Last update |

---

# UI/UX Design System

## Theme Colors

| Color | Hex | Usage |
|---|---|---|
| Primary | #8B5CF6 | Purple neon - main accent |
| Secondary | #06B6D4 | Cyan - secondary elements |
| Accent | #EC4899 | Pink glow - highlights |
| Background | #0F0F1A | Dark black - main bg |
| Surface | #1A1A2E | Card backgrounds |
| Border | #2D2D44 | Borders |
| Text Primary | #FFFFFF | Main text |
| Text Secondary | #9CA3AF | Muted text |

## Typography

| Element | Font | Size |
|---|---|---|
| Heading 1 | Inter | 48px |
| Heading 2 | Inter | 32px |
| Heading 3 | Inter | 24px |
| Body | Inter | 16px |
| Small | Inter | 14px |
| Caption | Inter | 12px |

## Design Effects

- Glassmorphism: background blur, transparency
- Neon glow: box-shadow dengan warna neon
- Gradient: linear gradient backgrounds
- Smooth transitions: 300ms ease
- Hover animations: scale, glow effects
- Floating elements: subtle movement

## Components Style

- Card: rounded-xl, glass effect, hover glow
- Button: rounded-lg, gradient, scale on hover
- Input: dark bg, neon focus ring
- Modal: glass backdrop, slide animation
- Toast: slide in, auto dismiss

---

# Pages Structure

## Public Pages

| Route | Description |
|---|---|
| `/` | Homepage - hero, trending games, promo |
| `/games` | Browse all games |
| `/games/[slug]` | Game detail - product list |
| `/checkout/[productId]` | Checkout page |
| `/check-transaction` | Check transaction status |
| `/login` | Login page |
| `/register` | Register page |

## User Pages (Authenticated)

| Route | Description |
|---|---|
| `/dashboard` | User dashboard |
| `/history` | Transaction history |
| `/history/[invoice]` | Transaction detail |
| `/profile` | User profile |

## Admin Pages

| Route | Description |
|---|---|
| `/admin` | Admin dashboard |
| `/admin/games` | Manage games |
| `/admin/products` | Manage products |
| `/admin/transactions` | View all transactions |
| `/admin/settings` | System settings |

---

# API Routes (Next.js)

| Route | Method | Description |
|---|---|---|
| `/api/auth/*` | * | Supabase auth proxy |
| `/api/games` | GET | List games |
| `/api/products` | GET | List products |
| `/api/transactions` | POST | Create transaction |
| `/api/transactions/[invoice]` | GET | Get transaction status |
| `/api/webhook/tripay` | POST | Tripay callback |
| `/api/digiflazz/callback` | POST | Digiflazz callback |
| `/api/admin/*` | * | Admin endpoints |

---

# File Structure

```
freelance-top-up-app/
├── app/
│   ├── (public)/
│   │   ├── page.tsx                 # Homepage
│   │   ├── games/
│   │   │   ├── page.tsx            # Games list
│   │   │   └── [slug]/page.tsx      # Game detail
│   │   ├── checkout/[id]/page.tsx  # Checkout
│   │   ├── check/page.tsx          # Check transaction
│   │   └── auth/
│   │       ├── login/page.tsx
│   │       └── register/page.tsx
│   ├── (user)/
│   │   ├── dashboard/page.tsx
│   │   ├── history/page.tsx
│   │   └── profile/page.tsx
│   ├── (admin)/
│   │   ├── admin/page.tsx
│   │   ├── admin/games/page.tsx
│   │   ├── admin/products/page.tsx
│   │   └── admin/transactions/page.tsx
│   ├── api/
│   │   └── ... (API routes)
│   ├── layout.tsx
│   └── globals.css
├── components/
│   ├── ui/                          # shadcn/ui components
│   ├── layout/                      # Header, Footer, Sidebar
│   ├── game/                        # Game-related components
│   ├── product/                    # Product components
│   ├── transaction/                # Transaction components
│   └── admin/                      # Admin components
├── lib/
│   ├── supabase/
│   │   ├── client.ts               # Supabase client
│   │   ├── server.ts               # Supabase server
│   │   └── middleware.ts           # Auth middleware
│   ├── utils/
│   │   ├── format.ts               # Format helpers
│   │   ├── validation.ts           # Validation schemas
│   │   └── constants.ts           # Constants
│   └── hooks/                       # Custom React hooks
├── types/
│   └── index.ts                    # TypeScript types
├── .env.local
├── package.json
├── tailwind.config.ts
├── next.config.js
└── tsconfig.json
```

---

# Development Workflow

## 1. Setup Project

```bash
# Create Next.js project
npx create-next-app@latest freelance-top-up-app --typescript --tailwind --eslint

# Navigate to project
cd freelance-top-up-app

# Install dependencies
npm install @supabase/supabase-js @supabase/ssr
npm install lucide-react
npm install class-variance-authority clsx tailwind-merge
npm install zod react-hook-form @hookform/resolvers

# Install shadcn/ui
npx shadcn@latest init

# Add shadcn components
npx shadcn@latest add button card input label dialog sheet toast tabs table skeleton
```

## 2. Environment Setup

```bash
# .env.local
VITE_SUPABASE_URL=https://gkbdophlnktmsfyvvszr.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdrYmRvcGhsbmt0bXNmeXZ2c3pyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg1NTIwOTUsImV4cCI6MjA5NDEyODA5NX0.0gG643LvsaCcVfHdmwqRjs9gyEK98SQAYDSgf3Ux-M4
```

## 3. Supabase Database Setup

```sql
-- Run these in Supabase SQL Editor

-- Enable RLS
ALTER TABLE games ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;

-- Create tables
CREATE TABLE games (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  image TEXT,
  icon TEXT,
  category TEXT DEFAULT 'Game',
  status BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE products (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  game_id UUID REFERENCES games(id) ON DELETE CASCADE,
  provider_sku TEXT NOT NULL,
  name TEXT NOT NULL,
  price INTEGER NOT NULL,
  sell_price INTEGER NOT NULL,
  admin_fee INTEGER DEFAULT 0,
  status BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE transactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  invoice TEXT UNIQUE NOT NULL,
  user_id UUID REFERENCES auth.users(id),
  product_id UUID REFERENCES products(id),
  target_id TEXT NOT NULL,
  target_name TEXT,
  amount INTEGER NOT NULL,
  payment_method TEXT,
  payment_status TEXT DEFAULT 'pending',
  topup_status TEXT DEFAULT 'pending',
  provider_ref TEXT,
  provider_response JSONB,
  payment_token TEXT,
  payment_url TEXT,
  qr_string TEXT,
  expired_at TIMESTAMP WITH TIME ZONE,
  paid_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE settings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  key TEXT UNIQUE NOT NULL,
  value JSONB NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS Policies
-- Games: Public read
CREATE POLICY "Games are viewable by everyone" ON games FOR SELECT USING (true);

-- Products: Public read, Admin write
CREATE POLICY "Products are viewable by everyone" ON products FOR SELECT USING (true);
CREATE POLICY "Admins can manage products" ON products FOR ALL USING (
  EXISTS (SELECT 1 FROM auth.users WHERE id = auth.uid() AND role = 'admin')
);

-- Transactions: User can view own, Admin can view all
CREATE POLICY "Users can view own transactions" ON transactions FOR SELECT USING (
  auth.uid() = user_id OR EXISTS (SELECT 1 FROM auth.users WHERE id = auth.uid() AND role = 'admin')
);
```

## 4. Seed Data

```sql
-- Seed games
INSERT INTO games (name, slug, image, icon, category) VALUES
('Mobile Legends', 'mobile-legends', 'https://images.unsplash.com/photo-1538481199705-c710c4e965fc?w=400', '🎮', 'MOBA'),
('Free Fire', 'free-fire', 'https://images.unsplash.com/photo-1552820728-8b83bb6b773f?w=400', '🔥', 'Battle Royale'),
('PUBG Mobile', 'pubg-mobile', 'https://images.unsplash.com/photo-1542751110-97427bbecf20?w=400', '🎯', 'Battle Royale'),
('Valorant', 'valorant', 'https://images.unsplash.com/photo-1614680096145-8c4c4c2dddbb?w=400', '💜', 'FPS'),
('Genshin Impact', 'genshin-impact', 'https://images.unsplash.com/photo-1535567464580-5f6d4f7e2b1e?w=400', '✨', 'RPG'),
('Honor of Kings', 'honor-of-kings', 'https://images.unsplash.com/photo-1606588271854-e09e8e9c0b3a?w=400', '👑', 'MOBA');

-- Get game IDs and seed products
DO $$
DECLARE
  ml_id UUID;
  ff_id UUID;
BEGIN
  SELECT id INTO ml_id FROM games WHERE slug = 'mobile-legends';
  SELECT id INTO ff_id FROM games WHERE slug = 'free-fire';

  -- Mobile Legends products
  INSERT INTO products (game_id, provider_sku, name, price, sell_price) VALUES
  (ml_id, 'ML86', '86 Diamonds', 21000, 25000),
  (ml_id, 'ML172', '172 Diamonds', 42000, 49000),
  (ml_id, 'ML257', '257 Diamonds', 63000, 72000),
  (ml_id, 'ML429', '429 Diamonds', 105000, 119000),
  (ml_id, 'ML860', '860 Diamonds', 210000, 239000);

  -- Free Fire products
  INSERT INTO products (game_id, provider_sku, name, price, sell_price) VALUES
  (ff_id, 'FF50', '50 Diamonds', 12000, 15000),
  (ff_id, 'FF70', '70 Diamonds + 10 Bonus', 15000, 18000),
  (ff_id, 'FF140', '140 Diamonds + 20 Bonus', 29000, 34000),
  (ff_id, 'FF355', '355 Diamonds + 45 Bonus', 73000, 85000);
END $$;
```

## 5. Development Commands

```bash
# Start dev server
npm run dev

# Build for production
npm run build

# Start production
npm run start

# Lint
npm run lint

# Type check
npx tsc --noEmit
```

---

# Payment Gateway Integration

## Tripay

### Callback Webhook

Endpoint: `/api/webhook/tripay`

```typescript
interface TripayCallback {
  merchant_code: string;
  merchant_ref: string;
  payment_method: string;
  total_amount: number;
  signature: string;
  status: string;
}
```

### Flow

```
1. Create payment → Get payment_url
2. User pay at Tripay
3. Tripay send webhook to /api/webhook/tripay
4. Update transaction.payment_status = 'paid'
5. Trigger Digiflazz topup
```

## Digiflazz Callback

Endpoint: `/api/digiflazz/callback`

```typescript
interface DigiflazzCallback {
  ref_id: string;
  customer_no: string;
  buyer_sku_code: string;
  message: string;
  status: string;
  rc: string;
  sn: string;
  price: number;
}
```

---

# Security Checklist

- [ ] Validate webhook signatures
- [ ] Rate limiting on API routes
- [ ] CSRF protection
- [ ] Input validation (Zod)
- [ ] RLS policies in Supabase
- [ ] Environment variables for secrets
- [ ] HTTPS only for production
- [ ] Log all transactions
- [ ] Backup database regularly

---

# Model Bisnis

## Cara Mendapat Profit

| Item | Nilai |
|---|---|
| Harga API (Digiflazz) | Rp 18.500 |
| Harga Jual | Rp 21.000 |
| Fee QRIS | Rp 147 |
| **Profit Bersih** | **Rp 2.353** |

## Alur Harga

```
Publisher Game
    ↓
Distributor
    ↓
Provider API (Digiflazz)
    ↓
Website Topup (markup)
    ↓
Customer
```

## Estimasi Biaya

| Kebutuhan | Biaya |
|---|---|
| Domain | Rp 150.000/tahun |
| VPS (Laravel prod) | Rp 80.000/bulan |
| Deposit API (Digiflazz) | Rp 100.000 |
| Next.js Hosting (Vercel) | Gratis |
| Supabase | Gratis (dev) |
| Laravel | Gratis |
| TailwindCSS | Gratis |

---

# Troubleshooting

## Common Issues

| Issue | Solution |
|---|---|
| RC 45 - IP not recognized | Whitelist IP di dashboard Digiflazz |
| RC 83 - Pricelist limit | Tunggu beberapa saat, kurangi frekuensi |
| RC 50 - Saldo kurang | Deposit saldo di Digiflazz |
| RC 39 - Produk tidak ditemukan | Cek SKU produk di dashboard Digiflazz |

## Digiflazz IP Whitelist

```
IP Server: 140.213.118.165
Whitelist di: agent.digiflazz.com → Pengaturan Koneksi API
```

## Digiflazz Callback IP

```
Whitelist IP ini di server: 52.74.250.133
Untuk menerima webhook dari Digiflazz
```

---

# Next Steps

1. [x] Setup Next.js project
2. [ ] Configure TailwindCSS with gaming theme
3. [ ] Setup Supabase client
4. [ ] Create database schema
5. [ ] Build authentication pages
6. [ ] Build game/product listing
7. [ ] Build checkout flow
8. [ ] Build transaction history
9. [ ] Setup Digiflazz Edge Function
10. [ ] Build admin dashboard
11. [ ] Test payment flow
12. [ ] Deploy to Vercel
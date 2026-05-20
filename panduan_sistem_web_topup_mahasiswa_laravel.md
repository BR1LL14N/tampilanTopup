# Sistem Website Topup Game Laravel untuk Mahasiswa

## Overview
Dokumen ini menjelaskan konsep, arsitektur, kebutuhan sistem, flow transaksi, teknologi, dan model bisnis website topup game berbasis Laravel.

Cocok untuk:
- Mahasiswa
- Freelance beginner
- UMKM topup game
- Portfolio project
- Startup kecil

---

# Tujuan Sistem

Membuat website topup game otomatis dengan:
- Payment QRIS
- API topup otomatis
- Dashboard admin
- Riwayat transaksi
- Sistem modern dan scalable

---

# Teknologi yang Digunakan

## Backend
- Laravel 13
- PHP 8.3
- Laravel Queue
- Laravel Scheduler

## Frontend
- Blade
- TailwindCSS
- shadcn/ui style components
- AlpineJS
- Framer Motion style smooth animation
- Glassmorphism gaming UI
- Neon gradient gaming theme

## Database
- MySQL / MariaDB

## Payment Gateway
- Tripay
- Midtrans

## API Topup
- Digiflazz
- VIP-Reseller
- Tokovoucher

## Deployment
- GitHub
- VPS Linux
- Shared Hosting Laravel

---

# Kenapa Laravel?

Laravel cocok karena:
- Cepat development
- Banyak tutorial
- Dokumentasi lengkap
- Support queue/job
- Cocok untuk transaksi
- Aman untuk backend
- Hosting murah
- Mudah maintenance

---

# Arsitektur Sistem

```text
Customer
   ↓
Website Laravel
   ↓
Payment Gateway
(Tripay/Midtrans)
   ↓ webhook callback
Laravel update pembayaran
   ↓
API Topup
(Digiflazz/VIP)
   ↓
Topup berhasil
   ↓
Notifikasi customer
```

---

# Flow Transaksi Lengkap

## 1. User Memilih Produk

Contoh:
- Mobile Legends
- Free Fire
- PUBG
- Valorant

User memilih:
- Nominal diamond
- Input ID game

---

## 2. Sistem Membuat Invoice

Laravel membuat:

```text
INV-2026-0001
Status: Pending
```

---

## 3. Generate QRIS

Laravel request ke API payment gateway.

Contoh:

```json
{
  "method": "QRIS"
}
```

Payment gateway mengembalikan:
- QR code
- nominal pembayaran
- expiry time

---

## 4. Customer Membayar

Customer scan QRIS.

---

## 5. Callback Webhook

Tripay/Midtrans mengirim callback:

```json
{
  "status": "PAID"
}
```

Laravel update:

```text
payment_status = paid
```

---

## 6. Laravel Mengirim Request Topup

Contoh request API:

```json
{
  "sku": "ML86",
  "user_id": "12345678"
}
```

---

## 7. Provider Memproses Topup

Response:

```json
{
  "status": "Success"
}
```

---

## 8. Transaksi Selesai

Laravel update:

```text
transaction_status = success
```

User mendapat notifikasi:

```text
Topup berhasil 🎉
```

---

# Struktur Database

## users

| Field | Type |
|---|---|
| id | bigint |
| name | string |
| email | string |
| password | string |
| role | enum |

---

## games

| Field | Type |
|---|---|
| id | bigint |
| name | string |
| slug | string |
| image | string |

---

## products

| Field | Type |
|---|---|
| id | bigint |
| game_id | bigint |
| provider_sku | string |
| name | string |
| price | integer |
| sell_price | integer |
| status | boolean |

---

## transactions

| Field | Type |
|---|---|
| id | bigint |
| invoice | string |
| user_id | bigint |
| product_id | bigint |
| target_id | string |
| amount | integer |
| payment_method | string |
| payment_status | string |
| topup_status | string |
| provider_reference | string |

---

# Fitur Wajib

## User
- Login/register
- Riwayat transaksi
- Detail transaksi
- Status realtime
- Responsive mobile

---

## Topup
- Pilih game
- Pilih nominal
- Input ID
- Checkout otomatis

---

## Payment
- QRIS otomatis
- Callback webhook
- Auto verifikasi
- Multi payment method

---

## Admin
- Dashboard statistik
- CRUD produk
- CRUD game
- Kelola transaksi
- Kelola user
- Profit monitoring

---

# Fitur Tambahan Recommended

## Marketing
- Voucher promo
- Referral code
- Cashback
- Affiliate

---

## UI/UX
- Dark mode
- Skeleton loading
- Smooth animation
- Modern design
- SEO landing page

---

## Sistem
- Queue job
- Scheduler
- Redis cache
- Email notification
- WhatsApp notification

---

# Model Bisnis

## Cara Mendapat Profit

Contoh:

```text
Harga API      : 18.500
Harga jual     : 21.000
Fee QRIS       : 147
Profit bersih  : 2.353
```

---

# Kenapa Harga Bisa Lebih Murah?

Karena provider API memberikan:
- harga reseller
- harga grosir
- volume discount

Alur:

```text
Publisher Game
↓
Distributor
↓
Provider API
↓
Website Topup
↓
Customer
```

---

# Estimasi Biaya Mahasiswa

| Kebutuhan | Harga |
|---|---|
| Domain | 150rb/tahun |
| VPS | 80rb/bulan |
| Deposit API | 100rb awal |
| Laravel | Gratis |
| Tailwind | Gratis |
| Tripay | Gratis |
| Midtrans | Gratis |

---

# Keamanan Sistem

## Wajib
- Validasi webhook signature
- CSRF protection
- Rate limiting
- Queue transaction
- Database transaction
- Logging error

---

# Struktur Folder Laravel Recommended

```text
app/
 ├── Services/
 ├── Repositories/
 ├── Jobs/
 ├── Actions/
 ├── DTOs/
 ├── Http/
 └── Models/
```

---

# Service yang Dibutuhkan

## PaymentService
Untuk:
- create payment
- verify callback
- payment status

---

## TopupService
Untuk:
- request topup
- cek status transaksi
- retry failed transaction

---

# Queue Job

## Recommended Queue
- Redis
- Database queue

Digunakan untuk:
- proses topup
- kirim notif
- retry callback

---

# Konsep UI/UX Modern

## Style UI
Gunakan desain:
- Gaming modern
- Dark neon theme
- Glassmorphism
- Smooth animation
- Floating glow effect
- Gradient blur background
- Animated card hover
- Skeleton loading
- Micro interaction

---

## Inspirasi UI
Gabungkan style:
- Steam modern
- Riot Games
- Valorant UI
- Vercel style
- Dashboard modern SaaS

---

## Library UI Recommended

### shadcn/ui Style
Gunakan komponen modern seperti:
- Card
- Dialog
- Sheet
- Dropdown Menu
- Skeleton
- Tabs
- Toast
- Drawer mobile
- Hover card

---

## Animasi
Gunakan:
- smooth transition
- fade animation
- hover glow
- animated gradient
- parallax hero section
- smooth page transition

---

## Tema Warna

### Primary
- Purple neon
- Blue neon
- Cyan
- Dark black

### Accent
- Pink glow
- Electric blue
- Emerald

---

## Landing Page

### Hero Section
Isi:
- Banner game besar
- Animated background
- CTA topup
- Trending game
- Promo card

---

## Product Card

Style:
- Rounded modern
- Hover glow
- Game image cover
- Smooth scaling animation
- Instant checkout button

---

## Dashboard

Gunakan:
- Sidebar modern
- Analytics card
- Chart transaksi
- Responsive mobile
- Drawer menu

---

# UI Halaman

## Public
- Homepage
- Product page
- Cek transaksi
- Login/register

---

## User
- Dashboard
- History transaksi
- Profile

---

## Admin
- Statistik
- CRUD produk
- CRUD game
- Monitoring transaksi
- Setting sistem

---

# Roblox Topup Solution

Terkadang beberapa provider tidak menyediakan Roblox langsung.

Solusi yang bisa digunakan:

## 1. Tokovoucher
Biasanya support:
- Roblox Gift Card
- Roblox Robux
- Global voucher

Cocok untuk integrasi tambahan.

---

## 2. Codashop Redirect
Jika provider tidak punya Roblox:
- redirect user ke halaman partner
- gunakan affiliate/referral
- ambil komisi

---

## 3. Manual Order Hybrid
Flow:

```text
User bayar
↓
Admin menerima notif
↓
Admin proses Roblox manual
```

Cocok untuk tahap awal.

---

## 4. Multi Provider System
Gunakan lebih dari satu provider:

```text
Digiflazz → ML, FF, PUBG
Tokovoucher → Roblox
VIP-Reseller → alternatif
```

Laravel memilih provider otomatis berdasarkan game.

---

## Arsitektur Multi Provider

```text
TopupService
 ├── DigiflazzProvider
 ├── TokovoucherProvider
 └── VipResellerProvider
```

Keuntungan:
- fallback provider
- harga lebih fleksibel
- produk lebih lengkap
- scalable

---

# API Provider Recommended

## Digiflazz
Kelebihan:
- populer
- banyak produk
- dokumentasi lengkap

---

## VIP-Reseller
Kelebihan:
- sering dipakai web topup kecil
- murah
- gampang integrasi

---

# Payment Gateway Recommended

## Tripay
Kelebihan:
- mudah integrasi
- cocok mahasiswa
- support QRIS
- dokumentasi mudah

---

## Midtrans
Kelebihan:
- profesional
- stabil
- dipakai startup besar

---

# Tahapan Development

## Phase 1
- Setup Laravel
- Setup database
- Auth system

---

## Phase 2
- Product management
- Checkout system
- QRIS integration

---

## Phase 3
- API topup integration
- Auto processing
- Transaction history

---

## Phase 4
- Admin dashboard
- Analytics
- Optimization

---

# Prompt AI Coding

```text
Buatkan sistem website topup game modern menggunakan Laravel 13 dan TailwindCSS.

Fitur:
- Login/register user
- Dashboard admin
- Topup game otomatis
- Integrasi API topup Digiflazz/VIP-Reseller
- Integrasi payment gateway Tripay/Midtrans
- QRIS otomatis
- Webhook callback pembayaran
- Auto proses topup setelah pembayaran sukses
- Riwayat transaksi
- Status transaksi realtime
- Responsive modern UI
- SEO friendly
- Dark mode
- Role admin dan user

Gunakan:
- Laravel 13
- PHP 8.3
- MySQL
- Blade + TailwindCSS
- Service Repository Pattern
- Queue job
- Clean architecture
- Migration dan Seeder

Buat struktur folder yang scalable dan production ready.
```

---

# Kesimpulan

Website topup game modern dapat dibuat oleh mahasiswa menggunakan:
- Laravel
- Payment gateway gratis
- API topup reseller
- Hosting murah

Yang terpenting:
- keamanan transaksi
- stabilitas webhook
- UX yang cepat
- marketing
- maintenance sistem


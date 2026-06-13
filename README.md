# Mitsuru Top Up Hub - Web Application

A modern, highly performant gaming top-up web application built with **Next.js 14**, styled with a custom **Sky Fantasy (Celestial Blue)** light theme, featuring a unified database abstraction layer that dynamically supports both **Supabase (PostgreSQL)** and **MySQL (Laragon/Self-Hosted)** backends via simple `.env` switches.

---

## 🚀 Fitur Utama

### 1. 🎫 Sistem Kode Promo & Referral Diskon
* **Validasi Real-time**: Menggunakan API `/api/promo/validate` untuk memvalidasi kode promo secara asinkron dari frontend checkout.
* **Manajemen Voucher**: Panel khusus admin untuk memantau usage count, mengatur batas maksimal kuota pemakaian, status aktif, serta tipe potongan (persentase maupun nominal rupiah tetap).
* **Integrasi Tagihan Pesanan**: Mengurangi nominal total tagihan transaksi secara instan di UI dan memproses potongan harga secara terverifikasi di backend sebelum membuat invoice.

### 2. ⚡ Flash Sale Dinamis Beranda
* **Live Catalog Integration**: Produk flash sale ditarik langsung dari database berdasarkan bendera `is_flash_sale = true`.
* **Indikator Interaktif**: Menampilkan bar persentase stok terjual (`flash_sale_sold` / `flash_sale_stock`), harga coret (harga jual asli), dan sisa slot kuota.
* **Event Scheduler Ready**: Dapat diatur kapan saja secara dinamis langsung dari halaman pengelolaan produk admin.

### 3. ⚙️ Dashboard Admin Lanjutan
* **Kelola Game (`/admin/games`)**: Tambah, edit detail, sort order, kategori visibilitas, status game aktif/nonaktif, banner/icon, serta hapus data game.
* **Kelola Produk & Harga Markup (`/admin/products`)**:
  * Mengatur harga jual asli untuk markup (mengambil margin profit) atau markdown.
  * Menyalakan status Flash Sale, menentukan harga coret diskon, serta kuota stok flash sale per produk.
* **Kelola Kode Promo (`/admin/promos`)**: Pemantauan voucher promosi secara terpusat untuk diskon musiman maupun kode referral.

### 4. 🔒 Autentikasi Monolit Mandiri (Monolith Auth)
* Menggunakan JWT berbasis cookie secure `HttpOnly` untuk sesi pengguna jika menggunakan database MySQL.
* Enkripsi kata sandi yang kuat menggunakan `bcryptjs`.
* Melindungi rute-rute penting admin (`/admin/*`) dan API kontrol menggunakan middleware verifikasi server-side.

---

## 🗄️ Arsitektur Multi-Database Terpadu (Dinamis & Switchable)

Sistem ini didesain agar mudah bermigrasi dari **Supabase (Cloud PostgreSQL)** ke **MySQL lokal (Laragon/monolit)** tanpa mengubah baris kode kueri di logika bisnis/API.

```
       ┌─────────────────────────────────────────────────────────┐
       │             Next.js Server (API & Components)           │
       └────────────────────────────┬────────────────────────────┘
                                    │
                       ┌────────────▼────────────┐
                       │   Service & Repository  │
                       │          Layer          │
                       └────────────┬────────────┘
                                    │
                       ┌────────────▼────────────┐
                       │  Database Connection    │
                       │        Factory          │
                       └──────┬────────────┬─────┘
                              │            │
            DB_PROVIDER=mysql │            │ DB_PROVIDER=supabase
                              │            │
                       ┌──────▼─────┐      ┌─▼──────────┐
                       │ mysql2 Driver│      │  pg Driver │
                       └──────┬─────┘      └─┬──────────┘
                              │            │
                              ▼            ▼
                        [( MySQL DB )]   [( Supabase PG )]
```

### 1. SQL Query Factory (`lib/db/index.ts`)
* Mengekspos satu fungsi `executeQuery(sql, params)` untuk seluruh aplikasi.
* **Translasi Otomatis**: Secara dinamis menerjemahkan placeholder parameter kueri PostgreSQL (`$1, $2`) menjadi placeholder MySQL (`?`) di tingkat runtime jika provider yang aktif adalah MySQL.
* **Penanganan Tipe Data**: Mengonversi boolean (`true`/`false`) menjadi tinyint (`1`/`0`) saat menulis ke MySQL secara otomatis.

### 2. Client-Side API Fallback (Supabase Safe-Proxy)
* Mengisolasi kueri database agar tidak dijalankan langsung dari client component, melainkan didelegasikan ke public API endpoint (`/api/calculator/data`, `/api/transactions/check`, dll.).
* Mengubah file inisialisasi client Supabase (`lib/supabase/client.ts` & `lib/supabase/server.ts`) dengan mekanisme proxy aman agar **tidak crash** saat inisialisasi di server production ketika credentials Supabase tidak di-set di `.env`.

---

## 🔧 Konfigurasi Berkas `.env.local`

Buat berkas `.env.local` di direktori utama proyek dan atur driver database aktif:

```env
# Mode Pengoperasian Database: 'supabase' atau 'mysql'
DB_PROVIDER=mysql

# -------------------------------------------------------------
# Konfigurasi MySQL Lokal (Laragon/Self-Hosted)
# -------------------------------------------------------------
MYSQL_HOST=localhost
MYSQL_PORT=3306
MYSQL_USER=root
MYSQL_PASSWORD=
MYSQL_DATABASE=freelance_topup

# -------------------------------------------------------------
# Konfigurasi Supabase Cloud (Direct PG & Client SDK)
# -------------------------------------------------------------
POSTGRES_URL="postgresql://postgres:your-db-password@db.supabase.co:5432/postgres"
NEXT_PUBLIC_SUPABASE_URL="https://your-project.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your-anon-public-key"

# -------------------------------------------------------------
# Parameter Keamanan JWT untuk Sesi Mandiri
# -------------------------------------------------------------
JWT_SECRET=super-secret-key-for-auth-token-mitsuru-2026
```

---

## 🛠️ Panduan Skema SQL untuk MySQL

Apabila Anda mengaktifkan driver `mysql`, Anda dapat membuat tabel-tabel sistem di MySQL menggunakan skema DDL di bawah ini:

```sql
-- 1. Tabel Users
CREATE TABLE IF NOT EXISTS users (
  id VARCHAR(36) PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  name VARCHAR(255) NOT NULL,
  role VARCHAR(20) DEFAULT 'user',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 2. Tabel Games
CREATE TABLE IF NOT EXISTS games (
  id VARCHAR(36) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(100) UNIQUE NOT NULL,
  image TEXT,
  icon VARCHAR(20) DEFAULT '🎮',
  category VARCHAR(100) DEFAULT 'Game',
  description TEXT,
  publisher VARCHAR(100) DEFAULT 'Gamer',
  status TINYINT(1) DEFAULT 1,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 3. Tabel Products
CREATE TABLE IF NOT EXISTS products (
  id VARCHAR(36) PRIMARY KEY,
  game_id VARCHAR(36) NOT NULL,
  provider_sku VARCHAR(100) NOT NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  price DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
  sell_price DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
  admin_fee DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
  status TINYINT(1) DEFAULT 1,
  sort_order INT DEFAULT 0,
  is_flash_sale TINYINT(1) DEFAULT 0,
  flash_sale_price DECIMAL(12, 2) NULL,
  flash_sale_discount INT NULL,
  flash_sale_stock INT DEFAULT 100,
  flash_sale_sold INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (game_id) REFERENCES games(id) ON DELETE CASCADE
);

-- 4. Tabel Promo Codes
CREATE TABLE IF NOT EXISTS promo_codes (
  id VARCHAR(36) PRIMARY KEY,
  code VARCHAR(50) UNIQUE NOT NULL,
  discount_amount DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
  discount_percent DECIMAL(5, 2) NOT NULL DEFAULT 0.00,
  max_uses INT NOT NULL DEFAULT 100,
  uses_count INT NOT NULL DEFAULT 0,
  status TINYINT(1) DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 5. Tabel Transactions
CREATE TABLE IF NOT EXISTS transactions (
  id VARCHAR(36) PRIMARY KEY,
  invoice VARCHAR(50) UNIQUE NOT NULL,
  user_id VARCHAR(36) NULL,
  product_id VARCHAR(36) NOT NULL,
  target_id VARCHAR(100) NOT NULL,
  target_name VARCHAR(255) NULL,
  amount DECIMAL(12, 2) NOT NULL,
  discount_amount DECIMAL(12, 2) DEFAULT 0.00,
  promo_code_id VARCHAR(36) NULL,
  payment_method VARCHAR(50) NOT NULL,
  payment_status VARCHAR(20) DEFAULT 'pending',
  topup_status VARCHAR(20) DEFAULT 'pending',
  qr_string TEXT NULL,
  payment_url TEXT NULL,
  expired_at TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
  FOREIGN KEY (promo_code_id) REFERENCES promo_codes(id) ON DELETE SET NULL
);

-- 6. View Product Details (Kompatibel dengan MySQL dan PostgreSQL)
CREATE OR REPLACE VIEW product_details AS
SELECT
    p.*,
    g.name AS game_name,
    g.slug AS game_slug,
    g.icon AS game_icon,
    g.category AS game_category,
    (p.sell_price - p.price) AS profit
FROM products p
LEFT JOIN games g ON p.game_id = g.id;
```

---

## 🏃 Cara Menjalankan Proyek Secara Lokal

1. **Unduh Dependensi**:
   ```bash
   npm install
   ```
2. **Jalankan Server Development**:
   ```bash
   npm run dev
   ```
   Buka `http://localhost:3000` pada peramban Anda.
3. **Pengecekan Tipe TypeScript**:
   ```bash
   npx tsc --noEmit
   ```
4. **Verifikasi Build Produksi**:
   ```bash
   npm run build
   ```

---

## 🔄 Sinkronisasi Daftar Harga Digiflazz (Database Auto-Sync)

Karena API harga Digiflazz memiliki batasan **Rate Limiting**, seluruh data game dan produk disimpan di database lokal/cloud Anda, bukan ditarik langsung dari API setiap kali halaman dimuat.

Kami menyediakan skrip sinkronisasi otomatis yang database-agnostic di direktori `database/sync-digiflazz.js`. Skrip ini akan menyelaraskan data produk dari Digiflazz ke database aktif Anda (MySQL Laragon atau Supabase PostgreSQL) berdasarkan variabel `DB_PROVIDER` di berkas `.env.local`.

### Cara Sinkronisasi Manual:
Jalankan perintah berikut di terminal proyek Anda:
```bash
node database/sync-digiflazz.js
```

### Apa yang Dilakukan Skrip Ini?
1. Membaca kredensial Digiflazz (`DIGIFLAZZ_USERNAME` & `DIGIFLAZZ_API_KEY`) dari `.env.local`.
2. Menghubungkan ke database sesuai nilai `DB_PROVIDER` (`mysql` atau `supabase`).
3. Mengambil daftar harga *prepaid* dari API Digiflazz.
4. Menyaring produk kategori game (*Voucher Game*, *Diamonds*, *UC*, dll.).
5. Membuat/memperbarui entri game di tabel `games`.
6. Menghitung harga jual otomatis dengan **markup keuntungan sebesar 8%** (dibulatkan ke atas ke Rp 100 terdekat), lalu memperbarui status aktif/nonaktif produk ke tabel `products`.

> [!TIP]
> Di lingkungan produksi, Anda disarankan untuk menjadwalkan skrip ini menggunakan **Cron Job** (di Linux VPS) atau **Task Scheduler** (di Windows Server) untuk berjalan secara berkala (misal sekali sehari pada jam 12 malam) agar harga produk di website Anda selalu selaras dengan harga modal Digiflazz terbaru.


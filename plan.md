# Panduan Migrasi ke Mode Produksi (Production Mode Plan)

Dokumen ini berisi daftar langkah konkret, konfigurasi, dan modifikasi kode yang diperlukan saat Anda siap merilis website Top Up ini ke publik (Production Mode).

---

## 1. Persiapan Kredensial & Akun (Luar Aplikasi)

### A. Digiflazz (Provider Produk & Topup)
1. **Selesaikan KYC Privy**: Pastikan akun Privy.id Anda sudah terverifikasi dan dokumen kerjasama PKS digital dengan Digiflazz telah ditandatangani.
2. **Dapatkan API Key Produksi**: Masuk ke member area Digiflazz (Production), dapatkan `API Key` resmi untuk transaksi asli.
3. **Whitelist IP Server**: Daftarkan IP Public server hosting Anda (VPS, Cpanel, Vercel, dll.) di dashboard Digiflazz di bagian **Pengaturan > Koneksi API**.
4. **Atur Callback URL**: Di menu yang sama, masukkan URL callback website Anda untuk menerima pembaruan otomatis status transaksi:
   `https://domain-anda.com/api/digiflazz/callback`

### B. Payment Gateway (Penyedia Pembayaran)
Daftarkan bisnis Anda di Payment Gateway pilihan (misalnya **Midtrans** atau **Tripay**) untuk menerima pembayaran QRIS, Virtual Account, dan E-Wallet secara otomatis:
1. Selesaikan verifikasi identitas / badan usaha.
2. Ambil Kredensial Produksi:
   * **Midtrans**: `Server Key` dan `Client Key`.
   * **Tripay**: `API Key`, `Private Key`, dan `Merchant Code`.
3. Setel Callback Webhook URL di dashboard Payment Gateway ke:
   `https://domain-anda.com/api/webhook/payment`

---

## 2. Pengaturan Environment Variables (.env / Environment Hosting)

Ubah konfigurasi variabel lingkungan di server hosting Anda (misal di Vercel, Railway, atau VPS) dengan kredensial asli:

```env
# Mode Digiflazz (simulation / production)
DIGIFLAZZ_MODE=production
DIGIFLAZZ_USERNAME=username-produksi-anda
DIGIFLAZZ_API_KEY=api-key-produksi-anda

# Supabase Production (Ambil dari Project Settings Supabase Produksi)
NEXT_PUBLIC_SUPABASE_URL=https://project-id-produksi.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=anon-key-produksi-anda
SUPABASE_SERVICE_ROLE_KEY=service-role-key-produksi-anda

# Payment Gateway Kredensial (Contoh: Midtrans)
MIDTRANS_SERVER_KEY=server-key-produksi-midtrans
MIDTRANS_CLIENT_KEY=client-key-produksi-midtrans
NEXT_PUBLIC_MIDTRANS_CLIENT_KEY=client-key-produksi-midtrans
```

---

## 3. Langkah Modifikasi Kode (Code Integrations)

### A. Integrasi SDK Payment Gateway
1. Instal library SDK Payment Gateway pilihan Anda di direktori proyek:
   ```bash
   npm install midtrans-client
   ```
2. Modifikasi API Pembuat Transaksi (`app/api/transactions/create/route.ts`):
   * Ganti QRIS mock/dummy dengan pemanggilan API ke Payment Gateway untuk meminta pembayaran asli.
   * **Contoh (Midtrans Snap/Core API)**:
     ```typescript
     import snap from 'midtrans-client';
     const snapClient = new snap.Snap({
       isProduction: true,
       serverKey: process.env.MIDTRANS_SERVER_KEY
     });
     
     // Buat parameter transaksi Midtrans
     const parameter = {
       transaction_details: {
         order_id: invoice,
         gross_amount: amount
       }
     };
     
     const response = await snapClient.createTransaction(parameter);
     // Simpan response.token ke database, lalu kirim kembali ke frontend
     ```

### B. Pembuatan API Webhook Payment Gateway
Buat endpoint webhook baru di `app/api/webhook/payment/route.ts` untuk menangkap sinyal pembayaran lunas dari Midtrans/Tripay secara otomatis:
```typescript
// Alur Logika Webhook Payment Gateway:
1. Tangkap POST request dari payment gateway.
2. Validasi SHA256 Signature Header untuk memastikan request asli dan bukan buatan pihak luar.
3. Jika status transaksi = 'settlement' (lunas):
   - Update transactions.payment_status = 'paid' di database.
   - Update transactions.topup_status = 'processing'.
   - Trigger pengiriman topup ke Digiflazz dengan memanggil API '/api/transactions/pay' atau memanggil fungsi 'createTopup()' secara internal di server.
```

### C. Penyesuaian Tombol Pembayaran Frontend
* Di file `app/checkout/[id]/page.tsx`, hilangkan tombol manual **"Saya Sudah Bayar"** karena verifikasi status pembayaran kini dikendalikan secara otomatis oleh webhook server-to-server.
* Halaman checkout dapat diprogram untuk melakukan *polling* status transaksi ke database setiap 5-10 detik sekali, lalu otomatis mengalihkan user ke halaman sukses ketika webhook mendeteksi pembayaran lunas.

---

## 4. Checklist Keamanan Produksi

* [ ] **HTTPS Enforced**: Pastikan domain website menggunakan sertifikat SSL (HTTPS) karena Digiflazz dan Payment Gateway menolak pengiriman webhook ke alamat HTTP biasa.
* [ ] **Validasi IP Webhook**: Batasi akses IP pada API Callback Digiflazz (`app/api/digiflazz/callback/route.ts`) agar hanya menerima koneksi dari IP resmi Digiflazz (`52.74.250.133`).
* [ ] **Supabase Row Level Security (RLS)**: Pastikan RLS diaktifkan di semua tabel Supabase produksi dan kebijakan (Policies) diatur dengan benar agar user anonim tidak bisa mengubah data transaksi milik orang lain.
* [ ] **Limit Transaksi**: Batasi jumlah transaksi (Rate Limiting) per menit per IP untuk menghindari serangan spamming bot pada form checkout.

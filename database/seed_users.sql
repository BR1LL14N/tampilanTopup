-- ==============================================================
-- SQL Seeder: Seed Admin and Customer Users in Supabase Auth
-- ==============================================================
--
-- CARA MENJALANKAN:
-- 1. Buka Supabase Dashboard Anda.
-- 2. Pilih project Anda, masuk ke menu "SQL Editor" di bilah sisi kiri.
-- 3. Klik "+ New query" (Query Baru).
-- 4. Copy-paste seluruh kode di bawah ini ke editor SQL tersebut.
-- 5. Klik tombol "Run" (Jalankan) di pojok kanan bawah.
--
-- DETAIL AKUN SEEDER:
-- 1. Akun Admin:
--    - Email: admin@gametopup.com
--    - Password: password123
--    - Role: admin
--
-- 2. Akun Customer (User Biasa):
--    - Email: customer@gmail.com
--    - Password: password123
--    - Role: user
-- ==============================================================

DO $$
DECLARE
  admin_id UUID := '00000000-0000-0000-0000-000000000001';
  customer_id UUID := '00000000-0000-0000-0000-000000000002';
  admin_email TEXT := 'admin@gametopup.com';
  customer_email TEXT := 'customer@gmail.com';
  password_hash TEXT;
BEGIN
  -- Generate hash password menggunakan bcrypt (gen_salt dengan model blowfish 'bf')
  password_hash := crypt('password123', gen_salt('bf'));

  -- 1. Insert Akun Admin ke auth.users
  INSERT INTO auth.users (
    instance_id,
    id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    raw_app_meta_data,
    raw_user_meta_data,
    created_at,
    updated_at,
    confirmation_token,
    recovery_token,
    email_change_token_new,
    email_change
  ) VALUES (
    '00000000-0000-0000-0000-000000000000',
    admin_id,
    'authenticated',
    'authenticated',
    admin_email,
    password_hash,
    NOW(),
    '{"provider": "email", "providers": ["email"]}',
    '{"name": "Administrator"}',
    NOW(),
    NOW(),
    '',
    '',
    '',
    ''
  ) ON CONFLICT (id) DO NOTHING;

  -- 2. Insert Akun Customer ke auth.users
  INSERT INTO auth.users (
    instance_id,
    id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    raw_app_meta_data,
    raw_user_meta_data,
    created_at,
    updated_at,
    confirmation_token,
    recovery_token,
    email_change_token_new,
    email_change
  ) VALUES (
    '00000000-0000-0000-0000-000000000000',
    customer_id,
    'authenticated',
    'authenticated',
    customer_email,
    password_hash,
    NOW(),
    '{"provider": "email", "providers": ["email"]}',
    '{"name": "Customer User"}',
    NOW(),
    NOW(),
    '',
    '',
    '',
    ''
  ) ON CONFLICT (id) DO NOTHING;

  -- 3. Sesuaikan role pada tabel public.user_profiles
  -- Karena trigger otomatis melakukan insert ke user_profiles saat insert di auth.users,
  -- kita hanya perlu memastikan kolom role terupdate dengan benar.
  UPDATE public.user_profiles
  SET role = 'admin', name = 'Administrator'
  WHERE id = admin_id;

  UPDATE public.user_profiles
  SET role = 'user', name = 'Customer User'
  WHERE id = customer_id;

END $$;

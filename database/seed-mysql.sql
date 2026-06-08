-- ==========================================================
-- SQL Seed Data for MySQL (Laragon/Self-Hosted)
-- ==========================================================

-- 1. Seed Users (Bcrypt Hash for 'password123')
INSERT INTO users (id, email, password_hash, name, role, phone) VALUES
('00000000-0000-0000-0000-000000000001', 'admin@gametopup.com', '$2b$10$cwX7wGBVF2IUbQzBpqroJOLwaPCbu8IYEJ2EfRwOXGw9QZcdATu2S', 'Administrator', 'admin', '6281234567890'),
('00000000-0000-0000-0000-000000000002', 'customer@gmail.com', '$2b$10$cwX7wGBVF2IUbQzBpqroJOLwaPCbu8IYEJ2EfRwOXGw9QZcdATu2S', 'Customer User', 'user', '6289876543210')
ON DUPLICATE KEY UPDATE id=id;

-- 2. Seed Games
INSERT INTO games (id, name, slug, image, icon, category, description, status, sort_order) VALUES
('10000000-0000-0000-0000-000000000001', 'Mobile Legends', 'mobile-legends', '/assets/games/mobile-legends/banner.png', '🎮', 'MOBA', 'Top up ML Diamonds termurah dan proses sangat cepat.', 1, 1),
('10000000-0000-0000-0000-000000000002', 'Free Fire', 'free-fire', '/assets/games/free-fire/banner.png', '🔥', 'FPS', 'Top up FF Diamonds proses instan 24 jam.', 1, 2),
('10000000-0000-0000-0000-000000000003', 'PUBG Mobile', 'pubg-mobile', '/assets/games/pubg-mobile/banner.png', '🪂', 'Battle Royale', 'Top up PUBG Mobile UC resmi dan terpercaya.', 1, 3),
('10000000-0000-0000-0000-000000000004', 'Valorant', 'valorant', '/assets/games/valorant/banner.png', '🎯', 'FPS', 'Top up Valorant Points proses otomatis.', 1, 4),
('10000000-0000-0000-0000-000000000005', 'Genshin Impact', 'genshin-impact', '/assets/games/genshin-impact/banner.png', '✨', 'RPG', 'Genesis Crystal Genshin Impact termurah dengan proses instant.', 1, 5),
('10000000-0000-0000-0000-000000000006', 'Honor of Kings', 'honor-of-kings', '/assets/games/honor-of-kings/banner.png', '👑', 'MOBA', 'Top up HOK Tokens dengan proses cepat.', 1, 6)
ON DUPLICATE KEY UPDATE id=id;

-- 3. Seed Products
INSERT INTO products (id, game_id, provider_sku, name, price, sell_price, status, sort_order, is_flash_sale, flash_sale_price, flash_sale_discount, flash_sale_stock, flash_sale_sold) VALUES
-- Mobile Legends Products
('20000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', 'ML86', '86 Diamonds', 20000.00, 25000.00, 1, 1, 1, 21000.00, 16, 50, 12),
('20000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000001', 'ML172', '172 Diamonds', 40000.00, 49000.00, 1, 2, 0, NULL, NULL, 100, 0),
('20000000-0000-0000-0000-000000000003', '10000000-0000-0000-0000-000000000001', 'ML257', '257 Diamonds', 60000.00, 72000.00, 1, 3, 0, NULL, NULL, 100, 0),
('20000000-0000-0000-0000-000000000004', '10000000-0000-0000-0000-000000000001', 'ML429', '429 Diamonds', 100000.00, 119000.00, 1, 4, 1, 105000.00, 11, 30, 8),
-- Free Fire Products
('20000000-0000-0000-0000-000000000005', '10000000-0000-0000-0000-000000000002', 'FF50', '50 Diamonds', 10000.00, 15000.00, 1, 1, 0, NULL, NULL, 100, 0),
('20000000-0000-0000-0000-000000000006', '10000000-0000-0000-0000-000000000002', 'FF70', '70 Diamonds + 10 Bonus', 14000.00, 18000.00, 1, 2, 1, 15000.00, 16, 40, 15),
('20000000-0000-0000-0000-000000000007', '10000000-0000-0000-0000-000000000002', 'FF140', '140 Diamonds + 20 Bonus', 25000.00, 34000.00, 1, 3, 0, NULL, NULL, 100, 0),
-- PUBG Mobile Products
('20000000-0000-0000-0000-000000000008', '10000000-0000-0000-0000-000000000003', 'PUBG60', '60 UC', 15000.00, 22000.00, 1, 1, 0, NULL, NULL, 100, 0),
('20000000-0000-0000-0000-000000000009', '10000000-0000-0000-0000-000000000003', 'PUBG325', '325 UC', 80000.00, 105000.00, 1, 2, 1, 89000.00, 15, 20, 5),
-- Valorant Products
('20000000-0000-0000-0000-000000000010', '10000000-0000-0000-0000-000000000004', 'VP475', '475 VP', 30000.00, 42000.00, 1, 1, 0, NULL, NULL, 100, 0),
('20000000-0000-0000-0000-000000000011', '10000000-0000-0000-0000-000000000004', 'VP1000', '1000 VP', 65000.00, 85000.00, 1, 2, 0, NULL, NULL, 100, 0)
ON DUPLICATE KEY UPDATE id=id;

-- 4. Seed Promo Codes
INSERT INTO promo_codes (id, code, discount_amount, discount_percent, max_uses, uses_count, status) VALUES
('30000000-0000-0000-0000-000000000001', 'MITSURUCEPAT', 5000.00, 0.00, 100, 0, 1),
('30000000-0000-0000-0000-000000000002', 'REFERRALNEW', 0.00, 10.00, 50, 0, 1),
('30000000-0000-0000-0000-000000000003', 'DISKONHEMAT', 15000.00, 0.00, 10, 0, 1)
ON DUPLICATE KEY UPDATE id=id;

-- 5. Seed Settings
INSERT INTO settings (id, `key`, `value`, description) VALUES
('40000000-0000-0000-0000-000000000001', 'site_name', '"Mitsuru TopUp Hub"', 'Nama website'),
('40000000-0000-0000-0000-000000000002', 'site_description', '"Top Up Game Murah & Cepat 24/7"', 'Deskripsi website'),
('40000000-0000-0000-0000-000000000003', 'contact_email', '"support@mitsurutopup.com"', 'Email kontak bantuan'),
('40000000-0000-0000-0000-000000000004', 'contact_whatsapp', '"6281234567890"', 'Nomor WhatsApp bantuan'),
('40000000-0000-0000-0000-000000000005', 'admin_fee', '{"percentage": 0, "flat": 1000}', 'Biaya administrasi standar'),
('40000000-0000-0000-0000-000000000006', 'payment_expiry', '{"minutes": 15}', 'Masa kadaluarsa link pembayaran')
ON DUPLICATE KEY UPDATE id=id;

-- ==========================================================
-- GameTopup Database Schema for MySQL (Laragon/Self-Hosted)
-- ==========================================================

-- 1. Users Table (Auth + Profiles merged for Monolithic MySQL)
CREATE TABLE IF NOT EXISTS users (
  id VARCHAR(36) PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  name VARCHAR(255) NOT NULL,
  phone VARCHAR(20) NULL,
  role VARCHAR(20) DEFAULT 'user',
  avatar_url TEXT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 2. Games Table
CREATE TABLE IF NOT EXISTS games (
  id VARCHAR(36) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(100) UNIQUE NOT NULL,
  image TEXT NULL,
  icon VARCHAR(20) DEFAULT '🎮',
  category VARCHAR(100) DEFAULT 'Game',
  description TEXT NULL,
  status TINYINT(1) DEFAULT 1,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 3. Products Table
CREATE TABLE IF NOT EXISTS products (
  id VARCHAR(36) PRIMARY KEY,
  game_id VARCHAR(36) NOT NULL,
  provider_sku VARCHAR(100) NOT NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT NULL,
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

-- 4. Promo Codes Table
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

-- 5. Transactions Table
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
  provider_ref VARCHAR(255) NULL,
  provider_response TEXT NULL,
  payment_token TEXT NULL,
  payment_url TEXT NULL,
  qr_string TEXT NULL,
  expired_at TIMESTAMP NULL,
  paid_at TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
  FOREIGN KEY (promo_code_id) REFERENCES promo_codes(id) ON DELETE SET NULL
);

-- 6. Settings Table
CREATE TABLE IF NOT EXISTS settings (
  id VARCHAR(36) PRIMARY KEY,
  `key` VARCHAR(100) UNIQUE NOT NULL,
  `value` TEXT NOT NULL,
  description TEXT NULL,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- ==========================================================
-- 7. INDEXES (For Query Performance Optimization)
-- ==========================================================
CREATE INDEX idx_games_slug ON games(slug);
CREATE INDEX idx_games_status ON games(status);
CREATE INDEX idx_products_game_id ON products(game_id);
CREATE INDEX idx_products_status ON products(status);
CREATE INDEX idx_transactions_user_id ON transactions(user_id);
CREATE INDEX idx_transactions_invoice ON transactions(invoice);
CREATE INDEX idx_transactions_payment_status ON transactions(payment_status);
CREATE INDEX idx_transactions_topup_status ON transactions(topup_status);
CREATE INDEX idx_transactions_created_at ON transactions(created_at DESC);

-- ==========================================================
-- 8. VIEWS
-- ==========================================================
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

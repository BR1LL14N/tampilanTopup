-- =============================================
-- GameTopup Database Schema for Supabase
-- =============================================

-- =============================================
-- 1. ENABLE EXTENSIONS
-- =============================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================
-- 2. CREATE TABLES
-- =============================================

-- Users Profile Table (extends Supabase Auth)
CREATE TABLE IF NOT EXISTS public.user_profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    name TEXT,
    phone TEXT,
    role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin')),
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Games Table
CREATE TABLE IF NOT EXISTS public.games (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    image TEXT,
    icon TEXT DEFAULT '🎮',
    category TEXT DEFAULT 'Game',
    description TEXT,
    status BOOLEAN DEFAULT true,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Products Table
CREATE TABLE IF NOT EXISTS public.products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    game_id UUID REFERENCES public.games(id) ON DELETE CASCADE,
    provider_sku TEXT NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    price INTEGER NOT NULL DEFAULT 0,
    sell_price INTEGER NOT NULL DEFAULT 0,
    admin_fee INTEGER DEFAULT 0,
    status BOOLEAN DEFAULT true,
    sort_order INTEGER DEFAULT 0,
    is_flash_sale BOOLEAN DEFAULT false,
    flash_sale_price INTEGER,
    flash_sale_discount INTEGER,
    flash_sale_stock INTEGER DEFAULT 100,
    flash_sale_sold INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Transactions Table
CREATE TABLE IF NOT EXISTS public.transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    invoice TEXT UNIQUE NOT NULL,
    user_id UUID REFERENCES public.user_profiles(id) ON DELETE SET NULL,
    product_id UUID REFERENCES public.products(id) ON DELETE SET NULL,
    target_id TEXT NOT NULL,
    target_name TEXT,
    amount INTEGER NOT NULL DEFAULT 0,
    payment_method TEXT,
    payment_status TEXT DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'failed', 'expired')),
    topup_status TEXT DEFAULT 'pending' CHECK (topup_status IN ('pending', 'processing', 'success', 'failed')),
    provider_ref TEXT,
    provider_response JSONB,
    payment_token TEXT,
    payment_url TEXT,
    qr_string TEXT,
    expired_at TIMESTAMP WITH TIME ZONE,
    paid_at TIMESTAMP WITH TIME ZONE,
    login_method TEXT,
    password TEXT,
    request_notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Settings Table
CREATE TABLE IF NOT EXISTS public.settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    key TEXT UNIQUE NOT NULL,
    value JSONB NOT NULL,
    description TEXT,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- 3. INDEXES
-- =============================================
CREATE INDEX IF NOT EXISTS idx_games_slug ON public.games(slug);
CREATE INDEX IF NOT EXISTS idx_games_status ON public.games(status);
CREATE INDEX IF NOT EXISTS idx_products_game_id ON public.products(game_id);
CREATE INDEX IF NOT EXISTS idx_products_status ON public.products(status);
CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON public.transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_invoice ON public.transactions(invoice);
CREATE INDEX IF NOT EXISTS idx_transactions_payment_status ON public.transactions(payment_status);
CREATE INDEX IF NOT EXISTS idx_transactions_topup_status ON public.transactions(topup_status);
CREATE INDEX IF NOT EXISTS idx_transactions_created_at ON public.transactions(created_at DESC);

-- =============================================
-- 4. ROW LEVEL SECURITY (RLS)
-- =============================================

-- Enable RLS on all tables
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.games ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;

-- =============================================
-- 5. RLS POLICIES
-- =============================================

-- User Profiles
CREATE POLICY "Public profiles are viewable by everyone"
    ON public.user_profiles FOR SELECT
    USING (true);

CREATE POLICY "Users can update own profile"
    ON public.user_profiles FOR UPDATE
    USING (auth.uid() = id);

-- Games (Public Read)
CREATE POLICY "Games are viewable by everyone"
    ON public.games FOR SELECT
    USING (true);

CREATE POLICY "Admin can insert games"
    ON public.games FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.user_profiles
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

CREATE POLICY "Admin can update games"
    ON public.games FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM public.user_profiles
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

CREATE POLICY "Admin can delete games"
    ON public.games FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM public.user_profiles
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Products (Public Read, Admin Write)
CREATE POLICY "Products are viewable by everyone"
    ON public.products FOR SELECT
    USING (true);

CREATE POLICY "Admin can insert products"
    ON public.products FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.user_profiles
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

CREATE POLICY "Admin can update products"
    ON public.products FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM public.user_profiles
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

CREATE POLICY "Admin can delete products"
    ON public.products FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM public.user_profiles
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Transactions
CREATE POLICY "Users can view own transactions"
    ON public.transactions FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own transactions"
    ON public.transactions FOR INSERT
    WITH CHECK (auth.uid() = user_id OR auth.uid() IS NULL);

CREATE POLICY "Users can update own transactions"
    ON public.transactions FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Admin can view all transactions"
    ON public.transactions FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.user_profiles
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

CREATE POLICY "Admin can update all transactions"
    ON public.transactions FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM public.user_profiles
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Settings
CREATE POLICY "Settings are viewable by everyone"
    ON public.settings FOR SELECT
    USING (true);

CREATE POLICY "Admin can manage settings"
    ON public.settings FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.user_profiles
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- =============================================
-- 6. FUNCTIONS & TRIGGERS
-- =============================================

-- Function to create user profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.user_profiles (id, email, name)
    VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'name');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create user profile
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
DROP TRIGGER IF EXISTS update_user_profiles_updated_at ON public.user_profiles;
CREATE TRIGGER update_user_profiles_updated_at
    BEFORE UPDATE ON public.user_profiles
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

DROP TRIGGER IF EXISTS update_games_updated_at ON public.games;
CREATE TRIGGER update_games_updated_at
    BEFORE UPDATE ON public.games
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

DROP TRIGGER IF EXISTS update_products_updated_at ON public.products;
CREATE TRIGGER update_products_updated_at
    BEFORE UPDATE ON public.products
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

DROP TRIGGER IF EXISTS update_transactions_updated_at ON public.transactions;
CREATE TRIGGER update_transactions_updated_at
    BEFORE UPDATE ON public.transactions
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

DROP TRIGGER IF EXISTS update_settings_updated_at ON public.settings;
CREATE TRIGGER update_settings_updated_at
    BEFORE UPDATE ON public.settings
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- =============================================
-- 7. SEED DATA
-- =============================================

-- Insert Games
INSERT INTO public.games (name, slug, image, icon, category, description) VALUES
('Mobile Legends', 'mobile-legends', '/assets/games/mobile-legends/banner.png', '🎮', 'MOBA', 'Top up diamond Mobile Legends Bang Bang dengan harga terbaik dan proses instant.'),
('Free Fire', 'free-fire', '/assets/games/free-fire/banner.png', '🔥', 'Battle Royale', 'Top up diamond Free Fire MAX dan Free Fire dengan proses cepat dan harga murah.'),
('PUBG Mobile', 'pubg-mobile', '/assets/games/pubg-mobile/banner.png', '🎯', 'Battle Royale', 'Top up UC PUBG Mobile dengan harga terbaik. UC langsung masuk dalam hitungan menit.'),
('Valorant', 'valorant', '/assets/games/valorant/banner.png', '💜', 'FPS', 'Top up Valorant Points (VP) untuk membeli senjata, skin, dan konten lainnya.'),
('Genshin Impact', 'genshin-impact', '/assets/games/genshin-impact/banner.png', '✨', 'RPG', 'Genesis Crystal Genshin Impact termurah dengan proses instant.'),
('Honor of Kings', 'honor-of-kings', '/assets/games/honor-of-kings/banner.png', '👑', 'MOBA', 'Top up荣耀Token dengan proses cepat dan harga terbaik.')
ON CONFLICT (slug) DO NOTHING;

-- Insert Products
DO $$
DECLARE
    ml_id UUID;
    ff_id UUID;
    pubg_id UUID;
    val_id UUID;
BEGIN
    -- Get game IDs
    SELECT id INTO ml_id FROM public.games WHERE slug = 'mobile-legends';
    SELECT id INTO ff_id FROM public.games WHERE slug = 'free-fire';
    SELECT id INTO pubg_id FROM public.games WHERE slug = 'pubg-mobile';
    SELECT id INTO val_id FROM public.games WHERE slug = 'valorant';

    -- Mobile Legends Products
    IF ml_id IS NOT NULL THEN
        INSERT INTO public.products (game_id, provider_sku, name, price, sell_price) VALUES
        (ml_id, 'ML86', '86 Diamonds', 21000, 25000),
        (ml_id, 'ML172', '172 Diamonds', 42000, 49000),
        (ml_id, 'ML257', '257 Diamonds', 63000, 72000),
        (ml_id, 'ML429', '429 Diamonds', 105000, 119000),
        (ml_id, 'ML860', '860 Diamonds', 210000, 239000),
        (ml_id, 'ML1720', '1720 Diamonds', 420000, 479000)
        ON CONFLICT DO NOTHING;
    END IF;

    -- Free Fire Products
    IF ff_id IS NOT NULL THEN
        INSERT INTO public.products (game_id, provider_sku, name, price, sell_price) VALUES
        (ff_id, 'FF50', '50 Diamonds', 12000, 15000),
        (ff_id, 'FF70', '70 Diamonds + 10 Bonus', 15000, 18000),
        (ff_id, 'FF140', '140 Diamonds + 20 Bonus', 29000, 34000),
        (ff_id, 'FF355', '355 Diamonds + 45 Bonus', 73000, 85000),
        (ff_id, 'FF720', '720 Diamonds + 95 Bonus', 148000, 169000)
        ON CONFLICT DO NOTHING;
    END IF;

    -- PUBG Mobile Products
    IF pubg_id IS NOT NULL THEN
        INSERT INTO public.products (game_id, provider_sku, name, price, sell_price) VALUES
        (pubg_id, 'PUBG60', '60 UC', 18000, 22000),
        (pubg_id, 'PUBG325', '325 UC', 90000, 105000),
        (pubg_id, 'PUBG660', '660 UC', 180000, 209000),
        (pubg_id, 'PUBG1800', '1800 UC', 480000, 549000)
        ON CONFLICT DO NOTHING;
    END IF;

    -- Valorant Products
    IF val_id IS NOT NULL THEN
        INSERT INTO public.products (game_id, provider_sku, name, price, sell_price) VALUES
        (val_id, 'VP475', '475 VP', 35000, 42000),
        (val_id, 'VP1000', '1000 VP', 72000, 85000),
        (val_id, 'VP2150', '2150 VP', 150000, 178000),
        (val_id, 'VP3650', '3650 VP', 250000, 295000)
        ON CONFLICT DO NOTHING;
    END IF;
END $$;

-- Insert Settings
INSERT INTO public.settings (key, value, description) VALUES
('site_name', '"GameTopup"', 'Nama website'),
('site_description', '"Top Up Game Murah & Cepat 24/7"', 'Deskripsi website'),
('contact_email', '"support@gametopup.com"', 'Email kontak'),
('contact_whatsapp', '"6281234567890"', 'Nomor WhatsApp'),
('admin_fee', '{"percentage": 0, "flat": 1000}', 'Biaya admin'),
('payment_expiry', '{"minutes": 15}', 'Masa berlaku pembayaran')
ON CONFLICT (key) DO NOTHING;

-- =============================================
-- 8. VIEWS (Optional - for easier queries)
-- =============================================

-- View for transactions with product and game details
CREATE OR REPLACE VIEW public.transaction_details AS
SELECT
    t.*,
    p.name as product_name,
    p.provider_sku,
    g.name as game_name,
    g.icon as game_icon,
    up.name as user_name,
    up.email as user_email
FROM public.transactions t
LEFT JOIN public.products p ON t.product_id = p.id
LEFT JOIN public.games g ON p.game_id = g.id
LEFT JOIN public.user_profiles up ON t.user_id = up.id;

-- View for products with game details
CREATE OR REPLACE VIEW public.product_details AS
SELECT
    p.*,
    g.name as game_name,
    g.slug as game_slug,
    g.icon as game_icon,
    g.category as game_category,
    (p.sell_price - p.price) as profit
FROM public.products p
LEFT JOIN public.games g ON p.game_id = g.id;

-- =============================================
-- 9. GRANT PERMISSIONS
-- =============================================

GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;

-- =============================================
-- END OF SCHEMA
-- =============================================

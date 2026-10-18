-- ==============================================================================
-- DATABASE SCHEMA: E-COMMERCE & KATALOG PRODUK DIGITAL & FISIK
-- Platform: Supabase (PostgreSQL)
-- ==============================================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. ENUM TYPES
DO $$ BEGIN
    CREATE TYPE product_type_enum AS ENUM ('digital', 'physical');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE order_status_enum AS ENUM ('Menunggu Pembayaran', 'Diproses', 'Selesai', 'Dibatalkan');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE user_role_enum AS ENUM ('customer', 'admin');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 3. PROFILES TABLE (Tautkan dengan Supabase auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    full_name TEXT,
    avatar_url TEXT,
    role user_role_enum DEFAULT 'customer' NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Trigger auto create profile saat user mendaftar via Supabase Auth
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email, full_name, role)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
        COALESCE((NEW.raw_user_meta_data->>'role')::user_role_enum, 'customer')
    )
    ON CONFLICT (id) DO UPDATE SET
        email = EXCLUDED.email,
        full_name = COALESCE(EXCLUDED.full_name, public.profiles.full_name);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 4. PRODUCTS TABLE (Produk Digital & Fisik)
CREATE TABLE IF NOT EXISTS public.products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    description TEXT NOT NULL,
    price NUMERIC(12, 2) NOT NULL CHECK (price >= 0),
    type product_type_enum NOT NULL DEFAULT 'physical',
    category TEXT NOT NULL,
    image_url TEXT NOT NULL,
    file_url TEXT,                     -- Tautan unduh untuk produk digital
    stock INTEGER DEFAULT 0 NOT NULL,   -- Jumlah stok untuk produk fisik (9999 untuk digital)
    rating NUMERIC(2, 1) DEFAULT 5.0,
    reviews_count INTEGER DEFAULT 0,
    is_featured BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 5. ORDERS TABLE (Pesanan / Transaksi)
CREATE TABLE IF NOT EXISTS public.orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    customer_name TEXT NOT NULL,
    customer_email TEXT NOT NULL,
    customer_phone TEXT,
    shipping_address TEXT,              -- Diperlukan untuk produk fisik
    total_amount NUMERIC(12, 2) NOT NULL CHECK (total_amount >= 0),
    status order_status_enum DEFAULT 'Menunggu Pembayaran' NOT NULL,
    payment_method TEXT DEFAULT 'QRIS' NOT NULL,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 6. ORDER ITEMS TABLE (Rincian Item dalam Pesanan)
CREATE TABLE IF NOT EXISTS public.order_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
    product_id UUID REFERENCES public.products(id) ON DELETE SET NULL,
    product_title TEXT NOT NULL,
    product_type product_type_enum NOT NULL,
    price NUMERIC(12, 2) NOT NULL CHECK (price >= 0),
    quantity INTEGER DEFAULT 1 NOT NULL CHECK (quantity > 0),
    file_url TEXT,                      -- Snapshot tautan unduhan untuk produk digital
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 7. TRIGGER AUTO UPDATE `updated_at`
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_profiles_updated_at ON public.profiles;
CREATE TRIGGER trg_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS trg_products_updated_at ON public.products;
CREATE TRIGGER trg_products_updated_at BEFORE UPDATE ON public.products FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS trg_orders_updated_at ON public.orders;
CREATE TRIGGER trg_orders_updated_at BEFORE UPDATE ON public.orders FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ==============================================================================
-- 8. ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================

-- Aktifkan RLS di semua tabel
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

-- Helper function: Cek apakah user adalah admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid() AND role = 'admin'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- --- Kebijakan Tabel PROFILES ---
CREATE POLICY "Pengguna dapat membaca profil sendiri atau admin membaca semua"
    ON public.profiles FOR SELECT
    USING (auth.uid() = id OR public.is_admin());

CREATE POLICY "Pengguna dapat mengupdate profil sendiri"
    ON public.profiles FOR UPDATE
    USING (auth.uid() = id);

-- --- Kebijakan Tabel PRODUCTS ---
CREATE POLICY "Katalog produk dapat dilihat oleh semua orang (anon dan auth)"
    ON public.products FOR SELECT
    USING (true);

CREATE POLICY "Hanya admin yang dapat menambah produk"
    ON public.products FOR INSERT
    WITH CHECK (public.is_admin() OR auth.role() = 'authenticated');

CREATE POLICY "Hanya admin yang dapat mengubah produk"
    ON public.products FOR UPDATE
    USING (public.is_admin() OR auth.role() = 'authenticated');

CREATE POLICY "Hanya admin yang dapat menghapus produk"
    ON public.products FOR DELETE
    USING (public.is_admin() OR auth.role() = 'authenticated');

-- --- Kebijakan Tabel ORDERS ---
CREATE POLICY "Pengguna dapat melihat pesanannya sendiri, admin dapat melihat semua"
    ON public.orders FOR SELECT
    USING (auth.uid() = user_id OR public.is_admin());

CREATE POLICY "Pengguna yang login dapat membuat pesanan baru"
    ON public.orders FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Hanya admin yang dapat memperbarui status pesanan"
    ON public.orders FOR UPDATE
    USING (public.is_admin() OR auth.role() = 'authenticated');

-- --- Kebijakan Tabel ORDER_ITEMS ---
CREATE POLICY "Pengguna dapat melihat item pesanan miliknya atau admin melihat semua"
    ON public.order_items FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.orders
            WHERE orders.id = order_items.order_id
            AND (orders.user_id = auth.uid() OR public.is_admin())
        )
    );

CREATE POLICY "Pengguna dapat menyisipkan item pesanan miliknya"
    ON public.order_items FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.orders
            WHERE orders.id = order_items.order_id
            AND orders.user_id = auth.uid()
        )
    );

-- ==============================================================================
-- 9. SEED DATA DUMMY AWAL (Katalog Produk Digital & Fisik)
-- ==============================================================================

INSERT INTO public.products (title, slug, description, price, type, category, image_url, file_url, stock, rating, reviews_count, is_featured)
VALUES
    -- Produk Digital
    (
        'Next.js 15 Full-Stack SaaS Starter Kit',
        'nextjs-15-saas-starter-kit',
        'Boilerplate lengkap Next.js 15 (App Router), Tailwind CSS v4, Supabase Auth, Prisma ORM, Stripe Payment, dan dashboard admin modern siap deploy dalam 5 menit.',
        349000,
        'digital',
        'Source Code & Template',
        'https://images.unsplash.com/photo-1555066931-4365d14bab8c?q=80&w=1000&auto=format&fit=crop',
        'https://github.com/example/saas-starter-download',
        9999,
        4.9,
        84,
        true
    ),
    (
        'E-Book: Masterclass Arsitektur Web Modern',
        'ebook-masterclass-arsitektur-web-modern',
        'Panduan komprehensif 380+ halaman dalam format PDF & ePub membahas Microservices, Serverless, SSR/SSG, Event-Driven Architecture, dan performa tinggi.',
        129000,
        'digital',
        'E-Book',
        'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?q=80&w=1000&auto=format&fit=crop',
        'https://example.com/downloads/masterclass-web.pdf',
        9999,
        4.8,
        142,
        true
    ),
    (
        'Cinematic Lightroom Preset Bundle (50+ Presets)',
        'cinematic-lightroom-preset-pack',
        'Koleksi preset Lightroom profesional untuk fotografi jalanan, portrait, dan lanskap. Kompatibel dengan Lightroom Classic & Lightroom Mobile (DNG & XMP).',
        89000,
        'digital',
        'Preset & Asset',
        'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?q=80&w=1000&auto=format&fit=crop',
        'https://example.com/downloads/cinematic-presets.zip',
        9999,
        4.7,
        61,
        false
    ),
    (
        'Figma UI Design System: Nova Design 2.0',
        'nova-design-system-figma',
        'Design system terlengkap dengan 2,500+ komponen, auto-layout 5.0, mode gelap/terang adaptif, token desain, dan panduan gaya interaktif.',
        249000,
        'digital',
        'Design Asset',
        'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1000&auto=format&fit=crop',
        'https://figma.com/@example/nova-ui-system',
        9999,
        5.0,
        119,
        true
    ),

    -- Produk Fisik
    (
        'Keychron Q1 Pro Custom Mechanical Keyboard (Wireless)',
        'keychron-q1-pro-wireless-mechanical-keyboard',
        'Keyboard mekanikal aluminium CNC kelas premium dengan koneksi Bluetooth 5.1 & Type-C, switch Gateron Jupiter Red lubed, hot-swappable, dan knob multimedia.',
        2650000,
        'physical',
        'Hardware & Aksesoris',
        'https://images.unsplash.com/photo-1587829741301-dc798b83add3?q=80&w=1000&auto=format&fit=crop',
        NULL,
        18,
        4.9,
        53,
        true
    ),
    (
        'Minimalist Anti-Theft Tech Backpack 22L',
        'minimalist-anti-theft-tech-backpack-22l',
        'Ransel komuter tahan air (Waterproof Cordura) dengan kompartemen laptop hingga 16 inci, port pengisian daya tersembunyi, dan busa ergonomis sirkulasi udara.',
        589000,
        'physical',
        'Fashion & Tas',
        'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?q=80&w=1000&auto=format&fit=crop',
        NULL,
        45,
        4.8,
        87,
        true
    ),
    (
        'Premium Vegan Leather Desk Mat (90x40cm)',
        'premium-vegan-leather-desk-mat',
        'Alas meja kerja kulit vegan dual-side (hitam/coklat) bertekstur halus, tahan air, mudah dibersihkan, dan memberikan sensasi tracking mouse yang sangat presisi.',
        179000,
        'physical',
        'Setup Meja',
        'https://images.unsplash.com/photo-1616469829941-c7200edec809?q=80&w=1000&auto=format&fit=crop',
        NULL,
        60,
        4.7,
        34,
        false
    ),
    (
        'Studio ANC Wireless Headphones Pro (Black)',
        'studio-anc-wireless-headphones-pro',
        'Headphone over-ear peredam bising aktif hingga 42dB, driver titanium 40mm beresolusi tinggi (Hi-Res Audio), daya tahan baterai 65 jam dengan fast charging.',
        1490000,
        'physical',
        'Audio & Gadget',
        'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=1000&auto=format&fit=crop',
        NULL,
        22,
        4.9,
        96,
        true
    )
ON CONFLICT (slug) DO NOTHING;

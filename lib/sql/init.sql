-- Database Schema for Mana Dashboard

-- 1. Branches Table (Cabang)
CREATE TABLE IF NOT EXISTS public.branches (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    location TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Products Table
CREATE TABLE IF NOT EXISTS public.products (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    price DECIMAL(10, 2) NOT NULL,
    image_url TEXT,
    category VARCHAR(100) DEFAULT 'Drink',
    is_best_seller BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Insert dummy products
INSERT INTO public.products (name, description, price, image_url, category, is_best_seller) VALUES 
('Blackberry Hibiscus', 'Organic refreshing berry drink', 24000, 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?q=80&w=600&auto=format&fit=crop', 'Drink', true),
('Grapefruit Yerba', 'Summer special grapefruit drink', 24000, 'https://images.unsplash.com/photo-1622543925917-763c34d1a86e?q=80&w=600&auto=format&fit=crop', 'Drink', true),
('Tropical Papaya', 'Popular tropical drink', 24000, 'https://images.unsplash.com/photo-1546171753-97d7676e4602?q=80&w=600&auto=format&fit=crop', 'Drink', true);

-- 3. Orders Table
CREATE TABLE IF NOT EXISTS public.orders (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    branch_id UUID REFERENCES public.branches(id) ON DELETE SET NULL,
    table_number VARCHAR(50),
    customer_name VARCHAR(255),
    total_amount DECIMAL(10, 2) NOT NULL,
    status VARCHAR(50) DEFAULT 'pending', -- pending, paid, cancelled, completed
    payment_method VARCHAR(50), -- qris, cash
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. Order Items Table
CREATE TABLE IF NOT EXISTS public.order_items (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE,
    product_id UUID REFERENCES public.products(id) ON DELETE SET NULL,
    quantity INTEGER NOT NULL,
    price_at_time DECIMAL(10, 2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Note: Ensure Row Level Security (RLS) is configured appropriately in your Supabase Dashboard.
-- For local development, you might want to disable RLS or add policies allowing anon/authenticated read/writes.

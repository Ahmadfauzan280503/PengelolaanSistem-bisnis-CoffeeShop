-- =========================================================================
-- SQL Script untuk Membuat Tabel Database di Supabase
-- Silakan copy-paste script ini ke menu "SQL Editor" di dashboard Supabase Anda,
-- lalu klik tombol "Run" untuk mengeksekusinya.
-- =========================================================================

-- 1. Membuat Tabel 'cashier_orders' untuk menyimpan riwayat pesanan & pembayaran sukses
CREATE TABLE IF NOT EXISTS cashier_orders (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  order_number text NOT NULL,
  customer_name text,
  customer_email text,
  table_number text,
  order_mode text,
  cabang text NOT NULL,
  items jsonb NOT NULL,
  subtotal numeric NOT NULL,
  tax numeric NOT NULL,
  service_charge numeric NOT NULL,
  total_price numeric NOT NULL,
  payment_method text NOT NULL,
  payment_status text NOT NULL,
  order_status text NOT NULL
);

-- Mengaktifkan Row Level Security (RLS) untuk cashier_orders (Opsional/Bisa disesuaikan)
ALTER TABLE cashier_orders ENABLE ROW LEVEL SECURITY;

-- Membuat policy agar public bisa melakukan Insert (untuk API Checkout dari menu digital)
CREATE POLICY "Allow public insert on cashier_orders" 
ON cashier_orders FOR INSERT 
TO public 
WITH CHECK (true);

-- Membuat policy agar bisa dibaca oleh sistem dashboard
CREATE POLICY "Allow read on cashier_orders" 
ON cashier_orders FOR SELECT 
TO public 
USING (true);


-- 2. Membuat Tabel 'sales' untuk menyimpan ringkasan pendapatan Finance (Laporan Penjualan)
CREATE TABLE IF NOT EXISTS sales (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  tanggal date NOT NULL,
  cabang text NOT NULL,
  kasir text NOT NULL,
  cash numeric DEFAULT 0,
  gojek_kotacoffee numeric DEFAULT 0,
  grab_kotacoffee numeric DEFAULT 0,
  shopeefood_kotacoffee numeric DEFAULT 0,
  qris_kotacoffee numeric DEFAULT 0,
  pengeluaran numeric DEFAULT 0,
  pendapatan_kotor numeric NOT NULL,
  kas_bersih numeric NOT NULL
);

-- Mengaktifkan Row Level Security (RLS) untuk sales (Opsional)
ALTER TABLE sales ENABLE ROW LEVEL SECURITY;

-- Membuat policy agar public bisa Insert
CREATE POLICY "Allow public insert on sales" 
ON sales FOR INSERT 
TO public 
WITH CHECK (true);

-- Membuat policy agar bisa dibaca oleh sistem dashboard
CREATE POLICY "Allow read on sales" 
ON sales FOR SELECT 
TO public 
USING (true);

-- =========================================================================
-- SELESAI
-- =========================================================================

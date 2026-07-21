-- =========================================================================
-- KOTACOFFEE ERP Phase 2: Supervisor & Finance Tables
-- Jalankan di Supabase SQL Editor
-- =========================================================================

-- Bersihkan tabel lama jika ada konflik skema (hati-hati, ini akan mereset data di tabel-tabel ini)
DROP TABLE IF EXISTS cashier_sessions CASCADE;
DROP TABLE IF EXISTS kas_mutations CASCADE;
DROP TABLE IF EXISTS kas_accounts CASCADE;
DROP TABLE IF EXISTS budgets CASCADE;
DROP TABLE IF EXISTS purchase_orders CASCADE;
DROP TABLE IF EXISTS invoices CASCADE;
DROP TABLE IF EXISTS finance_transactions CASCADE;
DROP TABLE IF EXISTS approval_requests CASCADE;
DROP TABLE IF EXISTS complaints CASCADE;
DROP TABLE IF EXISTS maintenance_reports CASCADE;
DROP TABLE IF EXISTS batch_productions CASCADE;
DROP TABLE IF EXISTS recipes CASCADE;
DROP TABLE IF EXISTS daily_checklists CASCADE;
DROP TABLE IF EXISTS inventory CASCADE;

-- ===================== SUPERVISOR TABLES =====================

-- 1. Inventory (Stok & Inventaris Bahan Baku)
CREATE TABLE IF NOT EXISTS inventory (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  category text NOT NULL DEFAULT 'Beans',
  stock numeric NOT NULL DEFAULT 0,
  min_stock numeric NOT NULL DEFAULT 0,
  unit text NOT NULL DEFAULT 'pcs',
  supplier text,
  outlet_id uuid REFERENCES outlets(id),
  last_restock timestamp with time zone,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Daily Checklists
CREATE TABLE IF NOT EXISTS daily_checklists (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  task text NOT NULL,
  type text NOT NULL DEFAULT 'Opening',
  shift text NOT NULL DEFAULT 'Pagi',
  is_completed boolean DEFAULT false,
  completed_by uuid REFERENCES employees(id),
  completed_at timestamp with time zone,
  outlet_id uuid REFERENCES outlets(id),
  checklist_date date NOT NULL DEFAULT CURRENT_DATE,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Recipes (Resep & BoM)
CREATE TABLE IF NOT EXISTS recipes (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  product_name text NOT NULL,
  category text DEFAULT 'Coffee',
  cogs numeric NOT NULL DEFAULT 0,
  price numeric NOT NULL DEFAULT 0,
  outlet_id uuid REFERENCES outlets(id),
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS recipe_ingredients (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  recipe_id uuid REFERENCES recipes(id) ON DELETE CASCADE,
  item_name text NOT NULL,
  quantity numeric NOT NULL DEFAULT 0,
  unit text NOT NULL DEFAULT 'gram',
  cost_per_unit numeric NOT NULL DEFAULT 0
);

-- 4. Batch Productions
CREATE TABLE IF NOT EXISTS batch_productions (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  product_name text NOT NULL,
  batch_qty numeric NOT NULL DEFAULT 0,
  unit text NOT NULL DEFAULT 'liter',
  status text DEFAULT 'In Progress',
  notes text,
  produced_by uuid REFERENCES employees(id),
  outlet_id uuid REFERENCES outlets(id),
  production_date date NOT NULL DEFAULT CURRENT_DATE,
  completed_at timestamp with time zone,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 5. Maintenance Reports
CREATE TABLE IF NOT EXISTS maintenance_reports (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  equipment_name text NOT NULL,
  issue_description text NOT NULL,
  priority text DEFAULT 'Medium',
  status text DEFAULT 'Reported',
  reported_by uuid REFERENCES employees(id),
  resolved_by uuid REFERENCES employees(id),
  outlet_id uuid REFERENCES outlets(id),
  resolved_at timestamp with time zone,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 6. Complaints (Keluhan Pelanggan & Karyawan)
CREATE TABLE IF NOT EXISTS complaints (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  source text NOT NULL DEFAULT 'Customer',
  description text NOT NULL,
  rating integer DEFAULT 0,
  status text DEFAULT 'Pending',
  follow_up_notes text,
  outlet_id uuid REFERENCES outlets(id),
  handled_by uuid REFERENCES employees(id),
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  resolved_at timestamp with time zone
);

-- 7. Approval Requests
CREATE TABLE IF NOT EXISTS approval_requests (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  type text NOT NULL,
  description text NOT NULL,
  requested_by text NOT NULL,
  employee_id uuid REFERENCES employees(id),
  status text DEFAULT 'Pending',
  approved_by uuid REFERENCES employees(id),
  outlet_id uuid REFERENCES outlets(id),
  notes text,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  resolved_at timestamp with time zone
);

-- ===================== FINANCE TABLES =====================

-- 8. Finance Transactions (Pemasukan & Pengeluaran)
CREATE TABLE IF NOT EXISTS finance_transactions (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  type text NOT NULL,
  category text NOT NULL,
  amount numeric NOT NULL DEFAULT 0,
  description text,
  outlet_id uuid REFERENCES outlets(id),
  reference_number text,
  status text DEFAULT 'Lunas',
  transaction_date date NOT NULL DEFAULT CURRENT_DATE,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 9. Invoices
CREATE TABLE IF NOT EXISTS invoices (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  invoice_number text NOT NULL UNIQUE,
  client_name text NOT NULL,
  client_email text,
  amount numeric NOT NULL DEFAULT 0,
  status text DEFAULT 'Draft',
  due_date date,
  notes text,
  items jsonb,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  paid_at timestamp with time zone
);

-- 10. Purchase Orders
CREATE TABLE IF NOT EXISTS purchase_orders (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  po_number text NOT NULL UNIQUE,
  supplier text NOT NULL,
  item_description text NOT NULL,
  amount numeric NOT NULL DEFAULT 0,
  status text DEFAULT 'Pending',
  approved_by uuid REFERENCES employees(id),
  outlet_id uuid REFERENCES outlets(id),
  order_date date NOT NULL DEFAULT CURRENT_DATE,
  received_date date,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 11. Budgets
CREATE TABLE IF NOT EXISTS budgets (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  outlet_id uuid REFERENCES outlets(id),
  period_month integer NOT NULL,
  period_year integer NOT NULL,
  total_budget numeric NOT NULL DEFAULT 0,
  used_budget numeric NOT NULL DEFAULT 0,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(outlet_id, period_month, period_year)
);

-- 12. Kas Accounts
CREATE TABLE IF NOT EXISTS kas_accounts (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  type text NOT NULL DEFAULT 'Kas Besar',
  balance numeric NOT NULL DEFAULT 0,
  outlet_id uuid REFERENCES outlets(id),
  last_mutation_date date DEFAULT CURRENT_DATE,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 13. Kas Mutations
CREATE TABLE IF NOT EXISTS kas_mutations (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  kas_account_id uuid REFERENCES kas_accounts(id),
  type text NOT NULL,
  amount numeric NOT NULL DEFAULT 0,
  description text,
  reference_id text,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 14. Cashier Sessions
CREATE TABLE IF NOT EXISTS cashier_sessions (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  employee_id uuid REFERENCES employees(id) NOT NULL,
  outlet_id uuid REFERENCES outlets(id) NOT NULL,
  shift_type text NOT NULL DEFAULT 'Pagi',
  status text DEFAULT 'active',
  opened_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  closed_at timestamp with time zone,
  opening_cash numeric DEFAULT 0,
  closing_cash numeric DEFAULT 0,
  notes text
);

-- =========================================================================
-- RLS POLICIES
-- =========================================================================

ALTER TABLE inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_checklists ENABLE ROW LEVEL SECURITY;
ALTER TABLE recipes ENABLE ROW LEVEL SECURITY;
ALTER TABLE batch_productions ENABLE ROW LEVEL SECURITY;
ALTER TABLE maintenance_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE complaints ENABLE ROW LEVEL SECURITY;
ALTER TABLE approval_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE finance_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE purchase_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE budgets ENABLE ROW LEVEL SECURITY;
ALTER TABLE kas_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE kas_mutations ENABLE ROW LEVEL SECURITY;
ALTER TABLE cashier_sessions ENABLE ROW LEVEL SECURITY;

DO $$
DECLARE
  tbl text;
BEGIN
  FOR tbl IN SELECT unnest(ARRAY[
    'inventory', 'daily_checklists', 'recipes', 'batch_productions',
    'maintenance_reports', 'complaints', 'approval_requests',
    'finance_transactions', 'invoices', 'purchase_orders',
    'budgets', 'kas_accounts', 'kas_mutations', 'cashier_sessions'
  ])
  LOOP
    EXECUTE format('CREATE POLICY "Allow public select on %I" ON %I FOR SELECT TO public USING (true)', tbl, tbl);
    EXECUTE format('CREATE POLICY "Allow public insert on %I" ON %I FOR INSERT TO public WITH CHECK (true)', tbl, tbl);
    EXECUTE format('CREATE POLICY "Allow public update on %I" ON %I FOR UPDATE TO public USING (true) WITH CHECK (true)', tbl, tbl);
    EXECUTE format('CREATE POLICY "Allow public delete on %I" ON %I FOR DELETE TO public USING (true)', tbl, tbl);
  END LOOP;
END $$;

-- =========================================================================
-- SEED DATA
-- =========================================================================

DO $$
DECLARE
  outlet1_id uuid;
  outlet2_id uuid;
  outlet3_id uuid;
BEGIN
  SELECT id INTO outlet1_id FROM outlets WHERE name LIKE '%Pusat%' LIMIT 1;
  SELECT id INTO outlet2_id FROM outlets WHERE name LIKE '%Selatan%' LIMIT 1;
  SELECT id INTO outlet3_id FROM outlets WHERE name LIKE '%Utara%' LIMIT 1;

  INSERT INTO inventory (name, category, stock, min_stock, unit, supplier, outlet_id) VALUES
    ('Arabica Beans', 'Beans', 12, 5, 'kg', 'PT Biji Kopi Nusantara', outlet1_id),
    ('Fresh Milk', 'Milk', 3, 10, 'liter', 'Toko Susu Sapi Murni', outlet1_id),
    ('Cup 16oz', 'Packaging', 500, 1000, 'pcs', 'Toko Cup', outlet1_id),
    ('Vanilla Syrup', 'Syrup', 8, 5, 'btl', 'Monin', outlet1_id),
    ('Brown Sugar', 'Other', 6, 3, 'kg', 'PT Gula Nusantara', outlet1_id),
    ('Robusta Beans', 'Beans', 8, 5, 'kg', 'PT Biji Kopi Nusantara', outlet2_id),
    ('Oat Milk', 'Milk', 2, 5, 'liter', 'Oatly Distributor', outlet2_id),
    ('Cup 12oz', 'Packaging', 800, 500, 'pcs', 'Toko Cup', outlet2_id);

  INSERT INTO daily_checklists (task, type, shift, is_completed, outlet_id, checklist_date) VALUES
    ('Mesin Espresso Dinyalakan & Flushing', 'Opening', 'Pagi', true, outlet1_id, CURRENT_DATE),
    ('Kalibrasi Grinder & Cek Rasa', 'Opening', 'Pagi', true, outlet1_id, CURRENT_DATE),
    ('Cek Koneksi Internet POS', 'Opening', 'Pagi', true, outlet1_id, CURRENT_DATE),
    ('Bersihkan Area Meja Pelanggan', 'Cleaning', 'Pagi', false, outlet1_id, CURRENT_DATE),
    ('Cuci Portafilter & Blind Insert', 'Closing', 'Pagi', false, outlet1_id, CURRENT_DATE),
    ('Hitung Uang Kas Laci (Settlement)', 'Closing', 'Pagi', false, outlet1_id, CURRENT_DATE);

  INSERT INTO recipes (name, category, cogs, price, ingredients, outlet_id) VALUES
    ('Coffee Aren Latte', 'Coffee', 8500, 22000, '18g Espresso, 150ml Milk, 20ml Aren', outlet1_id),
    ('Ice Cappuccino', 'Coffee', 7000, 18000, '18g Espresso, 120ml Milk, 30ml Foam', outlet1_id),
    ('Matcha Latte', 'Non-Coffee', 9000, 25000, '5g Matcha, 200ml Milk, 10ml Syrup', outlet1_id),
    ('Cold Brew', 'Coffee', 6000, 28000, '30g Coffee Beans, 350ml Water (12hr)', outlet1_id);

  INSERT INTO complaints (source, description, rating, status, outlet_id) VALUES
    ('Customer', 'Es kopi susu terlalu manis', 2, 'Follow Up', outlet1_id),
    ('Karyawan', 'AC di area bar kurang dingin', 0, 'Pending', outlet1_id),
    ('Customer', 'Pelayanan lambat saat jam sibuk', 3, 'Pending', outlet2_id);

  INSERT INTO approval_requests (type, description, requested_by, status, outlet_id) VALUES
    ('Request Barang', 'Gelas 16oz (2000pcs) habis', 'Ahmad (Barista)', 'Pending', outlet1_id),
    ('Waste', 'Susu basi 2 Liter', 'Siti (Kasir)', 'Pending', outlet1_id),
    ('Cuti', 'Acara keluarga (2 hari)', 'Budi (Leader)', 'Pending', outlet1_id);

  INSERT INTO finance_transactions (type, category, amount, description, outlet_id, status, transaction_date) VALUES
    ('income', 'QRIS', 4500000, 'Pembayaran QRIS hari ini', outlet1_id, 'Lunas', CURRENT_DATE),
    ('income', 'Cash', 1200000, 'Pembayaran tunai hari ini', outlet1_id, 'Lunas', CURRENT_DATE),
    ('income', 'GoFood', 850000, 'Penjualan GoFood', outlet1_id, 'Lunas', CURRENT_DATE),
    ('income', 'GrabFood', 650000, 'Penjualan GrabFood', outlet2_id, 'Lunas', CURRENT_DATE),
    ('expense', 'Pembelian Bahan Baku', 12000000, 'Restock bahan baku bulanan', outlet1_id, 'Lunas', CURRENT_DATE - INTERVAL '2 days'),
    ('expense', 'Listrik', 2500000, 'Listrik Cabang 1 bulan ini', outlet1_id, 'Lunas', CURRENT_DATE - INTERVAL '7 days'),
    ('expense', 'Internet & Telp', 850000, 'Internet dan telepon', outlet1_id, 'Lunas', CURRENT_DATE - INTERVAL '5 days'),
    ('expense', 'Gaji Karyawan', 28000000, 'Gaji karyawan bulan ini', outlet1_id, 'Pending', CURRENT_DATE + INTERVAL '11 days');

  INSERT INTO invoices (invoice_number, client_name, client_email, amount, status, due_date, items) VALUES
    ('INV-2026-001', 'PT. Maju Mundur', 'finance@majumundur.co.id', 12500000, 'Paid', CURRENT_DATE - INTERVAL '5 days', '[{"name":"Catering Coffee","qty":50,"price":250000,"subtotal":12500000}]'::jsonb),
    ('INV-2026-002', 'CV. Sukses Selalu', 'cv.sukses@email.com', 8400000, 'Unpaid', CURRENT_DATE + INTERVAL '10 days', '[{"name":"Event Coffee Package","qty":20,"price":420000,"subtotal":8400000}]'::jsonb),
    ('INV-2026-003', 'Budi Santoso', 'budi@email.com', 2100000, 'Draft', CURRENT_DATE + INTERVAL '30 days', '[{"name":"Weekly Office Coffee","qty":7,"price":300000,"subtotal":2100000}]'::jsonb);

  INSERT INTO purchase_orders (po_number, supplier, item_description, amount, status, outlet_id) VALUES
    ('PO-2026-001', 'PT Biji Kopi Nusantara', 'Arabica Beans 10kg', 2500000, 'Approved', outlet1_id),
    ('PO-2026-002', 'Toko Cup', 'Cup 16oz (5000pcs)', 1250000, 'Pending', outlet1_id),
    ('PO-2026-003', 'Monin', 'Vanilla Syrup 12btl', 1800000, 'Pending', outlet2_id);

  INSERT INTO budgets (outlet_id, period_month, period_year, total_budget, used_budget) VALUES
    (outlet1_id, 7, 2026, 20000000, 12000000),
    (outlet2_id, 7, 2026, 15000000, 18000000),
    (outlet3_id, 7, 2026, 12000000, 5000000);

  INSERT INTO kas_accounts (name, type, balance, outlet_id) VALUES
    ('Kas Besar', 'Kas Besar', 150000000, NULL),
    ('Kas Kecil (Cabang 1)', 'Kas Kecil', 2500000, outlet1_id),
    ('Kas Kecil (Cabang 2)', 'Kas Kecil', 1800000, outlet2_id),
    ('Kas Kecil (Cabang 3)', 'Kas Kecil', 900000, outlet3_id);

END $$;

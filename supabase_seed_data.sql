-- =============================================
-- SEED DATA: Roles & Outlets
-- Jalankan di Supabase SQL Editor
-- =============================================

-- 1) Seed Roles (jabatan)
INSERT INTO roles (name) VALUES 
  ('Owner'),
  ('HRD'),
  ('Finance'),
  ('Supervisor'),
  ('Leader'),
  ('Barista'),
  ('Kasir')
ON CONFLICT DO NOTHING;

-- 2) Seed Outlets (cabang)
INSERT INTO outlets (name, address) VALUES 
  ('Cabang 1 - Pusat', 'Jl. Utama No. 1'),
  ('Cabang 2 - Selatan', 'Jl. Selatan No. 2'),
  ('Cabang 3 - Utara', 'Jl. Utara No. 3')
ON CONFLICT DO NOTHING;

-- 3) Tambahkan kolom image_url ke tabel products (jika belum ada)
ALTER TABLE products ADD COLUMN IF NOT EXISTS image_url TEXT;

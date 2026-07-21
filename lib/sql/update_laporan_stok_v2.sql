-- Update laporan_stok_harian table
ALTER TABLE laporan_stok_harian 
ADD COLUMN IF NOT EXISTS tipe_laporan TEXT DEFAULT 'Laporan Sisa Stok Bahan',
ADD COLUMN IF NOT EXISTS nama_bahan TEXT,
ADD COLUMN IF NOT EXISTS kategori TEXT,
ADD COLUMN IF NOT EXISTS jumlah TEXT,
ADD COLUMN IF NOT EXISTS alasan TEXT,
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'Dilaporkan';

-- Update existing records to have a default type if needed
UPDATE laporan_stok_harian SET tipe_laporan = 'Laporan Sisa Stok Bahan' WHERE tipe_laporan IS NULL;

-- Create the table for daily stock reports
CREATE TABLE IF NOT EXISTS laporan_stok_harian (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    tanggal DATE NOT NULL,
    cabang TEXT NOT NULL,
    karyawan TEXT NOT NULL,
    susu_diamond NUMERIC DEFAULT 0,
    susu_greenfield NUMERIC DEFAULT 0,
    bubuk_coklat NUMERIC DEFAULT 0,
    bubuk_matcha NUMERIC DEFAULT 0,
    bubuk_redvelvet NUMERIC DEFAULT 0,
    bubuk_taro NUMERIC DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE laporan_stok_harian ENABLE ROW LEVEL SECURITY;

-- Create policy to allow anyone to read (or restrict to authenticated if needed)
CREATE POLICY "Allow public read access" ON laporan_stok_harian FOR SELECT USING (true);

-- Create policy to allow service role to insert (for the webhook)
CREATE POLICY "Allow service role insert" ON laporan_stok_harian FOR INSERT WITH CHECK (true);

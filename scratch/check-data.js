const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkData() {
  const { data, error } = await supabase
    .from('laporan_stok_harian')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(5);

  if (error) {
    console.error('Error:', error);
  } else {
    console.log('Latest 5 Reports:');
    console.table(data.map(d => ({
      id: d.id.substring(0, 8),
      tanggal: d.tanggal,
      karyawan: d.karyawan,
      cabang: d.cabang,
      tipe: d.tipe_laporan
    })));
  }
}

checkData();

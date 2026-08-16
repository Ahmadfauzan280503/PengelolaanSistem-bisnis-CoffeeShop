import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// We use service role key for API if available to bypass RLS, 
// otherwise anon key is used as fallback.
const getSupabase = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
  return createClient(supabaseUrl, supabaseKey);
};

export async function POST(request: Request) {
  try {
    const supabase = getSupabase();
    const body = await request.json();
    console.log("Received Google Form data:", body);

    const { cabang, karyawan, tanggal, tipe_laporan, data } = body;

    if (!cabang || !tipe_laporan) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Map incoming data to table columns
    const record = {
      cabang,
      karyawan: karyawan || "Google Form User",
      tanggal: tanggal || new Date().toISOString().split("T")[0],
      tipe_laporan,
      // Stock fields
      susu_diamond: data?.susu_diamond || 0,
      susu_greenfield: data?.susu_greenfield || 0,
      bubuk_coklat: data?.bubuk_coklat || 0,
      bubuk_matcha: data?.bubuk_matcha || 0,
      bubuk_redvelvet: data?.bubuk_redvelvet || 0,
      bubuk_taro: data?.bubuk_taro || 0,
      // Report fields (for damaged goods/masuk)
      nama_bahan: data?.nama_bahan || null,
      kategori: data?.kategori || null,
      jumlah: data?.jumlah || null,
      alasan: data?.alasan || null,
      status: data?.status || "Dilaporkan"
    };

    const { data: insertedData, error } = await supabase
      .from("laporan_stok_harian")
      .insert([record])
      .select();

    if (error) {
      console.error("Supabase error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, data: insertedData });
  } catch (error: any) {
    console.error("Webhook error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

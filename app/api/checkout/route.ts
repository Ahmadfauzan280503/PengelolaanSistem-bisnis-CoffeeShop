import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import * as yup from "yup";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

const supabase = createClient(supabaseUrl, supabaseKey);

// Define schema validation for incoming checkout requests to secure inputs
const checkoutSchema = yup.object().shape({
  customer_name: yup.string().min(2).max(100).required("Nama wajib diisi"),
  customer_email: yup.string().email("Format email salah").optional(),
  table_number: yup.string().max(50).optional(),
  order_mode: yup.string().oneOf(["dinein", "takeaway"]).optional(),
  cabang: yup.string().required("Cabang wajib dipilih"),
  items: yup.array().of(
    yup.object().shape({
      name: yup.string().required(),
      quantity: yup.number().integer().positive().required(),
      price: yup.number().positive().required(),
      subtotal: yup.number().positive().required(),
    })
  ).required("Items wajib diisi"),
  subtotal: yup.number().required(),
  tax: yup.number().required(),
  service_charge: yup.number().required(),
  total_price: yup.number().required(),
  payment_method: yup.string().required(),
});

export async function POST(request: Request) {
  try {
    const rawBody = await request.json();
    
    // 1. Validate inputs via Yup schema
    const validatedBody = await checkoutSchema.validate(rawBody, { abortEarly: false });
    
    // 2. Sanitize user inputs for XSS prevention
    const sanitizedName = validatedBody.customer_name.replace(/<[^>]*>/g, "").trim();
    const sanitizedEmail = validatedBody.customer_email ? validatedBody.customer_email.trim() : "";
    const sanitizedTable = validatedBody.table_number ? validatedBody.table_number.replace(/<[^>]*>/g, "").trim() : "Meja 1";

    const orderNumber = "ORD-" + Math.floor(100000 + Math.random() * 900000);
    const dateToday = new Date().toISOString().split("T")[0];

    // 3. Create Cashier Order record
    const cashierOrderRecord = {
      order_number: orderNumber,
      customer_name: sanitizedName,
      customer_email: sanitizedEmail,
      table_number: sanitizedTable,
      order_mode: validatedBody.order_mode || "dinein",
      cabang: validatedBody.cabang,
      items: validatedBody.items,
      subtotal: validatedBody.subtotal,
      tax: validatedBody.tax,
      service_charge: validatedBody.service_charge,
      total_price: validatedBody.total_price,
      payment_method: "QRIS",
      payment_status: "PAID", // Customer simulated QRIS success
      order_status: "QUEUED", // New queue item for the kitchen/cashier
    };

    // Insert order in Supabase
    const { data: insertedOrder, error: orderError } = await supabase
      .from("cashier_orders")
      .insert([cashierOrderRecord])
      .select()
      .single();

    if (orderError) {
      console.error("Database insert error (cashier_orders):", orderError);
      return NextResponse.json({ success: false, error: orderError.message }, { status: 500 });
    }

    // 4. AUTOMATIC DATA SYNC WITH ADMIN DASHBOARD (Insert to sales table!)
    // Admin dashboard payments/index.tsx queries "sales" table and maps columns like qris_kotacoffee
    const salesRecord = {
      tanggal: dateToday,
      cabang: validatedBody.cabang,
      kasir: "Digital Cashier QRIS (" + sanitizedName + ")",
      cash: 0,
      gojek_kotacoffee: 0,
      grab_kotacoffee: 0,
      shopeefood_kotacoffee: 0,
      qris_kotacoffee: validatedBody.total_price, // Sync QRIS total
      pengeluaran: 0,
      pendapatan_kotor: validatedBody.total_price,
      kas_bersih: validatedBody.total_price,
    };

    const { error: salesError } = await supabase
      .from("sales")
      .insert([salesRecord]);

    if (salesError) {
      console.error("Database insert warning (sales sync failed):", salesError);
      // We don't fail the order if sales sync fails, but we log it
    }

    // 5. Trigger email sending in background (API request to sending handler)
    if (sanitizedEmail) {
      try {
        const protocol = request.url.startsWith("https") ? "https" : "http";
        const host = request.headers.get("host");
        const sendUrl = `${protocol}://${host}/api/send-receipt`;
        
        // Non-blocking call to dispatch email
        fetch(sendUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: sanitizedEmail,
            orderId: insertedOrder.id,
            orderNumber: orderNumber,
            customerName: sanitizedName,
            tableNumber: sanitizedTable,
            branch: validatedBody.cabang,
            items: validatedBody.items,
            subtotal: validatedBody.subtotal,
            tax: validatedBody.tax,
            service: validatedBody.service_charge,
            total: validatedBody.total_price,
          })
        }).catch(err => console.error("Email fetch dispatch background error:", err));
      } catch (err) {
        console.error("Email trigger error:", err);
      }
    }

    return NextResponse.json({ 
      success: true, 
      order_id: insertedOrder.order_number, 
      id: insertedOrder.id 
    });

  } catch (error: any) {
    if (error.name === "ValidationError") {
      return NextResponse.json({ success: false, error: "Validasi input gagal", details: error.errors }, { status: 400 });
    }
    console.error("Checkout process API error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

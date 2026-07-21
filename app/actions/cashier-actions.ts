"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

// ==========================================
// CASHIER SESSION (Koneksi HRD → Cashier)
// ==========================================
export async function getCashierSession(branchSlug: string) {
  const supabase = await createClient();
  
  // Map slug to outlet name
  const branchMap: Record<string, string> = {
    "cabang-1": "Cabang 1 - Pusat",
    "cabang-2": "Cabang 2 - Selatan",
    "cabang-3": "Cabang 3 - Utara",
  };
  const branchName = branchMap[branchSlug] || branchSlug;

  // Find outlet
  const { data: outlet } = await supabase
    .from("outlets")
    .select("id, name")
    .ilike("name", `%${branchName.split(" - ")[0]}%`)
    .limit(1)
    .single();

  if (!outlet) {
    return { cashierName: "Kasir", branchName: branchName, shiftType: "Pagi", outletId: null };
  }

  // Find active cashier session
  const { data: session } = await supabase
    .from("cashier_sessions")
    .select("*, employees(id, name, photo_url)")
    .eq("outlet_id", outlet.id)
    .eq("status", "active")
    .limit(1)
    .single();

  if (session && session.employees) {
    return {
      cashierName: (session.employees as any).name || "Kasir",
      cashierPhoto: (session.employees as any).photo_url || null,
      branchName: outlet.name,
      shiftType: session.shift_type,
      outletId: outlet.id,
      sessionId: session.id,
    };
  }

  // Fallback: Find any employee with role "Kasir" at this outlet
  const { data: kasirRole } = await supabase
    .from("roles")
    .select("id")
    .eq("name", "Kasir")
    .single();

  if (kasirRole) {
    const { data: kasir } = await supabase
      .from("employees")
      .select("id, name, photo_url")
      .eq("outlet_id", outlet.id)
      .eq("role_id", kasirRole.id)
      .eq("status", "Active")
      .limit(1)
      .single();

    if (kasir) {
      return {
        cashierName: kasir.name || "Kasir",
        cashierPhoto: kasir.photo_url || null,
        branchName: outlet.name,
        shiftType: "Pagi",
        outletId: outlet.id,
        sessionId: null,
      };
    }
  }

  // Final fallback: Find any active employee at this outlet
  const { data: anyEmp } = await supabase
    .from("employees")
    .select("id, name, photo_url")
    .eq("outlet_id", outlet.id)
    .eq("status", "Active")
    .limit(1)
    .single();

  return {
    cashierName: anyEmp?.name || "Kasir",
    cashierPhoto: anyEmp?.photo_url || null,
    branchName: outlet.name,
    shiftType: "Pagi",
    outletId: outlet.id,
    sessionId: null,
  };
}

// ==========================================
// ORDER HISTORY
// ==========================================
export async function getOrderHistory(branchSlug: string) {
  const supabase = await createClient();
  
  const branchMap: Record<string, string> = {
    "cabang-1": "Cabang 1",
    "cabang-2": "Cabang 2",
    "cabang-3": "Cabang 3",
  };
  const branchKey = branchMap[branchSlug] || branchSlug;

  const { data, error } = await supabase
    .from("cashier_orders")
    .select("*")
    .ilike("cabang", `%${branchKey}%`)
    .order("created_at", { ascending: false })
    .limit(50);

  if (error) throw new Error(error.message);
  return data || [];
}

// ==========================================
// HOLD ORDER
// ==========================================
export async function holdOrder(orderData: any) {
  const supabase = await createClient();
  const orderNumber = "HOLD-" + Math.floor(100000 + Math.random() * 900000);
  
  const { data, error } = await supabase.from("cashier_orders").insert([{
    order_number: orderNumber,
    customer_name: orderData.customer_name || "Walk-in",
    table_number: orderData.table_number || "Meja 1",
    cabang: orderData.cabang,
    items: orderData.items,
    subtotal: orderData.subtotal,
    tax: orderData.tax,
    service_charge: 0,
    total_price: orderData.total_price,
    payment_method: "Pending",
    payment_status: "HOLD",
    order_status: "HOLD",
  }]).select();

  if (error) throw new Error(error.message);
  return data;
}

// ==========================================
// GET HELD ORDERS
// ==========================================
export async function getHeldOrders(branchSlug: string) {
  const supabase = await createClient();
  
  const branchMap: Record<string, string> = {
    "cabang-1": "Cabang 1",
    "cabang-2": "Cabang 2",
    "cabang-3": "Cabang 3",
  };
  const branchKey = branchMap[branchSlug] || branchSlug;

  const { data, error } = await supabase
    .from("cashier_orders")
    .select("*")
    .ilike("cabang", `%${branchKey}%`)
    .eq("order_status", "HOLD")
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);
  return data || [];
}

// ==========================================
// PROCESS PAYMENT
// ==========================================
export async function processPayment(orderData: any) {
  const supabase = await createClient();
  const orderNumber = "ORD-" + Math.floor(100000 + Math.random() * 900000);
  const dateToday = new Date().toISOString().split("T")[0];

  const { data, error } = await supabase.from("cashier_orders").insert([{
    order_number: orderNumber,
    customer_name: orderData.customer_name || "Walk-in",
    table_number: orderData.table_number || "Meja 1",
    order_mode: orderData.order_mode || "dinein",
    cabang: orderData.cabang,
    items: orderData.items,
    subtotal: orderData.subtotal,
    tax: orderData.tax,
    service_charge: 0,
    total_price: orderData.total_price,
    payment_method: orderData.payment_method || "Cash",
    payment_status: "PAID",
    order_status: "COMPLETED",
  }]).select().single();

  if (error) throw new Error(error.message);

  try {
    await supabase.from("sales").insert([{
      tanggal: dateToday,
      cabang: orderData.cabang,
      kasir: orderData.cashier_name || "Kasir",
      cash: orderData.payment_method === "Cash" ? orderData.total_price : 0,
      qris_kotacoffee: orderData.payment_method === "QRIS" ? orderData.total_price : 0,
      gojek_kotacoffee: 0,
      grab_kotacoffee: 0,
      shopeefood_kotacoffee: 0,
      pengeluaran: 0,
      pendapatan_kotor: orderData.total_price,
      kas_bersih: orderData.total_price,
    }]);
  } catch (e) {
    // Ignore error, just sync
  }

  revalidatePath("/cashier");
  return data;
}

// ==========================================
// UPDATE HELD ORDER STATUS
// ==========================================
export async function resumeHeldOrder(orderId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("cashier_orders")
    .select("*")
    .eq("id", orderId)
    .single();
  if (error) throw new Error(error.message);
  return data;
}

export async function deleteHeldOrder(orderId: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("cashier_orders").delete().eq("id", orderId);
  if (error) throw new Error(error.message);
  return true;
}

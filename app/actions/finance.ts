"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";
import { requireRole } from "@/actions/auth.action";
import { sanitizeObject } from "@/utils/security";

// ==========================================
// FINANCE OVERVIEW (Aggregated Stats)
// ==========================================
export async function getFinanceOverview() {
  const supabase = await createClient();
  const today = new Date().toISOString().split("T")[0];
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split("T")[0];
  const yearStart = new Date(now.getFullYear(), 0, 1).toISOString().split("T")[0];

  // Today's income
  const { data: todayIncome } = await supabase
    .from("finance_transactions")
    .select("amount")
    .eq("type", "income")
    .eq("transaction_date", today);
  const incomeToday = (todayIncome || []).reduce((s: number, t: any) => s + Number(t.amount), 0);

  // Today's expenses
  const { data: todayExpense } = await supabase
    .from("finance_transactions")
    .select("amount")
    .eq("type", "expense")
    .eq("transaction_date", today);
  const expenseToday = (todayExpense || []).reduce((s: number, t: any) => s + Number(t.amount), 0);

  // Monthly income
  const { data: monthIncome } = await supabase
    .from("finance_transactions")
    .select("amount")
    .eq("type", "income")
    .gte("transaction_date", monthStart)
    .lte("transaction_date", today);
  const incomeMonth = (monthIncome || []).reduce((s: number, t: any) => s + Number(t.amount), 0);

  // Monthly expense
  const { data: monthExpense } = await supabase
    .from("finance_transactions")
    .select("amount")
    .eq("type", "expense")
    .gte("transaction_date", monthStart)
    .lte("transaction_date", today);
  const expenseMonth = (monthExpense || []).reduce((s: number, t: any) => s + Number(t.amount), 0);

  // Yearly income
  const { data: yearIncome } = await supabase
    .from("finance_transactions")
    .select("amount")
    .eq("type", "income")
    .gte("transaction_date", yearStart);
  const incomeYear = (yearIncome || []).reduce((s: number, t: any) => s + Number(t.amount), 0);

  // Piutang (unpaid invoices)
  const { data: unpaidInvoices } = await supabase
    .from("invoices")
    .select("amount")
    .in("status", ["Unpaid", "Sent", "Overdue"]);
  const piutang = (unpaidInvoices || []).reduce((s: number, inv: any) => s + Number(inv.amount), 0);

  // Hutang (pending expenses)
  const { data: pendingExpenses } = await supabase
    .from("finance_transactions")
    .select("amount")
    .eq("type", "expense")
    .eq("status", "Pending");
  const hutang = (pendingExpenses || []).reduce((s: number, t: any) => s + Number(t.amount), 0);

  return {
    incomeToday,
    expenseToday,
    incomeMonth,
    expenseMonth,
    incomeYear,
    labaBersih: incomeMonth - expenseMonth,
    cashFlow: incomeMonth - expenseMonth,
    piutang,
    hutang,
  };
}

// ==========================================
// TRANSACTIONS (Pemasukan & Pengeluaran)
// ==========================================
export async function getTransactions(type?: string) {
  const supabase = await createClient();
  let query = supabase.from("finance_transactions").select("*, outlets(id, name)").order("transaction_date", { ascending: false });
  if (type) query = query.eq("type", type);
  const { data, error } = await query;
  if (error) throw new Error(error.message);
  return data || [];
}

export async function addTransaction(formData: any) {
  await requireRole(["Owner", "Finance"]);
  const cleaned = sanitizeObject(formData);
  const supabase = await createClient();
  const { data, error } = await supabase.from("finance_transactions").insert([{
    type: cleaned.type,
    category: cleaned.category,
    amount: Number(cleaned.amount) || 0,
    description: cleaned.description || null,
    outlet_id: cleaned.outlet_id || null,
    status: cleaned.status || "Lunas",
    transaction_date: cleaned.transaction_date || new Date().toISOString().split("T")[0],
  }]).select();
  if (error) throw new Error(error.message);
  revalidatePath("/finance");
  return data;
}

export async function updateTransaction(id: string, formData: any) {
  await requireRole(["Owner", "Finance"]);
  const cleaned = sanitizeObject(formData);
  const supabase = await createClient();
  const { data, error } = await supabase.from("finance_transactions").update({
    type: cleaned.type,
    category: cleaned.category,
    amount: Number(cleaned.amount) || 0,
    description: cleaned.description,
    outlet_id: cleaned.outlet_id || null,
    status: cleaned.status,
    transaction_date: cleaned.transaction_date,
  }).eq("id", id).select();
  if (error) throw new Error(error.message);
  revalidatePath("/finance");
  return data;
}

export async function deleteTransaction(id: string) {
  await requireRole(["Owner", "Finance"]);
  const supabase = await createClient();
  const { error } = await supabase.from("finance_transactions").delete().eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/finance");
  return true;
}

export async function syncCashierToFinance() {
  const supabase = await createClient();
  const today = new Date().toISOString().split("T")[0];
  
  // Get all orders from today
  const { data: orders, error } = await supabase
    .from("cashier_orders")
    .select("*")
    .gte("created_at", today + "T00:00:00")
    .lte("created_at", today + "T23:59:59");
    
  if (error) throw new Error(error.message);
  if (!orders || orders.length === 0) return { message: "Tidak ada penjualan kasir hari ini." };
  
  // Group by branch
  const grouped: Record<string, number> = {};
  orders.forEach((o: any) => {
    const branch = o.cabang || "Cabang Pusat";
    grouped[branch] = (grouped[branch] || 0) + Number(o.total_price || 0);
  });
  
  // Insert or Update finance_transactions for each branch today
  for (const [branch, total] of Object.entries(grouped)) {
    const desc = `Penjualan Kasir - ${branch} (${today})`;
    // Check if already exists
    const { data: existing } = await supabase.from("finance_transactions")
      .select("id").eq("description", desc).eq("transaction_date", today).single();
      
    if (existing) {
      await supabase.from("finance_transactions").update({ amount: total }).eq("id", existing.id);
    } else {
      await supabase.from("finance_transactions").insert([{
        type: "income",
        category: "Penjualan Outlet",
        amount: total,
        description: desc,
        status: "Lunas",
        transaction_date: today
      }]);
    }
  }
  revalidatePath("/finance");
  return { message: "Sinkronisasi penjualan kasir berhasil!" };
}

export async function payEmployees() {
  const supabase = await createClient();
  const today = new Date().toISOString().split("T")[0];
  const thisMonth = today.slice(0, 7); // YYYY-MM
  
  // Get all active employees
  const { data: employees, error: empErr } = await supabase.from("employees").select("id, name, role_id, roles(role_name)").eq("status", "Active");
  if (empErr) throw new Error(empErr.message);
  
  let totalPaid = 0;
  let count = 0;
  
  for (const emp of (employees || [])) {
    const roleObj = Array.isArray(emp.roles) ? emp.roles[0] : emp.roles;
    const role = (roleObj as any)?.role_name || "Staff";
    // Define salary based on role
    let salary = 1000000;
    if (role.toLowerCase().includes("kasir")) salary = 1200000;
    if (role.toLowerCase().includes("barista")) salary = 1500000;
    if (role.toLowerCase().includes("supervisor")) salary = 2500000;
    
    const desc = `Gaji Bulanan - ${emp.name} (${role}) - ${thisMonth}`;
    
    // Check if already paid this month
    const { data: existing } = await supabase.from("finance_transactions")
      .select("id").eq("description", desc).single();
      
    if (!existing) {
      await supabase.from("finance_transactions").insert([{
        type: "expense",
        category: "Gaji Karyawan",
        amount: salary,
        description: desc,
        status: "Lunas",
        transaction_date: today
      }]);
      totalPaid += salary;
      count++;
    }
  }
  
  revalidatePath("/finance");
  return { message: `Berhasil membayar ${count} karyawan. Total: Rp ${totalPaid.toLocaleString('id-ID')}` };
}

// ==========================================
// INVOICES
// ==========================================
export async function getInvoices() {
  const supabase = await createClient();
  const { data, error } = await supabase.from("invoices").select("*").order("created_at", { ascending: false });
  if (error) throw new Error(error.message);
  return data || [];
}

export async function addInvoice(formData: any) {
  const supabase = await createClient();
  const invoiceNumber = "INV-" + new Date().getFullYear() + "-" + String(Math.floor(Math.random() * 9000) + 1000);
  const { data, error } = await supabase.from("invoices").insert([{
    invoice_number: invoiceNumber,
    client_name: formData.client_name,
    client_email: formData.client_email || null,
    amount: Number(formData.amount) || 0,
    status: formData.status || "Draft",
    due_date: formData.due_date || null,
    notes: formData.notes || null,
    items: formData.items || null,
  }]).select();
  if (error) throw new Error(error.message);
  revalidatePath("/finance");
  return data;
}

export async function updateInvoiceStatus(id: string, status: string) {
  const supabase = await createClient();
  const updateData: any = { status };
  if (status === "Paid") updateData.paid_at = new Date().toISOString();
  const { data, error } = await supabase.from("invoices").update(updateData).eq("id", id).select();
  if (error) throw new Error(error.message);
  revalidatePath("/finance");
  return data;
}

export async function deleteInvoice(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("invoices").delete().eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/finance");
  return true;
}

// ==========================================
// PURCHASE ORDERS
// ==========================================
export async function getPurchaseOrders() {
  const supabase = await createClient();
  const { data, error } = await supabase.from("purchase_orders").select("*, outlets(id, name)").order("created_at", { ascending: false });
  if (error) throw new Error(error.message);
  return data || [];
}

export async function addPurchaseOrder(formData: any) {
  const supabase = await createClient();
  const poNumber = "PO-" + new Date().getFullYear() + "-" + String(Math.floor(Math.random() * 9000) + 1000);
  const { data, error } = await supabase.from("purchase_orders").insert([{
    po_number: poNumber,
    supplier: formData.supplier,
    item_description: formData.item_description,
    amount: Number(formData.amount) || 0,
    status: "Pending",
    outlet_id: formData.outlet_id || null,
  }]).select();
  if (error) throw new Error(error.message);
  revalidatePath("/finance");
  return data;
}

export async function updatePOStatus(id: string, status: string) {
  const supabase = await createClient();
  const updateData: any = { status };
  if (status === "Received") updateData.received_date = new Date().toISOString().split("T")[0];
  const { data, error } = await supabase.from("purchase_orders").update(updateData).eq("id", id).select();
  if (error) throw new Error(error.message);
  revalidatePath("/finance");
  return data;
}

export async function deletePurchaseOrder(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("purchase_orders").delete().eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/finance");
  return true;
}

// ==========================================
// BUDGETS
// ==========================================
export async function getBudgets() {
  const supabase = await createClient();
  const { data, error } = await supabase.from("budgets").select("*, outlets(id, name)").order("period_year", { ascending: false });
  if (error) throw new Error(error.message);
  return data || [];
}

export async function addBudget(formData: any) {
  const supabase = await createClient();
  const { data, error } = await supabase.from("budgets").insert([{
    outlet_id: formData.outlet_id,
    period_month: Number(formData.period_month),
    period_year: Number(formData.period_year),
    total_budget: Number(formData.total_budget) || 0,
    used_budget: Number(formData.used_budget) || 0,
  }]).select();
  if (error) throw new Error(error.message);
  revalidatePath("/finance");
  return data;
}

export async function updateBudget(id: string, formData: any) {
  const supabase = await createClient();
  const { data, error } = await supabase.from("budgets").update({
    total_budget: Number(formData.total_budget) || 0,
    used_budget: Number(formData.used_budget) || 0,
    updated_at: new Date().toISOString(),
  }).eq("id", id).select();
  if (error) throw new Error(error.message);
  revalidatePath("/finance");
  return data;
}

// ==========================================
// KAS ACCOUNTS
// ==========================================
export async function getKasAccounts() {
  const supabase = await createClient();
  const { data, error } = await supabase.from("kas_accounts").select("*, outlets(id, name)").order("type", { ascending: true });
  if (error) throw new Error(error.message);
  return data || [];
}

export async function addKasMutation(formData: any) {
  const supabase = await createClient();
  // Insert mutation record
  const { error: mutError } = await supabase.from("kas_mutations").insert([{
    kas_account_id: formData.kas_account_id,
    type: formData.type,
    amount: Number(formData.amount) || 0,
    description: formData.description || null,
  }]);
  if (mutError) throw new Error(mutError.message);

  // Update kas balance
  const { data: kas } = await supabase.from("kas_accounts").select("balance").eq("id", formData.kas_account_id).single();
  const currentBalance = Number(kas?.balance || 0);
  const newBalance = formData.type === "credit" 
    ? currentBalance + Number(formData.amount)
    : currentBalance - Number(formData.amount);

  const { error: updateErr } = await supabase.from("kas_accounts").update({
    balance: newBalance,
    last_mutation_date: new Date().toISOString().split("T")[0],
    updated_at: new Date().toISOString(),
  }).eq("id", formData.kas_account_id);
  if (updateErr) throw new Error(updateErr.message);

  revalidatePath("/finance");
  return true;
}

// ==========================================
// OUTLET SALES (from cashier_orders)
// ==========================================
export async function getOutletSales() {
  const supabase = await createClient();
  const today = new Date().toISOString().split("T")[0];
  const { data, error } = await supabase
    .from("cashier_orders")
    .select("*")
    .gte("created_at", today + "T00:00:00")
    .lte("created_at", today + "T23:59:59");
  if (error) throw new Error(error.message);

  // Group by cabang
  const grouped: Record<string, any[]> = {};
  (data || []).forEach((order: any) => {
    const branch = order.cabang || "Unknown";
    if (!grouped[branch]) grouped[branch] = [];
    grouped[branch].push(order);
  });

  return Object.entries(grouped).map(([branch, orders]) => ({
    outlet: branch,
    orders,
    totalRevenue: orders.reduce((s: number, o: any) => s + Number(o.total_price || 0), 0),
    orderCount: orders.length,
  }));
}

// ==========================================
// RESET DATA (DUMMY REMOVAL)
// ==========================================
export async function resetFinanceData() {
  const supabase = await createClient();
  
  // Note: RLS allows DELETE to public
  await supabase.from("finance_transactions").delete().neq("id", "00000000-0000-0000-0000-000000000000");
  await supabase.from("invoices").delete().neq("id", "00000000-0000-0000-0000-000000000000");
  await supabase.from("purchase_orders").delete().neq("id", "00000000-0000-0000-0000-000000000000");
  await supabase.from("budgets").delete().neq("id", "00000000-0000-0000-0000-000000000000");
  await supabase.from("kas_mutations").delete().neq("id", "00000000-0000-0000-0000-000000000000");
  
  // Reset accounts
  await supabase.from("kas_accounts").update({ balance: 0 }).neq("id", "00000000-0000-0000-0000-000000000000");

  revalidatePath("/finance");
  return true;
}

"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";
import { requireRole } from "@/actions/auth.action";
import { sanitizeObject } from "@/utils/security";

// ==========================================
// INVENTORY
// ==========================================
export async function getInventory() {
  const supabase = await createClient();
  const { data, error } = await supabase.from("inventory").select("*, outlets(id, name)").order("created_at", { ascending: false });
  if (error) throw new Error(error.message);
  return data || [];
}

export async function addInventoryItem(formData: any) {
  const supabase = await createClient();
  const { data, error } = await supabase.from("inventory").insert([{
    name: formData.name,
    category: formData.category || "Other",
    stock: Number(formData.stock) || 0,
    min_stock: Number(formData.min_stock) || 0,
    unit: formData.unit || "pcs",
    supplier: formData.supplier || null,
    outlet_id: formData.outlet_id || null,
  }]).select();
  if (error) throw new Error(error.message);
  revalidatePath("/supervaisor");
  return data;
}

export async function updateInventoryItem(id: string, formData: any) {
  const supabase = await createClient();
  const { data, error } = await supabase.from("inventory").update({
    name: formData.name,
    category: formData.category,
    stock: Number(formData.stock) || 0,
    min_stock: Number(formData.min_stock) || 0,
    unit: formData.unit,
    supplier: formData.supplier,
    outlet_id: formData.outlet_id || null,
    updated_at: new Date().toISOString(),
  }).eq("id", id).select();
  if (error) throw new Error(error.message);
  revalidatePath("/supervaisor");
  return data;
}

export async function deleteInventoryItem(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("inventory").delete().eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/supervaisor");
  return true;
}

// ==========================================
// DAILY CHECKLISTS
// ==========================================
export async function getChecklists(date?: string) {
  const supabase = await createClient();
  const targetDate = date || new Date().toISOString().split("T")[0];
  const { data, error } = await supabase
    .from("daily_checklists")
    .select("*")
    .eq("checklist_date", targetDate)
    .order("type", { ascending: true });
  if (error) throw new Error(error.message);
  return data || [];
}

export async function toggleChecklistItem(id: string, isCompleted: boolean) {
  const supabase = await createClient();
  const { data, error } = await supabase.from("daily_checklists").update({
    is_completed: isCompleted,
    completed_at: isCompleted ? new Date().toISOString() : null,
  }).eq("id", id).select();
  if (error) throw new Error(error.message);
  revalidatePath("/supervaisor");
  return data;
}

export async function addChecklistItem(formData: any) {
  const supabase = await createClient();
  const { data, error } = await supabase.from("daily_checklists").insert([{
    task: formData.task,
    type: formData.type || "Opening",
    shift: formData.shift || "Pagi",
    is_completed: false,
    outlet_id: formData.outlet_id || null,
    checklist_date: formData.checklist_date || new Date().toISOString().split("T")[0],
  }]).select();
  if (error) throw new Error(error.message);
  revalidatePath("/supervaisor");
  return data;
}

// ==========================================
// RECIPES
// ==========================================
export async function getRecipes() {
  const supabase = await createClient();
  const { data, error } = await supabase.from("recipes").select("*, recipe_ingredients(*)").order("created_at", { ascending: false });
  if (error) throw new Error(error.message);
  return data || [];
}

export async function addRecipe(formData: any) {
  const supabase = await createClient();
  const { data, error } = await supabase.from("recipes").insert([{
    product_name: formData.name,
    category: formData.category || "Coffee",
    cogs: Number(formData.cogs) || 0,
    price: Number(formData.price) || 0,
    outlet_id: formData.outlet_id || null,
  }]).select().single();
  if (error) throw new Error(error.message);
  
  if (formData.ingredients && formData.ingredients.length > 0) {
    const ingredientsData = formData.ingredients.map((ing: any) => ({
      recipe_id: data.id,
      item_name: ing.item_name,
      quantity: Number(ing.quantity) || 0,
      unit: ing.unit || "gram",
      cost_per_unit: Number(ing.cost_per_unit) || 0
    }));
    await supabase.from("recipe_ingredients").insert(ingredientsData);
  }

  revalidatePath("/supervaisor");
  return data;
}

export async function updateRecipe(id: string, formData: any) {
  const supabase = await createClient();
  const { data, error } = await supabase.from("recipes").update({
    product_name: formData.name,
    category: formData.category,
    cogs: Number(formData.cogs) || 0,
    price: Number(formData.price) || 0,
    updated_at: new Date().toISOString(),
  }).eq("id", id).select().single();
  if (error) throw new Error(error.message);
  
  if (formData.ingredients) {
    // Delete old ingredients
    await supabase.from("recipe_ingredients").delete().eq("recipe_id", id);
    // Insert new ones
    if (formData.ingredients.length > 0) {
      const ingredientsData = formData.ingredients.map((ing: any) => ({
        recipe_id: id,
        item_name: ing.item_name,
        quantity: Number(ing.quantity) || 0,
        unit: ing.unit || "gram",
        cost_per_unit: Number(ing.cost_per_unit) || 0
      }));
      await supabase.from("recipe_ingredients").insert(ingredientsData);
    }
  }

  revalidatePath("/supervaisor");
  return data;
}

export async function deleteRecipe(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("recipes").delete().eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/supervaisor");
  return true;
}

// ==========================================
// BATCH PRODUCTIONS
// ==========================================
export async function getBatchProductions() {
  const supabase = await createClient();
  const { data, error } = await supabase.from("batch_productions").select("*").order("created_at", { ascending: false });
  if (error) throw new Error(error.message);
  return data || [];
}

export async function addBatchProduction(formData: any) {
  const supabase = await createClient();
  const { data, error } = await supabase.from("batch_productions").insert([{
    product_name: formData.product_name,
    batch_qty: Number(formData.batch_qty) || 0,
    unit: formData.unit || "liter",
    status: "In Progress",
    notes: formData.notes || null,
    outlet_id: formData.outlet_id || null,
    production_date: formData.production_date || new Date().toISOString().split("T")[0],
  }]).select();
  if (error) throw new Error(error.message);
  revalidatePath("/supervaisor");
  return data;
}

export async function updateBatchStatus(id: string, status: string) {
  const supabase = await createClient();
  const { data, error } = await supabase.from("batch_productions").update({
    status,
    completed_at: status === "Completed" ? new Date().toISOString() : null,
  }).eq("id", id).select();
  if (error) throw new Error(error.message);
  revalidatePath("/supervaisor");
  return data;
}

// ==========================================
// MAINTENANCE REPORTS
// ==========================================
export async function getMaintenanceReports() {
  const supabase = await createClient();
  const { data, error } = await supabase.from("maintenance_reports").select("*").order("created_at", { ascending: false });
  if (error) throw new Error(error.message);
  return data || [];
}

export async function addMaintenanceReport(formData: any) {
  const supabase = await createClient();
  const { data, error } = await supabase.from("maintenance_reports").insert([{
    equipment_name: formData.equipment_name,
    issue_description: formData.issue_description,
    priority: formData.priority || "Medium",
    status: "Reported",
    outlet_id: formData.outlet_id || null,
  }]).select();
  if (error) throw new Error(error.message);
  revalidatePath("/supervaisor");
  return data;
}

export async function updateMaintenanceStatus(id: string, status: string) {
  const supabase = await createClient();
  const { data, error } = await supabase.from("maintenance_reports").update({
    status,
    resolved_at: status === "Resolved" ? new Date().toISOString() : null,
  }).eq("id", id).select();
  if (error) throw new Error(error.message);
  revalidatePath("/supervaisor");
  return data;
}

// ==========================================
// COMPLAINTS
// ==========================================
export async function getComplaints() {
  const supabase = await createClient();
  const { data, error } = await supabase.from("complaints").select("*").order("created_at", { ascending: false });
  if (error) throw new Error(error.message);
  return data || [];
}

export async function addComplaint(formData: any) {
  const supabase = await createClient();
  const { data, error } = await supabase.from("complaints").insert([{
    source: formData.source || "Customer",
    description: formData.description,
    rating: Number(formData.rating) || 0,
    status: "Pending",
    outlet_id: formData.outlet_id || null,
  }]).select();
  if (error) throw new Error(error.message);
  revalidatePath("/supervaisor");
  return data;
}

export async function updateComplaintStatus(id: string, status: string, followUpNotes?: string) {
  const supabase = await createClient();
  const updateData: any = { status };
  if (followUpNotes) updateData.follow_up_notes = followUpNotes;
  if (status === "Resolved" || status === "Closed") updateData.resolved_at = new Date().toISOString();
  const { data, error } = await supabase.from("complaints").update(updateData).eq("id", id).select();
  if (error) throw new Error(error.message);
  revalidatePath("/supervaisor");
  return data;
}

// ==========================================
// APPROVAL REQUESTS
// ==========================================
export async function getApprovalRequests() {
  const supabase = await createClient();
  const { data, error } = await supabase.from("approval_requests").select("*").order("created_at", { ascending: false });
  if (error) throw new Error(error.message);
  return data || [];
}

export async function addApprovalRequest(formData: any) {
  const supabase = await createClient();
  const { data, error } = await supabase.from("approval_requests").insert([{
    type: formData.type,
    description: formData.description,
    requested_by: formData.requested_by,
    status: "Pending",
    outlet_id: formData.outlet_id || null,
  }]).select();
  if (error) throw new Error(error.message);
  revalidatePath("/supervaisor");
  return data;
}

export async function updateApprovalStatus(id: string, status: string, notes?: string) {
  const supabase = await createClient();
  const { data, error } = await supabase.from("approval_requests").update({
    status,
    notes: notes || null,
    resolved_at: new Date().toISOString(),
  }).eq("id", id).select();
  if (error) throw new Error(error.message);
  revalidatePath("/supervaisor");
  return data;
}

// ==========================================
// DASHBOARD STATS (Aggregated)
// ==========================================
export async function getDashboardStats() {
  const supabase = await createClient();
  const today = new Date().toISOString().split("T")[0];
  
  // Get today's sales from cashier_orders
  const { data: todayOrders } = await supabase
    .from("cashier_orders")
    .select("total_price")
    .gte("created_at", today + "T00:00:00")
    .lte("created_at", today + "T23:59:59");

  const totalSales = (todayOrders || []).reduce((sum: number, o: any) => sum + Number(o.total_price || 0), 0);
  const totalOrders = (todayOrders || []).length;

  // Get pending approvals
  const { count: pendingApprovals } = await supabase
    .from("approval_requests")
    .select("*", { count: "exact", head: true })
    .eq("status", "Pending");

  // Get low stock items
  const { data: lowStockItems } = await supabase
    .from("inventory")
    .select("*")
    .filter("stock", "lte", "min_stock");

  return {
    totalSales,
    totalOrders,
    pendingApprovals: pendingApprovals || 0,
    lowStockCount: (lowStockItems || []).length,
  };
}

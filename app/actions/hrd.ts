"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";
import { requireRole } from "@/actions/auth.action";
import { sanitizeObject, stripHtmlTags } from "@/utils/security";

// ==========================================
// ROLES
// ==========================================
export async function getRoles() {
  const supabase = await createClient();
  const { data, error } = await supabase.from("roles").select("*");
  if (error) throw new Error(error.message);
  return data;
}

// ==========================================
// OUTLETS
// ==========================================
export async function getOutlets() {
  const supabase = await createClient();
  const { data, error } = await supabase.from("outlets").select("*");
  if (error) throw new Error(error.message);
  return data;
}

// ==========================================
// EMPLOYEES
// ==========================================
export async function getEmployees() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("employees")
    .select(`
      id, name, status, phone, join_date, photo_url,
      roles ( id, name ),
      outlets ( id, name )
    `);
  
  if (error) throw new Error(error.message);
  return data;
}

export async function addEmployee(formData: any) {
  await requireRole(["Owner", "HRD"]);
  const cleaned = sanitizeObject(formData);
  if (!cleaned.role_id || !cleaned.outlet_id) {
    throw new Error("Pilih Jabatan dan Outlet terlebih dahulu");
  }
  const supabase = await createClient();
  const { data, error } = await supabase.from("employees").insert([{
    name: cleaned.name,
    role_id: cleaned.role_id,
    outlet_id: cleaned.outlet_id,
    status: cleaned.status || 'Active',
    phone: cleaned.phone,
    join_date: cleaned.join_date,
  }]).select();

  if (error) throw new Error(error.message);
  revalidatePath("/hrd");
  return data;
}

export async function updateEmployee(id: string, formData: any) {
  await requireRole(["Owner", "HRD"]);
  const cleaned = sanitizeObject(formData);
  if (!cleaned.role_id || !cleaned.outlet_id) {
    throw new Error("Pilih Jabatan dan Outlet terlebih dahulu");
  }
  const supabase = await createClient();
  const { data, error } = await supabase.from("employees").update({
    name: cleaned.name,
    role_id: cleaned.role_id,
    outlet_id: cleaned.outlet_id,
    status: cleaned.status,
    phone: cleaned.phone,
    join_date: cleaned.join_date,
  }).eq("id", id).select();

  if (error) throw new Error(error.message);
  revalidatePath("/hrd");
  return data;
}

export async function deleteEmployee(id: string) {
  await requireRole(["Owner", "HRD"]);
  const supabase = await createClient();
  const { error } = await supabase.from("employees").delete().eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/hrd");
  return true;
}

// ==========================================
// SHIFTS
// ==========================================
export async function getShifts() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("shifts")
    .select(`
      id, shift_type, shift_date, start_time, end_time, attendance_status,
      employees ( id, name ),
      outlets ( id, name )
    `);
  
  if (error) throw new Error(error.message);
  return data;
}

export async function addShift(formData: any) {
  const supabase = await createClient();
  const { data, error } = await supabase.from("shifts").insert([{
    employee_id: formData.employee_id,
    outlet_id: formData.outlet_id,
    shift_type: formData.shift_type,
    shift_date: formData.shift_date,
    start_time: formData.start_time,
    end_time: formData.end_time,
    attendance_status: formData.attendance_status || 'Pending'
  }]).select();

  if (error) throw new Error(error.message);
  revalidatePath("/hrd");
  return data;
}

export async function updateShiftAttendance(id: string, status: string) {
  const supabase = await createClient();
  const { data, error } = await supabase.from("shifts").update({ attendance_status: status }).eq("id", id).select();
  if (error) throw new Error(error.message);
  revalidatePath("/hrd");
  return data;
}

export async function deleteShift(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("shifts").delete().eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/hrd");
  return true;
}

// ==========================================
// LEAVE REQUESTS
// ==========================================
export async function getLeaveRequests() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("leave_requests")
    .select(`
      id, leave_type, start_date, end_date, total_days, status, reason,
      employees ( id, name )
    `);
  
  if (error) throw new Error(error.message);
  return data;
}

export async function addLeaveRequest(formData: any) {
  const supabase = await createClient();
  const { data, error } = await supabase.from("leave_requests").insert([{
    employee_id: formData.employee_id,
    leave_type: formData.leave_type,
    start_date: formData.start_date,
    end_date: formData.end_date,
    total_days: formData.total_days,
    reason: formData.reason,
    status: 'Pending'
  }]).select();

  if (error) throw new Error(error.message);
  revalidatePath("/hrd");
  return data;
}

export async function updateLeaveStatus(id: string, status: string) {
  const supabase = await createClient();
  const { data, error } = await supabase.from("leave_requests").update({ status }).eq("id", id).select();
  if (error) throw new Error(error.message);
  revalidatePath("/hrd");
  return data;
}

// ==========================================
// PRODUCTS
// ==========================================
export async function getProducts() {
  const supabase = await createClient();
  const { data, error } = await supabase.from("products").select("*");
  if (error) throw new Error(error.message);
  return data;
}

export async function addProduct(formData: any) {
  await requireRole(["Owner", "HRD"]);
  const cleaned = sanitizeObject(formData);
  const supabase = await createClient();
  const { data, error } = await supabase.from("products").insert([{
    name: cleaned.name,
    category: cleaned.category,
    price: Number(cleaned.price) || 0,
    stock: Number(cleaned.stock) || 0,
    is_bestseller: cleaned.is_bestseller || false,
    is_discount: cleaned.is_discount || false,
    discount_amount: Number(cleaned.discount_amount) || 0,
    status: cleaned.status || 'Tersedia',
    image_url: cleaned.image_url || null,
    description: cleaned.description || null
  }]).select();

  if (error) throw new Error(error.message);
  revalidatePath("/hrd");
  revalidatePath("/");
  return data;
}

export async function updateProduct(id: string, formData: any) {
  await requireRole(["Owner", "HRD"]);
  const cleaned = sanitizeObject(formData);
  const supabase = await createClient();
  const { data, error } = await supabase.from("products").update({
    name: cleaned.name,
    category: cleaned.category,
    price: Number(cleaned.price) || 0,
    stock: Number(cleaned.stock) || 0,
    is_bestseller: cleaned.is_bestseller || false,
    is_discount: cleaned.is_discount || false,
    discount_amount: Number(cleaned.discount_amount) || 0,
    status: cleaned.status || 'Tersedia',
    image_url: cleaned.image_url || null,
    description: cleaned.description || null
  }).eq("id", id).select();

  if (error) throw new Error(error.message);
  revalidatePath("/hrd");
  revalidatePath("/");
  return data;
}

export async function deleteProduct(id: string) {
  await requireRole(["Owner", "HRD"]);
  const supabase = await createClient();
  const { error } = await supabase.from("products").delete().eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/hrd");
  return true;
}

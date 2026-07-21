"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

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
  if (!formData.role_id || !formData.outlet_id) {
    throw new Error("Pilih Jabatan dan Outlet terlebih dahulu");
  }
  const supabase = await createClient();
  const { data, error } = await supabase.from("employees").insert([{
    name: formData.name,
    role_id: formData.role_id,
    outlet_id: formData.outlet_id,
    status: formData.status || 'Active',
    phone: formData.phone,
    join_date: formData.join_date,
  }]).select();

  if (error) throw new Error(error.message);
  revalidatePath("/hrd");
  return data;
}

export async function updateEmployee(id: string, formData: any) {
  if (!formData.role_id || !formData.outlet_id) {
    throw new Error("Pilih Jabatan dan Outlet terlebih dahulu");
  }
  const supabase = await createClient();
  const { data, error } = await supabase.from("employees").update({
    name: formData.name,
    role_id: formData.role_id,
    outlet_id: formData.outlet_id,
    status: formData.status,
    phone: formData.phone,
    join_date: formData.join_date,
  }).eq("id", id).select();

  if (error) throw new Error(error.message);
  revalidatePath("/hrd");
  return data;
}

export async function deleteEmployee(id: string) {
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
  const supabase = await createClient();
  const { data, error } = await supabase.from("products").insert([{
    name: formData.name,
    category: formData.category,
    price: Number(formData.price) || 0,
    stock: Number(formData.stock) || 0,
    is_bestseller: formData.is_bestseller || false,
    is_discount: formData.is_discount || false,
    discount_amount: Number(formData.discount_amount) || 0,
    status: formData.status || 'Tersedia',
    image_url: formData.image_url || null
  }]).select();

  if (error) throw new Error(error.message);
  revalidatePath("/hrd");
  return data;
}

export async function updateProduct(id: string, formData: any) {
  const supabase = await createClient();
  const { data, error } = await supabase.from("products").update({
    name: formData.name,
    category: formData.category,
    price: Number(formData.price) || 0,
    stock: Number(formData.stock) || 0,
    is_bestseller: formData.is_bestseller || false,
    is_discount: formData.is_discount || false,
    discount_amount: Number(formData.discount_amount) || 0,
    status: formData.status || 'Tersedia',
    image_url: formData.image_url || null
  }).eq("id", id).select();

  if (error) throw new Error(error.message);
  revalidatePath("/hrd");
  return data;
}

export async function deleteProduct(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("products").delete().eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/hrd");
  return true;
}

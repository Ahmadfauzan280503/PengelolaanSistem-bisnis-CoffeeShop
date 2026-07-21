import { createClient } from "./supabase/server";

// ==========================================
// HRD API METHODS
// ==========================================
export async function getEmployees() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("employees")
    .select(`*, roles(name), outlets(name)`);
  return { data, error };
}

// ==========================================
// FINANCE API METHODS
// ==========================================
export async function getExpenses(outlet_id?: string) {
  const supabase = await createClient();
  let query = supabase.from("expenses").select("*");
  if (outlet_id) query = query.eq("outlet_id", outlet_id);
  const { data, error } = await query;
  return { data, error };
}

// ==========================================
// SUPERVISOR API METHODS
// ==========================================
export async function getInventory(outlet_id: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("inventory")
    .select(`*, ingredients(*)`)
    .eq("outlet_id", outlet_id);
  return { data, error };
}

export async function submitDailyChecklist(outlet_id: string, shift_id: string, checklistData: any) {
  // Logic for daily checklist submission
  // ...
}

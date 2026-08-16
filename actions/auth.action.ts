"use server";

import { createClient } from "@/utils/supabase/server";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { redirect } from "next/navigation";

/**
 * Sign in with email and password via Supabase Auth.
 */
export async function loginWithEmail(email: string, password: string) {
  const supabase = await createClient();

  // Basic validation
  if (!email || !password) {
    return { error: "Email dan password harus diisi." };
  }

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return { error: error.message };
  }

  // Fetch employee role for redirect
  if (data.user) {
    const { data: employee } = await supabase
      .from("employees")
      .select("id, roles(name)")
      .eq("user_id", data.user.id)
      .single();

    const roleName = (employee?.roles as any)?.name || "Kasir";

    let redirectPath = "/";
    switch (roleName) {
      case "Owner":
      case "HRD":
        redirectPath = "/hrd";
        break;
      case "Finance":
        redirectPath = "/finance";
        break;
      case "Supervisor":
        redirectPath = "/supervaisor";
        break;
      case "Kasir":
      case "Leader":
      case "Barista":
        redirectPath = "/cashier/cabang-1";
        break;
    }

    return { success: true, redirectPath, role: roleName };
  }

  return { error: "Login gagal. Silakan coba lagi." };
}

/**
 * Sign in with PIN for HRD & Finance (bypasses RLS to find email, then signs in).
 */
export async function loginWithPin(pin: string) {
  if (!pin || pin.length < 4) {
    return { error: "PIN tidak valid. Minimal 4 angka." };
  }

  // Use service role to bypass RLS and find the user's email by PIN
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  const supabaseAdmin = createSupabaseClient(supabaseUrl, supabaseKey);

  const { data: employee, error: empError } = await supabaseAdmin
    .from("employees")
    .select("email, roles(name)")
    .eq("pin", pin)
    .single();

  if (empError || !employee || !employee.email) {
    return { error: "PIN salah atau tidak ditemukan." };
  }

  // Once email is found, login using the user's client (to set cookies correctly)
  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithPassword({
    email: employee.email,
    password: pin, // The PIN must be set as the user's Supabase password when creating the account
  });

  if (error) {
    return { error: "Login gagal (PIN/Password salah)." };
  }

  if (data.user) {
    const roleName = (employee.roles as any)?.name || "HRD";

    let redirectPath = "/";
    switch (roleName) {
      case "Owner":
      case "HRD":
        redirectPath = "/hrd";
        break;
      case "Finance":
        redirectPath = "/finance";
        break;
      case "Supervisor":
        redirectPath = "/supervaisor";
        break;
      case "Kasir":
      case "Leader":
      case "Barista":
        redirectPath = "/cashier/alauddin"; // As requested by user
        break;
    }

    return { success: true, redirectPath, role: roleName };
  }

  return { error: "Login gagal. Silakan coba lagi." };
}

/**
 * Sign up with email and password via Supabase Auth.
 */
export async function signUpWithEmail(
  email: string,
  password: string,
  fullName: string
) {
  const supabase = await createClient();

  if (!email || !password || !fullName) {
    return { error: "Semua field harus diisi." };
  }

  if (password.length < 8) {
    return { error: "Password minimal 8 karakter." };
  }

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { full_name: fullName },
    },
  });

  if (error) {
    return { error: error.message };
  }

  return { success: true, user: data.user };
}

/**
 * Sign out — clear session.
 */
export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}

/**
 * Get current authenticated user with role info.
 */
export async function getCurrentUser() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: employee } = await supabase
    .from("employees")
    .select("id, name, phone, status, roles(id, name), outlets(id, name)")
    .eq("user_id", user.id)
    .single();

  return {
    id: user.id,
    email: user.email,
    employee: employee || null,
    role: (employee?.roles as any)?.name || null,
    outlet: (employee?.outlets as any)?.name || null,
  };
}

/**
 * Check if the current user has a specific role.
 * Throws an error if the user doesn't have the required role.
 */
export async function requireRole(allowedRoles: string[]) {
  const user = await getCurrentUser();

  if (!user) {
    throw new Error("Unauthorized: Anda harus login terlebih dahulu.");
  }

  if (!user.role || !allowedRoles.includes(user.role)) {
    throw new Error(
      `Forbidden: Role '${user.role}' tidak memiliki akses ke resource ini.`
    );
  }

  return user;
}

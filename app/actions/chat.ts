"use server";

import { createClient } from "@/utils/supabase/server";
import { sanitizeObject } from "@/utils/security";

/**
 * Fetch all chat messages.
 */
export async function getChatMessages() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("live_chats")
    .select("*")
    .order("created_at", { ascending: true });

  if (error) {
    console.error("Error fetching chats:", error);
    return [];
  }
  return data || [];
}

/**
 * Send a new chat message.
 */
export async function sendChatMessage(formData: any) {
  const cleaned = sanitizeObject(formData);
  const supabase = await createClient();
  
  if (!cleaned.message || !cleaned.sender_name || !cleaned.sender_email) {
    throw new Error("Pesan, Nama, dan Email tidak boleh kosong");
  }

  const { data, error } = await supabase.from("live_chats").insert([{
    sender_name: cleaned.sender_name,
    sender_email: cleaned.sender_email,
    message: cleaned.message,
    is_admin: cleaned.is_admin || false
  }]).select().single();

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

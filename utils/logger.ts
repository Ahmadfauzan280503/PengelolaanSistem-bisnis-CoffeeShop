import { createClient } from "./supabase/server";

export async function logActivity({
  employee_id,
  action,
  entity_type,
  entity_id,
  description,
  ip_address,
  user_agent,
}: {
  employee_id: string;
  action: "CREATE" | "UPDATE" | "DELETE" | "LOGIN" | "LOGOUT" | "APPROVE" | "REJECT" | "OTHER";
  entity_type: string;
  entity_id?: string;
  description: string;
  ip_address?: string;
  user_agent?: string;
}) {
  const supabase = await createClient();

  const { error } = await supabase.from("activity_logs").insert({
    employee_id,
    action,
    entity_type,
    entity_id,
    description,
    ip_address,
    user_agent,
  });

  if (error) {
    console.error("Failed to log activity:", error);
  }
}

"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/auth";
import type { TeamRole } from "@/lib/supabase/types";

export async function updateUserRole(input: { id: string; role: TeamRole; is_admin: boolean }) {
  await requireAdmin();
  const supabase = await createClient();

  const { error } = await supabase
    .from("profiles")
    .update({ role: input.role, is_admin: input.is_admin })
    .eq("id", input.id);

  if (error) throw new Error(error.message);
  revalidatePath("/dashboard/admin/users");
  revalidatePath("/dashboard/admin/team");
}

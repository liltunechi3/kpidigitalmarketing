"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/auth";

export async function updateKpiDefinition(input: {
  id: string;
  bobot: number;
  target_value: number;
  target_label: string;
}) {
  await requireAdmin();
  const supabase = await createClient();

  const { error } = await supabase
    .from("kpi_definitions")
    .update({
      bobot: input.bobot,
      target_value: input.target_value,
      target_label: input.target_label,
      updated_at: new Date().toISOString(),
    })
    .eq("id", input.id);

  if (error) throw new Error(error.message);
  revalidatePath("/dashboard/admin/kpi-settings");
  revalidatePath("/dashboard/admin/team");
  revalidatePath("/dashboard/score");
}

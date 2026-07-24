"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/auth";

export async function adminUpsertMetricOverrides(input: {
  user_id: string;
  periode: string;
  entries: { metric_key: string; value: number }[];
}) {
  await requireAdmin();
  const supabase = await createClient();

  const rows = input.entries.map((e) => ({
    user_id: input.user_id,
    periode: input.periode,
    metric_key: e.metric_key,
    value: e.value,
    updated_at: new Date().toISOString(),
  }));

  const { error } = await supabase
    .from("monthly_metric_overrides")
    .upsert(rows, { onConflict: "user_id,periode,metric_key" });

  if (error) throw new Error(error.message);

  revalidatePath(`/dashboard/admin/team/${input.user_id}`);
  revalidatePath("/dashboard/admin/team");
  revalidatePath("/dashboard/score");
}

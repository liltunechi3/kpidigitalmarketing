"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireProfile } from "@/lib/auth";

export async function upsertMetricOverride(input: {
  periode: string;
  metric_key: string;
  value: number;
}) {
  const { userId } = await requireProfile();
  const supabase = await createClient();

  const { error } = await supabase.from("monthly_metric_overrides").upsert(
    {
      user_id: userId,
      periode: input.periode,
      metric_key: input.metric_key,
      value: input.value,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "user_id,periode,metric_key" }
  );

  if (error) throw new Error(error.message);
  revalidatePath("/dashboard/score");
  revalidatePath("/dashboard/admin/team");
}

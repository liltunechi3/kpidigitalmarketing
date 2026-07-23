"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/auth";

export async function upsertHodMonthlyInput(input: {
  periode: string;
  pencapaian_leads: number;
  total_survey: number;
  produktivitas_tim: number;
  total_budget: number;
  catatan: string;
}) {
  const { userId } = await requireAdmin();
  const supabase = await createClient();

  const { error } = await supabase.from("monthly_hod_input").upsert(
    {
      user_id: userId,
      periode: input.periode,
      pencapaian_leads: input.pencapaian_leads,
      total_survey: input.total_survey,
      produktivitas_tim: input.produktivitas_tim,
      total_budget: input.total_budget,
      catatan: input.catatan || null,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "user_id,periode" }
  );

  if (error) throw new Error(error.message);
  revalidatePath("/dashboard/admin/monthly-input");
  revalidatePath("/dashboard/admin/team");
  revalidatePath("/dashboard/score");
}

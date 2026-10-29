"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/auth";
import type { TodoItem } from "@/lib/supabase/types";

function revalidateMember(userId: string) {
  revalidatePath(`/dashboard/admin/team/${userId}`);
  revalidatePath("/dashboard/admin/team");
  revalidatePath("/dashboard/score");
}

export async function adminUpdateContentCreatorLog(
  id: string,
  userId: string,
  input: {
    todo_items: TodoItem[];
    postingan_konten: string;
    bukti_link: string;
    jumlah_revisi: number;
    jumlah_leads: number;
  }
) {
  await requireAdmin();
  const supabase = await createClient();

  const { error } = await supabase
    .from("log_content_creator")
    .update({
      todo_items: input.todo_items,
      postingan_konten: input.postingan_konten || null,
      bukti_link: input.bukti_link || null,
      jumlah_revisi: input.jumlah_revisi,
      jumlah_leads: input.jumlah_leads,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);

  if (error) throw new Error(error.message);
  revalidateMember(userId);
}

export async function adminUpdateGraphicDesignerLog(
  id: string,
  userId: string,
  input: {
    todo_items: TodoItem[];
    total_pekerjaan: number;
    total_tepat_waktu: number;
    total_revisi: number;
  }
) {
  await requireAdmin();
  const supabase = await createClient();

  const { error } = await supabase
    .from("log_graphic_designer")
    .update({
      todo_items: input.todo_items,
      total_pekerjaan: input.total_pekerjaan,
      total_tepat_waktu: input.total_tepat_waktu,
      total_revisi: input.total_revisi,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);

  if (error) throw new Error(error.message);
  revalidateMember(userId);
}

export async function adminUpdateHostLiveLog(
  id: string,
  userId: string,
  input: {
    jam_live: string;
    konsep: string;
    durasi_jam: number;
    unique_views: number;
    new_followers: number;
    lead_masuk: number;
    jumlah_video: number;
  }
) {
  await requireAdmin();
  const supabase = await createClient();

  const { error } = await supabase
    .from("log_host_live")
    .update({
      jam_live: input.jam_live || null,
      konsep: input.konsep || null,
      durasi_jam: input.durasi_jam,
      unique_views: input.unique_views,
      new_followers: input.new_followers,
      lead_masuk: input.lead_masuk,
      jumlah_video: input.jumlah_video,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);

  if (error) throw new Error(error.message);
  revalidateMember(userId);
}

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

"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireProfile } from "@/lib/auth";
import type { TodoItem } from "@/lib/supabase/types";

export async function upsertContentCreatorLog(input: {
  tanggal: string;
  todo_items: TodoItem[];
  postingan_konten: string;
  bukti_link: string;
  jumlah_revisi: number;
  jumlah_leads: number;
}) {
  const { userId } = await requireProfile();
  const supabase = await createClient();

  const { error } = await supabase.from("log_content_creator").upsert(
    {
      user_id: userId,
      tanggal: input.tanggal,
      todo_items: input.todo_items,
      postingan_konten: input.postingan_konten || null,
      bukti_link: input.bukti_link || null,
      jumlah_revisi: input.jumlah_revisi,
      jumlah_leads: input.jumlah_leads,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "user_id,tanggal" }
  );

  if (error) throw new Error(error.message);
  revalidatePath("/dashboard/todo");
  revalidatePath("/dashboard/score");
}

export async function upsertGraphicDesignerLog(input: {
  tanggal: string;
  todo_items: TodoItem[];
  total_pekerjaan: number;
  total_tepat_waktu: number;
  total_revisi: number;
}) {
  const { userId } = await requireProfile();
  const supabase = await createClient();

  const { error } = await supabase.from("log_graphic_designer").upsert(
    {
      user_id: userId,
      tanggal: input.tanggal,
      todo_items: input.todo_items,
      total_pekerjaan: input.total_pekerjaan,
      total_tepat_waktu: input.total_tepat_waktu,
      total_revisi: input.total_revisi,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "user_id,tanggal" }
  );

  if (error) throw new Error(error.message);
  revalidatePath("/dashboard/todo");
  revalidatePath("/dashboard/score");
}

export async function updateContentCreatorLog(
  id: string,
  input: {
    todo_items: TodoItem[];
    postingan_konten: string;
    bukti_link: string;
    jumlah_revisi: number;
    jumlah_leads: number;
  }
) {
  const { userId } = await requireProfile();
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
    .eq("id", id)
    .eq("user_id", userId);

  if (error) throw new Error(error.message);
  revalidatePath("/dashboard/todo");
  revalidatePath("/dashboard/score");
}

export async function updateGraphicDesignerLog(
  id: string,
  input: {
    todo_items: TodoItem[];
    total_pekerjaan: number;
    total_tepat_waktu: number;
    total_revisi: number;
  }
) {
  const { userId } = await requireProfile();
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
    .eq("id", id)
    .eq("user_id", userId);

  if (error) throw new Error(error.message);
  revalidatePath("/dashboard/todo");
  revalidatePath("/dashboard/score");
}

export async function addHostLiveSession(input: {
  tanggal: string;
  jam_live: string;
  konsep: string;
  lokasi_live: string;
  durasi_jam: number;
  unique_views: number;
  new_followers: number;
  lead_masuk: number;
  active_viewers: number;
  jumlah_video: number;
  bukti_link: string;
}) {
  const { userId } = await requireProfile();
  const supabase = await createClient();

  const { error } = await supabase.from("log_host_live").insert({
    user_id: userId,
    tanggal: input.tanggal,
    jam_live: input.jam_live || null,
    konsep: input.konsep || null,
    lokasi_live: input.lokasi_live || null,
    durasi_jam: input.durasi_jam,
    unique_views: input.unique_views,
    new_followers: input.new_followers,
    lead_masuk: input.lead_masuk,
    active_viewers: input.active_viewers,
    jumlah_video: input.jumlah_video,
    bukti_link: input.bukti_link || null,
  });

  if (error) throw new Error(error.message);
  revalidatePath("/dashboard/todo");
  revalidatePath("/dashboard/score");
}

export async function updateHostLiveSession(
  id: string,
  input: {
    jam_live: string;
    konsep: string;
    lokasi_live: string;
    durasi_jam: number;
    unique_views: number;
    new_followers: number;
    lead_masuk: number;
    active_viewers: number;
    jumlah_video: number;
    bukti_link: string;
  }
) {
  const { userId } = await requireProfile();
  const supabase = await createClient();

  const { error } = await supabase
    .from("log_host_live")
    .update({
      jam_live: input.jam_live || null,
      konsep: input.konsep || null,
      lokasi_live: input.lokasi_live || null,
      durasi_jam: input.durasi_jam,
      unique_views: input.unique_views,
      new_followers: input.new_followers,
      lead_masuk: input.lead_masuk,
      active_viewers: input.active_viewers,
      jumlah_video: input.jumlah_video,
      bukti_link: input.bukti_link || null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .eq("user_id", userId);

  if (error) throw new Error(error.message);
  revalidatePath("/dashboard/todo");
  revalidatePath("/dashboard/score");
}

export async function deleteHostLiveSession(id: string) {
  const { userId } = await requireProfile();
  const supabase = await createClient();

  const { error } = await supabase
    .from("log_host_live")
    .delete()
    .eq("id", id)
    .eq("user_id", userId);

  if (error) throw new Error(error.message);
  revalidatePath("/dashboard/todo");
  revalidatePath("/dashboard/score");
}

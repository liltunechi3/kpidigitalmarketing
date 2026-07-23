export type TeamRole =
  | "content_creator"
  | "graphic_designer"
  | "host_live"
  | "head_digital_marketing";

export type TodoItem = {
  text: string;
  done: boolean;
  on_time?: boolean;
};

export type Profile = {
  id: string;
  full_name: string;
  role: TeamRole;
  is_admin: boolean;
  created_at: string;
};

export type LogContentCreator = {
  id: string;
  user_id: string;
  tanggal: string;
  todo_items: TodoItem[];
  postingan_konten: string | null;
  bukti_link: string | null;
  jumlah_revisi: number;
  jumlah_leads: number;
  created_at: string;
  updated_at: string;
};

export type LogGraphicDesigner = {
  id: string;
  user_id: string;
  tanggal: string;
  todo_items: TodoItem[];
  total_pekerjaan: number;
  total_tepat_waktu: number;
  total_revisi: number;
  created_at: string;
  updated_at: string;
};

export type LogHostLive = {
  id: string;
  user_id: string;
  tanggal: string;
  jam_live: string | null;
  konsep: string | null;
  lokasi_live: string | null;
  durasi_jam: number;
  unique_views: number;
  new_followers: number;
  lead_masuk: number;
  active_viewers: number;
  jumlah_video: number;
  bukti_link: string | null;
  created_at: string;
  updated_at: string;
};

export type MonthlyHodInput = {
  id: string;
  user_id: string;
  periode: string;
  pencapaian_leads: number;
  total_survey: number;
  produktivitas_tim: number;
  total_budget: number;
  catatan: string | null;
  created_at: string;
  updated_at: string;
};

export type KpiDefinition = {
  id: string;
  role: TeamRole;
  urutan: number;
  area_kinerja: string;
  kpi_name: string;
  bobot: number;
  target_value: number;
  target_label: string;
  unit: string;
  higher_is_better: boolean;
  metric_key: string;
};

// Minimal Database type so @supabase/ssr generics compile without full codegen.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type Database = any;

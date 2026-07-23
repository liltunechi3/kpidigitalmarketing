-- ============================================================================
-- KPI Digital Marketing - initial schema
-- Roles: content_creator, graphic_designer, host_live, head_digital_marketing
-- ============================================================================

create type public.team_role as enum (
  'content_creator',
  'graphic_designer',
  'host_live',
  'head_digital_marketing'
);

-- ---------------------------------------------------------------------------
-- profiles (1:1 with auth.users)
-- ---------------------------------------------------------------------------
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null,
  role public.team_role not null,
  is_admin boolean not null default false,
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create or replace function public.is_admin_user(uid uuid)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select coalesce((select is_admin from public.profiles where id = uid), false);
$$;

create policy "profiles_select_own_or_admin"
  on public.profiles for select
  using (id = auth.uid() or public.is_admin_user(auth.uid()));

create policy "profiles_update_own_or_admin"
  on public.profiles for update
  using (id = auth.uid() or public.is_admin_user(auth.uid()));

create policy "profiles_insert_admin"
  on public.profiles for insert
  with check (public.is_admin_user(auth.uid()));

create policy "profiles_delete_admin"
  on public.profiles for delete
  using (public.is_admin_user(auth.uid()));

-- ---------------------------------------------------------------------------
-- Daily log: Content Creator
-- ---------------------------------------------------------------------------
create table public.log_content_creator (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  tanggal date not null,
  todo_items jsonb not null default '[]'::jsonb, -- [{text, done}]
  postingan_konten text,
  bukti_link text,
  jumlah_revisi int not null default 0,
  jumlah_leads int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, tanggal)
);

-- ---------------------------------------------------------------------------
-- Daily log: Graphic Designer
-- ---------------------------------------------------------------------------
create table public.log_graphic_designer (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  tanggal date not null,
  todo_items jsonb not null default '[]'::jsonb, -- [{text, done, on_time}]
  total_revisi int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, tanggal)
);

-- ---------------------------------------------------------------------------
-- Daily log: Host Live & Talent (multiple sessions per day possible)
-- ---------------------------------------------------------------------------
create table public.log_host_live (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  tanggal date not null,
  jam_live text,
  konsep text,
  lokasi_live text,
  durasi_jam numeric not null default 0,
  unique_views int not null default 0,
  new_followers int not null default 0,
  lead_masuk int not null default 0,
  active_viewers int not null default 0,
  jumlah_video int not null default 0,
  bukti_link text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Monthly input: Head of Digital Marketing (leadership KPI, manual entry)
-- ---------------------------------------------------------------------------
create table public.monthly_hod_input (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  periode date not null, -- first day of month
  pencapaian_leads int not null default 0,
  total_survey int not null default 0,
  total_budget numeric not null default 0,
  catatan text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, periode)
);

-- ---------------------------------------------------------------------------
-- KPI definitions (editable weights/targets per role) - seeded from Kamus KPI
-- ---------------------------------------------------------------------------
create table public.kpi_definitions (
  id uuid primary key default gen_random_uuid(),
  role public.team_role not null,
  urutan int not null,
  area_kinerja text not null,
  kpi_name text not null,
  bobot numeric not null,
  target_value numeric not null,
  target_label text not null,
  unit text not null,
  higher_is_better boolean not null default true,
  metric_key text not null, -- maps to computation in app layer
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.log_content_creator enable row level security;
alter table public.log_graphic_designer enable row level security;
alter table public.log_host_live enable row level security;
alter table public.monthly_hod_input enable row level security;
alter table public.kpi_definitions enable row level security;

-- Generic policy helper: owner or admin can select/insert/update/delete own rows
create policy "cc_owner_or_admin_all" on public.log_content_creator for all
  using (user_id = auth.uid() or public.is_admin_user(auth.uid()))
  with check (user_id = auth.uid() or public.is_admin_user(auth.uid()));

create policy "gd_owner_or_admin_all" on public.log_graphic_designer for all
  using (user_id = auth.uid() or public.is_admin_user(auth.uid()))
  with check (user_id = auth.uid() or public.is_admin_user(auth.uid()));

create policy "hl_owner_or_admin_all" on public.log_host_live for all
  using (user_id = auth.uid() or public.is_admin_user(auth.uid()))
  with check (user_id = auth.uid() or public.is_admin_user(auth.uid()));

create policy "hod_owner_or_admin_all" on public.monthly_hod_input for all
  using (user_id = auth.uid() or public.is_admin_user(auth.uid()))
  with check (user_id = auth.uid() or public.is_admin_user(auth.uid()));

create policy "kpi_def_select_all" on public.kpi_definitions for select
  using (auth.uid() is not null);

create policy "kpi_def_write_admin" on public.kpi_definitions for insert
  with check (public.is_admin_user(auth.uid()));

create policy "kpi_def_update_admin" on public.kpi_definitions for update
  using (public.is_admin_user(auth.uid()));

create policy "kpi_def_delete_admin" on public.kpi_definitions for delete
  using (public.is_admin_user(auth.uid()));

-- ---------------------------------------------------------------------------
-- Seed KPI definitions from the Kamus KPI files
-- ---------------------------------------------------------------------------
insert into public.kpi_definitions
  (role, urutan, area_kinerja, kpi_name, bobot, target_value, target_label, unit, higher_is_better, metric_key)
values
  -- Content Creator
  ('content_creator', 1, 'Produktivitas', 'Produksi Konten (Editing)', 20, 35, '35 konten/bulan', 'Konten', true, 'cc_produksi_konten'),
  ('content_creator', 2, 'Disiplin', 'Konsistensi Upload', 25, 30, '30 hari upload/bulan', 'Hari', true, 'cc_konsistensi_upload'),
  ('content_creator', 3, 'Engagement', 'Engagement Rate', 25, 10, '10%', '%', true, 'cc_engagement_rate'),
  ('content_creator', 4, 'Konversi', 'Leads dari Konten', 20, 20, '20 leads/bulan', 'Leads', true, 'cc_leads'),
  ('content_creator', 5, 'Kualitas', 'Kualitas Konten (Revisi)', 10, 2, '± 2x/konten', 'Kali', false, 'cc_revisi_ratio'),

  -- Graphic Designer
  ('graphic_designer', 1, 'Produktivitas', 'Produksi Design (Editing)', 50, 60, '60 design/bulan', 'Design', true, 'gd_produksi_design'),
  ('graphic_designer', 2, 'Kualitas', 'Kualitas Design (Revisi)', 30, 2, '± 2x/design', 'Kali', false, 'gd_revisi_ratio'),
  ('graphic_designer', 3, 'Ketepatan Waktu', 'On-Time Delivery Rate', 20, 80, '80%', '%', true, 'gd_on_time_rate'),

  -- Host Live & Talent
  ('host_live', 1, 'Produktivitas Live', 'Durasi Live', 20, 100, '100 jam/bulan', 'Jam', true, 'hl_durasi_live'),
  ('host_live', 2, 'Performa Audience', 'Average Viewers', 20, 30000, '30.000 views/bulan', 'Views', true, 'hl_unique_views'),
  ('host_live', 3, 'Engagement', 'Follow Conversion Rate', 15, 5, '> 5%', '%', true, 'hl_follow_conversion'),
  ('host_live', 4, 'Leads Generation', 'Leads dari Live', 25, 100, '> 100 leads', 'Leads', true, 'hl_leads'),
  ('host_live', 5, 'Produktivitas Konten', 'Jumlah Video/Konten', 20, 30, '30 video/bulan', 'Video', true, 'hl_jumlah_video'),

  -- Head of Digital Marketing
  ('head_digital_marketing', 1, 'Leads & Penjualan', 'Pencapaian Leads', 35, 400, '400 leads/bulan', 'Leads', true, 'hod_pencapaian_leads'),
  ('head_digital_marketing', 2, 'Leads & Penjualan', 'Conversion Leads ke Survey', 25, 30, '± 30 leads', '%', true, 'hod_conversion_survey'),
  ('head_digital_marketing', 3, 'Operasional Tim', 'Produktivitas & Ketepatan Tim', 20, 85, '85%', '%', true, 'hod_produktivitas_tim'),
  ('head_digital_marketing', 4, 'Efisiensi Budget', 'Efektivitas Budget Marketing', 20, 20000, 'Rp 20.000/lead', 'Rp/Leads', false, 'hod_budget_efektivitas');

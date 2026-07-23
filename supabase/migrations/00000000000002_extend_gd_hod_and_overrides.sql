-- Graphic Designer: explicit daily counters that drive the KPI formulas
alter table public.log_graphic_designer
  add column total_pekerjaan int not null default 0,
  add column total_tepat_waktu int not null default 0;

-- Head of Digital Marketing: team productivity is a monthly leadership judgment call
alter table public.monthly_hod_input
  add column produktivitas_tim numeric not null default 0;

-- Generic monthly overrides for metrics that come from external sources
-- (e.g. Content Creator's Engagement Rate, sourced from IG/TikTok insight, not the daily log)
create table public.monthly_metric_overrides (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  periode date not null,
  metric_key text not null,
  value numeric not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, periode, metric_key)
);

alter table public.monthly_metric_overrides enable row level security;

create policy "overrides_owner_or_admin_all" on public.monthly_metric_overrides for all
  using (user_id = auth.uid() or public.is_admin_user(auth.uid()))
  with check (user_id = auth.uid() or public.is_admin_user(auth.uid()));

# KPI Digital Marketing

Management tool untuk tim Digital Marketing (Content Creator, Graphic Designer,
Host Live & Talent, Head of Digital Marketing) mengisi to-do list harian dan
otomatis melihat skor KPI bulanan — menggantikan pencatatan manual di spreadsheet.

## Stack

- Next.js (App Router) + TypeScript + Tailwind CSS
- Supabase (Postgres, Auth, RLS) via `@supabase/ssr`
- Deploy: Vercel

## Cara kerja

- **Content Creator, Graphic Designer, Host Live & Talent**: isi to-do list /
  aktivitas harian di `/dashboard/todo`. Data ini otomatis diagregasi jadi
  realisasi KPI bulanan (lihat `src/lib/kpi/score.ts`).
- **Head of Digital Marketing**: role leadership, input metrik bulanan
  (leads, survey, produktivitas tim, budget) di `/dashboard/admin/monthly-input`,
  dan melihat ringkasan skor seluruh tim di `/dashboard/admin/team`.
- **Admin** (siapa pun dengan `is_admin = true`) bisa mengubah bobot & target
  tiap KPI di `/dashboard/admin/kpi-settings`, dan mengatur role/anggota di
  `/dashboard/admin/users`.
- Definisi bobot/target KPI diseed dari dokumen "Kamus KPI" masing-masing role
  (lihat migration `supabase/migrations`).
- Akun pertama yang mendaftar lewat `/signup` otomatis menjadi admin +
  Head of Digital Marketing (bootstrap). Anggota berikutnya mendaftar sendiri
  memilih role masing-masing; admin bisa mengubah role/hak admin mereka di
  halaman Kelola Anggota.

## Setup lokal

```bash
npm install
cp .env.example .env.local   # isi NEXT_PUBLIC_SUPABASE_URL & NEXT_PUBLIC_SUPABASE_ANON_KEY
npm run dev
```

Skema database (tabel + RLS policy + seed KPI) ada di `supabase/migrations/`
dan sudah diterapkan ke project Supabase yang terhubung.

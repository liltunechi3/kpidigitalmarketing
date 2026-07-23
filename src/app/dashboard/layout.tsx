import Link from "next/link";
import { requireProfile } from "@/lib/auth";
import { ROLE_LABELS } from "@/lib/roles";
import { SignOutButton } from "@/components/SignOutButton";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { profile } = await requireProfile();

  const staffNav = [
    { href: "/dashboard/todo", label: "To-Do Harian" },
    { href: "/dashboard/score", label: "Skor KPI Saya" },
  ];

  const adminNav = [
    { href: "/dashboard/admin/team", label: "Ringkasan Tim" },
    { href: "/dashboard/admin/monthly-input", label: "Input Bulanan (HOD)" },
    { href: "/dashboard/admin/kpi-settings", label: "Pengaturan KPI" },
    { href: "/dashboard/admin/users", label: "Kelola Anggota" },
  ];

  const nav = profile.role === "head_digital_marketing" || profile.is_admin
    ? [...(profile.role !== "head_digital_marketing" ? staffNav : []), ...adminNav]
    : staffNav;

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <div>
            <p className="text-sm font-semibold text-slate-900">KPI Digital Marketing</p>
            <p className="text-xs text-slate-500">
              {profile.full_name} &middot; {ROLE_LABELS[profile.role]}
              {profile.is_admin && " · Admin"}
            </p>
          </div>
          <SignOutButton />
        </div>
        <nav className="mx-auto flex max-w-6xl gap-1 overflow-x-auto px-4 pb-2">
          {nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="whitespace-nowrap rounded-lg px-3 py-1.5 text-sm text-slate-600 hover:bg-slate-100 hover:text-slate-900"
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-6">{children}</main>
    </div>
  );
}

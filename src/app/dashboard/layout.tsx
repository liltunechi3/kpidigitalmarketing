import Link from "next/link";
import { requireProfile } from "@/lib/auth";
import { ROLE_LABELS } from "@/lib/roles";
import { SidebarSignOut } from "@/components/SidebarSignOut";
import {
  IconChecklist,
  IconChart,
  IconUsers,
  IconCalendar,
  IconSliders,
  IconUserPlus,
} from "@/components/icons";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { profile } = await requireProfile();

  const staffNav = [
    { href: "/dashboard/todo", label: "To-Do Harian", icon: IconChecklist },
    { href: "/dashboard/score", label: "Skor KPI Saya", icon: IconChart },
  ];

  const adminNav = [
    { href: "/dashboard/admin/team", label: "Ringkasan Tim", icon: IconUsers },
    { href: "/dashboard/admin/monthly-input", label: "Input Bulanan (HOD)", icon: IconCalendar },
    { href: "/dashboard/admin/kpi-settings", label: "Pengaturan KPI", icon: IconSliders },
    { href: "/dashboard/admin/users", label: "Kelola Anggota", icon: IconUserPlus },
  ];

  const nav = profile.role === "head_digital_marketing" || profile.is_admin
    ? [...(profile.role !== "head_digital_marketing" ? staffNav : []), ...adminNav]
    : staffNav;

  const initials = profile.full_name
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <div className="min-h-screen bg-slate-50 md:flex">
      {/* Icon sidebar (desktop) */}
      <aside className="fixed inset-y-0 left-0 z-20 hidden w-[76px] flex-col items-center border-r border-slate-800 bg-slate-900 py-4 md:flex">
        <div className="group relative mb-6">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/10 text-sm font-semibold text-white">
            {initials}
          </div>
          <span className="pointer-events-none absolute left-full top-1/2 z-10 ml-2 -translate-y-1/2 whitespace-nowrap rounded-md bg-slate-900 px-2.5 py-1.5 text-xs font-medium text-white opacity-0 shadow-lg transition-opacity group-hover:opacity-100">
            {profile.full_name} &middot; {ROLE_LABELS[profile.role]}
            {profile.is_admin && " · Admin"}
          </span>
        </div>

        <nav className="flex flex-1 flex-col items-center gap-1">
          {nav.map((item) => {
            const Icon = item.icon;
            return (
              <div key={item.href} className="group relative">
                <Link
                  href={item.href}
                  className="flex h-11 w-11 items-center justify-center rounded-xl text-slate-400 hover:bg-slate-800 hover:text-white"
                >
                  <Icon className="h-5 w-5" />
                </Link>
                <span className="pointer-events-none absolute left-full top-1/2 z-10 ml-2 -translate-y-1/2 whitespace-nowrap rounded-md bg-slate-900 px-2.5 py-1.5 text-xs font-medium text-white opacity-0 shadow-lg transition-opacity group-hover:opacity-100">
                  {item.label}
                </span>
              </div>
            );
          })}
        </nav>

        <SidebarSignOut />
      </aside>

      {/* Top bar + icon row (mobile) */}
      <header className="sticky top-0 z-20 border-b border-slate-200 bg-white md:hidden">
        <div className="flex items-center justify-between px-4 py-3">
          <div>
            <p className="text-sm font-semibold text-slate-900">KPI Digital Marketing</p>
            <p className="text-xs text-slate-500">
              {profile.full_name} &middot; {ROLE_LABELS[profile.role]}
              {profile.is_admin && " · Admin"}
            </p>
          </div>
          <SidebarSignOut />
        </div>
        <nav className="flex gap-1 overflow-x-auto px-3 pb-3">
          {nav.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className="flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-lg px-3 py-1.5 text-sm text-slate-600 hover:bg-slate-100 hover:text-slate-900"
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </header>

      <main className="min-w-0 flex-1 px-4 py-6 md:ml-[76px] md:px-8">
        <div className="mx-auto max-w-6xl">{children}</div>
      </main>
    </div>
  );
}

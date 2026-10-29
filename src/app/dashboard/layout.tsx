import { requireProfile } from "@/lib/auth";
import { ROLE_LABELS } from "@/lib/roles";
import { TopNav } from "@/components/TopNav";
import {
  IconHome,
  IconChecklist,
  IconChart,
  IconUsers,
  IconCalendar,
  IconSliders,
  IconUserPlus,
} from "@/components/icons";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { profile } = await requireProfile();

  const iconCls = "h-3.5 w-3.5";
  const dashboardItem = { href: "/dashboard", label: "Dashboard", icon: <IconHome className={iconCls} /> };

  const staffNav = [
    { href: "/dashboard/todo", label: "To-Do Harian", icon: <IconChecklist className={iconCls} /> },
    { href: "/dashboard/score", label: "Skor KPI Saya", icon: <IconChart className={iconCls} /> },
  ];

  const adminNav = [
    { href: "/dashboard/admin/team", label: "Ringkasan Tim", icon: <IconUsers className={iconCls} /> },
    { href: "/dashboard/admin/monthly-input", label: "Input Bulanan", icon: <IconCalendar className={iconCls} /> },
    { href: "/dashboard/admin/kpi-settings", label: "Pengaturan KPI", icon: <IconSliders className={iconCls} /> },
    { href: "/dashboard/admin/users", label: "Kelola Anggota", icon: <IconUserPlus className={iconCls} /> },
  ];

  const nav =
    profile.role === "head_digital_marketing" || profile.is_admin
      ? [dashboardItem, ...(profile.role !== "head_digital_marketing" ? staffNav : []), ...adminNav]
      : [dashboardItem, ...staffNav];

  const initials = profile.full_name
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <div className="min-h-screen bg-gradient-to-br from-cream-50 via-cream-50 to-cream-200">
      <TopNav
        nav={nav}
        fullName={profile.full_name}
        roleLabel={ROLE_LABELS[profile.role]}
        isAdmin={profile.is_admin}
        initials={initials}
      />

      <main className="px-4 pb-10 pt-5 md:px-6">
        <div className="mx-auto max-w-7xl">{children}</div>
      </main>
    </div>
  );
}

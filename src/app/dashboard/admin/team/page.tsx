import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { periodeFirstOfMonth, formatMonthLabel, todayISO } from "@/lib/date";
import { MonthSelector } from "@/components/MonthSelector";
import { ROLE_LABELS } from "@/lib/roles";
import { scoreForProfile } from "@/lib/kpi/teamScores";
import type { KpiDefinition, Profile } from "@/lib/supabase/types";

export default async function TeamOverviewPage({
  searchParams,
}: {
  searchParams: Promise<{ bulan?: string }>;
}) {
  await requireAdmin();
  const { bulan: bulanParam } = await searchParams;
  const bulan = bulanParam || todayISO().slice(0, 7);
  const anchorDate = `${bulan}-01`;
  const periode = periodeFirstOfMonth(anchorDate);
  const supabase = await createClient();

  const { data: profiles } = await supabase
    .from("profiles")
    .select("*")
    .order("full_name", { ascending: true });
  const { data: defs } = await supabase.from("kpi_definitions").select("*");
  const definitions = (defs as KpiDefinition[]) ?? [];

  const rows = await Promise.all(
    ((profiles as Profile[]) ?? []).map(async (p) => {
      const result = await scoreForProfile(supabase, p, anchorDate, periode, definitions);
      return { profile: p, result };
    })
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold text-slate-900">Ringkasan Tim</h1>
          <p className="text-sm text-slate-500">{formatMonthLabel(anchorDate)}</p>
        </div>
        <MonthSelector bulan={bulan} basePath="/dashboard/admin/team" />
      </div>

      <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 text-xs uppercase text-slate-500">
            <tr>
              <th className="px-3 py-2">Nama</th>
              <th className="px-3 py-2">Role</th>
              <th className="px-3 py-2">Skor KPI</th>
              <th className="px-3 py-2"></th>
            </tr>
          </thead>
          <tbody>
            {rows.map(({ profile, result }) => (
              <tr key={profile.id} className="border-t border-slate-100">
                <td className="px-3 py-2 font-medium text-slate-900">{profile.full_name}</td>
                <td className="px-3 py-2 text-slate-500">{ROLE_LABELS[profile.role]}</td>
                <td className="px-3 py-2">
                  {result.totalBobot > 0 ? (
                    <span
                      className={
                        result.total / result.totalBobot >= 0.8
                          ? "font-semibold text-emerald-600"
                          : result.total / result.totalBobot >= 0.6
                          ? "font-semibold text-amber-600"
                          : "font-semibold text-red-600"
                      }
                    >
                      {result.total.toFixed(1)} / {result.totalBobot}
                    </span>
                  ) : (
                    <span className="text-slate-400">—</span>
                  )}
                </td>
                <td className="px-3 py-2">
                  <Link
                    href={`/dashboard/admin/team/${profile.id}?bulan=${bulan}`}
                    className="text-sm font-medium text-slate-700 underline"
                  >
                    Detail
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

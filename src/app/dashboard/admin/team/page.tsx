import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { periodeFirstOfMonth, formatMonthLabel, formatPeriodRangeLabel, currentPeriodLabel } from "@/lib/date";
import { MonthSelector } from "@/components/MonthSelector";
import { ROLE_LABELS } from "@/lib/roles";
import { scoreForProfile } from "@/lib/kpi/teamScores";
import { scoreStatus, STATUS_COLOR } from "@/lib/kpi/status";
import { StatTile } from "@/components/viz/StatTile";
import { TeamBarChart, type TeamBarDatum } from "@/components/viz/TeamBarChart";
import { IconDownload } from "@/components/icons";
import type { KpiDefinition, Profile } from "@/lib/supabase/types";

export default async function TeamOverviewPage({
  searchParams,
}: {
  searchParams: Promise<{ bulan?: string }>;
}) {
  await requireAdmin();
  const { bulan: bulanParam } = await searchParams;
  const bulan = bulanParam || currentPeriodLabel();
  const anchorDate = `${bulan}-01`;
  const periode = periodeFirstOfMonth(anchorDate);
  const supabase = await createClient();

  const [{ data: profiles }, { data: defs }] = await Promise.all([
    supabase.from("profiles").select("*").order("full_name", { ascending: true }),
    supabase.from("kpi_definitions").select("*"),
  ]);
  const definitions = (defs as KpiDefinition[]) ?? [];

  const rows = await Promise.all(
    ((profiles as Profile[]) ?? []).map(async (p) => {
      const result = await scoreForProfile(supabase, p, anchorDate, periode, definitions);
      return { profile: p, result };
    })
  );

  const withScore = rows.filter((r) => r.result.totalBobot > 0);
  const percents = withScore.map((r) => (r.result.total / r.result.totalBobot) * 100);
  const avgPercent = percents.length ? percents.reduce((a, b) => a + b, 0) / percents.length : 0;
  const goodCount = percents.filter((p) => scoreStatus(p) === "good").length;
  const criticalCount = percents.filter((p) => scoreStatus(p) === "critical").length;

  const chartData: TeamBarDatum[] = rows.map(({ profile, result }) => ({
    id: profile.id,
    name: profile.full_name,
    role: ROLE_LABELS[profile.role],
    percent: result.totalBobot > 0 ? (result.total / result.totalBobot) * 100 : null,
  }));

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold text-neutral-900">Ringkasan Tim</h1>
          <p className="text-sm text-neutral-500">
            {formatMonthLabel(anchorDate)} &middot; {formatPeriodRangeLabel(anchorDate)}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <a
            href={`/dashboard/admin/team/report?bulan=${bulan}`}
            className="flex items-center gap-1.5 rounded-full border border-black/10 bg-white px-3.5 py-1.5 text-sm font-medium text-neutral-700 hover:bg-cream-100 transition"
          >
            <IconDownload className="h-3.5 w-3.5" />
            Export Laporan
          </a>
          <MonthSelector bulan={bulan} basePath="/dashboard/admin/team" />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <StatTile label="Rata-rata Skor Tim" value={`${Math.round(avgPercent)}%`} />
        <StatTile
          label="Anggota Berstatus Baik (≥80%)"
          value={`${goodCount} / ${withScore.length}`}
          accent={STATUS_COLOR.good}
        />
        <StatTile
          label="Perlu Perhatian (<60%)"
          value={`${criticalCount} / ${withScore.length}`}
          accent={STATUS_COLOR.critical}
        />
      </div>

      <TeamBarChart data={chartData} bulan={bulan} />

      <div className="overflow-x-auto rounded-2xl border border-black/[0.06] bg-white shadow-[0_1px_2px_rgba(16,15,10,0.04),0_10px_28px_-16px_rgba(16,15,10,0.22)]">
        <table className="w-full text-left text-sm">
          <thead className="bg-cream-100/70 text-[11px] font-semibold uppercase tracking-wide text-neutral-500">
            <tr>
              <th className="px-3 py-2">Nama</th>
              <th className="px-3 py-2">Role</th>
              <th className="px-3 py-2">Skor KPI</th>
              <th className="px-3 py-2"></th>
            </tr>
          </thead>
          <tbody>
            {rows.map(({ profile, result }) => {
              const percent = result.totalBobot > 0 ? (result.total / result.totalBobot) * 100 : null;
              return (
                <tr key={profile.id} className="border-t border-black/[0.045]">
                  <td className="px-3 py-2 font-medium text-neutral-900">{profile.full_name}</td>
                  <td className="px-3 py-2 text-neutral-500">{ROLE_LABELS[profile.role]}</td>
                  <td className="px-3 py-2">
                    {percent !== null ? (
                      <span
                        className="font-semibold"
                        style={{ color: STATUS_COLOR[scoreStatus(percent)] }}
                      >
                        {result.total.toFixed(1)} / {result.totalBobot}
                      </span>
                    ) : (
                      <span className="text-neutral-400">—</span>
                    )}
                  </td>
                  <td className="px-3 py-2">
                    <Link
                      href={`/dashboard/admin/team/${profile.id}?bulan=${bulan}`}
                      className="text-sm font-medium text-neutral-700 underline"
                    >
                      Detail
                    </Link>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

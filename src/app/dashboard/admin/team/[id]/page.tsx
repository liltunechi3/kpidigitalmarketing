import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { periodeFirstOfMonth, formatMonthLabel, todayISO } from "@/lib/date";
import { MonthSelector } from "@/components/MonthSelector";
import { KpiScoreTable } from "@/components/KpiScoreTable";
import { ROLE_LABELS } from "@/lib/roles";
import { scoreForProfile } from "@/lib/kpi/teamScores";
import type { KpiDefinition, Profile } from "@/lib/supabase/types";

export default async function TeamMemberDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ bulan?: string }>;
}) {
  await requireAdmin();
  const { id } = await params;
  const { bulan: bulanParam } = await searchParams;
  const bulan = bulanParam || todayISO().slice(0, 7);
  const anchorDate = `${bulan}-01`;
  const periode = periodeFirstOfMonth(anchorDate);
  const supabase = await createClient();

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (!profile) notFound();

  const { data: defs } = await supabase
    .from("kpi_definitions")
    .select("*")
    .eq("role", (profile as Profile).role);
  const definitions = (defs as KpiDefinition[]) ?? [];

  const result = await scoreForProfile(supabase, profile as Profile, anchorDate, periode, definitions);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold text-slate-900">{(profile as Profile).full_name}</h1>
          <p className="text-sm text-slate-500">
            {ROLE_LABELS[(profile as Profile).role]} &middot; {formatMonthLabel(anchorDate)}
          </p>
        </div>
        <MonthSelector bulan={bulan} basePath={`/dashboard/admin/team/${id}`} />
      </div>

      <KpiScoreTable result={result} />
    </div>
  );
}

import { requireProfile } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { periodeFirstOfMonth, formatMonthLabel, formatPeriodRangeLabel, currentPeriodLabel } from "@/lib/date";
import { MonthSelector } from "@/components/MonthSelector";
import { KpiScoreTable } from "@/components/KpiScoreTable";
import { KpiScoreVisual } from "@/components/viz/KpiScoreVisual";
import { MetricOverrideForm } from "@/components/forms/MetricOverrideForm";
import { scoreForProfile } from "@/lib/kpi/teamScores";
import type { KpiDefinition } from "@/lib/supabase/types";

export default async function ScorePage({
  searchParams,
}: {
  searchParams: Promise<{ bulan?: string }>;
}) {
  const { userId, profile } = await requireProfile();
  const { bulan: bulanParam } = await searchParams;
  const bulan = bulanParam || currentPeriodLabel();
  const anchorDate = `${bulan}-01`;
  const periode = periodeFirstOfMonth(anchorDate);
  const supabase = await createClient();

  const { data: defs } = await supabase
    .from("kpi_definitions")
    .select("*")
    .eq("role", profile.role)
    .order("urutan", { ascending: true });
  const definitions = (defs as KpiDefinition[]) ?? [];

  const result = await scoreForProfile(supabase, profile, anchorDate, periode, definitions);

  let overrideBlock: React.ReactNode = null;
  if (profile.role === "content_creator") {
    const { data: override } = await supabase
      .from("monthly_metric_overrides")
      .select("*")
      .eq("user_id", userId)
      .eq("periode", periode)
      .eq("metric_key", "cc_engagement_rate")
      .maybeSingle();

    overrideBlock = (
      <MetricOverrideForm
        periode={periode}
        metricKey="cc_engagement_rate"
        label="Engagement Rate"
        unit="%"
        initialValue={override?.value ?? 0}
      />
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold text-slate-900">Skor KPI Saya</h1>
          <p className="text-sm text-slate-500">
            {formatMonthLabel(anchorDate)} &middot; {formatPeriodRangeLabel(anchorDate)}
          </p>
        </div>
        <MonthSelector bulan={bulan} basePath="/dashboard/score" />
      </div>

      {overrideBlock}
      <KpiScoreVisual result={result} />
      <KpiScoreTable result={result} />
    </div>
  );
}

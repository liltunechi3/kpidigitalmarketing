import { requireProfile } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { monthRange, periodeFirstOfMonth, formatMonthLabel, todayISO } from "@/lib/date";
import { MonthSelector } from "@/components/MonthSelector";
import { KpiScoreTable } from "@/components/KpiScoreTable";
import { KpiScoreVisual } from "@/components/viz/KpiScoreVisual";
import { MetricOverrideForm } from "@/components/forms/MetricOverrideForm";
import {
  computeContentCreatorMetrics,
  computeGraphicDesignerMetrics,
  computeHostLiveMetrics,
  computeHodMetrics,
  computeKpiScore,
} from "@/lib/kpi/score";
import type {
  KpiDefinition,
  LogContentCreator,
  LogGraphicDesigner,
  LogHostLive,
  MonthlyHodInput,
} from "@/lib/supabase/types";

export default async function ScorePage({
  searchParams,
}: {
  searchParams: Promise<{ bulan?: string }>;
}) {
  const { userId, profile } = await requireProfile();
  const { bulan: bulanParam } = await searchParams;
  const bulan = bulanParam || todayISO().slice(0, 7);
  const anchorDate = `${bulan}-01`;
  const [start, end] = monthRange(anchorDate);
  const periode = periodeFirstOfMonth(anchorDate);
  const supabase = await createClient();

  const { data: defs } = await supabase
    .from("kpi_definitions")
    .select("*")
    .eq("role", profile.role)
    .order("urutan", { ascending: true });
  const definitions = (defs as KpiDefinition[]) ?? [];

  let metrics: Record<string, number> = {};
  let overrideBlock: React.ReactNode = null;

  if (profile.role === "content_creator") {
    const { data: logs } = await supabase
      .from("log_content_creator")
      .select("*")
      .eq("user_id", userId)
      .gte("tanggal", start)
      .lte("tanggal", end);
    const { data: override } = await supabase
      .from("monthly_metric_overrides")
      .select("*")
      .eq("user_id", userId)
      .eq("periode", periode)
      .eq("metric_key", "cc_engagement_rate")
      .maybeSingle();

    metrics = computeContentCreatorMetrics(
      (logs as LogContentCreator[]) ?? [],
      override?.value ?? 0
    );
    overrideBlock = (
      <MetricOverrideForm
        periode={periode}
        metricKey="cc_engagement_rate"
        label="Engagement Rate"
        unit="%"
        initialValue={override?.value ?? 0}
      />
    );
  } else if (profile.role === "graphic_designer") {
    const { data: logs } = await supabase
      .from("log_graphic_designer")
      .select("*")
      .eq("user_id", userId)
      .gte("tanggal", start)
      .lte("tanggal", end);
    metrics = computeGraphicDesignerMetrics((logs as LogGraphicDesigner[]) ?? []);
  } else if (profile.role === "host_live") {
    const { data: logs } = await supabase
      .from("log_host_live")
      .select("*")
      .eq("user_id", userId)
      .gte("tanggal", start)
      .lte("tanggal", end);
    metrics = computeHostLiveMetrics((logs as LogHostLive[]) ?? []);
  } else {
    const { data: input } = await supabase
      .from("monthly_hod_input")
      .select("*")
      .eq("user_id", userId)
      .eq("periode", periode)
      .maybeSingle();
    metrics = computeHodMetrics(input as MonthlyHodInput | null);
  }

  const result = computeKpiScore(definitions, metrics);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold text-slate-900">Skor KPI Saya</h1>
          <p className="text-sm text-slate-500">{formatMonthLabel(anchorDate)}</p>
        </div>
        <MonthSelector bulan={bulan} basePath="/dashboard/score" />
      </div>

      {overrideBlock}
      <KpiScoreVisual result={result} />
      <KpiScoreTable result={result} />
    </div>
  );
}

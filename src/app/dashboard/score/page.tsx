import { requireProfile } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { monthRange, periodeFirstOfMonth, formatMonthLabel, formatPeriodRangeLabel, currentPeriodLabel } from "@/lib/date";
import { MonthSelector } from "@/components/MonthSelector";
import { KpiScoreTable } from "@/components/KpiScoreTable";
import { KpiScoreVisual } from "@/components/viz/KpiScoreVisual";
import { MetricOverrideForm } from "@/components/forms/MetricOverrideForm";
import { ActivityLogTable } from "@/components/ActivityLogTable";
import { scoreForProfile } from "@/lib/kpi/teamScores";
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

  const [start, end] = monthRange(anchorDate);
  let contentCreatorLogs: LogContentCreator[] | undefined;
  let graphicDesignerLogs: LogGraphicDesigner[] | undefined;
  let hostLiveLogs: LogHostLive[] | undefined;
  let hodInput: MonthlyHodInput | null | undefined;

  if (profile.role === "content_creator") {
    const { data } = await supabase
      .from("log_content_creator")
      .select("*")
      .eq("user_id", userId)
      .gte("tanggal", start)
      .lte("tanggal", end)
      .order("tanggal", { ascending: false });
    contentCreatorLogs = (data as LogContentCreator[]) ?? [];
  } else if (profile.role === "graphic_designer") {
    const { data } = await supabase
      .from("log_graphic_designer")
      .select("*")
      .eq("user_id", userId)
      .gte("tanggal", start)
      .lte("tanggal", end)
      .order("tanggal", { ascending: false });
    graphicDesignerLogs = (data as LogGraphicDesigner[]) ?? [];
  } else if (profile.role === "host_live") {
    const { data } = await supabase
      .from("log_host_live")
      .select("*")
      .eq("user_id", userId)
      .gte("tanggal", start)
      .lte("tanggal", end)
      .order("tanggal", { ascending: false });
    hostLiveLogs = (data as LogHostLive[]) ?? [];
  } else {
    const { data } = await supabase
      .from("monthly_hod_input")
      .select("*")
      .eq("user_id", userId)
      .eq("periode", periode)
      .maybeSingle();
    hodInput = data as MonthlyHodInput | null;
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

      <div>
        <h2 className="mb-2 text-sm font-semibold text-slate-700">Riwayat Aktivitas Harian</h2>
        <ActivityLogTable
          role={profile.role}
          contentCreatorLogs={contentCreatorLogs}
          graphicDesignerLogs={graphicDesignerLogs}
          hostLiveLogs={hostLiveLogs}
          hodInput={hodInput}
        />
      </div>
    </div>
  );
}

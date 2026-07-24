import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { monthRange, periodeFirstOfMonth, formatMonthLabel, formatPeriodRangeLabel, currentPeriodLabel, lastNMonths } from "@/lib/date";
import { MonthSelector } from "@/components/MonthSelector";
import { EditableKpiScoreTable } from "@/components/EditableKpiScoreTable";
import { KpiScoreVisual } from "@/components/viz/KpiScoreVisual";
import { MonthlyTrendChart } from "@/components/viz/MonthlyTrendChart";
import { ActivityLogTable } from "@/components/ActivityLogTable";
import { ROLE_LABELS } from "@/lib/roles";
import { scoreForProfile } from "@/lib/kpi/teamScores";
import type {
  KpiDefinition,
  LogContentCreator,
  LogGraphicDesigner,
  LogHostLive,
  MonthlyHodInput,
  Profile,
} from "@/lib/supabase/types";

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
  const bulan = bulanParam || currentPeriodLabel();
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

  const months = lastNMonths(anchorDate, 6);
  const trend = await Promise.all(
    months.map(async (m) => {
      const p = periodeFirstOfMonth(m.anchorDate);
      const r = await scoreForProfile(supabase, profile as Profile, m.anchorDate, p, definitions);
      return { label: m.label, percent: r.totalBobot > 0 ? (r.total / r.totalBobot) * 100 : 0 };
    })
  );

  const role = (profile as Profile).role;
  const [start, end] = monthRange(anchorDate);
  let contentCreatorLogs: LogContentCreator[] | undefined;
  let graphicDesignerLogs: LogGraphicDesigner[] | undefined;
  let hostLiveLogs: LogHostLive[] | undefined;
  let hodInput: MonthlyHodInput | null | undefined;

  if (role === "content_creator") {
    const { data } = await supabase
      .from("log_content_creator")
      .select("*")
      .eq("user_id", id)
      .gte("tanggal", start)
      .lte("tanggal", end)
      .order("tanggal", { ascending: false });
    contentCreatorLogs = (data as LogContentCreator[]) ?? [];
  } else if (role === "graphic_designer") {
    const { data } = await supabase
      .from("log_graphic_designer")
      .select("*")
      .eq("user_id", id)
      .gte("tanggal", start)
      .lte("tanggal", end)
      .order("tanggal", { ascending: false });
    graphicDesignerLogs = (data as LogGraphicDesigner[]) ?? [];
  } else if (role === "host_live") {
    const { data } = await supabase
      .from("log_host_live")
      .select("*")
      .eq("user_id", id)
      .gte("tanggal", start)
      .lte("tanggal", end)
      .order("tanggal", { ascending: false });
    hostLiveLogs = (data as LogHostLive[]) ?? [];
  } else {
    const { data } = await supabase
      .from("monthly_hod_input")
      .select("*")
      .eq("user_id", id)
      .eq("periode", periode)
      .maybeSingle();
    hodInput = data as MonthlyHodInput | null;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold text-slate-900">{(profile as Profile).full_name}</h1>
          <p className="text-sm text-slate-500">
            {ROLE_LABELS[(profile as Profile).role]} &middot; {formatMonthLabel(anchorDate)}{" "}
            ({formatPeriodRangeLabel(anchorDate)})
          </p>
        </div>
        <MonthSelector bulan={bulan} basePath={`/dashboard/admin/team/${id}`} />
      </div>

      <KpiScoreVisual result={result} />
      <MonthlyTrendChart points={trend} />
      <EditableKpiScoreTable result={result} userId={id} periode={periode} />

      <div>
        <h2 className="mb-2 text-sm font-semibold text-slate-700">Detail Aktivitas Harian</h2>
        <ActivityLogTable
          role={role}
          contentCreatorLogs={contentCreatorLogs}
          graphicDesignerLogs={graphicDesignerLogs}
          hostLiveLogs={hostLiveLogs}
          hodInput={hodInput}
        />
      </div>
    </div>
  );
}

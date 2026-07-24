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

  const role = (profile as Profile).role;
  const [start, end] = monthRange(anchorDate);
  const months = lastNMonths(anchorDate, 6);

  const logsQuery =
    role === "content_creator"
      ? supabase
          .from("log_content_creator")
          .select("*")
          .eq("user_id", id)
          .gte("tanggal", start)
          .lte("tanggal", end)
          .order("tanggal", { ascending: false })
      : role === "graphic_designer"
        ? supabase
            .from("log_graphic_designer")
            .select("*")
            .eq("user_id", id)
            .gte("tanggal", start)
            .lte("tanggal", end)
            .order("tanggal", { ascending: false })
        : role === "host_live"
          ? supabase
              .from("log_host_live")
              .select("*")
              .eq("user_id", id)
              .gte("tanggal", start)
              .lte("tanggal", end)
              .order("tanggal", { ascending: false })
          : supabase
              .from("monthly_hod_input")
              .select("*")
              .eq("user_id", id)
              .eq("periode", periode)
              .maybeSingle();

  const [result, trend, { data: logsData }] = await Promise.all([
    scoreForProfile(supabase, profile as Profile, anchorDate, periode, definitions),
    Promise.all(
      months.map(async (m) => {
        const p = periodeFirstOfMonth(m.anchorDate);
        const r = await scoreForProfile(supabase, profile as Profile, m.anchorDate, p, definitions);
        return { label: m.label, percent: r.totalBobot > 0 ? (r.total / r.totalBobot) * 100 : 0 };
      })
    ),
    logsQuery,
  ]);

  let contentCreatorLogs: LogContentCreator[] | undefined;
  let graphicDesignerLogs: LogGraphicDesigner[] | undefined;
  let hostLiveLogs: LogHostLive[] | undefined;
  let hodInput: MonthlyHodInput | null | undefined;

  if (role === "content_creator") {
    contentCreatorLogs = (logsData as LogContentCreator[]) ?? [];
  } else if (role === "graphic_designer") {
    graphicDesignerLogs = (logsData as LogGraphicDesigner[]) ?? [];
  } else if (role === "host_live") {
    hostLiveLogs = (logsData as LogHostLive[]) ?? [];
  } else {
    hodInput = logsData as MonthlyHodInput | null;
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

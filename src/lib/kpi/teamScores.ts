import type { SupabaseClient } from "@supabase/supabase-js";
import { monthRange } from "@/lib/date";
import {
  applyMetricOverrides,
  computeContentCreatorMetrics,
  computeGraphicDesignerMetrics,
  computeHostLiveMetrics,
  computeHodMetrics,
  computeKpiScore,
  type KpiScoreResult,
} from "@/lib/kpi/score";
import type {
  KpiDefinition,
  LogContentCreator,
  LogGraphicDesigner,
  LogHostLive,
  MonthlyHodInput,
  Profile,
} from "@/lib/supabase/types";

export async function scoreForProfile(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  supabase: SupabaseClient<any, any, any>,
  profile: Profile,
  anchorDate: string, // any date within the target month, YYYY-MM-DD
  periode: string, // first day of month, YYYY-MM-DD
  allDefinitions: KpiDefinition[]
): Promise<KpiScoreResult> {
  const [start, end] = monthRange(anchorDate);
  const definitions = allDefinitions.filter((d) => d.role === profile.role);

  let metrics: Record<string, number> = {};

  if (profile.role === "content_creator") {
    const { data: logs } = await supabase
      .from("log_content_creator")
      .select("*")
      .eq("user_id", profile.id)
      .gte("tanggal", start)
      .lte("tanggal", end);
    metrics = computeContentCreatorMetrics((logs as LogContentCreator[]) ?? []);
  } else if (profile.role === "graphic_designer") {
    const { data: logs } = await supabase
      .from("log_graphic_designer")
      .select("*")
      .eq("user_id", profile.id)
      .gte("tanggal", start)
      .lte("tanggal", end);
    metrics = computeGraphicDesignerMetrics((logs as LogGraphicDesigner[]) ?? []);
  } else if (profile.role === "host_live") {
    const { data: logs } = await supabase
      .from("log_host_live")
      .select("*")
      .eq("user_id", profile.id)
      .gte("tanggal", start)
      .lte("tanggal", end);
    metrics = computeHostLiveMetrics((logs as LogHostLive[]) ?? []);
  } else {
    const { data: input } = await supabase
      .from("monthly_hod_input")
      .select("*")
      .eq("user_id", profile.id)
      .eq("periode", periode)
      .maybeSingle();
    metrics = computeHodMetrics(input as MonthlyHodInput | null);
  }

  const { data: overrides } = await supabase
    .from("monthly_metric_overrides")
    .select("metric_key, value")
    .eq("user_id", profile.id)
    .eq("periode", periode);
  metrics = applyMetricOverrides(metrics, overrides ?? []);

  return computeKpiScore(definitions, metrics);
}

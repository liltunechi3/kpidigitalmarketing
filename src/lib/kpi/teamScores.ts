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

  const overridesQuery = supabase
    .from("monthly_metric_overrides")
    .select("metric_key, value")
    .eq("user_id", profile.id)
    .eq("periode", periode);

  let metrics: Record<string, number> = {};

  if (profile.role === "content_creator") {
    const [{ data: logs }, { data: overrides }] = await Promise.all([
      supabase
        .from("log_content_creator")
        .select("*")
        .eq("user_id", profile.id)
        .gte("tanggal", start)
        .lte("tanggal", end),
      overridesQuery,
    ]);
    metrics = applyMetricOverrides(
      computeContentCreatorMetrics((logs as LogContentCreator[]) ?? []),
      overrides ?? []
    );
  } else if (profile.role === "graphic_designer") {
    const [{ data: logs }, { data: overrides }] = await Promise.all([
      supabase
        .from("log_graphic_designer")
        .select("*")
        .eq("user_id", profile.id)
        .gte("tanggal", start)
        .lte("tanggal", end),
      overridesQuery,
    ]);
    metrics = applyMetricOverrides(
      computeGraphicDesignerMetrics((logs as LogGraphicDesigner[]) ?? []),
      overrides ?? []
    );
  } else if (profile.role === "host_live") {
    const [{ data: logs }, { data: overrides }] = await Promise.all([
      supabase
        .from("log_host_live")
        .select("*")
        .eq("user_id", profile.id)
        .gte("tanggal", start)
        .lte("tanggal", end),
      overridesQuery,
    ]);
    metrics = applyMetricOverrides(
      computeHostLiveMetrics((logs as LogHostLive[]) ?? []),
      overrides ?? []
    );
  } else {
    const [{ data: input }, { data: overrides }] = await Promise.all([
      supabase
        .from("monthly_hod_input")
        .select("*")
        .eq("user_id", profile.id)
        .eq("periode", periode)
        .maybeSingle(),
      overridesQuery,
    ]);
    metrics = applyMetricOverrides(computeHodMetrics(input as MonthlyHodInput | null), overrides ?? []);
  }

  return computeKpiScore(definitions, metrics);
}

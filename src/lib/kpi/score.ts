import type {
  KpiDefinition,
  LogContentCreator,
  LogGraphicDesigner,
  LogHostLive,
  MonthlyHodInput,
} from "@/lib/supabase/types";

export type MetricValues = Record<string, number>;

export type KpiScoreRow = KpiDefinition & {
  realisasi: number;
  skor: number; // 0..1
  skor_akhir: number; // skor * bobot
};

export type KpiScoreResult = {
  rows: KpiScoreRow[];
  total: number; // out of 100 (sum of bobot)
  totalBobot: number;
};

function isFilled(text: string | null | undefined) {
  const t = (text ?? "").trim();
  return t.length > 0 && t !== "-";
}

/** Content Creator metrics for a set of daily logs within one month. */
export function computeContentCreatorMetrics(
  logs: LogContentCreator[],
  engagementRateOverride: number
): MetricValues {
  const produksiKonten = logs.reduce(
    (sum, l) => sum + l.todo_items.filter((t) => isFilled(t.text)).length,
    0
  );
  const konsistensiUpload = logs.filter((l) => isFilled(l.postingan_konten)).length;
  const totalLeads = logs.reduce((sum, l) => sum + (l.jumlah_leads ?? 0), 0);
  const totalRevisi = logs.reduce((sum, l) => sum + (l.jumlah_revisi ?? 0), 0);
  const revisiRatio = produksiKonten > 0 ? totalRevisi / produksiKonten : 0;

  return {
    cc_produksi_konten: produksiKonten,
    cc_konsistensi_upload: konsistensiUpload,
    cc_engagement_rate: engagementRateOverride,
    cc_leads: totalLeads,
    cc_revisi_ratio: revisiRatio,
  };
}

/** Graphic Designer metrics for a set of daily logs within one month. */
export function computeGraphicDesignerMetrics(logs: LogGraphicDesigner[]): MetricValues {
  const totalPekerjaan = logs.reduce((sum, l) => sum + (l.total_pekerjaan ?? 0), 0);
  const totalRevisi = logs.reduce((sum, l) => sum + (l.total_revisi ?? 0), 0);
  const totalTepatWaktu = logs.reduce((sum, l) => sum + (l.total_tepat_waktu ?? 0), 0);
  const revisiRatio = totalPekerjaan > 0 ? totalRevisi / totalPekerjaan : 0;
  const onTimeRate = totalPekerjaan > 0 ? (totalTepatWaktu / totalPekerjaan) * 100 : 0;

  return {
    gd_produksi_design: totalPekerjaan,
    gd_revisi_ratio: revisiRatio,
    gd_on_time_rate: onTimeRate,
  };
}

/** Host Live & Talent metrics for a set of daily/session logs within one month. */
export function computeHostLiveMetrics(logs: LogHostLive[]): MetricValues {
  const durasi = logs.reduce((sum, l) => sum + Number(l.durasi_jam ?? 0), 0);
  const views = logs.reduce((sum, l) => sum + (l.unique_views ?? 0), 0);
  const followers = logs.reduce((sum, l) => sum + (l.new_followers ?? 0), 0);
  const leads = logs.reduce((sum, l) => sum + (l.lead_masuk ?? 0), 0);
  const videos = logs.reduce((sum, l) => sum + (l.jumlah_video ?? 0), 0);
  const followConversion = views > 0 ? (followers / views) * 100 : 0;

  return {
    hl_durasi_live: durasi,
    hl_unique_views: views,
    hl_follow_conversion: followConversion,
    hl_leads: leads,
    hl_jumlah_video: videos,
  };
}

/** Head of Digital Marketing metrics: fully manual monthly input. */
export function computeHodMetrics(input: MonthlyHodInput | null): MetricValues {
  if (!input) {
    return {
      hod_pencapaian_leads: 0,
      hod_conversion_survey: 0,
      hod_produktivitas_tim: 0,
      hod_budget_efektivitas: 0,
    };
  }
  const conversionSurvey =
    input.pencapaian_leads > 0 ? (input.total_survey / input.pencapaian_leads) * 100 : 0;
  const budgetPerLead = input.pencapaian_leads > 0 ? input.total_budget / input.pencapaian_leads : 0;

  return {
    hod_pencapaian_leads: input.pencapaian_leads,
    hod_conversion_survey: conversionSurvey,
    hod_produktivitas_tim: input.produktivitas_tim,
    hod_budget_efektivitas: budgetPerLead,
  };
}

/** Score a single KPI: 0..1, capped, direction-aware. */
function scoreKpi(def: KpiDefinition, realisasi: number): number {
  if (def.higher_is_better) {
    if (def.target_value <= 0) return realisasi > 0 ? 1 : 0;
    return Math.max(0, Math.min(realisasi / def.target_value, 1));
  }
  // lower is better (e.g. revisi ratio, Rp/lead): fewer than target is a perfect score
  if (realisasi <= 0) return 1;
  if (def.target_value <= 0) return 0;
  return Math.max(0, Math.min(def.target_value / realisasi, 1));
}

export function computeKpiScore(
  definitions: KpiDefinition[],
  metrics: MetricValues
): KpiScoreResult {
  const rows: KpiScoreRow[] = definitions
    .sort((a, b) => a.urutan - b.urutan)
    .map((def) => {
      const realisasi = metrics[def.metric_key] ?? 0;
      const skor = scoreKpi(def, realisasi);
      return { ...def, realisasi, skor, skor_akhir: skor * def.bobot };
    });

  const totalBobot = definitions.reduce((sum, d) => sum + d.bobot, 0);
  const total = rows.reduce((sum, r) => sum + r.skor_akhir, 0);

  return { rows, total, totalBobot };
}

export type ScoreStatus = "good" | "warning" | "critical";

export const STATUS_COLOR: Record<ScoreStatus, string> = {
  good: "#93a0b4",
  warning: "#4c6088",
  critical: "#131c2e",
};

export const STATUS_LABEL: Record<ScoreStatus, string> = {
  good: "Baik",
  warning: "Cukup",
  critical: "Perlu Perhatian",
};

export function scoreStatus(percent: number): ScoreStatus {
  if (percent >= 80) return "good";
  if (percent >= 60) return "warning";
  return "critical";
}

/** Kriteria Ketuntasan Minimal (minimum passing score) for KPI achievement. */
export const KKM_THRESHOLD = 80;

export function meetsKkm(percent: number): boolean {
  return percent >= KKM_THRESHOLD;
}

export function kkmLabel(percent: number): string {
  return meetsKkm(percent) ? "Mencapai KKM" : "Belum Mencapai KKM";
}

export type ScoreStatus = "good" | "warning" | "critical";

export const STATUS_COLOR: Record<ScoreStatus, string> = {
  good: "#0ca30c",
  warning: "#fab219",
  critical: "#d03b3b",
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

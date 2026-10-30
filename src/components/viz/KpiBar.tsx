import { scoreStatus, STATUS_COLOR, KKM_THRESHOLD } from "@/lib/kpi/status";

export function KpiBar({
  label,
  sublabel,
  percent,
}: {
  label: string;
  sublabel: string;
  percent: number;
}) {
  const clamped = Math.max(0, Math.min(percent, 100));
  const color = STATUS_COLOR[scoreStatus(clamped)];

  return (
    <div className="space-y-1">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate text-sm font-medium text-neutral-900">{label}</p>
          <p className="text-xs text-neutral-500">{sublabel}</p>
        </div>
        <span className="shrink-0 text-sm font-semibold text-neutral-900">
          {Math.round(clamped)}%
        </span>
      </div>
      <div className="relative h-2.5 w-full overflow-hidden rounded-full bg-cream-100">
        <div
          className="h-full rounded-full transition-all"
          style={{ width: `${clamped}%`, backgroundColor: color }}
        />
        <div
          className="absolute inset-y-0 w-px bg-ink/30"
          style={{ left: `${KKM_THRESHOLD}%` }}
          title={`KKM ${KKM_THRESHOLD}%`}
        />
      </div>
    </div>
  );
}

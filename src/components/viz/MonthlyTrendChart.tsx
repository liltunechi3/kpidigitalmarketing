import { scoreStatus, STATUS_COLOR, KKM_THRESHOLD } from "@/lib/kpi/status";

export type TrendPoint = { label: string; percent: number };

export function MonthlyTrendChart({ points }: { points: TrendPoint[] }) {
  return (
    <div className="rounded-2xl border border-black/[0.06] bg-white shadow-[0_1px_2px_rgba(16,15,10,0.04),0_10px_28px_-16px_rgba(16,15,10,0.22)] p-5">
      <p className="mb-3 text-sm font-medium text-neutral-700">Tren Skor 6 Bulan Terakhir</p>
      <div className="flex gap-3">
        {points.map((p) => (
          <span key={p.label} className="flex-1 text-center text-xs font-medium text-neutral-700">
            {Math.round(p.percent)}%
          </span>
        ))}
      </div>
      <div className="relative mt-1 flex h-24 items-end gap-3">
        <div
          className="pointer-events-none absolute inset-x-0 border-t border-dashed border-accent"
          style={{ bottom: `${KKM_THRESHOLD}%` }}
        />
        {points.map((p) => {
          const height = Math.max(p.percent, 2);
          const color = STATUS_COLOR[scoreStatus(p.percent)];
          return (
            <div
              key={p.label}
              className="flex-1 rounded-t-lg transition-all"
              style={{ height: `${height}%`, backgroundColor: color }}
            />
          );
        })}
      </div>
      <div className="mt-1 flex gap-3">
        {points.map((p) => (
          <span key={p.label} className="flex-1 text-center text-[11px] text-neutral-500">
            {p.label}
          </span>
        ))}
      </div>
      <p className="mt-2 text-[11px] text-neutral-400">Garis putus-putus: KKM ({KKM_THRESHOLD}%)</p>
    </div>
  );
}

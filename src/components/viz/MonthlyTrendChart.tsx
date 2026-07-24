import { scoreStatus, STATUS_COLOR, KKM_THRESHOLD } from "@/lib/kpi/status";

export type TrendPoint = { label: string; percent: number };

export function MonthlyTrendChart({ points }: { points: TrendPoint[] }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5">
      <p className="mb-3 text-sm font-medium text-slate-700">Tren Skor 6 Bulan Terakhir</p>
      <div className="flex gap-3">
        {points.map((p) => (
          <span key={p.label} className="flex-1 text-center text-xs font-medium text-slate-700">
            {Math.round(p.percent)}%
          </span>
        ))}
      </div>
      <div className="relative mt-1 flex h-24 items-end gap-3">
        <div
          className="pointer-events-none absolute inset-x-0 border-t border-dashed border-slate-300"
          style={{ bottom: `${KKM_THRESHOLD}%` }}
        />
        {points.map((p) => {
          const height = Math.max(p.percent, 2);
          const color = STATUS_COLOR[scoreStatus(p.percent)];
          return (
            <div
              key={p.label}
              className="flex-1 rounded-t-md"
              style={{ height: `${height}%`, backgroundColor: color }}
            />
          );
        })}
      </div>
      <div className="mt-1 flex gap-3">
        {points.map((p) => (
          <span key={p.label} className="flex-1 text-center text-[11px] text-slate-500">
            {p.label}
          </span>
        ))}
      </div>
      <p className="mt-2 text-[11px] text-slate-400">Garis putus-putus: KKM ({KKM_THRESHOLD}%)</p>
    </div>
  );
}

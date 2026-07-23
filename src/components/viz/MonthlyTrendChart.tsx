import { scoreStatus, STATUS_COLOR } from "@/lib/kpi/status";

export type TrendPoint = { label: string; percent: number };

export function MonthlyTrendChart({ points }: { points: TrendPoint[] }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5">
      <p className="mb-3 text-sm font-medium text-slate-700">Tren Skor 6 Bulan Terakhir</p>
      <div className="flex h-32 items-end gap-3">
        {points.map((p) => {
          const height = Math.max(p.percent, 2);
          const color = STATUS_COLOR[scoreStatus(p.percent)];
          return (
            <div key={p.label} className="flex flex-1 flex-col items-center gap-1">
              <span className="text-xs font-medium text-slate-700">{Math.round(p.percent)}%</span>
              <div className="flex h-24 w-full items-end">
                <div
                  className="w-full rounded-t-md"
                  style={{ height: `${height}%`, backgroundColor: color }}
                />
              </div>
              <span className="text-[11px] text-slate-500">{p.label}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

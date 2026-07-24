import Link from "next/link";
import { scoreStatus, STATUS_COLOR, KKM_THRESHOLD } from "@/lib/kpi/status";

export type TeamBarDatum = {
  id: string;
  name: string;
  role: string;
  percent: number | null; // null = belum ada data KPI untuk role ini
};

export function TeamBarChart({
  data,
  bulan,
}: {
  data: TeamBarDatum[];
  bulan: string;
}) {
  const sorted = [...data].sort((a, b) => (b.percent ?? -1) - (a.percent ?? -1));

  return (
    <div className="space-y-3 rounded-xl border border-slate-200 bg-white p-5">
      {sorted.map((d) => {
        const percent = d.percent ?? 0;
        const color = d.percent === null ? "#c3c2b7" : STATUS_COLOR[scoreStatus(percent)];
        return (
          <Link
            key={d.id}
            href={`/dashboard/admin/team/${d.id}?bulan=${bulan}`}
            className="block"
          >
            <div className="flex items-center gap-3">
              <div className="w-36 shrink-0">
                <p className="truncate text-sm font-medium text-slate-900">{d.name}</p>
                <p className="truncate text-xs text-slate-500">{d.role}</p>
              </div>
              <div className="relative h-3 flex-1 overflow-hidden rounded-full bg-slate-100">
                <div
                  className="h-full rounded-full"
                  style={{ width: `${Math.max(percent, 2)}%`, backgroundColor: color }}
                />
                <div
                  className="absolute inset-y-0 w-px bg-slate-400"
                  style={{ left: `${KKM_THRESHOLD}%` }}
                />
              </div>
              <span className="w-12 shrink-0 text-right text-sm font-semibold text-slate-900">
                {d.percent === null ? "—" : `${Math.round(percent)}%`}
              </span>
            </div>
          </Link>
        );
      })}
      <p className="pt-1 text-[11px] text-slate-400">
        Garis vertikal menandakan KKM ({KKM_THRESHOLD}%)
      </p>
    </div>
  );
}

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
    <div className="space-y-3 rounded-2xl border border-black/[0.06] bg-white shadow-[0_1px_2px_rgba(16,15,10,0.04),0_10px_28px_-16px_rgba(16,15,10,0.22)] p-5">
      {sorted.map((d) => {
        const percent = d.percent ?? 0;
        const color = d.percent === null ? "#c7cdd7" : STATUS_COLOR[scoreStatus(percent)];
        return (
          <Link
            key={d.id}
            href={`/dashboard/admin/team/${d.id}?bulan=${bulan}`}
            className="block rounded-xl px-2 py-1 -mx-2 transition-colors hover:bg-cream-100/70"
          >
            <div className="flex items-center gap-3">
              <div className="w-36 shrink-0">
                <p className="truncate text-sm font-medium text-neutral-900">{d.name}</p>
                <p className="truncate text-xs text-neutral-500">{d.role}</p>
              </div>
              <div className="relative h-3 flex-1 overflow-hidden rounded-full bg-cream-100">
                <div
                  className="h-full rounded-full transition-all"
                  style={{ width: `${Math.max(percent, 2)}%`, backgroundColor: color }}
                />
                <div
                  className="absolute inset-y-0 w-px bg-ink/30"
                  style={{ left: `${KKM_THRESHOLD}%` }}
                />
              </div>
              <span className="w-12 shrink-0 text-right text-sm font-semibold text-neutral-900">
                {d.percent === null ? "—" : `${Math.round(percent)}%`}
              </span>
            </div>
          </Link>
        );
      })}
      <p className="pt-1 text-[11px] text-neutral-400">
        Garis vertikal menandakan KKM ({KKM_THRESHOLD}%)
      </p>
    </div>
  );
}

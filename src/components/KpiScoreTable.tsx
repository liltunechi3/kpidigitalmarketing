import type { KpiScoreResult } from "@/lib/kpi/score";

function formatRealisasi(value: number, unit: string) {
  const rounded = Math.round(value * 100) / 100;
  if (unit === "%") return `${rounded}%`;
  if (unit === "Rp/Leads") return `Rp ${rounded.toLocaleString("id-ID")}`;
  return `${rounded.toLocaleString("id-ID")} ${unit}`;
}

export function KpiScoreTable({ result }: { result: KpiScoreResult }) {
  return (
    <>
      <div className="space-y-2.5 sm:hidden">
        {result.rows.map((row) => (
          <div
            key={row.id}
            className="rounded-2xl border border-black/[0.06] bg-white p-3.5 shadow-[0_1px_2px_rgba(16,15,10,0.04),0_10px_28px_-16px_rgba(16,15,10,0.22)]"
          >
            <div className="mb-2 flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-neutral-900">{row.kpi_name}</p>
                <p className="text-xs text-neutral-500">{row.area_kinerja}</p>
              </div>
              <span className="shrink-0 text-sm font-semibold text-neutral-900">{row.skor_akhir.toFixed(1)}</span>
            </div>
            <div className="grid grid-cols-3 gap-2 text-xs">
              <div>
                <p className="text-neutral-400">Bobot</p>
                <p className="font-medium text-neutral-900">{row.bobot}</p>
              </div>
              <div>
                <p className="text-neutral-400">Target</p>
                <p className="font-medium text-neutral-900">{row.target_label}</p>
              </div>
              <div>
                <p className="text-neutral-400">Realisasi</p>
                <p className="font-medium text-neutral-900">{formatRealisasi(row.realisasi, row.unit)}</p>
              </div>
            </div>
            <p className="mt-2 text-xs text-neutral-500">Skor: {Math.round(row.skor * 100)}%</p>
          </div>
        ))}
        <div className="flex items-center justify-between rounded-2xl border border-black/[0.06] bg-cream-100/70 px-3.5 py-2.5 text-sm font-semibold">
          <span>Total Skor KPI</span>
          <span>
            {result.total.toFixed(1)} / {result.totalBobot}
          </span>
        </div>
      </div>

      <div className="hidden overflow-x-auto rounded-2xl border border-black/[0.06] bg-white shadow-[0_1px_2px_rgba(16,15,10,0.04),0_10px_28px_-16px_rgba(16,15,10,0.22)] sm:block">
        <table className="w-full text-left text-sm">
          <thead className="bg-cream-100/70 text-[11px] font-semibold uppercase tracking-wide text-neutral-500">
            <tr>
              <th className="px-3 py-2">Area</th>
              <th className="px-3 py-2">KPI</th>
              <th className="px-3 py-2">Bobot</th>
              <th className="px-3 py-2">Target</th>
              <th className="px-3 py-2">Realisasi</th>
              <th className="px-3 py-2">Skor</th>
              <th className="px-3 py-2">Skor Akhir</th>
            </tr>
          </thead>
          <tbody>
            {result.rows.map((row) => (
              <tr key={row.id} className="border-t border-black/[0.045]">
                <td className="px-3 py-2 text-neutral-500">{row.area_kinerja}</td>
                <td className="px-3 py-2 font-medium text-neutral-900">{row.kpi_name}</td>
                <td className="px-3 py-2">{row.bobot}</td>
                <td className="px-3 py-2 text-neutral-500">{row.target_label}</td>
                <td className="px-3 py-2">{formatRealisasi(row.realisasi, row.unit)}</td>
                <td className="px-3 py-2">{Math.round(row.skor * 100)}%</td>
                <td className="px-3 py-2 font-medium">{row.skor_akhir.toFixed(1)}</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="border-t border-black/[0.06] bg-cream-100/70 font-semibold">
              <td className="px-3 py-2" colSpan={6}>
                Total Skor KPI
              </td>
              <td className="px-3 py-2">
                {result.total.toFixed(1)} / {result.totalBobot}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    </>
  );
}

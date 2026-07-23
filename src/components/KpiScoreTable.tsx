import type { KpiScoreResult } from "@/lib/kpi/score";

function formatRealisasi(value: number, unit: string) {
  const rounded = Math.round(value * 100) / 100;
  if (unit === "%") return `${rounded}%`;
  if (unit === "Rp/Leads") return `Rp ${rounded.toLocaleString("id-ID")}`;
  return `${rounded.toLocaleString("id-ID")} ${unit}`;
}

export function KpiScoreTable({ result }: { result: KpiScoreResult }) {
  return (
    <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
      <table className="w-full text-left text-sm">
        <thead className="bg-slate-50 text-xs uppercase text-slate-500">
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
            <tr key={row.id} className="border-t border-slate-100">
              <td className="px-3 py-2 text-slate-500">{row.area_kinerja}</td>
              <td className="px-3 py-2 font-medium text-slate-900">{row.kpi_name}</td>
              <td className="px-3 py-2">{row.bobot}</td>
              <td className="px-3 py-2 text-slate-500">{row.target_label}</td>
              <td className="px-3 py-2">{formatRealisasi(row.realisasi, row.unit)}</td>
              <td className="px-3 py-2">{Math.round(row.skor * 100)}%</td>
              <td className="px-3 py-2 font-medium">{row.skor_akhir.toFixed(1)}</td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr className="border-t border-slate-200 bg-slate-50 font-semibold">
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
  );
}

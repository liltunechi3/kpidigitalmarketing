"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { adminUpsertMetricOverrides } from "@/app/dashboard/admin/team/actions";
import type { KpiScoreResult } from "@/lib/kpi/score";

export function EditableKpiScoreTable({
  result,
  userId,
  periode,
}: {
  result: KpiScoreResult;
  userId: string;
  periode: string;
}) {
  const router = useRouter();
  const [values, setValues] = useState<Record<string, number>>(() =>
    Object.fromEntries(result.rows.map((r) => [r.metric_key, r.realisasi]))
  );
  const [dirty, setDirty] = useState<Set<string>>(new Set());
  const [pending, startTransition] = useTransition();
  const [saved, setSaved] = useState(false);

  function handleChange(metricKey: string, raw: string) {
    setSaved(false);
    setValues((v) => ({ ...v, [metricKey]: Number(raw) }));
    setDirty((d) => new Set(d).add(metricKey));
  }

  function handleSave() {
    if (dirty.size === 0) return;
    const entries = Array.from(dirty).map((metric_key) => ({
      metric_key,
      value: values[metric_key],
    }));
    startTransition(async () => {
      await adminUpsertMetricOverrides({ user_id: userId, periode, entries });
      setDirty(new Set());
      setSaved(true);
      router.refresh();
    });
  }

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
              <td className="px-3 py-2">
                <div className="flex items-center gap-1.5">
                  <input
                    type="number"
                    step="0.01"
                    value={values[row.metric_key]}
                    onChange={(e) => handleChange(row.metric_key, e.target.value)}
                    className="w-24 rounded-lg border border-slate-300 px-2 py-1 text-sm focus:border-slate-500 focus:outline-none"
                  />
                  <span className="text-xs text-slate-400">{row.unit}</span>
                </div>
              </td>
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
      <div className="flex flex-wrap items-center gap-3 border-t border-slate-200 p-3">
        <button
          type="button"
          onClick={handleSave}
          disabled={pending || dirty.size === 0}
          className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700 disabled:opacity-50"
        >
          {pending ? "Menyimpan..." : "Simpan Perubahan"}
        </button>
        {saved && !pending && <span className="text-sm text-emerald-600">Tersimpan ✓</span>}
        <p className="w-full text-xs text-slate-500">
          Admin bisa mengoreksi nilai Realisasi secara manual, misalnya data dari luar sistem atau koreksi laporan.
        </p>
      </div>
    </div>
  );
}

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

  const realisasiInput = (row: KpiScoreResult["rows"][number]) => (
    <div className="flex items-center gap-1.5">
      <input
        type="number"
        step="0.01"
        value={values[row.metric_key]}
        onChange={(e) => handleChange(row.metric_key, e.target.value)}
        className="w-24 rounded-xl border border-black/10 bg-white px-2 py-1 text-sm focus:border-ink focus:outline-none focus:ring-2 focus:ring-ink/5"
      />
      <span className="text-xs text-neutral-400">{row.unit}</span>
    </div>
  );

  const saveBar = (
    <div className="flex flex-wrap items-center gap-3 border-t border-neutral-200 p-3">
      <button
        type="button"
        onClick={handleSave}
        disabled={pending || dirty.size === 0}
        className="rounded-full bg-ink px-5 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-neutral-800 active:scale-[0.98] transition disabled:opacity-50 disabled:active:scale-100"
      >
        {pending ? "Menyimpan..." : "Simpan Perubahan"}
      </button>
      {saved && !pending && <span className="text-sm text-[#3d5278]">Tersimpan ✓</span>}
      <p className="w-full text-xs text-neutral-500">
        Admin bisa mengoreksi nilai Realisasi secara manual, misalnya data dari luar sistem atau koreksi laporan.
      </p>
    </div>
  );

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
            <div className="mb-2 grid grid-cols-2 gap-2 text-xs">
              <div>
                <p className="text-neutral-400">Bobot</p>
                <p className="font-medium text-neutral-900">{row.bobot}</p>
              </div>
              <div>
                <p className="text-neutral-400">Target</p>
                <p className="font-medium text-neutral-900">{row.target_label}</p>
              </div>
            </div>
            <p className="mb-1 text-xs text-neutral-400">Realisasi</p>
            {realisasiInput(row)}
            <p className="mt-2 text-xs text-neutral-500">Skor: {Math.round(row.skor * 100)}%</p>
          </div>
        ))}
        <div className="flex items-center justify-between rounded-2xl border border-black/[0.06] bg-cream-100/70 px-3.5 py-2.5 text-sm font-semibold">
          <span>Total Skor KPI</span>
          <span>
            {result.total.toFixed(1)} / {result.totalBobot}
          </span>
        </div>
        <div className="rounded-2xl border border-black/[0.06] bg-white shadow-[0_1px_2px_rgba(16,15,10,0.04),0_10px_28px_-16px_rgba(16,15,10,0.22)]">
          {saveBar}
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
                <td className="px-3 py-2">{realisasiInput(row)}</td>
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
        {saveBar}
      </div>
    </>
  );
}

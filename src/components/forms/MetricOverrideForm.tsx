"use client";

import { useState, useTransition } from "react";
import { upsertMetricOverride } from "@/app/dashboard/score/actions";

export function MetricOverrideForm({
  periode,
  metricKey,
  label,
  unit,
  initialValue,
}: {
  periode: string;
  metricKey: string;
  label: string;
  unit: string;
  initialValue: number;
}) {
  const [value, setValue] = useState(initialValue);
  const [pending, startTransition] = useTransition();
  const [saved, setSaved] = useState(false);

  function handleSave() {
    setSaved(false);
    startTransition(async () => {
      await upsertMetricOverride({ periode, metric_key: metricKey, value });
      setSaved(true);
    });
  }

  return (
    <div className="flex flex-wrap items-end gap-3 rounded-xl border border-dashed border-slate-300 bg-slate-50 p-4">
      <div>
        <label className="mb-1 block text-sm font-medium text-slate-700">
          {label} ({unit}) &middot; bulan ini
        </label>
        <input
          type="number"
          step="0.01"
          value={value}
          onChange={(e) => setValue(Number(e.target.value))}
          className="w-40 rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none"
        />
      </div>
      <button
        type="button"
        onClick={handleSave}
        disabled={pending}
        className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700 disabled:opacity-50"
      >
        {pending ? "Menyimpan..." : "Simpan"}
      </button>
      {saved && !pending && <span className="text-sm text-emerald-600">Tersimpan ✓</span>}
      <p className="w-full text-xs text-slate-500">
        Data ini dari luar sistem (insight IG/TikTok), diisi manual sekali per bulan.
      </p>
    </div>
  );
}

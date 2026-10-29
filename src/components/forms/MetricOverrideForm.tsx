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
    <div className="flex flex-wrap items-end gap-3 rounded-2xl border border-dashed border-accent/50 bg-accent-soft/40 p-4">
      <div>
        <label className="mb-1 block text-sm font-medium text-neutral-700">
          {label} ({unit}) &middot; bulan ini
        </label>
        <input
          type="number"
          step="0.01"
          value={value}
          onChange={(e) => setValue(Number(e.target.value))}
          className="w-40 rounded-xl border border-black/10 bg-white px-3 py-2 text-sm focus:border-ink focus:outline-none focus:ring-2 focus:ring-ink/5"
        />
      </div>
      <button
        type="button"
        onClick={handleSave}
        disabled={pending}
        className="rounded-full bg-ink px-5 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-neutral-800 active:scale-[0.98] transition disabled:opacity-50 disabled:active:scale-100"
      >
        {pending ? "Menyimpan..." : "Simpan"}
      </button>
      {saved && !pending && <span className="text-sm text-emerald-600">Tersimpan ✓</span>}
      <p className="w-full text-xs text-neutral-500">
        Data ini dari luar sistem (insight IG/TikTok), diisi manual sekali per bulan.
      </p>
    </div>
  );
}

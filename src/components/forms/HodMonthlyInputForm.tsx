"use client";

import { useState, useTransition } from "react";
import { upsertHodMonthlyInput } from "@/app/dashboard/admin/monthly-input/actions";
import type { MonthlyHodInput } from "@/lib/supabase/types";

export function HodMonthlyInputForm({
  periode,
  existing,
}: {
  periode: string;
  existing: MonthlyHodInput | null;
}) {
  const [leads, setLeads] = useState(existing?.pencapaian_leads ?? 0);
  const [survey, setSurvey] = useState(existing?.total_survey ?? 0);
  const [produktivitas, setProduktivitas] = useState(existing?.produktivitas_tim ?? 0);
  const [budget, setBudget] = useState(existing?.total_budget ?? 0);
  const [catatan, setCatatan] = useState(existing?.catatan ?? "");
  const [pending, startTransition] = useTransition();
  const [saved, setSaved] = useState(false);

  function handleSave() {
    setSaved(false);
    startTransition(async () => {
      await upsertHodMonthlyInput({
        periode,
        pencapaian_leads: leads,
        total_survey: survey,
        produktivitas_tim: produktivitas,
        total_budget: budget,
        catatan,
      });
      setSaved(true);
    });
  }

  return (
    <div className="space-y-5 rounded-xl border border-slate-200 bg-white p-5">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">
            Pencapaian Leads (total, semua platform)
          </label>
          <input
            type="number"
            min={0}
            value={leads}
            onChange={(e) => setLeads(Number(e.target.value))}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">
            Total Survey (dari leads)
          </label>
          <input
            type="number"
            min={0}
            value={survey}
            onChange={(e) => setSurvey(Number(e.target.value))}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">
            Produktivitas & Ketepatan Tim (%)
          </label>
          <input
            type="number"
            min={0}
            max={100}
            value={produktivitas}
            onChange={(e) => setProduktivitas(Number(e.target.value))}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">
            Efisiensi Budget (Rp/Lead)
          </label>
          <input
            type="number"
            min={0}
            value={budget}
            onChange={(e) => setBudget(Number(e.target.value))}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none"
          />
        </div>
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium text-slate-700">Catatan (opsional)</label>
        <textarea
          value={catatan}
          onChange={(e) => setCatatan(e.target.value)}
          rows={3}
          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none"
        />
      </div>

      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={handleSave}
          disabled={pending}
          className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700 disabled:opacity-50"
        >
          {pending ? "Menyimpan..." : "Simpan"}
        </button>
        {saved && !pending && <span className="text-sm text-emerald-600">Tersimpan ✓</span>}
      </div>
    </div>
  );
}

"use client";

import { useState, useTransition } from "react";
import { updateKpiDefinition } from "@/app/dashboard/admin/kpi-settings/actions";
import type { KpiDefinition } from "@/lib/supabase/types";

export function KpiDefinitionRow({ def }: { def: KpiDefinition }) {
  const [bobot, setBobot] = useState(def.bobot);
  const [target, setTarget] = useState(def.target_value);
  const [label, setLabel] = useState(def.target_label);
  const [pending, startTransition] = useTransition();
  const [saved, setSaved] = useState(false);

  function handleSave() {
    setSaved(false);
    startTransition(async () => {
      await updateKpiDefinition({
        id: def.id,
        bobot,
        target_value: target,
        target_label: label,
      });
      setSaved(true);
    });
  }

  return (
    <tr className="border-t border-black/[0.045]">
      <td className="px-3 py-2 text-neutral-500">{def.area_kinerja}</td>
      <td className="px-3 py-2 font-medium text-neutral-900">{def.kpi_name}</td>
      <td className="px-3 py-2">
        <input
          type="number"
          value={bobot}
          onChange={(e) => setBobot(Number(e.target.value))}
          className="w-20 rounded-xl border border-black/10 bg-white px-2 py-1 text-sm"
        />
      </td>
      <td className="px-3 py-2">
        <input
          type="number"
          value={target}
          onChange={(e) => setTarget(Number(e.target.value))}
          className="w-24 rounded-xl border border-black/10 bg-white px-2 py-1 text-sm"
        />
      </td>
      <td className="px-3 py-2">
        <input
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          className="w-40 rounded-xl border border-black/10 bg-white px-2 py-1 text-sm"
        />
      </td>
      <td className="px-3 py-2">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleSave}
            disabled={pending}
            className="rounded-full bg-ink px-3.5 py-1.5 text-xs font-medium text-white hover:bg-neutral-800 transition disabled:opacity-50"
          >
            {pending ? "..." : "Simpan"}
          </button>
          {saved && !pending && <span className="text-xs text-emerald-600">✓</span>}
        </div>
      </td>
    </tr>
  );
}

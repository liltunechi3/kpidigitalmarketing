import { requireAdmin } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { ROLE_OPTIONS } from "@/lib/roles";
import { KpiDefinitionRow } from "@/components/KpiDefinitionRow";
import type { KpiDefinition, TeamRole } from "@/lib/supabase/types";

export default async function KpiSettingsPage() {
  await requireAdmin();
  const supabase = await createClient();

  const { data: defs } = await supabase
    .from("kpi_definitions")
    .select("*")
    .order("role", { ascending: true })
    .order("urutan", { ascending: true });
  const definitions = (defs as KpiDefinition[]) ?? [];

  const byRole = ROLE_OPTIONS.map((r) => ({
    role: r.value,
    label: r.label,
    defs: definitions.filter((d) => d.role === (r.value as TeamRole)),
  }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-lg font-semibold text-neutral-900">Pengaturan Bobot &amp; Target KPI</h1>
        <p className="text-sm text-neutral-500">
          Ubah bobot atau target di sini akan langsung memengaruhi perhitungan skor semua anggota tim.
        </p>
      </div>

      {byRole.map((group) => (
        <div key={group.role}>
          <h2 className="mb-2 text-sm font-semibold text-neutral-700">{group.label}</h2>
          <div className="overflow-x-auto rounded-2xl border border-black/[0.06] bg-white shadow-[0_1px_2px_rgba(16,15,10,0.04),0_10px_28px_-16px_rgba(16,15,10,0.22)]">
            <table className="w-full text-left text-sm">
              <thead className="bg-cream-100/70 text-[11px] font-semibold uppercase tracking-wide text-neutral-500">
                <tr>
                  <th className="px-3 py-2">Area</th>
                  <th className="px-3 py-2">KPI</th>
                  <th className="px-3 py-2">Bobot</th>
                  <th className="px-3 py-2">Target</th>
                  <th className="px-3 py-2">Label Target</th>
                  <th className="px-3 py-2"></th>
                </tr>
              </thead>
              <tbody>
                {group.defs.map((def) => (
                  <KpiDefinitionRow key={def.id} def={def} />
                ))}
              </tbody>
              <tfoot>
                <tr className="border-t border-black/[0.06] bg-cream-100/70">
                  <td className="px-3 py-2 text-xs text-neutral-500" colSpan={2}>
                    Total Bobot
                  </td>
                  <td className="px-3 py-2 text-xs font-semibold text-neutral-700">
                    {group.defs.reduce((s, d) => s + d.bobot, 0)}
                  </td>
                  <td colSpan={3}></td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      ))}
    </div>
  );
}

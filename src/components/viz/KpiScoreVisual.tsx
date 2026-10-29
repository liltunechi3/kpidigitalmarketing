import type { KpiScoreResult } from "@/lib/kpi/score";
import { ScoreGauge } from "@/components/viz/ScoreGauge";
import { KpiBar } from "@/components/viz/KpiBar";

function formatRealisasi(value: number, unit: string) {
  const rounded = Math.round(value * 100) / 100;
  if (unit === "%") return `${rounded}%`;
  if (unit === "Rp/Leads") return `Rp ${rounded.toLocaleString("id-ID")}`;
  return `${rounded.toLocaleString("id-ID")} ${unit}`;
}

export function KpiScoreVisual({ result }: { result: KpiScoreResult }) {
  const overallPercent = result.totalBobot > 0 ? (result.total / result.totalBobot) * 100 : 0;

  return (
    <div className="grid grid-cols-1 gap-4 rounded-2xl border border-black/[0.06] bg-white shadow-[0_1px_2px_rgba(16,15,10,0.04),0_10px_28px_-16px_rgba(16,15,10,0.22)] p-5 sm:grid-cols-[auto_1fr]">
      <div className="flex items-center justify-center sm:border-r sm:border-neutral-100 sm:pr-6">
        <ScoreGauge percent={overallPercent} caption="Skor Total" />
      </div>
      <div className="space-y-4">
        {result.rows.map((row) => (
          <KpiBar
            key={row.id}
            label={row.kpi_name}
            sublabel={`${row.area_kinerja} · target ${row.target_label} · realisasi ${formatRealisasi(
              row.realisasi,
              row.unit
            )}`}
            percent={row.skor * 100}
          />
        ))}
      </div>
    </div>
  );
}

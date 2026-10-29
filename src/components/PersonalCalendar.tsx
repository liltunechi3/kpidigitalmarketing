import type { PeriodDayCell } from "@/lib/date";
import { IconCalendarCheck } from "@/components/icons";

const WEEKDAY_LABELS = ["Sen", "Sel", "Rab", "Kam", "Jum", "Sab", "Min"];

export function PersonalCalendar({
  weeks,
  filledDates,
  todayIso,
  filledCount,
  missedCount,
  totalPeriodDays,
}: {
  weeks: PeriodDayCell[][];
  filledDates: string[];
  todayIso: string;
  filledCount: number;
  missedCount: number;
  totalPeriodDays: number;
}) {
  const filledSet = new Set(filledDates);

  return (
    <div className="rounded-2xl border border-black/[0.06] bg-white p-4 shadow-[0_1px_2px_rgba(16,15,10,0.04),0_10px_28px_-16px_rgba(16,15,10,0.22)]">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <IconCalendarCheck className="h-4 w-4 text-neutral-400" />
          <p className="text-sm font-semibold text-neutral-700">Kalender Aktivitas Saya</p>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="rounded-full bg-accent-soft px-2.5 py-1 text-[11px] font-medium text-neutral-800">
            Terisi {filledCount}
          </span>
          <span className="rounded-full bg-red-50 px-2.5 py-1 text-[11px] font-medium text-red-600">
            Belum Isi {missedCount}
          </span>
          <span className="rounded-full bg-cream-100 px-2.5 py-1 text-[11px] font-medium text-neutral-500">
            Total {totalPeriodDays} hari
          </span>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-1.5">
        {WEEKDAY_LABELS.map((d) => (
          <div key={d} className="px-1 pb-1 text-center text-[11px] font-semibold uppercase tracking-wide text-neutral-400">
            {d}
          </div>
        ))}
        {weeks.map((week, wi) =>
          week.map((cell) => {
            const isFilled = cell.inPeriod && filledSet.has(cell.iso);
            const isMissed = cell.inPeriod && !isFilled && cell.iso <= todayIso;
            return (
              <div
                key={`${wi}-${cell.iso}`}
                className={`relative flex h-12 flex-col items-center justify-center rounded-xl border text-sm sm:h-14 ${
                  !cell.inPeriod
                    ? "border-transparent text-neutral-300"
                    : isFilled
                      ? "border-accent/40 bg-accent-soft font-semibold text-neutral-900"
                      : isMissed
                        ? "border-red-100 bg-red-50/70 text-red-500"
                        : "border-black/[0.04] bg-cream-50/60 text-neutral-500"
                } ${cell.isToday ? "ring-2 ring-ink/70" : ""}`}
              >
                <span>{cell.day}</span>
                {isFilled && <span className="mt-0.5 h-1 w-1 rounded-full bg-accent" />}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

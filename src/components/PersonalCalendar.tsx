"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { getPersonalCalendarMonth } from "@/app/dashboard/calendar-actions";
import type { PersonalCalendarData } from "@/lib/kpi/calendarData";
import { IconCalendarCheck } from "@/components/icons";

const WEEKDAY_LABELS = ["Sen", "Sel", "Rab", "Kam", "Jum", "Sab", "Min"];

export function PersonalCalendar({ initial }: { initial: PersonalCalendarData }) {
  const [data, setData] = useState(initial);
  const [isPending, startTransition] = useTransition();

  function handleMonthChange(value: string) {
    if (!value) return;
    startTransition(async () => {
      const next = await getPersonalCalendarMonth(value);
      setData(next);
    });
  }

  const filledSet = new Set(data.filledDates);

  return (
    <div className="rounded-2xl border border-black/[0.06] bg-white p-4 shadow-[0_1px_2px_rgba(16,15,10,0.04),0_10px_28px_-16px_rgba(16,15,10,0.22)]">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <IconCalendarCheck className="h-4 w-4 text-neutral-400" />
          <div>
            <p className="text-sm font-semibold text-neutral-700">Kalender Aktivitas Saya</p>
            <p className="text-[11px] text-neutral-400">{data.periodeRangeLabel}</p>
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          <input
            type="month"
            value={data.bulan}
            onChange={(e) => handleMonthChange(e.target.value)}
            className="rounded-xl border border-black/10 bg-white px-2.5 py-1.5 text-xs focus:border-ink focus:outline-none focus:ring-2 focus:ring-ink/5"
          />
          <span className="rounded-full bg-accent-soft px-2.5 py-1 text-[11px] font-medium text-neutral-800">
            Terisi {data.filledCount}
          </span>
          <span className="rounded-full bg-[#a8503f]/10 px-2.5 py-1 text-[11px] font-medium text-[#a8503f]">
            Belum Isi {data.missedCount}
          </span>
          <span className="rounded-full bg-cream-100 px-2.5 py-1 text-[11px] font-medium text-neutral-500">
            Total {data.totalPeriodDays} hari
          </span>
        </div>
      </div>

      <div className={`grid grid-cols-7 gap-1.5 transition-opacity ${isPending ? "opacity-50" : ""}`}>
        {WEEKDAY_LABELS.map((d) => (
          <div key={d} className="px-1 pb-1 text-center text-[11px] font-semibold uppercase tracking-wide text-neutral-400">
            {d}
          </div>
        ))}
        {data.weeks.map((week, wi) =>
          week.map((cell) => {
            const isFilled = cell.inPeriod && filledSet.has(cell.iso);
            const isMissed = cell.inPeriod && !isFilled && cell.iso <= data.todayIso;
            const cellClass = `relative flex h-12 flex-col items-center justify-center rounded-xl border text-sm sm:h-14 ${
              !cell.inPeriod
                ? "border-transparent text-neutral-300"
                : isFilled
                  ? "border-accent/40 bg-accent-soft font-semibold text-neutral-900"
                  : isMissed
                    ? "border-[#a8503f]/15 bg-[#a8503f]/[0.06] text-[#a8503f]"
                    : "border-black/[0.04] bg-cream-50/60 text-neutral-500"
            } ${cell.isToday ? "ring-2 ring-ink/70" : ""}`;

            if (!cell.inPeriod) {
              return (
                <div key={`${wi}-${cell.iso}`} className={cellClass}>
                  <span>{cell.day}</span>
                </div>
              );
            }

            return (
              <Link
                key={`${wi}-${cell.iso}`}
                href={`/dashboard/todo?tanggal=${cell.iso}`}
                className={`${cellClass} transition hover:border-ink/30 hover:shadow-sm`}
              >
                <span>{cell.day}</span>
                {isFilled && <span className="mt-0.5 h-1 w-1 rounded-full bg-accent" />}
              </Link>
            );
          })
        )}
      </div>
    </div>
  );
}

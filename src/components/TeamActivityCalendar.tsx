"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import type { PeriodDayCell } from "@/lib/date";
import { IconCalendarCheck, IconChevronRight } from "@/components/icons";

const WEEKDAY_LABELS = ["Sen", "Sel", "Rab", "Kam", "Jum", "Sab", "Min"];

export type CalendarMember = {
  id: string;
  fullName: string;
  roleLabel: string;
  hasDailyLog: boolean;
  filledDates: string[];
  filledCount: number;
  missedCount: number;
  totalPeriodDays: number;
};

function initialsOf(name: string) {
  return name
    .split(" ")
    .map((w) => w[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export function TeamActivityCalendar({
  members,
  weeks,
  todayIso,
  bulan,
}: {
  members: CalendarMember[];
  weeks: PeriodDayCell[][];
  todayIso: string;
  bulan: string;
}) {
  const [selectedId, setSelectedId] = useState<string | undefined>(
    members.find((m) => m.hasDailyLog)?.id ?? members[0]?.id
  );
  const selected = members.find((m) => m.id === selectedId) ?? members[0];
  const filledSet = useMemo(() => new Set(selected?.filledDates ?? []), [selected]);

  return (
    <div className="rounded-2xl border border-black/[0.06] bg-white p-4 shadow-[0_1px_2px_rgba(16,15,10,0.04),0_10px_28px_-16px_rgba(16,15,10,0.22)]">
      <div className="mb-3 flex items-center gap-2">
        <IconCalendarCheck className="h-4 w-4 text-neutral-400" />
        <p className="text-sm font-semibold text-neutral-700">Kalender Aktivitas Tim</p>
      </div>

      <div className="mb-3 flex flex-wrap gap-1.5">
        {members.map((m) => {
          const isSelected = m.id === selected?.id;
          return (
            <button
              key={m.id}
              onClick={() => setSelectedId(m.id)}
              className={`flex items-center gap-1.5 rounded-full py-1 pl-1 pr-3 text-xs font-medium transition ${
                isSelected ? "bg-ink text-white" : "bg-cream-100 text-neutral-600 hover:bg-cream-200"
              }`}
            >
              <span
                className={`flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-semibold ${
                  isSelected ? "bg-accent text-ink" : "bg-white text-neutral-700"
                }`}
              >
                {initialsOf(m.fullName)}
              </span>
              {m.fullName.split(" ")[0]}
            </button>
          );
        })}
      </div>

      {selected && (
        <>
          <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
            <p className="text-xs text-neutral-500">{selected.roleLabel}</p>
            <div className="flex items-center gap-1.5">
              <span className="rounded-full bg-accent-soft px-2.5 py-1 text-[11px] font-medium text-neutral-800">
                Terisi {selected.filledCount}
              </span>
              <span className="rounded-full bg-red-50 px-2.5 py-1 text-[11px] font-medium text-red-600">
                Belum Isi {selected.missedCount}
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
                const isMissed =
                  cell.inPeriod && !isFilled && cell.iso <= todayIso && selected.hasDailyLog;
                return (
                  <div
                    key={`${wi}-${cell.iso}`}
                    className={`relative flex h-11 flex-col items-center justify-center rounded-xl border text-sm sm:h-12 ${
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

          {!selected.hasDailyLog ? (
            <p className="mt-3 text-[11px] text-neutral-400">
              {selected.fullName} mengisi input bulanan, bukan log harian — kalender tidak berlaku untuk role ini.
            </p>
          ) : (
            <Link
              href={`/dashboard/admin/team/${selected.id}?bulan=${bulan}`}
              className="mt-3 flex items-center justify-between rounded-xl border border-black/10 px-3 py-2 text-sm font-medium text-neutral-700 transition hover:bg-cream-100"
            >
              Lihat Detail KPI
              <IconChevronRight className="h-3.5 w-3.5" />
            </Link>
          )}
        </>
      )}
    </div>
  );
}

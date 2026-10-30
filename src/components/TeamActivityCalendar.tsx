"use client";

import { useMemo, useState, useTransition } from "react";
import Link from "next/link";
import { getTeamCalendarMonth } from "@/app/dashboard/calendar-actions";
import type { TeamCalendarData } from "@/lib/kpi/calendarData";
import { IconCalendarCheck, IconChevronRight } from "@/components/icons";

const WEEKDAY_LABELS = ["Sen", "Sel", "Rab", "Kam", "Jum", "Sab", "Min"];

function initialsOf(name: string) {
  return name
    .split(" ")
    .map((w) => w[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export function TeamActivityCalendar({ initial }: { initial: TeamCalendarData }) {
  const [data, setData] = useState(initial);
  const [isPending, startTransition] = useTransition();
  const [selectedId, setSelectedId] = useState<string | undefined>(
    initial.members.find((m) => m.hasDailyLog)?.id ?? initial.members[0]?.id
  );

  function handleMonthChange(value: string) {
    if (!value) return;
    startTransition(async () => {
      const next = await getTeamCalendarMonth(value);
      setData(next);
    });
  }

  const selected = data.members.find((m) => m.id === selectedId) ?? data.members[0];
  const filledSet = useMemo(() => new Set(selected?.filledDates ?? []), [selected]);

  return (
    <div className="rounded-2xl border border-black/[0.06] bg-white p-4 shadow-[0_1px_2px_rgba(16,15,10,0.04),0_10px_28px_-16px_rgba(16,15,10,0.22)]">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <IconCalendarCheck className="h-4 w-4 text-neutral-400" />
          <div>
            <p className="text-sm font-semibold text-neutral-700">Kalender Aktivitas Tim</p>
            <p className="text-[11px] text-neutral-400">{data.periodeRangeLabel}</p>
          </div>
        </div>
        <input
          type="month"
          value={data.bulan}
          onChange={(e) => handleMonthChange(e.target.value)}
          className="rounded-xl border border-black/10 bg-white px-2.5 py-1.5 text-xs focus:border-ink focus:outline-none focus:ring-2 focus:ring-ink/5"
        />
      </div>

      <div className="mb-3 flex flex-wrap gap-1.5">
        {data.members.map((m) => {
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
              <span className="rounded-full bg-[#a8503f]/10 px-2.5 py-1 text-[11px] font-medium text-[#a8503f]">
                Belum Isi {selected.missedCount}
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
                const isMissed =
                  cell.inPeriod && !isFilled && cell.iso <= data.todayIso && selected.hasDailyLog;
                const cellClass = `relative flex h-11 flex-col items-center justify-center rounded-xl border text-sm sm:h-12 ${
                  !cell.inPeriod
                    ? "border-transparent text-neutral-300"
                    : isFilled
                      ? "border-accent/40 bg-accent-soft font-semibold text-neutral-900"
                      : isMissed
                        ? "border-[#a8503f]/15 bg-[#a8503f]/[0.06] text-[#a8503f]"
                        : "border-black/[0.04] bg-cream-50/60 text-neutral-500"
                } ${cell.isToday ? "ring-2 ring-ink/70" : ""}`;

                if (!cell.inPeriod || !selected.hasDailyLog) {
                  return (
                    <div key={`${wi}-${cell.iso}`} className={cellClass}>
                      <span>{cell.day}</span>
                    </div>
                  );
                }

                return (
                  <Link
                    key={`${wi}-${cell.iso}`}
                    href={`/dashboard/admin/team/${selected.id}?bulan=${data.bulan}`}
                    className={`${cellClass} transition hover:border-ink/30 hover:shadow-sm`}
                  >
                    <span>{cell.day}</span>
                    {isFilled && <span className="mt-0.5 h-1 w-1 rounded-full bg-accent" />}
                  </Link>
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
              href={`/dashboard/admin/team/${selected.id}?bulan=${data.bulan}`}
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

"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import type { PeriodDayCell } from "@/lib/date";
import { IconSearch, IconChevronRight } from "@/components/icons";

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

export function TeamCalendar({
  members,
  weeks,
  todayIso,
  bulan,
  bulanLabel,
  periodeRangeLabel,
}: {
  members: CalendarMember[];
  weeks: PeriodDayCell[][];
  todayIso: string;
  bulan: string;
  bulanLabel: string;
  periodeRangeLabel: string;
}) {
  const [search, setSearch] = useState("");
  const [selectedId, setSelectedId] = useState<string | undefined>(members[0]?.id);

  const filteredMembers = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return members;
    return members.filter(
      (m) => m.fullName.toLowerCase().includes(q) || m.roleLabel.toLowerCase().includes(q)
    );
  }, [members, search]);

  const selected = members.find((m) => m.id === selectedId) ?? members[0];
  const filledSet = useMemo(() => new Set(selected?.filledDates ?? []), [selected]);

  return (
    <div className="grid grid-cols-1 gap-3 lg:grid-cols-[260px_1fr_280px]">
      {/* Sidebar: employee list */}
      <div className="rounded-2xl border border-black/[0.06] bg-white p-3 shadow-[0_1px_2px_rgba(16,15,10,0.04),0_10px_28px_-16px_rgba(16,15,10,0.22)]">
        <div className="relative mb-2.5">
          <IconSearch className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-neutral-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari anggota..."
            className="w-full rounded-xl border border-black/10 bg-cream-50 py-2 pl-8 pr-3 text-sm focus:border-ink focus:outline-none focus:ring-2 focus:ring-ink/5"
          />
        </div>
        <div className="max-h-[560px] space-y-1 overflow-y-auto">
          {filteredMembers.map((m) => {
            const percent = m.totalPeriodDays > 0 ? Math.round((m.filledCount / m.totalPeriodDays) * 100) : 0;
            const isSelected = m.id === selected?.id;
            return (
              <button
                key={m.id}
                onClick={() => setSelectedId(m.id)}
                className={`w-full rounded-xl px-2.5 py-2 text-left transition ${
                  isSelected ? "bg-accent-soft" : "hover:bg-cream-100"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-ink text-[11px] font-semibold text-accent">
                    {initialsOf(m.fullName)}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-neutral-900">{m.fullName}</p>
                    <p className="truncate text-[11px] text-neutral-500">{m.roleLabel}</p>
                  </div>
                </div>
                {m.hasDailyLog && (
                  <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-cream-200">
                    <div
                      className="h-full rounded-full bg-accent"
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                )}
              </button>
            );
          })}
          {filteredMembers.length === 0 && (
            <p className="px-2.5 py-4 text-center text-sm text-neutral-400">Tidak ditemukan.</p>
          )}
        </div>
      </div>

      {/* Main: calendar grid */}
      <div className="rounded-2xl border border-black/[0.06] bg-white p-4 shadow-[0_1px_2px_rgba(16,15,10,0.04),0_10px_28px_-16px_rgba(16,15,10,0.22)]">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <div>
            <p className="text-sm font-semibold text-neutral-900">{bulanLabel}</p>
            <p className="text-[11px] text-neutral-500">{periodeRangeLabel}</p>
          </div>
          {selected && (
            <div className="flex items-center gap-1.5">
              <span className="rounded-full bg-accent-soft px-2.5 py-1 text-[11px] font-medium text-neutral-800">
                Terisi {selected.filledCount}
              </span>
              <span className="rounded-full bg-red-50 px-2.5 py-1 text-[11px] font-medium text-red-600">
                Belum Isi {selected.missedCount}
              </span>
              <span className="rounded-full bg-cream-100 px-2.5 py-1 text-[11px] font-medium text-neutral-500">
                Total {selected.totalPeriodDays} hari
              </span>
            </div>
          )}
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
                cell.inPeriod && !isFilled && cell.iso <= todayIso && selected?.hasDailyLog;
              return (
                <div
                  key={`${wi}-${cell.iso}`}
                  className={`relative flex h-14 flex-col items-center justify-center rounded-xl border text-sm ${
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
                  {cell.inPeriod && isFilled && (
                    <span className="mt-0.5 h-1 w-1 rounded-full bg-accent" />
                  )}
                </div>
              );
            })
          )}
        </div>

        {selected && !selected.hasDailyLog && (
          <p className="mt-3 text-[11px] text-neutral-400">
            {selected.fullName} mengisi input bulanan, bukan log harian — kalender tidak berlaku untuk role ini.
          </p>
        )}
      </div>

      {/* Right: selected member detail */}
      {selected && (
        <div className="overflow-hidden rounded-2xl border border-black/[0.06] bg-white shadow-[0_1px_2px_rgba(16,15,10,0.04),0_10px_28px_-16px_rgba(16,15,10,0.22)]">
          <div className="flex h-16 items-end bg-gradient-to-br from-ink to-neutral-800 px-4 pb-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-full border-2 border-white/80 bg-accent text-[12px] font-semibold text-ink">
              {initialsOf(selected.fullName)}
            </span>
          </div>
          <div className="p-4">
            <p className="text-sm font-semibold text-neutral-900">{selected.fullName}</p>
            <p className="text-[11px] text-neutral-500">{selected.roleLabel}</p>

            <div className="mt-3 space-y-1.5 text-[13px]">
              <div className="flex items-center justify-between">
                <span className="text-neutral-500">Hari Terisi</span>
                <span className="font-medium text-neutral-900">{selected.filledCount}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-neutral-500">Hari Belum Isi</span>
                <span className="font-medium text-red-600">{selected.missedCount}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-neutral-500">Total Hari Periode</span>
                <span className="font-medium text-neutral-900">{selected.totalPeriodDays}</span>
              </div>
            </div>

            <Link
              href={`/dashboard/admin/team/${selected.id}?bulan=${bulan}`}
              className="mt-4 flex items-center justify-between rounded-xl border border-black/10 px-3 py-2 text-sm font-medium text-neutral-700 transition hover:bg-cream-100"
            >
              Lihat Detail KPI
              <IconChevronRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

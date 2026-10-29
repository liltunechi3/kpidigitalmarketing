export function todayISO(): string {
  return new Date().toISOString().slice(0, 10);
}

/** KPI period cutoff day: a period labeled "YYYY-MM" runs from the day AFTER
 * this cutoff in the previous month through this cutoff day in the labeled
 * month (e.g. period "2026-07" = 29 Jun - 28 Jul 2026). */
export const PERIOD_CUTOFF_DAY = 28;

/** Returns [startISO, endISO] (inclusive) for the KPI period labeled by dateStr's year-month. */
export function monthRange(dateStr: string): [string, string] {
  const [y, m] = dateStr.split("-").map(Number);
  const prevLastDay = new Date(y, m - 1, 0).getDate();
  const startDay = Math.min(PERIOD_CUTOFF_DAY + 1, prevLastDay);
  const prev = new Date(y, m - 2, startDay);
  const start = `${prev.getFullYear()}-${String(prev.getMonth() + 1).padStart(2, "0")}-${String(prev.getDate()).padStart(2, "0")}`;
  const lastDay = new Date(y, m, 0).getDate();
  const endDay = Math.min(PERIOD_CUTOFF_DAY, lastDay);
  const end = `${y}-${String(m).padStart(2, "0")}-${String(endDay).padStart(2, "0")}`;
  return [start, end];
}

/** The period label (YYYY-MM) that "today" falls into, given the cutoff day. */
export function currentPeriodLabel(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = now.getMonth() + 1;
  const d = now.getDate();
  if (d <= PERIOD_CUTOFF_DAY) return `${y}-${String(m).padStart(2, "0")}`;
  const next = new Date(y, m, 1);
  return `${next.getFullYear()}-${String(next.getMonth() + 1).padStart(2, "0")}`;
}

export function periodeFirstOfMonth(dateStr: string): string {
  const [y, m] = dateStr.split("-").map(Number);
  return `${y}-${String(m).padStart(2, "0")}-01`;
}

const MONTH_LABELS = [
  "Januari", "Februari", "Maret", "April", "Mei", "Juni",
  "Juli", "Agustus", "September", "Oktober", "November", "Desember",
];

const MONTH_SHORT = [
  "Jan", "Feb", "Mar", "Apr", "Mei", "Jun",
  "Jul", "Agu", "Sep", "Okt", "Nov", "Des",
];

export function formatMonthLabel(dateStr: string): string {
  const [y, m] = dateStr.split("-").map(Number);
  return `${MONTH_LABELS[m - 1]} ${y}`;
}

/** Short "29 Jun - 28 Jul 2026" label for the KPI period, for UI clarity on the cutoff. */
export function formatPeriodRangeLabel(dateStr: string): string {
  const [start, end] = monthRange(dateStr);
  const [sy, sm, sd] = start.split("-").map(Number);
  const [ey, em, ed] = end.split("-").map(Number);
  const startLabel = `${sd} ${MONTH_SHORT[sm - 1]}`;
  const endLabel = `${ed} ${MONTH_SHORT[em - 1]} ${ey}`;
  return sy === ey ? `${startLabel} - ${endLabel}` : `${startLabel} ${sy} - ${endLabel}`;
}

/** Whole days from today (local) until the given ISO date (inclusive), can be negative if past. */
export function daysUntil(dateISO: string): number {
  const [y, m, d] = dateISO.split("-").map(Number);
  const target = new Date(y, m - 1, d);
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  return Math.round((target.getTime() - today.getTime()) / 86_400_000);
}

/** Last n months up to and including anchorDate's month, oldest first. */
export function lastNMonths(anchorDate: string, n: number): { anchorDate: string; label: string }[] {
  const [y, m] = anchorDate.split("-").map(Number);
  const out: { anchorDate: string; label: string }[] = [];
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date(y, m - 1 - i, 1);
    const yy = d.getFullYear();
    const mm = d.getMonth() + 1;
    out.push({
      anchorDate: `${yy}-${String(mm).padStart(2, "0")}-01`,
      label: MONTH_SHORT[mm - 1],
    });
  }
  return out;
}

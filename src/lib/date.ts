export function todayISO(): string {
  return new Date().toISOString().slice(0, 10);
}

/** Returns [startISO, endISO] (inclusive) for the calendar month containing dateStr. */
export function monthRange(dateStr: string): [string, string] {
  const [y, m] = dateStr.split("-").map(Number);
  const start = `${y}-${String(m).padStart(2, "0")}-01`;
  const lastDay = new Date(y, m, 0).getDate();
  const end = `${y}-${String(m).padStart(2, "0")}-${String(lastDay).padStart(2, "0")}`;
  return [start, end];
}

export function periodeFirstOfMonth(dateStr: string): string {
  const [y, m] = dateStr.split("-").map(Number);
  return `${y}-${String(m).padStart(2, "0")}-01`;
}

const MONTH_LABELS = [
  "Januari", "Februari", "Maret", "April", "Mei", "Juni",
  "Juli", "Agustus", "September", "Oktober", "November", "Desember",
];

export function formatMonthLabel(dateStr: string): string {
  const [y, m] = dateStr.split("-").map(Number);
  return `${MONTH_LABELS[m - 1]} ${y}`;
}

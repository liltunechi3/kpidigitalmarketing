import { createClient } from "@/lib/supabase/server";
import {
  monthRange,
  buildPeriodWeeks,
  todayISO,
  formatMonthLabel,
  formatPeriodRangeLabel,
  type PeriodDayCell,
} from "@/lib/date";
import { ROLE_LABELS } from "@/lib/roles";
import type { Profile, TeamRole } from "@/lib/supabase/types";

export const DAILY_LOG_ROLES: TeamRole[] = ["content_creator", "graphic_designer", "host_live"];

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

export type PersonalCalendarData = {
  bulan: string;
  bulanLabel: string;
  periodeRangeLabel: string;
  weeks: PeriodDayCell[][];
  todayIso: string;
  filledDates: string[];
  filledCount: number;
  missedCount: number;
  totalPeriodDays: number;
};

export async function fetchPersonalCalendar(
  userId: string,
  role: TeamRole,
  bulan: string
): Promise<PersonalCalendarData> {
  const anchorDate = `${bulan}-01`;
  const [start, end] = monthRange(anchorDate);
  const today = todayISO();
  const supabase = await createClient();

  const logTable =
    role === "content_creator"
      ? "log_content_creator"
      : role === "graphic_designer"
        ? "log_graphic_designer"
        : "log_host_live";

  const { data } = await supabase
    .from(logTable)
    .select("tanggal")
    .eq("user_id", userId)
    .gte("tanggal", start)
    .lte("tanggal", end);

  const filledDates = Array.from(new Set(((data as { tanggal: string }[]) ?? []).map((r) => r.tanggal)));
  const weeks = buildPeriodWeeks(start, end, today);
  const totalPeriodDays = weeks.flat().filter((c) => c.inPeriod).length;
  const missedCount = weeks
    .flat()
    .filter((c) => c.inPeriod && c.iso <= today && !filledDates.includes(c.iso)).length;

  return {
    bulan,
    bulanLabel: formatMonthLabel(anchorDate),
    periodeRangeLabel: formatPeriodRangeLabel(anchorDate),
    weeks,
    todayIso: today,
    filledDates,
    filledCount: filledDates.length,
    missedCount,
    totalPeriodDays,
  };
}

export type TeamCalendarData = {
  bulan: string;
  bulanLabel: string;
  periodeRangeLabel: string;
  weeks: PeriodDayCell[][];
  todayIso: string;
  members: CalendarMember[];
};

export async function fetchTeamCalendar(bulan: string): Promise<TeamCalendarData> {
  const anchorDate = `${bulan}-01`;
  const [start, end] = monthRange(anchorDate);
  const today = todayISO();
  const supabase = await createClient();

  const [{ data: profiles }, { data: ccLogs }, { data: gdLogs }, { data: hlLogs }] = await Promise.all([
    supabase.from("profiles").select("*").order("full_name", { ascending: true }),
    supabase.from("log_content_creator").select("user_id, tanggal").gte("tanggal", start).lte("tanggal", end),
    supabase.from("log_graphic_designer").select("user_id, tanggal").gte("tanggal", start).lte("tanggal", end),
    supabase.from("log_host_live").select("user_id, tanggal").gte("tanggal", start).lte("tanggal", end),
  ]);

  const datesByUser = new Map<string, Set<string>>();
  for (const row of [...(ccLogs ?? []), ...(gdLogs ?? []), ...(hlLogs ?? [])] as {
    user_id: string;
    tanggal: string;
  }[]) {
    const set = datesByUser.get(row.user_id) ?? new Set<string>();
    set.add(row.tanggal);
    datesByUser.set(row.user_id, set);
  }

  const weeks = buildPeriodWeeks(start, end, today);
  const totalPeriodDays = weeks.flat().filter((c) => c.inPeriod).length;

  const members: CalendarMember[] = ((profiles as Profile[]) ?? []).map((p) => {
    const hasDailyLog = DAILY_LOG_ROLES.includes(p.role);
    const filledDates = Array.from(datesByUser.get(p.id) ?? []);
    const missedCount = hasDailyLog
      ? weeks.flat().filter((c) => c.inPeriod && c.iso <= today && !filledDates.includes(c.iso)).length
      : 0;
    return {
      id: p.id,
      fullName: p.full_name,
      roleLabel: ROLE_LABELS[p.role],
      hasDailyLog,
      filledDates,
      filledCount: filledDates.length,
      missedCount,
      totalPeriodDays,
    };
  });

  return {
    bulan,
    bulanLabel: formatMonthLabel(anchorDate),
    periodeRangeLabel: formatPeriodRangeLabel(anchorDate),
    weeks,
    todayIso: today,
    members,
  };
}

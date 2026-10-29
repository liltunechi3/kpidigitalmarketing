import { requireAdmin } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import {
  monthRange,
  currentPeriodLabel,
  formatMonthLabel,
  formatPeriodRangeLabel,
  buildPeriodWeeks,
  todayISO,
} from "@/lib/date";
import { MonthSelector } from "@/components/MonthSelector";
import { ROLE_LABELS } from "@/lib/roles";
import { TeamCalendar, type CalendarMember } from "@/components/TeamCalendar";
import type { Profile, TeamRole } from "@/lib/supabase/types";

export default async function TeamCalendarPage({
  searchParams,
}: {
  searchParams: Promise<{ bulan?: string }>;
}) {
  await requireAdmin();
  const { bulan: bulanParam } = await searchParams;
  const bulan = bulanParam || currentPeriodLabel();
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

  const DAILY_LOG_ROLES: TeamRole[] = ["content_creator", "graphic_designer", "host_live"];

  const members: CalendarMember[] = ((profiles as Profile[]) ?? []).map((p) => {
    const hasDailyLog = DAILY_LOG_ROLES.includes(p.role);
    const filledDates = Array.from(datesByUser.get(p.id) ?? []);
    const filledCount = filledDates.length;
    const missedCount = hasDailyLog
      ? weeks
          .flat()
          .filter((c) => c.inPeriod && c.iso <= today && !filledDates.includes(c.iso)).length
      : 0;
    return {
      id: p.id,
      fullName: p.full_name,
      roleLabel: ROLE_LABELS[p.role],
      hasDailyLog,
      filledDates,
      filledCount,
      missedCount,
      totalPeriodDays,
    };
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold text-neutral-900">Kalender Tim</h1>
          <p className="text-sm text-neutral-500">Pantau konsistensi pengisian aktivitas harian tiap anggota.</p>
        </div>
        <MonthSelector bulan={bulan} basePath="/dashboard/admin/team/calendar" />
      </div>

      <TeamCalendar
        members={members}
        weeks={weeks}
        todayIso={today}
        bulan={bulan}
        bulanLabel={formatMonthLabel(anchorDate)}
        periodeRangeLabel={formatPeriodRangeLabel(anchorDate)}
      />
    </div>
  );
}

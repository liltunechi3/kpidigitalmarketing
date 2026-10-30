import Link from "next/link";
import { requireProfile } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import {
  currentPeriodLabel,
  periodeFirstOfMonth,
  formatMonthLabel,
  formatPeriodRangeLabel,
  monthRange,
  lastNMonths,
  daysUntil,
  todayISO,
  buildPeriodWeeks,
} from "@/lib/date";
import { ROLE_LABELS } from "@/lib/roles";
import { scoreForProfile } from "@/lib/kpi/teamScores";
import { scoreStatus, STATUS_COLOR, STATUS_LABEL, meetsKkm, KKM_THRESHOLD } from "@/lib/kpi/status";
import { ScoreGauge } from "@/components/viz/ScoreGauge";
import { KpiBar } from "@/components/viz/KpiBar";
import { StatTile } from "@/components/viz/StatTile";
import { MonthlyTrendChart } from "@/components/viz/MonthlyTrendChart";
import { TeamBarChart, type TeamBarDatum } from "@/components/viz/TeamBarChart";
import { PersonalCalendar } from "@/components/PersonalCalendar";
import { TeamActivityCalendar, type CalendarMember } from "@/components/TeamActivityCalendar";
import {
  IconChecklist,
  IconChart,
  IconUsers,
  IconCalendar,
  IconTarget,
  IconTrendUp,
  IconClock,
  IconAlert,
  IconChevronRight,
} from "@/components/icons";
import type { KpiDefinition, Profile, TeamRole } from "@/lib/supabase/types";

const DAILY_LOG_ROLES: TeamRole[] = ["content_creator", "graphic_designer", "host_live"];

function Greeting() {
  const h = new Date().getHours();
  if (h < 11) return "Selamat pagi";
  if (h < 15) return "Selamat siang";
  if (h < 18) return "Selamat sore";
  return "Selamat malam";
}

export default async function DashboardHomePage() {
  const { userId, profile } = await requireProfile();
  const bulan = currentPeriodLabel();
  const anchorDate = `${bulan}-01`;
  const periode = periodeFirstOfMonth(anchorDate);
  const [, periodeEnd] = monthRange(anchorDate);
  const sisaHari = daysUntil(periodeEnd);
  const supabase = await createClient();

  if (profile.role === "head_digital_marketing") {
    const today = todayISO();
    const [hodStart, hodEnd] = monthRange(anchorDate);
    const [{ data: profiles }, { data: defs }, { data: hodInput }, { data: ccLogs }, { data: gdLogs }, { data: hlLogs }] =
      await Promise.all([
        supabase.from("profiles").select("*").order("full_name", { ascending: true }),
        supabase.from("kpi_definitions").select("*"),
        supabase
          .from("monthly_hod_input")
          .select("id")
          .eq("user_id", userId)
          .eq("periode", periode)
          .maybeSingle(),
        supabase.from("log_content_creator").select("user_id, tanggal").gte("tanggal", hodStart).lte("tanggal", hodEnd),
        supabase.from("log_graphic_designer").select("user_id, tanggal").gte("tanggal", hodStart).lte("tanggal", hodEnd),
        supabase.from("log_host_live").select("user_id, tanggal").gte("tanggal", hodStart).lte("tanggal", hodEnd),
      ]);
    const definitions = (defs as KpiDefinition[]) ?? [];

    const datesByUser = new Map<string, Set<string>>();
    for (const row of [...(ccLogs ?? []), ...(gdLogs ?? []), ...(hlLogs ?? [])] as {
      user_id: string;
      tanggal: string;
    }[]) {
      const set = datesByUser.get(row.user_id) ?? new Set<string>();
      set.add(row.tanggal);
      datesByUser.set(row.user_id, set);
    }
    const calendarWeeks = buildPeriodWeeks(hodStart, hodEnd, today);
    const totalPeriodDays = calendarWeeks.flat().filter((c) => c.inPeriod).length;
    const calendarMembers: CalendarMember[] = ((profiles as Profile[]) ?? []).map((p) => {
      const hasDailyLog = DAILY_LOG_ROLES.includes(p.role);
      const filledDates = Array.from(datesByUser.get(p.id) ?? []);
      const missedCount = hasDailyLog
        ? calendarWeeks.flat().filter((c) => c.inPeriod && c.iso <= today && !filledDates.includes(c.iso)).length
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

    const rows = await Promise.all(
      ((profiles as Profile[]) ?? []).map(async (p) => {
        const result = await scoreForProfile(supabase, p, anchorDate, periode, definitions);
        const percent = result.totalBobot > 0 ? (result.total / result.totalBobot) * 100 : null;
        return { profile: p, result, percent };
      })
    );

    const withScore = rows.filter((r) => r.percent !== null) as { profile: Profile; percent: number }[];
    const avgPercent = withScore.length
      ? withScore.reduce((s, r) => s + r.percent, 0) / withScore.length
      : 0;
    const goodCount = withScore.filter((r) => meetsKkm(r.percent)).length;
    const attention = [...withScore].sort((a, b) => a.percent - b.percent).slice(0, 4);

    const chartData: TeamBarDatum[] = rows.map(({ profile: p, percent }) => ({
      id: p.id,
      name: p.full_name,
      role: ROLE_LABELS[p.role],
      percent,
    }));

    return (
      <div className="space-y-5">
        <DashboardHeader
          title={`${Greeting()}, ${profile.full_name.split(" ")[0]}`}
          subtitle={`${formatMonthLabel(anchorDate)} · ${formatPeriodRangeLabel(anchorDate)} · ${sisaHari >= 0 ? `${sisaHari} hari lagi periode berakhir` : "periode telah berakhir"}`}
        />

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <StatTile
            label="Rata-rata Skor Tim"
            value={`${Math.round(avgPercent)}%`}
            icon={<IconTrendUp className="h-3.5 w-3.5" />}
          />
          <StatTile
            label="Anggota Capai KKM"
            value={`${goodCount} / ${withScore.length}`}
            icon={<IconTarget className="h-3.5 w-3.5" />}
          />
          <StatTile label="Total Anggota Tim" value={`${rows.length}`} icon={<IconUsers className="h-3.5 w-3.5" />} />
          <StatTile
            label="Input Bulanan Anda"
            value={hodInput ? "Terisi" : "Belum Isi"}
            accent={hodInput ? STATUS_COLOR.good : STATUS_COLOR.critical}
            icon={<IconCalendar className="h-3.5 w-3.5" />}
          />
        </div>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1.6fr_1fr]">
          <TeamBarChart data={chartData} bulan={bulan} />

          <div className="space-y-4">
            <div className="rounded-2xl border border-black/[0.06] bg-white p-4 shadow-[0_1px_2px_rgba(16,15,10,0.04),0_10px_28px_-16px_rgba(16,15,10,0.22)]">
              <div className="mb-3 flex items-center gap-2">
                <IconAlert className="h-4 w-4 text-neutral-400" />
                <p className="text-sm font-semibold text-neutral-700">Perlu Perhatian</p>
              </div>
              {attention.length === 0 ? (
                <p className="text-sm text-neutral-400">Belum ada data skor bulan ini.</p>
              ) : (
                <div className="space-y-1">
                  {attention.map((r) => (
                    <Link
                      key={r.profile.id}
                      href={`/dashboard/admin/team/${r.profile.id}`}
                      className="-mx-2 flex items-center justify-between rounded-xl px-2 py-2 transition-colors hover:bg-cream-100/70"
                    >
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-neutral-900">{r.profile.full_name}</p>
                        <p className="truncate text-xs text-neutral-400">{ROLE_LABELS[r.profile.role]}</p>
                      </div>
                      <span
                        className="shrink-0 rounded-full px-2 py-0.5 text-xs font-semibold"
                        style={{ color: STATUS_COLOR[scoreStatus(r.percent)], backgroundColor: `${STATUS_COLOR[scoreStatus(r.percent)]}1a` }}
                      >
                        {Math.round(r.percent)}%
                      </span>
                    </Link>
                  ))}
                </div>
              )}
            </div>

            <QuickLinks
              links={[
                { href: "/dashboard/admin/monthly-input", label: "Input Bulanan (HOD)", icon: IconCalendar },
                { href: "/dashboard/admin/team", label: "Ringkasan Tim Lengkap", icon: IconUsers },
                { href: "/dashboard/admin/kpi-settings", label: "Pengaturan Bobot KPI", icon: IconTarget },
              ]}
            />
          </div>
        </div>

        <TeamActivityCalendar members={calendarMembers} weeks={calendarWeeks} todayIso={today} bulan={bulan} />
      </div>
    );
  }

  // Staff dashboard (content_creator / graphic_designer / host_live)
  const [start, end] = monthRange(anchorDate);
  const logTable =
    profile.role === "content_creator"
      ? "log_content_creator"
      : profile.role === "graphic_designer"
        ? "log_graphic_designer"
        : "log_host_live";

  const today = todayISO();
  const [{ data: defs }, { data: logDates }] = await Promise.all([
    supabase.from("kpi_definitions").select("*").eq("role", profile.role).order("urutan", { ascending: true }),
    supabase.from(logTable).select("tanggal").eq("user_id", userId).gte("tanggal", start).lte("tanggal", end),
  ]);
  const definitions = (defs as KpiDefinition[]) ?? [];
  const filledDates = Array.from(new Set(((logDates as { tanggal: string }[]) ?? []).map((r) => r.tanggal)));

  const months = lastNMonths(anchorDate, 6);
  const [result, trend] = await Promise.all([
    scoreForProfile(supabase, profile, anchorDate, periode, definitions),
    Promise.all(
      months.map(async (m) => {
        const p = periodeFirstOfMonth(m.anchorDate);
        const r = await scoreForProfile(supabase, profile, m.anchorDate, p, definitions);
        return { label: m.label, percent: r.totalBobot > 0 ? (r.total / r.totalBobot) * 100 : 0 };
      })
    ),
  ]);

  const overallPercent = result.totalBobot > 0 ? (result.total / result.totalBobot) * 100 : 0;
  const filledToday = filledDates.includes(today);
  const topKpis = result.rows.slice(0, 3);

  const calendarWeeks = buildPeriodWeeks(start, end, today);
  const totalPeriodDays = calendarWeeks.flat().filter((c) => c.inPeriod).length;
  const missedCount = calendarWeeks
    .flat()
    .filter((c) => c.inPeriod && c.iso <= today && !filledDates.includes(c.iso)).length;

  return (
    <div className="space-y-5">
      <DashboardHeader
        title={`${Greeting()}, ${profile.full_name.split(" ")[0]}`}
        subtitle={`${ROLE_LABELS[profile.role]} · ${formatMonthLabel(anchorDate)} · ${formatPeriodRangeLabel(anchorDate)}`}
      />

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatTile
          label="Skor Bulan Ini"
          value={`${Math.round(overallPercent)}%`}
          accent={STATUS_COLOR[scoreStatus(overallPercent)]}
          icon={<IconTrendUp className="h-3.5 w-3.5" />}
          sub={STATUS_LABEL[scoreStatus(overallPercent)]}
        />
        <StatTile
          label="Status KKM"
          value={meetsKkm(overallPercent) ? "Tercapai" : "Belum"}
          accent={meetsKkm(overallPercent) ? STATUS_COLOR.good : undefined}
          icon={<IconTarget className="h-3.5 w-3.5" />}
          sub={`Ambang ${KKM_THRESHOLD}%`}
        />
        <StatTile
          label="Entri Bulan Ini"
          value={`${filledDates.length}`}
          icon={<IconChecklist className="h-3.5 w-3.5" />}
          sub="Hari / sesi terisi"
        />
        <StatTile
          label="Hari Ini"
          value={filledToday ? "Sudah Isi" : "Belum Isi"}
          accent={filledToday ? STATUS_COLOR.good : STATUS_COLOR.warning}
          icon={<IconClock className="h-3.5 w-3.5" />}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[auto_1fr]">
        <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-black/[0.06] bg-white p-6 shadow-[0_1px_2px_rgba(16,15,10,0.04),0_10px_28px_-16px_rgba(16,15,10,0.22)] lg:w-64">
          <ScoreGauge percent={overallPercent} caption="Skor Total" size={140} />
          <Link
            href="/dashboard/score"
            className="flex items-center gap-1 text-xs font-medium text-neutral-500 hover:text-ink"
          >
            Lihat detail skor <IconChevronRight className="h-3 w-3" />
          </Link>
        </div>

        <div className="space-y-4">
          <div className="rounded-2xl border border-black/[0.06] bg-white p-5 shadow-[0_1px_2px_rgba(16,15,10,0.04),0_10px_28px_-16px_rgba(16,15,10,0.22)]">
            <p className="mb-3 text-sm font-semibold text-neutral-700">KPI Utama</p>
            <div className="space-y-4">
              {topKpis.map((row) => (
                <KpiBar
                  key={row.id}
                  label={row.kpi_name}
                  sublabel={`target ${row.target_label}`}
                  percent={row.skor * 100}
                />
              ))}
            </div>
          </div>

          <QuickLinks
            links={[
              {
                href: "/dashboard/todo",
                label: filledToday ? "Lihat / Ubah To-Do Hari Ini" : "Isi To-Do Hari Ini",
                icon: IconChecklist,
                highlight: !filledToday,
              },
              { href: "/dashboard/score", label: "Riwayat Aktivitas & Skor Lengkap", icon: IconChart },
            ]}
          />
        </div>
      </div>

      <PersonalCalendar
        weeks={calendarWeeks}
        filledDates={filledDates}
        todayIso={today}
        filledCount={filledDates.length}
        missedCount={missedCount}
        totalPeriodDays={totalPeriodDays}
      />

      <MonthlyTrendChart points={trend} />
    </div>
  );
}

function DashboardHeader({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div>
      <h1 className="text-xl font-semibold tracking-tight text-neutral-900">{title}</h1>
      <p className="mt-0.5 text-sm text-neutral-500">{subtitle}</p>
    </div>
  );
}

function QuickLinks({
  links,
}: {
  links: { href: string; label: string; icon: React.ComponentType<{ className?: string }>; highlight?: boolean }[];
}) {
  return (
    <div className="rounded-2xl border border-black/[0.06] bg-white p-3 shadow-[0_1px_2px_rgba(16,15,10,0.04),0_10px_28px_-16px_rgba(16,15,10,0.22)]">
      {links.map((link, i) => {
        const Icon = link.icon;
        return (
          <Link
            key={link.href}
            href={link.href}
            className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
              link.highlight ? "bg-accent-soft text-ink" : "text-neutral-700 hover:bg-cream-100/70"
            } ${i > 0 ? "mt-1" : ""}`}
          >
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-white/70">
              <Icon className="h-3.5 w-3.5" />
            </span>
            <span className="min-w-0 flex-1 truncate">{link.label}</span>
            <IconChevronRight className="h-3.5 w-3.5 shrink-0 text-neutral-400" />
          </Link>
        );
      })}
    </div>
  );
}

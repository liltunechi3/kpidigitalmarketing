"use server";

import { requireProfile, requireAdmin } from "@/lib/auth";
import {
  fetchPersonalCalendar,
  fetchTeamCalendar,
  type PersonalCalendarData,
  type TeamCalendarData,
} from "@/lib/kpi/calendarData";

export async function getPersonalCalendarMonth(bulan: string): Promise<PersonalCalendarData> {
  const { userId, profile } = await requireProfile();
  if (profile.role === "head_digital_marketing") {
    throw new Error("Role ini tidak punya kalender aktivitas harian.");
  }
  return fetchPersonalCalendar(userId, profile.role, bulan);
}

export async function getTeamCalendarMonth(bulan: string): Promise<TeamCalendarData> {
  await requireAdmin();
  return fetchTeamCalendar(bulan);
}

import { requireAdmin } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { periodeFirstOfMonth, formatMonthLabel, formatPeriodRangeLabel, currentPeriodLabel } from "@/lib/date";
import { MonthSelector } from "@/components/MonthSelector";
import { HodMonthlyInputForm } from "@/components/forms/HodMonthlyInputForm";
import type { MonthlyHodInput } from "@/lib/supabase/types";

export default async function MonthlyInputPage({
  searchParams,
}: {
  searchParams: Promise<{ bulan?: string }>;
}) {
  const { userId } = await requireAdmin();
  const { bulan: bulanParam } = await searchParams;
  const bulan = bulanParam || currentPeriodLabel();
  const anchorDate = `${bulan}-01`;
  const periode = periodeFirstOfMonth(anchorDate);
  const supabase = await createClient();

  const { data: existing } = await supabase
    .from("monthly_hod_input")
    .select("*")
    .eq("user_id", userId)
    .eq("periode", periode)
    .maybeSingle();

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold text-neutral-900">Input Bulanan (Head of Digital Marketing)</h1>
          <p className="text-sm text-neutral-500">
            {formatMonthLabel(anchorDate)} &middot; {formatPeriodRangeLabel(anchorDate)}
          </p>
        </div>
        <MonthSelector bulan={bulan} basePath="/dashboard/admin/monthly-input" />
      </div>

      <HodMonthlyInputForm key={periode} periode={periode} existing={existing as MonthlyHodInput | null} />
    </div>
  );
}

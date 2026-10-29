import { renderToBuffer } from "@react-pdf/renderer";
import { requireAdmin } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { periodeFirstOfMonth, formatMonthLabel, formatPeriodRangeLabel, currentPeriodLabel } from "@/lib/date";
import { scoreForProfile } from "@/lib/kpi/teamScores";
import { MonthlyReportDocument, type MemberReportData } from "@/lib/report/MonthlyReportDocument";
import { buildMonthlyReportWorkbook } from "@/lib/report/monthlyReportExcel";
import type { KpiDefinition, Profile } from "@/lib/supabase/types";

export async function GET(request: Request) {
  await requireAdmin();
  const supabase = await createClient();

  const { searchParams } = new URL(request.url);
  const bulan = searchParams.get("bulan") || currentPeriodLabel();
  const format = searchParams.get("format") === "xlsx" ? "xlsx" : "pdf";
  const anchorDate = `${bulan}-01`;
  const periode = periodeFirstOfMonth(anchorDate);

  const [{ data: profiles }, { data: defs }] = await Promise.all([
    supabase.from("profiles").select("*").order("full_name", { ascending: true }),
    supabase.from("kpi_definitions").select("*"),
  ]);
  const definitions = (defs as KpiDefinition[]) ?? [];

  const members: MemberReportData[] = await Promise.all(
    ((profiles as Profile[]) ?? []).map(async (profile) => {
      const result = await scoreForProfile(supabase, profile, anchorDate, periode, definitions);
      return { profile, result };
    })
  );

  const bulanLabel = formatMonthLabel(anchorDate);
  const periodeRangeLabel = formatPeriodRangeLabel(anchorDate);

  if (format === "xlsx") {
    const workbook = await buildMonthlyReportWorkbook(members, bulanLabel, periodeRangeLabel);
    const buffer = await workbook.xlsx.writeBuffer();

    return new Response(new Uint8Array(buffer), {
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename="laporan-kpi-${bulan}.xlsx"`,
      },
    });
  }

  const buffer = await renderToBuffer(
    <MonthlyReportDocument members={members} bulanLabel={bulanLabel} periodeRangeLabel={periodeRangeLabel} />
  );

  return new Response(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="laporan-kpi-${bulan}.pdf"`,
    },
  });
}

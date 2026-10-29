import ExcelJS from "exceljs";
import { ROLE_LABELS, ROLE_OPTIONS } from "@/lib/roles";
import type { MemberReportData } from "@/lib/report/MonthlyReportDocument";

const AMBER = "FFFFC000";
const BORDER_COLOR = "FF9C8A3A";

const thinBorder = {
  top: { style: "thin" as const, color: { argb: BORDER_COLOR } },
  left: { style: "thin" as const, color: { argb: BORDER_COLOR } },
  bottom: { style: "thin" as const, color: { argb: BORDER_COLOR } },
  right: { style: "thin" as const, color: { argb: BORDER_COLOR } },
};

const amberFill: ExcelJS.Fill = {
  type: "pattern",
  pattern: "solid",
  fgColor: { argb: AMBER },
};

function formatRealisasi(value: number, unit: string) {
  const rounded = Math.round(value * 100) / 100;
  if (unit === "%") return `${rounded}%`;
  if (unit === "Rp/Leads") return `Rp ${rounded.toLocaleString("id-ID")}`;
  return `${rounded.toLocaleString("id-ID")} ${unit}`;
}

function safeSheetName(name: string) {
  return name.replace(/[:\\/?*[\]]/g, "").slice(0, 31);
}

export async function buildMonthlyReportWorkbook(
  members: MemberReportData[],
  bulanLabel: string,
  periodeRangeLabel: string
): Promise<ExcelJS.Workbook> {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = "KPI Digital Marketing";
  workbook.created = new Date();

  for (const roleOption of ROLE_OPTIONS) {
    const roleMembers = members.filter((m) => m.profile.role === roleOption.value);
    if (roleMembers.length === 0) continue;

    const sheet = workbook.addWorksheet(safeSheetName(ROLE_LABELS[roleOption.value]));
    sheet.columns = [
      { width: 6 },
      { width: 24 },
      { width: 42 },
      { width: 10 },
      { width: 20 },
      { width: 18 },
      { width: 10 },
      { width: 14 },
    ];

    let r = 1;
    for (const { profile, result } of roleMembers) {
      const titleRow = sheet.getRow(r);
      titleRow.getCell(1).value = `Skor KPI - ${profile.full_name}`;
      titleRow.getCell(1).font = { bold: true, size: 14 };
      sheet.mergeCells(r, 1, r, 5);
      r += 1;

      const subtitleRow = sheet.getRow(r);
      subtitleRow.getCell(1).value = `${ROLE_LABELS[profile.role]} - ${bulanLabel} (${periodeRangeLabel})`;
      subtitleRow.getCell(1).font = { italic: true, size: 10, color: { argb: "FF6B7280" } };
      sheet.mergeCells(r, 1, r, 5);
      r += 1;

      const headerRow = sheet.getRow(r);
      const headers = [
        "No.",
        "Area Kinerja Utama",
        "Key Performance Indicators",
        "Bobot",
        "Target",
        "Realisasi",
        "Skor",
        "Skor Akhir",
      ];
      headers.forEach((h, i) => {
        const cell = headerRow.getCell(i + 1);
        cell.value = h;
        cell.font = { bold: true, size: 11 };
        cell.fill = amberFill;
        cell.alignment = { horizontal: "center", vertical: "middle", wrapText: true };
        cell.border = thinBorder;
      });
      r += 1;

      result.rows.forEach((row, i) => {
        const dataRow = sheet.getRow(r);
        const values = [
          i + 1,
          row.area_kinerja,
          row.kpi_name,
          row.bobot,
          row.target_label,
          formatRealisasi(row.realisasi, row.unit),
          `${Math.round(row.skor * 100)}%`,
          Number(row.skor_akhir.toFixed(1)),
        ];
        values.forEach((v, ci) => {
          const cell = dataRow.getCell(ci + 1);
          cell.value = v;
          cell.border = thinBorder;
          cell.alignment = {
            horizontal: ci === 1 || ci === 2 ? "left" : "center",
            vertical: "middle",
          };
          if (ci === 5) cell.font = { bold: true };
        });
        r += 1;
      });

      const totalRow = sheet.getRow(r);
      totalRow.getCell(1).border = thinBorder;
      totalRow.getCell(2).border = thinBorder;
      totalRow.getCell(3).value = "Total Skor KPI";
      totalRow.getCell(3).font = { bold: true };
      totalRow.getCell(3).border = thinBorder;
      totalRow.getCell(4).value = result.totalBobot;
      totalRow.getCell(4).font = { bold: true };
      totalRow.getCell(4).fill = amberFill;
      totalRow.getCell(4).alignment = { horizontal: "center" };
      totalRow.getCell(4).border = thinBorder;
      totalRow.getCell(5).border = thinBorder;
      totalRow.getCell(6).border = thinBorder;
      totalRow.getCell(7).border = thinBorder;
      totalRow.getCell(8).value = Number(result.total.toFixed(1));
      totalRow.getCell(8).font = { bold: true, size: 12 };
      totalRow.getCell(8).fill = amberFill;
      totalRow.getCell(8).alignment = { horizontal: "center" };
      totalRow.getCell(8).border = thinBorder;
      r += 3;
    }
  }

  return workbook;
}

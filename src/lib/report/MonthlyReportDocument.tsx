import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";
import type { KpiScoreResult } from "@/lib/kpi/score";
import { ROLE_LABELS } from "@/lib/roles";
import type { Profile } from "@/lib/supabase/types";

const AMBER = "#FFC000";
const BORDER = "#9C8A3A";

const styles = StyleSheet.create({
  page: {
    padding: 28,
    fontSize: 10,
    fontFamily: "Helvetica",
    color: "#111827",
  },
  title: {
    fontSize: 16,
    fontFamily: "Helvetica-Bold",
    marginBottom: 2,
  },
  subtitle: {
    fontSize: 10,
    color: "#4B5563",
    marginBottom: 14,
  },
  table: {
    borderWidth: 1,
    borderColor: BORDER,
  },
  row: {
    flexDirection: "row",
  },
  headerCell: {
    backgroundColor: AMBER,
    fontFamily: "Helvetica-Bold",
    fontSize: 10,
    textAlign: "center",
    padding: 6,
    borderWidth: 0.5,
    borderColor: BORDER,
    justifyContent: "center",
  },
  cell: {
    fontSize: 9.5,
    padding: 6,
    borderWidth: 0.5,
    borderColor: BORDER,
    justifyContent: "center",
  },
  totalCell: {
    backgroundColor: AMBER,
    fontFamily: "Helvetica-Bold",
    fontSize: 11,
    padding: 6,
    borderWidth: 0.5,
    borderColor: BORDER,
    textAlign: "center",
    justifyContent: "center",
  },
  colNo: { width: "4%" },
  colArea: { width: "14%" },
  colKpi: { width: "28%" },
  colBobot: { width: "9%", textAlign: "center" },
  colTarget: { width: "13%", textAlign: "center" },
  colRealisasi: { width: "13%", textAlign: "center" },
  colSkor: { width: "9%", textAlign: "center" },
  colSkorAkhir: { width: "10%", textAlign: "center" },
  footer: {
    position: "absolute",
    bottom: 16,
    left: 28,
    right: 28,
    fontSize: 8,
    color: "#9CA3AF",
    flexDirection: "row",
    justifyContent: "space-between",
  },
});

function formatRealisasi(value: number, unit: string) {
  const rounded = Math.round(value * 100) / 100;
  if (unit === "%") return `${rounded}%`;
  if (unit === "Rp/Leads") return `Rp ${rounded.toLocaleString("id-ID")}`;
  return `${rounded.toLocaleString("id-ID")} ${unit}`;
}

export type MemberReportData = {
  profile: Profile;
  result: KpiScoreResult;
};

export function MonthlyReportDocument({
  members,
  bulanLabel,
  periodeRangeLabel,
}: {
  members: MemberReportData[];
  bulanLabel: string;
  periodeRangeLabel: string;
}) {
  return (
    <Document title={`Laporan KPI Tim - ${bulanLabel}`}>
      {members.map(({ profile, result }) => (
        <Page key={profile.id} size="A4" orientation="landscape" style={styles.page}>
          <Text style={styles.title}>Skor KPI - {profile.full_name}</Text>
          <Text style={styles.subtitle}>
            {ROLE_LABELS[profile.role]} · {bulanLabel} ({periodeRangeLabel})
          </Text>

          <View style={styles.table}>
            <View style={styles.row}>
              <Text style={[styles.headerCell, styles.colNo]}>No.</Text>
              <Text style={[styles.headerCell, styles.colArea]}>Area Kinerja Utama</Text>
              <Text style={[styles.headerCell, styles.colKpi]}>Key Performance Indicators</Text>
              <Text style={[styles.headerCell, styles.colBobot]}>Bobot</Text>
              <Text style={[styles.headerCell, styles.colTarget]}>Target</Text>
              <Text style={[styles.headerCell, styles.colRealisasi]}>Realisasi</Text>
              <Text style={[styles.headerCell, styles.colSkor]}>Skor</Text>
              <Text style={[styles.headerCell, styles.colSkorAkhir]}>Skor Akhir</Text>
            </View>

            {result.rows.map((row, i) => (
              <View style={styles.row} key={row.id}>
                <Text style={[styles.cell, styles.colNo, { textAlign: "center" }]}>{i + 1}</Text>
                <Text style={[styles.cell, styles.colArea]}>{row.area_kinerja}</Text>
                <Text style={[styles.cell, styles.colKpi]}>{row.kpi_name}</Text>
                <Text style={[styles.cell, styles.colBobot]}>{row.bobot}</Text>
                <Text style={[styles.cell, styles.colTarget]}>{row.target_label}</Text>
                <Text style={[styles.cell, styles.colRealisasi, { fontFamily: "Helvetica-Bold" }]}>
                  {formatRealisasi(row.realisasi, row.unit)}
                </Text>
                <Text style={[styles.cell, styles.colSkor]}>{Math.round(row.skor * 100)}%</Text>
                <Text style={[styles.cell, styles.colSkorAkhir]}>{row.skor_akhir.toFixed(1)}</Text>
              </View>
            ))}

            <View style={styles.row}>
              <Text style={[styles.cell, styles.colNo]}></Text>
              <Text style={[styles.cell, styles.colArea]}></Text>
              <Text style={[styles.cell, styles.colKpi, { fontFamily: "Helvetica-Bold" }]}>
                Total Skor KPI
              </Text>
              <Text style={[styles.totalCell, styles.colBobot]}>{result.totalBobot}</Text>
              <Text style={[styles.cell, styles.colTarget]}></Text>
              <Text style={[styles.cell, styles.colRealisasi]}></Text>
              <Text style={[styles.cell, styles.colSkor]}></Text>
              <Text style={[styles.totalCell, styles.colSkorAkhir]}>{result.total.toFixed(1)}</Text>
            </View>
          </View>

          <View style={styles.footer} fixed>
            <Text>Laporan KPI Digital Marketing</Text>
            <Text render={({ pageNumber, totalPages }) => `Halaman ${pageNumber} / ${totalPages}`} />
          </View>
        </Page>
      ))}
    </Document>
  );
}

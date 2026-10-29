import type {
  LogContentCreator,
  LogGraphicDesigner,
  LogHostLive,
  MonthlyHodInput,
  TeamRole,
} from "@/lib/supabase/types";

function formatDate(iso: string) {
  const [, m, d] = iso.split("-");
  return `${d}/${m}`;
}

export function ActivityLogTable({
  role,
  contentCreatorLogs,
  graphicDesignerLogs,
  hostLiveLogs,
  hodInput,
}: {
  role: TeamRole;
  contentCreatorLogs?: LogContentCreator[];
  graphicDesignerLogs?: LogGraphicDesigner[];
  hostLiveLogs?: LogHostLive[];
  hodInput?: MonthlyHodInput | null;
}) {
  if (role === "content_creator") {
    const logs = contentCreatorLogs ?? [];
    return (
      <div className="overflow-x-auto rounded-2xl border border-black/[0.06] bg-white shadow-[0_1px_2px_rgba(16,15,10,0.04),0_10px_28px_-16px_rgba(16,15,10,0.22)]">
        <table className="w-full text-left text-sm">
          <thead className="bg-cream-100/70 text-[11px] font-semibold uppercase tracking-wide text-neutral-500">
            <tr>
              <th className="px-3 py-2">Tgl</th>
              <th className="px-3 py-2">Editing Apa Saja</th>
              <th className="px-3 py-2">Postingan Konten</th>
              <th className="px-3 py-2">Bukti</th>
              <th className="px-3 py-2">Revisi</th>
              <th className="px-3 py-2">Leads</th>
            </tr>
          </thead>
          <tbody>
            {logs.length === 0 && (
              <tr>
                <td className="px-3 py-4 text-neutral-400" colSpan={6}>
                  Belum ada entri bulan ini.
                </td>
              </tr>
            )}
            {logs.map((l) => (
              <tr key={l.id} className="border-t border-black/[0.045] align-top">
                <td className="px-3 py-2 text-neutral-500">{formatDate(l.tanggal)}</td>
                <td className="px-3 py-2">
                  <ul className="list-disc space-y-0.5 pl-4">
                    {l.todo_items.map((t, i) => (
                      <li key={i}>{t.text}</li>
                    ))}
                  </ul>
                </td>
                <td className="px-3 py-2 text-neutral-700">{l.postingan_konten || "-"}</td>
                <td className="px-3 py-2">
                  {l.bukti_link ? (
                    <a
                      href={l.bukti_link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 underline"
                    >
                      Link
                    </a>
                  ) : (
                    "-"
                  )}
                </td>
                <td className="px-3 py-2">{l.jumlah_revisi}</td>
                <td className="px-3 py-2">{l.jumlah_leads}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  if (role === "graphic_designer") {
    const logs = graphicDesignerLogs ?? [];
    return (
      <div className="overflow-x-auto rounded-2xl border border-black/[0.06] bg-white shadow-[0_1px_2px_rgba(16,15,10,0.04),0_10px_28px_-16px_rgba(16,15,10,0.22)]">
        <table className="w-full text-left text-sm">
          <thead className="bg-cream-100/70 text-[11px] font-semibold uppercase tracking-wide text-neutral-500">
            <tr>
              <th className="px-3 py-2">Tgl</th>
              <th className="px-3 py-2">To Do List</th>
              <th className="px-3 py-2">Pekerjaan</th>
              <th className="px-3 py-2">Tepat Waktu</th>
              <th className="px-3 py-2">Revisi</th>
            </tr>
          </thead>
          <tbody>
            {logs.length === 0 && (
              <tr>
                <td className="px-3 py-4 text-neutral-400" colSpan={5}>
                  Belum ada entri bulan ini.
                </td>
              </tr>
            )}
            {logs.map((l) => (
              <tr key={l.id} className="border-t border-black/[0.045] align-top">
                <td className="px-3 py-2 text-neutral-500">{formatDate(l.tanggal)}</td>
                <td className="px-3 py-2">
                  <ul className="space-y-0.5">
                    {l.todo_items.map((t, i) => (
                      <li key={i} className={t.done ? "text-neutral-700" : "text-neutral-400"}>
                        {t.done ? "☑" : "☐"} {t.text}
                      </li>
                    ))}
                  </ul>
                </td>
                <td className="px-3 py-2">{l.total_pekerjaan}</td>
                <td className="px-3 py-2">{l.total_tepat_waktu}</td>
                <td className="px-3 py-2">{l.total_revisi}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  if (role === "host_live") {
    const logs = hostLiveLogs ?? [];
    return (
      <div className="overflow-x-auto rounded-2xl border border-black/[0.06] bg-white shadow-[0_1px_2px_rgba(16,15,10,0.04),0_10px_28px_-16px_rgba(16,15,10,0.22)]">
        <table className="w-full text-left text-sm">
          <thead className="bg-cream-100/70 text-[11px] font-semibold uppercase tracking-wide text-neutral-500">
            <tr>
              <th className="px-3 py-2">Tgl</th>
              <th className="px-3 py-2">Jam</th>
              <th className="px-3 py-2">Konsep</th>
              <th className="px-3 py-2">Durasi</th>
              <th className="px-3 py-2">Views</th>
              <th className="px-3 py-2">Followers</th>
              <th className="px-3 py-2">Leads</th>
              <th className="px-3 py-2">Video</th>
            </tr>
          </thead>
          <tbody>
            {logs.length === 0 && (
              <tr>
                <td className="px-3 py-4 text-neutral-400" colSpan={8}>
                  Belum ada entri bulan ini.
                </td>
              </tr>
            )}
            {logs.map((l) => (
              <tr key={l.id} className="border-t border-black/[0.045]">
                <td className="px-3 py-2 text-neutral-500">{formatDate(l.tanggal)}</td>
                <td className="px-3 py-2">{l.jam_live || "-"}</td>
                <td className="px-3 py-2">{l.konsep || "-"}</td>
                <td className="px-3 py-2">{l.durasi_jam}j</td>
                <td className="px-3 py-2">{l.unique_views}</td>
                <td className="px-3 py-2">{l.new_followers}</td>
                <td className="px-3 py-2">{l.lead_masuk}</td>
                <td className="px-3 py-2">{l.jumlah_video}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  // head_digital_marketing
  if (!hodInput) {
    return (
      <div className="rounded-2xl border border-black/[0.06] bg-white shadow-[0_1px_2px_rgba(16,15,10,0.04),0_10px_28px_-16px_rgba(16,15,10,0.22)] p-5 text-sm text-neutral-400">
        Belum ada input bulanan untuk bulan ini.
      </div>
    );
  }
  return (
    <div className="grid grid-cols-2 gap-4 rounded-2xl border border-black/[0.06] bg-white shadow-[0_1px_2px_rgba(16,15,10,0.04),0_10px_28px_-16px_rgba(16,15,10,0.22)] p-5 text-sm sm:grid-cols-4">
      <div>
        <p className="text-xs text-neutral-500">Pencapaian Leads</p>
        <p className="font-semibold text-neutral-900">{hodInput.pencapaian_leads}</p>
      </div>
      <div>
        <p className="text-xs text-neutral-500">Total Survey</p>
        <p className="font-semibold text-neutral-900">{hodInput.total_survey}</p>
      </div>
      <div>
        <p className="text-xs text-neutral-500">Produktivitas Tim</p>
        <p className="font-semibold text-neutral-900">{hodInput.produktivitas_tim}%</p>
      </div>
      <div>
        <p className="text-xs text-neutral-500">Efisiensi Budget</p>
        <p className="font-semibold text-neutral-900">
          Rp {hodInput.total_budget.toLocaleString("id-ID")}/lead
        </p>
      </div>
      {hodInput.catatan && (
        <div className="col-span-full">
          <p className="text-xs text-neutral-500">Catatan</p>
          <p className="text-neutral-700">{hodInput.catatan}</p>
        </div>
      )}
    </div>
  );
}

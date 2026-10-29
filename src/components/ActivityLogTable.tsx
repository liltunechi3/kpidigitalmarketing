"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  updateContentCreatorLog,
  updateGraphicDesignerLog,
  updateHostLiveSession,
} from "@/app/dashboard/todo/actions";
import {
  adminUpdateContentCreatorLog,
  adminUpdateGraphicDesignerLog,
  adminUpdateHostLiveLog,
} from "@/app/dashboard/admin/team/actions";
import type {
  LogContentCreator,
  LogGraphicDesigner,
  LogHostLive,
  MonthlyHodInput,
  TeamRole,
  TodoItem,
} from "@/lib/supabase/types";

function formatDate(iso: string) {
  const [, m, d] = iso.split("-");
  return `${d}/${m}`;
}

const inputCls =
  "w-full rounded-lg border border-black/10 bg-white px-2 py-1 text-sm focus:border-ink focus:outline-none focus:ring-2 focus:ring-ink/5";
const smallBtn =
  "shrink-0 rounded-full border border-black/10 bg-white px-2 py-0.5 text-xs text-neutral-500 hover:bg-cream-100 transition";

type Mode = "self" | "admin";

function EditorItemsList({
  items,
  onChange,
  withDone,
}: {
  items: TodoItem[];
  onChange: (items: TodoItem[]) => void;
  withDone?: boolean;
}) {
  function update(idx: number, patch: Partial<TodoItem>) {
    onChange(items.map((it, i) => (i === idx ? { ...it, ...patch } : it)));
  }
  function add() {
    onChange([...items, { text: "", done: true }]);
  }
  function remove(idx: number) {
    onChange(items.filter((_, i) => i !== idx));
  }
  return (
    <div className="space-y-1.5">
      {items.map((it, idx) => (
        <div key={idx} className="flex items-center gap-1.5">
          {withDone && (
            <input
              type="checkbox"
              checked={it.done}
              onChange={(e) => update(idx, { done: e.target.checked })}
              className="shrink-0"
            />
          )}
          <input
            value={it.text}
            onChange={(e) => update(idx, { text: e.target.value })}
            className={inputCls}
            placeholder={`Item ${idx + 1}`}
          />
          <button type="button" onClick={() => remove(idx)} className={smallBtn}>
            ×
          </button>
        </div>
      ))}
      <button type="button" onClick={add} className="text-xs font-medium text-neutral-600 underline">
        + Tambah item
      </button>
    </div>
  );
}

function RowActions({
  editing,
  pending,
  onEdit,
  onSave,
  onCancel,
}: {
  editing: boolean;
  pending: boolean;
  onEdit: () => void;
  onSave: () => void;
  onCancel: () => void;
}) {
  if (editing) {
    return (
      <div className="flex flex-col gap-1">
        <button
          type="button"
          onClick={onSave}
          disabled={pending}
          className="rounded-full bg-ink px-2.5 py-1 text-xs font-medium text-white hover:bg-neutral-800 transition disabled:opacity-50"
        >
          {pending ? "..." : "Simpan"}
        </button>
        <button type="button" onClick={onCancel} className="text-xs text-neutral-500 underline">
          Batal
        </button>
      </div>
    );
  }
  return (
    <button type="button" onClick={onEdit} className={smallBtn}>
      Edit
    </button>
  );
}

export function ActivityLogTable({
  role,
  contentCreatorLogs,
  graphicDesignerLogs,
  hostLiveLogs,
  hodInput,
  mode = "self",
  targetUserId,
}: {
  role: TeamRole;
  contentCreatorLogs?: LogContentCreator[];
  graphicDesignerLogs?: LogGraphicDesigner[];
  hostLiveLogs?: LogHostLive[];
  hodInput?: MonthlyHodInput | null;
  mode?: Mode;
  targetUserId?: string;
}) {
  const router = useRouter();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  // --- Content Creator -------------------------------------------------
  const [ccDraft, setCcDraft] = useState<{
    todo_items: TodoItem[];
    postingan_konten: string;
    bukti_link: string;
    jumlah_revisi: number;
    jumlah_leads: number;
  } | null>(null);

  function startEditCc(l: LogContentCreator) {
    setCcDraft({
      todo_items: l.todo_items.length ? l.todo_items : [{ text: "", done: true }],
      postingan_konten: l.postingan_konten ?? "",
      bukti_link: l.bukti_link ?? "",
      jumlah_revisi: l.jumlah_revisi,
      jumlah_leads: l.jumlah_leads,
    });
    setEditingId(l.id);
  }

  function saveCc(l: LogContentCreator) {
    if (!ccDraft) return;
    const payload = {
      ...ccDraft,
      todo_items: ccDraft.todo_items.filter((it) => it.text.trim().length > 0),
    };
    startTransition(async () => {
      if (mode === "admin" && targetUserId) {
        await adminUpdateContentCreatorLog(l.id, targetUserId, payload);
      } else {
        await updateContentCreatorLog(l.id, payload);
      }
      setEditingId(null);
      setCcDraft(null);
      router.refresh();
    });
  }

  // --- Graphic Designer --------------------------------------------------
  const [gdDraft, setGdDraft] = useState<{
    todo_items: TodoItem[];
    total_pekerjaan: number;
    total_tepat_waktu: number;
    total_revisi: number;
  } | null>(null);

  function startEditGd(l: LogGraphicDesigner) {
    setGdDraft({
      todo_items: l.todo_items.length ? l.todo_items : [{ text: "", done: false }],
      total_pekerjaan: l.total_pekerjaan,
      total_tepat_waktu: l.total_tepat_waktu,
      total_revisi: l.total_revisi,
    });
    setEditingId(l.id);
  }

  function saveGd(l: LogGraphicDesigner) {
    if (!gdDraft) return;
    const payload = {
      ...gdDraft,
      todo_items: gdDraft.todo_items.filter((it) => it.text.trim().length > 0),
    };
    startTransition(async () => {
      if (mode === "admin" && targetUserId) {
        await adminUpdateGraphicDesignerLog(l.id, targetUserId, payload);
      } else {
        await updateGraphicDesignerLog(l.id, payload);
      }
      setEditingId(null);
      setGdDraft(null);
      router.refresh();
    });
  }

  // --- Host Live -----------------------------------------------------
  const [hlDraft, setHlDraft] = useState<{
    jam_live: string;
    konsep: string;
    durasi_jam: number;
    unique_views: number;
    new_followers: number;
    lead_masuk: number;
    jumlah_video: number;
  } | null>(null);

  function startEditHl(l: LogHostLive) {
    setHlDraft({
      jam_live: l.jam_live ?? "",
      konsep: l.konsep ?? "",
      durasi_jam: l.durasi_jam,
      unique_views: l.unique_views,
      new_followers: l.new_followers,
      lead_masuk: l.lead_masuk,
      jumlah_video: l.jumlah_video,
    });
    setEditingId(l.id);
  }

  function saveHl(l: LogHostLive) {
    if (!hlDraft) return;
    startTransition(async () => {
      if (mode === "admin" && targetUserId) {
        await adminUpdateHostLiveLog(l.id, targetUserId, hlDraft);
      } else {
        // self-serve update replaces the whole row; carry through fields not
        // shown in this table so they aren't wiped out.
        await updateHostLiveSession(l.id, {
          ...hlDraft,
          lokasi_live: l.lokasi_live ?? "",
          active_viewers: l.active_viewers,
          bukti_link: l.bukti_link ?? "",
        });
      }
      setEditingId(null);
      setHlDraft(null);
      router.refresh();
    });
  }

  function cancelEdit() {
    setEditingId(null);
    setCcDraft(null);
    setGdDraft(null);
    setHlDraft(null);
  }

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
              <th className="px-3 py-2"></th>
            </tr>
          </thead>
          <tbody>
            {logs.length === 0 && (
              <tr>
                <td className="px-3 py-4 text-neutral-400" colSpan={7}>
                  Belum ada entri bulan ini.
                </td>
              </tr>
            )}
            {logs.map((l) => {
              const editing = editingId === l.id;
              return (
                <tr key={l.id} className="border-t border-black/[0.045] align-top">
                  <td className="px-3 py-2 text-neutral-500 whitespace-nowrap">{formatDate(l.tanggal)}</td>
                  <td className="px-3 py-2 min-w-[180px]">
                    {editing && ccDraft ? (
                      <EditorItemsList
                        items={ccDraft.todo_items}
                        onChange={(items) => setCcDraft((d) => (d ? { ...d, todo_items: items } : d))}
                      />
                    ) : (
                      <ul className="list-disc space-y-0.5 pl-4">
                        {l.todo_items.map((t, i) => (
                          <li key={i}>{t.text}</li>
                        ))}
                      </ul>
                    )}
                  </td>
                  <td className="px-3 py-2 text-neutral-700 min-w-[160px]">
                    {editing && ccDraft ? (
                      <input
                        value={ccDraft.postingan_konten}
                        onChange={(e) => setCcDraft((d) => (d ? { ...d, postingan_konten: e.target.value } : d))}
                        className={inputCls}
                      />
                    ) : (
                      l.postingan_konten || "-"
                    )}
                  </td>
                  <td className="px-3 py-2 min-w-[140px]">
                    {editing && ccDraft ? (
                      <input
                        value={ccDraft.bukti_link}
                        onChange={(e) => setCcDraft((d) => (d ? { ...d, bukti_link: e.target.value } : d))}
                        className={inputCls}
                        placeholder="https://..."
                      />
                    ) : l.bukti_link ? (
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
                  <td className="px-3 py-2 w-16">
                    {editing && ccDraft ? (
                      <input
                        type="number"
                        min={0}
                        value={ccDraft.jumlah_revisi}
                        onChange={(e) => setCcDraft((d) => (d ? { ...d, jumlah_revisi: Number(e.target.value) } : d))}
                        className={inputCls}
                      />
                    ) : (
                      l.jumlah_revisi
                    )}
                  </td>
                  <td className="px-3 py-2 w-16">
                    {editing && ccDraft ? (
                      <input
                        type="number"
                        min={0}
                        value={ccDraft.jumlah_leads}
                        onChange={(e) => setCcDraft((d) => (d ? { ...d, jumlah_leads: Number(e.target.value) } : d))}
                        className={inputCls}
                      />
                    ) : (
                      l.jumlah_leads
                    )}
                  </td>
                  <td className="px-3 py-2">
                    <RowActions
                      editing={editing}
                      pending={pending}
                      onEdit={() => startEditCc(l)}
                      onSave={() => saveCc(l)}
                      onCancel={cancelEdit}
                    />
                  </td>
                </tr>
              );
            })}
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
              <th className="px-3 py-2"></th>
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
            {logs.map((l) => {
              const editing = editingId === l.id;
              return (
                <tr key={l.id} className="border-t border-black/[0.045] align-top">
                  <td className="px-3 py-2 text-neutral-500 whitespace-nowrap">{formatDate(l.tanggal)}</td>
                  <td className="px-3 py-2 min-w-[180px]">
                    {editing && gdDraft ? (
                      <EditorItemsList
                        withDone
                        items={gdDraft.todo_items}
                        onChange={(items) => setGdDraft((d) => (d ? { ...d, todo_items: items } : d))}
                      />
                    ) : (
                      <ul className="space-y-0.5">
                        {l.todo_items.map((t, i) => (
                          <li key={i} className={t.done ? "text-neutral-700" : "text-neutral-400"}>
                            {t.done ? "☑" : "☐"} {t.text}
                          </li>
                        ))}
                      </ul>
                    )}
                  </td>
                  <td className="px-3 py-2 w-20">
                    {editing && gdDraft ? (
                      <input
                        type="number"
                        min={0}
                        value={gdDraft.total_pekerjaan}
                        onChange={(e) => setGdDraft((d) => (d ? { ...d, total_pekerjaan: Number(e.target.value) } : d))}
                        className={inputCls}
                      />
                    ) : (
                      l.total_pekerjaan
                    )}
                  </td>
                  <td className="px-3 py-2 w-20">
                    {editing && gdDraft ? (
                      <input
                        type="number"
                        min={0}
                        value={gdDraft.total_tepat_waktu}
                        onChange={(e) => setGdDraft((d) => (d ? { ...d, total_tepat_waktu: Number(e.target.value) } : d))}
                        className={inputCls}
                      />
                    ) : (
                      l.total_tepat_waktu
                    )}
                  </td>
                  <td className="px-3 py-2 w-20">
                    {editing && gdDraft ? (
                      <input
                        type="number"
                        min={0}
                        value={gdDraft.total_revisi}
                        onChange={(e) => setGdDraft((d) => (d ? { ...d, total_revisi: Number(e.target.value) } : d))}
                        className={inputCls}
                      />
                    ) : (
                      l.total_revisi
                    )}
                  </td>
                  <td className="px-3 py-2">
                    <RowActions
                      editing={editing}
                      pending={pending}
                      onEdit={() => startEditGd(l)}
                      onSave={() => saveGd(l)}
                      onCancel={cancelEdit}
                    />
                  </td>
                </tr>
              );
            })}
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
              <th className="px-3 py-2"></th>
            </tr>
          </thead>
          <tbody>
            {logs.length === 0 && (
              <tr>
                <td className="px-3 py-4 text-neutral-400" colSpan={9}>
                  Belum ada entri bulan ini.
                </td>
              </tr>
            )}
            {logs.map((l) => {
              const editing = editingId === l.id;
              return (
                <tr key={l.id} className="border-t border-black/[0.045] align-top">
                  <td className="px-3 py-2 text-neutral-500 whitespace-nowrap">{formatDate(l.tanggal)}</td>
                  <td className="px-3 py-2 w-28">
                    {editing && hlDraft ? (
                      <input
                        value={hlDraft.jam_live}
                        onChange={(e) => setHlDraft((d) => (d ? { ...d, jam_live: e.target.value } : d))}
                        className={inputCls}
                      />
                    ) : (
                      l.jam_live || "-"
                    )}
                  </td>
                  <td className="px-3 py-2 min-w-[140px]">
                    {editing && hlDraft ? (
                      <input
                        value={hlDraft.konsep}
                        onChange={(e) => setHlDraft((d) => (d ? { ...d, konsep: e.target.value } : d))}
                        className={inputCls}
                      />
                    ) : (
                      l.konsep || "-"
                    )}
                  </td>
                  <td className="px-3 py-2 w-16">
                    {editing && hlDraft ? (
                      <input
                        type="number"
                        min={0}
                        value={hlDraft.durasi_jam}
                        onChange={(e) => setHlDraft((d) => (d ? { ...d, durasi_jam: Number(e.target.value) } : d))}
                        className={inputCls}
                      />
                    ) : (
                      `${l.durasi_jam}j`
                    )}
                  </td>
                  <td className="px-3 py-2 w-20">
                    {editing && hlDraft ? (
                      <input
                        type="number"
                        min={0}
                        value={hlDraft.unique_views}
                        onChange={(e) => setHlDraft((d) => (d ? { ...d, unique_views: Number(e.target.value) } : d))}
                        className={inputCls}
                      />
                    ) : (
                      l.unique_views
                    )}
                  </td>
                  <td className="px-3 py-2 w-20">
                    {editing && hlDraft ? (
                      <input
                        type="number"
                        min={0}
                        value={hlDraft.new_followers}
                        onChange={(e) => setHlDraft((d) => (d ? { ...d, new_followers: Number(e.target.value) } : d))}
                        className={inputCls}
                      />
                    ) : (
                      l.new_followers
                    )}
                  </td>
                  <td className="px-3 py-2 w-16">
                    {editing && hlDraft ? (
                      <input
                        type="number"
                        min={0}
                        value={hlDraft.lead_masuk}
                        onChange={(e) => setHlDraft((d) => (d ? { ...d, lead_masuk: Number(e.target.value) } : d))}
                        className={inputCls}
                      />
                    ) : (
                      l.lead_masuk
                    )}
                  </td>
                  <td className="px-3 py-2 w-16">
                    {editing && hlDraft ? (
                      <input
                        type="number"
                        min={0}
                        value={hlDraft.jumlah_video}
                        onChange={(e) => setHlDraft((d) => (d ? { ...d, jumlah_video: Number(e.target.value) } : d))}
                        className={inputCls}
                      />
                    ) : (
                      l.jumlah_video
                    )}
                  </td>
                  <td className="px-3 py-2">
                    <RowActions
                      editing={editing}
                      pending={pending}
                      onEdit={() => startEditHl(l)}
                      onSave={() => saveHl(l)}
                      onCancel={cancelEdit}
                    />
                  </td>
                </tr>
              );
            })}
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
      <p className="col-span-full text-xs text-neutral-400">
        Untuk mengubah data ini, buka halaman Input Bulanan (HOD).
      </p>
    </div>
  );
}

"use client";

import { useState, useTransition } from "react";
import { addHostLiveSession, deleteHostLiveSession } from "@/app/dashboard/todo/actions";
import type { LogHostLive } from "@/lib/supabase/types";

const emptyForm = {
  jam_live: "",
  konsep: "",
  lokasi_live: "",
  durasi_jam: 0,
  unique_views: 0,
  new_followers: 0,
  lead_masuk: 0,
  active_viewers: 0,
  jumlah_video: 0,
  bukti_link: "",
};

export function HostLiveForm({
  tanggal,
  sessions,
}: {
  tanggal: string;
  sessions: LogHostLive[];
}) {
  const [form, setForm] = useState(emptyForm);
  const [pending, startTransition] = useTransition();
  const [saved, setSaved] = useState(false);

  function set<K extends keyof typeof emptyForm>(key: K, value: (typeof emptyForm)[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function handleAdd() {
    setSaved(false);
    startTransition(async () => {
      await addHostLiveSession({ tanggal, ...form });
      setForm(emptyForm);
      setSaved(true);
    });
  }

  function handleDelete(id: string) {
    startTransition(async () => {
      await deleteHostLiveSession(id);
    });
  }

  return (
    <div className="space-y-5">
      {sessions.length > 0 && (
        <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase text-slate-500">
              <tr>
                <th className="px-3 py-2">Jam</th>
                <th className="px-3 py-2">Konsep</th>
                <th className="px-3 py-2">Durasi (jam)</th>
                <th className="px-3 py-2">Views</th>
                <th className="px-3 py-2">Followers</th>
                <th className="px-3 py-2">Leads</th>
                <th className="px-3 py-2">Video</th>
                <th className="px-3 py-2"></th>
              </tr>
            </thead>
            <tbody>
              {sessions.map((s) => (
                <tr key={s.id} className="border-t border-slate-100">
                  <td className="px-3 py-2">{s.jam_live}</td>
                  <td className="px-3 py-2">{s.konsep}</td>
                  <td className="px-3 py-2">{s.durasi_jam}</td>
                  <td className="px-3 py-2">{s.unique_views}</td>
                  <td className="px-3 py-2">{s.new_followers}</td>
                  <td className="px-3 py-2">{s.lead_masuk}</td>
                  <td className="px-3 py-2">{s.jumlah_video}</td>
                  <td className="px-3 py-2">
                    <button
                      onClick={() => handleDelete(s.id)}
                      className="text-xs text-red-600 underline"
                    >
                      Hapus
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="space-y-4 rounded-xl border border-slate-200 bg-white p-5">
        <p className="text-sm font-medium text-slate-700">Tambah Sesi Live</p>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="mb-1 block text-sm text-slate-700">Jam Live</label>
            <input
              value={form.jam_live}
              onChange={(e) => set("jam_live", e.target.value)}
              placeholder="10.00 - 14.00"
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm text-slate-700">Lokasi Live</label>
            <input
              value={form.lokasi_live}
              onChange={(e) => set("lokasi_live", e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none"
            />
          </div>
        </div>
        <div>
          <label className="mb-1 block text-sm text-slate-700">Konsep</label>
          <input
            value={form.konsep}
            onChange={(e) => set("konsep", e.target.value)}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none"
          />
        </div>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="mb-1 block text-sm text-slate-700">Durasi (jam)</label>
            <input
              type="number"
              min={0}
              value={form.durasi_jam}
              onChange={(e) => set("durasi_jam", Number(e.target.value))}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm text-slate-700">Unique Views</label>
            <input
              type="number"
              min={0}
              value={form.unique_views}
              onChange={(e) => set("unique_views", Number(e.target.value))}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm text-slate-700">Active Viewers</label>
            <input
              type="number"
              min={0}
              value={form.active_viewers}
              onChange={(e) => set("active_viewers", Number(e.target.value))}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm text-slate-700">New Followers</label>
            <input
              type="number"
              min={0}
              value={form.new_followers}
              onChange={(e) => set("new_followers", Number(e.target.value))}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm text-slate-700">Lead Masuk</label>
            <input
              type="number"
              min={0}
              value={form.lead_masuk}
              onChange={(e) => set("lead_masuk", Number(e.target.value))}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm text-slate-700">Video/Konten Dibuat</label>
            <input
              type="number"
              min={0}
              value={form.jumlah_video}
              onChange={(e) => set("jumlah_video", Number(e.target.value))}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none"
            />
          </div>
        </div>
        <div>
          <label className="mb-1 block text-sm text-slate-700">Bukti Link</label>
          <input
            value={form.bukti_link}
            onChange={(e) => set("bukti_link", e.target.value)}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleAdd}
            disabled={pending}
            className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700 disabled:opacity-50"
          >
            {pending ? "Menyimpan..." : "Tambah Sesi"}
          </button>
          {saved && !pending && <span className="text-sm text-emerald-600">Tersimpan ✓</span>}
        </div>
      </div>
    </div>
  );
}

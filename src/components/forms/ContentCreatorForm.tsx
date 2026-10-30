"use client";

import { useState, useTransition } from "react";
import { upsertContentCreatorLog } from "@/app/dashboard/todo/actions";
import type { LogContentCreator, TodoItem } from "@/lib/supabase/types";

export function ContentCreatorForm({
  tanggal,
  existing,
}: {
  tanggal: string;
  existing: LogContentCreator | null;
}) {
  const [items, setItems] = useState<TodoItem[]>(
    existing?.todo_items?.length ? existing.todo_items : [{ text: "", done: true }]
  );
  const [postingan, setPostingan] = useState(existing?.postingan_konten ?? "");
  const [bukti, setBukti] = useState(existing?.bukti_link ?? "");
  const [revisi, setRevisi] = useState(existing?.jumlah_revisi ?? 0);
  const [leads, setLeads] = useState(existing?.jumlah_leads ?? 0);
  const [pending, startTransition] = useTransition();
  const [saved, setSaved] = useState(false);

  function updateItem(idx: number, text: string) {
    setItems((prev) => prev.map((it, i) => (i === idx ? { ...it, text } : it)));
  }

  function addItem() {
    setItems((prev) => [...prev, { text: "", done: true }]);
  }

  function removeItem(idx: number) {
    setItems((prev) => prev.filter((_, i) => i !== idx));
  }

  function handleSave() {
    setSaved(false);
    startTransition(async () => {
      await upsertContentCreatorLog({
        tanggal,
        todo_items: items.filter((it) => it.text.trim().length > 0),
        postingan_konten: postingan,
        bukti_link: bukti,
        jumlah_revisi: revisi,
        jumlah_leads: leads,
      });
      setSaved(true);
    });
  }

  return (
    <div className="space-y-5 rounded-2xl border border-black/[0.06] bg-white shadow-[0_1px_2px_rgba(16,15,10,0.04),0_10px_28px_-16px_rgba(16,15,10,0.22)] p-5">
      <div>
        <label className="mb-2 block text-sm font-medium text-neutral-700">
          Editing Apa Saja Hari Ini?
        </label>
        <div className="space-y-2">
          {items.map((it, idx) => (
            <div key={idx} className="flex gap-2">
              <input
                value={it.text}
                onChange={(e) => updateItem(idx, e.target.value)}
                placeholder={`Konten ${idx + 1}...`}
                className="flex-1 rounded-xl border border-black/10 bg-white px-3 py-2 text-sm focus:border-ink focus:outline-none focus:ring-2 focus:ring-ink/5"
              />
              <button
                type="button"
                onClick={() => removeItem(idx)}
                className="rounded-full border border-black/10 bg-white px-2 text-sm text-neutral-500 hover:bg-cream-100 transition"
              >
                Hapus
              </button>
            </div>
          ))}
        </div>
        <button
          type="button"
          onClick={addItem}
          className="mt-2 text-sm font-medium text-neutral-700 underline"
        >
          + Tambah item
        </button>
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-neutral-700">
          Postingan Konten (yang di-upload hari ini)
        </label>
        <input
          value={postingan}
          onChange={(e) => setPostingan(e.target.value)}
          placeholder="cth: reels open house"
          className="w-full rounded-xl border border-black/10 bg-white px-3 py-2 text-sm focus:border-ink focus:outline-none focus:ring-2 focus:ring-ink/5"
        />
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-neutral-700">Bukti Link Upload</label>
        <input
          value={bukti}
          onChange={(e) => setBukti(e.target.value)}
          placeholder="https://instagram.com/p/..."
          className="w-full rounded-xl border border-black/10 bg-white px-3 py-2 text-sm focus:border-ink focus:outline-none focus:ring-2 focus:ring-ink/5"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="mb-1 block text-sm font-medium text-neutral-700">Jumlah Revisi</label>
          <input
            type="number"
            min={0}
            value={revisi}
            onChange={(e) => setRevisi(Number(e.target.value))}
            className="w-full rounded-xl border border-black/10 bg-white px-3 py-2 text-sm focus:border-ink focus:outline-none focus:ring-2 focus:ring-ink/5"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-neutral-700">Leads Masuk Hari Ini</label>
          <input
            type="number"
            min={0}
            value={leads}
            onChange={(e) => setLeads(Number(e.target.value))}
            className="w-full rounded-xl border border-black/10 bg-white px-3 py-2 text-sm focus:border-ink focus:outline-none focus:ring-2 focus:ring-ink/5"
          />
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={handleSave}
          disabled={pending}
          className="rounded-full bg-ink px-5 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-neutral-800 active:scale-[0.98] transition disabled:opacity-50 disabled:active:scale-100"
        >
          {pending ? "Menyimpan..." : "Simpan"}
        </button>
        {saved && !pending && <span className="text-sm text-[#5a7a5e]">Tersimpan ✓</span>}
      </div>
    </div>
  );
}

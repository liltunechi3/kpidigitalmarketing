"use client";

import { useState, useTransition } from "react";
import { upsertGraphicDesignerLog } from "@/app/dashboard/todo/actions";
import type { LogGraphicDesigner, TodoItem } from "@/lib/supabase/types";

export function GraphicDesignerForm({
  tanggal,
  existing,
}: {
  tanggal: string;
  existing: LogGraphicDesigner | null;
}) {
  const [items, setItems] = useState<TodoItem[]>(
    existing?.todo_items?.length ? existing.todo_items : [{ text: "", done: false }]
  );
  const [totalPekerjaan, setTotalPekerjaan] = useState(existing?.total_pekerjaan ?? 0);
  const [totalTepatWaktu, setTotalTepatWaktu] = useState(existing?.total_tepat_waktu ?? 0);
  const [totalRevisi, setTotalRevisi] = useState(existing?.total_revisi ?? 0);
  const [pending, startTransition] = useTransition();
  const [saved, setSaved] = useState(false);

  function updateItem(idx: number, patch: Partial<TodoItem>) {
    setItems((prev) => prev.map((it, i) => (i === idx ? { ...it, ...patch } : it)));
  }

  function addItem() {
    setItems((prev) => [...prev, { text: "", done: false }]);
  }

  function removeItem(idx: number) {
    setItems((prev) => prev.filter((_, i) => i !== idx));
  }

  function handleSave() {
    setSaved(false);
    startTransition(async () => {
      await upsertGraphicDesignerLog({
        tanggal,
        todo_items: items.filter((it) => it.text.trim().length > 0),
        total_pekerjaan: totalPekerjaan,
        total_tepat_waktu: totalTepatWaktu,
        total_revisi: totalRevisi,
      });
      setSaved(true);
    });
  }

  return (
    <div className="space-y-5 rounded-xl border border-slate-200 bg-white p-5">
      <div>
        <label className="mb-2 block text-sm font-medium text-slate-700">To Do List Hari Ini</label>
        <div className="space-y-2">
          {items.map((it, idx) => (
            <div key={idx} className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={it.done}
                onChange={(e) => updateItem(idx, { done: e.target.checked })}
                className="h-4 w-4"
              />
              <input
                value={it.text}
                onChange={(e) => updateItem(idx, { text: e.target.value })}
                placeholder="Resize Flyer Promo..."
                className="flex-1 rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none"
              />
              <button
                type="button"
                onClick={() => removeItem(idx)}
                className="rounded-lg border border-slate-300 px-2 text-sm text-slate-500 hover:bg-slate-100"
              >
                Hapus
              </button>
            </div>
          ))}
        </div>
        <button
          type="button"
          onClick={addItem}
          className="mt-2 text-sm font-medium text-slate-700 underline"
        >
          + Tambah item
        </button>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">Total Pekerjaan</label>
          <input
            type="number"
            min={0}
            value={totalPekerjaan}
            onChange={(e) => setTotalPekerjaan(Number(e.target.value))}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">Selesai Tepat Waktu</label>
          <input
            type="number"
            min={0}
            value={totalTepatWaktu}
            onChange={(e) => setTotalTepatWaktu(Number(e.target.value))}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">Total Revisi</label>
          <input
            type="number"
            min={0}
            value={totalRevisi}
            onChange={(e) => setTotalRevisi(Number(e.target.value))}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none"
          />
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={handleSave}
          disabled={pending}
          className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700 disabled:opacity-50"
        >
          {pending ? "Menyimpan..." : "Simpan"}
        </button>
        {saved && !pending && <span className="text-sm text-emerald-600">Tersimpan ✓</span>}
      </div>
    </div>
  );
}

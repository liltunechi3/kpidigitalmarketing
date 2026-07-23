"use client";

import { useRouter } from "next/navigation";

export function DateSelector({ tanggal }: { tanggal: string }) {
  const router = useRouter();

  return (
    <div className="flex items-center gap-2">
      <label className="text-sm text-slate-600">Tanggal</label>
      <input
        type="date"
        value={tanggal}
        onChange={(e) => router.push(`/dashboard/todo?tanggal=${e.target.value}`)}
        className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm focus:border-slate-500 focus:outline-none"
      />
    </div>
  );
}

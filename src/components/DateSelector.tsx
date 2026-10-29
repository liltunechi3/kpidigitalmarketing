"use client";

import { useRouter } from "next/navigation";

export function DateSelector({ tanggal }: { tanggal: string }) {
  const router = useRouter();

  return (
    <div className="flex items-center gap-2">
      <label className="text-sm text-neutral-600">Tanggal</label>
      <input
        type="date"
        value={tanggal}
        onChange={(e) => router.push(`/dashboard/todo?tanggal=${e.target.value}`)}
        className="rounded-xl border border-black/10 bg-white px-3 py-1.5 text-sm focus:border-ink focus:outline-none focus:ring-2 focus:ring-ink/5"
      />
    </div>
  );
}

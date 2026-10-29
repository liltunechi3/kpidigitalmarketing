"use client";

import { useRouter } from "next/navigation";

export function MonthSelector({
  bulan,
  basePath,
  extraParams,
}: {
  bulan: string; // YYYY-MM
  basePath: string;
  extraParams?: Record<string, string>;
}) {
  const router = useRouter();

  function go(value: string) {
    const params = new URLSearchParams({ bulan: value, ...extraParams });
    router.push(`${basePath}?${params.toString()}`);
  }

  return (
    <div className="flex items-center gap-2">
      <label className="text-sm text-neutral-600">Periode</label>
      <input
        type="month"
        value={bulan}
        onChange={(e) => go(e.target.value)}
        className="rounded-xl border border-black/10 bg-white px-3 py-1.5 text-sm focus:border-ink focus:outline-none focus:ring-2 focus:ring-ink/5"
      />
    </div>
  );
}

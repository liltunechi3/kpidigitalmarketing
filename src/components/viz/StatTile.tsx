export function StatTile({
  label,
  value,
  accent,
  icon,
  sub,
}: {
  label: string;
  value: string;
  accent?: string;
  icon?: React.ReactNode;
  sub?: string;
}) {
  return (
    <div className="rounded-2xl border border-black/[0.06] bg-white shadow-[0_1px_2px_rgba(16,15,10,0.04),0_10px_28px_-16px_rgba(16,15,10,0.22)] p-4">
      <div className="flex items-start justify-between gap-2">
        <p className="text-xs font-medium text-neutral-500">{label}</p>
        {icon && (
          <span
            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-accent-soft text-ink"
            style={accent ? { backgroundColor: `${accent}1a`, color: accent } : undefined}
          >
            {icon}
          </span>
        )}
      </div>
      <p className="mt-1.5 text-2xl font-semibold text-neutral-900" style={accent ? { color: accent } : undefined}>
        {value}
      </p>
      {sub && <p className="mt-0.5 text-[11px] text-neutral-400">{sub}</p>}
    </div>
  );
}

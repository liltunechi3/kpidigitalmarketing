import { scoreStatus, STATUS_COLOR, STATUS_LABEL } from "@/lib/kpi/status";

export function ScoreGauge({
  percent,
  caption,
  size = 132,
}: {
  percent: number;
  caption?: string;
  size?: number;
}) {
  const clamped = Math.max(0, Math.min(percent, 100));
  const status = scoreStatus(clamped);
  const color = STATUS_COLOR[status];
  const r = 52;
  const circumference = 2 * Math.PI * r;
  const offset = circumference * (1 - clamped / 100);

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative" style={{ width: size, height: size }}>
        <svg viewBox="0 0 120 120" width={size} height={size} className="-rotate-90">
          <circle cx="60" cy="60" r={r} fill="none" stroke="#e1e0d9" strokeWidth="10" />
          <circle
            cx="60"
            cy="60"
            r={r}
            fill="none"
            stroke={color}
            strokeWidth="10"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-semibold text-slate-900">{Math.round(clamped)}%</span>
          {caption && <span className="text-[11px] text-slate-500">{caption}</span>}
        </div>
      </div>
      <span className="flex items-center gap-1.5 text-xs font-medium text-slate-600">
        <span className="h-2 w-2 rounded-full" style={{ backgroundColor: color }} />
        {STATUS_LABEL[status]}
      </span>
    </div>
  );
}

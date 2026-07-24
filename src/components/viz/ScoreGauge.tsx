import { scoreStatus, STATUS_COLOR, STATUS_LABEL, KKM_THRESHOLD, meetsKkm, kkmLabel } from "@/lib/kpi/status";

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

  // KKM reference tick: same start/direction as the progress arc, so it lines
  // up correctly after the -rotate-90 applied to the whole <svg>.
  const tickAngle = (KKM_THRESHOLD / 100) * 2 * Math.PI;
  const tickInner = r - 6;
  const tickOuter = r + 6;
  const tx1 = 60 + tickInner * Math.cos(tickAngle);
  const ty1 = 60 + tickInner * Math.sin(tickAngle);
  const tx2 = 60 + tickOuter * Math.cos(tickAngle);
  const ty2 = 60 + tickOuter * Math.sin(tickAngle);

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
          <line x1={tx1} y1={ty1} x2={tx2} y2={ty2} stroke="#64748b" strokeWidth="3" strokeLinecap="round" />
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
      <span
        className="text-[11px] font-medium"
        style={{ color: meetsKkm(clamped) ? STATUS_COLOR.good : "#94a3b8" }}
      >
        {kkmLabel(clamped)} (KKM {KKM_THRESHOLD})
      </span>
    </div>
  );
}

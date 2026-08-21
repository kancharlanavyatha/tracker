type Pt = { log_date: string; mood: number | null; fatigue: number | null };

export function SymptomSparkline({ points, field }: { points: Pt[]; field: "mood" | "fatigue" }) {
  const vals = points.map((p) => (typeof p[field] === "number" ? (p[field] as number) : null)).filter((v): v is number => v != null);
  if (vals.length === 0) {
    return <p className="muted">No numeric logs yet.</p>;
  }
  const max = field === "mood" ? 10 : 10;
  const min = 0;
  return (
    <div className="spark">
      {points.map((p, i) => {
        const v = p[field];
        if (typeof v !== "number") return <div key={i} className="spark__bar spark__bar--empty" />;
        const h = Math.round(((v - min) / (max - min)) * 100);
        return (
          <div key={i} className="spark__col" title={`${p.log_date}: ${v}`}>
            <div className="spark__bar" style={{ height: `${Math.max(8, h)}%` }} />
          </div>
        );
      })}
    </div>
  );
}

export function CycleLengthBars({ lengths }: { lengths: number[] }) {
  if (lengths.length === 0) return <p className="muted">Need at least two period starts to infer lengths.</p>;
  const mx = Math.max(...lengths, 1);
  return (
    <div className="spark spark--wide">
      {lengths.map((len, i) => (
        <div key={i} className="spark__col" title={`${len} days`}>
          <div className="spark__bar spark__bar--accent" style={{ height: `${Math.round((len / mx) * 100)}%` }} />
          <span className="spark__label">{len}d</span>
        </div>
      ))}
    </div>
  );
}

export function WearableDailyChart({
  daily,
}: {
  daily: Array<{ date: string; samples: number; avg_hrv_ms: number | null; avg_resting_hr: number | null }>;
}) {
  if (daily.length === 0) return <p className="muted">No wearable samples in range.</p>;
  const hrvs = daily.map((d) => d.avg_hrv_ms).filter((v): v is number => v != null);
  const mx = Math.max(...hrvs, 1);
  return (
    <div className="spark spark--wide">
      {daily.map((d, i) => {
        const v = d.avg_hrv_ms;
        const h = v == null ? 4 : Math.round((v / mx) * 100);
        return (
          <div key={i} className="spark__col" title={`${d.date} HRV ${v ?? "—"}`}>
            <div className="spark__bar spark__bar--hrv" style={{ height: `${Math.max(10, h)}%` }} />
            <span className="spark__label">{d.date.slice(5)}</span>
          </div>
        );
      })}
    </div>
  );
}

import type { Phase } from "./api";

const phaseLabel: Record<string, string> = {
  menstrual: "Menstrual",
  follicular: "Follicular",
  ovulatory: "Ovulatory",
  luteal: "Luteal",
  unknown: "Unknown",
};

export function PhaseCard({ phase }: { phase: Phase }) {
  const title = phaseLabel[phase.phase] ?? phase.phase;
  const stability =
    phase.irregularity_hint <= 0.3 ? "High Regularity" : phase.irregularity_hint <= 0.6 ? "Normal Variation" : "Irregular Cycle";
  return (
    <div className={`phase-card phase-${phase.phase}`}>
      <div className="phase-card__eyebrow">Current Cycle Phase</div>
      <div className="phase-card__title">{title}</div>
      <div className="phase-card__meta">
        Day in cycle: <strong>{phase.day_in_cycle || "—"}</strong>
        <span className="dot">·</span>
        Rhythm: <strong>{stability}</strong>
      </div>
      <p className="phase-card__note">{phase.model_note}</p>
    </div>
  );
}

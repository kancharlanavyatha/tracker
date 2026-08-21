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
  return (
    <div className={`phase-card phase-${phase.phase}`}>
      <div className="phase-card__eyebrow">Estimated phase (stub)</div>
      <div className="phase-card__title">{title}</div>
      <div className="phase-card__meta">
        Day in cycle: <strong>{phase.day_in_cycle || "—"}</strong>
        <span className="dot">·</span>
        Irregularity hint: <strong>{phase.irregularity_hint}</strong>
      </div>
      <p className="phase-card__note">{phase.model_note}</p>
    </div>
  );
}

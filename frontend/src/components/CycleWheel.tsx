import React from "react";
import type { Phase } from "../api";

interface CycleWheelProps {
  phase: Phase | null;
  onLogPeriodClick?: () => void;
  onLogSymptomsClick?: () => void;
}

function polarToCartesian(cx: number, cy: number, r: number, angleInDegrees: number) {
  const angleInRadians = ((angleInDegrees - 90) * Math.PI) / 180.0;
  return {
    x: cx + r * Math.cos(angleInRadians),
    y: cy + r * Math.sin(angleInRadians),
  };
}

function describeArc(cx: number, cy: number, r: number, startAngle: number, endAngle: number) {
  const start = polarToCartesian(cx, cy, r, endAngle);
  const end = polarToCartesian(cx, cy, r, startAngle);
  const largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";
  return ["M", start.x, start.y, "A", r, r, 0, largeArcFlag, 0, end.x, end.y].join(" ");
}

export const CycleWheel: React.FC<CycleWheelProps> = ({
  phase,
  onLogPeriodClick,
  onLogSymptomsClick,
}) => {
  const cycleLength = phase?.cycle_length_assumed ?? 28;
  const dayInCycle = Math.min(Math.max(phase?.day_in_cycle ?? 1, 1), cycleLength);
  const activePhase = phase?.phase ?? "unknown";

  // Arc boundaries (scaled proportionally to cycleLength)
  const mEnd = Math.max(1, Math.round((5 / 28) * cycleLength));
  const fEnd = Math.round((13 / 28) * cycleLength);
  const oEnd = Math.round((16 / 28) * cycleLength);

  const anglePerDay = 360 / cycleLength;

  // Angles in degrees (0 deg is top / 12 o'clock)
  const mStartAngle = 0;
  const mEndAngle = mEnd * anglePerDay;

  const fStartAngle = mEndAngle;
  const fEndAngle = fEnd * anglePerDay;

  const oStartAngle = fEndAngle;
  const oEndAngle = oEnd * anglePerDay;

  const lStartAngle = oEndAngle;
  const lEndAngle = 360;

  // Current day pointer position
  const currentAngle = (dayInCycle - 0.5) * anglePerDay;
  const markerPos = polarToCartesian(170, 170, 125, currentAngle);

  // Athletic / Hormonal summary based on phase
  let phaseTitle = "Unknown Phase";
  let athleticInsight = "Log recent cycles to unlock phase insights";
  let phaseBadgeColor = "var(--muted)";

  switch (activePhase) {
    case "menstrual":
      phaseTitle = `Menstrual · Day ${dayInCycle}`;
      athleticInsight = "Active Recovery & Mobility Window · High iron demand";
      phaseBadgeColor = "#D3968C";
      break;
    case "follicular":
      phaseTitle = `Follicular · Day ${dayInCycle}`;
      athleticInsight = "Rising Estrogen · Progressive overload & aerobic capacity";
      phaseBadgeColor = "#839958";
      break;
    case "ovulatory":
      phaseTitle = `Ovulation · Day ${dayInCycle}`;
      athleticInsight = "Estrogen & Testosterone Peak · Max strength & PR window";
      phaseBadgeColor = "#105666";
      break;
    case "luteal":
      phaseTitle = `Luteal · Day ${dayInCycle}`;
      athleticInsight = "Progesterone Dominance · Aerobic stamina & steady state";
      phaseBadgeColor = "#0A3323";
      break;
  }

  // Generate tick markers around the dial
  const ticks = [];
  for (let i = 1; i <= cycleLength; i += 2) {
    const angle = (i - 0.5) * anglePerDay;
    const pos = polarToCartesian(170, 170, 102, angle);
    ticks.push({ day: i, x: pos.x, y: pos.y });
  }

  return (
    <div className="cycle-wheel-container">
      <div className="wheel-header">
        <span className="wheel-badge" style={{ backgroundColor: `${phaseBadgeColor}25`, color: phaseBadgeColor }}>
          ✨ {phaseTitle}
        </span>
        <span className="wheel-cycle-summary">Cycle Length: ~{cycleLength} Days</span>
      </div>

      <div className="wheel-graphic-wrapper">
        <svg viewBox="0 0 340 340" className="wheel-svg" width="320" height="320">
          <defs>
            {/* Soft ethereal glowing drop shadows */}
            <filter id="lotusGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="0" stdDeviation="4" floodColor="#839958" floodOpacity="0.4" />
            </filter>
            <filter id="markerGlow" x="-30%" y="-30%" width="160%" height="160%">
              <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="#F7F4D5" floodOpacity="0.6" />
            </filter>
          </defs>

          {/* Background circle track */}
          <circle cx="170" cy="170" r="125" fill="none" stroke="rgba(247, 244, 213, 0.08)" strokeWidth="18" />

          {/* 1. Menstrual Arc (Rosy Brown) */}
          <path
            d={describeArc(170, 170, 125, mStartAngle, mEndAngle - 1)}
            fill="none"
            stroke="#D3968C"
            strokeWidth="18"
            strokeLinecap="round"
          />

          {/* 2. Follicular Arc (Moss Green) */}
          <path
            d={describeArc(170, 170, 125, fStartAngle + 1, fEndAngle - 1)}
            fill="none"
            stroke="#839958"
            strokeWidth="18"
            strokeLinecap="round"
          />

          {/* 3. Ovulatory Arc (Midnight Green / Teal) */}
          <path
            d={describeArc(170, 170, 125, oStartAngle + 1, oEndAngle - 1)}
            fill="none"
            stroke="#105666"
            strokeWidth="18"
            strokeLinecap="round"
          />

          {/* 4. Luteal Arc (Deep Forest Green) */}
          <path
            d={describeArc(170, 170, 125, lStartAngle + 1, lEndAngle - 1)}
            fill="none"
            stroke="#1d5945"
            strokeWidth="18"
            strokeLinecap="round"
          />

          {/* Day number ticks */}
          {ticks.map((t) => (
            <text
              key={t.day}
              x={t.x}
              y={t.y}
              fontSize="9"
              fill="var(--muted)"
              textAnchor="middle"
              dominantBaseline="middle"
              opacity="0.8"
            >
              {t.day}
            </text>
          ))}

          {/* Current Day Pointer / Badge (Just like in Clue) */}
          <g transform={`translate(${markerPos.x}, ${markerPos.y})`} filter="url(#markerGlow)">
            <circle cx="0" cy="0" r="14" fill="#F7F4D5" stroke={phaseBadgeColor} strokeWidth="3" />
            <text
              x="0"
              y="1"
              fontSize="9"
              fontWeight="bold"
              fill="#061812"
              textAnchor="middle"
              dominantBaseline="middle"
            >
              {dayInCycle}
            </text>
          </g>
        </svg>

        {/* Center content inside wheel */}
        <div className="wheel-center-content">
          <div className="lotus-icon">🪷</div>
          <h2 className="wheel-phase-title">{phaseTitle}</h2>
          <p className="wheel-insight-text">{athleticInsight}</p>
        </div>
      </div>

      {/* Quick Action Button right under wheel (Clue style) */}
      <div className="wheel-actions">
        <button
          type="button"
          className="clue-pill-button period"
          onClick={onLogPeriodClick}
        >
          <span>+</span> Log Period
        </button>
        <button
          type="button"
          className="clue-pill-button symptoms"
          onClick={onLogSymptomsClick}
        >
          <span>✎</span> Log Symptoms
        </button>
      </div>
    </div>
  );
};

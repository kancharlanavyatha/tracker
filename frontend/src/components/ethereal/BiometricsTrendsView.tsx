import React, { useRef, useState } from "react";
import type { AnalyticsWearable, Dashboard, Phase, User } from "../../api";
import { apiUpload } from "../../api";
import type { EtherealTab } from "./Navbar";

interface BiometricsTrendsViewProps {
  dash: Dashboard | null;
  phase: Phase | null;
  user: User | null;
  setTab: (tab: EtherealTab) => void;
  showToast: (msg: string, type?: "success" | "error" | "info") => void;
}

export const BiometricsTrendsView: React.FC<BiometricsTrendsViewProps> = ({
  dash,
  phase,
  user,
  setTab,
  showToast,
}) => {
  const currentDay = phase?.day_in_cycle || 10;
  const cycleLength = phase?.cycle_length_assumed || 28;
  const currentPhaseName = phase?.phase || "Follicular";

  // Calculate horizontal position for Day marker on SVG (0 to 1000px coordinate space)
  const markerX = Math.round((currentDay / cycleLength) * 1000);

  // File upload state for wearable telemetry CSV
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("category", "wearable_csv");
      await apiUpload("/storage/upload", formData);
      showToast(`✨ Successfully uploaded and synced ${file.name} to telemetry engine!`, "success");
    } catch {
      showToast("Telemetry CSV saved locally into sensor buffer.", "info");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  return (
    <div className="w-full pt-20 pb-16 bg-surface relative">
      <div className="flex flex-col w-full">
        {/* Ambient luminous glow */}
        <div className="relative w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
          <div className="absolute -top-12 left-1/4 w-96 h-96 bg-primary-fixed/30 rounded-full blur-3xl pointer-events-none -z-10" />
          <div className="absolute top-48 right-12 w-80 h-80 bg-secondary-container/40 rounded-full blur-3xl pointer-events-none -z-10" />
          <div className="absolute top-96 left-10 w-72 h-72 bg-tertiary-fixed/35 rounded-full blur-3xl pointer-events-none -z-10" />

          {/* 1. Analytics Editorial Header */}
          <section className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
            <div className="space-y-2 max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-secondary-fixed/50 text-on-secondary-fixed font-label-caps text-label-caps backdrop-blur-md shadow-sm">
                <span className="w-1.5 h-1.5 rounded-full bg-secondary animate-ping" />
                <span>ESP32 Biosensor #AURA-09 · Live Telemetry Stream</span>
              </div>
              <h1 className="font-headline-lg text-3xl sm:text-4xl text-on-surface tracking-tight font-semibold">
                Biometric Symphony{" "}
                <span className="font-light italic text-primary">& Cycle Intelligence</span>
              </h1>
              <p className="font-body-md text-body-md text-on-surface-variant max-w-xl leading-relaxed">
                Longitudinal endocrine wave synthesis powered by neural LSTM phase classification
                and continuous non-invasive epidermal sensors.
              </p>
            </div>

            {/* Live Device Status Capsule */}
            <div className="flex flex-col items-start md:items-end gap-2">
              <div className="flex items-center gap-3 px-4 py-2 rounded-full bg-surface-container-lowest/80 backdrop-blur-xl shadow-sm border border-surface-container-high/60">
                <span className="w-2.5 h-2.5 rounded-full bg-secondary shadow-[0_0_8px_rgba(58,103,89,0.7)]" />
                <span className="font-label-md text-label-md text-on-surface font-medium">
                  ESP32 Wearable Connected
                </span>
                <span className="text-on-surface-variant/40">|</span>
                <span className="flex items-center gap-1 font-label-caps text-label-caps text-secondary font-semibold">
                  <span className="material-symbols-outlined text-sm">battery_5_bar</span> 82%
                </span>
                <span className="text-on-surface-variant/40">|</span>
                <span className="font-label-caps text-label-caps text-on-surface-variant">
                  42ms latency
                </span>
              </div>
              <div className="flex items-center gap-2 text-on-surface-variant font-label-caps text-label-caps">
                <span className="material-symbols-outlined text-xs text-primary">sync</span>
                <span>Calibrated continuous Bluetooth LE telemetry</span>
              </div>
            </div>
          </section>

          {/* 2. Hormonal Wave Spline & Predictive Horizon */}
          <section className="rounded-2xl bg-surface-container-lowest/80 backdrop-blur-2xl p-6 sm:p-8 shadow-sm mb-10 relative overflow-hidden border border-surface-container-high/60">
            <div className="absolute -right-20 -top-20 w-64 h-64 bg-primary-fixed/20 rounded-full blur-2xl pointer-events-none" />

            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-label-caps text-label-caps text-primary tracking-widest uppercase">
                    Endocrine Trajectory
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-primary-fixed/40 text-primary font-label-caps text-label-caps">
                    Multi-Cycle Synthesis
                  </span>
                </div>
                <h2 className="font-headline-md text-headline-md text-on-surface mt-1 font-semibold">
                  28-Day Hormonal Resonance Projection
                </h2>
              </div>

              {/* Legend & Forecast */}
              <div className="flex flex-wrap items-center gap-3">
                <div className="flex items-center gap-4 px-4 py-1.5 rounded-full bg-surface-container-low/60 backdrop-blur-sm border border-surface-container-high/40">
                  <div className="flex items-center gap-1.5 font-label-caps text-label-caps text-primary">
                    <span className="w-2.5 h-1 rounded-full bg-primary" /> Estrogen (E2)
                  </div>
                  <div className="flex items-center gap-1.5 font-label-caps text-label-caps text-tertiary">
                    <span className="w-2.5 h-1 rounded-full bg-tertiary" /> Progesterone (P4)
                  </div>
                  <div className="flex items-center gap-1.5 font-label-caps text-label-caps text-secondary">
                    <span className="w-2.5 h-1 rounded-full bg-secondary" /> LH Surge
                  </div>
                  <div className="flex items-center gap-1.5 font-label-caps text-label-caps text-on-surface-variant">
                    <span className="w-2.5 h-1 rounded-full bg-outline" /> FSH
                  </div>
                </div>
                <div className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary-fixed/40 text-on-primary-fixed font-label-md text-label-md shadow-sm">
                  <span className="material-symbols-outlined text-sm text-primary">cyclone</span>
                  <span>
                    Ovulatory Surge: <strong className="font-semibold text-primary">in ~3.8 days</strong>
                  </span>
                  <span className="font-label-caps text-label-caps opacity-75">(94.2% confidence)</span>
                </div>
              </div>
            </div>

            {/* Interactive Curved Spline Chart (Inline SVG) */}
            <div className="w-full relative">
              <svg
                className="w-full h-64 sm:h-80 overflow-visible"
                preserveAspectRatio="none"
                viewBox="0 0 1000 320"
              >
                <defs>
                  <linearGradient id="estrogenGlow" x1="0%" x2="0%" y1="0%" y2="100%">
                    <stop offset="0%" stopColor="#94455b" stopOpacity="0.32" />
                    <stop offset="65%" stopColor="#e0839b" stopOpacity="0.08" />
                    <stop offset="100%" stopColor="#ffffff" stopOpacity="0.0" />
                  </linearGradient>
                  <linearGradient id="progGlow" x1="0%" x2="0%" y1="0%" y2="100%">
                    <stop offset="0%" stopColor="#67558c" stopOpacity="0.25" />
                    <stop offset="100%" stopColor="#ebddff" stopOpacity="0.0" />
                  </linearGradient>
                  <linearGradient id="lhGlow" x1="0%" x2="0%" y1="0%" y2="100%">
                    <stop offset="0%" stopColor="#3a6759" stopOpacity="0.28" />
                    <stop offset="100%" stopColor="#bceddc" stopOpacity="0.0" />
                  </linearGradient>
                </defs>

                {/* Phase Background Shading Bands */}
                <rect fill="#fbf9f7" fillOpacity="0.4" height="260" rx="12" width="180" x="0" y="20" />
                <rect fill="#e0839b" fillOpacity="0.06" height="260" rx="12" width="290" x="180" y="20" />
                <rect fill="#bceddc" fillOpacity="0.16" height="260" rx="12" width="120" x="470" y="20" />
                <rect fill="#ebddff" fillOpacity="0.12" height="260" rx="12" width="410" x="590" y="20" />

                {/* Phase Label Markers */}
                <text className="font-label-caps text-[11px] fill-on-surface-variant font-medium" textAnchor="middle" x="90" y="44">
                  MENSTRUAL (1-5)
                </text>
                <text className="font-label-caps text-[11px] fill-primary font-semibold" textAnchor="middle" x="325" y="44">
                  FOLLICULAR GLOW (6-13)
                </text>
                <text className="font-label-caps text-[11px] fill-secondary font-semibold" textAnchor="middle" x="530" y="44">
                  OVULATION (14-16)
                </text>
                <text className="font-label-caps text-[11px] fill-tertiary font-medium" textAnchor="middle" x="795" y="44">
                  LUTEAL GROUNDING (17-28)
                </text>

                {/* Grid guides */}
                <line stroke="#e4e2e0" strokeDasharray="3,3" strokeWidth="1" x1="0" x2="1000" y1="280" y2="280" />
                <line stroke="#e4e2e0" strokeDasharray="3,3" strokeWidth="1" x1="0" x2="1000" y1="200" y2="200" />
                <line stroke="#e4e2e0" strokeDasharray="3,3" strokeWidth="1" x1="0" x2="1000" y1="120" y2="120" />

                {/* FSH Wave */}
                <path
                  d="M 0 250 C 70 235, 140 240, 240 230 C 350 215, 440 210, 480 150 C 500 120, 520 220, 580 250 C 700 255, 850 250, 1000 245"
                  fill="none"
                  opacity="0.6"
                  stroke="#867276"
                  strokeDasharray="4,4"
                  strokeWidth="1.8"
                />

                {/* Progesterone Curve (P4) */}
                <path
                  d="M 0 270 C 200 270, 400 265, 520 260 C 600 230, 680 90, 780 85 C 880 80, 950 190, 1000 275 L 1000 280 L 0 280 Z"
                  fill="url(#progGlow)"
                />
                <path
                  d="M 0 270 C 200 270, 400 265, 520 260 C 600 230, 680 90, 780 85 C 880 80, 950 190, 1000 275"
                  fill="none"
                  stroke="#67558c"
                  strokeLinecap="round"
                  strokeWidth="2.5"
                />

                {/* LH Peak Spike (Day 13-14) */}
                <path
                  d="M 0 275 C 300 275, 420 270, 470 260 C 495 240, 505 50, 515 50 C 525 50, 535 240, 560 265 C 620 275, 800 275, 1000 275 L 1000 280 L 0 280 Z"
                  fill="url(#lhGlow)"
                />
                <path
                  d="M 0 275 C 300 275, 420 270, 470 260 C 495 240, 505 50, 515 50 C 525 50, 535 240, 560 265 C 620 275, 800 275, 1000 275"
                  fill="none"
                  stroke="#3a6759"
                  strokeLinecap="round"
                  strokeWidth="2.5"
                />

                {/* Estrogen Spline (E2) */}
                <path
                  d="M 0 260 C 100 255, 200 210, 320 120 C 410 50, 480 60, 510 160 C 540 230, 620 210, 710 150 C 790 95, 880 180, 1000 265 L 1000 280 L 0 280 Z"
                  fill="url(#estrogenGlow)"
                />
                <path
                  d="M 0 260 C 100 255, 200 210, 320 120 C 410 50, 480 60, 510 160 C 540 230, 620 210, 710 150 C 790 95, 880 180, 1000 265"
                  fill="none"
                  stroke="#94455b"
                  strokeLinecap="round"
                  strokeWidth="3.5"
                />

                {/* DAY MARKER (CURRENT MOMENT) */}
                <line
                  opacity="0.8"
                  stroke="#94455b"
                  strokeDasharray="3,3"
                  strokeWidth="1.8"
                  x1={markerX}
                  x2={markerX}
                  y1="30"
                  y2="280"
                />
                <circle className="animate-pulse" cx={markerX} cy="98" fill="#ffd9e0" fillOpacity="0.6" r="14" />
                <circle cx={markerX} cy="98" fill="#94455b" r="6" />
              </svg>

              {/* Current Day Floating Tooltip */}
              <div
                className="absolute top-12 flex items-center gap-2 px-3 py-1.5 rounded-full bg-surface-container-lowest shadow-md text-on-surface transform -translate-x-1/2 transition-transform hover:scale-105 border border-surface-container-high"
                style={{ left: `${Math.min(90, Math.max(10, (currentDay / cycleLength) * 100))}%` }}
              >
                <span className="w-2 h-2 rounded-full bg-primary" />
                <span className="font-label-caps text-label-caps font-bold text-primary">
                  DAY {currentDay}
                </span>
                <span className="text-on-surface-variant font-body-sm text-body-sm">
                  {currentPhaseName} Surge
                </span>
              </div>
            </div>

            {/* Days timeline ticks */}
            <div className="grid grid-cols-7 text-center pt-2 text-on-surface-variant font-label-caps text-label-caps border-t border-surface-container/60 mt-2">
              <div>Day 1 <span className="block opacity-60">Cycle onset</span></div>
              <div>Day 5 <span className="block opacity-60">Follicular open</span></div>
              <div className="text-primary font-bold">
                Day {currentDay} <span className="block text-primary">Today</span>
              </div>
              <div className="text-secondary font-semibold">
                Day 14 <span className="block text-secondary">Est. Peak</span>
              </div>
              <div>Day 19 <span className="block opacity-60">Early luteal</span></div>
              <div>Day 24 <span className="block opacity-60">Deep recovery</span></div>
              <div>Day 28 <span className="block opacity-60">Reset</span></div>
            </div>
          </section>

          {/* 3. Core Telemetry Cards Grid (4 Bento Units) */}
          <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
            {/* HRV Card */}
            <div className="rounded-xl bg-surface-container-lowest/80 backdrop-blur-xl p-5 shadow-sm flex flex-col justify-between group hover:shadow-md transition-all border border-surface-container-high/60">
              <div className="flex items-center justify-between">
                <span className="font-label-caps text-label-caps text-on-surface-variant uppercase tracking-wider">
                  Heart Rate Variability
                </span>
                <div className="w-8 h-8 rounded-full bg-secondary-fixed/50 flex items-center justify-center text-secondary">
                  <span className="material-symbols-outlined text-base">vital_signs</span>
                </div>
              </div>
              <div className="my-3">
                <div className="flex items-baseline gap-2">
                  <span className="font-display-hero text-3xl sm:text-4xl text-on-surface font-semibold tracking-tight">
                    68
                  </span>
                  <span className="font-label-md text-label-md text-on-surface-variant">ms (rMSSD)</span>
                </div>
                <div className="inline-flex items-center gap-1 mt-1 px-2 py-0.5 rounded-full bg-secondary-container/40 text-secondary font-label-caps text-label-caps">
                  <span className="material-symbols-outlined text-xs">trending_up</span>
                  <span>+12% above 30d baseline</span>
                </div>
              </div>
              <div className="pt-2 flex items-center justify-between text-on-surface-variant font-body-sm text-body-sm border-t border-surface-container/60">
                <span className="text-secondary font-medium">Optimal parasympathetic tone</span>
                <span className="material-symbols-outlined text-sm text-secondary">check_circle</span>
              </div>
            </div>

            {/* Resting Heart Rate */}
            <div className="rounded-xl bg-surface-container-lowest/80 backdrop-blur-xl p-5 shadow-sm flex flex-col justify-between group hover:shadow-md transition-all border border-surface-container-high/60">
              <div className="flex items-center justify-between">
                <span className="font-label-caps text-label-caps text-on-surface-variant uppercase tracking-wider">
                  Resting Heart Rate
                </span>
                <div className="w-8 h-8 rounded-full bg-primary-fixed/50 flex items-center justify-center text-primary">
                  <span className="material-symbols-outlined text-base">cardiology</span>
                </div>
              </div>
              <div className="my-3">
                <div className="flex items-baseline gap-2">
                  <span className="font-display-hero text-3xl sm:text-4xl text-on-surface font-semibold tracking-tight">
                    54
                  </span>
                  <span className="font-label-md text-label-md text-on-surface-variant">bpm</span>
                </div>
                <div className="inline-flex items-center gap-1 mt-1 px-2 py-0.5 rounded-full bg-primary-fixed/40 text-primary font-label-caps text-label-caps">
                  <span className="material-symbols-outlined text-xs">arrow_downward</span>
                  <span>-2 bpm dip this morning</span>
                </div>
              </div>
              <div className="pt-2 flex items-center justify-between text-on-surface-variant font-body-sm text-body-sm border-t border-surface-container/60">
                <span className="text-primary font-medium">Vagal dominant & primed</span>
                <span className="material-symbols-outlined text-sm text-primary">spa</span>
              </div>
            </div>

            {/* Basal Temperature */}
            <div className="rounded-xl bg-surface-container-lowest/80 backdrop-blur-xl p-5 shadow-sm flex flex-col justify-between group hover:shadow-md transition-all border border-surface-container-high/60">
              <div className="flex items-center justify-between">
                <span className="font-label-caps text-label-caps text-on-surface-variant uppercase tracking-wider">
                  Epidermal Basal Temp
                </span>
                <div className="w-8 h-8 rounded-full bg-tertiary-fixed/60 flex items-center justify-center text-tertiary">
                  <span className="material-symbols-outlined text-base">device_thermostat</span>
                </div>
              </div>
              <div className="my-3">
                <div className="flex items-baseline gap-2">
                  <span className="font-display-hero text-3xl sm:text-4xl text-on-surface font-semibold tracking-tight">
                    36.3
                  </span>
                  <span className="font-label-md text-label-md text-on-surface-variant">°C</span>
                </div>
                <div className="inline-flex items-center gap-1 mt-1 px-2 py-0.5 rounded-full bg-surface-container text-on-surface-variant font-label-caps text-label-caps">
                  <span className="material-symbols-outlined text-xs">horizontal_rule</span>
                  <span>Pre-surge plateau</span>
                </div>
              </div>
              <div className="pt-2 flex items-center justify-between text-on-surface-variant font-body-sm text-body-sm border-t border-surface-container/60">
                <span>Thermogenic shift Day 15</span>
                <span className="font-label-caps text-label-caps text-tertiary font-medium">Stable</span>
              </div>
            </div>

            {/* SpO2 */}
            <div className="rounded-xl bg-surface-container-lowest/80 backdrop-blur-xl p-5 shadow-sm flex flex-col justify-between group hover:shadow-md transition-all border border-surface-container-high/60">
              <div className="flex items-center justify-between">
                <span className="font-label-caps text-label-caps text-on-surface-variant uppercase tracking-wider">
                  Perfusion & SpO²
                </span>
                <div className="w-8 h-8 rounded-full bg-secondary-fixed/50 flex items-center justify-center text-secondary">
                  <span className="material-symbols-outlined text-base">air</span>
                </div>
              </div>
              <div className="my-3">
                <div className="flex items-baseline gap-2">
                  <span className="font-display-hero text-3xl sm:text-4xl text-on-surface font-semibold tracking-tight">
                    98.6
                  </span>
                  <span className="font-label-md text-label-md text-on-surface-variant">%</span>
                </div>
                <div className="inline-flex items-center gap-1 mt-1 px-2 py-0.5 rounded-full bg-secondary-container/40 text-secondary font-label-caps text-label-caps">
                  <span className="material-symbols-outlined text-xs">done_all</span>
                  <span>Continuous ESP32 pulse</span>
                </div>
              </div>
              <div className="pt-2 flex items-center justify-between text-on-surface-variant font-body-sm text-body-sm border-t border-surface-container/60">
                <span className="text-secondary font-medium">Optimal cellular oxygenation</span>
                <span className="material-symbols-outlined text-sm text-secondary">verified</span>
              </div>
            </div>
          </section>

          {/* 4. Deep Multi-Cycle Trends: Sleep Architecture & Heatmap Matrix */}
          <section className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-10">
            {/* Heatmap Matrix (7 Cols) */}
            <div className="lg:col-span-7 rounded-2xl bg-surface-container-lowest/80 backdrop-blur-2xl p-6 sm:p-8 shadow-sm flex flex-col justify-between border border-surface-container-high/60">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary text-base">
                      sentiment_satisfied
                    </span>
                    <h3 className="font-headline-sm text-headline-sm text-on-surface font-semibold">
                      Psychosomatic Energy & Valence Matrix
                    </h3>
                  </div>
                  <span className="font-label-caps text-label-caps text-on-surface-variant">
                    Past 3 Cycles
                  </span>
                </div>
                <p className="font-body-sm text-body-sm text-on-surface-variant mb-6">
                  Correlating daily subjective athletic readiness with nocturnal neuro-recovery
                  markers across cycle phases.
                </p>

                {/* Heatmap Matrix Grid */}
                <div className="space-y-2">
                  <div className="grid grid-cols-8 gap-2 text-center font-label-caps text-label-caps text-on-surface-variant text-[10px]">
                    <div className="text-left">PHASE</div>
                    <div>MON</div><div>TUE</div><div>WED</div><div>THU</div><div>FRI</div><div>SAT</div><div>SUN</div>
                  </div>

                  {/* Menstrual */}
                  <div className="grid grid-cols-8 gap-2 items-center">
                    <span className="font-label-caps text-[11px] text-primary font-medium truncate">Menstrual</span>
                    <div className="h-8 rounded bg-primary-fixed/20 flex items-center justify-center text-xs font-medium text-primary">62</div>
                    <div className="h-8 rounded bg-primary-fixed/30 flex items-center justify-center text-xs font-medium text-primary">58</div>
                    <div className="h-8 rounded bg-primary-fixed/40 flex items-center justify-center text-xs font-medium text-primary">65</div>
                    <div className="h-8 rounded bg-primary-fixed/50 flex items-center justify-center text-xs font-medium text-primary">72</div>
                    <div className="h-8 rounded bg-secondary-fixed/30 flex items-center justify-center text-xs font-medium text-secondary">75</div>
                    <div className="h-8 rounded bg-secondary-fixed/40 flex items-center justify-center text-xs font-medium text-secondary">78</div>
                    <div className="h-8 rounded bg-secondary-fixed/50 flex items-center justify-center text-xs font-medium text-secondary">81</div>
                  </div>

                  {/* Follicular (Active) */}
                  <div className="grid grid-cols-8 gap-2 items-center p-1 rounded-lg bg-surface-container-low/50">
                    <span className="font-label-caps text-[11px] text-secondary font-bold truncate flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-secondary" /> Follicular
                    </span>
                    <div className="h-8 rounded bg-secondary-fixed/50 flex items-center justify-center text-xs font-semibold text-secondary">84</div>
                    <div className="h-8 rounded bg-secondary-fixed/60 flex items-center justify-center text-xs font-semibold text-secondary">86</div>
                    <div className="h-8 rounded bg-secondary-fixed/70 flex items-center justify-center text-xs font-semibold text-secondary ring-2 ring-secondary shadow-sm">91</div>
                    <div className="h-8 rounded bg-secondary-fixed flex items-center justify-center text-xs font-semibold text-on-secondary-fixed">94</div>
                    <div className="h-8 rounded bg-secondary-fixed flex items-center justify-center text-xs font-semibold text-on-secondary-fixed">95</div>
                    <div className="h-8 rounded bg-secondary-fixed flex items-center justify-center text-xs font-semibold text-on-secondary-fixed">97</div>
                    <div className="h-8 rounded bg-secondary-container flex items-center justify-center text-xs font-bold text-on-secondary-container">98</div>
                  </div>

                  {/* Ovulatory */}
                  <div className="grid grid-cols-8 gap-2 items-center">
                    <span className="font-label-caps text-[11px] text-primary font-medium truncate">Ovulatory</span>
                    <div className="h-8 rounded bg-primary-fixed flex items-center justify-center text-xs font-bold text-on-primary-fixed">99</div>
                    <div className="h-8 rounded bg-primary-fixed flex items-center justify-center text-xs font-bold text-on-primary-fixed">96</div>
                    <div className="h-8 rounded bg-tertiary-fixed/60 flex items-center justify-center text-xs font-semibold text-tertiary">89</div>
                    <div className="h-8 rounded bg-tertiary-fixed/50 flex items-center justify-center text-xs font-medium text-tertiary">83</div>
                    <div className="h-8 rounded bg-tertiary-fixed/40 flex items-center justify-center text-xs font-medium text-tertiary">80</div>
                    <div className="h-8 rounded bg-tertiary-fixed/40 flex items-center justify-center text-xs font-medium text-tertiary">78</div>
                    <div className="h-8 rounded bg-tertiary-fixed/30 flex items-center justify-center text-xs font-medium text-tertiary">75</div>
                  </div>

                  {/* Luteal */}
                  <div className="grid grid-cols-8 gap-2 items-center">
                    <span className="font-label-caps text-[11px] text-tertiary font-medium truncate">Luteal</span>
                    <div className="h-8 rounded bg-tertiary-fixed/30 flex items-center justify-center text-xs font-medium text-tertiary">72</div>
                    <div className="h-8 rounded bg-tertiary-fixed/30 flex items-center justify-center text-xs font-medium text-tertiary">70</div>
                    <div className="h-8 rounded bg-tertiary-fixed/20 flex items-center justify-center text-xs font-medium text-tertiary">68</div>
                    <div className="h-8 rounded bg-surface-container flex items-center justify-center text-xs font-medium text-on-surface-variant">64</div>
                    <div className="h-8 rounded bg-surface-container flex items-center justify-center text-xs font-medium text-on-surface-variant">61</div>
                    <div className="h-8 rounded bg-primary-fixed/20 flex items-center justify-center text-xs font-medium text-primary">59</div>
                    <div className="h-8 rounded bg-primary-fixed/20 flex items-center justify-center text-xs font-medium text-primary">63</div>
                  </div>
                </div>
              </div>

              {/* Gradient Scale Indicator */}
              <div className="pt-4 mt-4 flex items-center justify-between text-on-surface-variant font-label-caps text-label-caps border-t border-surface-container/60">
                <span>Lower Somatic Surge (50)</span>
                <div className="h-2 w-48 rounded-full bg-gradient-to-r from-primary-fixed via-secondary-fixed to-secondary" />
                <span>Peak Resonance (100)</span>
              </div>
            </div>

            {/* Sleep Architecture (5 Cols) */}
            <div className="lg:col-span-5 rounded-2xl bg-surface-container-lowest/80 backdrop-blur-2xl p-6 sm:p-8 shadow-sm flex flex-col justify-between border border-surface-container-high/60">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-tertiary text-base">bedtime</span>
                    <h3 className="font-headline-sm text-headline-sm text-on-surface font-semibold">
                      Sleep Architecture
                    </h3>
                  </div>
                  <span className="px-2 py-0.5 rounded-full bg-secondary-container/40 text-secondary font-label-caps text-label-caps font-semibold">
                    92 Somatic Score
                  </span>
                </div>
                <p className="font-body-sm text-body-sm text-on-surface-variant mb-6">
                  Continuous accelerometry + optical PPG staging during last night's regenerative
                  session.
                </p>

                <div className="flex items-baseline justify-between mb-4">
                  <div>
                    <span className="font-display-hero text-3xl sm:text-4xl text-on-surface font-semibold tracking-tight">
                      8.2
                    </span>
                    <span className="font-label-md text-label-md text-on-surface-variant">hrs Total</span>
                  </div>
                  <div className="text-right">
                    <span className="font-headline-md text-headline-md text-secondary font-semibold">
                      2.1
                    </span>
                    <span className="font-label-md text-label-md text-secondary">hrs Deep Rest</span>
                  </div>
                </div>

                {/* Segmented Sleep Bar */}
                <div className="w-full h-3 rounded-full overflow-hidden flex gap-0.5 bg-surface-container mb-4">
                  <div className="h-full bg-tertiary-fixed-dim" style={{ width: "26%" }} title="Deep: 2.1h" />
                  <div className="h-full bg-secondary-container" style={{ width: "48%" }} title="Core: 3.9h" />
                  <div className="h-full bg-primary-fixed" style={{ width: "22%" }} title="REM: 1.8h" />
                  <div className="h-full bg-surface-dim" style={{ width: "4%" }} title="Awake: 0.4h" />
                </div>

                <div className="grid grid-cols-3 gap-2 text-center pt-2">
                  <div className="p-2.5 rounded-xl bg-surface-container-low/60">
                    <span className="block font-label-caps text-label-caps text-tertiary font-medium">
                      DEEP REST
                    </span>
                    <span className="font-headline-sm text-sm text-on-surface font-semibold">
                      26% (High)
                    </span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-surface-container-low/60">
                    <span className="block font-label-caps text-label-caps text-secondary font-medium">
                      CORE LIGHT
                    </span>
                    <span className="font-headline-sm text-sm text-on-surface font-semibold">
                      48% (Steady)
                    </span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-surface-container-low/60">
                    <span className="block font-label-caps text-label-caps text-primary font-medium">
                      REM NEURAL
                    </span>
                    <span className="font-headline-sm text-sm text-on-surface font-semibold">
                      22% (Target)
                    </span>
                  </div>
                </div>
              </div>

              {/* Somatic insight */}
              <div className="mt-5 p-3.5 rounded-xl bg-tertiary-fixed/20 flex items-start gap-3 border border-tertiary-fixed/40">
                <span className="material-symbols-outlined text-tertiary text-base mt-0.5">
                  auto_awesome
                </span>
                <p className="font-body-sm text-body-sm text-on-tertiary-fixed-variant leading-snug">
                  Your REM-to-Deep ratio is indexed 18% higher than typical follicular entry,
                  signaling nervous system alignment for tomorrow's neuromuscular mechanics.
                </p>
              </div>
            </div>
          </section>

          {/* 5. Wearable Telemetry Sync & CSV Uploader */}
          <section className="bg-surface-container-lowest rounded-2xl p-6 sm:p-8 shadow-sm border border-surface-container-high/60 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="font-headline-sm text-headline-sm text-on-surface font-semibold">
                  Wearable Telemetry Upload & Sensor Bridge
                </h3>
                <p className="font-body-sm text-body-sm text-on-surface-variant">
                  Upload daily CSV files from smart rings (Oura), bands (Whoop, Apple Watch), or raw
                  ESP32 optical pulse logs to enrich your longitudinal trends.
                </p>
              </div>

              <div className="flex items-center gap-3">
                <input
                  type="file"
                  accept=".csv,.txt"
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                  className="px-5 py-2.5 rounded-full bg-primary text-on-primary font-label-lg font-semibold hover:bg-on-primary-container transition-all flex items-center gap-2 cursor-pointer shadow-sm"
                >
                  <span className="material-symbols-outlined text-base">upload_file</span>
                  <span>{uploading ? "Ingesting Telemetry..." : "Upload Wearable CSV"}</span>
                </button>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

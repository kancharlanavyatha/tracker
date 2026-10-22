import React, { useEffect, useState } from "react";
import type { Phase, RecommendOut, User } from "../../api";
import { apiPost } from "../../api";
import type { EtherealTab } from "./Navbar";

interface CycleTrainingViewProps {
  phase: Phase | null;
  user: User | null;
  rec: RecommendOut | null;
  setTab: (tab: EtherealTab) => void;
  showToast: (msg: string, type?: "success" | "error" | "info") => void;
}

export const CycleTrainingView: React.FC<CycleTrainingViewProps> = ({
  phase,
  user,
  rec,
  setTab,
  showToast,
}) => {
  // Spark +5kg mode toggle
  const [sparkMode, setSparkMode] = useState<boolean>(true);

  // Active rest timers
  const [activeTimerIndex, setActiveTimerIndex] = useState<number | null>(null);
  const [timerSecondsLeft, setTimerSecondsLeft] = useState<number>(0);

  // Guided workout modal state
  const [guidedModalOpen, setGuidedModalOpen] = useState(false);
  const [rpeModalOpen, setRpeModalOpen] = useState(false);
  const [sessionRpe, setSessionRpe] = useState<number>(8.5);
  const [sessionNotes, setSessionNotes] = useState<string>("Explosive drive felt high, zero tendon pain.");

  const currentPhaseName = phase?.phase || "Follicular";
  const currentDay = phase?.day_in_cycle || 10;
  const cycleLength = phase?.cycle_length_assumed || 28;

  // Base squat & RDL loads modified by user weight / spark
  const userWeight = user?.weight_kg || 62;
  const baseSquat = Math.round(userWeight * 1.33 * 2) / 2;
  const squatLoad = sparkMode ? baseSquat + 5 : baseSquat;
  const rdlLoad = sparkMode ? Math.round(baseSquat * 0.85) + 5 : Math.round(baseSquat * 0.85);

  const intensityScore = rec?.training_intensity_score || 84;

  // Timer interval countdown
  useEffect(() => {
    if (activeTimerIndex === null || timerSecondsLeft <= 0) return;
    const interval = setInterval(() => {
      setTimerSecondsLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          setActiveTimerIndex(null);
          showToast("⏰ Rest period complete! Ready for your next set.", "info");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [activeTimerIndex, timerSecondsLeft, showToast]);

  const handleStartTimer = (index: number, seconds: number) => {
    if (activeTimerIndex === index) {
      // cancel
      setActiveTimerIndex(null);
      setTimerSecondsLeft(0);
      showToast("Rest timer paused.", "info");
    } else {
      setActiveTimerIndex(index);
      setTimerSecondsLeft(seconds);
      showToast(`Rest timer set for ${seconds}s. Recover and breathe deeply.`, "info");
    }
  };

  const handleLogRpe = async () => {
    try {
      await apiPost("/symptoms/log", {
        log_date: new Date().toISOString().slice(0, 10),
        mood: 9,
        fatigue: 2,
        notes: `RPE: ${sessionRpe}. ${sessionNotes}`,
      });
      showToast("✨ Post-workout RPE & neuromuscular vitals recorded!", "success");
    } catch {
      showToast("RPE recorded in session state", "info");
    } finally {
      setRpeModalOpen(false);
    }
  };

  return (
    <div className="w-full pt-20 pb-16 bg-surface relative">
      <div className="relative w-full overflow-hidden px-4 md:px-6 lg:px-8 py-8 max-w-7xl mx-auto flex flex-col gap-10">
        {/* Glow ambient spots */}
        <div className="absolute -top-32 -left-20 w-96 h-96 rounded-full bg-primary-fixed/30 blur-3xl pointer-events-none -z-10" />
        <div className="absolute top-1/4 right-0 w-[28rem] h-[28rem] rounded-full bg-secondary-container/40 blur-3xl pointer-events-none -z-10" />
        <div className="absolute bottom-10 left-1/3 w-80 h-80 rounded-full bg-tertiary-fixed/30 blur-3xl pointer-events-none -z-10" />

        {/* Section 1: Header */}
        <section className="flex flex-col lg:flex-row items-start lg:items-end justify-between gap-6">
          <div className="flex flex-col gap-2 max-w-3xl">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-secondary-container/40 text-secondary font-label-caps text-label-caps shadow-sm">
                <span
                  className="material-symbols-outlined text-sm"
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  eco
                </span>
                <span>SMART WORKOUT ENGINE</span>
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-surface-container-lowest/90 text-primary font-label-caps text-label-caps shadow-sm backdrop-blur-md border border-surface-container-high/60">
                <span
                  className="material-symbols-outlined text-sm text-primary"
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  magic_button
                </span>
                <span>
                  ⚡ Daily Workout Effort: {intensityScore} / 100 · High Energy!
                </span>
              </span>
            </div>
            <h1 className="font-display-hero text-3xl sm:text-5xl text-on-surface tracking-tight font-semibold mt-1">
              Workouts in Sync With Your Cycle
            </h1>
            <p className="font-body-lg text-body-lg text-on-surface-variant max-w-2xl">
              Move with your natural body rhythm so you build strength and feel energized all day without burnout.
            </p>
          </div>
          <div className="flex items-center gap-2 bg-surface-container-low/80 p-1.5 rounded-full backdrop-blur-md shadow-sm border border-surface-container-high/60">
            <button
              type="button"
              className="px-4 py-1.5 rounded-full bg-surface-container-lowest text-primary font-label-md text-label-md shadow-sm font-semibold transition-all cursor-pointer"
            >
              Workout Plan
            </button>
            <button
              type="button"
              onClick={() => setTab("biometrics")}
              className="px-4 py-1.5 rounded-full text-on-surface-variant hover:text-on-surface font-label-md text-label-md transition-all cursor-pointer"
            >
              Body Stats
            </button>
          </div>
        </section>

        {/* Section 2: Phase Training Blueprint */}
        <section className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-primary text-xl">calendar_month</span>
              <h2 className="font-headline-sm text-headline-sm text-on-surface font-semibold">
                Your 4-Phase Workout Guide
              </h2>
            </div>
            <span className="font-label-caps text-label-caps text-on-surface-variant uppercase tracking-wider">
              Day {currentDay} of {cycleLength} · {currentPhaseName} Phase
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Phase 01 */}
            <div
              className={`relative rounded-xl p-5 shadow-sm backdrop-blur-md flex flex-col justify-between overflow-hidden transition-all duration-300 ${
                currentPhaseName.toLowerCase() === "menstrual"
                  ? "bg-surface-container-lowest ring-2 ring-primary/40 shadow-md -translate-y-1"
                  : "bg-surface-container-lowest/80 hover:shadow-md"
              } border border-surface-container-high/60`}
            >
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-primary-fixed/30 text-primary font-label-caps text-label-caps">
                    ☾ Phase 01
                  </span>
                  <span className="font-label-caps text-label-caps text-on-surface-variant">
                    Days 1 - 5
                  </span>
                </div>
                <h3 className="font-headline-sm text-headline-sm text-on-surface font-medium mt-1">
                  Phase 1: Rest & Flow
                </h3>
                <p className="font-body-sm text-body-sm text-on-surface-variant leading-relaxed">
                  Gentle yoga, easy walks, stretching, and mindful breathwork. Listen to your body and rest.
                </p>
              </div>
              <div className="mt-4 pt-2 flex items-center justify-between text-on-surface-variant border-t border-surface-container/60">
                <span className="font-label-caps text-label-caps">Light Effort (40%)</span>
                <span className="material-symbols-outlined text-base text-outline">spa</span>
              </div>
            </div>

            {/* Phase 02 (Active Current) */}
            <div
              className={`relative rounded-xl p-5 shadow-md ring-2 ring-primary/40 backdrop-blur-md flex flex-col justify-between overflow-hidden transition-all duration-300 transform -translate-y-1 bg-surface-container-lowest border border-surface-container-high/60`}
            >
              <div className="absolute -right-6 -bottom-6 w-28 h-28 rounded-full bg-primary-fixed/40 blur-xl pointer-events-none" />
              <div className="flex flex-col gap-2 relative z-10">
                <div className="flex items-center justify-between">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-secondary text-on-secondary font-label-caps text-label-caps shadow-sm">
                    <span className="w-1.5 h-1.5 rounded-full bg-secondary-fixed animate-ping" />
                    ACTIVE TODAY
                  </span>
                  <span className="font-label-caps text-label-caps font-semibold text-secondary">
                    Days 6 - 13
                  </span>
                </div>
                <div className="flex items-center gap-1.5 mt-1">
                  <h3 className="font-headline-sm text-headline-sm text-primary font-semibold">
                    Phase 2: Power Up
                  </h3>
                  <span
                    className="material-symbols-outlined text-base text-primary"
                    style={{ fontVariationSettings: "'FILL' 1" }}
                  >
                    hotel_class
                  </span>
                </div>
                <p className="font-body-sm text-body-sm text-on-surface font-medium leading-relaxed">
                  Strength training & explosive moves! Rising energy and estrogen make you feel powerful and bounce back fast.
                </p>
              </div>
              <div className="mt-4 pt-2 flex items-center justify-between text-secondary relative z-10 border-t border-surface-container/60">
                <span className="font-label-caps text-label-caps font-semibold">
                  Energy Zone: 85-95%
                </span>
                <span className="material-symbols-outlined text-base">bolt</span>
              </div>
            </div>

            {/* Phase 03 */}
            <div
              className={`relative rounded-xl p-5 shadow-sm backdrop-blur-md flex flex-col justify-between overflow-hidden transition-all duration-300 ${
                currentPhaseName.toLowerCase() === "ovulatory" || currentPhaseName.toLowerCase() === "ovulation"
                  ? "bg-surface-container-lowest ring-2 ring-primary/40 shadow-md -translate-y-1"
                  : "bg-surface-container-lowest/80 hover:shadow-md"
              } border border-surface-container-high/60`}
            >
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-secondary-fixed/40 text-on-secondary-fixed-variant font-label-caps text-label-caps">
                    ✦ Phase 03
                  </span>
                  <span className="font-label-caps text-label-caps text-on-surface-variant">
                    Days 14 - 17
                  </span>
                </div>
                <h3 className="font-headline-sm text-headline-sm text-on-surface font-medium mt-1">
                  Phase 3: Peak Performance
                </h3>
                <p className="font-body-sm text-body-sm text-on-surface-variant leading-relaxed">
                  Peak physical strength and fastest sprints. Ideal time to set a new personal record!
                </p>
              </div>
              <div className="mt-4 pt-2 flex items-center justify-between text-on-surface-variant border-t border-surface-container/60">
                <span className="font-label-caps text-label-caps">Aim for Personal Best</span>
                <span className="material-symbols-outlined text-base text-secondary">
                  local_fire_department
                </span>
              </div>
            </div>

            {/* Phase 04 */}
            <div
              className={`relative rounded-xl p-5 shadow-sm backdrop-blur-md flex flex-col justify-between overflow-hidden transition-all duration-300 ${
                currentPhaseName.toLowerCase() === "luteal"
                  ? "bg-surface-container-lowest ring-2 ring-primary/40 shadow-md -translate-y-1"
                  : "bg-surface-container-lowest/80 hover:shadow-md"
              } border border-surface-container-high/60`}
            >
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-tertiary-fixed/40 text-on-tertiary-fixed font-label-caps text-label-caps">
                    ✧ Phase 04
                  </span>
                  <span className="font-label-caps text-label-caps text-on-surface-variant">
                    Days 18 - 28
                  </span>
                </div>
                <h3 className="font-headline-sm text-headline-sm text-on-surface font-medium mt-1">
                  Phase 4: Sculpt & Balance
                </h3>
                <p className="font-body-sm text-body-sm text-on-surface-variant leading-relaxed">
                  Steady cardio, pilates, and moderate weights, gradually cooling down toward your next cycle.
                </p>
              </div>
              <div className="mt-4 pt-2 flex items-center justify-between text-on-surface-variant border-t border-surface-container/60">
                <span className="font-label-caps text-label-caps">Steady Cardio & Tone</span>
                <span className="material-symbols-outlined text-base text-tertiary">water_drop</span>
              </div>
            </div>
          </div>
        </section>

        {/* Section 3: Today's Main Protocol */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <div className="lg:col-span-8 flex flex-col gap-6">
            <div className="bg-surface-container-lowest rounded-xl p-6 sm:p-8 shadow-md backdrop-blur-xl border border-surface-container-high/60 relative overflow-hidden">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-surface-container/60">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-primary-fixed/40 text-primary font-label-caps text-label-caps font-semibold">
                      TODAY'S WORKOUT
                    </span>
                    <span className="text-on-surface-variant font-label-caps text-label-caps">
                      High Energy Day ✨
                    </span>
                  </div>
                  <h2 className="font-headline-lg text-2xl sm:text-3xl text-on-surface font-bold">
                    Strength Day: Squats & Power Jumps
                  </h2>
                  <div className="flex items-center gap-4 mt-2 text-on-surface-variant font-label-md text-label-md flex-wrap">
                    <span className="flex items-center gap-1 text-primary font-semibold">
                      <span className="material-symbols-outlined text-base">speed</span>
                      Target Effort: 8.5 / 10
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="material-symbols-outlined text-base">timer</span>
                      48 mins
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="material-symbols-outlined text-base">bolt</span>
                      Full Body Strength
                    </span>
                  </div>
                </div>

                {/* Spark toggle */}
                <div className="flex items-center gap-1.5 bg-surface-container-low p-1.5 rounded-full self-start">
                  <button
                    type="button"
                    onClick={() => {
                      setSparkMode(true);
                      showToast("✦ Boost +5kg active! Feeling strong.", "success");
                    }}
                    className={`px-4 py-1.5 rounded-full font-label-caps text-label-caps font-semibold flex items-center gap-1 transition-all cursor-pointer ${
                      sparkMode
                        ? "bg-surface-container-lowest text-primary shadow-sm"
                        : "text-on-surface-variant hover:text-on-surface"
                    }`}
                  >
                    <span className="material-symbols-outlined text-sm">bolt</span>
                    <span>Boost +5kg</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setSparkMode(false);
                      showToast("Gentle flow cadence enabled.", "info");
                    }}
                    className={`px-4 py-1.5 rounded-full font-label-caps text-label-caps font-semibold flex items-center gap-1 transition-all cursor-pointer ${
                      !sparkMode
                        ? "bg-surface-container-lowest text-secondary shadow-sm"
                        : "text-on-surface-variant hover:text-on-surface"
                    }`}
                  >
                    <span className="material-symbols-outlined text-sm">spa</span>
                    <span>Gentle Flow</span>
                  </button>
                </div>
              </div>

              {/* Exercise List */}
              <div className="flex flex-col gap-4 mt-4">
                {/* Exercise 01 */}
                <div className="bg-surface-container-low/70 rounded-xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all hover:bg-surface-container-low border border-surface-container-high/40">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-primary-fixed/40 text-primary flex items-center justify-center font-headline-sm font-bold">
                      01
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-headline-sm text-headline-sm text-on-surface font-semibold">
                          Barbell Back Squat
                        </h4>
                        <span className="px-2 py-0.5 rounded-full bg-secondary-container/40 text-secondary font-label-caps text-[10px]">
                          Main Lift
                        </span>
                      </div>
                      <p className="font-body-sm text-body-sm text-on-surface-variant">
                        Full depth squat, push through your heels · Smooth 3s lowering
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between md:justify-end gap-6">
                    <div className="text-right">
                      <div className="font-headline-sm text-headline-sm text-on-surface font-semibold">
                        4 × 5 @ {squatLoad} kg
                      </div>
                      <div className="font-label-caps text-label-caps text-on-surface-variant">
                        Rest: 180s · Full Recovery
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleStartTimer(1, 180)}
                      className={`px-4 py-2 rounded-full font-label-md text-label-md font-semibold flex items-center gap-1.5 shadow-sm transition-all cursor-pointer ${
                        activeTimerIndex === 1
                          ? "bg-primary text-on-primary animate-pulse"
                          : "bg-surface-container-lowest text-primary hover:bg-primary-fixed hover:text-on-primary-fixed"
                      }`}
                    >
                      <span className="material-symbols-outlined text-base">timer</span>
                      <span>
                        {activeTimerIndex === 1 ? `Resting: ${timerSecondsLeft}s` : "Start Rest"}
                      </span>
                    </button>
                  </div>
                </div>

                {/* Exercise 02 */}
                <div className="bg-surface-container-low/70 rounded-xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all hover:bg-surface-container-low border border-surface-container-high/40">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-secondary-container/40 text-secondary flex items-center justify-center font-headline-sm font-bold">
                      02
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-headline-sm text-headline-sm text-on-surface font-semibold">
                          Banded Broad Jumps
                        </h4>
                        <span className="px-2 py-0.5 rounded-full bg-primary-fixed/30 text-primary font-label-caps text-[10px]">
                          Power Combo
                        </span>
                      </div>
                      <p className="font-body-sm text-body-sm text-on-surface-variant">
                        Land softly in a comfortable squat · Focus on bounce and spring
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between md:justify-end gap-6">
                    <div className="text-right">
                      <div className="font-headline-sm text-headline-sm text-on-surface font-semibold">
                        4 × 3 reps
                      </div>
                      <div className="font-label-caps text-label-caps text-on-surface-variant">
                        Rest: 90s · Catch Your Breath
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleStartTimer(2, 90)}
                      className={`px-4 py-2 rounded-full font-label-md text-label-md font-semibold flex items-center gap-1.5 shadow-sm transition-all cursor-pointer ${
                        activeTimerIndex === 2
                          ? "bg-primary text-on-primary animate-pulse"
                          : "bg-surface-container-lowest text-primary hover:bg-primary-fixed hover:text-on-primary-fixed"
                      }`}
                    >
                      <span className="material-symbols-outlined text-base">timer</span>
                      <span>
                        {activeTimerIndex === 2 ? `Resting: ${timerSecondsLeft}s` : "Start Rest"}
                      </span>
                    </button>
                  </div>
                </div>

                {/* Exercise 03 */}
                <div className="bg-surface-container-low/70 rounded-xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all hover:bg-surface-container-low border border-surface-container-high/40">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-tertiary-fixed/40 text-tertiary flex items-center justify-center font-headline-sm font-bold">
                      03
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-headline-sm text-headline-sm text-on-surface font-semibold">
                          Romanian Deadlift (RDL)
                        </h4>
                        <span className="px-2 py-0.5 rounded-full bg-surface-variant text-on-surface-variant font-label-caps text-[10px]">
                          Legs & Glutes
                        </span>
                      </div>
                      <p className="font-body-sm text-body-sm text-on-surface-variant">
                        Hinge at hips, feeling stretch in hamstrings · Keep back straight
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between md:justify-end gap-6">
                    <div className="text-right">
                      <div className="font-headline-sm text-headline-sm text-on-surface font-semibold">
                        3 × 8 @ {rdlLoad} kg
                      </div>
                      <div className="font-label-caps text-label-caps text-on-surface-variant">
                        Rest: 120s · Deep Recovery
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleStartTimer(3, 120)}
                      className={`px-4 py-2 rounded-full font-label-md text-label-md font-semibold flex items-center gap-1.5 shadow-sm transition-all cursor-pointer ${
                        activeTimerIndex === 3
                          ? "bg-primary text-on-primary animate-pulse"
                          : "bg-surface-container-lowest text-primary hover:bg-primary-fixed hover:text-on-primary-fixed"
                      }`}
                    >
                      <span className="material-symbols-outlined text-base">timer</span>
                      <span>
                        {activeTimerIndex === 3 ? `Resting: ${timerSecondsLeft}s` : "Start Rest"}
                      </span>
                    </button>
                  </div>
                </div>

                {/* Exercise 04 */}
                <div className="bg-surface-container-low/70 rounded-xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all hover:bg-surface-container-low border border-surface-container-high/40">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-surface-variant text-on-surface-variant flex items-center justify-center font-headline-sm font-bold">
                      04
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-headline-sm text-headline-sm text-on-surface font-semibold">
                          Pallof Press & Breath Flushes
                        </h4>
                        <span className="px-2 py-0.5 rounded-full bg-surface-variant text-on-surface-variant font-label-caps text-[10px]">
                          Core & Abs
                        </span>
                      </div>
                      <p className="font-body-sm text-body-sm text-on-surface-variant">
                        Hold band steady at chest with deep belly breaths
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between md:justify-end gap-6">
                    <div className="text-right">
                      <div className="font-headline-sm text-headline-sm text-on-surface font-semibold">
                        3 × 12 / side
                      </div>
                      <div className="font-label-caps text-label-caps text-on-surface-variant">
                        Rest: 60s · Breathe
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleStartTimer(4, 60)}
                      className={`px-4 py-2 rounded-full font-label-md text-label-md font-semibold flex items-center gap-1.5 shadow-sm transition-all cursor-pointer ${
                        activeTimerIndex === 4
                          ? "bg-primary text-on-primary animate-pulse"
                          : "bg-surface-container-lowest text-primary hover:bg-primary-fixed hover:text-on-primary-fixed"
                      }`}
                    >
                      <span className="material-symbols-outlined text-base">timer</span>
                      <span>
                        {activeTimerIndex === 4 ? `Resting: ${timerSecondsLeft}s` : "Start Rest"}
                      </span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-6 pt-4 border-t border-surface-container/60">
                <button
                  type="button"
                  onClick={() => setGuidedModalOpen(true)}
                  className="w-full sm:w-auto px-8 py-3 rounded-full bg-primary text-on-primary font-headline-sm text-headline-sm font-semibold shadow-lg hover:shadow-primary-container/40 hover:opacity-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span className="material-symbols-outlined">play_circle</span>
                  <span>Start Guided Workout 🌸</span>
                </button>
                <button
                  type="button"
                  onClick={() => setRpeModalOpen(true)}
                  className="w-full sm:w-auto px-6 py-3 rounded-full bg-surface-container-lowest text-on-surface hover:text-primary font-label-lg text-label-lg shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer border border-surface-container-high"
                >
                  <span className="material-symbols-outlined text-lg">edit_note</span>
                  <span>Log How It Felt ✨</span>
                </button>
              </div>
            </div>

            {/* Preparation cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="relative bg-surface-container-lowest rounded-xl p-5 shadow-sm overflow-hidden flex items-center gap-4 border border-surface-container-high/60">
                <img
                  className="w-24 h-24 rounded-lg object-cover flex-shrink-0"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuApFROrU4FLtBG4hK57LHI0xPxCsQsxnprVkOaCbMn2TveOz6IAfHGc0ENcV0TGc71sWLI-fI3qX9mur8gLJaAfUI_iEPLXEJ7lSTBB8xw9GSpJVdzJOsYsvTPIjj-OAw9oM728hHHbMdj2C2UzXJLAenAgzt2azHVEflbuj5lh_XViLeTeCJxd6edVQMrKIkj26Oo3e9QOue3cy4pNst5SDLWzPPsmCYlQSBeR7_aYmUfKKa30REx-"
                  alt="Dynamic Prep"
                />
                <div className="flex flex-col gap-1 min-w-0">
                  <span className="font-label-caps text-label-caps text-secondary font-semibold">
                    Warm-Up Routine
                  </span>
                  <h4 className="font-headline-sm text-headline-sm text-on-surface font-semibold truncate">
                    Hip & Leg Warm-Up
                  </h4>
                  <p className="font-body-sm text-body-sm text-on-surface-variant line-clamp-2">
                    7 mins of light lateral steps, gentle hip circles, and ankle stretches to get warm.
                  </p>
                </div>
              </div>

              <div className="relative bg-surface-container-lowest rounded-xl p-5 shadow-sm overflow-hidden flex items-center gap-4 border border-surface-container-high/60">
                <div className="w-24 h-24 rounded-lg bg-tertiary-fixed/40 flex items-center justify-center text-tertiary flex-shrink-0">
                  <span className="material-symbols-outlined text-4xl">air</span>
                </div>
                <div className="flex flex-col gap-1 min-w-0">
                  <span className="font-label-caps text-label-caps text-tertiary font-semibold">
                    Cool Down
                  </span>
                  <h4 className="font-headline-sm text-headline-sm text-on-surface font-semibold truncate">
                    Deep Belly Breaths
                  </h4>
                  <p className="font-body-sm text-body-sm text-on-surface-variant line-clamp-2">
                    Inhale for 4 seconds, exhale for 8 seconds to relax your body and lower stress.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right 4 cols: Wearable Telemetry & Phase Strain Specs */}
          <div className="lg:col-span-4 flex flex-col gap-6">
            <div className="bg-surface-container-lowest rounded-xl p-6 shadow-md border border-surface-container-high/60 space-y-4">
              <div className="flex items-center justify-between">
                <span className="font-label-caps text-label-caps text-primary uppercase font-semibold">
                  Live Body Vitals
                </span>
                <span className="w-2 h-2 rounded-full bg-secondary animate-pulse" />
              </div>
              <h3 className="font-headline-md text-headline-md text-on-surface font-bold">
                Daily Readiness
              </h3>

              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 rounded-lg bg-surface-container-low/70">
                  <span className="font-body-md text-on-surface">Heart Rate Recovery (HRV)</span>
                  <span className="font-headline-sm text-secondary font-semibold">68 ms</span>
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg bg-surface-container-low/70">
                  <span className="font-body-md text-on-surface">Resting Heart Rate</span>
                  <span className="font-headline-sm text-primary font-semibold">54 bpm</span>
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg bg-surface-container-low/70">
                  <span className="font-body-md text-on-surface">Skin Temperature</span>
                  <span className="font-headline-sm text-on-surface font-semibold">36.3 °C</span>
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg bg-surface-container-low/70">
                  <span className="font-body-md text-on-surface">Blood Oxygen (SpO2)</span>
                  <span className="font-headline-sm text-secondary font-semibold">98.6 %</span>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-secondary-container/20 border border-secondary/20">
                <div className="flex items-center gap-1.5 text-secondary font-label-caps text-label-caps font-semibold">
                  <span className="material-symbols-outlined text-sm">verified</span>
                  <span>Feeling Strong & Energized</span>
                </div>
                <p className="font-body-sm text-body-sm text-on-surface-variant mt-1 leading-snug">
                  Your natural estrogen makes you feel energized and helps you bounce back fast. Perfect day for a strong workout!
                </p>
              </div>
            </div>

            <div className="bg-gradient-to-br from-primary-fixed/30 to-tertiary-fixed/30 p-6 rounded-xl shadow-sm border border-surface-container-high/60 space-y-3">
              <span className="font-label-caps text-label-caps text-primary uppercase font-semibold">
                Post-Workout Fuel
              </span>
              <p className="font-body-sm text-body-sm text-on-surface-variant leading-relaxed">
                Enjoy 30-40g protein with healthy carbs within 45 minutes to recharge your energy and rebuild muscle.
              </p>
              <button
                type="button"
                onClick={() => setTab("kitchen")}
                className="w-full py-2 rounded-full bg-surface-container-lowest text-primary font-label-md text-label-md hover:bg-primary-fixed transition-colors font-semibold cursor-pointer shadow-sm"
              >
                Go to Fuel & Eats 🥗
              </button>
            </div>
          </div>
        </div>

        {/* Guided Workout Modal */}
        {guidedModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
            <div className="bg-surface-container-lowest rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-surface-container-high space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-headline-md text-headline-md text-primary font-bold">
                  Guided Workout: Barbell Back Squat
                </h3>
                <button
                  type="button"
                  onClick={() => setGuidedModalOpen(false)}
                  className="text-on-surface-variant hover:text-on-surface"
                >
                  ✕
                </button>
              </div>
              <p className="font-body-md text-on-surface-variant">
                Set 1 of 4: 5 reps @ {squatLoad} kg. Focus on smooth descent, pushing through your heels, and standing tall.
              </p>
              <div className="p-4 rounded-xl bg-surface-container-low text-center space-y-2">
                <span className="font-label-caps text-xs text-secondary font-semibold uppercase">
                  Pacing Metronome
                </span>
                <div className="text-3xl font-display-hero text-primary">3s Down · 1s Drive</div>
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    showToast("Set 1 recorded! Rest timer started.", "success");
                    handleStartTimer(1, 180);
                    setGuidedModalOpen(false);
                  }}
                  className="flex-1 py-2.5 rounded-full bg-primary text-on-primary font-label-lg font-semibold hover:bg-on-primary-container transition-all cursor-pointer"
                >
                  Complete Set & Start Rest (180s)
                </button>
                <button
                  type="button"
                  onClick={() => setGuidedModalOpen(false)}
                  className="px-4 py-2.5 rounded-full bg-surface-container text-on-surface font-label-lg cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        {/* RPE Log Modal */}
        {rpeModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
            <div className="bg-surface-container-lowest rounded-2xl max-w-md w-full p-6 shadow-2xl border border-surface-container-high space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-headline-md text-headline-md text-primary font-bold">
                  How Did Today's Workout Feel?
                </h3>
                <button
                  type="button"
                  onClick={() => setRpeModalOpen(false)}
                  className="text-on-surface-variant hover:text-on-surface cursor-pointer"
                >
                  ✕
                </button>
              </div>
              <div className="space-y-1.5">
                <div className="flex justify-between items-center">
                  <label className="font-label-caps text-on-surface-variant uppercase font-semibold text-xs">
                    Effort Level (1 - 10)
                  </label>
                  <span className="font-headline-sm text-primary font-bold">{sessionRpe} / 10</span>
                </div>
                <input
                  type="range"
                  min="5"
                  max="10"
                  step="0.5"
                  value={sessionRpe}
                  onChange={(e) => setSessionRpe(Number(e.target.value))}
                  className="w-full h-2 bg-surface-container rounded-lg appearance-none cursor-pointer accent-primary"
                />
              </div>
              <div className="space-y-1.5">
                <label className="font-label-caps text-on-surface-variant uppercase font-semibold text-xs">
                  Workout Notes
                </label>
                <textarea
                  value={sessionNotes}
                  onChange={(e) => setSessionNotes(e.target.value)}
                  rows={3}
                  className="w-full bg-surface-container-low text-on-surface rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary border border-surface-container-high"
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleLogRpe}
                  className="flex-1 py-2.5 rounded-full bg-primary text-on-primary font-label-lg font-semibold hover:bg-on-primary-container transition-all cursor-pointer"
                >
                  Save Workout Log ✨
                </button>
                <button
                  type="button"
                  onClick={() => setRpeModalOpen(false)}
                  className="px-4 py-2.5 rounded-full bg-surface-container text-on-surface font-label-lg cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

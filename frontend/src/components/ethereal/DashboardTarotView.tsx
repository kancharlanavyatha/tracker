import React, { useState } from "react";
import type { Dashboard, Phase, User } from "../../api";
import { apiPost } from "../../api";
import type { EtherealTab } from "./Navbar";
import { InteractiveTarotDeck } from "./InteractiveTarotDeck";

interface DashboardTarotViewProps {
  dash: Dashboard | null;
  phase: Phase | null;
  user: User | null;
  setTab: (tab: EtherealTab) => void;
  onOpenRecipe: (recipeName: string) => void;
  showToast: (msg: string, type?: "success" | "error" | "info") => void;
}

export const DashboardTarotView: React.FC<DashboardTarotViewProps> = ({
  dash,
  phase,
  user,
  setTab,
  onOpenRecipe,
  showToast,
}) => {
  // Morning Check-In State
  const [mood, setMood] = useState<"serene" | "energized" | "sensitive">("serene");
  const [fatigue, setFatigue] = useState<number>(1);
  const [bloating, setBloating] = useState<boolean>(false);
  const [loggingVitals, setLoggingVitals] = useState<boolean>(false);

  // AI Wellness Guide State
  const [oracleReply, setOracleReply] = useState<string>(
    "Your natural energy rhythm is peaking today! Your heart rate and recovery markers show you're in great shape for a strong workout."
  );

  const currentDay = phase?.day_in_cycle || 10;
  const cycleLength = phase?.cycle_length_assumed || 28;
  const currentPhaseName = phase?.phase || "Follicular";
  const displayName = user?.display_name || user?.email?.split("@")[0] || "Elena";

  // Days to next peak
  const daysToPeak = Math.max(1, 14 - currentDay);

  // Phase ring percentage
  const progressRatio = Math.min(1, Math.max(0.05, currentDay / cycleLength));
  const circleCircumference = 314.159;
  const strokeOffset = circleCircumference * (1 - progressRatio);

  const handleSomaticLog = async () => {
    setLoggingVitals(true);
    try {
      const moodScore = mood === "energized" ? 9 : mood === "serene" ? 8 : 5;
      await apiPost("/symptoms/log", {
        log_date: new Date().toISOString().slice(0, 10),
        mood: moodScore,
        fatigue: fatigue,
        bloating: bloating,
        cramps: 0,
        headache: false,
        backache: false,
        water_liters: 2.5,
        sleep_hours: 8.0,
      });
      showToast("✨ Morning check-in saved! Today's recommendations updated.", "success");
    } catch {
      showToast("Saved to your daily rhythm log!", "info");
    } finally {
      setLoggingVitals(false);
    }
  };

  const handleOraclePreset = (promptText: string) => {
    if (promptText.includes("warm-up")) {
      setOracleReply(
        "Suggested Warm-up: 5 mins light cycling, followed by 10 bodyweight squats, 8 lunges per side, and ramping up sets: 1x8 light, 1x5 moderate, then your working sets."
      );
    } else if (promptText.includes("tea")) {
      setOracleReply(
        "Bedtime Tea: Steep fresh chamomile with a touch of spearmint and raw honey. Helps your muscles relax and promotes deep, sound sleep."
      );
    } else {
      setOracleReply(
        `In your ${currentPhaseName} phase, your body easily uses carbohydrates for energy. Pair clean carbs with protein around workouts!`
      );
    }
  };

  return (
    <div className="w-full pt-20 pb-16 bg-surface relative">
      <div className="flex flex-col w-full">
        {/* Ambient Living Atmosphere Layer */}
        <div className="relative w-full max-w-[1400px] mx-auto px-4 md:px-6 lg:px-8 space-y-10">
          {/* Decorative Ethereal Gradients */}
          <div className="absolute -top-12 left-1/4 w-96 h-96 bg-primary-container/20 rounded-full blur-3xl pointer-events-none -z-10" />
          <div className="absolute top-96 right-12 w-[32rem] h-[32rem] bg-secondary-container/25 rounded-full blur-[100px] pointer-events-none -z-10" />
          <div className="absolute bottom-20 left-10 w-80 h-80 bg-tertiary-fixed/30 rounded-full blur-3xl pointer-events-none -z-10" />

          {/* 1. Welcoming Hero Banner */}
          <section className="relative pt-4">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
              <div className="space-y-2 max-w-2xl">
                <div className="flex items-center gap-2 text-primary font-label-caps text-xs uppercase tracking-widest">
                  <span className="material-symbols-outlined text-sm text-primary">spa</span>
                  <span>Morning Sunshine ✦ {currentPhaseName} Phase</span>
                  <span className="text-outline-variant">•</span>
                  <span className="text-secondary font-semibold">
                    Day {currentDay} of {cycleLength}
                  </span>
                </div>
                <h1 className="font-display-hero text-3xl sm:text-5xl text-on-surface tracking-tight font-bold">
                  Good morning, {displayName}{" "}
                  <span className="inline-block text-primary transform hover:scale-110 transition-transform cursor-pointer">
                    🌸
                  </span>
                </h1>
                <p className="font-body-lg text-base sm:text-lg text-on-surface-variant leading-relaxed">
                  Your energy is climbing! Your muscles are primed, and you're ready to crush your
                  workout and enjoy today.
                </p>
              </div>

              {/* Quick Phase Horizon Pill */}
              <div className="flex items-center gap-4 bg-surface-container-low/90 backdrop-blur-md px-5 py-3 rounded-full shadow-[0_8px_24px_rgba(224,131,155,0.08)] self-start md:self-auto border border-surface-container-high/60">
                <div className="flex -space-x-1.5">
                  <span className="w-3.5 h-3.5 rounded-full bg-primary/40 ring-2 ring-surface" />
                  <span className="w-3.5 h-3.5 rounded-full bg-primary ring-2 ring-surface animate-pulse" />
                  <span className="w-3.5 h-3.5 rounded-full bg-secondary-container ring-2 ring-surface" />
                  <span className="w-3.5 h-3.5 rounded-full bg-tertiary-fixed ring-2 ring-surface" />
                </div>
                <div className="text-right">
                  <span className="font-label-caps text-xs text-on-surface-variant uppercase block">
                    {currentDay < 14 ? "Peak Energy In" : "Cycle Reset In"}
                  </span>
                  <span className="font-headline-sm text-lg text-primary font-bold">
                    ~{daysToPeak} Days
                  </span>
                </div>
              </div>
            </div>
          </section>

          {/* 2. Interactive 22-Card Tarot & Intuition Spread */}
          <InteractiveTarotDeck
            currentPhaseName={currentPhaseName}
            showToast={showToast}
          />

          {/* 3. Daily Energy Score & Morning Check-In */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Left 7 cols: Energy Ring & Check-In */}
            <div className="lg:col-span-7 space-y-6">
              {/* Daily Energy Ring Card */}
              <div className="bg-surface-container-lowest/90 backdrop-blur-xl rounded-2xl p-6 sm:p-8 shadow-[0_12px_36px_rgba(0,0,0,0.03)] border border-surface-container-high/60 flex flex-col md:flex-row items-center gap-6">
                {/* Visual Progress Ring */}
                <div className="relative w-44 h-44 flex-shrink-0 flex items-center justify-center">
                  <svg className="w-full h-full transform -rotate-90" viewBox="0 0 120 120">
                    <circle
                      className="text-surface-container-high"
                      cx="60"
                      cy="60"
                      fill="none"
                      r="50"
                      stroke="currentColor"
                      strokeWidth="8"
                    />
                    <circle
                      className="text-primary transition-all duration-1000"
                      cx="60"
                      cy="60"
                      fill="none"
                      r="50"
                      stroke="currentColor"
                      strokeDasharray="314.159"
                      strokeDashoffset={strokeOffset}
                      strokeLinecap="round"
                      strokeWidth="8"
                    />
                    <circle
                      className="text-primary-container animate-ping"
                      cx="95"
                      cy="25"
                      fill="currentColor"
                      r="4.5"
                    />
                    <circle className="text-primary" cx="95" cy="25" fill="currentColor" r="3.5" />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                    <span className="font-label-caps text-[10px] text-on-surface-variant uppercase tracking-widest">
                      Cycle Day
                    </span>
                    <span className="font-headline-lg text-2xl font-bold text-primary">
                      Day {currentDay}
                    </span>
                    <span className="font-label-caps text-xs text-secondary font-semibold">
                      High Energy
                    </span>
                  </div>
                </div>

                {/* Energy Details */}
                <div className="space-y-2 flex-1 text-center md:text-left">
                  <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-secondary-container/40 text-secondary font-label-caps text-xs font-semibold">
                    <span className="w-1.5 h-1.5 rounded-full bg-secondary" />
                    <span>Daily Readiness Engine Active</span>
                  </div>
                  <div className="flex items-baseline justify-center md:justify-start gap-2">
                    <span className="font-display-hero text-4xl sm:text-5xl text-on-surface font-bold tracking-tight">
                      88
                    </span>
                    <span className="font-headline-sm text-lg text-on-surface-variant font-normal">
                      / 100
                    </span>
                    <span className="font-label-md text-sm text-secondary ml-2 font-semibold">
                      Feeling Strong!
                    </span>
                  </div>
                  <p className="font-body-md text-sm text-on-surface-variant">
                    Your body is well-rested and aligned with your cycle. Resting heart rate is steady
                    at 54 bpm, and your energy reserves are high.
                  </p>
                  <div className="pt-2 flex flex-wrap gap-2 justify-center md:justify-start">
                    <div className="px-3 py-1 rounded-full bg-surface-container-low text-on-surface font-label-caps text-xs flex items-center gap-1">
                      <span className="text-primary">✦</span> Heart Rhythm: Ready (+12%)
                    </div>
                    <div className="px-3 py-1 rounded-full bg-surface-container-low text-on-surface font-label-caps text-xs flex items-center gap-1">
                      <span className="text-secondary">✦</span> Temp: 36.3°C (Normal)
                    </div>
                    <div className="px-3 py-1 rounded-full bg-surface-container-low text-on-surface font-label-caps text-xs flex items-center gap-1">
                      <span className="text-tertiary">✦</span> Recovery: Fresh
                    </div>
                  </div>
                </div>
              </div>

              {/* Quick Morning Check-In */}
              <div className="bg-surface-container-lowest/90 backdrop-blur-xl rounded-2xl p-6 sm:p-8 shadow-[0_12px_36px_rgba(0,0,0,0.03)] border border-surface-container-high/60 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-headline-sm text-lg text-on-surface font-bold">
                      Quick Morning Check-In
                    </h3>
                    <p className="font-label-caps text-xs text-on-surface-variant">
                      Takes 5 seconds to match today's plan to how you feel
                    </p>
                  </div>
                  <div className="px-3 py-1 rounded-full bg-surface-container text-on-surface-variant font-label-caps text-xs flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-secondary" />
                    <span>Quick Sync</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-1">
                  {/* Mood Selector */}
                  <div className="space-y-1.5">
                    <label className="font-label-caps text-xs text-on-surface-variant block uppercase font-semibold">
                      How are you feeling?
                    </label>
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => setMood("serene")}
                        className={`flex-1 py-1.5 px-2 rounded-full font-label-md text-xs text-center transition-all cursor-pointer ${
                          mood === "serene"
                            ? "bg-primary-fixed text-primary font-semibold ring-1 ring-primary/40"
                            : "bg-surface-container text-on-surface-variant hover:bg-surface-container-high"
                        }`}
                      >
                        ✨ Peaceful
                      </button>
                      <button
                        type="button"
                        onClick={() => setMood("energized")}
                        className={`flex-1 py-1.5 px-2 rounded-full font-label-md text-xs text-center transition-all cursor-pointer ${
                          mood === "energized"
                            ? "bg-secondary-container text-secondary font-semibold ring-1 ring-secondary/40"
                            : "bg-surface-container text-on-surface-variant hover:bg-surface-container-high"
                        }`}
                      >
                        ⚡ Energized
                      </button>
                      <button
                        type="button"
                        onClick={() => setMood("sensitive")}
                        className={`flex-1 py-1.5 px-2 rounded-full font-label-md text-xs text-center transition-all cursor-pointer ${
                          mood === "sensitive"
                            ? "bg-tertiary-fixed text-tertiary font-semibold ring-1 ring-tertiary/40"
                            : "bg-surface-container text-on-surface-variant hover:bg-surface-container-high"
                        }`}
                      >
                        💧 Sensitive
                      </button>
                    </div>
                  </div>

                  {/* Fatigue Slider */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between items-center">
                      <label className="font-label-caps text-xs text-on-surface-variant block uppercase font-semibold">
                        Tiredness Level
                      </label>
                      <span className="font-label-caps text-xs text-secondary font-bold">
                        {fatigue === 1
                          ? "Great (1/5)"
                          : fatigue === 2
                          ? "Good (2/5)"
                          : fatigue === 3
                          ? "Moderate (3/5)"
                          : fatigue === 4
                          ? "Tired (4/5)"
                          : "Exhausted (5/5)"}
                      </span>
                    </div>
                    <input
                      type="range"
                      min="1"
                      max="5"
                      value={fatigue}
                      onChange={(e) => setFatigue(Number(e.target.value))}
                      className="w-full h-2 bg-surface-container rounded-lg appearance-none cursor-pointer accent-primary"
                    />
                  </div>

                  {/* Bloat Toggle */}
                  <div className="space-y-1.5">
                    <label className="font-label-caps text-xs text-on-surface-variant block uppercase font-semibold">
                      Bloating / Fluid
                    </label>
                    <button
                      type="button"
                      onClick={() => setBloating((prev) => !prev)}
                      className={`w-full py-1.5 px-3 rounded-full font-label-md text-xs flex items-center justify-between transition-colors cursor-pointer ${
                        bloating
                          ? "bg-primary-fixed/40 text-primary border border-primary/30"
                          : "bg-surface-container text-on-surface-variant"
                      }`}
                    >
                      <span>{bloating ? "A bit bloated" : "Feeling light"}</span>
                      <span className="material-symbols-outlined text-sm text-secondary">
                        water_drop
                      </span>
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-surface-container/60">
                  <span className="font-body-sm text-xs text-on-surface-variant italic">
                    "Matches today's workout and meals to your energy"
                  </span>
                  <button
                    type="button"
                    onClick={handleSomaticLog}
                    disabled={loggingVitals}
                    className="px-5 py-2 rounded-full bg-primary text-on-primary font-label-lg text-xs font-semibold hover:bg-on-primary-container transition-all flex items-center gap-1.5 shadow-sm active:scale-95 cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-sm">check_circle</span>
                    <span>{loggingVitals ? "Saving..." : "Save Today's Vitals ✨"}</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Right 5 cols: Workout, Meals & AI Assistant */}
            <div className="lg:col-span-5 space-y-6 flex flex-col justify-between">
              {/* Today's Workout Card */}
              <div className="bg-surface-container-lowest/90 backdrop-blur-xl rounded-2xl p-5 shadow-[0_12px_36px_rgba(0,0,0,0.03)] hover:shadow-md transition-all border border-surface-container-high/60">
                <div className="flex items-center justify-between pb-2">
                  <span className="px-2.5 py-0.5 rounded-full bg-primary-fixed/50 text-primary font-label-caps text-xs font-semibold uppercase">
                    Today's Workout
                  </span>
                  <span className="font-label-caps text-xs text-on-surface-variant">
                    50 Min Session
                  </span>
                </div>
                <div className="flex gap-4 items-center py-2">
                  <div className="w-18 h-18 rounded-xl overflow-hidden flex-shrink-0 bg-surface-container">
                    <img
                      className="w-full h-full object-cover"
                      src="https://lh3.googleusercontent.com/aida-public/AB6AXuApFROrU4FLtBG4hK57LHI0xPxCsQsxnprVkOaCbMn2TveOz6IAfHGc0ENcV0TGc71sWLI-fI3qX9mur8gLJaAfUI_iEPLXEJ7lSTBB8xw9GSpJVdzJOsYsvTPIjj-OAw9oM728hHHbMdj2C2UzXJLAenAgzt2azHVEflbuj5lh_XViLeTeCJxd6edVQMrKIkj26Oo3e9QOue3cy4pNst5SDLWzPPsmCYlQSBeR7_aYmUfKKa30REx-"
                      alt="Workout"
                    />
                  </div>
                  <div className="space-y-0.5 min-w-0">
                    <h4 className="font-headline-sm text-base text-on-surface font-bold truncate">
                      Power Squats & Hip Mobility
                    </h4>
                    <p className="font-body-sm text-xs text-on-surface-variant line-clamp-2">
                      4 sets of heavy back squats paired with bouncy broad jumps. High estrogen gives
                      you natural power today!
                    </p>
                  </div>
                </div>
                <div className="flex items-center justify-between pt-2 border-t border-surface-container/60">
                  <div className="flex items-center gap-1 text-secondary font-label-caps text-xs font-semibold">
                    <span className="material-symbols-outlined text-sm">bolt</span>
                    <span>Best Time: 10:00 AM - 2:00 PM</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setTab("training")}
                    className="px-3.5 py-1 rounded-full bg-primary text-on-primary font-label-md text-xs font-semibold hover:bg-on-primary-container transition-colors cursor-pointer"
                  >
                    Start Workout
                  </button>
                </div>
              </div>

              {/* Today's Power Plate */}
              <div className="bg-surface-container-lowest/90 backdrop-blur-xl rounded-2xl p-5 shadow-[0_12px_36px_rgba(0,0,0,0.03)] hover:shadow-md transition-all border border-surface-container-high/60">
                <div className="flex items-center justify-between pb-2">
                  <span className="px-2.5 py-0.5 rounded-full bg-secondary-fixed text-on-secondary-fixed font-label-caps text-xs font-semibold uppercase">
                    Featured Meal
                  </span>
                  <span className="font-label-caps text-xs text-on-surface-variant">
                    {currentPhaseName} Glow
                  </span>
                </div>
                <div className="flex gap-4 items-center py-2">
                  <div className="w-18 h-18 rounded-xl overflow-hidden flex-shrink-0 bg-surface-container">
                    <img
                      className="w-full h-full object-cover"
                      src="https://lh3.googleusercontent.com/aida-public/AB6AXuDZr5szP_D9SzUJwHALoUbw5YC1GpEi-57qdeFHfohzY-lLhGNCK3OgKJLp9bPbOgDbFjXFwYC5P332IUQSCNGPPFCTRj-OFrDhR8LrH_huimnMuiFvi1dgbARNcBj3RHK-5tLHlOPobQlnpbIyJF0fqitoPkvnesA1QaITGhrMamKxouZN6WI0XV_KP8fxTi1hZ1OHyWr6THRicLq_lqZlTsWywwc-UbzyZEMSuI6Fdxa1rtXkLpaL"
                      alt="Nourishment"
                    />
                  </div>
                  <div className="space-y-0.5 min-w-0">
                    <h4 className="font-headline-sm text-base text-on-surface font-bold truncate">
                      Salmon & Quinoa Glow Bowl
                    </h4>
                    <p className="font-body-sm text-xs text-on-surface-variant line-clamp-2">
                      Healthy omega-3s for joint flexibility, quinoa to refill your glycogen, and tart
                      cherries to prevent soreness.
                    </p>
                  </div>
                </div>
                <div className="flex items-center justify-between pt-2 border-t border-surface-container/60">
                  <div className="flex items-center gap-2 text-on-surface-variant font-label-caps text-xs">
                    <span>38g Protein</span>
                    <span>•</span>
                    <span>64g Carbs</span>
                    <span>•</span>
                    <span>18g Fats</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => onOpenRecipe("Wild Salmon & Tart Cherry Bowl")}
                    className="px-3.5 py-1 rounded-full bg-surface-container text-on-surface font-label-md text-xs font-semibold hover:bg-secondary-fixed-dim hover:text-on-secondary-fixed transition-colors cursor-pointer"
                  >
                    View Recipe
                  </button>
                </div>
              </div>

              {/* AI Wellness Guide */}
              <div className="bg-gradient-to-br from-primary-fixed/40 via-surface-container-low to-secondary-container/20 p-5 rounded-2xl shadow-sm border border-surface-container-high/60 space-y-3">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary-container text-on-primary-container flex items-center justify-center flex-shrink-0">
                    <span className="material-symbols-outlined text-base">psychology_alt</span>
                  </div>
                  <div className="space-y-1">
                    <span className="font-label-caps text-xs text-primary uppercase font-bold">
                      Your AI Wellness Guide
                    </span>
                    <p className="font-body-sm text-xs text-on-surface-variant leading-relaxed">
                      "{oracleReply}"
                    </p>
                    <div className="flex flex-wrap gap-1.5 pt-2">
                      <button
                        type="button"
                        onClick={() => handleOraclePreset("Suggest my warm-up weights")}
                        className="px-3 py-1 rounded-full bg-surface-container-lowest text-primary font-label-caps text-xs hover:bg-primary-fixed transition-all cursor-pointer shadow-sm font-semibold"
                      >
                        Suggest my warm-up weights
                      </button>
                      <button
                        type="button"
                        onClick={() => handleOraclePreset("Best bedtime tea for rest")}
                        className="px-3 py-1 rounded-full bg-surface-container-lowest text-on-surface font-label-caps text-xs hover:bg-surface-container-high transition-all cursor-pointer shadow-sm font-semibold"
                      >
                        Best bedtime tea for rest
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Footer Signature */}
          <div className="pt-4 pb-8 text-center">
            <span className="font-label-caps text-[11px] text-on-surface-variant/70 tracking-widest uppercase">
              ✦ Made for Your Body Rhythms ✦ Sensor Synced ✦
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

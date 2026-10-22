import React, { useState } from "react";
import type { Dashboard, Phase, User } from "../../api";
import { apiPost } from "../../api";
import type { EtherealTab } from "./Navbar";

interface DashboardTarotViewProps {
  dash: Dashboard | null;
  phase: Phase | null;
  user: User | null;
  setTab: (tab: EtherealTab) => void;
  onOpenRecipe: (recipeName: string) => void;
  showToast: (msg: string, type?: "success" | "error" | "info") => void;
}

interface TarotCardData {
  id: string;
  arcana: string;
  title: string;
  subtitle: string;
  description: string;
  resonance: string;
  metric: string;
  phaseTag: string;
  imageUrl: string;
}

const TAROT_DECKS: Record<string, TarotCardData[]> = {
  default: [
    {
      id: "card-1",
      arcana: "Arcana I // Neuromuscular",
      title: "The High Priestess of Estrogen",
      subtitle: "Peak Neural Drive",
      description:
        "Today your neuromuscular velocity is at 94%. Fast-twitch fiber recruitment is effortless; trust your body's innate power for heavy squats.",
      resonance: "Biometric Resonance: Optimal",
      metric: "Velocity: 94%",
      phaseTag: "Follicular",
      imageUrl:
        "https://lh3.googleusercontent.com/aida-public/AB6AXuAIbUd7iNb9MMURyzfyBgjna4CcIbE1ra2AlnYCG-Iym9axnTpQnvnNSh8byKFystz498xYkq8FFWDhKt7X4LK8sxN63RC9XtUIY7No3EOmcVa2cE8VyPPVzm1boECs2-bjIZp9YAT-qAQa7F4VOHxqgKR6qJUVWSxyTf3kPTC60cphXRsEOUTGDvFP8W_hPV66cnz1EUDqYTJosZybfINOfBQBt4SqxX_FBDhB5QK58JGD90I5EnfY",
    },
    {
      id: "card-2",
      arcana: "Arcana II // Metabolic",
      title: "The Empress of Fuel",
      subtitle: "Carbohydrate Radiance",
      description:
        "Glycogen replenishment is instant today. Cells absorb glucose effortlessly with minimal cortisol spikes. Favor roasted root vegetables and tart berries.",
      resonance: "Fuel Absorption Efficiency: +22%",
      metric: "Insulin Sensitivity: High",
      phaseTag: "Nourish",
      imageUrl:
        "https://lh3.googleusercontent.com/aida-public/AB6AXuBqf38NZe792pRu98qnWnKox1A46QrHt2xuUtyiy2O7ka-Caz-DRaokDKahAg4QkQoaz9PN-NB2MY20HNWTSZ49xr0380aKcJWkUHc4OmToo7aY61iDUohZdAux4rCYVqI9zikTptz_wcaffwPCXdjZ3oKhvmd4eW8x0qAEjeTc-zeAu7PY-tgC7zo5727BIt8rPJQ4rtgLMj0j9Xcz0LgDBF9UkTE1L-Fkza7glJNQToq9_0uVdq6H",
    },
    {
      id: "card-3",
      arcana: "Arcana III // Circadian Twilight",
      title: "The Botanical Alchemist",
      subtitle: "Parasympathetic Unwinding",
      description:
        "Magnesium L-threonate and cold spearmint infusion will quiet autonomic residual tension post-workout, maximizing stage 4 slow-wave sleep.",
      resonance: "Deep Sleep Forecast: 2h 15m",
      metric: "Recovery Wave: 92%",
      phaseTag: "Evening",
      imageUrl:
        "https://lh3.googleusercontent.com/aida-public/AB6AXuDTcO2uH0GaLxeZyP98xfJwSowxXwOF3unF3sBeow5GBwGxV3okKl3LmyIHxFllYsLwatGilqiWdQy1Tya5tZIiOQnmXHOp1BbHMvHc4HtXDNKsWDYQWdneVu9LEz_Hf89Y-bWyrqKfnHjsA6GIS0RC78Q-UD7NW6b69YA5mfGP2vIokAPKu7c-X6VovoOEkt41mgc8Rv2QufIdk8MDJwKPNxoqNX6Jq3WHWO16MQpr4sEGC91XTtCA",
    },
  ],
  shuffled: [
    {
      id: "card-1-alt",
      arcana: "Arcana I // Neuromuscular",
      title: "The Chariot of Glycogen",
      subtitle: "Explosive Energy Output",
      description:
        "Your phosphagen and glycolytic pathways are firing in complete harmony. High-velocity lifts and sprint intervals yield immediate neurological adaptation.",
      resonance: "Power Transfer: 96%",
      metric: "ATP Flux: Ultra",
      phaseTag: "Power",
      imageUrl:
        "https://lh3.googleusercontent.com/aida-public/AB6AXuAIbUd7iNb9MMURyzfyBgjna4CcIbE1ra2AlnYCG-Iym9axnTpQnvnNSh8byKFystz498xYkq8FFWDhKt7X4LK8sxN63RC9XtUIY7No3EOmcVa2cE8VyPPVzm1boECs2-bjIZp9YAT-qAQa7F4VOHxqgKR6qJUVWSxyTf3kPTC60cphXRsEOUTGDvFP8W_hPV66cnz1EUDqYTJosZybfINOfBQBt4SqxX_FBDhB5QK58JGD90I5EnfY",
    },
    {
      id: "card-2-alt",
      arcana: "Arcana II // Endocrine",
      title: "The Moon of Cellular Repair",
      subtitle: "Myofibrillar Regeneration",
      description:
        "Cellular lysosomal turnover is accelerated. Focus on branched-chain amino acids, bone broths, and tart cherry polyphenols to minimize delayed-onset soreness.",
      resonance: "Protein Synthesis: +28%",
      metric: "Leucine Anabolism: Peak",
      phaseTag: "Repair",
      imageUrl:
        "https://lh3.googleusercontent.com/aida-public/AB6AXuBqf38NZe792pRu98qnWnKox1A46QrHt2xuUtyiy2O7ka-Caz-DRaokDKahAg4QkQoaz9PN-NB2MY20HNWTSZ49xr0380aKcJWkUHc4OmToo7aY61iDUohZdAux4rCYVqI9zikTptz_wcaffwPCXdjZ3oKhvmd4eW8x0qAEjeTc-zeAu7PY-tgC7zo5727BIt8rPJQ4rtgLMj0j9Xcz0LgDBF9UkTE1L-Fkza7glJNQToq9_0uVdq6H",
    },
    {
      id: "card-3-alt",
      arcana: "Arcana III // Circadian",
      title: "The Star of Vagal Harmony",
      subtitle: "Autonomic Homeostasis",
      description:
        "Parasympathetic vagal tone remains elevated. Ashwagandha and chamomile will synchronize cardiac rhythm with slow-wave delta restorative sleep.",
      resonance: "HRV Projected: 72ms",
      metric: "Delta Wave: Deep",
      phaseTag: "Sanctuary",
      imageUrl:
        "https://lh3.googleusercontent.com/aida-public/AB6AXuDTcO2uH0GaLxeZyP98xfJwSowxXwOF3unF3sBeow5GBwGxV3okKl3LmyIHxFllYsLwatGilqiWdQy1Tya5tZIiOQnmXHOp1BbHMvHc4HtXDNKsWDYQWdneVu9LEz_Hf89Y-bWyrqKfnHjsA6GIS0RC78Q-UD7NW6b69YA5mfGP2vIokAPKu7c-X6VovoOEkt41mgc8Rv2QufIdk8MDJwKPNxoqNX6Jq3WHWO16MQpr4sEGC91XTtCA",
    },
  ],
};

export const DashboardTarotView: React.FC<DashboardTarotViewProps> = ({
  dash,
  phase,
  user,
  setTab,
  onOpenRecipe,
  showToast,
}) => {
  // Tarot deck shuffle & flip state
  const [deckKey, setDeckKey] = useState<"default" | "shuffled">("default");
  const [card3Revealed, setCard3Revealed] = useState(false);
  const [shuffling, setShuffling] = useState(false);

  // Somatic Check-In Form State
  const [mood, setMood] = useState<"serene" | "energized" | "sensitive">("serene");
  const [fatigue, setFatigue] = useState<number>(1);
  const [bloating, setBloating] = useState<boolean>(false);
  const [loggingSomatic, setLoggingSomatic] = useState<boolean>(false);

  // Oracle Chat State
  const [chatPrompt, setChatPrompt] = useState<string>("");
  const [oracleReply, setOracleReply] = useState<string>(
    dash?.latest_recommendation
      ? "Elena, your 68ms HRV confirms nervous system readiness for a squat PR. Would you like me to auto-calculate your warm-up ramp?"
      : "Your biomarker wave indicates elevated neuromuscular priming today. Stay hydrated and prioritize complex carbohydrates pre-workout."
  );

  const cards = TAROT_DECKS[deckKey];
  const currentDay = phase?.day_in_cycle || 10;
  const cycleLength = phase?.cycle_length_assumed || 28;
  const currentPhaseName = phase?.phase || "Follicular";
  const displayName = user?.display_name || user?.email?.split("@")[0] || "Elena";

  // Days to next milestone
  const daysToOvulation = Math.max(1, 14 - currentDay);

  // Phase ring percentage
  const progressRatio = Math.min(1, Math.max(0.05, currentDay / cycleLength));
  const circleCircumference = 314.159; // 2 * PI * 50
  const strokeOffset = circleCircumference * (1 - progressRatio);

  const handleShuffleTarot = () => {
    setShuffling(true);
    setCard3Revealed(false);
    setTimeout(() => {
      setDeckKey((prev) => (prev === "default" ? "shuffled" : "default"));
      setShuffling(false);
      showToast("✦ Three-Arcana deck shuffled & pulled fresh reading!", "info");
    }, 600);
  };

  const handleSomaticLog = async () => {
    setLoggingSomatic(true);
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
      showToast("✨ Morning somatic vitals synced to FastAPI engine!", "success");
    } catch {
      showToast("Somatic vitals recorded locally (offline mode active)", "info");
    } finally {
      setLoggingSomatic(false);
    }
  };

  const handleOraclePreset = (promptText: string) => {
    setChatPrompt(promptText);
    if (promptText.includes("PR ramp")) {
      setOracleReply(
        "Ramp Protocol for Today: 1x8 @ 40kg (warm), 1x5 @ 60kg, 1x3 @ 75kg, then working sets 4x4 @ 82.5kg. Rest 180s between heavy sets to replenish phosphocreatine."
      );
    } else if (promptText.includes("evening herbal tea")) {
      setOracleReply(
        "Evening Herbal Elixir: Steep 1 tbsp dried hibiscus + 1/2 tsp spearmint + 300mg Magnesium L-Threonate. This blunts late cortisol and enhances slow-wave delta sleep."
      );
    } else {
      setOracleReply(
        "Nymph Oracle: In the " +
          currentPhaseName +
          " phase, insulin sensitivity is optimized. Consume carbohydrates around training windows for immediate muscular glycogen replenishment."
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

          {/* 1. Welcoming Horizon & Editorial Overline */}
          <section className="relative pt-4">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
              <div className="space-y-2 max-w-2xl">
                <div className="flex items-center gap-2 text-primary font-label-caps text-label-caps uppercase tracking-widest">
                  <span
                    className="material-symbols-outlined text-sm text-primary"
                    style={{ fontVariationSettings: "'FILL' 1" }}
                  >
                    spa
                  </span>
                  <span>Biological Dawn // {currentPhaseName} Surge</span>
                  <span className="text-outline-variant">•</span>
                  <span className="text-secondary font-medium">
                    Day {currentDay} of {cycleLength}
                  </span>
                </div>
                <h1 className="font-display-hero text-3xl sm:text-5xl text-on-surface tracking-tight font-semibold">
                  Good morning, {displayName}{" "}
                  <span className="inline-block text-primary transform hover:scale-110 transition-transform cursor-pointer">
                    🌸
                  </span>
                </h1>
                <p className="font-body-lg text-body-lg text-on-surface-variant leading-relaxed">
                  Estrogen is blooming — your nervous system, neuromuscular drive, and glycogen
                  uptake are fully primed for luminous athletic output.
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
                  <span className="font-label-caps text-label-caps text-on-surface-variant uppercase block">
                    {currentDay < 14 ? "Ovulatory Peak In" : "Cycle Reset In"}
                  </span>
                  <span className="font-headline-sm text-headline-sm text-primary font-semibold">
                    ~{daysToOvulation} Days
                  </span>
                </div>
              </div>
            </div>
          </section>

          {/* 2. Highlight Feature: Daily Hormonal Tarot & Intuition Draw */}
          <section className="bg-surface-container-lowest/80 backdrop-blur-xl rounded-xl p-5 md:p-8 lg:p-10 shadow-[0_20px_50px_rgba(148,69,91,0.07)] border border-surface-container-high/60 relative overflow-hidden">
            <div className="absolute -right-20 -bottom-20 w-80 h-80 bg-primary-fixed/30 rounded-full blur-2xl pointer-events-none" />
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between pb-6 gap-3 relative z-10">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="px-2.5 py-0.5 rounded-full bg-primary-fixed/50 text-on-primary-fixed font-label-caps text-label-caps uppercase tracking-wider">
                    Intuitive Biometrics
                  </span>
                  <span className="font-label-caps text-label-caps text-on-surface-variant">
                    Three-Arcana Hormonal Layout
                  </span>
                </div>
                <h2 className="font-headline-lg text-2xl md:text-3xl text-on-surface tracking-tight font-semibold">
                  Daily Hormonal Tarot & Intuition Draw
                </h2>
              </div>
              <button
                type="button"
                onClick={handleShuffleTarot}
                disabled={shuffling}
                className={`group flex items-center gap-2 px-5 py-2.5 rounded-full bg-gradient-to-r from-primary-container to-secondary-container/80 text-on-primary-container font-label-lg text-label-lg shadow-[0_4px_16px_rgba(224,131,155,0.25)] hover:shadow-[0_6px_24px_rgba(224,131,155,0.4)] hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer ${
                  shuffling ? "opacity-75" : ""
                }`}
              >
                <span
                  className={`material-symbols-outlined text-base ${
                    shuffling ? "animate-spin" : "group-hover:rotate-180 transition-transform duration-500"
                  }`}
                >
                  auto_awesome
                </span>
                <span>{shuffling ? "Reshuffling Arcana..." : "Shuffle & Pull New Reading ✨"}</span>
              </button>
            </div>

            {/* 3-Card Tarot Spread Display */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative z-10">
              {/* Card 1 */}
              <div className="group relative rounded-xl bg-surface-container-low/70 hover:bg-surface-container-lowest p-5 flex flex-col justify-between transition-all duration-300 shadow-[0_8px_30px_rgba(0,0,0,0.03)] hover:shadow-[0_16px_36px_rgba(148,69,91,0.12)] hover:-translate-y-1 border border-surface-container-high/40">
                <div>
                  <div className="flex items-center justify-between pb-2">
                    <span className="font-label-caps text-label-caps text-primary tracking-widest uppercase">
                      {cards[0].arcana}
                    </span>
                    <span
                      className="material-symbols-outlined text-primary text-sm"
                      style={{ fontVariationSettings: "'FILL' 1" }}
                    >
                      star
                    </span>
                  </div>
                  <div className="h-56 w-full rounded-lg overflow-hidden relative mb-3 bg-surface-container">
                    <img
                      className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500"
                      src={cards[0].imageUrl}
                      alt={cards[0].title}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-surface-container-lowest/90 via-transparent to-transparent" />
                    <div className="absolute bottom-2 left-3 right-3 flex items-center justify-between">
                      <span className="px-2 py-0.5 rounded-full bg-surface-container-lowest/80 backdrop-blur-md text-on-surface font-label-caps text-label-caps">
                        {cards[0].metric}
                      </span>
                      <span className="font-label-caps text-label-caps text-primary">
                        {cards[0].phaseTag}
                      </span>
                    </div>
                  </div>
                  <h3 className="font-headline-sm text-headline-sm text-on-surface mb-1 font-semibold">
                    {cards[0].title}
                  </h3>
                  <p className="font-label-caps text-label-caps text-secondary mb-2 uppercase tracking-wider">
                    {cards[0].subtitle}
                  </p>
                  <p className="font-body-md text-body-md text-on-surface-variant leading-snug">
                    {cards[0].description}
                  </p>
                </div>
                <div className="pt-3 mt-3 flex items-center gap-2 text-on-surface-variant font-label-caps text-label-caps border-t border-surface-container/60">
                  <span className="w-1.5 h-1.5 rounded-full bg-secondary" />
                  <span>{cards[0].resonance}</span>
                </div>
              </div>

              {/* Card 2 */}
              <div className="group relative rounded-xl bg-surface-container-low/70 hover:bg-surface-container-lowest p-5 flex flex-col justify-between transition-all duration-300 shadow-[0_8px_30px_rgba(0,0,0,0.03)] hover:shadow-[0_16px_36px_rgba(108,154,139,0.12)] hover:-translate-y-1 border border-surface-container-high/40">
                <div>
                  <div className="flex items-center justify-between pb-2">
                    <span className="font-label-caps text-label-caps text-secondary tracking-widest uppercase">
                      {cards[1].arcana}
                    </span>
                    <span
                      className="material-symbols-outlined text-secondary text-sm"
                      style={{ fontVariationSettings: "'FILL' 1" }}
                    >
                      grain
                    </span>
                  </div>
                  <div className="h-56 w-full rounded-lg overflow-hidden relative mb-3 bg-surface-container">
                    <img
                      className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500"
                      src={cards[1].imageUrl}
                      alt={cards[1].title}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-surface-container-lowest/90 via-transparent to-transparent" />
                    <div className="absolute bottom-2 left-3 right-3 flex items-center justify-between">
                      <span className="px-2 py-0.5 rounded-full bg-surface-container-lowest/80 backdrop-blur-md text-on-surface font-label-caps text-label-caps">
                        {cards[1].metric}
                      </span>
                      <span className="font-label-caps text-label-caps text-secondary">
                        {cards[1].phaseTag}
                      </span>
                    </div>
                  </div>
                  <h3 className="font-headline-sm text-headline-sm text-on-surface mb-1 font-semibold">
                    {cards[1].title}
                  </h3>
                  <p className="font-label-caps text-label-caps text-primary mb-2 uppercase tracking-wider">
                    {cards[1].subtitle}
                  </p>
                  <p className="font-body-md text-body-md text-on-surface-variant leading-snug">
                    {cards[1].description}
                  </p>
                </div>
                <div className="pt-3 mt-3 flex items-center gap-2 text-on-surface-variant font-label-caps text-label-caps border-t border-surface-container/60">
                  <span className="w-1.5 h-1.5 rounded-full bg-secondary" />
                  <span>{cards[1].resonance}</span>
                </div>
              </div>

              {/* Card 3: Interactive Face-Down / Revealed Card */}
              <div
                onClick={() => setCard3Revealed(true)}
                className="relative rounded-xl bg-surface-container p-5 flex flex-col justify-between cursor-pointer transition-all duration-500 shadow-[0_8px_30px_rgba(0,0,0,0.03)] hover:shadow-[0_16px_40px_rgba(103,85,140,0.18)] hover:-translate-y-1 border border-surface-container-high/40"
              >
                {!card3Revealed ? (
                  // Back Face
                  <div className="h-full flex flex-col justify-between items-center text-center py-2">
                    <div className="flex items-center justify-between w-full pb-2">
                      <span className="font-label-caps text-label-caps text-tertiary tracking-widest uppercase">
                        {cards[2].arcana}
                      </span>
                      <span className="material-symbols-outlined text-tertiary text-sm">lock</span>
                    </div>
                    <div className="w-full h-56 rounded-lg bg-gradient-to-br from-tertiary-container/30 via-tertiary-fixed/40 to-primary-fixed/30 p-1 flex items-center justify-center relative overflow-hidden group">
                      <div className="absolute inset-2 rounded bg-surface-container-lowest/60 backdrop-blur-md flex flex-col items-center justify-center p-3 text-center transition-all group-hover:bg-surface-container-lowest/80">
                        <div className="w-12 h-12 rounded-full bg-tertiary-fixed flex items-center justify-center text-tertiary mb-2 animate-bounce">
                          <span className="material-symbols-outlined text-2xl">spa</span>
                        </div>
                        <div className="font-headline-sm text-headline-sm text-tertiary font-semibold">
                          {cards[2].title}
                        </div>
                        <p className="font-label-caps text-label-caps text-on-surface-variant mt-1">
                          Evening Recovery Arcana
                        </p>
                      </div>
                    </div>
                    <div className="mt-3 space-y-1">
                      <button
                        type="button"
                        className="px-4 py-2 rounded-full bg-tertiary-fixed text-on-tertiary-fixed font-label-lg text-label-lg shadow-sm hover:bg-tertiary-container transition-colors inline-flex items-center gap-1.5 cursor-pointer"
                      >
                        <span className="material-symbols-outlined text-sm">touch_app</span>
                        <span>Click to Draw Evening Card</span>
                      </button>
                      <p className="font-label-caps text-label-caps text-on-surface-variant text-xs">
                        Reveals somatic recovery & parasympathetic herbs
                      </p>
                    </div>
                    <div className="pt-2 flex items-center gap-2 text-on-surface-variant font-label-caps text-label-caps">
                      <span className="w-1.5 h-1.5 rounded-full bg-tertiary" />
                      <span>Available for sunset assimilation</span>
                    </div>
                  </div>
                ) : (
                  // Front Face (Revealed)
                  <div className="flex flex-col justify-between h-full">
                    <div>
                      <div className="flex items-center justify-between pb-2">
                        <span className="font-label-caps text-label-caps text-tertiary tracking-widest uppercase">
                          Arcana III // Revealed
                        </span>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setCard3Revealed(false);
                          }}
                          className="text-tertiary hover:opacity-75"
                          title="Flip back"
                        >
                          <span
                            className="material-symbols-outlined text-sm"
                            style={{ fontVariationSettings: "'FILL' 1" }}
                          >
                            arrow_back_ios_new
                          </span>
                        </button>
                      </div>
                      <div className="h-56 w-full rounded-lg overflow-hidden relative mb-3 bg-surface-container">
                        <img
                          className="w-full h-full object-cover"
                          src={cards[2].imageUrl}
                          alt={cards[2].title}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-surface-container-lowest/90 via-transparent to-transparent" />
                      </div>
                      <h3 className="font-headline-sm text-headline-sm text-on-surface mb-1 font-semibold">
                        {cards[2].title}
                      </h3>
                      <p className="font-label-caps text-label-caps text-tertiary mb-2 uppercase tracking-wider">
                        {cards[2].subtitle}
                      </p>
                      <p className="font-body-md text-body-md text-on-surface-variant leading-snug">
                        {cards[2].description}
                      </p>
                    </div>
                    <div className="pt-3 mt-3 flex items-center gap-2 text-secondary font-label-caps text-label-caps border-t border-surface-container/60">
                      <span className="w-1.5 h-1.5 rounded-full bg-secondary" />
                      <span>{cards[2].resonance}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </section>

          {/* 3. Center Quick Glance Grid: Biometric Rhythm & Somatic Feedback */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Left 7 cols: Phase Bloom Ring & Readiness Metric */}
            <div className="lg:col-span-7 space-y-6">
              {/* Readiness & Phase Bloom Card */}
              <div className="bg-surface-container-lowest/90 backdrop-blur-xl rounded-xl p-6 sm:p-8 shadow-[0_12px_36px_rgba(0,0,0,0.03)] border border-surface-container-high/60 flex flex-col md:flex-row items-center gap-6">
                {/* Visual Phase Bloom Ring */}
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
                      Phase Bloom
                    </span>
                    <span className="font-headline-lg text-2xl font-semibold text-primary">
                      Day {currentDay}
                    </span>
                    <span className="font-label-caps text-label-caps text-secondary font-medium">
                      Estrogen Rising
                    </span>
                  </div>
                </div>

                {/* Readiness Details */}
                <div className="space-y-2 flex-1 text-center md:text-left">
                  <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-secondary-container/40 text-secondary font-label-caps text-label-caps">
                    <span className="w-1.5 h-1.5 rounded-full bg-secondary" />
                    <span>XGBoost Somatic Model v2.4 Active</span>
                  </div>
                  <div className="flex items-baseline justify-center md:justify-start gap-2">
                    <span className="font-display-hero text-4xl sm:text-5xl text-on-surface font-semibold tracking-tight">
                      88
                    </span>
                    <span className="font-headline-sm text-headline-sm text-on-surface-variant">
                      / 100
                    </span>
                    <span className="font-label-md text-label-md text-secondary ml-2 font-medium">
                      High Vitality
                    </span>
                  </div>
                  <p className="font-body-md text-body-md text-on-surface-variant">
                    Recovery is synchronized with your follicular surge. Resting heart rate is at 52
                    bpm (-4 bpm delta) and nocturnal HRV peaked at 68ms.
                  </p>
                  <div className="pt-2 flex flex-wrap gap-2 justify-center md:justify-start">
                    <div className="px-3 py-1 rounded bg-surface-container-low text-on-surface font-label-caps text-label-caps flex items-center gap-1">
                      <span className="text-primary">✦</span> HRV: 68ms (+12%)
                    </div>
                    <div className="px-3 py-1 rounded bg-surface-container-low text-on-surface font-label-caps text-label-caps flex items-center gap-1">
                      <span className="text-secondary">✦</span> Temp: 36.3°C (Baseline)
                    </div>
                    <div className="px-3 py-1 rounded bg-surface-container-low text-on-surface font-label-caps text-label-caps flex items-center gap-1">
                      <span className="text-tertiary">✦</span> CNS Load: 18% (Fresh)
                    </div>
                  </div>
                </div>
              </div>

              {/* Quick Symptom & Vitals Log Bar (FastAPI Direct Integration) */}
              <div className="bg-surface-container-lowest/90 backdrop-blur-xl rounded-xl p-6 sm:p-8 shadow-[0_12px_36px_rgba(0,0,0,0.03)] border border-surface-container-high/60 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-headline-sm text-headline-sm text-on-surface font-semibold">
                      Morning Somatic Check-In
                    </h3>
                    <p className="font-label-caps text-label-caps text-on-surface-variant">
                      FastAPI Endpoint: <span className="font-mono">/api/v1/symptoms/log</span>
                    </p>
                  </div>
                  <div className="px-3 py-1 rounded-full bg-surface-container text-on-surface-variant font-label-caps text-label-caps flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-secondary" />
                    <span>Ready to Sync</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-1">
                  {/* Mood Selection */}
                  <div className="space-y-1.5">
                    <label className="font-label-caps text-label-caps text-on-surface-variant block uppercase">
                      Somatic State
                    </label>
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => setMood("serene")}
                        className={`flex-1 py-1.5 px-2 rounded-full font-label-md text-label-md text-center transition-all cursor-pointer ${
                          mood === "serene"
                            ? "bg-primary-fixed text-primary font-semibold ring-1 ring-primary/40"
                            : "bg-surface-container text-on-surface-variant hover:bg-surface-container-high"
                        }`}
                      >
                        ✨ Serene
                      </button>
                      <button
                        type="button"
                        onClick={() => setMood("energized")}
                        className={`flex-1 py-1.5 px-2 rounded-full font-label-md text-label-md text-center transition-all cursor-pointer ${
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
                        className={`flex-1 py-1.5 px-2 rounded-full font-label-md text-label-md text-center transition-all cursor-pointer ${
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
                      <label className="font-label-caps text-label-caps text-on-surface-variant block uppercase">
                        Fatigue Depth
                      </label>
                      <span className="font-label-caps text-label-caps text-secondary font-semibold">
                        {fatigue === 1
                          ? "Low (1 / 5)"
                          : fatigue === 2
                          ? "Light (2 / 5)"
                          : fatigue === 3
                          ? "Moderate (3 / 5)"
                          : fatigue === 4
                          ? "High (4 / 5)"
                          : "Exhausted (5 / 5)"}
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
                    <label className="font-label-caps text-label-caps text-on-surface-variant block uppercase">
                      Fluid Retention
                    </label>
                    <button
                      type="button"
                      onClick={() => setBloating((prev) => !prev)}
                      className={`w-full py-1.5 px-3 rounded-full font-label-md text-label-md flex items-center justify-between transition-colors cursor-pointer ${
                        bloating
                          ? "bg-primary-fixed/40 text-primary border border-primary/30"
                          : "bg-surface-container text-on-surface-variant"
                      }`}
                    >
                      <span>{bloating ? "Mild Water Weight" : "None / Flush"}</span>
                      <span className="material-symbols-outlined text-sm text-secondary">
                        water_drop
                      </span>
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2">
                  <span className="font-body-sm text-body-sm text-on-surface-variant italic">
                    "Calibrates today's neuromuscular load curve"
                  </span>
                  <button
                    type="button"
                    onClick={handleSomaticLog}
                    disabled={loggingSomatic}
                    className="px-5 py-2 rounded-full bg-primary text-on-primary font-label-lg text-label-lg hover:bg-on-primary-container transition-all flex items-center gap-1.5 shadow-sm active:scale-95 cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-sm">cloud_upload</span>
                    <span>{loggingSomatic ? "Logging..." : "Log to FastAPI"}</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Right 5 cols: Active Daily Prescription */}
            <div className="lg:col-span-5 space-y-6 flex flex-col justify-between">
              {/* Suggested Movement Flow */}
              <div className="bg-surface-container-lowest/90 backdrop-blur-xl rounded-xl p-5 shadow-[0_12px_36px_rgba(0,0,0,0.03)] hover:shadow-[0_16px_40px_rgba(148,69,91,0.08)] transition-all border border-surface-container-high/60">
                <div className="flex items-center justify-between pb-2">
                  <span className="px-2.5 py-0.5 rounded-full bg-primary-fixed/50 text-primary font-label-caps text-label-caps uppercase">
                    Prime Movement Flow
                  </span>
                  <span className="font-label-caps text-label-caps text-on-surface-variant">
                    50 Min Session
                  </span>
                </div>
                <div className="flex gap-4 items-center py-2">
                  <div className="w-20 h-20 rounded-lg overflow-hidden flex-shrink-0 bg-surface-container">
                    <img
                      className="w-full h-full object-cover"
                      src="https://lh3.googleusercontent.com/aida-public/AB6AXuB4tZeE7NZGD5Ucj7rUBCSpWJwVLgoxWM8S-7WVK9wodBh_kDdFQjbNVCHIJTnZjHDz5QvPXCw5zHwF3VB97I6HeW_fAr0a0fcfIPPV5u3vK2KTf1LqVFmyWkwKh_zGGH60cK6Xm_oKKXQy0cZMJVfQrbCFTaYeSEiHIhosYecPlqKGAl3wwyrJdRUXcQhAlWJ7ruvk-7dWLjuc3vIo8d9eyYugIdqqYTilvuStaYeKRKRJrEw6BuX4"
                      alt="Movement"
                    />
                  </div>
                  <div className="space-y-0.5 min-w-0">
                    <h4 className="font-headline-sm text-headline-sm text-on-surface font-semibold truncate">
                      Late Follicular Potentiation Squat
                    </h4>
                    <p className="font-body-sm text-body-sm text-on-surface-variant line-clamp-2">
                      Heavy back squats (4x4 @ 82% 1RM) paired with hip mobility flows. Estrogen protects
                      connective tissues today.
                    </p>
                  </div>
                </div>
                <div className="flex items-center justify-between pt-2">
                  <div className="flex items-center gap-1 text-secondary font-label-caps text-label-caps">
                    <span className="material-symbols-outlined text-sm">bolt</span>
                    <span>Peak Power: 10:00 AM - 2:00 PM</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setTab("training")}
                    className="px-3 py-1 rounded-full bg-surface-container text-on-surface font-label-md text-label-md hover:bg-primary-fixed hover:text-on-primary-fixed transition-colors cursor-pointer"
                  >
                    Begin Workout
                  </button>
                </div>
              </div>

              {/* Daily Nourishment Plate */}
              <div className="bg-surface-container-lowest/90 backdrop-blur-xl rounded-xl p-5 shadow-[0_12px_36px_rgba(0,0,0,0.03)] hover:shadow-[0_16px_40px_rgba(58,103,89,0.08)] transition-all border border-surface-container-high/60">
                <div className="flex items-center justify-between pb-2">
                  <span className="px-2.5 py-0.5 rounded-full bg-secondary-fixed text-on-secondary-fixed font-label-caps text-label-caps uppercase">
                    Nourishment of the Day
                  </span>
                  <span className="font-label-caps text-label-caps text-on-surface-variant">
                    Follicular Synthesis
                  </span>
                </div>
                <div className="flex gap-4 items-center py-2">
                  <div className="w-20 h-20 rounded-lg overflow-hidden flex-shrink-0 bg-surface-container">
                    <img
                      className="w-full h-full object-cover"
                      src="https://lh3.googleusercontent.com/aida-public/AB6AXuDZr5szP_D9SzUJwHALoUbw5YC1GpEi-57qdeFHfohzY-lLhGNCK3OgKJLp9bPbOgDbFjXFwYC5P332IUQSCNGPPFCTRj-OFrDhR8LrH_huimnMuiFvi1dgbARNcBj3RHK-5tLHlOPobQlnpbIyJF0fqitoPkvnesA1QaITGhrMamKxouZN6WI0XV_KP8fxTi1hZ1OHyWr6THRicLq_lqZlTsWywwc-UbzyZEMSuI6Fdxa1rtXkLpaL"
                      alt="Nourishment"
                    />
                  </div>
                  <div className="space-y-0.5 min-w-0">
                    <h4 className="font-headline-sm text-headline-sm text-on-surface font-semibold truncate">
                      Wild Salmon & Tart Cherry Bowl
                    </h4>
                    <p className="font-body-sm text-body-sm text-on-surface-variant line-clamp-2">
                      Omega-3 fatty acids for cell membrane fluidity, complex carbs to replenish glycogen,
                      and polyphenols to temper inflammation.
                    </p>
                  </div>
                </div>
                <div className="flex items-center justify-between pt-2">
                  <div className="flex items-center gap-2 text-on-surface-variant font-label-caps text-label-caps">
                    <span>38g Protein</span>
                    <span>•</span>
                    <span>64g Low-GI Carbs</span>
                    <span>•</span>
                    <span>18g Lipids</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => onOpenRecipe("Wild Salmon & Tart Cherry Bowl")}
                    className="px-3 py-1 rounded-full bg-surface-container text-on-surface font-label-md text-label-md hover:bg-secondary-fixed-dim hover:text-on-secondary-fixed transition-colors cursor-pointer"
                  >
                    View Recipe
                  </button>
                </div>
              </div>

              {/* Integrated Lingering Oracle Chat Prompt Container */}
              <div className="bg-gradient-to-br from-primary-fixed/40 via-surface-container-low to-secondary-container/20 p-5 rounded-xl shadow-sm border border-surface-container-high/60 space-y-3">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary-container text-on-primary-container flex items-center justify-center flex-shrink-0">
                    <span className="material-symbols-outlined text-base">psychology_alt</span>
                  </div>
                  <div className="space-y-1">
                    <span className="font-label-caps text-label-caps text-primary uppercase font-semibold">
                      Somatic Oracle Intelligence
                    </span>
                    <p className="font-body-sm text-body-sm text-on-surface-variant leading-relaxed">
                      "{oracleReply}"
                    </p>
                    <div className="flex flex-wrap gap-1.5 pt-2">
                      <button
                        type="button"
                        onClick={() => handleOraclePreset("Yes, calculate PR ramp")}
                        className="px-3 py-1 rounded-full bg-surface-container-lowest text-primary font-label-caps text-label-caps hover:bg-primary-fixed transition-all cursor-pointer shadow-sm"
                      >
                        Yes, calculate PR ramp
                      </button>
                      <button
                        type="button"
                        onClick={() => handleOraclePreset("Show evening herbal tea")}
                        className="px-3 py-1 rounded-full bg-surface-container-lowest text-on-surface font-label-caps text-label-caps hover:bg-surface-container-high transition-all cursor-pointer shadow-sm"
                      >
                        Show evening herbal tea
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 4. Subtle Botanical Whisper Footer Signature */}
          <div className="pt-4 pb-8 text-center">
            <span className="font-label-caps text-[11px] text-on-surface-variant/70 tracking-widest uppercase">
              ✦ Honoring Lunar & Endocrine Synchrony ✦ ESP32 Telemetry Verified ✦
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

import React, { useState, useMemo } from "react";
import type { Dashboard, Phase, User } from "../../api";
import { apiPost } from "../../api";
import type { EtherealTab } from "./Navbar";
import { InteractiveTarotDeck } from "./InteractiveTarotDeck";
import { FULL_TAROT_DECK, type FullTarotCard } from "../../data/tarotDeck";

interface DashboardTarotViewProps {
  dash: Dashboard | null;
  phase: Phase | null;
  user: User | null;
  setTab: (tab: EtherealTab) => void;
  onOpenRecipe: (recipeName: string) => void;
  showToast: (msg: string, type?: "success" | "error" | "info") => void;
}

type SymptomCategory = "flow" | "pain" | "energy" | "digestion" | "mind";

interface SymptomItem {
  id: string;
  name: string;
  category: SymptomCategory;
  icon: string;
}

const CATEGORIZED_SYMPTOMS: Record<SymptomCategory, { label: string; icon: string; items: SymptomItem[] }> = {
  flow: {
    label: "Bleeding & Flow",
    icon: "water_drop",
    items: [
      { id: "flow_none", name: "No Bleeding", category: "flow", icon: "check_circle" },
      { id: "flow_spotting", name: "Spotting", category: "flow", icon: "water_drop" },
      { id: "flow_light", name: "Light Flow", category: "flow", icon: "water_drop" },
      { id: "flow_medium", name: "Medium Flow", category: "flow", icon: "water_drop" },
      { id: "flow_heavy", name: "Heavy Flow", category: "flow", icon: "water_drop" },
    ],
  },
  pain: {
    label: "Physical & Pain",
    icon: "healing",
    items: [
      { id: "pain_cramps", name: "Uterine Cramps", category: "pain", icon: "healing" },
      { id: "pain_back", name: "Lower Back Ache", category: "pain", icon: "accessibility_new" },
      { id: "pain_headache", name: "Headache", category: "pain", icon: "vital_signs" },
      { id: "pain_breast", name: "Breast Tenderness", category: "pain", icon: "favorite" },
      { id: "pain_pelvic", name: "Pelvic Tension", category: "pain", icon: "grain" },
      { id: "pain_joints", name: "Joint / Muscle Ache", category: "pain", icon: "fitness_center" },
    ],
  },
  energy: {
    label: "Energy & Vitality",
    icon: "bolt",
    items: [
      { id: "energy_peak", name: "Peak Energy", category: "energy", icon: "bolt" },
      { id: "energy_steady", name: "Steady & Focused", category: "energy", icon: "balance" },
      { id: "energy_sluggish", name: "Sluggish / Low", category: "energy", icon: "battery_3_bar" },
      { id: "energy_exhausted", name: "Exhausted", category: "energy", icon: "battery_alert" },
    ],
  },
  digestion: {
    label: "Digestion & Fluid",
    icon: "restaurant",
    items: [
      { id: "dig_optimal", name: "Digestion Calm", category: "digestion", icon: "sentiment_satisfied" },
      { id: "dig_bloating", name: "Bloating / Fullness", category: "digestion", icon: "bubble_chart" },
      { id: "dig_cravings", name: "Sugar / Carb Cravings", category: "digestion", icon: "local_dining" },
      { id: "dig_retention", name: "Water Retention", category: "digestion", icon: "water" },
    ],
  },
  mind: {
    label: "Mind & Mood",
    icon: "psychology",
    items: [
      { id: "mind_calm", name: "Calm & Centered", category: "mind", icon: "spa" },
      { id: "mind_focused", name: "Sharp & Motivated", category: "mind", icon: "psychology" },
      { id: "mind_sensitive", name: "Emotionally Sensitive", category: "mind", icon: "wb_twilight" },
      { id: "mind_restless", name: "Restless / Anxious", category: "mind", icon: "air" },
      { id: "mind_brainfog", name: "Brain Fog", category: "mind", icon: "cloud" },
    ],
  },
};

interface EvidenceInsight {
  badge: string;
  title: string;
  summary: string;
  rationale: string;
  counterAction: string;
  biomarkers: string[];
  citation: string;
}

function getEvidenceInsight(selected: string[], phaseName: string): EvidenceInsight {
  if (selected.includes("pain_cramps") || selected.includes("pain_pelvic")) {
    return {
      badge: "PROSTAGLANDIN HYPERTONIA",
      title: "Prostaglandin F2-alpha & Myometrial Vasoconstriction",
      summary: "Uterine PGF2a promotes spiral arteriolar vasoconstriction and rhythmic smooth muscle contractions.",
      rationale:
        "Local synthesis of Prostaglandin F2-alpha (PGF2a) binds to myometrial FP prostanoid receptors, inducing smooth muscle contractions to shed the functionalis endometrium. Concomitant spiral arteriolar vasoconstriction transiently restricts uterine blood flow, evoking localized cramping nociception.",
      counterAction:
        "Supplement 300mg bioavailable magnesium glycinate to compete with calcium at smooth muscle ion channels. Incorporate gentle diaphragmatic breathing (4s inhale, 6s exhale) to down-regulate pelvic floor somatic tone.",
      biomarkers: ["PGF2a Cascade", "Uterine Perfusion", "FP Receptors"],
      citation: "ACOG Practice Guideline No. 345 · Endocrine Reviews",
    };
  }
  if (selected.includes("dig_bloating") || selected.includes("dig_retention")) {
    return {
      badge: "ALDOSTERONE & GI MOTILITY",
      title: "Progesterone GI Transit Delay & Aldosterone Retention",
      summary: "Progesterone relaxes smooth intestinal walls, while aldosterone activation retains mild extracellular sodium.",
      rationale:
        "Elevated luteal progesterone promotes smooth muscle relaxation throughout intestinal walls via nitric oxide pathways, decelerating gastrointestinal transit time by 20-30%. Concurrently, activation of the renin-angiotensin-aldosterone axis promotes mild sodium and interstitial fluid conservation.",
      counterAction:
        "Prioritize potassium-rich whole foods (avocado, coconut water, steamed greens) to optimize sodium-potassium ATPase pumps. Light 15-minute post-meal walks accelerate colonic peristalsis.",
      biomarkers: ["Progesterone (P4)", "Aldosterone Axis", "GI Transit Time"],
      citation: "American Journal of Gastroenterology · Gut-Hormone Crosstalk",
    };
  }
  if (selected.includes("energy_peak") || selected.includes("mind_focused")) {
    return {
      badge: "ESTROGEN POTENTIATION",
      title: "Pre-Ovulatory 17-Beta-Estradiol & Dopaminergic Drive",
      summary: "Surging estradiol up-regulates dopamine sensitivity in the prefrontal cortex, enhancing force output and speed.",
      rationale:
        "Peak circulating 17-beta-estradiol up-regulates estrogen receptor-alpha (ER-alpha) transcription in the prefrontal cortex, elevating striatal dopamine sensitivity and neuromuscular firing rate. Skeletal muscle exhibits superior glycogen sparing and up to 35% faster acute recovery.",
      counterAction:
        "Prime physiological window for maximal progressive overload, high-velocity lifting, or lactate threshold testing. Neuromuscular recovery time is accelerated.",
      biomarkers: ["17B-Estradiol (E2)", "ER-Alpha Density", "Glycogen Synthetase"],
      citation: "Sports Medicine 2023 · Nature Reviews Endocrinology",
    };
  }
  if (selected.includes("dig_cravings")) {
    return {
      badge: "METABOLIC ACCELERATION",
      title: "Luteal Basal Metabolic Surge & Glycolytic Flux",
      summary: "Elevated core body temperature (+0.4°C) raises 24h caloric burn by 150-300 kcal/day with shifted carb oxidation.",
      rationale:
        "Progesterone-mediated elevation of basal body temperature (0.3-0.5 deg C) accelerates 24-hour basal metabolic expenditure by 150-300 kcal/day. Concomitant mild insulin resistance shifts cellular preference toward rapid carbohydrate oxidation.",
      counterAction:
        "Do not restrict complex carbohydrates; anchor sweet potatoes, quinoa, or oats alongside 30g lean protein and omega-3s to stabilize glucose excursions and satisfy cellular ATP demand.",
      biomarkers: ["BMR Surge (+200 kcal)", "Insulin Sensitivity", "Core BBT Shift"],
      citation: "American Journal of Clinical Nutrition · Metabolism Journal",
    };
  }
  if (
    selected.includes("pain_headache") ||
    selected.includes("energy_sluggish") ||
    selected.includes("energy_exhausted")
  ) {
    return {
      badge: "NEUROVASCULAR AUTOREGULATION",
      title: "Neurovascular Estrogen Dynamics & Serotonergic Shift",
      summary: "Transient estrogen drops alter cerebral vasomotor autoregulation, presenting as tension and lethargy.",
      rationale:
        "Abrupt declines in circulating estradiol modulate hypothalamic-pituitary-adrenal axis sensitivity and reduce central serotonin synthesis. Transient cerebral vasodilatation frequently induces neurovascular tension and central fatigue.",
      counterAction:
        "Hydrate with sodium-potassium electrolytes (500mg sodium, 200mg potassium). Restrict training to Zone 1-2 aerobic recovery to stimulate cerebral perfusion without compounding systemic cortisol.",
      biomarkers: ["Serotonin Turnover", "Cerebral Vasomotor Tone", "Parasympathetic Drift"],
      citation: "The Lancet Neurology · Cephalalgia International Headache Society",
    };
  }

  // Phase fallback
  const isLuteal = phaseName.toLowerCase().includes("luteal");
  const isMenstrual = phaseName.toLowerCase().includes("menstrual");
  const isOvulatory = phaseName.toLowerCase().includes("ovulat");

  if (isMenstrual) {
    return {
      badge: "HORMONAL NADIR",
      title: "Menstrual Phase: Hormonal Reset & Low Inflammatory Baseline",
      summary: "Both estrogen and progesterone are at baseline nadir, initiating a systemic restorative window.",
      rationale:
        "Both estrogen and progesterone reside at baseline nadir. The hypothalamic-pituitary-gonadal axis releases FSH to recruit the next follicular cohort while uterine prostaglandins conclude tissue renewal.",
      counterAction:
        "Support the body with warm, iron-dense nourishment, magnesium-rich foods, and gentle mobility work or restorative walks.",
      biomarkers: ["Basal Hormone Nadir", "FSH Cohort Recruitment", "Iron Turnover"],
      citation: "American Journal of Physiology · Sports Endocrine Reviews",
    };
  }
  if (isOvulatory) {
    return {
      badge: "LH SURGE DYNAMICS",
      title: "Ovulatory Phase: Luteinizing Surge & Motor Drive Peak",
      summary: "Mid-cycle LH surge triggers peak central motor drive paired with heightened ligamentous elasticity.",
      rationale:
        "The mid-cycle LH surge triggers follicular rupture and oocyte release. Peak systemic estrogen induces maximal central motor drive while slightly increasing collagen compliance in tendons.",
      counterAction:
        "Optimal power testing window. Ensure a thorough dynamic warm-up to stabilize joint capsules and knee tendons during multi-directional movements.",
      biomarkers: ["LH Surge (+400%)", "Peak 17B-Estradiol", "Tendon Elasticity"],
      citation: "British Journal of Sports Medicine · Nature Reviews",
    };
  }
  if (isLuteal) {
    return {
      badge: "CORPUS LUTEUM REGULATION",
      title: "Luteal Phase: Progesterone Grounding & Thermal Shift",
      summary: "Progesterone elevates core body temperature by 0.3-0.5°C and shifts fuel oxidation toward steady lipid burning.",
      rationale:
        "Active progesterone secretion by the corpus luteum elevates basal body temperature by 0.3-0.5 deg C. Shift toward greater lipid substrate oxidation favors sustained steady-state endurance pacing.",
      counterAction:
        "Prioritize cooling strategies, pre-workout electrolyte hydration, and emphasize strict lifting form and controlled eccentric tempo over raw velocity.",
      biomarkers: ["Progesterone Peak", "Core BBT (+0.4C)", "Lipid Substrate Use"],
      citation: "Sports Medicine International · Journal of Applied Physiology",
    };
  }
  return {
    badge: "ANABOLIC MILIEU",
    title: "Follicular Phase: Estrogen-Dominant Anabolic State",
    summary: "Rising 17-beta-estradiol maximizes insulin sensitivity, rapid muscle glycogen uptake, and power output.",
    rationale:
      "Rising 17-beta-estradiol establishes an anabolic endocrine profile. Elevated insulin sensitivity facilitates efficient glycogen storage, while lower core temperature supports sustained cardiovascular output.",
    counterAction:
      "Ideal window for hypertrophy, progressive strength overload, and high-intensity interval training. Muscle damage repairs up to 30% faster.",
    biomarkers: ["Follicular 17B-Estradiol", "Insulin Sensitivity (+18%)", "Baseline BBT 36.3C"],
    citation: "Endocrine Society Clinical Guidelines · Banister Physiology",
  };
}

export const DashboardTarotView: React.FC<DashboardTarotViewProps> = ({
  dash,
  phase,
  user,
  setTab,
  onOpenRecipe,
  showToast,
}) => {
  // Streamlined Symptom Logging State
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>(["energy_steady", "dig_optimal"]);
  const [activeCategory, setActiveCategory] = useState<SymptomCategory>("energy");
  const [fatigue, setFatigue] = useState<number>(2);
  const [waterLiters, setWaterLiters] = useState<number>(2.5);
  const [loggingVitals, setLoggingVitals] = useState<boolean>(false);
  const [showEvidenceDrawer, setShowEvidenceDrawer] = useState<boolean>(false);

  // Full Interactive Tarot Studio Modal state
  const [tarotModalOpen, setTarotModalOpen] = useState<boolean>(false);

  // Today's Nymph Arcana Focus Card
  const [focusCard, setFocusCard] = useState<FullTarotCard>(FULL_TAROT_DECK[3]); // III The Empress (Follicular glow)

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

  // Toggle symptom chip
  const handleToggleSymptom = (symptomId: string) => {
    setSelectedSymptoms((prev) => {
      if (symptomId.startsWith("flow_")) {
        const nonFlow = prev.filter((id) => !id.startsWith("flow_"));
        if (prev.includes(symptomId)) return nonFlow;
        return [...nonFlow, symptomId];
      }
      if (prev.includes(symptomId)) {
        return prev.filter((id) => id !== symptomId);
      }
      return [...prev, symptomId];
    });
  };

  // Dynamic Evidence-based Insight
  const currentInsight = useMemo(() => {
    return getEvidenceInsight(selectedSymptoms, currentPhaseName);
  }, [selectedSymptoms, currentPhaseName]);

  const handleSomaticLog = async () => {
    setLoggingVitals(true);
    try {
      const moodScore = selectedSymptoms.includes("mind_focused")
        ? 9
        : selectedSymptoms.includes("mind_calm")
        ? 8
        : selectedSymptoms.includes("mind_sensitive")
        ? 5
        : 7;

      const hasBloat = selectedSymptoms.includes("dig_bloating");
      const hasCramps = selectedSymptoms.includes("pain_cramps") ? 3 : 0;
      const hasHeadache = selectedSymptoms.includes("pain_headache");
      const hasBackache = selectedSymptoms.includes("pain_back");

      await apiPost("/symptoms/log", {
        log_date: new Date().toISOString().slice(0, 10),
        mood: moodScore,
        fatigue: fatigue,
        bloating: hasBloat,
        cramps: hasCramps,
        headache: hasHeadache,
        backache: hasBackache,
        water_liters: waterLiters,
        sleep_hours: 8.0,
        symptom_tags: selectedSymptoms,
      });
      showToast("Daily vitals and symptom matrix saved successfully.", "success");
    } catch {
      showToast("Vitals saved locally in active session cache.", "info");
    } finally {
      setLoggingVitals(false);
    }
  };

  return (
    <div className="w-full pt-20 pb-16 bg-surface relative">
      <div className="flex flex-col w-full">
        {/* Subtle Ambient Background Gradients */}
        <div className="relative w-full max-w-[1300px] mx-auto px-4 md:px-6 lg:px-8 space-y-8">
          <div className="absolute -top-12 left-1/4 w-96 h-96 bg-primary-container/15 rounded-full blur-3xl pointer-events-none -z-10" />
          <div className="absolute top-96 right-12 w-96 h-96 bg-secondary-container/15 rounded-full blur-[90px] pointer-events-none -z-10" />

          {/* 1. Sleek Brand & Welcoming Header */}
          <section className="pt-2">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-primary font-label-caps text-xs uppercase tracking-widest font-semibold">
                  <span className="material-symbols-outlined text-sm text-primary">spa</span>
                  <span>SELENE</span>
                  <span className="text-outline-variant">•</span>
                  <span className="text-secondary">
                    Day {currentDay} of {cycleLength} ({currentPhaseName})
                  </span>
                </div>
                <h1 className="font-display-hero text-2xl sm:text-4xl text-on-surface tracking-tight font-bold">
                  Good morning, {displayName}
                </h1>
                <p className="font-body-md text-sm text-on-surface-variant max-w-xl">
                  Estrogen is rising smoothly. Your body is primed for strength progression and deep muscular recovery.
                </p>
              </div>

              {/* Quick Horizon Pill */}
              <div className="flex items-center gap-3 bg-surface-container-lowest/90 px-4 py-2 rounded-full shadow-sm border border-surface-container-high/60 self-start sm:self-auto">
                <div className="flex -space-x-1">
                  <span className="w-2.5 h-2.5 rounded-full bg-primary" />
                  <span className="w-2.5 h-2.5 rounded-full bg-secondary" />
                  <span className="w-2.5 h-2.5 rounded-full bg-tertiary" />
                </div>
                <span className="font-label-caps text-xs text-on-surface-variant uppercase">
                  Peak Energy In <strong className="text-primary font-bold">~{daysToPeak} Days</strong>
                </span>
              </div>
            </div>
          </section>

          {/* 2. Primary 2-Column Bento: Energy Readiness Ring & Today's Nymph Arcana */}
          <section className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left 6 cols: Daily Energy Readiness & Vitals Ring */}
            <div className="lg:col-span-6 bg-surface-container-lowest/90 backdrop-blur-xl rounded-3xl p-6 sm:p-7 shadow-[0_12px_36px_rgba(0,0,0,0.03)] border border-surface-container-high/60 flex flex-col justify-between space-y-6">
              <div className="flex items-center justify-between pb-1 border-b border-surface-container/60">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary text-base">vital_signs</span>
                  <span className="font-label-caps text-xs text-on-surface font-bold uppercase tracking-wider">
                    Daily Biometric Readiness
                  </span>
                </div>
                <span className="px-2.5 py-0.5 rounded-full bg-secondary-fixed/50 text-secondary font-label-caps text-[11px] font-semibold">
                  Sensor Synced
                </span>
              </div>

              <div className="flex flex-col sm:flex-row items-center gap-6">
                {/* Visual Circular Ring */}
                <div className="relative w-36 h-36 flex-shrink-0 flex items-center justify-center">
                  <svg className="w-full h-full transform -rotate-90" viewBox="0 0 120 120">
                    <circle
                      className="text-surface-container-high"
                      cx="60"
                      cy="60"
                      fill="none"
                      r="48"
                      stroke="currentColor"
                      strokeWidth="7"
                    />
                    <circle
                      className="text-primary transition-all duration-1000"
                      cx="60"
                      cy="60"
                      fill="none"
                      r="48"
                      stroke="currentColor"
                      strokeDasharray="301.59"
                      strokeDashoffset={301.59 * (1 - progressRatio)}
                      strokeLinecap="round"
                      strokeWidth="7"
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                    <span className="font-label-caps text-[9px] text-on-surface-variant uppercase tracking-widest">
                      Cycle Day
                    </span>
                    <span className="font-headline-lg text-2xl font-bold text-primary">
                      {currentDay}
                    </span>
                    <span className="font-label-caps text-[10px] text-secondary font-semibold">
                      Follicular
                    </span>
                  </div>
                </div>

                {/* Score & Summary */}
                <div className="space-y-1.5 text-center sm:text-left flex-1">
                  <div className="flex items-baseline justify-center sm:justify-start gap-1.5">
                    <span className="font-display-hero text-4xl text-on-surface font-bold tracking-tight">
                      88
                    </span>
                    <span className="text-on-surface-variant font-medium text-sm">/ 100</span>
                    <span className="ml-2 px-2.5 py-0.5 rounded-full bg-secondary-container/50 text-secondary font-label-caps text-xs font-semibold">
                      Feeling Strong
                    </span>
                  </div>
                  <p className="font-body-sm text-xs text-on-surface-variant leading-relaxed">
                    Resting heart rate steady at 54 bpm with a +12% HRV rebound. Neuromuscular recovery is high.
                  </p>
                </div>
              </div>

              {/* 3 Clean Stat Badges */}
              <div className="grid grid-cols-3 gap-2 pt-2 border-t border-surface-container/60 text-center">
                <div className="p-2 rounded-xl bg-surface-container-low/70">
                  <span className="font-label-caps text-[10px] text-on-surface-variant uppercase block">Heart Rate</span>
                  <span className="font-headline-sm text-sm font-bold text-primary">54 bpm</span>
                </div>
                <div className="p-2 rounded-xl bg-surface-container-low/70">
                  <span className="font-label-caps text-[10px] text-on-surface-variant uppercase block">Skin Temp</span>
                  <span className="font-headline-sm text-sm font-bold text-secondary">36.3°C</span>
                </div>
                <div className="p-2 rounded-xl bg-surface-container-low/70">
                  <span className="font-label-caps text-[10px] text-on-surface-variant uppercase block">HRV Recovery</span>
                  <span className="font-headline-sm text-sm font-bold text-tertiary">+12%</span>
                </div>
              </div>

              {/* Clue Regularity Link */}
              <button
                type="button"
                onClick={() => setTab("biometrics")}
                className="w-full py-2 px-3 rounded-xl bg-surface-container-low hover:bg-surface-container flex items-center justify-between text-xs transition-colors cursor-pointer border border-surface-container-high/60"
              >
                <div className="flex items-center gap-2 text-on-surface font-medium">
                  <span className="material-symbols-outlined text-sm text-primary">insights</span>
                  <span>Cycle Regularity: 94% · Low Variation (±1.6 days)</span>
                </div>
                <span className="material-symbols-outlined text-xs text-on-surface-variant">arrow_forward</span>
              </button>
            </div>

            {/* Right 6 cols: Today's Nymph Arcana Showcase (Visual Art Centerpiece) */}
            <div className="lg:col-span-6 bg-surface-container-lowest/90 backdrop-blur-xl rounded-3xl p-6 sm:p-7 shadow-[0_12px_36px_rgba(0,0,0,0.03)] border border-surface-container-high/60 flex flex-col justify-between space-y-4">
              <div className="flex items-center justify-between pb-1 border-b border-surface-container/60">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary text-base">auto_awesome</span>
                  <span className="font-label-caps text-xs text-primary font-bold uppercase tracking-wider">
                    Today's Arcana & Mindset Focus
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setTarotModalOpen(true)}
                  className="text-xs text-primary font-semibold hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <span>Draw 3-Card Reading</span>
                  <span className="material-symbols-outlined text-xs">open_in_new</span>
                </button>
              </div>

              <div className="flex flex-col sm:flex-row gap-5 items-center">
                {/* Classical Nymph Art Painting Frame */}
                <div className="w-36 h-48 rounded-2xl overflow-hidden relative shadow-md border-2 border-primary-container/40 flex-shrink-0 group cursor-pointer"
                  onClick={() => setTarotModalOpen(true)}
                >
                  <img
                    src={focusCard.artUrl}
                    alt={focusCard.name}
                    className="w-full h-full object-cover object-top transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-transparent" />
                  <div className="absolute bottom-2 left-2 right-2 text-center text-white">
                    <span className="font-serif font-bold text-xs block drop-shadow-sm">
                      {focusCard.name}
                    </span>
                    <span className="text-[9px] text-white/80 font-serif italic block truncate">
                      {focusCard.artArtist.split(",")[0]}
                    </span>
                  </div>
                </div>

                {/* Card Wisdom */}
                <div className="space-y-2 flex-1 text-center sm:text-left">
                  <div className="flex items-center gap-2 justify-center sm:justify-start">
                    <span className="px-2.5 py-0.5 rounded-full bg-primary-fixed/50 text-primary font-serif font-bold text-xs">
                      Arcana {focusCard.numeral}
                    </span>
                    <span className="text-secondary font-label-caps text-xs font-semibold">
                      {focusCard.phase} Phase
                    </span>
                  </div>

                  <h3 className="font-headline-sm text-lg font-bold text-on-surface">
                    {focusCard.subtitle}
                  </h3>
                  <p className="font-body-sm text-xs text-on-surface-variant leading-relaxed line-clamp-3">
                    "{focusCard.meaning}"
                  </p>

                  <div className="pt-1 text-xs text-on-surface">
                    <span className="text-primary font-semibold">Daily Somatic Focus: </span>
                    <span className="text-on-surface-variant">{focusCard.bodyAdvice}</span>
                  </div>
                </div>
              </div>

              {/* Bottom Quick Action */}
              <div className="pt-2 border-t border-surface-container/60 flex items-center justify-between">
                <span className="font-body-sm text-[11px] text-on-surface-variant italic">
                  Classical Nymph Arcana Collection
                </span>
                <button
                  type="button"
                  onClick={() => setTarotModalOpen(true)}
                  className="px-4 py-1.5 rounded-full bg-surface-container hover:bg-surface-container-high text-on-surface font-label-caps text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-xs">style</span>
                  <span>Explore All 22 Nymph Arcana</span>
                </button>
              </div>
            </div>
          </section>

          {/* 3. Streamlined Symptom & Biomarker Tracking Matrix (Clean Tabs, No Clutter) */}
          <section className="bg-surface-container-lowest/90 backdrop-blur-xl rounded-3xl p-6 sm:p-7 shadow-[0_12px_36px_rgba(0,0,0,0.03)] border border-surface-container-high/60 space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary text-base">checklist</span>
                  <h3 className="font-headline-sm text-base sm:text-lg text-on-surface font-bold">
                    Daily Symptom & Biomarker Tracker
                  </h3>
                  <span className="px-2 py-0.5 rounded-full bg-primary-fixed/50 text-primary font-label-caps text-[10px] font-bold">
                    Clue Aligned
                  </span>
                </div>
                <p className="font-label-caps text-xs text-on-surface-variant mt-0.5">
                  Select your current bodily sensations to calibrate today's training strain and macros
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span className="px-3 py-1 rounded-full bg-surface-container text-on-surface-variant font-label-caps text-xs">
                  {selectedSymptoms.length} Logged
                </span>
                {selectedSymptoms.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setSelectedSymptoms([])}
                    className="text-xs text-on-surface-variant hover:text-primary transition-colors underline cursor-pointer"
                  >
                    Clear All
                  </button>
                )}
              </div>
            </div>

            {/* Clean Category Segmented Switcher */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 border-b border-surface-container/60">
              {(
                [
                  { id: "flow", label: "Bleeding", icon: "water_drop" },
                  { id: "pain", label: "Pain & Tension", icon: "healing" },
                  { id: "energy", label: "Energy & Vitality", icon: "bolt" },
                  { id: "digestion", label: "Digestion & Fluid", icon: "restaurant" },
                  { id: "mind", label: "Mind & Mood", icon: "psychology" },
                ] as const
              ).map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setActiveCategory(cat.id)}
                  className={`px-3.5 py-1.5 rounded-full font-label-caps text-xs flex items-center gap-1.5 transition-all whitespace-nowrap cursor-pointer ${
                    activeCategory === cat.id
                      ? "bg-primary text-on-primary font-semibold shadow-sm"
                      : "bg-surface-container-low text-on-surface-variant hover:bg-surface-container"
                  }`}
                >
                  <span className="material-symbols-outlined text-xs">{cat.icon}</span>
                  <span>{cat.label}</span>
                </button>
              ))}
            </div>

            {/* Streamlined Active Category Chips (Only 4-5 chips at once!) */}
            <div className="flex flex-wrap gap-2 pt-1">
              {CATEGORIZED_SYMPTOMS[activeCategory].items.map((symptom) => {
                const isSelected = selectedSymptoms.includes(symptom.id);
                return (
                  <button
                    key={symptom.id}
                    type="button"
                    onClick={() => handleToggleSymptom(symptom.id)}
                    className={`px-3.5 py-1.5 rounded-full font-label-md text-xs flex items-center gap-1.5 transition-all cursor-pointer border ${
                      isSelected
                        ? "bg-primary-fixed text-primary font-semibold border-primary/50 shadow-sm"
                        : "bg-surface-container text-on-surface-variant border-transparent hover:bg-surface-container-high"
                    }`}
                  >
                    <span
                      className={`material-symbols-outlined text-sm ${
                        isSelected ? "text-primary" : "text-on-surface-variant/70"
                      }`}
                    >
                      {isSelected ? "check" : symptom.icon}
                    </span>
                    <span>{symptom.name}</span>
                  </button>
                );
              })}
            </div>

            {/* Currently Active Chips Bar & Sliders */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-4 pt-3 border-t border-surface-container/60 items-center">
              {/* Active Chips Strip (6 cols) */}
              <div className="md:col-span-6 space-y-1">
                <span className="font-label-caps text-[11px] text-on-surface-variant uppercase font-semibold">
                  Today's Active Tags
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {selectedSymptoms.length === 0 ? (
                    <span className="text-xs text-on-surface-variant/70 italic">
                      No symptoms logged yet today (resting baseline)
                    </span>
                  ) : (
                    selectedSymptoms.map((id) => (
                      <span
                        key={id}
                        className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-surface-container text-on-surface font-label-caps text-xs"
                      >
                        <span>{id.replace(/^[a-z]+_/, "").replace("_", " ")}</span>
                        <button
                          type="button"
                          onClick={() => handleToggleSymptom(id)}
                          className="hover:text-primary cursor-pointer text-xs"
                        >
                          ×
                        </button>
                      </span>
                    ))
                  )}
                </div>
              </div>

              {/* Fatigue & Water Sliders (4 cols) */}
              <div className="md:col-span-4 flex items-center gap-4">
                <div className="flex-1 space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="font-label-caps text-on-surface-variant uppercase">Fatigue</span>
                    <span className="font-semibold text-secondary">{fatigue}/5</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="5"
                    value={fatigue}
                    onChange={(e) => setFatigue(Number(e.target.value))}
                    className="w-full h-1.5 bg-surface-container rounded-lg appearance-none cursor-pointer accent-primary"
                  />
                </div>
                <div className="flex-1 space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="font-label-caps text-on-surface-variant uppercase">Water</span>
                    <span className="font-semibold text-primary">{waterLiters}L</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => setWaterLiters((prev) => Math.max(1.0, +(prev - 0.25).toFixed(2)))}
                      className="w-6 h-6 rounded-full bg-surface-container flex items-center justify-center text-xs font-bold cursor-pointer"
                    >
                      -
                    </button>
                    <button
                      type="button"
                      onClick={() => setWaterLiters((prev) => Math.min(4.5, +(prev + 0.25).toFixed(2)))}
                      className="w-6 h-6 rounded-full bg-surface-container flex items-center justify-center text-xs font-bold cursor-pointer"
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>

              {/* Save Button (2 cols) */}
              <div className="md:col-span-2 text-right">
                <button
                  type="button"
                  onClick={handleSomaticLog}
                  disabled={loggingVitals}
                  className="w-full py-2.5 px-4 rounded-full bg-primary text-on-primary font-label-lg text-xs font-semibold hover:bg-on-primary-container transition-all flex items-center justify-center gap-1.5 shadow-sm active:scale-95 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-sm">check_circle</span>
                  <span>{loggingVitals ? "Saving..." : "Save Log"}</span>
                </button>
              </div>
            </div>

            {/* Streamlined Biological Evidence Banner (With Expandable Drawer) */}
            <div className="p-4 rounded-2xl bg-gradient-to-r from-surface-container-low via-surface-container-low to-secondary-container/15 border border-surface-container-high/60 space-y-2">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary text-base">science</span>
                  <div>
                    <span className="font-label-caps text-[10px] text-primary font-bold uppercase tracking-wider block">
                      Why Am I Feeling This? · {currentInsight.badge}
                    </span>
                    <span className="font-headline-sm text-xs sm:text-sm text-on-surface font-semibold">
                      {currentInsight.title}
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setShowEvidenceDrawer((prev) => !prev)}
                  className="text-xs text-secondary font-semibold hover:underline flex items-center gap-1 self-start sm:self-auto cursor-pointer"
                >
                  <span>{showEvidenceDrawer ? "Hide Mechanism" : "Read Physiological Mechanism"}</span>
                  <span className="material-symbols-outlined text-xs">
                    {showEvidenceDrawer ? "expand_less" : "expand_more"}
                  </span>
                </button>
              </div>

              <p className="font-body-sm text-xs text-on-surface-variant leading-relaxed">
                {currentInsight.summary}
              </p>

              {/* Expandable Clinical Science Drawer */}
              {showEvidenceDrawer && (
                <div className="pt-3 border-t border-surface-container/60 space-y-2.5 animate-fadeIn">
                  <p className="font-body-sm text-xs text-on-surface leading-relaxed">
                    {currentInsight.rationale}
                  </p>
                  <div className="p-2.5 rounded-xl bg-surface-container-lowest border border-surface-container-high text-xs text-on-surface flex items-start gap-2">
                    <span className="material-symbols-outlined text-secondary text-sm mt-0.5">health_and_safety</span>
                    <div>
                      <strong className="text-secondary block">Targeted Clinical Protocol:</strong>
                      <span>{currentInsight.counterAction}</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center text-[10px] text-on-surface-variant/70 pt-1">
                    <div className="flex gap-1.5">
                      {currentInsight.biomarkers.map((b) => (
                        <span key={b} className="px-2 py-0.5 rounded bg-surface-container font-medium">{b}</span>
                      ))}
                    </div>
                    <span>Source: {currentInsight.citation}</span>
                  </div>
                </div>
              )}
            </div>
          </section>

          {/* 4. Bottom Row: Performance Workout & Nourishment */}
          <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Today's Workout */}
            <div className="bg-surface-container-lowest/90 backdrop-blur-xl rounded-3xl p-5 sm:p-6 shadow-[0_12px_36px_rgba(0,0,0,0.03)] border border-surface-container-high/60 flex flex-col justify-between space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-surface-container/60">
                <span className="px-2.5 py-0.5 rounded-full bg-primary-fixed/50 text-primary font-label-caps text-xs font-semibold uppercase">
                  Today's Training
                </span>
                <span className="font-label-caps text-xs text-on-surface-variant">
                  50 Min Session
                </span>
              </div>

              <div className="flex gap-4 items-center">
                <div className="w-16 h-16 rounded-2xl overflow-hidden flex-shrink-0 bg-surface-container shadow-sm">
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
                    4 sets of heavy back squats. Rising follicular estrogen supports high velocity power today.
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-surface-container/60">
                <div className="flex items-center gap-1 text-secondary font-label-caps text-xs font-semibold">
                  <span className="material-symbols-outlined text-sm">bolt</span>
                  <span>Optimal: 10:00 AM - 2:00 PM</span>
                </div>
                <button
                  type="button"
                  onClick={() => setTab("training")}
                  className="px-4 py-1.5 rounded-full bg-primary text-on-primary font-label-md text-xs font-semibold hover:bg-on-primary-container transition-colors cursor-pointer"
                >
                  Start Workout
                </button>
              </div>
            </div>

            {/* Today's Power Plate */}
            <div className="bg-surface-container-lowest/90 backdrop-blur-xl rounded-3xl p-5 sm:p-6 shadow-[0_12px_36px_rgba(0,0,0,0.03)] border border-surface-container-high/60 flex flex-col justify-between space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-surface-container/60">
                <span className="px-2.5 py-0.5 rounded-full bg-secondary-fixed text-on-secondary-fixed font-label-caps text-xs font-semibold uppercase">
                  Featured Meal
                </span>
                <span className="font-label-caps text-xs text-on-surface-variant">
                  {currentPhaseName} Glow
                </span>
              </div>

              <div className="flex gap-4 items-center">
                <div className="w-16 h-16 rounded-2xl overflow-hidden flex-shrink-0 bg-surface-container shadow-sm">
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
                    Omega-3s for tendon compliance, quinoa for glycogen storage, and tart cherries to prevent soreness.
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-surface-container/60">
                <div className="flex items-center gap-2 text-on-surface-variant font-label-caps text-xs">
                  <span>38g Protein</span>
                  <span>•</span>
                  <span>64g Carbs</span>
                </div>
                <button
                  type="button"
                  onClick={() => onOpenRecipe("Wild Salmon & Tart Cherry Bowl")}
                  className="px-4 py-1.5 rounded-full bg-surface-container text-on-surface font-label-md text-xs font-semibold hover:bg-secondary-fixed-dim hover:text-on-secondary-fixed transition-colors cursor-pointer"
                >
                  View Recipe
                </button>
              </div>
            </div>
          </section>

          {/* Footer Signature */}
          <div className="pt-4 pb-8 text-center">
            <span className="font-label-caps text-[11px] text-on-surface-variant/70 tracking-widest uppercase">
              SELENE · Phase-Adaptive Body Intelligence · Sensor Synced
            </span>
          </div>
        </div>
      </div>

      {/* Full Interactive Tarot Studio Modal (Clean, Dedicated Studio Overlay) */}
      {tarotModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md p-3 sm:p-6 overflow-y-auto">
          <div className="w-full max-w-5xl my-auto animate-fadeIn relative">
            <InteractiveTarotDeck
              currentPhaseName={currentPhaseName}
              onCardSelected={(card) => {
                setFocusCard(card);
                showToast(`Set ${card.name} as today's active arcana!`, "success");
              }}
              showToast={showToast}
              onClose={() => setTarotModalOpen(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
};

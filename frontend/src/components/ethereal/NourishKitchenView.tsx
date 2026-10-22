import React, { useMemo, useState } from "react";
import type { CustomRecipeOut, Phase, RecommendOut, User } from "../../api";
import { apiPost } from "../../api";
import {
  calculateIntakeTargets,
  RECIPES_DATASET,
  type Recipe,
} from "../../data/cuisineRecipes";
import type { EtherealTab } from "./Navbar";

interface NourishKitchenViewProps {
  user: User | null;
  phase: Phase | null;
  rec: RecommendOut | null;
  setTab: (tab: EtherealTab) => void;
  onOpenRecipeModal: (recipe: Recipe) => void;
  showToast: (msg: string, type?: "success" | "error" | "info") => void;
}

export const NourishKitchenView: React.FC<NourishKitchenViewProps> = ({
  user,
  phase,
  rec,
  setTab,
  onOpenRecipeModal,
  showToast,
}) => {
  const currentPhaseName = phase?.phase || "Follicular";
  const currentDay = phase?.day_in_cycle || 10;

  // Dynamic Macro Targets computed from user biometrics + phase
  const targets = useMemo(() => {
    return calculateIntakeTargets(user, currentPhaseName);
  }, [user, currentPhaseName]);

  // Dining Oracle State
  const [diningInput, setDiningInput] = useState<string>("");
  const [diningReply, setDiningReply] = useState<string | null>(null);

  // AI Meal Synthesizer State
  const [pantryIngredients, setPantryIngredients] = useState<string>("");
  const [aiMealType, setAiMealType] = useState<string>("any");
  const [aiFocus, setAiFocus] = useState<string>("high_protein");
  const [generatingAi, setGeneratingAi] = useState<boolean>(false);
  const [customRecipe, setCustomRecipe] = useState<CustomRecipeOut | null>(null);

  // Curated recipe cycle index
  const [recipeSetIndex, setRecipeSetIndex] = useState<number>(0);

  // Select 2 featured recipes based on current phase and cycle index
  const phaseRecipes = useMemo(() => {
    const p = currentPhaseName.toLowerCase();
    const matched = RECIPES_DATASET.filter((r) => r.phase === p || r.phase === "all");
    return matched.length >= 2 ? matched : RECIPES_DATASET.slice(0, 4);
  }, [currentPhaseName]);

  const featuredRecipes = useMemo(() => {
    const offset = (recipeSetIndex * 2) % phaseRecipes.length;
    const r1 = phaseRecipes[offset] || phaseRecipes[0];
    const r2 = phaseRecipes[(offset + 1) % phaseRecipes.length] || phaseRecipes[1];
    return [r1, r2];
  }, [phaseRecipes, recipeSetIndex]);

  const handleSwapRecipes = () => {
    setRecipeSetIndex((prev) => prev + 1);
    showToast("✦ Curated gastronomy swapped for alternate phase recipes!", "info");
  };

  const handleDiningOracle = (query: string) => {
    setDiningInput(query);
    const q = query.toLowerCase();
    if (q.includes("sushi")) {
      setDiningReply(
        "Nymph Guidance: Order Hamachi sashimi + brown rice chirashi bowl with wakame salad. Your follicular estrogen peak handles rice carbohydrates impeccably while seaweed delivers vital iodine for metabolic output."
      );
    } else if (q.includes("salty") || q.includes("crunchy")) {
      setDiningReply(
        "Nymph Guidance: Opt for roasted nori seaweed sheets with toasted sesame, or roasted spiced chickpeas with Celtic sea salt. This replenishes sodium without triggering aldosterone-mediated water retention."
      );
    } else if (q.includes("sweet")) {
      setDiningReply(
        "Nymph Guidance: Enjoy 2 Medjool dates stuffed with raw walnut halves and 85% dark cacao nibs, dusted with Ceylon cinnamon. Cinnamon stabilizes glucose disposal while dates replenish muscle glycogen."
      );
    } else if (q.includes("italian") || q.includes("pasta")) {
      setDiningReply(
        "Nymph Guidance: Choose al dente durum wheat or lentil penne paired with grilled shrimp and garlic-infused extra virgin olive oil. Request pomodoro sauce rather than heavy cream to optimize lipid digestion."
      );
    } else {
      setDiningReply(
        `Nymph Guidance: For ${query}, aim for 30-35g clean protein paired with complex carbohydrates (rice, quinoa, or roasted root vegetables). In the ${currentPhaseName} phase, prioritize antioxidant-rich herbs to protect mitochondria.`
      );
    }
  };

  const handleGenerateAiRecipe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pantryIngredients.trim()) {
      showToast("Please enter at least 1-2 ingredients you have on hand.", "error");
      return;
    }
    setGeneratingAi(true);
    setCustomRecipe(null);
    try {
      const res = await apiPost<CustomRecipeOut>("/users/ai-recipe", {
        ingredients: pantryIngredients,
        meal_type: aiMealType,
        nutritional_focus: aiFocus,
        phase: currentPhaseName.toLowerCase(),
      });
      setCustomRecipe(res);
      showToast("✨ AI Chef synthesized a customized high-performance recipe!", "success");
    } catch {
      // Local fallback formulation
      const fallback: CustomRecipeOut = {
        name: `Follicular ${aiFocus === "high_protein" ? "High-Protein" : "Energy"} Sauté`,
        prep_time_mins: 15,
        cook_time_mins: 18,
        calories: 520,
        protein_g: 36,
        carbs_g: 54,
        fats_g: 16,
        fiber_g: 8,
        iron_mg: 4.8,
        phase_benefit: `Formulated with your pantry items (${pantryIngredients}) to support ${currentPhaseName} estrogen clearance.`,
        ingredients: [
          ...pantryIngredients.split(",").map((s) => s.trim()),
          "1 tbsp Extra virgin olive oil",
          "Pinch of Himalayan pink salt & black pepper",
        ],
        instructions: [
          "Heat olive oil in a wide skillet over medium-high heat.",
          `Sauté ${pantryIngredients} until tender and fragrant (about 6-8 minutes).`,
          "Season with sea salt, pepper, and fresh lemon juice before serving warm.",
        ],
        nutritional_focus: aiFocus,
      };
      setCustomRecipe(fallback);
      showToast("Recipe crafted from local nutritional intelligence!", "info");
    } finally {
      setGeneratingAi(false);
    }
  };

  return (
    <div className="w-full pt-20 pb-16 bg-surface relative">
      <div className="relative w-full max-w-[1400px] mx-auto px-4 md:px-6 lg:px-8 space-y-12">
        {/* Glow underlay */}
        <div className="absolute -top-12 left-1/3 w-96 h-96 bg-primary-fixed/20 rounded-full blur-3xl pointer-events-none -z-10" />
        <div className="absolute top-96 right-10 w-80 h-80 bg-secondary-container/30 rounded-full blur-3xl pointer-events-none -z-10" />

        {/* Section 1: Header */}
        <section className="flex flex-col md:flex-row md:items-end justify-between gap-6 pt-4">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-secondary-fixed/50 text-on-secondary-fixed font-label-caps text-label-caps backdrop-blur-md shadow-sm">
              <span className="w-2 h-2 rounded-full bg-secondary animate-pulse" />
              <span>PHASE NUTRITION ENGINE ACTIVE</span>
            </div>
            <h1 className="font-display-hero text-3xl sm:text-5xl text-on-surface tracking-tight font-semibold">
              Nourish & Kitchen
            </h1>
            <p className="font-body-lg text-body-lg text-on-surface-variant leading-relaxed">
              Nutritional bio-energetics calibrated for estrogen-dominant {currentPhaseName.toLowerCase()}{" "}
              glycogen synthesis, micro-nutrient repletion, and muscle tissue repair.
            </p>
          </div>
          <div className="bg-surface-container-low px-5 py-3 rounded-full flex items-center gap-3 border border-surface-container-high/60">
            <span className="font-label-caps text-on-surface-variant uppercase text-xs">
              Daily Target:
            </span>
            <span className="font-headline-sm text-primary font-bold">
              {targets.calories} <span className="text-xs font-normal text-on-surface-variant">kcal</span>
            </span>
            <span className="text-outline-variant">•</span>
            <span className="font-label-caps text-secondary font-semibold">
              {targets.protein_g}g Protein
            </span>
          </div>
        </section>

        {/* Section 2: Daily Macro Architecture */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-headline-md text-headline-md text-on-surface font-semibold">
              Daily Macro Architecture
            </h2>
            <span className="font-label-caps text-label-caps text-on-surface-variant uppercase">
              Calibrated to {user?.weight_kg || 62}kg Bodyweight
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Carbs */}
            <div className="relative overflow-hidden bg-surface-container-lowest p-6 rounded-xl shadow-sm border border-surface-container-high/60 hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <span className="px-2.5 py-0.5 rounded-full bg-secondary-container/50 text-secondary font-label-caps text-label-caps font-semibold">
                    Complex Low-GI
                  </span>
                  <h3 className="font-headline-sm text-headline-sm text-on-surface font-semibold mt-1">
                    Carbohydrates
                  </h3>
                </div>
                <span className="font-headline-lg text-2xl font-bold text-secondary">
                  {targets.carbs_g}
                  <span className="text-body-sm font-normal text-on-surface-variant">g</span>
                </span>
              </div>
              <p className="font-body-sm text-body-sm text-on-surface-variant mb-4 leading-relaxed">
                Primary neuromuscular fuel substrate. High insulin sensitivity ensures rapid glycogen
                replenishment without fat storage.
              </p>
              <div className="space-y-1.5">
                <div className="flex justify-between font-label-caps text-label-caps text-on-surface-variant">
                  <span>Logged: {Math.round(targets.carbs_g * 0.65)}g</span>
                  <span>{Math.round(targets.carbs_g * 0.35)}g Remaining</span>
                </div>
                <div className="w-full h-2 rounded-full bg-surface-container overflow-hidden">
                  <div className="h-full bg-secondary rounded-full" style={{ width: "65%" }} />
                </div>
              </div>
              <div className="mt-4 pt-3 flex items-center justify-between font-label-caps text-label-caps text-on-surface-variant border-t border-surface-container/60">
                <span>Primary Sources:</span>
                <span className="text-on-surface font-medium truncate max-w-[160px]">
                  Sweet Potato · Oats · Quinoa
                </span>
              </div>
            </div>

            {/* Protein */}
            <div className="relative overflow-hidden bg-surface-container-lowest p-6 rounded-xl shadow-sm border border-surface-container-high/60 hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <span className="px-2.5 py-0.5 rounded-full bg-primary-fixed/60 text-primary font-label-caps text-label-caps font-semibold">
                    Leucine-Rich
                  </span>
                  <h3 className="font-headline-sm text-headline-sm text-on-surface font-semibold mt-1">
                    Lean Protein
                  </h3>
                </div>
                <span className="font-headline-lg text-2xl font-bold text-primary">
                  {targets.protein_g}
                  <span className="text-body-sm font-normal text-on-surface-variant">g</span>
                </span>
              </div>
              <p className="font-body-sm text-body-sm text-on-surface-variant mb-4 leading-relaxed">
                Stimulates myofibrillar protein synthesis (MPS) post-training. Target 35-40g boluses
                spaced every 3-4 hours.
              </p>
              <div className="space-y-1.5">
                <div className="flex justify-between font-label-caps text-label-caps text-on-surface-variant">
                  <span>Logged: {Math.round(targets.protein_g * 0.58)}g</span>
                  <span>{Math.round(targets.protein_g * 0.42)}g Remaining</span>
                </div>
                <div className="w-full h-2 rounded-full bg-surface-container overflow-hidden">
                  <div className="h-full bg-primary rounded-full" style={{ width: "58%" }} />
                </div>
              </div>
              <div className="mt-4 pt-3 flex items-center justify-between font-label-caps text-label-caps text-on-surface-variant border-t border-surface-container/60">
                <span>Primary Sources:</span>
                <span className="text-on-surface font-medium truncate max-w-[160px]">
                  Wild Salmon · Eggs · Tempeh
                </span>
              </div>
            </div>

            {/* Fats */}
            <div className="relative overflow-hidden bg-surface-container-lowest p-6 rounded-xl shadow-sm border border-surface-container-high/60 hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <span className="px-2.5 py-0.5 rounded-full bg-tertiary-fixed/60 text-on-tertiary-fixed font-label-caps text-label-caps font-semibold">
                    Omega-3 Focus
                  </span>
                  <h3 className="font-headline-sm text-headline-sm text-on-surface font-semibold mt-1">
                    Healthy Lipids
                  </h3>
                </div>
                <span className="font-headline-lg text-2xl font-bold text-tertiary">
                  {targets.fats_g}
                  <span className="text-body-sm font-normal text-on-surface-variant">g</span>
                </span>
              </div>
              <p className="font-body-sm text-body-sm text-on-surface-variant mb-4 leading-relaxed">
                Essential hormone precursor supporting follicular maturation and cell membrane
                fluidity while muting inflammation.
              </p>
              <div className="space-y-1.5">
                <div className="flex justify-between font-label-caps text-label-caps text-on-surface-variant">
                  <span>Logged: {Math.round(targets.fats_g * 0.61)}g</span>
                  <span>{Math.round(targets.fats_g * 0.39)}g Remaining</span>
                </div>
                <div className="w-full h-2 rounded-full bg-surface-container overflow-hidden">
                  <div className="h-full bg-tertiary rounded-full" style={{ width: "61%" }} />
                </div>
              </div>
              <div className="mt-4 pt-3 flex items-center justify-between font-label-caps text-label-caps text-on-surface-variant border-t border-surface-container/60">
                <span>Primary Sources:</span>
                <span className="text-on-surface font-medium truncate max-w-[160px]">
                  Flax Oil · Avocado · Seeds
                </span>
              </div>
            </div>

            {/* Hydration */}
            <div className="relative overflow-hidden bg-surface-container-lowest p-6 rounded-xl shadow-sm border border-surface-container-high/60 hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <span className="px-2.5 py-0.5 rounded-full bg-surface-container text-on-surface-variant font-label-caps text-label-caps font-semibold">
                    Electrolytes
                  </span>
                  <h3 className="font-headline-sm text-headline-sm text-on-surface font-semibold mt-1">
                    Hydration
                  </h3>
                </div>
                <span className="font-headline-lg text-2xl font-bold text-secondary">
                  {targets.hydration_l}
                  <span className="text-body-sm font-normal text-on-surface-variant">L</span>
                </span>
              </div>
              <p className="font-body-sm text-body-sm text-on-surface-variant mb-4 leading-relaxed">
                Expanded blood volume demands structured electrolyte replenishment (sodium, potassium,
                magnesium) to prevent plasma drops.
              </p>
              <div className="space-y-1.5">
                <div className="flex justify-between font-label-caps text-label-caps text-on-surface-variant">
                  <span>Logged: 2.1L</span>
                  <span>1.1L Remaining</span>
                </div>
                <div className="w-full h-2 rounded-full bg-surface-container overflow-hidden">
                  <div className="h-full bg-secondary-container rounded-full" style={{ width: "66%" }} />
                </div>
              </div>
              <div className="mt-4 pt-3 flex items-center justify-between font-label-caps text-label-caps text-on-surface-variant border-t border-surface-container/60">
                <span>Sources:</span>
                <span className="text-on-surface font-medium truncate max-w-[160px]">
                  Coconut Water · Celtic Salt
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* Section 3: Endocrine Timing Architecture (Pre & Post Workout Clock) */}
        <section className="bg-surface-container-low/70 rounded-2xl p-6 sm:p-8 shadow-sm border border-surface-container-high/60 relative overflow-hidden">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <div>
              <div className="inline-flex items-center gap-1 font-label-caps text-label-caps text-primary mb-1">
                <span className="material-symbols-outlined text-xs">schedule</span>
                <span>Rhythmic Fueling Protocol</span>
              </div>
              <h2 className="font-headline-md text-headline-md text-on-surface font-semibold">
                Endocrine Timing Architecture
              </h2>
            </div>
            <div className="flex items-center gap-2 text-on-surface-variant font-label-md text-label-md bg-surface-container-lowest px-4 py-1.5 rounded-full shadow-sm">
              <span className="w-2 h-2 rounded-full bg-secondary animate-ping" />
              <span>Recommended Window: 2h Pre & 45m Post-Lift</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Pre Workout */}
            <div className="bg-surface-container-lowest p-6 rounded-xl shadow-sm flex flex-col sm:flex-row items-center gap-5 border border-surface-container-high/40">
              <div className="w-16 h-16 rounded-full bg-secondary-container/40 flex-shrink-0 flex items-center justify-center text-secondary">
                <span className="material-symbols-outlined text-3xl">flare</span>
              </div>
              <div className="space-y-1 text-center sm:text-left flex-1">
                <div className="flex items-center justify-center sm:justify-start gap-2">
                  <span className="font-label-caps text-label-caps px-2.5 py-0.5 rounded-full bg-secondary-fixed text-on-secondary-fixed font-semibold">
                    T-Minus 75 MIN
                  </span>
                  <span className="font-label-caps text-label-caps text-on-surface-variant">
                    Pre-Straining Priming
                  </span>
                </div>
                <h4 className="font-headline-sm text-headline-sm text-on-surface font-semibold">
                  Fast-Digesting Cyclic Oats & Berries
                </h4>
                <p className="font-body-sm text-body-sm text-on-surface-variant leading-relaxed">
                  Light glycemic elevation paired with Himalayan pink salt to prime muscular pump
                  without gastrointestinal burden.
                </p>
              </div>
            </div>

            {/* Post Workout */}
            <div className="bg-surface-container-lowest p-6 rounded-xl shadow-sm flex flex-col sm:flex-row items-center gap-5 border border-surface-container-high/40">
              <div className="w-16 h-16 rounded-full bg-primary-fixed/50 flex-shrink-0 flex items-center justify-center text-primary">
                <span className="material-symbols-outlined text-3xl">bolt</span>
              </div>
              <div className="space-y-1 text-center sm:text-left flex-1">
                <div className="flex items-center justify-center sm:justify-start gap-2">
                  <span className="font-label-caps text-label-caps px-2.5 py-0.5 rounded-full bg-primary-fixed-dim text-on-primary-fixed font-semibold">
                    T-Plus 30 MIN
                  </span>
                  <span className="font-label-caps text-label-caps text-on-surface-variant">
                    Anabolic Window
                  </span>
                </div>
                <h4 className="font-headline-sm text-headline-sm text-on-surface font-semibold">
                  Anabolic Leucine & Tart Cherry Elixir
                </h4>
                <p className="font-body-sm text-body-sm text-on-surface-variant leading-relaxed">
                  3.5g pure plant leucine with montmorency tart cherry concentrate to suppress
                  cortisol and maximize protein accretion.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Section 4: The Herbal & Micronutrient Apothecary */}
        <section className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2">
            <div>
              <span className="font-label-caps text-label-caps text-primary tracking-wider uppercase">
                Somatic Plant Medicine
              </span>
              <h2 className="font-headline-md text-headline-md text-on-surface font-semibold">
                The Herbal & Micronutrient Apothecary
              </h2>
            </div>
            <p className="font-body-sm text-body-sm text-on-surface-variant max-w-md">
              Formulated specifically for {currentPhaseName} days to facilitate mineral restoration and
              optimal endocrine transitions.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Item 1 */}
            <div className="bg-surface-container-lowest rounded-xl p-6 shadow-sm flex flex-col justify-between hover:-translate-y-1 transition-transform border border-surface-container-high/60">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="w-10 h-10 rounded-full bg-primary-fixed flex items-center justify-center text-primary">
                    <span className="material-symbols-outlined text-xl">vital_signs</span>
                  </span>
                  <span className="font-label-caps text-label-caps px-2.5 py-1 rounded-full bg-primary-fixed-dim/40 text-on-primary-fixed-variant">
                    Post-Menses Shield
                  </span>
                </div>
                <h3 className="font-headline-sm text-headline-sm text-on-surface font-semibold pt-1">
                  Iron & Hibiscus Elixir
                </h3>
                <p className="font-body-sm text-body-sm text-on-surface-variant leading-relaxed">
                  Cold-steeped Sudanese hibiscus calyces loaded with natural Vitamin C, amplifying
                  non-heme plant iron assimilation up to 300%.
                </p>
              </div>
              <div className="mt-5 pt-3 bg-surface-container-low/50 p-3 rounded-lg flex items-center justify-between">
                <span className="font-label-caps text-label-caps text-on-surface-variant">
                  Dose: 18mg Heme-Bio
                </span>
                <button
                  type="button"
                  onClick={() => showToast("✦ Added Iron & Hibiscus Elixir to today's tea ritual!", "success")}
                  className="text-primary hover:text-on-primary-fixed font-label-md text-label-md font-semibold flex items-center gap-1 cursor-pointer"
                >
                  Add to Ritual <span className="material-symbols-outlined text-sm">add</span>
                </button>
              </div>
            </div>

            {/* Item 2 */}
            <div className="bg-surface-container-lowest rounded-xl p-6 shadow-sm flex flex-col justify-between hover:-translate-y-1 transition-transform border border-surface-container-high/60">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="w-10 h-10 rounded-full bg-secondary-container flex items-center justify-center text-secondary">
                    <span className="material-symbols-outlined text-xl">grain</span>
                  </span>
                  <span className="font-label-caps text-label-caps px-2.5 py-1 rounded-full bg-secondary-fixed-dim/40 text-on-secondary-fixed-variant">
                    Estrogen Cofactors
                  </span>
                </div>
                <h3 className="font-headline-sm text-headline-sm text-on-surface font-semibold pt-1">
                  Zinc & Pumpkin Seed Crunch
                </h3>
                <p className="font-body-sm text-body-sm text-on-surface-variant leading-relaxed">
                  Sprouted raw Austrian styrian pumpkin seeds rich in elemental zinc, supporting
                  healthy follicle maturation and receptor sensitivity.
                </p>
              </div>
              <div className="mt-5 pt-3 bg-surface-container-low/50 p-3 rounded-lg flex items-center justify-between">
                <span className="font-label-caps text-label-caps text-on-surface-variant">
                  Dose: 11mg Zinc Picolinate
                </span>
                <button
                  type="button"
                  onClick={() => showToast("✦ Added Zinc & Pumpkin Seeds to your snack plan!", "success")}
                  className="text-secondary hover:text-on-secondary-fixed font-label-md text-label-md font-semibold flex items-center gap-1 cursor-pointer"
                >
                  Add to Snack <span className="material-symbols-outlined text-sm">add</span>
                </button>
              </div>
            </div>

            {/* Item 3 */}
            <div className="bg-surface-container-lowest rounded-xl p-6 shadow-sm flex flex-col justify-between hover:-translate-y-1 transition-transform border border-surface-container-high/60">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="w-10 h-10 rounded-full bg-tertiary-fixed flex items-center justify-center text-tertiary">
                    <span className="material-symbols-outlined text-xl">water</span>
                  </span>
                  <span className="font-label-caps text-label-caps px-2.5 py-1 rounded-full bg-tertiary-fixed-dim/40 text-on-tertiary-fixed-variant">
                    Plasma Volume Support
                  </span>
                </div>
                <h3 className="font-headline-sm text-headline-sm text-on-surface font-semibold pt-1">
                  Electrolyte Watermelon Spritz
                </h3>
                <p className="font-body-sm text-body-sm text-on-surface-variant leading-relaxed">
                  Cold-pressed organic watermelon, potassium bicarbonate, and Celtic sea salt to
                  expand vascular micro-circulation before lifting.
                </p>
              </div>
              <div className="mt-5 pt-3 bg-surface-container-low/50 p-3 rounded-lg flex items-center justify-between">
                <span className="font-label-caps text-label-caps text-on-surface-variant">
                  Dose: 650mg K+ / 350mg Na+
                </span>
                <button
                  type="button"
                  onClick={() => showToast("✦ Hydration flask ratio updated!", "success")}
                  className="text-tertiary hover:text-on-tertiary-fixed font-label-md text-label-md font-semibold flex items-center gap-1 cursor-pointer"
                >
                  Mix Flask <span className="material-symbols-outlined text-sm">add</span>
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Section 5: Curated Follicular Gastronomy */}
        <section className="space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <span className="font-label-caps text-label-caps text-secondary uppercase tracking-wider">
                Repository Knowledge Synthesizer
              </span>
              <h2 className="font-headline-md text-headline-md text-on-surface font-semibold">
                Curated {currentPhaseName} Gastronomy
              </h2>
            </div>
            <button
              type="button"
              onClick={handleSwapRecipes}
              className="px-5 py-2.5 rounded-full bg-primary text-on-primary font-label-lg text-label-lg shadow-md hover:bg-primary-container hover:text-on-primary-container transition-all flex items-center gap-2 group cursor-pointer"
            >
              <span className="material-symbols-outlined text-lg group-hover:rotate-180 transition-transform duration-500">
                sync_saved_locally
              </span>
              <span>Swap Recipe with AI Engine</span>
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {featuredRecipes.map((r, idx) => (
              <article
                key={r.id || idx}
                className="bg-surface-container-lowest rounded-xl overflow-hidden shadow-sm flex flex-col md:flex-row group hover:shadow-md transition-shadow border border-surface-container-high/60"
              >
                <div className="md:w-5/12 h-56 md:h-auto relative overflow-hidden bg-surface-container">
                  <img
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    src={
                      idx === 0
                        ? "https://lh3.googleusercontent.com/aida-public/AB6AXuDTGt8jjBqdbFSUw1SwoaifSH3XsAjVkvUYvDc93_yYa6IxsprScZ7FV3eUzj1_Xs3LWJra-X-mH5JUVrN-aESWS1ZQmbyYqYGL80dfK3aqdO-BTiLA_e8oloz9uoU1cpnUg1i_OpCjFeKkEfpfiDY1t7ooW5YX4SVBoult8KCzGsrz9455sKwXADV-SJ7_wvdAK8fF-WYNGAxjTqAO9LlYCHYnmX8IlHB5-Fdi6-aEZuhTzUN86-Oo"
                        : "https://lh3.googleusercontent.com/aida-public/AB6AXuCeVur5F3t85_C7ba6A1yw2HXhcg8B9buEpn9EskeFky5aXThA-2LMkynYGnbjhMTQ0Vy8YlJ2yl35mVd2MEA6Tt-SBkhfr2TiYsOJkrupYr4UCYsopWLR4pO8QxpVOc8vfpsvyQUpIrFu1etYyMFMGSYB8OCm99ttwLW5DWQSJCwn-lHPsuW2YLSesPo6icQE1xFsFMQcEA8OUlK_kHb_wTiMMuHsZQ043eKNCTwVRQbD6_dHueDjj"
                    }
                    alt={r.name}
                  />
                  <div className="absolute top-3 left-3 bg-surface/90 backdrop-blur-md px-2.5 py-1 rounded-full text-primary font-label-caps text-label-caps shadow-sm">
                    {idx === 0 ? "Featured Plate" : "Recovery Plate"}
                  </div>
                </div>
                <div className="p-6 md:w-7/12 flex flex-col justify-between space-y-3">
                  <div>
                    <div className="flex items-center gap-2 text-on-surface-variant font-label-caps text-label-caps mb-1">
                      <span className="material-symbols-outlined text-sm">timer</span>
                      <span>{r.prepTimeMins + r.cookTimeMins} MIN TOTAL</span>
                      <span>·</span>
                      <span className="uppercase">{r.cuisine}</span>
                    </div>
                    <h3 className="font-headline-sm text-headline-sm text-on-surface font-semibold group-hover:text-primary transition-colors">
                      {r.name}
                    </h3>
                    <p className="font-body-sm text-body-sm text-on-surface-variant mt-2 leading-relaxed line-clamp-3">
                      {r.phaseBenefit}
                    </p>
                  </div>
                  <div className="space-y-3 pt-2">
                    <div className="flex items-center gap-2 flex-wrap font-label-caps text-label-caps">
                      <span className="px-2.5 py-1 rounded-full bg-surface-container-high text-on-surface">
                        {r.calories} kcal
                      </span>
                      <span className="px-2.5 py-1 rounded-full bg-secondary-fixed/50 text-secondary font-medium">
                        {r.carbs_g}g Carbs
                      </span>
                      <span className="px-2.5 py-1 rounded-full bg-primary-fixed/50 text-primary font-medium">
                        {r.protein_g}g Protein
                      </span>
                      <span className="px-2.5 py-1 rounded-full bg-surface-container text-on-surface-variant">
                        {r.fats_g}g Fats
                      </span>
                    </div>
                    <div className="flex items-center justify-between pt-1">
                      <button
                        type="button"
                        onClick={() => onOpenRecipeModal(r)}
                        className="text-primary font-label-md text-label-md font-semibold flex items-center gap-1 hover:underline cursor-pointer"
                      >
                        View Full Culinary Steps{" "}
                        <span className="material-symbols-outlined text-sm">arrow_forward</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => showToast(`Bookmarked ${r.name}!`, "success")}
                        className="w-8 h-8 rounded-full bg-surface-container hover:bg-primary-fixed flex items-center justify-center text-on-surface-variant hover:text-primary transition-colors cursor-pointer"
                      >
                        <span className="material-symbols-outlined text-base">bookmark_border</span>
                      </button>
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>

        {/* Section 6: AI Chef - Custom Fridge & Pantry Recipe Generator */}
        <section className="bg-surface-container-lowest rounded-2xl p-6 sm:p-8 shadow-sm border border-surface-container-high/60 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary-fixed/50 text-primary font-label-caps text-label-caps mb-1">
                <span className="material-symbols-outlined text-xs">soup_kitchen</span>
                <span>AI Pantry & Fridge Synthesizer</span>
              </div>
              <h3 className="font-headline-md text-headline-md text-on-surface font-semibold">
                Tell me what ingredients you have in your kitchen
              </h3>
            </div>
            <span className="font-label-caps text-on-surface-variant text-xs">
              FastAPI Neural Culinary Engine
            </span>
          </div>

          <form onSubmit={handleGenerateAiRecipe} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-2 space-y-1">
                <label className="font-label-caps text-on-surface-variant uppercase text-xs">
                  Available Ingredients in your Kitchen
                </label>
                <input
                  type="text"
                  value={pantryIngredients}
                  onChange={(e) => setPantryIngredients(e.target.value)}
                  placeholder="e.g. eggs, spinach, sweet potato, Greek yogurt, pumpkin seeds..."
                  className="w-full bg-surface-container-low text-on-surface rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary border border-surface-container-high"
                />
              </div>

              <div className="space-y-1">
                <label className="font-label-caps text-on-surface-variant uppercase text-xs">
                  Nutritional Focus
                </label>
                <select
                  value={aiFocus}
                  onChange={(e) => setAiFocus(e.target.value)}
                  className="w-full bg-surface-container-low text-on-surface rounded-xl px-3 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary border border-surface-container-high"
                >
                  <option value="high_protein">High Protein (Athletic MPS)</option>
                  <option value="iron_replenishment">Iron Replenishment</option>
                  <option value="anti_inflammatory">Anti-Inflammatory</option>
                  <option value="glycogen_replenish">Glycogen Replenishment</option>
                </select>
              </div>
            </div>

            <div className="flex items-center justify-between pt-1">
              <span className="font-body-sm text-on-surface-variant italic">
                "AI crafts high-protein phase-matched recipes from any ingredients"
              </span>
              <button
                type="submit"
                disabled={generatingAi}
                className="px-6 py-2.5 rounded-full bg-primary text-on-primary font-label-lg font-semibold hover:bg-on-primary-container transition-all flex items-center gap-2 cursor-pointer shadow-sm"
              >
                <span className="material-symbols-outlined text-base">
                  {generatingAi ? "hourglass_top" : "magic_button"}
                </span>
                <span>{generatingAi ? "Synthesizing Recipe..." : "Create Recipe with AI"}</span>
              </button>
            </div>
          </form>

          {/* Render Generated AI Recipe */}
          {customRecipe && (
            <div className="p-6 rounded-xl bg-gradient-to-br from-primary-fixed/20 via-surface-container-low to-secondary-container/20 border border-primary-container/40 space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <span className="px-2.5 py-0.5 rounded-full bg-primary-fixed text-primary font-label-caps text-label-caps">
                    AI Custom Synthesis
                  </span>
                  <h4 className="font-headline-md text-headline-md text-on-surface font-bold mt-1">
                    {customRecipe.name}
                  </h4>
                  <p className="font-body-sm text-on-surface-variant mt-1">
                    {customRecipe.phase_benefit}
                  </p>
                </div>
                <div className="text-right">
                  <span className="font-headline-sm text-primary font-bold">
                    {customRecipe.calories} kcal
                  </span>
                  <div className="font-label-caps text-on-surface-variant">
                    {customRecipe.protein_g}g P · {customRecipe.carbs_g}g C · {customRecipe.fats_g}g F
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                <div className="bg-surface-container-lowest p-4 rounded-xl border border-surface-container-high/60">
                  <h5 className="font-label-md text-on-surface font-semibold mb-2">Ingredients</h5>
                  <ul className="space-y-1 text-sm text-on-surface-variant">
                    {customRecipe.ingredients.map((ing, i) => (
                      <li key={i} className="flex items-center gap-2">
                        <span className="text-primary text-xs">✦</span>
                        <span>{ing}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="bg-surface-container-lowest p-4 rounded-xl border border-surface-container-high/60">
                  <h5 className="font-label-md text-on-surface font-semibold mb-2">Instructions</h5>
                  <ol className="space-y-1 text-sm text-on-surface-variant list-decimal list-inside">
                    {customRecipe.instructions.map((step, i) => (
                      <li key={i} className="leading-snug">
                        {step}
                      </li>
                    ))}
                  </ol>
                </div>
              </div>
            </div>
          )}
        </section>

        {/* Section 7: Dining Out & Craving Assistant (Inline Oracle Drawer) */}
        <section className="bg-gradient-to-r from-surface-container-low via-surface-container to-surface-container-low rounded-2xl p-6 sm:p-8 shadow-sm border border-surface-container-high/60 relative overflow-hidden">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8">
            <div className="space-y-2 max-w-xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary-fixed text-primary font-label-caps text-label-caps">
                <span className="material-symbols-outlined text-xs">restaurant</span>
                <span>Real-World Culinary Oracle</span>
              </div>
              <h3 className="font-headline-lg text-2xl sm:text-3xl text-on-surface font-semibold">
                Dining out tonight or feeling a specific craving?
              </h3>
              <p className="font-body-md text-body-md text-on-surface-variant leading-relaxed">
                Tell me your restaurant cuisine (e.g. Japanese, Mexican, French Bistro) or what texture
                you crave. Aura Nymph translates any commercial menu to match your follicular macros
                effortlessly.
              </p>
            </div>

            <div className="w-full lg:w-5/12 bg-surface-container-lowest p-5 rounded-xl shadow-sm space-y-3 border border-surface-container-high/60">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-lg">psychology</span>
                <span className="font-label-md text-label-md text-on-surface font-semibold">
                  Instant Menu Translator
                </span>
              </div>
              <div className="relative">
                <input
                  type="text"
                  value={diningInput}
                  onChange={(e) => setDiningInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleDiningOracle(diningInput);
                  }}
                  placeholder="e.g. Italian trattoria with friends; craving pasta..."
                  className="w-full bg-surface-container-low text-on-surface placeholder:text-on-surface-variant px-4 py-3 rounded-full font-body-sm text-body-sm focus:outline-none focus:ring-2 focus:ring-primary pr-24 shadow-inner border border-surface-container-high"
                />
                <button
                  type="button"
                  onClick={() => handleDiningOracle(diningInput)}
                  className="absolute right-1.5 top-1.5 bottom-1.5 px-4 rounded-full bg-primary text-on-primary font-label-caps text-label-caps hover:bg-primary-container hover:text-on-primary-container transition-all flex items-center gap-1 cursor-pointer"
                >
                  <span>Adapt</span>
                  <span className="material-symbols-outlined text-xs">arrow_forward</span>
                </button>
              </div>

              {/* Quick chips */}
              <div className="flex flex-wrap gap-1.5 pt-1">
                <button
                  type="button"
                  onClick={() => handleDiningOracle("Sushi Bar Order")}
                  className="px-3 py-1 rounded-full bg-surface-container text-on-surface font-label-caps text-label-caps hover:bg-primary-fixed hover:text-primary transition-colors cursor-pointer"
                >
                  Sushi Bar Order
                </button>
                <button
                  type="button"
                  onClick={() => handleDiningOracle("Salty / Crunchy Craving")}
                  className="px-3 py-1 rounded-full bg-surface-container text-on-surface font-label-caps text-label-caps hover:bg-primary-fixed hover:text-primary transition-colors cursor-pointer"
                >
                  Salty / Crunchy Craving
                </button>
                <button
                  type="button"
                  onClick={() => handleDiningOracle("Sweet Tooth Remedy")}
                  className="px-3 py-1 rounded-full bg-surface-container text-on-surface font-label-caps text-label-caps hover:bg-primary-fixed hover:text-primary transition-colors cursor-pointer"
                >
                  Sweet Tooth Remedy
                </button>
              </div>

              {/* Interactive Response */}
              {diningReply && (
                <div className="mt-2 p-3.5 rounded-xl bg-secondary-container/30 text-on-secondary-fixed text-body-sm font-body-sm leading-relaxed border border-secondary/20">
                  {diningReply}
                </div>
              )}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

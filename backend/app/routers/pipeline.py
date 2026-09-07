from datetime import datetime, timezone



from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import User
from app.schemas import (
    ChatIn,
    ChatOut,
    CustomRecipeIn,
    CustomRecipeOut,
    PredictPhaseIn,
    PredictPhaseOut,
    RecommendIn,
    RecommendOut,
)
from app.services import llm_client, ml_stub, phase_service, recommendation

router = APIRouter(tags=["ml"])






@router.post("/predict-phase", response_model=PredictPhaseOut)

def predict_phase(body: PredictPhaseIn, db: Session = Depends(get_db)) -> PredictPhaseOut:

    if db.get(User, body.user_id) is None:

        raise HTTPException(status_code=404, detail="User not found")

    last = ml_stub.last_period_start(db, body.user_id)

    ref = body.reference_date if body.reference_date is not None else datetime.now(timezone.utc).date()

    return phase_service.infer_phase(db, body.user_id, last, ref)





@router.post("/recommend", response_model=RecommendOut)

def recommend(body: RecommendIn, db: Session = Depends(get_db)) -> RecommendOut:

    if db.get(User, body.user_id) is None:

        raise HTTPException(status_code=404, detail="User not found")

    out, phase_out = recommendation.build_recommendation(db, body.user_id)

    bundle = {

        "phase": phase_out.model_dump(),

        "recommendation": out.model_dump(),

    }

    ml_stub.persist_recommendation(db, body.user_id, bundle)
    return out


@router.post("/recommend/custom-recipe", response_model=CustomRecipeOut)
def create_custom_recipe(body: CustomRecipeIn, db: Session = Depends(get_db)) -> CustomRecipeOut:
    user = db.get(User, body.user_id)
    if user is None:
        raise HTTPException(status_code=404, detail="User not found")

    last = ml_stub.last_period_start(db, body.user_id)
    ref = datetime.now(timezone.utc).date()
    phase_out = phase_service.infer_phase(db, body.user_id, last, ref)
    phase = phase_out.phase

    # 1. Try local LLM if configured and online
    prompt = (
        f"You are a master sports nutritionist and chef for women. "
        f"User's current menstrual phase: {phase} (day {phase_out.day_in_cycle}). "
        f"Nutritional focus requested: {body.nutritional_focus}. "
        f"Meal type requested: {body.meal_type}. "
        f"Available ingredients user has: {body.available_ingredients}. "
        f"User profile: weight={user.weight_kg}kg, height={user.height_cm}cm, training={user.training_level}. "
        "Respond strictly in valid JSON with keys: "
        '"name" (string), "prep_time_mins" (int), "cook_time_mins" (int), "calories" (int 350-650), '
        '"protein_g" (float), "carbs_g" (float), "fats_g" (float), "fiber_g" (float), "iron_mg" (float), '
        f'"phase_benefit" (string explaining benefit for {phase} phase), '
        '"ingredients" (list of strings with measurements), "instructions" (list of 3-5 cooking steps).'
    )
    llm_reply = llm_client.generate_ollama_reply(prompt)
    if llm_reply:
        try:
            import json
            start = llm_reply.find("{")
            end = llm_reply.rfind("}")
            if start != -1 and end != -1:
                data = json.loads(llm_reply[start:end + 1])
                return CustomRecipeOut(
                    name=data.get("name", "Phase-Targeted Kitchen Creation"),
                    prep_time_mins=int(data.get("prep_time_mins", 12)),
                    cook_time_mins=int(data.get("cook_time_mins", 15)),
                    calories=int(data.get("calories", 460)),
                    protein_g=float(data.get("protein_g", 34.0)),
                    carbs_g=float(data.get("carbs_g", 42.0)),
                    fats_g=float(data.get("fats_g", 16.0)),
                    fiber_g=float(data.get("fiber_g", 7.0)),
                    iron_mg=float(data.get("iron_mg", 4.2)),
                    phase_benefit=data.get("phase_benefit", f"Nutrient-dense synergy balancing {phase} hormones."),
                    ingredients=list(data.get("ingredients", [])),
                    instructions=list(data.get("instructions", [])),
                    nutritional_focus=body.nutritional_focus,
                )
        except Exception:
            pass

    # 2. Heuristic Phase-Calibrated Culinary Synthesis
    ing_lower = body.available_ingredients.lower()
    has_salmon = any(w in ing_lower for w in ["salmon", "fish", "tuna", "shrimp", "seafood"])
    has_chicken = any(w in ing_lower for w in ["chicken", "turkey", "poultry", "meat"])
    has_tofu = any(w in ing_lower for w in ["tofu", "tempeh", "edamame", "soy"])
    has_eggs = any(w in ing_lower for w in ["egg", "eggs", "omelet"])
    has_oats = any(w in ing_lower for w in ["oat", "oats", "porridge", "granola"])
    has_yogurt = any(w in ing_lower for w in ["yogurt", "curd", "greek yogurt"])

    if has_salmon:
        name = "Pan-Seared Herb Salmon & Veggie Power Skillet"
        protein, carbs, fats, cal = 38.0, 34.0, 18.0, 480
        benefit = f"High marine omega-3 fatty acids and zinc directly lowering uterine prostaglandins during {phase} phase."
    elif has_chicken:
        name = "Rosemary Grilled Chicken & Roasted Harvest Bowl"
        protein, carbs, fats, cal = 44.0, 36.0, 14.0, 460
        benefit = f"Dense complete bioavailable amino acids and zinc accelerating muscle repair in {phase} phase."
    elif has_tofu:
        name = "Ginger Garlic Glazed Tofu & Green Veggie Sauté"
        protein, carbs, fats, cal = 26.0, 48.0, 14.0, 430
        benefit = f"Plant isoflavones and magnesium calming smooth muscle contractions for {phase} phase."
    elif has_eggs:
        name = "Garden Vegetable & Pasture Egg Scramble Bowl"
        protein, carbs, fats, cal = 28.0, 26.0, 18.0, 410
        benefit = f"Bioavailable choline and lutein nurturing hormone receptor sensitivity during {phase} phase."
    elif has_oats or has_yogurt:
        name = "High-Protein Superfood Porridge Bowl"
        protein, carbs, fats, cal = 25.0, 58.0, 12.0, 440
        benefit = f"Complex beta-glucan fibers and magnesium stabilizing serotonin and glucose during {phase} phase."
    else:
        name = "Custom Phase-Balancing Nourish Bowl"
        protein, carbs, fats, cal = 28.0, 45.0, 15.0, 430
        benefit = f"Phyto-nutrient rich whole food synergy tailored to support your {phase} hormone metabolism."

    ing_items = [f"Base: {body.available_ingredients.split(',')[0].strip().capitalize()}"]
    for item in body.available_ingredients.split(",")[1:4]:
        if item.strip():
            ing_items.append(f"Fresh: {item.strip().capitalize()}")
    ing_items.extend([
        "1 tbsp Cold-pressed olive oil or ghee",
        "Pinch of sea salt, cracked black pepper & fresh herbs",
    ])

    instructions = [
        "Rinse and prepare all available ingredients, slicing vegetables into bite-sized pieces.",
        "Warm 1 tablespoon of olive oil in a wide skillet over medium heat with cracked black pepper and garlic.",
        "Cook your primary protein or grains first until hot, golden, and tender.",
        "Add any greens, tomatoes, or quick-cooking vegetables during the last 3 minutes to preserve micronutrients.",
        "Finish with fresh herbs, a pinch of sea salt, and a fresh squeeze of lemon; serve immediately.",
    ]

    return CustomRecipeOut(
        name=name,
        prep_time_mins=10,
        cook_time_mins=15,
        calories=cal,
        protein_g=protein,
        carbs_g=carbs,
        fats_g=fats,
        fiber_g=8.0,
        iron_mg=4.6,
        phase_benefit=benefit,
        ingredients=ing_items,
        instructions=instructions,
        nutritional_focus=body.nutritional_focus,
    )


@router.post("/chat", response_model=ChatOut)


def chat(body: ChatIn, db: Session = Depends(get_db)) -> ChatOut:

    if db.get(User, body.user_id) is None:

        raise HTTPException(status_code=404, detail="User not found")

    last = ml_stub.last_period_start(db, body.user_id)

    ref = datetime.now(timezone.utc).date()

    phase_out = phase_service.infer_phase(db, body.user_id, last, ref)

    ctx = ml_stub.recent_context(db, body.user_id)

    prompt = (

        "You are a concise athletic coach and health educator for women. "

        "Use the structured context; do not invent medical diagnoses. "

        f"Cycle phase (estimate): {phase_out.phase}, day {phase_out.day_in_cycle}. "

        f"Recent context JSON: {ctx}. User message: {body.message}"

    )

    reply = llm_client.generate_ollama_reply(prompt)
    if reply:
        return ChatOut(reply=reply, source="Clue AI")

    guidance = _generate_clue_guidance(phase_out.phase, phase_out.day_in_cycle, body.message)
    return ChatOut(reply=guidance, source="Clue Health Companion")


def _generate_clue_guidance(phase: str, day: int, message: str) -> str:
    msg = message.lower()
    phase_clean = phase.capitalize() if phase != "unknown" else "Current"

    if any(w in msg for w in ["eat", "food", "diet", "nutrition", "craving", "meal", "hungry"]):
        if phase == "menstrual":
            return (
                f"🥗 **Nutrition Guidance for Menstrual Phase (Day {day}):**\n\n"
                "• **Replenish Iron & Zinc:** Focus on grass-fed beef, lentils, spinach, and pumpkin seeds to restore iron lost through bleeding.\n"
                "• **Anti-inflammatory Foods:** Warm bone broths, turmeric golden milk, and berries help reduce uterine prostaglandins.\n"
                "• **Cacao & Magnesium:** Dark chocolate (>75% cacao) provides natural magnesium to relieve cramping and ease mood shifts.\n"
                "• **Hydration:** Aim for at least 2.5L of warm water or herbal teas (ginger, raspberry leaf) to combat fluid retention."
            )
        elif phase == "follicular":
            return (
                f"🥗 **Nutrition Guidance for Follicular Phase (Day {day}):**\n\n"
                "• **Lean Protein & Metabolism Support:** Estrogen is rising and insulin sensitivity is high. Prioritize eggs, wild salmon, chicken breast, and edamame.\n"
                "• **Sprouted & Fermented Foods:** Kimchi, sauerkraut, and kefir support healthy gut flora to metabolize rising estrogen smoothly.\n"
                "• **Complex Carbs:** Quinoa, oats, and sweet potatoes fuel higher training intensities without blood sugar spikes.\n"
                "• **Hydration:** 2.2–2.5L daily with light electrolytes before training."
            )
        elif phase == "ovulatory":
            return (
                f"🥗 **Nutrition Guidance for Ovulation Window (Day {day}):**\n\n"
                "• **Antioxidant & Fiber Dense:** High estrogen levels require fiber to support liver detoxification. Load up on cruciferous veggies (broccoli, Brussels sprouts, kale).\n"
                "• **Glutathione & Vitamin C:** Citrus fruits, bell peppers, and avocados support ovarian follicle release.\n"
                "• **Lighter, Vibrant Meals:** Metabolism runs slightly cooler; fresh salads with olive oil, seeds, and wild fish are ideal.\n"
                "• **Hydration:** 2.5L with a pinch of Celtic sea salt or electrolyte powder."
            )
        else:
            return (
                f"🥗 **Nutrition Guidance for Luteal Phase (Day {day}):**\n\n"
                "• **Sustain Serotonin & Complex Carbs:** Progesterone increases metabolic demand by ~100–300 kcal/day. Complex carbs (brown rice, roasted sweet potatoes, squash) prevent blood sugar crashes and PMS mood swings.\n"
                "• **Magnesium & Vitamin B6:** Bananas, pumpkin seeds, salmon, and chickpeas stimulate progesterone synthesis and alleviate water retention.\n"
                "• **Limit Caffeine & Excess Sodium:** Reducing excess salt and espresso helps minimize breast tenderness and bloating.\n"
                "• **Hydration:** 2.5–3.0L warm herbal teas (peppermint, chamomile)."
            )

    if any(w in msg for w in ["workout", "exercise", "training", "intensity", "run", "lift", "strength", "gym", "cardio"]):
        if phase == "menstrual":
            return (
                f"🏃‍♀️ **Training Guidance for Menstrual Phase (Day {day}):**\n\n"
                "• **Primary Focus:** Restorative movement, joint mobility, and low-impact steady state (LISS).\n"
                "• **Recommended Sessions:** Gentle Yin yoga, pelvic floor stretching, 30-minute nature walks, or light swimming.\n"
                "• **Intensity Target:** RPE 3–5 / 10. Avoid maximum strain PRs if feeling pelvic pressure or fatigue.\n"
                "• **Listen to Your Body:** If you feel an unexpected burst of energy, moderate lifting is safe, but prioritize extra warmup time."
            )
        elif phase == "follicular":
            return (
                f"🏃‍♀️ **Training Guidance for Follicular Phase (Day {day}):**\n\n"
                "• **Primary Focus:** Progressive strength overload, building muscle tissue, and speed.\n"
                "• **Why it Works:** Estrogen is anabolic, promoting muscle protein synthesis, joint elasticity, and faster glycogen replenishment.\n"
                "• **Recommended Sessions:** Heavy barbell lifts (squats, deadlifts), tempo intervals, and challenging HIIT sessions.\n"
                "• **Intensity Target:** RPE 7–8.5 / 10. Your recovery capacity is at its monthly peak!"
            )
        elif phase == "ovulatory":
            return (
                f"🏃‍♀️ **Training Guidance for Ovulation Window (Day {day}):**\n\n"
                "• **Primary Focus:** Personal records (PRs), maximum sprint power, and high-intensity competition.\n"
                "• **Why it Works:** Peak estrogen combined with a subtle testosterone surge maximizes central nervous system output.\n"
                "• **Recommended Sessions:** 1-rep max attempts, maximum-speed track sprints, powerlifting.\n"
                "• **Caution:** Higher estrogen can temporarily increase joint laxity; ensure thorough warmups and pristine biomechanics."
            )
        else:
            return (
                f"🏃‍♀️ **Training Guidance for Luteal Phase (Day {day}):**\n\n"
                "• **Primary Focus:** Zone-2 aerobic capacity, endurance volume, and functional hypertrophy.\n"
                "• **Why it Works:** Higher progesterone raises core temperature and resting heart rate, shifting the body toward fat oxidation.\n"
                "• **Recommended Sessions:** 45–60 min steady state cycling/jogging, Pilates, functional bodyweight circuits.\n"
                "• **Intensity Target:** RPE 5–6.5 / 10. Prioritize 8+ hours of sleep and cooldown mobility to manage cortisol."
            )

    if any(w in msg for w in ["heart", "hrv", "resting", "pulse", "bpm", "vitals", "temperature"]):
        return (
            "💓 **Biometrics & Hormonal Fluctuations:**\n\n"
            "• **Resting Heart Rate (RHR):** It is completely normal for your RHR to increase by 2–5 bpm following ovulation and remain elevated through the luteal phase due to progesterone's thermogenic effect.\n"
            "• **Heart Rate Variability (HRV):** HRV generally peaks during the follicular phase (indicating high parasympathetic recovery) and dips slightly in the late luteal phase.\n"
            "• **Skin / Basal Body Temperature:** Post-ovulation, your temperature rises by ~0.3°C to 0.5°C and drops right as menstruation commences.\n"
            "• **Action Tip:** If your HRV is lower than your 7-day baseline, downscale high-intensity intervals in favor of restorative aerobic work."
        )

    if any(w in msg for w in ["cramp", "pain", "bloat", "tender", "headache", "symptom"]):
        return (
            "🪷 **Evidence-Based Symptom Relief:**\n\n"
            "• **For Cramps & Uterine Spasms:** Apply continuous localized heat (heating pad at ~40°C), which clinical studies show is as effective as ibuprofen. Supplementing with magnesium glycinate (200–300 mg) relaxes smooth muscle contractions.\n"
            "• **For Bloating & Fluid Retention:** Increase potassium-rich foods (bananas, coconut water, avocado) and sip dandelion root or ginger tea. Avoid artificial sweeteners and carbonated sodas.\n"
            "• **For Headaches & Tension:** Hydrate with electrolytes. Hormonal drops trigger vasodilation—gentle neck mobility and peppermint oil at the temples offer natural relief."
        )

    if any(w in msg for w in ["sleep", "rest", "tired", "fatigue", "insomnia"]):
        return (
            "😴 **Sleep Architecture & Phase Rhythms:**\n\n"
            "• **Luteal Shift:** Progesterone promotes initial drowsiness but can fragment REM sleep and raise core body temperature, leading to lighter rest.\n"
            "• **Sleep Optimization Tips:**\n"
            "  1. Keep your bedroom cool (around 18–19°C / 65–67°F) to offset elevated luteal body temperature.\n"
            "  2. Establish a screen-free wind-down 45 minutes before sleep.\n"
            "  3. Magnesium L-threonate or glycinate 30 minutes before bed supports deep restorative stages."
        )

    return (
        f"🪷 **Clue Health Guidance · {phase_clean} Phase (Day {day}):**\n\n"
        f"You are currently in your **{phase_clean} Phase** (Day {day}). During this window, your hormonal environment is uniquely calibrated:\n\n"
        "• **Movement:** Match your session intensity to today's readiness score. Respect early signs of fatigue.\n"
        "• **Nourishment:** Focus on whole, nutrient-dense foods supporting your phase's metabolic rate.\n"
        "• **Recovery:** Stay hydrated and track your daily symptoms to keep your personalized cycle forecasts razor sharp.\n\n"
        "Ask me anything about meals, training adjustments, or symptom relief!"
    )


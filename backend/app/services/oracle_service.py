"""
Model 4 Service: Somatic Athletic Dialogue & Intent Engine
Loads trained NLP classifier from backend/artifacts/oracle_intent_model.joblib.
Combines intent classification with local Ollama LLaMA inference,
falling back gracefully to phase-calibrated sports endocrinology knowledge.
"""

from __future__ import annotations

from pathlib import Path
from typing import Any

from app.config import settings
from app.services import llm_client

_MODEL_PATH = settings.artifacts_dir / "oracle_intent_model.joblib"


def classify_intent(message: str) -> tuple[str, float]:
    """
    Classify conversational query into one of 8 clinical/athletic intents.
    Returns: (predicted_intent, confidence_score)
    """
    if not _MODEL_PATH.exists():
        return _fallback_intent(message), 0.50

    try:
        import joblib

        pipeline = joblib.load(_MODEL_PATH)
        probas = pipeline.predict_proba([message])[0]
        classes = pipeline.classes_
        top_idx = int(probas.argmax())
        return str(classes[top_idx]), float(probas[top_idx])
    except Exception:
        return _fallback_intent(message), 0.50


def _fallback_intent(message: str) -> str:
    msg = message.lower()
    if any(k in msg for k in ["eat", "food", "diet", "nutrition", "craving", "macro", "protein", "carb", "hungry"]):
        return "nutrition_fuel"
    if any(k in msg for k in ["workout", "train", "lift", "squat", "hiit", "cardio", "run", "intensity", "pr"]):
        return "training_load"
    if any(k in msg for k in ["sore", "recovery", "doms", "rest", "fatigue", "tired", "plunge", "exhausted"]):
        return "recovery_soreness"
    if any(k in msg for k in ["cramp", "pain", "period", "bleed", "pms", "bloat", "ache"]):
        return "symptom_cramps"
    if any(k in msg for k in ["sleep", "insomnia", "awake", "night", "rem", "wake", "restless"]):
        return "sleep_insomnia"
    if any(k in msg for k in ["phase", "cycle", "follicular", "luteal", "menstrual", "hormone", "day"]):
        return "hormone_phase_inquiry"
    if any(k in msg for k in ["ovulat", "fertile", "egg", "mucus", "temp", "lh"]):
        return "ovulation_fertility"
    if any(k in msg for k in ["injury", "joint", "knee", "acl", "laxity", "ligament", "sprain", "hypermobile"]):
        return "injury_laxity_prevention"
    return "hormone_phase_inquiry"


def generate_somatic_guidance(
    message: str,
    phase: str,
    day_in_cycle: int,
    intensity_score: int | None = None,
    recovery_hours: int | None = None,
) -> tuple[str, str, str]:
    """
    Generate conversational guidance using Model 4.
    Returns: (reply_text, intent, source)
    """
    intent, confidence = classify_intent(message)
    conf_pct = round(confidence * 100, 1)

    # 1. Try local Ollama LLM if configured and online
    ollama_prompt = (
        f"You are a clinical sports endocrinologist and athletic coach for female athletes. "
        f"User query: '{message}'. "
        f"Detected Intent: {intent} (Confidence: {conf_pct}%). "
        f"Athlete Status: Phase={phase.upper()}, Day={day_in_cycle} of cycle, "
        f"Target Effort Score={intensity_score or 70}/100, "
        f"Suggested Recovery Window={recovery_hours or 18} hours. "
        "Provide an empathetic, scientifically grounded, actionable response (1-2 short paragraphs) "
        "referencing her cycle phase and physiological hormones."
    )

    ollama_reply = llm_client.generate_ollama_reply(ollama_prompt)
    if ollama_reply:
        return ollama_reply, intent, f"Cycle Health AI (LLaMA via Ollama | Intent: {intent})"

    # 2. Local Expert Sports-Science Guidance Engine (Model 4 NLP Oracle)
    reply = _render_clinical_guidance(intent, phase, day_in_cycle, intensity_score, recovery_hours)
    source = f"Cycle Health AI (Model 4 NLP Oracle | {conf_pct}% Intent: {intent})"
    return reply, intent, source


def _render_clinical_guidance(
    intent: str,
    phase: str,
    day: int,
    intensity_score: int | None,
    recovery_hours: int | None,
) -> str:
    phase_title = phase.capitalize() if phase != "unknown" else "Current"
    effort = intensity_score or 72
    rec = recovery_hours or 18

    if intent == "nutrition_fuel":
        if phase == "menstrual":
            return (
                f"🥗 **Nutrition Guidance for Menstrual Phase (Day {day}):**\n\n"
                "• **Replenish Bioavailable Iron & Zinc:** Focus on lentils, spinach, pumpkin seeds, and grass-fed meats to restore hemoglobin lost through bleeding.\n"
                "• **Anti-Inflammatory Synergies:** Incorporate turmeric golden milk, ginger tea, and antioxidant-rich berries to mitigate uterine prostaglandins.\n"
                "• **Magnesium & Cocoa:** Dark chocolate (75%+ cacao) helps relax smooth uterine muscle and alleviates mood fluctuations.\n"
                "• **Hydration Goal:** Target at least 2.5–2.8L of warm mineralized water."
            )
        elif phase == "follicular":
            return (
                f"🥗 **Nutrition Guidance for Follicular Phase (Day {day}):**\n\n"
                "• **High Carbohydrate Tolerance:** Rising $17\\beta$-estradiol increases insulin sensitivity. This is your peak window to fuel workouts with sweet potatoes, oats, quinoa, and fresh fruit.\n"
                "• **Lean Muscle Building:** Consume 1.6–1.8g/kg protein (eggs, wild salmon, Greek yogurt, edamame) to support progressive overload.\n"
                "• **Micro-Nutrients:** Zinc and folate assist ovarian follicle maturation."
            )
        elif phase == "ovulatory":
            return (
                f"🥗 **Nutrition Guidance for Ovulatory Peak (Day {day}):**\n\n"
                "• **High Energy Satiety:** Estrogen peaks alongside a brief surge in testosterone. Support hepatic hormone breakdown with cruciferous vegetables (broccoli, cabbage, Brussels sprouts).\n"
                "• **Fiber Clearance:** Aim for 32g of dietary fiber to assist in metabolizing circulating estrogen.\n"
                "• **Electrolytes:** Ensure adequate sodium, potassium, and magnesium pre-workout."
            )
        else:  # Luteal
            return (
                f"🥗 **Nutrition Guidance for Luteal Phase (Day {day}):**\n\n"
                "• **Thermogenic Caloric Buffer:** Progesterone elevates your resting basal metabolism by +100 to +300 kcal/day. Do not skip meals; honor this biological energy need!\n"
                "• **Protein Satiety:** Elevated cortisol speeds up protein breakdown; prioritize 1.8–1.9g/kg protein.\n"
                "• **Serotonin Support:** Combine complex carbohydrates (brown rice, squash) with tryptophan sources (turkey, eggs, pumpkin seeds) to keep mood steady and curb late-night sugar cravings."
            )

    elif intent == "training_load":
        if phase == "follicular":
            return (
                f"⚡ **Training Prescription for Follicular Phase (Day {day}):**\n\n"
                f"• **Target Intensity:** {effort}% 1RM. You are in your prime neuro-muscular window!\n"
                "• **Athletic Focus:** Compound lifts (back squats, bench press, deadlifts) with progressive overload. Your muscles recover faster under estrogen, and delayed-onset soreness clears quickly.\n"
                "• **Conditioning:** VO2 max intervals and tempo cardio yield maximum aerobic adaptations right now."
            )
        elif phase == "ovulatory":
            return (
                f"⚡ **Training Prescription for Ovulatory Peak (Day {day}):**\n\n"
                f"• **Target Intensity:** {effort}% 1RM. Peak force generation and neurological recruitment!\n"
                "• **Athletic Focus:** Test personal records, plyometrics, and high-velocity sprints.\n"
                "• **Safety Note:** Estrogen and relaxin temporarily loosen ligaments (patellar tendon laxity). Ensure thorough dynamic warm-ups and avoid fatigued cutting maneuvers."
            )
        elif phase == "luteal":
            return (
                f"⚡ **Training Prescription for Luteal Phase (Day {day}):**\n\n"
                f"• **Target Intensity:** {effort}% 1RM (Controlled Effort).\n"
                "• **Athletic Focus:** Steady-state Zone 2 endurance, technical barbell drills, and hypertrophy circuits.\n"
                "• **Thermoregulation Alert:** Elevated progesterone increases core body temperature by 0.3°–0.5°C. Train in cool environments and extend rest intervals between sets."
            )
        else:  # Menstrual
            return (
                f"⚡ **Training Prescription for Menstrual Phase (Day {day}):**\n\n"
                f"• **Target Intensity:** {effort}% 1RM (Restorative Effort).\n"
                "• **Athletic Focus:** Low-impact pelvic mobility, walking, swimming, and light bodyweight circuits.\n"
                "• **Listen to Your Body:** If energy is high, moderate resistance is safe; if cramping is severe, prioritize active recovery."
            )

    elif intent == "recovery_soreness":
        return (
            f"🧘 **Recovery & Musculoskeletal Restoration (Day {day} {phase_title}):**\n\n"
            f"• **Suggested Recovery Window:** **{rec} hours** predicted by Model 3 before your next high-strain session.\n"
            "• **Muscular Regeneration:** Progesterone slows tissue remodeling in the luteal phase, while estrogen in the follicular phase accelerates it.\n"
            "• **Active Modalities:** 20 minutes of light Zone 1 walking or yoga stimulates lymphatic drainage and clears metabolic byproducts.\n"
            "• **Contrast Therapy:** A warm epsom salt bath followed by cool hydration supports parasympathetic tone and elevates HRV."
        )

    elif intent == "symptom_cramps":
        return (
            f"🌸 **Cramp Relief & Pelvic Comfort Protocol (Day {day}):**\n\n"
            "• **Inhibit Prostaglandins:** Menstrual cramps are caused by inflammatory prostaglandins contracting uterine smooth muscle. High-dose ginger (1g/day) or turmeric matches NSAID effectiveness with zero stomach irritation.\n"
            "• **Localized Heat Therapy:** Applying a heating pad (40°C) to the lower pelvis promotes local vasodilation and down-regulates nociceptive pain signals.\n"
            "• **Pelvic Postures:** Child’s pose, cat-cow, and reclining bound angle release tension in the pelvic floor and lower lumbar spine.\n"
            "• **Magnesium Bisglycinate:** 300–400mg at night relaxes smooth muscle fibers."
        )

    elif intent == "sleep_insomnia":
        return (
            f"🌙 **Sleep Optimization Architecture (Day {day} {phase_title}):**\n\n"
            "• **Hormonal Thermal Rhythm:** In the luteal phase, elevated progesterone raises core body temperature, often delaying sleep onset by 20–40 minutes.\n"
            "• **Cool Your Sleep Sanctuary:** Keep bedroom temperature at 18°–19°C (65°–67°F) to assist the natural nocturnal drop in core temperature.\n"
            "• **Sleep Hygiene Protocol:** Avoid high-glycemic snacks within 2 hours of bedtime; opt for chamomile or tart cherry juice (natural melatonin source).\n"
            "• **Recovery Target:** Aim for 8.0–8.5 hours of sleep to ensure complete deep (N3) and REM cycle completion."
        )

    elif intent == "hormone_phase_inquiry":
        return (
            f"🧭 **Your Biological Rhythm Status:**\n\n"
            f"You are currently estimated to be in your **{phase_title} Phase (Day {day})**.\n\n"
            "• **Follicular (Days ~6–13):** Estrogen rises; peak energy, mental sharpness, and strength capacity.\n"
            "• **Ovulatory (Days ~14–16):** Estrogen and LH peak; maximum neuromuscular drive and social confidence.\n"
            "• **Luteal (Days ~17–28):** Progesterone dominates; higher metabolic expenditure, calm focus, increased need for recovery.\n"
            "• **Menstrual (Days ~1–5):** Hormones reset to baseline; period flow, renewal, and restorative movement."
        )

    elif intent == "ovulation_fertility":
        return (
            f"✨ **Ovulation & Vitality Tracking (Day {day}):**\n\n"
            "• **Biological Indicators:** Ovulation typically occurs 24–36 hours following a Luteinizing Hormone (LH) surge, accompanied by clear, stretchy cervical mucus (egg-white consistency).\n"
            "• **Thermal Shift:** Basal body temperature jumps by ~0.3°C immediately *after* ovulation and remains elevated throughout the luteal phase.\n"
            "• **Athletic Peak:** The 48-hour window surrounding ovulation is biologically primed for strength and maximal velocity."
        )

    elif intent == "injury_laxity_prevention":
        return (
            f"🛡️ **Joint Stability & Injury Prevention (Day {day} {phase_title}):**\n\n"
            "• **Relaxin & Estrogen Dynamics:** Research shows female athletes experience a 2–3x higher rate of non-contact ACL and ankle sprains around late follicular and ovulatory phases due to increased joint laxity.\n"
            "• **Activation Routine:** Dedicate 10 minutes to glute medius activation (clamshells, banded lateral walks) and hamstring eccentrics prior to explosive cutting or lifting.\n"
            "• **Footwear & Technique:** Prioritize stable, flat-soled lifting shoes on heavy compound days and ensure knees track squarely over the second toe during landing."
        )

    return (
        f"🌟 **Athletic Health Insight for Day {day} ({phase_title}):**\n\n"
        f"Your body is operating in the {phase_title} phase with a target training effort of {effort}% and suggested recovery of {rec} hours. "
        "Keep syncing your workouts and nutrition to your natural hormonal rhythms!"
    )

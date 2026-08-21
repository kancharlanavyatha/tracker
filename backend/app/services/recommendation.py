"""Orchestrate phase → intensity → diet KB → workout templates."""

from __future__ import annotations

from datetime import datetime, timezone
from typing import Any
from uuid import UUID

from sqlalchemy.orm import Session

from app.schemas import PredictPhaseOut, RecommendOut
from app.services import diet_engine, intensity_model, ml_stub, phase_service, workout_planner


def _macro_rules(phase: str) -> dict[str, Any]:
    return {
        "menstrual": {
            "calorie_bias": "maintenance",
            "iron_priority": "high",
            "macros_hint": {"protein_pct": 22, "carb_pct": 48, "fat_pct": 30},
        },
        "follicular": {
            "calorie_bias": "slight_surplus_ok",
            "iron_priority": "moderate",
            "macros_hint": {"protein_pct": 22, "carb_pct": 50, "fat_pct": 28},
        },
        "ovulatory": {
            "calorie_bias": "maintenance",
            "iron_priority": "moderate",
            "macros_hint": {"protein_pct": 24, "carb_pct": 48, "fat_pct": 28},
        },
        "luteal": {
            "calorie_bias": "maintenance_pms_comfort",
            "magnesium_priority": "high",
            "macros_hint": {"protein_pct": 24, "carb_pct": 46, "fat_pct": 30},
        },
        "unknown": {
            "calorie_bias": "maintenance",
            "macros_hint": {"protein_pct": 22, "carb_pct": 48, "fat_pct": 30},
        },
    }.get(phase, {})


def _recovery_hours(phase: str, fatigue: float) -> int:
    base = {"menstrual": 14, "follicular": 10, "ovulatory": 9, "luteal": 12, "unknown": 12}
    h = base.get(phase, 12)
    if fatigue >= 8:
        h += 2
    if fatigue <= 4:
        h = max(8, h - 1)
    return h


def _focus_key(phase: str, score: int) -> str:
    if phase == "menstrual":
        return "recovery_low_intensity"
    if phase == "follicular":
        return "progressive_overload" if score >= 70 else "controlled_progression"
    if phase == "ovulatory":
        return "skill_power_peaks" if score >= 78 else "mixed_strength_endurance"
    if phase == "luteal":
        return "aerobic_stability"
    return "balanced_moderate"


def build_recommendation(db: Session, user_id: UUID) -> tuple[RecommendOut, PredictPhaseOut]:
    ref = datetime.now(timezone.utc).date()
    last = ml_stub.last_period_start(db, user_id)
    phase_out = phase_service.infer_phase(db, user_id, last, ref)
    ctx = ml_stub.recent_context(db, user_id)

    w = ctx.get("wearable") or {}
    syms = ctx.get("symptoms") or []
    latest = syms[0] if syms else {}
    fatigue = float(latest.get("fatigue") or 5)
    mood = float(latest.get("mood") or 6)

    feats = {
        "hrv_ms": float(w.get("hrv_ms") or 42.0),
        "spo2_pct": float(w.get("spo2_pct") or 97.0),
        "resting_hr": float(w.get("resting_hr") or 62.0),
        "fatigue": fatigue,
        "mood": mood,
    }

    intensity, int_note = intensity_model.predict_intensity(feats, phase_out.phase)
    recovery = _recovery_hours(phase_out.phase, fatigue)
    focus = _focus_key(phase_out.phase, intensity)
    macros = _macro_rules(phase_out.phase)
    dietary = diet_engine.build_dietary_bundle(phase_out.phase, macros)
    sessions = workout_planner.build_sessions(phase_out.phase, intensity, recovery)

    note = (
        f"Intensity via {int_note}; diet merged with KB; workouts templated. "
        "Replace regressor with XGBoost when training data is ready."
    )

    out = RecommendOut(
        training_intensity_score=intensity,
        recovery_hours_suggested=recovery,
        focus=focus,
        dietary=dietary,
        workout_sessions=sessions,
        hydration_liters=float(dietary.get("hydration_liters") or 2.5),
        micronutrients=list(dietary.get("micronutrients") or []),
        intensity_source=int_note,
        model_note=note,
    )
    return out, phase_out

"""
Model 3 Service: Endocrine Recovery Kinetics & Metabolic Strain Predictor.
Loads trained XGBoost model from backend/artifacts/recovery_model.joblib.
Falls back safely to physiological heuristic if artifact is not found.
"""

from __future__ import annotations

from pathlib import Path
from typing import Any

import numpy as np

from app.config import settings

_FEATURE_NAMES = [
    "p_menstrual",
    "p_follicular",
    "p_ovulatory",
    "p_luteal",
    "p_unknown",
    "training_intensity_score",
    "hrv_ms",
    "resting_hr",
    "spo2_pct",
    "fatigue",
    "mood",
    "sleep_hours",
    "body_weight_kg",
]


def _artifact_path() -> Path:
    return settings.artifacts_dir / "recovery_model.joblib"


def _vectorize(
    phase: str,
    intensity_score: int,
    biometrics: dict[str, float],
    fatigue: float,
    mood: float,
    sleep_hours: float = 7.5,
    body_weight_kg: float = 62.0,
) -> np.ndarray:
    phases = ["menstrual", "follicular", "ovulatory", "luteal", "unknown"]
    oh = [1.0 if phase == p else 0.0 for p in phases]
    tail = [
        float(intensity_score),
        float(biometrics.get("hrv_ms", 45.0)),
        float(biometrics.get("resting_hr", 60.0)),
        float(biometrics.get("spo2_pct", 98.0)),
        float(fatigue),
        float(mood),
        float(sleep_hours),
        float(body_weight_kg),
    ]
    return np.array([oh + tail], dtype=np.float32)


def predict_recovery_and_metabolics(
    phase: str,
    intensity_score: int,
    biometrics: dict[str, float],
    fatigue: float,
    mood: float,
    sleep_hours: float = 7.5,
    body_weight_kg: float = 62.0,
) -> tuple[int, dict[str, float], str]:
    """
    Predict optimal recovery window (hours) and dynamic metabolic targets.
    Returns: (recovery_hours, metabolic_dict, source_note)
    """
    path = _artifact_path()
    if not path.exists():
        return _rules_fallback(phase, intensity_score, fatigue)

    try:
        import joblib

        bundle = joblib.load(path)
        rec_model = bundle["recovery_model"]
        meta_model = bundle.get("metabolic_model")
        names = bundle.get("feature_names", [])

        if names != _FEATURE_NAMES:
            return _rules_fallback(phase, intensity_score, fatigue)

        vec = _vectorize(phase, intensity_score, biometrics, fatigue, mood, sleep_hours, body_weight_kg)

        # 1. Recovery Hours
        raw_rec = float(rec_model.predict(vec)[0])
        recovery_hours = int(round(max(8.0, min(48.0, raw_rec))))

        # 2. Metabolic Partitions
        metabolics = {}
        if meta_model is not None:
            raw_meta = meta_model.predict(vec)[0]
            metabolics = {
                "tdee_kcal": round(float(raw_meta[0]), 1),
                "protein_target_g": round(float(raw_meta[1]), 1),
                "carbs_target_g": round(float(raw_meta[2]), 1),
            }

        return recovery_hours, metabolics, "Endocrine Recovery Kinetics Engine (XGBoost Model 3)"
    except Exception:
        return _rules_fallback(phase, intensity_score, fatigue)


def _rules_fallback(phase: str, intensity_score: int, fatigue: float) -> tuple[int, dict[str, float], str]:
    base = {"menstrual": 14, "follicular": 10, "ovulatory": 9, "luteal": 12, "unknown": 12}
    h = base.get(phase, 12)
    if fatigue >= 8:
        h += 2
    if fatigue <= 4:
        h = max(8, h - 1)
    if intensity_score >= 80:
        h += 2

    # Baseline metabolic estimation
    luteal_boost = 180.0 if phase == "luteal" else 0.0
    tdee = 2000.0 + luteal_boost + (intensity_score - 50) * 8.0
    metabolics = {
        "tdee_kcal": round(tdee, 1),
        "protein_target_g": 95.0,
        "carbs_target_g": 260.0,
    }
    return h, metabolics, "Heuristic Baseline Fallback"

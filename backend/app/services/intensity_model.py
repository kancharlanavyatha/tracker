"""Optional sklearn regressor for intensity; falls back to rule table."""

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
    "hrv_ms",
    "spo2_pct",
    "resting_hr",
    "fatigue",
    "mood",
]


def _artifact_path() -> Path:
    return settings.artifacts_dir / "intensity_xgb.joblib"


def _vectorize(phase: str, features: dict[str, float]) -> np.ndarray:
    phases = ["menstrual", "follicular", "ovulatory", "luteal", "unknown"]
    oh = [1.0 if phase == p else 0.0 for p in phases]
    tail = [
        float(features.get("hrv_ms", 42.0)),
        float(features.get("spo2_pct", 97.0)),
        float(features.get("resting_hr", 62.0)),
        float(features.get("fatigue", 5.0)),
        float(features.get("mood", 6.0)),
    ]
    return np.array([oh + tail], dtype=np.float64)


def predict_intensity(features: dict[str, float], phase: str) -> tuple[int, str]:
    path = _artifact_path()
    if not path.exists():
        return _rules_fallback(phase, features)

    try:
        import joblib

        bundle = joblib.load(path)
        model = bundle["model"]
        names: list[str] = bundle["feature_names"]
        if names != _FEATURE_NAMES:
            return _rules_fallback(phase, features)
        vec = _vectorize(phase, features)
        raw = float(model.predict(vec)[0])
        score = int(round(max(30.0, min(95.0, raw))))
        return score, "Cycle Biometric Engine"
    except Exception:
        return _rules_fallback(phase, features)


def _rules_fallback(phase: str, features: dict[str, float]) -> tuple[int, str]:
    base = {"menstrual": 45, "follicular": 72, "ovulatory": 82, "luteal": 58, "unknown": 55}
    score = base.get(phase, 55)
    fatigue = float(features.get("fatigue", 5.0))
    hrv = float(features.get("hrv_ms", 42.0))
    score -= int(max(0.0, fatigue - 6.0) * 3.0)
    score += int(max(0.0, hrv - 45.0) * 0.8)
    score = int(max(30, min(92, score)))
    return score, "Biometric Recovery Engine"


def feature_names() -> list[str]:
    return list(_FEATURE_NAMES)

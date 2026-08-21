"""Phase + intensity → structured micro-cycle (rules until XGBoost supplies targets)."""

from __future__ import annotations

from typing import Any


def build_sessions(phase: str, intensity_score: int, recovery_hours: int) -> list[dict[str, Any]]:
    base = _templates(phase, intensity_score)
    for s in base:
        s["recovery_hours_hint"] = recovery_hours
    return base


def _templates(phase: str, score: int) -> list[dict[str, Any]]:
    easy = score < 55
    mod = 55 <= score < 75
    hard = score >= 75

    if phase == "menstrual":
        return [
            {"day": "A", "type": "mobility", "minutes": 25, "rpe_cap": 4, "notes": "Hip + thoracic flow"},
            {"day": "B", "type": "light_aerobic", "minutes": 30 if easy else 35, "rpe_cap": 5, "notes": "Walk or easy bike"},
            {"day": "C", "type": "rest", "minutes": 0, "rpe_cap": 0, "notes": "Sleep + protein emphasis"},
        ]
    if phase == "follicular":
        if hard:
            return [
                {"day": "A", "type": "strength", "minutes": 50, "rpe_cap": 8, "notes": "Compound lifts, progressive load"},
                {"day": "B", "type": "intervals", "minutes": 35, "rpe_cap": 8, "notes": "Short VO2 blocks"},
                {"day": "C", "type": "aerobic", "minutes": 45, "rpe_cap": 6, "notes": "Zone 2 steady"},
            ]
        return [
            {"day": "A", "type": "strength", "minutes": 40, "rpe_cap": 7, "notes": "Technique priority"},
            {"day": "B", "type": "tempo", "minutes": 30, "rpe_cap": 7, "notes": "Controlled efforts"},
            {"day": "C", "type": "aerobic", "minutes": 40, "rpe_cap": 6, "notes": "Zone 2"},
        ]
    if phase == "ovulatory":
        if mod or hard:
            return [
                {"day": "A", "type": "power", "minutes": 35, "rpe_cap": 8, "notes": "Jumps / sprints low volume"},
                {"day": "B", "type": "strength", "minutes": 45, "rpe_cap": 8, "notes": "Speed-strength"},
                {"day": "C", "type": "skill", "minutes": 40, "rpe_cap": 6, "notes": "Coordination + core"},
            ]
        return [
            {"day": "A", "type": "strength", "minutes": 40, "rpe_cap": 7, "notes": "Moderate loads"},
            {"day": "B", "type": "mixed", "minutes": 35, "rpe_cap": 7, "notes": "Circuit style"},
            {"day": "C", "type": "aerobic", "minutes": 35, "rpe_cap": 6, "notes": "Easy steady"},
        ]
    if phase == "luteal":
        return [
            {"day": "A", "type": "aerobic", "minutes": 40 if mod else 35, "rpe_cap": 6, "notes": "Zone 2 dominant"},
            {"day": "B", "type": "strength", "minutes": 35, "rpe_cap": 7 if not easy else 6, "notes": "Reduce eccentric volume if fatigued"},
            {"day": "C", "type": "recovery", "minutes": 25, "rpe_cap": 4, "notes": "Yoga / walking"},
        ]
    return [
        {"day": "A", "type": "mixed", "minutes": 35, "rpe_cap": 6, "notes": "Log cycle data for personalization"},
        {"day": "B", "type": "aerobic", "minutes": 30, "rpe_cap": 6, "notes": "Easy steady"},
        {"day": "C", "type": "rest", "minutes": 0, "rpe_cap": 0, "notes": "Deload until data improves"},
    ]

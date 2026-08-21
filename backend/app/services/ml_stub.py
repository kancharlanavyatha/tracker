"""Placeholder helpers: DB reads, context bundle, persistence."""

from __future__ import annotations

from datetime import date
from uuid import UUID

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models import CycleEntry, Recommendation, SymptomLog, WearableSignal


def last_period_start(db: Session, user_id: UUID) -> date | None:
    q = (
        select(CycleEntry.period_start)
        .where(CycleEntry.user_id == user_id)
        .order_by(CycleEntry.period_start.desc())
        .limit(1)
    )
    return db.execute(q).scalar_one_or_none()


def persist_recommendation(db: Session, user_id: UUID, payload: dict) -> None:
    rec = Recommendation(user_id=user_id, kind="training_diet_bundle", payload=payload)
    db.add(rec)
    db.commit()


def recent_context(db: Session, user_id: UUID) -> dict:
    sym = (
        db.execute(
            select(SymptomLog)
            .where(SymptomLog.user_id == user_id)
            .order_by(SymptomLog.log_date.desc())
            .limit(5)
        )
        .scalars()
        .all()
    )
    w = (
        db.execute(
            select(WearableSignal)
            .where(WearableSignal.user_id == user_id)
            .order_by(WearableSignal.recorded_at.desc())
            .limit(1)
        )
        .scalars()
        .first()
    )
    return {
        "symptoms": [
            {
                "log_date": s.log_date.isoformat(),
                "mood": s.mood,
                "fatigue": s.fatigue,
                "symptoms": s.symptoms,
            }
            for s in sym
        ],
        "wearable": _wearable_dict(w),
    }


def _wearable_dict(w: WearableSignal | None) -> dict | None:
    if w is None:
        return None
    return {
        "recorded_at": w.recorded_at.isoformat(),
        "hrv_ms": w.hrv_ms,
        "skin_temp_c": w.skin_temp_c,
        "spo2_pct": w.spo2_pct,
        "resting_hr": w.resting_hr,
        "steps": w.steps,
        "workout_type": w.workout_type,
    }

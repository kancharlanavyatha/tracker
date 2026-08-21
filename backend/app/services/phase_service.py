"""Calendar-based phase estimation with data-driven cycle length (LSTM hook later)."""

from __future__ import annotations

import statistics
from datetime import date
from uuid import UUID

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models import CycleEntry
from app.schemas import PredictPhaseOut

DEFAULT_CYCLE = 28


def _ordered_period_starts(db: Session, user_id: UUID) -> list[date]:
    q = (
        select(CycleEntry.period_start)
        .where(CycleEntry.user_id == user_id)
        .order_by(CycleEntry.period_start.asc())
    )
    return list(db.execute(q).scalars().all())


def median_cycle_length(db: Session, user_id: UUID) -> int:
    starts = _ordered_period_starts(db, user_id)
    if len(starts) < 2:
        return DEFAULT_CYCLE
    deltas = [(starts[i] - starts[i - 1]).days for i in range(1, len(starts)) if (starts[i] - starts[i - 1]).days > 0]
    if not deltas:
        return DEFAULT_CYCLE
    m = int(round(statistics.median(deltas)))
    return max(22, min(m, 45))


def _irregularity_score(db: Session, user_id: UUID) -> float:
    starts = _ordered_period_starts(db, user_id)
    if len(starts) < 3:
        return 0.25
    deltas = [(starts[i] - starts[i - 1]).days for i in range(1, len(starts)) if (starts[i] - starts[i - 1]).days > 0]
    if len(deltas) < 2:
        return 0.3
    mean_d = statistics.mean(deltas)
    if mean_d <= 0:
        return 0.5
    try:
        cv = statistics.pstdev(deltas) / mean_d
    except statistics.StatisticsError:
        return 0.35
    return round(min(1.0, max(0.05, cv)), 2)


def _phase_from_day(day_in_cycle: int, cycle_len: int) -> str:
    m_end = max(1, round(5 * cycle_len / DEFAULT_CYCLE))
    f_end = max(m_end + 1, round(13 * cycle_len / DEFAULT_CYCLE))
    o_end = max(f_end + 1, round(16 * cycle_len / DEFAULT_CYCLE))
    if day_in_cycle <= m_end:
        return "menstrual"
    if day_in_cycle <= f_end:
        return "follicular"
    if day_in_cycle <= o_end:
        return "ovulatory"
    return "luteal"


def infer_phase(
    db: Session,
    user_id: UUID,
    last_period_start: date | None,
    ref: date,
) -> PredictPhaseOut:
    if last_period_start is None:
        return PredictPhaseOut(
            phase="unknown",
            day_in_cycle=0,
            cycle_length_assumed=DEFAULT_CYCLE,
            irregularity_hint=1.0,
            model_note="No cycle history yet. Add period start dates; LSTM may refine later.",
        )
    if last_period_start > ref:
        return PredictPhaseOut(
            phase="unknown",
            day_in_cycle=0,
            cycle_length_assumed=median_cycle_length(db, user_id),
            irregularity_hint=0.5,
            model_note="Inconsistent dates (last period start after reference date).",
        )

    cycle_len = median_cycle_length(db, user_id)
    days_since = (ref - last_period_start).days
    if days_since < 0:
        return PredictPhaseOut(
            phase="unknown",
            day_in_cycle=0,
            cycle_length_assumed=cycle_len,
            irregularity_hint=0.5,
            model_note="Negative day offset; check logged dates.",
        )

    day_in_cycle = (days_since % cycle_len) + 1
    phase = _phase_from_day(day_in_cycle, cycle_len)
    irr = _irregularity_score(db, user_id)

    return PredictPhaseOut(
        phase=phase,
        day_in_cycle=day_in_cycle,
        cycle_length_assumed=cycle_len,
        irregularity_hint=irr,
        model_note="Median cycle length from history + proportional phase map. Swap for LSTM on sequences.",
    )

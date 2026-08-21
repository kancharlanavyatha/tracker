from collections import defaultdict

from datetime import date, datetime, timedelta, timezone

from uuid import UUID



from fastapi import APIRouter, Depends, HTTPException

from sqlalchemy import select

from sqlalchemy.orm import Session



from app.database import get_db

from app.models import CycleEntry, SymptomLog, User, WearableSignal

from app.schemas import AnalyticsCyclesOut, AnalyticsSymptomsOut, AnalyticsWearableOut



router = APIRouter(prefix="/analytics", tags=["analytics"])





@router.get("/{user_id}/cycles", response_model=AnalyticsCyclesOut)

def analytics_cycles(user_id: UUID, db: Session = Depends(get_db)) -> AnalyticsCyclesOut:

    if db.get(User, user_id) is None:

        raise HTTPException(status_code=404, detail="User not found")

    rows = (

        db.execute(

            select(CycleEntry.period_start)

            .where(CycleEntry.user_id == user_id)

            .order_by(CycleEntry.period_start.asc())

        )

        .scalars()

        .all()

    )

    lengths: list[int] = []

    for i in range(1, len(rows)):

        d = (rows[i] - rows[i - 1]).days

        if d > 0:

            lengths.append(d)

    return AnalyticsCyclesOut(period_starts=list(rows), inferred_cycle_lengths=lengths)





@router.get("/{user_id}/symptoms", response_model=AnalyticsSymptomsOut)

def analytics_symptoms(user_id: UUID, limit: int = 40, db: Session = Depends(get_db)) -> AnalyticsSymptomsOut:

    if db.get(User, user_id) is None:

        raise HTTPException(status_code=404, detail="User not found")

    lim = min(max(limit, 5), 120)

    rows = (

        db.execute(

            select(SymptomLog)

            .where(SymptomLog.user_id == user_id)

            .order_by(SymptomLog.log_date.desc())

            .limit(lim)

        )

        .scalars()

        .all()

    )

    points = [

        {

            "log_date": r.log_date.isoformat(),

            "mood": r.mood,

            "fatigue": r.fatigue,

        }

        for r in reversed(rows)

    ]

    return AnalyticsSymptomsOut(points=points)





@router.get("/{user_id}/wearables", response_model=AnalyticsWearableOut)

def analytics_wearables(user_id: UUID, days: int = 14, db: Session = Depends(get_db)) -> AnalyticsWearableOut:

    if db.get(User, user_id) is None:

        raise HTTPException(status_code=404, detail="User not found")

    d = min(max(days, 1), 60)

    since = datetime.now(timezone.utc) - timedelta(days=d)

    rows = (

        db.execute(

            select(WearableSignal)

            .where(WearableSignal.user_id == user_id, WearableSignal.recorded_at >= since)

            .order_by(WearableSignal.recorded_at.asc())

        )

        .scalars()

        .all()

    )

    buckets: dict[date, list[tuple[float | None, float | None]]] = defaultdict(list)

    for r in rows:

        day = r.recorded_at.astimezone(timezone.utc).date()

        buckets[day].append((r.hrv_ms, r.resting_hr))



    daily: list[dict] = []

    for day in sorted(buckets.keys()):

        vals = buckets[day]

        hrvs = [v[0] for v in vals if v[0] is not None]

        hrs = [v[1] for v in vals if v[1] is not None]

        daily.append(

            {

                "date": day.isoformat(),

                "samples": len(vals),

                "avg_hrv_ms": round(sum(hrvs) / len(hrvs), 2) if hrvs else None,

                "avg_resting_hr": round(sum(hrs) / len(hrs), 2) if hrs else None,

            }

        )

    return AnalyticsWearableOut(daily=daily)


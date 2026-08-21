from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import User, WearableSignal
from app.schemas import WearableSyncIn, WearableSyncOut

router = APIRouter(tags=["wearables"])


@router.post("/wearable-sync", response_model=WearableSyncOut)
def wearable_sync(body: WearableSyncIn, db: Session = Depends(get_db)) -> WearableSyncOut:
    if db.get(User, body.user_id) is None:
        raise HTTPException(status_code=404, detail="User not found")
    n = 0
    for p in body.points:
        row = WearableSignal(
            user_id=body.user_id,
            recorded_at=p.recorded_at,
            hrv_ms=p.hrv_ms,
            skin_temp_c=p.skin_temp_c,
            spo2_pct=p.spo2_pct,
            resting_hr=p.resting_hr,
            steps=p.steps,
            workout_type=p.workout_type,
            raw=p.raw,
        )
        db.add(row)
        n += 1
    db.commit()
    return WearableSyncOut(inserted=n)

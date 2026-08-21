from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import CycleEntry, User
from app.schemas import CycleCreate, CycleOut

router = APIRouter(prefix="/cycles", tags=["cycles"])


@router.post("/", response_model=CycleOut)
def add_cycle(body: CycleCreate, db: Session = Depends(get_db)) -> CycleEntry:
    if db.get(User, body.user_id) is None:
        raise HTTPException(status_code=404, detail="User not found")
    entry = CycleEntry(
        user_id=body.user_id,
        period_start=body.period_start,
        period_end=body.period_end,
        flow_intensity=body.flow_intensity,
        notes=body.notes,
    )
    db.add(entry)
    db.commit()
    db.refresh(entry)
    return entry


@router.get("/recent", response_model=list[CycleOut])
def recent_cycles(user_id: UUID = Query(...), limit: int = 6, db: Session = Depends(get_db)) -> list[CycleEntry]:
    q = (
        select(CycleEntry)
        .where(CycleEntry.user_id == user_id)
        .order_by(CycleEntry.period_start.desc())
        .limit(min(limit, 24))
    )
    return list(db.execute(q).scalars().all())

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import SymptomLog, User
from app.schemas import SymptomLogCreate, SymptomLogOut

router = APIRouter(prefix="/symptom-logs", tags=["symptoms"])


@router.post("/", response_model=SymptomLogOut)
def log_symptoms(body: SymptomLogCreate, db: Session = Depends(get_db)) -> SymptomLog:
    if db.get(User, body.user_id) is None:
        raise HTTPException(status_code=404, detail="User not found")
    row = SymptomLog(
        user_id=body.user_id,
        log_date=body.log_date,
        mood=body.mood,
        fatigue=body.fatigue,
        symptoms=body.symptoms,
    )
    db.add(row)
    db.commit()
    db.refresh(row)
    return row

from datetime import datetime, timezone

from uuid import UUID



from fastapi import APIRouter, Depends, HTTPException

from sqlalchemy import func, select

from sqlalchemy.orm import Session



from app.database import get_db

from app.models import CycleEntry, Notification, Recommendation, User

from app.schemas import CycleOut, DashboardOut, UserOut

from app.services import ml_stub, phase_service



router = APIRouter(tags=["dashboard"])





@router.get("/dashboard/{user_id}", response_model=DashboardOut)

def dashboard(user_id: UUID, db: Session = Depends(get_db)) -> DashboardOut:

    user = db.get(User, user_id)

    if user is None:

        raise HTTPException(status_code=404, detail="User not found")



    last_cycle = (

        db.execute(

            select(CycleEntry)

            .where(CycleEntry.user_id == user_id)

            .order_by(CycleEntry.period_start.desc())

            .limit(1)

        )

        .scalars()

        .first()

    )



    ctx = ml_stub.recent_context(db, user_id)

    ref = datetime.now(timezone.utc).date()

    last_start = ml_stub.last_period_start(db, user_id)

    phase = phase_service.infer_phase(db, user_id, last_start, ref)



    last_rec = (

        db.execute(

            select(Recommendation)

            .where(Recommendation.user_id == user_id)

            .order_by(Recommendation.created_at.desc())

            .limit(1)

        )

        .scalars()

        .first()

    )



    unread = db.execute(

        select(func.count(Notification.id)).where(

            Notification.user_id == user_id,

            Notification.is_read.is_(False),

        )

    ).scalar_one()

    recent_rows = (

        db.execute(

            select(Notification)

            .where(Notification.user_id == user_id)

            .order_by(Notification.created_at.desc())

            .limit(6)

        )

        .scalars()

        .all()

    )

    recent_notifications = [

        {

            "id": str(n.id),

            "kind": n.kind,

            "title": n.title,

            "body": n.body,

            "is_read": n.is_read,

            "created_at": n.created_at.isoformat(),

        }

        for n in recent_rows

    ]



    return DashboardOut(

        user=UserOut.model_validate(user),

        last_cycle=CycleOut.model_validate(last_cycle) if last_cycle else None,

        recent_symptoms=ctx["symptoms"],

        latest_wearable=ctx["wearable"],

        latest_phase=phase,

        latest_recommendation=last_rec.payload if last_rec else None,

        unread_notification_count=int(unread),

        recent_notifications=recent_notifications,

    )


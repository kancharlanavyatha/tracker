from uuid import UUID



from fastapi import APIRouter, Depends, HTTPException, Query

from sqlalchemy import select

from sqlalchemy.orm import Session



from app.database import get_db

from app.models import Notification, User

from app.schemas import NotificationOut, NotificationPatch



router = APIRouter(prefix="/notifications", tags=["notifications"])





@router.get("", response_model=list[NotificationOut])

def list_notifications(

    user_id: UUID = Query(...),

    unread_only: bool = False,

    limit: int = 30,

    db: Session = Depends(get_db),

) -> list[Notification]:

    if db.get(User, user_id) is None:

        raise HTTPException(status_code=404, detail="User not found")

    lim = min(max(limit, 1), 100)

    q = select(Notification).where(Notification.user_id == user_id)

    if unread_only:

        q = q.where(Notification.is_read.is_(False))

    q = q.order_by(Notification.created_at.desc()).limit(lim)

    return list(db.execute(q).scalars().all())





@router.patch("/{notification_id}", response_model=NotificationOut)

def patch_notification(

    notification_id: UUID,

    body: NotificationPatch,

    user_id: UUID = Query(...),

    db: Session = Depends(get_db),

) -> Notification:

    if db.get(User, user_id) is None:

        raise HTTPException(status_code=404, detail="User not found")

    n = db.get(Notification, notification_id)

    if n is None or n.user_id != user_id:

        raise HTTPException(status_code=404, detail="Notification not found")

    n.is_read = body.is_read

    db.commit()

    db.refresh(n)

    return n


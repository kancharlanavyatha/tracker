from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import CalendarReminder, User
from app.schemas import (
    CalendarReminderCreate,
    CalendarReminderOut,
    UserCreate,
    UserOut,
    UserPreferencesUpdate,
    UserProfileUpdate,
)

router = APIRouter(prefix="/users", tags=["users"])


@router.post("/", response_model=UserOut)
def register_user(body: UserCreate, db: Session = Depends(get_db)) -> User:
    exists = db.execute(select(User).where(User.email == body.email)).scalar_one_or_none()
    if exists:
        raise HTTPException(status_code=409, detail="Email already registered")
    user = User(email=body.email, display_name=body.display_name)
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


@router.get("/{user_id}", response_model=UserOut)
def get_user(user_id: str, db: Session = Depends(get_db)) -> User:
    try:
        uid = UUID(user_id)
    except ValueError as e:
        raise HTTPException(status_code=400, detail="Invalid user id") from e
    user = db.get(User, uid)
    if user is None:
        raise HTTPException(status_code=404, detail="User not found")
    return user


@router.patch("/{user_id}/profile", response_model=UserOut)
def update_user_profile(user_id: str, body: UserProfileUpdate, db: Session = Depends(get_db)) -> User:
    try:
        uid = UUID(user_id)
    except ValueError as e:
        raise HTTPException(status_code=400, detail="Invalid user id") from e
    user = db.get(User, uid)
    if user is None:
        raise HTTPException(status_code=404, detail="User not found")

    if body.display_name is not None:
        user.display_name = body.display_name
    if body.age is not None:
        user.age = body.age
    if body.height_cm is not None:
        user.height_cm = body.height_cm
    if body.weight_kg is not None:
        user.weight_kg = body.weight_kg
    if body.training_level is not None:
        user.training_level = body.training_level
    if body.cycle_goal is not None:
        user.cycle_goal = body.cycle_goal

    db.commit()
    db.refresh(user)
    return user


@router.patch("/{user_id}/preferences", response_model=UserOut)
def update_user_preferences(user_id: str, body: UserPreferencesUpdate, db: Session = Depends(get_db)) -> User:
    try:
        uid = UUID(user_id)
    except ValueError as e:
        raise HTTPException(status_code=400, detail="Invalid user id") from e
    user = db.get(User, uid)
    if user is None:
        raise HTTPException(status_code=404, detail="User not found")

    if body.dietary_pref is not None:
        user.dietary_pref = body.dietary_pref
    if body.allergies is not None:
        user.allergies = body.allergies
    if body.favorite_cuisines is not None:
        user.favorite_cuisines = body.favorite_cuisines
    if body.streak_days is not None:
        user.streak_days = body.streak_days
    if body.last_active_date is not None:
        user.last_active_date = body.last_active_date

    db.commit()
    db.refresh(user)
    return user


@router.get("/{user_id}/reminders", response_model=list[CalendarReminderOut])
def get_user_reminders(user_id: str, db: Session = Depends(get_db)) -> list[CalendarReminder]:
    try:
        uid = UUID(user_id)
    except ValueError as e:
        raise HTTPException(status_code=400, detail="Invalid user id") from e
    reminders = db.execute(
        select(CalendarReminder)
        .where(CalendarReminder.user_id == uid)
        .order_by(CalendarReminder.reminder_date.asc(), CalendarReminder.created_at.asc())
    ).scalars().all()
    return list(reminders)


@router.post("/{user_id}/reminders", response_model=CalendarReminderOut)
def create_user_reminder(user_id: str, body: CalendarReminderCreate, db: Session = Depends(get_db)) -> CalendarReminder:
    try:
        uid = UUID(user_id)
    except ValueError as e:
        raise HTTPException(status_code=400, detail="Invalid user id") from e
    user = db.get(User, uid)
    if user is None:
        raise HTTPException(status_code=404, detail="User not found")

    reminder = CalendarReminder(
        user_id=uid,
        reminder_date=body.reminder_date,
        title=body.title,
        category=body.category or "general",
        is_completed=body.is_completed,
    )
    db.add(reminder)
    db.commit()
    db.refresh(reminder)
    return reminder


@router.patch("/{user_id}/reminders/{reminder_id}/toggle", response_model=CalendarReminderOut)
def toggle_user_reminder(user_id: str, reminder_id: str, db: Session = Depends(get_db)) -> CalendarReminder:
    try:
        uid = UUID(user_id)
        rid = UUID(reminder_id)
    except ValueError as e:
        raise HTTPException(status_code=400, detail="Invalid id") from e

    reminder = db.get(CalendarReminder, rid)
    if reminder is None or reminder.user_id != uid:
        raise HTTPException(status_code=404, detail="Reminder not found")

    reminder.is_completed = not reminder.is_completed
    db.commit()
    db.refresh(reminder)
    return reminder


@router.delete("/{user_id}/reminders/{reminder_id}")
def delete_user_reminder(user_id: str, reminder_id: str, db: Session = Depends(get_db)) -> dict:
    try:
        uid = UUID(user_id)
        rid = UUID(reminder_id)
    except ValueError as e:
        raise HTTPException(status_code=400, detail="Invalid id") from e

    reminder = db.get(CalendarReminder, rid)
    if reminder is None or reminder.user_id != uid:
        raise HTTPException(status_code=404, detail="Reminder not found")

    db.delete(reminder)
    db.commit()
    return {"status": "success", "deleted_id": str(rid)}


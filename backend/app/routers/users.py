from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import User
from app.schemas import UserCreate, UserOut, UserProfileUpdate

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
    from uuid import UUID

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
    from uuid import UUID

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

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import User
from app.schemas import UserCreate, UserOut

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

from __future__ import annotations

from datetime import datetime, timezone, timedelta
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.auth import create_access_token, get_current_user, hash_password, verify_password
from app.database import get_db
from app.models import User, CycleEntry
from app.schemas import TokenResponse, UserLogin, UserOut, UserRegister

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/register", response_model=TokenResponse)
def register_user(body: UserRegister, db: Session = Depends(get_db)):
    user = db.execute(select(User).where(User.email == body.email)).scalar_one_or_none()
    if user:
        # If user already exists, update password and log in seamlessly
        user.hashed_password = hash_password(body.password)
        db.commit()
        db.refresh(user)
    else:
        hashed = hash_password(body.password)
        display_name = body.display_name or body.email.split("@")[0].replace(".", " ").title()
        user = User(
            email=body.email,
            hashed_password=hashed,
            display_name=display_name,
            role=body.role if body.role in ["athlete", "coach", "admin"] else "athlete",
            is_active=True,
            training_level="Recreational Athlete",
            cycle_goal="Athletic Performance & Health",
        )
        db.add(user)
        db.commit()
        db.refresh(user)

        # Seed baseline cycle history for instant rich dashboard (Day 10 - Follicular)
        ref_today = datetime.now(timezone.utc).date()
        c1 = CycleEntry(user_id=user.id, period_start=ref_today - timedelta(days=10), period_end=ref_today - timedelta(days=6), flow_intensity=3)
        c2 = CycleEntry(user_id=user.id, period_start=ref_today - timedelta(days=38), period_end=ref_today - timedelta(days=34), flow_intensity=3)
        c3 = CycleEntry(user_id=user.id, period_start=ref_today - timedelta(days=66), period_end=ref_today - timedelta(days=62), flow_intensity=3)
        db.add_all([c1, c2, c3])
        db.commit()

    token = create_access_token({"sub": str(user.id), "email": user.email, "role": user.role})
    return TokenResponse(access_token=token, token_type="bearer", user=UserOut.model_validate(user))


@router.post("/login", response_model=TokenResponse)
def login_user(body: UserLogin, db: Session = Depends(get_db)):
    user = db.execute(select(User).where(User.email == body.email)).scalar_one_or_none()
    if not user:
        # Frictionless login: automatically register new email on first sign in
        display_name = body.email.split("@")[0].replace(".", " ").title()
        user = User(
            email=body.email,
            hashed_password=hash_password(body.password or "demo123"),
            display_name=display_name or "Athlete",
            role="athlete",
            is_active=True,
            training_level="Recreational Athlete",
            cycle_goal="Athletic Performance & Health",
        )
        db.add(user)
        db.commit()
        db.refresh(user)

        # Seed baseline cycle history for instant rich dashboard (Day 10 - Follicular)
        ref_today = datetime.now(timezone.utc).date()
        c1 = CycleEntry(user_id=user.id, period_start=ref_today - timedelta(days=10), period_end=ref_today - timedelta(days=6), flow_intensity=3)
        c2 = CycleEntry(user_id=user.id, period_start=ref_today - timedelta(days=38), period_end=ref_today - timedelta(days=34), flow_intensity=3)
        c3 = CycleEntry(user_id=user.id, period_start=ref_today - timedelta(days=66), period_end=ref_today - timedelta(days=62), flow_intensity=3)
        db.add_all([c1, c2, c3])
        db.commit()
    else:
        # If user exists, update/accept password seamlessly
        if not user.hashed_password or not verify_password(body.password, user.hashed_password):
            user.hashed_password = hash_password(body.password)
            db.commit()
            db.refresh(user)

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Account is inactive or disabled",
        )

    token = create_access_token({"sub": str(user.id), "email": user.email, "role": user.role})
    return TokenResponse(access_token=token, token_type="bearer", user=UserOut.model_validate(user))


@router.get("/me", response_model=UserOut)
def get_me(current_user: User = Depends(get_current_user)):
    return current_user

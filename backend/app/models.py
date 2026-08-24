import uuid

from datetime import date, datetime, timezone





def utcnow() -> datetime:

    return datetime.now(timezone.utc)





from sqlalchemy import Boolean, ForeignKey, JSON, Date, DateTime, Float, Integer, String, Text, UUID

from sqlalchemy.orm import Mapped, mapped_column, relationship



from app.database import Base





def _uuid() -> uuid.UUID:

    return uuid.uuid4()





class User(Base):

    __tablename__ = "users"



    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=_uuid)

    email: Mapped[str] = mapped_column(String(255), unique=True, index=True)

    display_name: Mapped[str | None] = mapped_column(String(120), nullable=True)

    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow)



    cycle_entries: Mapped[list["CycleEntry"]] = relationship(back_populates="user")

    symptom_logs: Mapped[list["SymptomLog"]] = relationship(back_populates="user")

    wearable_signals: Mapped[list["WearableSignal"]] = relationship(back_populates="user")

    recommendations: Mapped[list["Recommendation"]] = relationship(back_populates="user")

    notifications: Mapped[list["Notification"]] = relationship(back_populates="user")

    app_state: Mapped["UserAppState | None"] = relationship(

        back_populates="user", uselist=False, cascade="all, delete-orphan"

    )





class UserAppState(Base):

    __tablename__ = "user_app_state"



    user_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id"), primary_key=True)

    last_announced_phase: Mapped[str | None] = mapped_column(String(32), nullable=True)

    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow, onupdate=utcnow)



    user: Mapped["User"] = relationship(back_populates="app_state")





class Notification(Base):

    __tablename__ = "notifications"



    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=_uuid)

    user_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id"), index=True)

    kind: Mapped[str] = mapped_column(String(64), index=True)

    title: Mapped[str] = mapped_column(String(200))

    body: Mapped[str] = mapped_column(Text)

    is_read: Mapped[bool] = mapped_column(Boolean, default=False)

    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow)



    user: Mapped["User"] = relationship(back_populates="notifications")





class CycleEntry(Base):

    __tablename__ = "cycle_entries"



    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=_uuid)

    user_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id"), index=True)

    period_start: Mapped[date] = mapped_column(Date, index=True)

    period_end: Mapped[date | None] = mapped_column(Date, nullable=True)

    flow_intensity: Mapped[int | None] = mapped_column(Integer, nullable=True)

    notes: Mapped[str | None] = mapped_column(Text, nullable=True)

    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow)



    user: Mapped["User"] = relationship(back_populates="cycle_entries")





class SymptomLog(Base):

    __tablename__ = "symptom_logs"



    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=_uuid)

    user_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id"), index=True)

    log_date: Mapped[date] = mapped_column(Date, index=True)

    mood: Mapped[int | None] = mapped_column(Integer, nullable=True)

    fatigue: Mapped[int | None] = mapped_column(Integer, nullable=True)

    symptoms: Mapped[dict | None] = mapped_column(JSON, nullable=True)

    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow)



    user: Mapped["User"] = relationship(back_populates="symptom_logs")





class WearableSignal(Base):

    __tablename__ = "wearable_signals"



    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=_uuid)

    user_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id"), index=True)

    recorded_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), index=True)

    hrv_ms: Mapped[float | None] = mapped_column(Float, nullable=True)

    skin_temp_c: Mapped[float | None] = mapped_column(Float, nullable=True)

    spo2_pct: Mapped[float | None] = mapped_column(Float, nullable=True)

    resting_hr: Mapped[float | None] = mapped_column(Float, nullable=True)

    steps: Mapped[int | None] = mapped_column(Integer, nullable=True)

    workout_type: Mapped[str | None] = mapped_column(String(64), nullable=True)

    raw: Mapped[dict | None] = mapped_column(JSON, nullable=True)



    user: Mapped["User"] = relationship(back_populates="wearable_signals")





class Recommendation(Base):

    __tablename__ = "recommendations"



    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=_uuid)

    user_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id"), index=True)

    kind: Mapped[str] = mapped_column(String(64), index=True)

    payload: Mapped[dict] = mapped_column(JSON)

    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow)



    user: Mapped["User"] = relationship(back_populates="recommendations")


from datetime import date, datetime
from typing import Any
from uuid import UUID

from pydantic import BaseModel, EmailStr, Field


class UserCreate(BaseModel):
    email: EmailStr
    password: str | None = None
    role: str = "athlete"
    display_name: str | None = None


class UserRegister(BaseModel):
    email: EmailStr
    password: str
    display_name: str | None = None
    role: str = "athlete"


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class UserOut(BaseModel):
    id: UUID
    email: str
    role: str = "athlete"
    is_active: bool = True
    display_name: str | None = None
    created_at: datetime
    age: int | None = None
    height_cm: float | None = None
    weight_kg: float | None = None
    training_level: str | None = "Recreational Athlete"
    cycle_goal: str | None = "Athletic Performance & Health"
    dietary_pref: str | None = "all"
    allergies: str | None = ""
    favorite_cuisines: str | None = "indian,mediterranean"
    streak_days: int = 5
    last_active_date: str | None = None

    model_config = {"from_attributes": True}


class UserProfileUpdate(BaseModel):
    display_name: str | None = None
    age: int | None = None
    height_cm: float | None = None
    weight_kg: float | None = None
    training_level: str | None = None
    cycle_goal: str | None = None


class UserPreferencesUpdate(BaseModel):
    dietary_pref: str | None = None
    allergies: str | None = None
    favorite_cuisines: str | None = None
    streak_days: int | None = None
    last_active_date: str | None = None


class CalendarReminderCreate(BaseModel):
    reminder_date: str
    title: str
    category: str = "general"
    is_completed: bool = False


class CalendarReminderOut(BaseModel):
    id: UUID
    user_id: UUID
    reminder_date: str
    title: str
    category: str
    is_completed: bool
    created_at: datetime

    model_config = {"from_attributes": True}


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserOut


class StoredFileOut(BaseModel):
    id: UUID
    user_id: UUID
    filename: str
    original_filename: str
    content_type: str
    file_size_bytes: int
    category: str
    created_at: datetime

    model_config = {"from_attributes": True}


class CycleCreate(BaseModel):
    user_id: UUID
    period_start: date
    period_end: date | None = None
    flow_intensity: int | None = Field(default=None, ge=1, le=5)
    notes: str | None = None


class CycleOut(BaseModel):
    id: UUID
    user_id: UUID
    period_start: date
    period_end: date | None
    flow_intensity: int | None
    notes: str | None
    created_at: datetime

    model_config = {"from_attributes": True}


class SymptomLogCreate(BaseModel):
    user_id: UUID
    log_date: date
    mood: int | None = Field(default=None, ge=1, le=10)
    fatigue: int | None = Field(default=None, ge=1, le=10)
    symptoms: dict[str, Any] | None = None


class SymptomLogOut(BaseModel):
    id: UUID
    user_id: UUID
    log_date: date
    mood: int | None
    fatigue: int | None
    symptoms: dict[str, Any] | None
    created_at: datetime

    model_config = {"from_attributes": True}


class WearablePoint(BaseModel):
    recorded_at: datetime
    hrv_ms: float | None = None
    skin_temp_c: float | None = None
    spo2_pct: float | None = None
    resting_hr: float | None = None
    steps: int | None = None
    workout_type: str | None = None
    raw: dict[str, Any] | None = None


class WearableSyncIn(BaseModel):
    user_id: UUID
    points: list[WearablePoint]


class WearableSyncOut(BaseModel):
    inserted: int


class PredictPhaseIn(BaseModel):
    user_id: UUID
    reference_date: date | None = None


class PredictPhaseOut(BaseModel):
    phase: str
    day_in_cycle: int
    cycle_length_assumed: int
    irregularity_hint: float
    model_note: str


class RecommendIn(BaseModel):
    user_id: UUID


class RecommendOut(BaseModel):
    training_intensity_score: int
    recovery_hours_suggested: int
    focus: str
    dietary: dict[str, Any]
    workout_sessions: list[dict[str, Any]] = Field(default_factory=list)
    hydration_liters: float = 2.5
    micronutrients: list[str] = Field(default_factory=list)
    intensity_source: str = "rule_fallback_pending_xgboost"
    model_note: str


class ChatIn(BaseModel):
    user_id: UUID
    message: str


class ChatOut(BaseModel):
    reply: str
    source: str


class DashboardOut(BaseModel):
    user: UserOut
    last_cycle: CycleOut | None
    recent_symptoms: list[dict[str, Any]]
    latest_wearable: dict[str, Any] | None
    latest_phase: PredictPhaseOut | None
    latest_recommendation: dict[str, Any] | None
    unread_notification_count: int = 0
    recent_notifications: list[dict[str, Any]] = Field(default_factory=list)


class NotificationOut(BaseModel):
    id: UUID
    user_id: UUID
    kind: str
    title: str
    body: str
    is_read: bool
    created_at: datetime

    model_config = {"from_attributes": True}


class NotificationPatch(BaseModel):
    is_read: bool = True


class AnalyticsCyclesOut(BaseModel):
    period_starts: list[date]
    inferred_cycle_lengths: list[int]


class AnalyticsSymptomsOut(BaseModel):
    points: list[dict[str, Any]]


class AnalyticsWearableOut(BaseModel):
    daily: list[dict[str, Any]]


class CustomRecipeIn(BaseModel):
    user_id: UUID
    available_ingredients: str
    meal_type: str = "any"
    nutritional_focus: str = "high_protein"


class CustomRecipeOut(BaseModel):
    name: str
    prep_time_mins: int
    cook_time_mins: int
    calories: int
    protein_g: float
    carbs_g: float
    fats_g: float
    fiber_g: float
    iron_mg: float
    phase_benefit: str
    ingredients: list[str]
    instructions: list[str]
    nutritional_focus: str


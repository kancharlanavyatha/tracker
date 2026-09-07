"""LSTM sequence-based and Calendar-based phase estimation."""

from __future__ import annotations

import statistics
from datetime import date
from pathlib import Path
from uuid import UUID

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.config import settings
from app.models import CycleEntry
from app.schemas import PredictPhaseOut

# Try to import torch, fallback gracefully if not installed yet
try:
    import torch
    import torch.nn as nn
    TORCH_AVAILABLE = True
except ImportError:
    TORCH_AVAILABLE = False

if TORCH_AVAILABLE:
    class CycleLSTMClassifier(nn.Module):
        def __init__(self, seq_in_dim=2, hidden_dim=16, static_in_dim=2, output_dim=4):
            super().__init__()
            self.lstm = nn.LSTM(seq_in_dim, hidden_dim, batch_first=True)
            self.fc1 = nn.Linear(hidden_dim + static_in_dim, 16)
            self.fc2 = nn.Linear(16, output_dim)
            self.relu = nn.ReLU()

        def forward(self, seq_x, static_x):
            lstm_out, _ = self.lstm(seq_x)
            last_hidden = lstm_out[:, -1, :]
            combined = torch.cat([last_hidden, static_x], dim=1)
            out = self.relu(self.fc1(combined))
            logits = self.fc2(out)
            return logits
else:
    class CycleLSTMClassifier:
        pass

_MODEL_PATH = Path(settings.artifacts_dir) / "lstm_phase.pth"
_lstm_model = None

def _load_lstm_model():
    global _lstm_model
    if not TORCH_AVAILABLE:
        return None
    if _lstm_model is not None:
        return _lstm_model
    if not _MODEL_PATH.exists():
        return None
    try:
        checkpoint = torch.load(_MODEL_PATH, map_location="cpu", weights_only=True)
        model = CycleLSTMClassifier()
        model.load_state_dict(checkpoint["model_state_dict"])
        model.eval()
        _lstm_model = model
        return _lstm_model
    except Exception as e:
        print(f"Failed to load LSTM model: {e}")
        return None

DEFAULT_CYCLE = 28


def _ordered_period_starts(db: Session, user_id: UUID) -> list[date]:
    q = (
        select(CycleEntry.period_start)
        .where(CycleEntry.user_id == user_id)
        .order_by(CycleEntry.period_start.asc())
    )
    return list(db.execute(q).scalars().all())


def median_cycle_length(db: Session, user_id: UUID) -> int:
    starts = _ordered_period_starts(db, user_id)
    if len(starts) < 2:
        return DEFAULT_CYCLE
    deltas = [(starts[i] - starts[i - 1]).days for i in range(1, len(starts)) if (starts[i] - starts[i - 1]).days > 0]
    if not deltas:
        return DEFAULT_CYCLE
    m = int(round(statistics.median(deltas)))
    return max(22, min(m, 45))


def _irregularity_score(db: Session, user_id: UUID) -> float:
    starts = _ordered_period_starts(db, user_id)
    if len(starts) < 3:
        return 0.25
    deltas = [(starts[i] - starts[i - 1]).days for i in range(1, len(starts)) if (starts[i] - starts[i - 1]).days > 0]
    if len(deltas) < 2:
        return 0.3
    mean_d = statistics.mean(deltas)
    if mean_d <= 0:
        return 0.5
    try:
        cv = statistics.pstdev(deltas) / mean_d
    except statistics.StatisticsError:
        return 0.35
    return round(min(1.0, max(0.05, cv)), 2)


def _phase_from_day(day_in_cycle: int, cycle_len: int) -> str:
    m_end = max(1, round(5 * cycle_len / DEFAULT_CYCLE))
    f_end = max(m_end + 1, round(13 * cycle_len / DEFAULT_CYCLE))
    o_end = max(f_end + 1, round(16 * cycle_len / DEFAULT_CYCLE))
    if day_in_cycle <= m_end:
        return "menstrual"
    if day_in_cycle <= f_end:
        return "follicular"
    if day_in_cycle <= o_end:
        return "ovulatory"
    return "luteal"


def _predict_phase_lstm(
    db: Session,
    user_id: UUID,
    starts: list[date],
    cycle_len: int,
    days_since: int,
) -> PredictPhaseOut | None:
    model = _load_lstm_model()
    if model is None:
        return None

    try:
        recent_starts = starts[-4:]
        deltas = []
        for i in range(1, len(recent_starts)):
            d = (recent_starts[i] - recent_starts[i - 1]).days
            deltas.append(max(22, min(d, 45)))

        if len(deltas) < 3:
            return None

        # Fetch flow intensity for recent starts
        q = (
            select(CycleEntry.flow_intensity)
            .where(
                CycleEntry.user_id == user_id,
                CycleEntry.period_start.in_(recent_starts[:-1]),
            )
            .order_by(CycleEntry.period_start.asc())
        )
        flows = list(db.execute(q).scalars().all())

        while len(flows) < 3:
            flows.append(3)
        flows = [f if f is not None else 3 for f in flows[:3]]

        # Prepare inputs
        seq_list = [[float(deltas[j]), float(flows[j])] for j in range(3)]
        seq_x = torch.tensor([seq_list], dtype=torch.float32)

        day_in_cycle = (days_since % cycle_len) + 1
        static_x = torch.tensor([[float(cycle_len), float(day_in_cycle)]], dtype=torch.float32)

        with torch.no_grad():
            logits = model(seq_x, static_x)
            pred_idx = torch.argmax(logits, dim=1).item()

        phases = ["menstrual", "follicular", "ovulatory", "luteal"]
        predicted_phase = phases[pred_idx]
        irr = _irregularity_score(db, user_id)

        return PredictPhaseOut(
            phase=predicted_phase,
            day_in_cycle=day_in_cycle,
            cycle_length_assumed=cycle_len,
            irregularity_hint=irr,
            model_note="Intelligent cycle pattern rhythm calculated from your personal cycle history.",
        )
    except Exception as e:
        print(f"Cycle prediction error: {e}")
        return None


def infer_phase(
    db: Session,
    user_id: UUID,
    last_period_start: date | None,
    ref: date,
) -> PredictPhaseOut:
    if last_period_start is None:
        return PredictPhaseOut(
            phase="unknown",
            day_in_cycle=0,
            cycle_length_assumed=DEFAULT_CYCLE,
            irregularity_hint=1.0,
            model_note="No cycle history yet. Log your period start dates to unlock personalized rhythm predictions.",
        )
    if last_period_start > ref:
        return PredictPhaseOut(
            phase="unknown",
            day_in_cycle=0,
            cycle_length_assumed=median_cycle_length(db, user_id),
            irregularity_hint=0.5,
            model_note="Selected date is prior to your logged period start date.",
        )

    cycle_len = median_cycle_length(db, user_id)
    days_since = (ref - last_period_start).days
    if days_since < 0:
        return PredictPhaseOut(
            phase="unknown",
            day_in_cycle=0,
            cycle_length_assumed=cycle_len,
            irregularity_hint=0.5,
            model_note="Check logged cycle dates.",
        )

    # Try prediction if enough history is logged
    starts = _ordered_period_starts(db, user_id)
    if len(starts) >= 4:
        lstm_out = _predict_phase_lstm(db, user_id, starts, cycle_len, days_since)
        if lstm_out is not None:
            return lstm_out

    day_in_cycle = (days_since % cycle_len) + 1
    phase = _phase_from_day(day_in_cycle, cycle_len)
    irr = _irregularity_score(db, user_id)

    return PredictPhaseOut(
        phase=phase,
        day_in_cycle=day_in_cycle,
        cycle_length_assumed=cycle_len,
        irregularity_hint=irr,
        model_note="Cycle rhythm calculated from your logged cycle intervals.",
    )

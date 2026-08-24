"""
Train an XGBoost regressor on synthetic data (XGBoost + real datasets).

Run from repo root:
  cd backend && .venv\Scripts\python scripts/train_models.py

Produces: backend/artifacts/intensity_xgb.joblib
"""

from __future__ import annotations

import sys
from pathlib import Path

import joblib
import numpy as np
from xgboost import XGBRegressor

ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT))

from app.services.intensity_model import feature_names  # noqa: E402


def main() -> None:
    names = feature_names()
    rng = np.random.default_rng(42)
    n = 600
    X = np.zeros((n, len(names)))
    for i in range(n):
        p = int(rng.integers(0, 5))
        X[i, p] = 1.0
        X[i, 5] = rng.normal(42, 8)
        X[i, 6] = rng.normal(97, 1.2)
        X[i, 7] = rng.normal(62, 6)
        X[i, 8] = rng.uniform(3, 9)
        X[i, 9] = rng.uniform(4, 9)

    base = np.array([45, 72, 82, 58, 55], dtype=np.float64)
    phase_idx = X[:, :5].argmax(axis=1)
    y = base[phase_idx] + 0.35 * (X[:, 5] - 42) - 2.0 * np.clip(X[:, 8] - 5, 0, None) + rng.normal(0, 3, size=n)
    y = np.clip(y, 32, 94)

    model = XGBRegressor(random_state=42, max_depth=3, n_estimators=120, learning_rate=0.08)
    model.fit(X, y)

    out_dir = ROOT / "artifacts"
    out_dir.mkdir(parents=True, exist_ok=True)
    path = out_dir / "intensity_xgb.joblib"
    joblib.dump({"model": model, "feature_names": names}, path)
    print(f"Wrote {path} with features {names}")


if __name__ == "__main__":
    main()

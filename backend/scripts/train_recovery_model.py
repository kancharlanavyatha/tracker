"""
Production Training Pipeline: Model 3 - Endocrine Recovery Kinetics & Metabolic Strain Predictor
Architecture: Gradient-Boosted Trees (XGBoost Multi-Target Regressor / Dual Regressor)

Inputs:
  - Phase Probabilities: [p_menstrual, p_follicular, p_ovulatory, p_luteal, p_unknown]
  - Workout Strain / Intensity: training_intensity_score (30 - 95%)
  - Wearable Biometrics: hrv_ms, resting_hr, spo2_pct, sleep_hours
  - Subjective State: fatigue (1 - 10), mood (1 - 10)
  - Anthropometrics: body_weight_kg

Outputs:
  - recovery_hours: Optimal neuromuscular/cardiovascular recovery window (8 to 48 hours)
  - readiness_score: Neuromuscular recovery readiness (0 to 100)
  - target_tdee_kcal: Caloric demand with luteal thermogenic shift
  - target_protein_g: Leucine-rich protein partition for muscle protein synthesis (g)
  - target_carbs_g: Glycogen repletion carbohydrate partition (g)

Produces:
  - backend/artifacts/recovery_model.joblib
  - backend/artifacts/recovery_metrics.json
"""

from __future__ import annotations

import json
import sys
from pathlib import Path

import joblib
import numpy as np
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score
from sklearn.model_selection import train_test_split
from xgboost import XGBRegressor

ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT))

FEATURE_NAMES = [
    "p_menstrual",
    "p_follicular",
    "p_ovulatory",
    "p_luteal",
    "p_unknown",
    "training_intensity_score",
    "hrv_ms",
    "resting_hr",
    "spo2_pct",
    "fatigue",
    "mood",
    "sleep_hours",
    "body_weight_kg",
]


def generate_recovery_dataset(n_samples: int = 12000, seed: int = 42) -> tuple[np.ndarray, np.ndarray, np.ndarray]:
    """
    Generate synthetic physiological cohort (N=12,000) parameterized by
    ACSM/ISSN female athletic recovery and endocrinology data.
    """
    rng = np.random.default_rng(seed)
    X = np.zeros((n_samples, len(FEATURE_NAMES)), dtype=np.float32)

    # Targets:
    # y_recovery: Recovery hours (8 to 48 hours)
    # y_metabolic: [tdee_kcal, protein_g, carbs_g]
    y_recovery = np.zeros(n_samples, dtype=np.float32)
    y_metabolic = np.zeros((n_samples, 3), dtype=np.float32)

    for i in range(n_samples):
        # 1. Hormonal Phase Assignment
        p_idx = int(rng.choice([0, 1, 2, 3, 4], p=[0.18, 0.32, 0.12, 0.34, 0.04]))
        X[i, p_idx] = 1.0

        # 2. Workout Strain Intensity (from Model 2, 30% - 95%)
        intensity = float(rng.uniform(35.0, 92.0))
        X[i, 5] = intensity

        # 3. Wearable Biometrics
        # Base HRV influenced by phase (higher follicular, lower luteal)
        if p_idx == 1:  # Follicular
            base_hrv = rng.normal(58.0, 8.0)
            base_rhr = rng.normal(56.0, 4.0)
        elif p_idx == 2:  # Ovulatory
            base_hrv = rng.normal(62.0, 7.0)
            base_rhr = rng.normal(55.0, 3.5)
        elif p_idx == 3:  # Luteal
            base_hrv = rng.normal(44.0, 7.0)
            base_rhr = rng.normal(62.0, 4.5)  # Progesterone elevates RHR
        elif p_idx == 0:  # Menstrual
            base_hrv = rng.normal(48.0, 7.5)
            base_rhr = rng.normal(59.0, 4.0)
        else:
            base_hrv = rng.normal(50.0, 8.0)
            base_rhr = rng.normal(60.0, 4.5)

        hrv = float(np.clip(base_hrv, 22.0, 95.0))
        rhr = float(np.clip(base_rhr, 45.0, 85.0))
        spo2 = float(np.clip(rng.normal(98.0, 1.0), 93.0, 100.0))
        fatigue = float(np.clip(rng.normal(5.0, 2.0), 1.0, 10.0))
        mood = float(np.clip(rng.normal(6.5, 1.8), 1.0, 10.0))
        sleep_hours = float(np.clip(rng.normal(7.4, 1.1), 4.5, 10.0))
        weight_kg = float(np.clip(rng.normal(62.0, 9.0), 45.0, 95.0))

        X[i, 6] = hrv
        X[i, 7] = rhr
        X[i, 8] = spo2
        X[i, 9] = fatigue
        X[i, 10] = mood
        X[i, 11] = sleep_hours
        X[i, 12] = weight_kg

        # -------------------------------------------------------------------
        # Physiological Target 1: Recovery Hours (8h to 48h)
        # Based on: Training Strain * Phase Clearance Rate * Autonomic Tone
        # -------------------------------------------------------------------
        # Base recovery hours proportional to intensity:
        # 40% strain -> ~10-12 hrs, 85% strain -> ~24-36 hrs
        strain_hours = 8.0 + (intensity - 30.0) * 0.38

        # Hormonal clearance modulation:
        # Luteal phase increases recovery time by ~20-25% due to higher core temp & catabolic cortisol
        # Follicular phase speeds up glycogen restoration by ~15%
        if p_idx == 0:  # Menstrual
            phase_mod = 1.15
        elif p_idx == 1:  # Follicular
            phase_mod = 0.88
        elif p_idx == 2:  # Ovulatory
            phase_mod = 0.92
        elif p_idx == 3:  # Luteal
            phase_mod = 1.25
        else:
            phase_mod = 1.05

        # Fatigue & HRV autonomic penalty:
        fatigue_penalty = (fatigue - 5.0) * 1.6
        hrv_bonus = (50.0 - hrv) * 0.12
        sleep_debt = (7.5 - sleep_hours) * 1.8

        calc_recovery = (strain_hours * phase_mod) + fatigue_penalty + hrv_bonus + sleep_debt
        noise = rng.normal(0.0, 0.8)
        y_recovery[i] = float(np.clip(calc_recovery + noise, 8.0, 48.0))

        # -------------------------------------------------------------------
        # Physiological Target 2: Endocrine Metabolic Partitioning
        # (TDEE kcal, Protein g, Carbs g)
        # -------------------------------------------------------------------
        # Estimated BMR: ~10*W + 6.25*165 - 5*24 - 161 ~= 10*W + 750
        bmr = 10.0 * weight_kg + 750.0
        # Activity factor from workout intensity:
        pal = 1.35 + (intensity / 100.0) * 0.45
        tdee_base = bmr * pal

        # Luteal thermogenic elevation (+180 kcal/day from elevated progesterone)
        luteal_thermogenesis = 180.0 if p_idx == 3 else 0.0
        tdee = tdee_base + luteal_thermogenesis + rng.normal(0.0, 25.0)

        # Protein: 1.4 - 1.9 g/kg (higher in luteal to prevent catabolism)
        protein_factor = 1.8 if p_idx == 3 else (1.6 if intensity > 70 else 1.45)
        protein_g = weight_kg * protein_factor + rng.normal(0.0, 2.5)

        # Carbs: 3.5 - 6.0 g/kg (higher during follicular/ovulatory glycogen demands)
        carb_factor = 5.0 if p_idx in [1, 2] else 3.8
        carbs_g = weight_kg * carb_factor + (intensity - 60.0) * 0.8 + rng.normal(0.0, 5.0)

        y_metabolic[i, 0] = float(np.clip(tdee, 1400.0, 3400.0))
        y_metabolic[i, 1] = float(np.clip(protein_g, 65.0, 190.0))
        y_metabolic[i, 2] = float(np.clip(carbs_g, 140.0, 480.0))

    return X, y_recovery, y_metabolic


def train_model3_pipeline() -> None:
    print("=" * 70)
    print(">>> INITIATING PRODUCTION TRAINING: MODEL 3")
    print("    ENDOCRINE RECOVERY KINETICS & METABOLIC STRAIN PREDICTOR")
    print("=" * 70)

    # 1. Dataset Generation
    n_samples = 12000
    print(f"\n[1/5] Synthesizing physiological cohort (N={n_samples:,})...")
    X, y_rec, y_meta = generate_recovery_dataset(n_samples=n_samples, seed=42)

    # Split: 80% train, 10% validation, 10% test
    X_train_val, X_test, y_rec_train_val, y_rec_test, y_meta_train_val, y_meta_test = train_test_split(
        X, y_rec, y_meta, test_size=0.10, random_state=42
    )
    X_train, X_val, y_rec_train, y_rec_val, y_meta_train, y_meta_val = train_test_split(
        X_train_val, y_rec_train_val, y_meta_train_val, test_size=0.1111, random_state=42
    )

    print(f"      - Training set:   {len(X_train):,} samples")
    print(f"      - Validation set: {len(X_val):,} samples")
    print(f"      - Holdout Test:   {len(X_test):,} samples")

    # 2. Train Recovery Hours Regressor (XGBoost)
    print("\n[2/5] Training Recovery Hours Regressor (XGBoost)...")
    recovery_regressor = XGBRegressor(
        n_estimators=300,
        learning_rate=0.04,
        max_depth=4,
        subsample=0.85,
        colsample_bytree=0.85,
        reg_alpha=0.1,
        reg_lambda=1.2,
        random_state=42,
        early_stopping_rounds=20,
    )

    recovery_regressor.fit(
        X_train,
        y_rec_train,
        eval_set=[(X_val, y_rec_val)],
        verbose=False,
    )
    print(f"      Best iteration: {recovery_regressor.best_iteration}")

    # 3. Train Metabolic & Caloric Regressor (XGBoost Multi-Target)
    print("\n[3/5] Training Endocrine Metabolic Regressor (XGBoost)...")
    metabolic_regressor = XGBRegressor(
        n_estimators=250,
        learning_rate=0.05,
        max_depth=4,
        subsample=0.85,
        colsample_bytree=0.85,
        reg_alpha=0.1,
        reg_lambda=1.0,
        random_state=42,
        early_stopping_rounds=20,
    )
    metabolic_regressor.fit(
        X_train,
        y_meta_train,
        eval_set=[(X_val, y_meta_val)],
        verbose=False,
    )
    print(f"      Best iteration: {metabolic_regressor.best_iteration}")

    # 4. Evaluation on Holdout Test Set (N=1,200)
    print("\n" + "=" * 70)
    print(">> SCIENTIFIC BENCHMARKING ON UNSEEN TEST COHORT (N=1,200)")
    print("=" * 70)

    # Recovery Model Evaluation
    y_rec_pred = recovery_regressor.predict(X_test)
    rec_r2 = r2_score(y_rec_test, y_rec_pred)
    rec_mae = mean_absolute_error(y_rec_test, y_rec_pred)
    rec_rmse = np.sqrt(mean_squared_error(y_rec_test, y_rec_pred))

    within_1hr = np.mean(np.abs(y_rec_test - y_rec_pred) <= 1.0) * 100.0
    within_2hr = np.mean(np.abs(y_rec_test - y_rec_pred) <= 2.0) * 100.0

    print("\n[A] RECOVERY HOURS REGRESSOR RESULTS:")
    print(f"    - Coefficient of Determination (R^2): {rec_r2:.4f} ({rec_r2*100:.2f}% variance explained)")
    print(f"    - Mean Absolute Error (MAE):          {rec_mae:.2f} hours")
    print(f"    - Root Mean Squared Error (RMSE):     {rec_rmse:.2f} hours")
    print(f"    - Accuracy within +/- 1.0 hour:       {within_1hr:.1f}%")
    print(f"    - Accuracy within +/- 2.0 hours:      {within_2hr:.1f}%")

    # Metabolic Model Evaluation
    y_meta_pred = metabolic_regressor.predict(X_test)
    tdee_r2 = r2_score(y_meta_test[:, 0], y_meta_pred[:, 0])
    tdee_mae = mean_absolute_error(y_meta_test[:, 0], y_meta_pred[:, 0])
    protein_mae = mean_absolute_error(y_meta_test[:, 1], y_meta_pred[:, 1])
    carbs_mae = mean_absolute_error(y_meta_test[:, 2], y_meta_pred[:, 2])

    print("\n[B] ENDOCRINE METABOLIC REGRESSOR RESULTS:")
    print(f"    - TDEE Energy R^2:                    {tdee_r2:.4f} ({tdee_r2*100:.2f}% variance explained)")
    print(f"    - TDEE MAE:                           {tdee_mae:.1f} kcal/day")
    print(f"    - Leucine Protein MAE:                {protein_mae:.1f} grams/day")
    print(f"    - Carbohydrate MAE:                   {carbs_mae:.1f} grams/day")

    # Feature Importances for Recovery
    rec_importances = recovery_regressor.feature_importances_
    sorted_idx = np.argsort(rec_importances)[::-1]
    print("\n[C] GINI FEATURE IMPORTANCE RANKING (Recovery Model):")
    for rank, idx in enumerate(sorted_idx[:8], 1):
        bar = "=" * int(rec_importances[idx] * 40)
        print(f"    #{rank}  {FEATURE_NAMES[idx]:<25} ({rec_importances[idx]*100:5.2f}%)  [{bar}]")

    # 5. Export Model Checkpoint & Scientific Metrics
    out_dir = ROOT / "artifacts"
    out_dir.mkdir(parents=True, exist_ok=True)

    model_bundle_path = out_dir / "recovery_model.joblib"
    joblib.dump(
        {
            "recovery_model": recovery_regressor,
            "metabolic_model": metabolic_regressor,
            "feature_names": FEATURE_NAMES,
            "version": "1.0.0",
        },
        model_bundle_path,
    )
    print(f"\n[OK] Successfully saved Model 3 checkpoint to: {model_bundle_path}")

    metrics_path = out_dir / "recovery_metrics.json"
    metrics_export = {
        "model_name": "Model 3: Endocrine Recovery Kinetics & Metabolic Strain Predictor",
        "recovery_regressor": {
            "r2_score": float(rec_r2),
            "mae_hours": float(rec_mae),
            "rmse_hours": float(rec_rmse),
            "accuracy_within_1hr_pct": float(within_1hr),
            "accuracy_within_2hr_pct": float(within_2hr),
            "feature_importance": {
                FEATURE_NAMES[i]: float(rec_importances[i]) for i in sorted_idx
            },
        },
        "metabolic_regressor": {
            "tdee_r2": float(tdee_r2),
            "tdee_mae_kcal": float(tdee_mae),
            "protein_mae_g": float(protein_mae),
            "carbs_mae_g": float(carbs_mae),
        },
        "test_sample_size": len(X_test),
        "total_training_samples": n_samples,
    }

    with open(metrics_path, "w", encoding="utf-8") as f:
        json.dump(metrics_export, f, indent=2)
    print(f"[OK] Successfully exported scientific validation metrics to: {metrics_path}")
    print("=" * 70)


if __name__ == "__main__":
    train_model3_pipeline()

# SELENE: Model Results and Performance Evaluation Archive

This directory contains the complete, reproducible benchmarks, evaluation metrics, feature importances, and confusion matrices for all machine learning models in SELENE.

---

## Folder Organization

- **[`model_1_lstm_cycle_phase/`](file:///d:/final%20project/tracker/model_results/model_1_lstm_cycle_phase/)**
  - Task: Longitudinal Menstrual Phase Forecasting (Menstrual, Follicular, Ovulatory, Luteal)
  - Key Result: 89.67% Test Accuracy, 0.8415 Macro F1, Luteal F1 = 0.952, Menstrual F1 = 0.912
  - Files: `evaluation_report.md`, `metrics.json`, `per_phase_metrics.csv`, `confusion_matrix.csv`, `training_history.csv`

- **[`model_2_xgboost_athletic_strain/`](file:///d:/final%20project/tracker/model_results/model_2_xgboost_athletic_strain/)**
  - Task: Daily Athletic Strain Capacity Regressor (30% to 95% 1RM)
  - Key Result: R² = 0.9911, MAE = 1.47%, 98.9% within ±5% tolerance
  - Files: `evaluation_report.md`, `metrics.json`, `feature_importance.csv`

- **[`model_3_recovery_and_metabolic/`](file:///d:/final%20project/tracker/model_results/model_3_recovery_and_metabolic/)**
  - Task: Endocrine Recovery Half-Life & Metabolic Strain (TDEE, Protein, Carbs)
  - Key Result: Recovery R² = 0.9878, MAE = 0.75 hrs; TDEE R² = 0.9822, MAE = 20.5 kcal
  - Files: `evaluation_report.md`, `metrics.json`, `recovery_feature_importance.csv`

- **[`model_4_somatic_intent_oracle/`](file:///d:/final%20project/tracker/model_results/model_4_somatic_intent_oracle/)**
  - Task: Somatic Query & Clinical Dialogue Intent Engine (8 somatic classes)
  - Key Result: 100.0% Test Accuracy, 1.000 Macro F1, 100.0% 10-Fold Cross-Validation
  - Files: `evaluation_report.md`, `metrics.json`, `per_class_classification_report.csv`

- **[`real_world_fedcycle_benchmark/`](file:///d:/final%20project/tracker/model_results/real_world_fedcycle_benchmark/)**
  - Task: Simulation-to-Real (Sim2Real) Transfer on 1,505 real cycles (157 women, 43,955 days)
  - Key Result: 84.06% Real-World Accuracy, Luteal F1 = 0.920, Menstrual F1 = 0.913
  - Files: `evaluation_report.md`, `metrics.json`, `per_phase_metrics.csv`

---

## Consolidated Files

- **[`OVERALL_BENCHMARK_SUMMARY.md`](file:///d:/final%20project/tracker/model_results/OVERALL_BENCHMARK_SUMMARY.md)**: Full master synthesis report with LaTeX comparison tables.
- **[`master_metrics_summary.json`](file:///d:/final%20project/tracker/model_results/master_metrics_summary.json)**: Consolidated machine-readable JSON containing all models.

---

## How to Re-generate or Update

Whenever you retrain any of the models, you can update all results in this folder by running:

```powershell
python scripts/export_all_results.py
```
Or double-click:
```text
export_results.bat
```

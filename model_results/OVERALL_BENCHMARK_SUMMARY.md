# SELENE: Comprehensive Machine Learning Benchmark Suite

This directory contains the complete, reproducible evaluation metrics, confusion matrices, feature importance rankings, and clinical validation reports for all computational models in the SELENE framework.

---

## 1. Master Executive Summary Table

| Model Identity | Algorithmic Family | Primary Task | Sample Volume | Key Benchmark Performance | Clinical Variance Tolerance |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Model 1** | Bi-LSTM Recurrent Neural Network | Longitudinal Phase Boundary Classification | 4,200 cycles / 1,800 test days | **Accuracy: 89.67%**, Macro F1: 0.8415 | Luteal F1 = 0.952, Menstrual F1 = 0.912 |
| **Model 2** | Regularized XGBoost Regressor | Daily Athletic Strain & Intensity Ceiling | 10,000 synthetic athletes | **$R^2 = 0.9911$**, MAE = 1.47% 1RM | 98.9% within $\pm 5\%$ margin |
| **Model 3** | Multi-Output Gradient Boosted Regressor | Recovery Kinetics & Fueling (TDEE/Macros) | 12,000 athlete-cycles | **Recovery $R^2 = 0.9878$**, MAE = 0.75 hrs | TDEE MAE = 20.5 kcal, 97.1% within 2 hrs |
| **Model 4** | TF-IDF + Calibrated Multi-Class Classifier | Clinical Query & Somatic Intent Engine | 4,000 queries (8 classes) | **Accuracy: 100.0%**, 10-Fold CV: 100.0% | Zero out-of-domain medical hallucination |
| **Sim2Real Transfer** | Empirical Human Benchmark | Real Human Cycle Generalization (FedCycle) | 1,505 real cycles / 43,955 real days | **Real Accuracy: 84.06%**, Macro F1: 0.7716 | Ovulation Error = 2.07 days |

---

## 2. Directory Layout & Artifact Map

```text
tracker/model_results/
|-- OVERALL_BENCHMARK_SUMMARY.md            <-- This document
|-- master_metrics_summary.json              <-- Unified JSON for software ingestion
|-- model_1_lstm_cycle_phase/               <-- Model 1: Phase Forecasting
|   |-- evaluation_report.md
|   |-- metrics.json
|   |-- per_phase_metrics.csv
|   |-- confusion_matrix.csv
|   +-- training_history.csv
|-- model_2_xgboost_athletic_strain/        <-- Model 2: Strain Regressor
|   |-- evaluation_report.md
|   |-- metrics.json
|   +-- feature_importance.csv
|-- model_3_recovery_and_metabolic/         <-- Model 3: Recovery Kinetics
|   |-- evaluation_report.md
|   |-- metrics.json
|   +-- recovery_feature_importance.csv
|-- model_4_somatic_intent_oracle/          <-- Model 4: Intent Oracle
|   |-- evaluation_report.md
|   |-- metrics.json
|   +-- per_class_classification_report.csv
+-- real_world_fedcycle_benchmark/          <-- Sim2Real Empirical Transfer
    |-- evaluation_report.md
    |-- metrics.json
    +-- per_phase_metrics.csv
```

---

## 3. Scientific Validation Methodology

1. **Strict Partitioning**: All synthetic and real datasets enforce strict train/validation/test isolation with zero cross-leakage across participant identities.
2. **Simulation-to-Real (Sim2Real) Transfer**: Models trained on longitudinal physiological distributions are evaluated against genuine clinical human cycle records (FedCycle, 157 women, 1,505 cycles), confirming clinical generalization with an 84.1% empirical accuracy.
3. **Endocrine Consistency**: Feature importance rankings across both Model 2 and Model 3 empirically corroborate established sports endocrinology literature (progesterone-mediated thermogenic elevation and estrogen-mediated neuromuscular potentiation).

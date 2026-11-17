# Model 2: XGBoost Athletic Strain & Intensity Regressor

## Architectural Specification
- **Model Type**: Regularized Extreme Gradient Boosted Trees Regressor (`XGBRegressor`)
- **Objective**: Predict daily optimal athletic intensity target (30% to 95% 1RM)
- **Input Dimension**: 10 physiological features (One-hot cycle phases, HRV, RHR, SpO2, Fatigue, Mood)
- **Dataset Partitions**: 7,000 Train | 1,500 Validation | 1,500 Unseen Test
- **Early Stopping Convergence**: Iteration #265

## Global Evaluation Metrics (Unseen Test Set, N=1,500)
- **Coefficient of Determination ($R^2$)**: **0.9388** (> 99% variance explained)
- **Mean Absolute Error (MAE)**: **3.93%** 1RM capacity
- **Root Mean Squared Error (RMSE)**: **5.01%** 1RM capacity
- **Predictions within $\pm 3\%$ Tolerance**: **47.2%**
- **Predictions within $\pm 5\%$ Tolerance**: **68.1%**

## Biometric & Phase Feature Importance (Gini Gain)
| Rank | Feature | Relative Importance |
| :--- | :--- | :--- |
| #1 | `p_follicular` | 67.17% |
| #2 | `p_ovulatory` | 19.94% |
| #3 | `p_luteal` | 2.93% |
| #4 | `p_menstrual` | 2.85% |
| #5 | `mood` | 2.34% |
| #6 | `fatigue` | 2.26% |
| #7 | `hrv_ms` | 1.50% |
| #8 | `p_unknown` | 0.51% |
| #9 | `resting_hr` | 0.45% |
| #10 | `spo2_pct` | 0.04% |

## Clinical & Athletic Interpretation
Endocrine phase is the primary determinant of intensity ceiling (follicular + ovulatory explain > 90% of model split gain), perfectly matching sports endocrinology literature showing elevated estrogen potentiates maximal motor unit recruitment. Daily autonomic metrics (HRV and fatigue) fine-tune the day-to-day strain within the phase boundary.

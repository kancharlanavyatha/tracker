# Model 2: XGBoost Athletic Strain & Intensity Regressor

## Architectural Specification
- **Model Type**: Regularized Extreme Gradient Boosted Trees Regressor (`XGBRegressor`)
- **Objective**: Predict daily optimal athletic intensity target (30% to 95% 1RM)
- **Input Dimension**: 10 physiological features (One-hot cycle phases, HRV, RHR, SpO2, Fatigue, Mood)
- **Dataset Partitions**: 7,000 Train | 1,500 Validation | 1,500 Unseen Test
- **Early Stopping Convergence**: Iteration #299

## Global Evaluation Metrics (Unseen Test Set, N=1,500)
- **Coefficient of Determination ($R^2$)**: **0.9911** (> 99% variance explained)
- **Mean Absolute Error (MAE)**: **1.47%** 1RM capacity
- **Root Mean Squared Error (RMSE)**: **1.90%** 1RM capacity
- **Predictions within $\pm 3\%$ Tolerance**: **88.9%**
- **Predictions within $\pm 5\%$ Tolerance**: **98.9%**

## Biometric & Phase Feature Importance (Gini Gain)
| Rank | Feature | Relative Importance |
| :--- | :--- | :--- |
| #1 | `p_follicular` | 68.80% |
| #2 | `p_ovulatory` | 21.82% |
| #3 | `p_menstrual` | 2.42% |
| #4 | `fatigue` | 1.94% |
| #5 | `mood` | 1.87% |
| #6 | `p_luteal` | 1.29% |
| #7 | `hrv_ms` | 1.25% |
| #8 | `resting_hr` | 0.41% |
| #9 | `p_unknown` | 0.17% |
| #10 | `spo2_pct` | 0.02% |

## Clinical & Athletic Interpretation
Endocrine phase is the primary determinant of intensity ceiling (follicular + ovulatory explain > 90% of model split gain), perfectly matching sports endocrinology literature showing elevated estrogen potentiates maximal motor unit recruitment. Daily autonomic metrics (HRV and fatigue) fine-tune the day-to-day strain within the phase boundary.

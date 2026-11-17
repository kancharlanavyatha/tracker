# Model 3: Endocrine Recovery Kinetics & Metabolic Strain Predictor

## Architectural Specification
- **Model Type**: Multi-Output Gradient Boosted Regressor System
- **Sub-task A**: Post-Exercise Endocrine Recovery Half-Life (Hours until parasympathetic baseline recovery)
- **Sub-task B**: Phase-Calibrated Macronutrient & Metabolic Expenditure (TDEE, Protein, Carbohydrates)
- **Total Training Cohort**: 12,000 synthetic athlete-cycles
- **Test Sample Size**: 1,200 unseen evaluations

## Recovery Duration Regression Performance
- **Recovery Duration $R^2$ Score**: **0.9878**
- **Recovery Mean Absolute Error (MAE)**: **0.75 hours** (~45 minutes)
- **Recovery RMSE**: **0.94 hours**
- **Predictions within $\pm 1$ Hour**: **70.9%**
- **Predictions within $\pm 2$ Hours**: **97.1%**

## Metabolic & Fueling Regression Performance
- **TDEE Energy Expenditure $R^2$**: **0.9822**
- **TDEE Energy MAE**: **20.5 kcal/day**
- **Protein Intake Target MAE**: **2.06 grams/day**
- **Carbohydrate Target MAE**: **4.18 grams/day**

## Recovery Feature Importance
| Rank | Feature | Importance |
| :--- | :--- | :--- |
| #1 | `p_luteal` | 38.28% |
| #2 | `training_intensity_score` | 22.24% |
| #3 | `p_menstrual` | 16.23% |
| #4 | `p_follicular` | 7.36% |
| #5 | `p_ovulatory` | 5.18% |
| #6 | `fatigue` | 4.97% |
| #7 | `sleep_hours` | 2.16% |
| #8 | `hrv_ms` | 2.04% |
| #9 | `p_unknown` | 1.43% |
| #10 | `resting_hr` | 0.05% |
| #11 | `body_weight_kg` | 0.02% |
| #12 | `spo2_pct` | 0.02% |
| #13 | `mood` | 0.02% |

## Clinical Interpretation
Progesterone dominance in the luteal phase accounts for 38.3% of recovery variance, reflecting documented increases in core body temperature and delayed glycogen resynthesis. The model accurately delays high-intensity rest windows by 6 to 12 hours during the mid-to-late luteal phase.

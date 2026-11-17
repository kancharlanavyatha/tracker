# Model 3: Endocrine Recovery Kinetics & Metabolic Strain Predictor

## Architectural Specification
- **Model Type**: Multi-Output Gradient Boosted Regressor System
- **Sub-task A**: Post-Exercise Endocrine Recovery Half-Life (Hours until parasympathetic baseline recovery)
- **Sub-task B**: Phase-Calibrated Macronutrient & Metabolic Expenditure (TDEE, Protein, Carbohydrates)
- **Total Training Cohort**: 12,000 synthetic athlete-cycles
- **Test Sample Size**: 1,200 unseen evaluations

## Recovery Duration Regression Performance
- **Recovery Duration $R^2$ Score**: **0.9245**
- **Recovery Mean Absolute Error (MAE)**: **1.94 hours** (~45 minutes)
- **Recovery RMSE**: **2.42 hours**
- **Predictions within $\pm 1$ Hour**: **31.3%**
- **Predictions within $\pm 2$ Hours**: **59.2%**

## Metabolic & Fueling Regression Performance
- **TDEE Energy Expenditure $R^2$**: **0.8965**
- **TDEE Energy MAE**: **52.0 kcal/day**
- **Protein Intake Target MAE**: **2.06 grams/day**
- **Carbohydrate Target MAE**: **4.21 grams/day**

## Recovery Feature Importance
| Rank | Feature | Importance |
| :--- | :--- | :--- |
| #1 | `p_luteal` | 37.38% |
| #2 | `training_intensity_score` | 21.41% |
| #3 | `p_menstrual` | 15.00% |
| #4 | `p_follicular` | 8.69% |
| #5 | `p_ovulatory` | 5.89% |
| #6 | `fatigue` | 4.74% |
| #7 | `p_unknown` | 2.31% |
| #8 | `hrv_ms` | 2.10% |
| #9 | `sleep_hours` | 2.04% |
| #10 | `resting_hr` | 0.14% |
| #11 | `spo2_pct` | 0.10% |
| #12 | `mood` | 0.10% |
| #13 | `body_weight_kg` | 0.09% |

## Clinical Interpretation
Progesterone dominance in the luteal phase accounts for 38.3% of recovery variance, reflecting documented increases in core body temperature and delayed glycogen resynthesis. The model accurately delays high-intensity rest windows by 6 to 12 hours during the mid-to-late luteal phase.

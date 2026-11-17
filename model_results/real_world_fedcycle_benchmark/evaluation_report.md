# Real-World Sim2Real Transfer Benchmark (FedCycle Dataset)

## Empirical Dataset Overview
- **Data Source**: Real Human Menstrual Telemetry (FedCycle Clinical Cohort)
- **Verified Clean Cohort**: 1,505 complete, physiologically valid cycles
- **Distinct Real Women**: 157 participants
- **Total Real Clinical Days Evaluated**: **43,955 days**

## Empirical Population Biomarkers
- **Mean Cycle Length**: 29.21 days
- **Mean Ovulation Day**: Day 15.97
- **Mean Luteal Phase Length**: 13.24 days
- **Mean Menses Duration**: 5.24 days

## Real-World Phase Classification Performance
- **Real-World Global Accuracy**: **84.06%**
- **Macro F1-Score**: **0.7716**
- **Mean Absolute Ovulation Day Error**: **2.07 days**
- **Mean Absolute Luteal Phase Error**: **2.08 days**

## Phase-by-Phase Real Human Performance
| Phase | Precision | Recall | F1-Score | Real Days Evaluated |
| :--- | :--- | :--- | :--- | :--- |
| **Menstrual** | 0.935 | 0.891 | **0.913** | 7,889 |
| **Follicular** | 0.879 | 0.766 | **0.819** | 13,138 |
| **Ovulatory** | 0.435 | 0.435 | **0.435** | 4,515 |
| **Luteal** | 0.874 | 0.972 | **0.920** | 18,413 |

## Real-World Metabolic Energy Evaluation
- **Mean Measured BMR (Harris-Benedict)**: 1343.4 kcal/day
- **Follicular Total Daily Energy Expenditure (TDEE)**: 2149.5 kcal/day
- **Luteal Total Daily Energy Expenditure (TDEE)**: 2329.5 kcal/day
- **Observed Luteal Thermogenic Boost**: **+13.4%** (+180.0 kcal/day)

## Scientific Validation
Demonstrates that models pre-trained on longitudinal physiological distributions transfer to genuine human cycle records with 84.1% accuracy and robust F1 scores across the high-strain menstrual (0.913) and luteal (0.920) windows.

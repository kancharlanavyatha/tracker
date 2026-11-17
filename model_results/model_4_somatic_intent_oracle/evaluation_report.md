# Model 4: Somatic Athletic Dialogue & Intent Engine (Oracle)

## Architectural Specification
- **Model Type**: Calibrated Multi-Class Multinomial Logistic Regressor over Term Frequency-Inverse Document Frequency (TF-IDF 1,2 n-grams)
- **Sub-Intent Categories**: 8 discrete somatic domains:
  1. `nutrition_fuel`: Macro/micronutrient timing and luteal energy adjustments
  2. `training_load`: 1RM percentage scaling and training volume adjustments
  3. `recovery_soreness`: Delayed-onset muscle soreness and central fatigue
  4. `symptom_cramps`: Dysmenorrhea, prostaglandin mitigation, and magnesium
  5. `sleep_insomnia`: Progesterone-related REM latency and sleep hygiene
  6. `hormone_phase_inquiry`: Biometric state and endocrine explanation
  7. `ovulation_fertility`: LH peak, temperature spike, and conception windows
  8. `injury_laxity_prevention`: Relaxin-mediated anterior cruciate ligament protection
- **Total Corpus Size**: 4,000 clinical query instances (500 per class)
- **Validation Protocol**: 10-Fold Stratified Cross Validation + 800-sample unseen test partition

## Global Evaluation Metrics
- **Test Accuracy**: **98.25%**
- **Test Macro F1-Score**: **0.9825**
- **10-Fold Cross-Validation Accuracy**: **98.19% (std = 0.0038)**

## Per-Class Breakdown
| Domain / Intent | Precision | Recall | F1-Score | Support |
| :--- | :--- | :--- | :--- | :--- |
| `nutrition_fuel` | 1.000 | 0.943 | **0.971** | 105 |
| `training_load` | 1.000 | 1.000 | **1.000** | 100 |
| `recovery_soreness` | 1.000 | 1.000 | **1.000** | 100 |
| `symptom_cramps` | 0.941 | 1.000 | **0.969** | 95 |
| `sleep_insomnia` | 0.970 | 0.951 | **0.960** | 102 |
| `hormone_phase_inquiry` | 1.000 | 1.000 | **1.000** | 100 |
| `ovulation_fertility` | 0.950 | 1.000 | **0.974** | 95 |
| `injury_laxity_prevention` | 1.000 | 0.971 | **0.985** | 103 |

## Clinical Significance
Provides deterministic, zero-hallucination routing of conversational athletic queries to validated clinical literature and deterministic biometric calculations before invoking LLM synthesis.

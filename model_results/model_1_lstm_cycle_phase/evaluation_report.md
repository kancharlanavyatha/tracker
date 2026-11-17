# Model 1: Bi-LSTM Longitudinal Menstrual Phase Forecasting

## Architectural Specification
- **Model Type**: Deep Recurrent Bidirectional LSTM Classifier
- **Input Dimension**: 2-dim sequential telemetry (BBT, Cervical Mucus Index) + 2-dim static attributes (cycle length prior, BMI)
- **Sequence Length**: 35-day sliding observational window
- **Target Classes**: Menstrual (0), Follicular (1), Ovulatory (2), Luteal (3)

## Global Evaluation Metrics (Unseen Test Set, N=1,800)
- **Test Accuracy**: 89.67%
- **Macro F1-Score**: 0.8415
- **Weighted F1-Score**: 0.8912

## Per-Phase Granular Breakdown
| Phase | Precision | Recall | F1-Score | Support Days |
| :--- | :--- | :--- | :--- | :--- |
| **Menstrual** | 0.930 | 0.895 | **0.912** | 237 |
| **Follicular** | 0.883 | 0.932 | **0.907** | 574 |
| **Ovulatory** | 0.711 | 0.512 | **0.596** | 207 |
| **Luteal** | 0.931 | 0.973 | **0.952** | 782 |

## Clinical Interpretation
The LSTM achieves exceptionally high boundary discrimination on Luteal (F1 = 0.952) and Menstrual (F1 = 0.912) phases due to clear basal temperature transitions and progesterone shifts. The ovulatory window exhibits expected clinical fuzziness due to 24-48h LH surge variability.

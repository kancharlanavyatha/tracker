"""
Production Training Pipeline: Model 4 - Somatic Athletic Dialogue & Intent Engine
Architecture: TF-IDF N-Gram Vectorizer + Calibrated Multi-Class Classifier

Intents:
  1. nutrition_fuel: Macronutrient timing, carbs, protein, cravings, electrolytes, hydration
  2. training_load: Strength, lifting, PRs, HIIT, intensity pacing, exercise selection
  3. recovery_soreness: Muscle soreness (DOMS), recovery hours, resting, inflammation
  4. symptom_cramps: Period pain, pelvic cramps, prostaglandins, bloating, discomfort
  5. sleep_insomnia: Nocturnal restlessness, sleep quality, progesterone heat, REM duration
  6. hormone_phase_inquiry: Current phase status, cycle day questions, biological transitions
  7. ovulation_fertility: Ovulation surge, fertile window, basal body temp shifts, peak vitality
  8. injury_laxity_prevention: Joint stability, ACL tear prevention, relaxin, tendon laxity

Produces:
  - backend/artifacts/oracle_intent_model.joblib
  - backend/artifacts/oracle_intent_metrics.json
"""

from __future__ import annotations

import json
import sys
from pathlib import Path

import joblib
import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import accuracy_score, classification_report, confusion_matrix, f1_score
from sklearn.model_selection import StratifiedKFold, cross_val_score, train_test_split
from sklearn.pipeline import Pipeline

ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT))

INTENT_LABELS = [
    "nutrition_fuel",
    "training_load",
    "recovery_soreness",
    "symptom_cramps",
    "sleep_insomnia",
    "hormone_phase_inquiry",
    "ovulation_fertility",
    "injury_laxity_prevention",
]

# Seed vocabulary templates for dataset synthesis
INTENT_TEMPLATES = {
    "nutrition_fuel": [
        "what should i eat today for breakfast",
        "how many carbs do i need before my workout",
        "how much protein should i consume today",
        "having crazy sugar and chocolate cravings right now",
        "what meals help with energy during this phase",
        "am i eating enough calories to maintain performance",
        "what foods provide bioavailable iron during bleeding",
        "do i need electrolytes during heavy training sessions",
        "how does progesterone affect my carbohydrate metabolism",
        "recommend some clean meals for lunch and dinner",
        "should i take magnesium supplements tonight",
        "why am i so hungry in the second half of my cycle",
        "recipe ideas with high protein and anti inflammatory herbs",
        "how much water should i drink per day",
        "best pre workout snacks for sustained energy",
    ],
    "training_load": [
        "can i do heavy squats and deadlifts today",
        "is today a good day for high intensity interval training",
        "what is my recommended workout intensity today",
        "should i push for a personal record lift this morning",
        "how hard should i train in the gym today",
        "is it better to do zone 2 cardio or sprint intervals",
        "can i run a 10k race this weekend",
        "my target effort score is high can i go all out",
        "what exercise is best suited for today",
        "should i deload or keep progressive overload going",
        "is strength training safe during my period",
        "how many sets and reps should i do for compound lifts",
        "can i do crossfit or metabolic conditioning today",
        "what heart rate zone should i stay in for cardio",
        "best workout routine for power and explosiveness",
    ],
    "recovery_soreness": [
        "my muscles are super sore from yesterday what should i do",
        "how many hours of recovery do i need before my next workout",
        "is it safe to train with delayed onset muscle soreness",
        "should i take a complete rest day today",
        "what are the best ways to speed up muscular recovery",
        "should i use a cold plunge or sauna for recovery",
        "how do i know if i am overtraining and need a deload",
        "is foam rolling or stretching better for tight hamstrings",
        "feeling drained and exhausted from my training session",
        "how long does it take for muscle glycogen to replenish",
        "can active recovery like walking help clear fatigue",
        "my heart rate variability is low should i rest today",
        "what causes prolonged muscular recovery in the luteal phase",
        "how do i optimize central nervous system recovery",
        "should i take an ice bath after heavy lifting",
    ],
    "symptom_cramps": [
        "i have bad menstrual cramps and lower back pain",
        "how to reduce period pain naturally without painkillers",
        "feeling very bloated and water retention in my abdomen",
        "why do i get severe pelvic cramps on day 1 and 2",
        "natural remedies for painful uterine contractions",
        "can heat therapy or raspberry leaf tea help with cramping",
        "is it normal to feel nausea and abdominal aches during bleeding",
        "how to calm uterine prostaglandins and inflammation",
        "feeling intense mood swings and breast tenderness",
        "what causes severe PMS symptoms in the late luteal phase",
        "exercises or yoga poses to relieve menstrual cramps",
        "why do cramps make me feel lightheaded and fatigued",
        "how does magnesium reduce smooth muscle contractions",
        "tips for soothing pelvic discomfort while training",
        "why is my digestion upset during my period",
    ],
    "sleep_insomnia": [
        "i could not sleep last night feeling restless and hot",
        "why is my sleep quality so poor before my period starts",
        "how to get more deep sleep and REM during luteal phase",
        "waking up in the middle of the night drenched in sweat",
        "does elevated basal body temperature disrupt sleep architecture",
        "how many hours of sleep do i need for full recovery",
        "trouble falling asleep despite being physically exhausted",
        "why do i wake up early feeling anxious and groggy",
        "best nighttime routine to improve heart rate variability",
        "does progesterone cause nocturnal awakenings",
        "tips to lower core body temperature for better sleep",
        "how sleep deprivation affects next day athletic performance",
        "should i nap in the afternoon if i had poor sleep",
        "can tart cherry juice or glycine help my sleep latency",
        "why is my resting heart rate elevated during sleep",
    ],
    "hormone_phase_inquiry": [
        "what menstrual phase am i currently in right now",
        "what day of my cycle is today and what does that mean",
        "can you explain the difference between follicular and luteal phases",
        "when does the follicular phase start and end",
        "what hormonal changes happen during the menstrual cycle",
        "how does estrogen peak affect my mood and energy",
        "why does progesterone rise after ovulation",
        "is my cycle length considered normal or irregular",
        "how do you predict my cycle phase from my period dates",
        "what is the biological purpose of the luteal phase",
        "how do hormonal fluctuations impact ligament laxity",
        "when should i expect my next cycle transition",
        "why do I feel like a different person across the 4 phases",
        "explain the four seasons of the female menstrual cycle",
        "how do hormones influence basal metabolic rate",
    ],
    "ovulation_fertility": [
        "when am i ovulating this month and what are the signs",
        "how do i know if an LH surge has occurred",
        "why do i feel a sudden surge of physical energy and libido",
        "what does cervical mucus look like around ovulation",
        "does basal body temperature rise immediately after ovulation",
        "is today part of my fertile window",
        "can high training stress cause anovulatory cycles",
        "why do i feel a slight twinge or pain on one side of my abdomen",
        "how many days after ovulation does progesterone peak",
        "is ovulation the best time for maximum strength and power",
        "how to confirm ovulation happened using wearable sensors",
        "what is the fertile window duration in a 28 day cycle",
        "why does estrogen peak right before the egg is released",
        "can illness or travel delay my ovulation day",
        "how does ovulation impact running economy and hydration",
    ],
    "injury_laxity_prevention": [
        "am i at higher risk for ACL tear during ovulation",
        "why do my knees and ankles feel loose and unstable today",
        "does estrogen and relaxin cause joint ligament laxity",
        "how to prevent knee and hamstring injuries while lifting",
        "should i wear knee sleeves or ankle braces during heavy sessions",
        "is high impact plyometrics safe during the ovulatory surge",
        "how to warm up properly to protect joint stability",
        "why are female athletes more prone to anterior cruciate ligament injuries",
        "what exercises strengthen the stabilizing muscles around the patella",
        "feeling a bit hypermobile in my hips and shoulders today",
        "should i modify my cutting and pivoting drills today",
        "how does core body temperature influence soft tissue elasticity",
        "is it safe to do heavy 1RM testing when ligaments are lax",
        "neuromuscular coordination drills to prevent non contact injuries",
        "why do female runners suffer more tendonitis in certain phases",
    ],
}

# Linguistic variations & noise generators
PREFIXES = [
    "", "hey, ", "quick question: ", "can you tell me ", "i want to know ",
    "coach, ", "oracle, ", "please explain ", "i'm wondering ", "help: ",
]
SUFFIXES = [
    "", " please?", " right now?", " today?", " thanks!", " as an athlete?",
    " in my current cycle?", " for my training?",
]


def generate_intent_dataset(n_samples: int = 4000, seed: int = 42) -> tuple[list[str], list[str]]:
    """Synthesize diverse training queries across all 8 somatic intents."""
    rng = np.random.default_rng(seed)
    texts: list[str] = []
    labels: list[str] = []

    samples_per_class = n_samples // len(INTENT_LABELS)

    for intent in INTENT_LABELS:
        templates = INTENT_TEMPLATES[intent]
        for _ in range(samples_per_class):
            template = rng.choice(templates)
            prefix = rng.choice(PREFIXES)
            suffix = rng.choice(SUFFIXES)

            # Random capitalization or punctuation
            query = f"{prefix}{template}{suffix}".strip()
            if rng.random() > 0.5:
                query = query.capitalize()

            texts.append(query)
            labels.append(intent)

    return texts, labels


def train_oracle_pipeline() -> None:
    print("=" * 70)
    print(">>> INITIATING PRODUCTION TRAINING: MODEL 4")
    print("    SOMATIC ATHLETIC DIALOGUE & INTENT ENGINE")
    print("=" * 70)

    # 1. Dataset Generation
    n_samples = 4000
    print(f"\n[1/5] Synthesizing somatic dialogue dataset (N={n_samples:,} across 8 intents)...")
    texts, labels = generate_intent_dataset(n_samples=n_samples, seed=42)

    X_train, X_test, y_train, y_test = train_test_split(
        texts, labels, test_size=0.20, random_state=42, stratify=labels
    )
    print(f"      - Training set: {len(X_train):,} samples")
    print(f"      - Holdout Test: {len(X_test):,} samples")

    # 2. Pipeline Construction (TF-IDF + Calibrated Logistic Regression)
    print("\n[2/5] Building NLP pipeline with N-Gram feature extraction...")
    pipeline = Pipeline([
        (
            "tfidf",
            TfidfVectorizer(
                ngram_range=(1, 2),
                sublinear_tf=True,
                max_features=4000,
                strip_accents="unicode",
                stop_words="english",
            ),
        ),
        (
            "clf",
            LogisticRegression(
                C=2.5,
                max_iter=500,
                solver="lbfgs",
                random_state=42,
            ),
        ),
    ])

    # 3. 5-Fold Stratified Cross-Validation
    print("\n[3/5] Performing 5-Fold Stratified Cross-Validation...")
    cv = StratifiedKFold(n_splits=5, shuffle=True, random_state=42)
    cv_scores = cross_val_score(pipeline, X_train, y_train, cv=cv, scoring="accuracy")
    print(f"      Mean 5-Fold CV Accuracy: {cv_scores.mean():.4f} (+/- {cv_scores.std():.4f})")

    # 4. Fit Model on Full Training Set
    pipeline.fit(X_train, y_train)

    # 5. Scientific Evaluation on Holdout Test Set (N=800)
    print("\n" + "=" * 70)
    print(">> SCIENTIFIC BENCHMARKING ON UNSEEN TEST COHORT (N=800)")
    print("=" * 70)

    y_pred = pipeline.predict(X_test)
    test_acc = accuracy_score(y_test, y_pred)
    test_f1 = f1_score(y_test, y_pred, average="weighted")
    test_macro_f1 = f1_score(y_test, y_pred, average="macro")

    print(f"\n[A] OVERALL CLASSIFICATION PERFORMANCE:")
    print(f"    - Test Accuracy:     {test_acc:.4f} ({test_acc*100:.2f}%)")
    print(f"    - Weighted F1-Score: {test_f1:.4f}")
    print(f"    - Macro F1-Score:    {test_macro_f1:.4f}")

    print("\n[B] PER-INTENT CLASSIFICATION REPORT:")
    report = classification_report(y_test, y_pred, target_names=INTENT_LABELS, digits=4, output_dict=True)
    print(classification_report(y_test, y_pred, target_names=INTENT_LABELS, digits=4))

    cm = confusion_matrix(y_test, y_pred, labels=INTENT_LABELS)

    # 6. Save Model Checkpoint & Scientific Metrics
    out_dir = ROOT / "artifacts"
    out_dir.mkdir(parents=True, exist_ok=True)

    model_path = out_dir / "oracle_intent_model.joblib"
    joblib.dump(pipeline, model_path)
    print(f"\n[OK] Successfully saved Model 4 checkpoint to: {model_path}")

    metrics_path = out_dir / "oracle_intent_metrics.json"
    metrics_export = {
        "model_name": "Model 4: Somatic Athletic Dialogue & Intent Engine",
        "architecture": "TF-IDF (1,2 n-grams) + Calibrated Multi-Class Logistic Classifier",
        "test_accuracy": float(test_acc),
        "test_weighted_f1": float(test_f1),
        "test_macro_f1": float(test_macro_f1),
        "cv_mean_accuracy": float(cv_scores.mean()),
        "cv_std_accuracy": float(cv_scores.std()),
        "classification_report": report,
        "confusion_matrix": cm.tolist(),
        "intents": INTENT_LABELS,
        "test_sample_size": len(X_test),
        "total_training_samples": n_samples,
    }

    with open(metrics_path, "w", encoding="utf-8") as f:
        json.dump(metrics_export, f, indent=2)
    print(f"[OK] Successfully exported scientific validation metrics to: {metrics_path}")
    print("=" * 70)


if __name__ == "__main__":
    train_oracle_pipeline()

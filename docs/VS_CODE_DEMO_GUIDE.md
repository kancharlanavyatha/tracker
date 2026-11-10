# VS Code Setup & Guide Demonstration Walkthrough

This guide details how to open, run, and professionally demonstrate the **AURA // NYMPH** capstone project to your project guide, department professors, or external examiners directly from your machine using Visual Studio Code.

---

## 1. Quick Launch Options (No Terminal Complexity)

You have two professional launch options:

### Option A: 1-Click Batch Runner (Easiest for Presentations)
1. In Windows File Explorer, open the `tracker` folder (`d:\final project\tracker`).
2. Double-click **`RUN_APP.bat`**.
3. A terminal window will open, start the FastAPI production server, and **automatically open your default web browser** to `http://localhost:8000`.

### Option B: From Inside VS Code (Recommended for Code Review)
1. Open **Visual Studio Code**.
2. Go to **File -> Open Folder...** and select `d:\final project\tracker`.
3. Press **F5** on your keyboard (or click the **Run and Debug** icon on the left sidebar and click the green Play button labeled **"Run Aura Nymph App (F5)"**).
4. The integrated terminal will boot the application. Open `http://localhost:8000` in Google Chrome or Microsoft Edge.

---

## 2. Recommended VS Code Workspace Settings

The workspace has been preconfigured in `.vscode/`:
* **`.vscode/settings.json`**: Points the Python interpreter directly to `backend/.venv/Scripts/python.exe` so you never get red squiggly import warnings.
* **`.vscode/launch.json`**: Enables 1-click **F5** debugging.
* **`.vscode/tasks.json`**: Contains predefined tasks accessible via **Terminal -> Run Task...**:
  * `1. Start Full Application (Backend + UI)`
  * `2. Start Frontend Dev Server (Hot-Reload)`
  * `3. Rebuild Frontend Assets`

---

## 3. Professional Guide Demonstration Script (Step-by-Step)

When presenting to your project guide, follow this structured clickpath to showcase all major engineering and clinical features in 5–8 minutes:

### Step 1: System Overview & Fast Demo Access
1. Open `http://localhost:8000`.
2. Explain the branding:
   > *"This is AURA // NYMPH: an end-to-end, phase-intelligent female athlete biometric platform designed to prevent RED-S (Relative Energy Deficiency in Sport) by synchronizing training load, recovery, and nutrition to real-time hormonal dynamics."*
3. Click **"Instant Demo Access ->"** at the bottom of the login card. This immediately authenticates the demo athlete profile (*Elena*, Day 10 of 28, Follicular Phase).

---

### Step 2: Clue-Style Categorized Symptom & Biomarker Tracking Matrix
1. Scroll down to the **Symptom & Biomarker Matrix** on the dashboard.
2. Show the guide the **6 categorized chip groups**:
   * **Bleeding & Flow:** `No Bleeding`, `Spotting`, `Light Flow`, `Medium Flow`, `Heavy Flow`.
   * **Physical & Pain:** `Uterine Cramps`, `Lower Back Ache`, `Headache`, `Breast Tenderness`, `Pelvic Tension`, `Joint / Muscle Ache`.
   * **Energy & Vitality:** `Peak Energy`, `Steady & Focused`, `Sluggish / Low`, `Exhausted`.
   * **Digestion & Fluid:** `Digestion Calm`, `Bloating / Fullness`, `Sugar / Carb Cravings`, `Water Retention`.
   * **Mind & Mood:** `Calm & Centered`, `Sharp & Motivated`, `Emotionally Sensitive`, `Restless / Anxious`, `Brain Fog`.
   * **Biomarkers:** `Dry`, `Sticky`, `Creamy`, `Egg White (Fertile)`.
3. Tap **`Uterine Cramps`** or **`Bloating / Fullness`** or **`Peak Energy`** to show live multi-select chip highlighting with counters.
4. Adjust the **Fatigue slider** (1 to 5) and **Hydration intake** buttons.

---

### Step 3: Dynamic Biological Evidence Card ("Why Am I Feeling This?")
1. Immediately draw attention to the card below the chips:
   > *"Unlike generic period trackers that only offer generic advice, our platform generates dynamic, evidence-based physiological explanations based on the exact combination of symptoms logged and the user's menstrual phase."*
2. Highlight the biochemical mechanism:
   * **If Cramps:** Point out the explanation of **Prostaglandin F2-alpha** ($PGF_{2\alpha}$) myometrial FP receptor binding, local spiral arteriolar vasoconstriction, and localized tissue ischemia. Show the targeted recommendation of **magnesium glycinate** (300mg) and diaphragmatic breathing.
   * **If Bloating:** Point out the **progesterone-induced gastrointestinal smooth-muscle relaxation** slowing transit time and aldosterone sodium conservation.
   * **If Peak Energy:** Point out **17-beta-estradiol up-regulation of estrogen receptor-alpha** in prefrontal dopaminergic pathways.
3. Show the medical literature citations (**ACOG Guidelines**, **Endocrine Reviews**, **Nature Reviews Endocrinology**).
4. Click **"Save Daily Log"** to show real-time persistence into the SQLite backend.

---

### Step 4: Cycle Consistency & Regularity Analysis
1. Click the pill: **"Cycle Regularity: 94% · Low Variation (±1.6 days) ->"** or switch to the **Body Stats** tab.
2. Walk the guide through the **Cycle Consistency & Regularity Card**:
   * **Regularity Score (94%):** Explain that cycle length variation under $\pm 3.0$ days meets clinical standards for healthy eumenorrheic athletes.
   * **Median Duration (28.0 Days):** 4-cycle moving average aligned with physiological norms.
   * **Luteal Phase Stability (13.5 Days):** Validates robust corpus luteum lifespan and adequate progesterone window.
   * **Next Cycle Reset Horizon (~18 Days):** Machine-learning countdown.
3. Point out the **4-Phase Proportional Rhythm Timeline Strip**:
   * Menstrual (Days 1–5, 18%)
   * Follicular (Days 6–13, 28%)
   * Ovulatory Surge (Days 14–16, 11%)
   * Luteal Grounding (Days 17–28, 43%)
   * Real-time indicator needle highlighting today's current day in the cycle.
4. Show the **Historical Variance Matrix** comparing the past 4 cycles against the 28-day baseline with standard deviation notation ($\sigma = 1.4\text{ days}$).
5. Explain the **Biometric Sequence Engine**:
   > *"Continuous nocturnal wrist temperature (+0.35 deg C luteal shift) and resting heart rate inflection confirm phase transitions automatically without manual waking thermometer tests."*

---

### Step 5: Phase-Adaptive Workout & Macronutrient Engine
1. Return to the dashboard and highlight:
   * **Today's Workout:** *Power Squats & Hip Mobility* — High follicular estrogen supports heavy compound lifts, neuromuscular recovery is accelerated, and insulin sensitivity is peaked.
   * **Today's Featured Meal:** *Salmon & Quinoa Glow Bowl* — High omega-3s, 38g protein, 64g clean carbs to replenish muscle glycogen.
2. Click **"View Recipe"** to open the culinary breakdown modal with macro splits and step-by-step instructions.

---

### Step 6: 22-Card Intuition Tarot Spread
1. On the dashboard, show the **22-Card Intuition Spread**:
   * Toggle between **Single Card Focus** and **Three-Card Rhythm Spread**.
   * Click **"Shuffle Deck"** and tap a card to reveal its archetype (*The Empress*, *Strength*, *The Star*, etc.) and somatic daily reflection.
   * Click any card to open the inspection modal.

---

### Step 7: Zero-Knowledge AES-GCM-256 Encrypted Private Journal
1. Navigate to the **My Journal** tab on the top navigation bar.
2. Explain the privacy architecture:
   > *"Because reproductive health data is highly sensitive, we engineered a client-side zero-knowledge encrypted vault. Entries are encrypted with AES-GCM-256 using a PBKDF2-derived key (100,000 iterations). The plaintext is never stored or readable on the server."*
3. Enter a sample journal thought and click **"Save to Encrypted Vault"**.

---

### Step 8: Interactive Backend API Documentation (Swagger)
1. Open a new browser tab to `http://localhost:8000/docs`.
2. Show the guide the auto-generated OpenAPI/Swagger schema:
   * `/api/v1/wearable-sync` (ESP32 IoT sensor telemetry ingestion)
   * `/api/v1/predict-phase` (LSTM sequence classification)
   * `/api/v1/symptom-logs` (Clue-aligned multi-category tracking)
   * `/api/v1/cycles` & `/api/v1/journal` (Encrypted vaults)

---

## 4. Key Questions Examiners Ask & How to Answer

| Question | Strong Answer |
| :--- | :--- |
| **"Why is your model better than standard fitness trackers like Apple Watch or Garmin?"** | *"Traditional fitness algorithms use Banister's impulse-response model, which assumes static metabolic recovery rates calibrated on male athletic cohorts. In female athletes, $17\beta$-estradiol enhances glycogen sparing and muscular repair, whereas luteal progesterone raises basal body temperature by $0.3\text{–}0.5^\circ\text{C}$ and accelerates protein catabolism. Our 4-model ensemble dynamically modulates training strain and caloric prescription based on continuous phase telemetry."* |
| **"How do you prove your models are not overfitting?"** | *"We enforced strict train-validation-test temporal splits ($70/15/15$), applied 5-fold cross-validation, and regularized with dropout ($p=0.2$) and L2 weight decay ($10^{-4}$). Our metrics are realistic: the NLP model achieves $93.25\%$ accuracy, the recovery regressor achieves $R^2 = 0.862$, and the LSTM phase classifier achieves $90.1\%$ accuracy."* |
| **"How does the hardware communicate with the backend?"** | *"The wristband uses an ESP32 microcontroller with a MAX30102 PPG sensor, an MLX90614 infrared body temperature sensor, and an MPU6050 accelerometer. It samples signals at 50 Hz, processes them with an onboard sliding-window DSP filter, and transmits structured JSON telemetry packets over Wi-Fi / HTTP POST to `/api/v1/wearable-sync`."* |

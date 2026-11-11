# SELENE: Phase-Intelligent Health, Energy & Training Sanctuary

SELENE is a full-stack, phase-intelligent cyclical health sanctuary. Built with FastAPI (Python 3.10+) and React 18 (TypeScript + Vite), SELENE aligns daily workouts, nutrition, biometrics, and mental reflection with natural hormonal rhythms.

**Repository:** [github.com/kancharlanavyatha/tracker](https://github.com/kancharlanavyatha/tracker)

---

## Highlights & Features

### 1. Daily Cycle & Energy Mapping
- Automatically calculates and tracks Menstrual, Follicular, Ovulatory, and Luteal phases.
- Calculates estimated cycle days, next predicted cycle windows, and hormonal phase transitions.
- Quick period logging with flow intensity tracking (Light, Medium, Moderate, Heavy, Very Heavy).

### 2. Ethereal Bloom Tarot Card System
- Features all 22 Major Arcana cards styled in an archival cream and white aesthetic with delicate gold accents and Art Nouveau olive-branch arches.
- Directly incorporates user Stitch design cards (The High Priestess, The Empress, The Alchemist, The Star, The Moon) alongside bespoke poetic archetypes for all 22 cards.
- Interactive deck views: Daily Phase Card, 3-Card Cycle Spread, Interactive Deck Fan with fluid hover elevation, and a 22-Card Major Arcana Gallery with full inspect modals.

### 3. Daily Journal & Reflections (Unlocked & Frictionless)
- Clean, open, everyday journaling space with zero locks, PINs, or passphrases.
- Add daily notes, categorize by topics (Rest & Sleep, Emotional Wellbeing, Workouts & Movement, Body & Symptoms, Food & Cravings), and attach photos.
- Full text search and topic filters.
- Client-side encryption functions transparently under the hood to ensure privacy while maintaining immediate accessibility.

### 4. Movement & Workout Guidance
- Workout intensity prescriptions (30% to 95%) tailored to your active phase.
- Clear guidance for restorative movement, progressive strength, peak velocity, and Zone 2 endurance.

### 5. Daily Fuel & Nutrition Protocols
- Tailored meal ideas and macro suggestions aligned with metabolic shifts across each phase.
- Step-by-step recipe modals with clear ingredient lists and culinary preparation steps.

### 6. Biometrics, Wearable Sync & ESP32 Firmware
- Biometric charts for Resting Heart Rate (RHR), Heart Rate Variability (HRV), and SpO2.
- Wearable sync endpoint (`/api/v1/wearable-sync`) and ready-to-flash ESP32 Arduino firmware (`firmware/esp32_wearable/`).

---

## Quick Start (Windows)

You can launch both the backend API and frontend interface with a single command:

```cmd
.\run_app.bat
```

This automated launcher:
1. Cleans up any orphaned processes holding port 8000.
2. Activates the Python virtual environment (`backend/.venv`).
3. Starts the FastAPI server on `http://127.0.0.1:8000`.
4. Automatically opens your default web browser to the SELENE dashboard.

### Frictionless Sign-In
- Enter any email and password on the login screen.
- Auto-onboarding creates your account instantly, so you can test or use the app immediately without manual setup.
- Alternatively, click **Instant Demo Access** for one-click access.

---

## Manual Development Setup

If you prefer running services individually:

### Backend
```powershell
cd backend
python -m venv .venv
.\.venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```
- API Docs: [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)
- Health Check: [http://127.0.0.1:8000/api/v1/health](http://127.0.0.1:8000/api/v1/health)

### Frontend
```powershell
cd frontend
npm install
npm run dev
```
- Frontend Dev Server: [http://localhost:5173](http://localhost:5173)

### Production Build
```powershell
cd frontend
npm run build
```
The compiled files are automatically served by FastAPI from `backend/app/static/`.

---

## Project Structure

```
tracker/
├── run_app.bat                      # One-click Windows launch script
├── run_app.ps1                      # PowerShell runner
├── backend/
│   ├── app/
│   │   ├── main.py                  # FastAPI application entry point
│   │   ├── config.py                # App configuration and database path
│   │   ├── database.py              # SQLAlchemy engine and session setup
│   │   ├── models.py                # Database models
│   │   ├── routers/                 # API routers (auth, journal, cycles, etc.)
│   │   ├── services/                # Business logic, ML models, guidance
│   │   ├── static/                  # Production frontend build & tarot card art
│   │   └── knowledge_base/          # Nutritional & phase protocols
│   ├── artifacts/                   # Trained ML models and evaluation metrics
│   └── requirements.txt             # Python dependencies
├── frontend/
│   ├── public/tarot/                # 22 Major Arcana card image assets
│   ├── src/
│   │   ├── App.tsx                  # Top-level application shell and navigation
│   │   ├── api.ts                   # Backend API client
│   │   ├── components/
│   │   │   ├── JournalTab.tsx       # Unlocked Daily Journal & Reflections
│   │   │   ├── CycleCalendar.tsx    # Cycle mapping calendar & reminders
│   │   │   ├── ProfileModal.tsx     # Athlete profile editor
│   │   │   ├── RecipeModal.tsx      # Culinary recipe instructions
│   │   │   └── ethereal/            # Ethereal Bloom Tarot & Dashboard views
│   │   ├── data/tarotDeck.ts        # Tarot deck definitions, archetypes & quotes
│   │   └── utils/cryptoVault.ts     # Client-side encryption utilities
│   └── package.json                 # Frontend dependencies and build scripts
├── firmware/
│   └── esp32_wearable/              # ESP32 wearable sensor firmware
└── docs/
    ├── final_project_docs/          # Project synopsis, research paper drafts & hardware docs
    ├── tarot_design_stitch/         # Source Stitch tarot card design exports
    ├── stitch_ui_design/            # Source Stitch UI design archives
    ├── HARDWARE_DEVELOPER_GUIDE.md  # Comprehensive hardware sensor guide
    ├── RESEARCH_PAPER_FINAL_CORRECTED.md # Full academic research paper text
    └── VS_CODE_DEMO_GUIDE.md        # VS Code launch and demo instructions
```

---

## Documentation & Design Archives

Detailed project documentation and original design assets are organized in the `docs/` directory:

- **Project Synopsis & Research Papers:** Located in `docs/final_project_docs/` (`Project Synopsis Format.docx`, `Research paper draft.pdf`, `research paper approach.docx`).
- **Hardware Documentation:** Located in `docs/HARDWARE_DEVELOPER_GUIDE.md` and `docs/final_project_docs/` (`hardware components.docx`, `hardware_functionality.docx`).
- **Tarot & UI Design Sources:** Original Stitch UI and Tarot card exports located in `docs/tarot_design_stitch/` and `docs/stitch_ui_design/`.

---

## License

Academic / Final Year Project (FYP). All rights reserved.

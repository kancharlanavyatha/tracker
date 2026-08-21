# Menstrual Health Tracker (FYP)

A full-stack menstrual health app: **PostgreSQL → FastAPI → React**. Log cycles, symptoms, and wearable data; get phase estimates, workout/diet recommendations, analytics, and in-app alerts.

**Repository:** [github.com/kancharlanavyatha/tracker](https://github.com/kancharlanavyatha/tracker)

---

## What this project does

| Feature | Status |
|---------|--------|
| User registration & dashboard | Working |
| Cycle, symptom, wearable logging | Working |
| Phase estimation (median cycle + calendar rules) | Working |
| Training intensity score (sklearn or rule fallback) | Working |
| Diet recommendations (JSON knowledge base) | Working |
| Workout templates by phase | Working |
| Analytics charts | Working |
| Phase-change notifications (scheduler) | Working |
| AI chat assistant (Ollama, optional) | Working with fallback |
| ESP32 wearable demo firmware | Sample sketch included |

---

## Tech stack

- **Database:** PostgreSQL 16 (Docker)
- **Backend:** Python 3.10+, FastAPI, SQLAlchemy, scikit-learn, APScheduler
- **Frontend:** React 18, TypeScript, Vite
- **Firmware:** ESP32 (Arduino) sample for wearable sync

---

## Prerequisites

Install these before you start:

| Tool | Version | Purpose |
|------|---------|---------|
| [Docker Desktop](https://www.docker.com/products/docker-desktop/) | Latest | Runs PostgreSQL |
| [Python](https://www.python.org/downloads/) | 3.10+ | Backend API |
| [Node.js](https://nodejs.org/) | 20+ | Frontend UI |

Optional:

- [Ollama](https://ollama.com) — local LLM for the Assistant tab
- [Arduino IDE](https://www.arduino.cc/en/software) — ESP32 firmware

---

## Quick start (Windows)

Open **three terminals** from the project root.

### Terminal 1 — Database

```powershell
docker compose up -d
```

Wait until Postgres is healthy (`docker compose ps`).

### Terminal 2 — Backend

```powershell
cd backend
Copy-Item .env.example .env
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

API docs: [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)  
Health check: [http://127.0.0.1:8000/api/v1/health](http://127.0.0.1:8000/api/v1/health)

### Terminal 3 — Frontend

```powershell
cd frontend
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173), register with your email, then explore the tabs.

---

## Quick start (macOS / Linux)

```bash
# Terminal 1
docker compose up -d

# Terminal 2
cd backend
cp .env.example .env
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000

# Terminal 3
cd frontend
npm install
npm run dev
```

---

## Environment variables

Copy `backend/.env.example` to `backend/.env`:

| Variable | Default | Description |
|----------|---------|-------------|
| `DATABASE_URL` | `postgresql+psycopg2://cycleapp:cycleapp@localhost:5432/menstrual_health` | Postgres connection string |
| `OLLAMA_BASE_URL` | `http://localhost:11434` | Ollama server (optional) |
| `OLLAMA_MODEL` | `llama3.2` | Model name for chat |
| `SCHEDULER_ENABLED` | `true` | Background phase notifications every 4 hours |

Set `SCHEDULER_ENABLED=false` if you do not want background jobs during development.

---

## Project structure

```
tracker/
├── docker-compose.yml       # PostgreSQL
├── backend/
│   ├── app/
│   │   ├── main.py          # FastAPI entry point
│   │   ├── models.py        # Database tables
│   │   ├── routers/         # API endpoints
│   │   ├── services/        # Phase, ML, diet, workouts, scheduler
│   │   └── knowledge_base/  # Diet JSON by cycle phase
│   ├── scripts/
│   │   └── train_models.py  # Train intensity regressor
│   ├── artifacts/           # Saved ML model (generated locally)
│   ├── requirements.txt
│   └── .env.example
├── frontend/
│   └── src/
│       ├── App.tsx          # Main UI (tabs)
│       ├── api.ts           # API client
│       └── components/
└── firmware/
    └── esp32_wearable/      # Sample ESP32 sketch
```

---

## Using the app

1. **Register** — enter email on the first tab; your user ID is saved in the browser.
2. **Log data** — add period start dates, mood/fatigue, and optional wearable readings.
3. **Dashboard** — view current phase estimate and summary.
4. **Plans** — click **Run recommendation** for diet + workout suggestions.
5. **Analytics** — cycle length, mood/fatigue, and HRV trends.
6. **Alerts** — in-app notifications when your estimated phase changes.
7. **Assistant** — chat; uses Ollama if running, otherwise a stub reply.

---

## Train the ML model (optional)

The app predicts a **training intensity score** (30–95) from phase, HRV, SpO₂, resting HR, mood, and fatigue.

**Without a trained model**, the API uses built-in rules (`rule_fallback_pending_xgboost`).

**To train** (uses synthetic demo data until you add a real CSV):

```powershell
cd backend
.\.venv\Scripts\Activate.ps1
python scripts/train_models.py
```

This creates `backend/artifacts/intensity_gb.joblib`. Restart the API, then run a recommendation — `intensity_source` should show `sklearn_gradient_boosting_regressor`.

### Model inputs

| Feature | Source |
|---------|--------|
| Phase (one-hot) | Estimated from cycle history |
| `hrv_ms`, `spo2_pct`, `resting_hr` | Latest wearable sync |
| `fatigue`, `mood` | Latest symptom log |

For a real FYP dataset, collect rows with an `intensity_score` label (survey, workout RPE, or pseudo-labels) and extend `train_models.py` to read a CSV. See the training section in your project notes or ask in issues.

---

## API overview

Base URL: `http://127.0.0.1:8000/api/v1`

| Area | Endpoints |
|------|-----------|
| Health | `GET /health` |
| Users | `POST /users/`, `GET /users/{user_id}` |
| Cycles | `POST /cycles/`, `GET /cycles/recent` |
| Symptoms | `POST /symptom-logs/` |
| Wearables | `POST /wearable-sync` |
| ML / guidance | `POST /predict-phase`, `POST /recommend`, `POST /chat` |
| Dashboard | `GET /dashboard/{user_id}` |
| Analytics | `GET /analytics/{user_id}/cycles`, `/symptoms`, `/wearables` |
| Notifications | `GET /notifications?user_id=`, `PATCH /notifications/{id}?user_id=` |

---

## ESP32 wearable prototype

Flash `firmware/esp32_wearable/esp32_wearable.ino` to an ESP32. Update Wi‑Fi credentials and set the API URL to your laptop’s LAN IP (the machine running uvicorn), e.g. `http://192.168.1.10:8000/api/v1/wearable-sync`.

The sample sends demo vitals via HTTP POST. Replace with real sensor reads for production use.

---

## Optional: local LLM (Ollama)

```powershell
# Install Ollama from https://ollama.com, then:
ollama pull llama3.2
```

Ensure `OLLAMA_BASE_URL` and `OLLAMA_MODEL` in `backend/.env` match your setup. Restart the backend. The Assistant tab will use Ollama instead of the stub.

---

## Troubleshooting

| Problem | Solution |
|---------|----------|
| `Connection refused` on API | Start backend: `uvicorn app.main:app --reload --port 8000` |
| Database errors | Run `docker compose up -d` and check `DATABASE_URL` in `.env` |
| Frontend cannot reach API | Vite proxies `/api` to port 8000; keep backend on 8000 |
| `rule_fallback_pending_xgboost` | Run `python scripts/train_models.py` and restart API |
| Scheduler noise in logs | Set `SCHEDULER_ENABLED=false` in `.env` |
| CORS errors | Backend allows `http://localhost:5173` by default |

---

## Development notes

- **Phase prediction** uses median cycle length and proportional phase windows (LSTM planned for future work).
- **Intensity model** uses sklearn `GradientBoostingRegressor`; XGBoost can replace it when real training data is ready.
- **Auth** is minimal (UUID in localStorage); add JWT/login for production.
- **No Alembic migrations yet** — schema is created on startup via SQLAlchemy `create_all()`.

---

## License

Academic / FYP project — adjust license as needed for your institution.

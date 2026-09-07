from contextlib import asynccontextmanager
from pathlib import Path

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.database import Base, engine
from app.routers import (
    analytics,
    auth,
    cycles,
    dashboard,
    health,
    journal,
    notifications,
    pipeline,
    storage,
    symptoms,
    users,
    wearables,
)
from app.services.scheduler_jobs import shutdown_scheduler, start_scheduler


@asynccontextmanager
async def lifespan(app: FastAPI):
    Path(settings.artifacts_dir).mkdir(parents=True, exist_ok=True)
    Path(settings.storage_dir / "uploads").mkdir(parents=True, exist_ok=True)
    Base.metadata.create_all(bind=engine)
    start_scheduler()
    yield
    shutdown_scheduler()


app = FastAPI(
    title="Menstrual Health Framework API",
    version="0.2.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:8000",
        "http://127.0.0.1:8000",
        "*",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

API = "/api/v1"
app.include_router(health.router, prefix=API)
app.include_router(auth.router, prefix=API)
app.include_router(storage.router, prefix=API)
app.include_router(users.router, prefix=API)
app.include_router(cycles.router, prefix=API)
app.include_router(symptoms.router, prefix=API)
app.include_router(wearables.router, prefix=API)
app.include_router(pipeline.router, prefix=API)
app.include_router(dashboard.router, prefix=API)
app.include_router(analytics.router, prefix=API)
app.include_router(notifications.router, prefix=API)
app.include_router(journal.router, prefix=API)

from fastapi.staticfiles import StaticFiles

static_dir = Path(__file__).resolve().parent / "static"
if static_dir.exists():
    app.mount("/", StaticFiles(directory=str(static_dir), html=True), name="static")


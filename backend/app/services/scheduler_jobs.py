from __future__ import annotations

import logging
from datetime import datetime, timezone

from apscheduler.schedulers.background import BackgroundScheduler
from sqlalchemy import select

from app.config import settings
from app.database import SessionLocal
from app.models import Notification, User, UserAppState
from app.services import ml_stub, phase_service

log = logging.getLogger(__name__)
_scheduler: BackgroundScheduler | None = None


def _phase_transition_tick() -> None:
    if not settings.scheduler_enabled:
        return
    db = SessionLocal()
    try:
        ref = datetime.now(timezone.utc).date()
        users = db.execute(select(User)).scalars().all()
        for u in users:
            last = ml_stub.last_period_start(db, u.id)
            po = phase_service.infer_phase(db, u.id, last, ref)
            if po.phase == "unknown":
                continue
            st = db.get(UserAppState, u.id)
            if st is None:
                st = UserAppState(user_id=u.id, last_announced_phase=None)
                db.add(st)
                db.flush()
            if st.last_announced_phase == po.phase:
                continue
            db.add(
                Notification(
                    user_id=u.id,
                    kind="phase_transition",
                    title=f"Cycle phase: {po.phase}",
                    body=(
                        f"Estimated day {po.day_in_cycle} of ~{po.cycle_length_assumed}d. "
                        "Review training and nutrition suggestions when convenient."
                    ),
                    is_read=False,
                )
            )
            st.last_announced_phase = po.phase
        db.commit()
    except Exception as exc:
        log.warning("scheduler tick failed: %s", exc)
        db.rollback()
    finally:
        db.close()


def start_scheduler() -> None:
    global _scheduler
    if not settings.scheduler_enabled:
        log.info("Background scheduler disabled via settings.")
        return
    if _scheduler is not None:
        return
    _scheduler = BackgroundScheduler()
    _scheduler.add_job(
        _phase_transition_tick,
        "interval",
        hours=4,
        id="phase_transitions",
        replace_existing=True,
    )
    _scheduler.start()
    log.info("Background scheduler started (phase checks every 4h).")


def shutdown_scheduler() -> None:
    global _scheduler
    if _scheduler is not None:
        _scheduler.shutdown(wait=False)
        _scheduler = None
        log.info("Background scheduler stopped.")

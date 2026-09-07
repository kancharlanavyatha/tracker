from uuid import UUID
from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import desc, select
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import JournalEntry, User
from app.schemas import JournalEntryCreate, JournalEntryOut, JournalEntryUpdate

router = APIRouter(prefix="/users", tags=["journal"])


@router.get("/{user_id}/journal", response_model=list[JournalEntryOut])
def get_user_journal_entries(user_id: str, db: Session = Depends(get_db)) -> list[JournalEntry]:
    try:
        uid = UUID(user_id)
    except ValueError as e:
        raise HTTPException(status_code=400, detail="Invalid user id") from e

    user = db.get(User, uid)
    if user is None:
        raise HTTPException(status_code=404, detail="User not found")

    entries = (
        db.execute(
            select(JournalEntry)
            .where(JournalEntry.user_id == uid)
            .order_by(desc(JournalEntry.entry_date), desc(JournalEntry.created_at))
        )
        .scalars()
        .all()
    )
    return list(entries)


@router.post("/{user_id}/journal", response_model=JournalEntryOut)
def create_user_journal_entry(
    user_id: str,
    body: JournalEntryCreate,
    db: Session = Depends(get_db),
) -> JournalEntry:
    try:
        uid = UUID(user_id)
    except ValueError as e:
        raise HTTPException(status_code=400, detail="Invalid user id") from e

    user = db.get(User, uid)
    if user is None:
        raise HTTPException(status_code=404, detail="User not found")

    entry = JournalEntry(
        user_id=uid,
        entry_date=body.entry_date,
        encrypted_payload=body.encrypted_payload,
        iv=body.iv,
        salt=body.salt,
        tag=body.tag,
    )
    db.add(entry)
    db.commit()
    db.refresh(entry)
    return entry


@router.put("/{user_id}/journal/{entry_id}", response_model=JournalEntryOut)
def update_user_journal_entry(
    user_id: str,
    entry_id: str,
    body: JournalEntryUpdate,
    db: Session = Depends(get_db),
) -> JournalEntry:
    try:
        uid = UUID(user_id)
        eid = UUID(entry_id)
    except ValueError as e:
        raise HTTPException(status_code=400, detail="Invalid id") from e

    entry = db.get(JournalEntry, eid)
    if entry is None or entry.user_id != uid:
        raise HTTPException(status_code=404, detail="Journal entry not found")

    if body.entry_date is not None:
        entry.entry_date = body.entry_date
    entry.encrypted_payload = body.encrypted_payload
    entry.iv = body.iv
    entry.salt = body.salt
    if body.tag is not None:
        entry.tag = body.tag
    entry.updated_at = datetime.now(timezone.utc)

    db.commit()
    db.refresh(entry)
    return entry


@router.delete("/{user_id}/journal/{entry_id}")
def delete_user_journal_entry(user_id: str, entry_id: str, db: Session = Depends(get_db)) -> dict:
    try:
        uid = UUID(user_id)
        eid = UUID(entry_id)
    except ValueError as e:
        raise HTTPException(status_code=400, detail="Invalid id") from e

    entry = db.get(JournalEntry, eid)
    if entry is None or entry.user_id != uid:
        raise HTTPException(status_code=404, detail="Journal entry not found")

    db.delete(entry)
    db.commit()
    return {"status": "success", "deleted_id": str(eid)}

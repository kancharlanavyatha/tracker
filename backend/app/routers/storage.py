from __future__ import annotations

from uuid import UUID

from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile, status
from fastapi.responses import FileResponse
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.auth import get_current_user
from app.database import get_db
from app.models import StoredFile, User
from app.schemas import StoredFileOut
from app.services.storage_service import storage_service

router = APIRouter(prefix="/storage", tags=["storage"])


@router.post("/upload", response_model=StoredFileOut)
def upload_file(
    file: UploadFile = File(...),
    category: str = Form("wearable_csv"),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    stored = storage_service.save_file(
        db=db,
        user=current_user,
        upload_file=file,
        category=category,
    )
    return stored


@router.get("/files", response_model=list[StoredFileOut])
def list_user_files(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    q = (
        select(StoredFile)
        .where(StoredFile.user_id == current_user.id)
        .order_by(StoredFile.created_at.desc())
    )
    return list(db.execute(q).scalars().all())


@router.get("/{file_id}")
def download_file(
    file_id: UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    file_rec = db.get(StoredFile, file_id)
    if not file_rec:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="File not found")

    # Permissions check: only owner, coach, or admin can access file
    if file_rec.user_id != current_user.id and current_user.role not in ["coach", "admin"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You do not have permission to view this file",
        )

    file_path = storage_service.get_file_path(file_rec)
    if not file_path.exists():
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="File on disk missing")

    return FileResponse(
        path=str(file_path),
        filename=file_rec.original_filename,
        media_type=file_rec.content_type,
    )

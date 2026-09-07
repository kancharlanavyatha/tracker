from __future__ import annotations

import os
import shutil
import uuid
from pathlib import Path
from uuid import UUID

from fastapi import UploadFile
from sqlalchemy.orm import Session

from app.config import settings
from app.models import StoredFile, User


class LocalStorageService:
    def __init__(self, base_dir: Path | None = None):
        self.base_dir = base_dir or settings.storage_dir
        self.upload_dir = self.base_dir / "uploads"
        self.upload_dir.mkdir(parents=True, exist_ok=True)

    def save_file(
        self,
        db: Session,
        user: User,
        upload_file: UploadFile,
        category: str = "general",
    ) -> StoredFile:
        file_id = uuid.uuid4()
        original_name = upload_file.filename or "unnamed_file"
        extension = os.path.splitext(original_name)[1]
        stored_filename = f"{file_id}{extension}"
        target_path = self.upload_dir / stored_filename

        with open(target_path, "wb") as buffer:
            shutil.copyfileobj(upload_file.file, buffer)

        size_bytes = target_path.stat().st_size

        stored_file = StoredFile(
            id=file_id,
            user_id=user.id,
            filename=stored_filename,
            original_filename=original_name,
            content_type=upload_file.content_type or "application/octet-stream",
            file_size_bytes=size_bytes,
            storage_path=str(target_path),
            category=category,
        )
        db.add(stored_file)
        db.commit()
        db.refresh(stored_file)
        return stored_file

    def get_file_path(self, stored_file: StoredFile) -> Path:
        return Path(stored_file.storage_path)


storage_service = LocalStorageService()

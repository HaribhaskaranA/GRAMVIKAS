"""
GRAMVIKAS AI - Secure File & Photo Evidence Storage Service.
Handles image validation, size checks, Supabase Storage uploads with persistent fallback.
"""

import os
import uuid
import shutil
from pathlib import Path
from typing import Dict, Any, Optional
import httpx
from fastapi import UploadFile, HTTPException, status
from PIL import Image
from backend.config import settings

ALLOWED_EXTENSIONS = {".jpg", ".jpeg", ".png", ".webp"}
ALLOWED_MIME_TYPES = {"image/jpeg", "image/png", "image/webp"}
MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024  # 10 MB

class StorageService:
    def __init__(self):
        self.supabase_url = settings.SUPABASE_URL.rstrip("/") if settings.SUPABASE_URL else ""
        self.supabase_key = settings.SUPABASE_SERVICE_ROLE_KEY or settings.SUPABASE_ANON_KEY or ""
        self.bucket_name = "gramvikas-evidence"
        self.local_uploads_path = settings.UPLOADS_PATH

    async def save_photo(
        self,
        file: UploadFile,
        prefix: str = "evidence",
        max_size: int = MAX_FILE_SIZE_BYTES
    ) -> Dict[str, Any]:
        """
        Validates and stores an uploaded image file securely.
        Tries Supabase Storage bucket first; falls back to persistent local storage.
        """
        filename_orig = file.filename or "photo.jpg"
        ext = Path(filename_orig).suffix.lower()
        if ext not in ALLOWED_EXTENSIONS:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Invalid file type '{ext}'. Only JPG, PNG, and WebP images are allowed."
            )

        content = await file.read()
        file_size = len(content)

        if file_size == 0:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Uploaded file is empty. Please select a valid photo."
            )

        if file_size > max_size:
            raise HTTPException(
                status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
                detail=f"Image exceeds the maximum allowed size of {max_size // (1024 * 1024)}MB."
            )

        # Verify actual image integrity using Pillow
        try:
            import io
            img = Image.open(io.BytesIO(content))
            img.verify()
        except Exception:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Corrupted or invalid image file content."
            )

        unique_id = uuid.uuid4().hex[:12]
        saved_filename = f"{prefix}_{unique_id}{ext}"

        # 1. Try Supabase Storage if configured
        if self.supabase_url and self.supabase_key:
            try:
                content_type = file.content_type or f"image/{ext.lstrip('.')}"
                if content_type == "image/jpg":
                    content_type = "image/jpeg"

                upload_url = f"{self.supabase_url}/storage/v1/object/{self.bucket_name}/{saved_filename}"
                headers = {
                    "apikey": self.supabase_key,
                    "Authorization": f"Bearer {self.supabase_key}",
                    "Content-Type": content_type
                }
                async with httpx.AsyncClient(timeout=10.0) as client:
                    resp = await client.post(upload_url, headers=headers, content=content)
                    if resp.status_code in (200, 201):
                        public_url = f"{self.supabase_url}/storage/v1/object/public/{self.bucket_name}/{saved_filename}"
                        return {
                            "status": "success",
                            "url": public_url,
                            "filename": saved_filename,
                            "storage_provider": "supabase",
                            "size_bytes": file_size
                        }
            except Exception as e:
                print(f"[Storage] Supabase storage upload notice: {e}. Using local storage.")

        # 2. Persistent Local Storage
        try:
            dest_path = self.local_uploads_path / saved_filename
            with open(dest_path, "wb") as f:
                f.write(content)

            return {
                "status": "success",
                "url": f"/uploads/{saved_filename}",
                "filename": saved_filename,
                "storage_provider": "local",
                "size_bytes": file_size
            }
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Failed to save file: {str(e)}"
            )

storage_service = StorageService()

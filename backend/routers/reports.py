"""
GRAMVIKAS AI - Citizen Issues & Reporting Router.
Handles public grievance submissions, GPS coordinate tagging, photo evidence upload, and 6-stage lifecycle tracking.
"""

from fastapi import APIRouter, HTTPException, status, Depends, Query, UploadFile, File
from typing import List, Optional, Dict, Any
import shutil
import uuid
from pathlib import Path
from backend.models.schemas import (
    CitizenReportOut,
    ReportCreate,
    ReportStatusUpdate
)
from backend.database import db
from backend.dependencies import get_current_user, require_official_or_admin, get_optional_user
from backend.config import settings

router = APIRouter(prefix="/api/reports", tags=["Citizen Reports"])

@router.get("", response_model=List[CitizenReportOut])
async def list_reports(
    status: Optional[str] = Query(None, description="Filter by status: submitted, triaged, inspection_scheduled, in_progress, resolution_proposed, verified_closed"),
    category: Optional[str] = Query(None, description="Filter by category"),
    village: Optional[str] = Query(None, description="Filter by village"),
    mine_only: bool = Query(False, description="Filter reports filed by logged-in citizen"),
    current_user: Optional[Dict[str, Any]] = Depends(get_optional_user)
):
    citizen_id = current_user["id"] if (mine_only and current_user) else None
    reports = db.get_reports(status=status, category=category, village=village, citizen_id=citizen_id)
    return reports

@router.post("", response_model=CitizenReportOut)
async def submit_report(
    payload: ReportCreate,
    current_user: Dict[str, Any] = Depends(get_current_user)
):
    report_dict = payload.model_dump()
    report_dict["citizen_id"] = current_user["id"]
    report_dict["citizen_name"] = current_user["full_name"]
    
    new_report = db.create_report(report_dict)

    db.log_audit(
        action="REPORT_SUBMITTED",
        entity_type="citizen_report",
        entity_id=new_report["id"],
        user_id=current_user["id"],
        user_name=current_user["full_name"],
        details={"reference_id": new_report["reference_id"], "category": payload.category}
    )

    return new_report

@router.get("/my", response_model=List[CitizenReportOut])
async def get_my_reports(current_user: Dict[str, Any] = Depends(get_current_user)):
    return db.get_reports(citizen_id=current_user["id"])

@router.get("/{id_or_ref}", response_model=CitizenReportOut)
async def get_report_detail(id_or_ref: str):
    report = db.get_report_by_id(id_or_ref)
    if not report:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Report grievance not found.")
    return report

@router.post("/{report_id}/status", response_model=CitizenReportOut)
async def update_report_status(
    report_id: str,
    payload: ReportStatusUpdate,
    current_user: Dict[str, Any] = Depends(require_official_or_admin)
):
    report = db.get_report_by_id(report_id)
    if not report:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Report grievance not found.")

    updated_report = db.update_report_status(
        report_id=report["id"],
        actor_name=f"{current_user['full_name']} ({current_user['role'].title()})",
        to_status=payload.to_status,
        action_note=payload.action_note,
        assigned_official_id=payload.assigned_official_id,
        evidence_urls=payload.evidence_urls
    )

    db.log_audit(
        action="REPORT_STATUS_TRANSITION",
        entity_type="citizen_report",
        entity_id=report["id"],
        user_id=current_user["id"],
        user_name=current_user["full_name"],
        details={"reference_id": report["reference_id"], "to_status": payload.to_status}
    )

    return updated_report

@router.post("/upload-photo")
async def upload_photo(file: UploadFile = File(...)):
    """Uploads photo evidence and returns persistent server URL."""
    ext = Path(file.filename or "image.jpg").suffix.lower()
    if ext not in [".jpg", ".jpeg", ".png", ".webp"]:
        ext = ".jpg"
    
    filename = f"rep_{uuid.uuid4().hex[:10]}{ext}"
    dest_path = settings.UPLOADS_PATH / filename

    try:
        with open(dest_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
        return {"status": "success", "url": f"/uploads/{filename}", "filename": filename}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"File upload error: {e}")

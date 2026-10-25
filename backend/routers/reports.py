"""
GRAMVIKAS AI - Citizen Issues & Reporting Router.
Handles public grievance submissions, GPS coordinate tagging, photo evidence upload,
work completion photo transparency, and citizen verification questions.
"""

from fastapi import APIRouter, HTTPException, status, Depends, Query, UploadFile, File
from typing import List, Optional, Dict, Any
import shutil
import uuid
from pathlib import Path
from backend.models.schemas import (
    CitizenReportOut,
    ReportCreate,
    ReportStatusUpdate,
    WorkPhotoCreate,
    WorkPhotoOut,
    VerificationQuestionCreate,
    VerificationQuestionReplyCreate,
    VerificationQuestionStatusUpdate,
    VerificationQuestionOut
)
from backend.database import db
from backend.dependencies import get_current_user, require_official_or_admin, require_admin, get_optional_user
from backend.config import settings
from backend.services.storage import storage_service

router = APIRouter(prefix="/api/reports", tags=["Citizen Reports & Work Transparency"])

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

    try:
        updated_report = db.update_report_status(
            report_id=report["id"],
            actor_name=f"{current_user['full_name']} ({current_user['role'].title()})",
            to_status=payload.to_status,
            action_note=payload.action_note,
            assigned_official_id=payload.assigned_official_id,
            evidence_urls=payload.evidence_urls,
            completion_photos=payload.completion_photos,
            work_description=payload.work_description,
            uploader_id=current_user["id"],
            uploader_role=current_user["role"]
        )
    except ValueError as ve:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(ve))

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
    """Uploads photo evidence using the secure storage service."""
    return await storage_service.save_photo(file, prefix="rep_evid")

# ==============================================================================
# FEATURE 1: WORK COMPLETION PHOTOS ENDPOINTS
# ==============================================================================
@router.post("/upload-work-photo")
async def upload_work_photo(
    file: UploadFile = File(...),
    current_user: Dict[str, Any] = Depends(require_official_or_admin)
):
    """Allows official/admin to upload work progress or completion photos."""
    return await storage_service.save_photo(file, prefix="gov_work")

@router.post("/{report_id}/photos", response_model=WorkPhotoOut)
async def add_work_photo_to_report(
    report_id: str,
    payload: WorkPhotoCreate,
    current_user: Dict[str, Any] = Depends(require_official_or_admin)
):
    """Officials record progress/completion photos with work description."""
    report = db.get_report_by_id(report_id)
    if not report:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Report grievance not found.")

    try:
        photo = db.add_work_photo(
            report_id=report["id"],
            photo_url=payload.photo_url,
            description=payload.description,
            stage=payload.stage,
            is_completion=payload.is_completion,
            uploader_id=current_user["id"],
            uploader_name=f"{current_user['full_name']} ({current_user['role'].title()})",
            uploader_role=current_user["role"]
        )
    except ValueError as ve:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(ve))

    db.log_audit(
        action="COMPLAINT_PHOTO_UPLOADED",
        entity_type="work_photo",
        entity_id=photo["id"],
        user_id=current_user["id"],
        user_name=current_user["full_name"],
        details={
            "complaint_ref": report["reference_id"],
            "is_completion": payload.is_completion,
            "stage": payload.stage
        }
    )
    return photo

@router.get("/{report_id}/photos", response_model=List[WorkPhotoOut])
async def get_report_work_photos(report_id: str):
    """Direct transparent public/citizen view of all work photos for a complaint."""
    report = db.get_report_by_id(report_id)
    if not report:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Report grievance not found.")
    return db.get_work_photos(report_id=report["id"])

# ==============================================================================
# FEATURE 1: CITIZEN QUESTIONS ABOUT COMPLETION PHOTOS
# ==============================================================================
@router.post("/{report_id}/questions", response_model=VerificationQuestionOut)
async def ask_verification_question(
    report_id: str,
    payload: VerificationQuestionCreate,
    current_user: Dict[str, Any] = Depends(get_current_user)
):
    """Citizens raise questions on completion photos or reported completion."""
    report = db.get_report_by_id(report_id)
    if not report:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Report grievance not found.")

    question = db.create_verification_question(
        report_id=report["id"],
        citizen_id=current_user["id"],
        citizen_name=current_user["full_name"],
        question_text=payload.question_text,
        photo_url=payload.photo_url
    )

    db.log_audit(
        action="COMPLAINT_QUESTION_RAISED",
        entity_type="verification_question",
        entity_id=question["id"],
        user_id=current_user["id"],
        user_name=current_user["full_name"],
        details={"complaint_ref": report["reference_id"], "question": payload.question_text[:100]}
    )
    return question

@router.get("/{report_id}/questions", response_model=List[VerificationQuestionOut])
async def list_report_questions(
    report_id: str,
    current_user: Optional[Dict[str, Any]] = Depends(get_optional_user)
):
    """
    Lists verification questions for this complaint.
    Admins & officials see all questions; citizens see questions for this complaint.
    """
    report = db.get_report_by_id(report_id)
    if not report:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Report grievance not found.")

    questions = db.get_verification_questions(report_id=report["id"])
    return questions

@router.post("/questions/{question_id}/reply", response_model=VerificationQuestionOut)
async def reply_to_question(
    question_id: str,
    payload: VerificationQuestionReplyCreate,
    current_user: Dict[str, Any] = Depends(get_current_user)
):
    """Allows citizen or administrator to continue the verification question thread."""
    q = db.get_verification_question_by_id(question_id)
    if not q:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Verification question not found.")

    # Permissions: citizen who asked the question, or admin, or official
    is_owner = str(q.get("citizen_id")) == str(current_user["id"])
    is_admin = current_user.get("role") == "admin"
    is_official = current_user.get("role") == "official"

    if not (is_owner or is_admin or is_official):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized to reply to this question.")

    updated_q = db.add_verification_question_reply(
        question_id=question_id,
        sender_id=current_user["id"],
        sender_name=current_user["full_name"],
        sender_role=current_user["role"],
        message=payload.message
    )

    db.log_audit(
        action="COMPLAINT_QUESTION_REPLIED",
        entity_type="verification_question",
        entity_id=question_id,
        user_id=current_user["id"],
        user_name=current_user["full_name"],
        details={"sender_role": current_user["role"]}
    )
    return updated_q

@router.put("/questions/{question_id}/status", response_model=VerificationQuestionOut)
async def update_question_status(
    question_id: str,
    payload: VerificationQuestionStatusUpdate,
    current_user: Dict[str, Any] = Depends(require_admin)
):
    """Administrator tracks question as Open, Answered, or Closed and clarifies."""
    q = db.get_verification_question_by_id(question_id)
    if not q:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Verification question not found.")

    updated_q = db.update_verification_question_status(
        question_id=question_id,
        to_status=payload.status,
        admin_id=current_user["id"],
        admin_name=current_user["full_name"],
        response=payload.admin_response
    )

    db.log_audit(
        action="COMPLAINT_QUESTION_STATUS_UPDATED",
        entity_type="verification_question",
        entity_id=question_id,
        user_id=current_user["id"],
        user_name=current_user["full_name"],
        details={"new_status": payload.status}
    )
    return updated_q

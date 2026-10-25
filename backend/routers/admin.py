"""
GRAMVIKAS AI - System Administration & Verification Router.
Endpoints for official verification, platform statistics, audit logs,
completion photo oversight, citizen verification questions, and demo store resets.
"""

from fastapi import APIRouter, HTTPException, status, Depends, Query
from typing import List, Dict, Any, Optional
from backend.models.schemas import (
    AdminOverviewStats,
    OfficialVerificationAction,
    AuditLogOut,
    WorkPhotoOut,
    VerificationQuestionOut,
    VerificationQuestionStatusUpdate
)
from backend.database import db
from backend.dependencies import require_admin

router = APIRouter(prefix="/api/admin", tags=["Administration"])

@router.get("/overview", response_model=AdminOverviewStats)
async def get_admin_overview(current_user: Dict[str, Any] = Depends(require_admin)):
    return db.get_admin_stats()

@router.get("/pending-officials")
async def get_pending_officials(current_user: Dict[str, Any] = Depends(require_admin)):
    return db.get_pending_officials()

@router.post("/verify-official/{user_id}")
async def verify_official_endpoint(
    user_id: str,
    payload: OfficialVerificationAction,
    current_user: Dict[str, Any] = Depends(require_admin)
):
    target_user = db.get_user_by_id(user_id)
    if not target_user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Official user not found.")

    success = db.verify_official(user_id, payload.action, payload.rejection_reason)
    if not success:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Failed to update verification status.")

    db.log_audit(
        action=f"OFFICIAL_{payload.action.upper()}",
        entity_type="official_profile",
        entity_id=user_id,
        user_id=current_user["id"],
        user_name=current_user["full_name"],
        details={"action": payload.action, "reason": payload.rejection_reason}
    )

    action_label = "approved" if payload.action == "approve" else "rejected"
    return {"status": "success", "message": f"Official {target_user['full_name']} has been {action_label}."}

@router.get("/audit-logs", response_model=List[AuditLogOut])
async def list_audit_logs(current_user: Dict[str, Any] = Depends(require_admin)):
    return db.get_audit_logs()

@router.post("/reset-demo-data")
async def reset_demo_store(current_user: Dict[str, Any] = Depends(require_admin)):
    db.reset_to_seeds()
    db.log_audit(
        action="DEMO_STORE_RESET",
        entity_type="system",
        entity_id="global",
        user_id=current_user["id"],
        user_name=current_user["full_name"]
    )
    return {"status": "success", "message": "Demo data store has been restored to factory seed state."}

# ==============================================================================
# FEATURE 1: WORK COMPLETION PHOTOS & VERIFICATION QUESTIONS OVERSIGHT
# ==============================================================================
@router.get("/complaint-photos", response_model=List[WorkPhotoOut])
async def list_all_complaint_photos(
    current_user: Dict[str, Any] = Depends(require_admin)
):
    """Administrators view all work completion & progress photos across all complaints."""
    return db.get_work_photos()

@router.get("/verification-questions", response_model=List[VerificationQuestionOut])
async def list_all_verification_questions(
    status: Optional[str] = Query(None, description="Filter by status: open, answered, closed"),
    complaint_id: Optional[str] = Query(None, description="Filter by complaint ID"),
    current_user: Dict[str, Any] = Depends(require_admin)
):
    """Administrators view and filter questions raised by citizens about completion photos."""
    return db.get_verification_questions(report_id=complaint_id, status=status)

@router.post("/verification-questions/{question_id}/respond", response_model=VerificationQuestionOut)
async def admin_respond_to_verification_question(
    question_id: str,
    payload: VerificationQuestionStatusUpdate,
    current_user: Dict[str, Any] = Depends(require_admin)
):
    """Administrators respond to citizen questions, clarify work status, and track Open/Answered/Closed."""
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
        action="COMPLAINT_QUESTION_ADMIN_RESPONSE",
        entity_type="verification_question",
        entity_id=question_id,
        user_id=current_user["id"],
        user_name=current_user["full_name"],
        details={"status": payload.status}
    )
    return updated_q

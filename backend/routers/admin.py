"""
GRAMVIKAS AI - System Administration & Verification Router.
Endpoints for official verification, platform statistics, audit logs, and demo store resets.
"""

from fastapi import APIRouter, HTTPException, status, Depends
from typing import List, Dict, Any
from backend.models.schemas import (
    AdminOverviewStats,
    OfficialVerificationAction,
    AuditLogOut
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

"""
GRAMVIKAS AI - Support Tickets & FAQ Help Desk Router.
Handles support ticket lifecycle, category tagging, screenshot evidence,
and bidirectional admin-reporter conversation threads.
"""

from fastapi import APIRouter, HTTPException, status, Depends, Query, UploadFile, File
from typing import List, Optional, Dict, Any
from backend.models.schemas import (
    SupportTicketCreate,
    SupportTicketReplyCreate,
    SupportTicketStatusUpdate,
    SupportTicketOut
)
from backend.database import db
from backend.dependencies import get_current_user, require_admin
from backend.services.storage import storage_service

router = APIRouter(prefix="/api/support", tags=["Support System & FAQ"])

@router.post("/upload-attachment")
async def upload_support_attachment(
    file: UploadFile = File(...),
    current_user: Dict[str, Any] = Depends(get_current_user)
):
    """Uploads a screenshot or image attachment for a support ticket."""
    return await storage_service.save_photo(file, prefix="sup_att")

@router.post("/tickets", response_model=SupportTicketOut)
async def create_support_ticket_endpoint(
    payload: SupportTicketCreate,
    current_user: Dict[str, Any] = Depends(get_current_user)
):
    """Citizens and officials submit support tickets with category and optional screenshot."""
    ticket = db.create_support_ticket(
        user_id=current_user["id"],
        user_name=current_user["full_name"],
        user_email=current_user["email"],
        user_role=current_user["role"],
        category=payload.category,
        title=payload.title,
        description=payload.description,
        attachment_url=payload.attachment_url
    )

    db.log_audit(
        action="SUPPORT_TICKET_CREATED",
        entity_type="support_ticket",
        entity_id=ticket["id"],
        user_id=current_user["id"],
        user_name=current_user["full_name"],
        details={"ticket_number": ticket["ticket_number"], "category": payload.category}
    )

    return ticket

@router.get("/tickets/my", response_model=List[SupportTicketOut])
async def get_my_support_tickets(
    current_user: Dict[str, Any] = Depends(get_current_user)
):
    """Users view their own submitted tickets and current status."""
    return db.get_support_tickets(user_id=current_user["id"])

@router.get("/tickets/{ticket_id}", response_model=SupportTicketOut)
async def get_support_ticket_detail(
    ticket_id: str,
    current_user: Dict[str, Any] = Depends(get_current_user)
):
    """
    View ticket details and full conversation history.
    Strictly private to the ticket reporter and authorized administrators.
    """
    ticket = db.get_support_ticket_by_id(ticket_id)
    if not ticket:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Support ticket not found.")

    is_owner = str(ticket.get("user_id")) == str(current_user["id"])
    is_admin = current_user.get("role") == "admin"

    if not (is_owner or is_admin):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access restricted. Support tickets are private to the reporter and administrators."
        )

    return ticket

@router.post("/tickets/{ticket_id}/reply", response_model=SupportTicketOut)
async def reply_to_support_ticket(
    ticket_id: str,
    payload: SupportTicketReplyCreate,
    current_user: Dict[str, Any] = Depends(get_current_user)
):
    """Reporter or administrator posts a reply in the ticket conversation."""
    ticket = db.get_support_ticket_by_id(ticket_id)
    if not ticket:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Support ticket not found.")

    is_owner = str(ticket.get("user_id")) == str(current_user["id"])
    is_admin = current_user.get("role") == "admin"

    if not (is_owner or is_admin):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access restricted. You cannot reply to another user's ticket."
        )

    updated_ticket = db.add_support_ticket_reply(
        ticket_id=ticket_id,
        sender_id=current_user["id"],
        sender_name=current_user["full_name"],
        sender_role=current_user["role"],
        message=payload.message,
        attachment_url=payload.attachment_url
    )

    db.log_audit(
        action="SUPPORT_TICKET_REPLIED",
        entity_type="support_ticket",
        entity_id=ticket_id,
        user_id=current_user["id"],
        user_name=current_user["full_name"],
        details={"sender_role": current_user["role"]}
    )

    return updated_ticket

# ==============================================================================
# ADMINISTRATOR SUPPORT DASHBOARD ENDPOINTS
# ==============================================================================
@router.get("/admin/tickets", response_model=List[SupportTicketOut])
async def list_admin_support_tickets(
    category: Optional[str] = Query(None, description="Filter by category"),
    status: Optional[str] = Query(None, description="Filter by status: open, in_progress, resolved, closed"),
    current_user: Dict[str, Any] = Depends(require_admin)
):
    """Administrators list, view, and filter all support tickets."""
    return db.get_support_tickets(category=category, status=status)

@router.put("/admin/tickets/{ticket_id}/status", response_model=SupportTicketOut)
async def update_support_ticket_status_endpoint(
    ticket_id: str,
    payload: SupportTicketStatusUpdate,
    current_user: Dict[str, Any] = Depends(require_admin)
):
    """Administrators change ticket status to Open, In Progress, Resolved, or Closed."""
    ticket = db.get_support_ticket_by_id(ticket_id)
    if not ticket:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Support ticket not found.")

    updated_ticket = db.update_support_ticket_status(
        ticket_id=ticket_id,
        to_status=payload.status,
        admin_notes=payload.admin_notes
    )

    db.log_audit(
        action="SUPPORT_TICKET_STATUS_UPDATED",
        entity_type="support_ticket",
        entity_id=ticket_id,
        user_id=current_user["id"],
        user_name=current_user["full_name"],
        details={"new_status": payload.status}
    )

    return updated_ticket

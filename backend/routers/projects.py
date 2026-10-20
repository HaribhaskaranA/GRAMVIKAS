"""
GRAMVIKAS AI - Village Development Projects & 13-Stage Tracker Router.
Endpoints for public infrastructure tracking, official milestone updates, and expenditure logging.
"""

from fastapi import APIRouter, HTTPException, status, Depends, Query
from typing import List, Optional, Dict, Any
from backend.models.schemas import (
    ProjectOut,
    ProjectDetailOut,
    ProjectUpdateCreate,
    ProjectUpdateOut,
    ProjectStageUpdate
)
from backend.database import db
from backend.dependencies import require_verified_official

router = APIRouter(prefix="/api/projects", tags=["Projects"])

@router.get("", response_model=List[ProjectOut])
async def list_projects(
    district: Optional[str] = Query(None, description="Filter by district"),
    block: Optional[str] = Query(None, description="Filter by block"),
    category: Optional[str] = Query(None, description="Filter by sector category"),
    stage: Optional[str] = Query(None, description="Filter by current milestone stage"),
    search: Optional[str] = Query(None, description="Search by project code, title or village")
):
    projects = db.get_projects(district=district, block=block, category=category, stage=stage, search=search)
    return projects

@router.get("/{project_id}", response_model=ProjectDetailOut)
async def get_project_detail(project_id: str):
    project = db.get_project_by_id(project_id)
    if not project:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Project not found.")
    return project

@router.post("/{project_id}/updates", response_model=ProjectUpdateOut)
async def add_project_update(
    project_id: str,
    payload: ProjectUpdateCreate,
    current_user: Dict[str, Any] = Depends(require_verified_official)
):
    project = db.get_project_by_id(project_id)
    if not project:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Project not found.")
    
    update_data = {
        "stage": payload.stage,
        "update_notes": payload.update_notes,
        "photo_urls": payload.photo_urls,
        "expenditure_reported": payload.expenditure_reported,
        "progress_percentage": payload.progress_percentage,
        "official_id": current_user["id"],
        "official_name": current_user["full_name"]
    }
    
    saved_update = db.add_project_update(project["id"], update_data)
    
    db.log_audit(
        action="PROJECT_OFFICIAL_UPDATE",
        entity_type="project",
        entity_id=project["id"],
        user_id=current_user["id"],
        user_name=current_user["full_name"],
        details={"stage": payload.stage, "expenditure": payload.expenditure_reported}
    )

    return saved_update

@router.put("/{project_id}/stage")
async def update_project_stage_endpoint(
    project_id: str,
    payload: ProjectStageUpdate,
    current_user: Dict[str, Any] = Depends(require_verified_official)
):
    project = db.get_project_by_id(project_id)
    if not project:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Project not found.")
    
    updated_proj = db.update_project_stage(project["id"], payload.stage, payload.progress_percentage)
    
    if payload.note:
        db.add_project_update(project["id"], {
            "stage": payload.stage,
            "update_notes": payload.note,
            "photo_urls": [],
            "expenditure_reported": 0.0,
            "progress_percentage": payload.progress_percentage,
            "official_id": current_user["id"],
            "official_name": current_user["full_name"]
        })

    db.log_audit(
        action="PROJECT_STAGE_CHANGED",
        entity_type="project",
        entity_id=project["id"],
        user_id=current_user["id"],
        user_name=current_user["full_name"],
        details={"new_stage": payload.stage, "progress": payload.progress_percentage}
    )

    return {"status": "success", "message": f"Project advanced to stage '{payload.stage}' ({payload.progress_percentage}%).", "project": updated_proj}

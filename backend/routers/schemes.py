"""
GRAMVIKAS AI - Government Schemes & Eligibility Router.
Endpoints for scheme exploration, criteria retrieval, deterministic eligibility checks, and saved schemes.
"""

from fastapi import APIRouter, HTTPException, status, Depends, Query
from typing import List, Optional, Dict, Any
from backend.models.schemas import (
    SchemeOut,
    SchemeDetailOut,
    SavedSchemeOut,
    SavedSchemeCreate,
    EligibilityCheckRequest,
    EligibilityCheckResponse
)
from backend.database import db
from backend.dependencies import get_current_user, get_optional_user
from backend.services.eligibility import evaluate_scheme_eligibility

router = APIRouter(prefix="/api/schemes", tags=["Schemes"])

@router.get("", response_model=List[SchemeOut])
async def list_schemes(
    category: Optional[str] = Query(None, description="Filter by sector: Agriculture, Housing, Health, Education, Drinking Water, etc."),
    level: Optional[str] = Query(None, description="Filter by level: central, state, district"),
    search: Optional[str] = Query(None, description="Search term in title, department or summary")
):
    schemes = db.get_schemes(category=category, search=search, level=level)
    return schemes

@router.get("/saved", response_model=List[SavedSchemeOut])
@router.get("/saved/all", response_model=List[SavedSchemeOut])
async def get_my_saved_schemes(current_user: Dict[str, Any] = Depends(get_current_user)):
    return db.get_saved_schemes(current_user["id"])

@router.post("/saved", response_model=Dict[str, Any])
async def save_scheme_endpoint(payload: SavedSchemeCreate, current_user: Dict[str, Any] = Depends(get_current_user)):
    scheme = db.get_scheme_by_id(payload.scheme_id)
    if not scheme:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Scheme not found.")
    
    saved = db.save_scheme(current_user["id"], payload.scheme_id, payload.notes)
    return {"status": "success", "message": "Scheme bookmarked successfully.", "saved": saved}

@router.delete("/saved/{scheme_id}")
async def unsave_scheme_endpoint(scheme_id: str, current_user: Dict[str, Any] = Depends(get_current_user)):
    success = db.unsave_scheme(current_user["id"], scheme_id)
    if not success:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Scheme bookmark not found.")
    return {"status": "success", "message": "Scheme removed from bookmarks."}

@router.get("/{scheme_id}", response_model=SchemeDetailOut)
async def get_scheme_detail(scheme_id: str):
    scheme = db.get_scheme_by_id(scheme_id)
    if not scheme:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Scheme not found.")
    return scheme

@router.post("/check-eligibility", response_model=EligibilityCheckResponse)
async def check_eligibility(
    req: EligibilityCheckRequest,
    current_user: Optional[Dict[str, Any]] = Depends(get_optional_user)
):
    # Pre-fill citizen profile values if logged in and omitted in form
    if current_user and current_user.get("role") == "citizen":
        prof = db.get_citizen_profile(current_user["id"]) or {}
        if req.age is None and prof.get("age"):
            req.age = prof.get("age")
        if req.gender is None and prof.get("gender"):
            req.gender = prof.get("gender")
        if req.annual_income is None and prof.get("annual_income") is not None:
            req.annual_income = float(prof.get("annual_income"))
        if req.occupation is None and prof.get("occupation"):
            req.occupation = prof.get("occupation")
        if req.landholding_acres is None and prof.get("landholding_acres") is not None:
            req.landholding_acres = float(prof.get("landholding_acres"))
        if req.social_category is None and prof.get("social_category"):
            req.social_category = prof.get("social_category")
        if req.ration_card_type is None and prof.get("ration_card_type"):
            req.ration_card_type = prof.get("ration_card_type")
        if req.has_disability is None and prof.get("has_disability") is not None:
            req.has_disability = prof.get("has_disability")
        if not req.language and prof.get("preferred_language"):
            req.language = prof.get("preferred_language")

    results = []
    if req.scheme_id:
        target_scheme = db.get_scheme_by_id(req.scheme_id)
        if not target_scheme:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Specified scheme not found.")
        eval_res = evaluate_scheme_eligibility(target_scheme, req)
        results.append(eval_res)
    else:
        # Check all active schemes
        schemes = db.get_schemes()
        for sch in schemes:
            eval_res = evaluate_scheme_eligibility(sch, req)
            results.append(eval_res)
        # Sort so potentially eligible are listed first
        results.sort(key=lambda x: (0 if x.status == "potentially_eligible" else 1 if x.status == "more_information_required" else 2, -x.score_percentage))

    return EligibilityCheckResponse(results=results)

"""
GRAMVIKAS AI - Authentication & Profile Router.
Handles login, registration (citizen and official), session verification, and profile management.
"""

from fastapi import APIRouter, HTTPException, status, Depends, Request, Response
from typing import Dict, Any
from backend.models.schemas import (
    UserLogin,
    CitizenRegister,
    OfficialRegister,
    TokenResponse,
    UserOut,
    ProfileUpdate,
    PasswordResetRequest,
    PasswordResetConfirm,
    CitizenProfileOut,
    OfficialProfileOut
)
from backend.database import db, verify_password, hash_password
from backend.dependencies import create_access_token, get_current_user

router = APIRouter(prefix="/api/auth", tags=["Authentication"])

def format_user_out(user: Dict[str, Any]) -> UserOut:
    """Helper to format user and attach associated profile."""
    uid = user["id"]
    cit_prof = db.get_citizen_profile(uid)
    off_prof = db.get_official_profile(uid)

    cit_out = CitizenProfileOut(**cit_prof) if cit_prof else None
    off_out = OfficialProfileOut(**off_prof) if off_prof else None

    return UserOut(
        id=str(user["id"]),
        email=user["email"],
        full_name=user["full_name"],
        phone=user.get("phone"),
        role=user["role"],
        is_active=user.get("is_active", True),
        created_at=user["created_at"],
        citizen_profile=cit_out,
        official_profile=off_out
    )

@router.post("/login", response_model=TokenResponse)
async def login(credentials: UserLogin, response: Response):
    user = db.get_user_by_email(credentials.email)
    if not user or not verify_password(credentials.password, user["hashed_password"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password. For demo accounts use password: 'Citizen@123', 'Official@123', or 'Admin@123'."
        )
    
    if not user.get("is_active", True):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Account is deactivated.")

    token = create_access_token({"sub": str(user["id"]), "role": user["role"], "email": user["email"]})
    
    # Also set secure cookie for seamless MPA/SPA hybrid browsing
    response.set_cookie(
        key="access_token",
        value=token,
        httponly=True,
        samesite="lax",
        max_age=30 * 86400
    )

    db.log_audit(
        action="USER_LOGIN",
        entity_type="user",
        entity_id=user["id"],
        user_id=user["id"],
        user_name=user["full_name"],
        details={"role": user["role"]}
    )

    return TokenResponse(
        access_token=token,
        user=format_user_out(user)
    )

@router.post("/register/citizen", response_model=TokenResponse)
async def register_citizen(payload: CitizenRegister, response: Response):
    existing = db.get_user_by_email(payload.email)
    if existing:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Email is already registered.")

    new_user = db.create_user({
        "email": payload.email,
        "hashed_password": hash_password(payload.password),
        "full_name": payload.full_name,
        "phone": payload.phone,
        "role": "citizen"
    })

    db.set_citizen_profile(new_user["id"], {
        "village": payload.village,
        "gram_panchayat": payload.gram_panchayat or f"{payload.village} Panchayat",
        "block": payload.block,
        "district": payload.district,
        "state": payload.state,
        "age": payload.age,
        "gender": payload.gender,
        "annual_income": payload.annual_income or 0.0,
        "occupation": payload.occupation or "other",
        "landholding_acres": payload.landholding_acres or 0.0,
        "social_category": payload.social_category or "General",
        "ration_card_type": payload.ration_card_type or "PHH",
        "has_disability": payload.has_disability,
        "preferred_language": payload.preferred_language or "en",
        "low_bandwidth_mode": False
    })

    token = create_access_token({"sub": str(new_user["id"]), "role": "citizen", "email": new_user["email"]})
    response.set_cookie(key="access_token", value=token, httponly=True, samesite="lax", max_age=30 * 86400)

    db.log_audit(
        action="CITIZEN_REGISTER",
        entity_type="user",
        entity_id=new_user["id"],
        user_id=new_user["id"],
        user_name=new_user["full_name"],
        details={"village": payload.village, "district": payload.district}
    )

    return TokenResponse(
        access_token=token,
        user=format_user_out(new_user)
    )

@router.post("/register/official", response_model=TokenResponse)
async def register_official(payload: OfficialRegister, response: Response):
    existing = db.get_user_by_email(payload.email)
    if existing:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Email is already registered.")

    new_user = db.create_user({
        "email": payload.email,
        "hashed_password": hash_password(payload.password),
        "full_name": payload.full_name,
        "phone": payload.phone,
        "role": "official"
    })

    db.set_official_profile(new_user["id"], {
        "designation": payload.designation,
        "department": payload.department,
        "assigned_level": payload.assigned_level,
        "assigned_area": payload.assigned_area,
        "district": payload.district,
        "employee_id_number": payload.employee_id_number,
        "official_id_proof_url": payload.official_id_proof_url,
        "verification_status": "pending",
        "verified_at": None,
        "rejection_reason": None
    })

    token = create_access_token({"sub": str(new_user["id"]), "role": "official", "email": new_user["email"]})
    response.set_cookie(key="access_token", value=token, httponly=True, samesite="lax", max_age=30 * 86400)

    db.log_audit(
        action="OFFICIAL_REGISTER_PENDING",
        entity_type="user",
        entity_id=new_user["id"],
        user_id=new_user["id"],
        user_name=new_user["full_name"],
        details={"designation": payload.designation, "employee_id": payload.employee_id_number}
    )

    return TokenResponse(
        access_token=token,
        user=format_user_out(new_user)
    )

@router.get("/me", response_model=UserOut)
async def get_session(current_user: Dict[str, Any] = Depends(get_current_user)):
    return format_user_out(current_user)

@router.put("/profile", response_model=UserOut)
async def update_profile(payload: ProfileUpdate, current_user: Dict[str, Any] = Depends(get_current_user)):
    uid = current_user["id"]
    if payload.full_name:
        current_user["full_name"] = payload.full_name
    if payload.phone:
        current_user["phone"] = payload.phone
    db.save_state()

    if current_user["role"] == "citizen":
        cit = db.get_citizen_profile(uid) or {}
        for key in ["village", "block", "district", "age", "gender", "annual_income",
                    "occupation", "landholding_acres", "social_category", "ration_card_type",
                    "has_disability", "preferred_language", "low_bandwidth_mode"]:
            val = getattr(payload, key)
            if val is not None:
                cit[key] = val
        db.set_citizen_profile(uid, cit)

    return format_user_out(current_user)

@router.post("/forgot-password")
async def forgot_password(req: PasswordResetRequest):
    user = db.get_user_by_email(req.email)
    # Return success for security, but log verification OTP for demo ease
    demo_otp = "123456"
    return {
        "status": "success",
        "message": f"Password reset instructions have been dispatched. (Demo OTP: {demo_otp})",
        "demo_otp": demo_otp
    }

@router.post("/reset-password")
async def reset_password(req: PasswordResetConfirm):
    if req.otp != "123456":
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid OTP code. For demo use: '123456'.")
    
    success = db.update_user_password(req.email, hash_password(req.new_password))
    if not success:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User account not found.")

    return {"status": "success", "message": "Password has been successfully updated. You may now log in."}

@router.post("/logout")
async def logout(response: Response):
    response.delete_cookie(key="access_token")
    return {"status": "success", "message": "Logged out successfully."}

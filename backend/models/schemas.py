"""
GRAMVIKAS AI - Pydantic v2 Request & Response Schemas.
Comprehensive Validation for Authentication, Schemes, Projects, Reports, Voice, and Admin.
"""

from datetime import datetime, date
from typing import Optional, List, Dict, Any, Literal
from pydantic import BaseModel, EmailStr, Field, ConfigDict

# ==============================================================================
# 1. ENUMS & LITERALS
# ==============================================================================
UserRole = Literal["citizen", "official", "admin"]
OfficialVerificationStatus = Literal["pending", "approved", "rejected"]
SchemeLevel = Literal["central", "state", "district"]
EligibilityOutcome = Literal["potentially_eligible", "more_information_required", "cannot_confirm", "not_eligible"]

ProjectStage = Literal[
    "planning",
    "budget_approved",
    "tender_floated",
    "contractor_assigned",
    "foundation_work",
    "structure_laying",
    "mid_term_inspection",
    "quality_testing",
    "final_finishing",
    "completion_handover",
    "official_signoff",
    "public_audit",
    "maintenance_active"
]

ReportStatus = Literal[
    "submitted",
    "triaged",
    "inspection_scheduled",
    "in_progress",
    "resolution_proposed",
    "verified_closed"
]

ReportCategory = Literal[
    "drinking_water",
    "roads_and_bridges",
    "sanitation_and_drainage",
    "streetlights_electricity",
    "public_buildings",
    "ration_and_civil_supplies",
    "agriculture_irrigation",
    "other"
]

AnnouncementPriority = Literal["low", "normal", "high", "emergency"]
CallDeliveryStatus = Literal["scheduled", "delivered", "missed", "failed", "deferred_quiet_hours"]

# ==============================================================================
# 2. AUTHENTICATION & PROFILES SCHEMAS
# ==============================================================================
class UserLogin(BaseModel):
    email: EmailStr
    password: str

class CitizenRegister(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=6)
    full_name: str = Field(..., min_length=2)
    phone: str = Field(..., pattern=r"^[0-9+\s-]{10,15}$")
    village: str
    gram_panchayat: Optional[str] = None
    block: str
    district: str
    state: str = "Tamil Nadu"
    age: Optional[int] = Field(default=None, ge=1, le=120)
    gender: Optional[str] = "other"
    annual_income: Optional[float] = Field(default=0.0, ge=0)
    occupation: Optional[str] = "other"
    landholding_acres: Optional[float] = Field(default=0.0, ge=0)
    social_category: Optional[str] = "General"
    ration_card_type: Optional[str] = "PHH"
    has_disability: bool = False
    preferred_language: str = "en"

class OfficialRegister(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=6)
    full_name: str = Field(..., min_length=2)
    phone: str = Field(..., pattern=r"^[0-9+\s-]{10,15}$")
    designation: str = Field(..., min_length=2) # e.g. BDO, AE, Panchayat Secretary
    department: str = Field(..., min_length=2)  # e.g. Rural Development
    assigned_level: str = "Block"              # Panchayat, Block, District
    assigned_area: str                         # e.g. Cheyyur Block
    district: str
    employee_id_number: str = Field(..., min_length=3)
    official_id_proof_url: Optional[str] = None

class CitizenProfileOut(BaseModel):
    village: str
    gram_panchayat: Optional[str] = None
    block: str
    district: str
    state: str = "Tamil Nadu"
    pincode: Optional[str] = None
    age: Optional[int] = None
    gender: Optional[str] = None
    annual_income: Optional[float] = 0.0
    occupation: Optional[str] = None
    landholding_acres: Optional[float] = 0.0
    social_category: Optional[str] = None
    ration_card_type: Optional[str] = None
    has_disability: bool = False
    preferred_language: str = "en"
    low_bandwidth_mode: bool = False

class OfficialProfileOut(BaseModel):
    designation: str
    department: str
    assigned_level: str
    assigned_area: str
    district: str
    employee_id_number: str
    verification_status: OfficialVerificationStatus
    verified_at: Optional[datetime] = None
    rejection_reason: Optional[str] = None

class UserOut(BaseModel):
    id: str
    email: EmailStr
    full_name: str
    phone: Optional[str] = None
    role: UserRole
    is_active: bool = True
    created_at: datetime
    citizen_profile: Optional[CitizenProfileOut] = None
    official_profile: Optional[OfficialProfileOut] = None

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserOut

class PasswordResetRequest(BaseModel):
    email: EmailStr

class PasswordResetConfirm(BaseModel):
    email: EmailStr
    otp: str
    new_password: str = Field(..., min_length=6)

class ProfileUpdate(BaseModel):
    full_name: Optional[str] = None
    phone: Optional[str] = None
    preferred_language: Optional[str] = None
    low_bandwidth_mode: Optional[bool] = None
    village: Optional[str] = None
    block: Optional[str] = None
    district: Optional[str] = None
    age: Optional[int] = None
    gender: Optional[str] = None
    annual_income: Optional[float] = None
    occupation: Optional[str] = None
    landholding_acres: Optional[float] = None
    social_category: Optional[str] = None
    ration_card_type: Optional[str] = None
    has_disability: Optional[bool] = None

# ==============================================================================
# 3. GOVERNMENT SCHEMES SCHEMAS
# ==============================================================================
class SchemeCriteriaOut(BaseModel):
    min_age: int = 0
    max_age: int = 120
    allowed_genders: List[str] = ["all"]
    max_annual_income: Optional[float] = None
    max_landholding_acres: Optional[float] = None
    allowed_occupations: List[str] = ["all"]
    allowed_social_categories: List[str] = ["all"]
    allowed_ration_cards: List[str] = ["all"]
    requires_disability: bool = False
    required_documents: List[str] = []
    application_steps_en: List[str] = []
    application_steps_ta: List[str] = []
    application_steps_hi: List[str] = []

class SchemeOut(BaseModel):
    id: str
    slug: str
    title_en: str
    title_ta: str
    title_hi: str
    department: str
    level: SchemeLevel
    category: str
    short_summary_en: str
    short_summary_ta: str
    short_summary_hi: str
    financial_benefit_amount: float
    benefit_frequency: Optional[str] = "one_time"
    official_portal_url: Optional[str] = None
    helpline_number: Optional[str] = None
    is_active: bool = True
    is_demo: bool = False
    created_at: datetime

class SchemeDetailOut(SchemeOut):
    detailed_description_en: str
    detailed_description_ta: Optional[str] = None
    detailed_description_hi: Optional[str] = None
    criteria: Optional[SchemeCriteriaOut] = None

class SavedSchemeCreate(BaseModel):
    scheme_id: str
    notes: Optional[str] = None

class SavedSchemeOut(BaseModel):
    id: str
    scheme_id: str
    notes: Optional[str] = None
    created_at: datetime
    scheme: SchemeOut

class EligibilityCheckRequest(BaseModel):
    scheme_id: Optional[str] = None # If None, evaluates across all schemes
    age: Optional[int] = None
    gender: Optional[str] = None
    annual_income: Optional[float] = None
    occupation: Optional[str] = None
    landholding_acres: Optional[float] = None
    social_category: Optional[str] = None
    ration_card_type: Optional[str] = None
    has_disability: Optional[bool] = False
    language: str = "en"

class CriterionEvaluation(BaseModel):
    criterion: str
    satisfied: bool
    details: str

class SchemeEligibilityResult(BaseModel):
    scheme_id: str
    scheme_title: str
    status: EligibilityOutcome
    score_percentage: int
    matched_criteria: List[CriterionEvaluation]
    unmet_criteria: List[CriterionEvaluation]
    missing_fields: List[str]
    explanation: str
    required_documents: List[str]
    application_steps: List[str]

class EligibilityCheckResponse(BaseModel):
    results: List[SchemeEligibilityResult]
    evaluated_at: datetime = Field(default_factory=datetime.now)

# ==============================================================================
# 4. VILLAGE PROJECTS SCHEMAS
# ==============================================================================
class ProjectMilestoneOut(BaseModel):
    id: str
    project_id: str
    stage: ProjectStage
    stage_number: int
    title: str
    description: Optional[str] = None
    is_completed: bool = False
    target_date: Optional[date] = None
    completed_date: Optional[date] = None

class ProjectUpdateOut(BaseModel):
    id: str
    project_id: str
    stage: ProjectStage
    update_notes: str
    photo_urls: List[str] = []
    expenditure_reported: float = 0.0
    official_name: Optional[str] = "Field Officer"
    created_at: datetime

class ProjectOut(BaseModel):
    id: str
    code: str
    title_en: str
    title_ta: str
    title_hi: str
    village: str
    gram_panchayat: str
    block: str
    district: str
    state: str = "Tamil Nadu"
    latitude: float
    longitude: float
    category: str
    sanctioned_budget: float
    spent_budget: float
    contractor_name: Optional[str] = None
    current_stage: ProjectStage
    progress_percentage: int
    start_date: Optional[date] = None
    expected_completion_date: Optional[date] = None
    description_en: str
    description_ta: Optional[str] = None
    description_hi: Optional[str] = None
    cover_image_url: Optional[str] = None
    is_demo: bool = False
    created_at: datetime

class ProjectDetailOut(ProjectOut):
    contractor_contact: Optional[str] = None
    nodal_officer_name: Optional[str] = None
    milestones: List[ProjectMilestoneOut] = []
    updates: List[ProjectUpdateOut] = []

class ProjectUpdateCreate(BaseModel):
    stage: ProjectStage
    update_notes: str = Field(..., min_length=10)
    photo_urls: List[str] = []
    expenditure_reported: float = Field(default=0.0, ge=0)
    progress_percentage: Optional[int] = Field(default=None, ge=0, le=100)

class ProjectStageUpdate(BaseModel):
    stage: ProjectStage
    progress_percentage: int = Field(..., ge=0, le=100)
    note: Optional[str] = None

# ==============================================================================
# 5. CITIZEN ISSUES & REPORTING SCHEMAS
# ==============================================================================
class ReportCreate(BaseModel):
    category: ReportCategory
    title: str = Field(..., min_length=5, max_length=200)
    description: str = Field(..., min_length=15)
    village: str
    block: str
    district: str
    landmark: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    photo_urls: List[str] = []
    priority: str = "normal"
    is_public: bool = True

class ReportTimelineOut(BaseModel):
    id: str
    report_id: str
    actor_name: Optional[str] = "Authority"
    from_status: Optional[ReportStatus] = None
    to_status: ReportStatus
    action_note: str
    evidence_urls: List[str] = []
    created_at: datetime

class CitizenReportOut(BaseModel):
    id: str
    reference_id: str
    citizen_id: str
    citizen_name: Optional[str] = None
    category: ReportCategory
    title: str
    description: str
    village: str
    block: str
    district: str
    landmark: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    photo_urls: List[str] = []
    current_status: ReportStatus
    assigned_official_name: Optional[str] = None
    priority: str = "normal"
    is_public: bool = True
    resolution_notes: Optional[str] = None
    resolution_photo_urls: List[str] = []
    closed_at: Optional[datetime] = None
    is_demo: bool = False
    created_at: datetime
    updated_at: datetime
    timeline: List[ReportTimelineOut] = []

class ReportStatusUpdate(BaseModel):
    to_status: ReportStatus
    action_note: str = Field(..., min_length=5)
    assigned_official_id: Optional[str] = None
    evidence_urls: List[str] = []

# ==============================================================================
# 6. ANNOUNCEMENTS SCHEMAS
# ==============================================================================
class AnnouncementCreate(BaseModel):
    title_en: str
    title_ta: str
    title_hi: str
    body_en: str
    body_ta: str
    body_hi: str
    priority: AnnouncementPriority = "normal"
    target_level: str = "village"
    target_area: str
    event_date: Optional[datetime] = None
    expires_at: Optional[datetime] = None
    is_voice_broadcast: bool = False
    target_phone: Optional[str] = None
    audio_url: Optional[str] = None

class AnnouncementOut(BaseModel):
    id: str
    publisher_name: Optional[str] = "Block Development Office"
    title_en: str
    title_ta: str
    title_hi: str
    body_en: str
    body_ta: str
    body_hi: str
    priority: AnnouncementPriority
    target_level: str
    target_area: str
    event_date: Optional[datetime] = None
    expires_at: Optional[datetime] = None
    is_verified: bool = True
    is_demo: bool = False
    is_voice_broadcast: bool = False
    target_phone: Optional[str] = None
    audio_url: Optional[str] = None
    created_at: datetime

# ==============================================================================
# 7. VOICE & TELEPHONY SCHEMAS
# ==============================================================================
class VoiceSubscribeRequest(BaseModel):
    phone_number: str = Field(..., pattern=r"^[0-9+\s-]{10,15}$")
    subscriber_name: Optional[str] = None
    preferred_language: str = "ta"
    village: str
    district: str
    consent_given: bool = True

class VoiceSubscriptionOut(BaseModel):
    id: str
    phone_number: str
    subscriber_name: Optional[str] = None
    preferred_language: str
    village: str
    district: str
    consent_given: bool
    consent_recorded_at: datetime
    is_active: bool

class VoiceCampaignCreate(BaseModel):
    campaign_name: str
    audio_script_text: str = Field(..., min_length=10)
    target_language: str = "ta"
    target_district: Optional[str] = None
    target_block: Optional[str] = None
    scheduled_dispatch_time: Optional[datetime] = None

class VoiceCampaignOut(BaseModel):
    id: str
    campaign_name: str
    audio_script_text: str
    target_language: str
    target_district: Optional[str] = None
    target_block: Optional[str] = None
    approved_by_admin: bool
    scheduled_dispatch_time: Optional[datetime] = None
    status: str
    created_at: datetime

class CallLogOut(BaseModel):
    id: str
    subscription_id: str
    campaign_id: Optional[str] = None
    campaign_name: Optional[str] = "Village Alert"
    phone_number: str
    call_status: CallDeliveryStatus
    duration_seconds: int
    attempt_timestamp: datetime
    failure_reason: Optional[str] = None

class BroadcastSimulateRequest(BaseModel):
    campaign_id: Optional[str] = None
    message_text: Optional[str] = None
    language: str = "ta"
    village: Optional[str] = None
    district: Optional[str] = None

# ==============================================================================
# 8. AI RAG ASSISTANT SCHEMAS
# ==============================================================================
class CitationItem(BaseModel):
    source_type: str # scheme, government_order, project, announcement
    title: str
    reference_id: Optional[str] = None
    url: Optional[str] = None
    excerpt: str

class AssistantChatRequest(BaseModel):
    query: str = Field(..., min_length=1)
    message: Optional[str] = None
    conversation_history: List[Dict[str, str]] = []
    language: str = "en" # en, ta, hi
    village_filter: Optional[str] = None
    user_profile: Optional[Dict[str, Any]] = None
    session_id: Optional[str] = None

class AssistantChatResponse(BaseModel):
    answer: str
    citations: List[CitationItem]
    language: str
    audio_tts_text: Optional[str] = None
    suggested_schemes: List[Dict[str, Any]] = []
    is_grounded: bool = True
    model_used: str

# ==============================================================================
# 9. ADMIN SCHEMAS & AUDIT LOGS
# ==============================================================================
class OfficialVerificationAction(BaseModel):
    action: Literal["approve", "reject"]
    rejection_reason: Optional[str] = None

class AdminOverviewStats(BaseModel):
    total_citizens: int
    total_officials: int
    pending_official_verifications: int
    total_active_schemes: int
    total_projects: int
    total_reports: int
    resolved_reports: int
    voice_subscribers: int
    is_demo_mode: bool

class AuditLogOut(BaseModel):
    id: str
    user_id: Optional[str] = None
    user_name: Optional[str] = None
    action: str
    entity_type: str
    entity_id: Optional[str] = None
    details: Optional[Dict[str, Any]] = None
    ip_address: Optional[str] = None
    created_at: datetime

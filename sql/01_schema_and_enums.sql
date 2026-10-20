-- ==============================================================================
-- GRAMVIKAS AI - DATABASE SCHEMA & ENUMS (POSTGRESQL / SUPABASE)
-- Migration 01: Core Schemas, Enums, Tables, Indexes, and Constraints
-- ==============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ------------------------------------------------------------------------------
-- 1. ENUMS
-- ------------------------------------------------------------------------------
CREATE TYPE user_role AS ENUM ('citizen', 'official', 'admin');

CREATE TYPE official_verification_status AS ENUM ('pending', 'approved', 'rejected');

CREATE TYPE scheme_level AS ENUM ('central', 'state', 'district');

CREATE TYPE eligibility_outcome AS ENUM ('potentially_eligible', 'more_information_required', 'cannot_confirm', 'not_eligible');

CREATE TYPE project_stage AS ENUM (
    'planning',
    'budget_approved',
    'tender_floated',
    'contractor_assigned',
    'foundation_work',
    'structure_laying',
    'mid_term_inspection',
    'quality_testing',
    'final_finishing',
    'completion_handover',
    'official_signoff',
    'public_audit',
    'maintenance_active'
);

CREATE TYPE report_status AS ENUM (
    'submitted',
    'triaged',
    'inspection_scheduled',
    'in_progress',
    'resolution_proposed',
    'verified_closed'
);

CREATE TYPE report_category AS ENUM (
    'drinking_water',
    'roads_and_bridges',
    'sanitation_and_drainage',
    'streetlights_electricity',
    'public_buildings',
    'ration_and_civil_supplies',
    'agriculture_irrigation',
    'other'
);

CREATE TYPE announcement_priority AS ENUM ('low', 'normal', 'high', 'emergency');

CREATE TYPE call_delivery_status AS ENUM ('scheduled', 'delivered', 'missed', 'failed', 'deferred_quiet_hours');

-- ------------------------------------------------------------------------------
-- 2. USERS & PROFILES TABLE
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    hashed_password VARCHAR(255) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    role user_role DEFAULT 'citizen',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS citizen_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    village VARCHAR(100) NOT NULL,
    gram_panchayat VARCHAR(100),
    block VARCHAR(100) NOT NULL,
    district VARCHAR(100) NOT NULL,
    state VARCHAR(100) DEFAULT 'Tamil Nadu',
    pincode VARCHAR(10),
    age INT,
    gender VARCHAR(20),
    annual_income NUMERIC(12, 2),
    occupation VARCHAR(100),
    landholding_acres NUMERIC(6, 2) DEFAULT 0.0,
    social_category VARCHAR(50), -- General, OBC, SC, ST, MBC
    ration_card_type VARCHAR(50), -- AAY, PHH, NPHH
    has_disability BOOLEAN DEFAULT FALSE,
    preferred_language VARCHAR(10) DEFAULT 'en', -- en, ta, hi
    low_bandwidth_mode BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS official_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    designation VARCHAR(150) NOT NULL, -- e.g. Block Development Officer (BDO)
    department VARCHAR(150) NOT NULL,  -- e.g. Rural Development & Panchayat Raj
    assigned_level VARCHAR(50) NOT NULL, -- Panchayat, Block, District
    assigned_area VARCHAR(150) NOT NULL, -- Area name, e.g. Cheyyur Block
    district VARCHAR(100) NOT NULL,
    employee_id_number VARCHAR(100) NOT NULL,
    official_id_proof_url TEXT,
    verification_status official_verification_status DEFAULT 'pending',
    verified_by UUID REFERENCES users(id) ON DELETE SET NULL,
    verified_at TIMESTAMPTZ,
    rejection_reason TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- 3. GOVERNMENT SCHEMES & BENEFICIARY CRITERIA
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS schemes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    slug VARCHAR(120) UNIQUE NOT NULL,
    title_en VARCHAR(255) NOT NULL,
    title_ta VARCHAR(255) NOT NULL,
    title_hi VARCHAR(255) NOT NULL,
    department VARCHAR(150) NOT NULL,
    level scheme_level DEFAULT 'central',
    category VARCHAR(100) NOT NULL, -- Agriculture, Housing, Health, Education, Women
    short_summary_en TEXT NOT NULL,
    short_summary_ta TEXT NOT NULL,
    short_summary_hi TEXT NOT NULL,
    detailed_description_en TEXT NOT NULL,
    detailed_description_ta TEXT,
    detailed_description_hi TEXT,
    financial_benefit_amount NUMERIC(12, 2) DEFAULT 0.0,
    benefit_frequency VARCHAR(50), -- one_time, annual, quarterly, monthly
    official_portal_url TEXT,
    helpline_number VARCHAR(50),
    is_active BOOLEAN DEFAULT TRUE,
    is_demo BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS scheme_criteria (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    scheme_id UUID REFERENCES schemes(id) ON DELETE CASCADE,
    min_age INT DEFAULT 0,
    max_age INT DEFAULT 120,
    allowed_genders TEXT[], -- e.g. ARRAY['all'] or ARRAY['female']
    max_annual_income NUMERIC(12, 2), -- null if no ceiling
    max_landholding_acres NUMERIC(6, 2), -- null if no ceiling
    allowed_occupations TEXT[], -- e.g. ARRAY['farmer', 'daily_wage']
    allowed_social_categories TEXT[], -- e.g. ARRAY['all'] or specific
    allowed_ration_cards TEXT[], -- e.g. ARRAY['AAY', 'PHH']
    requires_disability BOOLEAN DEFAULT FALSE,
    required_documents TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
    application_steps_en TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
    application_steps_ta TEXT[] DEFAULT ARRAY[]::TEXT[],
    application_steps_hi TEXT[] DEFAULT ARRAY[]::TEXT[],
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS saved_schemes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    scheme_id UUID REFERENCES schemes(id) ON DELETE CASCADE,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, scheme_id)
);

-- ------------------------------------------------------------------------------
-- 4. VILLAGE DEVELOPMENT PROJECTS & MILESTONES (13 STAGES)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS projects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code VARCHAR(50) UNIQUE NOT NULL, -- e.g. TN-PRJ-2026-081
    title_en VARCHAR(255) NOT NULL,
    title_ta VARCHAR(255) NOT NULL,
    title_hi VARCHAR(255) NOT NULL,
    village VARCHAR(100) NOT NULL,
    gram_panchayat VARCHAR(100) NOT NULL,
    block VARCHAR(100) NOT NULL,
    district VARCHAR(100) NOT NULL,
    state VARCHAR(100) DEFAULT 'Tamil Nadu',
    latitude NUMERIC(10, 7) NOT NULL,
    longitude NUMERIC(10, 7) NOT NULL,
    category VARCHAR(100) NOT NULL,
    sanctioned_budget NUMERIC(14, 2) NOT NULL,
    spent_budget NUMERIC(14, 2) DEFAULT 0.0,
    contractor_name VARCHAR(200),
    contractor_contact VARCHAR(100),
    current_stage project_stage DEFAULT 'planning',
    progress_percentage INT DEFAULT 0,
    start_date DATE,
    expected_completion_date DATE,
    actual_completion_date DATE,
    nodal_officer_id UUID REFERENCES users(id) ON DELETE SET NULL,
    scheme_id UUID REFERENCES schemes(id) ON DELETE SET NULL,
    description_en TEXT NOT NULL,
    description_ta TEXT,
    description_hi TEXT,
    cover_image_url TEXT,
    is_demo BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS project_milestones (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    stage project_stage NOT NULL,
    stage_number INT NOT NULL, -- 1 to 13
    title VARCHAR(200) NOT NULL,
    description TEXT,
    is_completed BOOLEAN DEFAULT FALSE,
    target_date DATE,
    completed_date DATE,
    signed_off_by UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS project_updates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    official_id UUID REFERENCES users(id) ON DELETE CASCADE,
    stage project_stage NOT NULL,
    update_notes TEXT NOT NULL,
    photo_urls TEXT[] DEFAULT ARRAY[]::TEXT[],
    expenditure_reported NUMERIC(14, 2) DEFAULT 0.0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- 5. CITIZEN ISSUES & REPORTING (6 STAGES)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS citizen_reports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    reference_id VARCHAR(50) UNIQUE NOT NULL, -- e.g. GV-REP-20261017-4821
    citizen_id UUID REFERENCES users(id) ON DELETE CASCADE,
    category report_category NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    village VARCHAR(100) NOT NULL,
    block VARCHAR(100) NOT NULL,
    district VARCHAR(100) NOT NULL,
    landmark TEXT,
    latitude NUMERIC(10, 7),
    longitude NUMERIC(10, 7),
    photo_urls TEXT[] DEFAULT ARRAY[]::TEXT[],
    current_status report_status DEFAULT 'submitted',
    assigned_official_id UUID REFERENCES users(id) ON DELETE SET NULL,
    priority VARCHAR(30) DEFAULT 'normal',
    is_public BOOLEAN DEFAULT TRUE,
    resolution_notes TEXT,
    resolution_photo_urls TEXT[] DEFAULT ARRAY[]::TEXT[],
    closed_at TIMESTAMPTZ,
    is_demo BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS report_timeline (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    report_id UUID REFERENCES citizen_reports(id) ON DELETE CASCADE,
    actor_id UUID REFERENCES users(id) ON DELETE SET NULL,
    from_status report_status,
    to_status report_status NOT NULL,
    action_note TEXT NOT NULL,
    evidence_urls TEXT[] DEFAULT ARRAY[]::TEXT[],
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- 6. PUBLIC ANNOUNCEMENTS & GRAM SABHA ALERTS
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS announcements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    publisher_id UUID REFERENCES users(id) ON DELETE SET NULL,
    title_en VARCHAR(255) NOT NULL,
    title_ta VARCHAR(255) NOT NULL,
    title_hi VARCHAR(255) NOT NULL,
    body_en TEXT NOT NULL,
    body_ta TEXT NOT NULL,
    body_hi TEXT NOT NULL,
    priority announcement_priority DEFAULT 'normal',
    target_level VARCHAR(50) DEFAULT 'village', -- village, block, district, state
    target_area VARCHAR(150) NOT NULL,
    event_date TIMESTAMPTZ,
    expires_at TIMESTAMPTZ NOT NULL,
    is_verified BOOLEAN DEFAULT TRUE,
    is_demo BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- 7. VOICE SERVICE, CONSENT & CALL LOGS
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS voice_subscriptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    phone_number VARCHAR(20) NOT NULL,
    subscriber_name VARCHAR(150),
    preferred_language VARCHAR(10) DEFAULT 'ta', -- en, ta, hi
    village VARCHAR(100) NOT NULL,
    district VARCHAR(100) NOT NULL,
    consent_given BOOLEAN DEFAULT TRUE,
    consent_recorded_at TIMESTAMPTZ DEFAULT NOW(),
    consent_ip_source VARCHAR(60),
    is_active BOOLEAN DEFAULT TRUE,
    opt_out_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(phone_number)
);

CREATE TABLE IF NOT EXISTS voice_campaigns (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    campaign_name VARCHAR(200) NOT NULL,
    audio_script_text TEXT NOT NULL,
    target_language VARCHAR(10) DEFAULT 'ta',
    target_district VARCHAR(100),
    target_block VARCHAR(100),
    approved_by_admin BOOLEAN DEFAULT FALSE,
    scheduled_dispatch_time TIMESTAMPTZ,
    status VARCHAR(50) DEFAULT 'draft',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS voice_call_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    subscription_id UUID REFERENCES voice_subscriptions(id) ON DELETE CASCADE,
    campaign_id UUID REFERENCES voice_campaigns(id) ON DELETE SET NULL,
    phone_number VARCHAR(20) NOT NULL,
    call_status call_delivery_status DEFAULT 'scheduled',
    duration_seconds INT DEFAULT 0,
    attempt_timestamp TIMESTAMPTZ DEFAULT NOW(),
    failure_reason TEXT
);

-- ------------------------------------------------------------------------------
-- 8. SYSTEM AUDIT LOGS
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    action VARCHAR(100) NOT NULL,
    entity_type VARCHAR(100) NOT NULL,
    entity_id VARCHAR(100),
    details JSONB,
    ip_address VARCHAR(50),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- 9. PERFORMANCE INDEXES
-- ------------------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_citizen_village ON citizen_profiles(village, district);
CREATE INDEX IF NOT EXISTS idx_official_district ON official_profiles(district, verification_status);
CREATE INDEX IF NOT EXISTS idx_schemes_category ON schemes(category, is_active);
CREATE INDEX IF NOT EXISTS idx_projects_geo ON projects(latitude, longitude);
CREATE INDEX IF NOT EXISTS idx_projects_district ON projects(district, village);
CREATE INDEX IF NOT EXISTS idx_projects_stage ON projects(current_stage);
CREATE INDEX IF NOT EXISTS idx_reports_ref ON citizen_reports(reference_id);
CREATE INDEX IF NOT EXISTS idx_reports_status ON citizen_reports(current_status, village);
CREATE INDEX IF NOT EXISTS idx_announcements_expiry ON announcements(expires_at, is_verified);
CREATE INDEX IF NOT EXISTS idx_voice_subs_phone ON voice_subscriptions(phone_number, is_active);

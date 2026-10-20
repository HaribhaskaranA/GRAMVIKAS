# GRAMVIKAS AI 🌾
> **“Every Citizen Informed. Every Village Progress Tracked.”**

GRAMVIKAS AI is a production-oriented, responsive web application designed to bridge the rural governance information divide. It delivers real-time welfare scheme entitlement checks, transparent 13-stage village infrastructure tracking, community grievance logging with GPS evidence, and TRAI-compliant automated voice broadcasts to rural citizens regardless of language, literacy, or smartphone ownership.

---

## 🚀 Instant Zero-Config Quickstart (Zero-Crash Guarantee)

GRAMVIKAS AI includes an automatic **Dual-Mode Database Adapter** with pre-seeded realistic Tamil Nadu rural data. It runs immediately out-of-the-box without requiring external API keys.

### 1. Install Dependencies
```bash
pip install -r requirements.txt
```

### 2. Start the Unified Server
```bash
uvicorn backend.main:app --reload --port 8000
```

### 3. Open Application
Navigate to [http://localhost:8000](http://localhost:8000) or [http://localhost:8000/login](http://localhost:8000/login).

---

## 🔑 Pre-Seeded Demo Credentials

Click any of the **1-Click Autofill** buttons on the Login page (`/login`):

| Role | Email | Password | Persona & Jurisdiction |
| :--- | :--- | :--- | :--- |
| **Rural Citizen** | `citizen@gramvikas.in` | `Citizen@123` | Muthuvel K (Melmaruvathur, Small Farmer) |
| **Verified Official** | `official@gramvikas.in` | `Official@123` | Dr. Selvi Ramanathan (BDO Cheyyur Block) |
| **Pending Official** | `pending@gramvikas.in` | `Pending@123` | R. Anbarasan (Panchayat Secretary, Clearance Pending) |
| **System Admin** | `admin@gramvikas.in` | `Admin@123` | State Governance Root Administrator |

---

## 🏛️ System Features & Architecture

### 1. Unified Serving Architecture
`backend/main.py` serves both the REST API under `/api/*` and the frontend SPA shell (`app.html`), eliminating CORS issues, broken links, or routing mismatches.

### 2. Deterministic Scheme Eligibility Engine (`backend/services/eligibility.py`)
Multi-variable rule evaluator calculating citizen age, gender, annual income ceiling, landholding acreage, occupation, ration card (PHH/AAY), and disability benchmarks. Returns:
- `potentially_eligible`
- `more_information_required`
- `cannot_confirm` / `not_eligible`

### 3. Grounded Multilingual AI RAG Assistant (`backend/services/ai_rag.py`)
- Powered by Google GenAI SDK (`gemini-2.5-flash`) when `GEMINI_API_KEY` is present.
- Automatically falls back to a deterministic semantic matcher when offline or unconfigured.
- Strictly provides square-bracket source citations (`[Scheme: PM-KISAN]`, `[Project: ...]`).
- Fully supports English, தமிழ் (Tamil), and हिन्दी (Hindi).
- Built-in Web Speech API voice read-aloud for illiterate or visually-impaired citizens.

### 4. 13-Stage Village Development Projects Tracker (`backend/routers/projects.py`)
Tracks rural civil works from inception to public disclosure:
1. `planning` (Site Survey)
2. `budget_approved` (Financial Sanction)
3. `tender_floated` (E-Tenders)
4. `contractor_assigned` (Work Order)
5. `foundation_work` (Excavation & RCC)
6. `structure_laying` (Pipeline & Superstructure)
7. `mid_term_inspection` (Assistant Executive Engineer Check)
8. `quality_testing` (Cube & Hydrostatic Testing)
9. `final_finishing` (Painting & Signage)
10. `completion_handover` (Trial Pumping)
11. `official_signoff` (District Collector Approval)
12. `public_audit` (Gram Sabha Social Audit)
13. `maintenance_active` (Panchayat Active Maintenance)

### 5. 6-Stage Citizen Grievances Tracker (`backend/routers/reports.py`)
- Auto-generated reference IDs (e.g. `GV-REP-20261017-XXXX`).
- GPS coordinate capture and photo evidence uploads.
- Full 6-stage lifecycle tracking: `submitted` &rarr; `triaged` &rarr; `inspection_scheduled` &rarr; `in_progress` &rarr; `resolution_proposed` &rarr; `verified_closed`.

### 6. Voice Broadcast & Telephony (`backend/services/telephony.py`)
- Explicit citizen consent logging with timestamp and IP recording.
- Regulatory Quiet-Hours enforcement: Automated calls strictly suppressed between 20:00 (8 PM) and 07:00 (7 AM).
- 1-click citizen unsubscribe endpoint.
- High-fidelity interactive audio wave simulator.

### 7. Interactive GIS Village Map (`frontend/js/views/mapView.js`)
- Powered by Leaflet.js with OpenStreetMap.
- Color-coded pins for infrastructure projects and verified grievances.
- Low-bandwidth mode toggle pauses map tiles on 2G connections.

---

## 📂 Repository File Tree

```text
gramvikas-ai/
├── .env.example
├── .gitignore
├── requirements.txt
├── vercel.json
├── README.md
├── sql/
│   ├── 01_schema_and_enums.sql      # Full PostgreSQL schema (20+ tables & indexes)
│   ├── 02_rls_and_security.sql      # Supabase Row Level Security policies
│   └── 03_seed_demo_data.sql        # Realistic Tamil Nadu rural development seeds
├── backend/
│   ├── __init__.py
│   ├── main.py                      # FastAPI app & unified frontend mount
│   ├── config.py                    # Environment settings & zero-config mode detection
│   ├── database.py                  # Dual-mode DB adapter (SQLite/JSON mirror + seeds)
│   ├── dependencies.py              # JWT authentication & RBAC guards
│   ├── models/
│   │   └── schemas.py               # Pydantic v2 schemas and request models
│   ├── services/
│   │   ├── eligibility.py           # Deterministic scheme eligibility engine
│   │   ├── ai_rag.py                # Server-side Gemini RAG + grounded fallback
│   │   └── telephony.py             # Telephony voice dispatcher & quiet-hours
│   └── routers/
│       ├── auth.py                  # Login, registration, profile, session
│       ├── schemes.py               # Schemes catalog, detail, eligibility, bookmarks
│       ├── projects.py              # 13-stage project tracking & updates
│       ├── reports.py               # Grievance reporting, GPS, 6-stage timeline
│       ├── announcements.py         # Gram Sabha notices & community alerts
│       ├── assistant.py             # Multilingual RAG assistant & audio speech
│       ├── voice.py                 # Telephony subscriptions, simulator, call logs
│       └── admin.py                 # Official verifications, audit logs, demo reset
└── frontend/
    ├── login.html                   # Unauthenticated login & 1-click demo accounts
    ├── register.html                # Tabbed registration (Citizen, Official, Admin)
    ├── app.html                     # Authenticated SPA shell
    ├── manifest.json                # PWA manifest
    ├── css/
    │   ├── variables.css            # Brand tokens, high-contrast, font scaler
    │   ├── layout.css               # Desktop sidebar, topbar, mobile 5-item bottom nav
    │   └── components.css           # Steppers, cards, timelines, chat bubbles, audio wave
    └── js/
        ├── config.js                # Frontend config & presets
        ├── i18n.js                  # English, தமிழ், हिन्दी translation dictionary
        ├── api.js                   # Fetch client with JWT injection
        ├── auth.js                  # Session manager & role redirector
        ├── router.js                # History API router for all 20 paths
        ├── components/
        │   ├── navbar.js            # Responsive navigation & accessibility tools
        │   ├── toast.js             # Notification toast alerts
        │   └── modal.js             # Reusable accessible dialogs
        └── views/
            ├── citizenHome.js       # Citizen summary & quick eligibility widget
            ├── officialDashboard.js # BDO portal, 13-stage milestone advancer
            ├── verificationPending.js # Holding view for pending officials
            ├── adminDashboard.js    # System control center & clearances queue
            ├── schemes.js           # Schemes discovery & detailed criteria
            ├── projects.js          # 13-stage village infrastructure tracker
            ├── assistant.js         # Grounded AI assistant with audio read-aloud
            ├── reportIssue.js       # Citizen grievance submission & timeline
            ├── announcements.js     # Gram Sabha notices & disaster warnings
            ├── voiceService.js      # Voice alerts consent & simulator
            ├── mapView.js           # Interactive OpenStreetMap GIS view
            └── profile.js           # Profile attributes & toll-free directory
```

---

## 🎨 Color Palette & Typography
- **Deep Navy:** `#16324F` (Primary Brand & Sidebar)
- **Primary Green:** `#2E7D52` (Verified Badges & Action CTAs)
- **Warm Saffron:** `#F2A541` (Focus Rings & Highlights)
- **Light Surface:** `#F6F8FA`
- **Typography:** `Inter`, `Noto Sans Tamil`, `Noto Sans Devanagari`
- **Accessibility:** `A-`, `A`, `A+` font scaler, high-contrast focus outlines, and low-bandwidth mode.

---

## 🛡️ License & Compliance
Built under the Digital India / Tamil Nadu Rural Development transparency mandate. All voice communications strictly adhere to TRAI automated telephony regulations.

# GRAMVIKAS AI 🌾
> **“Every Citizen Informed. Every Village Progress Tracked.”**

[![FastAPI](https://img.shields.io/badge/FastAPI-0.115+-009688.svg?logo=fastapi)](https://fastapi.tiangolo.com)
[![TensorFlow](https://img.shields.io/badge/TensorFlow-2.18-FF6F00.svg?logo=tensorflow)](https://www.tensorflow.org)
[![Leaflet.js](https://img.shields.io/badge/Leaflet.js-GIS%20Mapping-199900.svg?logo=leaflet)](https://leafletjs.com)
[![WCAG AAA](https://img.shields.io/badge/WCAG-AAA%20Compliant-064E3B.svg)](https://www.w3.org/WAI/standards-guidelines/wcag/)
[![License: GPL v3](https://img.shields.io/badge/License-GPLv3-blue.svg)](LICENSE)

**GRAMVIKAS AI** is an AI-powered rural governance and agricultural empowerment web platform built specifically for Indian villages. Designed to bridge the digital literacy divide, it provides:
- 🌿 **Crop Doctor AI:** Real-time deep learning diagnosis for **67 crop disease classes** (Paddy, Tomato, Cotton, Groundnut, Maize, Potato, etc.) with organic remedies and chemical treatment schedules in Tamil, Hindi, and English.
- 🚜 **Rural Picture-First Visual Navigation:** Intuitive visual service cards with **🔊 1-tap spoken voice readout** for low-literacy farmers and elders.
- 📢 **Live Agricultural News & Voice Broadcast:** Automated voice reader delivering real-time Tamil Nadu agricultural news (via Google News RSS) and official Block Development Officer (BDO) voice bulletins.
- 🏛️ **13-Stage Village Infrastructure Tracker:** Real-time progress, financial expenditure, and geotagged contractor milestones for village public works.
- 📌 **GIS Village Map:** Leaflet.js map with high-contrast pins for civil projects and citizen grievances (`GV-REP-...`) with automatic realistic GPS assignment.
- 📜 **Deterministic Scheme Eligibility Engine:** 1-minute entitlement evaluation matching citizen demographic profiles against Central & State welfare programs (PM-KISAN, Kalaignar Magalir Urimai Thogai, PMAY-G, etc.).

---

## 🎨 Rural Visual Design System
- **Emerald Ink (`#064E3B`):** Deep agricultural forest green representing institutional trust, primary headers, and active state indicators.
- **Champagne Accent (`#F8E7C9`):** High-luminance warm cream accent delivering WCAG AAA contrast for low-light rural mobile screens.
- **Rural High Contrast:** Dark green banners explicitly force high-visibility text (`#FFFFFF` and `#F8E7C9`) to eliminate legibility issues under direct sunlight.

---

## 🤖 67-Class Crop Doctor AI Architecture

The agricultural pathology engine is backed by a fine-tuned convolutional neural network trained on over 50,000 field plant leaf images:

- **Model File:** `backend/models/crop_model/best_gramvikas_multicrop_v3_finetuned.keras` (~22.75 MB)
- **Label Mapping:** `backend/models/crop_model/class_names.json` (67 disease and healthy classes)
- **Supported Crops:**
  - **Rice/Paddy:** Bacterial Leaf Blight, Brown Spot, Leaf Blast, Tungro, Healthy.
  - **Tomato:** Early Blight, Late Blight, Leaf Mold, Septoria Leaf Spot, Spider Mites, Target Spot, Yellow Leaf Curl Virus, Mosaic Virus, Healthy.
  - **Cotton:** Bacterial Blight, Curl Virus, Fusarium Wilt, Healthy.
  - **Groundnut:** Early Leaf Spot, Late Leaf Spot, Rust, Healthy.
  - **Maize/Corn:** Common Rust, Cercospora Leaf Spot, Northern Leaf Blight, Healthy.
  - **Potato, Pepper, Grape, Apple, Citrus, Sugarcane**, and more.
- **Diagnostics Output:** Returns confidence score, disease severity indicator, organic bio-pesticide recipe, recommended chemical fungicides with dosage, and eligible government input subsidies.

---

## 🚀 Instant Zero-Config Quickstart

GRAMVIKAS AI boots out-of-the-box with a local SQLite/JSON seed store without requiring external API keys.

### 1. Clone the Repository
```bash
git clone https://github.com/HaribhaskaranA/GRAMVIKAS.git
cd GRAMVIKAS
```

### 2. Set Up Virtual Environment & Dependencies
```bash
python -m venv venv
# Windows:
venv\Scripts\activate
# Linux/macOS:
source venv/bin/activate

pip install -r requirements.txt
```

### 3. Start the Server
```bash
uvicorn backend.main:app --host 127.0.0.1 --port 8000 --reload
```

### 4. Access the Application
Open your browser at **[http://127.0.0.1:8000](http://127.0.0.1:8000)**.

---

## 🔑 Pre-Seeded Roles & Test Accounts

Use the **1-Click Autofill** buttons on the Login page (`/login`):

| Role | Email | Password | Persona & Jurisdiction |
| :--- | :--- | :--- | :--- |
| **Rural Citizen** | `citizen@gramvikas.in` | `Citizen@123` | Muthuvel K (Melmaruvathur, Small Farmer) |
| **Verified Official** | `official@gramvikas.in` | `Official@123` | Dr. Selvi Ramanathan (BDO Cheyyur Block) |
| **Pending Official** | `pending@gramvikas.in` | `Pending@123` | R. Anbarasan (Panchayat Secretary, Clearance Pending) |
| **System Admin** | `admin@gramvikas.in` | `Admin@123` | State Governance Administrator |

---

## 🔒 Security & Privacy Guarantees

This repository enforces strict open-source security measures:
1. **Zero Hardcoded Secrets:** All API keys, database credentials, and service tokens are decoupled via environment variables.
2. **Comprehensive `.gitignore`:** Strict exclusion of `.env`, `.env.*`, `*.pem`, `*.key`, `*.sqlite`, SSL certificates, and temporary caches. Only the safe `.env.example` template is committed.
3. **Deterministic Fallbacks:** The platform operates in offline fallback mode if cloud services (Gemini GenAI or Supabase) are unavailable.
4. **Model Safety:** Model file sizes are maintained well within GitHub's 100 MB limit (22.75 MB), allowing direct version control without external LFS dependencies.
5. **Regulatory Quiet Hours:** Telephony and SMS broadcasts strictly comply with TRAI regulations (automated calls disabled between 20:00 and 07:00).

---

## 📂 Repository Structure

```text
GRAMVIKAS/
├── backend/
│   ├── models/
│   │   ├── crop_model/
│   │   │   ├── best_gramvikas_multicrop_v3_finetuned.keras  # 67-class fine-tuned model (22.75 MB)
│   │   │   └── class_names.json                            # 67 pathology class labels
│   │   └── schemas.py                                      # Pydantic schemas
│   ├── routers/
│   │   ├── announcements.py    # Public alerts & live RSS news
│   │   ├── assistant.py        # Bilingual AI assistant
│   │   ├── auth.py             # JWT authentication & registration
│   │   ├── crop_doctor.py      # Crop disease detection API
│   │   ├── projects.py         # 13-stage project tracker
│   │   ├── reports.py          # Citizen grievances & GPS coordinates
│   │   ├── schemes.py          # Welfare schemes & eligibility
│   │   └── voice.py            # gTTS audio streaming & voice calls
│   ├── services/
│   │   ├── crop_ai.py          # Keras inference pipeline
│   │   ├── crop_metadata_67.py # Remediation cures & fertilizer guide
│   │   ├── eligibility.py      # Welfare rule evaluation engine
│   │   └── ai_rag.py           # Gemini RAG assistant
│   ├── database.py             # Thread-safe database adapter
│   └── main.py                 # FastAPI application & static server
├── frontend/
│   ├── assets/
│   │   ├── cards/              # SVG illustrations for 6 visual cards
│   │   ├── logo.jpeg           # Official GRAMVIKAS portal logo
│   │   └── assistant_logo.jpeg # AI Assistant & Crop Doctor avatar
│   ├── css/
│   │   ├── variables.css       # Emerald Ink (#064E3B) & Champagne (#F8E7C9)
│   │   ├── layout.css          # Shell, sidebar, responsive grids & print styles
│   │   └── components.css      # Visual cards, badges, timeline & audio player
│   ├── js/
│   │   ├── views/              # 12 Single-Page Application views
│   │   ├── components/         # Navigation, topbar, modal, toast
│   │   ├── api.js              # Fetch client
│   │   ├── auth.js             # Client session & JWT management
│   │   ├── i18n.js             # Tamil, Hindi & English localization
│   │   └── router.js           # Client-side hashless routing
│   ├── app.html                # Main SPA application shell
│   ├── login.html              # Login portal with 1-click demo accounts
│   └── register.html           # Citizen & Official registration
├── colab_crop_disease_model/   # Google Colab training notebook
├── sql/                        # Supabase / PostgreSQL schema scripts
├── .env.example                # Safe environment variable template
├── .gitignore                  # Production Git ignore specification
├── requirements.txt            # Python dependencies
└── verify_all.py               # Automated verification test suite (44 routes)
```

---

## 🧪 Verification & Testing

Verify that all routes and endpoints pass with zero 404 errors:
```bash
python verify_all.py
```
Expected output:
```text
==================================================
ALL ROUTES & APIS VERIFIED! ZERO 404 ERRORS!
==================================================
```

---

## 📄 License
This project is licensed under the **GNU General Public License v3.0** — see the [LICENSE](LICENSE) file for details.

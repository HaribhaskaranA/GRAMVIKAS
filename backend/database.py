"""
GRAMVIKAS AI - Dual Mode Database Engine & Seeded Store Adapter.
Provides zero-config instant local execution with persistent state and realistic Tamil Nadu demo data.
"""

import json
import uuid
import os
import tempfile
from pathlib import Path
from datetime import datetime, date, timedelta
from typing import Dict, Any, List, Optional
import bcrypt
from backend.config import settings

BASE_DIR = Path(__file__).resolve().parent.parent

def hash_password(password: str) -> str:
    pw_bytes = password.encode("utf-8")[:72]
    return bcrypt.hashpw(pw_bytes, bcrypt.gensalt()).decode("utf-8")

def verify_password(plain_password: str, hashed_password: str) -> bool:
    try:
        pw_bytes = plain_password.encode("utf-8")[:72]
        h_bytes = hashed_password.encode("utf-8")
        return bcrypt.checkpw(pw_bytes, h_bytes)
    except Exception:
        return False

# Universal default password hash for: Citizen@123, Official@123, Pending@123, Admin@123
DEFAULT_HASH = hash_password("Citizen@123")

class DatabaseAdapter:
    """Dual-mode Database Adapter with instant in-memory & JSON file persistence."""
    
    def __init__(self):
        self.is_demo = settings.is_demo_mode
        self.base_seed_file = BASE_DIR / "backend" / "gramvikas_local.json"
        
        # In Vercel serverless / read-only environment, write to /tmp
        is_vercel = bool(os.getenv("VERCEL") or os.getenv("AWS_LAMBDA_FUNCTION_NAME"))
        if is_vercel:
            self.store_file = Path(tempfile.gettempdir()) / "gramvikas_local.json"
        else:
            self.store_file = settings.SQLITE_PATH.with_suffix(".json")
            
        self.data: Dict[str, Any] = {}
        self._initialize_store()
    
    def _initialize_store(self):
        """Loads existing state from json or seeds initial demo dataset."""
        # 1. First check runtime writable store file
        if self.store_file.exists():
            try:
                with open(self.store_file, "r", encoding="utf-8") as f:
                    self.data = json.load(f)
                    return
            except Exception as e:
                print(f"[DB] Could not load from store_file {self.store_file}: {e}")

        # 2. Check packaged seed file from repo
        if self.base_seed_file.exists():
            try:
                with open(self.base_seed_file, "r", encoding="utf-8") as f:
                    self.data = json.load(f)
                    return
            except Exception as e:
                print(f"[DB] Could not load from base_seed_file {self.base_seed_file}: {e}")
        
        self.reset_to_seeds()
    
    def save_state(self):
        """Persists current state to local JSON mirror safely."""
        try:
            with open(self.store_file, "w", encoding="utf-8") as f:
                json.dump(self.data, f, default=str, indent=2, ensure_ascii=False)
        except Exception as e:
            # Fallback to /tmp if primary store_file is not writable
            try:
                tmp_file = Path(tempfile.gettempdir()) / "gramvikas_local.json"
                with open(tmp_file, "w", encoding="utf-8") as f:
                    json.dump(self.data, f, default=str, indent=2, ensure_ascii=False)
                self.store_file = tmp_file
            except Exception as ex:
                print(f"[DB] Warning: Could not save local state: {ex}")

    def reset_to_seeds(self):
        """Builds rich, realistic Tamil Nadu rural development seed dataset."""
        now_iso = datetime.now().isoformat()
        yesterday_iso = (datetime.now() - timedelta(days=1)).isoformat()
        
        # 1. Users
        users = [
            {
                "id": "11111111-1111-1111-1111-111111111111",
                "email": "citizen@gramvikas.in",
                "hashed_password": hash_password("Citizen@123"),
                "full_name": "Muthuvel K",
                "phone": "+91 98401 23456",
                "role": "citizen",
                "is_active": True,
                "created_at": yesterday_iso
            },
            {
                "id": "22222222-2222-2222-2222-222222222222",
                "email": "official@gramvikas.in",
                "hashed_password": hash_password("Official@123"),
                "full_name": "Dr. Selvi Ramanathan",
                "phone": "+91 98409 87654",
                "role": "official",
                "is_active": True,
                "created_at": yesterday_iso
            },
            {
                "id": "33333333-3333-3333-3333-333333333333",
                "email": "pending@gramvikas.in",
                "hashed_password": hash_password("Pending@123"),
                "full_name": "R. Anbarasan",
                "phone": "+91 98405 55666",
                "role": "official",
                "is_active": True,
                "created_at": now_iso
            },
            {
                "id": "44444444-4444-4444-4444-444444444444",
                "email": "admin@gramvikas.in",
                "hashed_password": hash_password("Admin@123"),
                "full_name": "State Governance Admin",
                "phone": "+91 98400 00001",
                "role": "admin",
                "is_active": True,
                "created_at": yesterday_iso
            }
        ]

        # 2. Profiles
        citizen_profiles = {
            "11111111-1111-1111-1111-111111111111": {
                "village": "Melmaruvathur",
                "gram_panchayat": "Melmaruvathur Panchayat",
                "block": "Cheyyur",
                "district": "Chengalpattu",
                "state": "Tamil Nadu",
                "pincode": "603319",
                "age": 42,
                "gender": "male",
                "annual_income": 75000.0,
                "occupation": "farmer",
                "landholding_acres": 1.8,
                "social_category": "OBC",
                "ration_card_type": "PHH",
                "has_disability": False,
                "preferred_language": "ta",
                "low_bandwidth_mode": False
            }
        }

        official_profiles = {
            "22222222-2222-2222-2222-222222222222": {
                "designation": "Block Development Officer (BDO)",
                "department": "Rural Development & Panchayat Raj",
                "assigned_level": "Block",
                "assigned_area": "Cheyyur Block",
                "district": "Chengalpattu",
                "employee_id_number": "TN-GOV-RD-2018-842",
                "verification_status": "approved",
                "verified_at": yesterday_iso,
                "rejection_reason": None
            },
            "33333333-3333-3333-3333-333333333333": {
                "designation": "Panchayat Secretary",
                "department": "Rural Development & Panchayat Raj",
                "assigned_level": "Panchayat",
                "assigned_area": "Madurantakam South",
                "district": "Chengalpattu",
                "employee_id_number": "TN-GOV-RD-2024-911",
                "verification_status": "pending",
                "verified_at": None,
                "rejection_reason": None
            }
        }

        # 3. Schemes
        schemes = [
            {
                "id": "a1111111-aaaa-aaaa-aaaa-aaaaaaaaaaaa",
                "slug": "pm-kisan-samman-nidhi",
                "title_en": "PM-KISAN Samman Nidhi",
                "title_ta": "பிரதம மந்திரி கிசான் சம்மான் நிதி",
                "title_hi": "पीएम किसान सम्मान निधि",
                "department": "Ministry of Agriculture & Farmers Welfare",
                "level": "central",
                "category": "Agriculture",
                "short_summary_en": "Direct income support of ₹6,000 per year for landholding farmer families across India in 3 equal installments.",
                "short_summary_ta": "விவசாய குடும்பங்களுக்கு ஆண்டுக்கு ₹6,000 மூன்று தவணைகளில் நேரடி வங்கி பரிமாற்றம்.",
                "short_summary_hi": "भूमिधारक किसान परिवारों को प्रति वर्ष ₹6,000 की प्रत्यक्ष आय सहायता 3 समान किस्तों में।",
                "detailed_description_en": "Under the PM-KISAN scheme, all landholding farmer families with cultivable landholding in their names are eligible for financial assistance of Rs. 6000/- per year, payable in three equal four-monthly installments of Rs. 2000/- directly into their Aadhaar-linked bank accounts.",
                "detailed_description_ta": "இத்திட்டத்தின் கீழ் சொந்த நிலம் வைத்துள்ள சிறு மற்றும் குறு விவசாய குடும்பங்களுக்கு தலா ₹2,000 வீதம் 3 தவணைகளில் ₹6,000 நேரடியாக அவர்களின் ஆதார் இணைக்கப்பட்ட வங்கிக் கணக்கில் வரவு வைக்கப்படுகிறது.",
                "detailed_description_hi": "इस योजना के तहत खेती योग्य भूमि वाले सभी किसान परिवारों को तीन समान किस्तों में सालाना ₹6000 की आर्थिक मदद सीधे बैंक खाते में भेजी जाती है।",
                "financial_benefit_amount": 6000.0,
                "benefit_frequency": "annual",
                "official_portal_url": "https://pmkisan.gov.in",
                "helpline_number": "155261",
                "is_active": True,
                "is_demo": True,
                "created_at": yesterday_iso,
                "criteria": {
                    "min_age": 18,
                    "max_age": 100,
                    "allowed_genders": ["all"],
                    "max_annual_income": None,
                    "max_landholding_acres": 5.0,
                    "allowed_occupations": ["farmer"],
                    "allowed_social_categories": ["all"],
                    "allowed_ration_cards": ["all"],
                    "requires_disability": False,
                    "required_documents": [
                        "Aadhaar Card",
                        "Land Ownership Record (Patta/Chitta)",
                        "Active Bank Passbook",
                        "Mobile Number linked to Aadhaar"
                    ],
                    "application_steps_en": [
                        "Visit Village Administrative Officer (VAO) or nearby e-Seva Centre",
                        "Submit Patta copy and complete Aadhaar biometric/OTP eKYC",
                        "Track beneficiary approval status online via PM-KISAN portal"
                    ],
                    "application_steps_ta": [
                        "கிராம நிர்வாக அலுவலர் (VAO) அல்லது அருகில் உள்ள இ-சேவை மையத்தை அணுகவும்",
                        "பட்டா நகல் மற்றும் ஆதார் eKYC சமர்ப்பிக்கவும்",
                        "இணையதளத்தில் நிலையை சரிபார்க்கவும்"
                    ],
                    "application_steps_hi": [
                        "ग्राम प्रशासनिक अधिकारी (VAO) या ई-सेवा केंद्र पर जाएं",
                        "पट्टा प्रति और आधार ईकेवाईसी जमा करें",
                        "पीएम-किसान पोर्टल पर स्थिति जांचें"
                    ]
                }
            },
            {
                "id": "a2222222-aaaa-aaaa-aaaa-aaaaaaaaaaaa",
                "slug": "kalaignar-kanavu-illam",
                "title_en": "Kalaignar Kanavu Illam Scheme",
                "title_ta": "கலைஞர் கனவு இல்லம் திட்டம்",
                "title_hi": "कलैग्नार कनावु इल्लम आवास योजना",
                "department": "Rural Development & Panchayat Raj, Tamil Nadu",
                "level": "state",
                "category": "Housing",
                "short_summary_en": "Pukka concrete house subsidy of ₹3.5 Lakhs to transform thatched and hut houses into climate-resilient homes.",
                "short_summary_ta": "குடிசைகளை கான்கிரீட் வீடுகளாக மாற்ற ₹3.5 லட்சம் நிதி உதவி வழங்கும் திட்டம்.",
                "short_summary_hi": "तमिलनाडु में कच्चे घरों को पक्के घरों में बदलने के लिए ₹3.5 लाख की वित्तीय सहायता।",
                "detailed_description_en": "Kalaignar Kanavu Illam is Tamil Nadus flagship rural housing scheme aiming to make the state hut-free. Eligible rural beneficiaries living in kutcha dwellings receive Rs. 3,50,000 along with MGNREGA construction person-days and toilet assistance under SBM-G.",
                "detailed_description_ta": "தமிழகத்தின் ஊரகப் பகுதிகளில் குடிசைகளை அகற்றி கான்கிரீட் வீடுகள் கட்ட ₹3,50,000 நிதி வழங்கப்படுகிறது. இத்துடன் மகாத்மா காந்தி திட்ட மனிதநாட்கள் ஊதியமும் வழங்கப்படும்.",
                "detailed_description_hi": "तमिलनाडु में ग्रामीण झोपड़ियों को पक्के मकानों में बदलने के लिए ₹3.5 लाख का अनुदान।",
                "financial_benefit_amount": 350000.0,
                "benefit_frequency": "one_time",
                "official_portal_url": "https://tnrd.tn.gov.in",
                "helpline_number": "1800-425-4567",
                "is_active": True,
                "is_demo": True,
                "created_at": yesterday_iso,
                "criteria": {
                    "min_age": 21,
                    "max_age": 90,
                    "allowed_genders": ["all"],
                    "max_annual_income": 150000.0,
                    "max_landholding_acres": 2.5,
                    "allowed_occupations": ["farmer", "daily_wage", "artisan", "other"],
                    "allowed_social_categories": ["all"],
                    "allowed_ration_cards": ["AAY", "PHH"],
                    "requires_disability": False,
                    "required_documents": [
                        "Smart Ration Card (PHH / AAY)",
                        "Aadhaar Card",
                        "Gram Panchayat House Site Patta / Title Deed",
                        "Income Certificate",
                        "Bank Account Passbook"
                    ],
                    "application_steps_en": [
                        "Apply during Special Gram Sabha meeting or BDO office",
                        "Field verification by Block Overseer and Panchayat Secretary",
                        "Geo-tagging of existing hut and sanction order issue",
                        "Direct DBT installment transfers upon construction stage verification"
                    ],
                    "application_steps_ta": [
                        "சிறப்பு கிராம சபை கூட்டம் அல்லது வட்டார வளர்ச்சி அலுவலகத்தில் விண்ணப்பிக்கவும்",
                        "ஊராட்சி செயலாளர் கள ஆய்வு செய்து சான்றளிப்பார்",
                        "குடிசை புவிசார் குறியீடு (Geo-tag) செய்யப்பட்டு நிதி விடுவிக்கப்படும்"
                    ],
                    "application_steps_hi": [
                        "विशेष ग्राम सभा या बीडीओ कार्यालय में आवेदन करें",
                        "पंचायत सचिव द्वारा स्थलीय सत्यापन",
                        "चरणबद्ध निर्माण प्रगति पर बैंक खाते में राशि ट्रांसफर"
                    ]
                }
            },
            {
                "id": "a3333333-aaaa-aaaa-aaaa-aaaaaaaaaaaa",
                "slug": "mgnrega-100-day-employment",
                "title_en": "Mahatma Gandhi NREGA (100-Day Work)",
                "title_ta": "மகாத்மா காந்தி தேசிய ஊரக வேலை உறுதித் திட்டம்",
                "title_hi": "महात्मा गांधी राष्ट्रीय ग्रामीण रोजगार गारंटी अधिनियम",
                "department": "Ministry of Rural Development",
                "level": "central",
                "category": "Employment",
                "short_summary_en": "Guaranteed 100 days of wage employment in a financial year to every rural adult household willing to do manual work.",
                "short_summary_ta": "கிராமப்புற குடும்பங்களுக்கு 100 நாட்கள் சட்டப்பூர்வ ஊதிய வேலைவாய்ப்பு.",
                "short_summary_hi": "ग्रामीण परिवारों को एक वित्तीय वर्ष में 100 दिनों के अकुशल शारीरिक कार्य की कानूनी गारंटी।",
                "detailed_description_en": "The scheme guarantees at least 100 days of unskilled manual employment to adult members of any rural household willing to work. Wage rates in Tamil Nadu are updated annually with direct electronic transfers via DBT within 15 days of muster roll closure.",
                "detailed_description_ta": "ஒவ்வொரு கிராமப்புற குடும்பத்திற்கும் ஆண்டிற்கு 100 நாட்கள் வேலைவாய்ப்பு உத்தரவாதம் அளிக்கப்படுகிறது. ஊதியம் நேரடியாக வங்கிக் கணக்கில் செலுத்தப்படும்.",
                "detailed_description_hi": "ग्रामीण वयस्क सदस्यों को वर्ष में 100 दिन का अकुशल श्रम रोजगार गारंटी।",
                "financial_benefit_amount": 319.0,
                "benefit_frequency": "daily",
                "official_portal_url": "https://nrega.nic.in",
                "helpline_number": "1800-111-555",
                "is_active": True,
                "is_demo": True,
                "created_at": yesterday_iso,
                "criteria": {
                    "min_age": 18,
                    "max_age": 80,
                    "allowed_genders": ["all"],
                    "max_annual_income": None,
                    "max_landholding_acres": None,
                    "allowed_occupations": ["all"],
                    "allowed_social_categories": ["all"],
                    "allowed_ration_cards": ["all"],
                    "requires_disability": False,
                    "required_documents": [
                        "Aadhaar Card",
                        "Smart Ration Card",
                        "Bank Passbook or Post Office Savings Account",
                        "2 Passport size photos"
                    ],
                    "application_steps_en": [
                        "Submit Form 1 application to Gram Panchayat office",
                        "Receive MGNREGA Job Card within 15 calendar days",
                        "Submit written work requisition to Panchayat President or Secretary",
                        "Receive daily wages credited to Aadhaar-seeded bank account every week"
                    ],
                    "application_steps_ta": [
                        "படிவம் 1-ஐ கிராம ஊராட்சி அலுவலகத்தில் சமர்ப்பிக்கவும்",
                        "15 நாட்களுக்குள் வேலை அட்டை (Job Card) பெறவும்",
                        "வேலை கேட்டு விண்ணப்பம் அளித்து ஊதிய பலன் பெறவும்"
                    ],
                    "application_steps_hi": [
                        "ग्राम पंचायत कार्यालय में प्रपत्र 1 जमा करें",
                        "15 दिनों के भीतर जॉब कार्ड प्राप्त करें",
                        "काम की मांग करें और 15 दिनों के भीतर काम पाएं"
                    ]
                }
            },
            {
                "id": "a4444444-aaaa-aaaa-aaaa-aaaaaaaaaaaa",
                "slug": "tn-pudhumai-penn-scheme",
                "title_en": "Pudhumai Penn Scheme (Higher Education)",
                "title_ta": "புதுமைப் பெண் திட்டம்",
                "title_hi": "पुधुमै पेन योजना (उच्च शिक्षा वित्तीय सहायता)",
                "department": "Social Welfare & Women Empowerment, Tamil Nadu",
                "level": "state",
                "category": "Education",
                "short_summary_en": "Monthly assistance of ₹1,000 for girl students pursuing undergraduate degrees who studied in government schools (Class 6-12).",
                "short_summary_ta": "அரசுப் பள்ளிகளில் 6 முதல் 12 வரை படித்த மாணவிகளுக்கு பட்டப்படிப்பு முடியும் வரை மாதம் ₹1,000.",
                "short_summary_hi": "सरकारी स्कूलों (कक्षा 6-12) से पढ़ी छात्राओं को स्नातक की पढ़ाई पूरी करने तक प्रतिमाह ₹1,000।",
                "detailed_description_en": "Moovalur Ramamirtham Ammaiyar Higher Education Assurance Scheme provides Rs. 1,000 per month directly to girl students enrolled in recognized higher education institutions who studied in Tamil Nadu Government schools from classes 6 to 12.",
                "detailed_description_ta": "அரசு பள்ளிகளில் படித்து உயர்கல்வி பயிலும் மாணவிகளின் இடைநிற்றலை தடுத்து, பெண்கல்வியை ஊக்குவிக்க மாதம் ₹1,000 வழங்கப்படுகிறது.",
                "detailed_description_hi": "सरकारी स्कूलों से पढ़ी छात्राओं को कॉलेज स्तर पर आर्थिक सहायता प्रदान करने हेतु ₹1,000 प्रति माह।",
                "financial_benefit_amount": 12000.0,
                "benefit_frequency": "annual",
                "official_portal_url": "https://pudhumaipenn.tn.gov.in",
                "helpline_number": "044-25670845",
                "is_active": True,
                "is_demo": True,
                "created_at": yesterday_iso,
                "criteria": {
                    "min_age": 17,
                    "max_age": 26,
                    "allowed_genders": ["female"],
                    "max_annual_income": None,
                    "max_landholding_acres": None,
                    "allowed_occupations": ["student"],
                    "allowed_social_categories": ["all"],
                    "allowed_ration_cards": ["all"],
                    "requires_disability": False,
                    "required_documents": [
                        "Government School Transfer Certificate / Bonafide (Class 6-12)",
                        "College Admission Bonafide / ID Card",
                        "Aadhaar Card",
                        "Personal Bank Account (Aadhaar Seeded)"
                    ],
                    "application_steps_en": [
                        "Register through the college nodal officer on Pudhumai Penn Portal",
                        "Upload school bonafide certificates verifying Govt school education",
                        "Direct monthly credit of Rs 1,000 to student account via PFMS"
                    ],
                    "application_steps_ta": [
                        "கல்லூரி ஒருங்கிணைப்பாளர் மூலம் புதுமைப் பெண் தளத்தில் பதியவும்",
                        "6 முதல் 12 வரை அரசுப் பள்ளி சான்றிதழ் சமர்ப்பிக்கவும்",
                        "மாதந்தோறும் வங்கி கணக்கில் ₹1,000 வரவு வைக்கப்படும்"
                    ],
                    "application_steps_hi": [
                        "कॉलेज नोडल अधिकारी के माध्यम से पुधुमै पेन पोर्टल पर पंजीकरण करें",
                        "सरकारी स्कूल बोनाफाइड अपलोड करें",
                        "मासिक ₹1,000 छात्र के खाते में प्राप्त करें"
                    ]
                }
            },
            {
                "id": "a5555555-aaaa-aaaa-aaaa-aaaaaaaaaaaa",
                "slug": "jal-jeevan-mission-fhtc",
                "title_en": "Jal Jeevan Mission - Har Ghar Jal",
                "title_ta": "ஜல் ஜீவன் மிஷன் - கிராமப்புற குடிநீர் திட்டம்",
                "title_hi": "जल जीवन मिशन - हर घर जल",
                "department": "Department of Drinking Water & Sanitation",
                "level": "central",
                "category": "Drinking Water",
                "short_summary_en": "Functional Household Tap Connection (FHTC) providing 55 liters per capita per day potable water to every rural home.",
                "short_summary_ta": "ஒவ்வொரு கிராம வீட்டிற்கும் தலா 55 லிட்டர் பாதுகாக்கப்பட்ட குடிநீர் குழாய் இணைப்பு.",
                "short_summary_hi": "प्रत्येक ग्रामीण घर में 55 लीटर प्रति व्यक्ति प्रतिदिन की दर से नल से स्वच्छ पेयजल आपूर्ति।",
                "detailed_description_en": "Jal Jeevan Mission aims to ensure potable water supply in adequate quantity (55 lpcd) and prescribed quality on a long-term basis to every rural household through individual Functional Household Tap Connections.",
                "detailed_description_ta": "கிராமப்புறங்களில் உள்ள அனைத்து வீடுகளுக்கும் பாதுகாக்கப்பட்ட தூய குடிநீரை குழாய் மூலம் வழங்க மத்திய மற்றும் மாநில அரசுகள் இணைந்து செயல்படுத்தும் திட்டம்.",
                "detailed_description_hi": "ग्रामीण क्षेत्रों में हर घर तक शुद्ध पेयजल नल से पहुंचाने की महत्वाकांक्षी राष्ट्रीय योजना।",
                "financial_benefit_amount": 0.0,
                "benefit_frequency": "one_time",
                "official_portal_url": "https://jaljeevanmission.gov.in",
                "helpline_number": "1800-180-1551",
                "is_active": True,
                "is_demo": True,
                "created_at": yesterday_iso,
                "criteria": {
                    "min_age": 18,
                    "max_age": 100,
                    "allowed_genders": ["all"],
                    "max_annual_income": None,
                    "max_landholding_acres": None,
                    "allowed_occupations": ["all"],
                    "allowed_social_categories": ["all"],
                    "allowed_ration_cards": ["all"],
                    "requires_disability": False,
                    "required_documents": [
                        "Aadhaar Card",
                        "House Tax Receipt / Property Document",
                        "Ration Card"
                    ],
                    "application_steps_en": [
                        "Register request with Village Water and Sanitation Committee (VWSC)",
                        "Site inspection and pipeline pressure feasibility check",
                        "Connection installed without upfront infrastructure cost"
                    ],
                    "application_steps_ta": [
                        "கிராம குடிநீர் மற்றும் சுகாதார குழுவிடம் கோரிக்கை பதியவும்",
                        "கள ஆய்வு மற்றும் குழாய் இணைப்பு வழங்கப்படுதல்"
                    ],
                    "application_steps_hi": [
                        "ग्राम जल एवं स्वच्छता समिति में पंजीकरण करें",
                        "निरीक्षण उपरांत निःशुल्क कनेक्शन प्राप्त करें"
                    ]
                }
            },
            {
                "id": "a6666666-aaaa-aaaa-aaaa-aaaaaaaaaaaa",
                "slug": "cmchis-health-insurance-tn",
                "title_en": "Chief Ministers Comprehensive Health Insurance (CMCHIS)",
                "title_ta": "முதலமைச்சரின் விரிவான மருத்துவக் காப்பீட்டுத் திட்டம்",
                "title_hi": "मुख्यमंत्री व्यापक स्वास्थ्य बीमा योजना",
                "department": "Health & Family Welfare Department, Tamil Nadu",
                "level": "state",
                "category": "Health",
                "short_summary_en": "Cashless hospital coverage up to ₹5 Lakhs per family per year across 1,000+ empanelled government and private hospitals.",
                "short_summary_ta": "ஆண்டுக்கு ₹5 லட்சம் வரை கட்டணமில்லா மருத்துவ சிகிச்சை வழங்கும் காப்பீடு.",
                "short_summary_hi": "प्रति परिवार प्रति वर्ष ₹5 लाख तक का कैशलेस अस्पताल उपचार कवर।",
                "detailed_description_en": "CMCHIS provides cashless hospitalization for specific complications and diagnostic procedures up to Rs. 5,00,000 per family per annum. Covers rural households with annual family income below Rs. 1,20,000 and special occupational groups.",
                "detailed_description_ta": "ஆண்டு வருமானம் ₹1,20,000-க்கு குறைவாக உள்ள குடும்பங்களுக்கு அரசு மற்றும் தனியார் மருத்துவமனைகளில் ₹5 லட்சம் வரை கட்டணமில்லா நவீன சிகிச்சை.",
                "detailed_description_hi": "वार्षिक ₹5 लाख तक का कैशलेस स्वास्थ्य कवर सरकारी और निजी अस्पतालों में।",
                "financial_benefit_amount": 500000.0,
                "benefit_frequency": "annual",
                "official_portal_url": "https://cmchistn.com",
                "helpline_number": "1800-425-3993",
                "is_active": True,
                "is_demo": True,
                "created_at": yesterday_iso,
                "criteria": {
                    "min_age": 0,
                    "max_age": 120,
                    "allowed_genders": ["all"],
                    "max_annual_income": 120000.0,
                    "max_landholding_acres": None,
                    "allowed_occupations": ["all"],
                    "allowed_social_categories": ["all"],
                    "allowed_ration_cards": ["AAY", "PHH"],
                    "requires_disability": False,
                    "required_documents": [
                        "Smart Ration Card",
                        "Aadhaar Card of all family members",
                        "Income Certificate issued by Revenue Authority"
                    ],
                    "application_steps_en": [
                        "Visit District Collectorate or designated e-Seva kiosk",
                        "Biometric enrollment for CMCHIS smart card",
                        "Present card at any empanelled hospital counter for cashless admission"
                    ],
                    "application_steps_ta": [
                        "மாவட்ட ஆட்சியர் அலுவலகம் அல்லது இ-சேவை மையத்தை அணுகவும்",
                        "முதலமைச்சர் காப்பீட்டு அட்டை பெற விரல்ரேகை பதிவு செய்யவும்",
                        "அங்கீகரிக்கப்பட்ட மருத்துவமனைகளில் கட்டணமில்லா சிகிச்சை பெறவும்"
                    ],
                    "application_steps_hi": [
                        "जिला कलेक्ट्रेट या ई-सेवा केंद्र पर बायोमेट्रिक पंजीकरण करें",
                        "स्मार्ट कार्ड प्राप्त करें और पैनलबद्ध अस्पतालों में कैशलेस इलाज पाएं"
                    ]
                }
            }
        ]

        # 4. Saved schemes for Muthuvel
        saved_schemes = [
            {
                "id": str(uuid.uuid4()),
                "user_id": "11111111-1111-1111-1111-111111111111",
                "scheme_id": "a1111111-aaaa-aaaa-aaaa-aaaaaaaaaaaa",
                "notes": "Patta applied at VAO office; awaiting verification.",
                "created_at": yesterday_iso
            },
            {
                "id": str(uuid.uuid4()),
                "user_id": "11111111-1111-1111-1111-111111111111",
                "scheme_id": "a2222222-aaaa-aaaa-aaaa-aaaaaaaaaaaa",
                "notes": "Applied in Gram Sabha; Overseer inspection due.",
                "created_at": yesterday_iso
            }
        ]

        # 5. Village Projects (13-Stage Rural Infrastructure)
        stages_order = [
            ("planning", 1, "Site Identification & Hydrogeological Survey"),
            ("budget_approved", 2, "Administrative & Technical Sanction"),
            ("tender_floated", 3, "E-Tender Publication"),
            ("contractor_assigned", 4, "Contractor Assigned & Work Order"),
            ("foundation_work", 5, "Excavation & RCC Foundation"),
            ("structure_laying", 6, "Main Structure & Pipeline Laying"),
            ("mid_term_inspection", 7, "Assistant Executive Engineer Mid-Inspection"),
            ("quality_testing", 8, "Hydrostatic Pressure & Quality Testing"),
            ("final_finishing", 9, "Painting, Disinfection & Safety Signage"),
            ("completion_handover", 10, "Trial Run & Panchayat Handover"),
            ("official_signoff", 11, "District Collector Sign-Off"),
            ("public_audit", 12, "Gram Sabha Social Audit"),
            ("maintenance_active", 13, "Active Maintenance & Public Dashboard")
        ]

        def make_milestones(proj_id: str, current_stage_num: int):
            m_list = []
            for stage_slug, num, title in stages_order:
                completed = num < current_stage_num
                m_list.append({
                    "id": str(uuid.uuid4()),
                    "project_id": proj_id,
                    "stage": stage_slug,
                    "stage_number": num,
                    "title": title,
                    "description": f"Standard rural milestone {num} for {title}",
                    "is_completed": completed,
                    "target_date": (datetime.now() + timedelta(days=(num - current_stage_num) * 15)).date().isoformat(),
                    "completed_date": (datetime.now() - timedelta(days=(current_stage_num - num) * 15)).date().isoformat() if completed else None
                })
            return m_list

        projects = [
            {
                "id": "b1111111-bbbb-bbbb-bbbb-bbbbbbbbbbbb",
                "code": "TN-CGL-2026-WTR-01",
                "title_en": "Overhead Water Tank & Distribution Pipeline",
                "title_ta": "மேல்நிலை நீர்த்தேக்கத் தொட்டி மற்றும் குழாய் பதிக்கும் திட்டம்",
                "title_hi": "ओवरहेड पानी की टंकी और वितरण पाइपलाइन परियोजना",
                "village": "Melmaruvathur",
                "gram_panchayat": "Melmaruvathur Panchayat",
                "block": "Cheyyur",
                "district": "Chengalpattu",
                "state": "Tamil Nadu",
                "latitude": 12.4346,
                "longitude": 79.8297,
                "category": "Drinking Water",
                "sanctioned_budget": 4200000.0,
                "spent_budget": 3150000.0,
                "contractor_name": "Kavitha Civil Infrastructure Ltd",
                "contractor_contact": "+91-9443211223",
                "current_stage": "quality_testing",
                "progress_percentage": 75,
                "start_date": "2026-02-10",
                "expected_completion_date": "2026-11-30",
                "nodal_officer_id": "22222222-2222-2222-2222-222222222222",
                "nodal_officer_name": "Dr. Selvi Ramanathan (BDO)",
                "description_en": "Construction of 60,000-liter capacity RCC elevated service reservoir with 4.8 km ductile iron underground distribution pipelines connecting 420 rural households in Melmaruvathur.",
                "description_ta": "மேல்மருவத்தூரில் 420 குடும்பங்களுக்கு தூய குடிநீர் வழங்கும் வகையில் 60,000 லிட்டர் மேல்நிலை நீர்த்தேக்கத் தொட்டி மற்றும் 4.8 கி.மீ பகிர்மான குழாய் பதிக்கும் பணி.",
                "description_hi": "मेलमरुवथुर में 420 परिवारों के लिए 60,000 लीटर क्षमता की पानी की टंकी और 4.8 किमी पाइपलाइन निर्माण।",
                "cover_image_url": "https://images.unsplash.com/photo-1541888946425-d0fbb18086f6?auto=format&fit=crop&w=800&q=80",
                "is_demo": True,
                "created_at": yesterday_iso,
                "milestones": make_milestones("b1111111-bbbb-bbbb-bbbb-bbbbbbbbbbbb", 8),
                "updates": [
                    {
                        "id": str(uuid.uuid4()),
                        "project_id": "b1111111-bbbb-bbbb-bbbb-bbbbbbbbbbbb",
                        "stage": "mid_term_inspection",
                        "update_notes": "Structural concrete strength passed 28-day cube test (32.4 MPa). Pipeline pressure testing underway in Sector 2.",
                        "photo_urls": ["https://images.unsplash.com/photo-1590496793929-36417d3117de?auto=format&fit=crop&w=600&q=80"],
                        "expenditure_reported": 850000.0,
                        "official_name": "Dr. Selvi Ramanathan",
                        "created_at": yesterday_iso
                    }
                ]
            },
            {
                "id": "b2222222-bbbb-bbbb-bbbb-bbbbbbbbbbbb",
                "code": "TN-CGL-2026-RD-04",
                "title_en": "Concrete Road Laying - South Colony Link",
                "title_ta": "தெற்கு காலனி சிமெண்ட் சாலை அமைத்தல்",
                "title_hi": "साउथ कॉलोनी लिंक कंक्रीट सड़क निर्माण",
                "village": "Sothupakkam",
                "gram_panchayat": "Sothupakkam Panchayat",
                "block": "Cheyyur",
                "district": "Chengalpattu",
                "state": "Tamil Nadu",
                "latitude": 12.4491,
                "longitude": 79.8456,
                "category": "Roads & Bridges",
                "sanctioned_budget": 1850000.0,
                "spent_budget": 1850000.0,
                "contractor_name": "Sri Balaji Roadworks",
                "contractor_contact": "+91-9842134567",
                "current_stage": "public_audit",
                "progress_percentage": 95,
                "start_date": "2026-03-01",
                "expected_completion_date": "2026-10-31",
                "nodal_officer_id": "22222222-2222-2222-2222-222222222222",
                "nodal_officer_name": "Dr. Selvi Ramanathan (BDO)",
                "description_en": "Laying 1.2 km of all-weather CC road with side drainage channels connecting agricultural fields and bus stop.",
                "description_ta": "விவசாய நிலங்களையும் பேருந்து நிலையத்தையும் இணைக்கும் 1.2 கி.மீ நீள சிமெண்ட் சாலை மற்றும் வடிகால் வசதி.",
                "description_hi": "1.2 किमी पक्की कंक्रीट सड़क और दोनों ओर नाली निर्माण कार्य।",
                "cover_image_url": "https://images.unsplash.com/photo-1578575437130-527eed3abbec?auto=format&fit=crop&w=800&q=80",
                "is_demo": True,
                "created_at": yesterday_iso,
                "milestones": make_milestones("b2222222-bbbb-bbbb-bbbb-bbbbbbbbbbbb", 12),
                "updates": [
                    {
                        "id": str(uuid.uuid4()),
                        "project_id": "b2222222-bbbb-bbbb-bbbb-bbbbbbbbbbbb",
                        "stage": "official_signoff",
                        "update_notes": "Road core cut samples verified. Edge curbs completed. Ready for Gram Sabha public audit presentation.",
                        "photo_urls": ["https://images.unsplash.com/photo-1621905251918-48416bd8575a?auto=format&fit=crop&w=600&q=80"],
                        "expenditure_reported": 1850000.0,
                        "official_name": "Dr. Selvi Ramanathan",
                        "created_at": yesterday_iso
                    }
                ]
            },
            {
                "id": "b3333333-bbbb-bbbb-bbbb-bbbbbbbbbbbb",
                "code": "TN-CGL-2026-SOL-09",
                "title_en": "Village Solar High-Mast & Streetlight Modernization",
                "title_ta": "கிராம சூரிய மின்விளக்கு மற்றும் உயர்கோபுர விளக்கு திட்டம்",
                "title_hi": "सौर स्ट्रीट लाइट और हाई-मास्ट पोल परियोजना",
                "village": "Acharapakkam",
                "gram_panchayat": "Acharapakkam Town Panchayat",
                "block": "Madurantakam",
                "district": "Chengalpattu",
                "state": "Tamil Nadu",
                "latitude": 12.4089,
                "longitude": 79.8142,
                "category": "Streetlights & Electricity",
                "sanctioned_budget": 950000.0,
                "spent_budget": 450000.0,
                "contractor_name": "SunShine Green Tech",
                "contractor_contact": "+91-9789012345",
                "current_stage": "structure_laying",
                "progress_percentage": 45,
                "start_date": "2026-06-15",
                "expected_completion_date": "2026-12-20",
                "nodal_officer_id": "22222222-2222-2222-2222-222222222222",
                "nodal_officer_name": "Dr. Selvi Ramanathan (BDO)",
                "description_en": "Installation of 45 solar LED automatic dusk-to-dawn streetlights and 2 central high-mast lights at village junctions.",
                "description_ta": "45 சூரிய ஒளி மின்விளக்குகள் மற்றும் 2 உயர்கோபுர விளக்குகள் அமைக்கும் பணி.",
                "description_hi": "45 सौर एलईडी स्ट्रीट लाइट और 2 हाई-मास्ट लाइटों की स्थापना।",
                "cover_image_url": "https://images.unsplash.com/photo-1509391365360-2e959784a276?auto=format&fit=crop&w=800&q=80",
                "is_demo": True,
                "created_at": yesterday_iso,
                "milestones": make_milestones("b3333333-bbbb-bbbb-bbbb-bbbbbbbbbbbb", 6),
                "updates": []
            },
            {
                "id": "b4444444-bbbb-bbbb-bbbb-bbbbbbbbbbbb",
                "code": "TN-CGL-2026-ANG-12",
                "title_en": "Model Anganwadi Child Nutrition Center Upgradation",
                "title_ta": "மாதிரி அங்கன்வாடி குழந்தைகள் ஊட்டச்சத்து மைய புனரமைப்பு",
                "title_hi": "मॉडल आंगनवाड़ी केंद्र का आधुनिकीकरण",
                "village": "Melmaruvathur",
                "gram_panchayat": "Melmaruvathur Panchayat",
                "block": "Cheyyur",
                "district": "Chengalpattu",
                "state": "Tamil Nadu",
                "latitude": 12.4380,
                "longitude": 79.8315,
                "category": "Public Buildings",
                "sanctioned_budget": 820000.0,
                "spent_budget": 120000.0,
                "contractor_name": "Panchayat Community Engineering Wing",
                "contractor_contact": "+91-9442001122",
                "current_stage": "tender_floated",
                "progress_percentage": 15,
                "start_date": "2026-08-01",
                "expected_completion_date": "2027-01-31",
                "nodal_officer_id": "22222222-2222-2222-2222-222222222222",
                "nodal_officer_name": "Dr. Selvi Ramanathan (BDO)",
                "description_en": "Smart classroom remodeling, child-friendly sanitary facilities, clean drinking RO water plant, and nutritional kitchen garden.",
                "description_ta": "ஸ்மார்ட் வகுப்பறை, பாதுகாக்கப்பட்ட குடிநீர் மற்றும் ஊட்டச்சத்து தோட்டம் அமைத்தல்.",
                "description_hi": "आंगनवाड़ी केंद्र में स्मार्ट क्लासरूम, आरओ जल संयंत्र और पोषण वाटिका का विकास।",
                "cover_image_url": "https://images.unsplash.com/photo-1580582932707-520aed937b7b?auto=format&fit=crop&w=800&q=80",
                "is_demo": True,
                "created_at": yesterday_iso,
                "milestones": make_milestones("b4444444-bbbb-bbbb-bbbb-bbbbbbbbbbbb", 3),
                "updates": []
            }
        ]

        # 6. Citizen Reports (6-Stage Resolution Timeline)
        reports = [
            {
                "id": "c1111111-cccc-cccc-cccc-cccccccccccc",
                "reference_id": "GV-REP-20261015-1042",
                "citizen_id": "11111111-1111-1111-1111-111111111111",
                "citizen_name": "Muthuvel K",
                "category": "drinking_water",
                "title": "Handpump non-functional for past 2 weeks",
                "description": "The public handpump near the Mariamman temple has dried cylinder and broken lever handle. Over 60 families are walking 1.5 km for daily water.",
                "village": "Melmaruvathur",
                "block": "Cheyyur",
                "district": "Chengalpattu",
                "landmark": "Opposite Mariamman Temple, West Street",
                "latitude": 12.4352,
                "longitude": 79.8285,
                "photo_urls": ["https://images.unsplash.com/photo-1584467735871-8e85353a8413?auto=format&fit=crop&w=600&q=80"],
                "current_status": "in_progress",
                "assigned_official_id": "22222222-2222-2222-2222-222222222222",
                "assigned_official_name": "Dr. Selvi Ramanathan (BDO)",
                "priority": "high",
                "is_public": True,
                "resolution_notes": "Replacement cylinder parts dispatched with field mechanics.",
                "resolution_photo_urls": [],
                "closed_at": None,
                "is_demo": True,
                "created_at": yesterday_iso,
                "updated_at": now_iso,
                "timeline": [
                    {
                        "id": str(uuid.uuid4()),
                        "report_id": "c1111111-cccc-cccc-cccc-cccccccccccc",
                        "actor_name": "Muthuvel K (Citizen)",
                        "from_status": None,
                        "to_status": "submitted",
                        "action_note": "Issue reported with GPS coordinates and clear landmark.",
                        "evidence_urls": [],
                        "created_at": yesterday_iso
                    },
                    {
                        "id": str(uuid.uuid4()),
                        "report_id": "c1111111-cccc-cccc-cccc-cccccccccccc",
                        "actor_name": "Dr. Selvi Ramanathan (BDO)",
                        "from_status": "submitted",
                        "to_status": "triaged",
                        "action_note": "Assigned to Cheyyur Rural Water Supply engineering field team.",
                        "evidence_urls": [],
                        "created_at": yesterday_iso
                    },
                    {
                        "id": str(uuid.uuid4()),
                        "report_id": "c1111111-cccc-cccc-cccc-cccccccccccc",
                        "actor_name": "Cheyyur RWS Overseer",
                        "from_status": "triaged",
                        "to_status": "inspection_scheduled",
                        "action_note": "Field technician inspected site. Cylinder wear and seal leakage identified.",
                        "evidence_urls": [],
                        "created_at": now_iso
                    },
                    {
                        "id": str(uuid.uuid4()),
                        "report_id": "c1111111-cccc-cccc-cccc-cccccccccccc",
                        "actor_name": "Field Engineering Team",
                        "from_status": "inspection_scheduled",
                        "to_status": "in_progress",
                        "action_note": "Procured heavy-duty replacement kit. Assembly and flushing underway.",
                        "evidence_urls": [],
                        "created_at": now_iso
                    }
                ]
            },
            {
                "id": "c2222222-cccc-cccc-cccc-cccccccccccc",
                "reference_id": "GV-REP-20261016-8921",
                "citizen_id": "11111111-1111-1111-1111-111111111111",
                "citizen_name": "Muthuvel K",
                "category": "roads_and_bridges",
                "title": "Severe culvert damage causing water stagnation",
                "description": "Monsoon runoff caused partial breach of the agricultural access culvert near the school canal. Tractors and two-wheelers unable to pass safely.",
                "village": "Sothupakkam",
                "block": "Cheyyur",
                "district": "Chengalpattu",
                "landmark": "Near Government Higher Secondary School Canal",
                "latitude": 12.4475,
                "longitude": 79.8430,
                "photo_urls": ["https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?auto=format&fit=crop&w=600&q=80"],
                "current_status": "triaged",
                "assigned_official_id": "22222222-2222-2222-2222-222222222222",
                "assigned_official_name": "Dr. Selvi Ramanathan (BDO)",
                "priority": "high",
                "is_public": True,
                "resolution_notes": None,
                "resolution_photo_urls": [],
                "closed_at": None,
                "is_demo": True,
                "created_at": yesterday_iso,
                "updated_at": now_iso,
                "timeline": [
                    {
                        "id": str(uuid.uuid4()),
                        "report_id": "c2222222-cccc-cccc-cccc-cccccccccccc",
                        "actor_name": "Muthuvel K (Citizen)",
                        "from_status": None,
                        "to_status": "submitted",
                        "action_note": "Logged citizen grievance with photos of culvert subsidence.",
                        "evidence_urls": [],
                        "created_at": yesterday_iso
                    },
                    {
                        "id": str(uuid.uuid4()),
                        "report_id": "c2222222-cccc-cccc-cccc-cccccccccccc",
                        "actor_name": "Dr. Selvi Ramanathan (BDO)",
                        "from_status": "submitted",
                        "to_status": "triaged",
                        "action_note": "Marked HIGH priority due to upcoming harvest transport.",
                        "evidence_urls": [],
                        "created_at": now_iso
                    }
                ]
            },
            {
                "id": "c3333333-cccc-cccc-cccc-cccccccccccc",
                "reference_id": "GV-REP-20261017-3104",
                "citizen_id": "11111111-1111-1111-1111-111111111111",
                "citizen_name": "Muthuvel K",
                "category": "streetlights_electricity",
                "title": "3 LED Streetlights fused on Bus Stop Road",
                "description": "Dark stretch of 300 meters near the bus shelter. Difficult for women and seniors walking back from fields in evening.",
                "village": "Melmaruvathur",
                "block": "Cheyyur",
                "district": "Chengalpattu",
                "landmark": "Main Road Bus Stop Junction",
                "latitude": 12.4360,
                "longitude": 79.8320,
                "photo_urls": [],
                "current_status": "submitted",
                "assigned_official_id": None,
                "assigned_official_name": None,
                "priority": "normal",
                "is_public": True,
                "resolution_notes": None,
                "resolution_photo_urls": [],
                "closed_at": None,
                "is_demo": True,
                "created_at": now_iso,
                "updated_at": now_iso,
                "timeline": [
                    {
                        "id": str(uuid.uuid4()),
                        "report_id": "c3333333-cccc-cccc-cccc-cccccccccccc",
                        "actor_name": "Muthuvel K (Citizen)",
                        "from_status": None,
                        "to_status": "submitted",
                        "action_note": "Submitted issue via web portal.",
                        "evidence_urls": [],
                        "created_at": now_iso
                    }
                ]
            }
        ]

        # 7. Announcements
        announcements = [
            {
                "id": "d1111111-dddd-dddd-dddd-dddddddddddd",
                "publisher_name": "Dr. Selvi Ramanathan (BDO Cheyyur)",
                "title_en": "Special Gram Sabha Meeting Notice - October 2026",
                "title_ta": "சிறப்பு கிராம சபை கூட்டம் அறிவிப்பு - அக்டோபர் 2026",
                "title_hi": "विशेष ग्राम सभा बैठक सूचना - अक्टूबर 2026",
                "body_en": "All citizens of Melmaruvathur Panchayat are invited to attend the Gram Sabha meeting on Tuesday at 10:00 AM at the Panchayat Community Hall to audit village water projects and approve the new beneficiary list for Kalaignar Kanavu Illam.",
                "body_ta": "மேல்மருவத்தூர் ஊராட்சியின் சிறப்பு கிராம சபை கூட்டம் வரும் செவ்வாய்க்கிழமை காலை 10:00 மணிக்கு ஊராட்சி மன்ற அலுவலகத்தில் நடைபெறும். குடிநீர் திட்ட சமூக தணிக்கை மற்றும் கலைஞர் கனவு இல்ல பயனாளி பட்டியல் ஒப்புதல் செய்யப்படும்.",
                "body_hi": "मेलमरुवथुर पंचायत के सभी नागरिकों को मंगलवार सुबह 10:00 बजे पंचायत भवन में ग्राम सभा बैठक में भाग लेने के लिए आमंत्रित किया जाता है।",
                "priority": "high",
                "target_level": "panchayat",
                "target_area": "Melmaruvathur",
                "event_date": (datetime.now() + timedelta(days=3)).replace(hour=10, minute=0).isoformat(),
                "expires_at": (datetime.now() + timedelta(days=7)).isoformat(),
                "is_verified": True,
                "is_demo": True,
                "created_at": yesterday_iso
            },
            {
                "id": "d2222222-dddd-dddd-dddd-dddddddddddd",
                "publisher_name": "District Disaster Management Authority",
                "title_en": "Monsoon Rain Preparedness Alert & Emergency Contacts",
                "title_ta": "வடகிழக்கு பருவமழை முன்னெச்சரிக்கை மற்றும் அவசர உதவி எண்கள்",
                "title_hi": "पूर्वोत्तर मानसून वर्षा पूर्व चेतावनी और आपातकालीन संपर्क",
                "body_en": "IMD forecasts moderate to heavy rainfall over Chengalpattu coastal belt. Block Emergency Control Room opened 24/7 at Cheyyur Taluk Office. Dial 1077 or 044-27420000 for immediate disaster assistance.",
                "body_ta": "செங்கல்பட்டு மாவட்டத்தில் கனமழை எச்சரிக்கை விடுக்கப்பட்டுள்ளது. செய்யூர் வட்டார அவசர கட்டுப்பாட்டு அறை 24 மணி நேரமும் செயல்படுகிறது. அவசர உதவிக்கு 1077 அல்லது 044-27420000 எண்ணை அழைக்கவும்.",
                "body_hi": "चेंगलपट्टू क्षेत्र में भारी बारिश की चेतावनी। चेय्यूर तालुका कार्यालय में 24/7 आपातकालीन नियंत्रण कक्ष खुला है। डायल करें 1077।",
                "priority": "emergency",
                "target_level": "district",
                "target_area": "Chengalpattu",
                "event_date": now_iso,
                "expires_at": (datetime.now() + timedelta(days=5)).isoformat(),
                "is_verified": True,
                "is_demo": True,
                "created_at": yesterday_iso
            }
        ]

        # 8. Voice Subscriptions & Campaigns
        voice_subscriptions = [
            {
                "id": str(uuid.uuid4()),
                "user_id": "11111111-1111-1111-1111-111111111111",
                "phone_number": "+919840123456",
                "subscriber_name": "Muthuvel K",
                "preferred_language": "ta",
                "village": "Melmaruvathur",
                "district": "Chengalpattu",
                "consent_given": True,
                "consent_recorded_at": yesterday_iso,
                "is_active": True
            },
            {
                "id": str(uuid.uuid4()),
                "user_id": None,
                "phone_number": "+919840998877",
                "subscriber_name": "K. Murugesan",
                "preferred_language": "ta",
                "village": "Sothupakkam",
                "district": "Chengalpattu",
                "consent_given": True,
                "consent_recorded_at": yesterday_iso,
                "is_active": True
            }
        ]

        voice_campaigns = [
            {
                "id": "e1111111-eeee-eeee-eeee-eeeeeeeeeeee",
                "campaign_name": "Gram Sabha October Reminder",
                "audio_script_text": "வணக்கம், மேல்மருவத்தூர் ஊராட்சியின் சிறப்பு கிராம சபை கூட்டம் வரும் செவ்வாய் காலை 10 மணிக்கு கூடுகிறது. குடிநீர் திட்ட பணிகள் பற்றி பேச பொதுமக்கள் அனைவரும் வருகை தர வேண்டுகிறோம்.",
                "target_language": "ta",
                "target_district": "Chengalpattu",
                "target_block": "Cheyyur",
                "approved_by_admin": True,
                "scheduled_dispatch_time": now_iso,
                "status": "completed",
                "created_at": yesterday_iso
            }
        ]

        call_logs = [
            {
                "id": str(uuid.uuid4()),
                "subscription_id": voice_subscriptions[0]["id"],
                "campaign_id": "e1111111-eeee-eeee-eeee-eeeeeeeeeeee",
                "campaign_name": "Gram Sabha October Reminder",
                "phone_number": "+919840123456",
                "call_status": "delivered",
                "duration_seconds": 42,
                "attempt_timestamp": yesterday_iso,
                "failure_reason": None
            }
        ]

        # 9. Audit Logs
        audit_logs = [
            {
                "id": str(uuid.uuid4()),
                "user_id": "44444444-4444-4444-4444-444444444444",
                "user_name": "State Governance Admin",
                "action": "OFFICIAL_VERIFIED",
                "entity_type": "official_profile",
                "entity_id": "22222222-2222-2222-2222-222222222222",
                "details": {"designation": "BDO Cheyyur", "status": "approved"},
                "ip_address": "127.0.0.1",
                "created_at": yesterday_iso
            }
        ]

        self.data = {
            "users": users,
            "citizen_profiles": citizen_profiles,
            "official_profiles": official_profiles,
            "schemes": schemes,
            "saved_schemes": saved_schemes,
            "projects": projects,
            "reports": reports,
            "announcements": announcements,
            "voice_subscriptions": voice_subscriptions,
            "voice_campaigns": voice_campaigns,
            "call_logs": call_logs,
            "audit_logs": audit_logs
        }
        self.save_state()

    # ==========================================================================
    # USER & AUTH ACCESS METHODS
    # ==========================================================================
    def get_user_by_email(self, email: str) -> Optional[Dict[str, Any]]:
        for u in self.data.get("users", []):
            if u["email"].lower() == email.lower():
                return u
        return None

    def get_user_by_id(self, user_id: str) -> Optional[Dict[str, Any]]:
        for u in self.data.get("users", []):
            if str(u["id"]) == str(user_id):
                return u
        return None

    def create_user(self, user_dict: Dict[str, Any]) -> Dict[str, Any]:
        user_dict["id"] = str(uuid.uuid4())
        user_dict["created_at"] = datetime.now().isoformat()
        user_dict["is_active"] = True
        self.data["users"].append(user_dict)
        self.save_state()
        return user_dict

    def update_user_password(self, email: str, new_hash: str) -> bool:
        user = self.get_user_by_email(email)
        if user:
            user["hashed_password"] = new_hash
            self.save_state()
            return True
        return False

    def get_citizen_profile(self, user_id: str) -> Optional[Dict[str, Any]]:
        return self.data.get("citizen_profiles", {}).get(str(user_id))

    def set_citizen_profile(self, user_id: str, profile_dict: Dict[str, Any]):
        self.data.setdefault("citizen_profiles", {})[str(user_id)] = profile_dict
        self.save_state()

    def get_official_profile(self, user_id: str) -> Optional[Dict[str, Any]]:
        return self.data.get("official_profiles", {}).get(str(user_id))

    def set_official_profile(self, user_id: str, profile_dict: Dict[str, Any]):
        self.data.setdefault("official_profiles", {})[str(user_id)] = profile_dict
        self.save_state()

    # ==========================================================================
    # SCHEMES & SAVED SCHEMES
    # ==========================================================================
    def get_schemes(self, category: Optional[str] = None, search: Optional[str] = None, level: Optional[str] = None) -> List[Dict[str, Any]]:
        results = self.data.get("schemes", [])
        if category and category.lower() != "all":
            results = [s for s in results if s.get("category", "").lower() == category.lower()]
        if level and level.lower() != "all":
            results = [s for s in results if s.get("level", "").lower() == level.lower()]
        if search:
            q = search.lower()
            results = [
                s for s in results if (
                    q in s.get("title_en", "").lower() or
                    q in s.get("title_ta", "").lower() or
                    q in s.get("title_hi", "").lower() or
                    q in s.get("department", "").lower() or
                    q in s.get("short_summary_en", "").lower()
                )
            ]
        return results

    def get_scheme_by_id(self, scheme_id: str) -> Optional[Dict[str, Any]]:
        for s in self.data.get("schemes", []):
            if str(s["id"]) == str(scheme_id) or s.get("slug") == str(scheme_id):
                return s
        return None

    def get_saved_schemes(self, user_id: str) -> List[Dict[str, Any]]:
        user_saved = [ss for ss in self.data.get("saved_schemes", []) if str(ss.get("user_id")) == str(user_id)]
        enriched = []
        for item in user_saved:
            sch = self.get_scheme_by_id(item["scheme_id"])
            if sch:
                enriched.append({
                    "id": item["id"],
                    "scheme_id": item["scheme_id"],
                    "notes": item.get("notes"),
                    "created_at": item.get("created_at"),
                    "scheme": sch
                })
        return enriched

    def save_scheme(self, user_id: str, scheme_id: str, notes: Optional[str] = None) -> Dict[str, Any]:
        # check duplicate
        for item in self.data.get("saved_schemes", []):
            if str(item.get("user_id")) == str(user_id) and str(item.get("scheme_id")) == str(scheme_id):
                item["notes"] = notes
                self.save_state()
                return item
        entry = {
            "id": str(uuid.uuid4()),
            "user_id": str(user_id),
            "scheme_id": str(scheme_id),
            "notes": notes,
            "created_at": datetime.now().isoformat()
        }
        self.data.setdefault("saved_schemes", []).append(entry)
        self.save_state()
        return entry

    def unsave_scheme(self, user_id: str, scheme_id: str) -> bool:
        before_len = len(self.data.get("saved_schemes", []))
        self.data["saved_schemes"] = [
            item for item in self.data.get("saved_schemes", [])
            if not (str(item.get("user_id")) == str(user_id) and str(item.get("scheme_id")) == str(scheme_id))
        ]
        if len(self.data["saved_schemes"]) < before_len:
            self.save_state()
            return True
        return False

    # ==========================================================================
    # VILLAGE PROJECTS
    # ==========================================================================
    def get_projects(self, district: Optional[str] = None, block: Optional[str] = None, category: Optional[str] = None, stage: Optional[str] = None, search: Optional[str] = None) -> List[Dict[str, Any]]:
        results = self.data.get("projects", [])
        if district and district.lower() != "all":
            results = [p for p in results if p.get("district", "").lower() == district.lower()]
        if block and block.lower() != "all":
            results = [p for p in results if p.get("block", "").lower() == block.lower()]
        if category and category.lower() != "all":
            results = [p for p in results if p.get("category", "").lower() == category.lower()]
        if stage and stage.lower() != "all":
            results = [p for p in results if p.get("current_stage", "").lower() == stage.lower()]
        if search:
            q = search.lower()
            results = [
                p for p in results if (
                    q in p.get("title_en", "").lower() or
                    q in p.get("title_ta", "").lower() or
                    q in p.get("title_hi", "").lower() or
                    q in p.get("code", "").lower() or
                    q in p.get("village", "").lower()
                )
            ]
        return results

    def get_project_by_id(self, project_id: str) -> Optional[Dict[str, Any]]:
        for p in self.data.get("projects", []):
            if str(p["id"]) == str(project_id) or p.get("code") == str(project_id):
                return p
        return None

    def add_project_update(self, project_id: str, update_dict: Dict[str, Any]) -> Dict[str, Any]:
        proj = self.get_project_by_id(project_id)
        if not proj:
            raise ValueError("Project not found")
        update_dict["id"] = str(uuid.uuid4())
        update_dict["project_id"] = proj["id"]
        update_dict["created_at"] = datetime.now().isoformat()
        proj.setdefault("updates", []).insert(0, update_dict)
        if "expenditure_reported" in update_dict and update_dict["expenditure_reported"]:
            proj["spent_budget"] = float(proj.get("spent_budget", 0)) + float(update_dict["expenditure_reported"])
        if "progress_percentage" in update_dict and update_dict["progress_percentage"] is not None:
            proj["progress_percentage"] = int(update_dict["progress_percentage"])
        if "stage" in update_dict:
            proj["current_stage"] = update_dict["stage"]
        self.save_state()
        return update_dict

    def update_project_stage(self, project_id: str, new_stage: str, progress_percentage: int) -> Dict[str, Any]:
        proj = self.get_project_by_id(project_id)
        if not proj:
            raise ValueError("Project not found")
        proj["current_stage"] = new_stage
        proj["progress_percentage"] = progress_percentage
        
        # update milestone statuses up to this stage
        stage_names = [
            "planning", "budget_approved", "tender_floated", "contractor_assigned",
            "foundation_work", "structure_laying", "mid_term_inspection",
            "quality_testing", "final_finishing", "completion_handover",
            "official_signoff", "public_audit", "maintenance_active"
        ]
        if new_stage in stage_names:
            curr_idx = stage_names.index(new_stage) + 1
            for m in proj.get("milestones", []):
                if m.get("stage_number", 0) <= curr_idx:
                    m["is_completed"] = True
                    if not m.get("completed_date"):
                        m["completed_date"] = date.today().isoformat()
        self.save_state()
        return proj

    # ==========================================================================
    # CITIZEN REPORTS & TIMELINE
    # ==========================================================================
    def get_reports(self, status: Optional[str] = None, category: Optional[str] = None, village: Optional[str] = None, citizen_id: Optional[str] = None) -> List[Dict[str, Any]]:
        results = self.data.get("reports", [])
        if citizen_id:
            results = [r for r in results if str(r.get("citizen_id")) == str(citizen_id)]
        if status and status.lower() != "all":
            results = [r for r in results if r.get("current_status", "").lower() == status.lower()]
        if category and category.lower() != "all":
            results = [r for r in results if r.get("category", "").lower() == category.lower()]
        if village and village.lower() != "all":
            results = [r for r in results if r.get("village", "").lower() == village.lower()]
        return results

    def get_report_by_id(self, report_id: str) -> Optional[Dict[str, Any]]:
        for r in self.data.get("reports", []):
            if str(r["id"]) == str(report_id) or r.get("reference_id") == str(report_id):
                return r
        return None

    def create_report(self, report_dict: Dict[str, Any]) -> Dict[str, Any]:
        report_id = str(uuid.uuid4())
        ref_id = f"GV-REP-{datetime.now().strftime('%Y%m%d')}-{uuid.uuid4().hex[:4].upper()}"
        now_str = datetime.now().isoformat()
        
        report_dict["id"] = report_id
        report_dict["reference_id"] = ref_id
        report_dict["current_status"] = "submitted"
        report_dict["is_demo"] = settings.is_demo_mode
        report_dict["created_at"] = now_str
        report_dict["updated_at"] = now_str

        # Automatically assign realistic village coordinates if missing or zero
        lat = report_dict.get("latitude")
        lng = report_dict.get("longitude")
        if not lat or not lng or float(lat) == 0.0 or float(lng) == 0.0:
            import random
            v_name = (report_dict.get("village") or "").lower()
            if "sothupakkam" in v_name:
                base_lat, base_lng = 12.4475, 79.8410
            elif "cheyyur" in v_name:
                base_lat, base_lng = 12.4280, 79.8150
            else:
                base_lat, base_lng = 12.4333, 79.8253
            
            offset_lat = random.uniform(-0.006, 0.006)
            offset_lng = random.uniform(-0.006, 0.006)
            report_dict["latitude"] = round(base_lat + offset_lat, 5)
            report_dict["longitude"] = round(base_lng + offset_lng, 5)
        else:
            report_dict["latitude"] = float(lat)
            report_dict["longitude"] = float(lng)
        report_dict["timeline"] = [
            {
                "id": str(uuid.uuid4()),
                "report_id": report_id,
                "actor_name": report_dict.get("citizen_name", "Citizen"),
                "from_status": None,
                "to_status": "submitted",
                "action_note": "Issue grievance submitted with GPS location and details.",
                "evidence_urls": report_dict.get("photo_urls", []),
                "created_at": now_str
            }
        ]
        self.data.setdefault("reports", []).insert(0, report_dict)
        self.save_state()
        return report_dict

    def update_report_status(self, report_id: str, actor_name: str, to_status: str, action_note: str, assigned_official_id: Optional[str] = None, evidence_urls: Optional[List[str]] = None) -> Dict[str, Any]:
        rep = self.get_report_by_id(report_id)
        if not rep:
            raise ValueError("Report not found")
        from_status = rep.get("current_status")
        rep["current_status"] = to_status
        rep["updated_at"] = datetime.now().isoformat()
        if assigned_official_id:
            rep["assigned_official_id"] = assigned_official_id
            off = self.get_user_by_id(assigned_official_id)
            if off:
                rep["assigned_official_name"] = off.get("full_name")
        if to_status == "verified_closed":
            rep["closed_at"] = datetime.now().isoformat()
            rep["resolution_notes"] = action_note
            if evidence_urls:
                rep["resolution_photo_urls"] = evidence_urls
        
        timeline_entry = {
            "id": str(uuid.uuid4()),
            "report_id": rep["id"],
            "actor_name": actor_name,
            "from_status": from_status,
            "to_status": to_status,
            "action_note": action_note,
            "evidence_urls": evidence_urls or [],
            "created_at": datetime.now().isoformat()
        }
        rep.setdefault("timeline", []).append(timeline_entry)
        self.save_state()
        return rep

    # ==========================================================================
    # ANNOUNCEMENTS
    # ==========================================================================
    def get_announcements(self, priority: Optional[str] = None, active_only: bool = True, village: Optional[str] = None, phone: Optional[str] = None) -> List[Dict[str, Any]]:
        results = self.data.get("announcements", [])
        if active_only:
            now_iso = datetime.now().isoformat()
            results = [a for a in results if not a.get("expires_at") or str(a.get("expires_at")) >= now_iso]
        if priority and priority.lower() != "all":
            results = [a for a in results if a.get("priority", "").lower() == priority.lower()]
        if village and village.lower() != "all":
            v_lower = village.lower()
            results = [a for a in results if not a.get("target_area") or a.get("target_area", "").lower() in (v_lower, "all", "chengalpattu", "tamil nadu")]
        if phone:
            clean_p = phone.replace(" ", "").replace("-", "")
            # Return broadcasts meant for all (target_phone is None) or matching this phone
            results = [a for a in results if not a.get("target_phone") or a.get("target_phone", "").replace(" ", "").replace("-", "") == clean_p]
        return results

    def create_announcement(self, ann_dict: Dict[str, Any]) -> Dict[str, Any]:
        ann_dict["id"] = str(uuid.uuid4())
        ann_dict["created_at"] = datetime.now().isoformat()
        ann_dict["is_verified"] = True
        ann_dict["is_demo"] = settings.is_demo_mode
        if not ann_dict.get("expires_at"):
            ann_dict["expires_at"] = (datetime.now() + timedelta(days=7)).isoformat()
        self.data.setdefault("announcements", []).insert(0, ann_dict)
        self.save_state()
        return ann_dict

    # ==========================================================================
    # VOICE & TELEPHONY
    # ==========================================================================
    def get_voice_subscriptions(self, active_only: bool = True) -> List[Dict[str, Any]]:
        subs = self.data.get("voice_subscriptions", [])
        if active_only:
            subs = [s for s in subs if s.get("is_active", True)]
        return subs

    def subscribe_voice(self, phone: str, name: Optional[str], lang: str, village: str, district: str, user_id: Optional[str] = None) -> Dict[str, Any]:
        for s in self.data.get("voice_subscriptions", []):
            if s.get("phone_number") == phone:
                s["is_active"] = True
                s["preferred_language"] = lang
                s["village"] = village
                s["district"] = district
                s["consent_given"] = True
                s["subscriber_name"] = name or s.get("subscriber_name")
                self.save_state()
                return s
        new_sub = {
            "id": str(uuid.uuid4()),
            "user_id": user_id,
            "phone_number": phone,
            "subscriber_name": name,
            "preferred_language": lang,
            "village": village,
            "district": district,
            "consent_given": True,
            "consent_recorded_at": datetime.now().isoformat(),
            "is_active": True
        }
        self.data.setdefault("voice_subscriptions", []).append(new_sub)
        self.save_state()
        return new_sub

    def unsubscribe_voice(self, phone: str) -> bool:
        for s in self.data.get("voice_subscriptions", []):
            if s.get("phone_number") == phone:
                s["is_active"] = False
                s["consent_given"] = False
                s["opt_out_at"] = datetime.now().isoformat()
                self.save_state()
                return True
        return False

    def get_voice_campaigns(self) -> List[Dict[str, Any]]:
        return self.data.get("voice_campaigns", [])

    def create_voice_campaign(self, camp_dict: Dict[str, Any]) -> Dict[str, Any]:
        camp_dict["id"] = str(uuid.uuid4())
        camp_dict["created_at"] = datetime.now().isoformat()
        camp_dict["status"] = "pending_approval"
        camp_dict["approved_by_admin"] = False
        self.data.setdefault("voice_campaigns", []).insert(0, camp_dict)
        self.save_state()
        return camp_dict

    def approve_voice_campaign(self, campaign_id: str) -> Optional[Dict[str, Any]]:
        for c in self.data.get("voice_campaigns", []):
            if str(c["id"]) == str(campaign_id):
                c["approved_by_admin"] = True
                c["status"] = "approved"
                self.save_state()
                return c
        return None

    def get_call_logs(self) -> List[Dict[str, Any]]:
        return self.data.get("call_logs", [])

    def log_call(self, log_dict: Dict[str, Any]) -> Dict[str, Any]:
        log_dict["id"] = str(uuid.uuid4())
        log_dict["attempt_timestamp"] = datetime.now().isoformat()
        self.data.setdefault("call_logs", []).insert(0, log_dict)
        self.save_state()
        return log_dict

    # ==========================================================================
    # OFFICIAL VERIFICATION & ADMIN AUDIT
    # ==========================================================================
    def get_pending_officials(self) -> List[Dict[str, Any]]:
        pending = []
        for u in self.data.get("users", []):
            if u.get("role") == "official":
                prof = self.get_official_profile(u["id"])
                if prof and prof.get("verification_status") == "pending":
                    pending.append({
                        "user": u,
                        "profile": prof
                    })
        return pending

    def verify_official(self, user_id: str, action: str, reason: Optional[str] = None) -> bool:
        prof = self.get_official_profile(user_id)
        if not prof:
            return False
        if action == "approve":
            prof["verification_status"] = "approved"
            prof["verified_at"] = datetime.now().isoformat()
            prof["rejection_reason"] = None
        else:
            prof["verification_status"] = "rejected"
            prof["rejection_reason"] = reason
        self.save_state()
        return True

    def get_audit_logs(self) -> List[Dict[str, Any]]:
        return self.data.get("audit_logs", [])

    def log_audit(self, action: str, entity_type: str, entity_id: str, user_id: Optional[str] = None, user_name: Optional[str] = None, details: Optional[Dict[str, Any]] = None, ip: Optional[str] = None):
        entry = {
            "id": str(uuid.uuid4()),
            "user_id": user_id,
            "user_name": user_name or "System",
            "action": action,
            "entity_type": entity_type,
            "entity_id": entity_id,
            "details": details or {},
            "ip_address": ip or "127.0.0.1",
            "created_at": datetime.now().isoformat()
        }
        self.data.setdefault("audit_logs", []).insert(0, entry)
        self.save_state()

    def get_admin_stats(self) -> Dict[str, Any]:
        users = self.data.get("users", [])
        citizens = [u for u in users if u.get("role") == "citizen"]
        officials = [u for u in users if u.get("role") == "official"]
        pending = self.get_pending_officials()
        schemes = [s for s in self.data.get("schemes", []) if s.get("is_active", True)]
        projects = self.data.get("projects", [])
        reports = self.data.get("reports", [])
        resolved = [r for r in reports if r.get("current_status") == "verified_closed"]
        voice_subs = [v for v in self.data.get("voice_subscriptions", []) if v.get("is_active", True)]

        return {
            "total_citizens": len(citizens),
            "total_officials": len(officials),
            "pending_official_verifications": len(pending),
            "total_active_schemes": len(schemes),
            "total_projects": len(projects),
            "total_reports": len(reports),
            "resolved_reports": len(resolved),
            "voice_subscribers": len(voice_subs),
            "is_demo_mode": settings.is_demo_mode
        }

# Global singleton database adapter
db = DatabaseAdapter()

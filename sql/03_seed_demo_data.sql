-- ==============================================================================
-- GRAMVIKAS AI - REALISTIC TAMIL NADU RURAL DEVELOPMENT SEED DATA
-- Migration 03: Seed Users, Schemes, Village Projects, Reports & Announcements.
-- ==============================================================================

-- 1. SEED USERS & PROFILES
-- Passwords:
-- Citizen@123  -> bcrypt hash
-- Official@123 -> bcrypt hash
-- Pending@123  -> bcrypt hash
-- Admin@123    -> bcrypt hash

INSERT INTO users (id, email, hashed_password, full_name, phone, role, is_active) VALUES
('11111111-1111-1111-1111-111111111111', 'citizen@gramvikas.in', '$2b$12$e0X9kR3zL6wHqI0S1s78ue12H3Qf0kZ3K7V9D4eR8qM9L6aB3C2D1', 'Muthuvel K', '9840123456', 'citizen', TRUE),
('22222222-2222-2222-2222-222222222222', 'official@gramvikas.in', '$2b$12$e0X9kR3zL6wHqI0S1s78ue12H3Qf0kZ3K7V9D4eR8qM9L6aB3C2D1', 'Dr. Selvi Ramanathan', '9840987654', 'official', TRUE),
('33333333-3333-3333-3333-333333333333', 'pending@gramvikas.in', '$2b$12$e0X9kR3zL6wHqI0S1s78ue12H3Qf0kZ3K7V9D4eR8qM9L6aB3C2D1', 'R. Anbarasan', '9840555666', 'official', TRUE),
('44444444-4444-4444-4444-444444444444', 'admin@gramvikas.in', '$2b$12$e0X9kR3zL6wHqI0S1s78ue12H3Qf0kZ3K7V9D4eR8qM9L6aB3C2D1', 'State Governance Admin', '9840000001', 'admin', TRUE)
ON CONFLICT (email) DO NOTHING;

INSERT INTO citizen_profiles (user_id, village, gram_panchayat, block, district, state, age, gender, annual_income, occupation, landholding_acres, social_category, ration_card_type, has_disability, preferred_language) VALUES
('11111111-1111-1111-1111-111111111111', 'Melmaruvathur', 'Melmaruvathur Panchayat', 'Cheyyur', 'Chengalpattu', 'Tamil Nadu', 42, 'male', 75000.00, 'farmer', 1.80, 'OBC', 'PHH', FALSE, 'ta')
ON CONFLICT (user_id) DO NOTHING;

INSERT INTO official_profiles (user_id, designation, department, assigned_level, assigned_area, district, employee_id_number, verification_status, verified_by, verified_at) VALUES
('22222222-2222-2222-2222-222222222222', 'Block Development Officer (BDO)', 'Rural Development & Panchayat Raj', 'Block', 'Cheyyur Block', 'Chengalpattu', 'TN-GOV-RD-2018-842', 'approved', '44444444-4444-4444-4444-444444444444', NOW()),
('33333333-3333-3333-3333-333333333333', 'Panchayat Secretary', 'Rural Development & Panchayat Raj', 'Panchayat', 'Madurantakam South', 'Chengalpattu', 'TN-GOV-RD-2024-911', 'pending', NULL, NULL)
ON CONFLICT (user_id) DO NOTHING;

-- 2. SEED SCHEMES
INSERT INTO schemes (id, slug, title_en, title_ta, title_hi, department, level, category, short_summary_en, short_summary_ta, short_summary_hi, detailed_description_en, financial_benefit_amount, benefit_frequency, official_portal_url, helpline_number, is_active, is_demo) VALUES
(
    'a1111111-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    'pm-kisan-samman-nidhi',
    'PM-KISAN Samman Nidhi',
    'பிரதம மந்திரி கிசான் சம்மான் நிதி',
    'पीएम किसान सम्मान निधि',
    'Ministry of Agriculture & Farmers Welfare',
    'central',
    'Agriculture',
    'Direct income support of ₹6,000 per year for landholding farmer families across India in 3 equal installments.',
    'விவசாய குடும்பங்களுக்கு ஆண்டுக்கு ₹6,000 மூன்று தவணைகளில் நேரடி வங்கி பரிமாற்றம்.',
    'भूमिधारक किसान परिवारों को प्रति वर्ष ₹6,000 की प्रत्यक्ष आय सहायता 3 समान किस्तों में।',
    'Under the PM-KISAN scheme, all landholding farmer families with cultivable landholding in their names are eligible for financial assistance of Rs. 6000/- per year, payable in three equal four-monthly installments of Rs. 2000/- directly into their Aadhaar-linked bank accounts.',
    6000.00,
    'annual',
    'https://pmkisan.gov.in',
    '155261',
    TRUE,
    TRUE
),
(
    'a2222222-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    'kalaignar-kanavu-illam',
    'Kalaignar Kanavu Illam Scheme',
    'கலைஞர் கனவு இல்லம் திட்டம்',
    'कलैग्नार कनावु इल्लम आवास योजना',
    'Rural Development and Panchayat Raj, Tamil Nadu',
    'state',
    'Housing',
    'Pukka concrete house subsidy of ₹3.5 Lakhs to transform thatched and hut houses into climate-resilient homes.',
    'குடிசைகளை கான்கிரீட் வீடுகளாக மாற்ற ₹3.5 லட்சம் நிதி உதவி வழங்கும் திட்டம்.',
    'तमिलनाडु में कच्चे घरों को पक्के घरों में बदलने के लिए ₹3.5 लाख की वित्तीय सहायता।',
    'Kalaignar Kanavu Illam is Tamil Nadus flagship rural housing scheme aiming to make the state hut-free. Eligible rural beneficiaries living in kutcha dwellings receive Rs. 3,50,000 along with MGNREGA construction person-days and toilet assistance under SBM-G.',
    350000.00,
    'one_time',
    'https://tnrd.tn.gov.in',
    '1800-425-4567',
    TRUE,
    TRUE
),
(
    'a3333333-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    'mgnrega-100-day-employment',
    'Mahatma Gandhi NREGA (100-Day Work)',
    'மகாத்மா காந்தி தேசிய ஊரக வேலை உறுதித் திட்டம்',
    'महात्मा गांधी राष्ट्रीय ग्रामीण रोजगार गारंटी अधिनियम',
    'Ministry of Rural Development',
    'central',
    'Employment',
    'Guaranteed 100 days of wage employment in a financial year to every rural adult household willing to do manual work.',
    'கிராமப்புற குடும்பங்களுக்கு 100 நாட்கள் சட்டப்பூர்வ ஊதிய வேலைவாய்ப்பு.',
    'ग्रामीण परिवारों को एक वित्तीय वर्ष में 100 दिनों के अकुशल शारीरिक कार्य की कानूनी गारंटी।',
    'The scheme guarantees at least 100 days of unskilled manual employment to adult members of any rural household willing to work. Wage rates in Tamil Nadu are updated annually with direct electronic transfers via DBT within 15 days of muster roll closure.',
    319.00,
    'daily',
    'https://nrega.nic.in',
    '1800-111-555',
    TRUE,
    TRUE
),
(
    'a4444444-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    'tn-pudhumai-penn-scheme',
    'Pudhumai Penn Scheme (Higher Education)',
    'புதுமைப் பெண் திட்டம் (மூவலூர் ராமாமிர்தம் அம்மையார் திட்டம்)',
    'पुधुमै पेन योजना (उच्च शिक्षा वित्तीय सहायता)',
    'Social Welfare and Women Empowerment, Tamil Nadu',
    'state',
    'Education',
    'Monthly assistance of ₹1,000 for girl students pursuing undergraduate degrees who studied in government schools (Class 6-12).',
    'அரசுப் பள்ளிகளில் 6 முதல் 12 வரை படித்த மாணவிகளுக்கு பட்டப்படிப்பு முடியும் வரை மாதம் ₹1,000.',
    'सरकारी स्कूलों (कक्षा 6-12) से पढ़ी छात्राओं को स्नातक की पढ़ाई पूरी करने तक प्रतिमाह ₹1,000।',
    'Moovalur Ramamirtham Ammaiyar Higher Education Assurance Scheme provides Rs. 1,000 per month directly to girl students enrolled in recognized higher education institutions who studied in Tamil Nadu Government schools from classes 6 to 12.',
    12000.00,
    'annual',
    'https://pudhumaipenn.tn.gov.in',
    '044-25670845',
    TRUE,
    TRUE
),
(
    'a5555555-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    'jal-jeevan-mission-fhtc',
    'Jal Jeevan Mission - Har Ghar Jal',
    'ஜல் ஜீவன் மிஷன் - கிராமப்புற குடிநீர் திட்டம்',
    'जल जीवन मिशन - हर घर जल',
    'Department of Drinking Water and Sanitation',
    'central',
    'Drinking Water',
    'Functional Household Tap Connection (FHTC) providing 55 liters per capita per day potable water to every rural home.',
    'ஒவ்வொரு கிராம வீட்டிற்கும் தலா 55 லிட்டர் பாதுகாக்கப்பட்ட குடிநீர் குழாய் இணைப்பு.',
    'प्रत्येक ग्रामीण घर में 55 लीटर प्रति व्यक्ति प्रतिदिन की दर से नल से स्वच्छ पेयजल आपूर्ति।',
    'Jal Jeevan Mission aims to ensure potable water supply in adequate quantity (55 lpcd) and prescribed quality on a long-term basis to every rural household through individual Functional Household Tap Connections.',
    0.00,
    'one_time',
    'https://jaljeevanmission.gov.in',
    '1800-180-1551',
    TRUE,
    TRUE
),
(
    'a6666666-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    'cmchis-health-insurance-tn',
    'Chief Ministers Comprehensive Health Insurance (CMCHIS)',
    'முதலமைச்சரின் விரிவான மருத்துவக் காப்பீட்டுத் திட்டம்',
    'मुख्यमंत्री व्यापक स्वास्थ्य बीमा योजना',
    'Health and Family Welfare Department, Tamil Nadu',
    'state',
    'Health',
    'Cashless hospital coverage up to ₹5 Lakhs per family per year across 1,000+ empanelled government and private hospitals.',
    'ஆண்டுக்கு ₹5 லட்சம் வரை கட்டணமில்லா மருத்துவ சிகிச்சை வழங்கும் காப்பீடு.',
    'प्रति परिवार प्रति वर्ष ₹5 लाख तक का कैशलेस अस्पताल उपचार कवर।',
    'CMCHIS provides cashless hospitalization for specific complications and diagnostic procedures up to Rs. 5,00,000 per family per annum. Covers rural households with annual family income below Rs. 1,20,000 and special occupational groups.',
    500000.00,
    'annual',
    'https://cmchistn.com',
    '1800-425-3993',
    TRUE,
    TRUE
)
ON CONFLICT (slug) DO NOTHING;

-- 3. SEED SCHEME CRITERIA
INSERT INTO scheme_criteria (scheme_id, min_age, max_age, allowed_genders, max_annual_income, max_landholding_acres, allowed_occupations, allowed_social_categories, allowed_ration_cards, requires_disability, required_documents, application_steps_en, application_steps_ta, application_steps_hi) VALUES
(
    'a1111111-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    18, 100, ARRAY['all'], NULL, 5.0, ARRAY['farmer'], ARRAY['all'], ARRAY['all'], FALSE,
    ARRAY['Aadhaar Card', 'Land Ownership Record (Patta/Chitta)', 'Active Bank Passbook', 'Mobile Number linked to Aadhaar'],
    ARRAY['Visit Village Administrative Officer (VAO) or e-Seva Centre', 'Submit Patta copy and Aadhaar eKYC', 'Check beneficiary status online via PM-KISAN portal'],
    ARRAY['கிராம நிர்வாக அலுவலர் (VAO) அல்லது இ-சேவை மையத்தை அணுகவும்', 'பட்டா நகல் மற்றும் ஆதார் eKYC சமர்ப்பிக்கவும்', 'இணையதளத்தில் நிலையை சரிபார்க்கவும்'],
    ARRAY['ग्राम प्रशासनिक अधिकारी (VAO) या ई-सेवा केंद्र पर जाएं', 'पट्टा प्रति और आधार ईकेवाईसी जमा करें', 'पीएम-किसान पोर्टल पर स्थिति जांचें']
),
(
    'a2222222-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    21, 90, ARRAY['all'], 150000.00, 2.5, ARRAY['farmer', 'daily_wage', 'artisan', 'other'], ARRAY['all'], ARRAY['AAY', 'PHH'], FALSE,
    ARRAY['Ration Card (PHH/AAY)', 'Aadhaar Card', 'Gram Panchayat Patta or Land Title Deed', 'Income Certificate', 'Bank Account Details'],
    ARRAY['Apply during Special Gram Sabha meeting or BDO office', 'Verification by Block Overseer and Panchayat Secretary', 'Geo-tagging of existing hut and sanction order issue', 'Stage-wise fund transfer upon construction milestones'],
    ARRAY['சிறப்பு கிராம சபை கூட்டம் அல்லது வட்டார வளர்ச்சி அலுவலகத்தில் விண்ணப்பிக்கவும்', 'ஊராட்சி செயலாளர் கள ஆய்வு செய்து சான்றளிப்பார்', 'குடிசை புவிசார் குறியீடு (Geo-tag) செய்யப்பட்டு நிதி விடுவிக்கப்படும்'],
    ARRAY['विशेष ग्राम सभा या बीडीओ कार्यालय में आवेदन करें', 'पंचायत सचिव द्वारा स्थलीय सत्यापन', 'चरणबद्ध निर्माण प्रगति पर बैंक खाते में राशि ट्रांसफर']
),
(
    'a3333333-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    18, 80, ARRAY['all'], NULL, NULL, ARRAY['all'], ARRAY['all'], ARRAY['all'], FALSE,
    ARRAY['Aadhaar Card', 'Ration Card', 'Bank Passbook / Post Office Account', 'Passport size photographs (2)'],
    ARRAY['Submit Form 1 to Gram Panchayat office', 'Receive MGNREGA Job Card within 15 days', 'Submit written application for work to Panchayat President or Secretary', 'Work allotted within 15 days or unemployment allowance applicable'],
    ARRAY['படிவம் 1-ஐ கிராம ஊராட்சி அலுவலகத்தில் சமர்ப்பிக்கவும்', '15 நாட்களுக்குள் வேலை அட்டை (Job Card) பெறவும்', 'வேலை கேட்டு விண்ணப்பம் அளித்து ஊதிய பலன் பெறவும்'],
    ARRAY['ग्राम पंचायत कार्यालय में प्रपत्र 1 जमा करें', '15 दिनों के भीतर जॉब कार्ड प्राप्त करें', 'काम की मांग करें और 15 दिनों के भीतर काम पाएं']
),
(
    'a4444444-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    17, 26, ARRAY['female'], NULL, NULL, ARRAY['student'], ARRAY['all'], ARRAY['all'], FALSE,
    ARRAY['Government School Transfer Certificate / Bonafide (Class 6-12)', 'College Admission Bonafide / ID Card', 'Aadhaar Card', 'Personal Bank Account (Aadhaar Seeded)'],
    ARRAY['Register through the college nodal officer on Pudhumai Penn Portal', 'Upload school bonafide certificates verifying Govt school education', 'Direct monthly credit of Rs 1,000 to student account via PFMS'],
    ARRAY['கல்லூரி ஒருங்கிணைப்பாளர் மூலம் புதுமைப் பெண் தளத்தில் பதியவும்', '6 முதல் 12 வரை அரசுப் பள்ளி சான்றிதழ் சமர்ப்பிக்கவும்', 'மாதந்தோறும் வங்கி கணக்கில் ₹1,000 வரவு வைக்கப்படும்'],
    ARRAY['कॉलेज नोडल अधिकारी के माध्यम से पुधुमै पेन पोर्टल पर पंजीकरण करें', 'सरकारी स्कूल बोनाफाइड अपलोड करें', 'मासिक ₹1,000 छात्र के खाते में प्राप्त करें']
),
(
    'a6666666-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    0, 110, ARRAY['all'], 120000.00, NULL, ARRAY['all'], ARRAY['all'], ARRAY['AAY', 'PHH'], FALSE,
    ARRAY['Smart Ration Card', 'Aadhaar Card of all family members', 'Income Certificate issued by Revenue Authority'],
    ARRAY['Visit District Collectorate or designated e-Seva kiosk', 'Biometric enrollment for CMCHIS smart card', 'Present card at any empanelled hospital counter for cashless admission'],
    ARRAY['மாவட்ட ஆட்சியர் அலுவலகம் அல்லது இ-சேவை மையத்தை அணுகவும்', 'முதலமைச்சர் காப்பீட்டு அட்டை பெற விரல்ரேகை பதிவு செய்யவும்', 'அங்கீகரிக்கப்பட்ட மருத்துவமனைகளில் கட்டணமில்லா சிகிச்சை பெறவும்'],
    ARRAY['जिला कलेक्ट्रेट या ई-सेवा केंद्र पर बायोमेट्रिक पंजीकरण करें', 'स्मार्ट कार्ड प्राप्त करें और पैनलबद्ध अस्पतालों में कैशलेस इलाज पाएं']
);

-- 4. SEED VILLAGE PROJECTS (13-STAGE TRACKING)
INSERT INTO projects (id, code, title_en, title_ta, title_hi, village, gram_panchayat, block, district, latitude, longitude, category, sanctioned_budget, spent_budget, contractor_name, contractor_contact, current_stage, progress_percentage, start_date, expected_completion_date, nodal_officer_id, description_en, is_demo) VALUES
(
    'b1111111-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
    'TN-CGL-2026-WTR-01',
    'Overhead Water Tank & Distribution Pipeline',
    'மேல்நிலை நீர்த்தேக்கத் தொட்டி மற்றும் குழாய் பதிக்கும் திட்டம்',
    'ओवरहेड पानी की टंकी और वितरण पाइपलाइन परियोजना',
    'Melmaruvathur',
    'Melmaruvathur Panchayat',
    'Cheyyur',
    'Chengalpattu',
    12.4346,
    79.8297,
    'Drinking Water',
    4200000.00,
    3150000.00,
    'Kavitha Civil Infrastructure Ltd',
    '+91-9443211223',
    'quality_testing',
    75,
    '2026-02-10',
    '2026-11-30',
    '22222222-2222-2222-2222-222222222222',
    'Construction of 60,000-liter capacity RCC elevated service reservoir with 4.8 km ductile iron underground distribution pipelines connecting 420 rural households in Melmaruvathur.',
    TRUE
),
(
    'b2222222-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
    'TN-CGL-2026-RD-04',
    'Concrete Road Laying - South Colony Link',
    'தெற்கு காலனி சிமெண்ட் சாலை அமைத்தல்',
    'साउथ कॉलोनी लिंक कंक्रीट सड़क निर्माण',
    'Sothupakkam',
    'Sothupakkam Panchayat',
    'Cheyyur',
    'Chengalpattu',
    12.4491,
    79.8456,
    'Roads',
    1850000.00,
    1850000.00,
    'Sri Balaji Roadworks',
    '+91-9842134567',
    'public_audit',
    95,
    '2026-03-01',
    '2026-09-15',
    '22222222-2222-2222-2222-222222222222',
    'Laying 1.2 km of all-weather CC road with side drainage channels connecting agricultural fields and bus stop.',
    TRUE
),
(
    'b3333333-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
    'TN-CGL-2026-SOL-09',
    'Village Solar High-Mast & Streetlight Modernization',
    'கிராம சூரிய மின்விளக்கு மற்றும் உயர்கோபுர விளக்கு திட்டம்',
    'सौर स्ट्रीट लाइट और हाई-मास्ट पोल परियोजना',
    'Acharapakkam',
    'Acharapakkam Town Panchayat',
    'Madurantakam',
    'Chengalpattu',
    12.4089,
    79.8142,
    'Electricity',
    950000.00,
    450000.00,
    'SunShine Green Tech',
    '+91-9789012345',
    'structure_laying',
    45,
    '2026-06-15',
    '2026-12-20',
    '22222222-2222-2222-2222-222222222222',
    'Installation of 45 solar LED automatic dusk-to-dawn streetlights and 2 central high-mast lights at village junctions.',
    TRUE
),
(
    'b4444444-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
    'TN-CGL-2026-ANG-12',
    'Model Anganwadi Child Nutrition Center Upgradation',
    'மாதிரி அங்கன்வாடி குழந்தைகள் ஊட்டச்சத்து மைய புனரமைப்பு',
    'मॉडल आंगनवाड़ी केंद्र का आधुनिकीकरण',
    'Melmaruvathur',
    'Melmaruvathur Panchayat',
    'Cheyyur',
    'Chengalpattu',
    12.4380,
    79.8315,
    'Education',
    820000.00,
    120000.00,
    'Panchayat Community Engineering Wing',
    '+91-9442001122',
    'tender_floated',
    15,
    '2026-08-01',
    '2027-01-31',
    '22222222-2222-2222-2222-222222222222',
    'Smart classroom remodeling, child-friendly sanitary facilities, clean drinking RO water plant, and nutritional kitchen garden.',
    TRUE
);

-- 5. SEED PROJECT MILESTONES (FOR WATER PROJECT)
INSERT INTO project_milestones (project_id, stage, stage_number, title, is_completed, target_date, completed_date) VALUES
('b1111111-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'planning', 1, 'Site Identification & Hydrogeological Survey', TRUE, '2026-02-15', '2026-02-14'),
('b1111111-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'budget_approved', 2, 'Administrative & Technical Sanction (₹42 Lakhs)', TRUE, '2026-03-01', '2026-02-28'),
('b1111111-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'tender_floated', 3, 'E-Tender Publication on TN Tenders Portal', TRUE, '2026-03-20', '2026-03-18'),
('b1111111-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'contractor_assigned', 4, 'Contractor Work Order Issued to Kavitha Civil', TRUE, '2026-04-05', '2026-04-03'),
('b1111111-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'foundation_work', 5, 'Borewell Drilling (380 ft) & Staging RCC Foundation', TRUE, '2026-05-15', '2026-05-12'),
('b1111111-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'structure_laying', 6, 'Overhead Tank Staging Columns & 4.8 km Pipeline Laying', TRUE, '2026-07-30', '2026-07-28'),
('b1111111-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'mid_term_inspection', 7, 'BDO & Assistant Executive Engineer Mid-Term Check', TRUE, '2026-08-20', '2026-08-18'),
('b1111111-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'quality_testing', 8, 'Hydrostatic Pressure & Potable Water Laboratory Testing', FALSE, '2026-10-25', NULL),
('b1111111-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'final_finishing', 9, 'External Painting, Disinfection & Water Meter Fixation', FALSE, '2026-11-10', NULL),
('b1111111-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'completion_handover', 10, 'Trial Water Pumping & Panchayat Handover', FALSE, '2026-11-20', NULL),
('b1111111-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'official_signoff', 11, 'District Collector & Executive Engineer Sign-Off', FALSE, '2026-11-25', NULL),
('b1111111-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'public_audit', 12, 'Gram Sabha Social Audit & Public Disclosure', FALSE, '2026-11-28', NULL),
('b1111111-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'maintenance_active', 13, 'Village Water & Sanitation Committee Maintenance', FALSE, '2026-12-01', NULL);

-- 6. SEED CITIZEN REPORTS
INSERT INTO citizen_reports (id, reference_id, citizen_id, category, title, description, village, block, district, landmark, latitude, longitude, current_status, assigned_official_id, priority, is_demo) VALUES
(
    'c1111111-cccc-cccc-cccc-cccccccccccc',
    'GV-REP-20261015-1042',
    '11111111-1111-1111-1111-111111111111',
    'drinking_water',
    'Handpump non-functional for past 2 weeks',
    'The public handpump near the Mariamman temple has dried cylinder and broken lever handle. Over 60 families are walking 1.5 km for daily water.',
    'Melmaruvathur',
    'Cheyyur',
    'Chengalpattu',
    'Opposite Mariamman Temple, West Street',
    12.4352,
    79.8285,
    'in_progress',
    '22222222-2222-2222-2222-222222222222',
    'high',
    TRUE
),
(
    'c2222222-cccc-cccc-cccc-cccccccccccc',
    'GV-REP-20261016-8921',
    '11111111-1111-1111-1111-111111111111',
    'roads_and_bridges',
    'Severe culvert damage causing water stagnation',
    'Monsoon runoff caused partial breach of the agricultural access culvert near the school canal. Tractors and two-wheelers unable to pass safely.',
    'Sothupakkam',
    'Cheyyur',
    'Chengalpattu',
    'Near Government Higher Secondary School Canal',
    12.4475,
    79.8430,
    'triaged',
    '22222222-2222-2222-2222-222222222222',
    'high',
    TRUE
),
(
    'c3333333-cccc-cccc-cccc-cccccccccccc',
    'GV-REP-20261017-3104',
    '11111111-1111-1111-1111-111111111111',
    'streetlights_electricity',
    '3 LED Streetlights fused on Bus Stop Road',
    'Dark stretch of 300 meters near the bus shelter. Difficult for women and seniors walking back from fields in evening.',
    'Melmaruvathur',
    'Cheyyur',
    'Chengalpattu',
    'Main Road Bus Stop Junction',
    12.4360,
    79.8320,
    'submitted',
    NULL,
    'normal',
    TRUE
);

-- 7. SEED REPORT TIMELINE
INSERT INTO report_timeline (report_id, actor_id, from_status, to_status, action_note) VALUES
('c1111111-cccc-cccc-cccc-cccccccccccc', '11111111-1111-1111-1111-111111111111', NULL, 'submitted', 'Issue logged by citizen with GPS location tag and photo.'),
('c1111111-cccc-cccc-cccc-cccccccccccc', '22222222-2222-2222-2222-222222222222', 'submitted', 'triaged', 'Assigned to Cheyyur Rural Water Supply engineering field team.'),
('c1111111-cccc-cccc-cccc-cccccccccccc', '22222222-2222-2222-2222-222222222222', 'triaged', 'inspection_scheduled', 'Field technician site visit scheduled for spare parts replacement.'),
('c1111111-cccc-cccc-cccc-cccccccccccc', '22222222-2222-2222-2222-222222222222', 'inspection_scheduled', 'in_progress', 'New pump cylinder and washer kit procured. Work underway.');

-- 8. SEED ANNOUNCEMENTS
INSERT INTO announcements (id, publisher_id, title_en, title_ta, title_hi, body_en, body_ta, body_hi, priority, target_level, target_area, event_date, expires_at, is_verified, is_demo) VALUES
(
    'd1111111-dddd-dddd-dddd-dddddddddddd',
    '22222222-2222-2222-2222-222222222222',
    'Special Gram Sabha Meeting Notice - October 2026',
    'சிறப்பு கிராம சபை கூட்டம் அறிவிப்பு - அக்டோபர் 2026',
    'विशेष ग्राम सभा बैठक सूचना - अक्टूबर 2026',
    'All citizens of Melmaruvathur Panchayat are invited to attend the Gram Sabha meeting on Tuesday at 10:00 AM at the Panchayat Community Hall to audit village water projects and approve the new beneficiary list for Kalaignar Kanavu Illam.',
    'மேல்மருவத்தூர் ஊராட்சியின் சிறப்பு கிராம சபை கூட்டம் வரும் செவ்வாய்க்கிழமை காலை 10:00 மணிக்கு ஊராட்சி மன்ற அலுவலகத்தில் நடைபெறும். குடிநீர் திட்ட சமூக தணிக்கை மற்றும் கலைஞர் கனவு இல்ல பயனாளி பட்டியல் ஒப்புதல் செய்யப்படும்.',
    'मेलमरुवथुर पंचायत के सभी नागरिकों को मंगलवार सुबह 10:00 बजे पंचायत भवन में ग्राम सभा बैठक में भाग लेने के लिए आमंत्रित किया जाता है।',
    'high',
    'panchayat',
    'Melmaruvathur',
    '2026-10-20 10:00:00+05:30',
    '2026-10-25 23:59:59+05:30',
    TRUE,
    TRUE
),
(
    'd2222222-dddd-dddd-dddd-dddddddddddd',
    '22222222-2222-2222-2222-222222222222',
    'Monsoon Rain Preparedness Alert & Emergency Contacts',
    'வடகிழக்கு பருவமழை முன்னெச்சரிக்கை மற்றும் அவசர உதவி எண்கள்',
    'पूर्वोत्तर मानसून वर्षा पूर्व चेतावनी और आपातकालीन संपर्क',
    'IMD forecasts moderate to heavy rainfall over Chengalpattu coastal belt. Block Emergency Control Room opened 24/7 at Cheyyur Taluk Office. Dial 1077 or 044-27420000 for immediate disaster assistance.',
    'செங்கல்பட்டு மாவட்டத்தில் கனமழை எச்சரிக்கை விடுக்கப்பட்டுள்ளது. செய்யூர் வட்டார அவசர கட்டுப்பாட்டு அறை 24 மணி நேரமும் செயல்படுகிறது. அவசர உதவிக்கு 1077 அல்லது 044-27420000 எண்ணை அழைக்கவும்.',
    'चेंगलपट्टू क्षेत्र में भारी बारिश की चेतावनी। चेय्यूर तालुका कार्यालय में 24/7 आपातकालीन नियंत्रण कक्ष खुला है। डायल करें 1077।',
    'emergency',
    'district',
    'Chengalpattu',
    NOW(),
    NOW() + INTERVAL '7 days',
    TRUE,
    TRUE
);

-- 9. SEED VOICE SUBSCRIPTIONS
INSERT INTO voice_subscriptions (phone_number, subscriber_name, preferred_language, village, district, consent_given, consent_ip_source, is_active) VALUES
('+919840123456', 'Muthuvel K', 'ta', 'Melmaruvathur', 'Chengalpattu', TRUE, '192.168.1.5', TRUE),
('+919840998877', 'K. Murugesan', 'ta', 'Sothupakkam', 'Chengalpattu', TRUE, '192.168.1.12', TRUE),
('+919840554433', 'P. Lakshmi', 'ta', 'Acharapakkam', 'Chengalpattu', TRUE, '192.168.1.18', TRUE)
ON CONFLICT (phone_number) DO NOTHING;

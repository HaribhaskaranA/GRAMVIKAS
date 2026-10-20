/**
 * GRAMVIKAS AI - Multilingual Internationalization (i18n) Engine.
 * Comprehensive dictionary for English (en), Tamil (ta), and Hindi (hi).
 */

export const TRANSLATIONS = {
  en: {
    app_title: "GRAMVIKAS AI",
    tagline: "Every Citizen Informed. Every Village Progress Tracked.",
    nav_home: "Citizen Dashboard",
    nav_schemes: "Government Schemes",
    nav_saved_schemes: "Saved Schemes",
    nav_projects: "Village Projects",
    nav_crop_doctor: "AI Crop Doctor",
    nav_assistant: "AI Assistant",
    nav_report: "Report an Issue",
    nav_my_reports: "My Tracked Issues",
    nav_announcements: "Gram Sabha & Alerts",
    nav_voice: "Voice Service",
    nav_map: "Interactive Village Map",
    nav_profile: "My Profile",
    nav_official_portal: "Official Portal",
    nav_admin_portal: "System Admin",
    nav_verification_pending: "Verification Status",
    nav_help: "Help & Accessibility",
    
    // Auth & Status
    role_citizen: "Citizen",
    role_official: "Government Official",
    role_admin: "System Administrator",
    status_verified: "Verified Official",
    status_pending: "Verification Pending",
    demo_badge: "LIVE GOVERNANCE",
    logout: "Log Out",
    login_btn: "Log In",
    register_btn: "Register Account",
    
    // Actions & Common
    search_placeholder: "Search schemes, projects, villages...",
    filter_all: "All Categories",
    check_eligibility: "Check Eligibility",
    apply_now: "How to Apply",
    view_details: "View Details",
    save_scheme: "Save Scheme",
    saved: "Saved",
    submit_report: "Submit Grievance",
    listen_audio: "Listen Audio",
    stop_audio: "Stop Audio",
    low_bandwidth_on: "2G Low-Data Active",
    low_bandwidth_off: "Standard Mode",
    font_size: "Font Size",
    back_to_list: "Back to List",
    refresh: "Refresh",
    upload_photo: "Upload Photo",
    take_photo: "Take Photo",
    analyze_now: "Analyze Plant Disease",
    detecting: "Analyzing Plant...",
    recommendations: "Treatment Recommendations",
    organic_treatment: "Organic / Natural Treatment",
    chemical_treatment: "Chemical / Fungicide Treatment",
    prevention: "Prevention & Care",
    matching_schemes: "Recommended Government Schemes",
    confidence: "Diagnostic Confidence",
    plant_disease_doctor: "AI Crop Disease Doctor",
    plant_doctor_desc: "Instant agricultural pathology diagnosis from leaf images for Tamil Nadu and Indian farmers.",

    // Project Stages
    stage_planning: "Planning",
    stage_budget_approved: "Budget Sanctioned",
    stage_tender_floated: "Tender Floated",
    stage_contractor_assigned: "Contractor Assigned",
    stage_foundation_work: "Foundation Work",
    stage_structure_laying: "Structure / Laying",
    stage_mid_term_inspection: "Mid-Term Inspection",
    stage_quality_testing: "Quality Testing",
    stage_final_finishing: "Final Finishing",
    stage_completion_handover: "Handover",
    stage_official_signoff: "Official Sign-off",
    stage_public_audit: "Public Gram Audit",
    stage_maintenance_active: "Active Maintenance",

    // Report Statuses
    report_submitted: "Grievance Submitted",
    report_triaged: "Triaged & Assigned",
    report_inspection_scheduled: "Inspection Scheduled",
    report_in_progress: "Work in Progress",
    report_resolution_proposed: "Resolution Proposed",
    report_verified_closed: "Verified & Resolved",

    // Admin Dashboard
    admin_title: "System Root Administrator",
    admin_subtitle: "Full authority over official clearances, welfare scheme catalogs, grievance escalations, and telephony broadcast permissions.",
    admin_reset_demo: "Reset Demo Store",
    admin_tab_overview: "Overview & KPIs",
    admin_tab_verifications: "Official Clearances",
    admin_tab_campaigns: "Voice Broadcasts",
    admin_tab_audit: "Security Audit Trail",
    admin_kpi_citizens: "Registered Citizens",
    admin_kpi_officials: "Government Officials",
    admin_kpi_pending: "Pending Clearances",
    admin_kpi_subscribers: "Consented Voice Subscribers",
    admin_sys_status: "System Architecture Status",
    admin_db_engine: "Database Engine:",
    admin_ai_adapter: "AI Model Adapter:",
    admin_telephony: "Telephony Compliance:",
    admin_active_schemes: "Active Welfare Schemes:",
    admin_tracked_projects: "13-Stage Tracked Projects:",
    admin_rules_title: "Platform Verification Rules",
    admin_rule_1: "1. Official accounts must present verifiable Block/Taluk staff identifiers before receiving edit privileges.",
    admin_rule_2: "2. All citizen grievance status changes must be logged in the immutable audit trail with actor IDs.",
    admin_rule_3: "3. Outbound automated voice broadcasts are restricted exclusively to subscribers with explicit opt-in timestamps.",
    admin_clearances_clean: "All Official Clearances Up to Date",
    admin_clearances_clean_sub: "No unverified official registration requests pending in queue.",
    admin_verif_queue: "Official Registration Verification Queue",
    admin_pending_review: "Pending Review",
    admin_th_name: "Official Name",
    admin_th_desig: "Designation & Dept",
    admin_th_jurisdiction: "Jurisdiction",
    admin_th_empid: "Employee ID",
    admin_th_requested: "Requested At",
    admin_th_actions: "Actions",
    admin_btn_approve: "Approve",
    admin_btn_reject: "Reject",
    admin_campaigns_title: "Rural Voice Campaigns Management",
    admin_campaign_approved: "APPROVED & READY",
    admin_campaign_pending: "PENDING APPROVAL",
    admin_dispatch_btn: "Dispatch Test Broadcast",
    admin_audit_title: "Platform Security Audit Trail",
    admin_audit_events: "Logged Security Events",

    // Assistant & Map & Verification
    asst_header: "GRAMVIKAS AI Assistant",
    asst_sub: "Grounded Multilingual Guidance with Strict Source Citations",
    asst_stop_voice: "Stop Voice",
    asst_grounded_badge: "100% Grounded Facts",
    asst_voice_badge: "Audio Voice Enabled",
    asst_placeholder: "Type or ask a question in Tamil, Hindi or English...",
    asst_send: "Send",
    map_title: "Village GIS Map Discovery",
    map_sub: "Explore physical locations of ongoing infrastructure projects and verified citizen grievances.",
    map_all_pins: "All Pins",
    map_projects_filter: "Projects",
    map_reports_filter: "Grievances",
    verif_title: "Official Verification in Progress",
    verif_desc: "Your official account request has been logged and is awaiting security clearance by the District Governance Administrator.",
    verif_btn_check: "Re-check Approval Status"
  },

  ta: {
    app_title: "கிராம விகாஸ் AI",
    tagline: "ஒவ்வொரு குடிமகனுக்கும் தகவல். ஒவ்வொரு கிராம முன்னேற்றமும் வெளிப்படை.",
    nav_home: "குடிமக்கள் முகப்பு",
    nav_schemes: "அரசு நலத்திட்டங்கள்",
    nav_saved_schemes: "சேமித்த திட்டங்கள்",
    nav_projects: "கிராம வளர்ச்சிப் பணிகள்",
    nav_crop_doctor: "பயிர் மருத்துவர் AI",
    nav_assistant: "AI உதவியாளர்",
    nav_report: "குறை தீர்க்கும் புகார்",
    nav_my_reports: "எனது புகார்கள்",
    nav_announcements: "கிராம சபை & அறிவிப்புகள்",
    nav_voice: "குரல் வழி தகவல் சேவை",
    nav_map: "கிராம வரைபடம்",
    nav_profile: "எனது சுயவிவரம்",
    nav_official_portal: "அலுவலர் போர்டல்",
    nav_admin_portal: "நிர்வாகி போர்டல்",
    nav_verification_pending: "சரிபார்ப்பு நிலை",
    nav_help: "உதவி & வழிகாட்டி",

    // Auth & Status
    role_citizen: "குடிமகன்",
    role_official: "அரசு அலுவலர்",
    role_admin: "அமைப்பு நிர்வாகி",
    status_verified: "சான்றளிக்கப்பட்ட அலுவலர்",
    status_pending: "சரிபார்ப்பு நிலுவையில்",
    demo_badge: "அரசு தளம் நேரலை",
    logout: "வெளியேறு",
    login_btn: "உள்நுழை",
    register_btn: "பதிவு செய்",

    // Actions & Common
    search_placeholder: "திட்டங்கள், பணிகள், கிராமங்கள் தேட...",
    filter_all: "அனைத்து பிரிவுகளும்",
    check_eligibility: "தகுதி சரிபார்",
    apply_now: "விண்ணப்பிக்கும் முறை",
    view_details: "முழு விவரம்",
    save_scheme: "சேமி",
    saved: "சேமிக்கப்பட்டது",
    submit_report: "புகார் சமர்ப்பி",
    listen_audio: "குரல் வழி கேட்க",
    stop_audio: "ஆடியோ நிறுத்து",
    low_bandwidth_on: "குறைந்த இணைய பயன்முறை",
    low_bandwidth_off: "சாதாரண பயன்முறை",
    font_size: "எழுத்து அளவு",
    back_to_list: "பட்டியலுக்கு திரும்பு",
    refresh: "புதுப்பி",
    upload_photo: "படம் பதிவேற்று",
    take_photo: "கேமரா படம் எடு",
    analyze_now: "பயிர் நோய் கண்டறி",
    detecting: "பயிர் இலை பரிசோதிக்கப்படுகிறது...",
    recommendations: "பரிந்துரைக்கப்படும் சிகிச்சைகள்",
    organic_treatment: "இயற்கை / நாட்டு மருந்து முறை",
    chemical_treatment: "பூஞ்சாணக் கொல்லி / ரசாயன முறை",
    prevention: "தடுப்பு மற்றும் பாதுகாப்பு முறைகள்",
    matching_schemes: "பயனுள்ள அரசு மானிய திட்டங்கள்",
    confidence: "கண்டறியப்பட்ட உறுதித்தன்மை",
    plant_disease_doctor: "பயிர் மருத்துவர் AI (Crop Doctor)",
    plant_doctor_desc: "விவசாயிகளின் பயிர் இலை புகைப்படத்தை பதிவேற்றி உடனுக்குடன் நோய் அறிதல் மற்றும் தடுப்பு மருந்துகள் பெறும் தளம்.",

    // Project Stages
    stage_planning: "திட்டமிடல்",
    stage_budget_approved: "நிதி ஒப்புதல்",
    stage_tender_floated: "டெண்டர் கோருதல்",
    stage_contractor_assigned: "ஒப்பந்ததாரர் நியமனம்",
    stage_foundation_work: "அடித்தளப் பணி",
    stage_structure_laying: "கட்டமைப்பு பணி",
    stage_mid_term_inspection: "இடைக்கால ஆய்வு",
    stage_quality_testing: "தரப் பரிசோதனை",
    stage_final_finishing: "இறுதி பூச்சு வேலை",
    stage_completion_handover: "பணி ஒப்படைப்பு",
    stage_official_signoff: "அலுவலர் ஒப்புதல்",
    stage_public_audit: "சமூகத் தணிக்கை",
    stage_maintenance_active: "பராமரிப்பில்",

    // Report Statuses
    report_submitted: "புகார் பெறப்பட்டது",
    report_triaged: "ஆய்வுக்கு ஒதுக்கப்பட்டது",
    report_inspection_scheduled: "கள ஆய்வு திட்டமிடப்பட்டது",
    report_in_progress: "பழுது நீக்கும் பணி நடக்கிறது",
    report_resolution_proposed: "தீர்வு முன்வைக்கப்பட்டது",
    report_verified_closed: "சரிபார்க்கப்பட்டு முடிக்கப்பட்டது",

    // Admin Dashboard
    admin_title: "அமைப்பு தலைமை நிர்வாக அதிகாரி",
    admin_subtitle: "அலுவலர் அங்கீகாரம், அரசு திட்டங்கள், பொதுமக்கள் குறை தீர்ப்பு மற்றும் குரல் வழி அறிவிப்புகளுக்கான முழு அதிகார மையம்.",
    admin_reset_demo: "மாதிரி தரவை மீட்டமை",
    admin_tab_overview: "கண்காணிப்பு & புள்ளிவிவரங்கள்",
    admin_tab_verifications: "அலுவலர் அங்கீகாரங்கள்",
    admin_tab_campaigns: "குரல் அறிவிப்புகள்",
    admin_tab_audit: "பாதுகாப்பு தணிக்கை பதிவு",
    admin_kpi_citizens: "பதிவு செய்த குடிமக்கள்",
    admin_kpi_officials: "அரசு அலுவலர்கள்",
    admin_kpi_pending: "நிலுவையில் உள்ள அங்கீகாரங்கள்",
    admin_kpi_subscribers: "குரல் அழைப்பு பயனர்கள்",
    admin_sys_status: "கணினி கட்டமைப்பு நிலை",
    admin_db_engine: "தரவுத்தள இயந்திரம்:",
    admin_ai_adapter: "AI மாதிரி இணைப்பு:",
    admin_telephony: "தொலைத்தொடர்பு விதிமுறை:",
    admin_active_schemes: "செயலில் உள்ள நலத்திட்டங்கள்:",
    admin_tracked_projects: "13-நிலை கண்காணிக்கப்படும் பணிகள்:",
    admin_rules_title: "தள சரிபார்ப்பு விதிகள்",
    admin_rule_1: "1. அலுவலர் கணக்குகள் வட்டார/வட்ட அளவிலான அரசு அடையாள அட்டையை சரிபார்த்த பின்னரே அனுமதிக்கப்படும்.",
    admin_rule_2: "2. பொதுமக்கள் குறைகளின் அனைத்து நிலை மாற்றங்களும் மாற்றியவர் விவரங்களுடன் தணிக்கைப் பதிவேட்டில் பாதுகாக்கப்படும்.",
    admin_rule_3: "3. தானியங்கி குரல் அழைப்புகள் ஒப்புதல் அளித்த பயனர்களுக்கு மட்டுமே அனுமதிக்கப்பட்ட நேரத்தில் அனுப்பப்படும்.",
    admin_clearances_clean: "அனைத்து அலுவலர் விண்ணப்பங்களும் சரிபார்க்கப்பட்டுவிட்டன",
    admin_clearances_clean_sub: "நிலுவையில் எந்த அலுவலர் சரிபார்ப்பு கோரிக்கைகளும் இல்லை.",
    admin_verif_queue: "அலுவலர் பதிவு சரிபார்ப்பு வரிசை",
    admin_pending_review: "ஆய்வு நிலுவையில்",
    admin_th_name: "அலுவலர் பெயர்",
    admin_th_desig: "பதவி & துறை",
    admin_th_jurisdiction: "அதிகார எல்லை",
    admin_th_empid: "பணியாளர் எண்",
    admin_th_requested: "விண்ணப்பித்த நாள்",
    admin_th_actions: "செயல்கள்",
    admin_btn_approve: "ஒப்புதல் அளி",
    admin_btn_reject: "நிராகரி",
    admin_campaigns_title: "கிராமப்புற குரல் அழைப்பு மேலாண்மை",
    admin_campaign_approved: "ஒப்புதல் அளிக்கப்பட்டது",
    admin_campaign_pending: "ஒப்புதல் நிலுவையில்",
    admin_dispatch_btn: "மாதிரி குரல் அறிவிப்பு அனுப்பு",
    admin_audit_title: "தள பாதுகாப்பு தணிக்கை வரலாறு",
    admin_audit_events: "பதிவு செய்யப்பட்ட பாதுகாப்பு நிகழ்வுகள்",

    // Assistant & Map & Verification
    asst_header: "கிராம விகாஸ் AI உதவியாளர்",
    asst_sub: "அரசு ஆவண ஆதாரங்களுடன் கூடிய துல்லியமான வழிகாட்டுதல்",
    asst_stop_voice: "குரலை நிறுத்து",
    asst_grounded_badge: "100% அதிகாரப்பூர்வ தகவல்கள்",
    asst_voice_badge: "குரல் வழி ஒலிபரப்பு உண்டு",
    asst_placeholder: "தமிழ், இந்தி அல்லது ஆங்கிலத்தில் கேள்வி கேட்கவும்...",
    asst_send: "அனுப்பு",
    map_title: "கிராம வரைபடம் மற்றும் பணிகள் கண்டறிதல்",
    map_sub: "கிராமத்தில் நடைபெறும் வளர்ச்சி பணிகள் மற்றும் பொதுமக்கள் புகார்களின் நேரடி வரைபடக் காட்சி.",
    map_all_pins: "அனைத்து இடங்களும்",
    map_projects_filter: "திட்டப்பணிகள்",
    map_reports_filter: "புகார்கள்",
    verif_title: "அலுவலர் சரிபார்ப்பு செயல்பாட்டில் உள்ளது",
    verif_desc: "உங்கள் அரசு அலுவலர் கணக்கு பதிவு செய்யப்பட்டுள்ளது. மாவட்ட நிர்வாகியின் ஒப்புதலுக்காக காத்திருக்கிறது.",
    verif_btn_check: "சரிபார்ப்பு நிலையை மீண்டும் சரிபார்"
  },

  hi: {
    app_title: "ग्राम विकास एआई",
    tagline: "हर नागरिक सूचित। हर गांव की प्रगति पारदर्शी।",
    nav_home: "नागरिक डैशबोर्ड",
    nav_schemes: "सरकारी योजनाएं",
    nav_saved_schemes: "सहेजी गई योजनाएं",
    nav_projects: "ग्रामीण विकास कार्य",
    nav_crop_doctor: "फसल डॉक्टर एआई",
    nav_assistant: "एआई सहायक",
    nav_report: "समस्या दर्ज करें",
    nav_my_reports: "मेरी दर्ज शिकायतें",
    nav_announcements: "ग्राम सभा व घोषणाएं",
    nav_voice: "वॉयस अलर्ट सेवा",
    nav_map: "गांव का डिजिटल नक्शा",
    nav_profile: "मेरी प्रोफ़ाइल",
    nav_official_portal: "अधिकारी पोर्टल",
    nav_admin_portal: "सिस्टम एडमिन",
    nav_verification_pending: "सत्यापन स्थिति",
    nav_help: "सहायता व सेटिंग्स",

    // Auth & Status
    role_citizen: "नागरिक",
    role_official: "सरकारी अधिकारी",
    role_admin: "सिस्टम व्यवस्थापक",
    status_verified: "सत्यापित अधिकारी",
    status_pending: "सत्यापन लंबित",
    demo_badge: "लाइव ग्रामीण सेवा",
    logout: "लॉग आउट",
    login_btn: "लॉग इन",
    register_btn: "खाता बनाएं",

    // Actions & Common
    search_placeholder: "योजनाएं, कार्य, गांव खोजें...",
    filter_all: "सभी श्रेणियां",
    check_eligibility: "पात्रता जांचें",
    apply_now: "आवेदन प्रक्रिया",
    view_details: "विवरण देखें",
    save_scheme: "योजना सहेजें",
    saved: "सहेजा गया",
    submit_report: "शिकायत दर्ज करें",
    listen_audio: "ऑडियो सुनें",
    stop_audio: "ऑडियो रोकें",
    low_bandwidth_on: "लो डेटा मोड चालू",
    low_bandwidth_off: "सामान्य मोड",
    font_size: "फ़ॉन्ट आकार",
    back_to_list: "सूची पर वापस जाएं",
    refresh: "रिफ्रेश",
    upload_photo: "फोटो अपलोड करें",
    take_photo: "कैमरा से फोटो लें",
    analyze_now: "फसल रोग की जांच करें",
    detecting: "पत्ती की जांच की जा रही है...",
    recommendations: "उपचार अनुशंसाएं",
    organic_treatment: "जैविक / प्राकृतिक उपचार",
    chemical_treatment: "रासायनिक कीटनाशक उपचार",
    prevention: "बचाव व सावधानियां",
    matching_schemes: "संबंधित सरकारी योजनाएं",
    confidence: "जांच सटीकता",
    plant_disease_doctor: "एआई फसल रोग डॉक्टर",
    plant_doctor_desc: "पत्तियों की फोटो अपलोड कर तुरंत फसल रोग की पहचान और सटीक उपचार प्राप्त करें।",

    // Project Stages
    stage_planning: "योजना निर्माण",
    stage_budget_approved: "बजट स्वीकृत",
    stage_tender_floated: "निविदा जारी",
    stage_contractor_assigned: "ठेकेदार आवंटित",
    stage_foundation_work: "नींव निर्माण",
    stage_structure_laying: "ढांचागत कार्य",
    stage_mid_term_inspection: "मध्यावधि निरीक्षण",
    stage_quality_testing: "गुणवत्ता परीक्षण",
    stage_final_finishing: "अंतिम फिनिशिंग",
    stage_completion_handover: "हस्तांतरण",
    stage_official_signoff: "आधिकारिक स्वीकृति",
    stage_public_audit: "ग्राम सामाजिक ऑडिट",
    stage_maintenance_active: "सक्रिय रखरखाव",

    // Report Statuses
    report_submitted: "शिकायत दर्ज",
    report_triaged: "अधिकारी को आवंटित",
    report_inspection_scheduled: "निरीक्षण निर्धारित",
    report_in_progress: "कार्य प्रगति पर",
    report_resolution_proposed: "समाधान प्रस्तुत",
    report_verified_closed: "सत्यापित व निस्तारित",

    // Admin Dashboard
    admin_title: "सिस्टम मुख्य प्रशासक",
    admin_subtitle: "अधिकारी सत्यापन, कल्याणकारी योजनाएं, जन शिकायत निवारण और वॉयस प्रसारण का पूर्ण नियंत्रण केंद्र।",
    admin_reset_demo: "डेमो डेटा रीसेट करें",
    admin_tab_overview: "समीक्षा व मुख्य आंकड़े",
    admin_tab_verifications: "अधिकारी सत्यापन",
    admin_tab_campaigns: "वॉयस प्रसारण",
    admin_tab_audit: "सुरक्षा ऑडिट लॉग",
    admin_kpi_citizens: "पंजीकृत नागरिक",
    admin_kpi_officials: "सरकारी अधिकारी",
    admin_kpi_pending: "लंबित सत्यापन",
    admin_kpi_subscribers: "वॉयस सेवा सदस्य",
    admin_sys_status: "सिस्टम संरचना स्थिति",
    admin_db_engine: "डेटाबेस इंजन:",
    admin_ai_adapter: "एआई मॉडल एडाप्टर:",
    admin_telephony: "दूरसंचार अनुपालन:",
    admin_active_schemes: "सक्रिय कल्याणकारी योजनाएं:",
    admin_tracked_projects: "13-चरणीय प्रगतिशील परियोजनाएं:",
    admin_rules_title: "प्लेटफ़ॉर्म सत्यापन नियम",
    admin_rule_1: "1. अधिकारी खातों को संपादन अधिकार देने से पहले ब्लॉक/तालुका कर्मचारी पहचान की पुष्टि आवश्यक है।",
    admin_rule_2: "2. सभी नागरिक शिकायतों के स्टेटस परिवर्तन ऑडिट लॉग में सुरक्षित रखे जाते हैं।",
    admin_rule_3: "3. स्वचालित वॉयस संदेश केवल सहमति प्राप्त नागरिकों को निर्धारित समय पर भेजे जाते हैं।",
    admin_clearances_clean: "सभी अधिकारी आवेदन सत्यापित हैं",
    admin_clearances_clean_sub: "कतार में कोई लंबित सत्यापन अनुरोध नहीं है।",
    admin_verif_queue: "अधिकारी पंजीकरण सत्यापन कतार",
    admin_pending_review: "समीक्षा लंबित",
    admin_th_name: "अधिकारी का नाम",
    admin_th_desig: "पद व विभाग",
    admin_th_jurisdiction: "कार्यक्षेत्र",
    admin_th_empid: "कर्मचारी संख्या",
    admin_th_requested: "आवेदन तिथि",
    admin_th_actions: "कार्यवाही",
    admin_btn_approve: "स्वीकृत करें",
    admin_btn_reject: "अस्वीकार करें",
    admin_campaigns_title: "ग्रामीण वॉयस संदेश प्रबंधन",
    admin_campaign_approved: "स्वीकृत व तैयार",
    admin_campaign_pending: "स्वीकृति लंबित",
    admin_dispatch_btn: "टेस्ट प्रसारण भेजें",
    admin_audit_title: "प्लेटफ़ॉर्म सुरक्षा ऑडिट लॉग",
    admin_audit_events: "दर्ज सुरक्षा घटनाएं",

    // Assistant & Map & Verification
    asst_header: "ग्राम विकास एआई सहायक",
    asst_sub: "सरकारी स्त्रोतों पर आधारित सटीक बहुभाषी मार्गदर्शन",
    asst_stop_voice: "वॉयस रोकें",
    asst_grounded_badge: "100% प्रामाणिक तथ्य",
    asst_voice_badge: "वॉयस ऑडियो सक्षम",
    asst_placeholder: "तमिल, हिंदी या अंग्रेजी में प्रश्न पूछें...",
    asst_send: "भेजें",
    map_title: "गांव का डिजिटल नक्शा व परियोजनाएं",
    map_sub: "गांव के विकास कार्यों और सत्यापित जन शिकायतों की भौगोलिक स्थिति देखें।",
    map_all_pins: "सभी स्थान",
    map_projects_filter: "परियोजनाएं",
    map_reports_filter: "शिकायतें",
    verif_title: "अधिकारी सत्यापन प्रक्रियाधीन है",
    verif_desc: "आपका आधिकारिक खाता पंजीकृत हो चुका है और जिला प्रशासन द्वारा सत्यापन की प्रतीक्षा कर रहा है।",
    verif_btn_check: "स्वीकृति स्थिति पुनः जांचें"
  }
};

let currentLanguage = localStorage.getItem("gv_lang") || "en";

export function getLanguage() {
  return currentLanguage;
}

export function setLanguage(lang) {
  if (TRANSLATIONS[lang]) {
    currentLanguage = lang;
    localStorage.setItem("gv_lang", lang);
    applyLanguage();
    window.dispatchEvent(new CustomEvent("languageChanged", { detail: { language: lang } }));
  }
}

export function t(key, fallback = "") {
  const langDict = TRANSLATIONS[currentLanguage] || TRANSLATIONS.en;
  return langDict[key] || TRANSLATIONS.en[key] || fallback || key;
}

/**
 * Automatically picks the localized field from a database record.
 * e.g. localizeField(scheme, 'title') -> scheme.title_ta if currentLang is 'ta'.
 */
export function localizeField(record, fieldName, defaultLang = 'en') {
  if (!record) return "";
  const lang = currentLanguage;
  if (lang === "ta") {
    return record[`${fieldName}_ta`] || record[`${fieldName}_en`] || record[fieldName] || "";
  }
  if (lang === "hi") {
    return record[`${fieldName}_hi`] || record[`${fieldName}_en`] || record[fieldName] || "";
  }
  return record[`${fieldName}_en`] || record[fieldName] || "";
}

export function applyLanguage() {
  document.querySelectorAll("[data-i18n]").forEach(el => {
    const key = el.getAttribute("data-i18n");
    const translation = t(key);
    if (translation) {
      if (el.tagName === "INPUT" || el.tagName === "TEXTAREA") {
        el.setAttribute("placeholder", translation);
      } else {
        el.textContent = translation;
      }
    }
  });

  document.querySelectorAll("[data-i18n-title]").forEach(el => {
    const key = el.getAttribute("data-i18n-title");
    el.setAttribute("title", t(key));
  });
}

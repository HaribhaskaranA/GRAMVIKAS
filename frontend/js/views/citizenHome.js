/**
 * GRAMVIKAS AI - Citizen Home Dashboard View (/citizen/home)
 * Features:
 * 1. High-Contrast Hero Banner (Crisp White/Champagne text, 100% readable over Emerald Ink).
 * 2. Visual Picture-First Rural Grid (6 Large Picture Cards for Low-Literacy Users + 🔊 Read Aloud).
 * 3. Real Live Tamil Nadu & India Agriculture/Rural RSS News Feed + Official Voice Broadcasts.
 * 4. 3-Layer Resilient Auto-Voice News Reader (Overcomes Chrome Autoplay Restrictions).
 * 5. Full Localization across Tamil (தமிழ்), Hindi (हिंदी), and English.
 */

import { api } from "../api.js";
import { auth } from "../auth.js";
import { getLanguage, t, localizeField } from "../i18n.js";
import { showToast } from "../components/toast.js";

// Global audio stream singleton to manage playback across interactions
let activeAudioStream = null;
let isAudioPlaying = false;
let autoVoiceTriggered = false;

// Localization dictionaries for user names & places
const LOCALIZED_NAMES = {
  ta: {
    "Muthuvel K": "முத்துவேல் கே",
    "Dr. Selvi": "மருத்துவர் செல்வி",
    "Dr. Selvi (BDO)": "மருத்துவர் செல்வி (வ.வ.அ.)",
    "R. Anbarasan": "ஆர். அன்பரசன்",
    "State Gov Admin": "மாநில அரசு நிர்வாகி",
    "Melmaruvathur": "மேல்மருவத்தூர்",
    "Chengalpattu": "செங்கல்பட்டு",
    "Farmer": "விவசாயி",
    "Small Farmer": "சிறு விவசாயி",
    "Marginal Farmer": "குறு விவசாயி",
    "Citizen": "குடிமகன்"
  },
  hi: {
    "Muthuvel K": "मुथुवेल के",
    "Dr. Selvi": "डॉ. सेल्वी",
    "Dr. Selvi (BDO)": "डॉ. सेल्वी (बीडीओ)",
    "R. Anbarasan": "आर. अनबरसन",
    "State Gov Admin": "राज्य सरकार व्यवस्थापक",
    "Melmaruvathur": "मेलमरुवथुर",
    "Chengalpattu": "चेंगलपट्टू",
    "Farmer": "किसान",
    "Small Farmer": "छोटे किसान",
    "Marginal Farmer": "सीमांत किसान",
    "Citizen": "नागरिक"
  }
};

function locName(name, lang) {
  if (!name) return "";
  const dict = LOCALIZED_NAMES[lang];
  return (dict && dict[name]) ? dict[name] : name;
}

export async function renderCitizenHome(container) {
  const user = auth.getUser();
  const profile = user?.citizen_profile || {};
  const rawVillage = profile.village || "Melmaruvathur";
  const rawDistrict = profile.district || "Chengalpattu";
  const rawOccupation = profile.occupation || "Farmer";
  const rawName = user?.full_name || "Muthuvel K";
  const lang = getLanguage();

  const localizedName = locName(rawName, lang);
  const localizedVillage = locName(rawVillage, lang);
  const localizedDistrict = locName(rawDistrict, lang);
  const localizedOccupation = locName(rawOccupation, lang);

  // 6 Rural Visual Picture Cards Configuration
  const pictureCards = [
    {
      id: "card-crop-doctor",
      route: "/crop-doctor",
      img: "/assets/cards/crop_doctor.svg",
      badge: lang === 'ta' ? "AI ஆய்வு" : (lang === 'hi' ? "AI जांच" : "AI Scan"),
      title: lang === 'ta' ? "AI பயிர் மருத்துவர்" : (lang === 'hi' ? "AI फसल डॉक्टर" : "AI Crop Doctor"),
      desc: lang === 'ta' ? "பயிரின் புகைப்படத்தை எடுத்து நோய் கண்டறிந்து உடனே மருந்து பரிந்துரை பெறுங்கள்." : (lang === 'hi' ? "फसल की फोटो लें और तुरंत बीमारी व कीटनाशक उपाय जानें।" : "Snap a leaf photo to detect disease and get instant organic cure recommendations."),
      actionText: lang === 'ta' ? "பயிரை சோதிக்க" : (lang === 'hi' ? "फसल जांचें" : "Check Crops"),
      icon: "bi-flower1"
    },
    {
      id: "card-schemes",
      route: "/schemes",
      img: "/assets/cards/schemes.svg",
      badge: lang === 'ta' ? "நிதி உதவி" : (lang === 'hi' ? "कल्याण योजना" : "Welfare Subsidy"),
      title: lang === 'ta' ? "அரசு நலத்திட்டங்கள்" : (lang === 'hi' ? "सरकारी योजनाएं" : "Government Schemes"),
      desc: lang === 'ta' ? "விவசாய மற்றும் ஊரக நலத்திட்டங்களுக்கு 1 நிமிடத்தில் உங்கள் தகுதியை சரிபாருங்கள்." : (lang === 'hi' ? "अपने लिए उपलब्ध कृषि व ग्रामीण योजनाओं की पात्रता जांचें।" : "Evaluate your welfare criteria and check eligible government grant subsidies."),
      actionText: lang === 'ta' ? "திட்டம் பார்க்க" : (lang === 'hi' ? "योजनाएं देखें" : "View Schemes"),
      icon: "bi-cash-coin"
    },
    {
      id: "card-projects",
      route: "/projects",
      img: "/assets/cards/projects.svg",
      badge: lang === 'ta' ? "13 நிலைகள்" : (lang === 'hi' ? "13 चरण" : "13 Stages"),
      title: lang === 'ta' ? "கிராம வளர்ச்சிப் பணிகள்" : (lang === 'hi' ? "गांव के विकास कार्य" : "Village Projects"),
      desc: lang === 'ta' ? "உங்கள் ஊர் சாலை, குடிநீர், தெருவிளக்கு திட்டங்களின் 13 நிலை முன்னேற்றத்தை பாருங்கள்." : (lang === 'hi' ? "गांव के सड़क, नाली और पानी प्रोजेक्ट की 13 चरणों की प्रगति देखें।" : "Track real-time 13-stage progress and budget transparency of village infrastructure."),
      actionText: lang === 'ta' ? "முன்னேற்றம் காண" : (lang === 'hi' ? "प्रगति देखें" : "Track Works"),
      icon: "bi-buildings"
    },
    {
      id: "card-report",
      route: "/report-issue",
      img: "/assets/cards/report_issue.svg",
      badge: lang === 'ta' ? "நேரடி புகார்" : (lang === 'hi' ? "शिकायत" : "Grievance"),
      title: lang === 'ta' ? "பொது புகார் பதிவு" : (lang === 'hi' ? "समस्या शिकायत दर्ज करें" : "Report Issue"),
      desc: lang === 'ta' ? "குடிநீர், மின்சாரம், சாலை குறைபாடுகளை புகைப்படம் மற்றும் குரல் பதிவு மூலம் பதியுங்கள்." : (lang === 'hi' ? "सड़क, पानी, बिजली की समस्या की फोटो या बोलकर शिकायत दर्ज करें।" : "Report water leakage, street light faults, or road potholes directly to officials."),
      actionText: lang === 'ta' ? "புகார் பதிய" : (lang === 'hi' ? "शिकायत करें" : "File Report"),
      icon: "bi-exclamation-octagon"
    },
    {
      id: "card-assistant",
      route: "/assistant",
      img: "/assets/cards/assistant.svg",
      badge: lang === 'ta' ? "குரல் வழி" : (lang === 'hi' ? "वॉयस हेल्प" : "Voice AI"),
      title: lang === 'ta' ? "AI குரல் & அரட்டை உதவியாளர்" : (lang === 'hi' ? "AI वॉयस सहायक" : "AI Voice Assistant"),
      desc: lang === 'ta' ? "உங்கள் தாய்மொழியில் பேசி அரசு விதிகள் மற்றும் திட்டங்களை உடனடியாக அறிந்துகொள்ளுங்கள்." : (lang === 'hi' ? "अपनी भाषा में बोलकर योजनाओं और नियमों की जानकारी तुरंत पाएं।" : "Ask questions by voice in Tamil, Hindi, or English and receive instant spoken guidance."),
      actionText: lang === 'ta' ? "பேசி அறிய" : (lang === 'hi' ? "बात करें" : "Speak to AI"),
      icon: "bi-mic-fill"
    },
    {
      id: "card-my-reports",
      route: "/my-reports",
      img: "/assets/cards/my_reports.svg",
      badge: lang === 'ta' ? "நிலவரம்" : (lang === 'hi' ? "स्थिति ट्रैक" : "Status Track"),
      title: lang === 'ta' ? "எனது புகார்கள் நிலவரம்" : (lang === 'hi' ? "मेरी शिकायत स्थिति" : "My Reports & Tracking"),
      desc: lang === 'ta' ? "நீங்கள் அளித்த புகார்களின் விசாரணை மற்றும் அதிகாரி தீர்வு நிலையை கண்காணிக்கவும்." : (lang === 'hi' ? "अपनी दर्ज शिकायतों की वर्तमान स्थिति और समाधान देखें।" : "Track resolution timeline, assigned field officers, and status updates of your tickets."),
      actionText: lang === 'ta' ? "நிலவரம் பார்க்க" : (lang === 'hi' ? "स्थिति देखें" : "Track Status"),
      icon: "bi-clock-history"
    }
  ];

  container.innerHTML = `
    <div class="d-flex flex-column gap-4">
      <!-- 1. HIGH-CONTRAST WELCOME HERO BANNER -->
      <div class="card-gv hero-banner-dark gv-hero-banner" style="background: linear-gradient(135deg, #064E3B 0%, #04392B 100%); color: #FFFFFF !important; padding: 1.85rem; border: 1px solid rgba(248, 231, 201, 0.25); box-shadow: 0 10px 30px rgba(6, 78, 59, 0.25);">
        <div class="row align-items-center">
          <div class="col-lg-8">
            <div class="d-flex align-items-center gap-2 mb-2">
              <span class="badge" style="background-color: var(--color-champagne); color: var(--color-primary); font-weight: 700; font-size: 0.82rem; padding: 6px 12px; border-radius: 50px;">
                <i class="bi bi-geo-alt-fill"></i> ${localizedVillage}, ${localizedDistrict}
              </span>
              <span class="badge" style="background: rgba(255, 255, 255, 0.18); color: #FFFFFF; font-weight: 600; font-size: 0.8rem; padding: 6px 12px; border-radius: 50px;">
                <i class="bi bi-shield-check"></i> ${t('demo_badge')}
              </span>
            </div>

            <!-- Crisp White & Champagne Headings (Immune to contrast bugs) -->
            <h2 class="fw-bold mb-2" style="color: #FFFFFF !important; font-size: 1.85rem; text-shadow: 0 2px 8px rgba(0,0,0,0.3);">
              ${lang === 'ta' ? `வணக்கம், ${localizedName}!` : (lang === 'hi' ? `नमस्ते, ${localizedName}!` : `Vanakkam, ${localizedName}!`)}
            </h2>

            <p class="mb-3" style="color: #F8E7C9 !important; font-size: 1.02rem; opacity: 0.95; line-height: 1.5;">
              ${lang === 'ta' ? 
                'அரசு நலத்திட்டங்கள், உங்கள் கிராம வளர்ச்சி திட்டங்களின் 13 நிலை முன்னேற்றம் மற்றும் AI பயிர் பாதுகாப்பு தகவல்களை உடனுக்குடன் தெரிந்து கொள்ளுங்கள்.' : 
                (lang === 'hi' ? 
                  'सरकारी कल्याणकारी योजनाएं, गांव की विकास परियोजनाओं की वास्तविक स्थिति और फसल रोग समाधान एक ही स्थान पर प्राप्त करें।' : 
                  'Stay informed on welfare subsidies, check personalized scheme eligibility, and track your village infrastructure projects in real-time.')}
            </p>

            <div class="d-flex flex-wrap gap-2 pt-1">
              <a href="/crop-doctor" class="btn btn-gv-saffron fw-bold shadow-sm">
                <i class="bi bi-flower1 me-1"></i> ${t('nav_crop_doctor')}
              </a>
              <a href="/assistant" class="btn btn-outline-light fw-semibold">
                <i class="bi bi-chat-dots-fill me-1"></i> ${t('nav_assistant')}
              </a>
              <a href="/schemes" class="btn btn-outline-light fw-semibold">
                <i class="bi bi-search me-1"></i> ${t('nav_schemes')}
              </a>
              <a href="/report-issue" class="btn btn-outline-light fw-semibold">
                <i class="bi bi-exclamation-octagon-fill me-1"></i> ${t('nav_report')}
              </a>
            </div>
          </div>

          <div class="col-lg-4 d-none d-lg-flex justify-content-center">
            <div style="width: 145px; height: 145px; border-radius: 50%; background: rgba(248, 231, 201, 0.18); border: 3px solid var(--color-champagne); padding: 6px; display: flex; align-items: center; justify-content: center; box-shadow: 0 10px 30px rgba(0,0,0,0.35);">
              <img src="/assets/assistant_logo.jpeg" alt="GRAMVIKAS AI Assistant" style="width: 100%; height: 100%; object-fit: cover; border-radius: 50%;">
            </div>
          </div>
        </div>
      </div>

      <!-- 2. RURAL PICTURE-FIRST VISUAL NAVIGATION GRID (6 Large Visual Cards) -->
      <div class="d-flex flex-column gap-2">
        <div class="d-flex align-items-center justify-content-between mb-1">
          <div>
            <h4 class="fw-bold mb-1" style="color: var(--color-primary);">
              ${lang === 'ta' ? 'உங்கள் கிராம சேவைகள் (படத்தை தொட்டு செல்லவும்)' : (lang === 'hi' ? 'आपकी ग्राम सेवाएं (फोटो छूकर खोलें)' : 'Village Services (Tap a Picture to Open)')}
            </h4>
            <p class="text-muted small mb-0">
              ${lang === 'ta' ? 'பயிர்களை சோதிக்க, திட்ட நிதி உதவி பெற மற்றும் ஊர் வளர்ச்சி பணிகளை கண்காணிக்க கீழே உள்ள படத்தை தொடவும்.' : (lang === 'hi' ? 'फसल जांच, सरकारी सहायता और गांव के काम देखने के लिए संबंधित फोटो पर क्लिक करें।' : 'Tap any picture card to check crops, verify welfare grants, or file village complaints.')}
            </p>
          </div>
        </div>

        <div class="picture-card-grid">
          ${pictureCards.map(c => `
            <div class="picture-card-item" data-route="${c.route}" id="${c.id}" tabindex="0" role="button" aria-label="${c.title}">
              <div class="picture-card-img-wrap">
                <img src="${c.img}" alt="${c.title}" class="picture-card-img" loading="lazy">
                <span class="picture-card-badge"><i class="bi ${c.icon} me-1"></i>${c.badge}</span>
                <button type="button" class="picture-card-speaker-btn btn-speak-card" data-title="${c.title}" data-desc="${c.desc}" title="${lang === 'ta' ? 'குரலில் கேட்க' : 'Listen'}" aria-label="Listen card aloud">
                  <i class="bi bi-volume-up-fill"></i>
                </button>
              </div>
              <div class="picture-card-body">
                <div class="picture-card-title">${c.title}</div>
                <div class="picture-card-desc">${c.desc}</div>
                <div class="picture-card-footer">
                  <span>${c.actionText}</span>
                  <i class="bi bi-arrow-right-circle-fill" style="font-size: 1.1rem;"></i>
                </div>
              </div>
            </div>
          `).join("")}
        </div>
      </div>

      <!-- 3. AUTOPLAY GESTURE UNLOCK BANNER (Appears gently if browser blocks initial speech) -->
      <div id="voice-autoplay-banner" class="pulse-autoplay-banner rounded p-3 d-flex align-items-center justify-content-between" style="display: none; background: var(--color-champagne); border: 2px solid var(--color-champagne-border); color: var(--color-primary); cursor: pointer;">
        <div class="d-flex align-items-center gap-3">
          <span style="font-size: 1.7rem;">🔊</span>
          <div>
            <div class="fw-bold" style="color: var(--color-primary); font-size: 1rem;">
              ${lang === 'ta' ? 'உங்கள் கிராம செய்திகள் குரல் வழி கேட்க தயாராக உள்ளன!' : (lang === 'hi' ? 'आपके गांव के समाचार सुनने के लिए तैयार हैं!' : 'Your Village News Audio Broadcast is Ready!')}
            </div>
            <small style="color: var(--color-primary); opacity: 0.85;">
              ${lang === 'ta' ? 'அதிகாரப்பூர்வ குரல் செய்திகளை உடனே கேட்க இங்கே தொடவும் (ஒரே தட்டு).' : (lang === 'hi' ? 'आधिकारिक वॉयस समाचार सुनने के लिए यहां क्लिक करें।' : 'Tap anywhere here to start the voice news announcement.')}
            </small>
          </div>
        </div>
        <button class="btn btn-gv-primary btn-sm fw-bold px-3 py-2" id="btn-unlock-banner-play">
          <i class="bi bi-play-circle-fill me-1"></i> ${lang === 'ta' ? 'செய்தி கேட்க' : (lang === 'hi' ? 'समाचार सुनें' : 'Listen Now')}
        </button>
      </div>

      <!-- 4. REAL LIVE TAMIL NADU & RURAL NEWS & OFFICIAL VOICE BROADCAST FEED -->
      <div class="card-gv p-4 village-news-banner" id="voice-news-section" style="background-color: var(--color-champagne) !important; border: 1px solid var(--color-champagne-border) !important; color: var(--color-primary) !important;">
        <div class="d-flex flex-wrap align-items-center justify-content-between gap-3 pb-3 border-bottom mb-3" style="border-color: var(--color-champagne-border) !important;">
          <div>
            <div class="d-flex align-items-center gap-2 mb-1">
              <span class="badge" style="background-color: var(--color-primary); color: var(--color-champagne); font-weight: 700;">
                <i class="bi bi-broadcast"></i> ${lang === 'ta' ? 'அதிகாரப்பூர்வ நேரலை' : (lang === 'hi' ? 'लाइव प्रसारण' : 'OFFICIAL LIVE FEED')}
              </span>
              <span class="badge" style="background-color: var(--color-primary-dark); color: #FFFFFF; font-weight: 700;">
                <i class="bi bi-megaphone-fill"></i> ${lang === 'ta' ? 'தானியங்கி குரல் செய்தி' : (lang === 'hi' ? 'ऑटो वॉयस न्यूज़' : 'AUTO VOICE NEWS')}
              </span>
            </div>
            <h4 class="fw-bold mb-0" style="color: var(--color-primary);">
              ${lang === 'ta' ? '📢 உங்கள் கிராம செய்திகள் மற்றும் குரல் அறிவிப்புகள்' : (lang === 'hi' ? '📢 आपके गांव के समाचार व आधिकारिक वॉयस संदेश' : '📢 Village News & Official Voice Broadcasts')}
            </h4>
            <span class="small" style="color: var(--color-primary); opacity: 0.85;">
              ${lang === 'ta' ? 'வட்டார வளர்ச்சி அலுவலர் (BDO), ஊராட்சி மற்றும் நேரலை தமிழக வேளாண் செய்தி ஊடகங்கள்.' : (lang === 'hi' ? 'बीडीओ, ग्राम पंचायत एवं लाइव कृषि समाचार माध्यमों से प्राप्त आधिकारिक अपडेट।' : 'Real-time updates from Block Officials, Panchayat, and live Tamil Nadu agriculture news desks.')}
            </span>
          </div>

          <!-- Master Auto-Readout Sound Button -->
          <div class="d-flex align-items-center gap-2">
            <button class="btn btn-gv-primary fw-bold px-3 py-2 shadow-sm" id="btn-master-voice-toggle" style="border-radius: 50px; font-size: 0.9rem;">
              <span class="spinner-grow spinner-grow-sm me-1" id="voice-indicator-pulse" style="display: none;"></span>
              <span id="voice-toggle-label">${lang === 'ta' ? '🔊 குரல் வழி செய்தி கேட்க அழுத்தவும்' : (lang === 'hi' ? '🔊 वॉयस समाचार सुनें' : '🔊 Listen Voice News')}</span>
            </button>
          </div>
        </div>

        <!-- News Cards Container -->
        <div id="village-news-cards-container" class="d-flex flex-column gap-3">
          <div class="text-center py-4 text-muted small">
            <div class="spinner-border spinner-border-sm text-success mb-2"></div>
            <div>${lang === 'ta' ? 'நேரலை செய்திகள் மற்றும் குரல் பதிவுகள் பெறப்படுகின்றன...' : (lang === 'hi' ? 'समाचार व वॉयस अपडेट लोड हो रहे हैं...' : 'Loading live news & voice feeds...')}</div>
          </div>
        </div>
      </div>

      <!-- 5. QUICK KPI STATS -->
      <div class="row g-3">
        <div class="col-sm-6 col-xl-3">
          <div class="kpi-card">
            <div class="kpi-icon green"><i class="bi bi-cash-coin"></i></div>
            <div class="kpi-info">
              <h3 id="stat-schemes">6</h3>
              <p>${lang === 'ta' ? 'செயலில் உள்ள அரசு திட்டங்கள்' : (lang === 'hi' ? 'सक्रिय सरकारी योजनाएं' : 'Active Schemes')}</p>
            </div>
          </div>
        </div>
        <div class="col-sm-6 col-xl-3">
          <div class="kpi-card">
            <div class="kpi-icon navy"><i class="bi bi-building-check"></i></div>
            <div class="kpi-info">
              <h3 id="stat-projects">4</h3>
              <p>${lang === 'ta' ? 'கிராம வளர்ச்சிப் பணிகள்' : (lang === 'hi' ? 'गांव के विकास कार्य' : 'Village Projects')}</p>
            </div>
          </div>
        </div>
        <div class="col-sm-6 col-xl-3">
          <div class="kpi-card">
            <div class="kpi-icon saffron"><i class="bi bi-exclamation-triangle"></i></div>
            <div class="kpi-info">
              <h3 id="stat-reports">3</h3>
              <p>${lang === 'ta' ? 'பதிவான பொது புகார்கள்' : (lang === 'hi' ? 'दर्ज शिकायतें' : 'Tracked Issues')}</p>
            </div>
          </div>
        </div>
        <div class="col-sm-6 col-xl-3">
          <div class="kpi-card">
            <div class="kpi-icon blue"><i class="bi bi-megaphone"></i></div>
            <div class="kpi-info">
              <h3 id="stat-announcements">2</h3>
              <p>${lang === 'ta' ? 'கிராம சபை அறிவிப்புகள்' : (lang === 'hi' ? 'ग्राम सभा घोषणाएं' : 'Gram Sabha Alerts')}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- 6. QUICK ELIGIBILITY & RECENT VILLAGE PROJECTS -->
      <div class="row g-4">
        <!-- Left: Quick Eligibility Checker Card -->
        <div class="col-lg-5">
          <div class="card-gv h-100 quick-eligibility-box" style="background-color: var(--color-champagne) !important; border: 1px solid var(--color-champagne-border) !important; color: var(--color-primary) !important;">
            <div class="card-header-gv" style="background: transparent; border-bottom: 1px solid var(--color-champagne-border);">
              <span class="fw-bold" style="color: var(--color-primary);"><i class="bi bi-check2-circle me-1" style="color: var(--color-primary);"></i> ${t('check_eligibility')}</span>
              <a href="/schemes" class="small text-decoration-none fw-semibold" style="color: var(--color-primary);">${t('view_details')} &rarr;</a>
            </div>
            <div class="card-body-gv">
              <p class="small mb-3" style="color: var(--color-primary); opacity: 0.9;">
                ${lang === 'ta' ? 'உங்கள் சுயவிவர விதிகளின் அடிப்படையில் அரசு நிதி உதவி தகுதியை சோதிக்கவும்.' : (lang === 'hi' ? 'अपनी प्रोफाइल के अनुसार सरकारी वित्तीय सहायता पात्रता तुरंत जांचें।' : 'Deterministic evaluation of your profile criteria against state & central welfare rules.')}
              </p>
              <div class="d-flex flex-column gap-2 mb-3">
                <div class="d-flex justify-content-between p-2 rounded small" style="background: rgba(6, 78, 59, 0.08); border: 1px solid rgba(6, 78, 59, 0.15); color: var(--color-primary);">
                  <span>${lang === 'ta' ? 'தொழில்' : (lang === 'hi' ? 'व्यवसाय' : 'Occupation')}:</span>
                  <strong class="text-capitalize">${localizedOccupation}</strong>
                </div>
                <div class="d-flex justify-content-between p-2 rounded small" style="background: rgba(6, 78, 59, 0.08); border: 1px solid rgba(6, 78, 59, 0.15); color: var(--color-primary);">
                  <span>${lang === 'ta' ? 'ஆண்டு வருமானம்' : (lang === 'hi' ? 'वार्षिक आय' : 'Annual Income')}:</span>
                  <strong>₹${(profile.annual_income || 75000).toLocaleString('en-IN')}</strong>
                </div>
                <div class="d-flex justify-content-between p-2 rounded small" style="background: rgba(6, 78, 59, 0.08); border: 1px solid rgba(6, 78, 59, 0.15); color: var(--color-primary);">
                  <span>${lang === 'ta' ? 'நில உரிமை' : (lang === 'hi' ? 'भूमि स्वामित्व' : 'Landholding')}:</span>
                  <strong>${profile.landholding_acres || 1.8} ${lang === 'ta' ? 'ஏக்கர்' : (lang === 'hi' ? 'एकड़' : 'Acres')}</strong>
                </div>
              </div>
              <a href="/schemes" class="btn btn-gv-primary w-100 btn-sm fw-bold">
                <i class="bi bi-card-checklist me-1"></i> ${lang === 'ta' ? 'அனைத்து திட்ட தகுதிகளையும் பார்க்க' : (lang === 'hi' ? 'सभी योजनाओं की पात्रता देखें' : 'Run Full Scheme Eligibility')}
              </a>
            </div>
          </div>
        </div>

        <!-- Right: Real-time Village Project Progress -->
        <div class="col-lg-7">
          <div class="card-gv h-100">
            <div class="card-header-gv">
              <span class="fw-bold" style="color: var(--color-primary);"><i class="bi bi-buildings me-1 text-success"></i> ${lang === 'ta' ? 'முன்னேற்றத்தில் உள்ள பணிகள் (13 நிலைகள்)' : (lang === 'hi' ? 'प्रगतिरत विकास कार्य (13 चरण)' : 'Active Village Works (13 Stages)')}</span>
              <a href="/projects" class="small text-decoration-none fw-semibold" style="color: var(--color-primary);">${lang === 'ta' ? 'அனைத்தும்' : (lang === 'hi' ? 'सभी देखें' : 'All Projects')} &rarr;</a>
            </div>
            <div class="card-body-gv">
              <div id="home-projects-list" class="d-flex flex-column gap-3">
                <div class="text-center py-4 text-muted small">
                  <div class="spinner-border spinner-border-sm text-primary mb-1"></div>
                  <div>${lang === 'ta' ? 'திட்டங்கள் ஏற்றப்படுகிறது...' : 'Loading projects...'}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;

  // Attach Navigation & Speaker Click Handlers for the 6 Picture Cards
  container.querySelectorAll(".picture-card-item").forEach(card => {
    // Whole card click navigates to route
    card.addEventListener("click", (e) => {
      // If speaker button was clicked, don't navigate
      if (e.target.closest(".btn-speak-card")) return;
      const targetRoute = card.getAttribute("data-route");
      if (targetRoute) {
        window.history.pushState({}, "", targetRoute);
        window.dispatchEvent(new PopStateEvent("popstate"));
      }
    });

    // Enter key navigation for accessibility
    card.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        const targetRoute = card.getAttribute("data-route");
        if (targetRoute) {
          window.history.pushState({}, "", targetRoute);
          window.dispatchEvent(new PopStateEvent("popstate"));
        }
      }
    });
  });

  // Attach Speaker Buttons inside Picture Cards
  container.querySelectorAll(".btn-speak-card").forEach(btn => {
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      const title = btn.getAttribute("data-title") || "";
      const desc = btn.getAttribute("data-desc") || "";
      const textToSpeak = `${title}. ${desc}`;

      // Toggle speaking state
      if (btn.classList.contains("speaking")) {
        stopAllAudio();
        btn.classList.remove("speaking");
        btn.innerHTML = `<i class="bi bi-volume-up-fill"></i>`;
      } else {
        // Reset other speaker buttons
        container.querySelectorAll(".btn-speak-card").forEach(b => {
          b.classList.remove("speaking");
          b.innerHTML = `<i class="bi bi-volume-up-fill"></i>`;
        });
        btn.classList.add("speaking");
        btn.innerHTML = `<i class="bi bi-stop-circle-fill"></i>`;
        playVoiceAudio(textToSpeak, lang, () => {
          btn.classList.remove("speaking");
          btn.innerHTML = `<i class="bi bi-volume-up-fill"></i>`;
        });
      }
    });
  });

  // Fetch Live RSS News & Real-time KPI Stats
  let combinedNews = [];
  try {
    const [schemes, projects, reports, liveNewsData] = await Promise.all([
      api.get("/api/schemes").catch(() => []),
      api.get("/api/projects").catch(() => []),
      api.get("/api/reports").catch(() => []),
      api.get(`/api/announcements/live-news?lang=${lang}&village=${encodeURIComponent(rawVillage)}`).catch(() => ({ items: [] }))
    ]);

    // Update KPI badges
    const statSchemes = document.getElementById("stat-schemes");
    if (statSchemes) statSchemes.textContent = schemes.length || 6;
    const statProjects = document.getElementById("stat-projects");
    if (statProjects) statProjects.textContent = projects.length || 4;
    const statReports = document.getElementById("stat-reports");
    if (statReports) statReports.textContent = reports.length || 3;
    const statAnn = document.getElementById("stat-announcements");
    if (statAnn) statAnn.textContent = (liveNewsData.official_count || 2);

    // Render Recent Projects (Top 3)
    const listEl = document.getElementById("home-projects-list");
    if (listEl && projects.length) {
      listEl.innerHTML = projects.slice(0, 3).map(p => {
        const title = localizeField(p, "title");
        const stageName = t("stage_" + p.current_stage, p.current_stage);
        return `
          <div class="p-3 rounded border bg-white shadow-xs">
            <div class="d-flex justify-content-between align-items-center mb-1">
              <span class="badge bg-light text-dark border font-monospace" style="font-size: 0.72rem;">${p.code}</span>
              <span class="badge ${p.progress_percentage >= 70 ? 'bg-success' : 'bg-primary'}">${p.progress_percentage}% ${lang === 'ta' ? 'நிறைவு' : (lang === 'hi' ? 'पूर्ण' : 'Done')}</span>
            </div>
            <h6 class="fw-bold mb-1 text-dark" style="font-size: 0.95rem;">${title}</h6>
            <div class="d-flex justify-content-between align-items-center small text-muted mb-2">
              <span>${lang === 'ta' ? 'தற்போதைய நிலை' : (lang === 'hi' ? 'वर्तमान चरण' : 'Stage')}: <strong class="text-primary">${stageName}</strong></span>
              <span>₹${(p.sanctioned_budget / 100000).toFixed(1)} L</span>
            </div>
            <div class="progress" style="height: 6px;">
              <div class="progress-bar bg-success" role="progressbar" style="width: ${p.progress_percentage}%;"></div>
            </div>
          </div>
        `;
      }).join("");
    }

    // Render Real Live News Items
    combinedNews = liveNewsData.items || [];
    const newsContainer = document.getElementById("village-news-cards-container");
    if (newsContainer) {
      if (!combinedNews.length) {
        newsContainer.innerHTML = `<div class="p-4 text-center text-muted small">${lang === 'ta' ? 'தற்போது புதிய அறிவிப்புகள் இல்லை.' : (lang === 'hi' ? 'कोई नई सूचना उपलब्ध नहीं है।' : 'No active news alerts.')}</div>`;
      } else {
        newsContainer.innerHTML = combinedNews.slice(0, 8).map((n, idx) => {
          const isOfficial = Boolean(n.is_official);
          const isVoice = Boolean(n.is_voice_broadcast || n.audio_url);
          const prioClass = n.priority === 'emergency' ? 'bg-danger text-white' : (n.priority === 'high' ? 'bg-warning text-dark' : 'bg-success text-white');

          return `
            <div class="p-3 rounded border bg-white shadow-xs position-relative news-card-item" data-idx="${idx}">
              <div class="d-flex flex-wrap align-items-center justify-content-between gap-2 mb-2">
                <div class="d-flex align-items-center gap-2">
                  <span class="badge ${prioClass} text-uppercase" style="font-size: 0.72rem;">${n.priority}</span>
                  ${isOfficial ? `
                    <span class="badge" style="background-color: var(--color-primary); color: var(--color-champagne); font-size: 0.72rem;">
                      <i class="bi bi-patch-check-fill me-1"></i> ${lang === 'ta' ? 'அதிகாரப்பூர்வ அறிவிப்பு' : (lang === 'hi' ? 'आधिकारिक सूचना' : 'Official Alert')}
                    </span>
                  ` : `
                    <span class="badge bg-secondary text-white" style="font-size: 0.72rem;">
                      <i class="bi bi-newspaper me-1"></i> ${lang === 'ta' ? 'நேரலை செய்தி' : (lang === 'hi' ? 'लाइव समाचार' : 'Live News')}
                    </span>
                  `}
                  ${isVoice ? `
                    <span class="badge bg-primary text-white" style="font-size: 0.72rem;">
                      <i class="bi bi-mic-fill me-1"></i> ${lang === 'ta' ? 'குரல் பதிவு' : 'Voice'}
                    </span>
                  ` : ''}
                  <span class="small text-muted font-monospace"><i class="bi bi-clock me-1"></i>${n.published_at || 'நேரலை'}</span>
                </div>

                <!-- Individual Card Listen Button -->
                <button class="btn btn-sm btn-outline-success btn-listen-single py-1 px-3 fw-semibold" data-idx="${idx}">
                  <i class="bi bi-volume-up-fill me-1"></i> ${lang === 'ta' ? 'கேள்' : (lang === 'hi' ? 'सुनें' : 'Listen')}
                </button>
              </div>

              <h6 class="fw-bold mb-1 text-dark" style="font-size: 1.02rem; line-height: 1.4;">${n.title}</h6>
              ${n.body && n.body !== n.title ? `<p class="small text-muted mb-2">${n.body}</p>` : ''}

              <div class="d-flex align-items-center justify-content-between pt-2 border-top text-secondary small" style="font-size: 0.78rem;">
                <span><i class="bi bi-newspaper me-1"></i> <strong>${n.source}</strong></span>
                ${n.link ? `<a href="${n.link}" target="_blank" rel="noopener noreferrer" class="text-decoration-none fw-semibold" style="color: var(--color-primary);">${lang === 'ta' ? 'முழு செய்தி' : (lang === 'hi' ? 'पूरी खबर' : 'Read Source')} &rarr;</a>` : `<span><i class="bi bi-geo-alt me-1"></i> ${n.target_area || localizedVillage}</span>`}
              </div>
            </div>
          `;
        }).join("");
      }
    }

    // Attach individual listen handlers
    container.querySelectorAll(".btn-listen-single").forEach(btn => {
      btn.addEventListener("click", (e) => {
        const idx = parseInt(e.currentTarget.getAttribute("data-idx"));
        const item = combinedNews[idx];
        if (item) {
          const textToSpeak = item.speech_text || `${item.title}. ${item.body}`;
          playVoiceAudio(textToSpeak, lang, () => {
            btn.innerHTML = `<i class="bi bi-volume-up-fill me-1"></i> ${lang === 'ta' ? 'கேள்' : 'Listen'}`;
            btn.className = "btn btn-sm btn-outline-success btn-listen-single py-1 px-3 fw-semibold";
          });
          btn.innerHTML = `<i class="bi bi-stop-circle-fill me-1"></i> ${lang === 'ta' ? 'நிறுத்து' : 'Stop'}`;
          btn.className = "btn btn-sm btn-danger btn-listen-single py-1 px-3 fw-semibold";
        }
      });
    });

    // 3-LAYER RESILIENT AUTO-VOICE TRIGGER
    if (combinedNews.length > 0) {
      const topNews = combinedNews[0];
      const intro = lang === 'ta' ? `வணக்கம் ${localizedName}. உங்கள் கிராம விகாஸ் நேரலை செய்தி.` : (lang === 'hi' ? `नमस्ते ${localizedName}. ग्राम विकास लाइव समाचार.` : `Hello ${localizedName}. Gramvikas Live Alert.`);
      const speechText = `${intro} ${topNews.speech_text || topNews.title}`;

      setTimeout(() => {
        startResilientAutoVoice(speechText, lang);
      }, 350);
    }

  } catch (err) {
    console.warn("Home dashboard data load note:", err);
  }

  // Master Sound Toggle Handler
  const masterBtn = document.getElementById("btn-master-voice-toggle");
  const pulseIndicator = document.getElementById("voice-indicator-pulse");
  const toggleLabel = document.getElementById("voice-toggle-label");

  masterBtn?.addEventListener("click", () => {
    if (isAudioPlaying) {
      stopAllAudio();
      updateMasterButtonUI(false);
      showToast(lang === 'ta' ? 'ஒலி நிறுத்தப்பட்டது.' : (lang === 'hi' ? 'ऑडियो रोक दिया गया।' : 'Voice readout muted.'), 'info');
    } else {
      if (combinedNews.length > 0) {
        const item = combinedNews[0];
        const speechText = item.speech_text || `${item.title}. ${item.body}`;
        playVoiceAudio(speechText, lang);
        updateMasterButtonUI(true);
      }
    }
  });

  // Autoplay banner button click
  const unlockBanner = document.getElementById("voice-autoplay-banner");
  const unlockBannerBtn = document.getElementById("btn-unlock-banner-play");
  const triggerBannerPlay = () => {
    if (combinedNews.length > 0) {
      const topNews = combinedNews[0];
      const intro = lang === 'ta' ? `வணக்கம் ${localizedName}. உங்கள் கிராம விகாஸ் நேரலை செய்தி.` : `Hello ${localizedName}. Gramvikas Live Alert.`;
      const speechText = `${intro} ${topNews.speech_text || topNews.title}`;
      playVoiceAudio(speechText, lang);
      if (unlockBanner) unlockBanner.style.display = "none";
    }
  };
  unlockBanner?.addEventListener("click", triggerBannerPlay);
  unlockBannerBtn?.addEventListener("click", (e) => {
    e.stopPropagation();
    triggerBannerPlay();
  });

  function updateMasterButtonUI(playing) {
    isAudioPlaying = playing;
    if (masterBtn) {
      if (playing) {
        masterBtn.className = "btn btn-success fw-bold px-3 py-2 shadow-sm";
        if (pulseIndicator) pulseIndicator.style.display = "inline-block";
        if (toggleLabel) toggleLabel.textContent = lang === 'ta' ? '🔊 குரல் ஒலிக்கிறது - நிறுத்தவும்' : (lang === 'hi' ? '🔊 ऑडियो चल रहा है - रोकें' : '🔊 Voice Playing — Tap to Mute');
      } else {
        masterBtn.className = "btn btn-outline-secondary fw-bold px-3 py-2 shadow-sm";
        if (pulseIndicator) pulseIndicator.style.display = "none";
        if (toggleLabel) toggleLabel.textContent = lang === 'ta' ? '🔊 குரல் வழி செய்தி கேட்க அழுத்தவும்' : (lang === 'hi' ? '🔊 वॉयस समाचार सुनें' : '🔊 Listen Voice News');
      }
    }
  }

  function stopAllAudio() {
    if (activeAudioStream) {
      try {
        activeAudioStream.pause();
        activeAudioStream.currentTime = 0;
      } catch (e) {}
      activeAudioStream = null;
    }
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    isAudioPlaying = false;
    updateMasterButtonUI(false);
  }

  /**
   * 3-Layer Resilient Voice Auto-Player:
   * Layer 1: Attempt direct Audio play.
   * Layer 2: If browser blocks with NotAllowedError, display Champagne prompt banner.
   * Layer 3: Register a 1-time interaction listener on window/document so first tap immediately plays.
   */
  function startResilientAutoVoice(text, speechLang) {
    if (autoVoiceTriggered) return;
    autoVoiceTriggered = true;

    const audioUrl = `/api/voice/audio-stream?text=${encodeURIComponent(text)}&lang=${speechLang === 'hi' ? 'hi' : (speechLang === 'en' ? 'en' : 'ta')}`;
    activeAudioStream = new Audio(audioUrl);

    activeAudioStream.play().then(() => {
      // Autoplay succeeded!
      updateMasterButtonUI(true);
      if (unlockBanner) unlockBanner.style.display = "none";
    }).catch(err => {
      console.log("[Autoplay Policy Triggered]:", err.message);
      updateMasterButtonUI(false);

      // Show gentle pulsing banner
      if (unlockBanner) unlockBanner.style.display = "flex";

      // Register 1-time global tap to immediately start audio on first touch
      const onUserFirstGesture = () => {
        window.removeEventListener("pointerdown", onUserFirstGesture);
        window.removeEventListener("click", onUserFirstGesture);
        window.removeEventListener("keydown", onUserFirstGesture);

        if (unlockBanner) unlockBanner.style.display = "none";

        if (!isAudioPlaying) {
          playVoiceAudio(text, speechLang);
        }
      };

      window.addEventListener("pointerdown", onUserFirstGesture, { once: true });
      window.addEventListener("click", onUserFirstGesture, { once: true });
      window.addEventListener("keydown", onUserFirstGesture, { once: true });
    });

    activeAudioStream.onended = () => {
      updateMasterButtonUI(false);
    };
  }

  function playVoiceAudio(text, speechLang, onCompleteCallback = null) {
    stopAllAudio();
    const audioUrl = `/api/voice/audio-stream?text=${encodeURIComponent(text)}&lang=${speechLang === 'hi' ? 'hi' : (speechLang === 'en' ? 'en' : 'ta')}`;
    activeAudioStream = new Audio(audioUrl);

    activeAudioStream.play().then(() => {
      updateMasterButtonUI(true);
    }).catch(err => {
      // SpeechSynthesis Fallback if streaming endpoint is unreachable
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
        const ut = new SpeechSynthesisUtterance(text);
        ut.lang = speechLang === 'hi' ? 'hi-IN' : (speechLang === 'en' ? 'en-IN' : 'ta-IN');
        ut.rate = 0.95;
        ut.onstart = () => updateMasterButtonUI(true);
        ut.onend = () => {
          updateMasterButtonUI(false);
          if (onCompleteCallback) onCompleteCallback();
        };
        ut.onerror = () => {
          updateMasterButtonUI(false);
          if (onCompleteCallback) onCompleteCallback();
        };
        window.speechSynthesis.speak(ut);
      }
    });

    activeAudioStream.onended = () => {
      updateMasterButtonUI(false);
      if (onCompleteCallback) onCompleteCallback();
    };

    activeAudioStream.onerror = () => {
      // Fallback to Web Speech Synthesis
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
        const ut = new SpeechSynthesisUtterance(text);
        ut.lang = speechLang === 'hi' ? 'hi-IN' : (speechLang === 'en' ? 'en-IN' : 'ta-IN');
        ut.rate = 0.95;
        ut.onstart = () => updateMasterButtonUI(true);
        ut.onend = () => {
          updateMasterButtonUI(false);
          if (onCompleteCallback) onCompleteCallback();
        };
        window.speechSynthesis.speak(ut);
      }
    };
  }
}

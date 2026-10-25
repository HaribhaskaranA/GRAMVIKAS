/**
 * GRAMVIKAS AI - User Profile, Accessibility Preferences & Help Directory View (/profile & /help).
 * 100% Multilingual in Tamil (ta), Hindi (hi), and English (en).
 */

import { api } from "../api.js";
import { auth } from "../auth.js";
import { setLanguage, getLanguage, t } from "../i18n.js";
import { showToast } from "../components/toast.js";

export async function renderProfile(container) {
  const isHelpRoute = window.location.pathname === "/help";
  if (isHelpRoute) {
    return renderHelpDirectory(container);
  }

  const lang = getLanguage();
  const user = auth.getUser();
  const profile = user?.citizen_profile || user?.official_profile || {};
  const isCitizen = user?.role === "citizen";

  container.innerHTML = `
    <div class="row justify-content-center">
      <div class="col-lg-8">
        <div class="d-flex align-items-center justify-content-between mb-3">
          <div>
            <h3 class="fw-bold mb-1" style="color: var(--color-navy);"><i class="bi bi-person-circle me-2 text-primary"></i> ${lang === 'ta' ? 'சுயவிவரம் மற்றும் அமைப்புகள்' : (lang === 'hi' ? 'प्रोफ़ाइल व प्राथमिकताएं' : 'Citizen Profile & Preferences')}</h3>
            <p class="text-muted small mb-0">${lang === 'ta' ? 'உங்கள் தகுதி அளவுகோல்கள் மற்றும் அணுகல்தன்மை விருப்பங்களை நிர்வகிக்கவும்.' : 'Manage your household eligibility attributes and accessibility settings.'}</p>
          </div>
          <span class="badge ${user?.role === 'official' ? 'bg-primary' : (user?.role === 'admin' ? 'bg-danger' : 'bg-success')} text-uppercase">
            ${t('role_' + (user?.role || 'citizen'))}
          </span>
        </div>

        <div class="card-gv p-4 mb-4">
          <form id="form-update-profile" class="d-flex flex-column gap-3">
            <h5 class="fw-bold mb-1 text-dark">${lang === 'ta' ? 'தனிநபர் தகவல்' : 'Personal Information'}</h5>
            <div class="row g-3">
              <div class="col-md-6">
                <label class="form-label small fw-semibold">${lang === 'ta' ? 'முழு பெயர்' : 'Full Name'}</label>
                <input type="text" class="form-control form-control-sm" id="prof-name" value="${user?.full_name || ''}" required>
              </div>
              <div class="col-md-6">
                <label class="form-label small fw-semibold">${lang === 'ta' ? 'மின்னஞ்சல்' : 'Registered Email'}</label>
                <input type="email" class="form-control form-control-sm" value="${user?.email || ''}" disabled>
              </div>
            </div>

            <div class="row g-3">
              <div class="col-md-6">
                <label class="form-label small fw-semibold">${lang === 'ta' ? 'தொடர்பு தொலைபேசி' : 'Contact Phone'}</label>
                <input type="tel" class="form-control form-control-sm" id="prof-phone" value="${user?.phone || ''}">
              </div>
              <div class="col-md-6">
                <label class="form-label small fw-semibold">${lang === 'ta' ? 'விருப்ப மொழி' : 'Preferred Language'}</label>
                <select class="form-select form-select-sm" id="prof-lang">
                  <option value="ta" ${lang === 'ta' ? 'selected' : ''}>தமிழ் (Tamil)</option>
                  <option value="en" ${lang === 'en' ? 'selected' : ''}>English</option>
                  <option value="hi" ${lang === 'hi' ? 'selected' : ''}>हिन्दी (Hindi)</option>
                </select>
              </div>
            </div>

            ${isCitizen ? `
              <h5 class="fw-bold mb-1 mt-3 text-dark pt-3 border-top">${lang === 'ta' ? 'அரசு நலத்திட்ட தகுதி அளவுகோல்கள்' : 'Welfare Eligibility Parameters'}</h5>
              <div class="row g-3">
                <div class="col-md-4">
                  <label class="form-label small fw-semibold">${lang === 'ta' ? 'கிராமம்' : 'Village'}</label>
                  <input type="text" class="form-control form-control-sm" id="prof-village" value="${profile.village || 'Melmaruvathur'}">
                </div>
                <div class="col-md-4">
                  <label class="form-label small fw-semibold">${lang === 'ta' ? 'வட்டாரம்' : 'Block'}</label>
                  <input type="text" class="form-control form-control-sm" id="prof-block" value="${profile.block || 'Cheyyur'}">
                </div>
                <div class="col-md-4">
                  <label class="form-label small fw-semibold">${lang === 'ta' ? 'மாவட்டம்' : 'District'}</label>
                  <input type="text" class="form-control form-control-sm" id="prof-district" value="${profile.district || 'Chengalpattu'}">
                </div>
              </div>

              <div class="row g-3">
                <div class="col-md-4">
                  <label class="form-label small fw-semibold">${lang === 'ta' ? 'வயது' : 'Age'}</label>
                  <input type="number" class="form-control form-control-sm" id="prof-age" value="${profile.age || 42}">
                </div>
                <div class="col-md-4">
                  <label class="form-label small fw-semibold">${lang === 'ta' ? 'ஆண்டு குடும்ப வருமானம் (₹)' : 'Annual Income (₹)'}</label>
                  <input type="number" class="form-control form-control-sm" id="prof-income" value="${profile.annual_income || 75000}">
                </div>
                <div class="col-md-4">
                  <label class="form-label small fw-semibold">${lang === 'ta' ? 'நில உரிமை (ஏக்கர்)' : 'Landholding (Acres)'}</label>
                  <input type="number" step="0.1" class="form-control form-control-sm" id="prof-land" value="${profile.landholding_acres || 1.8}">
                </div>
              </div>

              <div class="row g-3">
                <div class="col-md-6">
                  <label class="form-label small fw-semibold">${lang === 'ta' ? 'முதன்மைத் தொழில்' : 'Primary Occupation'}</label>
                  <select class="form-select form-select-sm" id="prof-occupation">
                    <option value="farmer" ${profile.occupation === 'farmer' ? 'selected' : ''}>${lang === 'ta' ? 'விவசாயி' : 'Farmer'}</option>
                    <option value="daily_wage" ${profile.occupation === 'daily_wage' ? 'selected' : ''}>${lang === 'ta' ? 'கூலித் தொழிலாளி' : 'Daily Wage Worker'}</option>
                    <option value="student" ${profile.occupation === 'student' ? 'selected' : ''}>${lang === 'ta' ? 'மாணவர்' : 'Student'}</option>
                    <option value="artisan" ${profile.occupation === 'artisan' ? 'selected' : ''}>${lang === 'ta' ? 'கைவினைஞர்' : 'Artisan / Weaver'}</option>
                    <option value="unemployed" ${profile.occupation === 'unemployed' ? 'selected' : ''}>${lang === 'ta' ? 'வேலையற்றவர்' : 'Unemployed'}</option>
                  </select>
                </div>
                <div class="col-md-6">
                  <label class="form-label small fw-semibold">${lang === 'ta' ? 'குடும்ப அட்டை வகை' : 'Ration Card Type'}</label>
                  <select class="form-select form-select-sm" id="prof-ration">
                    <option value="PHH" ${profile.ration_card_type === 'PHH' ? 'selected' : ''}>PHH (முன்னுரிமை குடும்ப அட்டை)</option>
                    <option value="AAY" ${profile.ration_card_type === 'AAY' ? 'selected' : ''}>AAY (அந்தியோதயா அன்ன யோஜனா)</option>
                    <option value="NPHH" ${profile.ration_card_type === 'NPHH' ? 'selected' : ''}>NPHH (முன்னுரிமையற்ற அட்டை)</option>
                  </select>
                </div>
              </div>
            ` : ''}

            <div class="pt-3 border-top mt-2">
              <button type="submit" class="btn btn-gv-primary">
                <i class="bi bi-save me-1"></i> ${lang === 'ta' ? 'சுயவிவரத்தை சேமி' : 'Save Profile Changes'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  `;

  document.getElementById("form-update-profile")?.addEventListener("submit", async (e) => {
    e.preventDefault();
    try {
      const payload = {
        full_name: document.getElementById("prof-name").value,
        phone: document.getElementById("prof-phone").value,
        preferred_language: document.getElementById("prof-lang").value
      };

      if (isCitizen) {
        payload.village = document.getElementById("prof-village").value;
        payload.block = document.getElementById("prof-block").value;
        payload.district = document.getElementById("prof-district").value;
        payload.age = parseInt(document.getElementById("prof-age").value);
        payload.annual_income = parseFloat(document.getElementById("prof-income").value);
        payload.landholding_acres = parseFloat(document.getElementById("prof-land").value);
        payload.occupation = document.getElementById("prof-occupation").value;
        payload.ration_card_type = document.getElementById("prof-ration").value;
      }

      const res = await api.put("/api/auth/profile", payload);
      if (payload.preferred_language !== lang) {
        setLanguage(payload.preferred_language);
      }
      showToast(lang === 'ta' ? "சுயவிவரம் வெற்றிகரமாக புதுப்பிக்கப்பட்டது!" : "Profile updated successfully!", "success");
      renderProfile(container);
    } catch (err) {
      alert("Update failed: " + err.message);
    }
  });
}

/**
 * Help & Accessibility Directory View (/help)
 */
function renderHelpDirectory(container) {
  const lang = getLanguage();
  const user = auth.getUser();

  const faqs = [
    {
      id: "faq-eligibility",
      q_en: "How do I check my eligibility for Government Welfare Schemes?",
      q_ta: "அரசு நலத்திட்டங்களுக்கான எனது தகுதியை எவ்வாறு சரிபார்ப்பது?",
      q_hi: "मैं सरकारी कल्याणकारी योजनाओं के लिए अपनी पात्रता कैसे जांचूं?",
      a_en: "Navigate to 'Government Schemes' (/schemes) from the menu. Our rule-engine automatically checks your landholding, occupation, annual income, and age against eligibility criteria. You can also click 'Run Eligibility Check' for instant recommendations.",
      a_ta: "பட்டி மெனுவில் உள்ள 'அரசு நலத்திட்டங்கள்' (/schemes) பகுதிக்குச் செல்லவும். உங்கள் நில உரிமை, தொழில், ஆண்டு வருமானம் மற்றும் வயது விவரங்களை தானியங்கி விதிமுறை இயந்திரம் பரிசீலித்து, நீங்கள் தகுதியான திட்டங்களை உடனுக்குடன் காட்டும்.",
      a_hi: "'सरकारी योजनाएं' (/schemes) पर जाएं। हमारा सिस्टम आपकी जोत, व्यवसाय और आय के आधार पर स्वतः पात्रता की जांच करके उपयुक्त योजनाएं दिखाता है।"
    },
    {
      id: "faq-keypad",
      q_en: "How can elderly citizens without smartphones receive village updates?",
      q_ta: "ஸ்மார்ட்போன் இல்லாத முதியவர்கள் மற்றும் பொதுமக்கள் எவ்வாறு கிராம செய்திகளை பெறுவது?",
      q_hi: "बिना स्मार्टफोन वाले नागरिक गांव के समाचार कैसे प्राप्त कर सकते हैं?",
      a_en: "Visit the 'Automated Voice Service' (/voice-service) page and register the mobile phone number. Our automated telephony system broadcasts official village news, Gram Sabha meetings, and weather warnings via direct phone calls in Tamil and Hindi.",
      a_ta: "'குரல் வழி சேவை' (/voice-service) பக்கத்திற்குச் சென்று சாதாரண பட்டன் போன் எண்ணை பதிவு செய்யவும். ஊராட்சி தலைவர் அல்லது BDO வெளியிடும் முக்கிய செய்திகள் மற்றும் வானிலை எச்சரிக்கைகள் நேரடியாக தொலைபேசி அழைப்பு மூலமாக வாசித்து கேட்கப்படும்.",
      a_hi: "'वॉयस सेवा' (/voice-service) पर अपना नंबर दर्ज करें। सरकारी घोषणाएं और मौसम की चेतावनी सीधे फोन कॉल के माध्यम से बोलकर सुनाई जाएगी।"
    },
    {
      id: "faq-crop-doctor",
      q_en: "How do I use the AI Crop Doctor to test diseased plant leaves?",
      q_ta: "பயிர் மருத்துவர் AI மூலம் நோய்வாய்ப்பட்ட இலைகளை எவ்வாறு பரிசோதிப்பது?",
      q_hi: "फसल रोग डॉक्टर एआई का उपयोग कैसे करें?",
      a_en: "Click 'AI Crop Doctor' (/crop-doctor). Upload or snap a clear photo of the diseased leaf from your camera. The agricultural pathology AI identifies the exact fungal/bacterial disease, provides organic and chemical solutions, and reads the diagnosis aloud.",
      a_ta: "'பயிர் மருத்துவர் AI' (/crop-doctor) பக்கத்திற்குச் செல்லவும். பாதிக்கப்பட்ட இலையை கேமரா மூலம் புகைப்படம் எடுக்கவும். AI உடனடியாக நோயின் பெயர், இயற்கை நிவாரணம் மற்றும் ரசாயன மருந்து அளவுகளை தமிழ் குரல் வழியிலும் விளக்கும்.",
      a_hi: "'फसल डॉक्टर' (/crop-doctor) पर जाकर पत्ती का फोटो खींचें। एआई तुरंत रोग की पहचान कर जैविक व रासायनिक उपचार ऑडियो में सुनाएगा।"
    },
    {
      id: "faq-grievance",
      q_en: "How do I report a broken handpump or street light issue?",
      q_ta: "பழுதடைந்த கைபம்பு அல்லது தெருவிளக்கு பிரச்சனையை எவ்வாறு புகாரளிப்பது?",
      q_hi: "टूटे हैंडपंप या स्ट्रीटलाइट की शिकायत कैसे दर्ज करें?",
      a_en: "Go to 'Report Village Issue' (/report-issue). Select the category, enter landmark details, capture GPS coordinates with 1-tap, and submit. You receive a unique Reference ID (e.g., GV-REP-...) that tracks resolution across 6 official stages.",
      a_ta: "'புகார் பதிவு செய்' (/report-issue) பக்கத்திற்குச் சென்று வகையை தேர்வு செய்து, ஜிபிஎஸ் இருப்பிடத்தை இணைத்து சமர்ப்பிக்கவும். உங்களுக்கு வழங்கப்படும் குறிப்பு எண்ணை (Ref ID) வைத்து 6 கட்ட தீர்வு நிலைகளை கண்காணிக்கலாம்.",
      a_hi: "'समस्या दर्ज करें' (/report-issue) में जाकर जीपीएस लोकेशन के साथ शिकायत भेजें और मिले संदर्भ संख्या से समाधान ट्रैक करें।"
    }
  ];

  container.innerHTML = `
    <div class="row justify-content-center">
      <div class="col-lg-9 d-flex flex-column gap-4">
        <div>
          <h3 class="fw-bold mb-1" style="color: var(--color-navy);"><i class="bi bi-question-circle-fill me-2 text-warning"></i> ${lang === 'ta' ? 'உதவி, அடிக்கடி கேட்கப்படும் கேள்விகள் & ஆதரவு மையம்' : (lang === 'hi' ? 'सहायता, अक्सर पूछे जाने वाले प्रश्न एवं सपोर्ट' : 'Help, FAQ & Support System')}</h3>
          <p class="text-muted small mb-0">${lang === 'ta' ? 'கிராம விகாஸ் தளத்தை தடையின்றி பயன்படுத்த உதவும் வழிகாட்டுதல்கள் மற்றும் அதிகாரப்பூர்வ ஆதரவு மையம்.' : 'Comprehensive user guide, frequently asked questions, and official ticket-based technical support.'}</p>
        </div>

        <!-- FEATURE 2: INTEGRATED SUPPORT SYSTEM & REPORT A PROBLEM SECTION -->
        <div class="card-gv p-4 border-2 border-primary-subtle shadow-sm">
          <div class="d-flex flex-wrap align-items-center justify-content-between gap-3 mb-3 pb-2 border-bottom">
            <div>
              <h5 class="fw-bold mb-1 text-dark">
                <i class="bi bi-headset text-primary me-2"></i>
                ${lang === 'ta' ? 'ஆதரவு மையம் / சிக்கலை புகாரளிக்கவும் (Support Desk)' : (lang === 'hi' ? 'सपोर्ट डेस्क / समस्या दर्ज करें' : 'Support Desk & Problem Reporting')}
              </h5>
              <p class="small text-muted mb-0">
                ${lang === 'ta' ? 'தொழில்நுட்ப சிக்கல்கள், கணக்கு அல்லது பக்க பிழைகள் குறித்து அதிகாரப்பூர்வ ஆதரவு டிக்கெட் சமர்ப்பிக்கலாம்.' : 'Submit a direct ticket to administrators for bugs, account issues, or feature help.'}
              </p>
            </div>
            <ul class="nav nav-pills gap-1" id="support-subtabs">
              <li class="nav-item">
                <button class="nav-link active btn-sm" id="tab-new-ticket">
                  <i class="bi bi-plus-circle me-1"></i> ${lang === 'ta' ? 'புதிய ஆதரவு டிக்கெட்' : 'New Ticket'}
                </button>
              </li>
              <li class="nav-item">
                <button class="nav-link btn-sm position-relative" id="tab-my-tickets">
                  <i class="bi bi-inbox-fill me-1"></i> ${lang === 'ta' ? 'எனது ஆதரவு டிக்கெட்டுகள்' : 'My Tickets'}
                  <span class="badge bg-danger ms-1" id="badge-my-tickets-count" style="display: none;">0</span>
                </button>
              </li>
            </ul>
          </div>

          <!-- Alert for generated ticket confirmation -->
          <div id="support-success-alert" class="alert alert-success d-flex align-items-center gap-2 mb-3" style="display: none;">
            <i class="bi bi-check-circle-fill flex-shrink-0" style="font-size: 1.25rem;"></i>
            <div>
              <strong id="support-alert-ticket-id"></strong>
              <div id="support-alert-msg" class="small"></div>
            </div>
          </div>

          <!-- 1. Submit Ticket View -->
          <div id="view-submit-ticket">
            <form id="form-create-support-ticket" class="d-flex flex-column gap-3">
              <!-- Auto User Association -->
              <div class="p-2 bg-light rounded small border d-flex justify-content-between align-items-center">
                <span>
                  <i class="bi bi-person-check-fill text-success me-1"></i>
                  ${lang === 'ta' ? 'பயனர்:' : 'Reporter:'} <strong>${user?.full_name || 'Citizen User'} (${user?.email || 'user@gramvikas.in'})</strong>
                </span>
                <span class="badge bg-secondary">${(user?.role || 'citizen').toUpperCase()}</span>
              </div>

              <!-- Category -->
              <div>
                <label class="form-label small fw-semibold">
                  ${lang === 'ta' ? 'சிக்கலின் வகை (Issue Category):' : (lang === 'hi' ? 'समस्या की श्रेणी:' : 'Issue Category:')}
                </label>
                <select class="form-select form-select-sm" id="support-category" required>
                  <option value="bug">🐛 ${lang === 'ta' ? 'Report a Bug (பிழை புகார்)' : (lang === 'hi' ? 'बग रिपोर्ट (Report a Bug)' : 'Report a Bug')}</option>
                  <option value="technical_issue">⚙️ ${lang === 'ta' ? 'Report a Technical Issue (தொழில்நுட்ப சிக்கல்)' : (lang === 'hi' ? 'तकनीकी समस्या (Technical Issue)' : 'Report a Technical Issue')}</option>
                  <option value="account_login">🔑 ${lang === 'ta' ? 'Report a Login or Account Problem (உள்நுழைவு சிக்கல்)' : (lang === 'hi' ? 'लॉगिन समस्या (Login / Account Issue)' : 'Report a Login or Account Problem')}</option>
                  <option value="broken_feature">⚠️ ${lang === 'ta' ? 'Report an Incorrect Page or Broken Feature (செயலிழப்பு)' : (lang === 'hi' ? 'टूटा हुआ फीचर (Broken Feature)' : 'Report an Incorrect Page or Broken Feature')}</option>
                  <option value="general_help">❓ ${lang === 'ta' ? 'Ask for Help (பொதுவான உதவி கோரல்)' : (lang === 'hi' ? 'सहायता मांगें (Ask for Help)' : 'Ask for Help')}</option>
                </select>
              </div>

              <!-- Title -->
              <div>
                <label class="form-label small fw-semibold">
                  ${lang === 'ta' ? 'சிக்கலின் சுருக்கமான தலைப்பு (Short Title):' : 'Short Issue Title:'}
                </label>
                <input type="text" class="form-control form-control-sm" id="support-title" placeholder="${lang === 'ta' ? 'எ.கா: வரைபடத்தில் பின் சரியாக காட்டப்படவில்லை...' : 'e.g. Page navigation stuck on login...'}" required minlength="5" maxlength="150">
              </div>

              <!-- Description -->
              <div>
                <label class="form-label small fw-semibold">
                  ${lang === 'ta' ? 'விரிவான விவரம் (Detailed Description):' : 'Detailed Description:'}
                </label>
                <textarea class="form-control form-control-sm" id="support-desc" rows="3" placeholder="${lang === 'ta' ? 'நீங்கள் எதிர்கொண்ட சிக்கல், எந்த பக்கத்தில் ஏற்பட்டது மற்றும் பிழை விவரங்களை எழுதுக...' : 'Provide specific details of what happened, page URL, and steps to reproduce...'}" required minlength="10"></textarea>
              </div>

              <!-- Screenshot / Attachment Upload -->
              <div>
                <label class="form-label small fw-semibold d-flex justify-content-between">
                  <span><i class="bi bi-paperclip me-1"></i> ${lang === 'ta' ? 'திரைக்காட்சி / புகைப்பட இணைப்பு (விருப்பத்தேர்வு)' : 'Optional Screenshot / Attachment:'}</span>
                  <span class="text-muted small">Max 10MB (JPG, PNG, WebP)</span>
                </label>
                <input type="file" class="form-control form-control-sm" id="support-file" accept="image/jpeg,image/png,image/webp">
                <div class="mt-2 text-center" id="support-file-preview-wrap" style="display: none;">
                  <img id="support-file-preview" src="" alt="Screenshot Preview" class="img-fluid rounded border shadow-sm" style="max-height: 120px; object-fit: contain;">
                </div>
              </div>

              <div class="d-flex justify-content-between align-items-center pt-2">
                <span class="small text-muted font-monospace"><i class="bi bi-clock me-1"></i> ${new Date().toLocaleDateString()}</span>
                <button type="submit" class="btn btn-gv-primary btn-sm fw-bold px-4" id="btn-submit-support">
                  <i class="bi bi-send-fill me-1"></i> ${lang === 'ta' ? 'ஆதரவு கோரிக்கையை சமர்ப்பி' : 'Submit Support Ticket'}
                </button>
              </div>
            </form>
          </div>

          <!-- 2. My Tickets View -->
          <div id="view-my-tickets" style="display: none;">
            <div id="my-tickets-list-container" class="d-flex flex-column gap-3">
              <div class="text-center py-4 text-muted">
                <div class="spinner-border spinner-border-sm text-primary mb-2"></div>
                <div>${lang === 'ta' ? 'டிக்கெட்டுகள் ஏற்றப்படுகின்றன...' : 'Loading your support tickets...'}</div>
              </div>
            </div>
          </div>
        </div>

        <!-- Localized Expandable FAQ Accordion -->
        <div class="card-gv p-4">
          <div class="d-flex align-items-center justify-content-between mb-3 border-bottom pb-2">
            <h5 class="fw-bold mb-0 text-dark">
              <i class="bi bi-patch-question-fill text-primary me-2"></i>
              ${lang === 'ta' ? 'அடிக்கடி கேட்கப்படும் கேள்விகள் (FAQ)' : (lang === 'hi' ? 'अक्सर पूछे जाने वाले प्रश्न (FAQ)' : 'Frequently Asked Questions (FAQ)')}
            </h5>
            <span class="badge bg-light text-muted border small">${faqs.length} ${lang === 'ta' ? 'கேள்விகள்' : 'Topics'}</span>
          </div>

          <div class="accordion" id="faqAccordion">
            ${faqs.map((faq, idx) => {
              const question = lang === 'ta' ? faq.q_ta : (lang === 'hi' ? faq.q_hi : faq.q_en);
              const answer = lang === 'ta' ? faq.a_ta : (lang === 'hi' ? faq.a_hi : faq.a_en);
              const isFirst = idx === 0;

              return `
                <div class="accordion-item border rounded mb-2 overflow-hidden">
                  <h2 class="accordion-header" id="heading-${faq.id}">
                    <button class="accordion-button ${isFirst ? '' : 'collapsed'} fw-semibold text-dark" type="button" data-bs-toggle="collapse" data-bs-target="#collapse-${faq.id}" aria-expanded="${isFirst ? 'true' : 'false'}" aria-controls="collapse-${faq.id}" style="background: ${isFirst ? '#F8FAFC' : '#FFFFFF'};">
                      <i class="bi bi-chat-left-dots text-primary me-2"></i> ${question}
                    </button>
                  </h2>
                  <div id="collapse-${faq.id}" class="accordion-collapse collapse ${isFirst ? 'show' : ''}" aria-labelledby="heading-${faq.id}" data-bs-parent="#faqAccordion">
                    <div class="accordion-body bg-light-subtle">
                      <p class="mb-3 text-secondary" style="line-height: 1.6;">${answer}</p>
                      <div class="d-flex align-items-center justify-content-between pt-2 border-top">
                        <button class="btn btn-sm btn-outline-success btn-read-faq" data-text="${answer.replace(/"/g, '&quot;')}" title="${lang === 'ta' ? 'பதிலை வாசித்துக் கேட்க' : 'Listen to this answer'}">
                          <i class="bi bi-volume-up-fill me-1"></i> ${lang === 'ta' ? 'பதிலை வாசித்து கேள்' : (lang === 'hi' ? 'उत्तर सुनें' : 'Listen Answer')}
                        </button>
                        <span class="small text-muted font-monospace"><i class="bi bi-shield-check text-success"></i> ${lang === 'ta' ? 'சரிபார்க்கப்பட்ட தகவல்' : 'Verified Guide'}</span>
                      </div>
                    </div>
                  </div>
                </div>
              `;
            }).join("")}
          </div>
        </div>

        <!-- Emergency Helplines -->
        <div class="card-gv p-4">
          <h5 class="fw-bold mb-3 text-dark">${lang === 'ta' ? 'அவசர உதவி எண்கள் (Emergency Helplines)' : 'Important Rural Helpline Numbers'}</h5>
          <ul class="list-group list-group-flush small">
            <li class="list-group-item d-flex justify-content-between align-items-center px-0 py-2">
              <span>${lang === 'ta' ? 'கிராம விகாஸ் கட்டணமில்லா உதவி எண்' : 'GRAMVIKAS Toll-Free Voice Helpline'}:</span>
              <a href="tel:18004251333" class="btn btn-sm btn-outline-primary font-monospace fw-bold">
                <i class="bi bi-telephone-fill me-1"></i> 1800-425-1333
              </a>
            </li>
            <li class="list-group-item d-flex justify-content-between align-items-center px-0 py-2">
              <span>${lang === 'ta' ? 'பிரதம மந்திரி கிசான் உதவி எண்' : 'PM-KISAN Farmer Helpline'}:</span>
              <strong class="text-primary font-monospace">155261</strong>
            </li>
            <li class="list-group-item d-flex justify-content-between align-items-center px-0 py-2">
              <span>${lang === 'ta' ? 'பேரிடர் அவசர கட்டுப்பாட்டு அறை' : 'Disaster Management Control Room'}:</span>
              <strong class="text-danger font-monospace">1077</strong>
            </li>
          </ul>
        </div>
      </div>
    </div>
  `;

  // Subtab switching
  const tabNew = document.getElementById("tab-new-ticket");
  const tabMy = document.getElementById("tab-my-tickets");
  const viewSubmit = document.getElementById("view-submit-ticket");
  const viewMy = document.getElementById("view-my-tickets");

  tabNew?.addEventListener("click", () => {
    tabNew.classList.add("active");
    tabMy?.classList.remove("active");
    if (viewSubmit) viewSubmit.style.display = "block";
    if (viewMy) viewMy.style.display = "none";
  });

  tabMy?.addEventListener("click", () => {
    tabMy.classList.add("active");
    tabNew?.classList.remove("active");
    if (viewSubmit) viewSubmit.style.display = "none";
    if (viewMy) viewMy.style.display = "block";
    loadMyTickets();
  });

  // Screenshot preview
  document.getElementById("support-file")?.addEventListener("change", (e) => {
    const file = e.target.files?.[0];
    const previewWrap = document.getElementById("support-file-preview-wrap");
    const previewImg = document.getElementById("support-file-preview");
    if (file && previewWrap && previewImg) {
      const reader = new FileReader();
      reader.onload = (event) => {
        previewImg.src = event.target.result;
        previewWrap.style.display = "block";
      };
      reader.readAsDataURL(file);
    }
  });

  // Submit Support Ticket Form
  document.getElementById("form-create-support-ticket")?.addEventListener("submit", async (e) => {
    e.preventDefault();
    const cat = document.getElementById("support-category").value;
    const title = document.getElementById("support-title").value.trim();
    const desc = document.getElementById("support-desc").value.trim();
    const fileInput = document.getElementById("support-file");
    const file = fileInput?.files?.[0];

    const submitBtn = document.getElementById("btn-submit-support");
    const origBtnText = submitBtn.innerHTML;
    submitBtn.disabled = true;
    submitBtn.innerHTML = `<span class="spinner-border spinner-border-sm me-1"></span> ${lang === 'ta' ? 'பதிவாகிறது...' : 'Submitting...'}`;

    try {
      let attachmentUrl = null;
      if (file) {
        const formData = new FormData();
        formData.append("file", file);
        const upRes = await api.postFormData("/api/support/upload-attachment", formData);
        attachmentUrl = upRes.url;
      }

      const ticket = await api.post("/api/support/tickets", {
        category: cat,
        title: title,
        description: desc,
        attachment_url: attachmentUrl
      });

      // Show confirmation alert
      const alertBox = document.getElementById("support-success-alert");
      const alertId = document.getElementById("support-alert-ticket-id");
      const alertMsg = document.getElementById("support-alert-msg");
      if (alertBox && alertId && alertMsg) {
        alertId.textContent = `${lang === 'ta' ? 'ஆதரவு டிக்கெட் பதிவு செய்யப்பட்டது! எண்:' : 'Support Ticket Created! ID:'} ${ticket.ticket_number}`;
        alertMsg.textContent = lang === 'ta' ?
          "உங்கள் கோரிக்கை மாநில நிர்வாக உதவி மையத்திற்கு அனுப்பப்பட்டுள்ளது. 'எனது ஆதரவு டிக்கெட்டுகள்' பகுதியில் தீர்வு நிலையை கண்காணிக்கலாம்." :
          "Your support ticket has been received by administrative engineers. You can track progress and reply under 'My Tickets'.";
        alertBox.style.display = "flex";
        alertBox.scrollIntoView({ behavior: "smooth" });
      }

      showToast(lang === 'ta' ? `டிக்கெட் ${ticket.ticket_number} பதிவானது!` : `Ticket ${ticket.ticket_number} created!`, "success");

      // Reset form
      document.getElementById("support-title").value = "";
      document.getElementById("support-desc").value = "";
      if (fileInput) fileInput.value = "";
      document.getElementById("support-file-preview-wrap").style.display = "none";

      // Update badge count
      loadMyTicketsCount();
    } catch (err) {
      alert("Ticket submission failed: " + err.message);
    } finally {
      submitBtn.disabled = false;
      submitBtn.innerHTML = origBtnText;
    }
  });

  async function loadMyTicketsCount() {
    try {
      const tickets = await api.get("/api/support/tickets/my");
      const badge = document.getElementById("badge-my-tickets-count");
      if (badge && tickets.length > 0) {
        badge.textContent = tickets.length;
        badge.style.display = "inline";
      }
    } catch (e) {}
  }

  loadMyTicketsCount();

  async function loadMyTickets() {
    const listContainer = document.getElementById("my-tickets-list-container");
    if (!listContainer) return;

    try {
      const tickets = await api.get("/api/support/tickets/my");
      if (tickets.length === 0) {
        listContainer.innerHTML = `
          <div class="text-center py-4 text-muted bg-light rounded border">
            <i class="bi bi-inbox mb-2" style="font-size: 2rem;"></i>
            <h6>${lang === 'ta' ? 'ஆதரவு டிக்கெட்டுகள் ஏதுமில்லை' : 'No Support Tickets Found'}</h6>
            <p class="small mb-0">${lang === 'ta' ? 'சிக்கல்கள் அல்லது பிழைகள் இருந்தால் புதிய டிக்கெட்டை சமர்ப்பிக்கவும்.' : 'Click "New Ticket" to submit a problem or bug report.'}</p>
          </div>
        `;
        return;
      }

      listContainer.innerHTML = tickets.map(t => {
        const statusClass = t.status === 'resolved' ? 'bg-success' : (t.status === 'in_progress' ? 'bg-info text-dark' : (t.status === 'closed' ? 'bg-secondary' : 'bg-warning text-dark'));
        const statusText = t.status.toUpperCase().replace('_', ' ');

        return `
          <div class="p-3 rounded border bg-white shadow-sm">
            <div class="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-2 pb-2 border-bottom">
              <div class="d-flex align-items-center gap-2">
                <span class="badge ${statusClass}">${statusText}</span>
                <span class="badge bg-light text-dark border font-monospace fw-bold">${t.ticket_number}</span>
                <span class="badge bg-secondary-subtle text-secondary small">${t.category.toUpperCase().replace('_', ' ')}</span>
              </div>
              <span class="small text-muted font-monospace">${new Date(t.created_at).toLocaleString()}</span>
            </div>

            <h6 class="fw-bold text-dark mb-1">${t.title}</h6>
            <p class="small text-secondary mb-2">${t.description}</p>

            ${t.attachment_url ? `
              <div class="mb-2">
                <a href="${t.attachment_url}" target="_blank" class="btn btn-xs btn-outline-secondary">
                  <i class="bi bi-image me-1"></i> ${lang === 'ta' ? 'இணைக்கப்பட்ட படம் காண்க' : 'View Attachment Screenshot'}
                </a>
              </div>
            ` : ''}

            <!-- Conversation messages -->
            ${(t.messages && t.messages.length > 1) ? `
              <div class="p-3 my-2 rounded bg-light border-start border-3 border-primary d-flex flex-column gap-2">
                <span class="small fw-bold text-primary mb-1"><i class="bi bi-chat-left-text me-1"></i> ${lang === 'ta' ? 'உரையாடல் வரலாறு:' : 'Conversation History:'}</span>
                ${t.messages.slice(1).map(m => `
                  <div class="p-2 rounded ${m.sender_role === 'admin' ? 'bg-primary-subtle border border-primary-subtle' : 'bg-white border'}">
                    <div class="d-flex justify-content-between align-items-center mb-1">
                      <span class="small fw-bold ${m.sender_role === 'admin' ? 'text-primary' : 'text-dark'}">
                        ${m.sender_role === 'admin' ? '<i class="bi bi-shield-check me-1"></i> System Administrator' : '<i class="bi bi-person me-1"></i> ' + m.sender_name}
                      </span>
                      <span class="small text-muted" style="font-size: 0.75rem;">${new Date(m.created_at).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}</span>
                    </div>
                    <p class="small mb-0 text-secondary">${m.message}</p>
                  </div>
                `).join("")}
              </div>
            ` : ''}

            <!-- Reply Box for Reporter -->
            <div class="mt-2 pt-2 border-top d-flex gap-2">
              <input type="text" class="form-control form-control-sm input-reply-support" data-tid="${t.id}" placeholder="${lang === 'ta' ? 'நிர்வாகிக்கு கூடுதல் தகவல் அல்லது பதில் எழுதுக...' : 'Reply to administrator...'}">
              <button class="btn btn-sm btn-outline-primary btn-send-support-reply" data-tid="${t.id}">
                <i class="bi bi-reply-fill me-1"></i> ${lang === 'ta' ? 'பதில் அனுப்பு' : 'Reply'}
              </button>
            </div>
          </div>
        `;
      }).join("");

      // Attach reply handlers
      listContainer.querySelectorAll(".btn-send-support-reply").forEach(btn => {
        btn.addEventListener("click", async () => {
          const tid = btn.getAttribute("data-tid");
          const input = listContainer.querySelector(`.input-reply-support[data-tid="${tid}"]`);
          const msg = input?.value?.trim();
          if (!msg || msg.length < 2) return;

          try {
            await api.post(`/api/support/tickets/${tid}/reply`, { message: msg });
            showToast(lang === 'ta' ? 'பதில் பதிவு செய்யப்பட்டது!' : 'Reply submitted!', 'success');
            loadMyTickets();
          } catch (err) {
            alert("Reply failed: " + err.message);
          }
        });
      });
    } catch (e) {
      listContainer.innerHTML = `<div class="alert alert-danger">${e.message}</div>`;
    }
  }

  // FAQ audio readout listener
  container.querySelectorAll(".btn-read-faq").forEach(btn => {
    btn.addEventListener("click", () => {
      const text = btn.getAttribute("data-text");
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
        const ut = new SpeechSynthesisUtterance(text);
        ut.lang = lang === 'hi' ? 'hi-IN' : (lang === 'ta' ? 'ta-IN' : 'en-IN');
        btn.innerHTML = `<span class="spinner-grow spinner-grow-sm me-1"></span> ${lang === 'ta' ? 'ஒலிக்கிறது...' : 'Playing...'}`;
        ut.onend = () => {
          btn.innerHTML = `<i class="bi bi-volume-up-fill me-1"></i> ${lang === 'ta' ? 'பதிலை வாசித்து கேள்' : 'Listen Answer'}`;
        };
        ut.onerror = () => {
          btn.innerHTML = `<i class="bi bi-volume-up-fill me-1"></i> ${lang === 'ta' ? 'பதிலை வாசித்து கேள்' : 'Listen Answer'}`;
        };
        window.speechSynthesis.speak(ut);
      }
    });
  });
}

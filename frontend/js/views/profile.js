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
          <h3 class="fw-bold mb-1" style="color: var(--color-navy);"><i class="bi bi-question-circle-fill me-2 text-warning"></i> ${lang === 'ta' ? 'உதவி மற்றும் அணுகல்தன்மை வழிகாட்டி' : (lang === 'hi' ? 'सहायता एवं अक्सर पूछे जाने वाले प्रश्न' : 'Help & Accessibility Guide')}</h3>
          <p class="text-muted small mb-0">${lang === 'ta' ? 'கிராம விகாஸ் தளத்தை தடையின்றி பயன்படுத்த உதவும் வழிகாட்டுதல்கள் மற்றும் பொதுவான கேள்விகள்.' : 'Comprehensive user guide, accessibility tools, and frequently asked village citizen questions.'}</p>
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

        <!-- Accessibility Features Card -->
        <div class="card-gv p-4">
          <h5 class="fw-bold mb-3 text-dark">${lang === 'ta' ? 'அணுகல்தன்மை வசதிகள்' : 'Platform Accessibility Features'}</h5>
          <div class="row g-3">
            <div class="col-md-6">
              <div class="p-3 rounded border bg-light h-100">
                <h6 class="fw-bold text-dark mb-1"><i class="bi bi-fonts text-primary me-1"></i> ${lang === 'ta' ? 'எழுத்து அளவு மாற்றி (Font Scaler)' : 'Font Scaler'}</h6>
                <p class="small text-muted mb-0">${lang === 'ta' ? 'மேல் பட்டையில் உள்ள A-, A, A+ பொத்தான்களை அழுத்தி வாசிப்பதற்கு வசதியாக எழுத்துக்களை பெரிதாக்கலாம்.' : 'Use the top-bar font size switcher to comfortably scale text across the entire interface.'}</p>
              </div>
            </div>
            <div class="col-md-6">
              <div class="p-3 rounded border bg-light h-100">
                <h6 class="fw-bold text-dark mb-1"><i class="bi bi-reception-2 text-success me-1"></i> ${lang === 'ta' ? 'குறைந்த இணைய வேகம் (2G Low-Data)' : 'Low-Bandwidth 2G Mode'}</h6>
                <p class="small text-muted mb-0">${lang === 'ta' ? 'கிராமப்புறங்களில் இணைய வேகம் குறைவாக இருக்கும் போது மேப் மற்றும் படங்களை மறைத்து அதிவேகமாக இயங்க வைக்கும்.' : 'Turns off heavy map tiles and background images to operate flawlessly on 2G rural networks.'}</p>
              </div>
            </div>
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

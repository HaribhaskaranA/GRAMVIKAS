/**
 * GRAMVIKAS AI - Rural Voice Information Service View (/voice-service).
 * Real Outbound Phone Call Calling (Twilio REST), Live Audio Stream Testing (gTTS),
 * simulated incoming ring screen, opt-in consent, and statutory TRAI audit trail.
 */

import { api } from "../api.js";
import { auth } from "../auth.js";
import { getLanguage, t } from "../i18n.js";
import { showToast } from "../components/toast.js";

export async function renderVoiceService(container) {
  const user = auth.getUser();
  const profile = user?.citizen_profile || {};
  const lang = getLanguage();

  container.innerHTML = `
    <div class="d-flex flex-column gap-4">
      <!-- Voice Hero Banner -->
      <div class="card-gv p-4" style="background: linear-gradient(135deg, #1A4D2E 0%, var(--color-navy) 100%); color: #FFFFFF;">
        <div class="row align-items-center">
          <div class="col-lg-8">
            <div class="d-flex align-items-center gap-2 mb-2">
              <span class="badge bg-warning text-dark fw-bold">
                ${lang === 'ta' ? 'இணையம் / ஸ்மார்ட்போன் தேவையில்லை' : 'NO SMARTPHONE OR INTERNET REQUIRED'}
              </span>
              <span class="badge-demo"><i class="bi bi-shield-check"></i> TRAI COMPLIANT</span>
            </div>
            <h2 class="fw-bold mb-2">
              ${lang === 'ta' ? 'தானியங்கி குரல் வழி தகவல் ஒலிபரப்பு' : 'Automated Voice Broadcast Service'}
            </h2>
            <p class="mb-3 text-light" style="opacity: 0.95; font-size: 0.95rem;">
              ${lang === 'ta' ? 
                'அரசு நலத்திட்டங்கள், கிராம சபை தேதிகள் மற்றும் பயிர் ஆலோசனைகள் அடிப்படை மொபைல் போன்களுக்கு நேரடியாக தானியங்கி போன் அழைப்புகளாக பேசப்படும்.' : 
                'Critical village alerts, Gram Sabha dates, and welfare scheme updates delivered as automated phone calls in your spoken mother tongue.'}
            </p>
            <div class="d-flex flex-wrap gap-2">
              <a href="#live-call-section" class="btn btn-gv-saffron btn-sm">
                <i class="bi bi-telephone-outbound-fill me-1"></i> ${lang === 'ta' ? 'எனது போனுக்கு இப்போது அழைக்கவும் (Live Call)' : 'Call My Phone Now'}
              </a>
              <a href="#subscribe-section" class="btn btn-outline-light btn-sm">
                <i class="bi bi-telephone-plus-fill me-1"></i> ${lang === 'ta' ? 'குரல் சேவை பதிவு' : 'Register Number'}
              </a>
            </div>
          </div>
          <div class="col-lg-4 d-none d-lg-flex justify-content-center">
            <div style="width: 110px; height: 110px; border-radius: 50%; background: rgba(255, 255, 255, 0.1); display: flex; align-items: center; justify-content: center; font-size: 3.5rem; color: var(--color-saffron);">
              <i class="bi bi-broadcast"></i>
            </div>
          </div>
        </div>
      </div>

      <!-- NEW: REAL OUTBOUND PHONE CALL & LIVE AUDIO STREAM CARD -->
      <div class="card-gv p-4" id="live-call-section" style="border: 2px solid var(--color-saffron);">
        <div class="d-flex align-items-center justify-content-between mb-3">
          <div>
            <h5 class="fw-bold mb-1" style="color: var(--color-navy);">
              <i class="bi bi-telephone-fill me-2 text-warning"></i>
              ${lang === 'ta' ? 'நேரடி போன் அழைப்பு சோதனை (Real Outbound Phone Call)' : 'Direct Phone Call / Ring My Device'}
            </h5>
            <p class="small text-muted mb-0">
              ${lang === 'ta' ? 'உங்கள் கைப்பேசி எண்ணை உள்ளிட்டு "Call Now" அழுத்தவும். உண்மையான போன் அழைப்பு உடனடியாக இணைக்கப்படும்.' : 'Enter your mobile number (+91) to receive an immediate outbound call or play live synthesized audio.'}
            </p>
          </div>
          <span class="badge bg-success">${lang === 'ta' ? 'நேரடி அழைப்பு தயார்' : 'LIVE CALL GATEWAY'}</span>
        </div>

        <div class="row g-4 align-items-center">
          <div class="col-lg-7">
            <form id="form-call-now" class="d-flex flex-column gap-3">
              <div class="row g-2">
                <div class="col-md-7">
                  <label class="form-label small fw-semibold">
                    ${lang === 'ta' ? 'உங்கள் மொபைல் எண் (+91)' : 'Your Mobile Number (+91)'} <span class="text-danger">*</span>
                  </label>
                  <input type="tel" class="form-control" id="call-phone-input" placeholder="+91 98401 23456" value="${user?.phone || '+91 98401 23456'}" required>
                </div>
                <div class="col-md-5">
                  <label class="form-label small fw-semibold">${lang === 'ta' ? 'அழைப்பு மொழி' : 'Call Language'}</label>
                  <select class="form-select" id="call-lang-select">
                    <option value="ta" ${lang === 'ta' ? 'selected' : ''}>தமிழ் (Tamil)</option>
                    <option value="hi" ${lang === 'hi' ? 'selected' : ''}>हिन्दी (Hindi)</option>
                    <option value="en" ${lang === 'en' ? 'selected' : ''}>English</option>
                  </select>
                </div>
              </div>

              <div>
                <label class="form-label small fw-semibold">${lang === 'ta' ? 'அழைப்பு வகை' : 'Category'}</label>
                <select class="form-select form-select-sm" id="call-category-select">
                  <option value="schemes">🏛️ ${lang === 'ta' ? 'அரசு நலத்திட்ட விவரங்கள் (PM-KISAN / கலைஞர் கனவு இல்லம்)' : 'Welfare Schemes (PM-KISAN / Housing)'}</option>
                  <option value="water_project">🚰 ${lang === 'ta' ? 'மேல்மருவத்தூர் குடிநீர் திட்ட பணி அறிக்கை' : 'Water Infrastructure Project Update'}</option>
                  <option value="gram_sabha">📢 ${lang === 'ta' ? 'சிறப்பு கிராம சபை கூட்ட அறிவிப்பு' : 'Special Gram Sabha Meeting Notice'}</option>
                </select>
              </div>

              <div class="d-flex flex-wrap gap-2">
                <button type="submit" class="btn btn-gv-primary" id="btn-submit-call">
                  <i class="bi bi-telephone-outbound-fill me-1"></i> ${lang === 'ta' ? 'எனக்கு இப்போது அழைக்கவும் (Call My Phone Now)' : 'Ring My Phone Now'}
                </button>
                <button type="button" class="btn btn-outline-secondary" id="btn-listen-web-audio">
                  <i class="bi bi-volume-up-fill me-1"></i> ${lang === 'ta' ? 'இணையத்தில் கேட்கவும் (Stream MP3)' : 'Listen Live Audio'}
                </button>
              </div>
            </form>
          </div>

          <!-- Phone Ringing Simulated Visualizer -->
          <div class="col-lg-5">
            <div class="p-3 rounded border text-center" id="phone-screen-card" style="background: #111827; color: #FFFFFF; min-height: 200px; display: flex; flex-direction: column; justify-content: center; align-items: center;">
              <div id="phone-idle-state">
                <i class="bi bi-phone text-muted" style="font-size: 3rem;"></i>
                <div class="small text-muted mt-2">${lang === 'ta' ? 'அழைப்பிற்காக காத்திருக்கிறது...' : 'Gateway Standby'}</div>
                <div class="text-secondary font-monospace" style="font-size: 0.75rem;">+91 (Twilio / Exotel / gTTS)</div>
              </div>

              <div id="phone-calling-state" style="display: none;">
                <div class="spinner-grow text-success mb-2" role="status"></div>
                <h5 class="fw-bold mb-1 text-success">${lang === 'ta' ? 'அழைப்பு இணைக்கப்படுகிறது...' : 'Incoming Call...'}</h5>
                <span class="small text-light font-monospace d-block" id="calling-target-num">+91 98401 23456</span>
                <span class="badge bg-success mt-2" id="call-sid-badge">CALL CONNECTED</span>
              </div>
            </div>
            <audio id="live-voice-audio-el" preload="none" style="display: none;"></audio>
          </div>
        </div>

        <!-- Twilio .env Setup Guidance Card -->
        <div class="mt-3 p-3 rounded bg-light border">
          <div class="d-flex align-items-center justify-content-between">
            <span class="small fw-bold text-dark">
              <i class="bi bi-info-circle-fill text-primary me-1"></i>
              ${lang === 'ta' ? 'Twilio நேரடி தொலைபேசி கட்டமைப்பு (.env)' : 'Twilio Real Outbound Configuration'}
            </span>
            <span class="badge bg-secondary font-monospace" style="font-size: 0.7rem;">.env ready</span>
          </div>
          <p class="small text-muted mb-0 mt-1">
            ${lang === 'ta' ? 
              'உண்மையான இந்திய மொபைல் எண்களுக்கு போன் அடிக்க <code>.env</code> கோப்பில் <code>TWILIO_ACCOUNT_SID</code>, <code>TWILIO_AUTH_TOKEN</code>, <code>TWILIO_FROM_NUMBER</code> சேர்க்கவும். இல்லையெனில் கணினியில் உடனடியாக MP3 குரல் பதிவு ஒலிக்கும்.' : 
              'To place physical GSM calls to any Indian mobile number, add your <code>TWILIO_ACCOUNT_SID</code>, <code>TWILIO_AUTH_TOKEN</code>, and <code>TWILIO_FROM_NUMBER</code> to <code>.env</code>. Instant realistic MP3 audio synthesis is active out-of-the-box.'}
          </p>
        </div>
      </div>

      <!-- Two-Column Form Row (Subscription & Opt-out) -->
      <div class="row g-4" id="subscribe-section">
        <!-- 1. Opt-In Subscription Form -->
        <div class="col-lg-6">
          <div class="card-gv p-4 h-100">
            <h5 class="fw-bold mb-2" style="color: var(--color-navy);"><i class="bi bi-telephone-inbound-fill me-2 text-success"></i> ${lang === 'ta' ? 'குரல் சேவை சந்தா பதிவு' : 'Subscribe to Voice Alerts'}</h5>
            <p class="small text-muted mb-3">${lang === 'ta' ? 'அடிப்படை மொபைல் போனில் குரல் வழி அறிவிப்புகளைப் பெற பதிவு செய்யவும்.' : 'Receive voice announcements directly on your basic mobile phone.'}</p>

            <form id="form-voice-sub" class="d-flex flex-column gap-3">
              <div>
                <label class="form-label small fw-semibold">${lang === 'ta' ? 'மொபைல் எண்' : 'Mobile Phone Number'} <span class="text-danger">*</span></label>
                <input type="tel" class="form-control" id="vs-phone" placeholder="e.g. +91 98401 23456" value="${user?.phone || '+91 98401 23456'}" required>
              </div>

              <div class="row g-2">
                <div class="col-6">
                  <label class="form-label small fw-semibold">${lang === 'ta' ? 'பெயர்' : 'Subscriber Name'}</label>
                  <input type="text" class="form-control form-control-sm" id="vs-name" value="${user?.full_name || 'Muthuvel K'}">
                </div>
                <div class="col-6">
                  <label class="form-label small fw-semibold">${lang === 'ta' ? 'விருப்ப மொழி' : 'Preferred Language'}</label>
                  <select class="form-select form-select-sm" id="vs-lang">
                    <option value="ta" ${lang === 'ta' ? 'selected' : ''}>தமிழ் (Tamil)</option>
                    <option value="en" ${lang === 'en' ? 'selected' : ''}>English</option>
                    <option value="hi" ${lang === 'hi' ? 'selected' : ''}>हिन्दी (Hindi)</option>
                  </select>
                </div>
              </div>

              <div class="row g-2">
                <div class="col-6">
                  <label class="form-label small fw-semibold">${lang === 'ta' ? 'கிராமம்' : 'Village'}</label>
                  <input type="text" class="form-control form-control-sm" id="vs-village" value="${profile.village || 'Melmaruvathur'}" required>
                </div>
                <div class="col-6">
                  <label class="form-label small fw-semibold">${lang === 'ta' ? 'மாவட்டம்' : 'District'}</label>
                  <input type="text" class="form-control form-control-sm" id="vs-district" value="${profile.district || 'Chengalpattu'}" required>
                </div>
              </div>

              <div class="form-check p-2 rounded bg-light border">
                <input class="form-check-input ms-1" type="checkbox" id="vs-consent" checked required>
                <label class="form-check-label small text-muted ms-2" for="vs-consent">
                  ${lang === 'ta' ? 'தானியங்கி கிராம நல குரல் வழி அறிவிப்புகளை பெற முழு ஒப்புதல் அளிக்கிறேன் (இரவு 8 மணி முதல் காலை 7 மணி வரை போன் வராது).' : 'I give explicit informed consent to receive automated village welfare voice broadcasts. Calls respect quiet hours (8 PM - 7 AM).'}
                </label>
              </div>

              <button type="submit" class="btn btn-gv-primary">
                <i class="bi bi-check2-circle me-1"></i> ${lang === 'ta' ? 'ஒப்புதல் பதிவு செய்' : 'Register Voice Consent'}
              </button>
            </form>
          </div>
        </div>

        <!-- 2. 1-Click Unsubscribe Form & Regulatory Info -->
        <div class="col-lg-6">
          <div class="card-gv p-4 h-100 d-flex flex-column justify-content-between">
            <div>
              <h5 class="fw-bold mb-2 text-danger"><i class="bi bi-telephone-x-fill me-2"></i> ${lang === 'ta' ? 'ஒரே கிளிக்கில் சந்தா ரத்து' : '1-Click Unsubscribe'}</h5>
              <p class="small text-muted mb-3">${lang === 'ta' ? 'எந்த நேரத்திலும் குரல் சேவையை உடனடியாக நிறுத்திக் கொள்ளும் முழு உரிமை குடிமக்களுக்கு உண்டு.' : 'Citizens have an absolute right to revoke consent and stop all automated telephony immediately.'}</p>

              <form id="form-voice-unsub" class="mb-4">
                <div class="input-group">
                  <input type="tel" class="form-control" id="vs-unsub-phone" placeholder="${lang === 'ta' ? 'மொபைல் எண்ணை உள்ளிடவும்...' : 'Enter mobile number...'}" required>
                  <button type="submit" class="btn btn-outline-danger">${lang === 'ta' ? 'ரத்து செய்' : 'Opt-Out'}</button>
                </div>
              </form>

              <h6 class="fw-bold text-dark small mb-2"><i class="bi bi-shield-lock me-1"></i> TRAI Regulatory Protections:</h6>
              <ul class="list-unstyled small text-muted mb-0 d-flex flex-column gap-2">
                <li><i class="bi bi-moon-stars text-primary me-2"></i> <strong>Quiet Hours:</strong> No automated calls between 20:00 (8 PM) and 07:00 (7 AM).</li>
                <li><i class="bi bi-card-text text-success me-2"></i> <strong>Opt-in Verification:</strong> Every subscriber call includes recorded consent metadata.</li>
                <li><i class="bi bi-slash-circle text-danger me-2"></i> <strong>Zero Spam Guarantee:</strong> Reserved strictly for official Gram Sabha, disaster, and welfare notices.</li>
              </ul>
            </div>

            <div class="p-3 rounded border bg-light mt-3">
              <span class="small fw-bold text-dark d-block">${lang === 'ta' ? 'இலவச உதவி எண் (IVRS)' : 'Toll-free IVRS Helpline'}</span>
              <span class="small text-muted">${lang === 'ta' ? 'அறிவிப்புகளை கேட்க <strong>1800-425-4567</strong> என்ற எண்ணை அழைக்கவும்.' : 'Dial <strong>1800-425-4567</strong> to listen to village announcements on-demand.'}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 4. Recent Call Delivery Logs -->
      <div class="card-gv">
        <div class="card-header-gv">
          <span class="fw-bold" style="color: var(--color-navy);"><i class="bi bi-list-columns-reverse me-2"></i> ${lang === 'ta' ? 'அழைப்பு விவர பதிவேடு' : 'Recent Outbound Call Logs'}</span>
          <span class="small text-muted">Statutory Telephony Delivery Audit</span>
        </div>
        <div class="table-responsive">
          <table class="table table-sm table-hover align-middle mb-0" id="table-call-logs" style="font-size: 0.85rem;">
            <thead class="table-light">
              <tr>
                <th>Timestamp</th>
                <th>Campaign</th>
                <th>Recipient</th>
                <th>Status</th>
                <th>Provider / SID</th>
                <th>Duration</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td colspan="6" class="text-center py-3 text-muted">Loading call logs...</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `;

  // Fetch call logs
  async function loadCallLogs() {
    try {
      const logs = await api.get("/api/voice/call-logs");
      const tbody = document.querySelector("#table-call-logs tbody");
      if (tbody && logs.length) {
        tbody.innerHTML = logs.map(l => `
          <tr>
            <td>${new Date(l.attempt_timestamp).toLocaleString()}</td>
            <td class="fw-semibold text-dark">${l.campaign_name || 'Village Broadcast'}</td>
            <td class="font-monospace">${l.phone_number}</td>
            <td>
              <span class="badge ${l.call_status === 'delivered' ? 'bg-success' : 'bg-warning text-dark'} text-uppercase" style="font-size: 0.7rem;">
                ${l.call_status}
              </span>
            </td>
            <td class="font-monospace small text-muted">${l.call_sid ? l.call_sid.substring(0, 16) + '...' : 'LOCAL_AUDIO'}</td>
            <td>${l.duration_seconds}s</td>
          </tr>
        `).join("");
      }
    } catch (e) {
      console.warn("Call logs fetch note:", e);
    }
  }

  loadCallLogs();

  // Real Outbound Call Now Handler
  const callForm = document.getElementById("form-call-now");
  const phoneIdle = document.getElementById("phone-idle-state");
  const phoneCalling = document.getElementById("phone-calling-state");
  const callingNum = document.getElementById("calling-target-num");
  const callSidBadge = document.getElementById("call-sid-badge");
  const audioElement = document.getElementById("live-voice-audio-el");

  callForm?.addEventListener("submit", async (e) => {
    e.preventDefault();
    const phone = document.getElementById("call-phone-input").value;
    const callLang = document.getElementById("call-lang-select").value;
    const cat = document.getElementById("call-category-select").value;

    phoneIdle.style.display = "none";
    phoneCalling.style.display = "block";
    callingNum.textContent = phone;
    callSidBadge.textContent = "DIALING GATEWAY...";
    callSidBadge.className = "badge bg-warning text-dark mt-2";

    try {
      const res = await api.post("/api/voice/call-now", {
        phone_number: phone,
        language: callLang,
        category: cat
      });

      callSidBadge.textContent = res.status === 'placed' ? `TWILIO LIVE CALL (${res.call_sid.substring(0, 10)})` : `CALL SIMULATED (Audio Ready)`;
      callSidBadge.className = "badge bg-success mt-2";
      showToast(res.message, "success");

      // Also trigger browser audio stream for instant hearing
      if (res.audio_url) {
        audioElement.src = res.audio_url;
        audioElement.play().catch(e => console.log("Audio auto-play note:", e));
      }

      loadCallLogs();
    } catch (err) {
      callSidBadge.textContent = "CALL FAILED: " + err.message;
      callSidBadge.className = "badge bg-danger mt-2";
    }
  });

  // Listen MP3 Stream Directly
  document.getElementById("btn-listen-web-audio")?.addEventListener("click", () => {
    const callLang = document.getElementById("call-lang-select").value;
    const cat = document.getElementById("call-category-select").value;
    let sampleText = "வணக்கம். மேல்மருவத்தூர் ஊராட்சியின் சிறப்பு குடிநீர் திட்ட பணிகள் 75 சதவீதம் நிறைவடைந்துள்ளது.";
    if (callLang === "hi") {
      sampleText = "नमस्ते। मेलमरुवथुर ग्राम पंचायत की पेयजल परियोजना का 75 प्रतिशत कार्य पूर्ण हो चुका है।";
    }
    const audioUrl = `/api/voice/audio-stream?text=${encodeURIComponent(sampleText)}&lang=${callLang}`;
    audioElement.src = audioUrl;
    audioElement.play().then(() => {
      phoneIdle.style.display = "none";
      phoneCalling.style.display = "block";
      callSidBadge.textContent = "AUDIO PLAYING (gTTS)";
      callSidBadge.className = "badge bg-primary mt-2";
    }).catch(e => {
      showToast("Audio playback error: " + e.message, "danger");
    });
  });

  // Form Subscriptions Handler
  document.getElementById("form-voice-sub")?.addEventListener("submit", async (e) => {
    e.preventDefault();
    try {
      const payload = {
        phone_number: document.getElementById("vs-phone").value,
        subscriber_name: document.getElementById("vs-name").value,
        preferred_language: document.getElementById("vs-lang").value,
        village: document.getElementById("vs-village").value,
        district: document.getElementById("vs-district").value,
        consent_given: true
      };
      await api.post("/api/voice/subscribe", payload);
      showToast("Voice alert subscription registered with explicit consent!", "success");
      loadCallLogs();
    } catch (err) {
      alert("Subscription failed: " + err.message);
    }
  });

  // Form Unsubscribe Handler
  document.getElementById("form-voice-unsub")?.addEventListener("submit", async (e) => {
    e.preventDefault();
    const phone = document.getElementById("vs-unsub-phone").value;
    try {
      await api.post("/api/voice/unsubscribe", { phone_number: phone });
      showToast(`Phone number ${phone} successfully unsubscribed.`, "info");
      document.getElementById("vs-unsub-phone").value = "";
    } catch (err) {
      alert("Unsubscribe error: " + err.message);
    }
  });
}

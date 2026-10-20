/**
 * GRAMVIKAS AI - Citizen Issue Reporting & 6-Stage Timeline Tracker Views (/report-issue, /my-reports, /reports/:id).
 * 100% Multilingual in Tamil (ta), Hindi (hi), and English (en).
 */

import { api } from "../api.js";
import { auth } from "../auth.js";
import { getLanguage, t } from "../i18n.js";
import { showToast, copyToClipboard } from "../components/toast.js";

export async function renderReportIssue(container, reportId = null) {
  if (typeof reportId === "string" && reportId.trim() !== "" && reportId !== "undefined" && reportId !== "null" && reportId !== "report-issue" && reportId !== "my-reports") {
    return renderReportDetail(container, reportId);
  }

  // Check if current route is /my-reports
  if (window.location.pathname === "/my-reports") {
    return renderMyReports(container);
  }

  const lang = getLanguage();
  const user = auth.getUser();
  const profile = user?.citizen_profile || {};

  container.innerHTML = `
    <div class="row justify-content-center">
      <div class="col-lg-8">
        <div class="d-flex align-items-center justify-content-between mb-3">
          <div>
            <h3 class="fw-bold mb-1" style="color: var(--color-navy);"><i class="bi bi-exclamation-octagon-fill me-2 text-danger"></i> ${lang === 'ta' ? 'கிராம குறை தீர்க்கும் புகார் பதிவு' : (lang === 'hi' ? 'ग्रामीण समस्या शिकायत दर्ज करें' : 'Report a Village Issue')}</h3>
            <p class="text-muted small mb-0">${lang === 'ta' ? 'குடிநீர், சாலை, மின்விளக்கு போன்ற பொதுப் பிரச்சனைகளை GPS இருப்பிடத்துடன் நேரடியாக BDO அலுவலருக்கு அனுப்பவும்.' : 'Submit public infrastructure grievances directly to Block Development Officers with GPS verification.'}</p>
          </div>
          <a href="/my-reports" class="btn btn-outline-secondary btn-sm">
            <i class="bi bi-card-checklist me-1"></i> ${lang === 'ta' ? 'எனது புகார்கள்' : 'My Filed Reports'}
          </a>
        </div>

        <div class="card-gv p-4">
          <form id="form-submit-issue" class="d-flex flex-column gap-3">
            <div class="row g-3">
              <div class="col-md-6">
                <label class="form-label small fw-semibold">${lang === 'ta' ? 'பிரச்சனை வகை' : 'Problem Category'} <span class="text-danger">*</span></label>
                <select class="form-select" id="rep-category" required>
                  <option value="drinking_water">${lang === 'ta' ? 'குடிநீர் & கைபம்பு பழுது' : 'Drinking Water & Handpumps'}</option>
                  <option value="roads_and_bridges">${lang === 'ta' ? 'சாலைகள் & சிறு பாலங்கள்' : 'Roads, Culverts & Bridges'}</option>
                  <option value="sanitation_and_drainage">${lang === 'ta' ? 'சுகாதாரம் & சாக்கடை வடிகால்' : 'Sanitation & Drainage Channels'}</option>
                  <option value="streetlights_electricity">${lang === 'ta' ? 'தெருவிளக்கு & மின்சார பிரச்சனை' : 'Streetlights & Power Issues'}</option>
                  <option value="public_buildings">${lang === 'ta' ? 'பள்ளி / அங்கன்வாடி கட்டிடங்கள்' : 'School / Anganwadi Buildings'}</option>
                  <option value="ration_and_civil_supplies">${lang === 'ta' ? 'ரேஷன் கடை & பொது விநியோகம்' : 'Ration Shop & Public Supplies'}</option>
                  <option value="agriculture_irrigation">${lang === 'ta' ? 'பாசன கால்வாய் & ஏரி மதகு' : 'Canals & Irrigation Sluices'}</option>
                  <option value="other">${lang === 'ta' ? 'மற்ற பொது உட்கட்டமைப்பு' : 'Other Public Infrastructure'}</option>
                </select>
              </div>

              <div class="col-md-6">
                <label class="form-label small fw-semibold">${lang === 'ta' ? 'முக்கியத்துவ நிலை' : 'Urgency Level'}</label>
                <select class="form-select" id="rep-priority">
                  <option value="normal">${lang === 'ta' ? 'சாதாரண பராமரிப்பு' : 'Normal (Routine Maintenance)'}</option>
                  <option value="high">${lang === 'ta' ? 'அதிகம் (பல குடும்பங்கள் பாதிப்பு)' : 'High (Affecting Multiple Households)'}</option>
                  <option value="emergency">${lang === 'ta' ? 'அவசரம் (வெள்ளம் / ஆபத்து)' : 'Emergency (Public Safety / Flood Risk)'}</option>
                </select>
              </div>
            </div>

            <div>
              <label class="form-label small fw-semibold">${lang === 'ta' ? 'புகாரின் தலைப்பு' : 'Issue Title'} <span class="text-danger">*</span></label>
              <input type="text" class="form-control" id="rep-title" placeholder="${lang === 'ta' ? 'எ.கா. மாரியம்மன் கோவில் அருகே பழுதடைந்த கைபம்பு' : 'e.g. Broken Handpump lever near Mariamman Temple'}" required minlength="5">
            </div>

            <div>
              <label class="form-label small fw-semibold">${lang === 'ta' ? 'முழு விவரம்' : 'Detailed Description'} <span class="text-danger">*</span></label>
              <textarea class="form-control" id="rep-description" rows="4" placeholder="${lang === 'ta' ? 'பிரச்சனை பற்றிய முழு விவரம், எத்தனை நாட்களாக உள்ளது மற்றும் பாதிக்கப்பட்ட குடும்பங்கள்...' : 'Describe the problem, duration, and number of families affected...'}" required minlength="15"></textarea>
            </div>

            <div class="row g-3">
              <div class="col-md-4">
                <label class="form-label small fw-semibold">${lang === 'ta' ? 'கிராமம்' : 'Village'} <span class="text-danger">*</span></label>
                <input type="text" class="form-control form-control-sm" id="rep-village" value="${profile.village || 'Melmaruvathur'}" required>
              </div>
              <div class="col-md-4">
                <label class="form-label small fw-semibold">${lang === 'ta' ? 'வட்டாரம்' : 'Block'} <span class="text-danger">*</span></label>
                <input type="text" class="form-control form-control-sm" id="rep-block" value="${profile.block || 'Cheyyur'}" required>
              </div>
              <div class="col-md-4">
                <label class="form-label small fw-semibold">${lang === 'ta' ? 'மாவட்டம்' : 'District'} <span class="text-danger">*</span></label>
                <input type="text" class="form-control form-control-sm" id="rep-district" value="${profile.district || 'Chengalpattu'}" required>
              </div>
            </div>

            <div>
              <label class="form-label small fw-semibold">${lang === 'ta' ? 'அடையாள இடம் / தெரு' : 'Landmark / Specific Location'}</label>
              <input type="text" class="form-control form-control-sm" id="rep-landmark" placeholder="${lang === 'ta' ? 'எ.கா. அரசு பள்ளி எதிரில், வடக்கு தெரு' : 'e.g. Opposite Government High School, North Street'}">
            </div>

            <!-- GPS Coordinate Tagging -->
            <div class="p-3 rounded border bg-light">
              <div class="d-flex align-items-center justify-content-between mb-2">
                <span class="small fw-bold text-dark"><i class="bi bi-geo-alt-fill text-danger me-1"></i> ${lang === 'ta' ? 'GPS இருப்பிட சரிபார்ப்பு' : 'GPS Coordinates Verification'}</span>
                <button type="button" class="btn btn-sm btn-outline-primary" id="btn-capture-gps">
                  <i class="bi bi-crosshair me-1"></i> ${lang === 'ta' ? 'இருப்பிடத்தை கண்டறி' : 'Auto-Detect My Location'}
                </button>
              </div>
              <div class="row g-2">
                <div class="col-6">
                  <input type="number" step="any" class="form-control form-control-sm" id="rep-lat" placeholder="Latitude" value="12.4346">
                </div>
                <div class="col-6">
                  <input type="number" step="any" class="form-control form-control-sm" id="rep-lng" placeholder="Longitude" value="79.8297">
                </div>
              </div>
            </div>

            <button type="submit" class="btn btn-gv-primary py-2" id="btn-submit-report">
              <i class="bi bi-send-fill me-1"></i> ${lang === 'ta' ? 'புகாரை அதிகாரப்பூர்வமாக சமர்ப்பி' : 'Submit Citizen Grievance'}
            </button>
          </form>
        </div>
      </div>
    </div>
  `;

  // GPS Auto-detect
  document.getElementById("btn-capture-gps")?.addEventListener("click", () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          document.getElementById("rep-lat").value = pos.coords.latitude.toFixed(5);
          document.getElementById("rep-lng").value = pos.coords.longitude.toFixed(5);
          showToast(lang === 'ta' ? "GPS இருப்பிடம் வெற்றிகரமாக பெறப்பட்டது!" : "GPS coordinates acquired!", "success");
        },
        () => showToast(lang === 'ta' ? "இருப்பிட அனுமதி மறுக்கப்பட்டது, இயல்புநிலை பயன்படுத்தப்படுகிறது." : "Location access denied, using village default.", "info")
      );
    }
  });

  // Form Submit
  document.getElementById("form-submit-issue")?.addEventListener("submit", async (e) => {
    e.preventDefault();
    const btn = document.getElementById("btn-submit-report");
    btn.disabled = true;
    btn.innerHTML = `<span class="spinner-border spinner-border-sm me-1"></span> ${lang === 'ta' ? 'பதிவாகிறது...' : 'Submitting...'}`;

    try {
      const payload = {
        category: document.getElementById("rep-category").value,
        priority: document.getElementById("rep-priority").value,
        title: document.getElementById("rep-title").value,
        description: document.getElementById("rep-description").value,
        village: document.getElementById("rep-village").value,
        block: document.getElementById("rep-block").value,
        district: document.getElementById("rep-district").value,
        landmark: document.getElementById("rep-landmark").value,
        latitude: parseFloat(document.getElementById("rep-lat").value) || 12.4346,
        longitude: parseFloat(document.getElementById("rep-lng").value) || 79.8297,
        photo_urls: []
      };

      const res = await api.post("/api/reports", payload);
      showToast(lang === 'ta' ? `புகார் பதிவு செய்யப்பட்டது! குறிப்பு எண்: ${res.reference_id}` : `Report submitted successfully! Ref: ${res.reference_id}`, "success");
      window.location.pathname = `/reports/${res.id}`;
    } catch (err) {
      showToast(err.message, "danger");
      btn.disabled = false;
      btn.innerHTML = `<i class="bi bi-send-fill me-1"></i> ${lang === 'ta' ? 'புகாரை அதிகாரப்பூர்வமாக சமர்ப்பி' : 'Submit Citizen Grievance'}`;
    }
  });
}

/**
 * My Reports View (/my-reports)
 */
async function renderMyReports(container) {
  const lang = getLanguage();
  container.innerHTML = `
    <div class="d-flex flex-column gap-4">
      <div class="d-flex align-items-center justify-content-between">
        <div>
          <h3 class="fw-bold mb-1" style="color: var(--color-navy);"><i class="bi bi-card-list me-2 text-primary"></i> ${lang === 'ta' ? 'பதிவான பொதுமக்கள் புகார்கள்' : 'Citizen Grievances Tracker'}</h3>
          <p class="text-muted small mb-0">${lang === 'ta' ? 'கள ஆய்வு, பழுது நீக்கும் பணி மற்றும் தீர்வு நிலைகளை 6 கட்டங்களில் கண்காணிக்கவும்.' : 'Follow real-time inspection, field works, and resolution sign-offs across 6 stages.'}</p>
        </div>
        <a href="/report-issue" class="btn btn-gv-primary btn-sm">
          <i class="bi bi-plus-lg me-1"></i> ${lang === 'ta' ? 'புதிய புகார் பதிவு செய்' : 'Report New Issue'}
        </a>
      </div>

      <div class="row g-4" id="my-reports-list">
        <div class="col-12 text-center py-5 text-muted">
          <div class="spinner-border spinner-border-sm text-primary mb-2"></div>
          <div>${lang === 'ta' ? 'புகார்கள் ஏற்றப்படுகின்றன...' : 'Loading your reports...'}</div>
        </div>
      </div>
    </div>
  `;

  try {
    const reports = await api.get("/api/reports");
    const listEl = document.getElementById("my-reports-list");
    if (!listEl) return;

    if (!reports.length) {
      listEl.innerHTML = `
        <div class="col-12 text-center py-5 text-muted">
          <i class="bi bi-check-circle" style="font-size: 2.5rem; color: var(--color-green);"></i>
          <h5 class="mt-2 text-dark">${lang === 'ta' ? 'தற்போது புகார்கள் எதுவும் இல்லை' : 'No Active Grievances'}</h5>
          <p class="small mb-3">${lang === 'ta' ? 'உங்கள் கிராமத்தில் ஏதேனும் பிரச்சனை இருந்தால் புகார் பதிவு செய்யலாம்.' : 'You have not submitted any village complaints yet.'}</p>
          <a href="/report-issue" class="btn btn-gv-primary btn-sm">${lang === 'ta' ? 'புகார் பதிவு செய்' : 'Submit Grievance'}</a>
        </div>
      `;
      return;
    }

    listEl.innerHTML = reports.map(r => `
      <div class="col-md-6 col-lg-4">
        <div class="card-gv h-100 d-flex flex-column">
          <div class="card-header-gv">
            <div class="d-flex align-items-center gap-1">
              <span class="badge bg-light text-dark border small fw-bold font-monospace">${r.reference_id}</span>
              <button class="btn btn-sm btn-link p-0 text-muted btn-copy-report-ref" data-ref="${r.reference_id}" title="${lang === 'ta' ? 'புகார் எண் நகலெடு' : 'Copy Reference ID'}">
                <i class="bi bi-clipboard"></i>
              </button>
            </div>
            <span class="badge ${r.current_status === 'verified_closed' ? 'bg-success' : 'bg-warning text-dark'} small">
              ${t('report_' + r.current_status, r.current_status)}
            </span>
          </div>
          <div class="card-body-gv flex-grow-1 d-flex flex-column justify-content-between">
            <div>
              <h5 class="fw-bold mb-1">
                <a href="/reports/${r.id}" class="text-decoration-none text-dark">${r.title}</a>
              </h5>
              <div class="small text-muted mb-2">
                <i class="bi bi-geo-alt"></i> ${r.village}, ${r.block} &bull; ${r.landmark || ''}
              </div>
              <p class="small text-muted mb-3">${r.description}</p>
            </div>
            <div class="pt-3 border-top mt-auto">
              <a href="/reports/${r.id}" class="btn btn-sm btn-outline-primary w-100 text-center">
                <i class="bi bi-clock-history me-1"></i> ${lang === 'ta' ? '6 நிலை தீர்வுப் பாதை பார்க்க' : 'Track 6-Stage Timeline'} &rarr;
              </a>
            </div>
          </div>
        </div>
      </div>
    `).join("");

    listEl.querySelectorAll(".btn-copy-report-ref").forEach(btn => {
      btn.addEventListener("click", (e) => {
        e.stopPropagation();
        const ref = btn.getAttribute("data-ref");
        copyToClipboard(ref, lang === 'ta' ? 'புகார் குறிப்பு எண்' : 'Grievance Ref ID');
      });
    });
  } catch (err) {
    document.getElementById("my-reports-list").innerHTML = `<div class="col-12 alert alert-danger">${err.message}</div>`;
  }
}

/**
 * Report Detail & 6-Stage Timeline View (/reports/:id)
 */
async function renderReportDetail(container, reportId) {
  const lang = getLanguage();
  container.innerHTML = `
    <div class="text-center py-5">
      <div class="spinner-border spinner-border-sm text-primary"></div>
      <p class="mt-2 text-muted">${lang === 'ta' ? 'புகார் விவரங்கள் ஏற்றப்படுகின்றன...' : 'Loading grievance timeline...'}</p>
    </div>
  `;

  try {
    const r = await api.get(`/api/reports/${reportId}`);
    const timeline = r.timeline || [];

    const stages = [
      { key: "submitted", label: `1. ${t('report_submitted')}` },
      { key: "triaged", label: `2. ${t('report_triaged')}` },
      { key: "inspection_scheduled", label: `3. ${t('report_inspection_scheduled')}` },
      { key: "in_progress", label: `4. ${t('report_in_progress')}` },
      { key: "resolution_proposed", label: `5. ${t('report_resolution_proposed')}` },
      { key: "verified_closed", label: `6. ${t('report_verified_closed')}` }
    ];

    container.innerHTML = `
      <div class="d-flex flex-column gap-4">
        <!-- Top Navigation -->
        <div class="d-flex align-items-center justify-content-between">
          <a href="/my-reports" class="btn btn-outline-secondary btn-sm">
            <i class="bi bi-arrow-left me-1"></i> ${lang === 'ta' ? 'அனைத்து புகார்கள்' : 'Back to Grievances List'}
          </a>
          <div class="d-flex align-items-center gap-2">
            <span class="badge bg-light text-dark border px-3 py-2 fw-bold font-monospace">
              REF: ${r.reference_id}
            </span>
            <button class="btn btn-sm btn-outline-secondary" id="btn-copy-detail-ref" data-ref="${r.reference_id}" title="${lang === 'ta' ? 'புகார் எண் நகலெடு' : 'Copy Reference ID'}">
              <i class="bi bi-clipboard me-1"></i> ${lang === 'ta' ? 'நகலெடு' : 'Copy ID'}
            </button>
          </div>
        </div>

        <!-- Issue Header Card -->
        <div class="card-gv p-4" style="background: linear-gradient(135deg, var(--color-navy) 0%, #1e3a5f 100%); color: #FFFFFF;">
          <div class="d-flex flex-wrap align-items-center gap-2 mb-2">
            <span class="badge bg-danger text-uppercase">${r.category}</span>
            <span class="badge bg-warning text-dark fw-bold">${t('report_' + r.current_status, r.current_status)}</span>
            <span class="badge-demo"><i class="bi bi-shield-check"></i> ${t('demo_badge')}</span>
          </div>
          <h2 class="fw-bold mb-2">${r.title}</h2>
          <p class="mb-3 text-light" style="opacity: 0.95;">
            ${r.description}
          </p>
          <div class="row g-3 pt-3 border-top border-secondary text-light">
            <div class="col-sm-4">
              <span class="small d-block text-secondary">${lang === 'ta' ? 'இருப்பிடம்:' : 'Location:'}</span>
              <strong class="text-white">${r.village}, ${r.block} (${r.landmark || ''})</strong>
            </div>
            <div class="col-sm-4">
              <span class="small d-block text-secondary">${lang === 'ta' ? 'ஒதுக்கப்பட்ட அலுவலர்:' : 'Assigned Official:'}</span>
              <strong class="text-white">${r.assigned_official_name || (lang === 'ta' ? 'வட்டார அலுவலர் பரிசீலனையில்' : 'Pending Assignment')}</strong>
            </div>
            <div class="col-sm-4">
              <span class="small d-block text-secondary">${lang === 'ta' ? 'பதிவான நாள்:' : 'Reported On:'}</span>
              <strong class="text-white">${new Date(r.created_at).toLocaleDateString()}</strong>
            </div>
          </div>
        </div>

        <!-- 6-Stage Resolution Timeline -->
        <div class="card-gv p-4">
          <h5 class="fw-bold mb-4" style="color: var(--color-navy);"><i class="bi bi-clock-history me-2 text-primary"></i> ${lang === 'ta' ? '6 நிலை தீர்வுப் பாதை (Audit Timeline)' : '6-Stage Resolution Lifecycle'}</h5>
          
          <div class="timeline-container d-flex flex-column gap-3">
            ${stages.map((st, i) => {
              const matchedLog = timeline.find(tItem => tItem.to_status === st.key);
              const isPastOrCurrent = Boolean(matchedLog) || r.current_status === st.key;

              return `
                <div class="d-flex align-items-start gap-3 p-3 rounded ${isPastOrCurrent ? 'bg-light border-start border-success border-4' : 'opacity-75'}">
                  <div class="step-node flex-shrink-0 ${isPastOrCurrent ? 'completed' : ''}" style="width: 32px; height: 32px;">
                    ${isPastOrCurrent ? '<i class="bi bi-check-lg"></i>' : (i + 1)}
                  </div>
                  <div class="flex-grow-1">
                    <div class="d-flex justify-content-between align-items-center">
                      <h6 class="fw-bold mb-1 ${isPastOrCurrent ? 'text-dark' : 'text-muted'}">${st.label}</h6>
                      ${matchedLog ? `<span class="small text-muted font-monospace">${new Date(matchedLog.created_at).toLocaleString()}</span>` : ''}
                    </div>
                    ${matchedLog ? `
                      <p class="small text-secondary mb-1">${matchedLog.action_note}</p>
                      <span class="badge bg-light text-dark border small"><i class="bi bi-person me-1"></i> ${matchedLog.actor_name}</span>
                    ` : `<span class="small text-muted">${lang === 'ta' ? 'நிலுவையில் உள்ளது' : 'Pending verification'}</span>`}
                  </div>
                </div>
              `;
            }).join("")}
          </div>
        </div>
      </div>
    `;

    document.getElementById("btn-copy-detail-ref")?.addEventListener("click", () => {
      copyToClipboard(r.reference_id, lang === 'ta' ? 'புகார் குறிப்பு எண்' : 'Grievance Ref ID');
    });
  } catch (err) {
    container.innerHTML = `<div class="alert alert-danger">${err.message}</div>`;
  }
}

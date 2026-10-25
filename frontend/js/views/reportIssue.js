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
      <p class="mt-2 text-muted">${lang === 'ta' ? 'புகார் விவரங்கள் மற்றும் கள புகைப்படங்கள் ஏற்றப்படுகின்றன...' : 'Loading grievance timeline and work completion photos...'}</p>
    </div>
  `;

  try {
    const [r, photos, questions] = await Promise.all([
      api.get(`/api/reports/${reportId}`),
      api.get(`/api/reports/${reportId}/photos`).catch(() => []),
      api.get(`/api/reports/${reportId}/questions`).catch(() => [])
    ]);

    const timeline = r.timeline || [];
    const workPhotos = photos || r.completion_photos || [];
    const user = auth.getUser();

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
            <span class="badge bg-success"><i class="bi bi-shield-check"></i> PUBLIC TRANSPARENCY</span>
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

        <!-- FEATURE 1: GOVERNMENT WORK COMPLETION & PROGRESS PHOTO TRANSPARENCY -->
        <div class="card-gv p-4">
          <div class="d-flex flex-wrap align-items-center justify-content-between gap-3 mb-3 pb-2 border-bottom">
            <div>
              <h5 class="fw-bold mb-1" style="color: var(--color-navy);">
                <i class="bi bi-camera-fill me-2 text-success"></i>
                ${lang === 'ta' ? 'அரசு பணி நிறைவு & கள முன்னேற்ற புகைப்படங்கள் (Transparency)' : 'Government Work Completion & Progress Photos'}
              </h5>
              <p class="small text-muted mb-0">
                ${lang === 'ta' ? 'அரசு அலுவலர்களால் கள ஆய்வு செய்து பதிவேற்றப்பட்ட நேரடி புகைப்படங்கள் மற்றும் பணி விவரம்.' : 'Official photographic evidence and technical sign-off notes uploaded directly by field engineers.'}
              </p>
            </div>
            ${workPhotos.length > 0 ? `
              <button class="btn btn-gv-saffron btn-sm" id="btn-trigger-ask-question">
                <i class="bi bi-question-circle-fill me-1"></i> ${lang === 'ta' ? 'கேள்வி எழுப்புக / சரிபார்ப்பு கோரிக்கை' : 'Ask a Question / Request Verification'}
              </button>
            ` : ''}
          </div>

          ${workPhotos.length > 0 ? `
            <div class="row g-3">
              ${workPhotos.map((p, pIdx) => `
                <div class="col-md-6 col-lg-4">
                  <div class="card h-100 border shadow-sm rounded overflow-hidden">
                    <div class="position-relative" style="height: 180px; background: #f1f5f9; cursor: pointer;" onclick="window.openWorkPhotoModal('${p.photo_url}', '${encodeURIComponent(p.description)}')">
                      <img src="${p.photo_url}" alt="Work Evidence Photo" style="width: 100%; height: 100%; object-fit: cover;">
                      <span class="badge ${p.is_completion ? 'bg-success' : 'bg-primary'} position-absolute top-0 start-0 m-2 shadow-sm">
                        <i class="bi ${p.is_completion ? 'bi-check-circle-fill' : 'bi-hourglass-split'} me-1"></i>
                        ${p.is_completion ? (lang === 'ta' ? 'பணி நிறைவு சான்று' : 'COMPLETION PHOTO') : (lang === 'ta' ? 'கள முன்னேற்றம்' : 'PROGRESS EVIDENCE')}
                      </span>
                      <div class="position-absolute bottom-0 end-0 m-2">
                        <span class="badge bg-dark bg-opacity-75 text-white small"><i class="bi bi-arrows-fullscreen me-1"></i> ${lang === 'ta' ? 'பெரிதாக்கு' : 'Click to View'}</span>
                      </div>
                    </div>
                    <div class="card-body p-3 d-flex flex-column justify-content-between">
                      <div>
                        <p class="fw-semibold text-dark small mb-2" style="line-height: 1.4;">${p.description}</p>
                      </div>
                      <div class="pt-2 border-top text-muted small">
                        <div class="d-flex justify-content-between mb-1">
                          <span><strong>${lang === 'ta' ? 'பதிவேற்றியவர்:' : 'Uploader:'}</strong></span>
                          <span>${p.uploader_name}</span>
                        </div>
                        <div class="d-flex justify-content-between mb-2">
                          <span><strong>${lang === 'ta' ? 'தேதி:' : 'Date:'}</strong></span>
                          <span>${new Date(p.created_at).toLocaleDateString()}</span>
                        </div>
                        <button class="btn btn-outline-primary btn-sm w-100 btn-ask-photo-q" data-photo="${p.photo_url}">
                          <i class="bi bi-chat-square-dots me-1"></i> ${lang === 'ta' ? 'இப்புகைப்படம் குறித்து கேள்வி கேள்' : 'Ask Question on this Photo'}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              `).join("")}
            </div>
          ` : `
            <div class="p-4 rounded bg-light border text-center text-muted">
              <i class="bi bi-clock-history mb-2" style="font-size: 2rem;"></i>
              <h6 class="fw-bold mb-1">${lang === 'ta' ? 'களப் பணி நிறைவு புகைப்படம் விரைவில் பதிவேற்றப்படும்' : 'Official Work Completion Evidence Pending'}</h6>
              <p class="small mb-0">${lang === 'ta' ? 'ஒதுக்கப்பட்ட வட்டார அலுவலர் மற்றும் பொறியாளர் கள ஆய்வு முடித்து பணிகளை நிறைவு செய்யும் போது புகைப்பட சான்றுகள் இங்கு நேரடியாக காண்பிக்கப்படும்.' : 'Once the assigned BDO and field engineers complete physical repairs, verified completion photos will appear directly in this gallery.'}</p>
            </div>
          `}
        </div>

        <!-- FEATURE 1: CITIZEN QUESTIONS & VERIFICATION INQUIRIES -->
        <div class="card-gv p-4">
          <div class="d-flex flex-wrap align-items-center justify-content-between gap-3 mb-3 pb-2 border-bottom">
            <div>
              <h5 class="fw-bold mb-1" style="color: var(--color-navy);">
                <i class="bi bi-patch-question-fill me-2 text-warning"></i>
                ${lang === 'ta' ? 'குடிமக்கள் சரிபார்ப்பு கேள்விகள் & நிர்வாக பதில்கள்' : 'Citizen Verification Questions & Official Responses'}
              </h5>
              <p class="small text-muted mb-0">
                ${lang === 'ta' ? 'பணி நிறைவு குறித்து குடிமக்கள் எழுப்பும் கேள்விகள் மற்றும் மாநில நிர்வாகத்தின் அதிகாரப்பூர்வ விளக்கம்.' : 'Direct transparency inquiries raised by citizens regarding completion evidence and administrative answers.'}
              </p>
            </div>
            <button class="btn btn-outline-warning btn-sm" id="btn-open-ask-modal-2">
              <i class="bi bi-pencil-square me-1"></i> ${lang === 'ta' ? 'புதிய கேள்வி எழுப்புக' : 'Ask Verification Question'}
            </button>
          </div>

          <!-- Question Form Box (Collapsible / Dynamic) -->
          <div id="ask-question-form-box" class="p-3 mb-4 rounded border bg-light-subtle" style="display: none;">
            <h6 class="fw-bold text-dark mb-2"><i class="bi bi-chat-dots-fill text-warning me-1"></i> ${lang === 'ta' ? 'பணி நிறைவு குறித்த உங்கள் கேள்வியை பதிவு செய்க' : 'Submit Question or Verification Request'}</h6>
            <div class="mb-2">
              <label class="form-label small fw-semibold">${lang === 'ta' ? 'பொதுவான உதாரண கேள்வி (Quick Templates):' : 'Suggested Inquiries:'}</label>
              <div class="d-flex gap-2 flex-wrap mb-2">
                <button type="button" class="btn btn-xs btn-outline-secondary btn-template-q" data-q="I need to verify whether this work has actually been completed.">
                  "I need to verify whether this work has actually been completed."
                </button>
                <button type="button" class="btn btn-xs btn-outline-secondary btn-template-q" data-q="The uploaded photo does not show the drainage valve replacement. Please provide clarification.">
                  "The photo does not show the drainage valve replacement. Please clarify."
                </button>
              </div>
            </div>
            <div class="mb-3">
              <label class="form-label small fw-semibold">${lang === 'ta' ? 'விளக்கம் தேவைப்படும் விவரம் (Explanation):' : 'What needs clarification?'}</label>
              <textarea class="form-control form-control-sm" id="input-verification-q-text" rows="3" placeholder="${lang === 'ta' ? 'எ.கா: இப்பணி உண்மையில் முடிந்துவிட்டதா என்பதை கள ஆய்வு செய்து உறுதிப்படுத்த வேண்டும்...' : 'Explain your inquiry regarding the photo evidence, materials used, or completion status...'}" required minlength="10"></textarea>
            </div>
            <div class="d-flex justify-content-end gap-2">
              <button type="button" class="btn btn-outline-secondary btn-sm" id="btn-cancel-ask-q">${lang === 'ta' ? 'ரத்து செய்' : 'Cancel'}</button>
              <button type="button" class="btn btn-gv-saffron btn-sm fw-bold" id="btn-submit-verification-q">
                <i class="bi bi-send-fill me-1"></i> ${lang === 'ta' ? 'கேள்வியை சமர்ப்பி' : 'Submit Verification Question'}
              </button>
            </div>
          </div>

          <!-- Questions List -->
          ${questions.length > 0 ? `
            <div class="d-flex flex-column gap-3">
              ${questions.map(q => {
                const statusBadgeClass = q.status === 'answered' ? 'bg-success' : (q.status === 'closed' ? 'bg-secondary' : 'bg-warning text-dark');
                const statusLabel = q.status === 'answered' ? (lang === 'ta' ? 'பதிலளிக்கப்பட்டது' : 'Answered') : (q.status === 'closed' ? (lang === 'ta' ? 'நிறைவுற்றது' : 'Closed') : (lang === 'ta' ? 'பரிசீலனையில்' : 'Open / Pending Answer'));
                
                return `
                  <div class="p-3 rounded border bg-white shadow-sm">
                    <div class="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-2">
                      <div class="d-flex align-items-center gap-2">
                        <span class="badge ${statusBadgeClass}">${statusLabel}</span>
                        <strong class="text-dark small"><i class="bi bi-person-fill text-muted me-1"></i> ${q.citizen_name}</strong>
                      </div>
                      <span class="small text-muted font-monospace">${new Date(q.created_at).toLocaleString()}</span>
                    </div>

                    <p class="mb-2 text-dark" style="font-size: 0.95rem;">${q.question_text}</p>

                    ${q.photo_url ? `
                      <div class="mb-2 p-2 bg-light rounded d-inline-flex align-items-center gap-2 border">
                        <img src="${q.photo_url}" style="width: 40px; height: 40px; object-fit: cover; border-radius: 4px;" alt="Referenced Photo">
                        <span class="small text-muted">${lang === 'ta' ? 'குறிப்பிடப்பட்ட களப் புகைப்படம்' : 'Referenced Completion Photo'}</span>
                      </div>
                    ` : ''}

                    <!-- Conversation Thread / Messages -->
                    ${(q.messages && q.messages.length > 1) ? `
                      <div class="p-3 my-2 rounded bg-light border-start border-3 border-primary d-flex flex-column gap-2">
                        <span class="small fw-bold text-primary mb-1"><i class="bi bi-chat-left-text me-1"></i> ${lang === 'ta' ? 'உரையாடல் வரலாறு (Conversation History):' : 'Verification Discussion:'}</span>
                        ${q.messages.slice(1).map(m => `
                          <div class="p-2 rounded ${m.sender_role === 'admin' ? 'bg-primary-subtle border border-primary-subtle' : 'bg-white border'}">
                            <div class="d-flex justify-content-between align-items-center mb-1">
                              <span class="small fw-bold ${m.sender_role === 'admin' ? 'text-primary' : 'text-dark'}">
                                ${m.sender_role === 'admin' ? '<i class="bi bi-shield-check text-primary me-1"></i> System Administrator' : '<i class="bi bi-person me-1"></i> ' + m.sender_name}
                              </span>
                              <span class="small text-muted" style="font-size: 0.75rem;">${new Date(m.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                            </div>
                            <p class="small mb-0 text-secondary">${m.message}</p>
                          </div>
                        `).join("")}
                      </div>
                    ` : (q.admin_response ? `
                      <div class="p-3 my-2 rounded bg-success-subtle border border-success-subtle">
                        <div class="d-flex justify-content-between align-items-center mb-1">
                          <span class="small fw-bold text-success"><i class="bi bi-shield-check me-1"></i> ${lang === 'ta' ? 'நிர்வாகியின் அதிகாரப்பூர்வ பதில்' : 'Administrative Verification Response'}</span>
                          <span class="small text-muted">${q.admin_responder_name || 'State Governance Admin'}</span>
                        </div>
                        <p class="small mb-0 text-success-emphasis">${q.admin_response}</p>
                      </div>
                    ` : '')}

                    <!-- Reply Box for Citizen -->
                    <div class="mt-2 pt-2 border-top d-flex gap-2">
                      <input type="text" class="form-control form-control-sm input-reply-q" data-qid="${q.id}" placeholder="${lang === 'ta' ? 'மேலும் விளக்கம் அல்லது பதில் எழுதுக...' : 'Write follow-up reply to continue conversation...'}">
                      <button class="btn btn-sm btn-outline-primary btn-send-q-reply" data-qid="${q.id}">
                        <i class="bi bi-reply-fill me-1"></i> ${lang === 'ta' ? 'பதில் அனுப்பு' : 'Reply'}
                      </button>
                    </div>
                  </div>
                `;
              }).join("")}
            </div>
          ` : `
            <div class="p-3 rounded bg-light text-center text-muted small">
              <i class="bi bi-chat-square-text mb-1 d-block" style="font-size: 1.5rem;"></i>
              ${lang === 'ta' ? 'இப்புகாரின் பணி நிறைவு அல்லது புகைப்படங்கள் குறித்து இதுவரை கேள்விகள் ஏதுமில்லை.' : 'No verification questions have been raised yet for this complaint.'}
            </div>
          `}
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

      <!-- Photo Modal Lightbox -->
      <div class="modal fade" id="modalWorkPhotoLightbox" tabindex="-1" aria-hidden="true">
        <div class="modal-dialog modal-lg modal-dialog-centered">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title fw-bold" id="lightbox-modal-title">
                <i class="bi bi-camera me-1 text-success"></i> ${lang === 'ta' ? 'களப் பணி நிறைவு புகைப்படம் (முழு அளவு)' : 'Work Completion Evidence (Full Size)'}
              </h5>
              <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div class="modal-body text-center p-2 bg-black">
              <img id="lightbox-modal-img" src="" class="img-fluid rounded" style="max-height: 75vh; object-fit: contain;">
            </div>
            <div class="modal-footer justify-content-between bg-light">
              <p class="small mb-0 text-muted" id="lightbox-modal-desc"></p>
              <button type="button" class="btn btn-secondary btn-sm" data-bs-dismiss="modal">${lang === 'ta' ? 'மூடுக' : 'Close'}</button>
            </div>
          </div>
        </div>
      </div>
    `;

    // Global modal trigger for photo lightbox
    window.openWorkPhotoModal = (imgUrl, descEncoded) => {
      const img = document.getElementById("lightbox-modal-img");
      const descEl = document.getElementById("lightbox-modal-desc");
      if (img) img.src = imgUrl;
      if (descEl) descEl.textContent = decodeURIComponent(descEncoded);
      const modalEl = document.getElementById("modalWorkPhotoLightbox");
      if (modalEl && window.bootstrap) {
        const modal = new window.bootstrap.Modal(modalEl);
        modal.show();
      } else {
        window.open(imgUrl, "_blank");
      }
    };

    // Toggle Ask Question Form Box
    const askBox = document.getElementById("ask-question-form-box");
    const openAskForm = (photoUrl = null) => {
      if (askBox) {
        askBox.style.display = "block";
        askBox.scrollIntoView({ behavior: "smooth" });
        if (photoUrl) {
          askBox.setAttribute("data-linked-photo", photoUrl);
        }
      }
    };

    document.getElementById("btn-trigger-ask-question")?.addEventListener("click", () => openAskForm());
    document.getElementById("btn-open-ask-modal-2")?.addEventListener("click", () => openAskForm());
    document.getElementById("btn-cancel-ask-q")?.addEventListener("click", () => {
      if (askBox) askBox.style.display = "none";
    });

    // Quick templates
    container.querySelectorAll(".btn-template-q").forEach(btn => {
      btn.addEventListener("click", () => {
        const textInput = document.getElementById("input-verification-q-text");
        if (textInput) textInput.value = btn.getAttribute("data-q");
      });
    });

    // Ask Question on Specific Photo button
    container.querySelectorAll(".btn-ask-photo-q").forEach(btn => {
      btn.addEventListener("click", () => {
        const photoUrl = btn.getAttribute("data-photo");
        openAskForm(photoUrl);
      });
    });

    // Submit Verification Question
    document.getElementById("btn-submit-verification-q")?.addEventListener("click", async () => {
      const textInput = document.getElementById("input-verification-q-text");
      const qText = textInput?.value?.trim();
      const linkedPhoto = askBox?.getAttribute("data-linked-photo") || null;

      if (!qText || qText.length < 10) {
        alert(lang === 'ta' ? 'தயவுசெய்து உங்கள் கேள்வியை விளக்கமாக எழுதவும் (குறைந்தது 10 எழுத்துக்கள்).' : 'Please enter a clear inquiry of at least 10 characters.');
        textInput?.focus();
        return;
      }

      try {
        await api.post(`/api/reports/${reportId}/questions`, {
          question_text: qText,
          photo_url: linkedPhoto
        });
        showToast(lang === 'ta' ? 'கேள்வி வெற்றிகரமாக சமர்ப்பிக்கப்பட்டது!' : 'Verification question submitted successfully!', 'success');
        renderReportDetail(container, reportId);
      } catch (err) {
        alert("Failed to submit question: " + err.message);
      }
    });

    // Reply to Question thread
    container.querySelectorAll(".btn-send-q-reply").forEach(btn => {
      btn.addEventListener("click", async () => {
        const qid = btn.getAttribute("data-qid");
        const input = container.querySelector(`.input-reply-q[data-qid="${qid}"]`);
        const replyText = input?.value?.trim();
        if (!replyText || replyText.length < 2) return;

        try {
          await api.post(`/api/reports/questions/${qid}/reply`, { message: replyText });
          showToast(lang === 'ta' ? 'பதில் பதிவு செய்யப்பட்டது!' : 'Reply posted successfully!', 'success');
          renderReportDetail(container, reportId);
        } catch (err) {
          alert("Reply failed: " + err.message);
        }
      });
    });

    document.getElementById("btn-copy-detail-ref")?.addEventListener("click", () => {
      copyToClipboard(r.reference_id, lang === 'ta' ? 'புகார் குறிப்பு எண்' : 'Grievance Ref ID');
    });
  } catch (err) {
    container.innerHTML = `<div class="alert alert-danger">${err.message}</div>`;
  }
}

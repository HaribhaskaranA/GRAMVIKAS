/**
 * GRAMVIKAS AI - Schemes Discovery, Scheme Detail & Saved Schemes Views.
 * 100% Multilingual in Tamil (ta), Hindi (hi), and English (en).
 */

import { api } from "../api.js";
import { auth } from "../auth.js";
import { getLanguage, t, localizeField } from "../i18n.js";
import { showToast } from "../components/toast.js";

export async function renderSchemes(container, schemeId = null) {
  if (typeof schemeId === "string" && schemeId.trim() !== "" && schemeId !== "undefined" && schemeId !== "null" && schemeId !== "schemes") {
    return renderSchemeDetail(container, schemeId);
  }

  const lang = getLanguage();

  container.innerHTML = `
    <div class="d-flex flex-column gap-4">
      <!-- Search & Header Bar -->
      <div class="d-flex flex-wrap align-items-center justify-content-between gap-3">
        <div>
          <h3 class="fw-bold mb-1" style="color: var(--color-navy);"><i class="bi bi-card-checklist me-2 text-success"></i> ${lang === 'ta' ? 'அரசு நலத்திட்டங்கள்' : (lang === 'hi' ? 'सरकारी कल्याणकारी योजनाएं' : 'Government Welfare Schemes')}</h3>
          <p class="text-muted mb-0 small">${lang === 'ta' ? 'கிராம மக்களின் வாழ்வாதாரத்தை மேம்படுத்தும் மத்திய மற்றும் மாநில அரசுகளின் நலத்திட்டங்கள்.' : 'Verified central and state government entitlements for rural citizen empowerment.'}</p>
        </div>
        <div class="d-flex gap-2">
          <a href="/saved-schemes" class="btn btn-outline-secondary btn-sm">
            <i class="bi bi-bookmark-heart me-1"></i> ${t('nav_saved_schemes')}
          </a>
        </div>
      </div>

      <!-- Filters & Search Input -->
      <div class="card-gv p-3">
        <div class="row g-2 align-items-center">
          <div class="col-md-6 col-lg-5">
            <div class="input-group input-group-sm">
              <span class="input-group-text bg-white"><i class="bi bi-search"></i></span>
              <input type="text" class="form-control" id="scheme-search-input" placeholder="${lang === 'ta' ? 'திட்டம் அல்லது துறை தேட...' : 'Search PM-KISAN, Housing, Health, Water...'}">
              <button class="btn btn-outline-secondary" type="button" id="btn-scheme-voice-search" title="${lang === 'ta' ? 'குரல் வழி தேடல்' : 'Voice Search'}">
                <i class="bi bi-mic-fill text-danger"></i>
              </button>
            </div>
          </div>
          <div class="col-md-6 col-lg-7 d-flex flex-wrap gap-1 justify-content-md-end" id="category-filter-pills">
            <button class="btn btn-sm btn-gv-primary filter-pill active" data-cat="all">${lang === 'ta' ? 'அனைத்தும்' : (lang === 'hi' ? 'सभी' : 'All')}</button>
            <button class="btn btn-sm btn-outline-secondary filter-pill" data-cat="Agriculture">${lang === 'ta' ? 'விவசாயம்' : 'Agriculture'}</button>
            <button class="btn btn-sm btn-outline-secondary filter-pill" data-cat="Housing">${lang === 'ta' ? 'வீட்டு வசதி' : 'Housing'}</button>
            <button class="btn btn-sm btn-outline-secondary filter-pill" data-cat="Employment">${lang === 'ta' ? 'வேலைவாய்ப்பு' : 'Employment'}</button>
            <button class="btn btn-sm btn-outline-secondary filter-pill" data-cat="Education">${lang === 'ta' ? 'கல்வி' : 'Education'}</button>
            <button class="btn btn-sm btn-outline-secondary filter-pill" data-cat="Drinking Water">${lang === 'ta' ? 'குடிநீர்' : 'Water'}</button>
            <button class="btn btn-sm btn-outline-secondary filter-pill" data-cat="Health">${lang === 'ta' ? 'மருத்துவம்' : 'Health'}</button>
          </div>
        </div>
      </div>

      <!-- Schemes Grid Container -->
      <div class="row g-4" id="schemes-grid">
        <div class="col-12 text-center py-5 text-muted">
          <div class="spinner-border spinner-border-sm text-primary mb-2"></div>
          <div>${lang === 'ta' ? 'அரசு திட்டங்கள் ஏற்றப்படுகின்றன...' : 'Loading verified government schemes...'}</div>
        </div>
      </div>
    </div>
  `;

  let currentCategory = "all";
  let currentSearch = "";

  async function loadSchemes() {
    const grid = document.getElementById("schemes-grid");
    if (!grid) return;

    try {
      const schemes = await api.get("/api/schemes", {
        category: currentCategory,
        search: currentSearch
      });

      if (!schemes.length) {
        grid.innerHTML = `
          <div class="col-12 text-center py-5 text-muted">
            <i class="bi bi-inbox" style="font-size: 2.5rem;"></i>
            <h5 class="mt-2 text-dark">${lang === 'ta' ? 'திட்டங்கள் எதுவும் காணப்படவில்லை' : 'No Schemes Found'}</h5>
            <p class="small mb-0">${lang === 'ta' ? 'தேடல் சொற்களை மாற்றி அல்லது வேறு பிரிவை தேர்வு செய்து முயற்சிக்கவும்.' : 'Try clearing your search term or selecting another category.'}</p>
          </div>
        `;
        return;
      }

      grid.innerHTML = schemes.map(s => {
        const title = localizeField(s, "title");
        const summary = localizeField(s, "short_summary");
        const benefitText = s.financial_benefit_amount > 0 ? `₹${s.financial_benefit_amount.toLocaleString('en-IN')}` : (lang === 'ta' ? 'நேரடி சேவை' : 'Direct Service');

        return `
          <div class="col-md-6 col-lg-4">
            <div class="card-gv h-100 d-flex flex-column">
              <div class="card-header-gv">
                <span class="badge bg-light text-dark border small">${s.category}</span>
                <span class="badge ${s.level === 'central' ? 'bg-primary' : 'bg-success'} text-uppercase" style="font-size: 0.68rem;">
                  ${s.level === 'central' ? (lang === 'ta' ? 'மத்திய அரசு' : 'Central Govt') : (lang === 'ta' ? 'மாநில அரசு' : 'State Govt')}
                </span>
              </div>
              <div class="card-body-gv flex-grow-1 d-flex flex-column justify-content-between">
                <div>
                  <h5 class="fw-bold mb-1" style="font-size: 1.05rem;">
                    <a href="/schemes/${s.id}" class="text-decoration-none text-dark">${title}</a>
                  </h5>
                  <p class="small text-muted mb-3" style="min-height: 48px;">${summary}</p>
                </div>
                <div class="pt-3 border-top mt-auto">
                  <div class="d-flex align-items-center justify-content-between mb-3">
                    <span class="small text-muted">${lang === 'ta' ? 'நிதி உதவி:' : 'Benefit Amount:'}</span>
                    <span class="fw-bold text-success" style="font-size: 1.15rem;">${benefitText}</span>
                  </div>
                  <div class="d-flex gap-2">
                    <a href="/schemes/${s.id}" class="btn btn-sm btn-gv-primary flex-grow-1 text-center">
                      <i class="bi bi-info-circle me-1"></i> ${lang === 'ta' ? 'முழு விவரம் & தகுதி' : 'Details & Eligibility'}
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        `;
      }).join("");
    } catch (err) {
      grid.innerHTML = `<div class="col-12 alert alert-danger">${lang === 'ta' ? 'திட்டங்கள் ஏற்றுவதில் பிழை' : 'Error loading schemes'}: ${err.message}</div>`;
    }
  }

  // Filter pills events
  container.querySelectorAll(".filter-pill").forEach(btn => {
    btn.addEventListener("click", (e) => {
      container.querySelectorAll(".filter-pill").forEach(b => {
        b.classList.remove("active", "btn-gv-primary");
        b.classList.add("btn-outline-secondary");
      });
      e.target.classList.add("active", "btn-gv-primary");
      e.target.classList.remove("btn-outline-secondary");
      currentCategory = e.target.getAttribute("data-cat");
      loadSchemes();
    });
  });

  // Search input events
  const searchInput = document.getElementById("scheme-search-input");
  let debounceTimer;
  searchInput?.addEventListener("input", (e) => {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
      currentSearch = e.target.value;
      loadSchemes();
    }, 300);
  });

  // Voice Search Handler
  const voiceSearchBtn = document.getElementById("btn-scheme-voice-search");
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (SpeechRecognition && voiceSearchBtn) {
    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onstart = () => {
      voiceSearchBtn.classList.remove("btn-outline-secondary");
      voiceSearchBtn.classList.add("btn-danger");
      showToast(lang === 'ta' ? "கேட்கிறது... பேசவும்" : "Listening... Speak your search", "info", 2000);
    };

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      if (searchInput) {
        searchInput.value = transcript;
        currentSearch = transcript;
        loadSchemes();
      }
      showToast(lang === 'ta' ? `தேடல்: "${transcript}"` : `Searched: "${transcript}"`, "success", 2000);
    };

    recognition.onend = () => {
      voiceSearchBtn.classList.remove("btn-danger");
      voiceSearchBtn.classList.add("btn-outline-secondary");
    };

    recognition.onerror = () => {
      voiceSearchBtn.classList.remove("btn-danger");
      voiceSearchBtn.classList.add("btn-outline-secondary");
    };

    voiceSearchBtn.addEventListener("click", () => {
      recognition.lang = lang === 'ta' ? 'ta-IN' : (lang === 'hi' ? 'hi-IN' : 'en-IN');
      try {
        recognition.start();
      } catch (err) {
        recognition.stop();
      }
    });
  } else if (voiceSearchBtn) {
    voiceSearchBtn.style.display = "none";
  }

  loadSchemes();
}

/**
 * Scheme Detail View (/schemes/:id)
 */
async function renderSchemeDetail(container, schemeId) {
  const lang = getLanguage();
  container.innerHTML = `
    <div class="text-center py-5">
      <div class="spinner-border spinner-border-sm text-primary"></div>
      <p class="mt-2 text-muted">${lang === 'ta' ? 'திட்ட விவரங்கள் ஏற்றப்படுகின்றன...' : 'Loading scheme details...'}</p>
    </div>
  `;

  try {
    const s = await api.get(`/api/schemes/${schemeId}`);
    const title = localizeField(s, "title");
    const desc = localizeField(s, "detailed_description") || s.detailed_description_en;
    const crit = s.criteria || {};
    const steps = (lang === 'ta' && crit.application_steps_ta) || (lang === 'hi' && crit.application_steps_hi) || crit.application_steps_en || [];
    const benefitText = s.financial_benefit_amount > 0 ? `₹${s.financial_benefit_amount.toLocaleString('en-IN')}` : (lang === 'ta' ? 'நேரடி சேவை' : 'Direct Service');

    container.innerHTML = `
      <div class="d-flex flex-column gap-4">
        <!-- Breadcrumb, Print & Save Action Bar -->
        <div class="d-flex flex-wrap align-items-center justify-content-between gap-2">
          <a href="/schemes" class="btn btn-outline-secondary btn-sm">
            <i class="bi bi-arrow-left me-1"></i> ${lang === 'ta' ? 'அனைத்து திட்டங்கள்' : 'Back to Schemes Catalog'}
          </a>
          <div class="d-flex gap-2">
            <button class="btn btn-outline-dark btn-sm" id="btn-print-scheme" title="Print for e-Sevai / CSC Center">
              <i class="bi bi-printer me-1"></i> ${lang === 'ta' ? '🖨️ ஆவணம் அச்சிடுக (Print)' : '🖨️ Print Checklist'}
            </button>
            <button class="btn btn-outline-danger btn-sm" id="btn-save-this-scheme">
              <i class="bi bi-bookmark-heart me-1"></i> ${lang === 'ta' ? 'சேமித்து வைக்க' : 'Save to My Schemes'}
            </button>
          </div>
        </div>

        <!-- Printable Official Letterhead for e-Sevai & CSC Centres -->
        <div class="print-only-header">
          <div class="d-flex align-items-center justify-content-between">
            <div>
              <h2 class="fw-bold mb-0" style="color: var(--color-primary);">GRAMVIKAS AI - GOVERNMENT WELFARE PORTAL</h2>
              <p class="small mb-0 text-muted">e-Sevai / Common Service Centre (CSC) Official Citizen Document Checklist</p>
            </div>
            <div class="text-end small">
              <strong>Printed On:</strong> ${new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}<br>
              <span class="font-monospace text-muted">ID: ${s.id}</span>
            </div>
          </div>
        </div>

        <!-- Scheme Title Banner -->
        <div class="card-gv p-4" style="background: linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-dark) 100%); color: #FFFFFF;">
          <div class="d-flex flex-wrap align-items-center gap-2 mb-2">
            <span class="badge bg-warning text-dark fw-bold">${s.category}</span>
            <span class="badge bg-light text-dark fw-bold">${s.level === 'central' ? (lang === 'ta' ? 'மத்திய அரசு திட்டம்' : 'CENTRAL SCHEME') : (lang === 'ta' ? 'மாநில அரசு திட்டம்' : 'STATE SCHEME')}</span>
            <span class="badge-demo"><i class="bi bi-shield-check"></i> ${t('demo_badge')}</span>
          </div>
          <h2 class="fw-bold mb-2">${title}</h2>
          <p class="mb-3 text-light" style="opacity: 0.95; max-width: 900px;">
            ${desc}
          </p>
          <div class="d-flex flex-wrap gap-4 pt-2 border-top border-secondary">
            <div>
              <span class="small text-light d-block" style="opacity: 0.8;">${lang === 'ta' ? 'துறை:' : 'Department:'}</span>
              <span class="fw-semibold">${s.department}</span>
            </div>
            <div>
              <span class="small text-light d-block" style="opacity: 0.8;">${lang === 'ta' ? 'நிதி உதவித்தொகை:' : 'Financial Assistance:'}</span>
              <span class="fw-bold text-warning" style="font-size: 1.25rem;">${benefitText}</span>
            </div>
            <div>
              <span class="small text-light d-block" style="opacity: 0.8;">${lang === 'ta' ? 'உதவி எண்:' : 'Official Helpline:'}</span>
              <span class="fw-semibold">${s.helpline_number || '1800-425-4567'}</span>
            </div>
          </div>
        </div>

        <!-- Detail Columns -->
        <div class="row g-4">
          <!-- Left Column: Criteria & Steps -->
          <div class="col-lg-7 d-flex flex-column gap-4">
            <!-- Required Documents Checklist -->
            <div class="card-gv p-4">
              <h5 class="fw-bold mb-3" style="color: var(--color-navy);"><i class="bi bi-file-earmark-check me-2 text-primary"></i> ${lang === 'ta' ? 'தேவையான ஆவணங்கள்' : 'Required Verification Documents'}</h5>
              <ul class="list-group list-group-flush">
                ${(crit.required_documents || []).map(doc => `
                  <li class="list-group-item d-flex align-items-center gap-2 px-0 py-2 border-bottom">
                    <i class="bi bi-check-circle-fill text-success"></i>
                    <span class="fw-medium text-dark">${doc}</span>
                  </li>
                `).join("")}
              </ul>
            </div>

            <!-- Application Steps -->
            <div class="card-gv p-4">
              <h5 class="fw-bold mb-3" style="color: var(--color-navy);"><i class="bi bi-signpost-split me-2 text-warning"></i> ${lang === 'ta' ? 'விண்ணப்பிக்கும் வழிமுறைகள்' : 'Step-by-Step Application Procedure'}</h5>
              <div class="d-flex flex-column gap-3">
                ${steps.map((st, i) => `
                  <div class="d-flex align-items-start gap-3">
                    <div class="step-node flex-shrink-0" style="width: 28px; height: 28px; font-size: 0.85rem; background: var(--color-green); color: #FFF; border-color: var(--color-green);">
                      ${i + 1}
                    </div>
                    <div>
                      <div class="fw-semibold text-dark">${st}</div>
                    </div>
                  </div>
                `).join("")}
              </div>
              ${s.official_portal_url ? `
                <div class="mt-4 pt-3 border-top d-flex flex-wrap gap-2 align-items-center">
                  <a href="${s.official_portal_url}" target="_blank" rel="noopener" class="btn btn-outline-primary btn-sm">
                    <i class="bi bi-box-arrow-up-right me-1"></i> ${lang === 'ta' ? 'அரசு அதிகாரப்பூர்வ இணையதளம் செல்ல' : 'Visit Official Government Portal'}
                  </a>
                  <button class="btn btn-sm btn-outline-secondary btn-copy-portal" data-url="${s.official_portal_url}">
                    <i class="bi bi-clipboard me-1"></i> ${lang === 'ta' ? 'இணைப்பு நகலெடு' : 'Copy URL'}
                  </button>
                </div>
              ` : ''}
            </div>
          </div>

          <!-- Right Column: Interactive Profile Eligibility Checker -->
          <div class="col-lg-5">
            <div class="card-gv p-4 h-100">
              <h5 class="fw-bold mb-2" style="color: var(--color-navy);"><i class="bi bi-shield-check me-2 text-success"></i> ${lang === 'ta' ? 'தனிநபர் தகுதி சரிபார்ப்பு' : 'Eligibility Evaluation'}</h5>
              <p class="small text-muted mb-3">${lang === 'ta' ? 'உங்கள் தற்போதைய தகவல்களின் அடிப்படையில் இந்த திட்டத்திற்கு தகுதி உள்ளதா என சரிபார்க்கவும்.' : 'Evaluate your logged-in attributes against the mandatory scheme criteria.'}</p>

              <form id="form-evaluate-scheme" class="d-flex flex-column gap-3">
                <div class="row g-2">
                  <div class="col-6">
                    <label class="form-label small fw-semibold">${lang === 'ta' ? 'வயது' : 'Age'}</label>
                    <input type="number" class="form-control form-control-sm" id="eval-age" value="42">
                  </div>
                  <div class="col-6">
                    <label class="form-label small fw-semibold">${lang === 'ta' ? 'பாலினம்' : 'Gender'}</label>
                    <select class="form-select form-select-sm" id="eval-gender">
                      <option value="male">${lang === 'ta' ? 'ஆண்' : 'Male'}</option>
                      <option value="female">${lang === 'ta' ? 'பெண்' : 'Female'}</option>
                      <option value="other">${lang === 'ta' ? 'மற்றவை' : 'Other'}</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label class="form-label small fw-semibold">${lang === 'ta' ? 'ஆண்டு குடும்ப வருமானம் (₹)' : 'Annual Income (₹)'}</label>
                  <input type="number" class="form-control form-control-sm" id="eval-income" value="75000">
                </div>

                <div class="row g-2">
                  <div class="col-6">
                    <label class="form-label small fw-semibold">${lang === 'ta' ? 'தொழில்' : 'Occupation'}</label>
                    <select class="form-select form-select-sm" id="eval-occupation">
                      <option value="farmer">${lang === 'ta' ? 'விவசாயி' : 'Farmer'}</option>
                      <option value="daily_wage">${lang === 'ta' ? 'கூலித் தொழிலாளி' : 'Daily Wage Worker'}</option>
                      <option value="student">${lang === 'ta' ? 'மாணவர்' : 'Student'}</option>
                      <option value="unemployed">${lang === 'ta' ? 'வேலையற்றவர்' : 'Unemployed'}</option>
                    </select>
                  </div>
                  <div class="col-6">
                    <label class="form-label small fw-semibold">${lang === 'ta' ? 'நிலம் (ஏக்கர்)' : 'Land (Acres)'}</label>
                    <input type="number" step="0.1" class="form-control form-control-sm" id="eval-land" value="1.8">
                  </div>
                </div>

                <button type="submit" class="btn btn-gv-primary w-100 btn-sm">
                  <i class="bi bi-cpu me-1"></i> ${lang === 'ta' ? 'தகுதியை சரிபார்' : 'Check My Eligibility'}
                </button>
              </form>

              <div id="eval-result-container" class="mt-3"></div>
            </div>
          </div>
        </div>
      </div>
    `;

    // Print Scheme Document Handler for CSC / e-Sevai
    document.getElementById("btn-print-scheme")?.addEventListener("click", () => {
      window.print();
    });

    // Copy Portal URL Button Handler
    container.querySelectorAll(".btn-copy-portal").forEach(btn => {
      btn.addEventListener("click", async (e) => {
        const url = e.currentTarget.getAttribute("data-url");
        const { copyToClipboard } = await import("../components/toast.js");
        copyToClipboard(url, "Portal URL");
      });
    });

    // Save Scheme Button Handler
    document.getElementById("btn-save-this-scheme")?.addEventListener("click", async () => {
      try {
        await api.post("/api/schemes/saved", { scheme_id: s.id, notes: "Bookmarked from catalog" });
        showToast(lang === 'ta' ? 'திட்டம் வெற்றிகரமாக சேமிக்கப்பட்டது!' : 'Scheme saved to your profile!', 'success');
      } catch (err) {
        showToast(err.message, 'warning');
      }
    });

    // Evaluate Scheme Handler
    document.getElementById("form-evaluate-scheme")?.addEventListener("submit", async (e) => {
      e.preventDefault();
      const resContainer = document.getElementById("eval-result-container");
      resContainer.innerHTML = `<div class="text-center py-2"><span class="spinner-border spinner-border-sm text-primary"></span></div>`;

      try {
        const payload = {
          age: parseInt(document.getElementById("eval-age").value),
          gender: document.getElementById("eval-gender").value,
          annual_income: parseFloat(document.getElementById("eval-income").value),
          occupation: document.getElementById("eval-occupation").value,
          landholding_acres: parseFloat(document.getElementById("eval-land").value),
          scheme_id: s.id
        };

        const res = await api.post("/api/schemes/check-eligibility", payload);
        const evalItem = res.evaluations[0];
        const statusColors = {
          potentially_eligible: "success",
          more_information_required: "warning",
          cannot_confirm: "danger"
        };
        const color = statusColors[evalItem.status] || "secondary";

        resContainer.innerHTML = `
          <div class="alert alert-${color} p-3 mb-0">
            <h6 class="fw-bold mb-1">${evalItem.status_label}</h6>
            <p class="small mb-2">${evalItem.summary_reason}</p>
            ${evalItem.matched_criteria.length ? `
              <div class="small fw-semibold text-success mb-1">${lang === 'ta' ? 'பொருந்திய விதிகள்:' : 'Matched Rules:'}</div>
              <ul class="list-unstyled small mb-2">
                ${evalItem.matched_criteria.map(m => `<li><i class="bi bi-check me-1"></i> ${m.details}</li>`).join("")}
              </ul>
            ` : ''}
            ${evalItem.unmet_criteria.length ? `
              <div class="small fw-semibold text-danger mb-1">${lang === 'ta' ? 'பொருந்தாத விதிகள்:' : 'Unmet Rules:'}</div>
              <ul class="list-unstyled small mb-0">
                ${evalItem.unmet_criteria.map(u => `<li><i class="bi bi-x me-1"></i> ${u.details}</li>`).join("")}
              </ul>
            ` : ''}
          </div>
        `;
      } catch (err) {
        resContainer.innerHTML = `<div class="alert alert-danger py-2 small">${err.message}</div>`;
      }
    });
  } catch (err) {
    container.innerHTML = `<div class="alert alert-danger">Error: ${err.message}</div>`;
  }
}

/**
 * Saved Schemes View (/saved-schemes)
 */
export async function renderSavedSchemes(container) {
  const lang = getLanguage();
  container.innerHTML = `
    <div class="d-flex flex-column gap-4">
      <div class="d-flex align-items-center justify-content-between">
        <div>
          <h3 class="fw-bold mb-1" style="color: var(--color-navy);"><i class="bi bi-bookmark-heart-fill me-2 text-danger"></i> ${lang === 'ta' ? 'எனது சேமித்த திட்டங்கள்' : 'My Saved Schemes'}</h3>
          <p class="text-muted mb-0 small">${lang === 'ta' ? 'நீங்கள் புக்மார்க் செய்த அனைத்து அரசு நலத்திட்டங்களின் பட்டியல்.' : 'Keep track of welfare programs you have bookmarked.'}</p>
        </div>
        <a href="/schemes" class="btn btn-outline-primary btn-sm">
          <i class="bi bi-plus-lg me-1"></i> ${lang === 'ta' ? 'மேலும் திட்டங்கள் பார்க்க' : 'Discover More Schemes'}
        </a>
      </div>

      <div class="row g-4" id="saved-schemes-grid">
        <div class="col-12 text-center py-5 text-muted">
          <div class="spinner-border spinner-border-sm text-primary mb-2"></div>
          <div>${lang === 'ta' ? 'சேமித்த திட்டங்கள் ஏற்றப்படுகின்றன...' : 'Loading saved schemes...'}</div>
        </div>
      </div>
    </div>
  `;

  try {
    const list = await api.get("/api/schemes/saved/all");
    const grid = document.getElementById("saved-schemes-grid");
    if (!grid) return;

    if (!list.length) {
      grid.innerHTML = `
        <div class="col-12 text-center py-5 text-muted">
          <i class="bi bi-bookmark-x" style="font-size: 2.5rem;"></i>
          <h5 class="mt-2 text-dark">${lang === 'ta' ? 'சேமித்த திட்டங்கள் எதுவும் இல்லை' : 'No Saved Schemes Yet'}</h5>
          <p class="small mb-3">${lang === 'ta' ? 'அரசு நலத்திட்டங்கள் பக்கத்திற்கு சென்று சேமித்து வைக்கவும்.' : 'Browse the schemes catalog and click Save Scheme.'}</p>
          <a href="/schemes" class="btn btn-gv-primary btn-sm">${lang === 'ta' ? 'திட்டங்கள் பார்க்க' : 'Explore Schemes'}</a>
        </div>
      `;
      return;
    }

    grid.innerHTML = list.map(item => `
      <div class="col-md-6 col-lg-4">
        <div class="card-gv h-100 d-flex flex-column">
          <div class="card-header-gv">
            <span class="badge bg-light text-dark border small">${item.scheme.category}</span>
            <button class="btn btn-sm btn-outline-danger py-0 px-2 btn-remove-saved" data-id="${item.scheme_id}" title="Remove Bookmark">
              <i class="bi bi-trash"></i>
            </button>
          </div>
          <div class="card-body-gv flex-grow-1 d-flex flex-column justify-content-between">
            <div>
              <h5 class="fw-bold mb-1">
                <a href="/schemes/${item.scheme_id}" class="text-decoration-none text-dark">${localizeField(item.scheme, "title")}</a>
              </h5>
              <p class="small text-muted mb-2">${localizeField(item.scheme, "short_summary")}</p>
            </div>
            <div class="pt-3 border-top mt-auto">
              <a href="/schemes/${item.scheme_id}" class="btn btn-sm btn-gv-primary w-100 text-center">
                ${lang === 'ta' ? 'முழு விவரம் & விண்ணப்பிக்க' : 'View & Apply'} &rarr;
              </a>
            </div>
          </div>
        </div>
      </div>
    `).join("");

    grid.querySelectorAll(".btn-remove-saved").forEach(btn => {
      btn.addEventListener("click", async (e) => {
        const sid = e.currentTarget.getAttribute("data-id");
        try {
          await api.delete(`/api/schemes/saved/${sid}`);
          showToast(lang === 'ta' ? 'திட்டம் நீக்கப்பட்டது.' : 'Scheme removed from saved list.', 'info');
          renderSavedSchemes(container);
        } catch (err) {
          showToast(err.message, 'error');
        }
      });
    });
  } catch (err) {
    document.getElementById("saved-schemes-grid").innerHTML = `<div class="col-12 alert alert-danger">${err.message}</div>`;
  }
}

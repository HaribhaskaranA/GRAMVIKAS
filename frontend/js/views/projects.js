/**
 * GRAMVIKAS AI - 13-Stage Village Development Projects Tracker (/projects & /projects/:id).
 * 100% Multilingual in Tamil (ta), Hindi (hi), and English (en).
 */

import { api } from "../api.js";
import { auth } from "../auth.js";
import { getLanguage, t, localizeField } from "../i18n.js";
import { copyToClipboard } from "../components/toast.js";

export async function renderProjects(container, projectId = null) {
  if (typeof projectId === "string" && projectId.trim() !== "" && projectId !== "undefined" && projectId !== "null" && projectId !== "projects") {
    return renderProjectDetail(container, projectId);
  }

  const lang = getLanguage();

  container.innerHTML = `
    <div class="d-flex flex-column gap-4">
      <!-- Header -->
      <div class="d-flex flex-wrap align-items-center justify-content-between gap-3">
        <div>
          <h3 class="fw-bold mb-1" style="color: var(--color-navy);"><i class="bi bi-buildings-fill me-2 text-primary"></i> ${lang === 'ta' ? 'கிராம வளர்ச்சிப் பணிகள் (13 நிலைகள்)' : (lang === 'hi' ? 'ग्रामीण विकास परियोजनाएं (13 चरण)' : '13-Stage Village Development Projects')}</h3>
          <p class="text-muted mb-0 small">${lang === 'ta' ? 'மண் பரிசோதனை முதல் கிராம சபை சமூக தணிக்கை வரை அனைத்து கட்டமைப்பு பணிகளின் வெளிப்படையான கண்காணிப்பு.' : 'End-to-end transparent tracking of rural infrastructure from initial survey to Gram Sabha social audit.'}</p>
        </div>
        <a href="/map" class="btn btn-outline-success btn-sm">
          <i class="bi bi-geo-alt me-1"></i> ${lang === 'ta' ? 'வரைபடத்தில் பார்க்க' : 'View on GIS Map'}
        </a>
      </div>

      <!-- Filters -->
      <div class="card-gv p-3">
        <div class="row g-2 align-items-center">
          <div class="col-md-5">
            <div class="input-group input-group-sm">
              <span class="input-group-text bg-white"><i class="bi bi-search"></i></span>
              <input type="text" class="form-control" id="prj-search-input" placeholder="${lang === 'ta' ? 'திட்டம் அல்லது கிராமம் தேட...' : 'Search by project code, title, village...'}">
              <button class="btn btn-outline-secondary" type="button" id="btn-project-voice-search" title="${lang === 'ta' ? 'குரல் வழி தேடல்' : 'Voice Search'}">
                <i class="bi bi-mic-fill text-danger"></i>
              </button>
            </div>
          </div>
          <div class="col-md-3">
            <select class="form-select form-select-sm" id="prj-category-filter">
              <option value="all">${lang === 'ta' ? 'அனைத்து பிரிவுகளும்' : 'All Categories'}</option>
              <option value="Drinking Water">${lang === 'ta' ? 'குடிநீர் திட்டம்' : 'Drinking Water'}</option>
              <option value="Roads & Bridges">${lang === 'ta' ? 'சாலைகள் & பாலங்கள்' : 'Roads & Bridges'}</option>
              <option value="Streetlights & Electricity">${lang === 'ta' ? 'மின்விளக்கு வசதி' : 'Streetlights & Electricity'}</option>
              <option value="Public Buildings">${lang === 'ta' ? 'பொது கட்டிடங்கள்' : 'Public Buildings'}</option>
            </select>
          </div>
          <div class="col-md-4">
            <select class="form-select form-select-sm" id="prj-stage-filter">
              <option value="all">${lang === 'ta' ? 'அனைத்து 13 நிலைகளும்' : 'All 13 Milestone Stages'}</option>
              <option value="planning">1. ${t('stage_planning')}</option>
              <option value="budget_approved">2. ${t('stage_budget_approved')}</option>
              <option value="tender_floated">3. ${t('stage_tender_floated')}</option>
              <option value="contractor_assigned">4. ${t('stage_contractor_assigned')}</option>
              <option value="foundation_work">5. ${t('stage_foundation_work')}</option>
              <option value="structure_laying">6. ${t('stage_structure_laying')}</option>
              <option value="mid_term_inspection">7. ${t('stage_mid_term_inspection')}</option>
              <option value="quality_testing">8. ${t('stage_quality_testing')}</option>
              <option value="final_finishing">9. ${t('stage_final_finishing')}</option>
              <option value="completion_handover">10. ${t('stage_completion_handover')}</option>
              <option value="official_signoff">11. ${t('stage_official_signoff')}</option>
              <option value="public_audit">12. ${t('stage_public_audit')}</option>
              <option value="maintenance_active">13. ${t('stage_maintenance_active')}</option>
            </select>
          </div>
        </div>
      </div>

      <!-- Projects Grid -->
      <div class="row g-4" id="projects-grid">
        <div class="col-12 text-center py-5 text-muted">
          <div class="spinner-border spinner-border-sm text-primary mb-2"></div>
          <div>${lang === 'ta' ? 'திட்டங்கள் ஏற்றப்படுகின்றன...' : 'Loading village infrastructure projects...'}</div>
        </div>
      </div>
    </div>
  `;

  let filterCat = "all";
  let filterStage = "all";
  let filterSearch = "";

  async function loadProjects() {
    const grid = document.getElementById("projects-grid");
    if (!grid) return;

    try {
      const projects = await api.get("/api/projects", {
        category: filterCat,
        stage: filterStage,
        search: filterSearch
      });

      if (!projects.length) {
        grid.innerHTML = `
          <div class="col-12 text-center py-5 text-muted">
            <i class="bi bi-buildings" style="font-size: 2.5rem;"></i>
            <h5 class="mt-2 text-dark">${lang === 'ta' ? 'திட்டங்கள் எதுவும் காணப்படவில்லை' : 'No Infrastructure Projects Found'}</h5>
            <p class="small mb-0">${lang === 'ta' ? 'வடிகட்டிகளை மாற்றி மீண்டும் முயற்சிக்கவும்.' : 'Try adjusting your filters or search keywords.'}</p>
          </div>
        `;
        return;
      }

      grid.innerHTML = projects.map(p => {
        const title = localizeField(p, "title");
        const desc = localizeField(p, "description") || p.description_en;
        const stageName = t("stage_" + p.current_stage, p.current_stage);
        const spentPct = Math.round((p.spent_budget / p.sanctioned_budget) * 100);

        return `
          <div class="col-md-6 col-lg-4">
            <div class="card-gv h-100 d-flex flex-column">
              <div class="card-header-gv">
                <div class="d-flex align-items-center gap-1">
                  <span class="badge bg-light text-dark border font-monospace small">${p.code}</span>
                  <button class="btn btn-sm btn-link p-0 text-muted btn-copy-code-card" data-code="${p.code}" title="${lang === 'ta' ? 'குறியீடு நகலெடு' : 'Copy Code'}">
                    <i class="bi bi-clipboard"></i>
                  </button>
                </div>
                <span class="badge bg-primary text-uppercase" style="font-size: 0.68rem;">${p.category}</span>
              </div>
              <div class="card-body-gv flex-grow-1 d-flex flex-column justify-content-between">
                <div>
                  <h5 class="fw-bold mb-1" style="font-size: 1.05rem;">
                    <a href="/projects/${p.id}" class="text-decoration-none text-dark">${title}</a>
                  </h5>
                  <div class="small text-muted mb-2">
                    <i class="bi bi-geo-alt"></i> ${p.village}, ${p.block} (${p.district})
                  </div>
                  <p class="small text-muted mb-3" style="min-height: 40px;">${desc}</p>
                </div>

                <div class="pt-3 border-top mt-auto">
                  <!-- Progress Bar -->
                  <div class="mb-2">
                    <div class="d-flex justify-content-between small mb-1">
                      <span class="text-muted fw-semibold">${lang === 'ta' ? 'நிலை:' : 'Stage:'} <strong class="text-dark">${stageName}</strong></span>
                      <span class="fw-bold text-success">${p.progress_percentage}% ${lang === 'ta' ? 'முடிந்தது' : 'Complete'}</span>
                    </div>
                    <div class="progress" style="height: 8px;">
                      <div class="progress-bar" style="width: ${p.progress_percentage}%; background-color: var(--color-green);"></div>
                    </div>
                  </div>

                  <!-- Financial Sanction -->
                  <div class="d-flex justify-content-between small text-muted mb-3">
                    <span>${lang === 'ta' ? 'ஒதுக்கீடு:' : 'Sanctioned:'} ₹${(p.sanctioned_budget / 100000).toFixed(1)} L</span>
                    <span>${lang === 'ta' ? 'செலவு:' : 'Disbursed:'} ₹${(p.spent_budget / 100000).toFixed(1)} L (${spentPct}%)</span>
                  </div>

                  <a href="/projects/${p.id}" class="btn btn-sm btn-gv-primary w-100 text-center">
                    <i class="bi bi-kanban me-1"></i> ${lang === 'ta' ? '13 நிலை முன்னேற்றம் பார்க்க' : 'Track 13 Milestone Stages'} &rarr;
                  </a>
                </div>
              </div>
            </div>
          </div>
        `;
      }).join("");

      grid.querySelectorAll(".btn-copy-code-card").forEach(btn => {
        btn.addEventListener("click", (e) => {
          e.stopPropagation();
          const code = btn.getAttribute("data-code");
          copyToClipboard(code, lang === 'ta' ? 'திட்ட குறியீடு' : 'Project Code');
        });
      });
    } catch (err) {
      grid.innerHTML = `<div class="col-12 alert alert-danger">${err.message}</div>`;
    }
  }

  // Event handlers
  document.getElementById("prj-category-filter")?.addEventListener("change", (e) => {
    filterCat = e.target.value;
    loadProjects();
  });

  document.getElementById("prj-stage-filter")?.addEventListener("change", (e) => {
    filterStage = e.target.value;
    loadProjects();
  });

  const searchInput = document.getElementById("prj-search-input");
  let debounceTimer;
  searchInput?.addEventListener("input", (e) => {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
      filterSearch = e.target.value;
      loadProjects();
    }, 300);
  });

  // Voice Search for Projects
  document.getElementById("btn-project-voice-search")?.addEventListener("click", () => {
    const SpeechRec = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRec) {
      alert(lang === 'ta' ? "உங்கள் உலாவியில் குரல் தேடல் ஆதரிக்கப்படவில்லை." : "Voice search is not supported in this browser.");
      return;
    }
    const recognition = new SpeechRec();
    recognition.lang = lang === 'hi' ? 'hi-IN' : (lang === 'ta' ? 'ta-IN' : 'en-IN');
    const micBtn = document.getElementById("btn-project-voice-search");
    micBtn.innerHTML = `<span class="spinner-grow spinner-grow-sm text-danger"></span>`;
    recognition.onresult = (evt) => {
      const transcript = evt.results[0][0].transcript;
      if (searchInput) {
        searchInput.value = transcript;
        filterSearch = transcript;
        loadProjects();
      }
    };
    recognition.onend = () => {
      if (micBtn) micBtn.innerHTML = `<i class="bi bi-mic-fill text-danger"></i>`;
    };
    recognition.onerror = () => {
      if (micBtn) micBtn.innerHTML = `<i class="bi bi-mic-fill text-danger"></i>`;
    };
    recognition.start();
  });

  loadProjects();
}

/**
 * 13-Stage Project Detail View (/projects/:id)
 */
async function renderProjectDetail(container, projectId) {
  const lang = getLanguage();
  container.innerHTML = `
    <div class="text-center py-5">
      <div class="spinner-border spinner-border-sm text-primary"></div>
      <p class="mt-2 text-muted">${lang === 'ta' ? 'திட்ட விவரங்கள் ஏற்றப்படுகின்றன...' : 'Loading project milestones...'}</p>
    </div>
  `;

  try {
    const p = await api.get(`/api/projects/${projectId}`);
    const title = localizeField(p, "title");
    const desc = localizeField(p, "description") || p.description_en;
    const milestones = p.milestones || [];
    const updates = p.updates || [];

    container.innerHTML = `
      <div class="d-flex flex-column gap-4">
        <!-- Breadcrumb & Back -->
        <div class="d-flex align-items-center justify-content-between">
          <a href="/projects" class="btn btn-outline-secondary btn-sm">
            <i class="bi bi-arrow-left me-1"></i> ${lang === 'ta' ? 'அனைத்து வளர்ச்சிப் பணிகள்' : 'Back to Village Projects'}
          </a>
          <div class="d-flex align-items-center gap-2">
            <span class="badge bg-light text-dark border font-monospace px-3 py-2">
              ${p.code}
            </span>
            <button class="btn btn-sm btn-outline-secondary btn-copy-code" data-code="${p.code}" title="${lang === 'ta' ? 'திட்ட குறியீடு நகலெடு' : 'Copy Project ID'}">
              <i class="bi bi-clipboard me-1"></i> ${lang === 'ta' ? 'நகலெடு' : 'Copy ID'}
            </button>
          </div>
        </div>

        <!-- Project Overview Banner -->
        <div class="card-gv p-4" style="background: linear-gradient(135deg, var(--color-navy) 0%, #1e3a5f 100%); color: #FFFFFF;">
          <div class="d-flex flex-wrap align-items-center gap-2 mb-2">
            <span class="badge" style="background: var(--color-green);">${p.category}</span>
            <span class="badge bg-warning text-dark fw-bold">${t('stage_' + p.current_stage, p.current_stage)}</span>
            <span class="badge-demo"><i class="bi bi-shield-check"></i> ${t('demo_badge')}</span>
          </div>
          <h2 class="fw-bold mb-2">${title}</h2>
          <p class="mb-3 text-light" style="opacity: 0.95; max-width: 900px;">
            ${desc}
          </p>

          <div class="row g-3 pt-3 border-top border-secondary text-light">
            <div class="col-sm-6 col-md-3">
              <span class="small d-block text-secondary">${lang === 'ta' ? 'கிராமம்:' : 'Location:'}</span>
              <strong class="text-white">${p.village}, ${p.block}</strong>
            </div>
            <div class="col-sm-6 col-md-3">
              <span class="small d-block text-secondary">${lang === 'ta' ? 'அங்கீகரிக்கப்பட்ட நிதி:' : 'Sanctioned Budget:'}</span>
              <strong class="text-warning">₹${(p.sanctioned_budget).toLocaleString('en-IN')}</strong>
            </div>
            <div class="col-sm-6 col-md-3">
              <span class="small d-block text-secondary">${lang === 'ta' ? 'செலவிடப்பட்ட தொகை:' : 'Spent to Date:'}</span>
              <strong class="text-white">₹${(p.spent_budget).toLocaleString('en-IN')}</strong>
            </div>
            <div class="col-sm-6 col-md-3">
              <span class="small d-block text-secondary">${lang === 'ta' ? 'பொறுப்பு அலுவலர்:' : 'Nodal Officer:'}</span>
              <strong class="text-white">${p.nodal_officer_name || 'Dr. Selvi Ramanathan (BDO)'}</strong>
            </div>
          </div>
        </div>

        <!-- Two Columns: 13-Milestone Stage Stepper & Field Photo Updates -->
        <div class="row g-4">
          <!-- 13-Stage Linear Progress Stepper -->
          <div class="col-lg-7">
            <div class="card-gv p-4">
              <h5 class="fw-bold mb-3" style="color: var(--color-navy);"><i class="bi bi-kanban me-2 text-primary"></i> ${lang === 'ta' ? '13 நிலை வளர்ச்சி முன்னேற்றப் பாதை' : '13-Stage Infrastructure Lifecycle'}</h5>
              
              <div class="d-flex flex-column gap-3">
                ${milestones.map((m, idx) => {
                  const stageTranslated = t('stage_' + m.stage, m.title);
                  return `
                    <div class="d-flex align-items-start gap-3 p-2 rounded ${m.is_completed ? 'bg-light' : ''}">
                      <div class="step-node flex-shrink-0 ${m.is_completed ? 'completed' : (m.stage === p.current_stage ? 'active' : '')}" style="width: 32px; height: 32px; font-size: 0.9rem;">
                        ${m.is_completed ? '<i class="bi bi-check"></i>' : (idx + 1)}
                      </div>
                      <div class="flex-grow-1">
                        <div class="d-flex align-items-center justify-content-between">
                          <span class="fw-bold ${m.is_completed ? 'text-success' : 'text-dark'}">${stageTranslated}</span>
                          ${m.completed_date ? `<span class="badge bg-success-subtle text-success small">${m.completed_date}</span>` : ''}
                        </div>
                        <p class="small text-muted mb-0">${m.description || ''}</p>
                      </div>
                    </div>
                  `;
                }).join("")}
              </div>
            </div>
          </div>

          <!-- Official Field Photo Updates & Social Audit -->
          <div class="col-lg-5">
            <div class="card-gv p-4">
              <h5 class="fw-bold mb-3" style="color: var(--color-navy);"><i class="bi bi-camera me-2 text-success"></i> ${lang === 'ta' ? 'கள ஆய்வு புகைப்படங்கள் & அறிக்கைகள்' : 'Verified Field Photos & Inspection Logs'}</h5>
              
              ${!updates.length ? `
                <div class="text-center py-4 text-muted small">${lang === 'ta' ? 'புகைப்படங்கள் இன்னும் பதிவேற்றப்படவில்லை.' : 'No photo updates uploaded yet.'}</div>
              ` : `
                <div class="d-flex flex-column gap-3">
                  ${updates.map(u => `
                    <div class="p-3 rounded border bg-light">
                      <div class="d-flex justify-content-between align-items-center mb-2">
                        <span class="badge bg-secondary text-uppercase">${t('stage_' + u.stage, u.stage)}</span>
                        <span class="small text-muted font-monospace">${new Date(u.created_at).toLocaleDateString()}</span>
                      </div>
                      <p class="small text-dark mb-2">${u.update_notes}</p>
                      ${u.photo_urls && u.photo_urls.length ? `
                        <div class="row g-2 mb-2">
                          ${u.photo_urls.map(url => `
                            <div class="col-6">
                              <img src="${url}" class="img-fluid rounded border" alt="Site photo" style="height: 120px; width: 100%; object-fit: cover;">
                            </div>
                          `).join("")}
                        </div>
                      ` : ''}
                      <div class="d-flex justify-content-between align-items-center small text-muted pt-2 border-top">
                        <span><i class="bi bi-person-check me-1"></i> ${u.official_name}</span>
                        ${u.expenditure_reported ? `<span class="fw-semibold text-dark">₹${(u.expenditure_reported).toLocaleString('en-IN')}</span>` : ''}
                      </div>
                    </div>
                  `).join("")}
                </div>
              `}
            </div>
          </div>
        </div>
      </div>
    `;

    // Event listener for copy project code
    container.querySelectorAll(".btn-copy-code").forEach(btn => {
      btn.addEventListener("click", () => {
        const code = btn.getAttribute("data-code");
        copyToClipboard(code, lang === 'ta' ? 'திட்ட குறியீடு' : 'Project Code');
      });
    });
  } catch (err) {
    container.innerHTML = `<div class="alert alert-danger">${err.message}</div>`;
  }
}

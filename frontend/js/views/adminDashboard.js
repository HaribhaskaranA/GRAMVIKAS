/**
 * GRAMVIKAS AI - System Administrator Control Center View (/admin/dashboard).
 * Official verifications queue, grievance moderation, voice campaign approvals, and security audit logs.
 */

import { api } from "../api.js";
import { resolveMediaUrl } from "../config.js";
import { auth } from "../auth.js";
import { showToast } from "../components/toast.js";
import { t, getLanguage } from "../i18n.js";

export async function renderAdminDashboard(container) {
  const user = auth.getUser();
  const currentLang = getLanguage();

  container.innerHTML = `
    <div class="d-flex flex-column gap-4">
      <!-- Admin Header -->
      <div class="card-gv" style="background: linear-gradient(135deg, var(--color-primary-dark) 0%, var(--color-primary) 100%); color: #FFFFFF; padding: 1.5rem;">
        <div class="d-flex flex-wrap align-items-center justify-content-between gap-3">
          <div>
            <div class="d-flex align-items-center gap-2 mb-1">
              <span class="badge bg-danger"><i class="bi bi-shield-lock-fill"></i> ${t("admin_title")}</span>
              <span class="badge-demo"><i class="bi bi-shield-check"></i> ${t("demo_badge")}</span>
            </div>
            <h3 class="fw-bold mb-1">${user?.full_name || 'State Governance Admin'}</h3>
            <p class="mb-0 text-light" style="opacity: 0.9; font-size: 0.95rem;">
              ${t("admin_subtitle")}
            </p>
          </div>
          <button class="btn btn-outline-warning btn-sm" id="btn-reset-demo-data">
            <i class="bi bi-arrow-counterclockwise me-1"></i> ${t("admin_reset_demo")}
          </button>
        </div>
      </div>

      <!-- Navigation Tabs -->
      <ul class="nav nav-pills gap-2 border-bottom pb-2" id="admin-tabs" role="tablist">
        <li class="nav-item">
          <button class="nav-link active" data-tab="overview">
            <i class="bi bi-speedometer me-1"></i> ${t("admin_tab_overview")}
          </button>
        </li>
        <li class="nav-item">
          <button class="nav-link position-relative" data-tab="verifications">
            <i class="bi bi-person-check-fill me-1"></i> ${t("admin_tab_verifications")}
            <span class="badge bg-danger ms-1" id="badge-pending-count">1</span>
          </button>
        </li>
        <li class="nav-item">
          <button class="nav-link" data-tab="campaigns">
            <i class="bi bi-broadcast me-1"></i> ${t("admin_tab_campaigns")}
          </button>
        </li>
        <li class="nav-item">
          <button class="nav-link" data-tab="work_photos">
            <i class="bi bi-camera-fill me-1"></i> ${currentLang === 'ta' ? 'பணி புகைப்படங்கள் & வினவல்கள்' : (currentLang === 'hi' ? 'कार्य फोटो एवं पूछताछ' : 'Work Photos & Inquiries')}
          </button>
        </li>
        <li class="nav-item">
          <button class="nav-link" data-tab="support_tickets">
            <i class="bi bi-headset me-1"></i> ${currentLang === 'ta' ? 'உதவி டிக்கெட்டுகள்' : (currentLang === 'hi' ? 'समर्थन टिकट' : 'Support Tickets')}
          </button>
        </li>
        <li class="nav-item">
          <button class="nav-link" data-tab="audit">
            <i class="bi bi-journal-text me-1"></i> ${t("admin_tab_audit")}
          </button>
        </li>
      </ul>

      <!-- Tab Content Area -->
      <div id="admin-tab-content">
        <div class="text-center py-5 text-muted">
          <div class="spinner-border spinner-border-sm text-primary mb-2"></div>
          <div>${currentLang === 'ta' ? 'நிர்வாக புள்ளிவிவரங்கள் ஏற்றப்படுகின்றன...' : (currentLang === 'hi' ? 'प्रशासनिक डेटा लोड हो रहा है...' : 'Loading administrative metrics...')}</div>
        </div>
      </div>
    </div>
  `;

  // Attach tab switching logic
  const tabButtons = container.querySelectorAll("#admin-tabs .nav-link");
  tabButtons.forEach(btn => {
    btn.addEventListener("click", () => {
      tabButtons.forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      const tab = btn.getAttribute("data-tab");
      loadAdminTab(tab);
    });
  });

  // Attach demo reset button
  document.getElementById("btn-reset-demo-data")?.addEventListener("click", async () => {
    const confirmMsg = currentLang === 'ta' ? 
      "மாதிரி தரவுத்தளத்தை மீட்டமைக்க விரும்புகிறீர்களா? அனைத்து சோதனை தரவுகளும் புதுப்பிக்கப்படும்." :
      (currentLang === 'hi' ? "क्या आप डेमो डेटा रीसेट करना चाहते हैं?" : "Reset local demo dataset back to original factory seeds?");
    if (confirm(confirmMsg)) {
      try {
        await api.post("/api/admin/reset-demo-data", {});
        showToast(currentLang === 'ta' ? "மாதிரி தரவு மீட்டமைக்கப்பட்டது!" : "Demo store restored to original factory seed state!", "success");
        renderAdminDashboard(container);
      } catch (err) {
        alert("Reset failed: " + err.message);
      }
    }
  });

  // Load default tab
  loadAdminTab("overview");

  async function loadAdminTab(tabName) {
    const contentEl = document.getElementById("admin-tab-content");
    if (!contentEl) return;

    if (tabName === "overview") {
      try {
        const stats = await api.get("/api/admin/overview");
        contentEl.innerHTML = `
          <div class="row g-3">
            <div class="col-sm-6 col-lg-3">
              <div class="kpi-card">
                <div class="kpi-icon green"><i class="bi bi-people-fill"></i></div>
                <div class="kpi-info">
                  <h3>${stats.total_citizens}</h3>
                  <p>${t("admin_kpi_citizens")}</p>
                </div>
              </div>
            </div>
            <div class="col-sm-6 col-lg-3">
              <div class="kpi-card">
                <div class="kpi-icon navy"><i class="bi bi-person-badge-fill"></i></div>
                <div class="kpi-info">
                  <h3>${stats.total_officials}</h3>
                  <p>${t("admin_kpi_officials")}</p>
                </div>
              </div>
            </div>
            <div class="col-sm-6 col-lg-3">
              <div class="kpi-card">
                <div class="kpi-icon saffron"><i class="bi bi-hourglass-bottom"></i></div>
                <div class="kpi-info">
                  <h3>${stats.pending_official_verifications}</h3>
                  <p>${t("admin_kpi_pending")}</p>
                </div>
              </div>
            </div>
            <div class="col-sm-6 col-lg-3">
              <div class="kpi-card">
                <div class="kpi-icon blue"><i class="bi bi-telephone-fill"></i></div>
                <div class="kpi-info">
                  <h3>${stats.voice_subscribers}</h3>
                  <p>${t("admin_kpi_subscribers")}</p>
                </div>
              </div>
            </div>
          </div>

          <div class="row g-4 mt-2">
            <div class="col-lg-6">
              <div class="card-gv p-4">
                <h5 class="fw-bold mb-3" style="color: var(--color-navy);"><i class="bi bi-cpu me-1"></i> ${t("admin_sys_status")}</h5>
                <ul class="list-group list-group-flush small">
                  <li class="list-group-item d-flex justify-content-between px-0">
                    <span class="text-muted">${t("admin_db_engine")}</span>
                    <span class="fw-bold text-success">${stats.is_demo_mode ? (currentLang === 'ta' ? 'இரட்டை முறை உள்ளூர் சேமிப்பகம் (செயலில்)' : 'Dual-Mode Local Store (Active)') : 'Live Supabase PostgreSQL'}</span>
                  </li>
                  <li class="list-group-item d-flex justify-content-between px-0">
                    <span class="text-muted">${t("admin_ai_adapter")}</span>
                    <span class="fw-bold text-dark">Google Gemini / Semantic Fallback</span>
                  </li>
                  <li class="list-group-item d-flex justify-content-between px-0">
                    <span class="text-muted">${t("admin_telephony")}</span>
                    <span class="fw-bold text-dark">TRAI Quiet Hours (20:00 - 07:00 IST) Enforced</span>
                  </li>
                  <li class="list-group-item d-flex justify-content-between px-0">
                    <span class="text-muted">${t("admin_active_schemes")}</span>
                    <span class="fw-bold text-dark">${stats.total_active_schemes}</span>
                  </li>
                  <li class="list-group-item d-flex justify-content-between px-0">
                    <span class="text-muted">${t("admin_tracked_projects")}</span>
                    <span class="fw-bold text-dark">${stats.total_projects}</span>
                  </li>
                </ul>
              </div>
            </div>

            <div class="col-lg-6">
              <div class="card-gv p-4">
                <h5 class="fw-bold mb-3" style="color: var(--color-navy);"><i class="bi bi-shield-check me-1"></i> ${t("admin_rules_title")}</h5>
                <p class="small text-muted mb-2">${t("admin_rule_1")}</p>
                <p class="small text-muted mb-2">${t("admin_rule_2")}</p>
                <p class="small text-muted mb-0">${t("admin_rule_3")}</p>
              </div>
            </div>
          </div>
        `;
      } catch (err) {
        contentEl.innerHTML = `<div class="alert alert-danger">Failed to load overview: ${err.message}</div>`;
      }
    } else if (tabName === "verifications") {
      try {
        const pending = await api.get("/api/admin/pending-officials");
        if (!pending.length) {
          contentEl.innerHTML = `
            <div class="card-gv p-5 text-center text-muted">
              <i class="bi bi-check2-circle text-success" style="font-size: 3rem;"></i>
              <h5 class="fw-bold mt-2 text-dark">${t("admin_clearances_clean")}</h5>
              <p class="small mb-0">${t("admin_clearances_clean_sub")}</p>
            </div>
          `;
          return;
        }

        contentEl.innerHTML = `
          <div class="card-gv">
            <div class="card-header-gv">
              <span class="fw-bold" style="color: var(--color-navy);">${t("admin_verif_queue")}</span>
              <span class="badge bg-warning text-dark">${pending.length} ${t("admin_pending_review")}</span>
            </div>
            <div class="table-responsive">
              <table class="table table-hover align-middle mb-0">
                <thead class="table-light small">
                  <tr>
                    <th>${t("admin_th_name")}</th>
                    <th>${t("admin_th_desig")}</th>
                    <th>${t("admin_th_jurisdiction")}</th>
                    <th>${t("admin_th_empid")}</th>
                    <th>${t("admin_th_requested")}</th>
                    <th class="text-end">${t("admin_th_actions")}</th>
                  </tr>
                </thead>
                <tbody>
                  ${pending.map(p => `
                    <tr>
                      <td class="fw-bold text-dark">${p.user.full_name}<br><span class="small text-muted">${p.user.email}</span></td>
                      <td>${p.profile.designation}<br><span class="small text-muted">${p.profile.department}</span></td>
                      <td>${p.profile.assigned_area}, ${p.profile.district}</td>
                      <td><span class="badge bg-secondary font-monospace">${p.profile.employee_id_number}</span></td>
                      <td class="small text-muted">${new Date(p.user.created_at).toLocaleDateString()}</td>
                      <td class="text-end">
                        <button class="btn btn-sm btn-success btn-verify me-1" data-id="${p.user.id}" data-action="approve">
                          <i class="bi bi-check-lg"></i> ${t("admin_btn_approve")}
                        </button>
                        <button class="btn btn-sm btn-outline-danger btn-verify" data-id="${p.user.id}" data-action="reject">
                          <i class="bi bi-x-lg"></i> ${t("admin_btn_reject")}
                        </button>
                      </td>
                    </tr>
                  `).join("")}
                </tbody>
              </table>
            </div>
          </div>
        `;

        contentEl.querySelectorAll(".btn-verify").forEach(btn => {
          btn.addEventListener("click", async (e) => {
            const uid = e.currentTarget.getAttribute("data-id");
            const action = e.currentTarget.getAttribute("data-action");
            try {
              e.currentTarget.disabled = true;
              await api.post(`/api/admin/verify-official/${uid}`, { action, rejection_reason: null });
              showToast(currentLang === 'ta' ? `அலுவலர் விண்ணப்பம் ${action === 'approve' ? 'ஒப்புதல் அளிக்கப்பட்டது' : 'நிராகரிக்கப்பட்டது'}!` : `Official application successfully ${action}d!`, "success");
              loadAdminTab("verifications");
            } catch (err) {
              alert("Verification action failed: " + err.message);
              e.currentTarget.disabled = false;
            }
          });
        });
      } catch (err) {
        contentEl.innerHTML = `<div class="alert alert-danger">Failed to load verifications: ${err.message}</div>`;
      }
    } else if (tabName === "campaigns") {
      try {
        const campaigns = await api.get("/api/voice/campaigns");
        contentEl.innerHTML = `
          <div class="card-gv">
            <div class="card-header-gv">
              <span class="fw-bold" style="color: var(--color-navy);">${t("admin_campaigns_title")}</span>
            </div>
            <div class="p-3">
              ${campaigns.map(c => `
                <div class="p-3 mb-3 border rounded card-gv">
                  <div class="d-flex align-items-center justify-content-between mb-2">
                    <span class="fw-bold text-dark">${c.campaign_name}</span>
                    <span class="badge ${c.approved_by_admin ? 'bg-success' : 'bg-warning text-dark'}">
                      ${c.approved_by_admin ? t("admin_campaign_approved") : t("admin_campaign_pending")}
                    </span>
                  </div>
                  <p class="small text-muted mb-2 font-monospace p-2 rounded" style="background: var(--bg-surface-alt);">
                    "${c.audio_script_text}"
                  </p>
                  <div class="d-flex align-items-center justify-content-between text-muted small">
                    <span>Target: ${c.target_block || 'All Blocks'}, ${c.target_district || 'Chengalpattu'} (${c.target_language.toUpperCase()})</span>
                    <button class="btn btn-sm btn-outline-primary btn-dispatch-camp" data-id="${c.id}">
                      <i class="bi bi-broadcast me-1"></i> ${t("admin_dispatch_btn")}
                    </button>
                  </div>
                </div>
              `).join("")}
            </div>
          </div>
        `;

        contentEl.querySelectorAll(".btn-dispatch-camp").forEach(btn => {
          btn.addEventListener("click", async (e) => {
            const cid = e.currentTarget.getAttribute("data-id");
            try {
              e.currentTarget.disabled = true;
              e.currentTarget.innerHTML = `<span class="spinner-border spinner-border-sm me-1"></span> Dispatching...`;
              const res = await api.post(`/api/voice/campaigns/${cid}/simulate`, {});
              showToast(currentLang === 'ta' ? `குரல் அறிவிப்பு ${res.subscribers_contacted} பயனர்களுக்கு அனுப்பப்பட்டது!` : `Broadcast dispatched! Contacted ${res.subscribers_contacted} subscribers.`, "success");
            } catch (err) {
              alert("Dispatch error: " + err.message);
            } finally {
              e.currentTarget.disabled = false;
              e.currentTarget.innerHTML = `<i class="bi bi-broadcast me-1"></i> ${t("admin_dispatch_btn")}`;
            }
          });
        });
      } catch (err) {
        contentEl.innerHTML = `<div class="alert alert-danger">Failed to load campaigns: ${err.message}</div>`;
      }
    } else if (tabName === "work_photos") {
      try {
        const [photos, questions] = await Promise.all([
          api.get("/api/admin/complaint-photos").catch(() => []),
          api.get("/api/admin/verification-questions").catch(() => [])
        ]);

        const openQuestionsCount = questions.filter(q => q.status === "open").length;

        contentEl.innerHTML = `
          <div class="d-flex flex-column gap-4">
            <!-- Header Summary -->
            <div class="row g-3">
              <div class="col-sm-6 col-lg-4">
                <div class="kpi-card">
                  <div class="kpi-icon green"><i class="bi bi-camera-fill"></i></div>
                  <div class="kpi-info">
                    <h3>${photos.length}</h3>
                    <p>${currentLang === 'ta' ? 'பதிவேற்றப்பட்ட பணி புகைப்படங்கள்' : 'Work Evidence Photos'}</p>
                  </div>
                </div>
              </div>
              <div class="col-sm-6 col-lg-4">
                <div class="kpi-card">
                  <div class="kpi-icon saffron"><i class="bi bi-question-circle-fill"></i></div>
                  <div class="kpi-info">
                    <h3>${openQuestionsCount}</h3>
                    <p>${currentLang === 'ta' ? 'பதிலளிக்கப்படாத வினவல்கள்' : 'Open Citizen Questions'}</p>
                  </div>
                </div>
              </div>
              <div class="col-sm-6 col-lg-4">
                <div class="kpi-card">
                  <div class="kpi-icon navy"><i class="bi bi-chat-square-dots-fill"></i></div>
                  <div class="kpi-info">
                    <h3>${questions.length}</h3>
                    <p>${currentLang === 'ta' ? 'மொத்த வினவல் உரையாடல்கள்' : 'Total Inquiries Handled'}</p>
                  </div>
                </div>
              </div>
            </div>

            <!-- SECTION 1: WORK COMPLETION & PROGRESS EVIDENCE PHOTOS -->
            <div class="card-gv">
              <div class="card-header-gv d-flex flex-wrap align-items-center justify-content-between gap-2">
                <div>
                  <h5 class="fw-bold mb-0" style="color: var(--color-navy);">
                    <i class="bi bi-images text-success me-2"></i> ${currentLang === 'ta' ? 'அரசுப் பணி நிறைவு & முன்னேற்றப் புகைப்படங்கள்' : 'Government Work Completion & Progress Photos'}
                  </h5>
                  <small class="text-muted">${currentLang === 'ta' ? 'அலுவலர்களால் பதிவேற்றப்பட்ட களப் புகைப்படங்கள் (பொதுமக்கள் நேரடி பார்வையில்)' : 'Official field evidence visible directly to citizens'}</small>
                </div>
                <span class="badge bg-success-subtle text-success border border-success-subtle px-3 py-2">
                  <i class="bi bi-check-circle me-1"></i> ${photos.length} ${currentLang === 'ta' ? 'புகைப்படங்கள்' : 'Photos Recorded'}
                </span>
              </div>

              <div class="p-3">
                ${photos.length === 0 ? `
                  <div class="text-center py-4 text-muted">
                    <i class="bi bi-camera text-secondary mb-2" style="font-size: 2.5rem;"></i>
                    <p class="mb-0">${currentLang === 'ta' ? 'இதுவரை பணி நிறைவு புகைப்படங்கள் ஏதும் பதிவேற்றப்படவில்லை.' : 'No work photos have been uploaded by officials yet.'}</p>
                  </div>
                ` : `
                  <div class="row g-3">
                    ${photos.map(p => `
                      <div class="col-md-6 col-lg-4">
                        <div class="card h-100 border shadow-sm rounded overflow-hidden">
                          <div class="position-relative bg-dark text-center" style="height: 180px; cursor: pointer;" onclick="window.adminOpenPhotoModal('${resolveMediaUrl(p.photo_url)}', '${encodeURIComponent(p.work_description || p.caption || '')}')">
                            <img src="${resolveMediaUrl(p.photo_url)}" class="w-100 h-100" style="object-fit: cover;" alt="Work Photo" onerror="this.onerror=null; this.src='https://images.unsplash.com/photo-1541888946425-d0fbb186f5f7?auto=format&fit=crop&w=800&q=80';" />
                            <div class="position-absolute top-0 end-0 m-2">
                              <span class="badge ${p.photo_type === 'completion_photo' ? 'bg-success' : 'bg-primary'} shadow-sm">
                                <i class="bi ${p.photo_type === 'completion_photo' ? 'bi-patch-check-fill' : 'bi-arrow-repeat'} me-1"></i>
                                ${p.photo_type === 'completion_photo' ? (currentLang === 'ta' ? 'நிறைவு சான்று' : 'Completion') : (currentLang === 'ta' ? 'முன்னேற்றம்' : 'Progress')}
                              </span>
                            </div>
                            <div class="position-absolute bottom-0 start-0 w-100 p-2 text-start" style="background: linear-gradient(transparent, rgba(0,0,0,0.7));">
                              <span class="badge bg-dark text-light border border-secondary small">
                                <i class="bi bi-zoom-in me-1"></i> ${currentLang === 'ta' ? 'பெரிதாக்குக' : 'Click to View'}
                              </span>
                            </div>
                          </div>
                          <div class="card-body p-3 d-flex flex-column justify-content-between">
                            <div>
                              <div class="d-flex justify-content-between align-items-center mb-1">
                                <span class="badge bg-light text-dark border font-monospace small">Complaint #${(p.report_id || p.complaint_id || 'REPORT').slice(-6)}</span>
                                <span class="small text-muted">${new Date(p.created_at).toLocaleDateString()}</span>
                              </div>
                              <p class="small text-dark fw-medium mb-2" style="display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;">
                                ${p.work_description || p.caption || (currentLang === 'ta' ? 'பணி விவரம் குறிப்பிடப்படவில்லை.' : 'No work description specified.')}
                              </p>
                            </div>
                            <div class="pt-2 border-top d-flex align-items-center justify-content-between small text-muted">
                              <span><i class="bi bi-person-fill text-primary me-1"></i> ${p.uploaded_by_name || 'Official'}</span>
                              <span class="badge bg-secondary-subtle text-secondary small">${p.uploaded_by_role || 'official'}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    `).join("")}
                  </div>
                `}
              </div>
            </div>

            <!-- SECTION 2: CITIZEN QUESTIONS & VERIFICATION INQUIRIES -->
            <div class="card-gv">
              <div class="card-header-gv d-flex flex-wrap align-items-center justify-content-between gap-2">
                <div>
                  <h5 class="fw-bold mb-0" style="color: var(--color-navy);">
                    <i class="bi bi-question-diamond-fill text-warning me-2"></i> ${currentLang === 'ta' ? 'களப் பணி குறித்த குடிமக்கள் வினவல்கள்' : 'Citizen Questions on Completion Evidence'}
                  </h5>
                  <small class="text-muted">${currentLang === 'ta' ? 'புகைப்படங்கள் மற்றும் நிறைவு நிலை குறித்த கேள்விகளுக்கு விளக்கம் அளிக்கவும்' : 'Provide official clarification and track Open, Answered, Closed questions'}</small>
                </div>
                <div class="d-flex gap-2">
                  <select id="filter-question-status" class="form-select form-select-sm" style="width: auto;">
                    <option value="all">${currentLang === 'ta' ? 'அனைத்து நிலைகளும்' : 'All Statuses'}</option>
                    <option value="open">${currentLang === 'ta' ? 'திறந்தவை (Open)' : 'Open'}</option>
                    <option value="answered">${currentLang === 'ta' ? 'பதிலளித்தவை (Answered)' : 'Answered'}</option>
                    <option value="closed">${currentLang === 'ta' ? 'நிறைவடைந்தவை (Closed)' : 'Closed'}</option>
                  </select>
                </div>
              </div>

              <div class="p-3" id="admin-questions-container">
                <!-- Rendered dynamically below -->
              </div>
            </div>
          </div>

          <!-- Lightbox Modal for Admin -->
          <div class="modal fade" id="modalAdminPhotoLightbox" tabindex="-1" aria-hidden="true">
            <div class="modal-dialog modal-lg modal-dialog-centered">
              <div class="modal-content">
                <div class="modal-header">
                  <h5 class="modal-title fw-bold" id="admin-lightbox-title">
                    <i class="bi bi-camera me-1 text-success"></i> ${currentLang === 'ta' ? 'களப் பணி புகைப்படம் (முழு அளவு)' : 'Work Evidence Photo (Full Size)'}
                  </h5>
                  <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>
                <div class="modal-body text-center p-2 bg-black">
                  <img id="admin-lightbox-img" src="" class="img-fluid rounded" style="max-height: 75vh; object-fit: contain;">
                </div>
                <div class="modal-footer justify-content-between bg-light">
                  <p class="small mb-0 text-muted" id="admin-lightbox-desc"></p>
                  <button type="button" class="btn btn-secondary btn-sm" data-bs-dismiss="modal">${currentLang === 'ta' ? 'மூடுக' : 'Close'}</button>
                </div>
              </div>
            </div>
          </div>
        `;

        // Global handler for lightbox modal in admin
        window.adminOpenPhotoModal = (imgUrl, descEncoded) => {
          const img = document.getElementById("admin-lightbox-img");
          const descEl = document.getElementById("admin-lightbox-desc");
          if (img) img.src = imgUrl;
          if (descEl) descEl.textContent = decodeURIComponent(descEncoded);
          const modalEl = document.getElementById("modalAdminPhotoLightbox");
          if (modalEl && window.bootstrap) {
            const modal = new window.bootstrap.Modal(modalEl);
            modal.show();
          } else {
            window.open(imgUrl, "_blank");
          }
        };

        const renderQuestionsList = (statusFilter = "all") => {
          const container = document.getElementById("admin-questions-container");
          if (!container) return;

          const filtered = statusFilter === "all" ? questions : questions.filter(q => q.status === statusFilter);

          if (filtered.length === 0) {
            container.innerHTML = `
              <div class="text-center py-4 text-muted">
                <i class="bi bi-chat-square-text text-secondary mb-2" style="font-size: 2.2rem;"></i>
                <p class="mb-0">${currentLang === 'ta' ? 'தேர்ந்தெடுக்கப்பட்ட நிலையில் கேள்விகள் ஏதுமில்லை.' : 'No questions matching this status filter.'}</p>
              </div>
            `;
            return;
          }

          container.innerHTML = `
            <div class="d-flex flex-column gap-3">
              ${filtered.map(q => {
                const statusBadge = q.status === 'open' 
                  ? '<span class="badge bg-warning text-dark"><i class="bi bi-hourglass-split me-1"></i> Open</span>'
                  : (q.status === 'answered' 
                    ? '<span class="badge bg-success"><i class="bi bi-check2-circle me-1"></i> Answered</span>'
                    : '<span class="badge bg-secondary"><i class="bi bi-lock me-1"></i> Closed</span>');

                return `
                  <div class="p-3 rounded border bg-white shadow-sm">
                    <div class="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-2 pb-2 border-bottom">
                      <div class="d-flex align-items-center gap-2">
                        ${statusBadge}
                        <strong class="text-dark"><i class="bi bi-person-circle text-primary me-1"></i> ${q.citizen_name}</strong>
                        <span class="badge bg-light text-muted border font-monospace">Complaint #${(q.report_id || q.complaint_id || 'REPORT').slice(-6)}</span>
                      </div>
                      <span class="small text-muted font-monospace">${new Date(q.created_at).toLocaleString()}</span>
                    </div>

                    <div class="mb-3">
                      <p class="fw-semibold text-dark mb-1" style="font-size: 1rem;">
                        <i class="bi bi-question-circle-fill text-warning me-1"></i> "${q.question_text}"
                      </p>
                      ${q.photo_url ? `
                        <div class="mt-2 p-2 bg-light rounded d-inline-flex align-items-center gap-2 border" style="cursor: pointer;" onclick="window.adminOpenPhotoModal('${resolveMediaUrl(q.photo_url)}', 'Referenced Photo for Complaint #${(q.report_id || q.complaint_id || 'REPORT').slice(-6)}')">
                          <img src="${resolveMediaUrl(q.photo_url)}" style="width: 44px; height: 44px; object-fit: cover; border-radius: 4px;" alt="Referenced Evidence" />
                          <span class="small text-primary text-decoration-underline"><i class="bi bi-image me-1"></i> ${currentLang === 'ta' ? 'வினவப்பட்ட புகைப்படம் காண்க' : 'View Inquired Photo'}</span>
                        </div>
                      ` : ''}
                    </div>

                    <!-- Conversation Thread / Messages -->
                    ${(q.messages && q.messages.length > 1) ? `
                      <div class="p-3 mb-3 rounded bg-light border-start border-3 border-primary d-flex flex-column gap-2">
                        <span class="small fw-bold text-primary mb-1"><i class="bi bi-chat-left-text me-1"></i> Discussion Thread:</span>
                        ${q.messages.slice(1).map(m => `
                          <div class="p-2 rounded ${m.sender_role === 'admin' ? 'bg-primary-subtle border border-primary-subtle' : 'bg-white border'}">
                            <div class="d-flex justify-content-between align-items-center mb-1">
                              <span class="small fw-bold ${m.sender_role === 'admin' ? 'text-primary' : 'text-dark'}">
                                ${m.sender_role === 'admin' ? '<i class="bi bi-shield-check text-primary me-1"></i> System Administrator' : '<i class="bi bi-person me-1"></i> ' + m.sender_name}
                              </span>
                              <span class="small text-muted" style="font-size: 0.75rem;">${new Date(m.created_at).toLocaleString()}</span>
                            </div>
                            <p class="small mb-0 text-secondary">${m.message}</p>
                          </div>
                        `).join("")}
                      </div>
                    ` : (q.admin_response ? `
                      <div class="p-3 mb-3 rounded bg-success-subtle border border-success-subtle">
                        <div class="d-flex justify-content-between align-items-center mb-1">
                          <span class="small fw-bold text-success"><i class="bi bi-shield-check me-1"></i> Latest Official Clarification:</span>
                          <span class="small text-muted">${q.admin_responder_name || 'Admin'}</span>
                        </div>
                        <p class="small mb-0 text-success-emphasis">${q.admin_response}</p>
                      </div>
                    ` : '')}

                    <!-- Admin Response Box -->
                    <div class="p-3 rounded bg-light border">
                      <label class="form-label small fw-bold text-dark mb-1">
                        <i class="bi bi-reply-fill text-primary me-1"></i> ${currentLang === 'ta' ? 'நிர்வாகியின் விளக்கம் / நிலை மாற்றம் (Admin Response):' : 'Administrator Clarification & Status Update:'}
                      </label>
                      <textarea class="form-control form-control-sm mb-2" id="admin-reply-text-${q.id}" rows="2" placeholder="${currentLang === 'ta' ? 'குடிமகனுக்கு அதிகாரப்பூர்வ கள விவரம் அல்லது விளக்கத்தை உள்ளிடவும்...' : 'Enter official clarification, field verification note, or resolution for the citizen...'}">${q.admin_response || ''}</textarea>
                      <div class="d-flex flex-wrap align-items-center justify-content-between gap-2">
                        <div class="d-flex align-items-center gap-2">
                          <span class="small text-muted">${currentLang === 'ta' ? 'வினவல் நிலை:' : 'Set Status:'}</span>
                          <select class="form-select form-select-sm" id="admin-status-select-${q.id}" style="width: auto;">
                            <option value="answered" ${q.status === 'answered' ? 'selected' : ''}>Answered (பதிலளிக்கப்பட்டது)</option>
                            <option value="closed" ${q.status === 'closed' ? 'selected' : ''}>Closed (முடிவுற்றது)</option>
                            <option value="open" ${q.status === 'open' ? 'selected' : ''}>Open (திறந்த நிலை)</option>
                          </select>
                        </div>
                        <button class="btn btn-sm btn-primary btn-submit-q-response" data-qid="${q.id}">
                          <i class="bi bi-send-fill me-1"></i> ${currentLang === 'ta' ? 'பதிலைச் சமர்ப்பி' : 'Send Clarification'}
                        </button>
                      </div>
                    </div>
                  </div>
                `;
              }).join("")}
            </div>
          `;

          // Attach submit handlers for admin responses
          container.querySelectorAll(".btn-submit-q-response").forEach(btn => {
            btn.addEventListener("click", async (e) => {
              const qid = e.currentTarget.getAttribute("data-qid");
              const textEl = document.getElementById(`admin-reply-text-${qid}`);
              const statusEl = document.getElementById(`admin-status-select-${qid}`);
              const responseText = textEl?.value?.trim() || "";
              const newStatus = statusEl?.value || "answered";

              if (!responseText) {
                alert(currentLang === 'ta' ? "தயவுசெய்து குடிமகனுக்கு பதிலை உள்ளிடவும்." : "Please enter a response message.");
                return;
              }

              try {
                e.currentTarget.disabled = true;
                e.currentTarget.innerHTML = `<span class="spinner-border spinner-border-sm me-1"></span> Submitting...`;
                await api.post(`/api/admin/verification-questions/${qid}/respond`, {
                  status: newStatus,
                  admin_response: responseText
                });
                showToast(currentLang === 'ta' ? "விளக்கம் வெற்றிகரமாக அனுப்பப்பட்டது!" : "Clarification sent successfully!", "success");
                loadAdminTab("work_photos");
              } catch (err) {
                alert("Failed to submit clarification: " + err.message);
                e.currentTarget.disabled = false;
                e.currentTarget.innerHTML = `<i class="bi bi-send-fill me-1"></i> Send Clarification`;
              }
            });
          });
        };

        // Filter event listener
        document.getElementById("filter-question-status")?.addEventListener("change", (e) => {
          renderQuestionsList(e.target.value);
        });

        // Initial render
        renderQuestionsList("all");

      } catch (err) {
        contentEl.innerHTML = `<div class="alert alert-danger">Failed to load work photos & inquiries: ${err.message}</div>`;
      }
    } else if (tabName === "support_tickets") {
      try {
        const tickets = await api.get("/api/support/admin/tickets").catch(() => []);

        contentEl.innerHTML = `
          <div class="d-flex flex-column gap-4">
            <!-- Support KPI Overview -->
            <div class="row g-3">
              <div class="col-sm-6 col-lg-3">
                <div class="kpi-card">
                  <div class="kpi-icon navy"><i class="bi bi-headset"></i></div>
                  <div class="kpi-info">
                    <h3>${tickets.length}</h3>
                    <p>${currentLang === 'ta' ? 'மொத்த டிக்கெட்டுகள்' : 'Total Tickets'}</p>
                  </div>
                </div>
              </div>
              <div class="col-sm-6 col-lg-3">
                <div class="kpi-card">
                  <div class="kpi-icon saffron"><i class="bi bi-hourglass-top"></i></div>
                  <div class="kpi-info">
                    <h3>${tickets.filter(t => t.status === 'open').length}</h3>
                    <p>${currentLang === 'ta' ? 'திறந்தவை (Open)' : 'Open'}</p>
                  </div>
                </div>
              </div>
              <div class="col-sm-6 col-lg-3">
                <div class="kpi-card">
                  <div class="kpi-icon blue"><i class="bi bi-gear-wide-connected"></i></div>
                  <div class="kpi-info">
                    <h3>${tickets.filter(t => t.status === 'in_progress').length}</h3>
                    <p>${currentLang === 'ta' ? 'செயல்பாட்டில் (In Progress)' : 'In Progress'}</p>
                  </div>
                </div>
              </div>
              <div class="col-sm-6 col-lg-3">
                <div class="kpi-card">
                  <div class="kpi-icon green"><i class="bi bi-check2-all"></i></div>
                  <div class="kpi-info">
                    <h3>${tickets.filter(t => t.status === 'resolved' || t.status === 'closed').length}</h3>
                    <p>${currentLang === 'ta' ? 'தீர்வு கண்டவை (Resolved)' : 'Resolved / Closed'}</p>
                  </div>
                </div>
              </div>
            </div>

            <!-- Tickets Filter & Management Section -->
            <div class="card-gv">
              <div class="card-header-gv d-flex flex-wrap align-items-center justify-content-between gap-3">
                <div>
                  <h5 class="fw-bold mb-0" style="color: var(--color-navy);">
                    <i class="bi bi-ticket-detailed-fill text-primary me-2"></i> ${currentLang === 'ta' ? 'தள உதவி டிக்கெட் மேலாண்மை' : 'Platform Support Tickets & Help Requests'}
                  </h5>
                  <small class="text-muted">${currentLang === 'ta' ? 'குடிமக்கள் மற்றும் அலுவலர்களால் பதிவு செய்யப்பட்ட தொழில்நுட்ப கோரிக்கைகள்' : 'Issues reported by citizens and officials with conversation thread'}</small>
                </div>
                <div class="d-flex flex-wrap gap-2">
                  <select id="support-filter-category" class="form-select form-select-sm" style="width: auto;">
                    <option value="all">${currentLang === 'ta' ? 'அனைத்து பிரிவுகளும்' : 'All Categories'}</option>
                    <option value="bug">Bug</option>
                    <option value="technical_issue">Technical Issue</option>
                    <option value="account_login">Account / Login</option>
                    <option value="broken_feature">Broken Feature</option>
                    <option value="general_help">General Help</option>
                  </select>
                  <select id="support-filter-status" class="form-select form-select-sm" style="width: auto;">
                    <option value="all">${currentLang === 'ta' ? 'அனைத்து நிலைகளும்' : 'All Statuses'}</option>
                    <option value="open">Open</option>
                    <option value="in_progress">In Progress</option>
                    <option value="resolved">Resolved</option>
                    <option value="closed">Closed</option>
                  </select>
                </div>
              </div>

              <div class="p-3" id="admin-tickets-container">
                <!-- Rendered dynamically below -->
              </div>
            </div>
          </div>
        `;

        const renderTicketsList = () => {
          const container = document.getElementById("admin-tickets-container");
          if (!container) return;

          const catFilter = document.getElementById("support-filter-category")?.value || "all";
          const statusFilter = document.getElementById("support-filter-status")?.value || "all";

          let filtered = tickets;
          if (catFilter !== "all") {
            filtered = filtered.filter(t => t.category === catFilter);
          }
          if (statusFilter !== "all") {
            filtered = filtered.filter(t => t.status === statusFilter);
          }

          if (filtered.length === 0) {
            container.innerHTML = `
              <div class="text-center py-5 text-muted">
                <i class="bi bi-inbox text-secondary mb-2" style="font-size: 2.5rem;"></i>
                <p class="mb-0">${currentLang === 'ta' ? 'தேர்ந்தெடுக்கப்பட்ட வடிகட்டிகளில் உதவி டிக்கெட்டுகள் ஏதுமில்லை.' : 'No support tickets found matching these filters.'}</p>
              </div>
            `;
            return;
          }

          container.innerHTML = `
            <div class="d-flex flex-column gap-3">
              ${filtered.map(t => {
                const statusBadge = t.status === 'open' 
                  ? '<span class="badge bg-warning text-dark"><i class="bi bi-hourglass-split me-1"></i> Open</span>'
                  : (t.status === 'in_progress' 
                    ? '<span class="badge bg-primary"><i class="bi bi-arrow-repeat me-1"></i> In Progress</span>'
                    : (t.status === 'resolved' 
                      ? '<span class="badge bg-success"><i class="bi bi-check-circle me-1"></i> Resolved</span>'
                      : '<span class="badge bg-secondary"><i class="bi bi-lock me-1"></i> Closed</span>'));

                return `
                  <div class="p-3 rounded border bg-white shadow-sm">
                    <div class="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-2 pb-2 border-bottom">
                      <div class="d-flex flex-wrap align-items-center gap-2">
                        <span class="badge bg-dark font-monospace">${t.ticket_number || 'TICKET'}</span>
                        <span class="badge bg-info-subtle text-info-emphasis border">${t.category.toUpperCase().replace('_', ' ')}</span>
                        ${statusBadge}
                      </div>
                      <span class="small text-muted font-monospace">${new Date(t.created_at).toLocaleString()}</span>
                    </div>

                    <div class="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-2">
                      <h6 class="fw-bold text-dark mb-0">${t.title}</h6>
                      <div class="small text-muted">
                        <i class="bi bi-person-circle me-1"></i> ${t.user_name} (${t.user_email})
                        <span class="badge bg-light text-secondary border ms-1">${t.user_role}</span>
                      </div>
                    </div>

                    <p class="small text-dark mb-2 p-2 rounded bg-light border">
                      ${t.description}
                    </p>

                    ${t.attachment_url ? `
                      <div class="mb-3">
                        <span class="small fw-bold text-muted d-block mb-1"><i class="bi bi-paperclip me-1"></i> Screenshot Attachment:</span>
                        <a href="${t.attachment_url}" target="_blank" class="d-inline-flex align-items-center gap-2 p-2 bg-light rounded border text-decoration-none">
                          <img src="${t.attachment_url}" style="width: 50px; height: 50px; object-fit: cover; border-radius: 4px;" alt="Attachment" />
                          <span class="small text-primary fw-medium"><i class="bi bi-box-arrow-up-right me-1"></i> View Screenshot</span>
                        </a>
                      </div>
                    ` : ''}

                    <!-- Conversation History -->
                    ${(t.messages && t.messages.length > 0) ? `
                      <div class="p-3 mb-3 rounded bg-light border-start border-3 border-info d-flex flex-column gap-2">
                        <span class="small fw-bold text-info-emphasis mb-1"><i class="bi bi-chat-dots me-1"></i> Conversation History (${t.messages.length} messages):</span>
                        ${t.messages.map(m => `
                          <div class="p-2 rounded ${m.sender_role === 'admin' ? 'bg-primary-subtle border border-primary-subtle' : 'bg-white border'}">
                            <div class="d-flex justify-content-between align-items-center mb-1">
                              <span class="small fw-bold ${m.sender_role === 'admin' ? 'text-primary' : 'text-dark'}">
                                ${m.sender_role === 'admin' ? '<i class="bi bi-shield-check text-primary me-1"></i> Support Admin' : '<i class="bi bi-person me-1"></i> ' + m.sender_name}
                              </span>
                              <span class="small text-muted" style="font-size: 0.75rem;">${new Date(m.created_at).toLocaleString()}</span>
                            </div>
                            <p class="small mb-0 text-secondary">${m.message}</p>
                          </div>
                        `).join("")}
                      </div>
                    ` : ''}

                    <!-- Admin Reply & Status Bar -->
                    <div class="p-3 rounded bg-light border">
                      <label class="form-label small fw-bold text-dark mb-1">
                        <i class="bi bi-reply-fill text-primary me-1"></i> ${currentLang === 'ta' ? 'அலுவல் பதில் / நிலை புதுப்பித்தல்:' : 'Admin Reply & Status Resolution:'}
                      </label>
                      <textarea class="form-control form-control-sm mb-2" id="ticket-reply-text-${t.id}" rows="2" placeholder="${currentLang === 'ta' ? 'பயனருக்கு பதில் அல்லது தீர்வு விவரங்களை உள்ளிடவும்...' : 'Write reply message to citizen/official with instructions or resolution...' }"></textarea>
                      <div class="d-flex flex-wrap align-items-center justify-content-between gap-2">
                        <div class="d-flex align-items-center gap-2">
                          <span class="small text-muted">${currentLang === 'ta' ? 'நிலை:' : 'Update Status:'}</span>
                          <select class="form-select form-select-sm" id="ticket-status-select-${t.id}" style="width: auto;">
                            <option value="open" ${t.status === 'open' ? 'selected' : ''}>Open</option>
                            <option value="in_progress" ${t.status === 'in_progress' ? 'selected' : ''}>In Progress</option>
                            <option value="resolved" ${t.status === 'resolved' ? 'selected' : ''}>Resolved</option>
                            <option value="closed" ${t.status === 'closed' ? 'selected' : ''}>Closed</option>
                          </select>
                        </div>
                        <button class="btn btn-sm btn-primary btn-submit-ticket-reply" data-tid="${t.id}">
                          <i class="bi bi-send-fill me-1"></i> ${currentLang === 'ta' ? 'பதில் & நிலை புதுப்பி' : 'Submit Reply & Update Status'}
                        </button>
                      </div>
                    </div>
                  </div>
                `;
              }).join("")}
            </div>
          `;

          // Attach ticket reply & status update actions
          container.querySelectorAll(".btn-submit-ticket-reply").forEach(btn => {
            btn.addEventListener("click", async (e) => {
              const tid = e.currentTarget.getAttribute("data-tid");
              const textEl = document.getElementById(`ticket-reply-text-${tid}`);
              const statusEl = document.getElementById(`ticket-status-select-${tid}`);
              const message = textEl?.value?.trim() || "";
              const newStatus = statusEl?.value || "in_progress";

              try {
                e.currentTarget.disabled = true;
                e.currentTarget.innerHTML = `<span class="spinner-border spinner-border-sm me-1"></span> Updating...`;

                // If message is entered, send reply
                if (message) {
                  await api.post(`/api/support/tickets/${tid}/reply`, { message });
                }

                // Update ticket status
                await api.put(`/api/support/admin/tickets/${tid}/status`, {
                  status: newStatus,
                  admin_notes: message ? `Admin responded with: ${message.slice(0, 100)}...` : undefined
                });

                showToast(currentLang === 'ta' ? "டிக்கெட் வெற்றிகரமாக புதுப்பிக்கப்பட்டது!" : "Ticket updated successfully!", "success");
                loadAdminTab("support_tickets");
              } catch (err) {
                alert("Failed to update ticket: " + err.message);
                e.currentTarget.disabled = false;
                e.currentTarget.innerHTML = `<i class="bi bi-send-fill me-1"></i> Submit Reply & Update Status`;
              }
            });
          });
        };

        // Attach category and status filters
        document.getElementById("support-filter-category")?.addEventListener("change", () => renderTicketsList());
        document.getElementById("support-filter-status")?.addEventListener("change", () => renderTicketsList());

        // Initial render
        renderTicketsList();

      } catch (err) {
        contentEl.innerHTML = `<div class="alert alert-danger">Failed to load support tickets: ${err.message}</div>`;
      }
    } else if (tabName === "audit") {
      try {
        const logs = await api.get("/api/admin/audit-logs");
        contentEl.innerHTML = `
          <div class="card-gv">
            <div class="card-header-gv">
              <span class="fw-bold" style="color: var(--color-navy);">${t("admin_audit_title")}</span>
              <span class="small text-muted">${logs.length} ${t("admin_audit_events")}</span>
            </div>
            <div class="table-responsive">
              <table class="table table-sm table-hover align-middle mb-0" style="font-size: 0.82rem;">
                <thead class="table-light">
                  <tr>
                    <th>Timestamp</th>
                    <th>Actor</th>
                    <th>Action</th>
                    <th>Entity Type</th>
                    <th>IP Address</th>
                  </tr>
                </thead>
                <tbody>
                  ${logs.slice(0, 20).map(l => `
                    <tr>
                      <td class="text-muted">${new Date(l.created_at).toLocaleString()}</td>
                      <td class="fw-bold text-dark">${l.user_name || 'System'}</td>
                      <td><span class="badge bg-light text-dark border font-monospace">${l.action}</span></td>
                      <td class="text-muted">${l.entity_type}</td>
                      <td class="font-monospace text-muted">${l.ip_address || '127.0.0.1'}</td>
                    </tr>
                  `).join("")}
                </tbody>
              </table>
            </div>
          </div>
        `;
      } catch (err) {
        contentEl.innerHTML = `<div class="alert alert-danger">Failed to load audit logs: ${err.message}</div>`;
      }
    }
  }
}

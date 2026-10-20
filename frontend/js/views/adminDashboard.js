/**
 * GRAMVIKAS AI - System Administrator Control Center View (/admin/dashboard).
 * Official verifications queue, grievance moderation, voice campaign approvals, and security audit logs.
 */

import { api } from "../api.js";
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

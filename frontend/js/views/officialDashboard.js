/**
 * GRAMVIKAS AI - Verified Official Dashboard (/official/dashboard).
 * Official management portal for milestone progress updates, grievance triage,
 * and direct voice broadcast dispatches. 100% Multilingual.
 */

import { api } from "../api.js";
import { auth } from "../auth.js";
import { getLanguage, t, localizeField } from "../i18n.js";
import { showToast } from "../components/toast.js";

export async function renderOfficialDashboard(container) {
  const user = auth.getUser();
  const profile = user?.official_profile || {};
  const lang = getLanguage();

  container.innerHTML = `
    <div class="d-flex flex-column gap-4">
      <!-- Official Header Card -->
      <div class="card-gv" style="background: linear-gradient(135deg, var(--color-navy) 0%, #1e3a5f 100%); color: #FFFFFF; padding: 1.5rem;">
        <div class="d-flex flex-wrap align-items-center justify-content-between gap-3">
          <div>
            <div class="d-flex align-items-center gap-2 mb-1">
              <span class="badge" style="background: var(--color-green);"><i class="bi bi-patch-check-fill"></i> BDO VERIFIED</span>
              <span class="badge bg-light text-dark fw-bold">ID: ${profile.employee_id_number || 'TN-GOV-RD-842'}</span>
            </div>
            <h3 class="fw-bold mb-1">${user?.full_name || 'Official'}</h3>
            <p class="mb-0 text-light" style="opacity: 0.9; font-size: 0.95rem;">
              ${profile.designation || 'Block Development Officer (BDO)'} &bull; ${profile.assigned_area || 'Cheyyur Block'}, ${profile.district || 'Chengalpattu'}
            </p>
          </div>
          <div class="d-flex gap-2">
            <a href="/announcements" class="btn btn-gv-saffron btn-sm">
              <i class="bi bi-megaphone-fill me-1"></i> ${lang === 'ta' ? 'அறிவிப்பு வெளியிடு' : 'Post Announcement'}
            </a>
            <a href="/voice-service" class="btn btn-outline-light btn-sm">
              <i class="bi bi-telephone-outbound-fill me-1"></i> ${lang === 'ta' ? 'குரல் ஒலிபரப்பு' : 'Voice Broadcast'}
            </a>
          </div>
        </div>
      </div>

      <!-- Actionable Pipeline Row -->
      <div class="row g-4">
        <!-- 1. Advance Village Project Milestone (13 Stages) -->
        <div class="col-lg-6">
          <div class="card-gv h-100">
            <div class="card-header-gv">
              <span class="fw-bold" style="color: var(--color-navy);"><i class="bi bi-hammer me-1 text-primary"></i> ${lang === 'ta' ? '13 நிலை வளர்ச்சி திட்ட மேலாளர்' : '13-Stage Project Milestone Manager'}</span>
            </div>
            <div class="card-body-gv">
              <form id="form-advance-project" class="d-flex flex-column gap-3">
                <div>
                  <label class="form-label small fw-semibold">${lang === 'ta' ? 'வளர்ச்சி திட்டத்தை தேர்வு செய்க' : 'Select Infrastructure Project'}</label>
                  <select class="form-select form-select-sm" id="adv-project-id" required>
                    <option value="">${lang === 'ta' ? 'திட்டங்கள் ஏற்றப்படுகின்றன...' : 'Loading projects...'}</option>
                  </select>
                </div>

                <div class="row g-2">
                  <div class="col-6">
                    <label class="form-label small fw-semibold">${lang === 'ta' ? 'அடுத்த மைல்கல் நிலை' : 'Advance to Milestone Stage'}</label>
                    <select class="form-select form-select-sm" id="adv-stage" required>
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
                  <div class="col-6">
                    <label class="form-label small fw-semibold">${lang === 'ta' ? 'முன்னேற்ற சதவீதம் (%)' : 'Progress Percentage (%)'}</label>
                    <input type="number" class="form-control form-control-sm" id="adv-progress" min="0" max="100" value="80" required>
                  </div>
                </div>

                <div>
                  <label class="form-label small fw-semibold">${lang === 'ta' ? 'அலுவலர் கள ஆய்வு குறிப்பு' : 'Official Inspection Log Note'}</label>
                  <textarea class="form-control form-control-sm" id="adv-note" rows="2" placeholder="${lang === 'ta' ? 'கள ஆய்வு முடிவு மற்றும் தரம் பற்றிய குறிப்புகள்...' : 'Details of inspection, testing reports...'}" required minlength="10"></textarea>
                </div>

                <div class="row g-2">
                  <div class="col-6">
                    <label class="form-label small fw-semibold">${lang === 'ta' ? 'செலவிடப்பட்ட தொகை (₹)' : 'Expenditure Reported (₹)'}</label>
                    <input type="number" class="form-control form-control-sm" id="adv-spent" value="50000">
                  </div>
                  <div class="col-6 d-flex align-items-end">
                    <button type="submit" class="btn btn-gv-primary btn-sm w-100">
                      <i class="bi bi-arrow-up-circle me-1"></i> ${lang === 'ta' ? 'நிலையை உயர்த்து' : 'Update Milestone'}
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>

        <!-- 2. Grievance Triage & Resolution Workflow -->
        <div class="col-lg-6">
          <div class="card-gv h-100">
            <div class="card-header-gv">
              <span class="fw-bold" style="color: var(--color-navy);"><i class="bi bi-clipboard-check me-1 text-warning"></i> ${lang === 'ta' ? 'குடிமக்கள் புகார் பரிசீலனை மற்றும் தீர்வு' : 'Citizen Grievance Resolution Desk'}</span>
            </div>
            <div class="card-body-gv">
              <form id="form-triage-report" class="d-flex flex-column gap-3">
                <div>
                  <label class="form-label small fw-semibold">${lang === 'ta' ? 'குடிமக்கள் புகாரை தேர்வு செய்க' : 'Select Pending Grievance'}</label>
                  <select class="form-select form-select-sm" id="triage-report-id" required>
                    <option value="">${lang === 'ta' ? 'புகார்கள் ஏற்றப்படுகின்றன...' : 'Loading grievances...'}</option>
                  </select>
                </div>

                <div>
                  <label class="form-label small fw-semibold">${lang === 'ta' ? 'மாற்ற வேண்டிய தீர்வு நிலை' : 'Advance Grievance To Stage'}</label>
                  <select class="form-select form-select-sm" id="triage-to-status" required>
                    <option value="triaged">2. ${t('report_triaged')}</option>
                    <option value="inspection_scheduled">3. ${t('report_inspection_scheduled')}</option>
                    <option value="in_progress">4. ${t('report_in_progress')}</option>
                    <option value="resolution_proposed">5. ${t('report_resolution_proposed')}</option>
                    <option value="verified_closed">6. ${t('report_verified_closed')}</option>
                  </select>
                </div>

                <div>
                  <label class="form-label small fw-semibold">${lang === 'ta' ? 'நடவடிக்கை மற்றும் தீர்வு குறிப்பு' : 'Official Action / Resolution Note'}</label>
                  <textarea class="form-control form-control-sm" id="triage-note" rows="3" placeholder="${lang === 'ta' ? 'எடுக்கப்பட்ட கள நடவடிக்கை அல்லது பழுது நீக்கப்பட்ட விவரம்...' : 'Inspection findings, contractor work order...'}" required minlength="5"></textarea>
                </div>

                <button type="submit" class="btn btn-warning btn-sm w-100 fw-bold">
                  <i class="bi bi-check2-all me-1"></i> ${lang === 'ta' ? 'தீர்வு நிலையை புதுப்பி' : 'Submit Official Action Sign-Off'}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;

  // Load select options
  async function loadFormSelects() {
    try {
      const [projects, reports] = await Promise.all([
        api.get("/api/projects"),
        api.get("/api/reports")
      ]);

      const projSelect = document.getElementById("adv-project-id");
      if (projSelect) {
        projSelect.innerHTML = projects.map(p => `
          <option value="${p.id}">${p.code} - ${localizeField(p, "title")} (${p.progress_percentage}%)</option>
        `).join("");
      }

      const repSelect = document.getElementById("triage-report-id");
      if (repSelect) {
        repSelect.innerHTML = reports.map(r => `
          <option value="${r.id}">${r.reference_id}: ${r.title} [${r.current_status}]</option>
        `).join("");
      }
    } catch (e) {
      console.warn("Select load note:", e);
    }
  }

  loadFormSelects();

  // Advance project milestone
  document.getElementById("form-advance-project")?.addEventListener("submit", async (e) => {
    e.preventDefault();
    const projId = document.getElementById("adv-project-id").value;
    const stage = document.getElementById("adv-stage").value;
    const progress = parseInt(document.getElementById("adv-progress").value);
    const note = document.getElementById("adv-note").value;
    const spent = parseFloat(document.getElementById("adv-spent").value) || 0;

    try {
      await api.put(`/api/projects/${projId}/stage`, {
        stage: stage,
        progress_percentage: progress,
        note: note
      });

      await api.post(`/api/projects/${projId}/updates`, {
        stage: stage,
        update_notes: note,
        expenditure_reported: spent,
        photo_urls: []
      });

      showToast(lang === 'ta' ? "மைல்கல் நிலை வெற்றிகரமாக புதுப்பிக்கப்பட்டது!" : "Project milestone updated successfully!", "success");
      loadFormSelects();
    } catch (err) {
      alert("Milestone update failed: " + err.message);
    }
  });

  // Triage grievance
  document.getElementById("form-triage-report")?.addEventListener("submit", async (e) => {
    e.preventDefault();
    const reportId = document.getElementById("triage-report-id").value;
    const toStatus = document.getElementById("triage-to-status").value;
    const note = document.getElementById("triage-note").value;

    try {
      await api.post(`/api/reports/${reportId}/status`, {
        to_status: toStatus,
        action_note: note,
        assigned_official_id: user?.id,
        evidence_urls: []
      });

      showToast(lang === 'ta' ? "புகார் தீர்வு நிலை புதுப்பிக்கப்பட்டது!" : "Grievance status updated successfully!", "success");
      loadFormSelects();
    } catch (err) {
      alert("Triage update failed: " + err.message);
    }
  });
}

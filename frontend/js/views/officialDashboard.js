/**
 * GRAMVIKAS AI - Verified Official Dashboard (/official/dashboard).
 * Official management portal for milestone progress updates, grievance triage,
 * government work completion photo transparency, and direct voice broadcast dispatches.
 */

import { api } from "../api.js";
import { resolveMediaUrl } from "../config.js";
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

        <!-- 2. Grievance Triage & Resolution Workflow with Photo Transparency -->
        <div class="col-lg-6">
          <div class="card-gv h-100">
            <div class="card-header-gv d-flex align-items-center justify-content-between">
              <span class="fw-bold" style="color: var(--color-navy);"><i class="bi bi-clipboard-check me-1 text-warning"></i> ${lang === 'ta' ? 'குடிமக்கள் புகார் பரிசீலனை & பணி நிறைவு வெளிப்படைத்தன்மை' : 'Citizen Grievance & Work Completion Desk'}</span>
              <span class="badge bg-success-subtle text-success border border-success-subtle small"><i class="bi bi-camera-fill me-1"></i> Photo Verified</span>
            </div>
            <div class="card-body-gv">
              <form id="form-triage-report" class="d-flex flex-column gap-3">
                <div>
                  <label class="form-label small fw-semibold">${lang === 'ta' ? 'குடிமக்கள் புகாரை தேர்வு செய்க' : 'Select Pending Grievance'}</label>
                  <select class="form-select form-select-sm" id="triage-report-id" required>
                    <option value="">${lang === 'ta' ? 'புகார்கள் ஏற்றப்படுகின்றன...' : 'Loading grievances...'}</option>
                  </select>
                </div>

                <!-- Existing Photos Display Container -->
                <div id="triage-existing-photos-container" style="display: none;">
                  <label class="form-label small fw-semibold text-muted mb-1">${lang === 'ta' ? 'ஏற்கனவே பதிவேற்றப்பட்ட கள புகைப்படங்கள்:' : 'Previously Uploaded Evidence Photos:'}</label>
                  <div class="d-flex gap-2 flex-wrap" id="triage-existing-photos-list"></div>
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

                <!-- Mandatory Completion Photo Alert -->
                <div class="alert alert-warning py-2 px-3 small d-flex align-items-center gap-2 mb-0" id="completion-photo-req-alert" style="display: none;">
                  <i class="bi bi-exclamation-triangle-fill text-warning flex-shrink-0" style="font-size: 1.1rem;"></i>
                  <div>
                    <strong>${lang === 'ta' ? 'கட்டாய விதிமுறை:' : 'Mandatory Completion Photo:'}</strong>
                    <span>${lang === 'ta' ? 'பணியை நிறைவு செய்ய குறைந்தது ஒரு களப் பணி நிறைவு புகைப்படம் (Completion Photo) பதிவேற்றுவது அவசியம்.' : 'At least one actual on-site completion photo is strictly required when marking work as completed.'}</span>
                  </div>
                </div>

                <!-- Work Progress / Completion Photo Upload -->
                <div>
                  <label class="form-label small fw-semibold d-flex justify-content-between">
                    <span><i class="bi bi-camera me-1 text-primary"></i> ${lang === 'ta' ? 'களப் பணி முன்னேற்றம் / நிறைவு புகைப்படம்' : 'Work Progress / Completion Photo'}</span>
                    <span class="text-danger small fw-bold" id="label-photo-mandatory" style="display: none;">* ${lang === 'ta' ? 'கட்டாயம்' : 'Required'}</span>
                  </label>
                  <input type="file" class="form-control form-control-sm" id="triage-photo-file" accept="image/jpeg,image/png,image/webp">
                  <div class="mt-2 text-center" id="triage-photo-preview-wrap" style="display: none;">
                    <img id="triage-photo-preview" src="" alt="Work Photo Preview" class="img-fluid rounded border shadow-sm" style="max-height: 140px; object-fit: cover;">
                  </div>
                </div>

                <!-- Work Description Completed -->
                <div>
                  <label class="form-label small fw-semibold">${lang === 'ta' ? 'நிறைவு செய்யப்பட்ட பணி விளக்கம்' : 'Description of Work Completed'}</label>
                  <textarea class="form-control form-control-sm" id="triage-work-desc" rows="2" placeholder="${lang === 'ta' ? 'பழுது நீக்கப்பட்ட முறை, பயன்படுத்தப்பட்ட உதிரி பாகங்கள் மற்றும் கள ஆய்வு அறிக்கை...' : 'Detailed description of materials used, repairs carried out, and technical tests completed...'}" required minlength="5"></textarea>
                </div>

                <div>
                  <label class="form-label small fw-semibold">${lang === 'ta' ? 'அலுவலர் நடவடிக்கை குறிப்பு' : 'Official Action Log Note'}</label>
                  <input type="text" class="form-control form-control-sm" id="triage-note" placeholder="${lang === 'ta' ? 'சுருக்கமான நடவடிக்கை குறிப்பு (எ.கா. தரம் சரிபார்க்கப்பட்டது)...' : 'Brief action note (e.g. Inspected and verified by BDO)...'}" value="Official field verification inspection complete.">
                </div>

                <button type="submit" class="btn btn-warning btn-sm w-100 fw-bold" id="btn-submit-triage">
                  <i class="bi bi-check2-all me-1"></i> ${lang === 'ta' ? 'புகார் நிலையை புதுப்பித்து புகைப்படத்தை சேமி' : 'Submit Official Action & Work Evidence'}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;

  let cachedReports = [];

  // Load select options
  async function loadFormSelects() {
    try {
      const [projects, reports] = await Promise.all([
        api.get("/api/projects"),
        api.get("/api/reports")
      ]);
      cachedReports = reports;

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
        updateTriageFormDisplay();
      }
    } catch (e) {
      console.warn("Select load note:", e);
    }
  }

  function updateTriageFormDisplay() {
    const repSelect = document.getElementById("triage-report-id");
    const statusSelect = document.getElementById("triage-to-status");
    const alertReq = document.getElementById("completion-photo-req-alert");
    const labelMandatory = document.getElementById("label-photo-mandatory");
    const existingPhotosContainer = document.getElementById("triage-existing-photos-container");
    const existingPhotosList = document.getElementById("triage-existing-photos-list");

    const selectedReportId = repSelect?.value;
    const selectedStatus = statusSelect?.value;
    const isCompletionStatus = selectedStatus === "resolution_proposed" || selectedStatus === "verified_closed";

    if (alertReq && labelMandatory) {
      if (isCompletionStatus) {
        alertReq.style.display = "flex";
        labelMandatory.style.display = "inline";
      } else {
        alertReq.style.display = "none";
        labelMandatory.style.display = "none";
      }
    }

    if (selectedReportId && existingPhotosContainer && existingPhotosList) {
      const rep = cachedReports.find(r => r.id === selectedReportId);
      const photos = rep?.completion_photos || [];
      if (photos.length > 0) {
        existingPhotosContainer.style.display = "block";
        existingPhotosList.innerHTML = photos.map(p => `
          <div class="position-relative border rounded p-1 bg-light">
            <img src="${resolveMediaUrl(p.photo_url)}" style="width: 50px; height: 50px; object-fit: cover; border-radius: 4px;" alt="Work Photo">
            <span class="badge ${p.is_completion ? 'bg-success' : 'bg-primary'} position-absolute top-0 end-0" style="font-size: 0.6rem;">${p.is_completion ? 'Done' : 'Prog'}</span>
          </div>
        `).join("");
      } else {
        existingPhotosContainer.style.display = "none";
      }
    }
  }

  loadFormSelects();

  // Status select change triggers mandatory alert
  document.getElementById("triage-to-status")?.addEventListener("change", updateTriageFormDisplay);
  document.getElementById("triage-report-id")?.addEventListener("change", updateTriageFormDisplay);

  // Photo preview
  document.getElementById("triage-photo-file")?.addEventListener("change", (e) => {
    const file = e.target.files?.[0];
    const previewWrap = document.getElementById("triage-photo-preview-wrap");
    const previewImg = document.getElementById("triage-photo-preview");
    if (file && previewWrap && previewImg) {
      const reader = new FileReader();
      reader.onload = (event) => {
        previewImg.src = event.target.result;
        previewWrap.style.display = "block";
      };
      reader.readAsDataURL(file);
    }
  });

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

  // Triage grievance with photo upload and completion verification
  document.getElementById("form-triage-report")?.addEventListener("submit", async (e) => {
    e.preventDefault();
    const reportId = document.getElementById("triage-report-id").value;
    const toStatus = document.getElementById("triage-to-status").value;
    const note = document.getElementById("triage-note").value;
    const workDesc = document.getElementById("triage-work-desc").value;
    const photoFileInput = document.getElementById("triage-photo-file");
    const photoFile = photoFileInput?.files?.[0];

    const isCompletionStatus = toStatus === "resolution_proposed" || toStatus === "verified_closed";
    const rep = cachedReports.find(r => r.id === reportId);
    const hasExistingCompletionPhoto = rep?.completion_photos?.some(p => p.is_completion);

    // Enforce completion photo requirement
    if (isCompletionStatus && !photoFile && !hasExistingCompletionPhoto) {
      alert(lang === 'ta' ?
        "கட்டாய விதிமுறை: பணியை நிறைவு செய்ய குறைந்தது ஒரு களப் பணி நிறைவு புகைப்படம் (Completion Photo) பதிவேற்றுவது அவசியம்!" :
        "Mandatory requirement: You must upload at least one work completion photo before marking this complaint as resolved/closed!"
      );
      photoFileInput.focus();
      return;
    }

    const submitBtn = document.getElementById("btn-submit-triage");
    const origText = submitBtn.innerHTML;
    submitBtn.disabled = true;
    submitBtn.innerHTML = `<span class="spinner-border spinner-border-sm me-1"></span> ${lang === 'ta' ? 'பதிவேற்றப்படுகிறது...' : 'Uploading & Updating...'}`;

    try {
      let uploadedPhotoUrl = null;

      // 1. Upload photo if selected
      if (photoFile) {
        const formData = new FormData();
        formData.append("file", photoFile);
        const uploadRes = await api.postFormData("/api/reports/upload-work-photo", formData);
        uploadedPhotoUrl = uploadRes.url;
      }

      // 2. Submit status update with photo & description
      const payload = {
        to_status: toStatus,
        action_note: note || workDesc,
        assigned_official_id: user?.id,
        work_description: workDesc,
        completion_photos: uploadedPhotoUrl ? [uploadedPhotoUrl] : [],
        evidence_urls: uploadedPhotoUrl ? [uploadedPhotoUrl] : []
      };

      await api.post(`/api/reports/${reportId}/status`, payload);

      showToast(lang === 'ta' ? "புகார் தீர்வு நிலை மற்றும் பணி நிறைவு புகைப்படம் வெற்றிகரமாக புதுப்பிக்கப்பட்டது!" : "Grievance status and work completion evidence recorded successfully!", "success");

      // Reset form
      document.getElementById("triage-work-desc").value = "";
      if (photoFileInput) photoFileInput.value = "";
      document.getElementById("triage-photo-preview-wrap").style.display = "none";

      await loadFormSelects();
    } catch (err) {
      alert("Triage update failed: " + err.message);
    } finally {
      submitBtn.disabled = false;
      submitBtn.innerHTML = origText;
    }
  });
}

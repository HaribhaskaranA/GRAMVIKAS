/**
 * GRAMVIKAS AI - Official Verification Pending Holding View (/verification-pending).
 */

import { auth } from "../auth.js";
import { showToast } from "../components/toast.js";
import { t, getLanguage } from "../i18n.js";

export function renderVerificationPending(container) {
  const user = auth.getUser();
  const profile = user?.official_profile || {};
  const currentLang = getLanguage();

  container.innerHTML = `
    <div class="row justify-content-center py-4">
      <div class="col-md-8 col-lg-6">
        <div class="card-gv text-center p-4">
          <div class="mb-3">
            <div style="width: 72px; height: 72px; border-radius: 50%; background: #FEF3C7; color: #D97706; font-size: 2.2rem; display: inline-flex; align-items: center; justify-content: center;">
              <i class="bi bi-hourglass-split"></i>
            </div>
          </div>
          <h3 class="fw-bold mb-2" style="color: var(--color-navy);">${t("verif_title")}</h3>
          <p class="text-muted mb-4">
            ${t("verif_desc")}
          </p>

          <div class="p-3 mb-4 rounded border text-start" style="background: var(--bg-surface-alt);">
            <div class="row g-2 small">
              <div class="col-5 text-muted fw-semibold">${currentLang === 'ta' ? 'விண்ணப்பதாரர் பெயர்:' : 'Applicant Name:'}</div>
              <div class="col-7 fw-bold text-dark">${user?.full_name || 'R. Anbarasan'}</div>
              <div class="col-5 text-muted fw-semibold">${currentLang === 'ta' ? 'பதவி:' : 'Designation:'}</div>
              <div class="col-7 text-dark">${profile.designation || 'Panchayat Secretary'}</div>
              <div class="col-5 text-muted fw-semibold">${currentLang === 'ta' ? 'துறை:' : 'Department:'}</div>
              <div class="col-7 text-dark">${profile.department || 'Rural Development & Panchayat Raj'}</div>
              <div class="col-5 text-muted fw-semibold">${currentLang === 'ta' ? 'ஒதுக்கப்பட்ட பகுதி:' : 'Assigned Area:'}</div>
              <div class="col-7 text-dark">${profile.assigned_area || 'Madurantakam South'}, ${profile.district || 'Chengalpattu'}</div>
              <div class="col-5 text-muted fw-semibold">${currentLang === 'ta' ? 'பணியாளர் எண்:' : 'Employee ID:'}</div>
              <div class="col-7 text-dark"><span class="badge bg-secondary">${profile.employee_id_number || 'TN-GOV-RD-2024-911'}</span></div>
              <div class="col-5 text-muted fw-semibold">${currentLang === 'ta' ? 'நிலை:' : 'Status:'}</div>
              <div class="col-7"><span class="badge bg-warning text-dark fw-bold">${t("status_pending")}</span></div>
            </div>
          </div>

          <div class="alert alert-info py-2 px-3 small text-start mb-4">
            <i class="bi bi-info-circle-fill me-1"></i>
            <strong>Demo Tip:</strong> You can log in as <code>admin@gramvikas.in</code> (Admin@123) to approve this application from the Admin Control Center, or switch to the pre-verified official <code>official@gramvikas.in</code> (Official@123).
          </div>

          <div class="d-flex flex-wrap gap-2 justify-content-center">
            <button class="btn btn-outline-primary" id="btn-refresh-status">
              <i class="bi bi-arrow-clockwise me-1"></i> ${t("verif_btn_check")}
            </button>
            <button class="btn btn-outline-danger" id="btn-pending-logout">
              <i class="bi bi-box-arrow-right me-1"></i> ${t("logout")}
            </button>
          </div>
        </div>
      </div>
    </div>
  `;

  document.getElementById("btn-refresh-status")?.addEventListener("click", async () => {
    try {
      const refreshedUser = await auth.checkAuth();
      if (refreshedUser?.role === "official" && refreshedUser?.official_profile?.is_verified) {
        showToast("Official Clearance Granted! Accessing Dashboard...", "success");
        setTimeout(() => window.location.href = "/official/dashboard", 800);
      } else {
        showToast("Your official clearance is still pending review by the administrator.", "warning");
      }
    } catch (err) {
      showToast("Status refresh error: " + err.message, "error");
    }
  });

  document.getElementById("btn-pending-logout")?.addEventListener("click", () => {
    auth.logout();
    window.location.href = "/login";
  });
}

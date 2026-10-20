/**
 * GRAMVIKAS AI - Public Announcements & Gram Sabha Alerts View (/announcements).
 * 100% Multilingual in Tamil (ta), Hindi (hi), and English (en).
 */

import { api } from "../api.js";
import { auth } from "../auth.js";
import { getLanguage, t, localizeField } from "../i18n.js";
import { showToast } from "../components/toast.js";

export async function renderAnnouncements(container) {
  const user = auth.getUser();
  const canPost = user?.role === "official" || user?.role === "admin";
  const lang = getLanguage();

  container.innerHTML = `
    <div class="d-flex flex-column gap-4">
      <div class="d-flex flex-wrap align-items-center justify-content-between gap-3">
        <div>
          <h3 class="fw-bold mb-1" style="color: var(--color-navy);"><i class="bi bi-megaphone-fill me-2 text-warning"></i> ${lang === 'ta' ? 'பொது அறிவிப்புகள் & கிராம சபை தகவல்கள்' : (lang === 'hi' ? 'सार्वजनिक घोषणाएं और ग्राम सभा' : 'Public Announcements & Gram Sabha Notices')}</h3>
          <p class="text-muted small mb-0">${lang === 'ta' ? 'அதிகாரப்பூர்வ கிராம சபை கூட்ட அறிவிப்புகள், பருவமழை எச்சரிக்கைகள் மற்றும் பொது அறிவிப்புகள்.' : 'Official community alerts, monsoon advisories, and village council meeting schedules.'}</p>
        </div>
        ${canPost ? `
          <button class="btn btn-gv-primary btn-sm" id="btn-open-create-ann">
            <i class="bi bi-plus-lg me-1"></i> ${lang === 'ta' ? 'அதிகாரப்பூர்வ அறிவிப்பை வெளியிடு' : 'Post Verified Announcement'}
          </button>
        ` : ''}
      </div>

      <!-- Create Announcement Card (Hidden by default) -->
      <div class="card-gv p-4" id="create-ann-card" style="display: none;">
        <h5 class="fw-bold mb-3" style="color: var(--color-navy);">${lang === 'ta' ? 'அதிகாரப்பூர்வ பொது அறிவிப்பு வெளியிட' : 'Publish Official Community Notice'}</h5>
        <form id="form-publish-ann" class="d-flex flex-column gap-3">
          <div class="row g-2">
            <div class="col-md-4">
              <label class="form-label small fw-semibold">${lang === 'ta' ? 'முக்கியத்துவ நிலை' : 'Priority Level'}</label>
              <select class="form-select form-select-sm" id="ann-priority">
                <option value="normal">${lang === 'ta' ? 'சாதாரண தகவல்' : 'Normal Community Info'}</option>
                <option value="high">${lang === 'ta' ? 'கிராம சபை முக்கிய அறிவிப்பு' : 'High (Gram Sabha Notice)'}</option>
                <option value="emergency">${lang === 'ta' ? 'அவசர எச்சரிக்கை (வெள்ளம்/புயல்)' : 'Emergency (Disaster Alert)'}</option>
              </select>
            </div>
            <div class="col-md-4">
              <label class="form-label small fw-semibold">${lang === 'ta' ? 'இலக்கு நிலை' : 'Target Level'}</label>
              <select class="form-select form-select-sm" id="ann-level">
                <option value="village">${lang === 'ta' ? 'கிராம ஊராட்சி' : 'Village Level'}</option>
                <option value="block">${lang === 'ta' ? 'வட்டார அளவு' : 'Block Level'}</option>
                <option value="district">${lang === 'ta' ? 'மாவட்ட அளவு' : 'District Level'}</option>
              </select>
            </div>
            <div class="col-md-4">
              <label class="form-label small fw-semibold">${lang === 'ta' ? 'கிராமம் / பகுதி பெயர்' : 'Target Area Name'}</label>
              <input type="text" class="form-control form-control-sm" id="ann-area" value="Melmaruvathur" required>
            </div>
          </div>

          <div>
            <label class="form-label small fw-semibold">${lang === 'ta' ? 'தலைப்பு (தமிழ்)' : 'Title (Tamil)'}</label>
            <input type="text" class="form-control form-control-sm" id="ann-title-ta" placeholder="எ.கா. சிறப்பு கிராம சபை கூட்டம் அறிவிப்பு" required>
          </div>
          <div>
            <label class="form-label small fw-semibold">Title (English)</label>
            <input type="text" class="form-control form-control-sm" id="ann-title-en" placeholder="e.g. Special Gram Sabha Meeting Notice" required>
          </div>

          <div>
            <label class="form-label small fw-semibold">${lang === 'ta' ? 'விவரம் (தமிழ்)' : 'Notice Content (Tamil)'}</label>
            <textarea class="form-control form-control-sm" id="ann-body-ta" rows="3" placeholder="கிராம சபை நடைபெறும் நாள், நேரம் மற்றும் விவாதிக்கப்படும் பொருள்கள்..." required></textarea>
          </div>
          <div>
            <label class="form-label small fw-semibold">Content (English)</label>
            <textarea class="form-control form-control-sm" id="ann-body-en" rows="3" placeholder="Describe the announcement schedule and agenda..." required></textarea>
          </div>

          <div class="d-flex justify-content-end gap-2">
            <button type="button" class="btn btn-outline-secondary btn-sm" id="btn-cancel-create-ann">${lang === 'ta' ? 'ரத்து' : 'Cancel'}</button>
            <button type="submit" class="btn btn-gv-primary btn-sm">${lang === 'ta' ? 'உடனடியாக வெளியிடு' : 'Publish Notice'}</button>
          </div>
        </form>
      </div>

      <!-- Announcements List Container -->
      <div id="announcements-list" class="d-flex flex-column gap-3">
        <div class="text-center py-5 text-muted">
          <div class="spinner-border spinner-border-sm text-primary mb-2"></div>
          <div>${lang === 'ta' ? 'அறிவிப்புகள் ஏற்றப்படுகின்றன...' : 'Loading verified public announcements...'}</div>
        </div>
      </div>
    </div>
  `;

  // Toggle create announcement
  document.getElementById("btn-open-create-ann")?.addEventListener("click", () => {
    const card = document.getElementById("create-ann-card");
    if (card) card.style.display = card.style.display === "none" ? "block" : "none";
  });

  document.getElementById("btn-cancel-create-ann")?.addEventListener("click", () => {
    const card = document.getElementById("create-ann-card");
    if (card) card.style.display = "none";
  });

  // Handle Publish Form
  document.getElementById("form-publish-ann")?.addEventListener("submit", async (e) => {
    e.preventDefault();
    try {
      const payload = {
        title_en: document.getElementById("ann-title-en").value,
        title_ta: document.getElementById("ann-title-ta").value,
        title_hi: document.getElementById("ann-title-en").value,
        body_en: document.getElementById("ann-body-en").value,
        body_ta: document.getElementById("ann-body-ta").value,
        body_hi: document.getElementById("ann-body-en").value,
        priority: document.getElementById("ann-priority").value,
        target_level: document.getElementById("ann-level").value,
        target_area: document.getElementById("ann-area").value,
        expires_at: new Date(Date.now() + 7 * 86400000).toISOString()
      };

      await api.post("/api/announcements", payload);
      showToast(lang === 'ta' ? "அறிவிப்பு வெற்றிகரமாக வெளியிடப்பட்டது!" : "Announcement published successfully!", "success");
      renderAnnouncements(container);
    } catch (err) {
      alert("Failed to publish: " + err.message);
    }
  });

  // Fetch and display announcements
  try {
    const list = await api.get("/api/announcements");
    const listEl = document.getElementById("announcements-list");
    if (!listEl) return;

    if (!list.length) {
      listEl.innerHTML = `<div class="card-gv p-5 text-center text-muted">${lang === 'ta' ? 'அறிவிப்புகள் எதுவும் இல்லை.' : 'No active announcements found.'}</div>`;
      return;
    }

    listEl.innerHTML = list.map(a => {
      const title = localizeField(a, "title");
      const body = localizeField(a, "body");
      const prioClass = a.priority === 'emergency' ? 'bg-danger text-white' : (a.priority === 'high' ? 'bg-warning text-dark' : 'bg-success text-white');

      return `
        <div class="card-gv p-4">
          <div class="d-flex flex-wrap align-items-center justify-content-between gap-2 mb-2">
            <div class="d-flex align-items-center gap-2">
              <span class="badge ${prioClass} text-uppercase">${a.priority}</span>
              <span class="badge bg-light text-dark border"><i class="bi bi-geo-alt me-1"></i> ${a.target_area}</span>
              ${a.is_voice_broadcast ? `<span class="badge bg-primary"><i class="bi bi-broadcast me-1"></i> ${lang === 'ta' ? 'குரல் ஒலிபரப்பு' : 'Voice Broadcast'}</span>` : ''}
            </div>
            <span class="small text-muted"><i class="bi bi-calendar3 me-1"></i> ${new Date(a.created_at).toLocaleDateString()}</span>
          </div>

          <h5 class="fw-bold mb-2 text-dark">${title}</h5>
          <p class="text-secondary small mb-3">${body}</p>

          <div class="d-flex flex-wrap align-items-center justify-content-between pt-2 border-top small text-muted">
            <span><i class="bi bi-patch-check-fill text-success me-1"></i> ${a.publisher_name || 'Block Development Officer'}</span>
            <div class="d-flex gap-2">
              <button class="btn btn-sm btn-outline-secondary py-0 px-2 btn-speak-ann" data-text="${title}. ${body}">
                <i class="bi bi-volume-up-fill me-1"></i> ${lang === 'ta' ? 'கேள்' : 'Listen'}
              </button>
            </div>
          </div>
        </div>
      `;
    }).join("");

    // Attach speak button listeners
    listEl.querySelectorAll(".btn-speak-ann").forEach(btn => {
      btn.addEventListener("click", (e) => {
        const text = e.currentTarget.getAttribute("data-text");
        if ('speechSynthesis' in window) {
          window.speechSynthesis.cancel();
          const ut = new SpeechSynthesisUtterance(text);
          ut.lang = lang === 'hi' ? 'hi-IN' : (lang === 'en' ? 'en-IN' : 'ta-IN');
          window.speechSynthesis.speak(ut);
        } else {
          showToast("Speech synthesis not supported in this browser.", "info");
        }
      });
    });

  } catch (err) {
    document.getElementById("announcements-list").innerHTML = `<div class="card-gv p-4 alert alert-danger">${err.message}</div>`;
  }
}

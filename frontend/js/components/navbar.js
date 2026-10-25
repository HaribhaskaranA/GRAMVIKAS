/**
 * GRAMVIKAS AI - Navigation Shell (Sidebar, Topbar & 5-Item Mobile Bottom Bar).
 * Fully multilingual with Crop Doctor integration.
 */

import { auth } from "../auth.js";
import { getLanguage, setLanguage, t } from "../i18n.js";

export function renderNavigation(activePath = "") {
  const user = auth.getUser();
  const role = user?.role || "citizen";
  const currentLang = getLanguage();

  // 1. SIDEBAR NAVIGATION LINKS
  let sidebarLinksHtml = "";

  if (role === "admin") {
    sidebarLinksHtml = `
      <div class="nav-section-title">${currentLang === 'ta' ? 'அமைப்பு நிர்வாகம்' : 'SYSTEM ADMINISTRATION'}</div>
      <a href="/admin/dashboard" class="sidebar-link ${activePath.startsWith('/admin') ? 'active' : ''}">
        <i class="bi bi-shield-lock-fill"></i> <span>${t('nav_admin_portal')}</span>
      </a>
      <a href="/crop-doctor" class="sidebar-link ${activePath === '/crop-doctor' ? 'active' : ''}">
        <i class="bi bi-flower1"></i> <span>${t('nav_crop_doctor')}</span>
      </a>
      <a href="/schemes" class="sidebar-link ${activePath.startsWith('/schemes') ? 'active' : ''}">
        <i class="bi bi-card-checklist"></i> <span>${t('nav_schemes')}</span>
      </a>
      <a href="/projects" class="sidebar-link ${activePath.startsWith('/projects') ? 'active' : ''}">
        <i class="bi bi-buildings-fill"></i> <span>${t('nav_projects')}</span>
      </a>
      <a href="/my-reports" class="sidebar-link ${activePath.startsWith('/my-reports') ? 'active' : ''}">
        <i class="bi bi-inbox-fill"></i> <span>${t('nav_my_reports')}</span>
      </a>
      <a href="/voice-service" class="sidebar-link ${activePath.startsWith('/voice-service') ? 'active' : ''}">
        <i class="bi bi-broadcast-pin"></i> <span>${t('nav_voice')}</span>
      </a>
      <a href="/map" class="sidebar-link ${activePath === '/map' ? 'active' : ''}">
        <i class="bi bi-geo-alt-fill"></i> <span>${t('nav_map')}</span>
      </a>
    `;
  } else if (role === "official") {
    const isApproved = user?.official_profile?.verification_status === "approved";
    if (isApproved) {
      sidebarLinksHtml = `
        <div class="nav-section-title">${currentLang === 'ta' ? 'அலுவலர் பணிப்பகுதி' : 'OFFICIAL WORKSPACE'}</div>
        <a href="/official/dashboard" class="sidebar-link ${activePath.startsWith('/official') ? 'active' : ''}">
          <i class="bi bi-speedometer2"></i> <span>${t('nav_official_portal')}</span>
        </a>
        <a href="/crop-doctor" class="sidebar-link ${activePath === '/crop-doctor' ? 'active' : ''}">
          <i class="bi bi-flower1"></i> <span>${t('nav_crop_doctor')}</span>
        </a>
        <a href="/projects" class="sidebar-link ${activePath.startsWith('/projects') ? 'active' : ''}">
          <i class="bi bi-buildings-fill"></i> <span>${t('nav_projects')}</span>
        </a>
        <a href="/my-reports" class="sidebar-link ${activePath.startsWith('/my-reports') ? 'active' : ''}">
          <i class="bi bi-clipboard-check-fill"></i> <span>${t('nav_my_reports')}</span>
        </a>
        <a href="/announcements" class="sidebar-link ${activePath.startsWith('/announcements') ? 'active' : ''}">
          <i class="bi bi-megaphone-fill"></i> <span>${t('nav_announcements')}</span>
        </a>
        <a href="/voice-service" class="sidebar-link ${activePath.startsWith('/voice-service') ? 'active' : ''}">
          <i class="bi bi-telephone-outbound-fill"></i> <span>${t('nav_voice')}</span>
        </a>
        <a href="/map" class="sidebar-link ${activePath === '/map' ? 'active' : ''}">
          <i class="bi bi-geo-alt-fill"></i> <span>${t('nav_map')}</span>
        </a>
      `;
    } else {
      sidebarLinksHtml = `
        <div class="nav-section-title">${currentLang === 'ta' ? 'அங்கீகார நிலை' : 'CLEARANCE PENDING'}</div>
        <a href="/verification-pending" class="sidebar-link active">
          <i class="bi bi-clock-history"></i> <span>${t('nav_verification_pending')}</span>
        </a>
        <a href="/schemes" class="sidebar-link">
          <i class="bi bi-card-checklist"></i> <span>${t('nav_schemes')}</span>
        </a>
        <a href="/projects" class="sidebar-link">
          <i class="bi bi-buildings"></i> <span>${t('nav_projects')}</span>
        </a>
      `;
    }
  } else {
    // Citizen Navigation
    sidebarLinksHtml = `
      <div class="nav-section-title">${currentLang === 'ta' ? 'குடிமக்கள் சேவைகள்' : (currentLang === 'hi' ? 'नागरिक सेवाएं' : 'CITIZEN SERVICES')}</div>
      <a href="/citizen/home" class="sidebar-link ${activePath.startsWith('/citizen') ? 'active' : ''}">
        <i class="bi bi-house-door-fill"></i> <span>${t('nav_home')}</span>
      </a>
      <a href="/crop-doctor" class="sidebar-link ${activePath === '/crop-doctor' ? 'active' : ''}" style="border-left: 3px solid var(--color-saffron);">
        <i class="bi bi-flower1 text-warning"></i> <span>${t('nav_crop_doctor')}</span>
      </a>
      <a href="/schemes" class="sidebar-link ${activePath.startsWith('/schemes') ? 'active' : ''}">
        <i class="bi bi-card-checklist"></i> <span>${t('nav_schemes')}</span>
      </a>
      <a href="/saved-schemes" class="sidebar-link ${activePath === '/saved-schemes' ? 'active' : ''}">
        <i class="bi bi-bookmark-heart-fill"></i> <span>${t('nav_saved_schemes')}</span>
      </a>
      <a href="/projects" class="sidebar-link ${activePath.startsWith('/projects') ? 'active' : ''}">
        <i class="bi bi-building-check"></i> <span>${t('nav_projects')}</span>
      </a>
      <a href="/assistant" class="sidebar-link ${activePath === '/assistant' ? 'active' : ''}">
        <i class="bi bi-chat-dots-fill"></i> <span>${t('nav_assistant')}</span>
      </a>
      <a href="/report-issue" class="sidebar-link ${activePath === '/report-issue' ? 'active' : ''}">
        <i class="bi bi-exclamation-octagon-fill"></i> <span>${t('nav_report')}</span>
      </a>
      <a href="/my-reports" class="sidebar-link ${activePath === '/my-reports' ? 'active' : ''}">
        <i class="bi bi-card-list"></i> <span>${t('nav_my_reports')}</span>
      </a>
      <a href="/announcements" class="sidebar-link ${activePath === '/announcements' ? 'active' : ''}">
        <i class="bi bi-megaphone-fill"></i> <span>${t('nav_announcements')}</span>
      </a>
      <a href="/voice-service" class="sidebar-link ${activePath === '/voice-service' ? 'active' : ''}">
        <i class="bi bi-telephone-fill"></i> <span>${t('nav_voice')}</span>
      </a>
      <a href="/map" class="sidebar-link ${activePath === '/map' ? 'active' : ''}">
        <i class="bi bi-geo-alt-fill"></i> <span>${t('nav_map')}</span>
      </a>
    `;
  }

  // Common Bottom Links
  sidebarLinksHtml += `
    <div class="nav-section-title">${currentLang === 'ta' ? 'அமைப்புகள்' : 'PREFERENCES'}</div>
    <a href="/profile" class="sidebar-link ${activePath === '/profile' ? 'active' : ''}">
      <i class="bi bi-person-circle"></i> <span>${t('nav_profile')}</span>
    </a>
    <a href="/help" class="sidebar-link ${activePath === '/help' ? 'active' : ''}">
      <i class="bi bi-question-circle-fill"></i> <span>${t('nav_help')}</span>
    </a>
  `;

  const sidebarEl = document.getElementById("app-sidebar");
  if (sidebarEl) {
    sidebarEl.innerHTML = `
      <a href="/" class="sidebar-brand">
        <div class="brand-logo" style="overflow: hidden; border-radius: 8px; background: transparent;">
          <img src="/assets/logo.jpeg" alt="GRAMVIKAS Logo" style="width: 38px; height: 38px; object-fit: cover; border-radius: 6px;">
        </div>
        <div class="brand-text">
          <span class="brand-title">${t('app_title')}</span>
          <span class="brand-sub">${currentLang === 'ta' ? 'கிராம வளர்ச்சி தளம்' : 'Rural Platform'}</span>
        </div>
      </a>
      <div class="sidebar-nav">
        ${sidebarLinksHtml}
      </div>
      <div class="sidebar-footer">
        <div class="user-quick-card">
          <div class="user-avatar">${(user?.full_name || 'U')[0].toUpperCase()}</div>
          <div class="user-details">
            <span class="user-name">${user?.full_name || 'Citizen'}</span>
            <span class="user-badge-role">${t('role_' + role).toUpperCase()}</span>
          </div>
        </div>
        <button class="btn btn-sm btn-outline-light w-100 mt-2" id="btn-sidebar-logout">
          <i class="bi bi-box-arrow-right me-1"></i> ${t('logout')}
        </button>
      </div>
    `;

    document.getElementById("btn-sidebar-logout")?.addEventListener("click", () => auth.logout());
  }

  // 2. TOPBAR ACCESSIBILITY & UTILITIES
  const topbarEl = document.getElementById("app-topbar");
  if (topbarEl) {
    const isLowBandwidth = document.body.classList.contains("low-bandwidth");
    topbarEl.innerHTML = `
      <div class="topbar-left">
        <button class="topbar-hamburger" id="btn-toggle-sidebar" aria-label="Toggle Navigation">
          <i class="bi bi-list"></i>
        </button>
        <div class="d-none d-md-flex align-items-center gap-2">
          <span class="badge-demo"><i class="bi bi-shield-check"></i> ${t('demo_badge')}</span>
          ${role === 'official' && user?.official_profile?.verification_status === 'approved' ? '<span class="badge-verified"><i class="bi bi-patch-check-fill"></i> BDO VERIFIED</span>' : ''}
        </div>
      </div>

      <div class="topbar-right">
        <!-- Font Scaler -->
        <div class="btn-group btn-group-sm me-1" role="group" aria-label="Text sizing">
          <button type="button" class="btn btn-outline-secondary px-2" id="font-scale-down" title="Smaller text">A-</button>
          <button type="button" class="btn btn-outline-secondary px-2" id="font-scale-reset" title="Normal text">A</button>
          <button type="button" class="btn btn-outline-secondary px-2" id="font-scale-up" title="Larger text">A+</button>
        </div>

        <!-- Low Bandwidth Mode -->
        <button class="btn btn-sm ${isLowBandwidth ? 'btn-warning' : 'btn-outline-secondary'} me-1" id="btn-low-bandwidth" title="Toggle Low Bandwidth Mode">
          <i class="bi bi-reception-2"></i> <span class="d-none d-sm-inline">${isLowBandwidth ? t('low_bandwidth_on') : t('low_bandwidth_off')}</span>
        </button>

        <!-- Language Selector -->
        <select class="form-select form-select-sm" id="lang-picker" style="width: auto; font-weight: 600;">
          <option value="en" ${currentLang === 'en' ? 'selected' : ''}>English</option>
          <option value="ta" ${currentLang === 'ta' ? 'selected' : ''}>தமிழ்</option>
          <option value="hi" ${currentLang === 'hi' ? 'selected' : ''}>हिन्दी</option>
        </select>
      </div>
    `;

    // Event listeners
    document.getElementById("btn-toggle-sidebar")?.addEventListener("click", () => {
      document.getElementById("app-sidebar")?.classList.toggle("show");
      document.getElementById("sidebar-backdrop")?.classList.toggle("show");
    });

    document.getElementById("lang-picker")?.addEventListener("change", (e) => {
      setLanguage(e.target.value);
    });

    document.getElementById("font-scale-down")?.addEventListener("click", () => {
      document.body.className = document.body.className.replace(/\bfont-\w+\b/g, '') + " font-sm";
    });
    document.getElementById("font-scale-reset")?.addEventListener("click", () => {
      document.body.className = document.body.className.replace(/\bfont-\w+\b/g, '') + " font-md";
    });
    document.getElementById("font-scale-up")?.addEventListener("click", () => {
      document.body.className = document.body.className.replace(/\bfont-\w+\b/g, '') + " font-lg";
    });

    document.getElementById("btn-low-bandwidth")?.addEventListener("click", () => {
      document.body.classList.toggle("low-bandwidth");
      renderNavigation(activePath);
    });
  }

  // 3. 5-ITEM MOBILE BOTTOM NAVIGATION BAR
  const bottomNavEl = document.getElementById("bottom-nav");
  if (bottomNavEl) {
    let items = [];
    if (role === "admin") {
      items = [
        { path: "/admin/dashboard", icon: "bi-shield-lock-fill", label: t('nav_admin_portal') },
        { path: "/schemes", icon: "bi-card-checklist", label: t('nav_schemes') },
        { path: "/projects", icon: "bi-buildings-fill", label: t('nav_projects') },
        { path: "/my-reports", icon: "bi-inbox-fill", label: t('nav_my_reports') },
        { path: "/profile", icon: "bi-person-circle", label: t('nav_profile') }
      ];
    } else if (role === "official") {
      items = [
        { path: "/official/dashboard", icon: "bi-speedometer2", label: t('nav_official_portal') },
        { path: "/projects", icon: "bi-buildings-fill", label: t('nav_projects') },
        { path: "/my-reports", icon: "bi-clipboard-check-fill", label: t('nav_my_reports') },
        { path: "/voice-service", icon: "bi-broadcast-pin", label: t('nav_voice') },
        { path: "/profile", icon: "bi-person-circle", label: t('nav_profile') }
      ];
    } else {
      // Citizen 5 primary thumb items including Crop Doctor
      items = [
        { path: "/citizen/home", icon: "bi-house-door-fill", label: t('nav_home') },
        { path: "/crop-doctor", icon: "bi-flower1", label: currentLang === 'ta' ? "பயிர் AI" : "Crop AI" },
        { path: "/schemes", icon: "bi-card-checklist", label: t('nav_schemes') },
        { path: "/assistant", icon: "bi-chat-dots-fill", label: t('nav_assistant') },
        { path: "/report-issue", icon: "bi-exclamation-octagon-fill", label: t('nav_report') }
      ];
    }

    bottomNavEl.innerHTML = items.map(item => `
      <a href="${item.path}" class="bottom-nav-item ${activePath.startsWith(item.path) ? 'active' : ''}">
        <i class="bi ${item.icon}"></i>
        <span>${item.label}</span>
      </a>
    `).join("");
  }

  // 4. FLOATING VILLAGE HELPLINE & QUICK ASSIST BUTTON
  let floatingBtn = document.getElementById("btn-floating-assist");
  if (!floatingBtn) {
    floatingBtn = document.createElement("button");
    floatingBtn.id = "btn-floating-assist";
    floatingBtn.className = "floating-assist-btn";
    floatingBtn.title = currentLang === 'ta' ? 'அவசர உதவி மற்றும் AI வழிகாட்டி' : 'Village Helpline & AI Assist';
    floatingBtn.setAttribute("aria-label", "Helpline and Assist");
    floatingBtn.innerHTML = `<img src="/assets/assistant_logo.jpeg" alt="AI Assist" style="width: 32px; height: 32px; border-radius: 50%; object-fit: cover; border: 2px solid var(--color-champagne); pointer-events: none;"><span style="position: absolute; bottom: 3px; right: 3px; background: #10B981; width: 11px; height: 11px; border-radius: 50%; border: 2px solid #FFFFFF;"></span>`;
    document.body.appendChild(floatingBtn);

    floatingBtn.addEventListener("click", () => {
      openQuickAssistModal();
    });
  }

  // 5. SMOOTH BACK-TO-TOP BUTTON
  let backToTopBtn = document.getElementById("btn-back-to-top");
  if (!backToTopBtn) {
    backToTopBtn = document.createElement("button");
    backToTopBtn.id = "btn-back-to-top";
    backToTopBtn.className = "back-to-top-btn";
    backToTopBtn.title = currentLang === 'ta' ? 'மேலே செல்ல' : 'Back to Top';
    backToTopBtn.setAttribute("aria-label", "Back to top");
    backToTopBtn.innerHTML = `<i class="bi bi-arrow-up"></i>`;
    document.body.appendChild(backToTopBtn);

    backToTopBtn.addEventListener("click", () => {
      window.scrollTo({ top: 0, behavior: "smooth" });
    });

    window.addEventListener("scroll", () => {
      if (window.scrollY > 280) {
        backToTopBtn.classList.add("visible");
      } else {
        backToTopBtn.classList.remove("visible");
      }
    });
  }
}

/**
 * Quick Rural Citizen Assist & Emergency Helplines Modal
 */
function openQuickAssistModal() {
  const lang = getLanguage();
  import("./modal.js").then(({ openModal }) => {
    openModal({
      title: lang === 'ta' ? '📞 கிராம உதவி மையம் & உடனடி வழிகாட்டி' : (lang === 'hi' ? '📞 ग्रामीण सहायता केंद्र' : '📞 Village Helpline & Quick Assist'),
      cancelText: lang === 'ta' ? 'மூடுக' : (lang === 'hi' ? 'बंद करें' : 'Close'),
      bodyHtml: `
        <div class="d-flex flex-column gap-3">
          <div class="p-3 rounded text-white" style="background: linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-dark) 100%);">
            <h6 class="fw-bold mb-1">${lang === 'ta' ? 'இலவச உதவி எண் (Toll-Free)' : 'Official Citizen Helpline'}</h6>
            <div class="d-flex align-items-center justify-content-between mt-2">
              <span class="fs-4 fw-bold text-warning font-monospace">1800-425-1333</span>
              <a href="tel:18004251333" class="btn btn-sm btn-success fw-bold px-3">
                <i class="bi bi-telephone-fill me-1"></i> ${lang === 'ta' ? 'இப்போதே அழைக்க' : 'Call Now'}
              </a>
            </div>
            <span class="small text-light" style="opacity: 0.85; font-size: 0.78rem;">
              ${lang === 'ta' ? 'காலை 8 மணி முதல் இரவு 8 மணி வரை அனைத்து மொழிகளிலும் கிடைக்கும்.' : 'Available 08:00 to 20:00 IST in Tamil, Hindi & English.'}
            </span>
          </div>

          <!-- Quick Shortcuts -->
          <div class="row g-2">
            <div class="col-6">
              <a href="/assistant" class="btn btn-outline-primary w-100 p-2 text-start d-flex align-items-center gap-2 h-100 modal-assist-shortcut">
                <i class="bi bi-chat-dots-fill fs-5 text-primary"></i>
                <div style="line-height: 1.2;">
                  <strong class="d-block small text-dark">${lang === 'ta' ? 'AI உதவியாளர்' : 'AI Assistant'}</strong>
                  <span class="text-muted" style="font-size: 0.7rem;">${lang === 'ta' ? 'கேள்வி கேட்க' : 'Instant Q&A'}</span>
                </div>
              </a>
            </div>
            <div class="col-6">
              <button type="button" class="btn btn-outline-success w-100 p-2 text-start d-flex align-items-center gap-2 h-100" id="btn-read-page-summary">
                <i class="bi bi-volume-up-fill fs-5 text-success"></i>
                <div style="line-height: 1.2;">
                  <strong class="d-block small text-dark">${lang === 'ta' ? 'பக்கம் வாசி' : 'Read Page'}</strong>
                  <span class="text-muted" style="font-size: 0.7rem;">${lang === 'ta' ? 'குரல் வழி கேட்க' : 'Voice summary'}</span>
                </div>
              </button>
            </div>
          </div>

          <!-- Emergency Numbers -->
          <div class="p-2 border rounded bg-light small">
            <span class="fw-bold text-muted text-uppercase d-block mb-1" style="font-size: 0.72rem;">${lang === 'ta' ? 'அத்தியாவசிய எண்கள்' : 'Emergency Directory'}:</span>
            <div class="d-flex justify-content-between py-1 border-bottom">
              <span>${lang === 'ta' ? 'பேரிடர் மேலாண்மை' : 'Disaster Control'}:</span>
              <a href="tel:1077" class="fw-bold text-danger text-decoration-none font-monospace">1077</a>
            </div>
            <div class="d-flex justify-content-between py-1 border-bottom">
              <span>${lang === 'ta' ? 'விவசாயி உதவி மையம்' : 'Kisan Call Centre'}:</span>
              <a href="tel:1551" class="fw-bold text-success text-decoration-none font-monospace">1551</a>
            </div>
            <div class="d-flex justify-content-between pt-1">
              <span>${lang === 'ta' ? 'பெண்கள் உதவி எண்' : 'Women Helpline'}:</span>
              <a href="tel:181" class="fw-bold text-primary text-decoration-none font-monospace">181</a>
            </div>
          </div>
        </div>
      `
    });

    // Handle read page summary aloud
    setTimeout(() => {
      document.querySelector(".modal-assist-shortcut")?.addEventListener("click", () => {
        document.getElementById("gv-active-modal")?.remove();
      });

      document.getElementById("btn-read-page-summary")?.addEventListener("click", () => {
        const contentEl = document.getElementById("app-content");
        if (contentEl) {
          const headings = Array.from(contentEl.querySelectorAll("h1, h2, h3, h4, h5")).map(h => h.innerText.trim()).filter(Boolean);
          const summaryText = headings.slice(0, 4).join(". ") || "Welcome to Gramvikas AI rural empowerment platform.";
          if ('speechSynthesis' in window) {
            window.speechSynthesis.cancel();
            const ut = new SpeechSynthesisUtterance(summaryText);
            ut.lang = lang === 'hi' ? 'hi-IN' : (lang === 'ta' ? 'ta-IN' : 'en-IN');
            window.speechSynthesis.speak(ut);
          }
        }
        document.getElementById("gv-active-modal")?.remove();
      });
    }, 100);
  });
}

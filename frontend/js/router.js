/**
 * GRAMVIKAS AI - Client-Side History API Router.
 * Clean regex matching without query parameters/trailing slash interference.
 * Complete handling for all 20+ application views including /crop-doctor.
 */

import { auth } from "./auth.js";
import { renderNavigation } from "./components/navbar.js";
import { renderCitizenHome } from "./views/citizenHome.js";
import { renderOfficialDashboard } from "./views/officialDashboard.js";
import { renderVerificationPending } from "./views/verificationPending.js";
import { renderAdminDashboard } from "./views/adminDashboard.js";
import { renderSchemes, renderSavedSchemes } from "./views/schemes.js";
import { renderProjects } from "./views/projects.js";
import { renderCropDoctor } from "./views/cropDoctor.js";
import { renderAssistant } from "./views/assistant.js";
import { renderReportIssue } from "./views/reportIssue.js";
import { renderAnnouncements } from "./views/announcements.js";
import { renderVoiceService } from "./views/voiceService.js";
import { renderMapView } from "./views/mapView.js";
import { renderProfile } from "./views/profile.js";

class AppRouter {
  constructor() {
    this.routes = [
      { pattern: /^\/citizen\/home$/, handler: (c) => renderCitizenHome(c), role: "any" },
      { pattern: /^\/official\/dashboard$/, handler: (c) => renderOfficialDashboard(c), role: "official" },
      { pattern: /^\/verification-pending$/, handler: (c) => renderVerificationPending(c), role: "official" },
      { pattern: /^\/admin\/dashboard$/, handler: (c) => renderAdminDashboard(c), role: "admin" },
      { pattern: /^\/crop-doctor$/, handler: (c) => renderCropDoctor(c), role: "any" },
      { pattern: /^\/saved-schemes$/, handler: (c) => renderSavedSchemes(c), role: "any" },
      { pattern: /^\/schemes$/, handler: (c) => renderSchemes(c, null), role: "any" },
      { pattern: /^\/schemes\/([^\/]+)$/, handler: (c, id) => renderSchemes(c, id), role: "any" },
      { pattern: /^\/projects$/, handler: (c) => renderProjects(c, null), role: "any" },
      { pattern: /^\/projects\/([^\/]+)$/, handler: (c, id) => renderProjects(c, id), role: "any" },
      { pattern: /^\/report-issue$/, handler: (c) => renderReportIssue(c, null), role: "any" },
      { pattern: /^\/my-reports$/, handler: (c) => renderReportIssue(c, null), role: "any" },
      { pattern: /^\/reports\/([^\/]+)$/, handler: (c, id) => renderReportIssue(c, id), role: "any" },
      { pattern: /^\/assistant$/, handler: (c) => renderAssistant(c), role: "any" },
      { pattern: /^\/announcements$/, handler: (c) => renderAnnouncements(c), role: "any" },
      { pattern: /^\/voice-service$/, handler: (c) => renderVoiceService(c), role: "any" },
      { pattern: /^\/map$/, handler: (c) => renderMapView(c), role: "any" },
      { pattern: /^\/profile$/, handler: (c) => renderProfile(c), role: "any" },
      { pattern: /^\/help$/, handler: (c) => renderProfile(c), role: "any" },
      { pattern: /^\/notifications$/, handler: (c) => renderAnnouncements(c), role: "any" }
    ];

    this._setupGlobalLinkInterceptor();
    window.addEventListener("popstate", () => this.handleCurrentRoute());
    
    // Immediate view re-render on language toggle
    window.addEventListener("languageChanged", () => {
      this.handleCurrentRoute();
    });
  }

  _setupGlobalLinkInterceptor() {
    document.addEventListener("click", (e) => {
      const link = e.target.closest("a");
      if (!link) return;

      const href = link.getAttribute("href");
      if (href && href.startsWith("/") && !href.startsWith("//") && !link.hasAttribute("target") && !link.hasAttribute("download")) {
        if (href === "/login" || href === "/register") {
          return;
        }

        e.preventDefault();
        this.navigate(href);
      }
    });
  }

  async navigate(path) {
    window.history.pushState({}, "", path);
    return await this.handleCurrentRoute();
  }

  async handleCurrentRoute() {
    // 1. Separate path from query string & normalize trailing slashes
    let rawPath = window.location.pathname;
    let cleanPath = rawPath.replace(/\/+$/, "") || "/";

    // Check Authentication
    const user = await auth.checkSession();
    if (!user) {
      if (cleanPath !== "/login" && cleanPath !== "/register") {
        window.location.href = "/login";
        return;
      }
    }

    // Root redirect
    if (cleanPath === "/" || cleanPath === "/app.html") {
      const landing = auth.getRoleLandingPath(user);
      return await this.navigate(landing);
    }

    // Role-based route guards
    if (cleanPath.startsWith("/admin") && user?.role !== "admin") {
      return await this.navigate(auth.getRoleLandingPath(user));
    }

    if (cleanPath === "/official/dashboard" && user?.role === "official") {
      if (user.official_profile?.verification_status !== "approved") {
        return await this.navigate("/verification-pending");
      }
    }

    // Render Navigation Shell (Sidebar, Topbar, Mobile Bottom Nav)
    renderNavigation(cleanPath);

    // Close mobile drawer on navigation
    document.getElementById("app-sidebar")?.classList.remove("show");
    document.getElementById("sidebar-backdrop")?.classList.remove("show");

    // Match route handler
    const contentContainer = document.getElementById("app-content");
    if (!contentContainer) return;

    let matched = false;
    for (const route of this.routes) {
      const match = cleanPath.match(route.pattern);
      if (match) {
        matched = true;
        try {
          const param = match[1] || null;
          await route.handler(contentContainer, param);
        } catch (err) {
          console.error("Route execution error:", err);
          contentContainer.innerHTML = `
            <div class="alert alert-danger my-4">
              <h5>Page Load Error</h5>
              <p>${err.message}</p>
              <button class="btn btn-sm btn-outline-danger" onclick="window.location.reload()">Retry</button>
            </div>
          `;
        }
        break;
      }
    }

    if (!matched) {
      contentContainer.innerHTML = `
        <div class="card-gv p-5 text-center">
          <i class="bi bi-compass text-muted" style="font-size: 3rem;"></i>
          <h4 class="mt-3 fw-bold">Page Not Found (404)</h4>
          <p class="text-muted small">The requested section <code>${cleanPath}</code> does not exist.</p>
          <a href="/" class="btn btn-gv-primary btn-sm mt-2">Return to Dashboard</a>
        </div>
      `;
    }

    window.scrollTo({ top: 0, behavior: "smooth" });
  }
}

export const router = new AppRouter();

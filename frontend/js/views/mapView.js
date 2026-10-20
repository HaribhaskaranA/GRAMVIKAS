/**
 * GRAMVIKAS AI - Geographic & Map Discovery View (/map).
 * Interactive OpenStreetMap (Leaflet.js) showing village development projects & citizen grievances.
 * Features:
 * 1. High-contrast Red/Orange complaint markers (📌) & Emerald Green project markers (🏗️).
 * 2. Instant bounds zoom on filtering ("புகார்கள்", "திட்டப்பணிகள்", "அனைத்து இடங்களும்").
 * 3. Rich localized popup cards with 1-tap Copy Ref ID and direct links.
 * 4. Clickable list of Complaints & Projects directly below the map that flies to and opens the pin!
 */

import { api } from "../api.js";
import { CONFIG } from "../config.js";
import { t, getLanguage, localizeField } from "../i18n.js";
import { showToast } from "../components/toast.js";

export async function renderMapView(container) {
  const currentLang = getLanguage();

  container.innerHTML = `
    <div class="d-flex flex-column gap-3">
      <!-- Map Header & Filter Controls -->
      <div class="card-gv p-3">
        <div class="d-flex flex-wrap align-items-center justify-content-between gap-3">
          <div>
            <div class="d-flex align-items-center gap-2 mb-1">
              <span class="badge" style="background-color: var(--color-primary); color: var(--color-champagne); font-weight: 700; font-size: 0.78rem;">
                <i class="bi bi-geo-alt-fill me-1"></i> GIS MAPPING
              </span>
              <span class="badge" style="background-color: #DC2626; color: #FFFFFF; font-weight: 700; font-size: 0.78rem;" id="badge-complaints-count">
                <i class="bi bi-exclamation-octagon-fill me-1"></i> <span id="count-reports-text">...</span> ${currentLang === 'ta' ? 'புகார்கள்' : 'Complaints'}
              </span>
              <span class="badge" style="background-color: #064E3B; color: #F8E7C9; font-weight: 700; font-size: 0.78rem;" id="badge-projects-count">
                <i class="bi bi-buildings me-1"></i> <span id="count-projects-text">...</span> ${currentLang === 'ta' ? 'பணிகள்' : 'Projects'}
              </span>
            </div>
            <h4 class="fw-bold mb-1" style="color: var(--color-primary);">
              <i class="bi bi-map-fill me-2" style="color: var(--color-primary);"></i> ${t("map_title")}
            </h4>
            <p class="small text-muted mb-0">
              ${currentLang === 'ta' ? 
                'உங்கள் கிராமத்தின் வளர்ச்சி திட்டப்பணிகள் மற்றும் பதிவு செய்யப்பட்ட பொது புகார்களின் இருப்பிடங்களை நேரடியாக வரைபடத்தில் காண்க.' : 
                (currentLang === 'hi' ? 
                  'अपने गांव की विकास परियोजनाओं और दर्ज की गई शिकायतों के स्थान मानचित्र पर देखें।' : 
                  'Explore real-time GPS locations of ongoing village infrastructure works and registered citizen grievances.')}
            </p>
          </div>

          <!-- Filter Buttons -->
          <div class="d-flex flex-wrap gap-2">
            <button class="btn btn-sm btn-gv-primary map-filter-btn active" data-filter="all">
              <i class="bi bi-pin-map-fill me-1"></i> ${t("map_all_pins")}
            </button>
            <button class="btn btn-sm btn-outline-success map-filter-btn" data-filter="projects">
              <i class="bi bi-buildings me-1"></i> ${t("map_projects_filter")}
            </button>
            <button class="btn btn-sm btn-outline-danger map-filter-btn" data-filter="reports">
              <i class="bi bi-exclamation-octagon-fill me-1"></i> ${t("map_reports_filter")}
            </button>
          </div>
        </div>
      </div>

      <!-- Leaflet Map Container -->
      <div class="card-gv overflow-hidden shadow-sm" style="border: 2px solid var(--border-color); border-radius: var(--radius-md);">
        <div id="map-container" style="height: 520px; width: 100%; position: relative;">
          <div class="d-flex align-items-center justify-content-center h-100 text-muted">
            <div class="spinner-border text-primary me-2"></div>
            <span>${currentLang === 'ta' ? 'வரைபடம் தயாராகிறது...' : 'Loading OpenStreetMap GIS layers...'}</span>
          </div>
        </div>
      </div>

      <!-- MAPPED ITEMS DIRECTORY (Click any card to fly to pin) -->
      <div class="row g-3">
        <!-- Left Column: Citizen Complaints -->
        <div class="col-lg-6">
          <div class="card-gv h-100 shadow-xs">
            <div class="card-header-gv d-flex justify-content-between align-items-center" style="background: rgba(220, 38, 38, 0.06); border-bottom: 2px solid rgba(220, 38, 38, 0.2);">
              <span class="fw-bold text-danger">
                <i class="bi bi-exclamation-octagon-fill me-1"></i> ${currentLang === 'ta' ? 'வரைபடத்தில் உள்ள புகார்கள்' : (currentLang === 'hi' ? 'मानचित्रित शिकायतें' : 'Mapped Citizen Grievances')}
              </span>
              <span class="badge bg-danger text-white" id="list-reports-count">0</span>
            </div>
            <div class="card-body-gv p-3" id="map-reports-list" style="max-height: 480px; overflow-y: auto;">
              <div class="text-center py-4 text-muted small">
                <div class="spinner-border spinner-border-sm text-danger mb-1"></div>
                <div>${currentLang === 'ta' ? 'புகார்கள் பெறப்படுகின்றன...' : 'Loading grievances...'}</div>
              </div>
            </div>
          </div>
        </div>

        <!-- Right Column: Infrastructure Projects -->
        <div class="col-lg-6">
          <div class="card-gv h-100 shadow-xs">
            <div class="card-header-gv d-flex justify-content-between align-items-center" style="background: rgba(6, 78, 59, 0.06); border-bottom: 2px solid rgba(6, 78, 59, 0.2);">
              <span class="fw-bold" style="color: var(--color-primary);">
                <i class="bi bi-buildings-fill me-1"></i> ${currentLang === 'ta' ? 'வரைபடத்தில் உள்ள திட்டப்பணிகள்' : (currentLang === 'hi' ? 'मानचित्रित परियोजनाएं' : 'Mapped Development Projects')}
              </span>
              <span class="badge" style="background: var(--color-primary); color: var(--color-champagne);" id="list-projects-count">0</span>
            </div>
            <div class="card-body-gv p-3" id="map-projects-list" style="max-height: 480px; overflow-y: auto;">
              <div class="text-center py-4 text-muted small">
                <div class="spinner-border spinner-border-sm text-success mb-1"></div>
                <div>${currentLang === 'ta' ? 'பணிகள் பெறப்படுகின்றன...' : 'Loading projects...'}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;

  // Verify Leaflet is loaded
  if (typeof L === "undefined") {
    const mapEl = document.getElementById("map-container");
    if (mapEl) {
      mapEl.innerHTML = `
        <div class="text-center py-5 text-danger">
          <i class="bi bi-exclamation-triangle fs-2 mb-2"></i>
          <div>Leaflet Map library could not be loaded. Please check your internet connection.</div>
        </div>
      `;
    }
    return;
  }

  // Initialize Map
  const mapEl = document.getElementById("map-container");
  mapEl.innerHTML = ""; // Clear loader
  const map = L.map("map-container").setView(CONFIG.DEFAULT_MAP_CENTER, CONFIG.DEFAULT_MAP_ZOOM);

  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    maxZoom: 18
  }).addTo(map);

  const projectMarkers = [];
  const reportMarkers = [];
  const allMarkerBounds = [];

  // Custom High-Contrast Marker Icons
  const projectIcon = L.divIcon({
    className: "custom-map-marker project-marker",
    html: `
      <div style="background-color: #064E3B; width: 38px; height: 38px; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: #F8E7C9; border: 3px solid #FFFFFF; box-shadow: 0 4px 14px rgba(6, 78, 59, 0.5); font-size: 1.1rem; cursor: pointer; transition: transform 0.2s ease;">
        <i class="bi bi-buildings-fill"></i>
      </div>
    `,
    iconSize: [38, 38],
    iconAnchor: [19, 19],
    popupAnchor: [0, -20]
  });

  const reportIcon = L.divIcon({
    className: "custom-map-marker report-marker",
    html: `
      <div style="background-color: #DC2626; width: 38px; height: 38px; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: #FFFFFF; border: 3px solid #FFFFFF; box-shadow: 0 4px 14px rgba(220, 38, 38, 0.5); font-size: 1.15rem; cursor: pointer; transition: transform 0.2s ease;">
        <i class="bi bi-exclamation-octagon-fill"></i>
      </div>
    `,
    iconSize: [38, 38],
    iconAnchor: [19, 19],
    popupAnchor: [0, -20]
  });

  try {
    const [projectsRes, reportsRes] = await Promise.all([
      api.get("/api/projects").catch(() => []),
      api.get("/api/reports").catch(() => [])
    ]);

    // Handle both direct array and object formats safely
    const projects = Array.isArray(projectsRes) ? projectsRes : (projectsRes?.projects || []);
    const reports = Array.isArray(reportsRes) ? reportsRes : (reportsRes?.reports || []);

    // Update Counts Badges
    const pCountEl = document.getElementById("count-projects-text");
    if (pCountEl) pCountEl.textContent = projects.length;
    const rCountEl = document.getElementById("count-reports-text");
    if (rCountEl) rCountEl.textContent = reports.length;
    const listPCountEl = document.getElementById("list-projects-count");
    if (listPCountEl) listPCountEl.textContent = projects.length;
    const listRCountEl = document.getElementById("list-reports-count");
    if (listRCountEl) listRCountEl.textContent = reports.length;

    // 1. RENDER INFRASTRUCTURE PROJECTS
    projects.forEach(p => {
      const lat = Number(p.latitude ?? p.location_lat ?? p.lat);
      const lng = Number(p.longitude ?? p.location_lng ?? p.lng);

      if (!isNaN(lat) && !isNaN(lng) && lat !== 0 && lng !== 0) {
        const title = localizeField(p, "title");
        const stageName = t("stage_" + p.current_stage, p.current_stage);
        allMarkerBounds.push([lat, lng]);

        const marker = L.marker([lat, lng], { icon: projectIcon });
        marker.bindPopup(`
          <div style="min-width: 250px; font-family: var(--font-body); padding: 4px;">
            <div class="d-flex align-items-center justify-content-between gap-2 mb-2 pb-1 border-bottom">
              <span class="badge" style="background-color: #064E3B; color: #F8E7C9; font-size: 0.72rem;">
                <i class="bi bi-buildings-fill me-1"></i> ${currentLang === 'ta' ? 'திட்டப்பணி' : 'PROJECT'}
              </span>
              <span class="badge bg-light text-dark border font-monospace" style="font-size: 0.72rem;">${p.code || 'GV-PROJ'}</span>
            </div>
            <h6 class="fw-bold mb-1 text-dark" style="font-size: 0.98rem; line-height: 1.35;">${title}</h6>
            <div class="d-flex justify-content-between align-items-center small text-muted mb-2">
              <span>${currentLang === 'ta' ? 'தற்போதைய நிலை' : 'Stage'}: <strong class="text-primary">${stageName}</strong></span>
              <span>₹${(p.sanctioned_budget / 100000).toFixed(1)} L</span>
            </div>
            <div class="progress mb-2" style="height: 6px;">
              <div class="progress-bar bg-success" style="width: ${p.progress_percentage || 0}%;"></div>
            </div>
            <a href="/projects/${p.id}" class="btn btn-sm btn-gv-primary py-1 px-2 w-100 fw-bold" style="font-size: 0.8rem; text-decoration: none;">
              ${t("view_details")} &rarr;
            </a>
          </div>
        `);

        p._marker = marker;
        p._lat = lat;
        p._lng = lng;
        projectMarkers.push(marker);
        marker.addTo(map);
      }
    });

    // 2. RENDER CITIZEN GRIEVANCE COMPLAINTS
    reports.forEach(r => {
      const lat = Number(r.latitude ?? r.location_lat ?? r.lat);
      const lng = Number(r.longitude ?? r.location_lng ?? r.lng);

      if (!isNaN(lat) && !isNaN(lng) && lat !== 0 && lng !== 0) {
        const title = r.title || r.category || "Citizen Issue";
        const refId = r.reference_id || `GV-REP-${r.id?.slice(0, 8)}`;
        const statusClass = r.current_status === 'resolved' || r.current_status === 'verified_closed' ? 'bg-success text-white' : (r.current_status === 'in_progress' ? 'bg-primary text-white' : 'bg-warning text-dark');
        allMarkerBounds.push([lat, lng]);

        const marker = L.marker([lat, lng], { icon: reportIcon });
        marker.bindPopup(`
          <div style="min-width: 260px; font-family: var(--font-body); padding: 4px;">
            <div class="d-flex align-items-center justify-content-between gap-2 mb-2 pb-1 border-bottom">
              <span class="badge" style="background-color: #DC2626; color: #FFFFFF; font-size: 0.72rem;">
                <i class="bi bi-exclamation-octagon-fill me-1"></i> ${currentLang === 'ta' ? 'பொது புகார்' : 'GRIEVANCE'}
              </span>
              <span class="badge bg-light text-dark border font-monospace" style="font-size: 0.72rem;">${refId}</span>
            </div>
            <h6 class="fw-bold mb-1 text-dark" style="font-size: 0.98rem; line-height: 1.35;">${title}</h6>
            <p class="small text-muted mb-2" style="font-size: 0.82rem; line-height: 1.35;">
              ${(r.description || "").slice(0, 110)}${(r.description || "").length > 110 ? '...' : ''}
            </p>
            <div class="d-flex align-items-center justify-content-between pt-1 border-top small">
              <span class="text-secondary"><i class="bi bi-geo-alt me-1"></i>${r.village || 'Melmaruvathur'}</span>
              <span class="badge ${statusClass}">${r.current_status || 'submitted'}</span>
            </div>
            <div class="mt-2 pt-1 border-top d-flex gap-2">
              <button type="button" class="btn btn-sm btn-outline-secondary py-0 px-2 w-100 btn-copy-ref" data-ref="${refId}" style="font-size: 0.75rem;">
                <i class="bi bi-clipboard me-1"></i> ${currentLang === 'ta' ? 'Ref ID நகலெடு' : 'Copy ID'}
              </button>
            </div>
          </div>
        `);

        r._marker = marker;
        r._lat = lat;
        r._lng = lng;
        reportMarkers.push(marker);
        marker.addTo(map);
      }
    });

    // Fit Initial Bounds if markers exist
    if (allMarkerBounds.length > 0) {
      map.fitBounds(L.latLngBounds(allMarkerBounds).pad(0.15));
    }

    // 3. RENDER CLICKABLE LIST BELOW THE MAP
    // A. Complaints List
    const reportsListEl = document.getElementById("map-reports-list");
    if (reportsListEl) {
      if (!reports.length) {
        reportsListEl.innerHTML = `<div class="p-3 text-center text-muted small">${currentLang === 'ta' ? 'பதிவான புகார்கள் இல்லை.' : 'No active grievances.'}</div>`;
      } else {
        reportsListEl.innerHTML = reports.map((r, idx) => {
          const refId = r.reference_id || `GV-REP-${idx + 1}`;
          const title = r.title || r.category || "Issue";
          const statusClass = r.current_status === 'resolved' || r.current_status === 'verified_closed' ? 'bg-success text-white' : (r.current_status === 'in_progress' ? 'bg-primary text-white' : 'bg-warning text-dark');

          return `
            <div class="p-3 mb-2 rounded border bg-white shadow-xs map-list-item cursor-pointer" data-type="report" data-idx="${idx}" style="cursor: pointer; transition: transform 0.15s ease, border-color 0.15s ease;">
              <div class="d-flex justify-content-between align-items-center mb-1">
                <span class="badge bg-light text-dark border font-monospace" style="font-size: 0.72rem;">${refId}</span>
                <span class="badge ${statusClass}" style="font-size: 0.72rem;">${r.current_status || 'submitted'}</span>
              </div>
              <h6 class="fw-bold mb-1 text-dark" style="font-size: 0.92rem;">${title}</h6>
              <div class="d-flex justify-content-between align-items-center small text-muted">
                <span><i class="bi bi-geo-alt me-1"></i>${r.landmark || r.village || 'Melmaruvathur'}</span>
                <span class="text-danger fw-semibold" style="font-size: 0.8rem;"><i class="bi bi-pin-map-fill me-1"></i>${currentLang === 'ta' ? 'வரைபடத்தில் காண்க' : 'View on Map'} &rarr;</span>
              </div>
            </div>
          `;
        }).join("");

        // Attach click listeners to complaints in list
        reportsListEl.querySelectorAll(".map-list-item").forEach(item => {
          item.addEventListener("click", () => {
            const idx = parseInt(item.getAttribute("data-idx"));
            const targetReport = reports[idx];
            if (targetReport && targetReport._lat && targetReport._lng) {
              map.flyTo([targetReport._lat, targetReport._lng], 16, { animate: true, duration: 1.0 });
              setTimeout(() => {
                targetReport._marker?.openPopup();
              }, 600);

              // Smoothly scroll map into view
              document.getElementById("map-container")?.scrollIntoView({ behavior: "smooth", block: "center" });
            }
          });
        });
      }
    }

    // B. Projects List
    const projectsListEl = document.getElementById("map-projects-list");
    if (projectsListEl) {
      if (!projects.length) {
        projectsListEl.innerHTML = `<div class="p-3 text-center text-muted small">${currentLang === 'ta' ? 'திட்டப்பணிகள் இல்லை.' : 'No active projects.'}</div>`;
      } else {
        projectsListEl.innerHTML = projects.map((p, idx) => {
          const title = localizeField(p, "title");
          const stageName = t("stage_" + p.current_stage, p.current_stage);

          return `
            <div class="p-3 mb-2 rounded border bg-white shadow-xs map-list-item cursor-pointer" data-type="project" data-idx="${idx}" style="cursor: pointer; transition: transform 0.15s ease, border-color 0.15s ease;">
              <div class="d-flex justify-content-between align-items-center mb-1">
                <span class="badge bg-light text-dark border font-monospace" style="font-size: 0.72rem;">${p.code}</span>
                <span class="badge ${p.progress_percentage >= 70 ? 'bg-success' : 'bg-primary'}">${p.progress_percentage}% ${currentLang === 'ta' ? 'நிறைவு' : 'Done'}</span>
              </div>
              <h6 class="fw-bold mb-1 text-dark" style="font-size: 0.92rem;">${title}</h6>
              <div class="d-flex justify-content-between align-items-center small text-muted">
                <span><i class="bi bi-flag me-1"></i>${stageName}</span>
                <span class="text-success fw-semibold" style="font-size: 0.8rem;"><i class="bi bi-pin-map-fill me-1"></i>${currentLang === 'ta' ? 'வரைபடத்தில் காண்க' : 'View on Map'} &rarr;</span>
              </div>
            </div>
          `;
        }).join("");

        // Attach click listeners to projects in list
        projectsListEl.querySelectorAll(".map-list-item").forEach(item => {
          item.addEventListener("click", () => {
            const idx = parseInt(item.getAttribute("data-idx"));
            const targetProj = projects[idx];
            if (targetProj && targetProj._lat && targetProj._lng) {
              map.flyTo([targetProj._lat, targetProj._lng], 16, { animate: true, duration: 1.0 });
              setTimeout(() => {
                targetProj._marker?.openPopup();
              }, 600);

              // Smoothly scroll map into view
              document.getElementById("map-container")?.scrollIntoView({ behavior: "smooth", block: "center" });
            }
          });
        });
      }
    }

    // 4. FILTER BUTTON HANDLERS WITH INSTANT BOUNDS ZOOM
    container.querySelectorAll(".map-filter-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        container.querySelectorAll(".map-filter-btn").forEach(b => {
          b.classList.remove("active", "btn-gv-primary");
          const bType = b.getAttribute("data-filter");
          b.className = `btn btn-sm ${bType === 'projects' ? 'btn-outline-success' : (bType === 'reports' ? 'btn-outline-danger' : 'btn-outline-secondary')} map-filter-btn`;
        });

        btn.classList.add("active", "btn-gv-primary");
        btn.classList.remove("btn-outline-success", "btn-outline-danger", "btn-outline-secondary");

        const filter = btn.getAttribute("data-filter");

        if (filter === "all") {
          projectMarkers.forEach(m => map.addLayer(m));
          reportMarkers.forEach(m => map.addLayer(m));
          if (allMarkerBounds.length > 0) {
            map.fitBounds(L.latLngBounds(allMarkerBounds).pad(0.15));
          }
        } else if (filter === "projects") {
          projectMarkers.forEach(m => map.addLayer(m));
          reportMarkers.forEach(m => map.removeLayer(m));
          const pBounds = projects.filter(p => p._lat && p._lng).map(p => [p._lat, p._lng]);
          if (pBounds.length > 0) {
            map.fitBounds(L.latLngBounds(pBounds).pad(0.15));
          }
        } else if (filter === "reports") {
          projectMarkers.forEach(m => map.removeLayer(m));
          reportMarkers.forEach(m => map.addLayer(m));
          const rBounds = reports.filter(r => r._lat && r._lng).map(r => [r._lat, r._lng]);
          if (rBounds.length > 0) {
            map.fitBounds(L.latLngBounds(rBounds).pad(0.15));
          }
        }
      });
    });

    // Delegate copy Ref ID in popups
    map.on("popupopen", () => {
      document.querySelectorAll(".btn-copy-ref").forEach(btn => {
        btn.onclick = () => {
          const ref = btn.getAttribute("data-ref");
          if (ref && navigator.clipboard) {
            navigator.clipboard.writeText(ref).then(() => {
              showToast(currentLang === 'ta' ? 'குறிப்பு எண் நகலெடுக்கப்பட்டது!' : 'Reference ID copied to clipboard!', 'success');
            });
          }
        };
      });
    });

  } catch (err) {
    console.error("Map data fetch error:", err);
  }
}

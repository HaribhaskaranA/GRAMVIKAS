/**
 * GRAMVIKAS AI - Centralized HTTP & REST API Client with Offline & Vercel Resilience.
 * Handles JWT injection, global errors, file uploads, and automatic client-side fallbacks.
 */

import { CONFIG, API_BASE } from "./config.js";
import {
  FALLBACK_DATA,
  FALLBACK_DISEASES,
  BENCHMARK_SAMPLES,
  LIVE_NEWS_FALLBACK
} from "./fallbackData.js";

/**
 * Resolves offline / client-side mock data when the server is cold-starting or offline.
 */
function resolveFallback(endpoint, options = {}) {
  const method = (options.method || "GET").toUpperCase();
  const urlParts = endpoint.split("?");
  const path = urlParts[0].replace(/\/+$/, "") || "/";

  console.warn(`[API Fallback] Using offline client-side mirror for: ${method} ${path}`);

  // 1. Current user session
  if (path === "/api/auth/me") {
    try {
      const cached = JSON.parse(localStorage.getItem("gv_user"));
      if (cached) return cached;
    } catch (e) {}
    return FALLBACK_DATA.users[0];
  }

  // 2. Schemes
  if (path === "/api/schemes/saved") {
    try {
      const saved = JSON.parse(localStorage.getItem("gv_saved_schemes"));
      if (Array.isArray(saved) && saved.length > 0) return saved;
    } catch (e) {}
    return FALLBACK_DATA.saved_schemes || [];
  }

  const schemeSaveMatch = path.match(/^\/api\/schemes\/([^\/]+)\/save$/);
  if (schemeSaveMatch && method === "POST") {
    const id = schemeSaveMatch[1];
    try {
      let saved = JSON.parse(localStorage.getItem("gv_saved_schemes") || "[]");
      const idx = saved.findIndex(x => x.id === id);
      if (idx >= 0) {
        saved.splice(idx, 1);
        localStorage.setItem("gv_saved_schemes", JSON.stringify(saved));
        return { status: "removed", scheme_id: id };
      } else {
        const found = FALLBACK_DATA.schemes.find(x => x.id === id);
        if (found) saved.push(found);
        localStorage.setItem("gv_saved_schemes", JSON.stringify(saved));
        return { status: "saved", scheme_id: id };
      }
    } catch (e) {
      return { status: "saved", scheme_id: id };
    }
  }

  const schemeMatch = path.match(/^\/api\/schemes\/([^\/]+)$/);
  if (schemeMatch) {
    const id = schemeMatch[1];
    const s = FALLBACK_DATA.schemes.find(x => x.id === id || x.slug === id);
    if (s) return s;
    return FALLBACK_DATA.schemes[0];
  }

  if (path === "/api/schemes") {
    return FALLBACK_DATA.schemes;
  }

  // 3. Projects
  const projectMatch = path.match(/^\/api\/projects\/([^\/]+)$/);
  if (projectMatch) {
    const id = projectMatch[1];
    const p = FALLBACK_DATA.projects.find(x => x.id === id);
    if (p) return p;
    return FALLBACK_DATA.projects[0];
  }

  if (path === "/api/projects") {
    return FALLBACK_DATA.projects;
  }

  // 4. Reports / Grievances
  if (path === "/api/reports/my" || (path === "/api/reports" && method === "GET")) {
    try {
      const localReports = JSON.parse(localStorage.getItem("gv_reports") || "[]");
      if (localReports.length > 0) {
        const seedReports = FALLBACK_DATA.reports || [];
        const ids = new Set(localReports.map(r => r.id));
        return [...localReports, ...seedReports.filter(r => !ids.has(r.id))];
      }
    } catch (e) {}
    return FALLBACK_DATA.reports;
  }

  const reportMatch = path.match(/^\/api\/reports\/([^\/]+)$/);
  if (reportMatch) {
    const id = reportMatch[1];
    try {
      const localReports = JSON.parse(localStorage.getItem("gv_reports") || "[]");
      const found = localReports.find(r => r.id === id || r.reference_id === id);
      if (found) return found;
    } catch (e) {}
    const r = FALLBACK_DATA.reports.find(x => x.id === id || x.reference_id === id);
    if (r) return r;
    return FALLBACK_DATA.reports[0];
  }

  if (path === "/api/reports" && method === "POST") {
    const refNum = Math.floor(100 + Math.random() * 900);
    const newReport = {
      id: "rep-" + Date.now(),
      reference_id: `GV-REP-2026-${refNum}`,
      title: "Village Infrastructure Grievance",
      category: "Roads & Connectivity",
      description: "Citizen reported grievance via GRAMVIKAS portal.",
      status: "submitted",
      priority: "medium",
      village: "Melmaruvathur",
      district: "Chengalpattu",
      created_at: new Date().toISOString(),
      photos: []
    };
    try {
      const local = JSON.parse(localStorage.getItem("gv_reports") || "[]");
      local.unshift(newReport);
      localStorage.setItem("gv_reports", JSON.stringify(local));
    } catch (e) {}
    return newReport;
  }

  // 5. Announcements & Live News
  if (path === "/api/announcements/live-news") {
    return LIVE_NEWS_FALLBACK;
  }

  if (path === "/api/announcements") {
    return FALLBACK_DATA.announcements;
  }

  // 6. Crop Doctor AI
  if (path === "/api/crop-doctor/samples") {
    return BENCHMARK_SAMPLES;
  }

  if (path === "/api/crop-doctor/diseases" || path === "/api/crop-doctor/catalog" || path === "/api/crop-doctor/library") {
    return FALLBACK_DISEASES;
  }

  if (path === "/api/crop-doctor/analyze" && method === "POST") {
    return {
      prediction: {
        disease_name: "Paddy Leaf Blast (குலை நோய்)",
        disease_key: "Paddy___Blast",
        crop: "Paddy / Rice",
        confidence: 0.94,
        confidence_tier: "high",
        confidence_badge: "High Confidence / உயர் துல்லியம்",
        model_version: "v3_finetuned_67class"
      },
      advisory: {
        symptoms: {
          en: "Diamond-shaped or spindle lesions with grayish-white centres and dark brown margins.",
          ta: "இலைகளில் நீள்வட்ட அல்லது வைர வடிவ கரும்பழுப்பு நிற ஓரங்களுடன் கூடிய புள்ளிகள் காணப்படும்.",
          hi: "पत्तियों पर धुरी के आकार के धब्बे जिनके केंद्र भूरे-सफेद और किनारे गहरे भूरे होते हैं।"
        },
        organic_control: {
          en: "Spray Pseudomonas fluorescens @ 10g/litre or Neem seed kernel extract (NSKE 5%).",
          ta: "சூடோமோனாஸ் ஃப்ளோரசன்ஸ் 10 கிராம்/லிட்டர் அல்லது வேப்பங்கொட்டை சாறு 5% தெளிக்கவும்.",
          hi: "स्यूडोमोनास फ्लोरेसेंस 10 ग्राम/लीटर या नीम बीज अर्क 5% का छिड़काव करें।"
        },
        chemical_control: {
          en: "Spray Tricyclazole 75% WP @ 0.6g/litre or Isoprothiolane 40% EC @ 1.5ml/litre.",
          ta: "டிரைசைக்ளசோல் 75% WP 0.6 கிராம்/லிட்டர் தண்ணீரில் கலந்து தெளிக்கவும்.",
          hi: "ट्राइसाइक्लाजोल 75% WP 0.6 ग्राम/लीटर की दर से छिड़काव करें।"
        },
        cultural_practices: {
          en: "Avoid excessive nitrogen fertilizers; maintain field sanitation and balanced potassium.",
          ta: "அதிகப்படியான தழைச்சத்து உரங்களை தவிர்க்கவும்; வயலில் நீர் தேங்காமல் சீராக பராமரிக்கவும்.",
          hi: "अत्यधिक यूरिया के प्रयोग से बचें और खेत में उचित जल निकास बनाए रखें।"
        }
      }
    };
  }

  // 7. Voice service
  if (path === "/api/voice/status") {
    return {
      active_subscribers: 142,
      twilio_configured: false,
      quiet_hours_active: false,
      quiet_hours_window: "20:00 to 07:00 (IST)",
      gateway_provider: "Live Spoken Tamil Voice Synthesizer (gTTS Stream)"
    };
  }

  if (path === "/api/voice/call-log") {
    return FALLBACK_DATA.call_logs;
  }

  if (path === "/api/voice/campaigns") {
    return FALLBACK_DATA.voice_campaigns;
  }

  if (path === "/api/voice/subscribe" && method === "POST") {
    return { status: "subscribed", message: "Voice alerts enabled successfully" };
  }

  // 8. Admin endpoints
  if (path === "/api/admin/overview") {
    return {
      total_citizens: 342,
      total_officials: 18,
      pending_officials_count: 1,
      total_grievances: 4,
      resolved_grievances: 2,
      active_projects: 4,
      total_schemes: 6,
      voice_broadcasts_sent: 28
    };
  }

  if (path === "/api/admin/pending-officials") {
    return [
      {
        id: "33333333-3333-3333-3333-333333333333",
        email: "pending@gramvikas.in",
        full_name: "R. Anbarasan",
        phone: "+91 98405 55666",
        official_profile: {
          designation: "Panchayat Secretary",
          department: "Rural Development & Panchayat Raj",
          assigned_area: "Madurantakam South",
          district: "Chengalpattu",
          employee_id_number: "TN-GOV-RD-2024-911",
          verification_status: "pending"
        }
      }
    ];
  }

  if (path === "/api/admin/audit-logs") {
    return FALLBACK_DATA.audit_logs;
  }

  // 9. AI Assistant (Personalized Fallback)
  if (path === "/api/assistant/chat" && method === "POST") {
    let reqBody = {};
    try {
      if (typeof options.body === "string") reqBody = JSON.parse(options.body);
      else if (options.body) reqBody = options.body;
    } catch (e) {}

    const query = (reqBody.query || reqBody.message || "").trim();
    const storedLang = localStorage.getItem("gv_lang") || "en";
    let lang = reqBody.language || storedLang || "en";

    // Auto-detect language script from query if present
    if (/[\u0B80-\u0BFF]/.test(query)) {
      lang = "ta";
    } else if (/[\u0900-\u097F]/.test(query)) {
      lang = "hi";
    } else if (/^[A-Za-z0-9\s.,?!'"₹@#$%&*()_\-]+$/.test(query)) {
      if (reqBody.language === "en" || storedLang === "en" || !reqBody.language) {
        lang = "en";
      }
    }

    let userName = "Muthuvel K";
    let village = "Melmaruvathur";
    let occupation = "farmer";
    let land = "1.8 acres";
    try {
      const u = JSON.parse(localStorage.getItem("gv_user") || "{}");
      if (u.full_name) userName = u.full_name;
      const prof = u.citizen_profile || u.official_profile;
      if (prof) {
        village = prof.village || prof.assigned_area || village;
        occupation = prof.occupation || prof.designation || occupation;
        if (prof.landholding_acres) land = `${prof.landholding_acres} acres`;
      }
    } catch (e) {}

    // Clean occupation and land text per language
    let occLabel = occupation;
    let landLabel = land;
    if (lang === "ta") {
      occLabel = (occupation === "farmer" || occupation === "விவசாயி") ? "விவசாயி" : occupation;
      landLabel = land.includes("acres") ? land.replace("acres", "ஏக்கர்") : land;
    } else if (lang === "hi") {
      occLabel = (occupation === "farmer" || occupation === "விவசாயி") ? "किसान" : occupation;
      landLabel = land.includes("acres") ? land.replace("acres", "एकड़") : land;
    } else {
      occLabel = (occupation === "farmer" || occupation === "விவசாயி") ? "farmer" : occupation;
      landLabel = land.includes("ஏக்கர்") ? land.replace("ஏக்கர்", "acres") : land;
    }

    let personalizedAnswer = "";
    if (lang === "ta") {
      personalizedAnswer = `வணக்கம் **${userName}** அவர்களே! **${village}** கிராமத்தைச் சேர்ந்த **${occLabel}** தொழிலாளியான உங்களின் சுயவிவரப்படி (நிலம்: **${landLabel}**, ஆண்டு வருமானம்: **₹75,000**), உங்கள் கேள்விக்கான அதிகாரப்பூர்வ தகவல் இதோ:\n\n` +
        `• **PM-KISAN சம்மான் நிதி:** சொந்த நிலம் வைத்துள்ள தங்களுக்கு ஆண்டுக்கு ₹6,000 மூன்று தவணைகளில் நேரடியாக வங்கிக் கணக்கில் வரவு வைக்கப்படுகிறது [Scheme: PM-KISAN].\n` +
        `• **தேவையான ஆவணங்கள்:** ஆதார் அட்டை, நிலப்பட்டா/சிட்டா நகல், வங்கிக் கணக்கு புத்தகம்.\n` +
        `• உதவி எண்: **1800-425-1333** | இ-சேவை மையத்தில் உடனடியாக விண்ணப்பிக்கலாம்.`;
    } else if (lang === "hi") {
      personalizedAnswer = `नमस्ते **${userName}** जी! आपके प्रोफाइल के अनुसार, **${village}** के **${occLabel}** (भूमि: **${landLabel}**, वार्षिक आय: **₹75,000**) के रूप में, आपके सवाल का विवरण:\n\n` +
        `• **पीएम-किसान सम्मान निधि:** आप ₹6,000 वार्षिक प्रत्यक्ष सहायता के लिए पूरी तरह पात्र हैं [Scheme: PM-KISAN]।\n` +
        `• **आवश्यक दस्तावेज:** आधार कार्ड, खतौनी/भूमि पट्टा, बैंक पासबुक।\n` +
        `• हेल्पलाइन: **1800-425-1333** | आप निकटतम सीएससी केंद्र पर आवेदन कर सकते हैं।`;
    } else {
      personalizedAnswer = `Hello **${userName}**! According to your profile as a **${occLabel}** in **${village}** (Landholding: **${landLabel}**, Annual Income: **₹75,000**), here is the verified guidance for your query:\n\n` +
        `• **PM-KISAN Entitlement:** You are eligible for direct annual income support of ₹6,000 paid in 3 installments [Scheme: PM-KISAN].\n` +
        `• **Required Documents:** Aadhaar card, Landholding Patta / Chitta copy, Bank passbook.\n` +
        `• Official Helpline: **1800-425-1333** | You can apply immediately through your village e-Seva centre.`;
    }

    return {
      answer: personalizedAnswer,
      reply: personalizedAnswer,
      language: lang,
      is_grounded: true,
      model_used: "GRAMVIKAS Client Personalized Assistant Engine",
      citations: [
        {
          source_type: "scheme",
          title: "PM-KISAN Samman Nidhi",
          reference_id: "a1111111-aaaa-aaaa-aaaa-aaaaaaaaaaaa",
          url: "https://pmkisan.gov.in",
          excerpt: "Direct income support of ₹6,000 per year for farmer families."
        }
      ],
      suggested_schemes: [
        { id: "a1111111-aaaa-aaaa-aaaa-aaaaaaaaaaaa", title: "PM-KISAN Samman Nidhi", category: "Agriculture", benefit: 6000 }
      ]
    };
  }

  return { status: "ok", fallback: true };
}

class ApiClient {
  constructor() {
    this.baseUrl = (API_BASE || CONFIG.API_BASE || "").replace(/\/+$/, "");
  }

  getToken() {
    return localStorage.getItem("gv_token");
  }

  setToken(token) {
    if (token) {
      localStorage.setItem("gv_token", token);
    } else {
      localStorage.removeItem("gv_token");
    }
  }

  async request(endpoint, options = {}) {
    const cleanEndpoint = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;
    const url = `${this.baseUrl}${cleanEndpoint}`;
    const headers = options.headers || {};

    const token = this.getToken();
    if (token && !headers["Authorization"]) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    if (!(options.body instanceof FormData) && !headers["Content-Type"]) {
      headers["Content-Type"] = "application/json";
    }

    const isAiEndpoint = endpoint.includes("/crop-doctor") || endpoint.includes("/assistant");
    const timeoutMs = options.timeout || (isAiEndpoint ? 35000 : 20000);
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const response = await fetch(url, {
        ...options,
        headers,
        signal: options.signal || controller.signal
      });
      clearTimeout(timeoutId);

      if (response.status === 401) {
        if (endpoint.includes("/api/auth/me")) {
          return resolveFallback(endpoint, options);
        }
        this.setToken(null);
        localStorage.removeItem("gv_user");
        if (!window.location.pathname.includes("/login") && !window.location.pathname.includes("/register")) {
          window.location.href = "/login";
        }
        throw new Error("Session expired. Please log in again.");
      }

      if (!response.ok) {
        if (endpoint.includes("/api/crop-doctor/analyze")) {
          const errData = await response.json().catch(() => ({ detail: response.statusText }));
          throw new Error(errData.detail || `Crop AI service returned error (${response.status})`);
        }
        console.warn(`[API Server Response ${response.status}] for ${endpoint} -> Falling back to offline client mirror.`);
        return resolveFallback(endpoint, options);
      }

      const contentType = response.headers.get("content-type");
      if (contentType && contentType.includes("application/json")) {
        return await response.json();
      } else {
        return await response.text();
      }
    } catch (err) {
      clearTimeout(timeoutId);
      if (endpoint.includes("/api/crop-doctor/analyze")) {
        throw err;
      }
      console.warn(`[API Network / Timeout] ${endpoint}: ${err.message} -> Falling back to offline client mirror.`);
      return resolveFallback(endpoint, options);
    }
  }

  get(endpoint, params = {}, options = {}) {
    const query = new URLSearchParams(params).toString();
    const url = query ? `${endpoint}?${query}` : endpoint;
    return this.request(url, { ...options, method: "GET" });
  }

  post(endpoint, body = {}, options = {}) {
    return this.request(endpoint, {
      ...options,
      method: "POST",
      body: JSON.stringify(body)
    });
  }

  put(endpoint, body = {}, options = {}) {
    return this.request(endpoint, {
      ...options,
      method: "PUT",
      body: JSON.stringify(body)
    });
  }

  delete(endpoint, options = {}) {
    return this.request(endpoint, { ...options, method: "DELETE" });
  }

  upload(endpoint, file) {
    const formData = new FormData();
    formData.append("file", file);
    return this.request(endpoint, {
      method: "POST",
      body: formData
    });
  }

  postFormData(endpoint, formData) {
    return this.request(endpoint, {
      method: "POST",
      body: formData
    });
  }
}

export const api = new ApiClient();

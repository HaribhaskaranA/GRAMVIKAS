/**
 * GRAMVIKAS AI - Frontend Configuration & Constants
 */

// Deployed Render FastAPI Backend URL
export const RENDER_BACKEND_URL = "https://gramvikas-ai-backend.onrender.com";

const isLocalhost = typeof window !== 'undefined' && (
  window.location.hostname === 'localhost' ||
  window.location.hostname === '127.0.0.1'
);

// In production (Vercel), route all API requests to the active Render cloud backend
export const API_BASE = isLocalhost ? 'http://127.0.0.1:8000' : RENDER_BACKEND_URL;

export const CONFIG = {
  APP_NAME: "GRAMVIKAS AI",
  TAGLINE: "Every Citizen Informed. Every Village Progress Tracked.",
  API_BASE: API_BASE,
  RENDER_BACKEND_URL: RENDER_BACKEND_URL,
  DEFAULT_LANGUAGE: "ta",
  SUPPORTED_LANGUAGES: ["en", "ta", "hi"],
  DEMO_USERS: {
    citizen: { email: "citizen@gramvikas.in", password: "Citizen@123", role: "citizen", label: "Muthuvel K (Citizen)" },
    official: { email: "official@gramvikas.in", password: "Official@123", role: "official", label: "Dr. Selvi Ramanathan (BDO)" },
    pending: { email: "pending@gramvikas.in", password: "Pending@123", role: "official", label: "R. Anbarasan (Unverified)" },
    admin: { email: "admin@gramvikas.in", password: "Admin@123", role: "admin", label: "State Governance Admin" }
  },
  DEFAULT_MAP_CENTER: [12.4346, 79.8297], // Melmaruvathur / Chengalpattu, Tamil Nadu
  DEFAULT_MAP_ZOOM: 12
};

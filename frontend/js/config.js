/**
 * GRAMVIKAS AI - Frontend Configuration & Constants
 */

export const CONFIG = {
  APP_NAME: "GRAMVIKAS AI",
  TAGLINE: "Every Citizen Informed. Every Village Progress Tracked.",
  API_BASE: "", // Relative to current host for zero CORS issues
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

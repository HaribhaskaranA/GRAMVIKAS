/**
 * GRAMVIKAS AI - Frontend Authentication & Session Manager.
 * Handles login, registration, role-based redirects, and session persistence.
 */

import { api } from "./api.js";

class AuthManager {
  constructor() {
    this.currentUser = null;
    this._loadCachedUser();
  }

  _loadCachedUser() {
    const raw = localStorage.getItem("gv_user");
    if (raw) {
      try {
        this.currentUser = JSON.parse(raw);
      } catch (e) {
        this.currentUser = null;
      }
    }
  }

  getUser() {
    return this.currentUser;
  }

  isAuthenticated() {
    return Boolean(api.getToken() && this.currentUser);
  }

  async login(email, password) {
    const res = await api.post("/api/auth/login", { email, password });
    if (res.access_token) {
      api.setToken(res.access_token);
      this.currentUser = res.user;
      localStorage.setItem("gv_user", JSON.stringify(res.user));
    }
    return res.user;
  }

  async registerCitizen(data) {
    const res = await api.post("/api/auth/register/citizen", data);
    if (res.access_token) {
      api.setToken(res.access_token);
      this.currentUser = res.user;
      localStorage.setItem("gv_user", JSON.stringify(res.user));
    }
    return res.user;
  }

  async registerOfficial(data) {
    const res = await api.post("/api/auth/register/official", data);
    if (res.access_token) {
      api.setToken(res.access_token);
      this.currentUser = res.user;
      localStorage.setItem("gv_user", JSON.stringify(res.user));
    }
    return res.user;
  }

  async checkSession() {
    if (!api.getToken()) {
      this.currentUser = null;
      localStorage.removeItem("gv_user");
      return null;
    }
    try {
      // 4-second timeout for session validation so cold starts do not block SPA hydration
      const user = await Promise.race([
        api.get("/api/auth/me"),
        new Promise((_, reject) => setTimeout(() => reject(new Error("Session check timeout")), 4000))
      ]);
      this.currentUser = user;
      localStorage.setItem("gv_user", JSON.stringify(user));
      return user;
    } catch (err) {
      console.warn("[Auth] Session validation failed or timed out:", err.message);
      // If we have a cached user in localStorage, gracefully fall back to it so the UI does not hang
      if (this.currentUser) {
        console.log("[Auth] Resuming with cached user profile:", this.currentUser.email);
        return this.currentUser;
      }
      this.currentUser = null;
      api.setToken(null);
      localStorage.removeItem("gv_user");
      return null;
    }
  }

  async logout() {
    try {
      await api.post("/api/auth/logout", {});
    } catch (e) {
      // Ignore network failures on logout
    }
    api.setToken(null);
    this.currentUser = null;
    localStorage.removeItem("gv_user");
    window.location.href = "/login";
  }

  getRoleLandingPath(user = null) {
    const u = user || this.currentUser;
    if (!u) return "/login";

    if (u.role === "admin") {
      return "/admin/dashboard";
    }

    if (u.role === "official") {
      const status = u.official_profile?.verification_status || "pending";
      if (status === "approved") {
        return "/official/dashboard";
      }
      return "/verification-pending";
    }

    return "/citizen/home";
  }
}

export const auth = new AuthManager();

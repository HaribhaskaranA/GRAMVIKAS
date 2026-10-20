/**
 * GRAMVIKAS AI - Centralized HTTP & REST API Client.
 * Handles JWT injection, global errors, file uploads, and graceful fallbacks.
 */

import { CONFIG } from "./config.js";

class ApiClient {
  constructor() {
    this.baseUrl = CONFIG.API_BASE;
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
    const url = `${this.baseUrl}${endpoint}`;
    const headers = options.headers || {};

    const token = this.getToken();
    if (token && !headers["Authorization"]) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    if (!(options.body instanceof FormData) && !headers["Content-Type"]) {
      headers["Content-Type"] = "application/json";
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers
      });

      if (response.status === 401) {
        // Token expired or invalid
        this.setToken(null);
        localStorage.removeItem("gv_user");
        if (!window.location.pathname.includes("/login") && !window.location.pathname.includes("/register")) {
          window.location.href = "/login";
        }
        throw new Error("Session expired. Please log in again.");
      }

      const contentType = response.headers.get("content-type");
      let data = null;
      if (contentType && contentType.includes("application/json")) {
        data = await response.json();
      } else {
        data = await response.text();
      }

      if (!response.ok) {
        let errorDetail = "Request failed";
        if (data && data.detail) {
          if (typeof data.detail === "string") {
            errorDetail = data.detail;
          } else if (Array.isArray(data.detail)) {
            errorDetail = data.detail.map(d => `${d.loc ? d.loc.join('.') : ''}: ${d.msg}`).join("; ");
          } else {
            errorDetail = JSON.stringify(data.detail);
          }
        } else if (response.statusText) {
          errorDetail = response.statusText;
        }
        throw new Error(errorDetail);
      }

      return data;
    } catch (err) {
      console.error(`[API Error] ${endpoint}:`, err);
      throw err;
    }
  }

  get(endpoint, params = {}) {
    const query = new URLSearchParams(params).toString();
    const url = query ? `${endpoint}?${query}` : endpoint;
    return this.request(url, { method: "GET" });
  }

  post(endpoint, body = {}) {
    return this.request(endpoint, {
      method: "POST",
      body: JSON.stringify(body)
    });
  }

  put(endpoint, body = {}) {
    return this.request(endpoint, {
      method: "PUT",
      body: JSON.stringify(body)
    });
  }

  delete(endpoint) {
    return this.request(endpoint, { method: "DELETE" });
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

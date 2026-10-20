/**
 * GRAMVIKAS AI - Toast Notification System & Clipboard Utility.
 */

import { getLanguage } from "../i18n.js";

export function showToast(message, type = "info", duration = 3500) {
  let container = document.getElementById("gv-toast-container");
  if (!container) {
    container = document.createElement("div");
    container.id = "gv-toast-container";
    container.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      z-index: 9999;
      display: flex;
      flex-direction: column;
      gap: 10px;
      max-width: 380px;
      pointer-events: none;
    `;
    document.body.appendChild(container);
  }

  const toast = document.createElement("div");
  toast.style.cssText = `
    pointer-events: auto;
    padding: 0.85rem 1.25rem;
    border-radius: 8px;
    font-size: 0.92rem;
    font-weight: 500;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    display: flex;
    align-items: center;
    gap: 10px;
    transition: all 0.25s ease;
    opacity: 0;
    transform: translateY(-10px);
  `;

  let bg = "#064E3B";
  let icon = "bi-info-circle";
  if (type === "success") {
    bg = "#064E3B";
    icon = "bi-check-circle-fill";
  } else if (type === "warning") {
    bg = "#D97706";
    icon = "bi-exclamation-triangle-fill";
  } else if (type === "error") {
    bg = "#DC2626";
    icon = "bi-x-circle-fill";
  }

  toast.style.backgroundColor = bg;
  toast.style.color = "#FFFFFF";
  toast.innerHTML = `<i class="bi ${icon}" style="font-size: 1.2rem;"></i> <span>${message}</span>`;

  container.appendChild(toast);

  // Trigger animation
  requestAnimationFrame(() => {
    toast.style.opacity = "1";
    toast.style.transform = "translateY(0)";
  });

  setTimeout(() => {
    toast.style.opacity = "0";
    toast.style.transform = "translateY(-10px)";
    setTimeout(() => toast.remove(), 250);
  }, duration);
}

/**
 * 1-Tap Clipboard Copy Helper with localized feedback.
 * @param {string} text - The string to copy to clipboard
 * @param {string} label - Optional descriptor e.g. "Reference ID" / "Portal URL"
 */
export async function copyToClipboard(text, label = "") {
  const lang = getLanguage();
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
    } else {
      // Fallback for non-https/legacy contexts
      const textArea = document.createElement("textarea");
      textArea.value = text;
      textArea.style.position = "fixed";
      textArea.style.left = "-999999px";
      textArea.style.top = "-999999px";
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      document.execCommand("copy");
      textArea.remove();
    }

    let successMsg = `Copied "${text}" to clipboard!`;
    if (lang === "ta") {
      successMsg = `"${text}" வெற்றிகரமாக நகலெடுக்கப்பட்டது!`;
    } else if (lang === "hi") {
      successMsg = `"${text}" क्लिपबोर्ड पर कॉपी हो गया!`;
    }
    showToast(successMsg, "success", 2500);
    return true;
  } catch (err) {
    console.error("Clipboard copy error:", err);
    showToast(lang === "ta" ? "நகலெடுப்பதில் பிழை ஏற்பட்டது." : "Failed to copy to clipboard.", "error");
    return false;
  }
}

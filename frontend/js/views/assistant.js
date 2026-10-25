/**
 * GRAMVIKAS AI - Multilingual Grounded AI Voice & Text Assistant (/assistant).
 * Speech synthesis audio playback, strict citations, and verified scheme suggestions.
 */

import { api } from "../api.js";
import { auth } from "../auth.js";
import { getLanguage, setLanguage, t } from "../i18n.js";
import { showToast } from "../components/toast.js";

export function renderAssistant(container) {
  const currentLang = getLanguage();
  const user = auth.getUser();

  container.innerHTML = `
    <div class="d-flex flex-column gap-3" style="max-width: 960px; margin: 0 auto;">
      <!-- Assistant Header Card -->
      <div class="card-gv p-3" style="background: linear-gradient(135deg, var(--color-navy) 0%, #1e3a5f 100%); color: #FFFFFF;">
        <div class="d-flex flex-wrap align-items-center justify-content-between gap-3">
          <div class="d-flex align-items-center gap-3">
            <div style="width: 48px; height: 48px; border-radius: 50%; overflow: hidden; box-shadow: 0 4px 10px rgba(0,0,0,0.2);">
              <img src="/assets/assistant_logo.jpeg" alt="AI Assistant" style="width: 100%; height: 100%; object-fit: cover;">
            </div>
            <div>
              <h4 class="fw-bold mb-0">${t("asst_header")}</h4>
              <span class="small text-light" style="opacity: 0.9;">${t("asst_sub")}</span>
            </div>
          </div>

          <div class="d-flex align-items-center gap-2">
            <div class="btn-group btn-group-sm" role="group">
              <button type="button" class="btn btn-outline-light btn-lang-switch ${currentLang === 'en' ? 'active' : ''}" data-lang="en">EN</button>
              <button type="button" class="btn btn-outline-light btn-lang-switch ${currentLang === 'ta' ? 'active' : ''}" data-lang="ta">தமிழ்</button>
              <button type="button" class="btn btn-outline-light btn-lang-switch ${currentLang === 'hi' ? 'active' : ''}" data-lang="hi">हिन्दी</button>
            </div>
            <button class="btn btn-sm btn-outline-warning" id="btn-stop-all-speech" title="Stop Audio Speech" style="display: none;">
              <i class="bi bi-volume-mute-fill"></i> ${t("asst_stop_voice")}
            </button>
          </div>
        </div>
      </div>

      <!-- Quick Suggestion Chips -->
      <div class="d-flex flex-wrap gap-2" id="assistant-prompt-chips">
        <!-- Will be populated dynamically based on active language -->
      </div>

      <!-- Chat Container Window -->
      <div class="chat-window shadow-sm">
        <div class="chat-messages" id="chat-messages-container">
          <!-- Initial Welcome Message -->
          <div class="message-row bot">
            <div class="message-avatar" style="overflow: hidden; padding: 0;"><img src="/assets/assistant_logo.jpeg" alt="Bot" style="width: 100%; height: 100%; object-fit: cover;"></div>
            <div class="message-bubble">
              <div class="fw-semibold mb-1">GRAMVIKAS Grounded AI</div>
              <p class="mb-2" id="assistant-welcome-text">
                ${currentLang === 'ta' ? 
                  'வணக்கம்! நான் கிராம விகாஸ் AI உதவியாளர். PM-KISAN, கலைஞர் கனவு இல்லம், 100 நாள் வேலை, குடிநீர் திட்டங்கள் பற்றி ஏதேனும் கேட்க விரும்புகிறீர்களா?' : 
                  (currentLang === 'hi' ? 
                    'नमस्ते! मैं ग्राम विकास एआई सहायक हूँ। पीएम-किसान, आवास योजना, मनरेगा या पेयजल परियोजनाओं के बारे में प्रश्न पूछें।' : 
                    'Hello! I am GRAMVIKAS AI. Ask me about government welfare schemes, required documents, eligibility rules, or village infrastructure progress.')}
              </p>
              <div class="d-flex flex-wrap gap-1">
                <span class="badge bg-light text-dark border small"><i class="bi bi-shield-check text-success"></i> ${t("asst_grounded_badge")}</span>
                <span class="badge bg-light text-dark border small"><i class="bi bi-volume-up text-primary"></i> ${t("asst_voice_badge")}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Input Bar -->
        <form id="chat-input-form" class="chat-input-bar">
          <input type="text" class="form-control" id="chat-query-input" placeholder="${t("asst_placeholder")}" autocomplete="off" required>
          <button type="button" class="btn btn-outline-secondary" id="btn-voice-mic" title="Voice Dictation (Web Speech)">
            <i class="bi bi-mic-fill"></i>
          </button>
          <button type="submit" class="btn btn-gv-primary" id="btn-chat-send">
            <i class="bi bi-send-fill me-1"></i> ${t("asst_send")}
          </button>
        </form>
      </div>
    </div>
  `;

  const chipsContainer = document.getElementById("assistant-prompt-chips");
  const messagesContainer = document.getElementById("chat-messages-container");
  const queryInput = document.getElementById("chat-query-input");
  const stopSpeechBtn = document.getElementById("btn-stop-all-speech");

  // Load sample questions
  const samplePrompts = {
    en: [
      "Am I eligible for PM-KISAN 6000 subsidy?",
      "What documents are needed for Kalaignar Kanavu Illam?",
      "How to get a 100-day MGNREGA job card?",
      "What is the progress of Melmaruvathur water tank project?"
    ],
    ta: [
      "சிறு விவசாயிக்கு PM-KISAN ₹6000 கிடைக்குமா?",
      "கலைஞர் கனவு இல்லம் திட்டத்திற்கு என்ன ஆவணங்கள் தேவை?",
      "100 நாள் வேலை திட்ட அட்டை பெறுவது எப்படி?",
      "மேல்மருவத்தூர் குடிநீர் தொட்டி திட்டத்தின் தற்போதைய நிலை என்ன?"
    ],
    hi: [
      "क्या मुझे पीएम-किसान की 6000 रुपये सहायता मिल सकती है?",
      "आवास योजना के लिए कौन से दस्तावेज चाहिए?",
      "मनरेगा 100 दिन का जॉब कार्ड कैसे बनवाएं?",
      "मेलमरुवथुर पेयजल टंकी परियोजना की प्रगति क्या है?"
    ]
  };

  function renderChips() {
    const list = samplePrompts[getLanguage()] || samplePrompts.en;
    chipsContainer.innerHTML = list.map(q => `
      <button class="btn btn-sm btn-outline-secondary rounded-pill bg-white shadow-xs text-start prompt-chip" type="button" style="font-size: 0.8rem;">
        <i class="bi bi-chat-quote-fill me-1 text-primary"></i> ${q}
      </button>
    `).join("");

    chipsContainer.querySelectorAll(".prompt-chip").forEach(btn => {
      btn.addEventListener("click", () => {
        queryInput.value = btn.innerText.trim();
        document.getElementById("chat-input-form").dispatchEvent(new Event("submit"));
      });
    });
  }

  renderChips();

  // Language switch inside Assistant
  container.querySelectorAll(".btn-lang-switch").forEach(btn => {
    btn.addEventListener("click", () => {
      const selected = btn.getAttribute("data-lang");
      setLanguage(selected);
      renderAssistant(container);
    });
  });

  // Stop Audio Speech
  stopSpeechBtn?.addEventListener("click", () => {
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    stopSpeechBtn.style.display = "none";
  });

  // Web Speech Recognition (Mic)
  const micBtn = document.getElementById("btn-voice-mic");
  let recognition = null;
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

  if (SpeechRecognition) {
    recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onstart = () => {
      micBtn.classList.remove("btn-outline-secondary");
      micBtn.classList.add("btn-danger");
      micBtn.innerHTML = `<i class="bi bi-record-circle-fill"></i>`;
      showToast("Listening... Speak now", "info", 2000);
    };

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      queryInput.value = transcript;
      showToast(`Heard: "${transcript}"`, "success", 2000);
      document.getElementById("chat-input-form").dispatchEvent(new Event("submit"));
    };

    recognition.onerror = () => {
      micBtn.classList.remove("btn-danger");
      micBtn.classList.add("btn-outline-secondary");
      micBtn.innerHTML = `<i class="bi bi-mic-fill"></i>`;
    };

    recognition.onend = () => {
      micBtn.classList.remove("btn-danger");
      micBtn.classList.add("btn-outline-secondary");
      micBtn.innerHTML = `<i class="bi bi-mic-fill"></i>`;
    };

    micBtn.addEventListener("click", () => {
      const lang = getLanguage();
      recognition.lang = lang === "ta" ? "ta-IN" : (lang === "hi" ? "hi-IN" : "en-IN");
      try {
        recognition.start();
      } catch (e) {
        recognition.stop();
      }
    });
  } else {
    micBtn.style.display = "none";
  }

  // Handle Chat Submit
  document.getElementById("chat-input-form").addEventListener("submit", async (e) => {
    e.preventDefault();
    const query = queryInput.value.trim();
    if (!query) return;

    // Append User Message Bubble
    appendMessage("user", query);
    queryInput.value = "";

    // Append Bot Thinking Skeleton
    const botMsgId = "bot-msg-" + Date.now();
    appendLoadingBubble(botMsgId);

    try {
      const activeUser = auth.getUser();
      const userProfile = activeUser ? {
        full_name: activeUser.full_name,
        role: activeUser.role,
        ...(activeUser.citizen_profile || activeUser.official_profile || {})
      } : null;

      const activeLang = getLanguage();
      const res = await api.post("/api/assistant/chat", {
        query: query,
        message: query,
        language: activeLang,
        session_id: "web-session-" + (activeUser?.id || "guest"),
        user_profile: userProfile
      }, { timeout: 25000 });

      const reply = res.answer || res.reply_text || "Thank you for asking. Our facts are grounded in verified government catalogs.";
      updateBotBubble(botMsgId, reply, res.citations, res.suggested_schemes);
      
      // Auto Read Aloud the response
      speakText(res.audio_tts_text || reply, activeLang);
    } catch (err) {
      updateBotBubble(botMsgId, `I encountered an issue processing your query: ${err.message}. Please check your connection or try again.`);
    }
  });

  function appendMessage(sender, text) {
    const row = document.createElement("div");
    row.className = `message-row ${sender}`;
    row.innerHTML = `
      ${sender === 'bot' ? `<div class="message-avatar" style="overflow: hidden; padding: 0;"><img src="/assets/assistant_logo.jpeg" alt="Bot" style="width: 100%; height: 100%; object-fit: cover;"></div>` : ''}
      <div class="message-bubble">
        <p class="mb-0">${escapeHtml(text)}</p>
      </div>
      ${sender === 'user' ? `<div class="message-avatar bg-secondary"><i class="bi bi-person"></i></div>` : ''}
    `;
    messagesContainer.appendChild(row);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
  }

  function appendLoadingBubble(id) {
    const row = document.createElement("div");
    row.className = "message-row bot";
    row.id = id;
    row.innerHTML = `
      <div class="message-avatar" style="overflow: hidden; padding: 0;"><img src="/assets/assistant_logo.jpeg" alt="Bot" style="width: 100%; height: 100%; object-fit: cover;"></div>
      <div class="message-bubble">
        <div class="d-flex align-items-center gap-2 text-muted">
          <div class="spinner-border spinner-border-sm text-primary" role="status"></div>
          <span>Grounded AI checking verified schemes and projects...</span>
        </div>
      </div>
    `;
    messagesContainer.appendChild(row);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
  }

  function updateBotBubble(id, text, citations = [], suggestedSchemes = []) {
    const row = document.getElementById(id);
    if (!row) return;

    let citationsHtml = "";
    if (citations && citations.length > 0) {
      citationsHtml = `
        <div class="mt-3 pt-2 border-top">
          <span class="small fw-bold text-muted d-block mb-1"><i class="bi bi-journal-bookmark me-1"></i> Verified Sources:</span>
          <div class="d-flex flex-wrap gap-1">
            ${citations.map(c => `
              <span class="badge bg-light text-dark border small" title="${escapeHtml(c.excerpt || '')}">
                <i class="bi bi-link-45deg"></i> ${escapeHtml(c.title || c.source_type)}
              </span>
            `).join("")}
          </div>
        </div>
      `;
    }

    let schemesHtml = "";
    if (suggestedSchemes && suggestedSchemes.length > 0) {
      schemesHtml = `
        <div class="mt-2">
          <span class="small fw-bold text-success d-block mb-1"><i class="bi bi-gift-fill me-1"></i> Relevant Programs:</span>
          <div class="d-flex flex-wrap gap-1">
            ${suggestedSchemes.map(s => `
              <a href="/schemes" class="btn btn-xs btn-outline-success py-0 px-2" style="font-size: 0.75rem;">
                ${escapeHtml(s.title || 'View Scheme')} &rarr;
              </a>
            `).join("")}
          </div>
        </div>
      `;
    }

    row.innerHTML = `
      <div class="message-avatar" style="overflow: hidden; padding: 0;"><img src="/assets/assistant_logo.jpeg" alt="Bot" style="width: 100%; height: 100%; object-fit: cover;"></div>
      <div class="message-bubble">
        <div class="d-flex align-items-center justify-content-between mb-2">
          <span class="fw-bold small" style="color: var(--color-primary);"><i class="bi bi-robot me-1"></i> GRAMVIKAS Grounded AI</span>
          <button class="btn btn-xs btn-outline-secondary py-0 btn-speak-msg" title="Read Aloud" style="font-size: 0.72rem;">
            <i class="bi bi-volume-up"></i> Listen
          </button>
        </div>
        <div class="bot-text mb-2">${renderMarkdownToHtml(text)}</div>
        ${schemesHtml}
        ${citationsHtml}
      </div>
    `;

    row.querySelector(".btn-speak-msg")?.addEventListener("click", () => {
      speakText(text, getLanguage());
    });

    messagesContainer.scrollTop = messagesContainer.scrollHeight;
  }

  function renderMarkdownToHtml(md) {
    if (!md) return "";
    
    // 1. Basic HTML sanitization
    let safe = md
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");

    // 2. Bold tags: **text** or __text__
    safe = safe.replace(/\*\*(.+?)\*\*/g, '<strong style="color: var(--color-primary); font-weight: 700;">$1</strong>');
    safe = safe.replace(/__(.+?)__/g, '<strong style="color: var(--color-primary); font-weight: 700;">$1</strong>');

    // 3. Citations in square brackets e.g. [Scheme: PM-KISAN]
    safe = safe.replace(/\[((?:Scheme|Project|Source|Handbook):[^\]]+)\]/gi, '<span class="badge border ms-1 py-1 px-2" style="background: rgba(6, 78, 59, 0.08); color: var(--color-primary); font-weight: 600;"><i class="bi bi-shield-check text-success me-1"></i>$1</span>');

    // 4. Markdown links: [text](url)
    safe = safe.replace(/\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer" class="text-decoration-underline fw-semibold" style="color: var(--color-primary);">$1</a>');

    // 5. Section headings (### Header, ## Header)
    safe = safe.replace(/^### (.*?)$/gm, '<h6 class="fw-bold mt-2 mb-1" style="color: var(--color-primary);">$1</h6>');
    safe = safe.replace(/^## (.*?)$/gm, '<h5 class="fw-bold mt-2 mb-1" style="color: var(--color-primary);">$1</h5>');

    // 6. Split into lines and structure into clean lists or paragraphs
    const lines = safe.split("\n");
    const formatted = [];
    let inList = false;

    for (let rawLine of lines) {
      const trimmed = rawLine.trim();
      if (!trimmed) {
        if (inList) {
          formatted.push("</ul>");
          inList = false;
        }
        continue;
      }

      if (trimmed.startsWith("• ") || trimmed.startsWith("- ") || trimmed.startsWith("* ")) {
        const itemContent = trimmed.replace(/^[•\-\*]\s*/, "");
        if (!inList) {
          formatted.push('<ul class="mb-2 ps-3" style="list-style-type: disc;">');
          inList = true;
        }
        formatted.push(`<li class="mb-1" style="line-height: 1.5;">${itemContent}</li>`);
      } else {
        if (inList) {
          formatted.push("</ul>");
          inList = false;
        }
        formatted.push(`<p class="mb-2" style="line-height: 1.55;">${trimmed}</p>`);
      }
    }

    if (inList) {
      formatted.push("</ul>");
    }

    return formatted.join("");
  }

  function speakText(text, lang) {
    if (!window.speechSynthesis) return;
    window.speechSynthesis.cancel();

    // Clean markdown/special characters for speech
    const cleanText = text.replace(/[*_#`\[\]]/g, "").replace(/\(.*?\)/g, "");
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.lang = lang === "ta" ? "ta-IN" : (lang === "hi" ? "hi-IN" : "en-IN");
    utterance.rate = 0.95;

    stopSpeechBtn.style.display = "inline-flex";

    utterance.onend = () => {
      stopSpeechBtn.style.display = "none";
    };
    utterance.onerror = () => {
      stopSpeechBtn.style.display = "none";
    };

    window.speechSynthesis.speak(utterance);
  }

  function escapeHtml(str) {
    if (!str) return "";
    return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  }
}

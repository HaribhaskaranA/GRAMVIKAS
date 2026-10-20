/**
 * GRAMVIKAS AI - AI Crop Disease Doctor View (/crop-doctor).
 * Exclusive Farmer Module: Leaf image upload/camera, sample tests,
 * AI diagnosis, 100% Tamil/Hindi localization, and audio read-aloud.
 */

import { api } from "../api.js";
import { auth } from "../auth.js";
import { getLanguage, t, localizeField } from "../i18n.js";
import { showToast } from "../components/toast.js";

export async function renderCropDoctor(container) {
  const lang = getLanguage();
  const user = auth.getUser();

  container.innerHTML = `
    <div class="d-flex flex-column gap-4" style="max-width: 1040px; margin: 0 auto;">
      <!-- Hero Banner -->
      <div class="card-gv p-4 crop-doctor-hero-card" style="background-color: var(--color-champagne) !important; border: 1px solid var(--color-champagne-border) !important; color: var(--color-primary) !important;">
        <div class="row align-items-center">
          <div class="col-lg-8">
            <div class="d-flex align-items-center gap-2 mb-2">
              <span class="badge" style="background: var(--color-primary); color: var(--color-champagne); font-weight: 700;">
                <i class="bi bi-flower1"></i> ${lang === 'ta' ? 'விவசாயிகள் சிறப்பு சேவை' : (lang === 'hi' ? 'किसान विशेष सेवा' : 'FARMER EXCLUSIVE SERVICE')}
              </span>
              <span class="badge-demo" style="background: #FFFFFF; color: var(--color-primary); border-color: var(--color-champagne-border);"><i class="bi bi-shield-check"></i> ${lang === 'ta' ? 'AI மாதிரி தயார்' : 'AI MODEL READY'}</span>
            </div>
            <h2 class="fw-bold mb-2" style="color: var(--color-primary) !important;">
              ${lang === 'ta' ? 'பயிர் மருத்துவர் AI (Crop Disease Doctor)' : (lang === 'hi' ? 'फसल रोग डॉक्टर एआई' : 'AI Crop Disease Doctor')}
            </h2>
            <p class="mb-3" style="color: var(--color-primary); opacity: 0.95; font-size: 0.98rem; font-weight: 500;">
              ${lang === 'ta' ? 
                'உங்கள் நெல், தக்காளி, வேர்க்கடலை, சோளம் அல்லது பருத்தி பயிரின் நோய்வாய்ப்பட்ட இலையை படம் எடுத்து பதிவேற்றவும். AI உடனுக்குடன் நோயை கண்டறிந்து இயற்கை மற்றும் ரசாயன மருந்து வழிமுறைகளை வழங்கும்.' : 
                (lang === 'hi' ? 
                  'अपनी धान, टमाटर, मूंगफली या कपास की फसल की पत्ती की फोटो अपलोड करें। हमारा एआई मॉडल तुरंत रोग की पहचान कर जैविक और रासायनिक उपचार बताएगा।' : 
                  'Upload or snap a leaf photo of your paddy, tomato, groundnut, or cotton crops. Instant agricultural pathology diagnosis, organic remedies, and government subsidies in Tamil & Hindi.')}
            </p>
            <div class="d-flex flex-wrap gap-2">
              <button class="btn btn-gv-primary btn-sm" id="btn-trigger-upload">
                <i class="bi bi-cloud-arrow-up-fill me-1"></i> ${t('upload_photo')}
              </button>
              <button class="btn btn-outline-primary btn-sm" id="btn-trigger-camera" style="border-color: var(--color-primary) !important; color: var(--color-primary) !important;">
                <i class="bi bi-camera-fill me-1"></i> ${t('take_photo')}
              </button>
            </div>
          </div>
          <div class="col-lg-4 d-none d-lg-flex justify-content-center">
            <div style="width: 135px; height: 135px; border-radius: 50%; background: #FFFFFF; border: 3px solid var(--color-champagne-border); padding: 5px; display: flex; align-items: center; justify-content: center; box-shadow: 0 8px 24px rgba(6, 78, 59, 0.18); overflow: hidden;">
              <img src="/assets/assistant_logo.jpeg" alt="GRAMVIKAS AI Assistant" style="width: 100%; height: 100%; object-fit: cover; border-radius: 50%;">
            </div>
          </div>
        </div>
      </div>

      <!-- Upload & Quick Sample Test Grid -->
      <div class="row g-4">
        <!-- Left: Upload Box -->
        <div class="col-lg-6">
          <div class="card-gv p-4 h-100 d-flex flex-column justify-content-between">
            <div>
              <h5 class="fw-bold mb-2" style="color: var(--color-primary);">
                <i class="bi bi-image me-2 text-success"></i> ${lang === 'ta' ? 'பயிர் இலை படம் பதிவேற்றவும்' : (lang === 'hi' ? 'पत्ती की तस्वीर अपलोड करें' : 'Upload Plant Leaf Image')}
              </h5>
              <p class="small text-muted mb-3">
                ${lang === 'ta' ? 'தெளிவான வெளிச்சத்தில் பாதிக்கப்பட்ட இலையை மட்டும் புகைப்படம் எடுக்கவும்.' : 'Take a clear, focused photo of the diseased leaf.'}
              </p>

              <!-- Drag/Drop Zone -->
              <div class="p-4 border-2 border-dashed rounded text-center mb-3" id="drop-zone" style="border: 2px dashed #B8C7D9; background: #F8FAFC; cursor: pointer;">
                <input type="file" id="leaf-file-input" accept="image/*" style="display: none;">
                <input type="file" id="camera-file-input" accept="image/*" capture="environment" style="display: none;">
                
                <div id="upload-prompt-content">
                  <i class="bi bi-cloud-arrow-up text-success" style="font-size: 3rem;"></i>
                  <div class="fw-bold mt-2">${lang === 'ta' ? 'இங்கு கிளிக் செய்து படம் தேர்வு செய்யவும்' : 'Click or drag image here'}</div>
                  <span class="small text-muted">Supports JPG, PNG, WEBP (Up to 10MB)</span>
                </div>

                <div id="image-preview-content" style="display: none;">
                  <img id="preview-img" src="" alt="Preview" style="max-height: 200px; max-width: 100%; border-radius: 8px; object-fit: contain;">
                  <div class="mt-2 small text-muted" id="preview-filename"></div>
                </div>
              </div>
            </div>

            <div>
              <button class="btn btn-gv-primary w-100 py-2 fw-bold" id="btn-run-diagnosis" disabled>
                <i class="bi bi-magic me-1"></i> ${t('analyze_now')}
              </button>
            </div>
          </div>
        </div>

        <!-- Right: 1-Click One-Touch Sample Leaf Tests for Quick Demo -->
        <div class="col-lg-6">
          <div class="card-gv p-4 h-100">
            <h5 class="fw-bold mb-2" style="color: var(--color-navy);">
              <i class="bi bi-lightning-charge-fill me-2 text-warning"></i> ${lang === 'ta' ? 'உடனடி மாதிரி சோதனை (One-Click Test)' : 'Instant Sample Demos'}
            </h5>
            <p class="small text-muted mb-3">
              ${lang === 'ta' ? 'படம் இல்லையா? மாதிரி பயிர் நோயை தேர்வு செய்து உடனே பரிசோதிக்கவும்:' : 'Test real diagnosis outputs on known Indian crop pathology samples:'}
            </p>

            <div class="d-flex flex-column gap-2" id="sample-buttons-list">
              <button class="btn btn-outline-secondary text-start p-2 sample-btn" data-crop="paddy_blast">
                <div class="d-flex align-items-center justify-content-between">
                  <div>
                    <span class="fw-bold d-block text-dark">🌾 ${lang === 'ta' ? 'நெல் குலை நோய் (Paddy Blast)' : 'Rice / Paddy Blast'}</span>
                    <span class="small text-muted">${lang === 'ta' ? 'கதிர் மற்றும் இலைகளில் கண் வடிவ புள்ளிகள்' : 'Spindle-shaped lesions on rice foliage'}</span>
                  </div>
                  <span class="badge bg-danger">${lang === 'ta' ? 'அதிக பாதிப்பு' : 'High Risk'}</span>
                </div>
              </button>

              <button class="btn btn-outline-secondary text-start p-2 sample-btn" data-crop="tomato_early_blight">
                <div class="d-flex align-items-center justify-content-between">
                  <div>
                    <span class="fw-bold d-block text-dark">🍅 ${lang === 'ta' ? 'தக்காளி முன்கூட்டிய கருகல் நோய் (Tomato Early Blight)' : 'Tomato Early Blight'}</span>
                    <span class="small text-muted">${lang === 'ta' ? 'இலைகளில் வட்ட வடிவ பழுப்பு நிற வளையங்கள்' : 'Target-like concentric brown rings on foliage'}</span>
                  </div>
                  <span class="badge bg-warning text-dark">${lang === 'ta' ? 'மிதமான பாதிப்பு' : 'Medium'}</span>
                </div>
              </button>

              <button class="btn btn-outline-secondary text-start p-2 sample-btn" data-crop="groundnut_tikka">
                <div class="d-flex align-items-center justify-content-between">
                  <div>
                    <span class="fw-bold d-block text-dark">🥜 ${lang === 'ta' ? 'வேர்க்கடலை டிக்கா இலைப்புள்ளி நோய் (Groundnut Tikka)' : 'Groundnut Tikka Disease'}</span>
                    <span class="small text-muted">${lang === 'ta' ? 'இலைகளின் இருபுறமும் மஞ்சள் வளைய புள்ளிகள்' : 'Circular dark spots with yellow chlorotic halos'}</span>
                  </div>
                  <span class="badge bg-warning text-dark">${lang === 'ta' ? 'மிதமான பாதிப்பு' : 'Fungal'}</span>
                </div>
              </button>

              <button class="btn btn-outline-secondary text-start p-2 sample-btn" data-crop="rice_healthy">
                <div class="d-flex align-items-center justify-content-between">
                  <div>
                    <span class="fw-bold d-block text-dark">🌾 ${lang === 'ta' ? 'ஆரோக்கியமான நெற்பயிர் (Healthy Rice Crop)' : 'Healthy Paddy Foliage'}</span>
                    <span class="small text-muted">${lang === 'ta' ? 'பசும் நிறமான ஆரோக்கியமான வளர்ச்சி' : 'Optimal chlorophyll & no pathogenic lesions'}</span>
                  </div>
                  <span class="badge bg-success">${lang === 'ta' ? 'நலமாக உள்ளது' : 'Healthy'}</span>
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Results Display Container -->
      <div id="crop-results-container" style="display: none;">
        <!-- Filled dynamically -->
      </div>
    </div>
  `;

  // Attach event handlers
  const fileInput = document.getElementById("leaf-file-input");
  const cameraInput = document.getElementById("camera-file-input");
  const dropZone = document.getElementById("drop-zone");
  const promptContent = document.getElementById("upload-prompt-content");
  const previewContent = document.getElementById("image-preview-content");
  const previewImg = document.getElementById("preview-img");
  const filenameEl = document.getElementById("preview-filename");
  const analyzeBtn = document.getElementById("btn-run-diagnosis");
  const resultsContainer = document.getElementById("crop-results-container");

  let currentSelectedFile = null;
  let activeCameraStream = null;

  document.getElementById("btn-trigger-upload")?.addEventListener("click", () => fileInput.click());
  dropZone?.addEventListener("click", () => fileInput.click());

  // Interactive In-App Live Camera Stream (Works on Windows Webcams, Laptops, Android, & iOS)
  document.getElementById("btn-trigger-camera")?.addEventListener("click", async () => {
    // If browser supports getUserMedia, open an in-app live viewfinder modal
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      openCameraModal();
    } else {
      // Fallback to native capture input
      cameraInput.click();
    }
  });

  function openCameraModal() {
    let modalEl = document.getElementById("gv-camera-modal");
    if (!modalEl) {
      modalEl = document.createElement("div");
      modalEl.id = "gv-camera-modal";
      modalEl.innerHTML = `
        <div class="modal fade show" style="display: block; background: rgba(0,0,0,0.75); z-index: 1060;" tabindex="-1">
          <div class="modal-dialog modal-dialog-centered">
            <div class="modal-content">
              <div class="modal-header bg-dark text-white py-2">
                <h6 class="modal-title mb-0 fw-bold">
                  <i class="bi bi-camera-fill text-success me-2"></i>
                  ${lang === 'ta' ? 'நேரலை கேமரா - இலை புகைப்படம்' : (lang === 'hi' ? 'लाइव कैमरा - पत्ती फोटो' : 'Live Camera - Leaf Photo')}
                </h6>
                <button type="button" class="btn-close btn-close-white btn-sm" id="btn-close-cam-modal"></button>
              </div>
              <div class="modal-body p-2 text-center bg-black position-relative" style="min-height: 280px;">
                <video id="gv-cam-video" autoplay playsinline style="width: 100%; max-height: 340px; object-fit: cover; border-radius: 6px;"></video>
                <canvas id="gv-cam-canvas" style="display: none;"></canvas>
                <div id="gv-cam-loader" class="position-absolute top-50 start-50 translate-middle text-white">
                  <div class="spinner-border spinner-border-sm text-success mb-1"></div>
                  <div class="small">${lang === 'ta' ? 'கேமரா திறக்கப்படுகிறது...' : 'Starting camera...'}</div>
                </div>
              </div>
              <div class="modal-footer py-2 justify-content-between bg-light">
                <button type="button" class="btn btn-sm btn-outline-secondary" id="btn-cam-fallback-file">
                  <i class="bi bi-folder2-open me-1"></i> ${lang === 'ta' ? 'கோப்பு தேர்வு' : 'Choose File'}
                </button>
                <button type="button" class="btn btn-sm btn-success px-4 fw-bold" id="btn-snap-photo">
                  <i class="bi bi-camera-fill me-1"></i> ${lang === 'ta' ? 'படம் பிடி' : (lang === 'hi' ? 'फोटो लें' : 'Snap Photo')}
                </button>
              </div>
            </div>
          </div>
        </div>
      `;
      document.body.appendChild(modalEl);

      modalEl.querySelector("#btn-close-cam-modal").addEventListener("click", closeCameraModal);
      modalEl.querySelector("#btn-cam-fallback-file").addEventListener("click", () => {
        closeCameraModal();
        fileInput.click();
      });
      modalEl.querySelector("#btn-snap-photo").addEventListener("click", captureSnapshot);
    } else {
      modalEl.style.display = "block";
    }

    const videoEl = document.getElementById("gv-cam-video");
    const loaderEl = document.getElementById("gv-cam-loader");
    if (loaderEl) loaderEl.style.display = "block";

    // Request front/back webcam
    navigator.mediaDevices.getUserMedia({
      video: {
        facingMode: { ideal: "environment" },
        width: { ideal: 1280 },
        height: { ideal: 720 }
      },
      audio: false
    }).then(stream => {
      activeCameraStream = stream;
      if (videoEl) {
        videoEl.srcObject = stream;
        videoEl.play();
      }
      if (loaderEl) loaderEl.style.display = "none";
    }).catch(err => {
      console.warn("Direct webcam failed, falling back to file picker:", err);
      closeCameraModal();
      cameraInput.click();
    });
  }

  function closeCameraModal() {
    const modalEl = document.getElementById("gv-camera-modal");
    if (modalEl) modalEl.style.display = "none";
    if (activeCameraStream) {
      activeCameraStream.getTracks().forEach(track => track.stop());
      activeCameraStream = null;
    }
  }

  function captureSnapshot() {
    const videoEl = document.getElementById("gv-cam-video");
    const canvasEl = document.getElementById("gv-cam-canvas");
    if (!videoEl || !canvasEl) return;

    canvasEl.width = videoEl.videoWidth || 640;
    canvasEl.height = videoEl.videoHeight || 480;
    const ctx = canvasEl.getContext("2d");
    ctx.drawImage(videoEl, 0, 0, canvasEl.width, canvasEl.height);

    canvasEl.toBlob((blob) => {
      if (!blob) return;
      const file = new File([blob], `camera_snap_${Date.now()}.jpg`, { type: "image/jpeg" });
      closeCameraModal();
      handleFileSelection(file);
    }, "image/jpeg", 0.95);
  }

  function handleFileSelection(file) {
    if (!file) return;
    currentSelectedFile = file;
    const reader = new FileReader();
    reader.onload = (e) => {
      previewImg.src = e.target.result;
      filenameEl.textContent = `${file.name} (${Math.round(file.size / 1024)} KB)`;
      promptContent.style.display = "none";
      previewContent.style.display = "block";
      analyzeBtn.disabled = false;
    };
    reader.readAsDataURL(file);
  }

  fileInput?.addEventListener("change", (e) => handleFileSelection(e.target.files[0]));
  cameraInput?.addEventListener("change", (e) => handleFileSelection(e.target.files[0]));

  // Drag and drop
  dropZone?.addEventListener("dragover", (e) => {
    e.preventDefault();
    dropZone.style.borderColor = "var(--color-saffron)";
  });
  dropZone?.addEventListener("dragleave", () => {
    dropZone.style.borderColor = "#B8C7D9";
  });
  dropZone?.addEventListener("drop", (e) => {
    e.preventDefault();
    dropZone.style.borderColor = "#B8C7D9";
    if (e.dataTransfer.files?.length) {
      handleFileSelection(e.dataTransfer.files[0]);
    }
  });

  // Sample quick buttons
  document.querySelectorAll(".sample-btn").forEach(btn => {
    btn.addEventListener("click", async () => {
      const sampleKey = btn.getAttribute("data-crop");
      await executeAnalysis({ sample_key: sampleKey });
    });
  });

  // Run diagnosis on uploaded file
  analyzeBtn?.addEventListener("click", async () => {
    if (!currentSelectedFile) return;
    const formData = new FormData();
    formData.append("file", currentSelectedFile);
    await executeAnalysis({ formData });
  });

  async function executeAnalysis({ formData, sample_key }) {
    const currentLang = localStorage.getItem("gv_lang") || lang || "ta";
    resultsContainer.style.display = "block";
    resultsContainer.innerHTML = `
      <div class="card-gv p-5 text-center">
        <div class="spinner-border text-success mb-3" style="width: 3rem; height: 3rem;" role="status"></div>
        <h4 class="fw-bold">${t('detecting')}</h4>
        <p class="text-muted small">${currentLang === 'ta' ? 'மரபணு மற்றும் தாவரவியல் அறிகுறிகள் பகுப்பாய்வு செய்யப்படுகிறது...' : (currentLang === 'hi' ? 'पौधे के लक्षणों का एआई मॉडल द्वारा विश्लेषण किया जा रहा है...' : 'Processing visual patterns with crop pathology neural network...')}</p>
      </div>
    `;
    resultsContainer.scrollIntoView({ behavior: "smooth" });

    try {
      let data;
      if (formData) {
        if (typeof api.postFormData === "function") {
          data = await api.postFormData(`/api/crop-doctor/analyze?language=${currentLang}`, formData);
        } else if (typeof api.request === "function") {
          data = await api.request(`/api/crop-doctor/analyze?language=${currentLang}`, {
            method: "POST",
            body: formData
          });
        } else {
          // Native fetch fallback
          const token = localStorage.getItem("gv_token");
          const headers = {};
          if (token) headers["Authorization"] = `Bearer ${token}`;
          const res = await fetch(`/api/crop-doctor/analyze?language=${currentLang}`, {
            method: "POST",
            headers,
            body: formData
          });
          if (!res.ok) {
            const errData = await res.json().catch(() => ({ detail: res.statusText }));
            throw new Error(errData.detail || "Analysis request failed");
          }
          data = await res.json();
        }
      } else {
        data = await api.post(`/api/crop-doctor/analyze?sample_key=${sample_key}&language=${currentLang}`, {});
      }

      renderDiagnosisCard(data);
    } catch (err) {
      resultsContainer.innerHTML = `
        <div class="alert alert-danger my-3">
          <h5>${currentLang === 'ta' ? 'பகுப்பாய்வு பிழை' : (currentLang === 'hi' ? 'विश्लेषण त्रुटि' : 'Analysis Error')}</h5>
          <p>${err.message}</p>
        </div>
      `;
    }
  }

  function renderDiagnosisCard(data) {
    const currentLang = localStorage.getItem("gv_lang") || lang || "ta";

    // 1. Handle Out-of-Distribution / Non-Leaf Inputs (Black screen, dark room, selfie, non-crop items)
    if (data.status === "invalid_leaf") {
      const title = currentLang === 'ta'
        ? '⚠️ பயிர் இலை கண்டறியப்படவில்லை (தாவரமற்ற புகைப்படம்)'
        : (currentLang === 'hi' ? '⚠️ पौधे की पत्ती नहीं मिली (अमान्य चित्र)' : '⚠️ No Crop Leaf Detected (Non-Plant Image)');
      
      const reason = data[`reason_${currentLang}`] || data.reason_en || data.message;
      const guidance = data[`guidance_${currentLang}`] || data.guidance_en || '';

      resultsContainer.innerHTML = `
        <div class="card-gv p-4 border-2 border-warning shadow-sm position-relative">
          <div class="d-flex align-items-center gap-3 mb-3">
            <div class="rounded-circle bg-warning-subtle text-warning-emphasis d-flex align-items-center justify-content-center" style="width: 54px; height: 54px; font-size: 1.75rem;">
              <i class="bi bi-camera-slash-fill"></i>
            </div>
            <div>
              <span class="badge bg-warning text-dark text-uppercase mb-1">
                ${currentLang === 'ta' ? 'புகைப்பட எச்சரிக்கை' : (currentLang === 'hi' ? 'चित्र चेतावनी' : 'Photo Quality Alert')}
              </span>
              <h4 class="fw-bold mb-0 text-dark">${title}</h4>
            </div>
          </div>

          <div class="alert alert-warning mb-4">
            <h6 class="fw-bold mb-2">
              <i class="bi bi-exclamation-triangle-fill me-1"></i>
              ${currentLang === 'ta' ? 'காரணம்:' : (currentLang === 'hi' ? 'कारण:' : 'Reason:')}
            </h6>
            <p class="mb-0">${reason}</p>
          </div>

          <div class="p-3 rounded bg-light border mb-4">
            <h6 class="fw-bold text-dark mb-2">
              <i class="bi bi-lightbulb-fill text-warning me-1"></i>
              ${currentLang === 'ta' ? 'சரியான பயிர் புகைப்படம் எடுக்கும் முறை:' : (currentLang === 'hi' ? 'सही फोटो लेने के निर्देश:' : 'Guidelines for Clear Crop Diagnosis:')}
            </h6>
            <ul class="mb-0 small text-muted ps-3">
              <li class="mb-1">${currentLang === 'ta' ? 'பாதிக்கப்பட்ட அல்லது ஆரோக்கியமான பயிர் இலையை மட்டும் தெளிவாக நெருக்கமாக படம் பிடிக்கவும்.' : (currentLang === 'hi' ? 'केवल प्रभावित या स्वस्थ पौधे की पत्ती पर ज़ूम करके फोटो लें।' : 'Take a close-up photo focusing directly on the diseased or healthy plant leaf.')}</li>
              <li class="mb-1">${currentLang === 'ta' ? 'போதிய பகல் வெளிச்சம் இருப்பதை உறுதி செய்து நிழல் விழுவதை தவிர்க்கவும்.' : (currentLang === 'hi' ? 'पर्याप्त प्राकृतिक रोशनी में फोटो लें और छाया से बचें।' : 'Ensure ample natural daylight or lighting and avoid dark shadows.')}</li>
              <li class="mb-1">${currentLang === 'ta' ? 'கருப்பு திரை, மனித முகம், வீட்டு சுவர்கள் அல்லது பிற வீட்டு உபயோக பொருட்களை தவிர்க்கவும்.' : (currentLang === 'hi' ? 'काली स्क्रीन, चेहरा, दीवारें या अन्य गैर-कृषि वस्तुएं अपलोड न करें।' : 'Avoid dark/blank screens, human faces, walls, or non-plant objects.')}</li>
            </ul>
          </div>

          <div class="d-flex flex-wrap gap-2 justify-content-end">
            <button class="btn btn-outline-secondary" id="btn-reselect-file">
              <i class="bi bi-arrow-repeat me-1"></i> ${currentLang === 'ta' ? 'வேறு படம் பதிவேற்றுக' : (currentLang === 'hi' ? 'दूसरी फोटो चुनें' : 'Upload Different Photo')}
            </button>
            <button class="btn btn-gv-saffron" id="btn-retake-camera">
              <i class="bi bi-camera me-1"></i> ${currentLang === 'ta' ? 'மீண்டும் படம் பிடி' : (currentLang === 'hi' ? 'पुनः फोटो लें' : 'Retake Photo')}
            </button>
          </div>
        </div>
      `;

      document.getElementById("btn-reselect-file")?.addEventListener("click", () => fileInput.click());
      document.getElementById("btn-retake-camera")?.addEventListener("click", () => {
        document.getElementById("btn-trigger-camera")?.click();
      });
      return;
    }

    // 2. Normal Pathology Diagnostic Result
    const isHealthy = data.disease_name_en?.toLowerCase().includes("healthy");
    const diseaseTitle = currentLang === 'ta' ? data.disease_name_ta : (currentLang === 'hi' ? data.disease_name_hi : data.disease_name_en);
    const diagSummary = data.symptoms?.[currentLang] || data.diagnosis_summary;
    const orgRemedy = data.organic_treatment?.[currentLang] || data.organic_remedy;
    const chemRemedy = data.chemical_treatment?.[currentLang] || data.chemical_remedy;
    const prevAdvice = data.prevention?.[currentLang] || data.prevention_advice;

    const audioLang = currentLang === 'hi' ? 'hi' : (currentLang === 'ta' ? 'ta' : 'en');
    const audioUrl = `/api/voice/audio-stream?text=${encodeURIComponent(data.audio_summary || diagSummary)}&lang=${audioLang}`;

    resultsContainer.innerHTML = `
      <div class="card-gv p-4 border-2 ${isHealthy ? 'border-success' : 'border-danger'} shadow-sm position-relative">
        <!-- Print Letterhead (Hidden on screen, visible when printed at e-Sevai / CSC) -->
        <div class="print-only-header mb-4 pb-3 border-bottom text-center">
          <h2 class="fw-bold mb-1" style="color: var(--color-primary);">GRAMVIKAS AI &bull; கிராம விகாஸ்</h2>
          <h5 class="fw-semibold text-success mb-2">${currentLang === 'ta' ? 'பயிர் பாதுகாப்பு மற்றும் நோய் கண்டறிதல் அறிக்கை' : (currentLang === 'hi' ? 'कृषि विभाग - पादप रोग निदान रिपोर्ट' : 'Department of Agriculture - Plant Pathology Diagnostic Report')}</h5>
          <div class="small text-muted d-flex justify-content-between px-3">
            <span><strong>${currentLang === 'ta' ? 'அறிக்கை எண்' : (currentLang === 'hi' ? 'रिपोर्ट सं.' : 'Report No')}:</strong> CR-DIAG-${Date.now().toString().slice(-6)}</span>
            <span><strong>${currentLang === 'ta' ? 'சரிபார்க்கப்பட்ட நாள்' : (currentLang === 'hi' ? 'दिनांक' : 'Date')}:</strong> ${new Date().toLocaleDateString()}</span>
            <span><strong>${currentLang === 'ta' ? 'துறை' : (currentLang === 'hi' ? 'जारीकर्ता' : 'Issuing Authority')}:</strong> e-Sevai / CSC Center</span>
          </div>
        </div>

        <!-- Diagnosis Header -->
        <div class="d-flex flex-wrap align-items-center justify-content-between gap-3 pb-3 border-bottom mb-3">
          <div>
            <div class="d-flex align-items-center flex-wrap gap-2 mb-1">
              <span class="badge ${isHealthy ? 'bg-success' : 'bg-danger'} text-uppercase">
                <i class="bi ${isHealthy ? 'bi-patch-check-fill' : 'bi-exclamation-triangle-fill'} me-1"></i>
                ${isHealthy ? (currentLang === 'ta' ? 'ஆரோக்கியமான பயிர்' : (currentLang === 'hi' ? 'स्वस्थ फसल' : 'HEALTHY PLANT')) : (currentLang === 'ta' ? 'நோய் கண்டறியப்பட்டது' : (currentLang === 'hi' ? 'रोग का पता चला' : 'DISEASE DETECTED'))}
              </span>
              <span class="badge bg-light text-dark border">
                ${t('confidence')}: ${(data.confidence * 100).toFixed(1)}%
              </span>
              ${data.confidence_level === 'high' ? `
                <span class="badge bg-success-subtle text-success border border-success-subtle">
                  <i class="bi bi-shield-check"></i> ${currentLang === 'ta' ? 'உயர் நம்பகத்தன்மை' : (currentLang === 'hi' ? 'उच्च सटीकता' : 'High Confidence')}
                </span>
              ` : (data.confidence_level === 'moderate' ? `
                <span class="badge bg-warning-subtle text-warning-emphasis border border-warning-subtle">
                  <i class="bi bi-exclamation-triangle"></i> ${currentLang === 'ta' ? 'மிதமான நம்பகத்தன்மை' : (currentLang === 'hi' ? 'मध्यम सटीकता' : 'Moderate Confidence')}
                </span>
              ` : `
                <span class="badge bg-danger-subtle text-danger border border-danger-subtle">
                  <i class="bi bi-question-circle"></i> ${currentLang === 'ta' ? 'குறைந்த நம்பகத்தன்மை' : (currentLang === 'hi' ? 'कम सटीकता' : 'Low Confidence')}
                </span>
              `)}
              <span class="badge bg-secondary-subtle text-secondary small">
                ${data.engine_used || 'MobileNetV2'}
              </span>
            </div>
            <h3 class="fw-bold mb-0" style="color: var(--color-navy);">
              ${diseaseTitle}
            </h3>
            <span class="small text-muted font-monospace">${data.disease_name_en}</span>
          </div>

          <!-- Actions: Print & Audio Read-Aloud Player -->
          <div class="d-flex align-items-center gap-2">
            <button class="btn btn-outline-secondary" id="btn-print-crop-report" title="${currentLang === 'ta' ? 'அறிக்கையை அச்சிடுக' : 'Print Diagnostic Report'}">
              <i class="bi bi-printer me-1"></i> ${currentLang === 'ta' ? 'அச்சிடுக' : (currentLang === 'hi' ? 'प्रिंट करें' : 'Print Report')}
            </button>
            <button class="btn btn-gv-saffron" id="btn-read-diagnosis">
              <i class="bi bi-volume-up-fill me-1"></i> ${t('listen_audio')} (${currentLang === 'ta' ? 'தமிழ்' : (currentLang === 'hi' ? 'हिन्दी' : 'Voice')})
            </button>
            <audio id="diagnosis-audio-el" src="${audioUrl}" preload="none" style="display: none;"></audio>
          </div>
        </div>

        <!-- Empirical Confidence Warning Alert if applicable -->
        ${(data.warning_ta || data.warning_en) ? `
          <div class="alert alert-warning d-flex align-items-center gap-2 mb-3">
            <i class="bi bi-exclamation-triangle-fill flex-shrink-0" style="font-size: 1.25rem;"></i>
            <div class="small">
              <strong>${currentLang === 'ta' ? 'கள ஆலோசனை எச்சரிக்கை:' : (currentLang === 'hi' ? 'कृषि परामर्श चेतावनी:' : 'Agronomic Guidance Caution:')}</strong>
              ${currentLang === 'ta' ? (data.warning_ta || data.warning_en) : (currentLang === 'hi' ? (data.warning_hi || data.warning_en) : data.warning_en)}
            </div>
          </div>
        ` : ''}

        <!-- Class Pathology Caution if applicable -->
        ${(data.class_caution) ? `
          <div class="alert alert-info d-flex align-items-center gap-2 mb-3 py-2">
            <i class="bi bi-info-circle-fill flex-shrink-0"></i>
            <div class="small">
              ${currentLang === 'ta' ? data.class_caution.ta : (currentLang === 'hi' ? data.class_caution.hi : data.class_caution.en)}
            </div>
          </div>
        ` : ''}

        <!-- Summary & Symptoms -->
        <div class="alert ${isHealthy ? 'alert-success' : 'alert-warning'} mb-4">
          <h6 class="fw-bold mb-1"><i class="bi bi-info-circle-fill me-1"></i> ${currentLang === 'ta' ? 'அறிவியல் பரிசோதனை முடிவு' : (currentLang === 'hi' ? 'नैदानिक सारांश' : 'Diagnostic Summary')}:</h6>
          <p class="mb-0 small">${diagSummary}</p>
        </div>

        ${!isHealthy ? `
          <!-- Recommendations: Organic vs Chemical -->
          <div class="row g-4 mb-4">
            <!-- Organic -->
            <div class="col-md-6">
              <div class="p-3 rounded border h-100" style="background: #F0FDF4; border-color: #BBF7D0 !important;">
                <h6 class="fw-bold text-success mb-2">
                  <i class="bi bi-flower2 me-1"></i> ${t('organic_treatment')}
                </h6>
                <p class="small text-dark mb-0">${orgRemedy}</p>
              </div>
            </div>

            <!-- Chemical -->
            <div class="col-md-6">
              <div class="p-3 rounded border h-100" style="background: #FEF2F2; border-color: #FECACA !important;">
                <h6 class="fw-bold text-danger mb-2">
                  <i class="bi bi-droplet-half me-1"></i> ${t('chemical_treatment')}
                </h6>
                <p class="small text-dark mb-0">${chemRemedy}</p>
              </div>
            </div>
          </div>

          <!-- Prevention -->
          <div class="p-3 rounded border bg-light mb-4">
            <h6 class="fw-bold text-dark mb-1"><i class="bi bi-shield-check text-primary me-1"></i> ${t('prevention')}:</h6>
            <p class="small text-muted mb-0">${prevAdvice}</p>
          </div>
        ` : ''}

        <!-- Matching Welfare Schemes -->
        ${data.schemes_recommended && data.schemes_recommended.length ? `
          <div class="pt-3 border-top">
            <h6 class="fw-bold mb-2" style="color: var(--color-navy);">
              <i class="bi bi-cash-stack text-success me-1"></i> ${t('matching_schemes')}
            </h6>
            <div class="d-flex flex-wrap gap-2">
              ${data.schemes_recommended.map(s => `
                <a href="/schemes" class="btn btn-sm btn-outline-success">
                  <i class="bi bi-link-45deg me-1"></i> ${s.title} &bull; <strong>${s.benefit}</strong>
                </a>
              `).join("")}
            </div>
          </div>
        ` : ''}
      </div>
    `;

    // Print Diagnostic Report handler
    document.getElementById("btn-print-crop-report")?.addEventListener("click", () => {
      window.print();
    });

    // Audio Playback handler
    const audioEl = document.getElementById("diagnosis-audio-el");
    const readBtn = document.getElementById("btn-read-diagnosis");
    let isPlaying = false;

    readBtn?.addEventListener("click", () => {
      if (!isPlaying) {
        audioEl.play().then(() => {
          isPlaying = true;
          readBtn.classList.remove("btn-gv-saffron");
          readBtn.classList.add("btn-danger");
          readBtn.innerHTML = `<i class="bi bi-stop-circle-fill me-1"></i> ${t('stop_audio')}`;
        }).catch(err => {
          // Fallback to Web Speech if audio stream fails
          if ('speechSynthesis' in window) {
            window.speechSynthesis.cancel();
            const ut = new SpeechSynthesisUtterance(data.audio_summary || data.diagnosis_summary);
            ut.lang = lang === 'hi' ? "hi-IN" : "ta-IN";
            ut.onend = () => {
              readBtn.innerHTML = `<i class="bi bi-volume-up-fill me-1"></i> ${t('listen_audio')}`;
            };
            window.speechSynthesis.speak(ut);
          }
        });
      } else {
        audioEl.pause();
        audioEl.currentTime = 0;
        isPlaying = false;
        readBtn.classList.remove("btn-danger");
        readBtn.classList.add("btn-gv-saffron");
        readBtn.innerHTML = `<i class="bi bi-volume-up-fill me-1"></i> ${t('listen_audio')}`;
      }
    });

    audioEl?.addEventListener("ended", () => {
      isPlaying = false;
      readBtn.classList.remove("btn-danger");
      readBtn.classList.add("btn-gv-saffron");
      readBtn.innerHTML = `<i class="bi bi-volume-up-fill me-1"></i> ${t('listen_audio')}`;
    });
  }
}

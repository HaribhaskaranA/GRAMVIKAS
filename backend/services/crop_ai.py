"""
GRAMVIKAS AI - AI Crop Disease Doctor & Agronomic Advisory Service.
Loads and serves the trained 67-class fine-tuned model (best_gramvikas_multicrop_v3_finetuned.keras)
with exact pre-processing, 3-tier confidence evaluation, class cautions, and 100% multilingual support.
"""

import os
import json
import io
import asyncio
from pathlib import Path
from typing import Dict, Any, List, Optional, Tuple
from PIL import Image, ImageOps
import numpy as np

from backend.config import settings
from backend.services.crop_metadata_67 import DISEASE_METADATA_67

# Classes flagged in Colab evaluation as having weaker recall / needing farmer caution
WEAK_RECALL_CLASSES = {
    "Paddy___Bacterial leaf blight",
    "Paddy___Blast",
    "Paddy___Brown spot",
    "Paddy___Healthy",
    "Paddy___Downy mildew",
    "Paddy___Hispa",
    "Paddy___Tungro",
    "Tomato___Early blight",
    "Tomato___Tomato mosaic virus",
    "Potato___healthy",
    "Banana___Healthy",
    "Paddy___Bacterial leaf streak"
}

# Aliases for 1-click benchmark samples to map smoothly into 67-class keys
SAMPLE_ALIASES = {
    "paddy_blast": "Paddy___Blast",
    "Rice___Leaf_Blast": "Paddy___Blast",
    "tomato_early_blight": "Tomato___Early blight",
    "Tomato___Early_Blight": "Tomato___Early blight",
    "groundnut_tikka": "Groundnut___Leaf spot",
    "Groundnut___Tikka_Leaf_Spot": "Groundnut___Leaf spot",
    "rice_healthy": "Paddy___Healthy",
    "Rice___Healthy": "Paddy___Healthy"
}

class CropAiService:
    def __init__(self):
        self.model = None
        self.class_names: List[str] = []
        self.model_version = "v3_finetuned_67class"
        self._load_local_model()

    def _load_local_model(self):
        """Loads the fine-tuned 67-class Keras model and class names once at application startup."""
        base_model_dir = Path(__file__).resolve().parent.parent / "models" / "crop_model"
        
        # Primary: 67-class fine-tuned model
        model_path = base_model_dir / "best_gramvikas_multicrop_v3_finetuned.keras"
        labels_path = base_model_dir / "class_names.json"

        # Fallback to standard name if finetuned not found
        if not model_path.exists():
            model_path = base_model_dir / "best_crop_model.keras"

        if model_path.exists() and labels_path.exists():
            try:
                import tensorflow as tf
                # Set thread pool for smooth concurrent performance
                tf.config.threading.set_inter_op_parallelism_threads(2)
                tf.config.threading.set_intra_op_parallelism_threads(2)
                
                print(f"[CropAI] Loading 67-class Keras model from: {model_path}")
                self.model = tf.keras.models.load_model(str(model_path))
                print(f"[CropAI] Successfully loaded model! Input shape: {self.model.input_shape}, Output shape: {self.model.output_shape}")
                
                with open(labels_path, "r", encoding="utf-8") as f:
                    self.class_names = json.load(f)
                print(f"[CropAI] Loaded {len(self.class_names)} classification labels from {labels_path.name}")
            except Exception as e:
                print(f"[CropAI] ERROR loading Keras model: {e}")
                self.model = None
        else:
            print(f"[CropAI] WARNING: Model file not found at {model_path}")

    def _validate_leaf_image(self, img: Image.Image) -> Tuple[bool, str, Dict[str, str]]:
        """
        Out-of-Distribution (OOD) Quality & Botany Foliage Pre-screening Gate:
        Prevents non-leaf inputs (black screens, dark rooms, blank walls, selfies, non-crop items)
        from triggering false positive classifications from the closed-set neural network.
        """
        arr_rgb = np.array(img.convert("RGB"), dtype=np.float32)
        mean_brightness = float(np.mean(arr_rgb))
        std_brightness = float(np.std(arr_rgb))

        # 1. Dark screen or covered lens check
        if mean_brightness < 22.0:
            return False, "dark_screen", {
                "en": "The photo is too dark or the camera lens is covered. Please take a photo in good daylight or lighting.",
                "ta": "புகைப்படம் மிகவும் இருட்டாக உள்ளது அல்லது கேமரா லென்ஸ் மூடப்பட்டுள்ளது. தயவுசெய்து நல்ல வெளிச்சத்தில் பயிர் இலையை படம் பிடிக்கவும்.",
                "hi": "फोटो बहुत अंधेरी है या कैमरा लेंस ढका हुआ है। कृपया अच्छी रोशनी में पौधे की पत्ती की फोटो लें।"
            }

        # 2. Pure blank or overexposed screen check
        if mean_brightness > 242.0 and std_brightness < 16.0:
            return False, "overexposed_blank", {
                "en": "The photo is completely blank or overexposed. Please capture a clear leaf photo.",
                "ta": "புகைப்படம் முற்றிலும் வெண்மையாக அல்லது அதிக வெளிச்சமாக உள்ளது. தெளிவான பயிர் இலையை படம் பிடிக்கவும்.",
                "hi": "फोटो अत्यधिक सफेद या खाली है। कृपया स्पष्ट पत्ती की फोटो लें।"
            }

        # 3. Flat image / zero texture
        if std_brightness < 8.0:
            return False, "flat_texture", {
                "en": "No visual texture detected. Please photograph an actual plant leaf.",
                "ta": "காட்சி விவரங்கள் எதுவும் இல்லை. தயவுசெய்து உண்மையான பயிர் இலையை படம் பிடிக்கவும்.",
                "hi": "कोई विवरण नहीं मिला। कृपया वास्तविक पौधे की पत्ती की फोटो लें।"
            }

        # 4. HSV Botanical Foliage Spectrum Check
        # Crop leaves naturally contain chlorophyll (green to yellow-green hues: 35°..165°)
        # or diseased necrotic halos (20°..35°).
        # Human skin (Hue 5°..25°, R > G > B), black screens, desks, and clothing lack green foliage.
        hsv = img.convert("HSV")
        h, s, v = hsv.split()
        h_arr = np.array(h, dtype=np.float32)
        s_arr = np.array(s, dtype=np.float32)
        v_arr = np.array(v, dtype=np.float32)

        hue_deg = (h_arr / 255.0) * 360.0
        sat_norm = s_arr / 255.0
        val_norm = v_arr / 255.0

        # Foliage mask: Hue between 35° and 165° with minimum saturation & value
        foliage_mask = (hue_deg >= 35.0) & (hue_deg <= 165.0) & (sat_norm >= 0.12) & (val_norm >= 0.12)
        # Necrotic lesion mask: Hue between 20° and 35° with saturation
        lesion_mask = (hue_deg >= 20.0) & (hue_deg < 35.0) & (sat_norm >= 0.22) & (val_norm >= 0.15) & (val_norm <= 0.85)

        foliage_pixels = np.sum(foliage_mask | lesion_mask)
        foliage_ratio = float(foliage_pixels) / float(h_arr.size)

        # A genuine leaf photo contains at least 8% botanical foliage/lesion pixels
        if foliage_ratio < 0.08:
            return False, "non_leaf_detected", {
                "en": "No crop leaf detected. The image appears to be a black screen, human face, or non-agricultural object. Please photograph a well-lit crop leaf.",
                "ta": "பயிர் இலை கண்டறியப்படவில்லை. கருப்பு திரை, மனித முகம் அல்லது தாவரமற்ற புகைப்படம் பதிவேற்றப்பட்டுள்ளது. தயவுசெய்து நல்ல வெளிச்சத்தில் பயிர் இலையை படம் பிடிக்கவும்.",
                "hi": "पौधे की पत्ती का पता नहीं चला। यह चित्र काला स्क्रीन, चेहरा या अन्य वस्तु प्रतीत होता है। कृपया केवल फसल की पत्ती की स्पष्ट फोटो लें।"
            }

        return True, "valid_leaf", {}

    def _preprocess_image(self, image_bytes: bytes) -> np.ndarray:
        """
        Preprocesses uploaded image strictly following Colab training contract:
        1. Correct EXIF orientation.
        2. Convert to RGB.
        3. Resize to 224x224.
        4. Convert pixels to float32 in [0, 255] range.
        5. Add batch dimension.
        * NOTE: The Keras model internally contains Rescaling(scale=1/127.5, offset=-1).
        * DO NOT divide by 255 here.
        """
        img = Image.open(io.BytesIO(image_bytes))
        img = ImageOps.exif_transpose(img)
        img = img.convert("RGB")
        img = img.resize((224, 224), Image.Resampling.BILINEAR)
        
        arr = np.array(img, dtype=np.float32)
        arr = np.expand_dims(arr, axis=0)
        return arr

    async def analyze_crop_leaf(
        self,
        image_bytes: bytes,
        filename: str = "",
        sample_key: Optional[str] = None,
        language: str = "en"
    ) -> Dict[str, Any]:
        """
        Main entry point for leaf photo pathology analysis.
        Differentiates real uploaded image inference from sample benchmark presets.
        Enforces Out-of-Distribution botanical leaf pre-screening and full language localization.
        """
        # Normalize requested language
        lang = (language or "en").lower().strip()
        if lang not in ("ta", "hi", "en"):
            lang = "en"

        # 1. Handle Sample Benchmark Preset
        if sample_key:
            mapped_key = SAMPLE_ALIASES.get(sample_key, sample_key)
            if mapped_key in DISEASE_METADATA_67:
                diag = DISEASE_METADATA_67[mapped_key]
                confidence = 0.952 if "healthy" not in mapped_key.lower() else 0.985
                return self._format_result(
                    class_key=mapped_key,
                    diag=diag,
                    confidence=confidence,
                    engine="Sample Benchmark Preset",
                    top_predictions=[{"class": mapped_key, "confidence": confidence}],
                    language=lang
                )

        # 2. Real Image Inference via Keras Model
        if not image_bytes:
            raise ValueError("No image data provided for inference.")

        if not self.model or not self.class_names:
            raise RuntimeError(
                "AI Crop Doctor model is not loaded. Please ensure "
                "best_gramvikas_multicrop_v3_finetuned.keras and class_names.json exist."
            )

        # CPU-bound Image Loading, Orientation, and Botany OOD Gate
        def _load_and_validate():
            raw_img = Image.open(io.BytesIO(image_bytes))
            raw_img = ImageOps.exif_transpose(raw_img)
            raw_img = raw_img.convert("RGB")
            is_valid, err_code, msgs = self._validate_leaf_image(raw_img)
            if not is_valid:
                return False, err_code, msgs, None
            
            img_resized = raw_img.resize((224, 224), Image.Resampling.BILINEAR)
            arr = np.array(img_resized, dtype=np.float32)
            arr = np.expand_dims(arr, axis=0)
            return True, None, None, arr

        loop = asyncio.get_running_loop()
        try:
            is_valid, err_code, msgs, arr = await loop.run_in_executor(None, _load_and_validate)
        except Exception as e:
            raise ValueError(f"Failed to read image file: {str(e)}")

        if not is_valid:
            return {
                "status": "invalid_leaf",
                "error_type": err_code,
                "reason_en": msgs["en"],
                "reason_ta": msgs["ta"],
                "reason_hi": msgs["hi"],
                "guidance_en": "Please take a clear close-up photo of a crop or plant leaf in good daylight.",
                "guidance_ta": "தயவுசெய்து நல்ல பகல் வெளிச்சத்தில் பயிர் அல்லது தாவர இலையை தெளிவாக படம் பிடிக்கவும்.",
                "guidance_hi": "कृपया अच्छी रोशनी में केवल फसल या पौधे की पत्ती की स्पष्ट फोटो लें।"
            }

        try:
            raw_preds = await loop.run_in_executor(None, lambda: self.model.predict(arr, verbose=0)[0])
        except Exception as e:
            raise ValueError(f"Inference execution failed: {str(e)}")

        idx = int(np.argmax(raw_preds))
        confidence = float(raw_preds[idx])
        pred_label = self.class_names[idx]

        # Top 3 predictions for transparent diagnostic context
        top_indices = np.argsort(raw_preds)[::-1][:3]
        top_predictions = [
            {"class": self.class_names[i], "confidence": round(float(raw_preds[i]), 4)}
            for i in top_indices
        ]

        # Lookup agronomic metadata
        diag = DISEASE_METADATA_67.get(pred_label)
        if not diag:
            crop_name = pred_label.split("___")[0].replace("_", " ")
            disease_name = pred_label.split("___")[1].replace("_", " ") if "___" in pred_label else pred_label
            diag = {
                "crop_en": crop_name, "crop_ta": crop_name, "crop_hi": crop_name,
                "disease_en": disease_name, "disease_ta": disease_name, "disease_hi": disease_name,
                "severity": "Moderate", "severity_ta": "நடுத்தரம்", "severity_hi": "मध्यम",
                "symptoms_en": f"Symptoms indicative of {disease_name} on {crop_name}.",
                "symptoms_ta": f"{crop_name} பயிரில் {disease_name} பாதிப்பு அறிகுறிகள்.",
                "symptoms_hi": f"{crop_name} फसल पर {disease_name} के लक्षण।",
                "organic_treatment_en": "Spray 3% Neem oil or Panchagavya (3%) as prophylactic measure.",
                "organic_treatment_ta": "3% வேப்ப எண்ணெய் அல்லது பஞ்சகாவ்யா (3%) தெளிக்கவும்.",
                "organic_treatment_hi": "3% नीम का तेल या पंचगव्य का छिड़काव करें।",
                "chemical_treatment_en": "Consult Block Agricultural Development Officer for registered fungicides.",
                "chemical_treatment_ta": "வட்டார வேளாண்மை அலுவலரை அணுகி மருந்துகளை பெறவும்.",
                "chemical_treatment_hi": "कृषि अधिकारी से सलाह लें।",
                "prevention_en": "Scout field regularly and remove infected foliage.",
                "prevention_ta": "வயலை தொடர்ந்து கண்காணிக்கவும்.",
                "prevention_hi": "खेत की नियमित निगरानी रखें।",
                "matching_scheme": {
                    "name_en": "PM Fasal Bima Yojana",
                    "name_ta": "பிரதம மந்திரி பயிர் காப்பீட்டுத் திட்டம்",
                    "name_hi": "प्रधानमंत्री फसल बीमा योजना",
                    "scheme_slug": "pm-kisan-samman-nidhi"
                }
            }

        return self._format_result(
            class_key=pred_label,
            diag=diag,
            confidence=confidence,
            engine="Local 67-Class MobileNetV2 Neural Network",
            top_predictions=top_predictions,
            language=lang
        )

    def _format_result(
        self,
        class_key: str,
        diag: Dict[str, Any],
        confidence: float,
        engine: str,
        top_predictions: Optional[List[Dict[str, Any]]] = None,
        language: str = "en"
    ) -> Dict[str, Any]:
        """
        Formats pathology diagnosis into strict trilingual JSON schema.
        Applies empirical 3-tier confidence bands, class-specific cautions,
        and dynamically tailors diagnosis summaries, remedies, schemes, and audio to the requested language.
        """
        lang = (language or "en").lower().strip()
        if lang not in ("ta", "hi", "en"):
            lang = "en"

        conf_pct = round(confidence * 100.0, 1) if confidence <= 1.0 else round(confidence, 1)
        conf_norm = round(confidence, 4) if confidence <= 1.0 else round(confidence / 100.0, 4)

        # 3-Tier Confidence Guidance
        # High: >= 0.75 (97.53% validation accuracy)
        # Moderate: 0.55 to < 0.75
        # Low: < 0.55
        if conf_norm >= 0.75:
            confidence_level = "high"
            warning_en = None
            warning_ta = None
            warning_hi = None
        elif conf_norm >= 0.55:
            confidence_level = "moderate"
            warning_en = "Moderate confidence prediction. Compare visual leaf symptoms with an agricultural officer before applying chemical sprays."
            warning_ta = "மிதமான நம்பகத்தன்மை முடிவு. ரசாயன மருந்துகளை தெளிக்கும் முன் வேளாண்மை அலுவலரிடம் உறுதிப்படுத்தவும்."
            warning_hi = "मध्यम स्तर की भविष्यवाणी। रासायनिक छिड़काव से पहले कृषि अधिकारी से सलाह लें।"
        else:
            confidence_level = "low"
            warning_en = "Low confidence prediction. Please retake a clear, well-lit photo of the diseased leaf or consult your local BDO / Krishi Vigyan Kendra (KVK)."
            warning_ta = "குறைந்த நம்பகத்தன்மை. தெளிவான வெளிச்சத்தில் இலையை மீண்டும் படம் எடுக்கவும் அல்லது வேளாண்மை அலுவலரை அணுகவும்."
            warning_hi = "कम आत्मविश्वास। कृपया अच्छी रोशनी में स्पष्ट फोटो लें या कृषि विज्ञान केंद्र से संपर्क करें।"

        # Class-specific caution for known challenging classes
        class_caution = None
        if class_key in WEAK_RECALL_CLASSES:
            class_caution = {
                "en": f"Note: '{class_key.split('___')[-1]}' is a biologically variable pathology. Verify lesion shapes and spore rings carefully.",
                "ta": "குறிப்பு: இந்த நோய் அறிகுறி பல்வேறு சுற்றுச்சூழல் காரணிகளால் மாறுபடக்கூடியது. அறிகுறிகளை கவனமாக சரிபார்க்கவும்.",
                "hi": "नोट: इस रोग के लक्षण पर्यावरण के अनुसार बदल सकते हैं। कृपया लक्षणों की अच्छी तरह जांच करें।"
            }

        # Language-aligned remedy text selection
        symptoms_text = diag.get(f"symptoms_{lang}") or diag.get("symptoms_en", "")
        organic_text = diag.get(f"organic_treatment_{lang}") or diag.get("organic_treatment_en", "")
        chemical_text = diag.get(f"chemical_treatment_{lang}") or diag.get("chemical_treatment_en", "")
        prevention_text = diag.get(f"prevention_{lang}") or diag.get("prevention_en", "")

        # Matching welfare scheme localized title & benefits
        scheme_meta = diag.get("matching_scheme", {})
        scheme_title = scheme_meta.get(f"name_{lang}") or scheme_meta.get("name_en", "PM Fasal Bima Yojana")
        benefit_map = {
            "ta": "வங்கி மானியம் மற்றும் வேளாண் விரிவாக்க உதவி",
            "hi": "सरकारी सब्सिडी और कृषि विशेषज्ञ सहायता",
            "en": "Govt subsidy & agricultural extension support"
        }

        # Spoken audio summary tailored to farmer's selected language
        if lang == "ta":
            disease_name = diag.get("disease_ta", diag["disease_en"])
            audio_summary = f"பயிர் பரிசோதனை முடிவு: {disease_name}. பரிந்துரைக்கப்படும் இயற்கை சிகிச்சை: {organic_text[:120]}"
        elif lang == "hi":
            disease_name = diag.get("disease_hi", diag["disease_en"])
            audio_summary = f"फसल जांच परिणाम: {disease_name}। अनुशंसित जैविक उपचार: {organic_text[:120]}"
        else:
            disease_name = diag["disease_en"]
            audio_summary = f"Crop pathology diagnosis: {disease_name}. Recommended organic treatment: {organic_text[:120]}"

        return {
            "status": "success",
            "model_version": self.model_version,
            "class_key": class_key,
            "engine_used": engine,
            "confidence": conf_norm,
            "confidence_percentage": conf_pct,
            "confidence_level": confidence_level,
            "warning_en": warning_en,
            "warning_ta": warning_ta,
            "warning_hi": warning_hi,
            "class_caution": class_caution,
            "top_predictions": top_predictions or [],
            "severity": diag["severity"],
            "severity_ta": diag.get("severity_ta", diag["severity"]),
            "severity_hi": diag.get("severity_hi", diag["severity"]),
            "crop": {
                "en": diag["crop_en"],
                "ta": diag["crop_ta"],
                "hi": diag["crop_hi"]
            },
            "disease": {
                "en": diag["disease_en"],
                "ta": diag["disease_ta"],
                "hi": diag["disease_hi"]
            },
            # Dynamically localized flattened fields for seamless UI backward compatibility
            "disease_name_en": diag["disease_en"],
            "disease_name_ta": diag["disease_ta"],
            "disease_name_hi": diag["disease_hi"],
            "diagnosis_summary": symptoms_text,
            "organic_remedy": organic_text,
            "chemical_remedy": chemical_text,
            "prevention_advice": prevention_text,
            "audio_summary": audio_summary,
            "schemes_recommended": [
                {
                    "title": scheme_title,
                    "benefit": benefit_map.get(lang, benefit_map["en"])
                }
            ],
            "symptoms": {
                "en": diag["symptoms_en"],
                "ta": diag["symptoms_ta"],
                "hi": diag["symptoms_hi"]
            },
            "organic_treatment": {
                "en": diag["organic_treatment_en"],
                "ta": diag["organic_treatment_ta"],
                "hi": diag["organic_treatment_hi"]
            },
            "chemical_treatment": {
                "en": diag["chemical_treatment_en"],
                "ta": diag["chemical_treatment_ta"],
                "hi": diag["chemical_treatment_hi"]
            },
            "prevention": {
                "en": diag["prevention_en"],
                "ta": diag["prevention_ta"],
                "hi": diag["prevention_hi"]
            },
            "matching_scheme": diag["matching_scheme"]
        }

crop_ai = CropAiService()

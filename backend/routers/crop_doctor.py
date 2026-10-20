"""
GRAMVIKAS AI - AI Crop Disease Doctor Router (/api/crop-doctor/*).
Endpoints for leaf photo analysis, diagnostic advisory, and sample benchmark testing.
"""

from fastapi import APIRouter, UploadFile, File, Form, Query, HTTPException, status
from typing import Optional, Dict, Any, List
from backend.services.crop_ai import crop_ai
from backend.services.crop_metadata_67 import DISEASE_METADATA_67

router = APIRouter(prefix="/api/crop-doctor", tags=["Crop Doctor AI"])

@router.post("/analyze")
async def analyze_crop(
    file: Optional[UploadFile] = File(None),
    sample_key: Optional[str] = Form(None),
    sample_key_query: Optional[str] = Query(None, alias="sample_key"),
    language: Optional[str] = Query("en")
):
    chosen_sample = sample_key or sample_key_query
    if not file and not chosen_sample:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Please provide a crop leaf photo or select a benchmark sample."
        )

    image_bytes = b""
    filename = ""
    if file:
        # Validate MIME type
        if file.content_type and not (
            file.content_type.startswith("image/") or
            file.content_type in ("application/octet-stream",)
        ):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid file format. Please upload a valid JPG, PNG, or WebP leaf image."
            )

        content = await file.read()
        if len(content) == 0:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Uploaded file is empty. Please select a valid photo."
            )
        if len(content) > 10 * 1024 * 1024:
            raise HTTPException(
                status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
                detail="Image must be under 10MB."
            )
        image_bytes = content
        filename = file.filename or ""

    try:
        result = await crop_ai.analyze_crop_leaf(
            image_bytes=image_bytes,
            filename=filename,
            sample_key=chosen_sample,
            language=language or "en"
        )
        return result
    except ValueError as ve:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(ve))
    except RuntimeError as re:
        raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail=str(re))
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Pathology analysis failed: {str(e)}"
        )

@router.get("/samples")
async def get_benchmark_samples():
    """Returns sample crop leaves with images and keys for 1-click farmer testing."""
    return [
        {
            "key": "paddy_blast",
            "class_key": "Paddy___Blast",
            "crop_en": "Paddy / Rice",
            "crop_ta": "நெல் பயிர்",
            "crop_hi": "धान / चावल",
            "disease_en": "Leaf Blast (குலை நோய்)",
            "thumbnail": "https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=300&q=80"
        },
        {
            "key": "tomato_early_blight",
            "class_key": "Tomato___Early blight",
            "crop_en": "Tomato",
            "crop_ta": "தக்காளி பயிர்",
            "crop_hi": "टमाटर",
            "disease_en": "Early Blight (இலைக்கருகல்)",
            "thumbnail": "https://images.unsplash.com/photo-1592924357228-91a4daadcfea?auto=format&fit=crop&w=300&q=80"
        },
        {
            "key": "groundnut_tikka",
            "class_key": "Groundnut___Leaf spot",
            "crop_en": "Groundnut",
            "crop_ta": "நிலக்கடலை பயிர்",
            "crop_hi": "मूंगफली",
            "disease_en": "Tikka Leaf Spot (டிக்கா நோய்)",
            "thumbnail": "https://images.unsplash.com/photo-1563729784474-d77dbb933a9e?auto=format&fit=crop&w=300&q=80"
        },
        {
            "key": "rice_healthy",
            "class_key": "Paddy___Healthy",
            "crop_en": "Paddy / Rice",
            "crop_ta": "நெல் பயிர்",
            "crop_hi": "धान / चावल",
            "disease_en": "Healthy Crop (ஆரோக்கிய பயிர்)",
            "thumbnail": "https://images.unsplash.com/photo-1500937386664-56d1dfef3854?auto=format&fit=crop&w=300&q=80"
        }
    ]

@router.get("/library")
@router.get("/diseases")
@router.get("/catalog")
async def get_disease_library():
    """Returns all 67 diseases documented in the agronomic knowledge base."""
    return [
        {
            "key": k,
            "crop": v["crop_en"],
            "disease": v["disease_en"],
            "severity": v["severity"],
            "severity_ta": v.get("severity_ta", v["severity"]),
            "severity_hi": v.get("severity_hi", v["severity"])
        }
        for k, v in DISEASE_METADATA_67.items()
    ]

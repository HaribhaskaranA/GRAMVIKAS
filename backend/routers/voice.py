"""
GRAMVIKAS AI - Telephony & Voice Service Router.
Endpoints for live phone calling, audio streaming, consent, and broadcast simulation.
"""

from fastapi import APIRouter, HTTPException, status, Depends, Request, Response, Query
from fastapi.responses import StreamingResponse
from typing import List, Optional, Dict, Any
import io
from pydantic import BaseModel
from backend.models.schemas import (
    VoiceSubscribeRequest,
    VoiceSubscriptionOut,
    VoiceCampaignCreate,
    VoiceCampaignOut,
    CallLogOut,
    BroadcastSimulateRequest
)
from backend.database import db
from backend.services.telephony import telephony_service, is_within_quiet_hours
from backend.dependencies import get_current_user, require_admin, require_official_or_admin, get_optional_user

router = APIRouter(prefix="/api/voice", tags=["Voice Service"])

class LiveCallRequest(BaseModel):
    phone_number: str
    language: str = "ta"
    category: str = "schemes" # schemes, emergency, gram_sabha
    custom_message: Optional[str] = None
    ignore_quiet_hours: bool = True # For interactive user demo tests

@router.post("/call-now")
async def place_live_call_now(req: LiveCallRequest):
    """
    Places a real phone call (if Twilio is configured in .env) or returns a live
    audio stream call object that rings the user's browser device with authentic Tamil speech.
    """
    # Build spoken announcement text based on selected category & language
    if req.custom_message:
        message = req.custom_message
    elif req.category == "schemes":
        if req.language == "ta":
            message = "வணக்கம்! இது கிராம விகாஸ் குரல் வழி சேவை. பிரதம மந்திரி கிசான் சம்மான் நிதி மற்றும் கலைஞர் கனவு இல்லம் திட்டங்களுக்கான விண்ணப்பங்கள் உங்கள் கிராம ஊராட்சி அலுவலகத்தில் பெறப்படுகின்றன. உடனடியாக பதிவு செய்து பயன்பெறுங்கள்."
        elif req.language == "hi":
            message = "नमस्ते! यह ग्राम विकास वॉयस सेवा है। पीएम किसान सम्मान निधि और आवास योजना के लिए आवेदन ग्राम पंचायत में स्वीकार किए जा रहे हैं। कृपया शीघ्र आवेदन करें।"
        else:
            message = "Hello! This is GRAMVIKAS Voice Alert. Applications for PM-KISAN financial assistance and Rural Housing schemes are currently open at your Village Panchayat office."
    elif req.category == "emergency":
        if req.language == "ta":
            message = "எச்சரிக்கை அறிவிப்பு! செங்கல்பட்டு மாவட்டத்தில் கனமழை எச்சரிக்கை விடுக்கப்பட்டுள்ளது. செய்யூர் வட்டார கட்டுப்பாட்டு அறை உதவிக்கு 1077 என்ற எண்ணை அழைக்கவும்."
        else:
            message = "Emergency Alert! Moderate to heavy rainfall forecast. Block control room opened 24/7. Dial 1077 for emergency assistance."
    else:
        if req.language == "ta":
            message = "மேல்மருவத்தூர் ஊராட்சியின் சிறப்பு கிராம சபை கூட்டம் வரும் செவ்வாய்க்கிழமை காலை 10:00 மணிக்கு ஊராட்சி மன்ற அலுவலகத்தில் கூடுகிறது. பொதுமக்கள் அனைவரும் தவறாமல் கலந்து கொள்ளவும்."
        else:
            message = "Notice: Special Gram Sabha meeting convenes this Tuesday at 10:00 AM at the Panchayat Community Hall. All citizens are requested to attend."

    result = await telephony_service.place_live_call(
        to_phone=req.phone_number,
        message_text=message,
        lang=req.language,
        ignore_quiet_hours=req.ignore_quiet_hours
    )
    result["spoken_text"] = message

    # Persist as an official voice broadcast alert so it appears on the Citizen Home Feed & Auto-Reader
    try:
        db.create_announcement({
            "publisher_name": "Official Voice Broadcast / BDO",
            "title_en": f"Official Voice Message ({req.category.replace('_', ' ').title()})",
            "title_ta": f"அரசு அலுவலர் குரல் வழி செய்தி ({'நலத்திட்டம்' if req.category == 'schemes' else ('அவசர அறிவிப்பு' if req.category == 'emergency' else 'கிராம சபை')})",
            "title_hi": f"अधिकारी वॉयस संदेश ({req.category})",
            "body_en": message if req.language == "en" else "Official government voice broadcast message sent to your village.",
            "body_ta": message if req.language == "ta" else "அரசு அலுவலர் அனுப்பிய நேரடி குரல் வழி அறிவிப்பு.",
            "body_hi": message if req.language == "hi" else "अधिकारी द्वारा भेजा गया वॉयस संदेश।",
            "priority": "emergency" if req.category == "emergency" else "high",
            "target_level": "village",
            "target_area": "Melmaruvathur",
            "target_phone": req.phone_number,
            "is_voice_broadcast": True,
            "audio_url": result.get("audio_url")
        })
    except Exception as db_err:
        print(f"[Voice Broadcast DB note] {db_err}")

    return result

@router.get("/audio-stream")
async def stream_spoken_audio(
    text: str = Query(..., description="Text to synthesize into spoken audio"),
    lang: str = Query("ta", description="Language: ta, hi, en")
):
    """Generates real MP3 voice audio on-the-fly using Google Text-to-Speech (gTTS)."""
    try:
        audio_bytes = telephony_service.generate_spoken_audio(text, lang)
        return StreamingResponse(io.BytesIO(audio_bytes), media_type="audio/mpeg")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Audio synthesis error: {e}")

@router.post("/subscribe", response_model=VoiceSubscriptionOut)
async def subscribe_voice_endpoint(
    req: VoiceSubscribeRequest,
    request: Request,
    current_user: Optional[Dict[str, Any]] = Depends(get_optional_user)
):
    ip = request.client.host if request.client else "127.0.0.1"
    sub = telephony_service.register_consent(
        phone=req.phone_number,
        name=req.subscriber_name,
        lang=req.preferred_language,
        village=req.village,
        district=req.district,
        ip=ip,
        user_id=current_user["id"] if current_user else None
    )
    return sub

@router.post("/unsubscribe")
async def unsubscribe_voice_endpoint(payload: Dict[str, str], request: Request):
    phone = payload.get("phone_number")
    if not phone:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Phone number required.")
    
    ip = request.client.host if request.client else "127.0.0.1"
    success = telephony_service.withdraw_consent(phone, ip)
    if not success:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Subscription record not found for this number.")
    
    return {"status": "success", "message": f"Successfully unsubscribed {phone}. You will no longer receive automated voice calls."}

@router.get("/subscriptions", response_model=List[VoiceSubscriptionOut])
async def list_subscriptions(current_user: Dict[str, Any] = Depends(require_official_or_admin)):
    return db.get_voice_subscriptions(active_only=False)

@router.get("/campaigns", response_model=List[VoiceCampaignOut])
async def list_campaigns(current_user: Dict[str, Any] = Depends(require_official_or_admin)):
    return db.get_voice_campaigns()

@router.post("/campaigns", response_model=VoiceCampaignOut)
async def create_campaign(
    payload: VoiceCampaignCreate,
    current_user: Dict[str, Any] = Depends(require_official_or_admin)
):
    camp_dict = payload.model_dump()
    camp_dict["created_by"] = current_user["id"]
    new_camp = db.create_voice_campaign(camp_dict)

    db.log_audit(
        action="VOICE_CAMPAIGN_CREATED",
        entity_type="voice_campaign",
        entity_id=new_camp["id"],
        user_id=current_user["id"],
        user_name=current_user["full_name"],
        details={"name": payload.campaign_name, "lang": payload.target_language}
    )

    return new_camp

@router.post("/campaigns/{campaign_id}/simulate")
async def simulate_campaign_dispatch(
    campaign_id: str,
    payload: Optional[BroadcastSimulateRequest] = None,
    current_user: Dict[str, Any] = Depends(require_official_or_admin)
):
    res = telephony_service.dispatch_broadcast_campaign(
        campaign_id=campaign_id,
        village=payload.village if payload else None,
        district=payload.district if payload else None,
        ignore_quiet_hours_demo=True
    )
    return res

@router.get("/call-logs", response_model=List[CallLogOut])
@router.get("/call-log", response_model=List[CallLogOut])
async def list_call_logs(current_user: Dict[str, Any] = Depends(require_official_or_admin)):
    return db.get_call_logs()

@router.get("/status")
async def get_telephony_status():
    return {
        "quiet_hours_active": is_within_quiet_hours(),
        "quiet_hours_window": "20:00 to 07:00 (IST)",
        "active_subscribers": len(db.get_voice_subscriptions(active_only=True)),
        "twilio_configured": bool(telephony_service.twilio_sid and telephony_service.twilio_token),
        "gateway_provider": "Twilio Real Outbound Voice API" if (telephony_service.twilio_sid and telephony_service.twilio_token) else "Live Spoken Tamil Voice Synthesizer (gTTS Stream)"
    }

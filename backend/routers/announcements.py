"""
GRAMVIKAS AI - Public Announcements, Gram Sabha Alerts & Live Rural News Router.
Delivers verified community alerts, official voice broadcasts, and real-time agricultural news feeds.
"""

import time
import urllib.parse
import xml.etree.ElementTree as ET
from html import unescape
from typing import List, Optional, Dict, Any
from fastapi import APIRouter, HTTPException, status, Depends, Query
import httpx

from backend.models.schemas import AnnouncementOut, AnnouncementCreate
from backend.database import db
from backend.dependencies import require_verified_official

router = APIRouter(prefix="/api/announcements", tags=["Announcements"])

# In-memory cache for live news (TTL: 10 minutes)
_news_cache: Dict[str, Dict[str, Any]] = {
    "ta": {"timestamp": 0.0, "items": []},
    "hi": {"timestamp": 0.0, "items": []},
    "en": {"timestamp": 0.0, "items": []}
}
CACHE_TTL = 600.0  # 10 minutes

SEARCH_QUERIES = {
    "ta": "தமிழ்நாடு விவசாயம் OR தமிழ்நாடு அரசு நலத்திட்டம் OR வானிலை",
    "hi": "किसान योजना OR ग्रामीण विकास OR कृषि समाचार भारत",
    "en": "Tamil Nadu agriculture farmers welfare scheme OR rural development India"
}

RSS_URL_TEMPLATES = {
    "ta": "https://news.google.com/rss/search?q={query}&hl=ta&gl=IN&ceid=IN:ta",
    "hi": "https://news.google.com/rss/search?q={query}&hl=hi&gl=IN&ceid=IN:hi",
    "en": "https://news.google.com/rss/search?q={query}&hl=en-IN&gl=IN&ceid=IN:en"
}

FALLBACK_NEWS = {
    "ta": [
        {
            "id": "fallback-1",
            "title": "தமிழ்நாடு விவசாய நலத்திட்டங்கள்: புதிய மானிய அறிவிப்பு",
            "body": "விவசாயிகளுக்கான சொட்டுநீர் பாசன மானியம் மற்றும் உரம் கொள்முதல் சலுகைகள் வட்டார வேளாண்மை விரிவாக்க மையத்தில் வழங்கப்படுகிறது.",
            "source": "தமிழக வேளாண்மைத் துறை",
            "published_at": "இன்று",
            "link": "https://agricoop.tn.gov.in/",
            "is_official": False,
            "priority": "high",
            "speech_text": "தமிழ்நாடு விவசாய நலத்திட்டங்கள்: விவசாயிகளுக்கான சொட்டுநீர் பாசன மானியம் மற்றும் உரம் சலுகைகள் வட்டார வேளாண்மை மையத்தில் வழங்கப்படுகிறது."
        },
        {
            "id": "fallback-2",
            "title": "ஊரக குடிநீர் மற்றும் சாலை பராமரிப்பு சிறப்பு திட்டம்",
            "body": "கிராம ஊராட்சிகளில் குடிநீர் விநியோகம் மற்றும் மழைக்கால சாலை சீரமைப்பு பணிகள் துரிதப்படுத்தப்பட்டுள்ளன.",
            "source": "ஊரக வளர்ச்சித் துறை",
            "published_at": "இன்று",
            "link": "https://tnrd.tn.gov.in/",
            "is_official": False,
            "priority": "normal",
            "speech_text": "ஊரக குடிநீர் மற்றும் சாலை பராமரிப்பு சிறப்பு திட்டம்: கிராம ஊராட்சிகளில் குடிநீர் விநியோகம் துரிதப்படுத்தப்பட்டுள்ளது."
        }
    ],
    "hi": [
        {
            "id": "fallback-hi-1",
            "title": "प्रधानमंत्री किसान सम्मान निधि: नई किस्त जारी",
            "body": "पात्र किसानों के खातों में डीबीटी के माध्यम से सम्मान निधि सहायता राशि हस्तांतरित की गई है।",
            "source": "कृषि मंत्रालय भारत सरकार",
            "published_at": "आज",
            "link": "https://pmkisan.gov.in/",
            "is_official": False,
            "priority": "high",
            "speech_text": "प्रधानमंत्री किसान सम्मान निधि: पात्र किसानों के खातों में सहायता राशि हस्तांतरित की गई है।"
        }
    ],
    "en": [
        {
            "id": "fallback-en-1",
            "title": "Tamil Nadu Agriculture Welfare Schemes & Micro Irrigation Subsidy",
            "body": "Department of Agriculture announces expanded micro-irrigation support and input subsidies for small and marginal farmers.",
            "source": "TN Agriculture Dept",
            "published_at": "Today",
            "link": "https://agricoop.tn.gov.in/",
            "is_official": False,
            "priority": "high",
            "speech_text": "Tamil Nadu Agriculture Welfare Schemes: expanded micro-irrigation support and input subsidies announced for farmers."
        }
    ]
}


async def fetch_live_rss_news(lang: str) -> List[Dict[str, Any]]:
    """Fetch live news from Google News RSS with in-memory caching and fallback."""
    normalized_lang = lang if lang in ("ta", "hi", "en") else "ta"
    cache_entry = _news_cache.get(normalized_lang, {"timestamp": 0.0, "items": []})
    now = time.time()

    if cache_entry["items"] and (now - cache_entry["timestamp"]) < CACHE_TTL:
        return cache_entry["items"]

    raw_query = SEARCH_QUERIES.get(normalized_lang, SEARCH_QUERIES["ta"])
    encoded_query = urllib.parse.quote(raw_query)
    feed_url = RSS_URL_TEMPLATES[normalized_lang].format(query=encoded_query)

    news_items: List[Dict[str, Any]] = []
    try:
        async with httpx.AsyncClient(timeout=4.5, headers={"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)"}) as client:
            resp = await client.get(feed_url)
            if resp.status_code == 200:
                root = ET.fromstring(resp.content)
                raw_items = root.findall(".//item")
                
                for idx, it in enumerate(raw_items[:12]):
                    raw_title = it.findtext("title") or ""
                    link = it.findtext("link") or ""
                    pub_date = it.findtext("pubDate") or ""
                    source_name = it.findtext("source") or ""

                    # Clean title and separate source suffix if present
                    clean_title = unescape(raw_title).strip()
                    if " - " in clean_title:
                        parts = clean_title.rsplit(" - ", 1)
                        clean_title = parts[0].strip()
                        if not source_name:
                            source_name = parts[1].strip()

                    if not source_name:
                        source_name = "செய்தி ஊடகம்" if normalized_lang == "ta" else ("समाचार" if normalized_lang == "hi" else "News Desk")

                    news_items.append({
                        "id": f"rss-{normalized_lang}-{idx + 1}",
                        "title": clean_title,
                        "body": clean_title,
                        "source": source_name,
                        "published_at": pub_date[:16] if pub_date else "நேரலை",
                        "link": link,
                        "is_official": False,
                        "priority": "high" if idx == 0 else "normal",
                        "speech_text": f"{clean_title} ({source_name})"
                    })

                if news_items:
                    _news_cache[normalized_lang] = {"timestamp": now, "items": news_items}
                    return news_items
    except Exception as e:
        print(f"[LiveNewsRSS] Warning: {e}")

    # Fallback to cached or curated items
    if cache_entry["items"]:
        return cache_entry["items"]
    return FALLBACK_NEWS.get(normalized_lang, FALLBACK_NEWS["ta"])


@router.get("/live-news")
async def get_live_news_endpoint(
    lang: str = Query("ta", description="Language code: ta, hi, en"),
    village: Optional[str] = Query(None, description="Citizen village for local official alerts")
):
    """
    Combined Live News & Official Voice Feed:
    1. Highest priority official broadcasts from DB (BDO, Panchayat, District Collector).
    2. Real-time live RSS news from Tamil Nadu / Indian Agriculture & Welfare.
    """
    # 1. Fetch Official DB Announcements
    official_records = db.get_announcements(active_only=True, village=village)
    formatted_official: List[Dict[str, Any]] = []

    for ann in official_records:
        title = ann.get(f"title_{lang}") or ann.get("title_en") or ann.get("title_ta", "")
        body = ann.get(f"body_{lang}") or ann.get("body_en") or ann.get("body_ta", "")
        
        formatted_official.append({
            "id": ann["id"],
            "title": title,
            "body": body,
            "title_ta": ann.get("title_ta"),
            "title_en": ann.get("title_en"),
            "title_hi": ann.get("title_hi"),
            "body_ta": ann.get("body_ta"),
            "body_en": ann.get("body_en"),
            "body_hi": ann.get("body_hi"),
            "source": ann.get("publisher_name") or "கிராம ஊராட்சி / Panchayat Office",
            "published_at": ann.get("created_at", ""),
            "link": "",
            "is_official": True,
            "is_voice_broadcast": bool(ann.get("is_voice_broadcast") or ann.get("audio_url")),
            "audio_url": ann.get("audio_url"),
            "priority": ann.get("priority", "normal"),
            "target_area": ann.get("target_area") or "Melmaruvathur",
            "speech_text": f"{title}. {body}"
        })

    # 2. Fetch Live RSS Feeds
    live_rss = await fetch_live_rss_news(lang)

    # 3. Official alerts take precedence at the top, followed by live news items
    return {
        "official_count": len(formatted_official),
        "rss_count": len(live_rss),
        "items": formatted_official + live_rss
    }


@router.get("", response_model=List[AnnouncementOut])
async def list_announcements(
    priority: Optional[str] = Query(None, description="Filter by priority: low, normal, high, emergency"),
    active_only: bool = Query(True, description="Filter only unexpired active announcements"),
    village: Optional[str] = Query(None, description="Filter by village name"),
    phone: Optional[str] = Query(None, description="Filter by target phone number")
):
    return db.get_announcements(priority=priority, active_only=active_only, village=village, phone=phone)


@router.post("", response_model=AnnouncementOut)
async def create_announcement_endpoint(
    payload: AnnouncementCreate,
    current_user: Dict[str, Any] = Depends(require_verified_official)
):
    ann_dict = payload.model_dump()
    ann_dict["publisher_id"] = current_user["id"]
    ann_dict["publisher_name"] = f"{current_user['full_name']} ({current_user.get('role', 'Official').title()})"
    
    new_ann = db.create_announcement(ann_dict)

    db.log_audit(
        action="ANNOUNCEMENT_PUBLISHED",
        entity_type="announcement",
        entity_id=new_ann["id"],
        user_id=current_user["id"],
        user_name=current_user["full_name"],
        details={"title": payload.title_en, "priority": payload.priority}
    )

    return new_ann

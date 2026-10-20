"""
GRAMVIKAS AI - Configuration and Environment Settings.
Automatic Zero-Config Demo Mode Detection.
"""

import os
from pathlib import Path
from pydantic import BaseModel

BASE_DIR = Path(__file__).resolve().parent.parent
UPLOADS_DIR = BASE_DIR / "backend" / "uploads"
UPLOADS_DIR.mkdir(parents=True, exist_ok=True)

class Settings(BaseModel):
    PROJECT_NAME: str = "GRAMVIKAS AI"
    VERSION: str = "1.0.0"
    ENVIRONMENT: str = os.getenv("ENVIRONMENT", "development")
    
    # Security & JWT
    SECRET_KEY: str = os.getenv("SECRET_KEY", "gramvikas_ai_super_secret_jwt_key_2026_production_grade")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "43200")) # 30 days
    
    # Supabase / External DB
    SUPABASE_URL: str = os.getenv("SUPABASE_URL", "").strip()
    SUPABASE_ANON_KEY: str = os.getenv("SUPABASE_ANON_KEY", "").strip()
    SUPABASE_SERVICE_ROLE_KEY: str = os.getenv("SUPABASE_SERVICE_ROLE_KEY", "").strip()
    DATABASE_URL: str = os.getenv("DATABASE_URL", "").strip()
    
    # AI Engine
    GEMINI_API_KEY: str = os.getenv("GEMINI_API_KEY", "").strip()
    GEMINI_MODEL: str = os.getenv("GEMINI_MODEL", "gemini-2.5-flash")
    
    # Telephony Gateway
    TELEPHONY_API_KEY: str = os.getenv("TELEPHONY_API_KEY", "").strip()
    TELEPHONY_SENDER_ID: str = os.getenv("TELEPHONY_SENDER_ID", "GRAMVIKAS")
    QUIET_HOURS_START: str = os.getenv("QUIET_HOURS_START", "20:00")
    QUIET_HOURS_END: str = os.getenv("QUIET_HOURS_END", "07:00")
    
    # File storage
    UPLOADS_PATH: Path = UPLOADS_DIR
    SQLITE_PATH: Path = BASE_DIR / "backend" / "gramvikas_local.db"
    
    @property
    def is_demo_mode(self) -> bool:
        """Determines if the application runs in local zero-config demo store mode."""
        return not bool(self.SUPABASE_URL)

settings = Settings()

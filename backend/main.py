"""
GRAMVIKAS AI - Main FastAPI Application.
Unified Server: Serves REST API (/api/*), uploads (/uploads/*), and Frontend SPA/MPA routes.
"""

import os
import tempfile
from pathlib import Path
from fastapi import FastAPI, Request
from fastapi.responses import FileResponse, JSONResponse
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware

from backend.config import settings
from backend.routers import (
    auth,
    schemes,
    projects,
    reports,
    announcements,
    assistant,
    voice,
    admin,
    crop_doctor
)

BASE_DIR = Path(__file__).resolve().parent.parent
FRONTEND_DIR = BASE_DIR / "frontend"
UPLOADS_DIR = settings.UPLOADS_PATH

try:
    UPLOADS_DIR.mkdir(parents=True, exist_ok=True)
except Exception:
    UPLOADS_DIR = Path(tempfile.gettempdir()) / "uploads"
    try:
        UPLOADS_DIR.mkdir(parents=True, exist_ok=True)
    except Exception:
        pass

app = FastAPI(
    title="GRAMVIKAS AI API",
    description="Backend API and Unified Frontend Host for GRAMVIKAS AI",
    version="1.0.0"
)

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_origin_regex=r"https://.*\.vercel\.app",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)

# Trailing slash normalizer for API routes
@app.middleware("http")
async def normalize_api_trailing_slash(request: Request, call_next):
    # If request path starts with /api/ and ends with / (e.g. /api/schemes/),
    # rewrite scope['path'] to remove the trailing slash so FastAPI router matches cleanly.
    if request.url.path.startswith("/api/") and request.url.path.endswith("/") and len(request.url.path) > 5:
        request.scope["path"] = request.url.path.rstrip("/")
    return await call_next(request)


# Include API Routers
app.include_router(auth.router)
app.include_router(schemes.router)
app.include_router(projects.router)
app.include_router(reports.router)
app.include_router(announcements.router)
app.include_router(assistant.router)
app.include_router(voice.router)
app.include_router(admin.router)
app.include_router(crop_doctor.router)

# Mount Uploads directory safely
try:
    if UPLOADS_DIR.exists():
        app.mount("/uploads", StaticFiles(directory=str(UPLOADS_DIR)), name="uploads")
except Exception as e:
    print(f"[Main] Notice: Could not mount /uploads: {e}")

# Mount Frontend CSS and JS directories safely
try:
    if (FRONTEND_DIR / "css").exists():
        app.mount("/css", StaticFiles(directory=str(FRONTEND_DIR / "css")), name="css")
    if (FRONTEND_DIR / "js").exists():
        app.mount("/js", StaticFiles(directory=str(FRONTEND_DIR / "js")), name="js")
    if (FRONTEND_DIR / "assets").exists():
        app.mount("/assets", StaticFiles(directory=str(FRONTEND_DIR / "assets")), name="assets")
except Exception as e:
    print(f"[Main] Notice mounting static dirs: {e}")

# Health Check
@app.get("/api/health")
async def health_check():
    return {
        "status": "online",
        "app": "GRAMVIKAS AI",
        "version": settings.VERSION,
        "is_demo_mode": settings.is_demo_mode,
        "environment": settings.ENVIRONMENT
    }

# Entrypoint routes for HTML pages
@app.get("/login")
async def serve_login():
    login_path = FRONTEND_DIR / "login.html"
    if login_path.exists():
        return FileResponse(login_path)
    return JSONResponse(status_code=404, content={"detail": "login.html not found"})

@app.get("/register")
async def serve_register():
    reg_path = FRONTEND_DIR / "register.html"
    if reg_path.exists():
        return FileResponse(reg_path)
    return JSONResponse(status_code=404, content={"detail": "register.html not found"})

@app.get("/manifest.json")
async def serve_manifest():
    manifest_path = FRONTEND_DIR / "manifest.json"
    if manifest_path.exists():
        return FileResponse(manifest_path, media_type="application/manifest+json")
    return JSONResponse(status_code=404, content={"detail": "manifest.json not found"})

# SPA Catch-All Route for all frontend client navigation
@app.get("/{full_path:path}")
async def serve_spa_frontend(full_path: str):
    # If request is an API route or file that doesn't exist, return 404
    if full_path.startswith("api/") or full_path.startswith("uploads/"):
        return JSONResponse(status_code=404, content={"detail": "Not found"})
    
    app_html = FRONTEND_DIR / "app.html"
    if app_html.exists():
        return FileResponse(app_html)
    
    return JSONResponse(status_code=404, content={"detail": "Frontend app shell not found"})

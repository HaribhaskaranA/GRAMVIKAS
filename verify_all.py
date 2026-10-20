"""
GRAMVIKAS AI - Automated Comprehensive Route & API Verification Script
Tests all routes and API endpoints called across frontend views to guarantee ZERO 404s.
"""

import sys
from fastapi.testclient import TestClient
from backend.main import app

client = TestClient(app)

def test_endpoints():
    print("==================================================")
    print("STARTING GRAMVIKAS AI ROUTE & API VERIFICATION...")
    print("==================================================")

    # 1. Test Static HTML & Entrypoint Routes
    html_routes = [
        "/login",
        "/register",
        "/manifest.json",
        "/citizen/home",
        "/official/dashboard",
        "/verification-pending",
        "/admin/dashboard",
        "/schemes",
        "/projects",
        "/crop-doctor",
        "/assistant",
        "/report-issue",
        "/announcements",
        "/voice-service",
        "/map",
        "/notifications",
        "/profile",
        "/help"
    ]

    for route in html_routes:
        res = client.get(route)
        assert res.status_code == 200, f"HTML Route {route} failed with status {res.status_code}"
        print(f" [PASS] HTML Route: {route} -> HTTP 200")

    # 2. Test Core Health
    res = client.get("/api/health")
    assert res.status_code == 200, f"/api/health failed: {res.status_code}"
    print(f" [PASS] Health check: {res.json()['status']}")

    # 3. Test Auth as Citizen
    cit_login = client.post("/api/auth/login", json={
        "email": "citizen@gramvikas.in",
        "password": "Citizen@123"
    })
    assert cit_login.status_code == 200, f"Citizen login failed: {cit_login.text}"
    cit_token = cit_login.json()["access_token"]
    cit_headers = {"Authorization": f"Bearer {cit_token}"}
    print(" [PASS] Citizen login successful")

    # 4. Test Citizen View Endpoints (both without and with trailing slash)
    citizen_api_endpoints = [
        "/api/schemes",
        "/api/schemes/",
        "/api/schemes/saved",
        "/api/schemes/a1111111-aaaa-aaaa-aaaa-aaaaaaaaaaaa",
        "/api/projects",
        "/api/projects/",
        "/api/projects/b1111111-bbbb-bbbb-bbbb-bbbbbbbbbbbb",
        "/api/reports",
        "/api/reports/my",
        "/api/announcements",
        "/api/announcements/live-news",
        "/api/announcements/live-news?lang=ta&village=Melmaruvathur",
        "/api/announcements/?village=Melmaruvathur&phone=9840123456",
        "/api/crop-doctor/diseases",
        "/api/crop-doctor/catalog",
        "/api/voice/status",
        "/api/auth/me"
    ]

    for endpoint in citizen_api_endpoints:
        res = client.get(endpoint, headers=cit_headers)
        assert res.status_code in (200, 201), f"Endpoint {endpoint} failed with {res.status_code}: {res.text}"
        print(f" [PASS] Citizen API: {endpoint} -> HTTP {res.status_code}")

    # 5. Test Audio Stream Endpoint
    res = client.get("/api/voice/audio-stream?text=Test+audio+speech&lang=ta")
    assert res.status_code == 200, f"Audio stream failed: {res.status_code}"
    assert "audio/mpeg" in res.headers.get("content-type", ""), "Content type is not audio/mpeg"
    print(" [PASS] Audio Stream TTS Endpoint -> HTTP 200 (audio/mpeg)")

    # 6. Test Official Login & Official Endpoints
    off_login = client.post("/api/auth/login", json={
        "email": "official@gramvikas.in",
        "password": "Official@123"
    })
    assert off_login.status_code == 200, f"Official login failed: {off_login.text}"
    off_token = off_login.json()["access_token"]
    off_headers = {"Authorization": f"Bearer {off_token}"}
    print(" [PASS] Official login successful")

    res = client.get("/api/voice/call-log", headers=off_headers)
    assert res.status_code == 200, f"Official call log failed: {res.status_code}"
    print(" [PASS] Official API: /api/voice/call-log -> HTTP 200")

    # 7. Test Admin Login & Admin Endpoints
    adm_login = client.post("/api/auth/login", json={
        "email": "admin@gramvikas.in",
        "password": "Admin@123"
    })
    assert adm_login.status_code == 200, f"Admin login failed: {adm_login.text}"
    adm_token = adm_login.json()["access_token"]
    adm_headers = {"Authorization": f"Bearer {adm_token}"}
    print(" [PASS] Admin login successful")

    admin_endpoints = [
        "/api/admin/overview",
        "/api/admin/pending-officials",
        "/api/admin/audit-logs",
        "/api/voice/campaigns"
    ]
    for endpoint in admin_endpoints:
        res = client.get(endpoint, headers=adm_headers)
        assert res.status_code == 200, f"Admin endpoint {endpoint} failed with {res.status_code}: {res.text}"
        print(f" [PASS] Admin API: {endpoint} -> HTTP 200")

    print("==================================================")
    print("ALL ROUTES & APIS VERIFIED! ZERO 404 ERRORS!")
    print("==================================================")

if __name__ == "__main__":
    test_endpoints()

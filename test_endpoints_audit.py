import os
import re
from pathlib import Path
from fastapi.testclient import TestClient
from backend.main import app

BASE_DIR = Path(__file__).resolve().parent.parent
VIEWS_DIR = BASE_DIR / "frontend" / "js" / "views"

client = TestClient(app)

# Login to get tokens
token_citizen = client.post("/api/auth/login", json={"email": "citizen@gramvikas.in", "password": "Citizen@123"}).json().get("access_token")
token_official = client.post("/api/auth/login", json={"email": "official@gramvikas.in", "password": "Official@123"}).json().get("access_token")
token_admin = client.post("/api/auth/login", json={"email": "admin@gramvikas.in", "password": "Admin@123"}).json().get("access_token")

tokens = {
    "citizen": {"Authorization": f"Bearer {token_citizen}"},
    "official": {"Authorization": f"Bearer {token_official}"},
    "admin": {"Authorization": f"Bearer {token_admin}"}
}

print(f"Logged in: citizen={bool(token_citizen)}, official={bool(token_official)}, admin={bool(token_admin)}")

api_pattern = re.compile(r'api\.(get|post|put|delete|upload)\([\'\"`]([^\'\"`\?\$]+)')

endpoints_found = []

for js_file in VIEWS_DIR.glob("*.js"):
    text = js_file.read_text(encoding="utf-8")
    for m in api_pattern.finditer(text):
        method, url = m.group(1).upper(), m.group(2).strip()
        endpoints_found.append((js_file.name, method, url))

print(f"\n--- Found {len(endpoints_found)} API calls in views ---")

results = []
for fname, method, url in sorted(set(endpoints_found)):
    # Test with citizen, official, admin
    # Substitute dummy ID if url ends with /
    test_url = url
    if test_url.endswith("/"):
        test_url = test_url + "test-id"
    
    # Try calling with admin token first
    resp = client.request(method if method != "UPLOAD" else "POST", test_url, headers=tokens["admin"])
    results.append((fname, method, url, test_url, resp.status_code, resp.text[:100]))
    print(f"[{resp.status_code}] {method:6} {test_url:45} (from {fname})")

print("\n--- Summary of 404s ---")
notFound = [r for r in results if r[4] == 404]
for r in notFound:
    print(f"404 NOT FOUND: {r[1]} {r[2]} in {r[0]}")

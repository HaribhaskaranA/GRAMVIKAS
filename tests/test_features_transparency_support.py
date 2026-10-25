import sys
import os
import io
from fastapi.testclient import TestClient

# Ensure root directory is on sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from backend.main import app
from backend.database import db

client = TestClient(app)

def run_tests():
    print("=== STARTING FULL END-TO-END VERIFICATION SUITE ===")
    
    # Reset to pristine seed state so test is completely reproducible
    db.reset_to_seeds()

    # 1. Authenticate users
    citizen_login = client.post("/api/auth/login", json={"email": "citizen@gramvikas.in", "password": "Citizen@123"})
    assert citizen_login.status_code == 200, f"Citizen login failed: {citizen_login.text}"
    citizen_token = citizen_login.json()["access_token"]
    citizen_headers = {"Authorization": f"Bearer {citizen_token}"}
    print("[PASS] Citizen authenticated.")

    official_login = client.post("/api/auth/login", json={"email": "official@gramvikas.in", "password": "Official@123"})
    assert official_login.status_code == 200, f"Official login failed: {official_login.text}"
    official_token = official_login.json()["access_token"]
    official_headers = {"Authorization": f"Bearer {official_token}"}
    print("[PASS] Official authenticated.")

    admin_login = client.post("/api/auth/login", json={"email": "admin@gramvikas.in", "password": "Admin@123"})
    assert admin_login.status_code == 200, f"Admin login failed: {admin_login.text}"
    admin_token = admin_login.json()["access_token"]
    admin_headers = {"Authorization": f"Bearer {admin_token}"}
    print("[PASS] Admin authenticated.")

    # 2. Test Mandatory Photo Requirement on Official Status Update
    # Report c1111111-cccc-cccc-cccc-cccccccccccc currently has status "work_in_progress" and no completion photos
    resp_no_photo = client.post(
        "/api/reports/c1111111-cccc-cccc-cccc-cccccccccccc/status",
        headers=official_headers,
        json={
            "to_status": "resolution_proposed",
            "action_note": "Work completed without photo test",
            "completion_photos": []
        }
    )
    assert resp_no_photo.status_code == 400, f"Expected 400 when completing without photo, got: {resp_no_photo.status_code}"
    print(f"[PASS] Mandatory photo check enforced: {resp_no_photo.json()['detail']}")

    # 3. Official uploads work completion photo
    # Create a small valid test image in memory
    from PIL import Image
    img_buf = io.BytesIO()
    img = Image.new("RGB", (200, 200), color=(73, 109, 137))
    img.save(img_buf, format="JPEG")
    img_buf.seek(0)

    upload_resp = client.post(
        "/api/reports/upload-work-photo",
        headers=official_headers,
        files={"file": ("completion_evidence.jpg", img_buf, "image/jpeg")}
    )
    assert upload_resp.status_code == 200, f"Upload photo failed: {upload_resp.text}"
    photo_data = upload_resp.json()
    photo_url = photo_data["url"]
    print(f"[PASS] Work photo uploaded: {photo_url}")

    # Now update report status to resolution_proposed WITH completion photo
    resp_with_photo = client.post(
        "/api/reports/c1111111-cccc-cccc-cccc-cccccccccccc/status",
        headers=official_headers,
        json={
            "to_status": "resolution_proposed",
            "action_note": "Drainage desilting completed with photo proof",
            "work_description": "Desilted 400 meters of concrete stormwater drainage channel.",
            "completion_photos": [photo_url]
        }
    )
    assert resp_with_photo.status_code == 200, f"Status update failed: {resp_with_photo.text}"
    print("[PASS] Official marked report as completed with photo attached.")

    # 4. Citizen directly views completion photos without requiring admin approval
    photos_resp = client.get("/api/reports/c1111111-cccc-cccc-cccc-cccccccccccc/photos")
    assert photos_resp.status_code == 200, f"Fetch photos failed: {photos_resp.text}"
    photos_list = photos_resp.json()
    assert len(photos_list) >= 1, "Expected at least 1 photo for complaint"
    print(f"[PASS] Citizen direct photo visibility confirmed: {len(photos_list)} photos found.")

    # 5. Citizen raises verification question
    q_resp = client.post(
        "/api/reports/c1111111-cccc-cccc-cccc-cccccccccccc/questions",
        headers=citizen_headers,
        json={
            "question_text": "I need to verify whether the culvert grill was also desilted or only the open drain?",
            "photo_url": photo_url
        }
    )
    assert q_resp.status_code == 200, f"Create question failed: {q_resp.text}"
    q_data = q_resp.json()
    question_id = q_data["id"]
    assert q_data["status"] == "open"
    print(f"[PASS] Citizen raised verification question: ID={question_id}")

    # Citizen adds a follow-up reply to the question thread
    reply_resp = client.post(
        f"/api/reports/questions/{question_id}/reply",
        headers=citizen_headers,
        json={"message": "Please also confirm if the silt was cleared from the road shoulder."}
    )
    assert reply_resp.status_code == 200, f"Citizen reply failed: {reply_resp.text}"
    print("[PASS] Citizen posted follow-up reply.")

    # 6. Admin views photos & responds to question
    admin_photos_resp = client.get("/api/admin/complaint-photos", headers=admin_headers)
    assert admin_photos_resp.status_code == 200, f"Admin photos failed: {admin_photos_resp.text}"
    print(f"[PASS] Admin listed all complaint photos: {len(admin_photos_resp.json())} photos.")

    admin_q_resp = client.get("/api/admin/verification-questions", headers=admin_headers)
    assert admin_q_resp.status_code == 200, f"Admin questions failed: {admin_q_resp.text}"
    print(f"[PASS] Admin listed verification questions: {len(admin_q_resp.json())} questions.")

    admin_respond = client.post(
        f"/api/admin/verification-questions/{question_id}/respond",
        headers=admin_headers,
        json={
            "status": "answered",
            "admin_response": "Verified with Block Development Engineer: Both the culvert grill and silt from the road shoulder were completely cleared."
        }
    )
    assert admin_respond.status_code == 200, f"Admin respond failed: {admin_respond.text}"
    assert admin_respond.json()["status"] == "answered"
    print("[PASS] Admin responded to citizen question and updated status to answered.")

    # 7. Support System
    # Citizen creates support ticket
    sup_resp = client.post(
        "/api/support/tickets",
        headers=citizen_headers,
        json={
            "category": "technical_issue",
            "title": "Voice translation stops mid-sentence on Tamil dialect",
            "description": "While using the Voice Assistant in Madurantakam block, the audio stopped after 5 words.",
            "attachment_url": None
        }
    )
    assert sup_resp.status_code == 200, f"Support ticket creation failed: {sup_resp.text}"
    ticket_data = sup_resp.json()
    ticket_id = ticket_data["id"]
    ticket_num = ticket_data["ticket_number"]
    assert ticket_num.startswith("GV-SUP-"), f"Invalid ticket number format: {ticket_num}"
    print(f"[PASS] Citizen created support ticket: {ticket_num}")

    # Citizen lists own tickets
    my_tickets = client.get("/api/support/tickets/my", headers=citizen_headers)
    assert my_tickets.status_code == 200
    assert any(t["id"] == ticket_id for t in my_tickets.json())
    print("[PASS] Citizen verified own tickets under /my.")

    # Another official (or other non-admin user) trying to access this private ticket should get 403 Forbidden
    unauth_resp = client.get(f"/api/support/tickets/{ticket_id}", headers=official_headers)
    assert unauth_resp.status_code == 403, f"Expected 403, got {unauth_resp.status_code}"
    print("[PASS] Support ticket privacy verified: unauthorized user blocked with 403.")

    # Admin lists all support tickets
    admin_tickets = client.get("/api/support/admin/tickets", headers=admin_headers)
    assert admin_tickets.status_code == 200
    print(f"[PASS] Admin listed support tickets: {len(admin_tickets.json())} tickets found.")

    # Admin updates status and adds reply
    admin_reply = client.post(
        f"/api/support/tickets/{ticket_id}/reply",
        headers=admin_headers,
        json={"message": "We have increased the TTS buffer timeout and resolved the dialect phrase issue."}
    )
    assert admin_reply.status_code == 200
    print("[PASS] Admin posted reply to support ticket.")

    status_update = client.put(
        f"/api/support/admin/tickets/{ticket_id}/status",
        headers=admin_headers,
        json={"status": "resolved", "admin_notes": "Buffer latency resolved."}
    )
    assert status_update.status_code == 200
    assert status_update.json()["status"] == "resolved"
    print("[PASS] Admin updated support ticket status to resolved.")

    print("\n=== ALL E2E VERIFICATION TESTS PASSED SUCCESSFULLY! ===")

if __name__ == "__main__":
    run_tests()

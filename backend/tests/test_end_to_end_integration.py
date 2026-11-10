"""
End-to-End Frontend-Backend Integration Test for GadgetLens.
Verifies all 8 connectivity requirements from Section 7.D:
1. Frontend requests reach the correct backend endpoints.
2. Backend responses are received by the frontend.
3. Database queries execute successfully.
4. Actual laptop records are displayed.
5. Questionnaire responses reach the recommendation engine.
6. Recommendation results return correctly.
7. Authentication works end to end.
8. Errors are handled properly.
"""

import pytest
import sys
import os

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from app import create_app
from config import TestConfig
from extensions import db
from seed.seed_data import seed

@pytest.fixture
def app_and_client():
    app = create_app(TestConfig)
    with app.app_context():
        db.create_all()
        seed(app)
        client = app.test_client()
        yield app, client
        db.session.remove()
        db.drop_all()

def test_full_application_lifecycle_and_connectivity(app_and_client):
    app, client = app_and_client

    # 1. Static frontend delivery
    res_index = client.get("/")
    assert res_index.status_code == 200
    assert "Gadget" in res_index.get_data(as_text=True)

    res_api_js = client.get("/js/api.js")
    assert res_api_js.status_code == 200
    assert "GadgetLensAPI" in res_api_js.get_data(as_text=True)

    # 2. Guest Journey: browse, questionnaire, recommendations, compare
    # Check guest auth state
    res_me = client.get("/api/auth/me")
    assert res_me.status_code == 200
    assert res_me.get_json()["authenticated"] is False

    # Guest submits questionnaire
    guest_prefs = {
        "purpose": "work",
        "budgetMin": 50000,
        "budgetMax": 85000,
        "screenSize": "standard",
        "os": "windows",
        "priorityOrder": ["battery", "portability", "price", "performance", "storage", "display", "gaming"]
    }

    res_rec = client.post("/api/recommendations", json=guest_prefs)
    assert res_rec.status_code == 200
    rec_data = res_rec.get_json()
    assert rec_data["status"] == "success"
    assert rec_data["total_recommended"] > 0
    assert len(rec_data["recommended"]) > 0

    # Ensure real specs and deterministic calculations are returned
    top_pick = rec_data["recommended"][0]
    assert "brand" in top_pick
    assert "price" in top_pick
    assert "matchScore" in top_pick
    assert "whyText" in top_pick
    assert "breakdown" in top_pick
    assert top_pick["price"] <= 85000

    # Guest compares 2 laptops
    compare_ids = [top_pick["id"], rec_data["recommended"][1]["id"]]
    res_compare = client.post("/api/laptops/compare", json={"laptop_ids": compare_ids})
    assert res_compare.status_code == 200
    assert res_compare.get_json()["count"] == 2

    # Guest tries to save laptop -> gated (401)
    res_guest_save = client.post("/api/saved-laptops", json={"laptop_id": top_pick["id"]})
    assert res_guest_save.status_code == 401

    # Guest tries to submit feedback -> gated (401)
    res_guest_fb = client.post("/api/feedback", json={"easeOfUse": 5, "comment": "guest feedback"})
    assert res_guest_fb.status_code == 401

    # 3. User Journey: Register, Login, Save Preferences, Save Laptops, Submit Feedback
    res_reg = client.post("/api/auth/register", json={
        "username": "sarah_connor",
        "password": "Password2026"
    })
    assert res_reg.status_code == 201

    # Verify session active
    res_me_user = client.get("/api/auth/me")
    assert res_me_user.status_code == 200
    assert res_me_user.get_json()["authenticated"] is True
    assert res_me_user.get_json()["user"]["username"] == "sarah_connor"

    # User saves preferences to database
    res_save_pref = client.post("/api/preferences", json=guest_prefs)
    assert res_save_pref.status_code == 200

    # Retrieve saved preferences
    res_get_pref = client.get("/api/preferences")
    assert res_get_pref.status_code == 200
    assert res_get_pref.get_json()["preferences"]["purpose"] == "work"

    # User saves top laptop to favorites in MySQL
    res_save_lap = client.post("/api/saved-laptops", json={"laptop_id": top_pick["id"]})
    assert res_save_lap.status_code == 201

    # Retrieve user's saved laptops
    res_saved_list = client.get("/api/saved-laptops")
    assert res_saved_list.status_code == 200
    assert len(res_saved_list.get_json()["saved_laptops"]) == 1
    assert res_saved_list.get_json()["saved_laptops"][0]["laptop_id"] == top_pick["id"]

    # User removes saved laptop
    res_del_saved = client.delete(f"/api/saved-laptops/{top_pick['id']}")
    assert res_del_saved.status_code == 200

    res_saved_empty = client.get("/api/saved-laptops")
    assert len(res_saved_empty.get_json()["saved_laptops"]) == 0

    # User submits website feedback
    res_feedback = client.post("/api/feedback", json={
        "easeOfUse": 5,
        "explanationClarity": 5,
        "recommendationUsefulness": 5,
        "filteringEase": 5,
        "overallExperience": 5,
        "comment": "The priority weighting and specification transparency are incredible."
    })
    assert res_feedback.status_code == 201
    assert res_feedback.get_json()["status"] == "success"

    # 4. Chatbot and Glossary end-to-end
    res_chat = client.post("/api/chatbot", json={"question": "What is the difference between IPS and OLED?"})
    assert res_chat.status_code == 200
    assert len(res_chat.get_json()["reply"]) > 20

    res_glossary = client.get("/api/glossary/RAM")
    assert res_glossary.status_code == 200
    assert res_glossary.get_json()["term"]["term"] == "RAM"

    # 5. Logout
    res_logout = client.post("/api/auth/logout")
    assert res_logout.status_code == 200

    res_me_final = client.get("/api/auth/me")
    assert res_me_final.get_json()["authenticated"] is False


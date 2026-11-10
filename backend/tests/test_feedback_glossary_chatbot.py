import pytest
import sys
import os

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from app import create_app
from config import TestConfig
from extensions import db
from seed.seed_data import seed

@pytest.fixture
def client():
    app = create_app(TestConfig)
    with app.app_context():
        db.create_all()
        seed(app)
        yield app.test_client()
        db.session.remove()
        db.drop_all()

def test_glossary(client):
    res_all = client.get("/api/glossary")
    assert res_all.status_code == 200
    assert "RAM" in res_all.get_json()["glossary_map"]

    res_ram = client.get("/api/glossary/RAM")
    assert res_ram.status_code == 200
    assert "short-term memory" in res_ram.get_json()["term"]["simple_description"].lower()

def test_chatbot(client):
    # Technical question
    res_tech = client.post("/api/chatbot", json={"question": "What is the difference between IPS and OLED?"})
    assert res_tech.status_code == 200
    reply = res_tech.get_json()["reply"].lower()
    assert "oled" in reply or "ips" in reply

    # Recommendation rejection
    res_bias = client.post("/api/chatbot", json={"question": "Which laptop is the best one to buy?"})
    assert res_bias.status_code == 200
    reply_bias = res_bias.get_json()["reply"].lower()
    assert "cannot recommend" in reply_bias or "cannot pick" in reply_bias

def test_saved_laptops_and_feedback_auth_gating(client):
    # Guests cannot save
    res_guest_save = client.post("/api/saved-laptops", json={"laptop_id": 1})
    assert res_guest_save.status_code == 401

    # Guests cannot submit feedback
    res_guest_fb = client.post("/api/feedback", json={"easeOfUse": 5, "comment": "Nice site"})
    assert res_guest_fb.status_code == 401

    # Register & login
    client.post("/api/auth/register", json={"username": "alice", "password": "Password123"})

    # Now save laptop
    res_save = client.post("/api/saved-laptops", json={"laptop_id": 1})
    assert res_save.status_code in [200, 201]

    # Verify saved
    res_list = client.get("/api/saved-laptops")
    assert res_list.status_code == 200
    assert len(res_list.get_json()["saved_laptops"]) == 1

    # Remove saved laptop
    res_del = client.delete("/api/saved-laptops/1")
    assert res_del.status_code == 200

    # Submit feedback
    res_fb = client.post("/api/feedback", json={
        "easeOfUse": 5,
        "explanationClarity": 4,
        "recommendationUsefulness": 5,
        "filteringEase": 4,
        "overallExperience": 5,
        "comment": "Transparent and specification-first experience!"
    })
    assert res_fb.status_code == 201

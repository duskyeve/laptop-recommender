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

def test_hard_filtering_budget(client):
    res = client.post("/api/recommendations", json={
        "purpose": "general",
        "budgetMin": 40000,
        "budgetMax": 70000,
        "priorityOrder": ["price", "battery", "performance"]
    })
    assert res.status_code == 200
    data = res.get_json()
    assert data["status"] == "success"
    
    assert len(data["recommended"]) > 0
    for lap in data["recommended"]:
        assert lap["price"] <= 70000
        assert lap["passes_hard_filter"] is True

    assert len(data["excluded"]) > 0
    for lap in data["excluded"]:
        assert lap["price"] > 70000
        assert any("exceeds your maximum budget" in r.lower() for r in lap["whyNotReasons"])

def test_hard_filtering_os(client):
    res = client.post("/api/recommendations", json={
        "purpose": "general",
        "budgetMin": 30000,
        "budgetMax": 150000,
        "os": "linux",
        "priorityOrder": ["price", "performance"]
    })
    assert res.status_code == 200
    data = res.get_json()
    assert len(data["recommended"]) > 0
    for lap in data["recommended"]:
        assert lap["os"].lower() == "linux"

def test_priority_influence_on_ranking(client):
    res_battery = client.post("/api/recommendations", json={
        "purpose": "work",
        "budgetMin": 50000,
        "budgetMax": 95000,
        "priorityOrder": ["battery", "portability", "price", "performance", "storage", "display", "gaming"]
    })
    top_battery_pick = res_battery.get_json()["recommended"][0]

    res_perf = client.post("/api/recommendations", json={
        "purpose": "work",
        "budgetMin": 50000,
        "budgetMax": 95000,
        "priorityOrder": ["performance", "gaming", "storage", "display", "price", "battery", "portability"]
    })
    top_perf_pick = res_perf.get_json()["recommended"][0]

    # Different priorities produce distinct rankings
    assert top_battery_pick["id"] != top_perf_pick["id"]
    assert top_battery_pick["battery_hours"] >= top_perf_pick["battery_hours"]

def test_explanation_generation(client):
    res = client.post("/api/recommendations", json={
        "purpose": "work",
        "budgetMin": 50000,
        "budgetMax": 90000,
        "priorityOrder": ["battery", "portability"]
    })
    data = res.get_json()
    assert len(data["recommended"]) > 0
    top = data["recommended"][0]
    assert "whyText" in top
    assert len(top["whyText"]) > 10
    assert "breakdown" in top
    assert len(top["breakdown"]) >= 3

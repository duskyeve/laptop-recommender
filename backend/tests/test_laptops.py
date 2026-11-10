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

def test_get_laptops(client):
    res = client.get("/api/laptops")
    assert res.status_code == 200
    data = res.get_json()
    assert data["status"] == "success"
    assert data["total"] >= 6
    assert "processor" in data["laptops"][0]
    assert "gpu" in data["laptops"][0]

def test_search_and_filter(client):
    res = client.get("/api/laptops?q=Nordic")
    assert res.status_code == 200
    data = res.get_json()
    assert len(data["laptops"]) >= 1
    assert data["laptops"][0]["brand"] == "Nordic"

    res_ram = client.get("/api/laptops?ram=16")
    data_ram = res_ram.get_json()
    assert len(data_ram["laptops"]) >= 1
    for lap in data_ram["laptops"]:
        assert lap["ram_gb"] == 16

def test_laptop_details(client):
    res = client.get("/api/laptops/1")
    assert res.status_code == 200
    data = res.get_json()
    assert data["laptop"]["id"] == 1
    assert data["laptop"]["brand"] == "Nordic"

    res_404 = client.get("/api/laptops/9999")
    assert res_404.status_code == 404

def test_compare_laptops(client):
    res = client.post("/api/laptops/compare", json={"laptop_ids": [1, 2]})
    assert res.status_code == 200
    data = res.get_json()
    assert data["count"] == 2
    assert data["laptops"][0]["id"] == 1
    assert data["laptops"][1]["id"] == 2

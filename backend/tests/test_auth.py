import pytest
import sys
import os

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from app import create_app
from config import TestConfig
from extensions import db
from models import User

@pytest.fixture
def client():
    app = create_app(TestConfig)
    with app.app_context():
        db.create_all()
        yield app.test_client()
        db.session.remove()
        db.drop_all()

def test_register_success(client):
    res = client.post("/api/auth/register", json={
        "username": "testuser",
        "password": "Password123"
    })
    assert res.status_code == 201
    data = res.get_json()
    assert data["status"] == "success"
    assert data["user"]["username"] == "testuser"

def test_register_invalid_inputs(client):
    # Short username
    res1 = client.post("/api/auth/register", json={"username": "ab", "password": "Password123"})
    assert res1.status_code == 400

    # Short password
    res2 = client.post("/api/auth/register", json={"username": "validuser", "password": "Pass1"})
    assert res2.status_code == 400

    # Password without number
    res3 = client.post("/api/auth/register", json={"username": "validuser", "password": "PasswordOnly"})
    assert res3.status_code == 400

def test_duplicate_registration(client):
    client.post("/api/auth/register", json={"username": "dupuser", "password": "Password123"})
    res = client.post("/api/auth/register", json={"username": "dupuser", "password": "Password123"})
    assert res.status_code == 409
    assert "already exists" in res.get_json()["message"]

def test_login_flow(client):
    # Create user
    client.post("/api/auth/register", json={"username": "loginuser", "password": "Password123"})

    # Failed login
    res_bad = client.post("/api/auth/login", json={"username": "loginuser", "password": "WrongPassword1"})
    assert res_bad.status_code == 401

    # Successful login
    res_good = client.post("/api/auth/login", json={"username": "loginuser", "password": "Password123"})
    assert res_good.status_code == 200
    assert res_good.get_json()["status"] == "success"

    # Check /api/auth/me
    res_me = client.get("/api/auth/me")
    assert res_me.status_code == 200
    assert res_me.get_json()["authenticated"] is True
    assert res_me.get_json()["user"]["username"] == "loginuser"

    # Logout
    res_logout = client.post("/api/auth/logout")
    assert res_logout.status_code == 200

    # Check /api/auth/me after logout
    res_me_after = client.get("/api/auth/me")
    assert res_me_after.get_json()["authenticated"] is False


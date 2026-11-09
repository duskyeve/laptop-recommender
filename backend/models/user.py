from datetime import datetime, timezone
from ..extensions import db

class User(db.Model):
    __tablename__ = "users"

    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(50), unique=True, nullable=False, index=True)
    password_hash = db.Column(db.String(255), nullable=False)
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)

    preferences = db.relationship("UserPreference", back_populates="user", cascade="all, delete-orphan")
    saved_laptops = db.relationship("SavedLaptop", back_populates="user", cascade="all, delete-orphan")
    recommendation_history = db.relationship("RecommendationHistory", back_populates="user", cascade="all, delete-orphan")
    feedback = db.relationship("WebsiteFeedback", back_populates="user", cascade="all, delete-orphan")

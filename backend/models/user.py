from datetime import datetime, timezone
from werkzeug.security import generate_password_hash, check_password_hash
try:
    from extensions import db
except ImportError:
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

    def set_password(self, password):
        self.password_hash = generate_password_hash(password)

    def check_password(self, password):
        return check_password_hash(self.password_hash, password)

    def to_dict(self):
        return {
            "id": self.id,
            "username": self.username,
            "created_at": self.created_at.isoformat() if self.created_at else None
        }

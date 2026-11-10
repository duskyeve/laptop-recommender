from datetime import datetime, timezone
try:
    from extensions import db
except ImportError:
    from ..extensions import db

class UserPreference(db.Model):
    __tablename__ = "user_preferences"

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False, index=True)
    purpose = db.Column(db.String(50), nullable=True)
    gaming_level = db.Column(db.String(30), nullable=True)
    budget_min = db.Column(db.Integer, nullable=True)
    budget_max = db.Column(db.Integer, nullable=True)
    priority_order = db.Column(db.JSON, nullable=False)
    simple_preferences = db.Column(db.JSON, nullable=False)
    advanced_preferences = db.Column(db.JSON, nullable=False)
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)
    updated_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc), nullable=False)

    user = db.relationship("User", back_populates="preferences")

    def to_dict(self):
        return {
            "id": self.id,
            "user_id": self.user_id,
            "purpose": self.purpose,
            "gaming_level": self.gaming_level,
            "budget_min": self.budget_min,
            "budget_max": self.budget_max,
            "priority_order": self.priority_order,
            "simple_preferences": self.simple_preferences,
            "advanced_preferences": self.advanced_preferences,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None
        }

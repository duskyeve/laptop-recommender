from datetime import datetime, timezone
try:
    from extensions import db
except ImportError:
    from ..extensions import db

class RecommendationHistory(db.Model):
    __tablename__ = "recommendation_history"

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    timestamp = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)
    search_parameters = db.Column(db.JSON, nullable=False)

    user = db.relationship("User", back_populates="recommendation_history")

    def to_dict(self):
        return {
            "id": self.id,
            "user_id": self.user_id,
            "timestamp": self.timestamp.isoformat() if self.timestamp else None,
            "search_parameters": self.search_parameters
        }

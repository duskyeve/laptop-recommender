from datetime import datetime, timezone
try:
    from extensions import db
except ImportError:
    from ..extensions import db

class WebsiteFeedback(db.Model):
    __tablename__ = "website_feedback"

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    ease_of_use = db.Column(db.Integer, nullable=True)
    explanation_clarity = db.Column(db.Integer, nullable=True)
    recommendation_usefulness = db.Column(db.Integer, nullable=True)
    filtering_ease = db.Column(db.Integer, nullable=True)
    overall_experience = db.Column(db.Integer, nullable=True)
    comment = db.Column(db.Text, nullable=True)
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)

    user = db.relationship("User", back_populates="feedback")

    def to_dict(self):
        return {
            "id": self.id,
            "user_id": self.user_id,
            "ease_of_use": self.ease_of_use,
            "explanation_clarity": self.explanation_clarity,
            "recommendation_usefulness": self.recommendation_usefulness,
            "filtering_ease": self.filtering_ease,
            "overall_experience": self.overall_experience,
            "comment": self.comment,
            "created_at": self.created_at.isoformat() if self.created_at else None
        }

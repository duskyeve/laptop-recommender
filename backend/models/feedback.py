from datetime import datetime, timezone
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

from datetime import datetime, timezone
try:
    from extensions import db
except ImportError:
    from ..extensions import db

class SavedLaptop(db.Model):
    __tablename__ = "saved_laptops"
    __table_args__ = (db.UniqueConstraint("user_id", "laptop_id", name="uq_saved_user_laptop"),)

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    laptop_id = db.Column(db.Integer, db.ForeignKey("laptops.id", ondelete="CASCADE"), nullable=False)
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)

    user = db.relationship("User", back_populates="saved_laptops")
    laptop = db.relationship("Laptop", back_populates="saved_by")

    def to_dict(self):
        return {
            "id": self.id,
            "user_id": self.user_id,
            "laptop_id": self.laptop_id,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "laptop": self.laptop.to_dict() if self.laptop else None
        }

from ..extensions import db

class GPU(db.Model):
    __tablename__ = "gpus"

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(150), nullable=False)
    category = db.Column(db.String(80), nullable=False)
    performance_score = db.Column(db.Integer, nullable=True)
    description = db.Column(db.Text, nullable=True)

    laptops = db.relationship("Laptop", back_populates="gpu")

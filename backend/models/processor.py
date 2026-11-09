from ..extensions import db

class Processor(db.Model):
    __tablename__ = "processors"

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(150), nullable=False)
    manufacturer = db.Column(db.String(50), nullable=False)
    category = db.Column(db.String(50), nullable=False)
    performance_score = db.Column(db.Integer, nullable=True)
    generation = db.Column(db.String(50), nullable=True)
    explanation = db.Column(db.Text, nullable=True)

    laptops = db.relationship("Laptop", back_populates="processor")

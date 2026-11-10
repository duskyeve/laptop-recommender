try:
    from extensions import db
except ImportError:
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

    def to_dict(self):
        return {
            "id": self.id,
            "name": self.name,
            "manufacturer": self.manufacturer,
            "category": self.category,
            "performance_score": self.performance_score,
            "generation": self.generation,
            "explanation": self.explanation
        }

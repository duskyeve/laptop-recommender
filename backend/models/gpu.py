try:
    from extensions import db
except ImportError:
    from ..extensions import db

class GPU(db.Model):
    __tablename__ = "gpus"

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(150), nullable=False)
    manufacturer = db.Column(db.String(50), nullable=True)
    category = db.Column(db.String(80), nullable=False)
    gpu_type = db.Column(db.String(50), nullable=True)
    performance_score = db.Column(db.Integer, nullable=True)
    description = db.Column(db.Text, nullable=True)

    laptops = db.relationship("Laptop", back_populates="gpu")

    def to_dict(self):
        return {
            "id": self.id,
            "name": self.name,
            "manufacturer": self.manufacturer or ("Intel" if "Intel" in self.name else ("NVIDIA" if "RTX" in self.name or "GTX" in self.name else "Integrated")),
            "category": self.category,
            "gpu_type": self.gpu_type or self.category,
            "performance_score": self.performance_score,
            "description": self.description
        }

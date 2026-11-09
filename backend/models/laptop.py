from ..extensions import db

class Laptop(db.Model):
    __tablename__ = "laptops"

    id = db.Column(db.Integer, primary_key=True)
    brand = db.Column(db.String(80), nullable=False)
    model = db.Column(db.String(150), nullable=False)
    price = db.Column(db.Integer, nullable=False)
    processor_id = db.Column(db.Integer, db.ForeignKey("processors.id"), nullable=True)
    gpu_id = db.Column(db.Integer, db.ForeignKey("gpus.id"), nullable=True)
    ram = db.Column(db.Integer, nullable=False)  # GB
    storage = db.Column(db.Integer, nullable=False)  # GB
    storage_type = db.Column(db.String(30), nullable=False)
    display_size = db.Column(db.Numeric(4, 1), nullable=True)
    display_type = db.Column(db.String(50), nullable=True)
    resolution = db.Column(db.String(30), nullable=True)
    refresh_rate = db.Column(db.Integer, nullable=True)
    battery = db.Column(db.String(100), nullable=True)
    battery_hours = db.Column(db.Numeric(4, 1), nullable=True)
    weight = db.Column(db.Numeric(4, 2), nullable=True)  # kg
    os = db.Column(db.String(50), nullable=True)
    upgradeability = db.Column(db.String(150), nullable=True)
    connectivity = db.Column(db.Text, nullable=True)
    image_url = db.Column(db.String(500), nullable=True)

    processor = db.relationship("Processor", back_populates="laptops")
    gpu = db.relationship("GPU", back_populates="laptops")
    saved_by = db.relationship("SavedLaptop", back_populates="laptop", cascade="all, delete-orphan")

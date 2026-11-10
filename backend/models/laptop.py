try:
    from extensions import db
except ImportError:
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

    def to_dict(self):
        proc_name = self.processor.name if self.processor else "Standard Processor"
        if self.processor and self.processor.generation:
            proc_full = f"{self.processor.name} ({self.processor.generation})"
        else:
            proc_full = proc_name

        gpu_name = self.gpu.name if self.gpu else "Integrated Graphics"

        # Format display size as string like '14"' or '15.6"'
        disp_size_str = f'{float(self.display_size):.1f}"' if self.display_size is not None else ""
        if disp_size_str.endswith('.0"'):
            disp_size_str = f'{int(float(self.display_size))}"'

        ram_str = f"{self.ram} GB" if self.ram else "8 GB"
        storage_str = f"{self.storage} GB" if self.storage and self.storage < 1000 else (f"{self.storage // 1024} TB" if self.storage and self.storage >= 1024 else f"{self.storage} GB")
        weight_str = f"{float(self.weight):.2f} kg" if self.weight is not None else ""
        refresh_str = f"{self.refresh_rate} Hz" if self.refresh_rate else "60 Hz"

        return {
            "id": self.id,
            "brand": self.brand,
            "model": self.model,
            "name": f"{self.brand} {self.model}",
            "price": self.price,
            "processor_id": self.processor_id,
            "processor": proc_full,
            "processor_category": self.processor.category if self.processor else "Mid-range",
            "processor_details": self.processor.to_dict() if self.processor else None,
            "gpu_id": self.gpu_id,
            "gpu": gpu_name,
            "gpu_category": self.gpu.category if self.gpu else "Integrated",
            "gpu_details": self.gpu.to_dict() if self.gpu else None,
            "ram": ram_str,
            "ram_gb": self.ram,
            "storage": storage_str,
            "storage_gb": self.storage,
            "storageType": self.storage_type,
            "storage_type": self.storage_type,
            "displaySize": disp_size_str,
            "display_size": float(self.display_size) if self.display_size is not None else None,
            "displayType": self.display_type or "IPS",
            "display_type": self.display_type or "IPS",
            "resolution": self.resolution or "1920×1080",
            "refreshRate": refresh_str,
            "refresh_rate": self.refresh_rate or 60,
            "battery": self.battery or f"Up to {int(float(self.battery_hours or 8))} hours",
            "battery_hours": float(self.battery_hours) if self.battery_hours is not None else 8.0,
            "weight": weight_str,
            "weight_kg": float(self.weight) if self.weight is not None else 1.5,
            "os": self.os or "Windows",
            "upgradeability": self.upgradeability or "Not specified",
            "connectivity": self.connectivity or "USB-C, USB-A, Wi-Fi",
            "image_url": self.image_url
        }

try:
    from extensions import db
except ImportError:
    from ..extensions import db

class TechGlossary(db.Model):
    __tablename__ = "tech_glossary"

    id = db.Column(db.Integer, primary_key=True)
    term = db.Column(db.String(80), unique=True, nullable=False, index=True)
    simple_description = db.Column(db.Text, nullable=False)
    detailed_description = db.Column(db.Text, nullable=True)
    category = db.Column(db.String(80), nullable=True)

    def to_dict(self):
        return {
            "id": self.id,
            "term": self.term,
            "simple_description": self.simple_description,
            "detailed_description": self.detailed_description,
            "category": self.category
        }

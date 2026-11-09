from ..extensions import db

class TechGlossary(db.Model):
    __tablename__ = "tech_glossary"

    id = db.Column(db.Integer, primary_key=True)
    term = db.Column(db.String(80), unique=True, nullable=False, index=True)
    simple_description = db.Column(db.Text, nullable=False)
    detailed_description = db.Column(db.Text, nullable=True)
    category = db.Column(db.String(80), nullable=True)

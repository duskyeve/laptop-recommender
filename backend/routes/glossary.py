from flask import Blueprint, jsonify
try:
    from models import TechGlossary
except ImportError:
    from ..models import TechGlossary

glossary_bp = Blueprint("glossary", __name__)

@glossary_bp.get("")
def get_all_terms():
    terms = TechGlossary.query.order_by(TechGlossary.term.asc()).all()
    terms_map = {t.term: t.simple_description for t in terms}
    return jsonify({
        "status": "success",
        "count": len(terms),
        "glossary_map": terms_map,
        "terms": [t.to_dict() for t in terms]
    }), 200

@glossary_bp.get("/<string:term>")
def get_term_definition(term):
    clean_term = term.strip()
    entry = TechGlossary.query.filter(TechGlossary.term.ilike(clean_term)).first()
    if not entry:
        return jsonify({"status": "error", "message": f"Definition for '{term}' not found."}), 404

    return jsonify({"status": "success", "term": entry.to_dict()}), 200

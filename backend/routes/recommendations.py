from flask import Blueprint, request, jsonify, session
try:
    from extensions import db
    from models import Laptop, UserPreference, RecommendationHistory
    from services.recommendation_engine import recommend_laptops
except ImportError:
    from ..extensions import db
    from ..models import Laptop, UserPreference, RecommendationHistory
    from ..services.recommendation_engine import recommend_laptops

recommendations_bp = Blueprint("recommendations", __name__)

@recommendations_bp.post("")
def generate_recommendations():
    preferences = request.get_json(silent=True) or {}
    all_laptops = Laptop.query.all()

    recommended, excluded = recommend_laptops(all_laptops, preferences)

    # If logged in and save_history explicitly requested, record in history
    user_id = session.get("user_id") or request.headers.get("X-User-Id")
    if user_id and preferences.get("save_history"):
        try:
            history = RecommendationHistory(user_id=int(user_id), search_parameters=preferences)
            db.session.add(history)
            db.session.commit()
        except Exception:
            db.session.rollback()

    return jsonify({
        "status": "success",
        "recommended": recommended,
        "excluded": excluded,
        "total_recommended": len(recommended),
        "total_evaluated": len(all_laptops)
    }), 200

@recommendations_bp.get("")
def get_recommendations_from_saved():
    user_id = session.get("user_id") or request.headers.get("X-User-Id")
    preferences = None
    if user_id:
        user_pref = UserPreference.query.filter_by(user_id=int(user_id)).order_by(UserPreference.updated_at.desc()).first()
        if user_pref:
            preferences = {
                "purpose": user_pref.purpose,
                "gamingLevel": user_pref.gaming_level,
                "budgetMin": user_pref.budget_min,
                "budgetMax": user_pref.budget_max,
                "priorityOrder": user_pref.priority_order,
                "simple_preferences": user_pref.simple_preferences,
                "advanced": user_pref.advanced_preferences,
                **(user_pref.simple_preferences or {})
            }

    if not preferences:
        preferences = {
            "purpose": "general",
            "budgetMin": 40000,
            "budgetMax": 100000,
            "priorityOrder": ["performance", "battery", "price", "portability", "storage", "display", "gaming"]
        }

    all_laptops = Laptop.query.all()
    recommended, excluded = recommend_laptops(all_laptops, preferences)

    return jsonify({
        "status": "success",
        "preferences_source": "saved_user_preferences" if user_id else "default",
        "recommended": recommended,
        "excluded": excluded,
        "total_recommended": len(recommended),
        "total_evaluated": len(all_laptops)
    }), 200

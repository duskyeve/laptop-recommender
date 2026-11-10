from flask import Blueprint, request, jsonify, session
try:
    from extensions import db
    from models import UserPreference
except ImportError:
    from ..extensions import db
    from ..models import UserPreference

preferences_bp = Blueprint("preferences", __name__)

def _get_current_user_id():
    uid = session.get("user_id") or request.headers.get("X-User-Id")
    return int(uid) if uid else None

@preferences_bp.post("")
def save_preferences():
    data = request.get_json(silent=True) or {}
    user_id = _get_current_user_id()

    if not user_id:
        return jsonify({
            "status": "success",
            "mode": "guest",
            "message": "Preferences handled in guest session.",
            "preferences": data
        }), 200

    purpose = data.get("purpose")
    gaming_level = data.get("gamingLevel") or data.get("gaming_level")
    budget_min = data.get("budgetMin") or data.get("budget_min")
    budget_max = data.get("budgetMax") or data.get("budget_max")
    priority_order = data.get("priorityOrder") or data.get("priority_order") or []
    advanced = data.get("advanced") or data.get("advanced_preferences") or {}

    simple = {
        "screenSize": data.get("screenSize"),
        "displayQuality": data.get("displayQuality"),
        "os": data.get("os"),
        "portability": data.get("portability"),
        "batteryLife": data.get("batteryLife")
    }

    pref = UserPreference.query.filter_by(user_id=user_id).first()
    if not pref:
        pref = UserPreference(
            user_id=user_id,
            purpose=purpose,
            gaming_level=gaming_level,
            budget_min=budget_min,
            budget_max=budget_max,
            priority_order=priority_order,
            simple_preferences=simple,
            advanced_preferences=advanced
        )
        db.session.add(pref)
    else:
        pref.purpose = purpose
        pref.gaming_level = gaming_level
        pref.budget_min = budget_min
        pref.budget_max = budget_max
        pref.priority_order = priority_order
        pref.simple_preferences = simple
        pref.advanced_preferences = advanced

    db.session.commit()
    return jsonify({"status": "success", "preferences": pref.to_dict()}), 200

@preferences_bp.get("")
def get_preferences():
    user_id = _get_current_user_id()
    if not user_id:
        return jsonify({"status": "error", "message": "Authentication required to retrieve saved preferences."}), 401

    pref = UserPreference.query.filter_by(user_id=user_id).order_by(UserPreference.updated_at.desc()).first()
    if not pref:
        return jsonify({"status": "success", "preferences": None}), 200

    return jsonify({"status": "success", "preferences": pref.to_dict()}), 200

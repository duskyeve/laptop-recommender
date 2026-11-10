from flask import Blueprint, request, jsonify, session
try:
    from extensions import db
    from models import WebsiteFeedback
except ImportError:
    from ..extensions import db
    from ..models import WebsiteFeedback

feedback_bp = Blueprint("feedback", __name__)

def _get_current_user_id():
    uid = session.get("user_id") or request.headers.get("X-User-Id")
    return int(uid) if uid else None

@feedback_bp.post("")
def submit_feedback():
    user_id = _get_current_user_id()
    if not user_id:
        return jsonify({"status": "error", "message": "Sign in required to submit feedback."}), 401

    data = request.get_json(silent=True) or {}
    
    ease_of_use = data.get("easeOfUse") or data.get("ease_of_use")
    explanation_clarity = data.get("explanationClarity") or data.get("explanation_clarity")
    recommendation_usefulness = data.get("recommendationUsefulness") or data.get("recommendation_usefulness")
    filtering_ease = data.get("filteringEase") or data.get("filtering_ease")
    overall_experience = data.get("overallExperience") or data.get("overall_experience")
    comment = (data.get("comment") or "").strip()

    feedback = WebsiteFeedback(
        user_id=user_id,
        ease_of_use=int(ease_of_use) if ease_of_use else None,
        explanation_clarity=int(explanation_clarity) if explanation_clarity else None,
        recommendation_usefulness=int(recommendation_usefulness) if recommendation_usefulness else None,
        filtering_ease=int(filtering_ease) if filtering_ease else None,
        overall_experience=int(overall_experience) if overall_experience else None,
        comment=comment if comment else None
    )

    db.session.add(feedback)
    db.session.commit()

    return jsonify({"status": "success", "message": "Feedback submitted successfully.", "feedback": feedback.to_dict()}), 201

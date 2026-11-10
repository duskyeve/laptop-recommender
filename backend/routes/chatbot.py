from flask import Blueprint, request, jsonify
try:
    from services.chatbot_service import answer_technical_question
except ImportError:
    from ..services.chatbot_service import answer_technical_question

chatbot_bp = Blueprint("chatbot", __name__)

@chatbot_bp.post("")
def handle_chat():
    data = request.get_json(silent=True) or {}
    question = data.get("question") or data.get("message") or ""
    reply = answer_technical_question(question)
    return jsonify({"status": "success", "reply": reply}), 200

from flask import Blueprint, request, jsonify, session
try:
    from extensions import db
    from models import User
except ImportError:
    from ..extensions import db
    from ..models import User

auth_bp = Blueprint("auth", __name__)

@auth_bp.post("/register")
def register():
    data = request.get_json(silent=True) or {}
    username = (data.get("username") or "").strip()
    password = data.get("password") or ""

    if not username or len(username) < 3:
        return jsonify({"status": "error", "message": "Username must be at least 3 characters long."}), 400

    if not password or len(password) < 8:
        return jsonify({"status": "error", "message": "Password must be at least 8 characters long."}), 400

    has_num = any(c.isdigit() for c in password)
    has_upper = any(c.isupper() for c in password)
    if not (has_num and has_upper):
        return jsonify({"status": "error", "message": "Password must include at least one number and one uppercase letter."}), 400

    existing_user = User.query.filter_by(username=username).first()
    if existing_user:
        return jsonify({"status": "error", "message": "A user with this username already exists."}), 409

    user = User(username=username)
    user.set_password(password)
    db.session.add(user)
    db.session.commit()

    session["user_id"] = user.id
    session["username"] = user.username

    return jsonify({"status": "success", "user": user.to_dict()}), 201

@auth_bp.post("/login")
def login():
    data = request.get_json(silent=True) or {}
    username = (data.get("username") or "").strip()
    password = data.get("password") or ""

    if not username or not password:
        return jsonify({"status": "error", "message": "Username and password are required."}), 400

    user = User.query.filter_by(username=username).first()
    if not user or not user.check_password(password):
        return jsonify({"status": "error", "message": "Invalid username or password."}), 401

    session["user_id"] = user.id
    session["username"] = user.username

    return jsonify({"status": "success", "user": user.to_dict()}), 200

@auth_bp.post("/logout")
def logout():
    session.clear()
    return jsonify({"status": "success", "message": "Logged out successfully."}), 200

@auth_bp.get("/me")
def get_current_user():
    user_id = session.get("user_id") or request.headers.get("X-User-Id")
    if not user_id:
        return jsonify({"authenticated": False, "user": None}), 200

    user = db.session.get(User, int(user_id))
    if not user:
        session.clear()
        return jsonify({"authenticated": False, "user": None}), 200

    return jsonify({"authenticated": True, "user": user.to_dict()}), 200

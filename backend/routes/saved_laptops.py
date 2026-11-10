from flask import Blueprint, request, jsonify, session
try:
    from extensions import db
    from models import SavedLaptop, Laptop
except ImportError:
    from ..extensions import db
    from ..models import SavedLaptop, Laptop

saved_laptops_bp = Blueprint("saved_laptops", __name__)

def _get_current_user_id():
    uid = session.get("user_id") or request.headers.get("X-User-Id")
    return int(uid) if uid else None

@saved_laptops_bp.get("")
def get_saved_laptops():
    user_id = _get_current_user_id()
    if not user_id:
        return jsonify({"status": "error", "message": "Authentication required to view saved laptops."}), 401

    saved = SavedLaptop.query.filter_by(user_id=user_id).order_by(SavedLaptop.created_at.desc()).all()
    return jsonify({
        "status": "success",
        "count": len(saved),
        "saved_laptops": [s.to_dict() for s in saved]
    }), 200

@saved_laptops_bp.post("")
def save_laptop():
    user_id = _get_current_user_id()
    if not user_id:
        return jsonify({"status": "error", "message": "Authentication required to save laptops."}), 401

    data = request.get_json(silent=True) or {}
    laptop_id = data.get("laptop_id")
    if not laptop_id:
        return jsonify({"status": "error", "message": "laptop_id is required."}), 400

    laptop = db.session.get(Laptop, laptop_id)
    if not laptop:
        return jsonify({"status": "error", "message": "Laptop not found."}), 404

    existing = SavedLaptop.query.filter_by(user_id=user_id, laptop_id=laptop_id).first()
    if existing:
        return jsonify({"status": "success", "message": "Laptop already saved.", "saved_laptop": existing.to_dict()}), 200

    saved = SavedLaptop(user_id=user_id, laptop_id=laptop_id)
    db.session.add(saved)
    db.session.commit()

    return jsonify({"status": "success", "message": "Laptop saved successfully.", "saved_laptop": saved.to_dict()}), 201

@saved_laptops_bp.delete("/<int:id>")
def remove_saved_laptop(id):
    user_id = _get_current_user_id()
    if not user_id:
        return jsonify({"status": "error", "message": "Authentication required."}), 401

    saved = SavedLaptop.query.filter_by(user_id=user_id, laptop_id=id).first()
    if not saved:
        saved = SavedLaptop.query.filter_by(user_id=user_id, id=id).first()

    if not saved:
        return jsonify({"status": "error", "message": "Saved laptop not found."}), 404

    db.session.delete(saved)
    db.session.commit()

    return jsonify({"status": "success", "message": "Laptop removed from saved list."}), 200

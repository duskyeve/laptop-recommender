from flask import Blueprint, request, jsonify
try:
    from extensions import db
    from models import Laptop, Processor, GPU
except ImportError:
    from ..extensions import db
    from ..models import Laptop, Processor, GPU

laptops_bp = Blueprint("laptops", __name__)

@laptops_bp.get("")
def get_laptops():
    query = Laptop.query

    # Search keyword
    q = request.args.get("q", "").strip()
    if q:
        search_filter = (
            Laptop.brand.ilike(f"%{q}%") |
            Laptop.model.ilike(f"%{q}%") |
            Laptop.os.ilike(f"%{q}%")
        )
        query = query.filter(search_filter)

    # Brand filter
    brands = request.args.get("brand")
    if brands:
        brand_list = [b.strip() for b in brands.split(",") if b.strip()]
        if brand_list:
            query = query.filter(Laptop.brand.in_(brand_list))

    # RAM filter
    ram_param = request.args.get("ram")
    if ram_param:
        ram_list = []
        for r in ram_param.split(","):
            r_str = r.lower().replace("gb", "").replace("+", "").strip()
            if r_str.isdigit():
                ram_list.append(int(r_str))
        if ram_list:
            query = query.filter(Laptop.ram.in_(ram_list))

    # Storage filter
    storage_param = request.args.get("storage")
    if storage_param:
        storage_vals = []
        for s in storage_param.split(","):
            s_clean = s.lower().strip()
            if "tb" in s_clean:
                storage_vals.append(1024)
            elif "512" in s_clean:
                storage_vals.append(512)
            elif "256" in s_clean:
                storage_vals.append(256)
        if storage_vals:
            query = query.filter(Laptop.storage.in_(storage_vals))

    # OS filter
    os_param = request.args.get("os")
    if os_param:
        os_list = [o.strip() for o in os_param.split(",") if o.strip()]
        if os_list:
            query = query.filter(Laptop.os.in_(os_list))

    # Sorting
    sort = request.args.get("sort", "").lower()
    if sort == "price_asc":
        query = query.order_by(Laptop.price.asc())
    elif sort == "price_desc":
        query = query.order_by(Laptop.price.desc())
    elif sort == "ram_desc":
        query = query.order_by(Laptop.ram.desc())
    elif sort == "name_asc":
        query = query.order_by(Laptop.brand.asc(), Laptop.model.asc())
    else:
        query = query.order_by(Laptop.id.asc())

    laptops = query.all()
    return jsonify({
        "status": "success",
        "total": len(laptops),
        "laptops": [l.to_dict() for l in laptops]
    }), 200

@laptops_bp.get("/<int:id>")
def get_laptop(id):
    laptop = db.session.get(Laptop, id)
    if not laptop:
        return jsonify({"status": "error", "message": "Laptop not found."}), 404
    return jsonify({"status": "success", "laptop": laptop.to_dict()}), 200

@laptops_bp.post("/compare")
def compare_laptops():
    data = request.get_json(silent=True) or {}
    laptop_ids = data.get("laptop_ids") or []
    if not laptop_ids:
        ids_param = request.args.get("ids", "")
        if ids_param:
            laptop_ids = [int(i.strip()) for i in ids_param.split(",") if i.strip().isdigit()]

    if not laptop_ids:
        return jsonify({"status": "error", "message": "No laptop IDs provided for comparison."}), 400

    laptops = Laptop.query.filter(Laptop.id.in_(laptop_ids)).all()
    id_map = {l.id: l for l in laptops}
    ordered = [id_map[lid].to_dict() for lid in laptop_ids if lid in id_map]

    return jsonify({"status": "success", "laptops": ordered, "count": len(ordered)}), 200

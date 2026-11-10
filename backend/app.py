import os
from flask import Flask, jsonify, send_from_directory
from config import Config
from extensions import db, cors, migrate
from models import User, Processor, GPU, Laptop, TechGlossary, UserPreference, SavedLaptop, RecommendationHistory, WebsiteFeedback
from routes import register_blueprints

def create_app(config_class=Config):
    root_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
    
    app = Flask(__name__, static_folder=root_dir, static_url_path="")
    app.config.from_object(config_class)

    # Initialize extensions
    db.init_app(app)
    cors.init_app(
        app,
        resources={r"/api/*": {
            "origins": [
                r"^http://localhost(:\d+)?$",
                r"^http://127\.0\.0\.1(:\d+)?$",
                r"^http://\[::1\](:\d+)?$",
                r"^https?://.*"
            ],
            "supports_credentials": True,
            "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
            "allow_headers": ["Content-Type", "Authorization", "Accept", "X-Requested-With", "X-User-Id"]
        }}
    )
    migrate.init_app(app, db)

    # Register modular API blueprints
    register_blueprints(app)

    @app.get("/api/health")
    def health():
        db_status = "connected"
        try:
            db.session.execute(db.text("SELECT 1"))
        except Exception as e:
            db_status = f"unavailable: {str(e)}"
        
        uri = str(app.config.get("SQLALCHEMY_DATABASE_URI", ""))
        dialect = uri.split(":")[0] if ":" in uri else "unknown"
        return jsonify({
            "status": "ok",
            "database": db_status,
            "dialect": dialect,
            "database_configured": True
        }), 200

    # Serve static frontend files
    @app.get("/")
    def serve_index():
        return send_from_directory(root_dir, "index.html")

    @app.get("/<path:filename>")
    def serve_static(filename):
        target = os.path.join(root_dir, filename)
        if os.path.exists(target) and not os.path.isdir(target):
            return send_from_directory(root_dir, filename)
        return jsonify({"status": "error", "message": "Resource not found"}), 404

    # Global Error Handlers
    @app.errorhandler(400)
    def bad_request(e):
        return jsonify({"status": "error", "message": "Bad request"}), 400

    @app.errorhandler(404)
    def not_found(e):
        return jsonify({"status": "error", "message": "Endpoint not found"}), 404

    @app.errorhandler(500)
    def server_error(e):
        return jsonify({"status": "error", "message": "An internal server error occurred"}), 500

    return app

app = create_app()

def auto_seed_if_needed():
    """Initializes tables and seeds data on startup if database is empty."""
    with app.app_context():
        db.create_all()
        if Laptop.query.count() == 0:
            from seed.seed_data import seed
            seed()

try:
    auto_seed_if_needed()
except Exception as e:
    print(f"[GadgetLens] Seed notice: {e}")

if __name__ == "__main__":
    app.run(debug=True, use_reloader=False, host="0.0.0.0", port=5000)

from flask import Flask
from config import Config
from extensions import db
from models import User, Processor, GPU, Laptop, TechGlossary, UserPreference, SavedLaptop, RecommendationHistory, WebsiteFeedback


def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)
    db.init_app(app)

    @app.get("/api/health")
    def health():
        return {"status": "ok", "database": "configured"}

    return app


app = create_app()

if __name__ == "__main__":
    app.run(debug=True)

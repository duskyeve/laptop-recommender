from .auth import auth_bp
from .laptops import laptops_bp
from .recommendations import recommendations_bp
from .preferences import preferences_bp
from .saved_laptops import saved_laptops_bp
from .feedback import feedback_bp
from .chatbot import chatbot_bp
from .glossary import glossary_bp

def register_blueprints(app):
    app.register_blueprint(auth_bp, url_prefix="/api/auth")
    app.register_blueprint(laptops_bp, url_prefix="/api/laptops")
    app.register_blueprint(recommendations_bp, url_prefix="/api/recommendations")
    app.register_blueprint(preferences_bp, url_prefix="/api/preferences")
    app.register_blueprint(saved_laptops_bp, url_prefix="/api/saved-laptops")
    app.register_blueprint(feedback_bp, url_prefix="/api/feedback")
    app.register_blueprint(chatbot_bp, url_prefix="/api/chatbot")
    app.register_blueprint(glossary_bp, url_prefix="/api/glossary")


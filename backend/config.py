import os
import socket
from dotenv import load_dotenv

load_dotenv()

def is_mysql_reachable(host, port, timeout=0.8):
    try:
        sock = socket.create_connection((host, int(port)), timeout=timeout)
        sock.close()
        return True
    except Exception:
        return False

class Config:
    SECRET_KEY = os.getenv("SECRET_KEY", "gadgetlens-dev-secret-key-change-in-production")
    
    # Priority: explicit DATABASE_URL
    explicit_url = os.getenv("DATABASE_URL")
    if explicit_url:
        SQLALCHEMY_DATABASE_URI = explicit_url
    else:
        db_user = os.getenv("DB_USER", "root")
        db_password = os.getenv("DB_PASSWORD", "")
        db_host = os.getenv("DB_HOST", "localhost")
        db_port = os.getenv("DB_PORT", "3306")
        db_name = os.getenv("DB_NAME", "gadgetlens")
        
        # Check if MySQL is actively reachable on the configured host:port
        if is_mysql_reachable(db_host, db_port):
            SQLALCHEMY_DATABASE_URI = f"mysql+pymysql://{db_user}:{db_password}@{db_host}:{db_port}/{db_name}"
        else:
            # Fallback to local SQLite so application works out-of-the-box when MySQL server is not active
            sqlite_path = os.getenv("SQLITE_PATH", os.path.abspath(os.path.join(os.path.dirname(__file__), "gadgetlens.db")))
            SQLALCHEMY_DATABASE_URI = f"sqlite:///{sqlite_path}"
            SQLALCHEMY_ENGINE_OPTIONS = {
                "connect_args": {"check_same_thread": False, "timeout": 20}
            }

    SQLALCHEMY_TRACK_MODIFICATIONS = False
    
    # Session cookie configurations
    SESSION_COOKIE_HTTPONLY = True
    SESSION_COOKIE_SAMESITE = "Lax"
    SESSION_COOKIE_SECURE = os.getenv("FLASK_ENV") == "production"

class TestConfig(Config):
    TESTING = True
    SQLALCHEMY_DATABASE_URI = "sqlite:///:memory:"
    WTF_CSRF_ENABLED = False
    SECRET_KEY = "test-secret-key"

import os
from dotenv import load_dotenv

load_dotenv()

class Config:
    """Базова конфігурація для додатку."""
    SECRET_KEY = os.getenv('SECRET_KEY', 'dev_secret_key')
    SQLALCHEMY_DATABASE_URI = f"mysql+pymysql://{os.getenv('DB_USER', 'root')}:{os.getenv('DB_PASSWORD', '')}@{os.getenv('DB_HOST', 'localhost')}/{os.getenv('DB_NAME', 'personal_finance_manager')}"
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    JWT_SECRET_KEY = os.getenv('JWT_SECRET_KEY', 'dev_jwt_key')
    JWT_ACCESS_TOKEN_EXPIRES = int(os.getenv('JWT_ACCESS_TOKEN_EXPIRES', 3600))
    EXCHANGE_RATE_API_KEY = os.getenv('EXCHANGE_RATE_API_KEY', '')

class DevelopmentConfig(Config):
    """Конфігурація для розробки."""
    DEBUG = True

class ProductionConfig(Config):
    """Конфігурація для продакшн."""
    DEBUG = False
    
    # В продакшні використовуємо сильніші ключі
    SECRET_KEY = os.getenv('SECRET_KEY')
    JWT_SECRET_KEY = os.getenv('JWT_SECRET_KEY')

class TestingConfig(Config):
    """Конфігурація для тестування."""
    TESTING = True
    SQLALCHEMY_DATABASE_URI = 'sqlite:///:memory:'
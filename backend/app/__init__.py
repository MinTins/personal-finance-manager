from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_jwt_extended import JWTManager
from flask_cors import CORS
import os
from dotenv import load_dotenv

# Завантажити змінні оточення з .env файлу
load_dotenv()

# Ініціалізація БД
db = SQLAlchemy()

# Ініціалізація JWT
jwt = JWTManager()

def create_app():
    # Ініціалізація Flask
    app = Flask(__name__)
    
    # Конфігурація
    app.config['SECRET_KEY'] = os.getenv('SECRET_KEY', 'dev_key')
    app.config['SQLALCHEMY_DATABASE_URI'] = f"mysql+pymysql://{os.getenv('DB_USER', 'root')}:{os.getenv('DB_PASSWORD', '')}@{os.getenv('DB_HOST', 'localhost')}/{os.getenv('DB_NAME', 'personal_finance_manager')}"
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    app.config['JWT_SECRET_KEY'] = os.getenv('JWT_SECRET_KEY', 'dev_jwt_key')
    app.config['JWT_ACCESS_TOKEN_EXPIRES'] = int(os.getenv('JWT_ACCESS_TOKEN_EXPIRES', 3600))
    
    # Ініціалізація розширень
    db.init_app(app)
    jwt.init_app(app)
    CORS(app)
    
    with app.app_context():
        # Реєстрація blueprints
        from app.routes.auth import auth_bp
        from app.routes.transactions import transactions_bp
        from app.routes.categories import categories_bp
        from app.routes.budgets import budgets_bp
        from app.routes.accounts import accounts_bp
        from app.routes.exchange_rates import exchange_rates_bp
        
        app.register_blueprint(auth_bp, url_prefix='/api/auth')
        app.register_blueprint(transactions_bp, url_prefix='/api/transactions')
        app.register_blueprint(categories_bp, url_prefix='/api/categories')
        app.register_blueprint(budgets_bp, url_prefix='/api/budgets')
        app.register_blueprint(accounts_bp, url_prefix='/api/accounts')
        app.register_blueprint(exchange_rates_bp, url_prefix='/api/exchange-rates')
        
        # Створення таблиць БД, якщо вони не існують
        db.create_all()
    
    return app
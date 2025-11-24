"""
Flask application factory
"""
from flask import Flask, jsonify
from flask_cors import CORS
from flask_jwt_extended import JWTManager
import os

def create_app():
    """Create and configure Flask application"""
    
    app = Flask(__name__)
    
    # Load configuration
    env = os.environ.get('FLASK_ENV', 'development')
    if env == 'production':
        from config import ProductionConfig
        app.config.from_object(ProductionConfig)
    else:
        from config import DevelopmentConfig
        app.config.from_object(DevelopmentConfig)
    
    # Initialize extensions
    CORS(app)
    jwt = JWTManager(app)
    
    # Apply security middleware
    from app.security.security_middleware import SecurityMiddleware
    SecurityMiddleware.add_security_headers(app)
    
    # Initialize rate limiter
    from app.security.rate_limiter import init_rate_limiter
    limiter = init_rate_limiter(app)
    
    # Register blueprints
    from app.routes import auth, accounts, categories, transactions, budgets, dashboard
    
    app.register_blueprint(auth.auth_bp, url_prefix='/api/auth')
    app.register_blueprint(accounts.accounts_bp, url_prefix='/api/accounts')
    app.register_blueprint(categories.categories_bp, url_prefix='/api/categories')
    app.register_blueprint(transactions.transactions_bp, url_prefix='/api/transactions')
    app.register_blueprint(budgets.budgets_bp, url_prefix='/api/budgets')
    app.register_blueprint(dashboard.dashboard_bp, url_prefix='/api/dashboard')
    
    # Health check endpoint
    @app.route('/')
    @app.route('/health')
    def health_check():
        return jsonify({
            'status': 'healthy',
            'message': 'Personal Finance Manager API is running'
        }), 200
    
    # Error handlers
    @app.errorhandler(404)
    def not_found(error):
        return jsonify({'error': 'Not found'}), 404
    
    @app.errorhandler(500)
    def internal_error(error):
        return jsonify({'error': 'Internal server error'}), 500
    
    return app

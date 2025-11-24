"""
Rate Limiting для захисту від brute force атак
"""

from flask_limiter import Limiter
from flask_limiter.util import get_remote_address
from functools import wraps
from flask import jsonify

def init_rate_limiter(app):
    """Ініціалізація rate limiter"""
    limiter = Limiter(
        app=app,
        key_func=get_remote_address,
        default_limits=["200 per day", "50 per hour"],
        storage_uri="memory://",  # Для production використовуйте Redis
        strategy="fixed-window"
    )
    
    return limiter

# Декоратори для різних рівнів обмеження
def strict_rate_limit(limit_string):
    """
    Строге обмеження для sensitive endpoints
    Використання: @strict_rate_limit("5 per minute")
    """
    def decorator(f):
        @wraps(f)
        def decorated_function(*args, **kwargs):
            # Rate limiting буде застосовано через limiter.limit()
            return f(*args, **kwargs)
        return decorated_function
    return decorator

def moderate_rate_limit(limit_string):
    """
    Помірне обмеження для звичайних endpoints
    Використання: @moderate_rate_limit("30 per minute")
    """
    def decorator(f):
        @wraps(f)
        def decorated_function(*args, **kwargs):
            return f(*args, **kwargs)
        return decorated_function
    return decorator

"""
Приклад використання в routes/auth.py:

from app.security.rate_limiter import init_rate_limiter

limiter = init_rate_limiter(app)

@auth_bp.route('/login', methods=['POST'])
@limiter.limit("5 per minute")
def login():
    # ... код входу
    pass

@auth_bp.route('/register', methods=['POST'])
@limiter.limit("3 per hour")
def register():
    # ... код реєстрації
    pass
"""

"""
Security middleware для Flask додатку
Впроваджує різні security headers та обмеження
"""

from functools import wraps
from flask import request, jsonify
import re

class SecurityMiddleware:
    """Middleware для додавання security headers та перевірок"""
    
    @staticmethod
    def add_security_headers(app):
        """Додає security headers до всіх відповідей"""
        @app.after_request
        def set_security_headers(response):
            # Захист від clickjacking
            response.headers['X-Frame-Options'] = 'DENY'
            
            # Захист від MIME type sniffing
            response.headers['X-Content-Type-Options'] = 'nosniff'
            
            # XSS Protection
            response.headers['X-XSS-Protection'] = '1; mode=block'
            
            # HTTPS Strict Transport Security (для production з SSL)
            if app.config.get('FLASK_ENV') == 'production':
                response.headers['Strict-Transport-Security'] = 'max-age=31536000; includeSubDomains'
            
            # Content Security Policy
            response.headers['Content-Security-Policy'] = (
                "default-src 'self'; "
                "script-src 'self' 'unsafe-inline' https://cdnjs.cloudflare.com; "
                "style-src 'self' 'unsafe-inline'; "
                "img-src 'self' data: https:; "
                "font-src 'self' data:; "
                "connect-src 'self' https://api.exchangerate-api.com;"
            )
            
            # Referrer Policy
            response.headers['Referrer-Policy'] = 'strict-origin-when-cross-origin'
            
            # Permissions Policy
            response.headers['Permissions-Policy'] = (
                'geolocation=(), microphone=(), camera=()'
            )
            
            return response
        
        return app

class InputValidator:
    """Валідатор вхідних даних"""
    
    @staticmethod
    def sanitize_string(text, max_length=500):
        """Очищення рядкового вводу"""
        if not text:
            return text
        
        # Обмеження довжини
        text = str(text)[:max_length]
        
        # Видалення потенційно небезпечних символів
        text = re.sub(r'[<>]', '', text)
        
        return text.strip()
    
    @staticmethod
    def validate_email(email):
        """Валідація email"""
        pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
        return re.match(pattern, email) is not None
    
    @staticmethod
    def validate_password(password):
        """
        Валідація пароля:
        - Мінімум 8 символів
        - Хоча б одна велика літера
        - Хоча б одна мала літера
        - Хоча б одна цифра
        """
        if len(password) < 8:
            return False, "Password must be at least 8 characters long"
        
        if not re.search(r'[A-Z]', password):
            return False, "Password must contain at least one uppercase letter"
        
        if not re.search(r'[a-z]', password):
            return False, "Password must contain at least one lowercase letter"
        
        if not re.search(r'\d', password):
            return False, "Password must contain at least one number"
        
        return True, "Password is valid"
    
    @staticmethod
    def validate_amount(amount):
        """Валідація суми грошей"""
        try:
            amount = float(amount)
            if amount <= 0:
                return False, "Amount must be greater than 0"
            if amount > 1000000000:  # 1 мільярд
                return False, "Amount is too large"
            return True, "Amount is valid"
        except (ValueError, TypeError):
            return False, "Invalid amount format"

def require_strong_password(f):
    """Декоратор для перевірки міцності пароля"""
    @wraps(f)
    def decorated_function(*args, **kwargs):
        data = request.get_json()
        password = data.get('password')
        
        if password:
            is_valid, message = InputValidator.validate_password(password)
            if not is_valid:
                return jsonify({'error': message}), 400
        
        return f(*args, **kwargs)
    return decorated_function

def sanitize_input(fields):
    """Декоратор для очищення вхідних даних"""
    def decorator(f):
        @wraps(f)
        def decorated_function(*args, **kwargs):
            data = request.get_json()
            
            if data:
                for field in fields:
                    if field in data and isinstance(data[field], str):
                        data[field] = InputValidator.sanitize_string(data[field])
            
            return f(*args, **kwargs)
        return decorated_function
    return decorator

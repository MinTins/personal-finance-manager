from flask import Blueprint, request, jsonify
from app.models import User
from app import db
from flask_jwt_extended import (
    create_access_token, jwt_required, get_jwt_identity
)
import bcrypt

auth_bp = Blueprint('auth', __name__)

@auth_bp.route('/register', methods=['POST'])
def register():
    data = request.get_json()
    
    # Перевірка наявності необхідних полів
    if not all(k in data for k in ('username', 'email', 'password')):
        return jsonify({'error': 'Missing required fields'}), 400
    
    # Перевірка унікальності username та email
    if User.query.filter_by(username=data['username']).first():
        return jsonify({'error': 'Username already exists'}), 409
    
    if User.query.filter_by(email=data['email']).first():
        return jsonify({'error': 'Email already exists'}), 409
    
    # Хешування паролю
    password_hash = bcrypt.hashpw(data['password'].encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
    
    # Створення нового користувача
    new_user = User(
        username=data['username'],
        email=data['email'],
        password_hash=password_hash
    )
    
    db.session.add(new_user)
    db.session.commit()
    
    # Створення токену - ВАЖЛИВО: конвертуємо id в string
    access_token = create_access_token(identity=str(new_user.id))
    
    return jsonify({
        'message': 'User registered successfully',
        'access_token': access_token,
        'user': new_user.to_dict()
    }), 201

@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    
    # Перевірка наявності необхідних полів
    if not data.get('password'):
        return jsonify({'error': 'Password is required'}), 400
    
    # Підтримка логіну як через email, так і через username
    user = None
    if data.get('email'):
        user = User.query.filter_by(email=data['email']).first()
    elif data.get('username'):
        user = User.query.filter_by(username=data['username']).first()
    else:
        return jsonify({'error': 'Email or username is required'}), 400
    
    # Перевірка паролю
    if not user or not bcrypt.checkpw(data['password'].encode('utf-8'), user.password_hash.encode('utf-8')):
        return jsonify({'error': 'Invalid credentials'}), 401
    
    # Створення токену - ВАЖЛИВО: конвертуємо id в string
    access_token = create_access_token(identity=str(user.id))
    
    return jsonify({
        'message': 'Login successful',
        'access_token': access_token,
        'user': user.to_dict()
    }), 200

@auth_bp.route('/me', methods=['GET'])
@jwt_required()
def me():
    # get_jwt_identity() тепер поверне string, треба конвертувати в int
    user_id_str = get_jwt_identity()
    user_id = int(user_id_str)
    
    user = User.query.get(user_id)
    
    if not user:
        return jsonify({'error': 'User not found'}), 404
    
    return jsonify({
        'user': user.to_dict()
    }), 200
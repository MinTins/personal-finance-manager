from flask import Blueprint, request, jsonify
from app.models import Account
from app import db
from flask_jwt_extended import jwt_required, get_jwt_identity

accounts_bp = Blueprint('accounts', __name__)

@accounts_bp.route('', methods=['GET'])
@jwt_required()
def get_accounts():
    user_id = int(get_jwt_identity())
    
    # Отримання параметрів фільтрації
    is_active = request.args.get('is_active', type=lambda v: v.lower() == 'true')
    
    query = Account.query.filter_by(user_id=user_id)
    
    if is_active is not None:
        query = query.filter_by(is_active=is_active)
    
    accounts = query.all()
    
    return jsonify({
        'accounts': [a.to_dict() for a in accounts]
    }), 200

@accounts_bp.route('', methods=['POST'])
@jwt_required()
def create_account():
    user_id = get_jwt_identity()
    data = request.get_json()
    
    # Перевірка наявності необхідних полів
    if 'name' not in data:
        return jsonify({'error': 'Missing required field: name'}), 400
    
    # Створення нового рахунку
    new_account = Account(
        user_id=user_id,
        name=data['name'],
        balance=data.get('balance', 0),
        currency=data.get('currency', 'UAH'),
        is_active=data.get('is_active', True)
    )
    
    db.session.add(new_account)
    db.session.commit()
    
    return jsonify({
        'message': 'Account created successfully',
        'account': new_account.to_dict()
    }), 201

@accounts_bp.route('/<int:account_id>', methods=['GET'])
@jwt_required()
def get_account(account_id):
    user_id = get_jwt_identity()
    
    account = Account.query.filter_by(id=account_id, user_id=user_id).first()
    
    if not account:
        return jsonify({'error': 'Account not found'}), 404
    
    return jsonify({
        'account': account.to_dict()
    }), 200

@accounts_bp.route('/<int:account_id>', methods=['PUT'])
@jwt_required()
def update_account(account_id):
    user_id = get_jwt_identity()
    data = request.get_json()
    
    account = Account.query.filter_by(id=account_id, user_id=user_id).first()
    
    if not account:
        return jsonify({'error': 'Account not found'}), 404
    
    # Оновлення полів
    if 'name' in data:
        account.name = data['name']
    
    if 'balance' in data:
        account.balance = data['balance']
    
    if 'currency' in data:
        account.currency = data['currency']
    
    if 'is_active' in data:
        account.is_active = data['is_active']
    
    db.session.commit()
    
    return jsonify({
        'message': 'Account updated successfully',
        'account': account.to_dict()
    }), 200

@accounts_bp.route('/<int:account_id>', methods=['DELETE'])
@jwt_required()
def delete_account(account_id):
    user_id = get_jwt_identity()
    
    account = Account.query.filter_by(id=account_id, user_id=user_id).first()
    
    if not account:
        return jsonify({'error': 'Account not found'}), 404
    
    db.session.delete(account)
    db.session.commit()
    
    return jsonify({
        'message': 'Account deleted successfully'
    }), 200
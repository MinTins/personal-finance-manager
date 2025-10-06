from flask import Blueprint, request, jsonify
from app.models import Category
from app import db
from flask_jwt_extended import jwt_required, get_jwt_identity

categories_bp = Blueprint('categories', __name__)

@categories_bp.route('', methods=['GET'])
@jwt_required()
def get_categories():
    user_id = int(get_jwt_identity())  # Конвертуємо в int
    
    # Фільтрація за типом (доходи/витрати)
    category_type = request.args.get('type')
    
    query = Category.query.filter_by(user_id=user_id)
    
    if category_type:
        query = query.filter_by(type=category_type)
    
    categories = query.all()
    
    return jsonify({
        'categories': [cat.to_dict() for cat in categories]
    }), 200

@categories_bp.route('', methods=['POST'])
@jwt_required()
def create_category():
    user_id = int(get_jwt_identity())  # Конвертуємо в int
    data = request.get_json()
    
    # Перевірка наявності необхідних полів
    if not all(k in data for k in ('name', 'type')):
        return jsonify({'error': 'Missing required fields'}), 400
    
    # Перевірка типу категорії
    if data['type'] not in ['income', 'expense']:
        return jsonify({'error': 'Type must be either "income" or "expense"'}), 400
    
    # Створення нової категорії
    new_category = Category(
        user_id=user_id,
        name=data['name'],
        type=data['type'],
        color=data.get('color', '#3B82F6')  # Default blue color
    )
    
    db.session.add(new_category)
    db.session.commit()
    
    return jsonify({
        'message': 'Category created successfully',
        'category': new_category.to_dict()
    }), 201

@categories_bp.route('/<int:category_id>', methods=['GET'])
@jwt_required()
def get_category(category_id):
    user_id = int(get_jwt_identity())  # Конвертуємо в int
    
    category = Category.query.filter_by(id=category_id, user_id=user_id).first()
    
    if not category:
        return jsonify({'error': 'Category not found'}), 404
    
    return jsonify({
        'category': category.to_dict()
    }), 200

@categories_bp.route('/<int:category_id>', methods=['PUT'])
@jwt_required()
def update_category(category_id):
    user_id = int(get_jwt_identity())  # Конвертуємо в int
    data = request.get_json()
    
    # Пошук категорії
    category = Category.query.filter_by(id=category_id, user_id=user_id).first()
    
    if not category:
        return jsonify({'error': 'Category not found'}), 404
    
    # Оновлення полів
    if 'name' in data:
        category.name = data['name']
        
    if 'color' in data:
        category.color = data['color']
    
    # Тип категорії не можна змінювати (щоб не зламати транзакції)
    # if 'type' in data:
    #     category.type = data['type']
    
    db.session.commit()
    
    return jsonify({
        'message': 'Category updated successfully',
        'category': category.to_dict()
    }), 200

@categories_bp.route('/<int:category_id>', methods=['DELETE'])
@jwt_required()
def delete_category(category_id):
    user_id = int(get_jwt_identity())  # Конвертуємо в int
    
    # Пошук категорії
    category = Category.query.filter_by(id=category_id, user_id=user_id).first()
    
    if not category:
        return jsonify({'error': 'Category not found'}), 404
    
    db.session.delete(category)
    db.session.commit()
    
    return jsonify({
        'message': 'Category deleted successfully'
    }), 200
from flask import Blueprint, request, jsonify
from app.models import Budget, Category, Transaction
from app import db
from flask_jwt_extended import jwt_required, get_jwt_identity
from datetime import datetime

budgets_bp = Blueprint('budgets', __name__)

@budgets_bp.route('', methods=['GET'])
@jwt_required()
def get_budgets():
    user_id = get_jwt_identity()
    
    # Фільтрація за періодом
    period = request.args.get('period')
    
    query = Budget.query.filter_by(user_id=user_id)
    
    if period:
        query = query.filter_by(period=period)
    
    budgets = query.all()
    
    # Розширюємо інформацію про бюджети, додаючи поточний стан витрат
    result = []
    for budget in budgets:
        budget_dict = budget.to_dict()
        
        # Знаходимо суму витрат по цій категорії в рамках періоду бюджету
        spent_query = Transaction.query.filter_by(
            user_id=user_id,
            category_id=budget.category_id,
            type='expense'
        ).filter(
            Transaction.date >= budget.start_date,
            Transaction.date <= budget.end_date
        )
        
        spent = sum(float(t.amount) for t in spent_query.all())
        
        budget_dict['spent'] = spent
        budget_dict['remaining'] = float(budget.amount) - spent
        budget_dict['percent'] = (spent / float(budget.amount)) * 100 if float(budget.amount) > 0 else 0
        
        result.append(budget_dict)
    
    return jsonify({
        'budgets': result
    }), 200

@budgets_bp.route('', methods=['POST'])
@jwt_required()
def create_budget():
    user_id = get_jwt_identity()
    data = request.get_json()
    
    # Перевірка наявності необхідних полів
    if not all(k in data for k in ('category_id', 'amount', 'period', 'start_date', 'end_date')):
        return jsonify({'error': 'Missing required fields'}), 400
    
    # Перевірка періоду
    if data['period'] not in ['week', 'month', 'year']:
        return jsonify({'error': 'Period must be "week", "month", or "year"'}), 400
    
    # Перевірка категорії
    category = Category.query.filter_by(id=data['category_id'], user_id=user_id).first()
    if not category:
        return jsonify({'error': 'Category not found'}), 404
    
    # Перевірка, що категорія є категорією витрат
    if category.type != 'expense':
        return jsonify({'error': 'Budget can only be created for expense categories'}), 400
    
    # Перетворення дат з рядків у об'єкти Date
    try:
        start_date = datetime.strptime(data['start_date'], '%Y-%m-%d').date()
        end_date = datetime.strptime(data['end_date'], '%Y-%m-%d').date()
    except ValueError:
        return jsonify({'error': 'Invalid date format. Use YYYY-MM-DD'}), 400
    
    # Перевірка, що кінцева дата пізніше початкової
    if end_date <= start_date:
        return jsonify({'error': 'End date must be after start date'}), 400
    
    # Створення нового бюджету
    new_budget = Budget(
        user_id=user_id,
        category_id=data['category_id'],
        amount=data['amount'],
        period=data['period'],
        start_date=start_date,
        end_date=end_date
    )
    
    db.session.add(new_budget)
    db.session.commit()
    
    # Отримуємо інформацію про витрати
    spent_query = Transaction.query.filter_by(
        user_id=user_id,
        category_id=new_budget.category_id,
        type='expense'
    ).filter(
        Transaction.date >= new_budget.start_date,
        Transaction.date <= new_budget.end_date
    )
    
    spent = sum(float(t.amount) for t in spent_query.all())
    
    budget_dict = new_budget.to_dict()
    budget_dict['spent'] = spent
    budget_dict['remaining'] = float(new_budget.amount) - spent
    budget_dict['percent'] = (spent / float(new_budget.amount)) * 100 if float(new_budget.amount) > 0 else 0
    
    return jsonify({
        'message': 'Budget created successfully',
        'budget': budget_dict
    }), 201

@budgets_bp.route('/<int:budget_id>', methods=['PUT'])
@jwt_required()
def update_budget(budget_id):
    user_id = get_jwt_identity()
    data = request.get_json()
    
    # Пошук бюджету
    budget = Budget.query.filter_by(id=budget_id, user_id=user_id).first()
    
    if not budget:
        return jsonify({'error': 'Budget not found'}), 404
    
    # Оновлення полів
    if 'amount' in data:
        budget.amount = data['amount']
    
    if 'period' in data:
        if data['period'] not in ['week', 'month', 'year']:
            return jsonify({'error': 'Period must be "week", "month", or "year"'}), 400
        budget.period = data['period']
    
    if 'start_date' in data:
        try:
            budget.start_date = datetime.strptime(data['start_date'], '%Y-%m-%d').date()
        except ValueError:
            return jsonify({'error': 'Invalid start_date format. Use YYYY-MM-DD'}), 400
    
    if 'end_date' in data:
        try:
            budget.end_date = datetime.strptime(data['end_date'], '%Y-%m-%d').date()
        except ValueError:
            return jsonify({'error': 'Invalid end_date format. Use YYYY-MM-DD'}), 400
    
    # Перевірка, що кінцева дата пізніше початкової
    if budget.end_date <= budget.start_date:
        return jsonify({'error': 'End date must be after start date'}), 400
    
    db.session.commit()
    
    # Отримуємо оновлену інформацію про витрати
    spent_query = Transaction.query.filter_by(
        user_id=user_id,
        category_id=budget.category_id,
        type='expense'
    ).filter(
        Transaction.date >= budget.start_date,
        Transaction.date <= budget.end_date
    )
    
    spent = sum(float(t.amount) for t in spent_query.all())
    
    budget_dict = budget.to_dict()
    budget_dict['spent'] = spent
    budget_dict['remaining'] = float(budget.amount) - spent
    budget_dict['percent'] = (spent / float(budget.amount)) * 100 if float(budget.amount) > 0 else 0
    
    return jsonify({
        'message': 'Budget updated successfully',
        'budget': budget_dict
    }), 200

@budgets_bp.route('/<int:budget_id>', methods=['DELETE'])
@jwt_required()
def delete_budget(budget_id):
    user_id = get_jwt_identity()
    
    # Пошук бюджету
    budget = Budget.query.filter_by(id=budget_id, user_id=user_id).first()
    
    if not budget:
        return jsonify({'error': 'Budget not found'}), 404
    
    db.session.delete(budget)
    db.session.commit()
    
    return jsonify({
        'message': 'Budget deleted successfully'
    }), 200
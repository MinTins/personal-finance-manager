from flask import Blueprint, request, jsonify
from app.models import Budget, Category, Transaction
from app import db
from flask_jwt_extended import jwt_required, get_jwt_identity
from datetime import datetime, timedelta

budgets_bp = Blueprint('budgets', __name__)

@budgets_bp.route('', methods=['GET'])
@jwt_required()
def get_budgets():
    user_id = int(get_jwt_identity())
    
    # Фільтрація за періодом (опціонально)
    period = request.args.get('period')
    
    query = Budget.query.filter_by(user_id=user_id)
    
    # Якщо передано period, фільтруємо за датами
    if period:
        today = datetime.now().date()
        if period == 'week':
            start = today - timedelta(days=today.weekday())
            end = start + timedelta(days=6)
        elif period == 'month':
            start = today.replace(day=1)
            next_month = today.replace(day=28) + timedelta(days=4)
            end = next_month - timedelta(days=next_month.day)
        elif period == 'year':
            start = today.replace(month=1, day=1)
            end = today.replace(month=12, day=31)
        else:
            start = None
            end = None
        
        if start and end:
            query = query.filter(
                Budget.start_date <= end,
                Budget.end_date >= start
            )
    
    budgets = query.all()
    
    # Розширюємо інформацію про бюджети
    result = []
    for budget in budgets:
        budget_dict = budget.to_dict()
        
        # Знаходимо суму витрат по категорії в рамках періоду бюджету
        spent_query = Transaction.query.filter_by(
            user_id=user_id,
            category_id=budget.category_id,
            transaction_type='expense'
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
    if not all(k in data for k in ('category_id', 'amount', 'start_date', 'end_date')):
        return jsonify({'error': 'Missing required fields: category_id, amount, start_date, end_date'}), 400
    
    # Перевірка категорії
    category = Category.query.filter_by(id=data['category_id'], user_id=user_id).first()
    if not category:
        return jsonify({'error': 'Category not found'}), 404
    
    # Перевірка, що категорія є категорією витрат
    if category.type != 'expense':
        return jsonify({'error': 'Budget can only be created for expense categories'}), 400
    
    # Перетворення дат
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
        start_date=start_date,
        end_date=end_date
    )
    
    db.session.add(new_budget)
    db.session.commit()
    
    # Отримуємо інформацію про витрати
    spent_query = Transaction.query.filter_by(
        user_id=user_id,
        category_id=new_budget.category_id,
        transaction_type='expense'
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
    
    budget = Budget.query.filter_by(id=budget_id, user_id=user_id).first()
    
    if not budget:
        return jsonify({'error': 'Budget not found'}), 404
    
    # Оновлення полів
    if 'amount' in data:
        budget.amount = data['amount']
    
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
        transaction_type='expense'
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
    
    budget = Budget.query.filter_by(id=budget_id, user_id=user_id).first()
    
    if not budget:
        return jsonify({'error': 'Budget not found'}), 404
    
    db.session.delete(budget)
    db.session.commit()
    
    return jsonify({
        'message': 'Budget deleted successfully'
    }), 200
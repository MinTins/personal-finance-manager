from flask import Blueprint, request, jsonify
from app.models import Transaction, Category
from app import db
from flask_jwt_extended import jwt_required, get_jwt_identity
from datetime import datetime

transactions_bp = Blueprint('transactions', __name__)

@transactions_bp.route('', methods=['GET'])
@jwt_required()
def get_transactions():
    user_id = get_jwt_identity()
    
    # Параметри фільтрації
    type_filter = request.args.get('type')  # income або expense
    category_id = request.args.get('category_id')
    start_date = request.args.get('start_date')
    end_date = request.args.get('end_date')
    
    # Базовий запит
    query = Transaction.query.filter_by(user_id=user_id)
    
    # Додавання фільтрів, якщо вони є
    if type_filter:
        query = query.filter_by(type=type_filter)
        
    if category_id:
        query = query.filter_by(category_id=category_id)
        
    if start_date:
        try:
            start_date_obj = datetime.strptime(start_date, '%Y-%m-%d').date()
            query = query.filter(Transaction.date >= start_date_obj)
        except ValueError:
            return jsonify({'error': 'Invalid start_date format. Use YYYY-MM-DD'}), 400
    
    if end_date:
        try:
            end_date_obj = datetime.strptime(end_date, '%Y-%m-%d').date()
            query = query.filter(Transaction.date <= end_date_obj)
        except ValueError:
            return jsonify({'error': 'Invalid end_date format. Use YYYY-MM-DD'}), 400
    
    # Сортування за датою (спочатку найновіші)
    transactions = query.order_by(Transaction.date.desc()).all()
    
    return jsonify({
        'transactions': [transaction.to_dict() for transaction in transactions]
    }), 200

@transactions_bp.route('', methods=['POST'])
@jwt_required()
def create_transaction():
    user_id = get_jwt_identity()
    data = request.get_json()
    
    # Перевірка наявності необхідних полів
    if not all(k in data for k in ('amount', 'type', 'date')):
        return jsonify({'error': 'Missing required fields'}), 400
    
    # Перевірка типу транзакції
    if data['type'] not in ['income', 'expense']:
        return jsonify({'error': 'Type must be either "income" or "expense"'}), 400
    
    # Перевірка категорії, якщо вона вказана
    category_id = data.get('category_id')
    if category_id:
        category = Category.query.filter_by(id=category_id, user_id=user_id).first()
        if not category:
            return jsonify({'error': 'Category not found'}), 404
        
        # Перевірка, чи збігається тип категорії з типом транзакції
        if category.type != data['type']:
            return jsonify({'error': 'Category type does not match transaction type'}), 400
    
    # Перетворення дати з рядка у об'єкт Date
    try:
        transaction_date = datetime.strptime(data['date'], '%Y-%m-%d').date()
    except ValueError:
        return jsonify({'error': 'Invalid date format. Use YYYY-MM-DD'}), 400
    
    # Створення нової транзакції
    new_transaction = Transaction(
        user_id=user_id,
        category_id=category_id,
        amount=data['amount'],
        description=data.get('description', ''),
        type=data['type'],
        date=transaction_date
    )
    
    db.session.add(new_transaction)
    db.session.commit()
    
    return jsonify({
        'message': 'Transaction created successfully',
        'transaction': new_transaction.to_dict()
    }), 201

@transactions_bp.route('/<int:transaction_id>', methods=['GET'])
@jwt_required()
def get_transaction(transaction_id):
    user_id = get_jwt_identity()
    
    # Пошук транзакції
    transaction = Transaction.query.filter_by(id=transaction_id, user_id=user_id).first()
    
    if not transaction:
        return jsonify({'error': 'Transaction not found'}), 404
    
    return jsonify({
        'transaction': transaction.to_dict()
    }), 200

@transactions_bp.route('/<int:transaction_id>', methods=['PUT'])
@jwt_required()
def update_transaction(transaction_id):
    user_id = get_jwt_identity()
    data = request.get_json()
    
    # Пошук транзакції
    transaction = Transaction.query.filter_by(id=transaction_id, user_id=user_id).first()
    
    if not transaction:
        return jsonify({'error': 'Transaction not found'}), 404
    
    # Оновлення полів
    if 'amount' in data:
        transaction.amount = data['amount']
    
    if 'description' in data:
        transaction.description = data['description']
    
    if 'date' in data:
        try:
            transaction.date = datetime.strptime(data['date'], '%Y-%m-%d').date()
        except ValueError:
            return jsonify({'error': 'Invalid date format. Use YYYY-MM-DD'}), 400
    
    if 'category_id' in data:
        if data['category_id']:
            # Перевірка існування категорії та її приналежності користувачу
            category = Category.query.filter_by(id=data['category_id'], user_id=user_id).first()
            if not category:
                return jsonify({'error': 'Category not found'}), 404
            
            # Перевірка, чи збігається тип категорії з типом транзакції
            if category.type != transaction.type:
                return jsonify({'error': 'Category type does not match transaction type'}), 400
        
        transaction.category_id = data['category_id']
    
    db.session.commit()
    
    return jsonify({
        'message': 'Transaction updated successfully',
        'transaction': transaction.to_dict()
    }), 200

@transactions_bp.route('/<int:transaction_id>', methods=['DELETE'])
@jwt_required()
def delete_transaction(transaction_id):
    user_id = get_jwt_identity()
    
    # Пошук транзакції
    transaction = Transaction.query.filter_by(id=transaction_id, user_id=user_id).first()
    
    if not transaction:
        return jsonify({'error': 'Transaction not found'}), 404
    
    db.session.delete(transaction)
    db.session.commit()
    
    return jsonify({
        'message': 'Transaction deleted successfully'
    }), 200

@transactions_bp.route('/summary', methods=['GET'])
@jwt_required()
def get_summary():
    user_id = get_jwt_identity()
    
    # Параметри фільтрації
    start_date = request.args.get('start_date')
    end_date = request.args.get('end_date')
    
    # Базовий запит для транзакцій користувача
    query = Transaction.query.filter_by(user_id=user_id)
    
    # Додавання фільтрів за датою, якщо вони є
    if start_date:
        try:
            start_date_obj = datetime.strptime(start_date, '%Y-%m-%d').date()
            query = query.filter(Transaction.date >= start_date_obj)
        except ValueError:
            return jsonify({'error': 'Invalid start_date format. Use YYYY-MM-DD'}), 400
    
    if end_date:
        try:
            end_date_obj = datetime.strptime(end_date, '%Y-%m-%d').date()
            query = query.filter(Transaction.date <= end_date_obj)
        except ValueError:
            return jsonify({'error': 'Invalid end_date format. Use YYYY-MM-DD'}), 400
    
    # Отримання всіх транзакцій
    transactions = query.all()
    
    # Розрахунок загальних сум
    total_income = sum(float(t.amount) for t in transactions if t.type == 'income')
    total_expense = sum(float(t.amount) for t in transactions if t.type == 'expense')
    balance = total_income - total_expense
    
    # Групування за категоріями
    categories_summary = {}
    for transaction in transactions:
        category_name = transaction.category.name if transaction.category else 'Без категорії'
        category_id = transaction.category_id if transaction.category else 0
        category_color = transaction.category.color if transaction.category else '#808080'
        
        if transaction.type not in categories_summary:
            categories_summary[transaction.type] = {}
            
        if category_id not in categories_summary[transaction.type]:
            categories_summary[transaction.type][category_id] = {
                'id': category_id,
                'name': category_name,
                'color': category_color,
                'amount': 0
            }
            
        categories_summary[transaction.type][category_id]['amount'] += float(transaction.amount)
    
    # Перетворення словників у списки для відповіді
    income_categories = list(categories_summary.get('income', {}).values())
    expense_categories = list(categories_summary.get('expense', {}).values())
    
    return jsonify({
        'summary': {
            'total_income': total_income,
            'total_expense': total_expense,
            'balance': balance,
            'income_categories': income_categories,
            'expense_categories': expense_categories
        }
    }), 200
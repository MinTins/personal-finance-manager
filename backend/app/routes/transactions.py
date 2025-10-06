from flask import Blueprint, request, jsonify
from app.models import Transaction, Category, Account
from app import db
from flask_jwt_extended import jwt_required, get_jwt_identity
from datetime import datetime
from sqlalchemy import func

transactions_bp = Blueprint('transactions', __name__)

@transactions_bp.route('', methods=['GET'])
@jwt_required()
def get_transactions():
    user_id = int(get_jwt_identity())
    
    # Отримання параметрів фільтрації
    category_id = request.args.get('category_id', type=int)
    account_id = request.args.get('account_id', type=int)
    transaction_type = request.args.get('type')
    start_date = request.args.get('start_date')
    end_date = request.args.get('end_date')
    
    query = Transaction.query.filter_by(user_id=user_id)
    
    # Застосування фільтрів
    if category_id:
        query = query.filter_by(category_id=category_id)
    
    if account_id:
        query = query.filter_by(account_id=account_id)
    
    if transaction_type:
        query = query.filter_by(transaction_type=transaction_type)
    
    if start_date:
        try:
            start = datetime.strptime(start_date, '%Y-%m-%d')
            query = query.filter(Transaction.date >= start)
        except ValueError:
            return jsonify({'error': 'Invalid start_date format. Use YYYY-MM-DD'}), 400
    
    if end_date:
        try:
            end = datetime.strptime(end_date, '%Y-%m-%d')
            query = query.filter(Transaction.date <= end)
        except ValueError:
            return jsonify({'error': 'Invalid end_date format. Use YYYY-MM-DD'}), 400
    
    transactions = query.order_by(Transaction.date.desc()).all()
    
    return jsonify({
        'transactions': [t.to_dict() for t in transactions]
    }), 200

@transactions_bp.route('', methods=['POST'])
@jwt_required()
def create_transaction():
    user_id = int(get_jwt_identity())
    data = request.get_json()
    
    # Перевірка наявності необхідних полів
    if not all(k in data for k in ('account_id', 'amount', 'transaction_type', 'date')):
        return jsonify({'error': 'Missing required fields: account_id, amount, transaction_type, date'}), 400
    
    # Перевірка account
    account = Account.query.filter_by(id=data['account_id'], user_id=user_id).first()
    if not account:
        return jsonify({'error': 'Account not found'}), 404
    
    # Перевірка типу транзакції
    if data['transaction_type'] not in ['income', 'expense', 'transfer']:
        return jsonify({'error': 'Transaction type must be "income", "expense", or "transfer"'}), 400
    
    # Перевірка категорії (якщо вона є)
    category_id = data.get('category_id')
    if category_id:
        category = Category.query.filter_by(id=category_id, user_id=user_id).first()
        if not category:
            return jsonify({'error': 'Category not found'}), 404
    else:
        category_id = None
    
    # Перетворення дати з рядка у об'єкт DateTime
    try:
        transaction_date = datetime.strptime(data['date'], '%Y-%m-%d')
    except ValueError:
        return jsonify({'error': 'Invalid date format. Use YYYY-MM-DD'}), 400
    
    # Створення нової транзакції
    new_transaction = Transaction(
        user_id=user_id,
        account_id=data['account_id'],
        category_id=category_id,
        amount=data['amount'],
        description=data.get('description', ''),
        transaction_type=data['transaction_type'],
        date=transaction_date
    )
    
    db.session.add(new_transaction)
    
    # Оновлення балансу рахунку
    if data['transaction_type'] == 'income':
        account.balance += float(data['amount'])
    elif data['transaction_type'] == 'expense':
        account.balance -= float(data['amount'])
    
    db.session.commit()
    
    return jsonify({
        'message': 'Transaction created successfully',
        'transaction': new_transaction.to_dict()
    }), 201

@transactions_bp.route('/<int:transaction_id>', methods=['GET'])
@jwt_required()
def get_transaction(transaction_id):
    user_id = int(get_jwt_identity())
    
    transaction = Transaction.query.filter_by(id=transaction_id, user_id=user_id).first()
    
    if not transaction:
        return jsonify({'error': 'Transaction not found'}), 404
    
    return jsonify({
        'transaction': transaction.to_dict()
    }), 200

@transactions_bp.route('/<int:transaction_id>', methods=['PUT'])
@jwt_required()
def update_transaction(transaction_id):
    user_id = int(get_jwt_identity())
    data = request.get_json()
    
    transaction = Transaction.query.filter_by(id=transaction_id, user_id=user_id).first()
    
    if not transaction:
        return jsonify({'error': 'Transaction not found'}), 404
    
    old_amount = float(transaction.amount)
    old_type = transaction.transaction_type
    
    # Оновлення полів
    if 'amount' in data:
        transaction.amount = data['amount']
    
    if 'description' in data:
        transaction.description = data['description']
    
    if 'date' in data:
        try:
            transaction.date = datetime.strptime(data['date'], '%Y-%m-%d')
        except ValueError:
            return jsonify({'error': 'Invalid date format. Use YYYY-MM-DD'}), 400
    
    if 'category_id' in data:
        if data['category_id']:
            category = Category.query.filter_by(id=data['category_id'], user_id=user_id).first()
            if not category:
                return jsonify({'error': 'Category not found'}), 404
            transaction.category_id = data['category_id']
        else:
            transaction.category_id = None
    
    # Оновлення балансу рахунку при зміні суми або типу
    if 'amount' in data or 'transaction_type' in data:
        account = Account.query.filter_by(id=transaction.account_id).first()
        
        # Відміна старої транзакції
        if old_type == 'income':
            account.balance -= old_amount
        elif old_type == 'expense':
            account.balance += old_amount
        
        # Застосування нової транзакції
        new_type = data.get('transaction_type', old_type)
        new_amount = float(data.get('amount', old_amount))
        
        if new_type == 'income':
            account.balance += new_amount
        elif new_type == 'expense':
            account.balance -= new_amount
        
        if 'transaction_type' in data:
            transaction.transaction_type = new_type
    
    db.session.commit()
    
    return jsonify({
        'message': 'Transaction updated successfully',
        'transaction': transaction.to_dict()
    }), 200

@transactions_bp.route('/<int:transaction_id>', methods=['DELETE'])
@jwt_required()
def delete_transaction(transaction_id):
    user_id = int(get_jwt_identity())
    
    transaction = Transaction.query.filter_by(id=transaction_id, user_id=user_id).first()
    
    if not transaction:
        return jsonify({'error': 'Transaction not found'}), 404
    
    # Оновлення балансу рахунку
    account = Account.query.filter_by(id=transaction.account_id).first()
    if account:
        if transaction.transaction_type == 'income':
            account.balance -= float(transaction.amount)
        elif transaction.transaction_type == 'expense':
            account.balance += float(transaction.amount)
    
    db.session.delete(transaction)
    db.session.commit()
    
    return jsonify({
        'message': 'Transaction deleted successfully'
    }), 200

@transactions_bp.route('/summary', methods=['GET'])
@jwt_required()
def get_summary():
    user_id = int(get_jwt_identity())
    
    # Отримання параметрів фільтрації
    start_date = request.args.get('start_date')
    end_date = request.args.get('end_date')
    
    query = Transaction.query.filter_by(user_id=user_id)
    
    if start_date:
        try:
            start = datetime.strptime(start_date, '%Y-%m-%d')
            query = query.filter(Transaction.date >= start)
        except ValueError:
            return jsonify({'error': 'Invalid start_date format'}), 400
    
    if end_date:
        try:
            end = datetime.strptime(end_date, '%Y-%m-%d')
            query = query.filter(Transaction.date <= end)
        except ValueError:
            return jsonify({'error': 'Invalid end_date format'}), 400
    
    transactions = query.all()
    
    total_income = sum(float(t.amount) for t in transactions if t.transaction_type == 'income')
    total_expense = sum(float(t.amount) for t in transactions if t.transaction_type == 'expense')
    balance = total_income - total_expense
    
    # Групування за категоріями
    categories_summary = {}
    for transaction in transactions:
        category_name = transaction.category.name if transaction.category else 'Без категорії'
        category_id = transaction.category_id if transaction.category else 0
        category_color = transaction.category.color if transaction.category else '#808080'
        
        if transaction.transaction_type not in categories_summary:
            categories_summary[transaction.transaction_type] = {}
            
        if category_id not in categories_summary[transaction.transaction_type]:
            categories_summary[transaction.transaction_type][category_id] = {
                'id': category_id,
                'name': category_name,
                'color': category_color,
                'amount': 0
            }
            
        categories_summary[transaction.transaction_type][category_id]['amount'] += float(transaction.amount)
    
    # Перетворення словників у списки
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
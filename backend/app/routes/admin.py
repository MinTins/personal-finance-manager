from flask import Blueprint, request, jsonify
from app.models import User, Account, Transaction, Category, Budget, AdminLog
from app import db
from flask_jwt_extended import jwt_required, get_jwt_identity
from functools import wraps
from sqlalchemy import func, text
from datetime import datetime, timedelta

admin_bp = Blueprint('admin', __name__)

# Декоратор для перевірки прав адміністратора
def admin_required(fn):
    @wraps(fn)
    @jwt_required()
    def wrapper(*args, **kwargs):
        user_id = int(get_jwt_identity())
        user = User.query.get(user_id)
        
        if not user or user.role != 'admin':
            return jsonify({'error': 'Admin access required'}), 403
        
        return fn(*args, **kwargs)
    return wrapper

# Функція для логування дій адміністратора
def log_admin_action(action, target_type=None, target_id=None, details=None):
    try:
        admin_id = int(get_jwt_identity())
        ip_address = request.remote_addr
        
        log = AdminLog(
            admin_id=admin_id,
            action=action,
            target_type=target_type,
            target_id=target_id,
            details=details,
            ip_address=ip_address
        )
        db.session.add(log)
        db.session.commit()
    except Exception as e:
        print(f"Error logging admin action: {e}")

# ============================================================================
# DASHBOARD & СТАТИСТИКА
# ============================================================================

@admin_bp.route('/dashboard', methods=['GET'])
@admin_required
def get_dashboard():
    """Отримати загальну статистику системи"""
    try:
        # Використовуємо збережену процедуру
        result = db.session.execute(text('CALL get_system_statistics()')).fetchone()
        
        stats = {
            'total_users': result[0],
            'total_admins': result[1],
            'total_accounts': result[2],
            'total_transactions': result[3],
            'total_custom_categories': result[4],
            'total_budgets': result[5],
            'total_balance': float(result[6]),
            'new_users_today': result[7],
            'transactions_today': result[8]
        }
        
        # Додаткова статистика
        # Топ користувачів за кількістю транзакцій
        top_users = db.session.query(
            User.id,
            User.username,
            func.count(Transaction.id).label('transaction_count')
        ).join(Transaction).filter(
            User.role == 'user'
        ).group_by(User.id).order_by(
            func.count(Transaction.id).desc()
        ).limit(5).all()
        
        stats['top_users'] = [
            {
                'id': u.id,
                'username': u.username,
                'transaction_count': u.transaction_count
            } for u in top_users
        ]
        
        # Останні зареєстровані користувачі
        recent_users = User.query.filter_by(role='user').order_by(
            User.created_at.desc()
        ).limit(5).all()
        
        stats['recent_users'] = [
            {
                'id': u.id,
                'username': u.username,
                'email': u.email,
                'created_at': u.created_at.strftime('%Y-%m-%d %H:%M:%S')
            } for u in recent_users
        ]
        
        log_admin_action('VIEW_DASHBOARD')
        
        return jsonify(stats), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# ============================================================================
# УПРАВЛІННЯ КОРИСТУВАЧАМИ
# ============================================================================

@admin_bp.route('/users', methods=['GET'])
@admin_required
def get_all_users():
    """Отримати список всіх користувачів"""
    try:
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 20, type=int)
        search = request.args.get('search', '')
        role_filter = request.args.get('role', '')
        
        query = User.query
        
        # Фільтрація за пошуковим запитом
        if search:
            query = query.filter(
                (User.username.like(f'%{search}%')) |
                (User.email.like(f'%{search}%'))
            )
        
        # Фільтрація за роллю
        if role_filter:
            query = query.filter_by(role=role_filter)
        
        # Пагінація
        pagination = query.order_by(User.created_at.desc()).paginate(
            page=page, per_page=per_page, error_out=False
        )
        
        users = []
        for user in pagination.items:
            # Отримуємо статистику для кожного користувача
            stats = db.session.execute(
                text('SELECT * FROM user_statistics WHERE id = :user_id'),
                {'user_id': user.id}
            ).fetchone()
            
            user_data = user.to_dict()
            if stats:
                user_data['statistics'] = {
                    'accounts_count': stats[5],
                    'transactions_count': stats[6],
                    'categories_count': stats[7],
                    'budgets_count': stats[8],
                    'total_income': float(stats[9]) if stats[9] else 0,
                    'total_expenses': float(stats[10]) if stats[10] else 0,
                    'last_transaction_date': stats[11].strftime('%Y-%m-%d %H:%M:%S') if stats[11] else None
                }
            
            users.append(user_data)
        
        return jsonify({
            'users': users,
            'total': pagination.total,
            'pages': pagination.pages,
            'current_page': page
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@admin_bp.route('/users/<int:user_id>', methods=['GET'])
@admin_required
def get_user_details(user_id):
    """Отримати детальну інформацію про користувача"""
    try:
        user = User.query.get(user_id)
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        # Отримуємо всі дані користувача
        user_data = user.to_dict()
        
        # Рахунки
        accounts = Account.query.filter_by(user_id=user_id).all()
        user_data['accounts'] = [acc.to_dict() for acc in accounts]
        
        # Категорії
        categories = Category.query.filter_by(user_id=user_id).all()
        user_data['categories'] = [cat.to_dict() for cat in categories]
        
        # Останні транзакції
        transactions = Transaction.query.filter_by(user_id=user_id).order_by(
            Transaction.date.desc()
        ).limit(10).all()
        user_data['recent_transactions'] = [t.to_dict() for t in transactions]
        
        # Бюджети
        budgets = Budget.query.filter_by(user_id=user_id).all()
        user_data['budgets'] = [b.to_dict() for b in budgets]
        
        log_admin_action('VIEW_USER_DETAILS', 'user', user_id)
        
        return jsonify(user_data), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@admin_bp.route('/users/<int:user_id>', methods=['PUT'])
@admin_required
def update_user(user_id):
    """Оновити дані користувача"""
    try:
        user = User.query.get(user_id)
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        data = request.get_json()
        old_data = user.to_dict()
        
        # Оновлення полів
        if 'username' in data:
            # Перевірка унікальності
            existing = User.query.filter_by(username=data['username']).first()
            if existing and existing.id != user_id:
                return jsonify({'error': 'Username already exists'}), 409
            user.username = data['username']
        
        if 'email' in data:
            # Перевірка унікальності
            existing = User.query.filter_by(email=data['email']).first()
            if existing and existing.id != user_id:
                return jsonify({'error': 'Email already exists'}), 409
            user.email = data['email']
        
        if 'role' in data and data['role'] in ['user', 'admin']:
            user.role = data['role']
        
        db.session.commit()
        
        log_admin_action(
            'UPDATE_USER', 
            'user', 
            user_id, 
            f'Updated from {old_data} to {user.to_dict()}'
        )
        
        return jsonify({
            'message': 'User updated successfully',
            'user': user.to_dict()
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@admin_bp.route('/users/<int:user_id>', methods=['DELETE'])
@admin_required
def delete_user(user_id):
    """Видалити користувача"""
    try:
        admin_id = int(get_jwt_identity())
        
        # Не дозволяємо видаляти себе
        if admin_id == user_id:
            return jsonify({'error': 'Cannot delete yourself'}), 400
        
        user = User.query.get(user_id)
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        # Не дозволяємо видаляти інших адміністраторів
        if user.role == 'admin':
            return jsonify({'error': 'Cannot delete another admin'}), 403
        
        username = user.username
        
        # Встановлюємо змінну для тригера
        db.session.execute(text('SET @current_admin_id = :admin_id'), {'admin_id': admin_id})
        
        db.session.delete(user)
        db.session.commit()
        
        log_admin_action('DELETE_USER', 'user', user_id, f'Deleted user: {username}')
        
        return jsonify({'message': f'User {username} deleted successfully'}), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

# ============================================================================
# ЛОГИ АДМІНІСТРАТОРА
# ============================================================================

@admin_bp.route('/logs', methods=['GET'])
@admin_required
def get_admin_logs():
    """Отримати логи дій адміністраторів"""
    try:
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 50, type=int)
        action_filter = request.args.get('action', '')
        
        query = AdminLog.query
        
        if action_filter:
            query = query.filter_by(action=action_filter)
        
        pagination = query.order_by(AdminLog.created_at.desc()).paginate(
            page=page, per_page=per_page, error_out=False
        )
        
        logs = []
        for log in pagination.items:
            log_data = log.to_dict()
            # Додаємо інформацію про адміністратора
            admin = User.query.get(log.admin_id)
            if admin:
                log_data['admin_username'] = admin.username
            logs.append(log_data)
        
        return jsonify({
            'logs': logs,
            'total': pagination.total,
            'pages': pagination.pages,
            'current_page': page
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# ============================================================================
# СИСТЕМНА ІНФОРМАЦІЯ
# ============================================================================

@admin_bp.route('/system-info', methods=['GET'])
@admin_required
def get_system_info():
    """Отримати інформацію про систему"""
    try:
        # Інформація про базу даних
        db_size = db.session.execute(
            text("""
                SELECT 
                    ROUND(SUM(data_length + index_length) / 1024 / 1024, 2) AS size_mb
                FROM information_schema.TABLES
                WHERE table_schema = DATABASE()
            """)
        ).scalar()
        
        # Кількість записів у таблицях
        table_counts = {
            'users': User.query.count(),
            'accounts': Account.query.count(),
            'transactions': Transaction.query.count(),
            'categories': Category.query.count(),
            'budgets': Budget.query.count(),
            'admin_logs': AdminLog.query.count()
        }
        
        log_admin_action('VIEW_SYSTEM_INFO')
        
        return jsonify({
            'database_size_mb': float(db_size) if db_size else 0,
            'table_counts': table_counts,
            'timestamp': datetime.utcnow().strftime('%Y-%m-%d %H:%M:%S')
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500
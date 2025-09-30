from flask import Blueprint, request, jsonify
import requests
import os
from datetime import datetime
from flask_jwt_extended import jwt_required

exchange_rates_bp = Blueprint('exchange_rates', __name__)

@exchange_rates_bp.route('', methods=['GET'])
@jwt_required()
def get_exchange_rates():
    # Отримання параметрів
    base_currency = request.args.get('base', 'UAH')
    target_currency = request.args.get('target', 'USD,EUR,GBP')
    
    # API ключ з змінних оточення
    api_key = os.getenv('EXCHANGE_RATE_API_KEY')
    
    if not api_key:
        return jsonify({
            'error': 'Exchange Rate API key is not configured'
        }), 500
    
    # Запит до зовнішнього API
    url = f"https://v6.exchangerate-api.com/v6/{api_key}/latest/{base_currency}"
    
    try:
        response = requests.get(url)
        data = response.json()
        
        if data['result'] != 'success':
            return jsonify({
                'error': 'Failed to fetch exchange rates',
                'details': data.get('error-type', 'Unknown error')
            }), 500
        
        # Фільтрація результатів за запитаними валютами
        target_currencies = target_currency.split(',')
        filtered_rates = {currency: rate for currency, rate in data['conversion_rates'].items() if currency in target_currencies}
        
        return jsonify({
            'base_currency': base_currency,
            'rates': filtered_rates,
            'timestamp': data.get('time_last_update_unix', int(datetime.now().timestamp()))
        }), 200
        
    except Exception as e:
        return jsonify({
            'error': 'Failed to fetch exchange rates',
            'details': str(e)
        }), 500

@exchange_rates_bp.route('/convert', methods=['GET'])
@jwt_required()
def convert_currency():
    # Отримання параметрів
    from_currency = request.args.get('from', 'UAH')
    to_currency = request.args.get('to', 'USD')
    amount = request.args.get('amount')
    
    if not amount:
        return jsonify({
            'error': 'Amount is required'
        }), 400
    
    try:
        amount = float(amount)
    except ValueError:
        return jsonify({
            'error': 'Amount must be a number'
        }), 400
    
    # API ключ з змінних оточення
    api_key = os.getenv('EXCHANGE_RATE_API_KEY')
    
    if not api_key:
        return jsonify({
            'error': 'Exchange Rate API key is not configured'
        }), 500
    
    # Запит до зовнішнього API
    url = f"https://v6.exchangerate-api.com/v6/{api_key}/pair/{from_currency}/{to_currency}/{amount}"
    
    try:
        response = requests.get(url)
        data = response.json()
        
        if data['result'] != 'success':
            return jsonify({
                'error': 'Failed to convert currency',
                'details': data.get('error-type', 'Unknown error')
            }), 500
        
        return jsonify({
            'from': {
                'currency': from_currency,
                'amount': amount
            },
            'to': {
                'currency': to_currency,
                'amount': data['conversion_result']
            },
            'rate': data['conversion_rate'],
            'timestamp': data.get('time_last_update_unix', int(datetime.now().timestamp()))
        }), 200
        
    except Exception as e:
        return jsonify({
            'error': 'Failed to convert currency',
            'details': str(e)
        }), 500
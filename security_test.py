"""
Практичні тести безпеки для Personal Finance Manager
Запуск: python security_test.py
"""

import requests
import time
import sys

BASE_URL = "http://localhost:5000/api"

class Colors:
    GREEN = '\033[92m'
    RED = '\033[91m'
    YELLOW = '\033[93m'
    BLUE = '\033[94m'
    END = '\033[0m'

def print_test(name):
    print(f"\n{Colors.BLUE}{'='*60}{Colors.END}")
    print(f"{Colors.BLUE}🧪 Тест: {name}{Colors.END}")
    print(f"{Colors.BLUE}{'='*60}{Colors.END}")

def print_success(message):
    print(f"{Colors.GREEN}✅ PASSED: {message}{Colors.END}")

def print_failure(message):
    print(f"{Colors.RED}❌ FAILED: {message}{Colors.END}")

def print_warning(message):
    print(f"{Colors.YELLOW}⚠️  WARNING: {message}{Colors.END}")

# Тест 1: Слабкі паролі
def test_weak_passwords():
    print_test("Перевірка захисту від слабких паролів")
    
    weak_passwords = [
        ("123", "Занадто короткий"),
        ("password", "Немає цифр та великих літер"),
        ("12345678", "Немає літер"),
        ("abcdefgh", "Немає цифр та великих літер"),
    ]
    
    for password, reason in weak_passwords:
        data = {
            "username": "testuser",
            "email": "test@example.com",
            "password": password
        }
        
        try:
            response = requests.post(f"{BASE_URL}/auth/register", json=data)
            
            if response.status_code == 400:
                print_success(f"Слабкий пароль відхилено: {reason}")
            else:
                print_failure(f"Слабкий пароль прийнято: {reason}")
        except requests.exceptions.RequestException as e:
            print_failure(f"Помилка з'єднання: {e}")

# Тест 2: SQL Injection
def test_sql_injection():
    print_test("Перевірка захисту від SQL Injection")
    
    sql_payloads = [
        "admin' OR '1'='1",
        "admin'--",
        "admin' OR 1=1--",
        "' OR ''='",
    ]
    
    for payload in sql_payloads:
        data = {
            "email": payload,
            "password": "anypassword"
        }
        
        try:
            response = requests.post(f"{BASE_URL}/auth/login", json=data)
            
            if response.status_code == 401 or response.status_code == 400:
                print_success(f"SQL Injection заблоковано: {payload[:30]}...")
            else:
                print_failure(f"SQL Injection можливо успішна: {payload[:30]}...")
        except requests.exceptions.RequestException as e:
            print_failure(f"Помилка з'єднання: {e}")

# Тест 3: XSS атаки
def test_xss_attacks():
    print_test("Перевірка захисту від XSS")
    
    # Спочатку створимо користувача та отримаємо токен
    register_data = {
        "username": "xsstest",
        "email": "xsstest@example.com",
        "password": "TestPass123"
    }
    
    try:
        response = requests.post(f"{BASE_URL}/auth/register", json=register_data)
        if response.status_code != 201:
            # Спробуємо увійти
            login_data = {"email": "xsstest@example.com", "password": "TestPass123"}
            response = requests.post(f"{BASE_URL}/auth/login", json=login_data)
        
        token = response.json().get('access_token')
        
        if not token:
            print_warning("Не вдалося отримати токен для XSS тесту")
            return
        
        headers = {"Authorization": f"Bearer {token}"}
        
        # Створимо рахунок
        account_data = {
            "name": "Test Account",
            "balance": 1000,
            "currency": "UAH",
            "is_active": True
        }
        account_response = requests.post(f"{BASE_URL}/accounts", json=account_data, headers=headers)
        account_id = account_response.json().get('account', {}).get('id')
        
        if not account_id:
            print_warning("Не вдалося створити рахунок для XSS тесту")
            return
        
        # Тест XSS в описі транзакції
        xss_payloads = [
            "<script>alert('XSS')</script>",
            "<img src=x onerror=alert('XSS')>",
            "javascript:alert('XSS')",
        ]
        
        for payload in xss_payloads:
            transaction_data = {
                "account_id": account_id,
                "amount": 100,
                "description": payload,
                "transaction_type": "expense",
                "date": "2025-11-24"
            }
            
            response = requests.post(f"{BASE_URL}/transactions", json=transaction_data, headers=headers)
            
            if response.status_code == 201:
                # Перевіримо, чи скрипт було оброблено
                transaction_id = response.json().get('transaction', {}).get('id')
                get_response = requests.get(f"{BASE_URL}/transactions/{transaction_id}", headers=headers)
                description = get_response.json().get('transaction', {}).get('description', '')
                
                if '<script>' not in description and 'onerror=' not in description:
                    print_success(f"XSS sanitized: {payload[:40]}...")
                else:
                    print_failure(f"XSS не оброблено: {payload[:40]}...")
            else:
                print_success(f"XSS відхилено на рівні API: {payload[:40]}...")
                
    except requests.exceptions.RequestException as e:
        print_failure(f"Помилка з'єднання: {e}")

# Тест 4: Rate Limiting (Brute Force)
def test_rate_limiting():
    print_test("Перевірка Rate Limiting (захист від Brute Force)")
    
    print("Спроба 10 входів за короткий час...")
    
    blocked = False
    for i in range(10):
        data = {
            "email": "test@example.com",
            "password": f"wrongpass{i}"
        }
        
        try:
            response = requests.post(f"{BASE_URL}/auth/login", json=data)
            print(f"  Спроба {i+1}: {response.status_code}", end="")
            
            if response.status_code == 429:
                print(" - ЗАБЛОКОВАНО")
                blocked = True
                break
            else:
                print()
            
            time.sleep(0.1)  # Невелика затримка
        except requests.exceptions.RequestException as e:
            print_failure(f"Помилка з'єднання: {e}")
            break
    
    if blocked:
        print_success("Rate limiting працює - запити заблоковано після перевищення ліміту")
    else:
        print_failure("Rate limiting НЕ працює - всі 10 спроб оброблено")

# Тест 5: CSRF Protection
def test_csrf_protection():
    print_test("Перевірка захисту від CSRF")
    
    # JWT в Authorization header захищає від CSRF
    print("Перевірка, що токени передаються через Authorization header...")
    
    data = {
        "username": "csrftest",
        "email": "csrftest@example.com",
        "password": "TestPass123"
    }
    
    try:
        response = requests.post(f"{BASE_URL}/auth/register", json=data)
        
        if 'access_token' in response.json():
            # Перевіряємо, що токен не в cookies
            if 'Set-Cookie' not in response.headers:
                print_success("Токен в response body, не в cookies - захист від CSRF")
            else:
                print_warning("Токен в cookies - можливо вразливо до CSRF")
        
        # Спроба запиту без токену
        accounts_response = requests.get(f"{BASE_URL}/accounts")
        
        if accounts_response.status_code == 401:
            print_success("Доступ без токену заборонено")
        else:
            print_failure("Доступ без токену дозволено!")
            
    except requests.exceptions.RequestException as e:
        print_failure(f"Помилка з'єднання: {e}")

# Тест 6: Security Headers
def test_security_headers():
    print_test("Перевірка Security Headers")
    
    try:
        response = requests.get(f"{BASE_URL}/auth/me")
        headers = response.headers
        
        required_headers = {
            'X-Content-Type-Options': 'nosniff',
            'X-Frame-Options': 'DENY',
            'X-XSS-Protection': '1; mode=block',
        }
        
        for header, expected_value in required_headers.items():
            if header in headers:
                if expected_value in headers[header]:
                    print_success(f"{header}: {headers[header]}")
                else:
                    print_warning(f"{header} присутній, але значення не збігається")
            else:
                print_failure(f"{header} відсутній")
        
        # Додаткові headers
        if 'Content-Security-Policy' in headers:
            print_success(f"Content-Security-Policy: присутній")
        else:
            print_warning("Content-Security-Policy відсутній")
            
    except requests.exceptions.RequestException as e:
        print_failure(f"Помилка з'єднання: {e}")

# Головна функція
def main():
    print(f"\n{Colors.BLUE}{'='*60}")
    print("   🔒 ТЕСТУВАННЯ БЕЗПЕКИ")
    print("   Personal Finance Manager")
    print(f"{'='*60}{Colors.END}\n")
    
    print(f"Тестування сервера: {BASE_URL}")
    print("Переконайтесь, що сервер запущено на localhost:5000\n")
    
    # Перевірка доступності сервера
    try:
        response = requests.get(BASE_URL.replace('/api', '/'))
        print_success("Сервер доступний\n")
    except requests.exceptions.RequestException:
        print_failure("Сервер недоступний!")
        print("Запустіть backend сервер: python run.py")
        sys.exit(1)
    
    # Запуск тестів
    test_weak_passwords()
    test_sql_injection()
    test_xss_attacks()
    test_rate_limiting()
    test_csrf_protection()
    test_security_headers()
    
    print(f"\n{Colors.BLUE}{'='*60}")
    print("   ✅ ТЕСТУВАННЯ ЗАВЕРШЕНО")
    print(f"{'='*60}{Colors.END}\n")

if __name__ == "__main__":
    main()

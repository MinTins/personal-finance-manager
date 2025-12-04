"""
Лабораторна робота №5: Перевірка безпеки веб-застосунку
Студент: Roman Flakey, ПЗС-1

Цей скрипт виконує комплексну перевірку безпеки веб-застосунку,
включаючи тестування на типові вразливості.
"""

import requests
import json
import time
from datetime import datetime
from urllib.parse import quote

class SecurityTester:
    def __init__(self, base_url):
        """
        Ініціалізація тестера безпеки
        
        Args:
            base_url: Базова URL сервера
        """
        self.base_url = base_url
        self.session = requests.Session()
        self.vulnerabilities = []
        self.passed_tests = []
        
        self.report = {
            'timestamp': datetime.now().isoformat(),
            'target': base_url,
            'vulnerabilities': [],
            'passed_tests': [],
            'summary': {}
        }
    
    def log_vulnerability(self, test_name, severity, description, evidence=""):
        """Логування знайденої вразливості"""
        vuln = {
            'test': test_name,
            'severity': severity,
            'description': description,
            'evidence': evidence,
            'timestamp': datetime.now().isoformat()
        }
        self.vulnerabilities.append(vuln)
        self.report['vulnerabilities'].append(vuln)
        
        severity_emoji = {
            'CRITICAL': '🔴',
            'HIGH': '🟠',
            'MEDIUM': '🟡',
            'LOW': '🟢',
            'INFO': 'ℹ️'
        }
        
        print(f"\n{severity_emoji.get(severity, '⚠️')} ВРАЗЛИВІСТЬ ЗНАЙДЕНО!")
        print(f"Тест: {test_name}")
        print(f"Рівень: {severity}")
        print(f"Опис: {description}")
        if evidence:
            print(f"Докази: {evidence}")
        print("-" * 60)
    
    def log_passed(self, test_name, description):
        """Логування пройденого тесту"""
        passed = {
            'test': test_name,
            'description': description,
            'timestamp': datetime.now().isoformat()
        }
        self.passed_tests.append(passed)
        self.report['passed_tests'].append(passed)
        
        print(f"✅ ТЕСТ ПРОЙДЕНО: {test_name}")
        print(f"   {description}")
    
    # ==================== SQL INJECTION TESTS ====================
    
    def test_sql_injection(self):
        """Тестування на SQL ін'єкції"""
        print("\n" + "="*60)
        print("ТЕСТ 1: SQL INJECTION")
        print("="*60)
        
        # SQL ін'єкції для тестування
        payloads = [
            "' OR '1'='1",
            "' OR 1=1--",
            "admin'--",
            "' UNION SELECT NULL--",
            "1' AND '1'='1",
        ]
        
        vulnerable = False
        
        # Тест на login endpoint
        for payload in payloads:
            try:
                data = {
                    'email': payload,
                    'password': 'test123'
                }
                
                response = self.session.post(
                    f"{self.base_url}/api/auth/login",
                    json=data,
                    timeout=5
                )
                
                # Перевіряємо чи є ознаки SQL помилки
                if response.status_code == 500:
                    if 'sql' in response.text.lower() or 'syntax' in response.text.lower():
                        vulnerable = True
                        self.log_vulnerability(
                            "SQL Injection",
                            "HIGH",
                            f"Можлива SQL ін'єкція через login форму",
                            f"Payload: {payload}, Response: {response.status_code}"
                        )
                        break
                
                # Перевіряємо чи повертається токен (успішна ін'єкція)
                if response.status_code == 200 and 'access_token' in response.text:
                    vulnerable = True
                    self.log_vulnerability(
                        "SQL Injection - Authentication Bypass",
                        "CRITICAL",
                        f"SQL ін'єкція дозволяє обійти автентифікацію!",
                        f"Payload: {payload}"
                    )
                    break
                    
            except Exception as e:
                print(f"Помилка при тестуванні SQL injection: {str(e)}")
        
        if not vulnerable:
            self.log_passed(
                "SQL Injection",
                "Застосунок захищений від SQL ін'єкцій (використовує ORM)"
            )
    
    # ==================== XSS TESTS ====================
    
    def test_xss(self):
        """Тестування на Cross-Site Scripting (XSS)"""
        print("\n" + "="*60)
        print("ТЕСТ 2: CROSS-SITE SCRIPTING (XSS)")
        print("="*60)
        
        xss_payloads = [
            "<script>alert('XSS')</script>",
            "<img src=x onerror=alert('XSS')>",
            "<svg/onload=alert('XSS')>",
            "javascript:alert('XSS')",
            "<iframe src='javascript:alert(1)'>",
        ]
        
        # Спробуємо отримати токен для тестування
        token = self._get_test_token()
        if not token:
            print("⚠️  Не вдалося отримати токен. Пропускаємо XSS тести.")
            return
        
        headers = {'Authorization': f'Bearer {token}'}
        vulnerable = False
        
        # Тест на створення категорії з XSS payload
        for payload in xss_payloads:
            try:
                data = {
                    'name': payload,
                    'type': 'expense',
                    'color': '#FF0000'
                }
                
                response = self.session.post(
                    f"{self.base_url}/api/categories",
                    json=data,
                    headers=headers,
                    timeout=5
                )
                
                # Якщо payload був збережений без санітизації
                if response.status_code == 201:
                    # Отримуємо створену категорію
                    get_response = self.session.get(
                        f"{self.base_url}/api/categories",
                        headers=headers,
                        timeout=5
                    )
                    
                    if payload in get_response.text:
                        vulnerable = True
                        self.log_vulnerability(
                            "Stored XSS",
                            "HIGH",
                            "Можлива Stored XSS вразливість через назву категорії",
                            f"Payload збережено: {payload}"
                        )
                        break
                        
            except Exception as e:
                print(f"Помилка при тестуванні XSS: {str(e)}")
        
        if not vulnerable:
            self.log_passed(
                "Cross-Site Scripting (XSS)",
                "Застосунок коректно обробляє потенційно небезпечний вміст"
            )
    
    # ==================== AUTHENTICATION TESTS ====================
    
    def test_weak_passwords(self):
        """Тестування слабких паролів"""
        print("\n" + "="*60)
        print("ТЕСТ 3: WEAK PASSWORD POLICY")
        print("="*60)
        
        weak_passwords = [
            '123',
            'pass',
            '111111',
            'abc',
            'test'
        ]
        
        vulnerable = False
        
        for password in weak_passwords:
            try:
                data = {
                    'username': f'testuser_{int(time.time())}',
                    'email': f'test_{int(time.time())}@example.com',
                    'password': password
                }
                
                response = self.session.post(
                    f"{self.base_url}/api/auth/register",
                    json=data,
                    timeout=5
                )
                
                if response.status_code == 201:
                    vulnerable = True
                    self.log_vulnerability(
                        "Weak Password Policy",
                        "MEDIUM",
                        f"Дозволяється використання слабких паролів",
                        f"Прийнятий пароль: {password} ({len(password)} символів)"
                    )
                    break
                    
            except Exception as e:
                print(f"Помилка при тестуванні weak passwords: {str(e)}")
        
        if not vulnerable:
            self.log_passed(
                "Password Policy",
                "Застосунок має адекватні вимоги до складності паролів"
            )
    
    def test_brute_force_protection(self):
        """Тестування захисту від brute-force атак"""
        print("\n" + "="*60)
        print("ТЕСТ 4: BRUTE FORCE PROTECTION")
        print("="*60)
        
        # Створюємо тестового користувача
        test_email = f'bruteforce_test_{int(time.time())}@example.com'
        register_data = {
            'username': f'bruteuser_{int(time.time())}',
            'email': test_email,
            'password': 'correctpassword123'
        }
        
        try:
            self.session.post(
                f"{self.base_url}/api/auth/register",
                json=register_data,
                timeout=5
            )
        except:
            pass
        
        # Намагаємося виконати багато невдалих спроб входу
        failed_attempts = 0
        vulnerable = True
        
        for i in range(10):
            try:
                data = {
                    'email': test_email,
                    'password': f'wrongpassword{i}'
                }
                
                response = self.session.post(
                    f"{self.base_url}/api/auth/login",
                    json=data,
                    timeout=5
                )
                
                if response.status_code == 401:
                    failed_attempts += 1
                elif response.status_code == 429:  # Too Many Requests
                    vulnerable = False
                    self.log_passed(
                        "Brute Force Protection",
                        f"Виявлено rate limiting після {failed_attempts} спроб"
                    )
                    break
                    
            except Exception as e:
                print(f"Помилка при тестуванні brute force: {str(e)}")
        
        if vulnerable and failed_attempts >= 10:
            self.log_vulnerability(
                "No Brute Force Protection",
                "HIGH",
                "Відсутній захист від brute-force атак на login endpoint",
                f"Виконано {failed_attempts} спроб без блокування"
            )
    
    # ==================== AUTHORIZATION TESTS ====================
    
    def test_broken_authentication(self):
        """Тестування порушень автентифікації"""
        print("\n" + "="*60)
        print("ТЕСТ 5: BROKEN AUTHENTICATION")
        print("="*60)
        
        vulnerable = False
        
        # Тест 1: Доступ до захищених endpoint без токену
        try:
            response = self.session.get(
                f"{self.base_url}/api/transactions",
                timeout=5
            )
            
            if response.status_code == 200:
                vulnerable = True
                self.log_vulnerability(
                    "Broken Authentication",
                    "CRITICAL",
                    "Захищені endpoints доступні без автентифікації",
                    "GET /api/transactions повертає 200 без токену"
                )
        except Exception as e:
            print(f"Помилка при тестуванні authentication: {str(e)}")
        
        # Тест 2: Використання недійсного токену
        try:
            headers = {'Authorization': 'Bearer invalid_token_12345'}
            response = self.session.get(
                f"{self.base_url}/api/transactions",
                headers=headers,
                timeout=5
            )
            
            if response.status_code == 200:
                vulnerable = True
                self.log_vulnerability(
                    "Broken Authentication",
                    "CRITICAL",
                    "Прийнятий недійсний JWT токен",
                    "Доступ до /api/transactions з недійсним токеном"
                )
        except Exception as e:
            pass
        
        if not vulnerable:
            self.log_passed(
                "Authentication",
                "JWT автентифікація працює коректно"
            )
    
    def test_idor(self):
        """Тестування Insecure Direct Object Reference (IDOR)"""
        print("\n" + "="*60)
        print("ТЕСТ 6: INSECURE DIRECT OBJECT REFERENCE (IDOR)")
        print("="*60)
        
        # Створюємо двох користувачів
        user1_token = self._create_test_user('user1')
        user2_token = self._create_test_user('user2')
        
        if not user1_token or not user2_token:
            print("⚠️  Не вдалося створити тестових користувачів")
            return
        
        vulnerable = False
        
        try:
            # Користувач 1 створює транзакцію
            headers1 = {'Authorization': f'Bearer {user1_token}'}
            transaction_data = {
                'type': 'expense',
                'amount': 100.00,
                'description': 'IDOR test transaction',
                'category_id': 1,
                'account_id': 1
            }
            
            response = self.session.post(
                f"{self.base_url}/api/transactions",
                json=transaction_data,
                headers=headers1,
                timeout=5
            )
            
            if response.status_code == 201:
                transaction_id = response.json().get('id')
                
                # Користувач 2 намагається отримати доступ до транзакції користувача 1
                headers2 = {'Authorization': f'Bearer {user2_token}'}
                response = self.session.get(
                    f"{self.base_url}/api/transactions/{transaction_id}",
                    headers=headers2,
                    timeout=5
                )
                
                if response.status_code == 200:
                    vulnerable = True
                    self.log_vulnerability(
                        "Insecure Direct Object Reference (IDOR)",
                        "HIGH",
                        "Користувач може отримати доступ до чужих даних",
                        f"User2 отримав доступ до транзакції User1 (ID: {transaction_id})"
                    )
                    
        except Exception as e:
            print(f"Помилка при тестуванні IDOR: {str(e)}")
        
        if not vulnerable:
            self.log_passed(
                "Access Control",
                "Належна перевірка прав доступу до об'єктів"
            )
    
    # ==================== SECURITY HEADERS TESTS ====================
    
    def test_security_headers(self):
        """Перевірка наявності security headers"""
        print("\n" + "="*60)
        print("ТЕСТ 7: SECURITY HEADERS")
        print("="*60)
        
        try:
            response = self.session.get(f"{self.base_url}/api/auth/login", timeout=5)
            headers = response.headers
            
            required_headers = {
                'X-Content-Type-Options': 'nosniff',
                'X-Frame-Options': ['DENY', 'SAMEORIGIN'],
                'X-XSS-Protection': '1; mode=block',
                'Strict-Transport-Security': None,  # Для HTTPS
            }
            
            missing_headers = []
            
            for header, expected_value in required_headers.items():
                if header not in headers:
                    missing_headers.append(header)
                elif expected_value and isinstance(expected_value, list):
                    if headers[header] not in expected_value:
                        missing_headers.append(f"{header} (incorrect value)")
                elif expected_value and headers[header] != expected_value:
                    missing_headers.append(f"{header} (incorrect value)")
            
            if missing_headers:
                self.log_vulnerability(
                    "Missing Security Headers",
                    "MEDIUM",
                    "Відсутні важливі security headers",
                    f"Відсутні: {', '.join(missing_headers)}"
                )
            else:
                self.log_passed(
                    "Security Headers",
                    "Всі необхідні security headers присутні"
                )
                
        except Exception as e:
            print(f"Помилка при перевірці headers: {str(e)}")
    
    # ==================== SENSITIVE DATA EXPOSURE ====================
    
    def test_sensitive_data_exposure(self):
        """Перевірка на витік чутливих даних"""
        print("\n" + "="*60)
        print("ТЕСТ 8: SENSITIVE DATA EXPOSURE")
        print("="*60)
        
        token = self._get_test_token()
        if not token:
            print("⚠️  Не вдалося отримати токен")
            return
        
        vulnerable = False
        
        try:
            headers = {'Authorization': f'Bearer {token}'}
            response = self.session.get(
                f"{self.base_url}/api/auth/me",
                headers=headers,
                timeout=5
            )
            
            if response.status_code == 200:
                data = response.json()
                
                # Перевіряємо чи не витікає password hash
                sensitive_fields = ['password', 'password_hash', 'secret_key']
                found_sensitive = [field for field in sensitive_fields if field in str(data).lower()]
                
                if found_sensitive:
                    vulnerable = True
                    self.log_vulnerability(
                        "Sensitive Data Exposure",
                        "HIGH",
                        "API повертає чутливі дані в response",
                        f"Знайдено поля: {', '.join(found_sensitive)}"
                    )
                    
        except Exception as e:
            print(f"Помилка при перевірці sensitive data: {str(e)}")
        
        if not vulnerable:
            self.log_passed(
                "Data Exposure",
                "Чутливі дані не витікають через API"
            )
    
    # ==================== HELPER METHODS ====================
    
    def _get_test_token(self):
        """Отримати токен для тестування"""
        try:
            # Реєструємо тестового користувача
            register_data = {
                'username': f'sectest_{int(time.time())}',
                'email': f'sectest_{int(time.time())}@example.com',
                'password': 'TestPassword123!'
            }
            
            self.session.post(
                f"{self.base_url}/api/auth/register",
                json=register_data,
                timeout=5
            )
            
            # Логінимось
            login_data = {
                'email': register_data['email'],
                'password': register_data['password']
            }
            
            response = self.session.post(
                f"{self.base_url}/api/auth/login",
                json=login_data,
                timeout=5
            )
            
            if response.status_code == 200:
                return response.json().get('access_token')
                
        except Exception as e:
            print(f"Помилка отримання токену: {str(e)}")
        
        return None
    
    def _create_test_user(self, username_prefix):
        """Створити тестового користувача і повернути токен"""
        try:
            timestamp = int(time.time())
            register_data = {
                'username': f'{username_prefix}_{timestamp}',
                'email': f'{username_prefix}_{timestamp}@example.com',
                'password': 'TestPassword123!'
            }
            
            response = self.session.post(
                f"{self.base_url}/api/auth/register",
                json=register_data,
                timeout=5
            )
            
            if response.status_code in [200, 201]:
                # Логінимось
                login_data = {
                    'email': register_data['email'],
                    'password': register_data['password']
                }
                
                response = self.session.post(
                    f"{self.base_url}/api/auth/login",
                    json=login_data,
                    timeout=5
                )
                
                if response.status_code == 200:
                    return response.json().get('access_token')
                    
        except Exception as e:
            print(f"Помилка створення користувача: {str(e)}")
        
        return None
    
    # ==================== REPORTING ====================
    
    def generate_report(self):
        """Генерація підсумкового звіту"""
        print("\n\n" + "="*60)
        print("ПІДСУМКОВИЙ ЗВІТ З БЕЗПЕКИ")
        print("="*60)
        
        total_tests = len(self.vulnerabilities) + len(self.passed_tests)
        
        self.report['summary'] = {
            'total_tests': total_tests,
            'vulnerabilities_found': len(self.vulnerabilities),
            'tests_passed': len(self.passed_tests),
            'critical': len([v for v in self.vulnerabilities if v['severity'] == 'CRITICAL']),
            'high': len([v for v in self.vulnerabilities if v['severity'] == 'HIGH']),
            'medium': len([v for v in self.vulnerabilities if v['severity'] == 'MEDIUM']),
            'low': len([v for v in self.vulnerabilities if v['severity'] == 'LOW']),
        }
        
        print(f"\n📊 Статистика:")
        print(f"  Всього тестів: {total_tests}")
        print(f"  Знайдено вразливостей: {len(self.vulnerabilities)}")
        print(f"  Пройдено тестів: {len(self.passed_tests)}")
        
        if self.vulnerabilities:
            print(f"\n⚠️  Вразливості за рівнем серйозності:")
            print(f"  🔴 Critical: {self.report['summary']['critical']}")
            print(f"  🟠 High: {self.report['summary']['high']}")
            print(f"  🟡 Medium: {self.report['summary']['medium']}")
            print(f"  🟢 Low: {self.report['summary']['low']}")
            
            print(f"\n📋 Список вразливостей:")
            for i, vuln in enumerate(self.vulnerabilities, 1):
                print(f"\n  {i}. [{vuln['severity']}] {vuln['test']}")
                print(f"     {vuln['description']}")
                if vuln['evidence']:
                    print(f"     Докази: {vuln['evidence']}")
        else:
            print("\n✅ Критичних вразливостей не знайдено!")
        
        # Зберігаємо звіт у JSON
        filename = f'security_report_{datetime.now().strftime("%Y%m%d_%H%M%S")}.json'
        with open(filename, 'w', encoding='utf-8') as f:
            json.dump(self.report, f, indent=2, ensure_ascii=False)
        
        print(f"\n💾 Детальний звіт збережено: {filename}")
        print("="*60)
        
        return self.report
    
    # ==================== RUN ALL TESTS ====================
    
    def run_all_tests(self):
        """Запустити всі тести безпеки"""
        print("\n" + "#"*60)
        print("ПОЧАТОК ТЕСТУВАННЯ БЕЗПЕКИ")
        print(f"Цільовий сервер: {self.base_url}")
        print(f"Час: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
        print("#"*60)
        
        # Запускаємо всі тести
        self.test_sql_injection()
        time.sleep(0.5)
        
        self.test_xss()
        time.sleep(0.5)
        
        self.test_weak_passwords()
        time.sleep(0.5)
        
        self.test_brute_force_protection()
        time.sleep(0.5)
        
        self.test_broken_authentication()
        time.sleep(0.5)
        
        self.test_idor()
        time.sleep(0.5)
        
        self.test_security_headers()
        time.sleep(0.5)
        
        self.test_sensitive_data_exposure()
        
        # Генеруємо звіт
        self.generate_report()


def main():
    """Головна функція"""
    print("="*60)
    print("АВТОМАТИЗОВАНЕ ТЕСТУВАННЯ БЕЗПЕКИ ВЕБ-ЗАСТОСУНКУ")
    print("Лабораторна робота №5")
    print("Студент: Roman Flakey, PZS-1")
    print("="*60)
    
    # URL для тестування
    target_url = input("\nВведіть URL сервера для тестування (за замовчуванням http://localhost:5000): ").strip()
    if not target_url:
        target_url = "http://localhost:5000"
    
    print(f"\n🎯 Цільовий сервер: {target_url}")
    print("⚠️  УВАГА: Це тестування може створити тестові дані в базі даних!")
    confirm = input("Продовжити? (y/n): ").strip().lower()
    
    if confirm != 'y':
        print("Тестування скасовано.")
        return
    
    # Створюємо тестер і запускаємо тести
    tester = SecurityTester(target_url)
    tester.run_all_tests()
    
    print("\n✅ Тестування завершено!")


if __name__ == '__main__':
    main()

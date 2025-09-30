# Personal Finance Manager 💰

**Студент:** Флакей Роман, ПЗС-1  
**Дисципліна:** Розробка та використання інформаційних мереж  
**GitHub:** https://github.com/MinTins/personal-finance-manager

---

## Опис проекту

Персональний фінансовий трекер - веб-застосунок для управління особистими фінансами з можливістю відстеження доходів, витрат, створення бюджетів та візуалізації фінансової активності.

### Реалізовані лабораторні роботи:

✅ **Лабораторна №1** - Backend розробка (Flask, MySQL, REST API)  
✅ **Лабораторна №2** - Frontend розробка (React, динамічний інтерфейс)  
✅ **Лабораторна №3** - Web API (REST endpoints, JWT автентифікація)  
✅ **Лабораторна №4** - Розгортання та продуктивність  
✅ **Лабораторна №5** - Безпека веб-застосунків

---

## Технологічний стек

### Backend:
- Python 3.10+
- Flask 3.0 - веб-фреймворк
- Flask-SQLAlchemy - ORM
- Flask-JWT-Extended - автентифікація
- MySQL 8.0 - база даних
- Flask-CORS - підтримка CORS

### Frontend:
- React 18 - UI бібліотека
- Vite - збірник
- Axios - HTTP клієнт
- Chart.js - візуалізація даних
- Tailwind CSS - стилізація

### Зовнішнє API:
- ExchangeRate-API - курси валют

---

## Основний функціонал

### Автентифікація та авторизація:
- Реєстрація нових користувачів
- Логін з JWT токенами
- Захист приватних маршрутів

### Управління транзакціями:
- Додавання доходів та витрат
- Категоризація транзакцій
- Редагування та видалення
- Фільтрація за датою та категорією

### Бюджети:
- Створення бюджетів за категоріями
- Відстеження витрат відносно бюджету
- Періодичні бюджети (місяць, тиждень, рік)

### Візуалізація:
- Графіки доходів/витрат
- Розподіл по категоріях
- Статистика за період

### Інтеграція з зовнішнім API:
- Курси валют в реальному часі
- Конвертація між валютами

---

## Швидкий старт

### Передумови:
- Python 3.10+
- Node.js 18+
- MySQL 8.0
- Git

### 1. Клонування репозиторію
```bash
git clone https://github.com/MinTins/personal-finance-manager.git
cd personal-finance-manager
```

### 2. Налаштування Backend

```bash
cd backend

# Створення віртуального середовища
python -m venv venv

# Активація (Windows)
venv\Scripts\activate
# Активація (Linux/Mac)
source venv/bin/activate

# Встановлення залежностей
pip install -r requirements.txt

# Налаштування бази даних
mysql -u root -p < database.sql

# Створення .env файлу
cp .env.example .env
# Відредагуйте .env з вашими налаштуваннями

# Запуск сервера
python run.py
```

Backend буде доступний на: `http://localhost:5000`

### 3. Налаштування Frontend

```bash
cd ../frontend

# Встановлення залежностей
npm install

# Запуск dev сервера
npm run dev
```

Frontend буде доступний на: `http://localhost:5173`

---

## Структура проекту

```
personal-finance-manager/
├── backend/              # Flask API
│   ├── app/
│   │   ├── models.py     # SQLAlchemy моделі
│   │   ├── routes.py     # API endpoints
│   │   ├── auth.py       # Автентифікація
│   │   └── config.py     # Конфігурація
│   ├── requirements.txt
│   ├── run.py
│   └── database.sql
├── frontend/             # React додаток
│   ├── src/
│   │   ├── components/   # React компоненти
│   │   ├── services/     # API сервіси
│   │   └── App.jsx
│   └── package.json
├── docs/                 # Документація
└── tests/                # Тести
```

---

## API Endpoints

### Автентифікація:
- `POST /api/auth/register` - Реєстрація
- `POST /api/auth/login` - Логін
- `GET /api/auth/me` - Поточний користувач

### Транзакції:
- `GET /api/transactions` - Список транзакцій
- `POST /api/transactions` - Створити транзакцію
- `PUT /api/transactions/<id>` - Оновити транзакцію
- `DELETE /api/transactions/<id>` - Видалити транзакцію

### Категорії:
- `GET /api/categories` - Список категорій
- `POST /api/categories` - Створити категорію

### Бюджети:
- `GET /api/budgets` - Список бюджетів
- `POST /api/budgets` - Створити бюджет

### Зовнішнє API:
- `GET /api/exchange-rates` - Курси валют

Повна документація API: [docs/API.md](docs/API.md)

---

## Тестування

### Backend тести:
```bash
cd backend
pytest
```

### Frontend тести:
```bash
cd frontend
npm test
```

### Сканування безпеки (OWASP ZAP):
```bash
# Дивіться docs/SECURITY.md
```

---

## Розгортання

Інструкції з розгортання на продакшн сервері знаходяться в [docs/SETUP.md](docs/SETUP.md)

### Опції розгортання:
- **VPS** (DigitalOcean, Linode)
- **PaaS** (Heroku, Render)
- **Docker** контейнеризація

---

## Безпека

Реалізовані заходи безпеки:
- JWT токени для автентифікації
- Хешування паролів (bcrypt)
- CORS налаштування
- SQL injection захист (SQLAlchemy ORM)
- XSS захист
- CSRF токени
- Rate limiting

Детальніше: [docs/SECURITY.md](docs/SECURITY.md)

---

## Етапи розробки

- [x] Етап 1: Ініціалізація проекту
- [x] Етап 2: Backend API
- [x] Етап 3: Frontend компоненти
- [x] Етап 4: Інтеграція зовнішнього API
- [x] Етап 5: Тестування та безпека
- [x] Етап 6: Документація
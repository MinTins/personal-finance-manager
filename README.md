# Personal Finance Manager 💰

**Студент:** Флакей Роман, ПЗС-1  
**Дисципліна:** Розробка та використання інформаційних мереж  
**GitHub:** https://github.com/MinTins/personal-finance-manager

---

## Опис проекту

Персональний фінансовий трекер - веб-застосунок для управління особистими фінансами з можливістю відстеження доходів, витрат, створення бюджетів та візуалізації фінансової активності.

### Проміжні лабораторні роботи:

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

## Швидкий старт (Windows 11)

### Передумови:
- Python 3.10+ ([завантажити](https://www.python.org/downloads/))
- Node.js 18+ ([завантажити](https://nodejs.org/))
- MySQL 8.0 ([завантажити](https://dev.mysql.com/downloads/installer/))
- Git ([завантажити](https://git-scm.com/download/win))

### 1. Клонування репозиторію
```powershell
git clone https://github.com/MinTins/personal-finance-manager.git
cd personal-finance-manager
```

### 2. Створення структури проекту
```powershell
# PowerShell
.\setup-structure.ps1

# Або через CMD
setup-structure.bat
```

### 3. Налаштування MySQL
```powershell
# Запустіть MySQL Command Line Client або MySQL Workbench
# Виконайте:
mysql -u root -p
# Введіть пароль root користувача

# В MySQL консолі:
source backend/database.sql
# Або скопіюйте вміст database.sql і виконайте в Workbench
```

### 4. Налаштування Backend
```powershell
cd backend

# Створення віртуального середовища
python -m venv venv

# Активація віртуального середовища
venv\Scripts\activate

# Встановлення залежностей
pip install -r requirements.txt

# Копіювання конфігурації
copy .env.example .env

# Відредагуйте .env файл у текстовому редакторі
# notepad .env

# Запуск сервера
python run.py
```

Backend буде доступний на: `http://localhost:5000`

### 5. Налаштування Frontend (у новому терміналі)
```powershell
cd frontend

# Встановлення залежностей
npm install

# Запуск dev сервера
npm run dev
```

Frontend буде доступний на: `http://localhost:5173`

### Тестові дані для входу:
- **Username:** `demo_user`
- **Password:** `password123`

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
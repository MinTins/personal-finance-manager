# 📦 Інструкція зі встановлення та запуску

## Ubuntu/Linux

### Вимоги
- Python 3.8+
- Node.js 16+
- MySQL 8.0+

### Встановлення

```bash
# 1. Клонуйте репозиторій
git clone <repository-url>
cd personal-finance-manager1

# 2. Налаштування бази даних
mysql -u root -p
CREATE DATABASE personal_finance_manager CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci;
exit

# Імпорт схеми БД
mysql -u root -p personal_finance_manager < database.sql

# 3. Backend
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt

# Створіть .env файл
cp .env.example .env
# Відредагуйте .env (встановіть DATABASE_URL, SECRET_KEY)

# 4. Frontend
cd ../frontend
npm install

# Створіть .env файл (якщо потрібно)
echo "VITE_API_URL=http://localhost:5000" > .env
```

### Запуск

```bash
# Terminal 1 - Backend
cd backend
source venv/bin/activate
python run.py

# Terminal 2 - Frontend
cd frontend
npm run dev
```

Відкрийте браузер: http://localhost:5173

---

## Windows

### Вимоги
- Python 3.8+
- Node.js 16+
- MySQL 8.0+ або XAMPP

### Встановлення

```powershell
# 1. Клонуйте репозиторій
git clone <repository-url>
cd personal-finance-manager1

# 2. Налаштування бази даних (MySQL Command Line або phpMyAdmin)
# Виконайте:
CREATE DATABASE personal_finance_manager CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci;
# Імпортуйте database.sql через phpMyAdmin або:
mysql -u root -p personal_finance_manager < database.sql

# 3. Backend
cd backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt

# Створіть .env файл
copy .env.example .env
# Відредагуйте .env у текстовому редакторі

# 4. Frontend
cd ..\frontend
npm install

# Створіть .env файл (якщо потрібно)
echo VITE_API_URL=http://localhost:5000 > .env
```

### Запуск

```powershell
# Terminal 1 - Backend
cd backend
venv\Scripts\activate
python run.py

# Terminal 2 - Frontend
cd frontend
npm run dev
```

Відкрийте браузер: http://localhost:5173

---

## 🔐 Тестові облікові записи

**Користувач:**
- Email: test@example.com
- Пароль: password123

**Адмін:**
- Email: admin@example.com
- Пароль: admin123

---

## ⚙️ Налаштування .env (Backend)

```env
DATABASE_URL=mysql+pymysql://root:password@localhost:3306/personal_finance_manager
SECRET_KEY=your-secret-key-here
JWT_SECRET_KEY=your-jwt-secret-key-here
```

---

## 🐛 Поширені проблеми

**MySQL Connection Error:**
- Перевірте чи запущений MySQL
- Перевірте DATABASE_URL у .env

**Port already in use:**
- Backend: змініть порт у run.py
- Frontend: змініть порт у vite.config.js

**Module not found:**
- Backend: `pip install -r requirements.txt`
- Frontend: `npm install`

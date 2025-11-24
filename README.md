# Personal Finance Manager - Deployment

## 📦 Що в цій папці

### Docker файли (Lab 4)
- `backend.Dockerfile` - Docker образ для backend
- `frontend.Dockerfile` - Docker образ для frontend
- `nginx.conf` - Конфігурація Nginx
- `docker-compose.yml` - Оркестрація сервісів
- `.env.example` - Приклад environment variables

### Security файли (Lab 5)
- `security_middleware.py` - Security headers та валідація
- `rate_limiter.py` - Захист від brute force
- `security_test.py` - Автоматичні тести безпеки

### Deployment скрипти
- `deploy.sh` - Швидкий deploy на localhost
- `vps-deploy.sh` - Deploy на VPS сервер

### Код файли
- `budgets.py` - Backend для бюджетів (виправлений)
- `BudgetList.jsx` - Frontend для бюджетів (виправлений)
- `.gitignore` - Ігнорування файлів для git

---

## 🚀 Швидкий старт (Localhost)

### 1. Підготовка

```bash
# Скопіюйте файли в проект:
cp backend.Dockerfile backend/Dockerfile
cp frontend.Dockerfile frontend/Dockerfile
cp nginx.conf frontend/
cp docker-compose.yml .
cp .env.example .env
```

### 2. Налаштування

Відредагуйте `.env`:
```bash
nano .env
```

Додайте ваші ключі:
```env
SECRET_KEY=згенеруйте_32_символьний_ключ
JWT_SECRET_KEY=згенеруйте_32_символьний_ключ
DB_ROOT_PASSWORD=ваш_пароль
DB_PASSWORD=ваш_пароль
EXCHANGE_RATE_API_KEY=ваш_api_key
```

### 3. Запуск

```bash
# Автоматично
chmod +x deploy.sh
./deploy.sh

# АБО вручну
docker-compose up -d --build
```

### 4. Доступ

- Frontend: http://localhost
- Backend API: http://localhost/api
- MySQL: localhost:3306

---

## 🌍 Deploy на VPS

### Автоматичний

```bash
# На VPS сервері (Ubuntu 22.04/24.04)
wget https://your-repo/vps-deploy.sh
sudo bash vps-deploy.sh
```

### Ручний

```bash
# 1. Встановлення Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# 2. Встановлення Docker Compose
sudo apt-get install docker-compose-plugin

# 3. Firewall
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable

# 4. Клонування проекту
cd /var/www
git clone https://github.com/MinTins/personal-finance-manager.git
cd personal-finance-manager

# 5. Налаштування .env
cp .env.example .env
nano .env

# 6. Запуск
docker-compose up -d --build
```

### SSL сертифікат (Let's Encrypt)

```bash
# Встановлення Certbot
sudo apt-get install certbot python3-certbot-nginx

# Отримання сертифікату
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com

# Автоматичне оновлення
sudo certbot renew --dry-run
```

---

## 🔐 Security (Lab 5)

### 1. Інтеграція security middleware

Додайте в `backend/app/__init__.py`:

```python
from app.security_middleware import SecurityMiddleware
from app.rate_limiter import init_rate_limiter

# Додайте security headers
app = SecurityMiddleware.add_security_headers(app)

# Ініціалізуйте rate limiter
limiter = init_rate_limiter(app)
```

### 2. Використання в routes

У `backend/app/routes/auth.py`:

```python
from app.rate_limiter import limiter

@auth_bp.route('/login', methods=['POST'])
@limiter.limit("5 per minute")
def login():
    # ... код
```

### 3. Запуск тестів безпеки

```bash
# Переконайтеся що backend запущено на localhost:5000
python security_test.py
```

Тести перевіряють:
- ✅ Захист від слабких паролів
- ✅ Захист від SQL Injection
- ✅ Захист від XSS
- ✅ Rate Limiting (Brute Force)
- ✅ CSRF Protection
- ✅ Security Headers

---

## 🔧 Корисні команди

### Docker

```bash
# Перегляд логів
docker-compose logs -f
docker-compose logs backend
docker-compose logs frontend

# Статус контейнерів
docker-compose ps

# Перезапуск
docker-compose restart
docker-compose restart backend

# Зупинка
docker-compose down

# Повне видалення (з volumes)
docker-compose down -v

# Перебудова
docker-compose up -d --build

# Вхід в контейнер
docker exec -it pfm_backend bash
docker exec -it pfm_mysql mysql -u root -p
```

### Моніторинг

```bash
# Використання ресурсів
docker stats

# Дисковий простір
docker system df

# Очищення
docker system prune -a
```

---

## 📊 Тестування продуктивності

### Lighthouse (Frontend)

```bash
npm install -g lighthouse
lighthouse http://localhost --output html
```

### Apache Bench (Backend)

```bash
# Встановлення
sudo apt-get install apache2-utils

# Тест
ab -n 1000 -c 10 http://localhost/api/categories
```

### Очікувані результати

- **Performance**: 95+
- **Response Time**: <50ms
- **RPS**: 500+
- **RAM**: <600MB total

---

## 🐛 Troubleshooting

### Backend не підключається до MySQL

```bash
# Перевірте логи
docker-compose logs mysql

# Перевірте health check
docker inspect pfm_mysql | grep Health

# Зачекайте 30-40 секунд після запуску
```

### Frontend показує 502

```bash
# Перевірте backend
docker-compose logs backend

# Перезапустіть
docker-compose restart backend
```

### Порти зайняті

```bash
# Знайдіть процес
sudo lsof -i :80
sudo lsof -i :5000

# Вбийте процес або змініть порти в docker-compose.yml
```

---

## ✅ Checklist

### Перед запуском

- [ ] Docker встановлено
- [ ] Docker Compose встановлено
- [ ] `.env` файл створено
- [ ] Всі ключі згенеровані
- [ ] `EXCHANGE_RATE_API_KEY` додано
- [ ] Порти 80, 5000, 3306 вільні
- [ ] `database.sql` присутній

### Після запуску

- [ ] Контейнери запущені (`docker-compose ps`)
- [ ] Frontend відкривається
- [ ] Backend API відповідає
- [ ] Можна зареєструватися
- [ ] Можна створити транзакцію
- [ ] Security тести пройдені

---

## 📝 Структура файлів у проекті

```
personal-finance-manager/
├── backend/
│   ├── Dockerfile              ← backend.Dockerfile
│   ├── app/
│   │   ├── __init__.py
│   │   ├── routes/
│   │   │   └── budgets.py      ← budgets.py (оновлений)
│   │   └── security/           ← нова папка
│   │       ├── middleware.py   ← security_middleware.py
│   │       └── rate_limiter.py ← rate_limiter.py
│   └── ...
├── frontend/
│   ├── Dockerfile              ← frontend.Dockerfile
│   ├── nginx.conf              ← nginx.conf
│   ├── src/
│   │   └── components/
│   │       └── Budget/
│   │           └── BudgetList.jsx ← BudgetList.jsx (оновлений)
│   └── ...
├── docker-compose.yml          ← docker-compose.yml
├── .env                        ← створити з .env.example
├── .gitignore                  ← .gitignore
├── deploy.sh                   ← deploy.sh
└── security_test.py            ← security_test.py
```

---

**Виконав:** Roman Flakey, PZS-1  
**Дата:** 24.11.2025

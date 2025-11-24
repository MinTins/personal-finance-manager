#!/bin/bash
# deploy.sh - Скрипт для швидкого розгортання Personal Finance Manager

set -e

echo "🚀 Personal Finance Manager - Deployment Script"
echo "================================================"
echo ""

# Кольори для виводу
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Функція для виведення повідомлень
info() {
    echo -e "${GREEN}✓${NC} $1"
}

warn() {
    echo -e "${YELLOW}⚠${NC} $1"
}

error() {
    echo -e "${RED}✗${NC} $1"
    exit 1
}

# Перевірка наявності Docker
if ! command -v docker &> /dev/null; then
    error "Docker не встановлено. Встановіть Docker: https://docs.docker.com/get-docker/"
fi

if ! command -v docker-compose &> /dev/null && ! docker compose version &> /dev/null; then
    error "Docker Compose не встановлено"
fi

info "Docker встановлено"

# Перевірка .env файлу
if [ ! -f .env ]; then
    warn ".env файл не знайдено. Створюємо з прикладу..."
    
    if [ ! -f .env.example ]; then
        error ".env.example не знайдено"
    fi
    
    cp .env.example .env
    
    # Генерація випадкових ключів
    SECRET_KEY=$(openssl rand -hex 32)
    JWT_SECRET_KEY=$(openssl rand -hex 32)
    DB_ROOT_PASSWORD=$(openssl rand -hex 16)
    DB_PASSWORD=$(openssl rand -hex 16)
    
    # Заміна в .env
    sed -i "s/your_32_character_secret_key_here_minimum/$SECRET_KEY/" .env
    sed -i "s/your_32_character_jwt_secret_here_minimum/$JWT_SECRET_KEY/" .env
    sed -i "s/your_strong_root_password_here/$DB_ROOT_PASSWORD/" .env
    sed -i "s/your_strong_db_password_here/$DB_PASSWORD/" .env
    
    info ".env файл створено з випадковими ключами"
    warn "⚠️  НЕ ЗАБУДЬТЕ додати EXCHANGE_RATE_API_KEY в .env файл!"
    echo ""
    read -p "Натисніть Enter для продовження після редагування .env..."
fi

info ".env файл знайдено"

# Перевірка структури проекту
if [ ! -d "backend" ]; then
    error "Директорія backend не знайдена"
fi

if [ ! -d "frontend" ]; then
    error "Директорія frontend не знайдена"
fi

if [ ! -f "docker-compose.yml" ]; then
    error "docker-compose.yml не знайдено"
fi

info "Структура проекту коректна"

# Зупинка попередніх контейнерів
echo ""
echo "Зупинка попередніх контейнерів..."
docker-compose down 2>/dev/null || docker compose down 2>/dev/null || true

# Очищення старих образів (опціонально)
read -p "Видалити старі Docker образи? (y/N): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    docker-compose down --rmi all 2>/dev/null || docker compose down --rmi all 2>/dev/null || true
    info "Старі образи видалено"
fi

# Збірка та запуск
echo ""
echo "🔨 Збірка Docker образів..."
docker-compose build || docker compose build || error "Помилка при збірці"

info "Образи зібрано успішно"

echo ""
echo "🚀 Запуск контейнерів..."
docker-compose up -d || docker compose up -d || error "Помилка при запуску"

info "Контейнери запущено"

# Очікування запуску MySQL
echo ""
echo "⏳ Очікування запуску MySQL (це може зайняти 30-40 секунд)..."
sleep 10

# Перевірка статусу
echo ""
echo "📊 Статус контейнерів:"
docker-compose ps || docker compose ps

# Перевірка логів
echo ""
echo "📝 Останні логи backend:"
docker-compose logs --tail=10 backend || docker compose logs --tail=10 backend

# Перевірка доступності
echo ""
echo "🔍 Перевірка доступності..."
sleep 5

if curl -s http://localhost/ > /dev/null; then
    info "Frontend доступний на http://localhost"
else
    warn "Frontend не відповідає. Перевірте логи: docker-compose logs frontend"
fi

if curl -s http://localhost/api/ > /dev/null; then
    info "Backend API доступний на http://localhost/api"
else
    warn "Backend не відповідає. Перевірте логи: docker-compose logs backend"
fi

# Завершення
echo ""
echo "================================================"
echo -e "${GREEN}✓ Розгортання завершено!${NC}"
echo ""
echo "📍 Сервіси:"
echo "   Frontend: http://localhost"
echo "   Backend API: http://localhost/api"
echo "   MySQL: localhost:3306"
echo ""
echo "📋 Корисні команди:"
echo "   Перегляд логів:    docker-compose logs -f"
echo "   Зупинка:           docker-compose down"
echo "   Перезапуск:        docker-compose restart"
echo "   Статус:            docker-compose ps"
echo ""
echo "🔐 Тестування безпеки:"
echo "   python security_test.py"
echo ""

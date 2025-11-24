#!/bin/bash
# vps-deploy.sh - Скрипт для розгортання на VPS (Ubuntu 22.04/24.04)

set -e

echo "🌍 Personal Finance Manager - VPS Deployment"
echo "============================================="
echo ""

# Перевірка прав root
if [ "$EUID" -ne 0 ]; then 
    echo "❌ Запустіть скрипт з правами root: sudo bash vps-deploy.sh"
    exit 1
fi

# Встановлення Docker
echo "📦 Встановлення Docker..."
if ! command -v docker &> /dev/null; then
    curl -fsSL https://get.docker.com -o get-docker.sh
    sh get-docker.sh
    rm get-docker.sh
    systemctl enable docker
    systemctl start docker
    echo "✓ Docker встановлено"
else
    echo "✓ Docker вже встановлено"
fi

# Встановлення Docker Compose
echo "📦 Встановлення Docker Compose..."
if ! docker compose version &> /dev/null; then
    apt-get update
    apt-get install -y docker-compose-plugin
    echo "✓ Docker Compose встановлено"
else
    echo "✓ Docker Compose вже встановлено"
fi

# Налаштування firewall
echo "🔥 Налаштування firewall..."
apt-get install -y ufw
ufw --force enable
ufw allow 22/tcp   # SSH
ufw allow 80/tcp   # HTTP
ufw allow 443/tcp  # HTTPS
echo "✓ Firewall налаштовано"

# Створення директорії проекту
PROJECT_DIR="/var/www/personal-finance-manager"
echo "📁 Створення директорії проекту: $PROJECT_DIR"
mkdir -p $PROJECT_DIR

# Клонування репозиторію
echo "📥 Завантаження проекту..."
read -p "Введіть URL git репозиторію: " REPO_URL

if [ -z "$REPO_URL" ]; then
    echo "❌ URL репозиторію не вказано"
    exit 1
fi

cd /var/www
rm -rf personal-finance-manager
git clone $REPO_URL personal-finance-manager
cd personal-finance-manager

# Створення .env файлу
echo "🔐 Налаштування environment variables..."
if [ ! -f .env ]; then
    cp .env.example .env
    
    # Генерація безпечних ключів
    SECRET_KEY=$(openssl rand -hex 32)
    JWT_SECRET_KEY=$(openssl rand -hex 32)
    DB_ROOT_PASSWORD=$(openssl rand -hex 16)
    DB_PASSWORD=$(openssl rand -hex 16)
    
    sed -i "s/your_32_character_secret_key_here_minimum/$SECRET_KEY/" .env
    sed -i "s/your_32_character_jwt_secret_here_minimum/$JWT_SECRET_KEY/" .env
    sed -i "s/your_strong_root_password_here/$DB_ROOT_PASSWORD/" .env
    sed -i "s/your_strong_db_password_here/$DB_PASSWORD/" .env
    
    echo "✓ .env файл створено"
    echo ""
    echo "⚠️  ВАЖЛИВО: Відредагуйте .env файл:"
    echo "    nano .env"
    echo ""
    echo "Додайте:"
    echo "  - EXCHANGE_RATE_API_KEY=your_api_key"
    echo ""
    read -p "Натисніть Enter після редагування .env..."
fi

# Запуск контейнерів
echo "🚀 Запуск Docker контейнерів..."
docker compose up -d --build

# Очікування запуску
echo "⏳ Очікування запуску сервісів (40 секунд)..."
sleep 40

# Перевірка статусу
echo "📊 Статус контейнерів:"
docker compose ps

# Отримання IP адреси
SERVER_IP=$(curl -s ifconfig.me)
echo ""
echo "============================================="
echo "✓ Розгортання завершено!"
echo ""
echo "📍 Доступ до сервісів:"
echo "   http://$SERVER_IP"
echo "   http://$SERVER_IP/api"
echo ""
echo "🔐 SSL сертифікат (Let's Encrypt):"
echo "   1. apt-get install -y certbot python3-certbot-nginx"
echo "   2. certbot --nginx -d yourdomain.com"
echo "   3. Автоматичне оновлення: certbot renew --dry-run"
echo ""
echo "📋 Корисні команди:"
echo "   cd $PROJECT_DIR"
echo "   docker compose logs -f"
echo "   docker compose restart"
echo "   docker compose down"
echo ""

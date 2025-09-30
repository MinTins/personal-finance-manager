-- Personal Finance Manager Database Schema
-- Для Windows 11: виконайте в MySQL Workbench або через командний рядок
-- mysql -u root -p < database.sql

-- Створення бази даних
DROP DATABASE IF EXISTS finance_manager;
CREATE DATABASE finance_manager CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE finance_manager;

-- Таблиця користувачів
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_username (username),
    INDEX idx_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Таблиця категорій
CREATE TABLE categories (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    name VARCHAR(50) NOT NULL,
    type ENUM('income', 'expense') NOT NULL,
    color VARCHAR(7) DEFAULT '#3B82F6',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_type (user_id, type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Таблиця транзакцій
CREATE TABLE transactions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    category_id INT NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'UAH',
    description TEXT,
    date DATE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE,
    INDEX idx_user_date (user_id, date),
    INDEX idx_category (category_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Таблиця бюджетів
CREATE TABLE budgets (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    category_id INT NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    period ENUM('weekly', 'monthly', 'yearly') NOT NULL,
    start_date DATE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE,
    INDEX idx_user_period (user_id, period),
    UNIQUE KEY unique_user_category_period (user_id, category_id, period, start_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Додавання демо-користувачів
-- Пароль для обох: "password123"
-- Hash згенерований через bcrypt з cost=12
INSERT INTO users (username, email, password_hash) VALUES
('demo_user', 'demo@example.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5lW7vKB9zZEGu'),
('test_user', 'test@example.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5lW7vKB9zZEGu');

-- Категорії для demo_user (user_id=1)
INSERT INTO categories (user_id, name, type, color) VALUES
(1, 'Зарплата', 'income', '#10B981'),
(1, 'Фріланс', 'income', '#6366F1'),
(1, 'Інвестиції', 'income', '#8B5CF6'),
(1, 'Продукти', 'expense', '#EF4444'),
(1, 'Транспорт', 'expense', '#F59E0B'),
(1, 'Розваги', 'expense', '#EC4899'),
(1, 'Комунальні', 'expense', '#14B8A6'),
(1, 'Здоров\'я', 'expense', '#F43F5E'),
(1, 'Освіта', 'expense', '#3B82F6');

-- Тестові транзакції для demo_user за останні 3 місяці
INSERT INTO transactions (user_id, category_id, amount, currency, description, date) VALUES
-- Листопад 2024
(1, 1, 25000.00, 'UAH', 'Зарплата за листопад', '2024-11-01'),
(1, 4, 3500.00, 'UAH', 'Закупка в АТБ', '2024-11-02'),
(1, 5, 800.00, 'UAH', 'Проїзд в метро', '2024-11-03'),
(1, 2, 5000.00, 'UAH', 'Веб-розробка для клієнта', '2024-11-05'),
(1, 6, 1200.00, 'UAH', 'Кіно та кафе', '2024-11-08'),
(1, 7, 2500.00, 'UAH', 'Електрика та вода', '2024-11-10'),
(1, 4, 2800.00, 'UAH', 'Сільпо продукти', '2024-11-12'),
(1, 8, 1500.00, 'UAH', 'Аптека ліки', '2024-11-15'),
(1, 5, 600.00, 'UAH', 'Uber таксі', '2024-11-18'),
(1, 6, 900.00, 'UAH', 'Концерт', '2024-11-20'),
-- Грудень 2024
(1, 1, 27000.00, 'UAH', 'Зарплата + бонус', '2024-12-01'),
(1, 4, 4200.00, 'UAH', 'Новорічна закупка', '2024-12-03'),
(1, 6, 2500.00, 'UAH', 'Новорічні подарунки', '2024-12-05'),
(1, 2, 7500.00, 'UAH', 'Фріланс проект завершено', '2024-12-10'),
(1, 5, 1100.00, 'UAH', 'Таксі в аеропорт', '2024-12-15'),
(1, 7, 3000.00, 'UAH', 'Комунальні + опалення', '2024-12-20'),
(1, 9, 3500.00, 'UAH', 'Онлайн курс програмування', '2024-12-22'),
-- Січень 2025
(1, 1, 28000.00, 'UAH', 'Зарплата січень', '2025-01-05'),
(1, 4, 3900.00, 'UAH', 'Продукти тижня', '2025-01-08'),
(1, 3, 5000.00, 'UAH', 'Дивіденди від акцій', '2025-01-10'),
(1, 5, 750.00, 'UAH', 'Bolt таксі', '2025-01-12'),
(1, 8, 2200.00, 'UAH', 'Стоматолог', '2025-01-15'),
(1, 6, 1800.00, 'UAH', 'Театр і ресторан', '2025-01-18');

-- Бюджети для demo_user на місяць
INSERT INTO budgets (user_id, category_id, amount, period, start_date) VALUES
(1, 4, 10000.00, 'monthly', '2025-01-01'),  -- Продукти
(1, 5, 3000.00, 'monthly', '2025-01-01'),   -- Транспорт
(1, 6, 4000.00, 'monthly', '2025-01-01'),   -- Розваги
(1, 7, 3500.00, 'monthly', '2025-01-01'),   -- Комунальні
(1, 8, 2500.00, 'monthly', '2025-01-01');   -- Здоров'я

-- Додаткові категорії для test_user (user_id=2)
INSERT INTO categories (user_id, name, type, color) VALUES
(2, 'Зарплата', 'income', '#10B981'),
(2, 'Витрати', 'expense', '#EF4444');
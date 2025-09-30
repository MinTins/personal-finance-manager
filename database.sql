-- Створення бази даних
CREATE DATABASE IF NOT EXISTS personal_finance_manager;
USE personal_finance_manager;

-- Таблиця користувачів
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Таблиця категорій
CREATE TABLE IF NOT EXISTS categories (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    name VARCHAR(50) NOT NULL,
    type ENUM('income', 'expense') NOT NULL,
    color VARCHAR(7) DEFAULT '#3B82F6',
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Таблиця транзакцій
CREATE TABLE IF NOT EXISTS transactions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    category_id INT,
    amount DECIMAL(10, 2) NOT NULL,
    description TEXT,
    type ENUM('income', 'expense') NOT NULL,
    date DATE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL
);

-- Таблиця бюджетів
CREATE TABLE IF NOT EXISTS budgets (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    category_id INT,
    amount DECIMAL(10, 2) NOT NULL,
    period ENUM('week', 'month', 'year') NOT NULL DEFAULT 'month',
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE
);

-- Додавання стандартних категорій
INSERT INTO categories (user_id, name, type, color) VALUES
(1, 'Зарплата', 'income', '#10B981'),
(1, 'Фріланс', 'income', '#3B82F6'),
(1, 'Інвестиції', 'income', '#6366F1'),
(1, 'Подарунки', 'income', '#EC4899'),
(1, 'Продукти', 'expense', '#F59E0B'),
(1, 'Транспорт', 'expense', '#EF4444'),
(1, 'Розваги', 'expense', '#8B5CF6'),
(1, 'Комунальні послуги', 'expense', '#6B7280'),
(1, 'Здоров\'я', 'expense', '#059669'),
(1, 'Одяг', 'expense', '#D97706');
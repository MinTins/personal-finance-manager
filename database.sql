-- Personal Finance Manager Database Schema
-- MySQL 8.0+
-- 
-- This schema supports multi-user personal finance management with:
-- - User authentication
-- - Multiple accounts per user (with multi-currency support)
-- - Transaction tracking (income, expenses, transfers)
-- - Budget management
-- - Custom categories with visual coding

CREATE DATABASE IF NOT EXISTS `personal_finance_manager` 
  DEFAULT CHARACTER SET utf8mb4 
  COLLATE utf8mb4_0900_ai_ci;

USE `personal_finance_manager`;

-- ============================================================================
-- TABLE: users
-- Stores user authentication and profile information
-- ============================================================================
DROP TABLE IF EXISTS `users`;
CREATE TABLE `users` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `username` VARCHAR(50) NOT NULL,
  `email` VARCHAR(100) NOT NULL,
  `password_hash` VARCHAR(255) NOT NULL,
  `created_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `username` (`username`),
  UNIQUE KEY `email` (`email`),
  INDEX `idx_email` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- ============================================================================
-- TABLE: accounts
-- Stores user financial accounts (bank cards, cash, etc.)
-- ============================================================================
DROP TABLE IF EXISTS `accounts`;
CREATE TABLE `accounts` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `user_id` INT NOT NULL,
  `name` VARCHAR(50) NOT NULL,
  `balance` DECIMAL(15,2) DEFAULT 0.00,
  `currency` VARCHAR(3) DEFAULT 'UAH',
  `is_active` TINYINT(1) DEFAULT 1,
  `created_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_user_id` (`user_id`),
  KEY `idx_user_active` (`user_id`, `is_active`),
  CONSTRAINT `fk_accounts_user` 
    FOREIGN KEY (`user_id`) 
    REFERENCES `users` (`id`) 
    ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- ============================================================================
-- TABLE: categories
-- Stores transaction categories (income/expense) with color coding
-- ============================================================================
DROP TABLE IF EXISTS `categories`;
CREATE TABLE `categories` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `user_id` INT DEFAULT NULL,
  `name` VARCHAR(50) NOT NULL,
  `type` ENUM('income', 'expense') NOT NULL,
  `color` VARCHAR(7) DEFAULT '#3B82F6',
  `created_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_user_id` (`user_id`),
  KEY `idx_user_type` (`user_id`, `type`),
  CONSTRAINT `fk_categories_user` 
    FOREIGN KEY (`user_id`) 
    REFERENCES `users` (`id`) 
    ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- ============================================================================
-- TABLE: transactions
-- Stores all financial transactions (income, expenses, transfers)
-- ============================================================================
DROP TABLE IF EXISTS `transactions`;
CREATE TABLE `transactions` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `user_id` INT NOT NULL,
  `account_id` INT NOT NULL,
  `category_id` INT DEFAULT NULL,
  `amount` DECIMAL(15,2) NOT NULL,
  `transaction_type` ENUM('income', 'expense', 'transfer') NOT NULL,
  `description` TEXT,
  `date` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  `created_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_user_id` (`user_id`),
  KEY `idx_account_id` (`account_id`),
  KEY `idx_category_id` (`category_id`),
  KEY `idx_date` (`date`),
  KEY `idx_user_date` (`user_id`, `date`),
  KEY `idx_user_type_date` (`user_id`, `transaction_type`, `date`),
  CONSTRAINT `fk_transactions_user` 
    FOREIGN KEY (`user_id`) 
    REFERENCES `users` (`id`) 
    ON DELETE CASCADE,
  CONSTRAINT `fk_transactions_account` 
    FOREIGN KEY (`account_id`) 
    REFERENCES `accounts` (`id`) 
    ON DELETE CASCADE,
  CONSTRAINT `fk_transactions_category` 
    FOREIGN KEY (`category_id`) 
    REFERENCES `categories` (`id`) 
    ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- ============================================================================
-- TABLE: budgets
-- Stores budget limits for categories over specific time periods
-- ============================================================================
DROP TABLE IF EXISTS `budgets`;
CREATE TABLE `budgets` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `user_id` INT NOT NULL,
  `category_id` INT DEFAULT NULL,
  `amount` DECIMAL(15,2) NOT NULL,
  `start_date` DATE NOT NULL,
  `end_date` DATE NOT NULL,
  `created_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_user_id` (`user_id`),
  KEY `idx_category_id` (`category_id`),
  KEY `idx_dates` (`start_date`, `end_date`),
  KEY `idx_user_dates` (`user_id`, `start_date`, `end_date`),
  CONSTRAINT `fk_budgets_user` 
    FOREIGN KEY (`user_id`) 
    REFERENCES `users` (`id`) 
    ON DELETE CASCADE,
  CONSTRAINT `fk_budgets_category` 
    FOREIGN KEY (`category_id`) 
    REFERENCES `categories` (`id`) 
    ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- ============================================================================
-- TEST DATA
-- ============================================================================

-- Insert test user
INSERT INTO `users` (`id`, `username`, `email`, `password_hash`, `created_at`, `updated_at`) 
VALUES (1, 'testuser', 'test@example.com', '$2b$12$6pvRYDvc.wudK6h7XgoseujtpndyUisqg7AITTFiIviG1zXf3NnOm', '2025-10-06 13:20:59', '2025-10-06 13:23:40');

-- Insert test accounts
INSERT INTO `accounts` (`id`, `user_id`, `name`, `balance`, `currency`, `is_active`, `created_at`) VALUES
(1, 1, 'Готівка', 5000.00, 'UAH', 1, '2025-10-06 13:20:59'),
(2, 1, 'Картка ПриватБанк', 15000.00, 'UAH', 1, '2025-10-06 13:20:59'),
(3, 1, 'Картка Монобанк', 8000.00, 'UAH', 1, '2025-10-06 13:20:59'),
(4, 1, 'Долари готівка', 1000.00, 'USD', 1, '2025-10-06 13:20:59'),
(5, 1, 'Євро готівка', 500.00, 'EUR', 1, '2025-10-06 13:20:59');

-- Insert test categories
INSERT INTO `categories` (`id`, `user_id`, `name`, `type`, `created_at`, `color`) VALUES
-- Income categories
(1, 1, 'Зарплата', 'income', '2025-10-06 13:20:59', '#10B981'),
(2, 1, 'Фріланс', 'income', '2025-10-06 13:20:59', '#3B82F6'),
(3, 1, 'Подарунки', 'income', '2025-10-06 13:20:59', '#EC4899'),
(4, 1, 'Інвестиції', 'income', '2025-10-06 13:20:59', '#6366F1'),
(5, 1, 'Продаж', 'income', '2025-10-06 13:20:59', '#10B981'),
-- Expense categories
(6, 1, 'Харчування', 'expense', '2025-10-06 13:20:59', '#F59E0B'),
(7, 1, 'Транспорт', 'expense', '2025-10-06 13:20:59', '#EF4444'),
(8, 1, 'Розваги', 'expense', '2025-10-06 13:20:59', '#8B5CF6'),
(9, 1, 'Подорожі', 'expense', '2025-10-06 13:20:59', '#14B8A6'),
(10, 1, 'Здоров\'я', 'expense', '2025-10-06 13:20:59', '#059669'),
(11, 1, 'Освіта', 'expense', '2025-10-06 13:20:59', '#84CC16'),
(12, 1, 'Оренда', 'expense', '2025-10-06 13:20:59', '#F97316'),
(13, 1, 'Комунальні послуги', 'expense', '2025-10-06 13:20:59', '#6B7280'),
(14, 1, 'Одяг', 'expense', '2025-10-06 13:20:59', '#D97706'),
(15, 1, 'Електроніка', 'expense', '2025-10-06 13:20:59', '#06B6D4');

-- Insert test transactions
INSERT INTO `transactions` (`id`, `user_id`, `account_id`, `category_id`, `amount`, `transaction_type`, `description`, `date`, `created_at`) VALUES
-- Income transactions
(1, 1, 2, 1, 25000.00, 'income', 'Зарплата за серпень', '2025-08-10 07:00:00', '2025-10-06 13:20:59'),
(2, 1, 2, 1, 25000.00, 'income', 'Зарплата за вересень', '2025-09-10 07:00:00', '2025-10-06 13:20:59'),
(3, 1, 3, 2, 8000.00, 'income', 'Проект для клієнта', '2025-08-15 11:30:00', '2025-10-06 13:20:59'),
(4, 1, 3, 2, 12000.00, 'income', 'Великий проект', '2025-09-20 13:45:00', '2025-10-06 13:20:59'),
(5, 1, 1, 3, 2000.00, 'income', 'День народження', '2025-09-05 15:20:00', '2025-10-06 13:20:59'),
(6, 1, 4, 4, 300.00, 'income', 'Дивіденди', '2025-08-28 06:15:00', '2025-10-06 13:20:59'),
(7, 1, 1, 5, 1500.00, 'income', 'Продаж старого телефону', '2025-09-15 08:30:00', '2025-10-06 13:20:59'),
-- Food expenses
(8, 1, 1, 6, 450.00, 'expense', 'Продукти Сільпо', '2025-08-02 09:20:00', '2025-10-06 13:20:59'),
(9, 1, 3, 6, 380.00, 'expense', 'Продукти АТБ', '2025-08-08 10:40:00', '2025-10-06 13:20:59'),
(10, 1, 2, 6, 620.00, 'expense', 'Вечеря в ресторані', '2025-08-14 16:30:00', '2025-10-06 13:20:59'),
(11, 1, 1, 6, 530.00, 'expense', 'Продукти Фора', '2025-08-18 11:25:00', '2025-10-06 13:20:59'),
(12, 1, 3, 6, 420.00, 'expense', 'Продукти Сільпо', '2025-08-25 12:50:00', '2025-10-06 13:20:59'),
(13, 1, 1, 6, 490.00, 'expense', 'Продукти АТБ', '2025-09-01 09:15:00', '2025-10-06 13:20:59'),
(14, 1, 2, 6, 750.00, 'expense', 'Обід з колегами', '2025-09-06 10:00:00', '2025-10-06 13:20:59'),
(15, 1, 1, 6, 550.00, 'expense', 'Продукти Фора', '2025-09-12 13:30:00', '2025-10-06 13:20:59'),
(16, 1, 3, 6, 480.00, 'expense', 'Продукти Сільпо', '2025-09-19 14:20:00', '2025-10-06 13:20:59'),
-- Transport expenses
(17, 1, 2, 7, 200.00, 'expense', 'Таксі', '2025-08-05 05:30:00', '2025-10-06 13:20:59'),
(18, 1, 2, 7, 300.00, 'expense', 'Бензин', '2025-08-15 07:45:00', '2025-10-06 13:20:59'),
(19, 1, 3, 7, 250.00, 'expense', 'Проїзний на метро', '2025-09-01 05:00:00', '2025-10-06 13:20:59'),
(20, 1, 2, 7, 350.00, 'expense', 'Бензин', '2025-09-17 08:30:00', '2025-10-06 13:20:59'),
-- Entertainment expenses
(21, 1, 3, 8, 800.00, 'expense', 'Кіно та вечеря', '2025-08-12 16:00:00', '2025-10-06 13:20:59'),
(22, 1, 2, 8, 1200.00, 'expense', 'Концерт', '2025-09-08 17:30:00', '2025-10-06 13:20:59'),
-- Other expenses
(23, 1, 2, 9, 5000.00, 'expense', 'Вікенд у Львові', '2025-08-18 06:00:00', '2025-10-06 13:20:59'),
(24, 1, 2, 10, 700.00, 'expense', 'Ліки в аптеці', '2025-09-05 11:20:00', '2025-10-06 13:20:59'),
(25, 1, 3, 11, 2500.00, 'expense', 'Курси програмування', '2025-09-10 14:00:00', '2025-10-06 13:20:59'),
(26, 1, 2, 12, 8000.00, 'expense', 'Оренда квартири за серпень', '2025-08-01 09:00:00', '2025-10-06 13:20:59'),
(27, 1, 2, 12, 8000.00, 'expense', 'Оренда квартири за вересень', '2025-09-01 09:00:00', '2025-10-06 13:20:59'),
(28, 1, 2, 13, 1800.00, 'expense', 'Комунальні послуги за липень', '2025-08-10 13:30:00', '2025-10-06 13:20:59'),
(29, 1, 2, 13, 1700.00, 'expense', 'Комунальні послуги за серпень', '2025-09-10 13:45:00', '2025-10-06 13:20:59'),
(30, 1, 3, 14, 3500.00, 'expense', 'Нові джинси та куртка', '2025-09-15 11:00:00', '2025-10-06 13:20:59'),
(31, 1, 2, 15, 15000.00, 'expense', 'Новий смартфон', '2025-08-25 10:20:00', '2025-10-06 13:20:59'),
-- Transfer transactions
(32, 1, 2, NULL, 2000.00, 'transfer', 'Переказ на готівку', '2025-08-05 12:30:00', '2025-10-06 13:20:59'),
(33, 1, 1, NULL, 2000.00, 'transfer', 'Отримано з карти ПриватБанк', '2025-08-05 12:30:01', '2025-10-06 13:20:59'),
(34, 1, 3, NULL, 1500.00, 'transfer', 'Переказ на готівку', '2025-09-10 13:45:00', '2025-10-06 13:20:59'),
(35, 1, 1, NULL, 1500.00, 'transfer', 'Отримано з карти Монобанк', '2025-09-10 13:45:01', '2025-10-06 13:20:59');

-- Insert test budgets
INSERT INTO `budgets` (`id`, `user_id`, `category_id`, `amount`, `start_date`, `end_date`, `created_at`) VALUES
(1, 1, 6, 5000.00, '2025-10-01', '2025-10-31', '2025-10-06 13:20:59'),
(2, 1, 7, 1500.00, '2025-10-01', '2025-10-31', '2025-10-06 13:20:59'),
(3, 1, 8, 2000.00, '2025-10-01', '2025-10-31', '2025-10-06 13:20:59'),
(4, 1, 12, 8000.00, '2025-10-01', '2025-10-31', '2025-10-06 13:20:59'),
(5, 1, 13, 2000.00, '2025-10-01', '2025-10-31', '2025-10-06 13:20:59');

-- ============================================================================
-- USEFUL QUERIES (Examples)
-- ============================================================================

-- Get user's total balance across all active accounts
-- SELECT 
--   u.username,
--   SUM(a.balance) as total_balance,
--   a.currency
-- FROM users u
-- JOIN accounts a ON u.id = a.user_id
-- WHERE a.is_active = 1
-- GROUP BY u.id, a.currency;

-- Get monthly expense summary by category
-- SELECT 
--   c.name as category,
--   SUM(t.amount) as total_spent,
--   COUNT(t.id) as transaction_count
-- FROM transactions t
-- JOIN categories c ON t.category_id = c.id
-- WHERE t.transaction_type = 'expense'
--   AND t.user_id = 1
--   AND DATE_FORMAT(t.date, '%Y-%m') = '2025-09'
-- GROUP BY c.id
-- ORDER BY total_spent DESC;

-- Check budget vs actual spending
-- SELECT 
--   c.name as category,
--   b.amount as budget,
--   COALESCE(SUM(t.amount), 0) as spent,
--   (b.amount - COALESCE(SUM(t.amount), 0)) as remaining
-- FROM budgets b
-- JOIN categories c ON b.category_id = c.id
-- LEFT JOIN transactions t ON t.category_id = c.id 
--   AND t.transaction_type = 'expense'
--   AND t.date BETWEEN b.start_date AND b.end_date
-- WHERE b.user_id = 1
--   AND CURDATE() BETWEEN b.start_date AND b.end_date
-- GROUP BY b.id;
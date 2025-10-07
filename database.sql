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
(16, 1, 3, 6, 480.00, 'expense', 'Продукти Сільпо', '2025-09-19 14:20:00'
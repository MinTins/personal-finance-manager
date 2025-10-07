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
CREATE TABLE IF NOT EXISTS `users` (
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
CREATE TABLE IF NOT EXISTS `accounts` (
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
CREATE TABLE IF NOT EXISTS `categories` (
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
CREATE TABLE IF NOT EXISTS `transactions` (
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
CREATE TABLE IF NOT EXISTS `budgets` (
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
-- SAMPLE DATA (Optional - for testing/development)
-- Uncomment to insert sample data
-- ============================================================================

-- Sample User
-- INSERT INTO `users` (`username`, `email`, `password_hash`) 
-- VALUES ('demo_user', 'demo@example.com', '$2b$12$SAMPLE_HASH_HERE');

-- Sample Income Categories
-- INSERT INTO `categories` (`user_id`, `name`, `type`, `color`) VALUES
-- (1, 'Зарплата', 'income', '#10B981'),
-- (1, 'Фріланс', 'income', '#3B82F6'),
-- (1, 'Подарунки', 'income', '#EC4899'),
-- (1, 'Інвестиції', 'income', '#6366F1'),
-- (1, 'Продаж', 'income', '#10B981');

-- Sample Expense Categories
-- INSERT INTO `categories` (`user_id`, `name`, `type`, `color`) VALUES
-- (1, 'Харчування', 'expense', '#F59E0B'),
-- (1, 'Транспорт', 'expense', '#EF4444'),
-- (1, 'Розваги', 'expense', '#8B5CF6'),
-- (1, 'Подорожі', 'expense', '#14B8A6'),
-- (1, 'Здоров''я', 'expense', '#059669'),
-- (1, 'Освіта', 'expense', '#84CC16'),
-- (1, 'Оренда', 'expense', '#F97316'),
-- (1, 'Комунальні послуги', 'expense', '#6B7280'),
-- (1, 'Одяг', 'expense', '#D97706'),
-- (1, 'Електроніка', 'expense', '#06B6D4');

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
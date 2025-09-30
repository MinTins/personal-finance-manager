@echo off
echo Creating Personal Finance Manager project structure...

:: Root directory
mkdir personal-finance-manager
cd personal-finance-manager

:: Backend structure
mkdir backend
mkdir backend\app
mkdir backend\app\routes
mkdir backend\docs
mkdir backend\tests

:: Backend files
echo # > backend\requirements.txt
echo # > backend\run.py
echo # > backend\database.sql
echo # > backend\.env.example
echo # > backend\app\__init__.py
echo # > backend\app\models.py
echo # > backend\app\config.py
echo # > backend\app\routes\__init__.py
echo # > backend\app\routes\auth.py
echo # > backend\app\routes\transactions.py
echo # > backend\app\routes\categories.py
echo # > backend\app\routes\budgets.py
echo # > backend\app\routes\exchange_rates.py

:: Frontend structure
mkdir frontend
mkdir frontend\public
mkdir frontend\src
mkdir frontend\src\components
mkdir frontend\src\components\Auth
mkdir frontend\src\components\Dashboard
mkdir frontend\src\components\Transactions
mkdir frontend\src\components\Budgets
mkdir frontend\src\components\common
mkdir frontend\src\services
mkdir frontend\src\utils

:: Frontend files
echo # > frontend\package.json
echo # > frontend\vite.config.js
echo # > frontend\index.html
echo # > frontend\src\main.jsx
echo # > frontend\src\App.jsx
echo # > frontend\src\services\api.js
echo # > frontend\src\services\auth.js
echo # > frontend\src\utils\helpers.js
echo # > frontend\src\components\Auth\Login.jsx
echo # > frontend\src\components\Auth\Register.jsx
echo # > frontend\src\components\Dashboard\Dashboard.jsx
echo # > frontend\src\components\Transactions\TransactionList.jsx
echo # > frontend\src\components\Transactions\TransactionForm.jsx
echo # > frontend\src\components\Budgets\BudgetList.jsx
echo # > frontend\src\components\Budgets\BudgetForm.jsx
echo # > frontend\src\components\common\Navbar.jsx
echo # > frontend\src\components\common\Sidebar.jsx

:: Documentation and root files
echo # > README.md
echo # > docs\API.md
echo # > docs\SECURITY.md
echo # > docs\SETUP.md

echo Project structure created successfully!
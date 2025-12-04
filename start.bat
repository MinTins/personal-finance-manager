@echo off
chcp 65001 >nul
title Personal Finance Manager - Frontend & Backend

echo ============================================================
echo   Personal Finance Manager
echo   Запуск Frontend та Backend серверів
echo ============================================================
echo.

REM Перевірка наявності node_modules
if not exist "frontend\node_modules\" (
    echo [FRONTEND] Встановлення залежностей...
    cd frontend
    call npm install
    cd ..
    echo.
)

REM Перевірка наявності venv для backend
if not exist "backend\venv\" (
    echo [BACKEND] Створення віртуального середовища...
    cd backend
    python -m venv venv
    call venv\Scripts\activate
    pip install -r requirements.txt
    cd ..
    echo.
)

echo ============================================================
echo   Запуск серверів у окремих вікнах
echo ============================================================
echo.

REM Запуск Backend у новому вікні
echo [1/2] Запуск Backend сервера (http://localhost:5000)...
start "Backend Server - Port 5000" cmd /k "cd /d %~dp0backend && venv\Scripts\activate && python run.py"

REM Очікування 3 секунди для запуску backend
timeout /t 3 /nobreak >nul

REM Запуск Frontend у новому вікні
echo [2/2] Запуск Frontend сервера (http://localhost:5173)...
start "Frontend Server - Port 5173" cmd /k "cd /d %~dp0frontend && npm run dev"

echo.
echo ============================================================
echo   ✓ Сервери запущені!
echo ============================================================
echo.
echo   Frontend: http://localhost:5173
echo   Backend:  http://localhost:5000
echo.
echo   Щоб зупинити сервери, закрийте відповідні вікна консолі
echo   або натисніть Ctrl+C у кожному вікні
echo.
echo ============================================================
echo.
pause

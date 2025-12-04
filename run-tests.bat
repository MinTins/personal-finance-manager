@echo off
chcp 65001 >nul
title Тестування продуктивності

echo ============================================================
echo   Тестування продуктивності Personal Finance Manager
echo   Лабораторна робота №4
echo ============================================================
echo.

REM Перевірка, чи запущені сервери
echo Перевірка серверів...
echo.

REM Перевірка Backend
curl -s http://localhost:5000/api/categories >nul 2>&1
if %errorlevel% neq 0 (
    echo [ПОМИЛКА] Backend сервер не запущений!
    echo.
    echo Будь ласка, спочатку запустіть сервери за допомогою start.bat
    echo.
    pause
    exit /b 1
)

echo ✓ Backend сервер працює (http://localhost:5000)
echo.

REM Перехід до директорії тестів
cd deploy-performance

REM Перевірка наявності віртуального середовища
if not exist "venv\" (
    echo Створення віртуального середовища для тестів...
    python -m venv venv
    echo.
    echo Встановлення залежностей...
    call venv\Scripts\activate
    pip install -r requirements.txt
    echo.
) else (
    call venv\Scripts\activate
)

echo ============================================================
echo   Запуск тестів продуктивності...
echo ============================================================
echo.

python performance_test.py

echo.
echo ============================================================
echo   ✓ Тестування завершено
echo ============================================================
echo.
echo Результати збережені у файлі:
echo   deploy-performance\performance_report_localhost_backend.json
echo.

deactivate
cd ..

pause

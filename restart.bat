@echo off
chcp 65001 >nul
title Перезапуск серверів

echo ============================================================
echo   Перезапуск серверів
echo ============================================================
echo.

echo [1/2] Зупинка поточних процесів...
taskkill /F /IM node.exe 2>nul
taskkill /F /IM python.exe 2>nul
timeout /t 2 /nobreak >nul

echo [2/2] Запуск серверів...
echo.

REM Запуск Backend
start "Backend Server - Port 5000" cmd /k "cd /d %~dp0backend && venv\Scripts\activate && python run.py"
timeout /t 3 /nobreak >nul

REM Запуск Frontend
start "Frontend Server - Port 5173" cmd /k "cd /d %~dp0frontend && npm run dev"

echo.
echo ============================================================
echo   ✓ Сервери перезапущені!
echo ============================================================
echo.
echo   Frontend: http://localhost:5173
echo   Backend:  http://localhost:5000
echo.
pause

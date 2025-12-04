@echo off
chcp 65001 >nul
title Зупинка серверів

echo ============================================================
echo   Зупинка Frontend та Backend серверів
echo ============================================================
echo.

echo Пошук та зупинка процесів...
echo.

REM Зупинка Node.js (Frontend)
echo [1/2] Зупинка Frontend (Node.js)...
taskkill /F /IM node.exe 2>nul
if %errorlevel% equ 0 (
    echo   ✓ Frontend зупинено
) else (
    echo   ℹ Frontend не запущений
)

REM Зупинка Python (Backend)
echo [2/2] Зупинка Backend (Python)...
taskkill /F /IM python.exe 2>nul
if %errorlevel% equ 0 (
    echo   ✓ Backend зупинено
) else (
    echo   ℹ Backend не запущений
)

echo.
echo ============================================================
echo   ✓ Завершено
echo ============================================================
echo.
pause

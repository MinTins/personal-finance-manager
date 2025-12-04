@echo off
setlocal enabledelayedexpansion
chcp 65001 >nul 2>&1
title Finance Manager

:MENU
cls
echo.
echo ============================================================
echo    Finance Manager Control Panel
echo ============================================================
echo.
echo    1. Start Servers
echo    2. Stop Servers  
echo    3. Restart Servers
echo    4. Run Tests
echo    5. Exit
echo.
echo ============================================================
echo.
set /p "choice=Enter choice (1-5): "

if "!choice!"=="1" goto START
if "!choice!"=="2" goto STOP
if "!choice!"=="3" goto RESTART
if "!choice!"=="4" goto TEST
if "!choice!"=="5" goto END
goto MENU

:START
cls
echo Starting servers...
echo.

if not exist "frontend\node_modules\" (
    echo Installing frontend dependencies...
    cd frontend
    npm install
    cd ..
)

if not exist "backend\venv\" (
    echo Creating backend environment...
    cd backend
    python -m venv venv
    venv\Scripts\activate.bat
    pip install -r requirements.txt
    cd ..
)

echo Starting Backend...
start "Backend" cmd /k "cd /d %~dp0backend && venv\Scripts\activate.bat && python run.py"

timeout /t 3 /nobreak >nul

echo Starting Frontend...
start "Frontend" cmd /k "cd /d %~dp0frontend && npm run dev"

echo.
echo Servers started!
echo Frontend: http://localhost:5173
echo Backend: http://localhost:5000
echo.
pause
goto MENU

:STOP
cls
echo Stopping servers...
echo.

taskkill /F /IM node.exe >nul 2>&1
if !errorlevel! equ 0 (
    echo Frontend stopped
) else (
    echo Frontend not running
)

taskkill /F /IM python.exe >nul 2>&1
if !errorlevel! equ 0 (
    echo Backend stopped
) else (
    echo Backend not running
)

echo.
echo Done!
pause
goto MENU

:RESTART
cls
echo Restarting servers...
echo.

taskkill /F /IM node.exe >nul 2>&1
taskkill /F /IM python.exe >nul 2>&1
timeout /t 2 /nobreak >nul

echo Starting Backend...
start "Backend" cmd /k "cd /d %~dp0backend && venv\Scripts\activate.bat && python run.py"
timeout /t 3 /nobreak >nul

echo Starting Frontend...
start "Frontend" cmd /k "cd /d %~dp0frontend && npm run dev"

echo.
echo Servers restarted!
echo Frontend: http://localhost:5173
echo Backend: http://localhost:5000
echo.
pause
goto MENU

:TEST
cls
echo Running performance tests...
echo.

curl -s http://localhost:5000/api/categories >nul 2>&1
if !errorlevel! neq 0 (
    echo ERROR: Backend not running!
    echo Please start servers first.
    pause
    goto MENU
)

echo Backend is running
echo.

if not exist "deploy-performance\" (
    echo ERROR: deploy-performance directory not found!
    pause
    goto MENU
)

cd deploy-performance

if not exist "venv\" (
    echo Creating test environment...
    python -m venv venv
    venv\Scripts\activate.bat
    pip install -r requirements.txt
) else (
    venv\Scripts\activate.bat
)

echo Running tests...
python performance_test.py

echo.
echo Tests completed!
echo Results saved in deploy-performance\performance_report_localhost_backend.json
echo.

venv\Scripts\deactivate.bat
cd ..
pause
goto MENU

:END
cls
echo Goodbye!
timeout /t 1 /nobreak >nul
exit /b 0
@echo off
title SELENE // ATHLETICA - Full-Stack Development Mode
color 0A

echo ======================================================================
echo    SELENE // ATHLETICA : Dual Development Mode (FastAPI + Vite Hot Reload)
echo ======================================================================
echo.

set SCRIPT_DIR=%~dp0

echo [1/2] Launching Backend Server in background window...
start "Aura Nymph - Backend (FastAPI)" cmd /k "cd /d "%SCRIPT_DIR%backend" && .venv\Scripts\python.exe -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload"

echo [2/2] Launching Frontend Server with Vite...
start "" cmd /c "timeout /t 3 /nobreak >nul && start http://localhost:5173"

cd /d "%SCRIPT_DIR%frontend"
npm run dev

pause

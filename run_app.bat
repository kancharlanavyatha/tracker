@echo off
title AURA // NYMPH - Production Application Runner
color 0B

echo ======================================================================
echo    AURA // NYMPH : Phase-Intelligent Female Athlete Sanctuary
echo ======================================================================
echo.
echo [1/3] Navigating to backend root...
cd /d "%~dp0backend"

if not exist ".venv\Scripts\python.exe" (
    echo [ERROR] Virtual environment not found at backend\.venv!
    echo Please make sure the backend environment is set up.
    pause
    exit /b 1
)

echo [2/3] Preparing application on http://localhost:8000 ...
echo [3/3] Opening browser in 3 seconds...
start "" cmd /c "timeout /t 3 /nobreak >nul && start http://localhost:8000"

echo.
echo ======================================================================
echo   LIVE SERVER ACTIVE : http://127.0.0.1:8000
echo   API DOCS (SWAGGER): http://127.0.0.1:8000/docs
echo.
echo   Press Ctrl+C to terminate the server.
echo ======================================================================
echo.

".venv\Scripts\python.exe" -m uvicorn app.main:app --host 127.0.0.1 --port 8000

pause

@echo off
title SELENE Server
cd /d "%~dp0backend"

echo ======================================================================
echo    SELENE : Athlete Sanctuary & Cycle Intelligence
echo ======================================================================
echo.
echo Checking port 8000...
powershell -NoProfile -Command "Get-NetTCPConnection -LocalPort 8000 -ErrorAction SilentlyContinue | ForEach-Object { Stop-Process -Id $_.OwningProcess -Force -ErrorAction SilentlyContinue }"

echo Starting application server...
echo.
echo ======================================================================
echo   LIVE SERVER ACTIVE : http://localhost:8000
echo   API DOCS (SWAGGER): http://localhost:8000/docs
echo.
echo   Open http://localhost:8000 in your browser.
echo   Press Ctrl+C to stop the server.
echo ======================================================================
echo.

".venv\Scripts\python.exe" -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload

pause

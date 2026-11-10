@echo off
title SELENE // ATHLETICA Server
cd /d "%~dp0backend"

echo ======================================================================
echo    SELENE // ATHLETICA : Athlete Sanctuary & Cycle Intelligence
echo ======================================================================
echo.
echo Starting application server...
echo.
echo >>> Once started, open your browser to: http://localhost:8000 <<<
echo.

".venv\Scripts\python.exe" -m uvicorn app.main:app --host 127.0.0.1 --port 8000

pause

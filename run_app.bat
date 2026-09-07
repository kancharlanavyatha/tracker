@echo off
title Clue ? Period & Cycle Tracker
echo ===================================================
echo   Starting Clue ? Period & Cycle Tracker
echo ===================================================
cd /d %~dp0backend
start "Clue Backend" /min ".venv\Scripts\python.exe" -m uvicorn app.main:app --host 127.0.0.1 --port 8000
timeout /t 2 /nobreak >nul
start "" "http://localhost:8000"
echo App is running at http://localhost:8000
pause

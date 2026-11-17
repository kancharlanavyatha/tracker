@echo off
title SELENE Model Results Exporter
cd /d "%~dp0"
echo ======================================================================
echo    SELENE : Exporting Model Results and Evaluation Summaries
echo ======================================================================
echo.
backend\.venv\Scripts\python.exe scripts\export_all_results.py
pause

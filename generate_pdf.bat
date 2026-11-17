@echo off
title SELENE Conference Paper PDF Generator
cd /d "%~dp0"
echo ======================================================================
echo    SELENE : Compiling Conference Research Paper PDF (4 Pages)
echo ======================================================================
echo.
backend\.venv\Scripts\python.exe backend\scripts\generate_conference_pdf.py
pause

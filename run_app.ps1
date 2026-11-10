Set-Location "$PSScriptRoot\backend"
Write-Host "======================================================================" -ForegroundColor Cyan
Write-Host "   SELENE // ATHLETICA : Athlete Sanctuary & Cycle Intelligence" -ForegroundColor Cyan
Write-Host "======================================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Starting server on http://localhost:8000 ..." -ForegroundColor Green
Write-Host "Opening browser..." -ForegroundColor Yellow
Start-Process "http://localhost:8000"

.\.venv\Scripts\python.exe -m uvicorn app.main:app --host 127.0.0.1 --port 8000

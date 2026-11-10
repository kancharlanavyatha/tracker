Set-Location "$PSScriptRoot\backend"
Write-Host "======================================================================" -ForegroundColor Cyan
Write-Host "   SELENE : Athlete Sanctuary & Cycle Intelligence" -ForegroundColor Cyan
Write-Host "======================================================================" -ForegroundColor Cyan
Write-Host ""

# Ensure port 8000 is clean
$portConns = Get-NetTCPConnection -LocalPort 8000 -ErrorAction SilentlyContinue
if ($portConns) {
    Write-Host "Releasing port 8000..." -ForegroundColor Gray
    $portConns | ForEach-Object { Stop-Process -Id $_.OwningProcess -Force -ErrorAction SilentlyContinue }
    Start-Sleep -Milliseconds 400
}

Write-Host "Starting server on http://localhost:8000 ..." -ForegroundColor Green
Write-Host "Open http://localhost:8000 in your browser." -ForegroundColor Yellow
Write-Host "Press Ctrl+C to stop the server." -ForegroundColor Gray
Write-Host ""

.\.venv\Scripts\python.exe -m uvicorn app.main:app --host 127.0.0.1 --port 8000

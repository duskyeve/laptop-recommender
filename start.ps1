# GadgetLens Server Starter
Write-Host "========================================================" -ForegroundColor Cyan
Write-Host " Starting GadgetLens Backend Server at http://127.0.0.1:5000" -ForegroundColor Green
Write-Host "========================================================" -ForegroundColor Cyan
Set-Location -Path "$PSScriptRoot\backend"
if (Test-Path "venv\Scripts\python.exe") {
    & "venv\Scripts\python.exe" app.py
} else {
    python app.py
}

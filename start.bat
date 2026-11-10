@echo off
title GadgetLens Backend Server
echo ========================================================
echo   Starting GadgetLens Backend Server on http://127.0.0.1:5000
echo ========================================================
cd /d "%~dp0backend"
if exist "venv\Scripts\python.exe" (
    "venv\Scripts\python.exe" app.py
) else (
    python app.py
)
if %ERRORLEVEL% NEQ 0 (
    echo.
    echo [ERROR] Flask server exited with an error.
    pause
)

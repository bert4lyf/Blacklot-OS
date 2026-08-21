@echo off
title Backlot OS - Launcher
echo ========================================================
echo   Launching Backlot OS (Backend + Frontend)
echo ========================================================

start "Backlot Backend (FastAPI)" cmd.exe /k "%~dp0start_backend.bat"
timeout /t 3 /nobreak >nul
start "Backlot Frontend (Next.js)" cmd.exe /k "%~dp0start_frontend.bat"

echo.
echo Both servers are starting up!
echo - Backend API:  http://127.0.0.1:8000
echo - Frontend UI:  http://localhost:3000
echo.
pause

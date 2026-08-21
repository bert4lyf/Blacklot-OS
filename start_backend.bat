@echo off
title Backlot OS - Backend (FastAPI + ClickHouse + Gemini)
echo ========================================================
echo   Starting Backlot Backend (FastAPI + Gemini + ClickHouse)
echo ========================================================
cd /d "%~dp0"
python -m uvicorn backend.main:app --reload --port 8000
pause

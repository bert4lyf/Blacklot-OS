@echo off
title Backlot OS - Frontend (Next.js Dashboard)
echo ========================================================
echo   Starting Backlot Frontend Dashboard (Next.js 15)
echo ========================================================
cd /d "%~dp0frontend"
call npm.cmd run dev
pause

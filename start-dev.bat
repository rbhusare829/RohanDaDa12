@echo off
title Rohan Deshmukh Website (development)
cd /d "%~dp0"
where node >NUL 2>NUL || (echo Node.js is not installed. Install it from https://nodejs.org and run this again. & pause & exit /b 1)
for %%T in (backend frontend) do if not exist %%T\.env copy %%T\.env.example %%T\.env >NUL
echo Checking packages...
call npm install --no-audit --no-fund --loglevel=error
if errorlevel 1 (echo npm install failed & pause & exit /b 1)
echo.
echo Starting DEVELOPMENT mode: the website reloads and the backend restarts when you change code.
echo Website:     http://localhost:3000
echo Admin panel: http://localhost:3000/admin   (admin@rohandeshmukh.in / ChangeMe@123)
echo Keep this window open. Close it (or press Ctrl+C) to stop.
echo.
call npm run dev
pause

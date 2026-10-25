@echo off
chcp 65001 >nul
echo =======================================================
echo    AgroSeed Local Development Server (Backend + Frontend)
echo =======================================================
echo.

echo [1/2] Starting Multi-Threaded PHP Backend on http://localhost:8005...
start "AgroSeed Backend (PHP :8005)" cmd /k "set PHP_CLI_SERVER_WORKERS=4 && php -S localhost:8005 -t api"

echo [2/2] Starting Vite Frontend on http://localhost:8080...
cd frontend
start "AgroSeed Frontend (Vite :8080)" cmd /k "npm run dev"

echo.
echo =======================================================
echo  ✓ Backend API: http://localhost:8005
echo  ✓ Frontend UI: http://localhost:8080
echo  ✓ Admin Panel: http://localhost:8080/admin
echo =======================================================
echo.
pause

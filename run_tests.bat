@echo off
chcp 65001 >nul
echo =======================================================
echo    AgroSeed E2E Test Runner (Playwright + Python)
echo =======================================================
echo.
python tests\run_customer_test.py %*
pause

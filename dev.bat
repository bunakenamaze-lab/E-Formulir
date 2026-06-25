@echo off
echo ============================================
echo  PCNU Form Builder - Development Server
echo ============================================
echo.
echo Menjalankan Backend dan Frontend secara bersamaan...
echo.
echo Backend  : http://localhost:3000
echo Frontend : http://localhost:5173
echo.
echo Tekan Ctrl+C untuk menghentikan server
echo ============================================
echo.

start "PCNU Backend" cmd /k "cd /d %~dp0backend && npm run dev"
timeout /t 3 /nobreak >nul
start "PCNU Frontend" cmd /k "cd /d %~dp0frontend && npm run dev"

echo Server telah dijalankan di dua jendela terpisah.
echo Buka browser: http://localhost:5173
echo.
pause

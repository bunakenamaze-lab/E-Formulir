@echo off
echo ============================================================
echo  PCNU Form Builder — Production Mode
echo  Full-stack: Frontend + Backend dalam 1 server
echo ============================================================
echo.

cd /d "%~dp0backend"

:: Cek apakah sudah build
if not exist dist\index.js (
    echo [WARN] Backend belum di-build. Menjalankan build sekarang...
    call npm run build
)

if not exist public\index.html (
    echo [ERROR] Frontend build tidak ditemukan di backend\public\
    echo         Jalankan build-fullstack.bat terlebih dahulu!
    pause & exit /b 1
)

echo [OK] Memulai server production...
echo.
echo  Akses aplikasi: http://localhost:3000
echo  (atau sesuai PORT di .env)
echo.
echo  Tekan Ctrl+C untuk menghentikan server
echo.
node dist\index.js

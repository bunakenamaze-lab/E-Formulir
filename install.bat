@echo off
echo ============================================
echo  Instalasi PCNU Form Builder
echo  Sistem Formulir Digital PCNU Kota Bandung
echo ============================================
echo.

:: Check Node.js
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Node.js tidak ditemukan. Silakan install Node.js 18+ dari https://nodejs.org
    pause
    exit /b 1
)

echo [OK] Node.js terdeteksi:
node --version

:: Install Backend
echo.
echo [1/4] Menginstall dependensi backend...
cd backend
call npm install
if %errorlevel% neq 0 (
    echo [ERROR] Gagal install backend dependencies
    pause
    exit /b 1
)
echo [OK] Backend dependencies terinstall

:: Generate Prisma Client
echo.
echo [2/4] Generate Prisma Client...
call npx prisma generate
if %errorlevel% neq 0 (
    echo [ERROR] Gagal generate Prisma client
    pause
    exit /b 1
)
echo [OK] Prisma client berhasil digenerate

:: Install Frontend
echo.
echo [3/4] Menginstall dependensi frontend...
cd ..\frontend
call npm install
if %errorlevel% neq 0 (
    echo [ERROR] Gagal install frontend dependencies
    pause
    exit /b 1
)
echo [OK] Frontend dependencies terinstall

cd ..

echo.
echo ============================================
echo  Instalasi berhasil!
echo ============================================
echo.
echo LANGKAH SELANJUTNYA:
echo.
echo 1. Buat database MySQL:
echo    mysql -u root -p -e "CREATE DATABASE pcnu_forms;"
echo.
echo 2. Edit konfigurasi database di backend\.env:
echo    DATABASE_URL="mysql://USER:PASSWORD@localhost:3306/pcnu_forms"
echo.
echo 3. Jalankan migrasi database:
echo    cd backend
echo    npx prisma migrate dev --name init
echo    npm run prisma:seed
echo.
echo 4. Jalankan aplikasi:
echo    - Backend:  cd backend && npm run dev
echo    - Frontend: cd frontend && npm run dev
echo.
echo 5. Buka browser: http://localhost:5173
echo.
echo Akun default:
echo   Super Admin: superadmin@pcnubandung.or.id / SuperAdmin123!
echo   Admin:       admin@pcnubandung.or.id / Admin123!
echo   Operator:    operator@pcnubandung.or.id / Operator123!
echo.
pause

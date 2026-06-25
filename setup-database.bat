@echo off
echo ============================================
echo  Setup Database PCNU Form Builder
echo ============================================
echo.
echo Script ini akan:
echo  1. Membuat database pcnu_forms
echo  2. Menjalankan migrasi tabel
echo  3. Mengisi data awal (seed)
echo.
echo Pastikan MySQL sudah berjalan!
echo.

set /p DBUSER="Masukkan username MySQL (default: root): "
if "%DBUSER%"=="" set DBUSER=root

set /p DBPASS="Masukkan password MySQL: "

set /p DBHOST="Masukkan host MySQL (default: localhost): "
if "%DBHOST%"=="" set DBHOST=localhost

set /p DBPORT="Masukkan port MySQL (default: 3306): "
if "%DBPORT%"=="" set DBPORT=3306

echo.
echo [1/3] Membuat database...
mysql -u%DBUSER% -p%DBPASS% -h%DBHOST% -P%DBPORT% -e "CREATE DATABASE IF NOT EXISTS pcnu_forms CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
if %errorlevel% neq 0 (
    echo [ERROR] Gagal membuat database. Periksa koneksi MySQL.
    pause
    exit /b 1
)
echo [OK] Database pcnu_forms berhasil dibuat

echo.
echo [2/3] Mengupdate konfigurasi .env...
cd backend
(
echo # Application
echo NODE_ENV=development
echo PORT=3000
echo APP_URL=http://localhost:3000
echo FRONTEND_URL=http://localhost:5173
echo.
echo # Database
echo DATABASE_URL="mysql://%DBUSER%:%DBPASS%@%DBHOST%:%DBPORT%/pcnu_forms"
echo.
echo # JWT
echo JWT_SECRET=pcnu-bandung-jwt-secret-2024-ganti-di-production
echo JWT_REFRESH_SECRET=pcnu-bandung-refresh-secret-2024-ganti-di-production
echo JWT_EXPIRES_IN=15m
echo JWT_REFRESH_EXPIRES_IN=7d
echo.
echo # File Upload
echo MAX_FILE_SIZE=10485760
echo UPLOAD_DIR=./uploads
echo.
echo # Rate Limiting
echo RATE_LIMIT_WINDOW=15
echo RATE_LIMIT_MAX_REQUESTS=200
) > .env
echo [OK] File .env berhasil dikonfigurasi

echo.
echo [3/3] Menjalankan migrasi dan seed...
call npx prisma migrate deploy
if %errorlevel% neq 0 (
    echo [WARN] Migrate deploy gagal, mencoba dengan migrate dev...
    call npx prisma migrate dev --name init
)

call npm run prisma:seed
if %errorlevel% neq 0 (
    echo [ERROR] Seed gagal
    pause
    exit /b 1
)

cd ..
echo.
echo ============================================
echo  Setup Database Selesai!
echo ============================================
echo.
echo Akun yang tersedia:
echo   Super Admin : superadmin@pcnubandung.or.id / SuperAdmin123!
echo   Admin       : admin@pcnubandung.or.id / Admin123!
echo   Operator    : operator@pcnubandung.or.id / Operator123!
echo.
echo Selanjutnya jalankan:
echo   Backend  : cd backend ^&^& npm run dev
echo   Frontend : cd frontend ^&^& npm run dev
echo.
pause

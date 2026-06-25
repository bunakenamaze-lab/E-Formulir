@echo off
echo ============================================================
echo  BUILD FULL-STACK — PCNU Form Builder
echo  Menghasilkan 1 server untuk frontend + backend
echo ============================================================
echo.

:: Cek Node.js
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Node.js tidak ditemukan!
    pause & exit /b 1
)

:: ── Step 1: Build Frontend ────────────────────────────────────────────────────
echo [1/4] Build Frontend (React)...
cd /d "%~dp0frontend"

if not exist node_modules (
    echo      Installing frontend dependencies...
    call npm install --legacy-peer-deps
)

call npm run build
if %errorlevel% neq 0 (
    echo [ERROR] Frontend build gagal!
    pause & exit /b 1
)
echo [OK] Frontend berhasil di-build (dist/)

:: ── Step 2: Copy frontend dist ke backend/public ─────────────────────────────
echo.
echo [2/4] Menyalin frontend ke backend/public...
cd /d "%~dp0"

if exist backend\public (
    rmdir /s /q backend\public
)
mkdir backend\public

xcopy /E /I /Y frontend\dist\* backend\public\
if %errorlevel% neq 0 (
    echo [ERROR] Gagal menyalin file frontend!
    pause & exit /b 1
)
echo [OK] Frontend berhasil disalin ke backend/public/

:: ── Step 3: Build Backend TypeScript ─────────────────────────────────────────
echo.
echo [3/4] Build Backend (TypeScript → JavaScript)...
cd /d "%~dp0backend"

if not exist node_modules (
    echo      Installing backend dependencies...
    call npm install
)

call npm run build
if %errorlevel% neq 0 (
    echo [ERROR] Backend build gagal!
    pause & exit /b 1
)
echo [OK] Backend berhasil di-build (dist/)

:: ── Step 4: Selesai ───────────────────────────────────────────────────────────
cd /d "%~dp0"
echo.
echo ============================================================
echo  BUILD SELESAI!
echo ============================================================
echo.
echo  Untuk menjalankan:
echo.
echo    cd backend
echo    npm start
echo.
echo  Atau gunakan: start-production.bat
echo.
echo  Akses di: http://localhost:3000
echo     (frontend + backend dalam 1 server)
echo.
pause

#!/bin/bash
# Script deployment ke VPS Linux
# Jalankan dari direktori project: bash deploy/deploy.sh

set -e  # Exit on error

echo "============================================================"
echo "  Deploy PCNU Form Builder ke Production Server"
echo "============================================================"
echo ""

# ── Konfigurasi — Sesuaikan ────────────────────────────────────────────────────
DEPLOY_DIR="/var/www/pcnu-forms"
PM2_APP_NAME="pcnu-forms"

# ── Build Full-stack ───────────────────────────────────────────────────────────
echo "📦 [1/5] Build frontend..."
cd frontend
npm ci --production=false
npm run build
cd ..

echo "📋 [2/5] Copy frontend ke backend/public..."
rm -rf backend/public
cp -r frontend/dist backend/public

echo "🔨 [3/5] Build backend TypeScript..."
cd backend
npm ci
npx prisma generate
npm run build
cd ..

echo "🚀 [4/5] Deploy ke server..."
# Copy semua file ke deployment directory
mkdir -p $DEPLOY_DIR
cp -r backend/dist $DEPLOY_DIR/
cp -r backend/public $DEPLOY_DIR/
cp -r backend/node_modules $DEPLOY_DIR/
cp backend/.env $DEPLOY_DIR/
cp backend/package.json $DEPLOY_DIR/
mkdir -p $DEPLOY_DIR/logs
mkdir -p $DEPLOY_DIR/uploads/{images,documents,signatures}

echo "🔄 [5/5] Restart PM2..."
pm2 restart $PM2_APP_NAME 2>/dev/null || pm2 start $DEPLOY_DIR/dist/index.js --name $PM2_APP_NAME

echo ""
echo "============================================================"
echo "  ✅ Deploy berhasil!"
echo "  Aplikasi berjalan di http://localhost:3000"
echo "============================================================"

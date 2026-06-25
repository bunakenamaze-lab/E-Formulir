# Panduan Instalasi — Sistem Formulir Digital PCNU Kota Bandung

## Prasyarat

Pastikan software berikut sudah terinstall:

| Software | Versi Minimum | Download |
|----------|---------------|---------|
| Node.js  | 18.x atau lebih | https://nodejs.org |
| MySQL    | 8.0 atau lebih  | https://dev.mysql.com/downloads/ |
| npm      | 9.x atau lebih  | Sudah termasuk Node.js |

## Langkah 1 — Clone / Download Project

```
Ekstrak folder project ke: D:\E-Formulir\
```

Struktur folder yang diharapkan:
```
E-Formulir/
├── backend/       ← API Server (Node.js + Express)
├── frontend/      ← Antarmuka (React + Vite)
├── dev.bat        ← Jalankan kedua server sekaligus
├── install.bat    ← Install semua dependensi
└── setup-database.bat ← Setup database otomatis
```

---

## Langkah 2 — Install Dependensi

### Cara Otomatis (Windows)
Klik dua kali file `install.bat` atau jalankan di CMD:
```bat
install.bat
```

### Cara Manual

**Backend:**
```bash
cd backend
npm install
npx prisma generate
```

**Frontend:**
```bash
cd frontend
npm install
```

---

## Langkah 3 — Setup Database MySQL

### Buat Database
Login ke MySQL dan jalankan:
```sql
CREATE DATABASE pcnu_forms CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### Konfigurasi Koneksi
Edit file `backend/.env`:
```env
DATABASE_URL="mysql://root:PASSWORD_ANDA@localhost:3306/pcnu_forms"
```
Ganti `PASSWORD_ANDA` dengan password MySQL Anda.

### Jalankan Migrasi & Seed Data
```bash
cd backend
npx prisma migrate dev --name init
npm run prisma:seed
```

Atau gunakan script otomatis:
```bat
setup-database.bat
```

---

## Langkah 4 — Jalankan Aplikasi

### Cara Cepat (Windows)
Klik dua kali `dev.bat` — akan membuka 2 jendela CMD:
- Window 1: Backend di http://localhost:3000
- Window 2: Frontend di http://localhost:5173

### Cara Manual

**Terminal 1 — Backend:**
```bash
cd backend
npm run dev
```

**Terminal 2 — Frontend:**
```bash
cd frontend
npm run dev
```

---

## Langkah 5 — Akses Aplikasi

Buka browser dan masuk ke:
```
http://localhost:5173
```

### Akun Default

| Role        | Email                              | Password       |
|-------------|-------------------------------------|----------------|
| Super Admin | superadmin@pcnubandung.or.id        | SuperAdmin123! |
| Admin       | admin@pcnubandung.or.id             | Admin123!      |
| Operator    | operator@pcnubandung.or.id          | Operator123!   |

> ⚠️ **Segera ganti password** setelah login pertama kali di production!

---

## Konfigurasi Lanjutan

### File `backend/.env`

```env
# Server
NODE_ENV=production          # Ganti ke 'production' saat deploy
PORT=3000
APP_URL=https://api.domain-anda.com
FRONTEND_URL=https://domain-anda.com

# Database
DATABASE_URL="mysql://user:pass@host:3306/pcnu_forms"

# JWT — WAJIB diganti di production!
JWT_SECRET=ganti-dengan-string-random-panjang
JWT_REFRESH_SECRET=ganti-dengan-string-random-lain
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# Email (opsional)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=email@gmail.com
SMTP_PASS=app-password-gmail
```

### File `frontend/.env`

```env
VITE_API_URL=http://localhost:3000/api
```
Untuk production, ganti ke URL backend Anda:
```env
VITE_API_URL=https://api.domain-anda.com/api
```

---

## Build untuk Production

### Backend
```bash
cd backend
npm run build
npm run start
```

### Frontend
```bash
cd frontend
npm run build
# Hasilnya ada di folder frontend/dist/
# Deploy ke hosting static (Nginx, Apache, Netlify, Vercel, dll)
```

---

## Troubleshooting

### Error: "Cannot connect to database"
- Pastikan MySQL sudah berjalan
- Periksa `DATABASE_URL` di `backend/.env`
- Pastikan database `pcnu_forms` sudah dibuat

### Error: "Port 3000 already in use"
```bash
# Temukan proses yang menggunakan port 3000
netstat -ano | findstr :3000
# Matikan prosesnya (ganti XXXX dengan PID)
taskkill /PID XXXX /F
```

### Error: "Module not found"
```bash
# Hapus node_modules dan reinstall
cd backend
rmdir /s /q node_modules
npm install

cd ..\frontend
rmdir /s /q node_modules
npm install
```

### Frontend blank / tidak bisa login
- Pastikan backend berjalan di port 3000
- Periksa `VITE_API_URL` di `frontend/.env`
- Buka DevTools (F12) → Network tab untuk melihat error

---

## Struktur Project Lengkap

```
backend/
├── src/
│   ├── controllers/     ← Logic bisnis API
│   ├── middleware/       ← Auth, rate limiter, error handler
│   ├── routes/          ← Definisi endpoint API
│   ├── services/        ← Socket.io, audit, notifikasi
│   └── utils/           ← Helper functions
├── prisma/
│   ├── schema.prisma    ← Definisi database
│   └── seed.ts          ← Data awal
└── uploads/             ← File yang diupload (auto-created)

frontend/
├── src/
│   ├── components/
│   │   ├── auth/        ← Route protection
│   │   ├── builder/     ← Form builder components
│   │   ├── layout/      ← Sidebar, Header, DashboardLayout
│   │   ├── providers/   ← Theme & Auth providers
│   │   ├── shared/      ← Reusable components
│   │   └── ui/          ← shadcn/ui components
│   ├── hooks/           ← React Query hooks
│   ├── lib/             ← API client, utilities
│   ├── pages/           ← Semua halaman
│   ├── stores/          ← Zustand state management
│   ├── styles/          ← Global CSS
│   └── types/           ← TypeScript types
└── public/              ← Static files
```

---

## API Endpoints Utama

| Method | Endpoint | Keterangan |
|--------|----------|-----------|
| POST | `/api/auth/login` | Login |
| GET | `/api/auth/profile` | Profil user |
| GET | `/api/forms` | Daftar formulir |
| POST | `/api/forms` | Buat formulir baru |
| GET | `/api/forms/public/:slug` | Formulir publik |
| POST | `/api/forms/public/:slug/responses` | Submit respon |
| GET | `/api/dashboard/stats` | Statistik dashboard |
| GET | `/api/export/:formId/excel` | Export Excel |
| GET | `/api/export/:formId/csv` | Export CSV |

---

© 2024 PCNU Kota Bandung. Sistem Formulir Digital.

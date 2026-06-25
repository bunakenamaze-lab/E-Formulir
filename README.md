# Sistem Formulir Digital PCNU Kota Bandung

Aplikasi Form Builder modern dan profesional untuk Pengurus Cabang Nahdlatul Ulama Kota Bandung.

## 🎯 Fitur Utama

- ✅ **Form Builder Drag & Drop** - Buat formulir dengan mudah secara visual
- 📊 **Dashboard Analytics** - Statistik dan grafik real-time
- 📝 **Multi-step Forms** - Formulir dengan progress bar
- 🔒 **Role-based Access** - Super Admin, Admin, Operator
- 📱 **Responsive Design** - Desktop, tablet, dan mobile
- 🌓 **Dark/Light Mode** - Tema yang dapat disesuaikan
- 🔔 **Real-time Notifications** - Notifikasi instant
- 📄 **Export Data** - Excel, CSV, PDF
- 🔗 **QR Code Generator** - Link sharing dengan QR Code
- 🎨 **Template Library** - Template siap pakai
- ⚡ **Conditional Logic** - Pertanyaan dinamis
- 🔍 **Advanced Search** - Pencarian dan filter canggih
- 📋 **Audit Log** - Tracking semua aktivitas
- 💾 **Auto Save** - Draft otomatis tersimpan
- 📤 **File Upload** - Upload dokumen dan gambar

## 🛠️ Teknologi

### Frontend
- React 18 + Vite
- TypeScript
- Tailwind CSS + shadcn/ui
- React Router v6
- Framer Motion
- React Query (TanStack Query)
- Zustand
- Recharts

### Backend
- Node.js + Express.js
- TypeScript
- Prisma ORM
- JWT Authentication
- MySQL
- Socket.io
- Multer

## 📦 Struktur Project

```
pcnu-form-builder/
├── frontend/           # React + Vite Application
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── hooks/
│   │   ├── services/
│   │   ├── stores/
│   │   ├── types/
│   │   ├── utils/
│   │   └── styles/
│   └── public/
│
├── backend/            # Node.js + Express API
│   ├── src/
│   │   ├── controllers/
│   │   ├── routes/
│   │   ├── middleware/
│   │   ├── services/
│   │   ├── utils/
│   │   └── types/
│   ├── prisma/
│   └── uploads/
│
└── README.md
```

## 🚀 Instalasi

### Prerequisites
- Node.js 18+
- MySQL 8+
- npm atau yarn

### 1. Clone Repository
```bash
git clone <repository-url>
cd pcnu-form-builder
```

### 2. Setup Database
```bash
# Buat database MySQL
mysql -u root -p
CREATE DATABASE pcnu_forms;
```

### 3. Setup Backend
```bash
cd backend
npm install
cp .env.example .env
# Edit .env dengan konfigurasi database Anda
npm run prisma:generate
npm run prisma:migrate
npm run prisma:seed
npm run dev
```

### 4. Setup Frontend
```bash
cd frontend
npm install
cp .env.example .env
# Edit .env dengan URL backend
npm run dev
```

### 5. Akses Aplikasi
- Frontend: http://localhost:5173
- Backend API: http://localhost:3000

## 👤 Default Login

**Super Admin:**
- Email: superadmin@pcnubandung.or.id
- Password: SuperAdmin123!

**Admin:**
- Email: admin@pcnubandung.or.id
- Password: Admin123!

**Operator:**
- Email: operator@pcnubandung.or.id
- Password: Operator123!

## 📖 Dokumentasi API

Dokumentasi API lengkap tersedia di: http://localhost:3000/api-docs

## 🎨 Design System

**Warna Utama:**
- Hijau NU: #0F7A3D
- Hijau Tua: #0B5D2A
- Putih: #FFFFFF
- Abu-abu: #F5F7FA

**Typography:**
- Font: Inter, system-ui

## 📝 Penggunaan

### Membuat Formulir Baru
1. Login ke dashboard
2. Klik "Buat Formulir Baru"
3. Drag & drop field yang diinginkan
4. Atur validasi dan conditional logic
5. Publikasikan formulir

### Berbagi Formulir
1. Buka detail formulir
2. Klik "Bagikan"
3. Copy link atau download QR Code
4. Bagikan ke responden

### Melihat Respon
1. Buka daftar formulir
2. Klik "Lihat Respon"
3. Filter, sort, atau search data
4. Export ke Excel/CSV/PDF

## 🔧 Development

```bash
# Backend
cd backend
npm run dev          # Development mode
npm run build        # Build production
npm run start        # Start production
npm run test         # Run tests

# Frontend
cd frontend
npm run dev          # Development mode
npm run build        # Build production
npm run preview      # Preview production build
npm run lint         # Lint code
```

## 📦 Deployment

### Backend (Node.js)
```bash
cd backend
npm run build
npm run start
```

### Frontend (Static)
```bash
cd frontend
npm run build
# Deploy folder 'dist' ke hosting static (Netlify, Vercel, dll)
```

## 🔒 Security

- JWT Authentication dengan refresh token
- Password hashing dengan bcrypt
- Rate limiting untuk API
- CORS configuration
- Input validation & sanitization
- SQL injection protection (Prisma)
- XSS protection
- CSRF protection

## 📄 License

Copyright © 2024 PCNU Kota Bandung. All rights reserved.

## 👥 Tim Pengembang

Dikembangkan untuk Pengurus Cabang Nahdlatul Ulama Kota Bandung.

## 📞 Kontak

- Website: https://pcnubandung.or.id
- Email: info@pcnubandung.or.id
- Telp: (022) XXXXXXX

---

**Dibuat dengan ❤️ untuk PCNU Kota Bandung**

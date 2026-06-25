import 'express-async-errors';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import { createServer } from 'http';
import { Server } from 'socket.io';
import path from 'path';
import fs from 'fs';
import dotenv from 'dotenv';

dotenv.config();

import { errorHandler } from './middleware/errorHandler';
import { rateLimiter } from './middleware/rateLimiter';
import { setupSocketIO } from './services/socketService';
import { logger } from './utils/logger';

// Routes
import authRoutes from './routes/auth';
import userRoutes from './routes/users';
import formRoutes from './routes/forms';
import fieldRoutes from './routes/fields';
import responseRoutes from './routes/responses';
import exportRoutes from './routes/export';
import notificationRoutes from './routes/notifications';
import settingRoutes from './routes/settings';
import auditRoutes from './routes/audit';
import uploadRoutes from './routes/upload';
import dashboardRoutes from './routes/dashboard';

// ─── Ensure Required Directories ─────────────────────────────────────────────
const uploadDir = process.env.UPLOAD_DIR || './uploads';
['', 'images', 'documents', 'signatures'].forEach((sub) => {
  const dir = path.join(process.cwd(), uploadDir, sub);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
});

const logsDir = path.join(process.cwd(), 'logs');
if (!fs.existsSync(logsDir)) fs.mkdirSync(logsDir, { recursive: true });

// ─── Check if running full-stack (serving frontend) ──────────────────────────
// In production, frontend build is copied into backend/public/
const FULLSTACK_MODE = process.env.FULLSTACK !== 'false';
const frontendBuildPath = path.join(process.cwd(), 'public');
const hasFrontendBuild = fs.existsSync(path.join(frontendBuildPath, 'index.html'));

// ─── App Setup ────────────────────────────────────────────────────────────────
const app = express();
const httpServer = createServer(app);

const allowedOrigins = process.env.FRONTEND_URL
  ? process.env.FRONTEND_URL.split(',').map((o) => o.trim())
  : ['http://localhost:5173', 'http://localhost:3000'];

const io = new Server(httpServer, {
  cors: {
    origin: hasFrontendBuild ? true : allowedOrigins,
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

setupSocketIO(io);

// ─── Security Middleware ──────────────────────────────────────────────────────
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
  // Relax CSP in fullstack mode so React app can load inline scripts
  contentSecurityPolicy: hasFrontendBuild ? {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
      fontSrc: ["'self'", 'https://fonts.gstatic.com'],
      imgSrc: ["'self'", 'data:', 'blob:'],
      connectSrc: ["'self'", 'ws:', 'wss:'],
    },
  } : false,
}));

// ─── CORS (only needed when NOT serving frontend from same origin) ────────────
if (!hasFrontendBuild) {
  app.use(cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  }));
} else {
  // Same-origin: only need CORS for dev/other clients
  app.use(cors({
    origin: allowedOrigins,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  }));
}

// ─── Body Parsing & Compression ───────────────────────────────────────────────
app.use(compression());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ─── Logging ──────────────────────────────────────────────────────────────────
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('combined', {
    stream: { write: (msg) => logger.info(msg.trim()) },
  }));
}

// ─── Rate Limiting ────────────────────────────────────────────────────────────
app.use('/api', rateLimiter);

// ─── Static Files: Uploads ────────────────────────────────────────────────────
app.use('/uploads', express.static(path.join(process.cwd(), uploadDir)));

// ─── Health Check ─────────────────────────────────────────────────────────────
app.get('/health', (_req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    version: '1.0.0',
    mode: hasFrontendBuild ? 'fullstack' : 'api-only',
  });
});

// ─── API Routes ───────────────────────────────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/forms', formRoutes);
app.use('/api/forms', fieldRoutes);
app.use('/api/forms', responseRoutes);
app.use('/api/export', exportRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/settings', settingRoutes);
app.use('/api/audit', auditRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/dashboard', dashboardRoutes);

// ─── 404 for API routes ───────────────────────────────────────────────────────
app.use('/api/*', (_req, res) => {
  res.status(404).json({ success: false, message: 'API endpoint tidak ditemukan' });
});

// ─── Serve Frontend (Full-stack mode) ────────────────────────────────────────
if (hasFrontendBuild && FULLSTACK_MODE) {
  // Serve static assets (JS, CSS, images, etc.)
  app.use(express.static(frontendBuildPath, {
    // Cache assets with content hash (they have hash in filename)
    setHeaders: (res, filePath) => {
      if (filePath.includes('/assets/')) {
        res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
      } else {
        res.setHeader('Cache-Control', 'public, max-age=0');
      }
    },
  }));

  // All non-API routes → serve React's index.html (for client-side routing)
  app.get('*', (_req, res) => {
    res.sendFile(path.join(frontendBuildPath, 'index.html'));
  });

  logger.info(`🖥️  Frontend: serving from ${frontendBuildPath}`);
} else {
  // API-only mode
  app.use((_req, res) => {
    res.status(404).json({
      success: false,
      message: 'Route tidak ditemukan. Frontend tidak tersedia dalam mode API-only.',
    });
  });

  if (!hasFrontendBuild) {
    logger.warn('⚠️  Frontend build tidak ditemukan di ./public/');
    logger.warn('   Jalankan: npm run build:full untuk mode full-stack');
  }
}

// ─── Global Error Handler ─────────────────────────────────────────────────────
app.use(errorHandler);

// ─── Start Server ─────────────────────────────────────────────────────────────
const PORT = parseInt(process.env.PORT || '3000', 10);

httpServer.listen(PORT, () => {
  logger.info(`🚀 Server berjalan di http://localhost:${PORT}`);
  logger.info(`📍 Environment : ${process.env.NODE_ENV || 'development'}`);
  logger.info(`🔧 Mode        : ${hasFrontendBuild ? '🌐 FULL-STACK (1 server)' : '🔌 API-ONLY'}`);
  if (hasFrontendBuild) {
    logger.info(`🌍 Akses app   : http://localhost:${PORT}`);
  } else {
    logger.info(`🌐 Frontend URL: ${process.env.FRONTEND_URL || 'http://localhost:5173'}`);
  }
});

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM diterima. Menutup server...');
  httpServer.close(() => {
    logger.info('Server ditutup.');
    process.exit(0);
  });
});

export { io };
export default app;

# Multi-stage Dockerfile untuk PCNU Form Builder
# Hasil: 1 container yang menjalankan frontend + backend

# ── Stage 1: Build Frontend ────────────────────────────────────────────────────
FROM node:20-alpine AS frontend-builder

WORKDIR /app/frontend

COPY frontend/package*.json ./
RUN npm ci --legacy-peer-deps

COPY frontend/ ./
# Build dengan env production (VITE_API_URL=/api)
RUN npm run build

# ── Stage 2: Build Backend ─────────────────────────────────────────────────────
FROM node:20-alpine AS backend-builder

WORKDIR /app/backend

COPY backend/package*.json ./
COPY backend/prisma ./prisma/
RUN npm ci
RUN npx prisma generate

COPY backend/ ./
RUN npm run build

# ── Stage 3: Production Image ──────────────────────────────────────────────────
FROM node:20-alpine AS production

WORKDIR /app

# Install only production dependencies
COPY backend/package*.json ./
COPY backend/prisma ./prisma/
RUN npm ci --only=production
RUN npx prisma generate

# Copy backend build
COPY --from=backend-builder /app/backend/dist ./dist/

# Copy frontend build ke backend/public (fullstack mode)
COPY --from=frontend-builder /app/frontend/dist ./public/

# Create required directories
RUN mkdir -p uploads/images uploads/documents uploads/signatures logs

# Non-root user untuk keamanan
RUN addgroup -g 1001 -S nodejs && adduser -S nodejs -u 1001
RUN chown -R nodejs:nodejs /app
USER nodejs

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=10s --start-period=30s --retries=3 \
  CMD wget -qO- http://localhost:3000/health || exit 1

CMD ["node", "dist/index.js"]

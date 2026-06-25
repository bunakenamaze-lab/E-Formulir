import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { generateTokens, verifyRefreshToken } from '../utils/jwt';
import { sendSuccess, sendError } from '../utils/response';
import { createAuditLog } from '../services/auditService';
import { AppError } from '../middleware/errorHandler';
import { AuthRequest } from '../middleware/auth';

const prisma = new PrismaClient();

export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  const user = await prisma.user.findUnique({
    where: { email: email.toLowerCase() },
  });

  if (!user || !await bcrypt.compare(password, user.password)) {
    throw new AppError('Email atau password salah', 401);
  }

  if (!user.isActive) {
    throw new AppError('Akun Anda telah dinonaktifkan. Hubungi administrator.', 403);
  }

  const { accessToken, refreshToken } = generateTokens({
    id: user.id,
    email: user.email,
    role: user.role,
  });

  // Update last login
  await prisma.user.update({
    where: { id: user.id },
    data: { lastLogin: new Date() },
  });

  // Audit log
  await createAuditLog({
    userId: user.id,
    action: 'LOGIN',
    entity: 'User',
    entityId: user.id,
    details: { email: user.email },
    req,
  });

  sendSuccess(res, {
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      avatar: user.avatar,
    },
    accessToken,
    refreshToken,
  }, 'Login berhasil');
};

export const logout = async (req: AuthRequest, res: Response) => {
  if (req.user) {
    await createAuditLog({
      userId: req.user.id,
      action: 'LOGOUT',
      entity: 'User',
      entityId: req.user.id,
      req,
    });
  }

  sendSuccess(res, null, 'Logout berhasil');
};

export const refreshToken = async (req: Request, res: Response) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    throw new AppError('Refresh token diperlukan', 400);
  }

  const decoded = verifyRefreshToken(refreshToken);

  const user = await prisma.user.findUnique({
    where: { id: decoded.id },
  });

  if (!user || !user.isActive) {
    throw new AppError('Token tidak valid', 401);
  }

  const tokens = generateTokens({
    id: user.id,
    email: user.email,
    role: user.role,
  });

  sendSuccess(res, tokens, 'Token diperbarui');
};

export const getProfile = async (req: AuthRequest, res: Response) => {
  const user = await prisma.user.findUnique({
    where: { id: req.user!.id },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      avatar: true,
      isActive: true,
      createdAt: true,
      lastLogin: true,
    },
  });

  sendSuccess(res, user, 'Profil berhasil dimuat');
};

export const updateProfile = async (req: AuthRequest, res: Response) => {
  const { name, currentPassword, newPassword } = req.body;

  const user = await prisma.user.findUnique({
    where: { id: req.user!.id },
  });

  if (!user) {
    throw new AppError('User tidak ditemukan', 404);
  }

  const updateData: any = {};

  if (name) {
    updateData.name = name;
  }

  if (newPassword) {
    if (!currentPassword) {
      throw new AppError('Password saat ini diperlukan', 400);
    }

    const isPasswordValid = await bcrypt.compare(currentPassword, user.password);
    if (!isPasswordValid) {
      throw new AppError('Password saat ini tidak benar', 400);
    }

    updateData.password = await bcrypt.hash(newPassword, 12);
  }

  const updated = await prisma.user.update({
    where: { id: req.user!.id },
    data: updateData,
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      avatar: true,
      isActive: true,
    },
  });

  sendSuccess(res, updated, 'Profil berhasil diperbarui');
};

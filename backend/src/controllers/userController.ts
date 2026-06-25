import { Response } from 'express';
import { PrismaClient, UserRole } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import { AuthRequest } from '../middleware/auth';
import { sendSuccess, getPagination, buildPaginationMeta } from '../utils/response';
import { AppError } from '../middleware/errorHandler';
import { createAuditLog } from '../services/auditService';

const prisma = new PrismaClient();

export const getUsers = async (req: AuthRequest, res: Response) => {
  const { page = 1, limit = 10, search, role, isActive } = req.query;
  const { skip, take } = getPagination(Number(page), Number(limit));

  const where: any = {};
  if (search) {
    where.OR = [
      { name: { contains: String(search) } },
      { email: { contains: String(search) } },
    ];
  }
  if (role) where.role = role;
  if (isActive !== undefined) where.isActive = isActive === 'true';

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where,
      skip,
      take,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        avatar: true,
        isActive: true,
        createdAt: true,
        lastLogin: true,
        _count: { select: { forms: true } },
      },
    }),
    prisma.user.count({ where }),
  ]);

  sendSuccess(res, users, 'Pengguna berhasil dimuat', 200, buildPaginationMeta(total, Number(page), Number(limit)));
};

export const getUserById = async (req: AuthRequest, res: Response) => {
  const { id } = req.params;

  const user = await prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      avatar: true,
      isActive: true,
      createdAt: true,
      lastLogin: true,
      _count: { select: { forms: true, responses: true } },
    },
  });

  if (!user) {
    throw new AppError('Pengguna tidak ditemukan', 404);
  }

  sendSuccess(res, user, 'Pengguna berhasil dimuat');
};

export const createUser = async (req: AuthRequest, res: Response) => {
  const { email, password, name, role } = req.body;

  const existing = await prisma.user.findUnique({
    where: { email: email.toLowerCase() },
  });

  if (existing) {
    throw new AppError('Email sudah terdaftar', 400);
  }

  const hashedPassword = await bcrypt.hash(password, 12);

  const user = await prisma.user.create({
    data: {
      id: uuidv4(),
      email: email.toLowerCase(),
      password: hashedPassword,
      name,
      role: role as UserRole,
      isActive: true,
    },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      isActive: true,
      createdAt: true,
    },
  });

  await createAuditLog({
    userId: req.user!.id,
    action: 'CREATE_USER',
    entity: 'User',
    entityId: user.id,
    details: { email: user.email, role: user.role },
    req,
  });

  sendSuccess(res, user, 'Pengguna berhasil dibuat', 201);
};

export const updateUser = async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const { name, role, isActive, password } = req.body;

  const existing = await prisma.user.findUnique({ where: { id } });
  if (!existing) {
    throw new AppError('Pengguna tidak ditemukan', 404);
  }

  // Prevent demoting the only super admin
  if (existing.role === 'SUPER_ADMIN' && role && role !== 'SUPER_ADMIN') {
    const superAdminCount = await prisma.user.count({
      where: { role: 'SUPER_ADMIN', isActive: true },
    });
    if (superAdminCount <= 1) {
      throw new AppError('Tidak dapat mengubah role Super Admin terakhir', 400);
    }
  }

  const updateData: any = {};
  if (name) updateData.name = name;
  if (role) updateData.role = role;
  if (isActive !== undefined) updateData.isActive = isActive;
  if (password) updateData.password = await bcrypt.hash(password, 12);

  const updated = await prisma.user.update({
    where: { id },
    data: updateData,
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      isActive: true,
      createdAt: true,
    },
  });

  await createAuditLog({
    userId: req.user!.id,
    action: 'UPDATE_USER',
    entity: 'User',
    entityId: id,
    details: { changes: Object.keys(updateData) },
    req,
  });

  sendSuccess(res, updated, 'Pengguna berhasil diperbarui');
};

export const deleteUser = async (req: AuthRequest, res: Response) => {
  const { id } = req.params;

  if (id === req.user!.id) {
    throw new AppError('Anda tidak dapat menghapus akun Anda sendiri', 400);
  }

  const existing = await prisma.user.findUnique({ where: { id } });
  if (!existing) {
    throw new AppError('Pengguna tidak ditemukan', 404);
  }

  if (existing.role === 'SUPER_ADMIN') {
    const count = await prisma.user.count({ where: { role: 'SUPER_ADMIN' } });
    if (count <= 1) {
      throw new AppError('Tidak dapat menghapus Super Admin terakhir', 400);
    }
  }

  await prisma.user.delete({ where: { id } });

  await createAuditLog({
    userId: req.user!.id,
    action: 'DELETE_USER',
    entity: 'User',
    entityId: id,
    details: { email: existing.email },
    req,
  });

  sendSuccess(res, null, 'Pengguna berhasil dihapus');
};

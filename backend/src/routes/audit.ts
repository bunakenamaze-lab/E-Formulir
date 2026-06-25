import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticate, authorize } from '../middleware/auth';
import { sendSuccess, getPagination, buildPaginationMeta } from '../utils/response';
import { AuthRequest } from '../middleware/auth';

const router = Router();
const prisma = new PrismaClient();

router.get('/', authenticate, authorize('SUPER_ADMIN'), async (req: AuthRequest, res) => {
  const { page = 1, limit = 20, action, userId, startDate, endDate } = req.query;
  const { skip, take } = getPagination(Number(page), Number(limit));

  const where: any = {};
  if (action) where.action = action;
  if (userId) where.userId = userId;
  if (startDate || endDate) {
    where.createdAt = {};
    if (startDate) where.createdAt.gte = new Date(String(startDate));
    if (endDate) where.createdAt.lte = new Date(String(endDate));
  }

  const [logs, total] = await Promise.all([
    prisma.auditLog.findMany({
      where,
      skip,
      take,
      orderBy: { createdAt: 'desc' },
      include: {
        user: { select: { id: true, name: true, email: true, role: true } },
      },
    }),
    prisma.auditLog.count({ where }),
  ]);

  sendSuccess(res, logs, 'Log berhasil dimuat', 200, buildPaginationMeta(total, Number(page), Number(limit)));
});

export default router;

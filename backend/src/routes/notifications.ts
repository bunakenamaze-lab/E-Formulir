import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticate } from '../middleware/auth';
import { sendSuccess } from '../utils/response';
import { AuthRequest } from '../middleware/auth';

const router = Router();
const prisma = new PrismaClient();

router.get('/', authenticate, async (req: AuthRequest, res) => {
  const { page = 1, limit = 20, unreadOnly } = req.query;
  const skip = (Number(page) - 1) * Number(limit);

  const where: any = { userId: req.user!.id };
  if (unreadOnly === 'true') where.isRead = false;

  const [notifications, total, unreadCount] = await Promise.all([
    prisma.notification.findMany({
      where,
      skip,
      take: Number(limit),
      orderBy: { createdAt: 'desc' },
    }),
    prisma.notification.count({ where }),
    prisma.notification.count({ where: { userId: req.user!.id, isRead: false } }),
  ]);

  sendSuccess(res, { notifications, unreadCount }, 'Notifikasi berhasil dimuat', 200, {
    total,
    page: Number(page),
    limit: Number(limit),
    totalPages: Math.ceil(total / Number(limit)),
  });
});

router.patch('/:id/read', authenticate, async (req: AuthRequest, res) => {
  const { id } = req.params;

  await prisma.notification.updateMany({
    where: { id, userId: req.user!.id },
    data: { isRead: true, readAt: new Date() },
  });

  sendSuccess(res, null, 'Notifikasi ditandai dibaca');
});

router.patch('/read-all', authenticate, async (req: AuthRequest, res) => {
  await prisma.notification.updateMany({
    where: { userId: req.user!.id, isRead: false },
    data: { isRead: true, readAt: new Date() },
  });

  sendSuccess(res, null, 'Semua notifikasi ditandai dibaca');
});

router.delete('/:id', authenticate, async (req: AuthRequest, res) => {
  const { id } = req.params;
  await prisma.notification.deleteMany({
    where: { id, userId: req.user!.id },
  });
  sendSuccess(res, null, 'Notifikasi dihapus');
});

export default router;

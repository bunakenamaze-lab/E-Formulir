import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticate, authorize } from '../middleware/auth';
import { sendSuccess } from '../utils/response';
import { AuthRequest } from '../middleware/auth';

const router = Router();
const prisma = new PrismaClient();

router.get('/', authenticate, async (req: AuthRequest, res) => {
  const settings = await prisma.setting.findMany();
  const settingsMap = settings.reduce((acc: any, s) => {
    acc[s.key] = s.value;
    return acc;
  }, {});
  sendSuccess(res, settingsMap, 'Pengaturan berhasil dimuat');
});

router.put('/:key', authenticate, authorize('SUPER_ADMIN'), async (req: AuthRequest, res) => {
  const { key } = req.params;
  const { value } = req.body;

  const setting = await prisma.setting.upsert({
    where: { key },
    update: { value },
    create: { key, value },
  });

  sendSuccess(res, setting, 'Pengaturan berhasil disimpan');
});

export default router;

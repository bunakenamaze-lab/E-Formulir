import { Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthRequest } from '../middleware/auth';
import { sendSuccess } from '../utils/response';

const prisma = new PrismaClient();

export const getDashboardStats = async (req: AuthRequest, res: Response) => {
  const userId = req.user!.id;
  const role = req.user!.role;

  const formWhere = role === 'SUPER_ADMIN' ? {} : { createdById: userId };

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [
    totalForms,
    activeForms,
    draftForms,
    closedForms,
    totalResponses,
    todayResponses,
    recentForms,
    recentResponses,
    responsesByDay,
  ] = await Promise.all([
    prisma.form.count({ where: formWhere }),
    prisma.form.count({ where: { ...formWhere, status: 'PUBLISHED' } }),
    prisma.form.count({ where: { ...formWhere, status: 'DRAFT' } }),
    prisma.form.count({ where: { ...formWhere, status: 'CLOSED' } }),
    prisma.response.count({
      where: {
        form: formWhere,
        isCompleted: true,
      },
    }),
    prisma.response.count({
      where: {
        form: formWhere,
        isCompleted: true,
        createdAt: { gte: today },
      },
    }),
    prisma.form.findMany({
      where: formWhere,
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: {
        _count: { select: { responses: true } },
        createdBy: { select: { name: true } },
      },
    }),
    prisma.response.findMany({
      where: {
        form: formWhere,
        isCompleted: true,
      },
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: {
        form: { select: { title: true, id: true } },
      },
    }),
    getResponsesByDay(formWhere),
  ]);

  // Top forms by response count
  const topForms = await prisma.form.findMany({
    where: { ...formWhere, status: 'PUBLISHED' },
    take: 5,
    include: {
      _count: { select: { responses: true } },
    },
    orderBy: {
      responses: { _count: 'desc' },
    },
  });

  sendSuccess(res, {
    stats: {
      totalForms,
      activeForms,
      draftForms,
      closedForms,
      totalResponses,
      todayResponses,
    },
    recentForms,
    recentResponses,
    responsesByDay,
    topForms,
  }, 'Dashboard berhasil dimuat');
};

async function getResponsesByDay(formWhere: any) {
  const days = 7;
  const result = [];

  for (let i = days - 1; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    date.setHours(0, 0, 0, 0);

    const nextDate = new Date(date);
    nextDate.setDate(nextDate.getDate() + 1);

    const count = await prisma.response.count({
      where: {
        form: formWhere,
        isCompleted: true,
        createdAt: {
          gte: date,
          lt: nextDate,
        },
      },
    });

    result.push({
      date: date.toISOString().split('T')[0],
      label: date.toLocaleDateString('id-ID', { weekday: 'short', day: 'numeric', month: 'short' }),
      count,
    });
  }

  return result;
}

import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';
import { AuthRequest } from '../middleware/auth';
import { sendSuccess, getPagination, buildPaginationMeta } from '../utils/response';
import { AppError } from '../middleware/errorHandler';
import { createNotificationForAdmins } from '../services/notificationService';
import { createAuditLog } from '../services/auditService';

const prisma = new PrismaClient();

export const getResponses = async (req: AuthRequest, res: Response) => {
  const { formId } = req.params;
  const { page = 1, limit = 20, search, isCompleted, startDate, endDate } = req.query;

  const form = await prisma.form.findUnique({ where: { id: formId } });
  if (!form) throw new AppError('Formulir tidak ditemukan', 404);

  if (req.user!.role !== 'SUPER_ADMIN' && form.createdById !== req.user!.id) {
    throw new AppError('Anda tidak memiliki akses ke formulir ini', 403);
  }

  const { skip, take } = getPagination(Number(page), Number(limit));

  const where: any = { formId };

  if (isCompleted !== undefined) where.isCompleted = isCompleted === 'true';
  if (startDate || endDate) {
    where.createdAt = {};
    if (startDate) where.createdAt.gte = new Date(String(startDate));
    if (endDate) where.createdAt.lte = new Date(String(endDate));
  }

  if (search) {
    where.OR = [
      { respondentName: { contains: String(search) } },
      { respondentEmail: { contains: String(search) } },
    ];
  }

  const [responses, total] = await Promise.all([
    prisma.response.findMany({
      where,
      skip,
      take,
      orderBy: { createdAt: 'desc' },
      include: {
        answers: {
          include: { field: { select: { id: true, label: true, type: true } } },
        },
      },
    }),
    prisma.response.count({ where }),
  ]);

  sendSuccess(res, responses, 'Respon berhasil dimuat', 200, buildPaginationMeta(total, Number(page), Number(limit)));
};

export const getResponseById = async (req: AuthRequest, res: Response) => {
  const { formId, responseId } = req.params;

  const form = await prisma.form.findUnique({ where: { id: formId } });
  if (!form) throw new AppError('Formulir tidak ditemukan', 404);

  if (req.user!.role !== 'SUPER_ADMIN' && form.createdById !== req.user!.id) {
    throw new AppError('Anda tidak memiliki akses ke formulir ini', 403);
  }

  const response = await prisma.response.findFirst({
    where: { id: responseId, formId },
    include: {
      answers: {
        include: {
          field: true,
        },
        orderBy: { field: { order: 'asc' } },
      },
    },
  });

  if (!response) {
    throw new AppError('Respon tidak ditemukan', 404);
  }

  sendSuccess(res, response, 'Respon berhasil dimuat');
};

export const submitResponse = async (req: Request, res: Response) => {
  const { slug } = req.params;
  const { answers, respondentName, respondentEmail, isDraft = false } = req.body;

  const form = await prisma.form.findUnique({
    where: { slug },
    include: { fields: true },
  });

  if (!form) {
    throw new AppError('Formulir tidak ditemukan', 404);
  }

  if (form.status !== 'PUBLISHED') {
    throw new AppError('Formulir ini tidak tersedia', 403);
  }

  const settings = form.settings as any;

  // Check if multiple submissions are allowed
  if (!settings.allowMultiple && respondentEmail) {
    const existing = await prisma.response.findFirst({
      where: { formId: form.id, respondentEmail, isCompleted: true },
    });
    if (existing) {
      throw new AppError('Anda sudah mengisi formulir ini sebelumnya', 400);
    }
  }

  // Validate required fields
  if (!isDraft) {
    const requiredFields = form.fields.filter((f) => {
      const config = f.config as any;
      return config.required === true;
    });

    for (const field of requiredFields) {
      const answer = answers?.find((a: any) => a.fieldId === field.id);
      if (!answer || answer.value === null || answer.value === '' ||
          (Array.isArray(answer.value) && answer.value.length === 0)) {
        throw new AppError(`Field "${field.label}" wajib diisi`, 400);
      }
    }
  }

  const response = await prisma.response.create({
    data: {
      id: uuidv4(),
      formId: form.id,
      respondentName,
      respondentEmail,
      isCompleted: !isDraft,
      isDraft,
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
      completedAt: isDraft ? null : new Date(),
      timeSpent: req.body.timeSpent,
      answers: {
        create: (answers || []).map((answer: any) => ({
          id: uuidv4(),
          fieldId: answer.fieldId,
          value: answer.value,
        })),
      },
    },
    include: {
      answers: true,
    },
  });

  // Notify admins for completed responses
  if (!isDraft) {
    await createNotificationForAdmins({
      title: 'Respon Baru Diterima',
      message: `Ada respon baru untuk formulir "${form.title}"${respondentName ? ` dari ${respondentName}` : ''}.`,
      type: 'info',
      link: `/forms/${form.id}/responses`,
    });
  }

  sendSuccess(
    res,
    { id: response.id, isCompleted: response.isCompleted },
    isDraft ? 'Draft berhasil disimpan' : 'Formulir berhasil dikirim',
    201
  );
};

export const updateResponse = async (req: AuthRequest, res: Response) => {
  const { formId, responseId } = req.params;
  const { answers, respondentName, respondentEmail } = req.body;

  const form = await prisma.form.findUnique({ where: { id: formId } });
  if (!form) throw new AppError('Formulir tidak ditemukan', 404);

  if (req.user!.role !== 'SUPER_ADMIN' && form.createdById !== req.user!.id) {
    throw new AppError('Anda tidak memiliki akses', 403);
  }

  const response = await prisma.response.findFirst({
    where: { id: responseId, formId },
  });

  if (!response) throw new AppError('Respon tidak ditemukan', 404);

  // Update response
  const updated = await prisma.response.update({
    where: { id: responseId },
    data: {
      respondentName,
      respondentEmail,
      answers: {
        deleteMany: {},
        create: (answers || []).map((answer: any) => ({
          id: uuidv4(),
          fieldId: answer.fieldId,
          value: answer.value,
        })),
      },
    },
    include: {
      answers: { include: { field: true } },
    },
  });

  await createAuditLog({
    userId: req.user!.id,
    action: 'UPDATE_RESPONSE',
    entity: 'Response',
    entityId: responseId,
    req,
  });

  sendSuccess(res, updated, 'Respon berhasil diperbarui');
};

export const deleteResponse = async (req: AuthRequest, res: Response) => {
  const { formId, responseId } = req.params;

  const form = await prisma.form.findUnique({ where: { id: formId } });
  if (!form) throw new AppError('Formulir tidak ditemukan', 404);

  if (req.user!.role !== 'SUPER_ADMIN' && form.createdById !== req.user!.id) {
    throw new AppError('Anda tidak memiliki akses', 403);
  }

  const response = await prisma.response.findFirst({
    where: { id: responseId, formId },
  });

  if (!response) throw new AppError('Respon tidak ditemukan', 404);

  await prisma.response.delete({ where: { id: responseId } });

  await createAuditLog({
    userId: req.user!.id,
    action: 'DELETE_RESPONSE',
    entity: 'Response',
    entityId: responseId,
    req,
  });

  sendSuccess(res, null, 'Respon berhasil dihapus');
};

export const getResponseStats = async (req: AuthRequest, res: Response) => {
  const { formId } = req.params;

  const form = await prisma.form.findUnique({ where: { id: formId } });
  if (!form) throw new AppError('Formulir tidak ditemukan', 404);

  if (req.user!.role !== 'SUPER_ADMIN' && form.createdById !== req.user!.id) {
    throw new AppError('Anda tidak memiliki akses ke formulir ini', 403);
  }

  const [total, completed, drafts, today] = await Promise.all([
    prisma.response.count({ where: { formId } }),
    prisma.response.count({ where: { formId, isCompleted: true } }),
    prisma.response.count({ where: { formId, isDraft: true } }),
    prisma.response.count({
      where: {
        formId,
        createdAt: {
          gte: new Date(new Date().setHours(0, 0, 0, 0)),
        },
      },
    }),
  ]);

  sendSuccess(res, {
    total,
    completed,
    drafts,
    today,
    completionRate: total > 0 ? Math.round((completed / total) * 100) : 0,
  }, 'Statistik berhasil dimuat');
};

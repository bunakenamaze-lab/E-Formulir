import { Response } from 'express';
import { PrismaClient, FormStatus } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';
import QRCode from 'qrcode';
import { AuthRequest } from '../middleware/auth';
import { sendSuccess, getPagination, buildPaginationMeta } from '../utils/response';
import { AppError } from '../middleware/errorHandler';
import { generateUniqueSlug } from '../utils/slug';
import { createAuditLog } from '../services/auditService';
import { createNotificationForAdmins } from '../services/notificationService';

const prisma = new PrismaClient();

export const getForms = async (req: AuthRequest, res: Response) => {
  const { page = 1, limit = 10, search, status, category, isTemplate } = req.query;

  const { skip, take } = getPagination(Number(page), Number(limit));

  const where: any = {};

  // Only super admin can see all forms; others see their own
  if (req.user!.role !== 'SUPER_ADMIN') {
    where.createdById = req.user!.id;
  }

  if (search) {
    where.OR = [
      { title: { contains: String(search) } },
      { description: { contains: String(search) } },
    ];
  }

  if (status) where.status = status;
  if (category) where.category = category;
  if (isTemplate !== undefined) where.isTemplate = isTemplate === 'true';

  const [forms, total] = await Promise.all([
    prisma.form.findMany({
      where,
      skip,
      take,
      orderBy: { createdAt: 'desc' },
      include: {
        createdBy: { select: { id: true, name: true, email: true } },
        _count: { select: { responses: true, fields: true } },
      },
    }),
    prisma.form.count({ where }),
  ]);

  sendSuccess(res, forms, 'Formulir berhasil dimuat', 200, buildPaginationMeta(total, Number(page), Number(limit)));
};

export const getFormById = async (req: AuthRequest, res: Response) => {
  const { id } = req.params;

  const form = await prisma.form.findUnique({
    where: { id },
    include: {
      fields: { orderBy: { order: 'asc' } },
      createdBy: { select: { id: true, name: true, email: true } },
      _count: { select: { responses: true } },
    },
  });

  if (!form) {
    throw new AppError('Formulir tidak ditemukan', 404);
  }

  // Check access
  if (req.user!.role !== 'SUPER_ADMIN' && form.createdById !== req.user!.id) {
    throw new AppError('Anda tidak memiliki akses ke formulir ini', 403);
  }

  sendSuccess(res, form, 'Formulir berhasil dimuat');
};

export const getPublicForm = async (req: AuthRequest, res: Response) => {
  const { slug } = req.params;

  const form = await prisma.form.findUnique({
    where: { slug },
    include: {
      fields: { orderBy: { order: 'asc' } },
    },
  });

  if (!form) {
    throw new AppError('Formulir tidak ditemukan', 404);
  }

  if (form.status !== FormStatus.PUBLISHED) {
    throw new AppError('Formulir ini tidak tersedia', 403);
  }

  // Increment view count
  await prisma.form.update({
    where: { id: form.id },
    data: { viewCount: { increment: 1 } },
  });

  sendSuccess(res, form, 'Formulir berhasil dimuat');
};

export const createForm = async (req: AuthRequest, res: Response) => {
  const { title, description, settings, theme, category, tags } = req.body;

  const slug = await generateUniqueSlug(title);

  const form = await prisma.form.create({
    data: {
      id: uuidv4(),
      title,
      description,
      slug,
      settings: settings || {
        allowMultiple: true,
        showProgress: false,
        requireAuth: false,
        autoSave: true,
        multiStep: false,
        submitMessage: 'Terima kasih! Respon Anda telah diterima.',
      },
      theme: theme || {
        primaryColor: '#0F7A3D',
        backgroundColor: '#F5F7FA',
        fontFamily: 'Inter',
      },
      category,
      tags,
      createdById: req.user!.id,
    },
    include: {
      createdBy: { select: { id: true, name: true, email: true } },
    },
  });

  await createAuditLog({
    userId: req.user!.id,
    action: 'CREATE_FORM',
    entity: 'Form',
    entityId: form.id,
    details: { formTitle: form.title },
    req,
  });

  sendSuccess(res, form, 'Formulir berhasil dibuat', 201);
};

export const updateForm = async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const { title, description, settings, theme, category, tags, status } = req.body;

  const existing = await prisma.form.findUnique({ where: { id } });

  if (!existing) {
    throw new AppError('Formulir tidak ditemukan', 404);
  }

  if (req.user!.role !== 'SUPER_ADMIN' && existing.createdById !== req.user!.id) {
    throw new AppError('Anda tidak memiliki akses untuk mengubah formulir ini', 403);
  }

  const updateData: any = {};

  if (title) {
    updateData.title = title;
    updateData.slug = await generateUniqueSlug(title);
  }
  if (description !== undefined) updateData.description = description;
  if (settings) updateData.settings = settings;
  if (theme) updateData.theme = theme;
  if (category) updateData.category = category;
  if (tags !== undefined) updateData.tags = tags;

  // Handle status changes
  if (status && status !== existing.status) {
    updateData.status = status;
    if (status === FormStatus.PUBLISHED && !existing.publishedAt) {
      updateData.publishedAt = new Date();
    }
    if (status === FormStatus.CLOSED) {
      updateData.closedAt = new Date();
    }
  }

  const updated = await prisma.form.update({
    where: { id },
    data: updateData,
    include: {
      fields: { orderBy: { order: 'asc' } },
      createdBy: { select: { id: true, name: true, email: true } },
    },
  });

  await createAuditLog({
    userId: req.user!.id,
    action: 'UPDATE_FORM',
    entity: 'Form',
    entityId: id,
    details: { formTitle: updated.title, changes: Object.keys(updateData) },
    req,
  });

  sendSuccess(res, updated, 'Formulir berhasil diperbarui');
};

export const deleteForm = async (req: AuthRequest, res: Response) => {
  const { id } = req.params;

  const existing = await prisma.form.findUnique({ where: { id } });

  if (!existing) {
    throw new AppError('Formulir tidak ditemukan', 404);
  }

  if (req.user!.role !== 'SUPER_ADMIN' && existing.createdById !== req.user!.id) {
    throw new AppError('Anda tidak memiliki akses untuk menghapus formulir ini', 403);
  }

  await prisma.form.delete({ where: { id } });

  await createAuditLog({
    userId: req.user!.id,
    action: 'DELETE_FORM',
    entity: 'Form',
    entityId: id,
    details: { formTitle: existing.title },
    req,
  });

  sendSuccess(res, null, 'Formulir berhasil dihapus');
};

export const publishForm = async (req: AuthRequest, res: Response) => {
  const { id } = req.params;

  const existing = await prisma.form.findUnique({
    where: { id },
    include: { _count: { select: { fields: true } } },
  });

  if (!existing) {
    throw new AppError('Formulir tidak ditemukan', 404);
  }

  if (req.user!.role !== 'SUPER_ADMIN' && existing.createdById !== req.user!.id) {
    throw new AppError('Anda tidak memiliki akses ke formulir ini', 403);
  }

  if (existing._count.fields === 0) {
    throw new AppError('Formulir harus memiliki minimal satu field sebelum dipublikasi', 400);
  }

  const updated = await prisma.form.update({
    where: { id },
    data: {
      status: FormStatus.PUBLISHED,
      publishedAt: existing.publishedAt || new Date(),
    },
  });

  await createAuditLog({
    userId: req.user!.id,
    action: 'PUBLISH_FORM',
    entity: 'Form',
    entityId: id,
    details: { formTitle: existing.title },
    req,
  });

  sendSuccess(res, updated, 'Formulir berhasil dipublikasi');
};

export const duplicateForm = async (req: AuthRequest, res: Response) => {
  const { id } = req.params;

  const original = await prisma.form.findUnique({
    where: { id },
    include: { fields: { orderBy: { order: 'asc' } } },
  });

  if (!original) {
    throw new AppError('Formulir tidak ditemukan', 404);
  }

  const newSlug = await generateUniqueSlug(`${original.title} - Salinan`);

  const duplicate = await prisma.form.create({
    data: {
      id: uuidv4(),
      title: `${original.title} - Salinan`,
      description: original.description,
      slug: newSlug,
      status: FormStatus.DRAFT,
      settings: original.settings as any,
      theme: original.theme as any,
      category: original.category,
      tags: original.tags,
      createdById: req.user!.id,
      fields: {
        create: original.fields.map((field) => ({
          id: uuidv4(),
          type: field.type,
          label: field.label,
          placeholder: field.placeholder,
          helpText: field.helpText,
          config: field.config as any,
          conditional: field.conditional as any,
          order: field.order,
          section: field.section,
        })),
      },
    },
    include: {
      fields: { orderBy: { order: 'asc' } },
    },
  });

  sendSuccess(res, duplicate, 'Formulir berhasil digandakan', 201);
};

export const getFormQRCode = async (req: AuthRequest, res: Response) => {
  const { id } = req.params;

  const form = await prisma.form.findUnique({ where: { id } });

  if (!form) {
    throw new AppError('Formulir tidak ditemukan', 404);
  }

  const publicUrl = `${process.env.FRONTEND_URL}/f/${form.slug}`;
  const qrCode = await QRCode.toDataURL(publicUrl, {
    width: 300,
    margin: 2,
    color: { dark: '#0F7A3D', light: '#FFFFFF' },
  });

  sendSuccess(res, { qrCode, publicUrl, slug: form.slug }, 'QR Code berhasil dibuat');
};

export const getTemplates = async (req: AuthRequest, res: Response) => {
  const { category } = req.query;

  const where: any = { isTemplate: true, status: FormStatus.PUBLISHED };
  if (category) where.category = category;

  const templates = await prisma.form.findMany({
    where,
    include: {
      _count: { select: { fields: true } },
    },
    orderBy: { createdAt: 'desc' },
  });

  sendSuccess(res, templates, 'Template berhasil dimuat');
};

export const useTemplate = async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const { title } = req.body;

  const template = await prisma.form.findUnique({
    where: { id, isTemplate: true },
    include: { fields: { orderBy: { order: 'asc' } } },
  });

  if (!template) {
    throw new AppError('Template tidak ditemukan', 404);
  }

  const formTitle = title || template.title;
  const newSlug = await generateUniqueSlug(formTitle);

  const newForm = await prisma.form.create({
    data: {
      id: uuidv4(),
      title: formTitle,
      description: template.description,
      slug: newSlug,
      status: FormStatus.DRAFT,
      settings: template.settings as any,
      theme: template.theme as any,
      category: template.category,
      tags: template.tags,
      createdById: req.user!.id,
      isTemplate: false,
      fields: {
        create: template.fields.map((field) => ({
          id: uuidv4(),
          type: field.type,
          label: field.label,
          placeholder: field.placeholder,
          helpText: field.helpText,
          config: field.config as any,
          conditional: field.conditional as any,
          order: field.order,
          section: field.section,
        })),
      },
    },
    include: {
      fields: { orderBy: { order: 'asc' } },
    },
  });

  sendSuccess(res, newForm, 'Formulir berhasil dibuat dari template', 201);
};

import { Response } from 'express';
import { PrismaClient, FieldType } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';
import { AuthRequest } from '../middleware/auth';
import { sendSuccess } from '../utils/response';
import { AppError } from '../middleware/errorHandler';

const prisma = new PrismaClient();

const checkFormAccess = async (formId: string, userId: string, role: string) => {
  const form = await prisma.form.findUnique({ where: { id: formId } });
  if (!form) throw new AppError('Formulir tidak ditemukan', 404);
  if (role !== 'SUPER_ADMIN' && form.createdById !== userId) {
    throw new AppError('Anda tidak memiliki akses ke formulir ini', 403);
  }
  return form;
};

export const getFields = async (req: AuthRequest, res: Response) => {
  const { formId } = req.params;
  await checkFormAccess(formId, req.user!.id, req.user!.role);

  const fields = await prisma.field.findMany({
    where: { formId },
    orderBy: { order: 'asc' },
  });

  sendSuccess(res, fields, 'Field berhasil dimuat');
};

export const createField = async (req: AuthRequest, res: Response) => {
  const { formId } = req.params;
  const { type, label, placeholder, helpText, config, conditional, order, section } = req.body;

  await checkFormAccess(formId, req.user!.id, req.user!.role);

  // Get max order if not specified
  let fieldOrder = order;
  if (fieldOrder === undefined) {
    const maxOrder = await prisma.field.aggregate({
      where: { formId },
      _max: { order: true },
    });
    fieldOrder = (maxOrder._max.order || 0) + 1;
  }

  const field = await prisma.field.create({
    data: {
      id: uuidv4(),
      formId,
      type: type as FieldType,
      label,
      placeholder,
      helpText,
      config: config || {},
      conditional,
      order: fieldOrder,
      section,
    },
  });

  sendSuccess(res, field, 'Field berhasil ditambahkan', 201);
};

export const updateField = async (req: AuthRequest, res: Response) => {
  const { formId, fieldId } = req.params;
  const { label, placeholder, helpText, config, conditional, order, section } = req.body;

  await checkFormAccess(formId, req.user!.id, req.user!.role);

  const field = await prisma.field.findFirst({
    where: { id: fieldId, formId },
  });

  if (!field) {
    throw new AppError('Field tidak ditemukan', 404);
  }

  const updated = await prisma.field.update({
    where: { id: fieldId },
    data: {
      ...(label !== undefined && { label }),
      ...(placeholder !== undefined && { placeholder }),
      ...(helpText !== undefined && { helpText }),
      ...(config && { config }),
      ...(conditional !== undefined && { conditional }),
      ...(order !== undefined && { order }),
      ...(section !== undefined && { section }),
    },
  });

  sendSuccess(res, updated, 'Field berhasil diperbarui');
};

export const deleteField = async (req: AuthRequest, res: Response) => {
  const { formId, fieldId } = req.params;

  await checkFormAccess(formId, req.user!.id, req.user!.role);

  const field = await prisma.field.findFirst({
    where: { id: fieldId, formId },
  });

  if (!field) {
    throw new AppError('Field tidak ditemukan', 404);
  }

  await prisma.field.delete({ where: { id: fieldId } });

  sendSuccess(res, null, 'Field berhasil dihapus');
};

export const reorderFields = async (req: AuthRequest, res: Response) => {
  const { formId } = req.params;
  const { fieldOrders } = req.body; // [{ id: string, order: number }]

  await checkFormAccess(formId, req.user!.id, req.user!.role);

  // Update all field orders in parallel
  await Promise.all(
    fieldOrders.map(({ id, order }: { id: string; order: number }) =>
      prisma.field.update({
        where: { id },
        data: { order },
      })
    )
  );

  const fields = await prisma.field.findMany({
    where: { formId },
    orderBy: { order: 'asc' },
  });

  sendSuccess(res, fields, 'Urutan field berhasil diperbarui');
};

export const bulkUpdateFields = async (req: AuthRequest, res: Response) => {
  const { formId } = req.params;
  const { fields } = req.body; // Full fields array

  await checkFormAccess(formId, req.user!.id, req.user!.role);

  // Delete existing fields and recreate
  await prisma.field.deleteMany({ where: { formId } });

  if (fields && fields.length > 0) {
    await prisma.field.createMany({
      data: fields.map((field: any, index: number) => ({
        id: field.id || uuidv4(),
        formId,
        type: field.type as FieldType,
        label: field.label,
        placeholder: field.placeholder,
        helpText: field.helpText,
        config: field.config || {},
        conditional: field.conditional,
        order: field.order !== undefined ? field.order : index,
        section: field.section,
      })),
    });
  }

  const updatedFields = await prisma.field.findMany({
    where: { formId },
    orderBy: { order: 'asc' },
  });

  sendSuccess(res, updatedFields, 'Fields berhasil diperbarui');
};

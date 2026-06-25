import { Response } from 'express';
import { PrismaClient } from '@prisma/client';
import * as XLSX from 'xlsx';
import { AuthRequest } from '../middleware/auth';
import { AppError } from '../middleware/errorHandler';
import { createAuditLog } from '../services/auditService';

const prisma = new PrismaClient();

const getFormWithResponses = async (formId: string, userId: string, role: string) => {
  const form = await prisma.form.findUnique({
    where: { id: formId },
    include: {
      fields: { orderBy: { order: 'asc' } },
      responses: {
        where: { isCompleted: true },
        include: {
          answers: { include: { field: true } },
        },
        orderBy: { createdAt: 'desc' },
      },
    },
  });

  if (!form) throw new AppError('Formulir tidak ditemukan', 404);
  if (role !== 'SUPER_ADMIN' && form.createdById !== userId) {
    throw new AppError('Anda tidak memiliki akses', 403);
  }

  return form;
};

const buildDataRows = (form: any) => {
  const displayFields = form.fields.filter(
    (f: any) => !['SECTION_DIVIDER', 'HEADING', 'DESCRIPTION'].includes(f.type)
  );

  const headers = [
    'No',
    'Nama Responden',
    'Email Responden',
    'Tanggal Pengisian',
    'Waktu Pengisian',
    ...displayFields.map((f: any) => f.label),
  ];

  const rows = form.responses.map((response: any, index: number) => {
    const row: any[] = [
      index + 1,
      response.respondentName || '-',
      response.respondentEmail || '-',
      new Date(response.createdAt).toLocaleDateString('id-ID', {
        day: '2-digit', month: 'long', year: 'numeric',
      }),
      new Date(response.createdAt).toLocaleTimeString('id-ID'),
    ];

    displayFields.forEach((field: any) => {
      const answer = response.answers.find((a: any) => a.fieldId === field.id);
      if (!answer) {
        row.push('-');
        return;
      }

      const val = answer.value;
      if (Array.isArray(val)) {
        row.push(val.join(', '));
      } else if (val === null || val === undefined) {
        row.push('-');
      } else if (typeof val === 'object') {
        row.push(JSON.stringify(val));
      } else {
        row.push(String(val));
      }
    });

    return row;
  });

  return { headers, rows };
};

export const exportToExcel = async (req: AuthRequest, res: Response) => {
  const { formId } = req.params;

  const form = await getFormWithResponses(formId, req.user!.id, req.user!.role);
  const { headers, rows } = buildDataRows(form);

  const wb = XLSX.utils.book_new();
  const wsData = [headers, ...rows];
  const ws = XLSX.utils.aoa_to_sheet(wsData);

  // Style headers
  const headerRange = XLSX.utils.decode_range(ws['!ref'] || 'A1');
  for (let col = headerRange.s.c; col <= headerRange.e.c; col++) {
    const cellRef = XLSX.utils.encode_cell({ r: 0, c: col });
    if (!ws[cellRef]) continue;
    ws[cellRef].s = {
      font: { bold: true, color: { rgb: 'FFFFFF' } },
      fill: { fgColor: { rgb: '0F7A3D' } },
      alignment: { horizontal: 'center' },
    };
  }

  // Auto column width
  const colWidths = headers.map((h: string) => ({ wch: Math.max(h.length + 5, 15) }));
  ws['!cols'] = colWidths;

  XLSX.utils.book_append_sheet(wb, ws, 'Respon');

  // Summary sheet
  const summaryData = [
    ['RINGKASAN FORMULIR'],
    [''],
    ['Nama Formulir', form.title],
    ['Deskripsi', form.description || '-'],
    ['Status', form.status],
    ['Total Respon', form.responses.length],
    ['Tanggal Export', new Date().toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' })],
    ['Diekspor oleh', req.user!.name],
  ];

  const summaryWs = XLSX.utils.aoa_to_sheet(summaryData);
  XLSX.utils.book_append_sheet(wb, summaryWs, 'Ringkasan');

  const buffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });

  await createAuditLog({
    userId: req.user!.id,
    action: 'EXPORT_DATA',
    entity: 'Form',
    entityId: formId,
    details: { format: 'xlsx', formTitle: form.title },
    req,
  });

  const filename = `respon-${form.title.replace(/[^a-zA-Z0-9]/g, '-').toLowerCase()}-${Date.now()}.xlsx`;

  res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
  res.send(buffer);
};

export const exportToCSV = async (req: AuthRequest, res: Response) => {
  const { formId } = req.params;

  const form = await getFormWithResponses(formId, req.user!.id, req.user!.role);
  const { headers, rows } = buildDataRows(form);

  const escapeCSV = (val: any) => {
    const str = String(val);
    if (str.includes(',') || str.includes('"') || str.includes('\n')) {
      return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
  };

  const csvLines = [
    headers.map(escapeCSV).join(','),
    ...rows.map((row: any[]) => row.map(escapeCSV).join(',')),
  ];

  const csvContent = '\uFEFF' + csvLines.join('\n'); // BOM for Excel

  await createAuditLog({
    userId: req.user!.id,
    action: 'EXPORT_DATA',
    entity: 'Form',
    entityId: formId,
    details: { format: 'csv', formTitle: form.title },
    req,
  });

  const filename = `respon-${form.title.replace(/[^a-zA-Z0-9]/g, '-').toLowerCase()}-${Date.now()}.csv`;

  res.setHeader('Content-Type', 'text/csv; charset=utf-8');
  res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
  res.send(csvContent);
};

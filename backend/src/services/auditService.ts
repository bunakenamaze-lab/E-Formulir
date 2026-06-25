import { PrismaClient, LogAction } from '@prisma/client';
import { Request } from 'express';

const prisma = new PrismaClient();

interface AuditLogParams {
  userId: string;
  action: LogAction;
  entity: string;
  entityId?: string;
  details?: Record<string, any>;
  req?: Request;
}

export const createAuditLog = async ({
  userId,
  action,
  entity,
  entityId,
  details,
  req,
}: AuditLogParams) => {
  try {
    await prisma.auditLog.create({
      data: {
        userId,
        action,
        entity,
        entityId,
        details: details || {},
        ipAddress: req?.ip || req?.connection?.remoteAddress,
        userAgent: req?.headers['user-agent'],
      },
    });
  } catch (error) {
    // Don't throw - audit logs should never break the main flow
    console.error('Failed to create audit log:', error);
  }
};

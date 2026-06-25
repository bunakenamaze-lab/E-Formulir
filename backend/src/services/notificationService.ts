import { PrismaClient } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';

const prisma = new PrismaClient();

interface CreateNotificationParams {
  userId: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  link?: string;
  metadata?: Record<string, any>;
}

export const createNotification = async (params: CreateNotificationParams) => {
  return await prisma.notification.create({
    data: {
      id: uuidv4(),
      ...params,
    },
  });
};

export const createNotificationForAdmins = async (
  params: Omit<CreateNotificationParams, 'userId'>
) => {
  const admins = await prisma.user.findMany({
    where: {
      role: { in: ['SUPER_ADMIN', 'ADMIN'] },
      isActive: true,
    },
    select: { id: true },
  });

  const notifications = admins.map((admin) =>
    prisma.notification.create({
      data: {
        id: uuidv4(),
        userId: admin.id,
        ...params,
      },
    })
  );

  return await Promise.all(notifications);
};

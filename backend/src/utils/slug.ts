import { PrismaClient } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';

const prisma = new PrismaClient();

export const generateSlug = (title: string): string => {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
};

export const generateUniqueSlug = async (title: string): Promise<string> => {
  const baseSlug = generateSlug(title);
  const shortId = uuidv4().substring(0, 8);
  const slug = `${baseSlug}-${shortId}`;

  // Ensure uniqueness
  const existing = await prisma.form.findUnique({ where: { slug } });
  if (existing) {
    return `${baseSlug}-${uuidv4().substring(0, 8)}`;
  }

  return slug;
};

import { prisma } from './prisma';

export const generateSlug = (title: string): string => {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
};

export const generateUniqueSlug = async (title: string, excludeId?: string): Promise<string> => {
  const baseSlug = generateSlug(title);
  let slug = baseSlug;
  let counter = 1;

  while (true) {
    const existing = await prisma.post.findUnique({
      where: { slug },
      select: { id: true },
    });

    if (!existing || existing.id === excludeId) break;
    slug = `${baseSlug}-${counter}`;
    counter++;
  }

  return slug;
};

export const generateUserSlug = async (name: string, excludeId?: string): Promise<string> => {
  const baseSlug = generateSlug(name);
  let slug = baseSlug;
  let counter = 1;

  while (true) {
    const existing = await prisma.user.findUnique({
      where: { slug },
      select: { id: true },
    });

    if (!existing || existing.id === excludeId) break;
    slug = `${baseSlug}-${counter}`;
    counter++;
  }

  return slug;
};

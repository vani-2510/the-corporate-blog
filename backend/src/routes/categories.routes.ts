import { Router, Request, Response, NextFunction } from 'express';
import { prisma } from '../utils/prisma';
import { authenticate, requireRole } from '../middleware/auth.middleware';
import { AppError } from '../middleware/error.middleware';
import { z } from 'zod';

const router = Router();

const categorySchema = z.object({
  name: z.string().min(1).max(100),
  slug: z.string().optional(),
  description: z.string().max(500).optional(),
});

// GET /categories
router.get('/', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const categories = await prisma.category.findMany({
      orderBy: { name: 'asc' },
      include: { _count: { select: { posts: { where: { post: { status: 'PUBLISHED' } } } } } },
    });
    res.json({ categories });
  } catch (error) { next(error); }
});

// GET /categories/:slug/posts
router.get('/:slug/posts', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const category = await prisma.category.findUnique({ where: { slug: req.params.slug as string } });
    if (!category) throw new AppError('Category not found', 404);

    const page = parseInt(req.query.page as string || '1');
    const limit = Math.min(parseInt(req.query.limit as string || '12'), 50);
    const skip = (page - 1) * limit;

    const [posts, total] = await Promise.all([
      prisma.post.findMany({
        where: { status: 'PUBLISHED', categories: { some: { categoryId: category.id } } },
        orderBy: { publishedAt: 'desc' },
        skip, take: limit,
        select: {
          id: true, title: true, slug: true, excerpt: true, featuredImage: true,
          featuredImageAlt: true, publishedAt: true, viewCount: true,
          author: { select: { name: true, slug: true, avatar: true } },
          categories: { select: { category: { select: { name: true, slug: true } } } },
        },
      }),
      prisma.post.count({ where: { status: 'PUBLISHED', categories: { some: { categoryId: category.id } } } }),
    ]);

    res.json({ category, posts, pagination: { page, limit, total, pages: Math.ceil(total / limit) } });
  } catch (error) { next(error); }
});

// POST /categories
router.post('/', authenticate, requireRole('ADMIN', 'EDITOR'), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = categorySchema.parse(req.body);
    const slug = data.slug || data.name.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '');
    const category = await prisma.category.create({ data: { ...data, slug } });
    res.status(201).json({ category });
  } catch (error) { next(error); }
});

// PUT /categories/:id
router.put('/:id', authenticate, requireRole('ADMIN', 'EDITOR'), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = categorySchema.partial().parse(req.body);
    const category = await prisma.category.update({ where: { id: req.params.id as string }, data });
    res.json({ category });
  } catch (error) { next(error); }
});

// DELETE /categories/:id
router.delete('/:id', authenticate, requireRole('ADMIN'), async (req: Request, res: Response, next: NextFunction) => {
  try {
    await prisma.category.delete({ where: { id: req.params.id as string } });
    res.json({ message: 'Category deleted' });
  } catch (error) { next(error); }
});

export default router;

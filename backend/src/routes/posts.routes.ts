import { Router, Response, NextFunction } from 'express';
import { prisma } from '../utils/prisma';
import { authenticate, requireRole, AuthRequest } from '../middleware/auth.middleware';
import { AppError } from '../middleware/error.middleware';
import { createPostSchema, updatePostSchema } from '../validators/post.validator';
import { generateUniqueSlug } from '../utils/slug';
import { PostStatus } from '@prisma/client';
import axios from 'axios';

const router = Router();

// ── Auto-categorization by keyword matching ─────────────────────
const CATEGORY_KEYWORDS: Record<string, string[]> = {
  business:   ['business', 'brand', 'branding', 'b2b', 'marketing', 'growth', 'revenue', 'company', 'companies', 'corporate', 'market', 'investor', 'esg', 'startup'],
  technology: ['technology', 'tech', 'data', 'ai', 'digital', 'software', 'automation', 'cloud', 'api', 'machine learning', 'analytics', 'cyber'],
  strategy:   ['strategy', 'strategic', 'accountability', 'remote work', 'future of work', 'culture', 'planning', 'framework', 'competitive', 'innovation', 'adapting'],
  leadership: ['leadership', 'leader', 'management', 'team', 'ceo', 'executive', 'traits', 'mentor', 'decision', 'hiring'],
};

function extractTextFromBlocks(content: unknown): string {
  if (!Array.isArray(content)) return '';
  return content.map((b: Record<string, unknown>) => {
    if (typeof b.text === 'string') return b.text;
    if (Array.isArray(b.items)) return b.items.map((i: unknown) => typeof i === 'string' ? i : '').join(' ');
    return '';
  }).join(' ');
}

async function autoCategorize(title: string, content: unknown): Promise<string[]> {
  const text = (title + ' ' + extractTextFromBlocks(content)).toLowerCase();
  const matchedSlugs: string[] = [];

  for (const [slug, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    if (keywords.some(kw => text.includes(kw))) {
      matchedSlugs.push(slug);
    }
  }

  // Default to business if nothing matched
  if (matchedSlugs.length === 0) matchedSlugs.push('business');

  const categories = await prisma.category.findMany({
    where: { slug: { in: matchedSlugs } },
    select: { id: true },
  });

  return categories.map(c => c.id);
}

const POST_SELECT = {
  id: true, title: true, slug: true, excerpt: true, status: true,
  featuredImage: true, featuredImageAlt: true, publishedAt: true,
  seoTitle: true, seoDescription: true, isSponsored: true, viewCount: true,
  createdAt: true, updatedAt: true,
  author: { select: { id: true, name: true, slug: true, avatar: true } },
  categories: { select: { category: { select: { id: true, name: true, slug: true } } } },
};

// GET /posts — public (only published) or admin (all)
router.get('/', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const page = parseInt(req.query.page as string || '1');
    const limit = Math.min(parseInt(req.query.limit as string || '12'), 50);
    const skip = (page - 1) * limit;
    const categorySlug = req.query.category as string;
    const authorSlug = req.query.author as string;

    const where = {
      status: PostStatus.PUBLISHED,
      ...(categorySlug && {
        categories: { some: { category: { slug: categorySlug } } },
      }),
      ...(authorSlug && { author: { slug: authorSlug } }),
    };

    const [posts, total] = await Promise.all([
      prisma.post.findMany({ where, select: POST_SELECT, orderBy: { publishedAt: 'desc' }, skip, take: limit }),
      prisma.post.count({ where }),
    ]);

    res.json({
      posts,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch (error) { next(error); }
});

// GET /posts/popular
router.get('/popular', async (_req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const posts = await prisma.post.findMany({
      where: { status: PostStatus.PUBLISHED },
      select: POST_SELECT,
      orderBy: { viewCount: 'desc' },
      take: 5,
    });
    res.json({ posts });
  } catch (error) { next(error); }
});

// GET /posts/admin/all — admin only, returns all statuses
router.get('/admin/all', authenticate, requireRole('ADMIN', 'EDITOR', 'WRITER'), async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const page = parseInt(req.query.page as string || '1');
    const limit = Math.min(parseInt(req.query.limit as string || '50'), 100);
    const skip = (page - 1) * limit;
    const status = req.query.status as PostStatus | undefined;

    const where = {
      ...(status ? { status } : {}),
      // Writers only see their own posts
      ...(req.user!.role === 'WRITER' ? { authorId: req.user!.id } : {}),
    };

    const [posts, total] = await Promise.all([
      prisma.post.findMany({
        where,
        select: { ...POST_SELECT, content: false },
        orderBy: { updatedAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.post.count({ where }),
    ]);
    res.json({ posts, pagination: { page, limit, total, pages: Math.ceil(total / limit) } });
  } catch (error) { next(error); }
});



// GET /posts/slug/:slug — public
router.get('/slug/:slug', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const post = await prisma.post.findFirst({
      where: { slug: req.params.slug as string, status: PostStatus.PUBLISHED },
      include: {
        author: { select: { id: true, name: true, slug: true, avatar: true, bio: true } },
        categories: { select: { category: { select: { id: true, name: true, slug: true } } } },
        images: true,
      },
    });
    if (!post) throw new AppError('Post not found', 404);

    // Track view (fire-and-forget)
    const ipHash = Buffer.from(req.ip || '').toString('base64').slice(0, 32);
    prisma.postView.upsert({
      where: { postId_ipHash_viewedAt: { postId: post.id, ipHash, viewedAt: new Date(new Date().toDateString()) } },
      create: { postId: post.id, ipHash, userAgent: req.headers['user-agent'], viewedAt: new Date(new Date().toDateString()) },
      update: {},
    }).then(() => prisma.post.update({ where: { id: post.id }, data: { viewCount: { increment: 1 } } }))
      .catch(() => {/* ignore */});

    res.json({ post });
  } catch (error) { next(error); }
});

// GET /posts/:id — admin
router.get('/:id', authenticate, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const post = await prisma.post.findUnique({
      where: { id: req.params.id as string },
      include: {
        author: { select: { id: true, name: true, slug: true, avatar: true } },
        categories: { select: { category: { select: { id: true, name: true, slug: true } } } },
      },
    });
    if (!post) throw new AppError('Post not found', 404);

    if (
      req.user!.role === 'WRITER'
      && post.authorId !== req.user!.id
    ) {
      throw new AppError('Cannot access another writer\'s post', 403);
    }

    res.json({ post });
  } catch (error) { next(error); }
});

// POST /posts — create draft
router.post('/', authenticate, requireRole('ADMIN', 'EDITOR', 'WRITER'), async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const data = createPostSchema.parse(req.body);
    const slug = data.slug || await generateUniqueSlug(data.title);

    const post = await prisma.post.create({
      data: {
        title: data.title,
        slug,
        excerpt: data.excerpt,
        content: data.content,
        featuredImage: data.featuredImage || null,
        featuredImageAlt: data.featuredImageAlt,
        seoTitle: data.seoTitle,
        seoDescription: data.seoDescription,
        isSponsored: data.isSponsored,
        authorId: req.user!.id,
        status: 'DRAFT',
        categories: {
          create: (data.categoryIds && data.categoryIds.length > 0
            ? data.categoryIds
            : await autoCategorize(data.title, data.content)
          ).map(id => ({ categoryId: id })),
        },
      },
      include: { categories: { select: { category: true } } },
    });

    // Audit log
    await prisma.auditLog.create({
      data: { userId: req.user!.id, action: 'CREATE_DRAFT', entityType: 'Post', entityId: post.id },
    });

    res.status(201).json({ post });
  } catch (error) { next(error); }
});

// PUT /posts/:id — update
router.put('/:id', authenticate, requireRole('ADMIN', 'EDITOR', 'WRITER'), async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const existing = await prisma.post.findUnique({ where: { id: req.params.id as string } });
    if (!existing) throw new AppError('Post not found', 404);

    // Writers can only edit their own posts
    if (req.user!.role === 'WRITER' && existing.authorId !== req.user!.id) {
      throw new AppError('Cannot edit another writer\'s post', 403);
    }

    const data = updatePostSchema.parse(req.body);
    if (data.slug && data.slug !== existing.slug) {
      data.slug = await generateUniqueSlug(data.slug, existing.id);
    }

    // Auto-categorize if no explicit categoryIds provided
    const categoryIds = (data.categoryIds !== undefined && data.categoryIds.length > 0)
      ? data.categoryIds
      : await autoCategorize(data.title || existing.title, data.content || existing.content);

    const post = await prisma.post.update({
      where: { id: req.params.id as string },
      data: {
        ...data,
        featuredImage: data.featuredImage || undefined,
        categories: {
          deleteMany: {},
          create: categoryIds.map(id => ({ categoryId: id })),
        },
      },
      include: { categories: { select: { category: true } } },
    });

    res.json({ post });
  } catch (error) { next(error); }
});

// PUT /posts/:id/publish
router.put('/:id/publish', authenticate, requireRole('ADMIN', 'EDITOR'), async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const existing = await prisma.post.findUnique({
      where: { id: req.params.id as string },
      include: { categories: true },
    });
    if (!existing) throw new AppError('Post not found', 404);

    // Validate required fields before publish
    if (!existing.title) throw new AppError('Title is required to publish', 400);
    if (!existing.slug) throw new AppError('Slug is required to publish', 400);
    if (!existing.featuredImage) throw new AppError('Featured image is required to publish', 400);
    if (!existing.seoDescription && !existing.excerpt) throw new AppError('Meta description or excerpt is required', 400);

    const post = await prisma.post.update({
      where: { id: req.params.id as string },
      data: { status: 'PUBLISHED', publishedAt: new Date() },
    });

    // Audit log
    await prisma.auditLog.create({
      data: {
        userId: req.user!.id, action: 'PUBLISH', entityType: 'Post', entityId: post.id,
        metadata: { publishedAt: post.publishedAt },
      },
    });

    // Trigger ISR revalidation (fire-and-forget)
    if (process.env.FRONTEND_URL && process.env.REVALIDATION_SECRET) {
      axios.post(`${process.env.FRONTEND_URL}/api/revalidate`, {
        secret: process.env.REVALIDATION_SECRET,
        paths: [`/blog/${post.slug}`, '/blog', '/sitemap.xml'],
      }).catch(() => {/* ignore */});
    }

    res.json({ post });
  } catch (error) { next(error); }
});

// DELETE /posts/:id — soft delete
router.delete('/:id', authenticate, requireRole('ADMIN', 'EDITOR'), async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    await prisma.post.update({
      where: { id: req.params.id as string },
      data: { status: 'DRAFT' },
    });
    await prisma.auditLog.create({
      data: { userId: req.user!.id, action: 'UNPUBLISH', entityType: 'Post', entityId: req.params.id as string },
    });
    res.json({ message: 'Post unpublished' });
  } catch (error) { next(error); }
});

// DELETE /posts/:id/permanent — permanently delete post (ADMIN only)
router.delete('/:id/permanent', authenticate, requireRole('ADMIN'), async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const existing = await prisma.post.findUnique({ where: { id: req.params.id as string } });
    if (!existing) throw new AppError('Post not found', 404);

    await prisma.post.delete({ where: { id: req.params.id as string } });

    await prisma.auditLog.create({
      data: { userId: req.user!.id, action: 'DELETE_PERMANENT', entityType: 'Post', entityId: req.params.id as string },
    });

    res.json({ message: 'Post permanently deleted' });
  } catch (error) { next(error); }
});

// GET /posts/:id/internal-suggestions
router.get('/:id/internal-suggestions', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const post = await prisma.post.findUnique({
      where: { id: req.params.id as string },
      include: { categories: { select: { categoryId: true } } },
    });
    if (!post) throw new AppError('Post not found', 404);

    const categoryIds = post.categories.map(c => c.categoryId);
    const suggestions = await prisma.post.findMany({
      where: {
        id: { not: post.id },
        status: 'PUBLISHED',
        categories: { some: { categoryId: { in: categoryIds } } },
      },
      select: { id: true, title: true, slug: true, excerpt: true, featuredImage: true },
      take: 5,
    });
    res.json({ suggestions });
  } catch (error) { next(error); }
});

export default router;

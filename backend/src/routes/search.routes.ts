import { Router, Request, Response, NextFunction } from 'express';
import { prisma } from '../utils/prisma';
import { AppError } from '../middleware/error.middleware';

const router = Router();

// GET /search?q=keyword&page=1&limit=10
router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const q = (req.query.q as string || '').trim();
    if (!q || q.length < 2) throw new AppError('Search query must be at least 2 characters', 400);

    const page = parseInt(req.query.page as string || '1');
    const limit = Math.min(parseInt(req.query.limit as string || '10'), 30);
    const skip = (page - 1) * limit;

    const [posts, total] = await Promise.all([
      prisma.$queryRaw<Array<{
        id: string; title: string; slug: string; excerpt: string | null;
        featuredImage: string | null; publishedAt: Date | null;
      }>>`
        SELECT
          id,
          title,
          slug,
          excerpt,
          "featuredImage" as "featuredImage",
          "publishedAt" as "publishedAt"
        FROM posts
        WHERE status = 'PUBLISHED'
          AND (
            to_tsvector('english', title) @@ plainto_tsquery('english', ${q})
            OR to_tsvector('english', coalesce(excerpt, '')) @@ plainto_tsquery('english', ${q})
          )
        ORDER BY ts_rank(to_tsvector('english', title), plainto_tsquery('english', ${q})) DESC
        LIMIT ${limit} OFFSET ${skip}
      `,
      prisma.$queryRaw<[{ count: bigint }]>`
        SELECT COUNT(*) as count FROM posts
        WHERE status = 'PUBLISHED'
          AND (
            to_tsvector('english', title) @@ plainto_tsquery('english', ${q})
            OR to_tsvector('english', coalesce(excerpt, '')) @@ plainto_tsquery('english', ${q})
          )
      `,
    ]);

    const totalCount = Number((total[0] as { count: bigint }).count);

    res.json({
      query: q,
      posts,
      pagination: { page, limit, total: totalCount, pages: Math.ceil(totalCount / limit) },
    });
  } catch (error) { next(error); }
});

export default router;

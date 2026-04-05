import { Router, Request, Response, NextFunction } from 'express';
import { AppError } from '../middleware/error.middleware';

const router = Router();

// POST /revalidate — called by frontend to this endpoint OR by backend on publish
router.post('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { secret } = req.body;
    if (secret !== process.env.REVALIDATION_SECRET) {
      throw new AppError('Invalid revalidation secret', 403);
    }
    res.json({ revalidated: true, timestamp: new Date().toISOString() });
  } catch (error) { next(error); }
});

export default router;

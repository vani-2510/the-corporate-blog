import { Router, Request, Response, NextFunction } from 'express';
import { v2 as cloudinary } from 'cloudinary';
import multer from 'multer';
import { prisma } from '../utils/prisma';
import { authenticate, requireRole } from '../middleware/auth.middleware';
import { AppError } from '../middleware/error.middleware';

const router = Router();

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Multer: store in memory then upload to Cloudinary
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (_req, file, cb) => {
    if (file.mimetype.startsWith('image/')) cb(null, true);
    else cb(new Error('Only images are allowed'));
  },
});

const uploadToCloudinary = (buffer: Buffer, folder: string): Promise<{ url: string; publicId: string; width: number; height: number }> => {
  return new Promise((resolve, reject) => {
    cloudinary.uploader.upload_stream(
      { folder, resource_type: 'image', format: 'webp', quality: 'auto', fetch_format: 'auto' },
      (error, result) => {
        if (error || !result) return reject(error || new Error('Upload failed'));
        resolve({ url: result.secure_url, publicId: result.public_id, width: result.width, height: result.height });
      }
    ).end(buffer);
  });
};

// POST /images/upload
router.post('/upload', authenticate, requireRole('ADMIN', 'EDITOR', 'WRITER'), upload.single('file'), async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.file) throw new AppError('No file provided', 400);

    const altText = (req.body.altText as string) || '';
    if (!altText) throw new AppError('Alt text is required for accessibility', 400);

    const result = await uploadToCloudinary(req.file.buffer, 'tcb/posts');

    const image = await prisma.image.create({
      data: {
        url: result.url,
        publicId: result.publicId,
        altText,
        title: req.body.title || null,
        caption: req.body.caption || null,
        width: result.width,
        height: result.height,
        postId: req.body.postId || null,
      },
    });

    res.status(201).json({ image });
  } catch (error) { next(error); }
});

// DELETE /images/:id
router.delete('/:id', authenticate, requireRole('ADMIN', 'EDITOR'), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const image = await prisma.image.findUnique({ where: { id: req.params.id as string } });
    if (!image) throw new AppError('Image not found', 404);

    await cloudinary.uploader.destroy(image.publicId);
    await prisma.image.delete({ where: { id: req.params.id as string } });

    res.json({ message: 'Image deleted' });
  } catch (error) { next(error); }
});

export default router;

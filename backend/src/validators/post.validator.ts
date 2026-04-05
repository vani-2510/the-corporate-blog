import { z } from 'zod';

export const createPostSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200),
  slug: z.string().optional(),
  excerpt: z.string().max(500).optional(),
  content: z.array(z.any()).default([]),
  featuredImage: z.string().optional().nullable(),
  featuredImageAlt: z.string().max(200).optional(),
  seoTitle: z.string().max(70).optional(),
  seoDescription: z.string().max(160).optional(),
  categoryIds: z.array(z.string().uuid()).optional().default([]),
  isSponsored: z.boolean().optional().default(false),
  scheduledAt: z.string().datetime().optional(),
});

export const updatePostSchema = createPostSchema.partial();

export const publishPostSchema = z.object({
  publishedAt: z.string().datetime().optional(),
});

export type CreatePostInput = z.infer<typeof createPostSchema>;
export type UpdatePostInput = z.infer<typeof updatePostSchema>;

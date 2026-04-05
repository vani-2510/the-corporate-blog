import { getPublishedPosts } from '@/lib/api';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://thecorporateblog.com';

export default async function sitemap() {
  const staticRoutes = [
    { url: `${SITE_URL}/blog`, lastModified: new Date(), changeFrequency: 'daily' as const, priority: 1 },
    { url: `${SITE_URL}/search`, lastModified: new Date(), changeFrequency: 'monthly' as const, priority: 0.3 },
  ];

  try {
    const { posts } = await getPublishedPosts({ limit: 1000 });
    const postRoutes = posts.map(post => ({
      url: `${SITE_URL}/blog/${post.slug}`,
      lastModified: new Date(post.updatedAt),
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    }));
    return [...staticRoutes, ...postRoutes];
  } catch {
    return staticRoutes;
  }
}

export default function robots() {
  const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://thecorporateblog.com';
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/admin', '/admin/', '/api/'],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}

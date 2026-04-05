import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getCategoryPosts } from '@/lib/api';
import Link from 'next/link';
import PostCard from '@/components/blog/PostCard';
import { BreadcrumbJsonLd } from '@/components/seo/JsonLd';

export const revalidate = 900;

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  try {
    const { slug } = await params;
    const { category } = await getCategoryPosts(slug);
    return {
      title: `${category.name} Articles`,
      description: category.description || `Browse all ${category.name} articles on The Corporate Blog.`,
      alternates: { canonical: `/blog/category/${slug}` },
    };
  } catch {
    return { title: 'Category' };
  }
}

export default async function CategoryPage({ params }: PageProps) {
  const { slug } = await params;

  let data;
  try {
    data = await getCategoryPosts(slug);
  } catch {
    notFound();
  }

  const { category, posts, pagination } = data;
  const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://thecorporateblog.com';

  return (
    <>
      <BreadcrumbJsonLd items={[
        { name: 'Home', url: SITE_URL },
        { name: 'Blog', url: `${SITE_URL}/blog` },
        { name: category.name, url: `${SITE_URL}/blog/category/${slug}` },
      ]} />

      <div className="container-wide" style={{ paddingTop: '3rem', paddingBottom: '4rem' }}>
        {/* Header */}
        <div style={{ marginBottom: '3rem', paddingBottom: '2rem', borderBottom: '1px solid var(--color-border)' }}>
          <nav style={{ fontSize: 'var(--text-sm)', color: 'var(--color-muted)', marginBottom: '1rem' }}>
            <Link href="/blog" style={{ color: 'var(--color-muted)' }}>Blog</Link> / <span>{category.name}</span>
          </nav>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-4xl)', marginBottom: '0.5rem' }}>{category.name}</h1>
          {category.description && <p style={{ color: 'var(--color-muted)', fontSize: 'var(--text-base)', maxWidth: '60ch' }}>{category.description}</p>}
          <p style={{ marginTop: '0.5rem', fontSize: 'var(--text-sm)', color: 'var(--color-muted)' }}>{pagination.total} article{pagination.total !== 1 ? 's' : ''}</p>
        </div>

        {/* Grid */}
        {posts.length > 0 ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
            {posts.map(post => <PostCard key={post.id} post={post} />)}
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--color-muted)' }}>
            <p>No articles in this category yet.</p>
          </div>
        )}
      </div>
    </>
  );
}

import { Metadata } from 'next';
import { searchPosts } from '@/lib/api';
import PostCard from '@/components/blog/PostCard';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Search Articles',
  robots: { index: false, follow: true },
};

interface PageProps {
  searchParams: Promise<{ q?: string; page?: string }>;
}

export default async function SearchPage({ searchParams }: PageProps) {
  const { q, page: pageParam } = await searchParams;
  const query = (q || '').trim();
  const page = parseInt(pageParam || '1');

  if (!query || query.length < 2) {
    return (
      <div className="container-wide" style={{ paddingTop: '4rem', paddingBottom: '4rem', textAlign: 'center' }}>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-3xl)', marginBottom: '1rem' }}>Search Articles</h1>
        <p style={{ color: 'var(--color-muted)' }}>Enter at least 2 characters to search.</p>
        <SearchForm query="" />
      </div>
    );
  }

  let results;
  try {
    results = await searchPosts(query, page);
  } catch {
    results = { query, posts: [], pagination: { page: 1, limit: 10, total: 0, pages: 0 } };
  }

  return (
    <div className="container-wide" style={{ paddingTop: '3rem', paddingBottom: '4rem' }}>
      <div style={{ marginBottom: '2.5rem' }}>
        <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-muted)', marginBottom: '0.5rem' }}>Search results for</p>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-4xl)', marginBottom: '0.5rem' }}>&ldquo;{query}&rdquo;</h1>
        <p style={{ color: 'var(--color-muted)', fontSize: 'var(--text-sm)' }}>{results.pagination.total} result{results.pagination.total !== 1 ? 's' : ''} found</p>
      </div>

      <SearchForm query={query} />

      {results.posts.length > 0 ? (
        <div style={{ marginTop: '2.5rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
          {results.posts.map(post => <PostCard key={post.id} post={post} />)}
        </div>
      ) : (
        <div style={{ marginTop: '3rem', textAlign: 'center', padding: '4rem', border: '2px dashed var(--color-border)', borderRadius: 'var(--radius-xl)' }}>
          <p style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-xl)', color: 'var(--color-ink-600)' }}>No articles found for &ldquo;{query}&rdquo;</p>
          <p style={{ color: 'var(--color-muted)', marginTop: '0.5rem', fontSize: 'var(--text-sm)' }}>Try different keywords or <Link href="/blog" style={{ color: 'var(--color-accent)' }}>browse all articles</Link>.</p>
        </div>
      )}

      {results.pagination.pages > 1 && (
        <div style={{ marginTop: '3rem', display: 'flex', gap: '0.5rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          {Array.from({ length: results.pagination.pages }, (_, i) => i + 1).map(p => (
            <Link key={p} href={`/search?q=${encodeURIComponent(query)}&page=${p}`}
              style={{ width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)', fontSize: 'var(--text-sm)', fontWeight: p === page ? 700 : 400, backgroundColor: p === page ? 'var(--color-ink-950)' : 'transparent', color: p === page ? 'white' : 'var(--color-text)' }}>
              {p}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

function SearchForm({ query }: { query: string }) {
  return (
    <form action="/search" method="GET" style={{ display: 'flex', gap: '0.75rem', maxWidth: '540px' }}>
      <input name="q" defaultValue={query} placeholder="Search articles..." autoComplete="off"
        style={{ flex: 1, height: '48px', padding: '0 1rem', border: '2px solid var(--color-border)', borderRadius: 'var(--radius-lg)', fontSize: 'var(--text-base)', color: 'var(--color-text)', backgroundColor: 'var(--color-surface)', outline: 'none' }} />
      <button type="submit" style={{ height: '48px', padding: '0 1.5rem', backgroundColor: 'var(--color-accent)', color: 'white', borderRadius: 'var(--radius-lg)', fontSize: 'var(--text-sm)', fontWeight: 600, border: 'none', cursor: 'pointer' }}>Search</button>
    </form>
  );
}

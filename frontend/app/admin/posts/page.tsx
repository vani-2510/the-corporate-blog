'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';

interface Post {
  id: string;
  title: string;
  slug: string;
  status: string;
  publishedAt: string | null;
  createdAt: string;
  author: { name: string };
  _count?: { views: number };
}

export default function AdminPostsPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState<'ALL' | 'DRAFT' | 'PUBLISHED'>('ALL');

  const fetchPosts = useCallback(async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('accessToken');
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/posts/admin/all`, {
        headers: { Authorization: `Bearer ${token}` },
        credentials: 'include',
      });
      if (!res.ok) throw new Error('Failed to fetch posts');
      const data = await res.json();
      setPosts(data.posts || data);
    } catch {
      setError('Could not load posts. Make sure the backend is running.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchPosts(); }, [fetchPosts]);

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Archive "${title}"?`)) return;
    const token = localStorage.getItem('accessToken');
    await fetch(`${process.env.NEXT_PUBLIC_API_URL}/posts/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
      credentials: 'include',
    });
    fetchPosts();
  };

  const handlePermanentDelete = async (id: string, title: string) => {
    if (!confirm(`⚠️ PERMANENTLY delete "${title}"?\n\nThis cannot be undone. The post, its categories, and view analytics will be removed forever.`)) return;
    const token = localStorage.getItem('accessToken');
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/posts/${id}/permanent`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
      credentials: 'include',
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      alert(err.error || 'Delete failed');
      return;
    }
    fetchPosts();
  };

  const handlePublish = async (id: string) => {
    const token = localStorage.getItem('accessToken');
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/posts/${id}/publish`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${token}` },
      credentials: 'include',
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      alert(err.error || 'Publish failed — make sure the post has a featured image and an excerpt or meta description.');
    }
    fetchPosts();
  };

  const filtered = filter === 'ALL' ? posts : posts.filter(p => p.status === filter);

  const statusColor: Record<string, string> = {
    PUBLISHED: 'oklch(55% 0.18 145)',
    DRAFT: 'oklch(72% 0.18 80)',
  };
  const statusBg: Record<string, string> = {
    PUBLISHED: 'oklch(55% 0.18 145 / 0.1)',
    DRAFT: 'oklch(72% 0.18 80 / 0.1)',
  };

  return (
    <div style={{ padding: '2.5rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-3xl)', color: 'var(--color-ink-950)', marginBottom: '0.25rem' }}>All Posts</h1>
          <p style={{ color: 'var(--color-muted)', fontSize: 'var(--text-sm)' }}>{posts.length} total articles</p>
        </div>
        <Link href="/admin/posts/new" style={{ padding: '0.625rem 1.5rem', backgroundColor: 'var(--color-accent)', color: 'white', borderRadius: 'var(--radius-lg)', fontSize: 'var(--text-sm)', fontWeight: 600, textDecoration: 'none' }}>
          + New Post
        </Link>
      </div>

      {/* Filter tabs */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', borderBottom: '1px solid var(--color-border)', paddingBottom: '0' }}>
        {(['ALL', 'DRAFT', 'PUBLISHED'] as const).map(f => (
          <button key={f} onClick={() => setFilter(f)}
            style={{ padding: '0.5rem 1rem', fontSize: 'var(--text-sm)', fontWeight: filter === f ? 600 : 400, color: filter === f ? 'var(--color-accent)' : 'var(--color-muted)', background: 'none', border: 'none', borderBottom: filter === f ? '2px solid var(--color-accent)' : '2px solid transparent', cursor: 'pointer', marginBottom: '-1px' }}>
            {f}
          </button>
        ))}
      </div>

      {loading && <p style={{ color: 'var(--color-muted)', textAlign: 'center', padding: '3rem' }}>Loading posts...</p>}
      {error && <p style={{ color: 'var(--color-accent)', textAlign: 'center', padding: '3rem' }}>{error}</p>}

      {!loading && !error && filtered.length === 0 && (
        <div style={{ textAlign: 'center', padding: '4rem 2rem', border: '1px dashed var(--color-border)', borderRadius: 'var(--radius-xl)' }}>
          <p style={{ color: 'var(--color-muted)', marginBottom: '1rem' }}>No posts yet.</p>
          <Link href="/admin/posts/new" style={{ color: 'var(--color-accent)', fontSize: 'var(--text-sm)', fontWeight: 600, textDecoration: 'none' }}>Write your first article →</Link>
        </div>
      )}

      {!loading && filtered.length > 0 && (
        <div style={{ border: '1px solid var(--color-border)', borderRadius: 'var(--radius-xl)', overflow: 'hidden', backgroundColor: 'var(--color-surface)' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--color-border)', backgroundColor: 'var(--color-ink-50)' }}>
                {['Title', 'Status', 'Author', 'Date', 'Actions'].map(h => (
                  <th key={h} style={{ padding: '0.75rem 1rem', textAlign: 'left', fontSize: 'var(--text-xs)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--color-muted)' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((post, i) => (
                <tr key={post.id} style={{ borderBottom: i < filtered.length - 1 ? '1px solid var(--color-border)' : 'none' }}>
                  <td style={{ padding: '1rem', maxWidth: '320px' }}>
                    <Link href={`/admin/posts/${post.id}/edit`} style={{ fontWeight: 600, color: 'var(--color-ink-950)', textDecoration: 'none', fontSize: 'var(--text-sm)', display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {post.title || '(Untitled)'}
                    </Link>
                    <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-muted)' }}>/blog/{post.slug}</span>
                  </td>
                  <td style={{ padding: '1rem' }}>
                    <span style={{ padding: '0.25rem 0.625rem', borderRadius: 'var(--radius-full)', fontSize: 'var(--text-xs)', fontWeight: 600, color: statusColor[post.status], backgroundColor: statusBg[post.status] }}>
                      {post.status}
                    </span>
                  </td>
                  <td style={{ padding: '1rem', fontSize: 'var(--text-sm)', color: 'var(--color-muted)' }}>{post.author?.name}</td>
                  <td style={{ padding: '1rem', fontSize: 'var(--text-xs)', color: 'var(--color-muted)' }}>
                    {post.publishedAt ? new Date(post.publishedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : new Date(post.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </td>
                  <td style={{ padding: '1rem' }}>
                    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                      <Link href={`/admin/posts/${post.id}/edit`} style={{ fontSize: 'var(--text-xs)', fontWeight: 600, color: 'var(--color-accent)', textDecoration: 'none' }}>Edit</Link>
                      {post.status === 'DRAFT' && (
                        <button onClick={() => handlePublish(post.id)} style={{ fontSize: 'var(--text-xs)', fontWeight: 600, color: 'oklch(55% 0.18 145)', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>Publish</button>
                      )}
                      {post.status === 'PUBLISHED' && (
                        <Link href={`/blog/${post.slug}`} target="_blank" style={{ fontSize: 'var(--text-xs)', color: 'var(--color-muted)', textDecoration: 'none' }}>View ↗</Link>
                      )}
                      <button onClick={() => handleDelete(post.id, post.title)} style={{ fontSize: 'var(--text-xs)', color: 'var(--color-muted)', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>Archive</button>
                      <button onClick={() => handlePermanentDelete(post.id, post.title)} style={{ fontSize: 'var(--text-xs)', fontWeight: 600, color: 'var(--color-accent)', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

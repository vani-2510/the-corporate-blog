'use client';

import { useEffect, useState } from 'react';
import { Suspense } from 'react';

interface Stats { total: number; published: number; drafts: number; }

function AdminContent() {
  const [user, setUser] = useState<{ name: string; role: string } | null>(null);
  const [stats, setStats] = useState<Stats | null>(null);

  const api = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
  const token = () => localStorage.getItem('accessToken');

  useEffect(() => {
    let active = true;

    const loadDashboard = async () => {
      try {
        const authHeaders = token() ? { Authorization: `Bearer ${token()}` } : {};
        const [sessionRes, postsRes] = await Promise.all([
          fetch(`${api}/auth/me`, { headers: authHeaders }),
          fetch(`${api}/posts/admin/all?limit=200`, { headers: authHeaders }),
        ]);

        const session = await sessionRes.json().catch(() => ({}));
        if (sessionRes.ok && session.user && active) {
          setUser({
            name: session.user.name || '',
            role: session.user.role || '',
          });
        }

        if (!postsRes.ok) {
          throw new Error('Failed to fetch posts');
        }

        const data = await postsRes.json();
        if (!active) {
          return;
        }

        const posts = data.posts || [];
        setStats({
          total: posts.length,
          published: posts.filter((p: { status: string }) => p.status === 'PUBLISHED').length,
          drafts: posts.filter((p: { status: string }) => p.status === 'DRAFT').length,
        });
      } catch {
        if (active) {
          setStats({ total: 0, published: 0, drafts: 0 });
        }
      }
    };

    loadDashboard();

    return () => {
      active = false;
    };
  }, [api]);

  const statCards = [
    { label: 'Total Posts',  value: stats?.total     ?? '—', icon: '◧', color: 'var(--color-accent)' },
    { label: 'Published',    value: stats?.published  ?? '—', icon: '✓', color: 'oklch(55% 0.18 145)' },
    { label: 'Drafts',       value: stats?.drafts     ?? '—', icon: '◎', color: 'oklch(68% 0.15 65)'  },
    { label: 'Total Views',  value: '—',                      icon: '◈', color: 'oklch(55% 0.18 240)' },
  ];

  const actions = [
    { href: '/admin/posts/new', label: 'Write New Article', desc: 'Start a new draft post',  icon: '+', primary: true },
    { href: '/admin/posts',     label: 'Manage Posts',      desc: 'View, edit, and publish',  icon: '◧', primary: false },
    { href: '/blog',            label: 'View Live Blog',    desc: 'See the public site',      icon: '↗', primary: false },
  ];

  return (
    <div style={{ padding: '2.5rem' }}>
      <div style={{ marginBottom: '2.5rem' }}>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-3xl)', color: 'var(--color-ink-950)', marginBottom: '0.5rem' }}>
          Editorial Dashboard
        </h1>
        <p style={{ color: 'var(--color-muted)', fontSize: 'var(--text-sm)' }}>
          {user ? `Welcome back, ${user.name}` : 'Welcome back — manage your content from here.'}
          {user?.role === 'ADMIN' && <span style={{ marginLeft: '0.5rem', fontSize: '11px', fontWeight: 700, color: 'var(--color-accent)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Admin</span>}
        </p>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem', marginBottom: '3rem' }}>
        {statCards.map(stat => (
          <div key={stat.label} style={{ padding: '1.5rem', backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-xl)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
              <span style={{ fontSize: 'var(--text-xs)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--color-muted)' }}>{stat.label}</span>
              <span style={{ color: stat.color, fontSize: '1.1rem' }}>{stat.icon}</span>
            </div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-3xl)', fontWeight: 700, color: 'var(--color-ink-950)', transition: 'all 0.3s ease' }}>{stat.value}</div>
          </div>
        ))}
      </div>

      {/* Quick actions */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '1rem' }}>
        {actions.map(action => (
          <a key={action.href} href={action.href}
            style={{ padding: '1.5rem', borderRadius: 'var(--radius-xl)', border: action.primary ? 'none' : '1px solid var(--color-border)', backgroundColor: action.primary ? 'var(--color-accent)' : 'var(--color-surface)', color: action.primary ? 'white' : 'var(--color-ink-950)', display: 'flex', gap: '1rem', alignItems: 'flex-start', textDecoration: 'none', transition: 'transform 0.15s ease, box-shadow 0.15s ease' }}
            className="action-card"
          >
            <span style={{ fontSize: '1.5rem', lineHeight: 1 }}>{action.icon}</span>
            <div>
              <div style={{ fontWeight: 700, marginBottom: '0.25rem' }}>{action.label}</div>
              <div style={{ fontSize: 'var(--text-sm)', opacity: 0.75 }}>{action.desc}</div>
            </div>
          </a>
        ))}
      </div>
    </div>
  );
}

export default function AdminDashboardPage() {
  return (
    <Suspense fallback={<div style={{ padding: '2.5rem', color: 'var(--color-muted)' }}>Loading...</div>}>
      <AdminContent />
    </Suspense>
  );
}

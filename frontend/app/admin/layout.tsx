'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export const dynamic = 'force-dynamic';

const navItems = [
  { href: '/admin',            label: 'Dashboard',  icon: '◈' },
  { href: '/admin/posts',      label: 'All Posts',  icon: '◧' },
  { href: '/admin/posts/new',  label: 'New Post',   icon: '+' },
  { href: '/admin/categories', label: 'Categories', icon: '◫' },
  { href: '/blog',             label: '← View Blog',icon: '↗' },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [authChecked, setAuthChecked] = useState(false);
  const [userName, setUserName] = useState('');
  const api = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
  const token = () => localStorage.getItem('accessToken');

  useEffect(() => {
    let active = true;

    const verifySession = async () => {
      const cachedName = localStorage.getItem('userName') || '';
      if (cachedName) {
        setUserName(cachedName);
      }

      try {
        const res = await fetch(`${api}/auth/me`, {
          headers: token() ? { Authorization: `Bearer ${token()}` } : {},
        });
        const data = await res.json().catch(() => ({}));

        if (!res.ok || !data.user) {
          throw new Error(data.error || 'Authentication required');
        }

        if (data.accessToken) {
          localStorage.setItem('accessToken', data.accessToken);
        }

        localStorage.setItem('userName', data.user.name || '');
        localStorage.setItem('userRole', data.user.role || '');

        if (!active) {
          return;
        }

        setUserName(data.user.name || '');
        setAuthChecked(true);
      } catch {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('userName');
        localStorage.removeItem('userRole');

        if (active) {
          router.replace('/login');
        }
      }
    };

    verifySession();

    return () => {
      active = false;
    };
  }, [api, router]);

  const handleSignOut = async () => {
    try {
      await fetch(`${api}/auth/logout`, {
        method: 'POST',
      });
    } catch {
      // Ignore logout transport failures and clear the local session anyway.
    }

    localStorage.removeItem('accessToken');
    localStorage.removeItem('userName');
    localStorage.removeItem('userRole');
    router.replace('/login');
  };

  if (!authChecked) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100dvh', backgroundColor: 'var(--color-bg)' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ width: '32px', height: '32px', border: '3px solid var(--color-accent)', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 1rem' }} />
          <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-muted)' }}>Verifying access...</p>
        </div>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', minHeight: '100dvh', backgroundColor: 'var(--color-bg)' }}>
      {/* Sidebar */}
      <aside style={{
        width: '240px', flexShrink: 0, backgroundColor: 'var(--color-ink-950)',
        color: 'white', display: 'flex', flexDirection: 'column', position: 'sticky',
        top: 0, height: '100dvh', padding: '1.5rem 0',
      }}>
        <div style={{ padding: '0 1.5rem', marginBottom: '2rem' }}>
          <Link href="/blog" style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-xl)', fontWeight: 700, color: 'white', textDecoration: 'none' }}>
            TCB<span style={{ color: 'var(--color-accent)' }}>.</span>
          </Link>
          <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-ink-400)', marginTop: '0.25rem' }}>Editorial Dashboard</p>
        </div>

        <nav style={{ flex: 1, padding: '0 0.75rem', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
          {navItems.map(({ href, label, icon }) => {
            const isActive = href === '/admin' ? pathname === '/admin' : pathname.startsWith(href);
            return (
              <Link key={href} href={href}
                style={{
                  padding: '0.625rem 0.75rem',
                  borderRadius: 'var(--radius-md)',
                  fontSize: 'var(--text-sm)',
                  color: isActive ? 'white' : 'var(--color-ink-300)',
                  backgroundColor: isActive ? 'rgba(255,255,255,0.12)' : 'transparent',
                  display: 'flex', gap: '0.75rem', alignItems: 'center',
                  textDecoration: 'none',
                  fontWeight: isActive ? 600 : 400,
                  transition: 'all 0.15s ease',
                }}
                className="btn-ghost-dark"
              >
                <span style={{ fontSize: '0.9rem', lineHeight: 1 }}>{icon}</span>
                {label}
              </Link>
            );
          })}
        </nav>

        <div style={{ padding: '1rem 1.5rem', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
          {userName && <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-ink-400)', marginBottom: '0.5rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{userName}</p>}
          <button onClick={handleSignOut}
            style={{ fontSize: 'var(--text-xs)', color: 'var(--color-ink-500)', background: 'none', border: 'none', cursor: 'pointer', padding: 0, textAlign: 'left' }}>
            Sign out →
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main style={{ flex: 1, overflow: 'auto' }}>{children}</main>
    </div>
  );
}

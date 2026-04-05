'use client';

import Link from 'next/link';

export default function LoginPage() {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

  return (
    <div style={{ minHeight: '100dvh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'var(--color-bg)', padding: '2rem' }}>
      <div style={{ width: '100%', maxWidth: '420px' }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <Link href="/blog" style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-3xl)', fontWeight: 700, color: 'var(--color-ink-950)', letterSpacing: '-0.03em' }}>
            TCB<span style={{ color: 'var(--color-accent)' }}>.</span>
          </Link>
          <p style={{ color: 'var(--color-muted)', marginTop: '0.5rem', fontSize: 'var(--text-sm)' }}>Editorial Platform — Sign in to continue</p>
        </div>

        {/* Card */}
        <div style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-xl)', padding: '2.5rem', boxShadow: 'var(--shadow-lg)' }}>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-2xl)', marginBottom: '0.5rem', textAlign: 'center' }}>Welcome back</h1>
          <p style={{ color: 'var(--color-muted)', fontSize: 'var(--text-sm)', textAlign: 'center', marginBottom: '2rem' }}>Sign in with Google to access the CMS</p>

          {/* Google OAuth button */}
          <a
            id="google-login-btn"
            href={`${apiUrl}/auth/google`}
            style={{ width: '100%', height: '52px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem', border: '1.5px solid var(--color-border)', borderRadius: 'var(--radius-lg)', backgroundColor: 'var(--color-surface)', cursor: 'pointer', fontSize: 'var(--text-base)', fontWeight: 600, color: 'var(--color-ink-900)', textDecoration: 'none', boxSizing: 'border-box' }}
          >
            {/* Google SVG */}
            <svg width="20" height="20" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            Continue with Google
          </a>

          <div style={{ marginTop: '1.5rem', padding: '1rem', backgroundColor: 'var(--color-ink-50)', borderRadius: 'var(--radius-md)', fontSize: 'var(--text-xs)', color: 'var(--color-muted)', textAlign: 'center', lineHeight: 1.6 }}>
            Only authorized team members can sign in. Contact your administrator to request access.
          </div>
        </div>

        <p style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: 'var(--text-sm)', color: 'var(--color-muted)' }}>
          <Link href="/blog" style={{ color: 'var(--color-accent)' }}>← Back to the blog</Link>
        </p>
      </div>
    </div>
  );
}

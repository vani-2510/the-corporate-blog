import Link from 'next/link';

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer
      style={{
        borderTop: '1px solid var(--color-border)',
        backgroundColor: 'var(--color-ink-950)',
        color: 'var(--color-ink-200)',
        marginTop: '6rem',
      }}
    >
      <div className="container-wide" style={{ padding: '4rem 1.5rem 2rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '3rem', marginBottom: '3rem' }}>
          {/* Brand */}
          <div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-2xl)', fontWeight: 700, color: 'white', marginBottom: '0.75rem', letterSpacing: '-0.03em' }}>
              TCB<span style={{ color: 'var(--color-accent)' }}>.</span>
            </div>
            <p style={{ fontSize: 'var(--text-sm)', lineHeight: 1.7, color: 'var(--color-ink-400)', maxWidth: '280px' }}>
              The Corporate Blog — authoritative business insights for modern professionals.
            </p>
          </div>

          {/* Topics */}
          <div>
            <h4 style={{ fontSize: 'var(--text-sm)', fontWeight: 600, color: 'white', marginBottom: '1rem', textTransform: 'uppercase', letterSpacing: '0.08em', fontFamily: 'var(--font-body)' }}>Topics</h4>
            <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {['Business', 'Technology', 'Strategy', 'Leadership'].map(t => (
                <li key={t}>
                  <Link href={`/blog/category/${t.toLowerCase()}`} className="link-hover-white" style={{ fontSize: 'var(--text-sm)', color: 'var(--color-ink-400)' }}>{t}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Links */}
          <div>
            <h4 style={{ fontSize: 'var(--text-sm)', fontWeight: 600, color: 'white', marginBottom: '1rem', textTransform: 'uppercase', letterSpacing: '0.08em', fontFamily: 'var(--font-body)' }}>Platform</h4>
            <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {[
                { href: '/blog', label: 'All Articles' },
                { href: '/search', label: 'Search' },
                { href: '/sitemap.xml', label: 'Sitemap' },
                { href: '/admin', label: 'Admin' },
              ].map(({ href, label }) => (
                <li key={href}>
                  <Link href={href} className="link-hover-white" style={{ fontSize: 'var(--text-sm)', color: 'var(--color-ink-400)' }}>{label}</Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div style={{ borderTop: '1px solid var(--color-ink-800)', paddingTop: '1.5rem', display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', gap: '1rem', alignItems: 'center' }}>
          <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-ink-600)' }}>
            © {year} The Corporate Blog. All rights reserved.
          </p>
          <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-ink-600)' }}>
            Built with Next.js · SEO-First · Serverless Architecture
          </p>
        </div>
      </div>
    </footer>
  );
}

import Link from 'next/link';

export default function NotFound() {
  return (
    <div style={{ minHeight: '100dvh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'var(--color-bg)', padding: '2rem', textAlign: 'center' }}>
      <div>
        <div style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(6rem, 15vw, 12rem)', fontWeight: 900, lineHeight: 1, color: 'var(--color-border)', letterSpacing: '-0.05em', marginBottom: '1rem' }}>404</div>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-3xl)', color: 'var(--color-ink-950)', marginBottom: '0.75rem' }}>Page Not Found</h1>
        <p style={{ color: 'var(--color-muted)', maxWidth: '380px', margin: '0 auto 2rem', lineHeight: 1.7, fontSize: 'var(--text-base)' }}>The article or page you&apos;re looking for doesn&apos;t exist or may have been moved.</p>
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link href="/blog" style={{ padding: '0.75rem 2rem', backgroundColor: 'var(--color-accent)', color: 'white', borderRadius: 'var(--radius-full)', fontSize: 'var(--text-sm)', fontWeight: 600 }}>Browse Articles</Link>
          <Link href="/search" style={{ padding: '0.75rem 2rem', border: '1.5px solid var(--color-border)', color: 'var(--color-text)', borderRadius: 'var(--radius-full)', fontSize: 'var(--text-sm)', fontWeight: 500 }}>Search</Link>
        </div>
      </div>
    </div>
  );
}

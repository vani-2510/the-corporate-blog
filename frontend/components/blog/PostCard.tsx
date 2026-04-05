import Image from 'next/image';
import Link from 'next/link';
import { Post } from '@/lib/types';

interface PostCardProps {
  post: Partial<Post>;
  variant?: 'default' | 'featured' | 'compact';
}

export default function PostCard({ post, variant = 'default' }: PostCardProps) {
  const href = `/blog/${post.slug}`;
  const wordCount = (post.content as Array<{type:string;text?:string;items?:string[]}>)
    ?.reduce((acc, block) => {
      if (block.type === 'paragraph' || block.type === 'heading') {
        return acc + (block.text?.split(/\s+/).filter(Boolean).length || 0)
      }
      if (block.type === 'list') {
        return acc + (block.items?.join(' ').split(/\s+/).filter(Boolean).length || 0)
      }
      return acc
    }, 0) || 0;
  const readingTime = Math.max(1, Math.ceil(wordCount / 200));

  if (variant === 'featured') {
    return (
      <article style={{ position: 'relative', borderRadius: 'var(--radius-xl)', overflow: 'hidden', background: 'var(--color-ink-950)', minHeight: '480px', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}>
        {post.featuredImage && (
          <Image src={post.featuredImage} alt={post.featuredImageAlt || post.title || ''} fill style={{ objectFit: 'cover', opacity: 0.5 }} priority sizes="(max-width: 768px) 100vw, 60vw" />
        )}
        <div style={{ position: 'relative', padding: '2rem', background: 'linear-gradient(to top, oklch(14% 0.02 270 / 0.95), transparent)' }}>
          {post.categories?.[0] && (
            <Link href={`/blog/category/${post.categories[0].category.slug}`}
              style={{ display: 'inline-block', marginBottom: '0.75rem', fontSize: 'var(--text-xs)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--color-accent-light)', padding: '0.25rem 0.75rem', borderRadius: 'var(--radius-full)', border: '1px solid var(--color-accent-light)' }}>
              {post.categories[0].category.name}
            </Link>
          )}
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-3xl)', color: 'white', marginBottom: '0.75rem', lineHeight: 1.15 }}>
            <Link href={href} style={{ color: 'inherit' }}>{post.title}</Link>
          </h2>
          {post.excerpt && <p style={{ color: 'var(--color-ink-100)', fontSize: 'var(--text-sm)', lineHeight: 1.6, marginBottom: '1rem', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{post.excerpt}</p>}
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            {post.author?.avatar && <Image src={post.author.avatar} alt={post.author.name || ''} width={32} height={32} style={{ borderRadius: '50%', objectFit: 'cover' }} />}
            <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-ink-300)' }}>
              {post.author?.name} · {post.publishedAt ? new Date(post.publishedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Draft'}
            </span>
          </div>
        </div>
      </article>
    );
  }

  if (variant === 'compact') {
    return (
      <article style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start', padding: '1rem 0', borderBottom: '1px solid var(--color-border)' }}>
        {post.featuredImage && (
          <div style={{ position: 'relative', width: '80px', height: '60px', flexShrink: 0, borderRadius: 'var(--radius-md)', overflow: 'hidden' }}>
            <Image src={post.featuredImage} alt={post.featuredImageAlt || post.title || ''} fill style={{ objectFit: 'cover' }} sizes="80px" />
          </div>
        )}
        <div style={{ flex: 1, minWidth: 0 }}>
          <h4 style={{ fontSize: 'var(--text-sm)', fontWeight: 600, lineHeight: 1.4, marginBottom: '0.25rem', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
            <Link href={href} className="link-hover" style={{ color: 'var(--color-ink-900)' }}>{post.title}</Link>
          </h4>
          <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-muted)' }}>
            {post.publishedAt ? new Date(post.publishedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : ''}
          </span>
        </div>
      </article>
    );
  }

  return (
    <article className="post-card" style={{ borderRadius: 'var(--radius-lg)', overflow: 'hidden', background: 'var(--color-surface)', border: '1px solid var(--color-border)', display: 'flex', flexDirection: 'column' }}>
      {post.featuredImage && (
        <Link href={href}>
          <div style={{ position: 'relative', aspectRatio: '16/9', overflow: 'hidden' }}>
            <Image src={post.featuredImage} alt={post.featuredImageAlt || post.title || ''} fill style={{ objectFit: 'cover' }} sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw" />
          </div>
        </Link>
      )}
      <div style={{ padding: '1.25rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
        {post.categories?.[0] && (
          <Link href={`/blog/category/${post.categories[0].category.slug}`}
            style={{ fontSize: 'var(--text-xs)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--color-accent)', marginBottom: '0.5rem', display: 'inline-block' }}>
            {post.categories[0].category.name}
          </Link>
        )}
        <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-xl)', lineHeight: 1.25, marginBottom: '0.5rem', flex: 1 }}>
          <Link href={href} className="link-hover" style={{ color: 'var(--color-ink-950)' }}>{post.title}</Link>
        </h3>
        {post.excerpt && <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-muted)', lineHeight: 1.65, marginBottom: '1rem', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{post.excerpt}</p>}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 'auto', paddingTop: '0.75rem', borderTop: '1px solid var(--color-border)' }}>
          <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-muted)' }}>
            {post.author?.name}
            {post.publishedAt && ` · ${new Date(post.publishedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`}
          </span>
          <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-muted)' }}>{readingTime} min read</span>
        </div>
      </div>
    </article>
  );
}

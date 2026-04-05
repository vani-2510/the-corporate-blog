import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { getPostBySlug, getPublishedPosts, getRelatedPosts } from '@/lib/api';
import BlockRenderer, { generateTOC } from '@/components/blog/BlockRenderer';
import { ArticleJsonLd } from '@/components/seo/JsonLd';
import { generatePostMetadata } from '@/components/seo/JsonLd';
import PostCard from '@/components/blog/PostCard';

export const revalidate = 900;

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  try {
    const { posts } = await getPublishedPosts({ limit: 50 });
    return posts.map(p => ({ slug: p.slug }));
  } catch {
    return [];
  }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  try {
    const { slug } = await params;
    const { post } = await getPostBySlug(slug);
    return generatePostMetadata(post);
  } catch {
    return { title: 'Article Not Found' };
  }
}

export default async function ArticlePage({ params }: PageProps) {
  const { slug } = await params;

  let post;
  try {
    const data = await getPostBySlug(slug);
    post = data.post;
  } catch {
    notFound();
  }

  const related = await getRelatedPosts(post.id).catch(() => ({ suggestions: [] }));
  const toc = generateTOC(post.content);
  const wordCount = (post.content as Array<{type:string;text?:string;items?:string[]}>)
    ?.reduce((acc: number, block: {type:string;text?:string;items?:string[]}) => {
      if (block.type === 'paragraph' || block.type === 'heading') {
        return acc + (block.text?.split(/\s+/).filter(Boolean).length || 0)
      }
      if (block.type === 'list') {
        return acc + (block.items?.join(' ').split(/\s+/).filter(Boolean).length || 0)
      }
      return acc
    }, 0) || 0;
  const readingTime = Math.max(1, Math.ceil(wordCount / 200));

  return (
    <>
      <ArticleJsonLd post={post} />

      <div>
        {/* Hero */}
        <div style={{ position: 'relative', height: 'min(60vh, 560px)', backgroundColor: 'var(--color-ink-950)', overflow: 'hidden' }}>
          {post.featuredImage && (
            <Image src={post.featuredImage} alt={post.featuredImageAlt || post.title} fill style={{ objectFit: 'cover', opacity: 0.45 }} priority sizes="100vw" />
          )}
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, transparent 30%, oklch(14% 0.02 270 / 0.92))' }} />
          <div className="container-prose" style={{ position: 'relative', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', paddingBottom: '3rem' }}>
            {/* Breadcrumb */}
            <nav aria-label="Breadcrumb" style={{ marginBottom: '1rem', display: 'flex', gap: '0.5rem', alignItems: 'center', fontSize: 'var(--text-xs)', color: 'var(--color-ink-300)' }}>
              <Link href="/blog" style={{ color: 'var(--color-ink-300)' }}>Blog</Link>
              {post.categories[0] && <>
                <span>/</span>
                <Link href={`/blog/category/${post.categories[0].category.slug}`} style={{ color: 'var(--color-ink-300)' }}>{post.categories[0].category.name}</Link>
              </>}
              <span>/</span>
              <span style={{ color: 'var(--color-ink-100)' }}>{post.title}</span>
            </nav>

            {/* Category badge */}
            {post.categories[0] && (
              <Link href={`/blog/category/${post.categories[0].category.slug}`}
                style={{ display: 'inline-block', marginBottom: '0.75rem', fontSize: 'var(--text-xs)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--color-accent-light)', padding: '0.2rem 0.75rem', borderRadius: 'var(--radius-full)', border: '1px solid var(--color-accent-light)', width: 'fit-content' }}>
                {post.categories[0].category.name}
              </Link>
            )}

            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(1.8rem, 4.5vw, 3rem)', color: 'white', lineHeight: 1.1, marginBottom: '1rem', maxWidth: '780px' }}>
              {post.title}
            </h1>

            {post.excerpt && <p style={{ fontSize: 'var(--text-base)', color: 'var(--color-ink-200)', lineHeight: 1.7, marginBottom: '1.5rem', maxWidth: '600px' }}>{post.excerpt}</p>}

            {/* Byline */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
              {post.author.avatar && (
                <Image src={post.author.avatar} alt={post.author.name} width={40} height={40} style={{ borderRadius: '50%', border: '2px solid rgba(255,255,255,0.3)', objectFit: 'cover' }} />
              )}
              <div>
                <div style={{ fontSize: 'var(--text-sm)', fontWeight: 600, color: 'white' }}>
                  {post.author.name}
                </div>
                <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-ink-300)' }}>
                  {post.publishedAt ? new Date(post.publishedAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : ''}
                  {' · '}{readingTime} min read
                  {post.isSponsored && <span style={{ marginLeft: '0.5rem', padding: '0.1rem 0.5rem', backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: 'var(--radius-sm)', fontSize: 'var(--text-xs)' }}>Sponsored</span>}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Article body */}
        <div className="container-wide" style={{ paddingTop: '4rem', paddingBottom: '4rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: toc.length >= 3 ? '1fr min(65ch, 100%)' : '1fr', gap: '4rem', justifyContent: 'center' }}>

            {/* Table of Contents — sidebar on desktop */}
            {toc.length >= 3 && (
              <aside style={{ display: 'none', position: 'sticky', top: '96px', height: 'fit-content', padding: '1.5rem', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-xl)', background: 'var(--color-surface)' }} className="toc-sidebar">
                <h4 style={{ fontSize: 'var(--text-sm)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--color-muted)', marginBottom: '1rem' }}>Contents</h4>
                <nav>
                  <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
                    {toc.map(item => (
                      <li key={item.id} style={{ paddingLeft: item.level === 3 ? '1rem' : '0' }}>
                        <a href={`#${item.id}`} className="link-hover" style={{ fontSize: 'var(--text-sm)', color: 'var(--color-muted)', lineHeight: 1.5, display: 'block' }}>{item.text}</a>
                      </li>
                    ))}
                  </ul>
                </nav>
              </aside>
            )}

            {/* Main content */}
            <article>
              <BlockRenderer blocks={post.content} />

              {/* Author bio */}
              {post.author.bio && (
                <div style={{ marginTop: '3rem', padding: '2rem', background: 'var(--color-surface)', borderRadius: 'var(--radius-xl)', border: '1px solid var(--color-border)', display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                  {post.author.avatar && (
                    <Image src={post.author.avatar} alt={post.author.name} width={60} height={60} style={{ borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }} />
                  )}
                  <div>
                    <p style={{ fontWeight: 700, fontSize: 'var(--text-lg)', marginBottom: '0.25rem', fontFamily: 'var(--font-display)' }}>{post.author.name}</p>
                    <p style={{ color: 'var(--color-muted)', fontSize: 'var(--text-sm)', lineHeight: 1.7 }}>{post.author.bio}</p>
                  </div>
                </div>
              )}
            </article>
          </div>

          {/* Related posts */}
          {related.suggestions.length > 0 && (
            <section style={{ marginTop: '4rem', paddingTop: '3rem', borderTop: '1px solid var(--color-border)' }}>
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-2xl)', marginBottom: '1.5rem' }}>
                Related Articles
                <span style={{ display: 'inline-block', width: '40px', height: '3px', backgroundColor: 'var(--color-accent)', marginLeft: '0.75rem', verticalAlign: 'middle', borderRadius: '2px' }} />
              </h2>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.5rem' }}>
                {related.suggestions.slice(0, 3).map(post => (
                  <PostCard key={post.id} post={post} variant="compact" />
                ))}
              </div>
            </section>
          )}
        </div>
      </div>

      <style>{`
        @media (min-width: 1024px) {
          .toc-sidebar { display: block !important; order: -1; }
        }
      `}</style>
    </>
  );
}

'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';

type BlockType =
  | 'heading'
  | 'paragraph'
  | 'image'
  | 'list'
  | 'blockquote'
  | 'callout'
  | 'faq';

interface Block {
  type: BlockType;
  [key: string]: unknown;
}

const BLOCK_TYPES: { type: BlockType; label: string; icon: string; desc: string }[] = [
  { type: 'paragraph', label: 'Paragraph', icon: 'P', desc: 'Plain text block' },
  { type: 'heading', label: 'Heading', icon: 'H', desc: 'H2 or H3 heading' },
  { type: 'image', label: 'Image', icon: '[]', desc: 'Image with caption' },
  { type: 'list', label: 'List', icon: 'L', desc: 'Bullet or numbered' },
  { type: 'blockquote', label: 'Quote', icon: '"', desc: 'Pull quote' },
  { type: 'callout', label: 'Callout', icon: '!', desc: 'Info / warning box' },
  { type: 'faq', label: 'FAQ', icon: '?', desc: 'FAQ accordion' },
];

function newBlock(type: BlockType): Block {
  switch (type) {
    case 'heading':
      return { type, level: 2, text: '' };
    case 'paragraph':
      return { type, text: '' };
    case 'image':
      return { type, url: '', alt: '', caption: '' };
    case 'list':
      return { type, ordered: false, items: [''] };
    case 'blockquote':
      return { type, text: '', author: '' };
    case 'callout':
      return { type, calloutType: 'info', text: '' };
    case 'faq':
      return { type, items: [{ question: '', answer: '' }] };
    default:
      return { type, text: '' };
  }
}

const inputStyle = {
  width: '100%',
  padding: '0.5rem 0.75rem',
  border: '1px solid var(--color-border)',
  borderRadius: 'var(--radius-md)',
  fontSize: 'var(--text-sm)',
  fontFamily: 'inherit',
  outline: 'none',
  backgroundColor: 'var(--color-bg)',
  color: 'var(--color-ink-900)',
  boxSizing: 'border-box' as const,
};

const textAreaStyle = {
  ...inputStyle,
  resize: 'vertical' as const,
  minHeight: '80px',
};

const fieldStyle = {
  display: 'flex',
  flexDirection: 'column' as const,
  gap: '0.375rem',
  marginBottom: '1rem',
};

const labelStyle = {
  fontSize: '11px',
  fontWeight: 600,
  textTransform: 'uppercase' as const,
  letterSpacing: '0.06em',
  color: 'var(--color-muted)',
};

function BlockContent({ block, onChange }: { block: Block; onChange: (nextBlock: Block) => void }) {
  if (block.type === 'heading') {
    return (
      <div>
        <div style={{ display: 'flex', gap: '0.375rem', marginBottom: '0.5rem' }}>
          {[2, 3].map(level => (
            <button
              key={level}
              onClick={() => onChange({ ...block, level })}
              style={{
                padding: '0.2rem 0.5rem',
                borderRadius: '4px',
                border: '1px solid var(--color-border)',
                backgroundColor: block.level === level ? 'var(--color-accent)' : 'transparent',
                color: block.level === level ? 'white' : 'var(--color-muted)',
                fontSize: '11px',
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              H{level}
            </button>
          ))}
        </div>
        <input
          style={{
            ...inputStyle,
            fontSize: block.level === 2 ? '1.2rem' : '1.05rem',
            fontFamily: 'var(--font-display)',
            fontWeight: 700,
          }}
          value={(block.text as string) || ''}
          onChange={event => onChange({ ...block, text: event.target.value })}
          placeholder="Heading text..."
        />
      </div>
    );
  }

  if (block.type === 'paragraph') {
    return (
      <textarea
        style={textAreaStyle}
        value={(block.text as string) || ''}
        onChange={event => onChange({ ...block, text: event.target.value })}
        placeholder="Write your paragraph here..."
      />
    );
  }

  if (block.type === 'image') {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        <input
          style={inputStyle}
          value={(block.url as string) || ''}
          onChange={event => onChange({ ...block, url: event.target.value })}
          placeholder="Image URL (paste Cloudinary URL here)"
        />
        <input
          style={inputStyle}
          value={(block.alt as string) || ''}
          onChange={event => onChange({ ...block, alt: event.target.value })}
          placeholder="Alt text (required for SEO)"
        />
        <input
          style={inputStyle}
          value={(block.caption as string) || ''}
          onChange={event => onChange({ ...block, caption: event.target.value })}
          placeholder="Caption (optional)"
        />
      </div>
    );
  }

  if (block.type === 'list') {
    return (
      <div>
        <div style={{ display: 'flex', gap: '0.375rem', marginBottom: '0.5rem' }}>
          {['Bullets', 'Numbered'].map((label, index) => {
            const active = block.ordered ? index === 1 : index === 0;
            return (
              <button
                key={label}
                onClick={() => onChange({ ...block, ordered: index === 1 })}
                style={{
                  padding: '0.2rem 0.5rem',
                  borderRadius: '4px',
                  border: '1px solid var(--color-border)',
                  backgroundColor: active ? 'var(--color-accent)' : 'transparent',
                  color: active ? 'white' : 'var(--color-muted)',
                  fontSize: '11px',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                {label}
              </button>
            );
          })}
        </div>

        {((block.items as string[]) || []).map((item, index) => (
          <div key={index} style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.375rem' }}>
            <input
              style={{ ...inputStyle, flex: 1 }}
              value={item}
              onChange={event => {
                const items = [...((block.items as string[]) || [])];
                items[index] = event.target.value;
                onChange({ ...block, items });
              }}
              placeholder={`Item ${index + 1}`}
            />
            <button
              onClick={() => onChange({ ...block, items: ((block.items as string[]) || []).filter((_, itemIndex) => itemIndex !== index) })}
              style={{ color: 'var(--color-muted)', background: 'none', border: 'none', cursor: 'pointer' }}
            >
              x
            </button>
          </div>
        ))}

        <button
          onClick={() => onChange({ ...block, items: [...((block.items as string[]) || []), ''] })}
          style={{ fontSize: '12px', color: 'var(--color-accent)', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
        >
          + Add item
        </button>
      </div>
    );
  }

  if (block.type === 'blockquote') {
    return (
      <div>
        <textarea
          style={{ ...textAreaStyle, minHeight: '60px', fontStyle: 'italic' }}
          value={(block.text as string) || ''}
          onChange={event => onChange({ ...block, text: event.target.value })}
          placeholder="Quote text..."
        />
        <input
          style={{ ...inputStyle, marginTop: '0.5rem' }}
          value={(block.author as string) || ''}
          onChange={event => onChange({ ...block, author: event.target.value })}
          placeholder="Attribution (optional)"
        />
      </div>
    );
  }

  if (block.type === 'callout') {
    return (
      <div>
        <div style={{ display: 'flex', gap: '0.375rem', marginBottom: '0.5rem' }}>
          {['info', 'warning', 'success', 'danger'].map(tone => (
            <button
              key={tone}
              onClick={() => onChange({ ...block, calloutType: tone })}
              style={{
                padding: '0.2rem 0.625rem',
                borderRadius: '4px',
                border: '1px solid var(--color-border)',
                backgroundColor: block.calloutType === tone ? 'var(--color-ink-950)' : 'transparent',
                color: block.calloutType === tone ? 'white' : 'var(--color-muted)',
                fontSize: '11px',
                fontWeight: 600,
                cursor: 'pointer',
                textTransform: 'capitalize',
              }}
            >
              {tone}
            </button>
          ))}
        </div>
        <input
          style={inputStyle}
          value={(block.text as string) || ''}
          onChange={event => onChange({ ...block, text: event.target.value })}
          placeholder="Callout message..."
        />
      </div>
    );
  }

  if (block.type === 'faq') {
    const items = (block.items as { question: string; answer: string }[]) || [];

    return (
      <div>
        {items.map((item, index) => (
          <div
            key={index}
            style={{
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-md)',
              padding: '0.75rem',
              marginBottom: '0.5rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.375rem',
            }}
          >
            <input
              style={inputStyle}
              value={item.question}
              onChange={event => {
                const nextItems = [...items];
                nextItems[index] = { ...nextItems[index], question: event.target.value };
                onChange({ ...block, items: nextItems });
              }}
              placeholder="Question"
            />
            <textarea
              style={{ ...textAreaStyle, minHeight: '56px' }}
              value={item.answer}
              onChange={event => {
                const nextItems = [...items];
                nextItems[index] = { ...nextItems[index], answer: event.target.value };
                onChange({ ...block, items: nextItems });
              }}
              placeholder="Answer"
            />
            {items.length > 1 && (
              <button
                onClick={() => onChange({ ...block, items: items.filter((_, itemIndex) => itemIndex !== index) })}
                style={{ fontSize: '12px', color: 'var(--color-accent)', background: 'none', border: 'none', cursor: 'pointer', alignSelf: 'flex-end' }}
              >
                x Remove
              </button>
            )}
          </div>
        ))}

        <button
          onClick={() => onChange({ ...block, items: [...items, { question: '', answer: '' }] })}
          style={{ fontSize: '12px', color: 'var(--color-accent)', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
        >
          + Add FAQ item
        </button>
      </div>
    );
  }

  return null;
}

export default function EditPostPage() {
  const params = useParams();
  const postId = params.id as string;

  const [title, setTitle] = useState('');
  const [excerpt, setExcerpt] = useState('');
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [seoTitle, setSeoTitle] = useState('');
  const [seoDesc, setSeoDesc] = useState('');
  const [featImg, setFeatImg] = useState('');
  const [featAlt, setFeatAlt] = useState('');
  const [slug, setSlug] = useState('');
  const [status, setStatus] = useState('DRAFT');
  const [saving, setSaving] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [activeTab, setActiveTab] = useState<'content' | 'seo'>('content');
  const [showBlockMenu, setShowBlockMenu] = useState(false);

  const api = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
  const token = () => (typeof window !== 'undefined' ? localStorage.getItem('accessToken') || '' : '');

  useEffect(() => {
    if (!postId) {
      setMessage('Could not find this post.');
      setLoading(false);
      return;
    }

    fetch(`${api}/posts/${postId}`, {
      headers: { Authorization: `Bearer ${token()}` },
      credentials: 'include',
    })
      .then(response => response.json())
      .then(data => {
        const post = data.post || data;
        setTitle(post.title || '');
        setExcerpt(post.excerpt || '');
        setBlocks(Array.isArray(post.content) && post.content.length > 0 ? post.content : [{ type: 'paragraph', text: '' }]);
        setSeoTitle(post.seoTitle || '');
        setSeoDesc(post.seoDescription || '');
        setFeatImg(post.featuredImage || '');
        setFeatAlt(post.featuredImageAlt || '');
        setSlug(post.slug || '');
        setStatus(post.status || 'DRAFT');
        setLoading(false);
      })
      .catch(() => {
        setMessage('Failed to load post.');
        setLoading(false);
      });
  }, [api, postId]);

  const save = async (publish = false) => {
    if (!title.trim()) {
      setMessage('Please add a title.');
      return;
    }

    if (publish) {
      setPublishing(true);
    } else {
      setSaving(true);
    }

    setMessage('');

    try {
      const body = {
        title,
        excerpt,
        content: blocks,
        seoTitle,
        seoDescription: seoDesc,
        featuredImage: featImg || undefined,
        featuredImageAlt: featAlt,
      };

      const updateRes = await fetch(`${api}/posts/${postId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token()}`,
        },
        credentials: 'include',
        body: JSON.stringify(body),
      });

      if (!updateRes.ok) {
        const error = await updateRes.json().catch(() => ({}));
        throw new Error(
          error.details
            ? `${error.error}: ${JSON.stringify(error.details)}`
            : error.error || error.message || 'Update failed'
        );
      }

      const updated = await updateRes.json().catch(() => ({}));
      setSlug(updated.post?.slug || slug);

      if (publish && status !== 'PUBLISHED') {
        const publishRes = await fetch(`${api}/posts/${postId}/publish`, {
          method: 'PUT',
          headers: { Authorization: `Bearer ${token()}` },
          credentials: 'include',
        });

        if (!publishRes.ok) {
          const error = await publishRes.json().catch(() => ({}));
          throw new Error(
            error.error
              || 'Publish failed - make sure the post has a featured image and an excerpt or meta description.'
          );
        }

        const published = await publishRes.json().catch(() => ({}));
        setSlug(published.post?.slug || slug);
        setStatus('PUBLISHED');
        setMessage('Published!');
      } else {
        setMessage('Saved.');
      }
    } catch (error: unknown) {
      setMessage(error instanceof Error ? error.message : 'Something went wrong.');
    } finally {
      setSaving(false);
      setPublishing(false);
    }
  };

  const updateBlock = (index: number, nextBlock: Block) => {
    setBlocks(currentBlocks => currentBlocks.map((block, blockIndex) => (blockIndex === index ? nextBlock : block)));
  };

  const deleteBlock = (index: number) => {
    setBlocks(currentBlocks => currentBlocks.filter((_, blockIndex) => blockIndex !== index));
  };

  const moveBlock = (index: number, direction: -1 | 1) => {
    const nextIndex = index + direction;
    if (nextIndex < 0 || nextIndex >= blocks.length) {
      return;
    }

    const nextBlocks = [...blocks];
    [nextBlocks[index], nextBlocks[nextIndex]] = [nextBlocks[nextIndex], nextBlocks[index]];
    setBlocks(nextBlocks);
  };

  const addBlock = (type: BlockType) => {
    setBlocks(currentBlocks => [...currentBlocks, newBlock(type)]);
    setShowBlockMenu(false);
  };

  const tabStyle = (tab: 'content' | 'seo') => ({
    padding: '0.5rem 1.25rem',
    fontSize: 'var(--text-sm)',
    fontWeight: activeTab === tab ? 600 : 400,
    color: activeTab === tab ? 'var(--color-accent)' : 'var(--color-muted)',
    background: 'none',
    borderBottom: activeTab === tab ? '2px solid var(--color-accent)' : '2px solid transparent',
    cursor: 'pointer',
    marginBottom: '-1px',
  });

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100dvh' }}>
        <div style={{ width: '32px', height: '32px', border: '3px solid var(--color-accent)', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
        <style>{'@keyframes spin { to { transform: rotate(360deg); } }'}</style>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100dvh' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.875rem 2rem', borderBottom: '1px solid var(--color-border)', backgroundColor: 'var(--color-surface)', position: 'sticky', top: 0, zIndex: 10, flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <a href="/admin/posts" style={{ fontSize: 'var(--text-sm)', color: 'var(--color-muted)', textDecoration: 'none' }}>All Posts</a>
          <span style={{ color: 'var(--color-border)' }}>|</span>
          <span style={{ fontSize: '11px', color: status === 'PUBLISHED' ? 'oklch(55% 0.18 145)' : 'var(--color-warning)', backgroundColor: status === 'PUBLISHED' ? 'oklch(55% 0.18 145 / 0.1)' : 'oklch(70% 0.15 75 / 0.1)', padding: '0.2rem 0.5rem', borderRadius: '4px', fontWeight: 600 }}>
            {status}
          </span>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          {message && (
            <span style={{ fontSize: '12px', color: message === 'Published!' || message === 'Saved.' ? 'oklch(55% 0.18 145)' : 'var(--color-accent)', maxWidth: '240px' }}>
              {message}
            </span>
          )}

          <button
            onClick={() => save(false)}
            disabled={saving}
            style={{ padding: '0.5rem 1.25rem', border: '1.5px solid var(--color-border)', borderRadius: 'var(--radius-lg)', fontSize: 'var(--text-sm)', fontWeight: 600, cursor: 'pointer', backgroundColor: 'transparent', color: 'var(--color-ink-950)', opacity: saving ? 0.6 : 1 }}
          >
            {saving ? 'Saving...' : 'Save'}
          </button>

          {status !== 'PUBLISHED' && (
            <button
              onClick={() => save(true)}
              disabled={publishing || saving}
              style={{ padding: '0.5rem 1.25rem', backgroundColor: 'var(--color-accent)', color: 'white', borderRadius: 'var(--radius-lg)', fontSize: 'var(--text-sm)', fontWeight: 600, cursor: 'pointer', border: 'none', opacity: publishing || saving ? 0.6 : 1 }}
            >
              {publishing ? 'Publishing...' : 'Publish'}
            </button>
          )}

          {status === 'PUBLISHED' && (
            <a
              href={`/blog/${slug || postId}`}
              target="_blank"
              rel="noopener noreferrer"
              style={{ padding: '0.5rem 1.25rem', backgroundColor: 'oklch(55% 0.18 145)', color: 'white', borderRadius: 'var(--radius-lg)', fontSize: 'var(--text-sm)', fontWeight: 600, textDecoration: 'none', border: 'none' }}
            >
              View Live
            </a>
          )}
        </div>
      </div>

      <div style={{ borderBottom: '1px solid var(--color-border)', padding: '0 2rem', display: 'flex', backgroundColor: 'var(--color-surface)', flexShrink: 0 }}>
        <button style={tabStyle('content')} onClick={() => setActiveTab('content')}>Content</button>
        <button style={tabStyle('seo')} onClick={() => setActiveTab('seo')}>SEO &amp; Meta</button>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '2rem', maxWidth: '800px', width: '100%', margin: '0 auto' }}>
        {activeTab === 'content' && (
          <>
            <textarea
              value={title}
              onChange={event => setTitle(event.target.value)}
              placeholder="Article title..."
              style={{ width: '100%', fontSize: 'clamp(1.5rem, 3vw, 2.25rem)', fontFamily: 'var(--font-display)', fontWeight: 700, border: 'none', outline: 'none', resize: 'none', backgroundColor: 'transparent', color: 'var(--color-ink-950)', lineHeight: 1.2, marginBottom: '0.75rem', padding: 0, boxSizing: 'border-box' }}
              rows={2}
            />

            <textarea
              value={excerpt}
              onChange={event => setExcerpt(event.target.value)}
              placeholder="Short excerpt..."
              style={{ width: '100%', fontSize: 'var(--text-lg)', border: 'none', outline: 'none', resize: 'none', backgroundColor: 'transparent', color: 'var(--color-muted)', lineHeight: 1.6, marginBottom: '2rem', padding: 0, boxSizing: 'border-box' }}
              rows={2}
            />

            <hr style={{ border: 'none', borderTop: '1px solid var(--color-border)', marginBottom: '1.5rem' }} />

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {blocks.map((block, index) => (
                <div key={index} style={{ border: '1px solid var(--color-border)', borderRadius: 'var(--radius-lg)', backgroundColor: 'var(--color-surface)', overflow: 'hidden' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.5rem 0.75rem', borderBottom: '1px solid var(--color-border)', backgroundColor: 'var(--color-ink-50)' }}>
                    <span style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--color-muted)' }}>
                      {block.type}
                    </span>

                    <div style={{ display: 'flex', gap: '0.375rem', alignItems: 'center' }}>
                      <button onClick={() => moveBlock(index, -1)} style={{ padding: '0.2rem 0.5rem', fontSize: '11px', fontWeight: 600, color: 'var(--color-muted)', background: 'none', border: '1px solid var(--color-border)', borderRadius: '4px', cursor: 'pointer' }}>Up</button>
                      <button onClick={() => moveBlock(index, 1)} style={{ padding: '0.2rem 0.5rem', fontSize: '11px', fontWeight: 600, color: 'var(--color-muted)', background: 'none', border: '1px solid var(--color-border)', borderRadius: '4px', cursor: 'pointer' }}>Down</button>
                      <button onClick={() => deleteBlock(index)} style={{ padding: '0.2rem 0.5rem', fontSize: '11px', fontWeight: 600, color: 'var(--color-accent)', background: 'none', border: '1px solid var(--color-border)', borderRadius: '4px', cursor: 'pointer' }}>Remove</button>
                    </div>
                  </div>

                  <div style={{ padding: '0.875rem' }}>
                    <BlockContent block={block} onChange={nextBlock => updateBlock(index, nextBlock)} />
                  </div>
                </div>
              ))}
            </div>

            <div style={{ marginTop: '0.75rem', position: 'relative' }}>
              <button
                onClick={() => setShowBlockMenu(current => !current)}
                style={{ width: '100%', padding: '0.75rem', border: '1px dashed var(--color-border)', borderRadius: 'var(--radius-lg)', fontSize: 'var(--text-sm)', color: 'var(--color-muted)', cursor: 'pointer', backgroundColor: 'transparent' }}
              >
                + Add Block
              </button>

              {showBlockMenu && (
                <div style={{ position: 'absolute', top: '110%', left: 0, right: 0, backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-xl)', boxShadow: 'var(--shadow-lg)', zIndex: 20, padding: '0.5rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: '0.25rem' }}>
                  {BLOCK_TYPES.map(({ type, label, icon, desc }) => (
                    <button
                      key={type}
                      onClick={() => addBlock(type)}
                      style={{ padding: '0.625rem 0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid transparent', cursor: 'pointer', backgroundColor: 'transparent', textAlign: 'left', display: 'flex', flexDirection: 'column', gap: '0.125rem' }}
                    >
                      <span style={{ fontSize: '1rem' }}>{icon}</span>
                      <span style={{ fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--color-ink-950)' }}>{label}</span>
                      <span style={{ fontSize: '10px', color: 'var(--color-muted)' }}>{desc}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </>
        )}

        {activeTab === 'seo' && (
          <div>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-2xl)', marginBottom: '1.5rem' }}>SEO &amp; Metadata</h2>

            <div style={fieldStyle}>
              <label style={labelStyle}>Featured Image URL</label>
              <input style={inputStyle} value={featImg} onChange={event => setFeatImg(event.target.value)} placeholder="https://res.cloudinary.com/..." />
              <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-muted)' }}>
                Publishing requires a featured image. Uploads are available via the backend `/images/upload` endpoint.
              </span>
            </div>

            <div style={fieldStyle}>
              <label style={labelStyle}>Featured Image Alt Text</label>
              <input style={inputStyle} value={featAlt} onChange={event => setFeatAlt(event.target.value)} placeholder="Describe the image" />
            </div>

            <hr style={{ border: 'none', borderTop: '1px solid var(--color-border)', margin: '1.5rem 0' }} />

            <div style={fieldStyle}>
              <label style={labelStyle}>SEO Title ({(seoTitle || title).length}/60)</label>
              <input style={inputStyle} value={seoTitle} onChange={event => setSeoTitle(event.target.value)} placeholder={title || 'SEO-optimized title'} />
            </div>

            <div style={fieldStyle}>
              <label style={labelStyle}>Meta Description ({(seoDesc || excerpt).length}/160)</label>
              <textarea style={{ ...inputStyle, resize: 'vertical', minHeight: '80px' }} value={seoDesc} onChange={event => setSeoDesc(event.target.value)} placeholder={excerpt || 'Meta description'} />
            </div>

            <div style={{ padding: '1.25rem', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-lg)', backgroundColor: 'var(--color-ink-50)' }}>
              <p style={{ fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--color-muted)', marginBottom: '0.75rem' }}>Google Preview</p>
              <p style={{ fontSize: '18px', color: '#1a0dab', marginBottom: '0.25rem' }}>{seoTitle || title || 'Article Title'}</p>
              <p style={{ fontSize: '13px', color: '#006621', marginBottom: '0.25rem' }}>thecorporateblog.com &gt; blog &gt; {slug || 'article-slug'}</p>
              <p style={{ fontSize: '13px', color: '#545454', lineHeight: 1.5 }}>{seoDesc || excerpt || 'Meta description...'}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

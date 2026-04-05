'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

type BlockType = 'heading' | 'paragraph' | 'image' | 'list' | 'blockquote' | 'callout' | 'faq';

interface Block {
  type: BlockType;
  [key: string]: unknown;
}

const BLOCK_TYPES: { type: BlockType; label: string; icon: string; desc: string }[] = [
  { type: 'paragraph',   label: 'Paragraph', icon: '¶', desc: 'Plain text block' },
  { type: 'heading',     label: 'Heading',   icon: 'H', desc: 'H2 or H3 heading' },
  { type: 'image',       label: 'Image',     icon: '◻', desc: 'Image with caption' },
  { type: 'list',        label: 'List',      icon: '☰', desc: 'Bullet or numbered' },
  { type: 'blockquote',  label: 'Quote',     icon: '"', desc: 'Pull quote' },
  { type: 'callout',     label: 'Callout',   icon: '!', desc: 'Info / warning box' },
  { type: 'faq',         label: 'FAQ',       icon: '?', desc: 'FAQ accordion' },
];

function newBlock(type: BlockType): Block {
  switch (type) {
    case 'heading':    return { type, level: 2, text: '' };
    case 'paragraph':  return { type, text: '' };
    case 'image':      return { type, url: '', alt: '', caption: '' };
    case 'list':       return { type, ordered: false, items: [''] };
    case 'blockquote': return { type, text: '', author: '' };
    case 'callout':    return { type, calloutType: 'info', text: '' };
    case 'faq':        return { type, items: [{ question: '', answer: '' }] };
    default:           return { type, text: '' };
  }
}

const inputStyle = {
  width: '100%', padding: '0.5rem 0.75rem',
  border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)',
  fontSize: 'var(--text-sm)', fontFamily: 'inherit', outline: 'none',
  backgroundColor: 'var(--color-bg)', color: 'var(--color-ink-900)',
  boxSizing: 'border-box' as const,
};
const taStyle = { ...inputStyle, resize: 'vertical' as const, minHeight: '80px' };

function BlockContent({ block, onChange }: { block: Block; onChange: (b: Block) => void }) {
  if (block.type === 'heading') return (
    <div>
      <div style={{ display: 'flex', gap: '0.375rem', marginBottom: '0.5rem' }}>
        {[2, 3].map(l => (
          <button key={l} onClick={() => onChange({ ...block, level: l })}
            style={{ padding: '0.2rem 0.5rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-border)', backgroundColor: block.level === l ? 'var(--color-accent)' : 'transparent', color: block.level === l ? 'white' : 'var(--color-muted)', fontSize: '11px', fontWeight: 700, cursor: 'pointer' }}>H{l}</button>
        ))}
      </div>
      <input style={{ ...inputStyle, fontSize: block.level === 2 ? '1.2rem' : '1.05rem', fontFamily: 'var(--font-display)', fontWeight: 700 }} value={block.text as string || ''} onChange={e => onChange({ ...block, text: e.target.value })} placeholder="Heading text..." />
    </div>
  );

  if (block.type === 'paragraph') return (
    <textarea style={taStyle} value={block.text as string || ''} onChange={e => onChange({ ...block, text: e.target.value })} placeholder="Write your paragraph here..." />
  );

  if (block.type === 'image') return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
      <input style={inputStyle} value={block.url as string || ''} onChange={e => onChange({ ...block, url: e.target.value })} placeholder="Image URL (paste Cloudinary URL here)" />
      <input style={inputStyle} value={block.alt as string || ''} onChange={e => onChange({ ...block, alt: e.target.value })} placeholder="Alt text (required for SEO)" />
      <input style={inputStyle} value={block.caption as string || ''} onChange={e => onChange({ ...block, caption: e.target.value })} placeholder="Caption (optional)" />
    </div>
  );

  if (block.type === 'list') return (
    <div>
      <div style={{ display: 'flex', gap: '0.375rem', marginBottom: '0.5rem' }}>
        {['Bullets', 'Numbered'].map((l, i) => (
          <button key={l} onClick={() => onChange({ ...block, ordered: i === 1 })}
            style={{ padding: '0.2rem 0.5rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-border)', backgroundColor: (block.ordered ? i === 1 : i === 0) ? 'var(--color-accent)' : 'transparent', color: (block.ordered ? i === 1 : i === 0) ? 'white' : 'var(--color-muted)', fontSize: '11px', fontWeight: 600, cursor: 'pointer' }}>{l}</button>
        ))}
      </div>
      {(block.items as string[]).map((item, idx) => (
        <div key={idx} style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.375rem' }}>
          <input style={{ ...inputStyle, flex: 1 }} value={item} onChange={e => { const items = [...(block.items as string[])]; items[idx] = e.target.value; onChange({ ...block, items }); }} placeholder={`Item ${idx + 1}`} />
          <button onClick={() => { const items = (block.items as string[]).filter((_, i) => i !== idx); onChange({ ...block, items }); }} style={{ color: 'var(--color-muted)', background: 'none', border: 'none', cursor: 'pointer', fontSize: '1rem', padding: '0 0.25rem' }}>✕</button>
        </div>
      ))}
      <button onClick={() => onChange({ ...block, items: [...(block.items as string[]), ''] })} style={{ fontSize: '12px', color: 'var(--color-accent)', background: 'none', border: 'none', cursor: 'pointer', padding: 0, marginTop: '0.25rem' }}>+ Add item</button>
    </div>
  );

  if (block.type === 'blockquote') return (
    <div>
      <textarea style={{ ...taStyle, minHeight: '60px', fontStyle: 'italic' }} value={block.text as string || ''} onChange={e => onChange({ ...block, text: e.target.value })} placeholder="Quote text..." />
      <input style={{ ...inputStyle, marginTop: '0.5rem' }} value={block.author as string || ''} onChange={e => onChange({ ...block, author: e.target.value })} placeholder="Attribution (optional)" />
    </div>
  );

  if (block.type === 'callout') return (
    <div>
      <div style={{ display: 'flex', gap: '0.375rem', marginBottom: '0.5rem' }}>
        {['info', 'warning', 'success', 'danger'].map(t => (
          <button key={t} onClick={() => onChange({ ...block, calloutType: t })}
            style={{ padding: '0.2rem 0.625rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-border)', backgroundColor: block.calloutType === t ? 'var(--color-ink-950)' : 'transparent', color: block.calloutType === t ? 'white' : 'var(--color-muted)', fontSize: '11px', fontWeight: 600, cursor: 'pointer', textTransform: 'capitalize' }}>{t}</button>
        ))}
      </div>
      <input style={inputStyle} value={block.text as string || ''} onChange={e => onChange({ ...block, text: e.target.value })} placeholder="Callout message..." />
    </div>
  );

  if (block.type === 'faq') {
    const items = block.items as { question: string; answer: string }[];
    return (
      <div>
        {items.map((item, idx) => (
          <div key={idx} style={{ border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', padding: '0.75rem', marginBottom: '0.5rem', display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
            <input style={inputStyle} value={item.question} onChange={e => { const it = [...items]; it[idx] = { ...it[idx], question: e.target.value }; onChange({ ...block, items: it }); }} placeholder="Question" />
            <textarea style={{ ...taStyle, minHeight: '56px' }} value={item.answer} onChange={e => { const it = [...items]; it[idx] = { ...it[idx], answer: e.target.value }; onChange({ ...block, items: it }); }} placeholder="Answer" />
            {items.length > 1 && <button onClick={() => onChange({ ...block, items: items.filter((_, i) => i !== idx) })} style={{ fontSize: '12px', color: 'var(--color-accent)', background: 'none', border: 'none', cursor: 'pointer', alignSelf: 'flex-end' }}>× Remove</button>}
          </div>
        ))}
        <button onClick={() => onChange({ ...block, items: [...items, { question: '', answer: '' }] })} style={{ fontSize: '12px', color: 'var(--color-accent)', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>+ Add FAQ item</button>
      </div>
    );
  }
  return null;
}

export default function NewPostPage() {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [excerpt, setExcerpt] = useState('');
  const [blocks, setBlocks] = useState<Block[]>([{ type: 'paragraph', text: '' }]);
  const [seoTitle, setSeoTitle] = useState('');
  const [seoDescription, setSeoDescription] = useState('');
  const [featuredImage, setFeaturedImage] = useState('');
  const [featuredImageAlt, setFeaturedImageAlt] = useState('');
  const [saving, setSaving] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [savedId, setSavedId] = useState<string | null>(null);
  const [showBlockMenu, setShowBlockMenu] = useState(false);
  const [activeTab, setActiveTab] = useState<'content' | 'seo'>('content');
  const [message, setMessage] = useState('');

  const token = () => typeof window !== 'undefined' ? localStorage.getItem('accessToken') : '';
  const api = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

  const save = async (publish = false) => {
    if (!title.trim()) { setMessage('Please add a title first.'); return; }
    if (publish) {
      setPublishing(true);
    } else {
      setSaving(true);
    }
    setMessage('');
    try {
      const body = { title, excerpt, content: blocks, seoTitle, seoDescription, featuredImage: featuredImage || undefined, featuredImageAlt };
      let id = savedId;
      if (!id) {
        const res = await fetch(`${api}/posts`, { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token()}` }, credentials: 'include', body: JSON.stringify(body) });
        const data = await res.json();
        if (!res.ok) throw new Error(data.details ? `${data.error}: ${JSON.stringify(data.details)}` : (data.error || data.message || 'Save failed'));
        id = data.id ?? data.post?.id;
        setSavedId(id!);
      } else {
        const res = await fetch(`${api}/posts/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token()}` }, credentials: 'include', body: JSON.stringify(body) });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(data.error || data.message || 'Update failed');
      }
      if (publish && id) {
        const res = await fetch(`${api}/posts/${id}/publish`, { method: 'PUT', headers: { Authorization: `Bearer ${token()}` }, credentials: 'include' });
        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          throw new Error(err.error || err.message || 'Publish failed');
        }
        setMessage('✅ Published! Redirecting...');
        setTimeout(() => router.push('/admin/posts'), 1500);
      } else {
        setMessage('✅ Saved as draft');
      }
    } catch (e: unknown) {
      setMessage(`❌ ${e instanceof Error ? e.message : 'Something went wrong'}`);
    } finally {
      setSaving(false);
      setPublishing(false);
    }
  };

  const updateBlock = (idx: number, block: Block) => setBlocks(bs => bs.map((b, i) => i === idx ? block : b));
  const deleteBlock = (idx: number) => setBlocks(bs => bs.filter((_, i) => i !== idx));
  const moveBlock = (idx: number, dir: -1 | 1) => {
    const newIdx = idx + dir;
    if (newIdx < 0 || newIdx >= blocks.length) return;
    const b = [...blocks];
    [b[idx], b[newIdx]] = [b[newIdx], b[idx]];
    setBlocks(b);
  };
  const addBlock = (type: BlockType) => { setBlocks(bs => [...bs, newBlock(type)]); setShowBlockMenu(false); };

  // Button helpers
  const ctrlBtn = (label: string, onClick: () => void, danger = false) => (
    <button onClick={onClick} style={{ padding: '0.2rem 0.5rem', fontSize: '11px', fontWeight: 600, color: danger ? 'var(--color-accent)' : 'var(--color-muted)', background: 'none', border: '1px solid var(--color-border)', borderRadius: '4px', cursor: 'pointer', lineHeight: 1.4 }}>{label}</button>
  );

  const tabStyle = (tab: 'content' | 'seo') => ({
    padding: '0.5rem 1.25rem', fontSize: 'var(--text-sm)', fontWeight: activeTab === tab ? 600 : 400,
    color: activeTab === tab ? 'var(--color-accent)' : 'var(--color-muted)',
    background: 'none', borderBottom: activeTab === tab ? '2px solid var(--color-accent)' : '2px solid transparent',
    cursor: 'pointer', marginBottom: '-1px',
  });

  const fieldStyle = { display: 'flex', flexDirection: 'column' as const, gap: '0.375rem', marginBottom: '1rem' };
  const labelStyle = { fontSize: 'var(--text-xs)', fontWeight: 600, textTransform: 'uppercase' as const, letterSpacing: '0.06em', color: 'var(--color-muted)' };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100dvh' }}>
      {/* Top bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.875rem 2rem', borderBottom: '1px solid var(--color-border)', backgroundColor: 'var(--color-surface)', position: 'sticky', top: 0, zIndex: 10, flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <a href="/admin/posts" style={{ fontSize: 'var(--text-sm)', color: 'var(--color-muted)', textDecoration: 'none' }}>← All Posts</a>
          <span style={{ color: 'var(--color-border)' }}>|</span>
          <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-muted)', backgroundColor: savedId ? 'oklch(55% 0.18 145 / 0.1)' : 'var(--color-ink-50)', padding: '0.2rem 0.5rem', borderRadius: '4px' }}>{savedId ? '● Draft saved' : '○ Unsaved'}</span>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          {message && <span style={{ fontSize: '12px', color: message.startsWith('✅') ? 'oklch(55% 0.18 145)' : 'var(--color-accent)', maxWidth: '240px' }}>{message}</span>}
          <button onClick={() => save(false)} disabled={saving} style={{ padding: '0.5rem 1.25rem', border: '1.5px solid var(--color-border)', borderRadius: 'var(--radius-lg)', fontSize: 'var(--text-sm)', fontWeight: 600, cursor: 'pointer', backgroundColor: 'transparent', color: 'var(--color-ink-950)', opacity: saving ? 0.6 : 1 }}>
            {saving ? 'Saving...' : 'Save Draft'}
          </button>
          <button onClick={() => save(true)} disabled={publishing || saving} style={{ padding: '0.5rem 1.25rem', backgroundColor: 'var(--color-accent)', color: 'white', borderRadius: 'var(--radius-lg)', fontSize: 'var(--text-sm)', fontWeight: 600, cursor: 'pointer', border: 'none', opacity: (publishing || saving) ? 0.6 : 1 }}>
            {publishing ? 'Publishing...' : '↑ Publish'}
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ borderBottom: '1px solid var(--color-border)', padding: '0 2rem', display: 'flex', backgroundColor: 'var(--color-surface)', flexShrink: 0 }}>
        <button style={tabStyle('content')} onClick={() => setActiveTab('content')}>Content</button>
        <button style={tabStyle('seo')} onClick={() => setActiveTab('seo')}>SEO & Meta</button>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '2rem', maxWidth: '800px', width: '100%', margin: '0 auto' }}>
        {activeTab === 'content' && (
          <>
            <textarea
              value={title}
              onChange={e => { setTitle(e.target.value); if (!seoTitle) setSeoTitle(e.target.value); }}
              placeholder="Article title..."
              style={{ width: '100%', fontSize: 'clamp(1.5rem, 3vw, 2.25rem)', fontFamily: 'var(--font-display)', fontWeight: 700, border: 'none', outline: 'none', resize: 'none', backgroundColor: 'transparent', color: 'var(--color-ink-950)', lineHeight: 1.2, marginBottom: '0.75rem', padding: 0, boxSizing: 'border-box' }}
              rows={2}
            />
            <textarea
              value={excerpt}
              onChange={e => { setExcerpt(e.target.value); if (!seoDescription) setSeoDescription(e.target.value); }}
              placeholder="Short excerpt (appears in article cards and meta description)..."
              style={{ width: '100%', fontSize: 'var(--text-lg)', border: 'none', outline: 'none', resize: 'none', backgroundColor: 'transparent', color: 'var(--color-muted)', lineHeight: 1.6, marginBottom: '2rem', padding: 0, boxSizing: 'border-box' }}
              rows={2}
            />
            <hr style={{ border: 'none', borderTop: '1px solid var(--color-border)', marginBottom: '1.5rem' }} />

            {/* Block list */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {blocks.map((block, idx) => (
                <div key={idx} style={{ border: '1px solid var(--color-border)', borderRadius: 'var(--radius-lg)', backgroundColor: 'var(--color-surface)', overflow: 'hidden' }}>
                  {/* Unified toolbar — all in one row, no overlap */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.5rem 0.75rem', borderBottom: '1px solid var(--color-border)', backgroundColor: 'var(--color-ink-50)' }}>
                    <span style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--color-muted)' }}>{block.type}</span>
                    <div style={{ display: 'flex', gap: '0.375rem', alignItems: 'center' }}>
                      {ctrlBtn('↑', () => moveBlock(idx, -1))}
                      {ctrlBtn('↓', () => moveBlock(idx, 1))}
                      {ctrlBtn('✕ Remove', () => deleteBlock(idx), true)}
                    </div>
                  </div>
                  {/* Block content */}
                  <div style={{ padding: '0.875rem' }}>
                    <BlockContent block={block} onChange={b => updateBlock(idx, b)} />
                  </div>
                </div>
              ))}
            </div>

            {/* Add block */}
            <div style={{ marginTop: '0.75rem', position: 'relative' }}>
              <button onClick={() => setShowBlockMenu(m => !m)}
                style={{ width: '100%', padding: '0.75rem', border: '1px dashed var(--color-border)', borderRadius: 'var(--radius-lg)', fontSize: 'var(--text-sm)', color: 'var(--color-muted)', cursor: 'pointer', backgroundColor: 'transparent', fontWeight: 500 }}>
                + Add Block
              </button>
              {showBlockMenu && (
                <div style={{ position: 'absolute', top: '110%', left: 0, right: 0, backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-xl)', boxShadow: 'var(--shadow-lg)', zIndex: 20, padding: '0.5rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: '0.25rem' }}>
                  {BLOCK_TYPES.map(({ type, label, icon, desc }) => (
                    <button key={type} onClick={() => addBlock(type)}
                      style={{ padding: '0.625rem 0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid transparent', cursor: 'pointer', backgroundColor: 'transparent', textAlign: 'left', display: 'flex', flexDirection: 'column', gap: '0.125rem' }}>
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
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-2xl)', marginBottom: '1.5rem' }}>SEO & Metadata</h2>
            <div style={fieldStyle}>
              <label style={labelStyle}>Featured Image URL</label>
              <input style={inputStyle} value={featuredImage} onChange={e => setFeaturedImage(e.target.value)} placeholder="https://res.cloudinary.com/..." />
              <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-muted)' }}>
                Publishing requires a featured image. Uploads are available via the backend `/images/upload` endpoint.
              </span>
            </div>
            <div style={fieldStyle}>
              <label style={labelStyle}>Featured Image Alt Text</label>
              <input style={inputStyle} value={featuredImageAlt} onChange={e => setFeaturedImageAlt(e.target.value)} placeholder="Describe the image for accessibility and SEO" />
            </div>
            <hr style={{ border: 'none', borderTop: '1px solid var(--color-border)', margin: '1.5rem 0' }} />
            <div style={fieldStyle}>
              <label style={labelStyle}>SEO Title <span style={{ color: 'var(--color-muted)', fontWeight: 400, textTransform: 'none' }}>({(seoTitle || title).length}/60)</span></label>
              <input style={{ ...inputStyle, borderColor: (seoTitle || title).length > 60 ? 'var(--color-accent)' : 'var(--color-border)' }} value={seoTitle} onChange={e => setSeoTitle(e.target.value)} placeholder={title || 'SEO-optimized title (max 60 chars)'} />
            </div>
            <div style={fieldStyle}>
              <label style={labelStyle}>Meta Description <span style={{ color: 'var(--color-muted)', fontWeight: 400, textTransform: 'none' }}>({(seoDescription || excerpt).length}/160)</span></label>
              <textarea style={{ ...inputStyle, resize: 'vertical', minHeight: '80px', borderColor: (seoDescription || excerpt).length > 160 ? 'var(--color-accent)' : 'var(--color-border)' }} value={seoDescription} onChange={e => setSeoDescription(e.target.value)} placeholder={excerpt || 'Compelling description (max 160 chars)'} />
            </div>
            {/* Google Preview */}
            <div style={{ marginTop: '1.5rem', padding: '1.25rem', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-lg)', backgroundColor: 'var(--color-ink-50)' }}>
              <p style={{ fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--color-muted)', marginBottom: '0.75rem' }}>Google Preview</p>
              <p style={{ fontSize: '18px', color: '#1a0dab', marginBottom: '0.25rem', fontFamily: 'Arial, sans-serif' }}>{seoTitle || title || 'Article Title'}</p>
              <p style={{ fontSize: '13px', color: '#006621', marginBottom: '0.25rem', fontFamily: 'Arial, sans-serif' }}>thecorporateblog.com › blog › {title.toLowerCase().replace(/\s+/g, '-') || 'article-slug'}</p>
              <p style={{ fontSize: '13px', color: '#545454', fontFamily: 'Arial, sans-serif', lineHeight: 1.5 }}>{seoDescription || excerpt || 'Meta description will appear here...'}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

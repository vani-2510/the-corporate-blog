import Image from 'next/image';
import { Block } from '@/lib/types';

function sanitizeText(text: string): string {
  return text.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '').trim();
}

function HeadingBlock({ block }: { block: Block }) {
  const level = (block.level as number) || 2;
  const text = sanitizeText((block.text as string) || '');
  const id = text.toLowerCase().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-');
  const Tag = `h${Math.min(Math.max(level, 1), 6)}` as 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
  const sizes = { 1: 'var(--text-4xl)', 2: 'var(--text-3xl)', 3: 'var(--text-2xl)', 4: 'var(--text-xl)', 5: 'var(--text-lg)', 6: 'var(--text-base)' };
  return (
    <Tag id={id} style={{ fontFamily: 'var(--font-display)', fontSize: sizes[level as keyof typeof sizes], lineHeight: 1.2, color: 'var(--color-ink-950)', margin: '2rem 0 0.75rem', scrollMarginTop: '80px' }}>
      {text}
    </Tag>
  );
}

function ParagraphBlock({ block }: { block: Block }) {
  return <p style={{ fontSize: 'var(--text-base)', lineHeight: 1.85, color: 'var(--color-ink-800)', margin: '0 0 1.25rem' }}>{sanitizeText((block.text as string) || '')}</p>;
}

function ImageBlock({ block }: { block: Block }) {
  const url = (block.url as string) || '';
  const alt = (block.alt as string) || '';
  const caption = (block.caption as string) || '';
  if (!url) return null;
  return (
    <figure style={{ margin: '2rem 0', borderRadius: 'var(--radius-lg)', overflow: 'hidden' }}>
      <div style={{ position: 'relative', aspectRatio: '16/9' }}>
        <Image src={url} alt={alt} fill style={{ objectFit: 'cover' }} sizes="(max-width: 720px) 100vw, 720px" loading="lazy" />
      </div>
      {caption && <figcaption style={{ padding: '0.5rem 0', fontSize: 'var(--text-sm)', color: 'var(--color-muted)', textAlign: 'center', fontStyle: 'italic' }}>{sanitizeText(caption)}</figcaption>}
    </figure>
  );
}

function ListBlock({ block }: { block: Block }) {
  const ordered = block.ordered as boolean;
  const items = (block.items as string[]) || [];
  const Tag = ordered ? 'ol' : 'ul';
  return (
    <Tag style={{ margin: '0 0 1.25rem 1.5rem', display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
      {items.map((item, i) => (
        <li key={i} style={{ fontSize: 'var(--text-base)', lineHeight: 1.7, color: 'var(--color-ink-800)' }}>{sanitizeText(item)}</li>
      ))}
    </Tag>
  );
}

function BlockquoteBlock({ block }: { block: Block }) {
  const authorText = typeof block.author === 'string' ? sanitizeText(block.author) : null;
  return (
    <blockquote style={{ margin: '2rem 0', padding: '1.5rem 2rem', borderLeft: '4px solid var(--color-accent)', backgroundColor: 'oklch(50% 0.22 22 / 0.05)', borderRadius: '0 var(--radius-lg) var(--radius-lg) 0' }}>
      <p style={{ fontSize: 'var(--text-lg)', fontFamily: 'var(--font-display)', lineHeight: 1.6, color: 'var(--color-ink-900)', fontStyle: 'italic', margin: 0 }}>&quot;{sanitizeText((block.text as string) || '')}&quot;</p>
      {authorText && <cite style={{ display: 'block', marginTop: '0.75rem', fontSize: 'var(--text-sm)', color: 'var(--color-muted)', fontStyle: 'normal' }}>— {authorText}</cite>}
    </blockquote>
  );
}

function TableBlock({ block }: { block: Block }) {
  const headers = (block.headers as string[]) || [];
  const rows = (block.rows as string[][]) || [];
  return (
    <div style={{ overflowX: 'auto', margin: '1.5rem 0', borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-border)' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 'var(--text-sm)' }}>
        <thead>
          <tr style={{ backgroundColor: 'var(--color-ink-50)' }}>
            {headers.map((h, i) => (
              <th key={i} style={{ padding: '0.75rem 1rem', textAlign: 'left', fontWeight: 600, color: 'var(--color-ink-950)', borderBottom: '1px solid var(--color-border)' }}>{sanitizeText(h)}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i} style={{ borderBottom: '1px solid var(--color-border)', backgroundColor: i % 2 === 0 ? 'transparent' : 'var(--color-ink-50)' }}>
              {row.map((cell, j) => (
                <td key={j} style={{ padding: '0.75rem 1rem', color: 'var(--color-ink-800)' }}>{sanitizeText(cell)}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function FAQBlock({ block }: { block: Block }) {
  const items = (block.items as Array<{ question: string; answer: string }>) || [];
  return (
    <div style={{ margin: '2rem 0', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-lg)', overflow: 'hidden' }}>
      <div style={{ padding: '1rem 1.5rem', backgroundColor: 'var(--color-ink-50)', borderBottom: '1px solid var(--color-border)' }}>
        <h3 style={{ fontSize: 'var(--text-lg)', fontFamily: 'var(--font-display)', margin: 0 }}>Frequently Asked Questions</h3>
      </div>
      {items.map((item, i) => (
        <details key={i} style={{ borderBottom: i < items.length - 1 ? '1px solid var(--color-border)' : 'none' }}>
          <summary style={{ padding: '1rem 1.5rem', cursor: 'pointer', fontSize: 'var(--text-base)', fontWeight: 600, color: 'var(--color-ink-900)', listStyle: 'none', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            {sanitizeText(item.question)}
            <span style={{ color: 'var(--color-accent)', fontSize: '1.25rem', lineHeight: 1 }}>+</span>
          </summary>
          <div style={{ padding: '0 1.5rem 1rem', color: 'var(--color-ink-700)', fontSize: 'var(--text-sm)', lineHeight: 1.75 }}>
            {sanitizeText(item.answer)}
          </div>
        </details>
      ))}
    </div>
  );
}

function CalloutBlock({ block }: { block: Block }) {
  const types = {
    info:    { bg: 'oklch(55% 0.18 240 / 0.08)', border: 'oklch(55% 0.18 240)', icon: 'ℹ' },
    warning: { bg: 'oklch(72% 0.18 80 / 0.08)',  border: 'oklch(72% 0.18 80)',  icon: '⚠' },
    success: { bg: 'oklch(55% 0.18 145 / 0.08)', border: 'oklch(55% 0.18 145)', icon: '✓' },
    danger:  { bg: 'oklch(50% 0.22 22 / 0.08)',  border: 'var(--color-accent)', icon: '✕' },
  };
  const style = types[(block.calloutType as keyof typeof types) || 'info'];
  return (
    <div style={{ margin: '1.5rem 0', padding: '1rem 1.5rem', borderLeft: `4px solid ${style.border}`, borderRadius: '0 var(--radius-md) var(--radius-md) 0', backgroundColor: style.bg }}>
      <span style={{ fontSize: '1rem', marginRight: '0.5rem' }}>{style.icon}</span>
      <span style={{ fontSize: 'var(--text-sm)', color: 'var(--color-ink-800)' }}>{sanitizeText((block.text as string) || '')}</span>
    </div>
  );
}

export default function BlockRenderer({ blocks }: { blocks: Block[] }) {
  if (!blocks || !Array.isArray(blocks)) return null;
  return (
    <div>
      {blocks.map((block, i) => {
        switch (block.type) {
          case 'heading':    return <HeadingBlock    key={i} block={block} />;
          case 'paragraph':  return <ParagraphBlock  key={i} block={block} />;
          case 'image':      return <ImageBlock      key={i} block={block} />;
          case 'list':       return <ListBlock       key={i} block={block} />;
          case 'blockquote': return <BlockquoteBlock key={i} block={block} />;
          case 'table':      return <TableBlock      key={i} block={block} />;
          case 'faq':        return <FAQBlock        key={i} block={block} />;
          case 'callout':    return <CalloutBlock    key={i} block={block} />;
          default:           return null;
        }
      })}
    </div>
  );
}

export function generateTOC(blocks: Block[]): Array<{ id: string; text: string; level: number }> {
  return blocks
    .filter(b => b.type === 'heading' && [2, 3].includes((b.level as number) || 0))
    .map(b => {
      const text = (b.text as string) || '';
      return {
        id: text.toLowerCase().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-'),
        text,
        level: (b.level as number) || 2,
      };
    });
}

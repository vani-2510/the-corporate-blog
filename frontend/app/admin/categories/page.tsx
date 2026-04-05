'use client';

import { useEffect, useState, useCallback } from 'react';

interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  _count?: { posts: number };
}

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [editId, setEditId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  const api = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
  const token = () => localStorage.getItem('accessToken');

  const fetchCategories = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`${api}/categories`, { credentials: 'include' });
      const data = await res.json();
      setCategories(data.categories || data);
    } catch { setMessage('Could not load categories.'); }
    finally { setLoading(false); }
  }, [api]);

  useEffect(() => { fetchCategories(); }, [fetchCategories]);

  const handleSave = async () => {
    if (!name.trim()) { setMessage('Name is required.'); return; }
    setSaving(true);
    setMessage('');
    try {
      const body = { name: name.trim(), description: description.trim() || null };
      const res = editId
        ? await fetch(`${api}/categories/${editId}`, { method: 'PUT', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token()}` }, credentials: 'include', body: JSON.stringify(body) })
        : await fetch(`${api}/categories`, { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token()}` }, credentials: 'include', body: JSON.stringify(body) });
      if (!res.ok) throw new Error('Save failed');
      setMessage(editId ? '✅ Updated!' : '✅ Created!');
      setName(''); setDescription(''); setEditId(null);
      fetchCategories();
    } catch (e: unknown) {
      setMessage(`❌ ${e instanceof Error ? e.message : 'Error'}`);
    } finally { setSaving(false); }
  };

  const handleDelete = async (id: string, catName: string) => {
    if (!confirm(`Delete category "${catName}"? Posts will keep their data but lose this category.`)) return;
    await fetch(`${api}/categories/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token()}` }, credentials: 'include' });
    fetchCategories();
  };

  const startEdit = (cat: Category) => {
    setEditId(cat.id);
    setName(cat.name);
    setDescription(cat.description || '');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const cancel = () => { setEditId(null); setName(''); setDescription(''); setMessage(''); };

  const inputStyle = { padding: '0.625rem 0.75rem', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', fontSize: 'var(--text-sm)', fontFamily: 'inherit', outline: 'none', backgroundColor: 'var(--color-bg)', color: 'var(--color-ink-900)', width: '100%', boxSizing: 'border-box' as const };

  return (
    <div style={{ padding: '2.5rem', maxWidth: '720px' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-3xl)', color: 'var(--color-ink-950)', marginBottom: '0.25rem' }}>Categories</h1>
        <p style={{ color: 'var(--color-muted)', fontSize: 'var(--text-sm)' }}>Organise your articles into topics</p>
      </div>

      {/* Create / edit form */}
      <div style={{ padding: '1.5rem', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-xl)', backgroundColor: 'var(--color-surface)', marginBottom: '2rem' }}>
        <h2 style={{ fontSize: 'var(--text-lg)', fontWeight: 700, marginBottom: '1rem', color: 'var(--color-ink-950)' }}>
          {editId ? '✏️ Edit Category' : '+ New Category'}
        </h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1rem' }}>
          <input style={inputStyle} value={name} onChange={e => setName(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSave()} placeholder="Category name (e.g. Business, Technology)" />
          <input style={inputStyle} value={description} onChange={e => setDescription(e.target.value)} placeholder="Short description (optional)" />
        </div>
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <button onClick={handleSave} disabled={saving}
            style={{ padding: '0.5rem 1.5rem', backgroundColor: 'var(--color-accent)', color: 'white', border: 'none', borderRadius: 'var(--radius-lg)', fontSize: 'var(--text-sm)', fontWeight: 600, cursor: 'pointer' }}>
            {saving ? 'Saving...' : editId ? 'Update' : 'Create'}
          </button>
          {editId && <button onClick={cancel} style={{ padding: '0.5rem 1rem', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-lg)', fontSize: 'var(--text-sm)', cursor: 'pointer', backgroundColor: 'transparent', color: 'var(--color-muted)' }}>Cancel</button>}
          {message && <span style={{ fontSize: 'var(--text-xs)', color: message.startsWith('✅') ? 'oklch(55% 0.18 145)' : 'var(--color-accent)' }}>{message}</span>}
        </div>
      </div>

      {/* List */}
      {loading && <p style={{ color: 'var(--color-muted)', textAlign: 'center', padding: '2rem' }}>Loading...</p>}
      {!loading && categories.length === 0 && (
        <p style={{ color: 'var(--color-muted)', textAlign: 'center', padding: '2rem' }}>No categories yet. Create your first one above.</p>
      )}
      {!loading && categories.length > 0 && (
        <div style={{ border: '1px solid var(--color-border)', borderRadius: 'var(--radius-xl)', overflow: 'hidden', backgroundColor: 'var(--color-surface)' }}>
          {categories.map((cat, i) => (
            <div key={cat.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem 1.25rem', borderBottom: i < categories.length - 1 ? '1px solid var(--color-border)' : 'none' }}>
              <div>
                <span style={{ fontWeight: 600, fontSize: 'var(--text-sm)', color: 'var(--color-ink-950)' }}>{cat.name}</span>
                <span style={{ marginLeft: '0.75rem', fontSize: 'var(--text-xs)', color: 'var(--color-muted)', fontFamily: 'monospace' }}>/{cat.slug}</span>
                {cat.description && <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-muted)', marginTop: '0.125rem' }}>{cat.description}</p>}
              </div>
              <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-muted)' }}>{cat._count?.posts ?? 0} posts</span>
                <button onClick={() => startEdit(cat)} style={{ fontSize: 'var(--text-xs)', fontWeight: 600, color: 'var(--color-accent)', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>Edit</button>
                <button onClick={() => handleDelete(cat.id, cat.name)} style={{ fontSize: 'var(--text-xs)', color: 'var(--color-muted)', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

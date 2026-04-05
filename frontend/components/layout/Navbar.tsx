'use client';

import Link from 'next/link';
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [isMounted, setIsMounted] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [user, setUser] = useState({ name: '', role: '' });
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const api = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

  useEffect(() => {
    // eslint-disable-next-line
    setIsMounted(true);
    const token = localStorage.getItem('accessToken');
    setIsLoggedIn(!!token);
    if (token) {
      setUser({
        name: localStorage.getItem('userName') || 'User',
        role: localStorage.getItem('userRole') || 'Member',
      });
    }

    const onScroll = () => {
      setScrolled(window.scrollY > 40);
      setDropdownOpen(false); // Close dropdown on scroll
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    
    return () => {
      window.removeEventListener('scroll', onScroll);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleSignOut = async () => {
    try {
      await fetch(`${api}/auth/logout`, {
        method: 'POST',
        credentials: 'include',
      });
    } catch {
      // Ignore logout transport failures and clear the local session anyway.
    }

    localStorage.removeItem('accessToken');
    localStorage.removeItem('userName');
    localStorage.removeItem('userRole');
    setIsLoggedIn(false);
    setDropdownOpen(false);
    router.push('/login');
  };

  useEffect(() => {
    if (searchOpen) inputRef.current?.focus();
  }, [searchOpen]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim().length >= 2) {
      router.push(`/search?q=${encodeURIComponent(query.trim())}`);
      setSearchOpen(false);
      setQuery('');
    }
  };

  return (
    <header
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 50,
        transition: 'background-color 0.3s ease, box-shadow 0.3s ease',
        backgroundColor: scrolled ? 'var(--color-cream)' : 'transparent',
        boxShadow: scrolled ? 'var(--shadow-sm)' : 'none',
        backdropFilter: scrolled ? 'blur(12px)' : 'none',
        borderBottom: scrolled ? '1px solid var(--color-border)' : '1px solid transparent',
      }}
    >
      <div className="container-wide" style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', height: '64px' }}>
        {/* Logo */}
        <Link
          href="/blog"
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'var(--text-xl)',
            fontWeight: 700,
            color: 'var(--color-ink-950)',
            letterSpacing: '-0.03em',
            flexShrink: 0,
          }}
        >
          TCB
          <span style={{ color: 'var(--color-accent)', marginLeft: '2px' }}>.</span>
        </Link>

        {/* Divider */}
        <div style={{ width: '1px', height: '20px', backgroundColor: 'var(--color-border)' }} />

        {/* Nav links */}
        <nav style={{ display: 'flex', gap: '1.5rem', alignItems: 'center', flex: 1 }}>
          {[
            { href: '/blog', label: 'Articles' },
            { href: '/blog/category/business', label: 'Business' },
            { href: '/blog/category/technology', label: 'Technology' },
            { href: '/blog/category/strategy', label: 'Strategy' },
          ].map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              style={{
                fontSize: 'var(--text-sm)',
                fontWeight: 500,
                color: 'var(--color-ink-600)',
                transition: 'color 0.15s ease',
                display: 'none',
              }}
              className="nav-link"
            >
              {label}
            </Link>
          ))}
        </nav>

        {/* Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          {/* Search */}
          {searchOpen ? (
            <form onSubmit={handleSearch} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <input
                ref={inputRef}
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder="Search articles..."
                style={{
                  height: '36px',
                  padding: '0 0.75rem',
                  border: '1px solid var(--color-border)',
                  borderRadius: 'var(--radius-full)',
                  fontSize: 'var(--text-sm)',
                  background: 'var(--color-surface)',
                  color: 'var(--color-text)',
                  width: '220px',
                  outline: 'none',
                  transition: 'border-color 0.15s ease',
                }}
                onBlur={() => { if (!query) setSearchOpen(false); }}
              />
              <button
                type="button"
                onClick={() => setSearchOpen(false)}
                style={{ color: 'var(--color-muted)', fontSize: '1.1rem', background: 'none', border: 'none', cursor: 'pointer' }}
              >✕</button>
            </form>
          ) : (
            <button
              onClick={() => setSearchOpen(true)}
              aria-label="Open search"
              style={{
                width: '36px', height: '36px', borderRadius: 'var(--radius-full)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: 'none', border: '1px solid var(--color-border)',
                cursor: 'pointer', color: 'var(--color-muted)',
                transition: 'background 0.15s ease, color 0.15s ease',
              }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
              </svg>
            </button>
          )}

          {/* Write / Admin & Auth */}
          {isMounted && (
            isLoggedIn ? (
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: '0.5rem' }} ref={dropdownRef}>
                <Link
                  href="/admin"
                  style={{
                    height: '36px', padding: '0 1rem',
                    backgroundColor: 'var(--color-accent)',
                    color: 'white', borderRadius: 'var(--radius-full)',
                    fontSize: 'var(--text-sm)', fontWeight: 600,
                    display: 'flex', alignItems: 'center',
                    transition: 'background-color 0.15s ease',
                  }}
                  className="write-btn"
                >
                  Write
                </Link>
                <div style={{ position: 'relative' }}>
                  <button
                    onClick={() => setDropdownOpen(!dropdownOpen)}
                    style={{
                      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                      background: 'none', border: 'none', cursor: 'pointer',
                      color: 'var(--color-ink-950)', transition: 'opacity 0.15s ease',
                      padding: '0 0.5rem'
                    }}
                    className="hover-opacity"
                  >
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
                    </svg>
                    <span className="auth-text-wrapper" style={{ fontSize: '10px', marginTop: '2px', display: 'flex', alignItems: 'center' }}>
                      <span style={{ fontWeight: 600 }}>Me</span>
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginLeft: '2px' }}>
                        <path d="m6 9 6 6 6-6"/>
                      </svg>
                    </span>
                  </button>

                  {/* Dropdown Menu */}
                  {dropdownOpen && (
                    <div style={{
                      position: 'absolute', top: '100%', right: 0, marginTop: '8px',
                      width: '260px', backgroundColor: 'var(--color-surface)',
                      border: '1px solid var(--color-border)', borderRadius: 'var(--radius-lg)',
                      boxShadow: 'var(--shadow-lg)', overflow: 'hidden', zIndex: 60,
                      color: 'var(--color-ink-950)'
                    }}>
                      <div style={{ padding: '1rem', borderBottom: '1px solid var(--color-border)' }}>
                        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                          <div style={{ width: '48px', height: '48px', borderRadius: '50%', backgroundColor: 'var(--color-ink-100)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.4rem', fontWeight: 600, color: 'var(--color-muted)', flexShrink: 0 }}>
                            {user.name.charAt(0).toUpperCase()}
                          </div>
                          <div style={{ overflow: 'hidden' }}>
                            <div style={{ fontWeight: 600, fontSize: '1rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                              {user.name}
                            </div>
                            <div style={{ fontSize: '0.8rem', color: 'var(--color-muted)', marginTop: '2px', textTransform: 'capitalize' }}>
                              {user.role.toLowerCase()}
                            </div>
                          </div>
                        </div>
                        <Link href="/admin" onClick={() => setDropdownOpen(false)} style={{ display: 'block', width: '100%', textAlign: 'center', padding: '0.3rem 0', marginTop: '0.75rem', borderRadius: 'var(--radius-full)', border: '1px solid var(--color-accent)', color: 'var(--color-accent)', textDecoration: 'none', fontSize: 'var(--text-sm)', fontWeight: 600, transition: 'all 0.15s ease' }} className="hover-bg-accent">
                          View profile
                        </Link>
                      </div>

                      <div style={{ padding: '0.5rem 0', borderBottom: '1px solid var(--color-border)' }}>
                        <div style={{ padding: '0.25rem 1rem', fontSize: '1rem', fontWeight: 600, color: 'var(--color-ink-950)' }}>Account</div>
                        <Link href="/admin" onClick={() => setDropdownOpen(false)} style={{ display: 'block', padding: '0.3rem 1rem', fontSize: 'var(--text-sm)', color: 'var(--color-muted)', textDecoration: 'none' }} className="dropdown-link">Dashboard</Link>
                        <Link href="/search" onClick={() => setDropdownOpen(false)} style={{ display: 'block', padding: '0.3rem 1rem', fontSize: 'var(--text-sm)', color: 'var(--color-muted)', textDecoration: 'none' }} className="dropdown-link">Search</Link>
                      </div>

                      <div style={{ padding: '0.5rem 0', borderBottom: '1px solid var(--color-border)' }}>
                        <div style={{ padding: '0.25rem 1rem', fontSize: '1rem', fontWeight: 600, color: 'var(--color-ink-950)' }}>Manage</div>
                        <Link href="/admin/posts" onClick={() => setDropdownOpen(false)} style={{ display: 'block', padding: '0.3rem 1rem', fontSize: 'var(--text-sm)', color: 'var(--color-muted)', textDecoration: 'none' }} className="dropdown-link">Posts & Activity</Link>
                        <Link href="/admin/categories" onClick={() => setDropdownOpen(false)} style={{ display: 'block', padding: '0.3rem 1rem', fontSize: 'var(--text-sm)', color: 'var(--color-muted)', textDecoration: 'none' }} className="dropdown-link">Categories</Link>
                      </div>

                      <button onClick={handleSignOut} style={{ width: '100%', display: 'block', padding: '0.75rem 1rem', textAlign: 'left', background: 'none', border: 'none', fontSize: 'var(--text-sm)', color: 'var(--color-muted)', cursor: 'pointer' }} className="dropdown-link">
                        Sign out
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <Link
                href="/login"
                style={{
                  display: 'flex', alignItems: 'center', gap: '0.4rem',
                  height: '36px', padding: '0 0.5rem',
                  textDecoration: 'none', color: 'var(--color-ink-950)',
                  fontWeight: 500, fontSize: 'var(--text-md)',
                  transition: 'opacity 0.15s ease'
                }}
                className="auth-btn hover-opacity"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
                </svg>
                <span className="auth-text" style={{ whiteSpace: 'nowrap' }}>Log In</span>
              </Link>
            )
          )}
        </div>
      </div>

      <style>{`
        @media (min-width: 768px) { .nav-link { display: block !important; } }
        .nav-link:hover { color: var(--color-ink-950) !important; }
        .hover-opacity:hover { opacity: 0.7; }
        @media (max-width: 600px) {
          .auth-text, .auth-text-wrapper { display: none !important; }
          .write-btn { display: none !important; }
        }
        .dropdown-link:hover { text-decoration: underline; color: var(--color-ink-950) !important; }
        .hover-bg-accent:hover { background-color: var(--color-accent) !important; color: white !important; }
      `}</style>
    </header>
  );
}

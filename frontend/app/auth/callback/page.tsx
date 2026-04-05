'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function AuthCallbackPage() {
  const router = useRouter();
  const api = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

  useEffect(() => {
    let active = true;

    const completeLogin = async () => {
      try {
        const res = await fetch(`${api}/auth/me`, {
          credentials: 'include',
        });
        const data = await res.json().catch(() => ({}));

        if (!res.ok || !data.user) {
          throw new Error(data.error || 'Could not verify session');
        }

        if (data.accessToken) {
          localStorage.setItem('accessToken', data.accessToken);
        } else {
          localStorage.removeItem('accessToken');
        }

        localStorage.setItem('userName', data.user.name || '');
        localStorage.setItem('userRole', data.user.role || '');

        if (active) {
          router.replace('/admin');
        }
      } catch {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('userName');
        localStorage.removeItem('userRole');

        if (active) {
          router.replace('/login?error=oauth_failed');
        }
      }
    };

    completeLogin();

    return () => {
      active = false;
    };
  }, [api, router]);

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100dvh', fontFamily: 'var(--font-sans)', color: 'var(--color-muted)' }}>
      Signing you in...
    </div>
  );
}
